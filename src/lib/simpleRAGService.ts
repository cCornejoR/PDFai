/**
 * Simplified RAG (Retrieval-Augmented Generation) Service
 * Replaces complex LangChain implementation with lightweight in-memory vector store
 */

export interface PDFChunk {
  id: string;
  content: string;
  pageNumber: number;
  documentId: string;
  wordCount: number;
  similarity?: number;
}

export interface RAGContext {
  chunks: PDFChunk[];
  totalChunks: number;
  relevantChunks: number;
}

export interface RAGResponse {
  success: boolean;
  context: RAGContext;
  query: string;
  timestamp: Date;
  error?: string;
}

export class SimpleRAGService {
  private chunks: Map<string, PDFChunk[]> = new Map();
  private chunkSize = 1000;
  private chunkOverlap = 200;

  /**
   * Add document chunks to the vector store
   */
  async addDocument(documentId: string, text: string, pageNumber: number = 1): Promise<void> {
    const chunks = this.createTextChunks(text, documentId, pageNumber);
    this.chunks.set(documentId, chunks);
  }

  /**
   * Remove document from vector store
   */
  removeDocument(documentId: string): void {
    this.chunks.delete(documentId);
  }

  /**
   * Search for relevant chunks based on query
   */
  async searchRelevantChunks(
    query: string, 
    documentId?: string, 
    maxResults: number = 5
  ): Promise<RAGResponse> {
    try {
      const searchChunks = documentId 
        ? this.chunks.get(documentId) || []
        : this.getAllChunks();

      if (searchChunks.length === 0) {
        return {
          success: false,
          context: { chunks: [], totalChunks: 0, relevantChunks: 0 },
          query,
          timestamp: new Date(),
          error: 'No documents found'
        };
      }

      // Calculate similarity scores
      const rankedChunks = searchChunks
        .map(chunk => ({
          ...chunk,
          similarity: this.calculateSimilarity(query, chunk.content)
        }))
        .sort((a, b) => (b.similarity || 0) - (a.similarity || 0))
        .slice(0, maxResults);

      return {
        success: true,
        context: {
          chunks: rankedChunks,
          totalChunks: searchChunks.length,
          relevantChunks: rankedChunks.length
        },
        query,
        timestamp: new Date()
      };
    } catch (error) {
      return {
        success: false,
        context: { chunks: [], totalChunks: 0, relevantChunks: 0 },
        query,
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get context string for AI prompt
   */
  getContextString(chunks: PDFChunk[]): string {
    return chunks
      .map((chunk, index) => `[Chunk ${index + 1}]\n${chunk.content}`)
      .join('\n\n');
  }

  /**
   * Get all documents info
   */
  getDocumentInfo(): Array<{ documentId: string; chunkCount: number }> {
    return Array.from(this.chunks.entries()).map(([documentId, chunks]) => ({
      documentId,
      chunkCount: chunks.length
    }));
  }

  /**
   * Clear all documents
   */
  clearAll(): void {
    this.chunks.clear();
  }

  // Private methods

  private createTextChunks(text: string, documentId: string, pageNumber: number): PDFChunk[] {
    const chunks: PDFChunk[] = [];
    const words = text.split(/\s+/);
    const wordsPerChunk = Math.floor(this.chunkSize / 6); // Approximate words per chunk
    const overlapWords = Math.floor(this.chunkOverlap / 6);

    for (let i = 0; i < words.length; i += wordsPerChunk - overlapWords) {
      const chunkWords = words.slice(i, i + wordsPerChunk);
      const content = chunkWords.join(' ');
      
      if (content.trim().length > 50) { // Only include meaningful chunks
        chunks.push({
          id: `${documentId}_chunk_${chunks.length}`,
          content: content.trim(),
          pageNumber,
          documentId,
          wordCount: chunkWords.length
        });
      }
    }

    return chunks;
  }

  private getAllChunks(): PDFChunk[] {
    const allChunks: PDFChunk[] = [];
    for (const chunks of this.chunks.values()) {
      allChunks.push(...chunks);
    }
    return allChunks;
  }

  private calculateSimilarity(query: string, content: string): number {
    // Simple TF-IDF-like similarity calculation
    const queryWords = this.tokenize(query.toLowerCase());
    const contentWords = this.tokenize(content.toLowerCase());
    
    if (queryWords.length === 0 || contentWords.length === 0) {
      return 0;
    }

    // Calculate word frequency in content
    const contentWordFreq = new Map<string, number>();
    contentWords.forEach(word => {
      contentWordFreq.set(word, (contentWordFreq.get(word) || 0) + 1);
    });

    // Calculate similarity score
    let score = 0;
    let queryWordsFound = 0;

    queryWords.forEach(queryWord => {
      const freq = contentWordFreq.get(queryWord) || 0;
      if (freq > 0) {
        queryWordsFound++;
        // TF-IDF inspired scoring: log(1 + freq) * inverse document frequency approximation
        score += Math.log(1 + freq) * (queryWords.length / contentWords.length);
      }
    });

    // Normalize by query length and add bonus for exact phrase matches
    const baseScore = queryWordsFound / queryWords.length;
    const phraseBonus = this.calculatePhraseBonus(query.toLowerCase(), content.toLowerCase());
    
    return (baseScore * 0.7) + (score * 0.2) + (phraseBonus * 0.1);
  }

  private calculatePhraseBonus(query: string, content: string): number {
    // Bonus for exact phrase matches
    if (content.includes(query)) {
      return 1.0;
    }
    
    // Bonus for partial phrase matches
    const queryWords = query.split(/\s+/);
    if (queryWords.length < 2) return 0;
    
    let maxPhraseLength = 0;
    for (let i = 0; i < queryWords.length - 1; i++) {
      for (let j = i + 2; j <= queryWords.length; j++) {
        const phrase = queryWords.slice(i, j).join(' ');
        if (content.includes(phrase)) {
          maxPhraseLength = Math.max(maxPhraseLength, phrase.length);
        }
      }
    }
    
    return maxPhraseLength / query.length;
  }

  private tokenize(text: string): string[] {
    return text
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2) // Filter out very short words
      .filter(word => !this.isStopWord(word));
  }

  private isStopWord(word: string): boolean {
    const stopWords = new Set([
      'the', 'is', 'at', 'which', 'on', 'and', 'a', 'to', 'are', 'as', 'was', 'will',
      'an', 'be', 'by', 'for', 'from', 'has', 'he', 'in', 'it', 'its', 'of', 'that',
      'with', 'have', 'this', 'would', 'his', 'her', 'or', 'had', 'but', 'words',
      'not', 'what', 'all', 'were', 'they', 'we', 'when', 'your', 'can', 'said',
      'there', 'each', 'she', 'do', 'how', 'their', 'if', 'up', 'out', 'many',
      'then', 'them', 'these', 'so', 'some', 'her', 'would', 'make', 'like',
      'into', 'him', 'time', 'has', 'two', 'more', 'very', 'after', 'words',
      'long', 'than', 'first', 'been', 'call', 'who', 'its', 'now', 'find',
      'long', 'down', 'day', 'did', 'get', 'come', 'made', 'may', 'part'
    ]);
    
    return stopWords.has(word.toLowerCase());
  }
}

// Export singleton instance
export const ragService = new SimpleRAGService();