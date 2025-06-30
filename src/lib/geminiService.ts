import { GoogleGenAI } from "@google/genai";
import { PDFContent } from "./pdfParseService";
import { enhancedRAGService, SearchResult } from "./enhancedRAGService";
import { embeddingService } from "./embeddingService";

export interface GeminiResponse {
  success: boolean;
  response?: string;
  error?: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  ragContext?: {
    query: string;
    results: SearchResult[];
    searchTime: number;
  };
}

class GeminiService {
  private genAI: GoogleGenAI | null = null;
  private currentPDFContent: PDFContent | null = null;
  private chatHistory: ChatMessage[] = [];
  private currentDocumentId: string | null = null;

  /**
   * Initialize Gemini AI with API key
   */
  async initialize(apiKey: string): Promise<boolean> {
    try {
      this.genAI = new GoogleGenAI({ apiKey });

      // Initialize RAG service with embeddings
      const ragInitialized = await enhancedRAGService.initialize(apiKey);
      if (!ragInitialized) {
        console.warn(
          "⚠️ RAG service initialization failed, falling back to simple context"
        );
      }

      console.log("✅ Gemini service initialized with enhanced RAG");
      return true;
    } catch (error) {
      console.error("Error initializing Gemini:", error);
      return false;
    }
  }

  /**
   * Check if Gemini is initialized
   */
  isInitialized(): boolean {
    return this.genAI !== null;
  }

  /**
   * Set current PDF content for context and add to RAG store
   * Automatically generates summary and key questions
   */
  async setPDFContent(content: PDFContent, documentId?: string): Promise<{
    success: boolean;
    summary?: string;
    keyQuestions?: string;
    error?: string;
  }> {
    this.currentPDFContent = content;
    this.currentDocumentId = documentId || null;
    
    try {
      // Generate automatic analysis when PDF is loaded
      console.log('📄 Processing PDF for automatic analysis...');
      const analysis = await this.generateAutoAnalysis(content);
      
      if (analysis.summary.success && analysis.keyQuestions.success) {
        // Add analysis to chat history for immediate display
        this.chatHistory.push({
          role: 'assistant',
          content: `${analysis.summary.response}\n\n---\n\n${analysis.keyQuestions.response}`,
          timestamp: new Date(),
        });
        
        console.log('✅ PDF analysis completed successfully');
        return {
          success: true,
          summary: analysis.summary.response,
          keyQuestions: analysis.keyQuestions.response,
        };
      } else {
        console.warn('⚠️ PDF analysis partially failed');
        return {
          success: false,
          error: `Summary: ${analysis.summary.error || 'OK'}, Questions: ${analysis.keyQuestions.error || 'OK'}`,
        };
      }
    } catch (error) {
      console.error('❌ Error in automatic PDF analysis:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Set PDF content without generating automatic analysis (for existing documents)
   */
  async setPDFContentOnly(content: PDFContent, documentId?: string): Promise<void> {
    this.currentPDFContent = content;
    this.currentDocumentId = documentId || null;
    console.log('📄 PDF content set for context (no analysis generated)');
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
        error: "Gemini AI is not initialized. Please set your API key first.",
      };
    }

    try {
      let prompt = message;
      let ragContext: ChatMessage["ragContext"] | undefined;

      // Try enhanced RAG first if available
      if (enhancedRAGService.isReady()) {
        const searchOptions = this.currentDocumentId
          ? {
              documentId: this.currentDocumentId,
              maxResults: 3,
              minSimilarity: 0.7,
            }
          : { maxResults: 5, minSimilarity: 0.7 };

        const ragResult = await enhancedRAGService.searchSimilarChunks(
          message,
          searchOptions
        );

        if (ragResult.success && ragResult.results.length > 0) {
          prompt = this.buildEnhancedRAGPrompt(message, ragResult.results);
          ragContext = {
            query: message,
            results: ragResult.results,
            searchTime: ragResult.searchTime,
          };
          console.log(
            `🔍 Used enhanced RAG: ${ragResult.results.length} relevant chunks found`
          );
        } else if (this.currentPDFContent) {
          // Fallback to simple context
          prompt = this.buildContextPrompt(message);
          console.log(
            "📄 Using fallback context (enhanced RAG found no results)"
          );
        }
      } else if (this.currentPDFContent) {
        // Fallback to simple context if RAG not available
        prompt = this.buildContextPrompt(message);
        console.log("📄 Using simple context (enhanced RAG not available)");
      }

      const result = await this.genAI!.models.generateContent({
        model: "gemini-1.5-flash",
        contents: prompt,
        config: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        },
      });
      const text = result.text || "No response generated";

      // Add to chat history with RAG context
      this.chatHistory.push({
        role: "user",
        content: message,
        timestamp: new Date(),
        ragContext,
      });

      this.chatHistory.push({
        role: "assistant",
        content: text,
        timestamp: new Date(),
      });

      return {
        success: true,
        response: text,
      };
    } catch (error) {
      console.error("Error sending message to Gemini:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
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
        error: "Gemini AI is not initialized. Please set your API key first.",
      };
    }

    try {
      const analysisPrompt = `
Please analyze this PDF document and provide a comprehensive summary:

DOCUMENT METADATA:
- Pages: ${content.pages}
- Title: ${content.info?.Title || "Unknown"}
- Author: ${content.info?.Author || "Unknown"}
- Subject: ${content.info?.Subject || "Unknown"}
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

      const result = await this.genAI!.models.generateContent({
        model: "gemini-1.5-flash",
        contents: analysisPrompt,
      });
      const text = result.text || "No analysis generated";

      return {
        success: true,
        response: text,
      };
    } catch (error) {
      console.error("Error analyzing PDF:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
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
  private buildEnhancedRAGPrompt(
    userMessage: string,
    searchResults: SearchResult[]
  ): string {
    const contextString = enhancedRAGService.getContextString(searchResults);

    const documentTypes = [
      ...new Set(searchResults.map((r) => r.chunk.metadata.documentType)),
    ];
    const documentNames = [
      ...new Set(searchResults.map((r) => r.chunk.metadata.filename)),
    ];

    const context = `
You are an AI assistant helping to analyze and discuss documents. Here are the most relevant sections found using semantic search:

SOURCE DOCUMENTS:
- Files: ${documentNames.join(", ")}
- Types: ${documentTypes.map((t) => t.toUpperCase()).join(", ")}
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
    const truncatedText =
      this.currentPDFContent.text.length > 4000
        ? this.currentPDFContent.text.substring(0, 4000) + "..."
        : this.currentPDFContent.text;

    const context = `
You are an AI assistant helping to analyze and discuss a PDF document. Here is the document information:

DOCUMENT METADATA:
- Title: ${this.currentPDFContent.info?.Title || "Unknown"}
- Author: ${this.currentPDFContent.info?.Author || "Unknown"}
- Pages: ${this.currentPDFContent.pages}
- Subject: ${this.currentPDFContent.info?.Subject || "Unknown"}

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
  async processDocumentForRAG(
    file: File
  ): Promise<{ success: boolean; documentId?: string; error?: string }> {
    try {
      if (!enhancedRAGService.isReady()) {
        return {
          success: false,
          error:
            "Enhanced RAG service not initialized. Please configure API key first.",
        };
      }

      const result = await enhancedRAGService.processDocument(file);

      if (result.success) {
        this.currentDocumentId = result.documentId;
        console.log(
          `✅ Document indexed for RAG: ${result.chunksCreated} chunks created`
        );
      }

      return {
        success: result.success,
        documentId: result.documentId,
        error: result.error,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Complete PDF processing: RAG indexing + automatic analysis
   */
  async processDocumentComplete(
    file: File,
    content: PDFContent
  ): Promise<{
    success: boolean;
    documentId?: string;
    summary?: string;
    keyQuestions?: string;
    chunksCreated?: number;
    error?: string;
  }> {
    try {
      console.log('🚀 Starting complete document processing...');
      
      // Process for RAG in parallel with content analysis
      const [ragResult, analysisResult] = await Promise.all([
        this.processDocumentForRAG(file),
        this.setPDFContent(content, undefined), // Will generate analysis automatically
      ]);

      if (ragResult.success && analysisResult.success) {
        console.log('✅ Complete document processing successful');
        return {
          success: true,
          documentId: ragResult.documentId,
          summary: analysisResult.summary,
          keyQuestions: analysisResult.keyQuestions,
          chunksCreated: enhancedRAGService.getStatistics()?.totalChunks || 0,
        };
      } else {
        console.warn('⚠️ Partial processing failure');
        return {
          success: false,
          error: `RAG: ${ragResult.error || 'OK'}, Analysis: ${analysisResult.error || 'OK'}`,
        };
      }
    } catch (error) {
      console.error('❌ Error in complete document processing:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
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
   * Generate automatic summary and key questions when PDF is loaded
   */
  async generateAutoAnalysis(content: PDFContent): Promise<{
    summary: GeminiResponse;
    keyQuestions: GeminiResponse;
  }> {
    if (!this.isInitialized()) {
      const errorResponse = {
        success: false,
        error: "Gemini AI is not initialized. Please set your API key first.",
      };
      return {
        summary: errorResponse,
        keyQuestions: errorResponse,
      };
    }

    try {
      console.log("🚀 Starting generateAutoAnalysis...");
      console.log("📊 PDF content preview:", {
        pages: content.pages,
        textLength: content.text.length,
        title: content.info?.Title || "Unknown",
        author: content.info?.Author || "Unknown"
      });
      
      // Generate summary and questions in parallel for better performance
      console.log("⚡ Starting parallel generation of summary and questions...");
      const [summaryResult, questionsResult] = await Promise.all([
        this.generateAutoSummary(content),
        this.generateKeyQuestions(content),
      ]);
      
      console.log("📋 Analysis results:", {
        summarySuccess: summaryResult.success,
        questionsSuccess: questionsResult.success,
        summaryError: summaryResult.error,
        questionsError: questionsResult.error
      });

      return {
        summary: summaryResult,
        keyQuestions: questionsResult,
      };
    } catch (error) {
      const errorResponse = {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      };
      return {
        summary: errorResponse,
        keyQuestions: errorResponse,
      };
    }
  }

  /**
   * Generate automatic summary of PDF content
   */
  private async generateAutoSummary(content: PDFContent): Promise<GeminiResponse> {
    const summaryPrompt = `
Analiza este documento PDF y genera un resumen automático conciso pero completo:

METADATOS DEL DOCUMENTO:
- Páginas: ${content.pages}
- Título: ${content.info?.Title || "Desconocido"}
- Autor: ${content.info?.Author || "Desconocido"}
- Asunto: ${content.info?.Subject || "Desconocido"}
- Longitud del texto: ${content.text.length} caracteres

CONTENIDO DEL DOCUMENTO:
${content.text.substring(0, 8000)} ${content.text.length > 8000 ? '...[contenido truncado]' : ''}

Por favor proporciona:

## 📋 RESUMEN EJECUTIVO
Un resumen claro y conciso del documento en 2-3 párrafos.

## 🎯 PUNTOS CLAVE
- 3-5 puntos más importantes del documento
- Información relevante y hallazgos principales

## 📊 ESTRUCTURA Y ORGANIZACIÓN
Breve descripción de cómo está organizado el documento.

## 💡 INSIGHTS DESTACADOS
Cualquier información notable, estadísticas importantes o conclusiones relevantes.

Mantén el resumen informativo pero fácil de leer. Usa emojis para hacer más visual la presentación.
`;

    try {
      console.log("🤖 Starting generateAutoSummary...");
      console.log("📝 Summary prompt length:", summaryPrompt.length);
      
      const result = await this.genAI!.models.generateContent({
        model: "gemini-1.5-flash",
        contents: summaryPrompt,
        config: {
          temperature: 0.3, // Lower temperature for more focused summaries
          topK: 20,
          topP: 0.8,
          maxOutputTokens: 2048,
        },
      });
      
      console.log("✅ API call successful, processing result...");
      console.log("📋 Result object:", result);
      
      const text = result.text || "No se pudo generar el resumen";
      console.log("📄 Generated text length:", text.length);

      return {
        success: true,
        response: text,
      };
    } catch (error) {
      console.error("Error generating auto summary:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  /**
   * Generate 3 key questions based on PDF content
   */
  private async generateKeyQuestions(content: PDFContent): Promise<GeminiResponse> {
    const questionsPrompt = `
Basándote en este documento PDF, genera exactamente 3 preguntas clave que ayuden al usuario a explorar y entender mejor el contenido:

METADATOS DEL DOCUMENTO:
- Título: ${content.info?.Title || "Desconocido"}
- Páginas: ${content.pages}
- Asunto: ${content.info?.Subject || "Desconocido"}

CONTENIDO DEL DOCUMENTO:
${content.text.substring(0, 6000)} ${content.text.length > 6000 ? '...[contenido truncado]' : ''}

Genera 3 preguntas que:
1. Ayuden al usuario a profundizar en los temas principales
2. Exploren aspectos importantes o interesantes del documento
3. Faciliten la comprensión de conceptos clave

Formato de respuesta:
## 🤔 PREGUNTAS CLAVE PARA EXPLORAR

**1. [Pregunta sobre el tema principal]**
_Explora: [breve explicación de por qué esta pregunta es relevante]_

**2. [Pregunta sobre aspectos específicos o detalles importantes]**
_Explora: [breve explicación de por qué esta pregunta es relevante]_

**3. [Pregunta sobre implicaciones, aplicaciones o conclusiones]**
_Explora: [breve explicación de por qué esta pregunta es relevante]_

Las preguntas deben ser específicas al contenido del documento y formuladas de manera que inviten al diálogo y la exploración del tema.
`;

    try {
      console.log("🤖 Starting generateKeyQuestions...");
      console.log("❓ Questions prompt length:", questionsPrompt.length);
      
      const result = await this.genAI!.models.generateContent({
        model: "gemini-1.5-flash",
        contents: questionsPrompt,
        config: {
          temperature: 0.4, // Slightly higher temperature for more creative questions
          topK: 30,
          topP: 0.85,
          maxOutputTokens: 1024,
        },
      });
      
      console.log("✅ Questions API call successful, processing result...");
      console.log("📋 Questions result object:", result);
      
      const text = result.text || "No se pudieron generar las preguntas clave";
      console.log("❓ Generated questions length:", text.length);

      return {
        success: true,
        response: text,
      };
    } catch (error) {
      console.error("Error generating key questions:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  /**
   * Search for specific information in PDF
   */
  async searchInDocument(query: string): Promise<GeminiResponse> {
    if (!this.currentPDFContent) {
      return {
        success: false,
        error: "No PDF document is currently loaded.",
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
