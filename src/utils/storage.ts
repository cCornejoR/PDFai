// Storage utilities for managing PDF files and application state in Electron

export interface PDFFile {
  id: string;
  name: string;
  path: string;
  size: number;
  lastModified: Date;
  starred: boolean;
  folderId?: string;
  thumbnail?: string;
  documentId?: string; // Added for RAG service document ID
}

export interface Folder {
  id: string;
  name: string;
  expanded: boolean;
  createdAt: Date;
  parentId?: string;
}

export interface AppState {
  files: PDFFile[];
  folders: Folder[];
  favorites: string[]; // Array of file IDs
  recentFiles: string[]; // Array of file IDs, most recent first
  settings: {
    theme: "light" | "dark" | "system";
    autoSave: boolean;
    defaultZoom: number;
  };
}

class StorageManager {
  private static instance: StorageManager;
  private appState: AppState;
  private readonly STORAGE_KEY = "pdfai-app-state";

  private constructor() {
    this.appState = this.loadState();
  }

  public static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager();
    }
    return StorageManager.instance;
  }

  private loadState(): AppState {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        parsed.files =
          parsed.files?.map((file: any) => ({
            ...file,
            lastModified: new Date(file.lastModified),
          })) || [];
        parsed.folders =
          parsed.folders?.map((folder: any) => ({
            ...folder,
            createdAt: new Date(folder.createdAt),
          })) || [];
        return {
          files: parsed.files,
          folders: parsed.folders,
          favorites: parsed.favorites || [],
          recentFiles: parsed.recentFiles || [],
          settings: {
            theme: parsed.settings?.theme || "system",
            autoSave: parsed.settings?.autoSave ?? true,
            defaultZoom: parsed.settings?.defaultZoom || 100,
          },
        };
      }
    } catch (error) {
      console.error("Failed to load app state:", error);
    }

    return {
      files: [],
      folders: [
        {
          id: "recent",
          name: "Recent Documents",
          expanded: true,
          createdAt: new Date(),
        },
        {
          id: "favorites",
          name: "Favorites",
          expanded: true,
          createdAt: new Date(),
        },
      ],
      favorites: [],
      recentFiles: [],
      settings: {
        theme: "system",
        autoSave: true,
        defaultZoom: 100,
      },
    };
  }

  private saveState(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.appState));
    } catch (error) {
      console.error("Failed to save app state:", error);
    }
  }

  // File management methods
  public addFile(file: Omit<PDFFile, "id">): PDFFile {
    const newFile: PDFFile = {
      ...file,
      id: this.generateId(),
    };

    this.appState.files.push(newFile);
    this.addToRecent(newFile.id);
    this.saveState();
    return newFile;
  }

  public removeFile(fileId: string): boolean {
    const index = this.appState.files.findIndex((f) => f.id === fileId);
    if (index === -1) return false;

    this.appState.files.splice(index, 1);
    this.appState.favorites = this.appState.favorites.filter(
      (id) => id !== fileId
    );
    this.appState.recentFiles = this.appState.recentFiles.filter(
      (id) => id !== fileId
    );
    this.saveState();
    return true;
  }

  public getFile(fileId: string): PDFFile | undefined {
    const file = this.appState.files.find((f) => f.id === fileId);
    if (file) {
      return {
        ...file,
        starred: this.appState.favorites.includes(file.id),
      };
    }
    return undefined;
  }

  public getAllFiles(): PDFFile[] {
    return this.appState.files.map((file) => ({
      ...file,
      starred: this.appState.favorites.includes(file.id),
    }));
  }

  public getFilesByFolder(folderId: string): PDFFile[] {
    if (folderId === "recent") {
      return this.getRecentFiles();
    }
    if (folderId === "favorites") {
      return this.getFavoriteFiles();
    }
    return this.appState.files
      .filter((f) => f.folderId === folderId)
      .map((file) => ({
        ...file,
        starred: this.appState.favorites.includes(file.id),
      }));
  }

  // Folder management methods
  public addFolder(name: string, parentId?: string): Folder {
    const newFolder: Folder = {
      id: this.generateId(),
      name,
      expanded: false,
      createdAt: new Date(),
      parentId,
    };

    this.appState.folders.push(newFolder);
    this.saveState();
    return newFolder;
  }

  public removeFolder(folderId: string): boolean {
    // Don't allow removing system folders
    if (folderId === "recent" || folderId === "favorites") return false;

    const index = this.appState.folders.findIndex((f) => f.id === folderId);
    if (index === -1) return false;

    // Move files in this folder to root
    this.appState.files.forEach((file) => {
      if (file.folderId === folderId) {
        file.folderId = undefined;
      }
    });

    this.appState.folders.splice(index, 1);
    this.saveState();
    return true;
  }

  public updateFolder(folderId: string, updates: Partial<Folder>): boolean {
    const folder = this.appState.folders.find((f) => f.id === folderId);
    if (!folder) return false;

    Object.assign(folder, updates);
    this.saveState();
    return true;
  }

  public getAllFolders(): Folder[] {
    return [...this.appState.folders];
  }

  // Favorites management
  public toggleFavorite(fileId: string): boolean {
    const index = this.appState.favorites.indexOf(fileId);
    if (index === -1) {
      this.appState.favorites.push(fileId);
    } else {
      this.appState.favorites.splice(index, 1);
    }

    // Update the file's starred status
    const file = this.getFile(fileId);
    if (file) {
      file.starred = index === -1;
    }

    this.saveState();
    return index === -1;
  }

  public getFavoriteFiles(): PDFFile[] {
    return this.appState.favorites
      .map((id) => this.getFile(id))
      .filter((file): file is PDFFile => file !== undefined);
  }

  // Recent files management
  public addToRecent(fileId: string): void {
    // Remove if already exists
    this.appState.recentFiles = this.appState.recentFiles.filter(
      (id) => id !== fileId
    );
    // Add to beginning
    this.appState.recentFiles.unshift(fileId);
    // Keep only last 20
    this.appState.recentFiles = this.appState.recentFiles.slice(0, 20);
    this.saveState();
  }

  public getRecentFiles(): PDFFile[] {
    return this.appState.recentFiles
      .map((id) => this.getFile(id))
      .filter((file): file is PDFFile => file !== undefined);
  }

  // Settings management
  public updateSettings(settings: Partial<AppState["settings"]>): void {
    Object.assign(this.appState.settings, settings);
    this.saveState();
  }

  public getSettings(): AppState["settings"] {
    return { ...this.appState.settings };
  }

  // Utility methods
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  public exportState(): string {
    return JSON.stringify(this.appState, null, 2);
  }

  public importState(stateJson: string): boolean {
    try {
      const newState = JSON.parse(stateJson);
      this.appState = newState;
      this.saveState();
      return true;
    } catch (error) {
      console.error("Failed to import state:", error);
      return false;
    }
  }

  public clearAllData(): void {
    this.appState = {
      files: [],
      folders: [
        {
          id: "recent",
          name: "Recent Documents",
          expanded: true,
          createdAt: new Date(),
        },
        {
          id: "favorites",
          name: "Favorites",
          expanded: true,
          createdAt: new Date(),
        },
      ],
      favorites: [],
      recentFiles: [],
      settings: {
        theme: "system",
        autoSave: true,
        defaultZoom: 100,
      },
    };
    this.saveState();
  }

  // Cambiar el orden de archivos en una carpeta
  public reorderFilesInFolder(folderId: string, newOrder: string[]): void {
    // newOrder es un array de IDs de archivos en el nuevo orden
    const filesInFolder = this.appState.files.filter(
      (f) => f.folderId === folderId
    );
    const otherFiles = this.appState.files.filter(
      (f) => f.folderId !== folderId
    );
    const reordered = newOrder
      .map((id) => filesInFolder.find((f) => f.id === id))
      .filter((f): f is PDFFile => !!f);
    this.appState.files = [...otherFiles, ...reordered];
    this.saveState();
  }

  // Mover un archivo a otra carpeta
  public moveFileToFolder(fileId: string, targetFolderId?: string): void {
    const file = this.getFile(fileId);
    if (file) {
      file.folderId = targetFolderId;
      this.saveState();
    }
  }

  public updateFile(fileId: string, updates: Partial<PDFFile>): boolean {
    const fileIndex = this.appState.files.findIndex(f => f.id === fileId);
    if (fileIndex === -1) return false;

    Object.assign(this.appState.files[fileIndex], updates);
    this.saveState();
    return true;
  }
}

export const storage = StorageManager.getInstance();
