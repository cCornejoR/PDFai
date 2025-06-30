import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Folder,
  Search,
  Plus,
  ChevronRight,
  Upload,
  FolderPlus,
  ExternalLink,
  Clock,
  Star,
  Trash2,
} from "lucide-react";
import { storage, PDFFile, Folder as FolderType } from "../utils/storage";
import { geminiService } from "../lib/geminiService";
import CreateFolderModal from "./ui/CreateFolderModal";
import DeleteConfirmModal from "./ui/DeleteConfirmModal";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import SortableFile from "./ui/SortableFile";
import DroppableFolder from "./ui/DroppableFolder";
import DroppableRoot from "./ui/DroppableRoot";

interface SidebarProps {
  isVisible?: boolean;
  onToggle?: () => void;
  onFileSelect?: (file: PDFFile) => void;
}

export default function Sidebar({
  isVisible = true,
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

  // Load data from storage on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const storedFolders = storage.getAllFolders();
    const storedFiles = storage.getAllFiles();
    setFolders(storedFolders);
    setFiles(storedFiles);
  };

  const handleFileUpload = async () => {
    setIsLoading(true);
    try {
      const result = await window.electronAPI.selectPdfFile();
      if (result.success && result.file) {
        // Add file without folderId so it goes to Recent Documents only
        const newFile: PDFFile = {
          name: result.file.name,
          path: result.file.path,
          size: result.file.size,
          lastModified: new Date(result.file.lastModified),
          starred: false,
          // Don't set folderId - let it be handled by Recent Documents
        };

        // Process the document for RAG
        console.log(`Processing document for RAG: ${result.file.name}`);
        const processResult = await geminiService.processDocumentForRAG(result.file);
        if (processResult.success) {
          newFile.documentId = processResult.documentId;
          console.log(`✅ Document ${result.file.name} processed for RAG with ID: ${processResult.documentId}`);
        } else {
          console.error(`❌ Failed to process document for RAG: ${processResult.error}`);
        }
        const addedFile = storage.addFile(newFile);

        // Automatically select and load the new file
        handleFileSelect(addedFile);

        // Refresh data
        loadData();

        // Automatically select and load the new file
        handleFileSelect(newFile);
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

    // Set the current document ID for Gemini service
    geminiService.setCurrentDocumentId(file.documentId || null);

    if (onFileSelect) {
      try {
        const result = await window.electronAPI.readPdfFile(file.path);
        if (result.success && result.data) {
          onFileSelect({
            ...file,
            data: result.data,
          } as any);
        }
      } catch (error) {
        console.error("Failed to load PDF:", error);
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
      expanded: !folders.find((f) => f.id === folderId)?.expanded,
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
    const file = files.find((f) => f.id === fileId);
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

      // Clear selection if deleted file was selected
      if (selectedFile === fileToDelete.id) {
        setSelectedFile(null);
        if (onFileSelect) {
          onFileSelect(null as any);
        }
      }

      setFileToDelete(null);
    }
  };

  const handleOpenFileLocation = async (filePath: string) => {
    try {
      await window.electronAPI.openFileLocation(filePath);
    } catch (error) {
      console.error("Failed to open file location:", error);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (date: Date): string => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Today";
    if (diffDays === 2) return "Yesterday";
    if (diffDays <= 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const getFilesForFolder = (folderId: string): PDFFile[] => {
    return storage
      .getFilesByFolder(folderId)
      .filter((file) =>
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
      const fileToMove = files.find((file) => file.id === activeId);
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

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ x: -280, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -280, opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-80 h-full flex flex-col shadow-2xl border-r border-dark-blue-gray/30"
      style={{
        backdropFilter: "blur(30px) saturate(150%)",
        WebkitBackdropFilter: "blur(30px) saturate(150%)",
        backgroundColor: "rgba(30, 31, 35, 0.18)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
        borderRight: "1px solid rgba(124,130,141,0.18)",
      }}
    >
      {/* Header */}
      <div className="p-4 border-b border-dark-blue-gray/30">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-dark-rose font-system">
            Documentos
          </h2>
          <div className="flex space-x-1">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleFileUpload}
              disabled={isLoading}
              className="p-2 rounded-macos-md bg-dark-surface/50 hover:bg-dark-surface/80 text-dark-blue-gray hover:text-dark-rose transition-all duration-200 disabled:opacity-50"
              title="Upload PDF"
            >
              <Upload className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleCreateFolder}
              className="p-2 rounded-macos-md bg-dark-surface/50 hover:bg-dark-surface/80 text-dark-blue-gray hover:text-dark-rose transition-all duration-200"
              title="Create Folder"
            >
              <FolderPlus className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-dark-blue-gray" />
          <input
            type="text"
            placeholder="Buscar documentos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-dark-bg/50 border border-dark-blue-gray/30 rounded-macos-md text-sm text-dark-rose placeholder-dark-blue-gray focus:outline-none focus:ring-2 focus:ring-dark-coral/50 focus:border-dark-coral transition-all duration-200"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-3 border-b border-dark-blue-gray/30">
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: Clock, label: "Recientes", color: "text-blue-400" },
            { icon: Star, label: "Favoritos", color: "text-yellow-400" },
            { icon: Trash2, label: "Papelera", color: "text-red-400" },
          ].map((action, index) => (
            <motion.button
              key={action.label}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="flex flex-col items-center p-3 rounded-macos-md bg-dark-surface/30 hover:bg-dark-surface/60 transition-all duration-200 group"
            >
              <action.icon className={`w-5 h-5 ${action.color} mb-1`} />
              <span className="text-xs text-dark-blue-gray group-hover:text-dark-rose font-medium">
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
          {folders.map((folder) => {
            const folderFiles = getFilesForFolder(folder.id);
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
                        items={folderFiles.map((file) => file.id)}
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
              const recentFileIds = storage.getRecentFiles().map((f) => f.id);
              const favoriteFileIds = storage
                .getFavoriteFiles()
                .map((f) => f.id);
              const orphanFiles = files.filter(
                (file) =>
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
                      items={orphanFiles.map((file) => file.id)}
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
      <div className="p-4 border-t border-dark-blue-gray/30">
        <div className="flex items-center justify-between text-xs text-dark-blue-gray">
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
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDeleteFile}
      />
    </motion.div>
  );
}
