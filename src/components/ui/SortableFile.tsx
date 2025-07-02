import { motion } from "framer-motion";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  FileText,
  Star,
  ExternalLink,
  Trash2,
  Clock,
  Bot,
  Loader,
} from "lucide-react";
import type { PDFFile } from "@/utils/storage";

interface SortableFileProps {
  file: PDFFile;
  index: number;
  isSelected: boolean;
  onSelect: (file: PDFFile) => void;
  onToggleStar: (fileId: string) => void;
  onDelete: (fileId: string) => void;
  onOpenLocation: (filePath: string) => void;
}

export default function SortableFile({
  file,
  index,
  isSelected,
  onSelect,
  onToggleStar,
  onDelete,
  onOpenLocation,
}: SortableFileProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: file.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
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

    if (diffDays === 0) {
      return "Hoy";
    } else if (diffDays === 1) {
      return "Ayer";
    } else if (diffDays < 7) {
      return `Hace ${diffDays} días`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <motion.div
      ref={setNodeRef}
      {...attributes}
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: index * 0.05 }}
      className={`group p-3 rounded-macos-md cursor-pointer transition-all duration-200 ${
        isSelected
          ? "bg-dark-coral/20 border border-dark-coral/50"
          : "hover:bg-dark-surface/40 border border-transparent"
      } ${
        isDragging
          ? "ring-2 ring-dark-coral bg-dark-coral/30 scale-105 z-10"
          : ""
      }`}
      style={{
        ...style,
        boxShadow: isDragging
          ? "0 4px 16px 0 rgba(255,107,107,0.15)"
          : undefined,
      }}
    >
      <div className="flex items-start justify-between">
        {/* File info - clickable area (separated from drag handle) */}
        <div className="flex items-start space-x-3 flex-1 min-w-0">
          {/* Drag handle - separate from click area */}
          <div
            {...listeners}
            className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center flex-shrink-0 cursor-grab active:cursor-grabbing"
            title="Drag to move file"
          >
            <FileText className="w-4 h-4 text-white" />
          </div>

          {/* File info - clickable area */}
          <div
            onClick={e => {
              e.stopPropagation();
              if (file.path.startsWith("[INVALID]")) {
                console.warn(
                  `⚠️ Cannot open file with invalid path: ${file.name}`
                );
                return;
              }
              console.log(`🖱️ File clicked: ${file.name}`);
              onSelect(file);
            }}
            className={`flex-1 min-w-0 cursor-pointer hover:bg-dark-surface/20 rounded-md p-1 -m-1 transition-colors ${
              file.path.startsWith("[INVALID]") ? "opacity-50" : ""
            }`}
          >
            <h4 className="text-sm font-medium text-dark-rose truncate group-hover:text-white transition-colors">
              {file.name}
            </h4>
            <div className="flex items-center space-x-3 mt-1">
              <span className="text-xs text-dark-blue-gray">
                {formatFileSize(file.size)}
              </span>
              <span className="text-xs text-dark-blue-gray flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{formatDate(file.lastModified)}</span>
              </span>
              {/* Status Indicator */}
              {file.path.startsWith("[INVALID]") ? (
                <span
                  className="text-xs text-red-400 flex items-center space-x-1"
                  title="Invalid file path - please re-add this file"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Ruta Inválida</span>
                </span>
              ) : file.documentId ? (
                <span
                  className="text-xs text-green-400 flex items-center space-x-1"
                  title="AI features ready"
                >
                  <Bot className="w-3 h-3" />
                  <span>IA Lista</span>
                </span>
              ) : (
                <span
                  className="text-xs text-yellow-400 flex items-center space-x-1"
                  title="Processing for AI features"
                >
                  <Loader className="w-3 h-3 animate-spin" />
                  <span>Procesando</span>
                </span>
              )}
            </div>
          </div>
        </div>
        {/* Action buttons - separate from drag area */}
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity relative z-10">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onMouseDown={e => e.stopPropagation()}
            onPointerDown={e => e.stopPropagation()}
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              console.log("Star button clicked for file:", file.id);
              onToggleStar(file.id);
            }}
            className={`p-2 rounded-md transition-colors cursor-pointer ${
              file.starred
                ? "text-yellow-400 hover:text-yellow-300 bg-yellow-400/10"
                : "text-dark-blue-gray hover:text-yellow-400 hover:bg-yellow-400/10"
            }`}
            title={file.starred ? "Remove from favorites" : "Add to favorites"}
          >
            <Star className={`w-3 h-3 ${file.starred ? "fill-current" : ""}`} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onMouseDown={e => e.stopPropagation()}
            onPointerDown={e => e.stopPropagation()}
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              console.log("Open location button clicked for file:", file.path);
              onOpenLocation(file.path);
            }}
            className="p-2 rounded-md text-dark-blue-gray hover:text-dark-rose hover:bg-dark-rose/10 transition-colors cursor-pointer"
            title="Open file location"
          >
            <ExternalLink className="w-3 h-3" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onMouseDown={e => e.stopPropagation()}
            onPointerDown={e => e.stopPropagation()}
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              console.log("Delete button clicked for file:", file.id);
              onDelete(file.id);
            }}
            className="p-2 rounded-md text-dark-blue-gray hover:text-red-400 hover:bg-red-400/10 transition-colors cursor-pointer"
            title="Delete file"
          >
            <Trash2 className="w-3 h-3" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
