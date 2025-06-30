import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { FolderOpen } from "lucide-react";

interface DroppableRootProps {
  children: React.ReactNode;
}

const DroppableRoot: React.FC<DroppableRootProps> = ({ children }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: "root",
  });

  return (
    <div
      ref={setNodeRef}
      className={`transition-all duration-200 ${
        isOver
          ? "bg-dark-coral/10 border-2 border-dashed border-dark-coral/50 rounded-lg"
          : ""
      }`}
    >
      {isOver && (
        <div className="flex items-center justify-center p-4 text-dark-coral">
          <FolderOpen className="w-5 h-5 mr-2" />
          <span className="text-sm font-medium">Soltar aquí para mover a la carpeta raíz</span>
        </div>
      )}
      {children}
    </div>
  );
};

export default DroppableRoot;
