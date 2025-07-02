import { motion } from "framer-motion";
import { useDroppable } from "@dnd-kit/core";
import {
  ChevronDown,
  Folder,
  FolderOpen,
  Clock,
  Star,
  Trash2,
} from "lucide-react";
import type { Folder as FolderType } from "@/utils/storage";
import { useTheme } from "@/lib/hooks/useTheme";

interface DroppableFolderProps {
  folder: FolderType;
  fileCount: number;
  isExpanded?: boolean;
  onToggle?: (folderId: string) => void;
  onDelete?: (folderId: string) => void;
  children?: React.ReactNode;
}

export default function DroppableFolder({
  folder,
  fileCount,
  isExpanded = false,
  onToggle,
  onDelete,
  children,
}: DroppableFolderProps) {
  const { effectiveTheme } = useTheme();
  const isDark = effectiveTheme === "dark";

  const { isOver, setNodeRef } = useDroppable({
    id: folder.id,
  });

  const handleToggle = () => {
    if (onToggle) {
      onToggle(folder.id);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent folder toggle when clicking delete
    if (onDelete) {
      onDelete(folder.id);
    }
  };

  const isBuiltInFolder = folder.id === "recent" || folder.id === "favorites";

  const getFolderIcon = () => {
    if (folder.id === "recent") {
      return <Clock className="w-4 h-4" />;
    }
    if (folder.id === "favorites") {
      return <Star className="w-4 h-4" />;
    }
    return isExpanded ? (
      <FolderOpen className="w-4 h-4" />
    ) : (
      <Folder className="w-4 h-4" />
    );
  };

  const getFolderColor = () => {
    if (folder.id === "recent") {
      return isDark ? "text-blue-400" : "text-blue-600";
    }
    if (folder.id === "favorites") {
      return isDark ? "text-yellow-400" : "text-yellow-600";
    }
    return isDark ? "text-neutral-400" : "text-neutral-600";
  };

  return (
    <div>
      {/* Folder Header */}
      <motion.div
        ref={setNodeRef}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className={`
          group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200
          ${
            isOver
              ? isDark
                ? "bg-blue-500/20 border-blue-500/50"
                : "bg-blue-100/80 border-blue-300/50"
              : isDark
                ? "hover:bg-neutral-800/50"
                : "hover:bg-neutral-100/60"
          }
          ${isDark ? "border border-transparent" : "border border-transparent"}
        `}
        style={{
          backdropFilter: "blur(8px) saturate(120%)",
          WebkitBackdropFilter: "blur(8px) saturate(120%)",
        }}
        onClick={handleToggle}
      >
        <div className="flex items-center space-x-3 flex-1">
          {/* Expand/Collapse Icon */}
          {!isBuiltInFolder && (
            <motion.div
              animate={{ rotate: isExpanded ? 0 : -90 }}
              transition={{ duration: 0.2 }}
              className={`${isDark ? "text-neutral-500" : "text-neutral-400"}`}
            >
              <ChevronDown className="w-3 h-3" />
            </motion.div>
          )}

          {/* Folder Icon */}
          <div className={getFolderColor()}>{getFolderIcon()}</div>

          {/* Folder Name */}
          <span
            className={`font-medium text-sm ${
              isDark ? "text-neutral-200" : "text-neutral-700"
            }`}
          >
            {folder.name}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* File Count */}
          {fileCount > 0 && (
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                isDark
                  ? "bg-neutral-700/50 text-neutral-400"
                  : "bg-neutral-200/80 text-neutral-600"
              }`}
            >
              {fileCount}
            </span>
          )}

          {/* Delete Button - Only for custom folders */}
          {!isBuiltInFolder && onDelete && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleDelete}
              className={`p-1.5 rounded-md transition-all duration-200 opacity-0 group-hover:opacity-100 ${
                isDark
                  ? "hover:bg-red-500/20 text-neutral-500 hover:text-red-400"
                  : "hover:bg-red-100 text-neutral-400 hover:text-red-600"
              }`}
              title="Eliminar carpeta y contenido"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Folder Contents */}
      {(isExpanded || isBuiltInFolder) && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="ml-6 mt-2 space-y-1"
        >
          {children}
        </motion.div>
      )}
    </div>
  );
}
