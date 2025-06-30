// Use PDF.js for PDF parsing in renderer process
import { PDFService } from "./pdfService";

export interface PDFContent {
  text: string;
  pages: number;
  info: any;
  metadata: any;
  images?: string[]; // Base64 encoded images
}

export interface PDFExtractionResult {
  success: boolean;
  content?: PDFContent;
  error?: string;
}

class PDFParseService {
  /**
   * Extract text and metadata from PDF file using PDF.js
   */
  async extractPDFContent(filePath: string): Promise<PDFExtractionResult> {
    try {
      // Read the PDF file using Electron API
      const fileResult = await window.electronAPI.readPdfFile(filePath);

      if (!fileResult.success || !fileResult.data) {
        return {
          success: false,
          error: fileResult.error || "Failed to read PDF file",
        };
      }

      // Convert base64 data to ArrayBuffer for PDF.js
      const base64Data = fileResult.data.split(",")[1];
      const binaryString = window.atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Extract text using PDF.js
      const pdfContent = await PDFService.extractTextFromPDF(bytes);

      const content: PDFContent = {
        text: pdfContent.text,
        pages: pdfContent.pageCount || 0,
        info: pdfContent.metadata || {},
        metadata: pdfContent.metadata || {},
        images: [], // We'll implement image extraction separately
      };

      return {
        success: true,
        content,
      };
    } catch (error) {
      console.error("Error extracting PDF content:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  /**
   * Extract images from PDF (basic implementation)
   * Note: This is a simplified version. For full image extraction,
   * we would need additional libraries like pdf2pic or pdf-poppler
   */
  async extractImages(filePath: string): Promise<string[]> {
    try {
      // For now, return empty array
      // In a full implementation, you would use libraries like:
      // - pdf2pic
      // - pdf-poppler
      // - or custom PDF.js implementation
      return [];
    } catch (error) {
      console.error("Error extracting images:", error);
      return [];
    }
  }

  /**
   * Get PDF file information
   */
  async getPDFInfo(filePath: string): Promise<any> {
    try {
      const result = await this.extractPDFContent(filePath);
      if (result.success && result.content) {
        return {
          pages: result.content.pages,
          info: result.content.info,
          metadata: result.content.metadata,
          textLength: result.content.text.length,
        };
      }
      return null;
    } catch (error) {
      console.error("Error getting PDF info:", error);
      return null;
    }
  }

  /**
   * Extract text from specific page range
   */
  async extractTextFromPages(
    filePath: string,
    startPage: number,
    endPage: number
  ): Promise<string> {
    try {
      const result = await this.extractPDFContent(filePath);
      if (result.success && result.content) {
        // Note: pdf-parse extracts all text at once
        // For page-specific extraction, we would need a different approach
        // This is a simplified implementation
        return result.content.text;
      }
      return "";
    } catch (error) {
      console.error("Error extracting text from pages:", error);
      return "";
    }
  }

  /**
   * Search for text in PDF
   */
  async searchInPDF(filePath: string, searchTerm: string): Promise<boolean> {
    try {
      const result = await this.extractPDFContent(filePath);
      if (result.success && result.content) {
        return result.content.text
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      }
      return false;
    } catch (error) {
      console.error("Error searching in PDF:", error);
      return false;
    }
  }

  /**
   * Prepare content for Gemini AI
   * This formats the extracted content in a way that's optimal for AI processing
   */
  prepareForGemini(content: PDFContent): {
    text: string;
    metadata: string;
    summary: string;
  } {
    const metadata = `
Document Information:
- Pages: ${content.pages}
- Title: ${content.info?.Title || "Unknown"}
- Author: ${content.info?.Author || "Unknown"}
- Subject: ${content.info?.Subject || "Unknown"}
- Creator: ${content.info?.Creator || "Unknown"}
- Producer: ${content.info?.Producer || "Unknown"}
- Creation Date: ${content.info?.CreationDate || "Unknown"}
- Modification Date: ${content.info?.ModDate || "Unknown"}
`;

    const summary = `
This is a ${content.pages}-page PDF document with ${
      content.text.length
    } characters of text content.
${content.info?.Title ? `Title: ${content.info.Title}` : ""}
${content.info?.Subject ? `Subject: ${content.info.Subject}` : ""}
`;

    return {
      text: content.text,
      metadata: metadata.trim(),
      summary: summary.trim(),
    };
  }
}

// Export singleton instance
export const pdfParseService = new PDFParseService();
export default pdfParseService;
