import React from "react";
import { motion } from "framer-motion";
import { useDroppable } from "@dnd-kit/core";
import { Folder, ChevronRight } from "lucide-react";
import { Folder as FolderType } from "../../utils/storage";

interface DroppableFolderProps {
  folder: FolderType;
  fileCount: number;
  onToggle: (folderId: string) => void;
}

const DroppableFolder: React.FC<DroppableFolderProps> = ({
  folder,
  fileCount,
  onToggle,
}) => {
  const { isOver, setNodeRef } = useDroppable({
    id: folder.id,
  });

  return (
    <motion.button
      ref={setNodeRef}
      onClick={() => onToggle(folder.id)}
      className={`w-full flex items-center justify-between p-2 rounded-macos-sm transition-all duration-200 group ${
        isOver
          ? "bg-dark-coral/20 border border-dark-coral/50"
          : "hover:bg-dark-surface/50"
      }`}
      whileHover={{ x: 2 }}
    >
      <div className="flex items-center space-x-2">
        <motion.div
          animate={{ rotate: folder.expanded ? 90 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronRight className="w-4 h-4 text-dark-blue-gray" />
        </motion.div>
        <Folder className={`w-4 h-4 ${isOver ? "text-dark-coral" : "text-dark-coral"}`} />
        <span className="text-sm font-medium text-dark-rose">
          {folder.name}
        </span>
        <span className="text-xs text-dark-blue-gray bg-dark-surface/50 px-2 py-0.5 rounded-full">
          {fileCount}
        </span>
      </div>
    </motion.button>
  );
};

export default DroppableFolder;
