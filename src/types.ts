export const MessageAuthor = {
  USER: "user",
  AI: "ai",
} as const;

export type MessageAuthor = (typeof MessageAuthor)[keyof typeof MessageAuthor];

export interface ChatMessage {
  author: MessageAuthor;
  text: string;
}

export type ProcessingStatus = "processing" | "ready" | "error";

export interface PageData {
  text: string;
  imageUrl: string;
}

export interface ProcessedPdf {
  id: string;
  file: File;
  name: string;
  status: ProcessingStatus;
  pages: PageData[];
  error?: string;
}
