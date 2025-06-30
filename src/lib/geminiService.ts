import { GoogleGenerativeAI } from '@google/genai';
import { PDFContent } from './pdfParseService';
import { enhancedRAGService, SearchResult } from './enhancedRAGService';
import { embeddingService } from './embeddingService';

export interface GeminiResponse {
  success: boolean;
  response?: string;
  error?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  ragContext?: {
    query: string;
    results: SearchResult[];
    searchTime: number;
  };
}

class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;
  private currentPDFContent: PDFContent | null = null;
  private chatHistory: ChatMessage[] = [];
  private currentDocumentId: string | null = null;

  /**
   * Initialize Gemini AI with API key
   */
  async initialize(apiKey: string): Promise<boolean> {
    try {
      this.genAI = new GoogleGenerativeAI({ apiKey });
      // Use Gemini 1.5 Flash for consistent performance
      this.model = this.genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        },
      });
      
      // Initialize RAG service with embeddings
      const ragInitialized = await enhancedRAGService.initialize(apiKey);
      if (!ragInitialized) {
        console.warn('⚠️ RAG service initialization failed, falling back to simple context');
      }
      
      console.log('✅ Gemini service initialized with enhanced RAG');
      return true;
    } catch (error) {
      console.error('Error initializing Gemini:', error);
      return false;
    }
  }

  /**
   * Check if Gemini is initialized
   */
  isInitialized(): boolean {
    return this.genAI !== null && this.model !== null;
  }

  /**
   * Set current PDF content for context and add to RAG store
   */
  async setPDFContent(content: PDFContent, documentId?: string): Promise<void> {
    this.currentPDFContent = content;
    this.currentDocumentId = documentId || null;
    
    // Note: For enhanced RAG, documents should be processed through enhancedRAGService.processDocument()
    // This method is kept for backwards compatibility with existing PDF viewer integration
  }

  /**
   * Get current PDF content
   */
  getCurrentPDFContent(): PDFContent | null {
    return this.currentPDFContent;
  }

  /**
   * Clear current PDF content
   */
  clearPDFContent(): void {
    this.currentPDFContent = null;
    this.currentDocumentId = null;
  }

  /**
   * Send a message to Gemini with enhanced RAG context
   */
  async sendMessage(message: string): Promise<GeminiResponse> {
    if (!this.isInitialized()) {
      return {
        success: false,
        error: 'Gemini AI is not initialized. Please set your API key first.'
      };
    }

    try {
      let prompt = message;
      let ragContext: ChatMessage['ragContext'] | undefined;

      // Try enhanced RAG first if available
      if (enhancedRAGService.isReady()) {
        const searchOptions = this.currentDocumentId 
          ? { documentId: this.currentDocumentId, maxResults: 3, minSimilarity: 0.7 }
          : { maxResults: 5, minSimilarity: 0.7 };
        
        const ragResult = await enhancedRAGService.searchSimilarChunks(message, searchOptions);
        
        if (ragResult.success && ragResult.results.length > 0) {
          prompt = this.buildEnhancedRAGPrompt(message, ragResult.results);
          ragContext = {
            query: message,
            results: ragResult.results,
            searchTime: ragResult.searchTime
          };
          console.log(`🔍 Used enhanced RAG: ${ragResult.results.length} relevant chunks found`);
        } else if (this.currentPDFContent) {
          // Fallback to simple context
          prompt = this.buildContextPrompt(message);
          console.log('📄 Using fallback context (enhanced RAG found no results)');
        }
      } else if (this.currentPDFContent) {
        // Fallback to simple context if RAG not available
        prompt = this.buildContextPrompt(message);
        console.log('📄 Using simple context (enhanced RAG not available)');
      }

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Add to chat history with RAG context
      this.chatHistory.push({
        role: 'user',
        content: message,
        timestamp: new Date(),
        ragContext
      });

      this.chatHistory.push({
        role: 'assistant',
        content: text,
        timestamp: new Date()
      });

      return {
        success: true,
        response: text
      };

    } catch (error) {
      console.error('Error sending message to Gemini:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Analyze PDF content
   */
  async analyzePDF(content: PDFContent): Promise<GeminiResponse> {
    if (!this.isInitialized()) {
      return {
        success: false,
        error: 'Gemini AI is not initialized. Please set your API key first.'
      };
    }

    try {
      const analysisPrompt = `
Please analyze this PDF document and provide a comprehensive summary:

DOCUMENT METADATA:
- Pages: ${content.pages}
- Title: ${content.info?.Title || 'Unknown'}
- Author: ${content.info?.Author || 'Unknown'}
- Subject: ${content.info?.Subject || 'Unknown'}
- Text Length: ${content.text.length} characters

DOCUMENT CONTENT:
${content.text}

Please provide:
1. A brief summary of the document
2. Key topics and themes
3. Important information or findings
4. Document structure and organization
5. Any notable features or characteristics

Format your response in a clear, organized manner.
`;

      const result = await this.model.generateContent(analysisPrompt);
      const response = await result.response;
      const text = response.text();

      return {
        success: true,
        response: text
      };

    } catch (error) {
      console.error('Error analyzing PDF:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Extract key information from PDF
   */
  async extractKeyInfo(content: PDFContent): Promise<GeminiResponse> {
    const prompt = `
Extract key information from this document:

${content.text}

Please identify and extract:
1. Main topics or subjects
2. Important dates
3. Key figures or statistics
4. Names of people or organizations
5. Conclusions or recommendations
6. Action items or next steps

Format the response as a structured list.
`;

    return this.sendMessage(prompt);
  }

  /**
   * Build enhanced RAG prompt with semantic search results
   */
  private buildEnhancedRAGPrompt(userMessage: string, searchResults: SearchResult[]): string {
    const contextString = enhancedRAGService.getContextString(searchResults);
    
    const documentTypes = [...new Set(searchResults.map(r => r.chunk.metadata.documentType))];
    const documentNames = [...new Set(searchResults.map(r => r.chunk.metadata.filename))];
    
    const context = `
You are an AI assistant helping to analyze and discuss documents. Here are the most relevant sections found using semantic search:

SOURCE DOCUMENTS:
- Files: ${documentNames.join(', ')}
- Types: ${documentTypes.map(t => t.toUpperCase()).join(', ')}
- Relevance: Based on semantic similarity to your question

RELEVANT CONTENT:
${contextString}

---

User Question: ${userMessage}

Please answer the user's question based on the relevant content above. The content has been selected using advanced semantic search to find the most relevant information. If the question cannot be fully answered from the provided context, please indicate what information is missing. Focus on the most relevant sources and cite them when possible.
`;

    return context;
  }

  /**
   * Build context prompt with PDF content (fallback)
   */
  private buildContextPrompt(userMessage: string): string {
    if (!this.currentPDFContent) {
      return userMessage;
    }

    // Use only first 4000 characters to avoid token limits
    const truncatedText = this.currentPDFContent.text.length > 4000 
      ? this.currentPDFContent.text.substring(0, 4000) + '...'
      : this.currentPDFContent.text;

    const context = `
You are an AI assistant helping to analyze and discuss a PDF document. Here is the document information:

DOCUMENT METADATA:
- Title: ${this.currentPDFContent.info?.Title || 'Unknown'}
- Author: ${this.currentPDFContent.info?.Author || 'Unknown'}
- Pages: ${this.currentPDFContent.pages}
- Subject: ${this.currentPDFContent.info?.Subject || 'Unknown'}

DOCUMENT CONTENT:
${truncatedText}

---

User Question: ${userMessage}

Please answer the user's question based on the document content above. If the question cannot be answered from the document, please indicate that clearly.
`;

    return context;
  }

  /**
   * Get chat history
   */
  getChatHistory(): ChatMessage[] {
    return [...this.chatHistory];
  }

  /**
   * Clear chat history
   */
  clearChatHistory(): void {
    this.chatHistory = [];
  }

  /**
   * Process and index a document for enhanced RAG
   */
  async processDocumentForRAG(file: File): Promise<{ success: boolean; documentId?: string; error?: string }> {
    try {
      if (!enhancedRAGService.isReady()) {
        return {
          success: false,
          error: 'Enhanced RAG service not initialized. Please configure API key first.'
        };
      }

      const result = await enhancedRAGService.processDocument(file);
      
      if (result.success) {
        this.currentDocumentId = result.documentId;
        console.log(`✅ Document indexed for RAG: ${result.chunksCreated} chunks created`);
      }
      
      return {
        success: result.success,
        documentId: result.documentId,
        error: result.error
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get RAG service statistics
   */
  getRAGStatistics() {
    if (!enhancedRAGService.isReady()) {
      return null;
    }
    return enhancedRAGService.getStatistics();
  }

  /**
   * Set current document ID for RAG context
   */
  setCurrentDocumentId(documentId: string | null): void {
    this.currentDocumentId = documentId;
  }

  /**
   * Search for specific information in PDF
   */
  async searchInDocument(query: string): Promise<GeminiResponse> {
    if (!this.currentPDFContent) {
      return {
        success: false,
        error: 'No PDF document is currently loaded.'
      };
    }

    const searchPrompt = `
Search for information related to: "${query}"

In this document:
${this.currentPDFContent.text}

Please find and return:
1. Direct quotes or passages related to the query
2. Page references (if available)
3. Context around the found information
4. Summary of findings

If no relevant information is found, please state that clearly.
`;

    return this.sendMessage(searchPrompt);
  }
}

// Export singleton instance
export const geminiService = new GeminiService();
export default geminiService;
export { enhancedRAGService };
