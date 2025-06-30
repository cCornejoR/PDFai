/**
 * Google Embeddings Service for RAG
 * Handles text embeddings generation using Google's Gemini models
 */

import { GoogleGenAI } from "@google/genai";

export interface EmbeddingConfig {
  model: string;
  taskType?:
    | "RETRIEVAL_QUERY"
    | "RETRIEVAL_DOCUMENT"
    | "SEMANTIC_SIMILARITY"
    | "CLASSIFICATION"
    | "CLUSTERING";
  title?: string;
  outputDimensionality?: number;
}

export interface EmbeddingResult {
  embedding: number[];
  text: string;
  model: string;
  timestamp: Date;
}

export interface BatchEmbeddingResult {
  embeddings: EmbeddingResult[];
  totalProcessed: number;
  errors: string[];
}

export class GoogleEmbeddingService {
  private genAI: GoogleGenAI | null = null;
  private defaultConfig: EmbeddingConfig = {
    model: "text-embedding-004", // Latest stable embedding model
    taskType: "RETRIEVAL_DOCUMENT",
  };

  constructor(apiKey?: string) {
    if (apiKey) {
      this.initialize(apiKey);
    }
  }

  /**
   * Initialize the service with API key
   */
  initialize(apiKey: string): boolean {
    try {
      this.genAI = new GoogleGenAI({ apiKey });
      return true;
    } catch (error) {
      console.error("Error initializing Google AI:", error);
      return false;
    }
  }

  /**
   * Check if service is initialized
   */
  isInitialized(): boolean {
    return this.genAI !== null;
  }

  /**
   * Generate embedding for a single text
   */
  async generateEmbedding(
    text: string,
    config?: Partial<EmbeddingConfig>
  ): Promise<EmbeddingResult> {
    if (!this.isInitialized()) {
      throw new Error(
        "Embedding service not initialized. Please set API key first."
      );
    }

    const embeddingConfig = { ...this.defaultConfig, ...config };

    try {
      // Using embedContent method from Google GenAI SDK
      const result = await this.genAI!.models.embedContent({
        model: embeddingConfig.model,
        contents: text,
        config: {
          outputDimensionality: embeddingConfig.outputDimensionality,
        },
      });

      if (!result.embeddings || result.embeddings.length === 0) {
        throw new Error("Invalid embedding response");
      }

      return {
        embedding: result.embeddings[0].values || [],
        text: text,
        model: embeddingConfig.model,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error("Error generating embedding:", error);
      throw new Error(
        `Failed to generate embedding: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Generate embeddings for multiple texts in batch
   */
  async generateBatchEmbeddings(
    texts: string[],
    config?: Partial<EmbeddingConfig>
  ): Promise<BatchEmbeddingResult> {
    if (!this.isInitialized()) {
      throw new Error(
        "Embedding service not initialized. Please set API key first."
      );
    }

    const embeddings: EmbeddingResult[] = [];
    const errors: string[] = [];
    let totalProcessed = 0;

    // Process in batches to avoid rate limits
    const batchSize = 10;

    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);

      const batchPromises = batch.map(async (text, index) => {
        try {
          const embedding = await this.generateEmbedding(text, config);
          embeddings.push(embedding);
          totalProcessed++;
        } catch (error) {
          const errorMsg = `Error processing text ${i + index}: ${
            error instanceof Error ? error.message : "Unknown error"
          }`;
          console.error(errorMsg);
          errors.push(errorMsg);
        }
      });

      await Promise.all(batchPromises);

      // Add delay between batches to respect rate limits
      if (i + batchSize < texts.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 second delay
      }
    }

    return {
      embeddings,
      totalProcessed,
      errors,
    };
  }

  /**
   * Calculate cosine similarity between two embeddings
   */
  calculateCosineSimilarity(
    embedding1: number[],
    embedding2: number[]
  ): number {
    if (embedding1.length !== embedding2.length) {
      throw new Error("Embeddings must have the same dimensionality");
    }

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < embedding1.length; i++) {
      dotProduct += embedding1[i] * embedding2[i];
      norm1 += embedding1[i] * embedding1[i];
      norm2 += embedding2[i] * embedding2[i];
    }

    const magnitude = Math.sqrt(norm1) * Math.sqrt(norm2);
    return magnitude === 0 ? 0 : dotProduct / magnitude;
  }

  /**
   * Find most similar embeddings to a query
   */
  findSimilarEmbeddings(
    queryEmbedding: number[],
    embeddings: EmbeddingResult[],
    topK: number = 5,
    threshold: number = 0.7
  ): Array<EmbeddingResult & { similarity: number }> {
    const similarities = embeddings.map((result) => ({
      ...result,
      similarity: this.calculateCosineSimilarity(
        queryEmbedding,
        result.embedding
      ),
    }));

    return similarities
      .filter((result) => result.similarity >= threshold)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);
  }

  /**
   * Generate embeddings for different document types
   */
  async generateDocumentEmbeddings(
    content: string,
    documentType: "pdf" | "doc" | "txt",
    metadata?: { title?: string; filename?: string }
  ): Promise<BatchEmbeddingResult> {
    // Customize embedding generation based on document type
    const config: Partial<EmbeddingConfig> = {
      taskType: "RETRIEVAL_DOCUMENT",
      title: metadata?.title || metadata?.filename,
    };

    // Split content into chunks appropriate for the document type
    const chunks = this.splitDocumentContent(content, documentType);

    // Add document context to each chunk
    const contextualChunks = chunks.map((chunk, index) => {
      const prefix = metadata?.filename
        ? `Document: ${metadata.filename}\n`
        : "";
      const chunkInfo = `Part ${index + 1}/${chunks.length}\n`;
      return `${prefix}${chunkInfo}${chunk}`;
    });

    return await this.generateBatchEmbeddings(contextualChunks, config);
  }

  /**
   * Split document content into appropriate chunks based on type
   */
  private splitDocumentContent(
    content: string,
    documentType: "pdf" | "doc" | "txt"
  ): string[] {
    const maxChunkSize = 1000; // characters
    const overlapSize = 200; // characters

    // Different splitting strategies for different document types
    let chunks: string[] = [];

    switch (documentType) {
      case "pdf":
        // PDFs often have page breaks and sections
        chunks = this.splitByPages(content, maxChunkSize, overlapSize);
        break;

      case "doc":
        // DOC files often have paragraphs and sections
        chunks = this.splitByParagraphs(content, maxChunkSize, overlapSize);
        break;

      case "txt":
        // Plain text - simple sentence-based splitting
        chunks = this.splitBySentences(content, maxChunkSize, overlapSize);
        break;
    }

    return chunks.filter((chunk) => chunk.trim().length > 50); // Filter out very short chunks
  }

  private splitByPages(
    content: string,
    maxSize: number,
    overlap: number
  ): string[] {
    // Look for page breaks or use regular chunking
    const pageBreaks = content.split(/\n\s*\n\s*\n/); // Multiple line breaks
    if (pageBreaks.length > 1) {
      return this.chunkArrayBySize(pageBreaks, maxSize, overlap);
    }
    return this.splitBySentences(content, maxSize, overlap);
  }

  private splitByParagraphs(
    content: string,
    maxSize: number,
    overlap: number
  ): string[] {
    const paragraphs = content.split(/\n\s*\n/); // Double line breaks
    return this.chunkArrayBySize(paragraphs, maxSize, overlap);
  }

  private splitBySentences(
    content: string,
    maxSize: number,
    overlap: number
  ): string[] {
    const sentences = content.split(/[.!?]+\s+/);
    return this.chunkArrayBySize(sentences, maxSize, overlap);
  }

  private chunkArrayBySize(
    items: string[],
    maxSize: number,
    overlap: number
  ): string[] {
    const chunks: string[] = [];
    let currentChunk = "";
    let overlapText = "";

    for (const item of items) {
      const candidateChunk =
        overlapText + currentChunk + (currentChunk ? " " : "") + item;

      if (candidateChunk.length <= maxSize) {
        currentChunk = candidateChunk.replace(overlapText, "");
      } else {
        if (currentChunk) {
          chunks.push(overlapText + currentChunk);
          // Create overlap from the end of current chunk
          const words = currentChunk.split(" ");
          const overlapWords = words.slice(-Math.floor(overlap / 6)); // Approximate words for overlap
          overlapText = overlapWords.join(" ") + " ";
        }
        currentChunk = item;
      }
    }

    if (currentChunk) {
      chunks.push(overlapText + currentChunk);
    }

    return chunks;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<EmbeddingConfig>): void {
    this.defaultConfig = { ...this.defaultConfig, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): EmbeddingConfig {
    return { ...this.defaultConfig };
  }
}

// Export singleton instance
export const embeddingService = new GoogleEmbeddingService();
