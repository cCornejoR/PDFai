/**
 * Enhanced RAG Service with Google Embeddings
 * Replaces simple text similarity with vector embeddings for better semantic search
 */

import { embeddingService, EmbeddingResult, GoogleEmbeddingService } from './embeddingService';
import { documentService, DocumentContent } from './documentService';

export interface EmbeddedChunk {
  id: string;
  content: string;
  embedding: number[];
  metadata: {
    documentId: string;
    chunkIndex: number;
    pageNumber?: number;
    filename: string;
    documentType: 'pdf' | 'doc' | 'txt';
    wordCount: number;
    createdAt: Date;
  };
}

export interface DocumentIndex {
  documentId: string;
  filename: string;
  documentType: 'pdf' | 'doc' | 'txt';
  totalChunks: number;
  indexedAt: Date;
  metadata: DocumentContent['metadata'];
}

export interface SearchResult {
  chunk: EmbeddedChunk;
  similarity: number;
  rank: number;
}

export interface RAGSearchResult {
  success: boolean;
  query: string;
  results: SearchResult[];
  totalDocuments: number;
  searchTime: number;
  error?: string;
}

export interface RAGProcessingResult {
  success: boolean;
  documentId: string;
  chunksCreated: number;
  processingTime: number;
  warnings?: string[];
  error?: string;
}

export class EnhancedRAGService {
  private documents: Map<string, DocumentIndex> = new Map();
  private chunks: Map<string, EmbeddedChunk> = new Map();
  private embeddingService: GoogleEmbeddingService;
  private chunkSize = 1000;
  private chunkOverlap = 200;

  constructor() {
    this.embeddingService = embeddingService;
  }

  /**
   * Initialize the service with API key
   */
  async initialize(apiKey: string): Promise<boolean> {
    try {
      const success = this.embeddingService.initialize(apiKey);
      if (success) {
        console.log('✅ Enhanced RAG service initialized with Google embeddings');
      }
      return success;
    } catch (error) {
      console.error('❌ Failed to initialize Enhanced RAG service:', error);
      return false;
    }
  }

  /**
   * Check if service is ready
   */
  isReady(): boolean {
    return this.embeddingService.isInitialized();
  }

  /**
   * Process and index a document file
   */
  async processDocument(file: File): Promise<RAGProcessingResult> {
    const startTime = Date.now();
    
    try {
      if (!this.isReady()) {
        return {
          success: false,
          documentId: '',
          chunksCreated: 0,
          processingTime: 0,
          error: 'RAG service not initialized. Please configure API key first.'
        };
      }

      // Validate file
      const validation = documentService.validateFile(file);
      if (!validation.valid) {
        return {
          success: false,
          documentId: '',
          chunksCreated: 0,
          processingTime: Date.now() - startTime,
          error: validation.error
        };
      }

      // Process document
      const documentResult = await documentService.processDocument(file);
      if (!documentResult.success || !documentResult.content) {
        return {
          success: false,
          documentId: '',
          chunksCreated: 0,
          processingTime: Date.now() - startTime,
          error: documentResult.error
        };
      }

      const documentContent = documentResult.content;
      const documentId = this.generateDocumentId(file.name);

      // Create text chunks
      const textChunks = this.createTextChunks(
        documentContent.text, 
        documentContent.metadata.type
      );

      if (textChunks.length === 0) {
        return {
          success: false,
          documentId,
          chunksCreated: 0,
          processingTime: Date.now() - startTime,
          error: 'No meaningful text chunks could be created from the document.'
        };
      }

      console.log(`📄 Processing ${textChunks.length} chunks for ${file.name}...`);

      // Generate embeddings for chunks
      const embeddingResult = await this.embeddingService.generateBatchEmbeddings(
        textChunks,
        {
          taskType: 'RETRIEVAL_DOCUMENT',
          title: documentContent.metadata.title || documentContent.metadata.filename
        }
      );

      if (embeddingResult.embeddings.length === 0) {
        return {
          success: false,
          documentId,
          chunksCreated: 0,
          processingTime: Date.now() - startTime,
          error: 'Failed to generate embeddings for document chunks.'
        };
      }

      // Create embedded chunks
      const embeddedChunks: EmbeddedChunk[] = embeddingResult.embeddings.map((embedding, index) => ({
        id: `${documentId}_chunk_${index}`,
        content: embedding.text,
        embedding: embedding.embedding,
        metadata: {
          documentId,
          chunkIndex: index,
          pageNumber: this.estimatePageNumber(index, textChunks.length, documentContent.metadata.pages),
          filename: documentContent.metadata.filename,
          documentType: documentContent.metadata.type,
          wordCount: embedding.text.split(/\s+/).length,
          createdAt: new Date()
        }
      }));

      // Store in indexes
      this.documents.set(documentId, {
        documentId,
        filename: documentContent.metadata.filename,
        documentType: documentContent.metadata.type,
        totalChunks: embeddedChunks.length,
        indexedAt: new Date(),
        metadata: documentContent.metadata
      });

      embeddedChunks.forEach(chunk => {
        this.chunks.set(chunk.id, chunk);
      });

      const processingTime = Date.now() - startTime;
      console.log(`✅ Document processed: ${embeddedChunks.length} chunks in ${processingTime}ms`);

      return {
        success: true,
        documentId,
        chunksCreated: embeddedChunks.length,
        processingTime,
        warnings: [
          ...documentResult.warnings || [],
          ...embeddingResult.errors.map(error => `Embedding error: ${error}`)
        ].filter(Boolean)
      };

    } catch (error) {
      return {
        success: false,
        documentId: '',
        chunksCreated: 0,
        processingTime: Date.now() - startTime,
        error: `Document processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Search for relevant chunks using semantic similarity
   */
  async searchSimilarChunks(
    query: string,
    options: {
      documentId?: string;
      maxResults?: number;
      minSimilarity?: number;
      documentTypes?: Array<'pdf' | 'doc' | 'txt'>;
    } = {}
  ): Promise<RAGSearchResult> {
    const startTime = Date.now();
    
    try {
      if (!this.isReady()) {
        return {
          success: false,
          query,
          results: [],
          totalDocuments: this.documents.size,
          searchTime: 0,
          error: 'RAG service not initialized.'
        };
      }

      const {
        documentId,
        maxResults = 5,
        minSimilarity = 0.7,
        documentTypes
      } = options;

      // Generate query embedding
      const queryEmbedding = await this.embeddingService.generateEmbedding(query, {
        taskType: 'RETRIEVAL_QUERY'
      });

      // Filter chunks based on criteria
      let candidateChunks = Array.from(this.chunks.values());

      if (documentId) {
        candidateChunks = candidateChunks.filter(chunk => 
          chunk.metadata.documentId === documentId
        );
      }

      if (documentTypes && documentTypes.length > 0) {
        candidateChunks = candidateChunks.filter(chunk => 
          documentTypes.includes(chunk.metadata.documentType)
        );
      }

      if (candidateChunks.length === 0) {
        return {
          success: true,
          query,
          results: [],
          totalDocuments: this.documents.size,
          searchTime: Date.now() - startTime,
          error: 'No documents match the search criteria.'
        };
      }

      // Calculate similarities and rank results
      const similarities = candidateChunks.map(chunk => {
        const similarity = this.embeddingService.calculateCosineSimilarity(
          queryEmbedding.embedding,
          chunk.embedding
        );
        
        return {
          chunk,
          similarity,
          rank: 0 // Will be set after sorting
        };
      });

      // Sort by similarity and apply filters
      const rankedResults = similarities
        .filter(result => result.similarity >= minSimilarity)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, maxResults)
        .map((result, index) => ({
          ...result,
          rank: index + 1
        }));

      const searchTime = Date.now() - startTime;
      
      console.log(`🔍 Search completed: ${rankedResults.length} results in ${searchTime}ms`);

      return {
        success: true,
        query,
        results: rankedResults,
        totalDocuments: this.documents.size,
        searchTime
      };

    } catch (error) {
      return {
        success: false,
        query,
        results: [],
        totalDocuments: this.documents.size,
        searchTime: Date.now() - startTime,
        error: `Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Get context string for AI prompts
   */
  getContextString(searchResults: SearchResult[]): string {
    return searchResults
      .map((result, index) => {
        const chunk = result.chunk;
        const metadata = chunk.metadata;
        
        return `[Source ${index + 1}: ${metadata.filename} (${metadata.documentType.toUpperCase()}) - Similarity: ${(result.similarity * 100).toFixed(1)}%]\n${chunk.content}`;
      })
      .join('\n\n---\n\n');
  }

  /**
   * Remove document from index
   */
  removeDocument(documentId: string): boolean {
    try {
      const document = this.documents.get(documentId);
      if (!document) {
        return false;
      }

      // Remove all chunks for this document
      const chunkIds = Array.from(this.chunks.keys())
        .filter(chunkId => chunkId.startsWith(documentId));
      
      chunkIds.forEach(chunkId => this.chunks.delete(chunkId));
      
      // Remove document index
      this.documents.delete(documentId);
      
      console.log(`🗑️ Document ${documentId} removed: ${chunkIds.length} chunks deleted`);
      return true;
    } catch (error) {
      console.error('Error removing document:', error);
      return false;
    }
  }

  /**
   * Get all indexed documents
   */
  getDocuments(): DocumentIndex[] {
    return Array.from(this.documents.values());
  }

  /**
   * Get document statistics
   */
  getStatistics(): {
    totalDocuments: number;
    totalChunks: number;
    documentTypes: Record<string, number>;
    averageChunksPerDocument: number;
  } {
    const documents = Array.from(this.documents.values());
    const chunks = Array.from(this.chunks.values());
    
    const documentTypes = documents.reduce((acc, doc) => {
      acc[doc.documentType] = (acc[doc.documentType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalDocuments: documents.length,
      totalChunks: chunks.length,
      documentTypes,
      averageChunksPerDocument: documents.length > 0 ? chunks.length / documents.length : 0
    };
  }

  /**
   * Clear all documents and chunks
   */
  clearAll(): void {
    this.documents.clear();
    this.chunks.clear();
    console.log('🧹 All documents and chunks cleared');
  }

  // Private helper methods

  private generateDocumentId(filename: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    return `doc_${timestamp}_${random}`;
  }

  private createTextChunks(text: string, documentType: 'pdf' | 'doc' | 'txt'): string[] {
    // Use document service for type-specific chunking
    return this.splitTextIntoChunks(text, this.chunkSize, this.chunkOverlap);
  }

  private splitTextIntoChunks(text: string, chunkSize: number, overlap: number): string[] {
    const sentences = text.split(/[.!?]+\s+/);
    const chunks: string[] = [];
    let currentChunk = '';
    let overlapText = '';

    for (const sentence of sentences) {
      const candidateChunk = overlapText + currentChunk + (currentChunk ? ' ' : '') + sentence + '.';
      
      if (candidateChunk.length <= chunkSize) {
        currentChunk = candidateChunk.replace(overlapText, '');
      } else {
        if (currentChunk) {
          chunks.push(overlapText + currentChunk);
          
          // Create overlap from the end of current chunk
          const words = currentChunk.split(' ');
          const overlapWords = words.slice(-Math.floor(overlap / 6));
          overlapText = overlapWords.join(' ') + ' ';
        }
        currentChunk = sentence + '.';
      }
    }

    if (currentChunk) {
      chunks.push(overlapText + currentChunk);
    }

    return chunks.filter(chunk => chunk.trim().length > 50);
  }

  private estimatePageNumber(chunkIndex: number, totalChunks: number, totalPages?: number): number | undefined {
    if (!totalPages || totalPages <= 1) {
      return undefined;
    }
    
    return Math.ceil(((chunkIndex + 1) / totalChunks) * totalPages);
  }
}

// Export singleton instance
export const enhancedRAGService = new EnhancedRAGService();