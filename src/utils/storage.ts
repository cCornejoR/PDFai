// Storage utility for managing PDF files and folders
export interface PDFFile {
  id: string;
  name: string;
  path: string;
  size: number;
  lastModified: Date;
  starred: boolean;
  folderId?: string;
  documentId?: string;
}

export interface Folder {
  id: string;
  name: string;
  expanded: boolean;
  createdAt: Date;
}

const STORAGE_KEYS = {
  FILES: "pdf-files",
  FOLDERS: "pdf-folders",
  RECENT: "recent-files",
  FAVORITES: "favorite-files",
} as const;

class StorageService {
  // File management
  getAllFiles(): PDFFile[] {
    try {
      const files = localStorage.getItem(STORAGE_KEYS.FILES);
      return files
        ? JSON.parse(files).map((file: any) => ({
            ...file,
            lastModified: new Date(file.lastModified),
          }))
        : [];
    } catch (error) {
      console.error("Error loading files:", error);
      return [];
    }
  }

  addFile(file: Omit<PDFFile, "id">): PDFFile {
    const newFile: PDFFile = {
      ...file,
      id: crypto.randomUUID(),
    };

    const files = this.getAllFiles();
    files.push(newFile);
    localStorage.setItem(STORAGE_KEYS.FILES, JSON.stringify(files));

    return newFile;
  }

  removeFile(fileId: string): void {
    const files = this.getAllFiles().filter(file => file.id !== fileId);
    localStorage.setItem(STORAGE_KEYS.FILES, JSON.stringify(files));

    // Also remove from recent and favorites
    this.removeFromRecent(fileId);
    this.removeFromFavorites(fileId);
  }

  updateFile(fileId: string, updates: Partial<PDFFile>): void {
    const files = this.getAllFiles().map(file =>
      file.id === fileId ? { ...file, ...updates } : file
    );
    localStorage.setItem(STORAGE_KEYS.FILES, JSON.stringify(files));
  }

  // Folder management
  getAllFolders(): Folder[] {
    try {
      const folders = localStorage.getItem(STORAGE_KEYS.FOLDERS);
      const parsed = folders ? JSON.parse(folders) : [];

      // Ensure default folders exist
      const defaultFolders = [
        {
          id: "recent",
          name: "Recientes",
          expanded: true,
          createdAt: new Date(),
        },
        {
          id: "favorites",
          name: "Favoritos",
          expanded: true,
          createdAt: new Date(),
        },
      ];

      const existingIds = parsed.map((f: Folder) => f.id);
      const missingDefaults = defaultFolders.filter(
        df => !existingIds.includes(df.id)
      );

      return [
        ...missingDefaults,
        ...parsed.map((folder: any) => ({
          ...folder,
          createdAt: new Date(folder.createdAt),
        })),
      ];
    } catch (error) {
      console.error("Error loading folders:", error);
      return [
        {
          id: "recent",
          name: "Recientes",
          expanded: true,
          createdAt: new Date(),
        },
        {
          id: "favorites",
          name: "Favoritos",
          expanded: true,
          createdAt: new Date(),
        },
      ];
    }
  }

  addFolder(name: string): Folder {
    const newFolder: Folder = {
      id: crypto.randomUUID(),
      name,
      expanded: true,
      createdAt: new Date(),
    };

    const folders = this.getAllFolders().filter(
      f => f.id !== "recent" && f.id !== "favorites"
    );
    folders.push(newFolder);
    localStorage.setItem(STORAGE_KEYS.FOLDERS, JSON.stringify(folders));

    return newFolder;
  }

  updateFolder(folderId: string, updates: Partial<Folder>): void {
    const folders = this.getAllFolders().map(folder =>
      folder.id === folderId ? { ...folder, ...updates } : folder
    );
    const customFolders = folders.filter(
      f => f.id !== "recent" && f.id !== "favorites"
    );
    localStorage.setItem(STORAGE_KEYS.FOLDERS, JSON.stringify(customFolders));
  }

  deleteFolder(folderId: string): void {
    // Don't allow deletion of built-in folders
    if (folderId === "recent" || folderId === "favorites") {
      return;
    }

    const folders = this.getAllFolders().filter(f => f.id !== folderId);
    const customFolders = folders.filter(
      f => f.id !== "recent" && f.id !== "favorites"
    );
    localStorage.setItem(STORAGE_KEYS.FOLDERS, JSON.stringify(customFolders));
  }

  deleteFolderWithContents(folderId: string): void {
    // Don't allow deletion of built-in folders
    if (folderId === "recent" || folderId === "favorites") {
      return;
    }

    // Get all files in this folder
    const folderFiles = this.getFilesByFolder(folderId);

    // Delete all files in the folder
    folderFiles.forEach(file => {
      this.removeFile(file.id);
    });

    // Delete the folder itself
    this.deleteFolder(folderId);
  }

  // File organization
  getFilesByFolder(folderId: string): PDFFile[] {
    const files = this.getAllFiles();

    if (folderId === "recent") {
      return this.getRecentFiles();
    }

    if (folderId === "favorites") {
      return this.getFavoriteFiles();
    }

    return files.filter(file => file.folderId === folderId);
  }

  moveFileToFolder(fileId: string, folderId?: string): void {
    this.updateFile(fileId, { folderId });
  }

  // Recent files
  getRecentFiles(): PDFFile[] {
    try {
      const recent = localStorage.getItem(STORAGE_KEYS.RECENT);
      const recentIds = recent ? JSON.parse(recent) : [];
      const files = this.getAllFiles();

      return recentIds
        .map((id: string) => files.find(file => file.id === id))
        .filter(Boolean)
        .slice(0, 10); // Limit to 10 recent files
    } catch (error) {
      console.error("Error loading recent files:", error);
      return [];
    }
  }

  addToRecent(fileId: string): void {
    try {
      const recent = localStorage.getItem(STORAGE_KEYS.RECENT);
      let recentIds = recent ? JSON.parse(recent) : [];

      // Remove if already exists
      recentIds = recentIds.filter((id: string) => id !== fileId);

      // Add to beginning
      recentIds.unshift(fileId);

      // Limit to 10
      recentIds = recentIds.slice(0, 10);

      localStorage.setItem(STORAGE_KEYS.RECENT, JSON.stringify(recentIds));
    } catch (error) {
      console.error("Error adding to recent:", error);
    }
  }

  removeFromRecent(fileId: string): void {
    try {
      const recent = localStorage.getItem(STORAGE_KEYS.RECENT);
      const recentIds = recent ? JSON.parse(recent) : [];
      const filtered = recentIds.filter((id: string) => id !== fileId);
      localStorage.setItem(STORAGE_KEYS.RECENT, JSON.stringify(filtered));
    } catch (error) {
      console.error("Error removing from recent:", error);
    }
  }

  // Favorite files
  getFavoriteFiles(): PDFFile[] {
    try {
      const favorites = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      const favoriteIds = favorites ? JSON.parse(favorites) : [];
      const files = this.getAllFiles();

      return favoriteIds
        .map((id: string) => files.find(file => file.id === id))
        .filter(Boolean);
    } catch (error) {
      console.error("Error loading favorite files:", error);
      return [];
    }
  }

  toggleFavorite(fileId: string): void {
    try {
      const favorites = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      let favoriteIds = favorites ? JSON.parse(favorites) : [];

      if (favoriteIds.includes(fileId)) {
        favoriteIds = favoriteIds.filter((id: string) => id !== fileId);
        this.updateFile(fileId, { starred: false });
      } else {
        favoriteIds.push(fileId);
        this.updateFile(fileId, { starred: true });
      }

      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favoriteIds));
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  }

  removeFromFavorites(fileId: string): void {
    try {
      const favorites = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      const favoriteIds = favorites ? JSON.parse(favorites) : [];
      const filtered = favoriteIds.filter((id: string) => id !== fileId);
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(filtered));
      this.updateFile(fileId, { starred: false });
    } catch (error) {
      console.error("Error removing from favorites:", error);
    }
  }

  // Clear all data
  clearAll(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }
}

export const storage = new StorageService();
