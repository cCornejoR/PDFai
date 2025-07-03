import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Upload,
  FolderPlus,
  Clock,
  Star,
  Trash2,
  Key,
  Settings,
  ChevronDown,
  Palette,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";
import {
  storage,
  type PDFFile,
  type Folder as FolderType,
} from "@/utils/storage";
import CreateFolderModal from "@/components/ui/CreateFolderModal";
import ApiKeyModal from "@/components/ui/ApiKeyModal";
import { useApiKey } from "@/lib/hooks/useApiKey";
import { useTheme } from "@/lib/hooks/useTheme";

import ScreenSizeSelector from "@/components/ui/ScreenSizeSelector";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import SortableFile from "@/components/ui/SortableFile";
import DroppableFolder from "@/components/ui/DroppableFolder";
import DroppableRoot from "@/components/ui/DroppableRoot";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";

interface SidebarProps {
  isVisible?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
  onClose?: () => void;
  onFileSelect?: (file: (PDFFile & { data?: string }) | null) => void;
}

export default function Sidebar({
  isVisible = true,
  isOpen = false,
  onClose,
  onFileSelect,
}: SidebarProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [files, setFiles] = useState<PDFFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<PDFFile | null>(null);
  const [folderToDelete, setFolderToDelete] = useState<FolderType | null>(null);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [showConfigDropdown, setShowConfigDropdown] = useState(false);
  const configDropdownRef = useRef<HTMLDivElement>(null);

  // API Key hook
  const { apiKeyStatus, setApiKey } = useApiKey();

  // Theme hook
  const {
    theme: currentTheme,
    setTheme: onThemeChange,
    effectiveTheme,
  } = useTheme();
  const isDark = effectiveTheme === "dark";

  // Screen size hook (removed unused destructured elements)

  // Theme icons
  const themeIcons = {
    light: Sun,
    dark: Moon,
    system: Monitor,
  };

  // Load data from storage on component mount
  useEffect(() => {
    loadData();
  }, []);

  // Click outside to close dropdown - mejorado para evitar conflictos
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      // Verificar si el click fue dentro del dropdown o sus elementos
      if (
        configDropdownRef.current &&
        !configDropdownRef.current.contains(target)
      ) {
        // Verificar que no sea un click en un elemento de tema o configuración
        const isThemeButton = (target as Element)?.closest?.(
          "[data-theme-button]"
        );
        const isConfigElement = (target as Element)?.closest?.(
          "[data-config-element]"
        );

        if (!isThemeButton && !isConfigElement) {
          setShowConfigDropdown(false);
        }
      }
    };

    if (showConfigDropdown) {
      // Usar un pequeño delay para evitar que se cierre inmediatamente
      const timeoutId = setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside);
      }, 100);

      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showConfigDropdown]);

  const loadData = () => {
    const storedFolders = storage.getAllFolders();
    const storedFiles = storage.getAllFiles();

    // Validate and fix file paths
    const validatedFiles = storedFiles.map(file => {
      // If path doesn't include directory separators, it's likely just a filename
      if (!file.path.includes("\\") && !file.path.includes("/")) {
        console.warn(`⚠️ File ${file.name} has invalid path: ${file.path}`);
        // Mark as invalid path - user will need to re-add the file
        return {
          ...file,
          path: `[INVALID] ${file.path}`,
        };
      }
      return file;
    });

    setFolders(storedFolders);
    setFiles(validatedFiles);
  };

  const handleFileUpload = async () => {
    setIsLoading(true);
    try {
      // Use Wails runtime file dialog
      if (window.runtime && window.runtime.OpenFileDialog) {
        const result = await window.runtime.OpenFileDialog({
          Filters: [
            {
              DisplayName: "PDF Files (*.pdf)",
              Pattern: "*.pdf",
            },
          ],
          CanSelectFiles: true,
          CanSelectFolders: false,
          AllowsMultipleSelection: false,
          ShowHiddenFiles: false,
          TreatPackagesAsDirectories: false,
        });

        if (result && result.length > 0) {
          const filePath = result[0];
          const fileName =
            filePath.split("\\").pop() ||
            filePath.split("/").pop() ||
            "Unknown";

          // Open the PDF through Wails backend
          if (window.backend) {
            const openResult = await window.backend.OpenPDFFile(filePath);
            if (
              openResult.success &&
              openResult.content &&
              openResult.fileInfo
            ) {
              const newFile: Omit<PDFFile, "id"> = {
                name: openResult.fileInfo.name || fileName,
                path: filePath,
                size: openResult.fileInfo.textLength || 0,
                lastModified: new Date(),
                starred: false,
                documentId: openResult.documentId,
              };

              const addedFile = storage.addFile(newFile);
              console.log(`📄 File added: ${addedFile.name}`);

              // Refresh data
              loadData();

              // Automatically select and load the new file
              await handleFileSelect(addedFile);
            } else {
              console.error("Failed to open PDF:", openResult.error);
            }
          }
        }
      } else {
        console.warn("Wails runtime not available, using fallback");
        // Fallback for development
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".pdf";
        input.onchange = e => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file) {
            console.log("Selected file:", file.name);
            // In development, just add a mock file
            const newFile: Omit<PDFFile, "id"> = {
              name: file.name,
              path: file.name,
              size: file.size,
              lastModified: new Date(file.lastModified),
              starred: false,
            };
            const addedFile = storage.addFile(newFile);
            loadData();
            handleFileSelect(addedFile);
          }
        };
        input.click();
      }
    } catch (error) {
      console.error("Failed to upload file:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = async (file: PDFFile) => {
    setSelectedFile(file.id);
    storage.addToRecent(file.id);

    if (onFileSelect) {
      try {
        // Use Wails backend to get file info if needed
        if (window.backend && file.path) {
          const result = await window.backend.GetFileInfo(file.path);
          if (result && !result.error) {
            onFileSelect(file as any);

            // Log AI readiness status
            if (file.documentId) {
              console.log(`🤖 AI features ready for: ${file.name}`);
            } else {
              console.log(`⏳ AI features processing for: ${file.name}`);
            }
          }
        } else {
          // Direct selection without backend call
          onFileSelect(file as any);
        }
      } catch (error) {
        console.error("Failed to load PDF:", error);
        // Still allow selection even if backend call fails
        onFileSelect(file as any);
      }
    }
  };

  const handleCreateFolder = () => {
    setIsCreateFolderModalOpen(true);
  };

  const handleSaveFolder = async (folderName: string): Promise<boolean> => {
    try {
      storage.addFolder(folderName);
      setFolders(storage.getAllFolders());
      return true;
    } catch (error) {
      console.error("Error creating folder:", error);
      return false;
    }
  };

  const toggleFolder = (folderId: string) => {
    storage.updateFolder(folderId, {
      expanded: !folders.find(f => f.id === folderId)?.expanded,
    });
    setFolders(storage.getAllFolders());
  };

  const toggleStar = (fileId: string) => {
    console.log(`Toggling star for file: ${fileId}`);
    storage.toggleFavorite(fileId);
    // Refresh all data to ensure consistency
    loadData();
  };

  const handleDeleteFile = (fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (file) {
      setFileToDelete(file);
      setIsDeleteModalOpen(true);
    }
  };

  const confirmDeleteFile = () => {
    if (fileToDelete) {
      console.log(`Deleting file: ${fileToDelete.name}`);
      storage.removeFile(fileToDelete.id);

      // Refresh all data
      loadData();

      // Clear selection if deleted file was selected and if onFileSelect is defined
      if (selectedFile === fileToDelete.id) {
        setSelectedFile(null);
        if (onFileSelect) {
          onFileSelect(null as any);
        }
      }

      setFileToDelete(null);
    }
  };

  const handleDeleteFolder = (folderId: string) => {
    const folder = folders.find(f => f.id === folderId);
    if (folder) {
      setFolderToDelete(folder);
      setIsDeleteModalOpen(true);
    }
  };

  const confirmDeleteFolder = () => {
    if (folderToDelete) {
      console.log(`Deleting folder: ${folderToDelete.name}`);
      storage.deleteFolderWithContents(folderToDelete.id);

      // Refresh all data
      loadData();

      setFolderToDelete(null);
    }
  };

  const handleOpenFileLocation = async (filePath: string) => {
    try {
      // TODO: Implement OpenExternal function in backend
      console.log("Opening file location:", filePath);
      console.warn(
        "La función para abrir la ubicación del archivo no está disponible."
      );
    } catch (error) {
      console.error("Failed to open file location:", error);
    }
  };

  const handleQuickAction = (actionId: string) => {
    const folder = folders.find(f => f.id === actionId);
    if (folder && !folder.expanded) {
      toggleFolder(actionId);
    }
    // Scroll to the section
    const element = document.getElementById(`folder-${actionId}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Removed unused formatDate function

  const getFilesForFolder = (folderId: string): PDFFile[] => {
    return storage
      .getFilesByFolder(folderId)
      .filter(file =>
        file.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
  };

  // Drag and drop functionality
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    console.log(`Moviendo archivo ${activeId} a ${overId}`);

    if (activeId !== overId) {
      const fileToMove = files.find(file => file.id === activeId);
      if (!fileToMove) return;

      // Handle special folders
      if (overId === "recent" || overId === "favorites") {
        console.log(`No se puede mover archivo a carpeta especial: ${overId}`);
        return;
      }

      const targetFolderId = overId === "root" ? undefined : overId;

      // Move the file (this will remove it from its current location)
      storage.moveFileToFolder(activeId, targetFolderId);

      // Refresh all data to ensure consistency
      loadData();

      console.log(`Archivo ${fileToMove.name} movido a carpeta ${overId}`);
    }
  };

  if (!isVisible && !isOpen) return null;

  return (
    <motion.div
      initial={{ x: -280, opacity: 0 }}
      animate={{ x: isOpen ? 0 : -280, opacity: isOpen ? 1 : 0 }}
      exit={{ x: -280, opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`fixed left-0 top-11 flex flex-col shadow-2xl transition-all duration-300 z-50 rounded-r-macos-2xl overflow-hidden ${
        isOpen ? "pointer-events-auto" : "pointer-events-none"
      } w-full sm:w-80 h-[calc(100vh-44px)]`}
      style={{
        background: isDark
          ? "linear-gradient(135deg, rgba(30, 31, 35, 0.95) 0%, rgba(44, 44, 46, 0.9) 50%, rgba(58, 58, 60, 0.85) 100%)"
          : "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(245, 245, 247, 0.9) 50%, rgba(235, 235, 237, 0.85) 100%)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        boxShadow: isDark
          ? "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)"
          : "0 8px 32px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.8)",
        border: isDark
          ? "1px solid rgba(255,255,255,0.15)"
          : "1px solid rgba(0,0,0,0.1)",
        borderLeft: "none",
      }}
    >
      {/* Header */}
      <div
        title="Documentos"
        className="p-4 transition-colors duration-300 rounded-tr-macos-2xl"
        style={{
          borderBottom: isDark
            ? "1px solid rgba(124,130,141,0.3)"
            : "1px solid rgba(255,255,255,0.3)",
          background: isDark
            ? "linear-gradient(135deg, rgba(44, 44, 46, 0.8) 0%, rgba(58, 58, 60, 0.6) 100%)"
            : "linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(245, 245, 247, 0.6) 100%)",
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2
            className={`text-lg font-semibold font-system transition-colors duration-300 ${
              isDark ? "text-white" : "text-gray-900"
            }`}
            style={{
              textShadow: isDark
                ? "0 1px 3px rgba(0,0,0,0.5)"
                : "0 1px 2px rgba(255,255,255,0.8)",
            }}
          >
            Documentos
          </h2>
          <div className="flex space-x-1">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleFileUpload}
              disabled={isLoading}
              className={`p-2 rounded-macos-md transition-all duration-200 disabled:opacity-50 ${
                isDark
                  ? "bg-dark-surface/50 hover:bg-dark-surface/80 text-dark-blue-gray hover:text-dark-rose"
                  : "text-gray-700 hover:text-gray-900 hover:bg-white/40"
              }`}
              style={{
                backgroundColor: isDark ? undefined : "rgba(255,255,255,0.25)",
                backdropFilter: "blur(12px) saturate(150%)",
                WebkitBackdropFilter: "blur(12px) saturate(150%)",
                border: isDark ? undefined : "1px solid rgba(255,255,255,0.3)",
                boxShadow: isDark ? undefined : "0 4px 16px rgba(0,0,0,0.1)",
              }}
              title="Subir PDF"
              type="button"
            >
              <Upload className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleCreateFolder}
              className={`p-2 rounded-macos-md transition-all duration-200 ${
                isDark
                  ? "bg-dark-surface/50 hover:bg-dark-surface/80 text-dark-blue-gray hover:text-dark-rose"
                  : "text-gray-700 hover:text-gray-900 hover:bg-white/40"
              }`}
              style={{
                backgroundColor: isDark ? undefined : "rgba(255,255,255,0.25)",
                backdropFilter: "blur(12px) saturate(150%)",
                WebkitBackdropFilter: "blur(12px) saturate(150%)",
                border: isDark ? undefined : "1px solid rgba(255,255,255,0.3)",
                boxShadow: isDark ? undefined : "0 4px 16px rgba(0,0,0,0.1)",
              }}
              title="Crear carpeta"
              type="button"
            >
              <FolderPlus className="w-4 h-4" />
            </motion.button>
            {onClose && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className={`p-2 rounded-macos-md transition-all duration-200 ${
                  isDark
                    ? "bg-dark-surface/50 hover:bg-dark-surface/80 text-dark-blue-gray hover:text-dark-rose"
                    : "text-gray-700 hover:text-gray-900 hover:bg-white/40"
                }`}
                style={{
                  backgroundColor: isDark
                    ? undefined
                    : "rgba(255,255,255,0.25)",
                  backdropFilter: "blur(12px) saturate(150%)",
                  WebkitBackdropFilter: "blur(12px) saturate(150%)",
                  border: isDark
                    ? undefined
                    : "1px solid rgba(255,255,255,0.3)",
                  boxShadow: isDark ? undefined : "0 4px 16px rgba(0,0,0,0.1)",
                }}
                title="Cerrar"
                type="button"
              >
                <ChevronDown className="w-4 h-4 rotate-90" />
              </motion.button>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search
            className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-colors duration-300 ${
              isDark ? "text-dark-blue-gray" : "text-gray-500"
            }`}
          />
          <input
            type="text"
            placeholder="Buscar documentos..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 rounded-macos-md text-sm transition-all duration-200 focus:outline-none focus:ring-2 ${
              isDark
                ? "bg-dark-bg/50 border border-dark-blue-gray/30 text-dark-rose placeholder-dark-blue-gray focus:ring-dark-coral/50 focus:border-dark-coral"
                : "text-gray-800 placeholder-gray-600 focus:ring-pink-400/50 focus:border-pink-400"
            }`}
            style={
              isDark
                ? {}
                : {
                    backgroundColor: "rgba(255,255,255,0.3)",
                    backdropFilter: "blur(12px) saturate(150%)",
                    WebkitBackdropFilter: "blur(12px) saturate(150%)",
                    border: "1px solid rgba(255,255,255,0.4)",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                  }
            }
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-3 border-b border-dark-blue-gray/30">
        <div className="grid grid-cols-3 gap-2">
          {[
            {
              icon: Clock,
              label: "Recientes",
              color: "text-blue-400",
              id: "recent",
            },
            {
              icon: Star,
              label: "Favoritos",
              color: "text-yellow-400",
              id: "favorites",
            },
            {
              icon: Trash2,
              label: "Papelera",
              color: "text-red-400",
              id: "trash",
            },
          ].map(action => (
            <motion.button
              key={action.label}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleQuickAction(action.id)}
              className={`flex flex-col items-center p-3 rounded-macos-lg transition-all duration-200 group ${
                isDark ? "hover:bg-dark-surface/60" : "hover:bg-white/60"
              }`}
              style={{
                background: isDark
                  ? "linear-gradient(135deg, rgba(44, 44, 46, 0.6) 0%, rgba(58, 58, 60, 0.4) 100%)"
                  : "linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(245,245,247,0.6) 100%)",
                backdropFilter: "blur(12px) saturate(150%)",
                WebkitBackdropFilter: "blur(12px) saturate(150%)",
                border: isDark
                  ? "1px solid rgba(255,255,255,0.15)"
                  : "1px solid rgba(0,0,0,0.1)",
                boxShadow: isDark
                  ? "0 4px 16px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)"
                  : "0 4px 16px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8)",
              }}
            >
              <action.icon className={`w-5 h-5 ${action.color} mb-1`} />
              <span
                className={`text-xs font-medium transition-colors duration-200 ${
                  isDark
                    ? "text-dark-blue-gray group-hover:text-dark-rose"
                    : "text-gray-700 group-hover:text-gray-900"
                }`}
              >
                {action.label}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* File List */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="p-4 space-y-2">
          {/* Built-in folders (Recent and Favorites) */}
          {folders
            .filter(f => f.id === "recent" || f.id === "favorites")
            .map(folder => {
              const folderFiles = getFilesForFolder(folder.id);
              if (folderFiles.length === 0) return null;

              return (
                <div key={folder.id}>
                  {/* Folder Header */}
                  <DroppableFolder
                    folder={folder}
                    fileCount={folderFiles.length}
                    onToggle={toggleFolder}
                  />

                  {/* Files */}
                  <AnimatePresence>
                    {folder.expanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="ml-4 space-y-1 overflow-hidden border-l-2 border-transparent"
                      >
                        <SortableContext
                          items={folderFiles.map(file => file.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          {folderFiles.map((file, index) => (
                            <SortableFile
                              key={file.id}
                              file={file}
                              index={index}
                              isSelected={selectedFile === file.id}
                              onSelect={handleFileSelect}
                              onToggleStar={toggleStar}
                              onDelete={handleDeleteFile}
                              onOpenLocation={handleOpenFileLocation}
                            />
                          ))}
                        </SortableContext>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}

          {/* User created folders */}
          {folders
            .filter(f => f.id !== "recent" && f.id !== "favorites")
            .map(folder => {
              const folderFiles = getFilesForFolder(folder.id);
              return (
                <div key={folder.id} id={`folder-${folder.id}`}>
                  {/* Folder Header */}
                  <DroppableFolder
                    folder={folder}
                    fileCount={folderFiles.length}
                    onToggle={toggleFolder}
                    onDelete={handleDeleteFolder}
                  />

                  {/* Files */}
                  <AnimatePresence>
                    {folder.expanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="ml-4 space-y-1 overflow-hidden border-l-2 border-transparent"
                      >
                        <SortableContext
                          items={folderFiles.map(file => file.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          {folderFiles.map((file, index) => (
                            <SortableFile
                              key={file.id}
                              file={file}
                              index={index}
                              isSelected={selectedFile === file.id}
                              onSelect={handleFileSelect}
                              onToggleStar={toggleStar}
                              onDelete={handleDeleteFile}
                              onOpenLocation={handleOpenFileLocation}
                            />
                          ))}
                        </SortableContext>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}

          {/* Files without folder (root level) - Only show files that are not in recent or favorites */}
          <DroppableRoot>
            {(() => {
              const recentFileIds = storage.getRecentFiles().map(f => f.id);
              const favoriteFileIds = storage.getFavoriteFiles().map(f => f.id);
              const orphanFiles = files.filter(
                file =>
                  !file.folderId &&
                  !recentFileIds.includes(file.id) &&
                  !favoriteFileIds.includes(file.id) &&
                  file.name.toLowerCase().includes(searchTerm.toLowerCase())
              );

              return (
                orphanFiles.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-dark-rose mb-2 px-2">
                      Archivos sin carpeta
                    </h3>
                    <SortableContext
                      items={orphanFiles.map(file => file.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {orphanFiles.map((file, index) => (
                        <SortableFile
                          key={file.id}
                          file={file}
                          index={index}
                          isSelected={selectedFile === file.id}
                          onSelect={handleFileSelect}
                          onToggleStar={toggleStar}
                          onDelete={handleDeleteFile}
                          onOpenLocation={handleOpenFileLocation}
                        />
                      ))}
                    </SortableContext>
                  </div>
                )
              );
            })()}
          </DroppableRoot>
        </div>
      </DndContext>

      {/* Footer */}
      <div
        className={`p-4 space-y-3 transition-colors duration-300 rounded-br-macos-2xl ${
          isDark
            ? "border-t border-dark-blue-gray/30"
            : "border-t border-white/50"
        }`}
        style={{
          background: isDark
            ? "linear-gradient(135deg, rgba(30, 31, 35, 0.8) 0%, rgba(44, 44, 46, 0.6) 100%)"
            : "linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(245, 245, 247, 0.6) 100%)",
        }}
      >
        {/* Configuration and API Key */}
        <div className="space-y-2">
          {/* Configuration Dropdown */}
          <div className="relative" ref={configDropdownRef}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={e => {
                e.stopPropagation();
                console.log(`🔧 Toggle configuración: ${!showConfigDropdown}`);
                setShowConfigDropdown(!showConfigDropdown);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-macos-lg transition-all duration-200 ${
                showConfigDropdown
                  ? isDark
                    ? "text-dark-rose bg-dark-surface/60"
                    : "text-blue-600 bg-blue-50/60"
                  : isDark
                    ? "text-dark-blue-gray hover:text-dark-rose"
                    : "text-gray-600 hover:text-gray-800"
              }`}
              style={{
                background: showConfigDropdown
                  ? isDark
                    ? "linear-gradient(135deg, rgba(58, 58, 60, 0.8) 0%, rgba(72, 72, 74, 0.6) 100%)"
                    : "linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 197, 253, 0.2) 100%)"
                  : isDark
                    ? "linear-gradient(135deg, rgba(44, 44, 46, 0.6) 0%, rgba(58, 58, 60, 0.4) 100%)"
                    : "linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(245,245,247,0.6) 100%)",
                backdropFilter: "blur(12px) saturate(150%)",
                WebkitBackdropFilter: "blur(12px) saturate(150%)",
                border: showConfigDropdown
                  ? isDark
                    ? "1px solid rgba(255,255,255,0.25)"
                    : "1px solid rgba(59, 130, 246, 0.3)"
                  : isDark
                    ? "1px solid rgba(255,255,255,0.15)"
                    : "1px solid rgba(0,0,0,0.1)",
                boxShadow: showConfigDropdown
                  ? isDark
                    ? "0 4px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15)"
                    : "0 4px 16px rgba(59, 130, 246, 0.2), inset 0 1px 0 rgba(255,255,255,0.8)"
                  : isDark
                    ? "0 4px 16px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)"
                    : "0 4px 16px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8)",
              }}
              title="Configuración"
            >
              <div className="flex items-center space-x-2">
                <Settings className="w-4 h-4" />
                <span className="text-xs font-medium">Configuración</span>
              </div>
              <motion.div
                animate={{ rotate: showConfigDropdown ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-3 h-3" />
              </motion.div>
            </motion.button>

            <AnimatePresence>
              {showConfigDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className={`absolute bottom-full left-0 mb-2 w-full backdrop-blur-3xl rounded-macos-lg shadow-2xl p-4 transition-all duration-300 ${
                    isDark
                      ? "border border-dark-blue-gray/50 bg-dark-bg/95"
                      : "border border-gray-300/50 bg-white/95"
                  }`}
                  style={{
                    backdropFilter: "blur(40px) saturate(180%)",
                    WebkitBackdropFilter: "blur(40px) saturate(180%)",
                    zIndex: 10000, // Z-index muy alto para estar por encima de todo
                  }}
                  data-config-element="true"
                  onClick={e => e.stopPropagation()} // Prevenir que se cierre al hacer click dentro
                >
                  {/* Theme Selection */}
                  <div className="space-y-4">
                    <div>
                      <h4
                        className={`text-xs font-semibold mb-2 flex items-center space-x-2 transition-colors duration-300 ${
                          isDark ? "text-white" : "text-gray-800"
                        }`}
                        style={{
                          textShadow: isDark
                            ? "0 1px 3px rgba(0,0,0,0.5)"
                            : "0 1px 2px rgba(255,255,255,0.8)",
                        }}
                      >
                        <Palette className="w-3 h-3" />
                        <span>Tema</span>
                      </h4>
                      <div className="grid grid-cols-3 gap-2">
                        {(["light", "dark", "system"] as const).map(theme => {
                          const Icon = themeIcons[theme];
                          const isSelected = currentTheme === theme;
                          return (
                            <motion.button
                              key={theme}
                              whileHover={{
                                scale: 1.05,
                                y: -1,
                              }}
                              whileTap={{ scale: 0.95 }}
                              transition={{ duration: 0.15, ease: "easeOut" }}
                              onClick={e => {
                                e.stopPropagation();
                                console.log(`🎨 Cambiando tema a: ${theme}`);
                                onThemeChange?.(theme);
                              }}
                              data-theme-button="true"
                              data-config-element="true"
                              className={`flex flex-col items-center space-y-1 p-3 rounded-macos-md transition-all duration-200 cursor-pointer ${
                                isSelected
                                  ? isDark
                                    ? "bg-dark-coral text-dark-rose shadow-lg border border-dark-coral/30"
                                    : "bg-blue-500 text-white shadow-lg border border-blue-500/30"
                                  : isDark
                                    ? "bg-dark-surface/50 text-dark-blue-gray border border-transparent hover:bg-dark-surface hover:text-white hover:border-dark-blue-gray/30"
                                    : "bg-white/30 text-gray-600 border border-transparent hover:text-gray-800 hover:border-gray-300/30 hover:bg-white/50"
                              }`}
                              style={
                                !isDark && !isSelected
                                  ? {
                                      backgroundColor: "rgba(255,255,255,0.3)",
                                      backdropFilter:
                                        "blur(12px) saturate(150%)",
                                      WebkitBackdropFilter:
                                        "blur(12px) saturate(150%)",
                                    }
                                  : {}
                              }
                            >
                              <Icon className="w-4 h-4" />
                              <span className="text-xs font-medium capitalize">
                                {theme === "system" ? "Auto" : theme}
                              </span>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Screen Size Selection */}
                    <div
                      className="border-t border-gray-200/20 pt-3"
                      data-config-element="true"
                    >
                      <ScreenSizeSelector />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* API Key Status */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsApiKeyModalOpen(true)}
            className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
              apiKeyStatus?.hasKey
                ? isDark
                  ? "bg-green-500/20 hover:bg-green-500/30 text-green-400"
                  : "text-green-600 hover:text-green-700 hover:bg-green-100/60"
                : isDark
                  ? "bg-red-500/20 hover:bg-red-500/30 text-red-400"
                  : "text-red-600 hover:text-red-700 hover:bg-red-100/60"
            }`}
            style={
              isDark
                ? {}
                : {
                    backgroundColor: apiKeyStatus?.hasKey
                      ? "rgba(34, 197, 94, 0.15)"
                      : "rgba(239, 68, 68, 0.15)",
                    backdropFilter: "blur(12px) saturate(150%)",
                    WebkitBackdropFilter: "blur(12px) saturate(150%)",
                    border: `1px solid ${
                      apiKeyStatus?.hasKey
                        ? "rgba(34, 197, 94, 0.3)"
                        : "rgba(239, 68, 68, 0.3)"
                    }`,
                    boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                  }
            }
            title={
              apiKeyStatus?.hasKey
                ? "API Key configurada"
                : "Configurar API Key"
            }
          >
            <Key className="w-4 h-4" />
            <span className="text-xs font-medium">
              {apiKeyStatus?.hasKey ? "API Configurada" : "Configurar API"}
            </span>
          </motion.button>
        </div>

        {/* File Stats */}
        <div
          className={`flex items-center justify-between text-xs transition-colors duration-300 ${
            isDark ? "text-dark-blue-gray" : "text-gray-500"
          }`}
        >
          <span>{files.length} archivos</span>
          <span>
            {files.reduce((total, file) => total + file.size, 0) > 0
              ? formatFileSize(
                  files.reduce((total, file) => total + file.size, 0)
                )
              : "0 Bytes"}{" "}
            utilizados
          </span>
        </div>
      </div>

      {/* Create Folder Modal */}
      <CreateFolderModal
        isOpen={isCreateFolderModalOpen}
        onClose={() => setIsCreateFolderModalOpen(false)}
        onSave={handleSaveFolder}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        fileName={fileToDelete?.name || ""}
        folderName={folderToDelete?.name || ""}
        fileCount={
          folderToDelete ? getFilesForFolder(folderToDelete.id).length : 0
        }
        type={folderToDelete ? "folder" : "file"}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setFileToDelete(null);
          setFolderToDelete(null);
        }}
        onConfirm={folderToDelete ? confirmDeleteFolder : confirmDeleteFile}
      />

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onSave={async apiKey => {
          try {
            const success = await setApiKey(apiKey);
            if (success) {
              console.log("✅ API Key saved successfully");
              setIsApiKeyModalOpen(false);
            }
            return success;
          } catch (error) {
            console.error("❌ Error saving API key:", error);
            return false;
          }
        }}
      />
    </motion.div>
  );
}
