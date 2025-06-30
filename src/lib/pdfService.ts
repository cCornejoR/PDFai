// PDF Service for text extraction and processing
import * as pdfjsLib from "pdfjs-dist";
import { PDFJSMetadata } from "../types";

// Configure PDF.js worker
if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
}

export interface PDFTextContent {
  text: string;
  pageCount: number;
  metadata?: {
    title?: string;
    author?: string;
    subject?: string;
    creator?: string;
    producer?: string;
    creationDate?: Date;
    modificationDate?: Date;
  };
}

export class PDFService {
  /**
   * Extract text content from a PDF file
   * @param fileData - PDF file data as ArrayBuffer or Uint8Array
   * @returns Promise<PDFTextContent>
   */
  static async extractTextFromPDF(
    fileData: ArrayBuffer | Uint8Array
  ): Promise<PDFTextContent> {
    try {
      console.log("🔍 Starting PDF text extraction...");

      // Load the PDF document
      const loadingTask = pdfjsLib.getDocument(fileData);
      const pdf = await loadingTask.promise;

      console.log(`📄 PDF loaded successfully. Pages: ${pdf.numPages}`);

      // Extract metadata
      const metadata = (await pdf.getMetadata()) as PDFJSMetadata;
      const pdfMetadata = {
        title: metadata.info?.Title,
        author: metadata.info?.Author,
        subject: metadata.info?.Subject,
        creator: metadata.info?.Creator,
        producer: metadata.info?.Producer,
        creationDate: metadata.info?.CreationDate
          ? new Date(metadata.info.CreationDate)
          : undefined,
        modificationDate: metadata.info?.ModDate
          ? new Date(metadata.info.ModDate)
          : undefined,
        pageCount: pdf.numPages,
      };

      // Extract text from all pages
      let fullText = "";

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        try {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();

          // Combine text items with proper spacing
          const pageText = textContent.items
            .map((item: any) => {
              if ("str" in item) {
                return item.str;
              }
              return "";
            })
            .join(" ")
            .replace(/\s+/g, " ") // Normalize whitespace
            .trim();

          if (pageText) {
            fullText += `\n--- Page ${pageNum} ---\n${pageText}\n`;
          }

          console.log(`✅ Extracted text from page ${pageNum}/${pdf.numPages}`);
        } catch (pageError) {
          console.warn(
            `⚠️ Error extracting text from page ${pageNum}:`,
            pageError
          );
          fullText += `\n--- Page ${pageNum} (Error extracting text) ---\n`;
        }
      }

      const result: PDFTextContent = {
        text: fullText.trim(),
        pageCount: pdf.numPages,
        metadata: pdfMetadata,
      };

      console.log(
        `✅ PDF text extraction completed. Total characters: ${result.text.length}`
      );
      return result;
    } catch (error) {
      console.error("❌ Error extracting text from PDF:", error);
      throw new Error(
        `Failed to extract text from PDF: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Extract text from PDF file path (for Electron main process)
   * @param filePath - Path to the PDF file
   * @returns Promise<PDFTextContent>
   */
  static async extractTextFromFile(filePath: string): Promise<PDFTextContent> {
    try {
      // This would be used in the main process with fs
      // For now, we'll throw an error as this should be handled by the main process
      throw new Error(
        "File path extraction should be handled by the main Electron process"
      );
    } catch (error) {
      console.error("❌ Error extracting text from file:", error);
      throw error;
    }
  }

  /**
   * Chunk text into smaller pieces for better AI processing
   * @param text - Full text content
   * @param maxChunkSize - Maximum characters per chunk
   * @returns Array of text chunks
   */
  static chunkText(text: string, maxChunkSize: number = 4000): string[] {
    if (text.length <= maxChunkSize) {
      return [text];
    }

    const chunks: string[] = [];
    const paragraphs = text.split("\n\n");
    let currentChunk = "";

    for (const paragraph of paragraphs) {
      if (currentChunk.length + paragraph.length + 2 <= maxChunkSize) {
        currentChunk += (currentChunk ? "\n\n" : "") + paragraph;
      } else {
        if (currentChunk) {
          chunks.push(currentChunk);
          currentChunk = paragraph;
        } else {
          // If a single paragraph is too long, split it by sentences
          const sentences = paragraph.split(". ");
          for (const sentence of sentences) {
            if (currentChunk.length + sentence.length + 2 <= maxChunkSize) {
              currentChunk += (currentChunk ? ". " : "") + sentence;
            } else {
              if (currentChunk) {
                chunks.push(currentChunk);
                currentChunk = sentence;
              } else {
                // If even a single sentence is too long, force split
                chunks.push(sentence.substring(0, maxChunkSize));
                currentChunk = sentence.substring(maxChunkSize);
              }
            }
          }
        }
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk);
    }

    return chunks;
  }

  /**
   * Search for specific text within PDF content
   * @param content - PDF text content
   * @param query - Search query
   * @returns Array of matching text snippets with context
   */
  static searchInContent(
    content: string,
    query: string
  ): Array<{ snippet: string; page?: number }> {
    const results: Array<{ snippet: string; page?: number }> = [];
    const queryLower = query.toLowerCase();
    const lines = content.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.toLowerCase().includes(queryLower)) {
        // Extract page number if available
        const pageMatch = line.match(/--- Page (\d+) ---/);
        const pageNum = pageMatch ? parseInt(pageMatch[1]) : undefined;

        // Get context around the match
        const contextStart = Math.max(0, i - 2);
        const contextEnd = Math.min(lines.length, i + 3);
        const snippet = lines.slice(contextStart, contextEnd).join("\n");

        results.push({
          snippet: snippet.trim(),
          page: pageNum,
        });
      }
    }

    return results;
  }
}
