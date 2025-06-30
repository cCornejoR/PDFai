// Tipos principales de la aplicación PDFai

export interface AppConfig {
  theme: "light" | "dark" | "system";
  language: "es" | "en";
  chatPreferences: {
    maxTokens: number;
    temperature: number;
    enableMarkdown: boolean;
  };
  pdfPreferences: {
    defaultZoom: number;
    enableAnnotations: boolean;
    autoSave: boolean;
  };
  uiPreferences: {
    sidebarWidth: number;
    chatPanelWidth: number;
    enableAnimations: boolean;
    enableGlassmorphism: boolean;
  };
  apiKeys: {
    gemini?: string;
  };
  geminiApiKey?: string; // Para compatibilidad con código existente
  recentFiles: string[];
  favorites: string[];
}

export interface PDFDocument {
  id: string;
  name: string;
  path: string;
  size: number;
  lastModified: Date;
  metadata?: PDFMetadata;
  thumbnail?: string;
  isFavorite: boolean;
  tags: string[];
  addedAt: Date;
  lastAccessed: Date;
  uploadedAt?: Date; // Para compatibilidad con código existente
}

export interface PDFMetadata {
  title?: string;
  author?: string;
  subject?: string;
  creator?: string;
  producer?: string;
  creationDate?: Date;
  modificationDate?: Date;
  pageCount: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  pdfContext?: {
    documentId: string;
    pageNumber?: number;
    selectedText?: string;
  };
}

export interface ChatSession {
  id: string;
  title: string;
  documentId?: string;
  pdfId?: string; // Para compatibilidad con código existente
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface AppState {
  currentView: "pdfs" | "chat" | "settings";
  selectedPDF: PDFDocument | null;
  pdfs: PDFDocument[];
  currentChat: ChatSession | null;
  chats: ChatSession[];
  config: AppConfig;
  isLoading: boolean;
  error: string | null;
  systemInfo: any | null;
  currentDocument?: PDFDocument;
  currentSession?: ChatSession;
  sidebarOpen?: boolean;
  chatPanelOpen?: boolean;
}

// Tipos para la API de Electron
export interface ElectronAPI {
  // Ventana
  minimizeWindow: () => Promise<void>;
  maximizeWindow: () => Promise<void>;
  closeWindow: () => Promise<void>;

  // Archivos PDF
  selectPdfFile: () => Promise<{
    success: boolean;
    file?: {
      name: string;
      path: string;
      size: number;
      lastModified: Date;
    };
    error?: string;
  }>;

  readPdfFile: (filePath: string) => Promise<{
    success: boolean;
    data?: string;
    error?: string;
  }>;

  getFileInfo: (filePath: string) => Promise<{
    success: boolean;
    info?: {
      name: string;
      path: string;
      size: number;
      lastModified: Date;
      exists: boolean;
    };
    error?: string;
  }>;

  openFileLocation: (filePath: string) => Promise<{
    success: boolean;
    error?: string;
  }>;

  // Configuración (opcional - puede no estar implementado aún)
  loadConfig?: () => Promise<{
    success: boolean;
    config?: AppConfig;
    error?: string;
  }>;

  saveConfig?: (config: AppConfig) => Promise<{
    success: boolean;
    error?: string;
  }>;

  // Secure API Key Storage
  storeApiKey: (apiKey: string) => Promise<{
    success: boolean;
    error?: string;
  }>;

  loadApiKey: () => Promise<{
    success: boolean;
    apiKey?: string | null;
    error?: string;
  }>;

  removeApiKey: () => Promise<{
    success: boolean;
    error?: string;
  }>;

  hasApiKey: () => Promise<{
    success: boolean;
    hasKey?: boolean;
    error?: string;
  }>;

  // Legacy API Keys (optional - for backward compatibility)
  setApiKey?: (apiKey: string) => Promise<{
    success: boolean;
    error?: string;
  }>;

  getApiKey?: () => Promise<{
    success: boolean;
    apiKey?: string;
    error?: string;
  }>;
}

// Extensión del objeto Window
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

// Tipos para PDF.js
export interface PDFJSMetadata {
  info: {
    Title?: string;
    Author?: string;
    Subject?: string;
    Creator?: string;
    Producer?: string;
    CreationDate?: string | Date;
    ModDate?: string | Date;
  };
}

// Tipos para respuestas de la API
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Tipos para el almacenamiento
export interface StorageData {
  config: AppConfig;
  documents: PDFDocument[];
  sessions: ChatSession[];
  lastSync: Date;
}

export interface FileInfo {
  name: string;
  path: string;
  size: number;
  lastModified: Date;
}

// RAG System Integration Types
export interface RAGChatMessage extends ChatMessage {
  ragContext?: {
    sources: Array<{
      documentId: string;
      chunkId: string;
      content: string;
      score: number;
      pageNumber?: number;
    }>;
    method: "rag" | "gemini" | "hybrid";
    processingTime: number;
  };
}

export interface EnhancedChatSession extends ChatSession {
  ragEnabled: boolean;
  ragDocuments: string[]; // Document IDs processed by RAG
  ragConfig?: {
    preset: "default" | "performance" | "accuracy";
    customSettings?: Record<string, any>;
  };
}

export interface DocumentProcessingStatus {
  documentId: string;
  status: "pending" | "processing" | "completed" | "error";
  progress?: number;
  error?: string;
  ragProcessed: boolean;
  chunksCount?: number;
  processingTime?: number;
}
