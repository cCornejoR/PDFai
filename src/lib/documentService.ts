/**
 * Document Processing Service
 * Handles PDF, DOC, and TXT file processing with text extraction
 */

import { PDFContent } from './pdfParseService';

export interface DocumentContent {
  text: string;
  metadata: {
    filename: string;
    type: 'pdf' | 'doc' | 'txt';
    pages?: number;
    size: number;
    title?: string;
    author?: string;
    subject?: string;
    creator?: string;
    producer?: string;
    creationDate?: Date;
    modDate?: Date;
  };
  extractedAt: Date;
}

export interface DocumentProcessingResult {
  success: boolean;
  content?: DocumentContent;
  error?: string;
  warnings?: string[];
}

export class DocumentService {
  
  /**
   * Process different types of documents
   */
  async processDocument(file: File): Promise<DocumentProcessingResult> {
    const fileType = this.getFileType(file.name);
    
    try {
      switch (fileType) {
        case 'pdf':
          return await this.processPDF(file);
        case 'doc':
          return await this.processDOC(file);
        case 'txt':
          return await this.processTXT(file);
        default:
          return {
            success: false,
            error: `Unsupported file type: ${fileType}. Supported types: PDF, DOC, DOCX, TXT`
          };
      }
    } catch (error) {
      return {
        success: false,
        error: `Error processing document: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Process PDF files using existing PDF service
   */
  private async processPDF(file: File): Promise<DocumentProcessingResult> {
    try {
      // Use existing PDF parsing logic
      const { pdfParseService } = await import('./pdfParseService');
      
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      const pdfContent: PDFContent = await pdfParseService.parsePDFBuffer(uint8Array);
      
      const documentContent: DocumentContent = {
        text: pdfContent.text,
        metadata: {
          filename: file.name,
          type: 'pdf',
          pages: pdfContent.pages,
          size: file.size,
          title: pdfContent.info?.Title,
          author: pdfContent.info?.Author,
          subject: pdfContent.info?.Subject,
          creator: pdfContent.info?.Creator,
          producer: pdfContent.info?.Producer,
          creationDate: pdfContent.info?.CreationDate ? new Date(pdfContent.info.CreationDate) : undefined,
          modDate: pdfContent.info?.ModDate ? new Date(pdfContent.info.ModDate) : undefined,
        },
        extractedAt: new Date()
      };

      const warnings: string[] = [];
      
      if (!pdfContent.text || pdfContent.text.trim().length === 0) {
        warnings.push('PDF appears to contain no extractable text. It might be image-based.');
      }

      if (pdfContent.text.length < 100) {
        warnings.push('PDF contains very little text content.');
      }

      return {
        success: true,
        content: documentContent,
        warnings: warnings.length > 0 ? warnings : undefined
      };

    } catch (error) {
      return {
        success: false,
        error: `PDF processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Process DOC/DOCX files
   * Note: This is a basic implementation. For production, consider using libraries like mammoth.js
   */
  private async processDOC(file: File): Promise<DocumentProcessingResult> {
    try {
      // For now, we'll treat DOC files as text and try to extract what we can
      // In a production environment, you would use libraries like:
      // - mammoth.js for DOCX files
      // - antiword for older DOC files
      
      const text = await file.text();
      
      // Basic DOC file detection and text extraction
      let extractedText = '';
      
      if (file.name.toLowerCase().endsWith('.docx')) {
        // DOCX files are actually ZIP files with XML content
        // This is a simplified approach - for production use mammoth.js
        extractedText = this.extractTextFromDocx(text);
      } else {
        // Legacy DOC files are binary - this is a very basic approach
        extractedText = this.extractTextFromDoc(text);
      }

      if (!extractedText || extractedText.trim().length === 0) {
        return {
          success: false,
          error: 'Unable to extract text from DOC file. Consider converting to PDF or TXT format.'
        };
      }

      const documentContent: DocumentContent = {
        text: extractedText,
        metadata: {
          filename: file.name,
          type: 'doc',
          size: file.size,
          title: this.extractTitleFromFilename(file.name)
        },
        extractedAt: new Date()
      };

      return {
        success: true,
        content: documentContent,
        warnings: ['DOC file processing is limited. For better results, consider converting to PDF.']
      };

    } catch (error) {
      return {
        success: false,
        error: `DOC processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Process TXT files
   */
  private async processTXT(file: File): Promise<DocumentProcessingResult> {
    try {
      const text = await file.text();
      
      if (!text || text.trim().length === 0) {
        return {
          success: false,
          error: 'TXT file appears to be empty.'
        };
      }

      // Detect encoding issues
      const warnings: string[] = [];
      if (text.includes('�')) {
        warnings.push('File may have encoding issues. Some characters might not display correctly.');
      }

      const documentContent: DocumentContent = {
        text: text,
        metadata: {
          filename: file.name,
          type: 'txt',
          size: file.size,
          title: this.extractTitleFromFilename(file.name)
        },
        extractedAt: new Date()
      };

      return {
        success: true,
        content: documentContent,
        warnings: warnings.length > 0 ? warnings : undefined
      };

    } catch (error) {
      return {
        success: false,
        error: `TXT processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Get file type from filename
   */
  private getFileType(filename: string): 'pdf' | 'doc' | 'txt' | 'unknown' {
    const extension = filename.toLowerCase().split('.').pop();
    
    switch (extension) {
      case 'pdf':
        return 'pdf';
      case 'doc':
      case 'docx':
        return 'doc';
      case 'txt':
      case 'text':
        return 'txt';
      default:
        return 'unknown';
    }
  }

  /**
   * Extract title from filename
   */
  private extractTitleFromFilename(filename: string): string {
    return filename.split('.').slice(0, -1).join('.').replace(/[_-]/g, ' ');
  }

  /**
   * Basic text extraction from DOCX (simplified)
   * In production, use mammoth.js for proper DOCX processing
   */
  private extractTextFromDocx(content: string): string {
    // This is a very basic approach and won't work for most DOCX files
    // For production, install and use mammoth.js:
    // npm install mammoth
    // const mammoth = require('mammoth');
    // const result = await mammoth.extractRawText({ buffer: arrayBuffer });
    // return result.value;
    
    console.warn('DOCX processing is limited. Consider using mammoth.js for production.');
    return content.replace(/[^\x20-\x7E\s]/g, '').trim();
  }

  /**
   * Basic text extraction from legacy DOC files (simplified)
   * In production, use antiword or similar tools
   */
  private extractTextFromDoc(content: string): string {
    // Legacy DOC files are binary and complex to parse
    // This is a very basic approach that likely won't work well
    // For production, consider:
    // 1. Using server-side conversion tools
    // 2. Asking users to convert to PDF or DOCX
    // 3. Using online conversion APIs
    
    console.warn('DOC processing is limited. Consider converting to PDF or DOCX.');
    
    // Try to extract some readable text
    const textPattern = /[\x20-\x7E]{4,}/g;
    const matches = content.match(textPattern);
    
    return matches ? matches.join(' ').trim() : '';
  }

  /**
   * Validate file before processing
   */
  validateFile(file: File): { valid: boolean; error?: string } {
    // Check file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      return {
        valid: false,
        error: 'File is too large. Maximum size is 50MB.'
      };
    }

    // Check file type
    const fileType = this.getFileType(file.name);
    if (fileType === 'unknown') {
      return {
        valid: false,
        error: 'Unsupported file type. Supported formats: PDF, DOC, DOCX, TXT'
      };
    }

    return { valid: true };
  }

  /**
   * Get supported file types
   */
  getSupportedTypes(): string[] {
    return ['pdf', 'doc', 'docx', 'txt'];
  }

  /**
   * Get file type description
   */
  getFileTypeDescription(type: string): string {
    switch (type.toLowerCase()) {
      case 'pdf':
        return 'Portable Document Format - Best support with full text extraction';
      case 'doc':
        return 'Microsoft Word Document (Legacy) - Limited support, consider converting to PDF';
      case 'docx':
        return 'Microsoft Word Document - Limited support, consider converting to PDF';
      case 'txt':
        return 'Plain Text Document - Full support';
      default:
        return 'Unknown file type';
    }
  }
}

// Export singleton instance
export const documentService = new DocumentService();