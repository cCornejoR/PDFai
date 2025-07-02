import { useDroppable } from "@dnd-kit/core";
import { useTheme } from "@/lib/hooks/useTheme";

interface DroppableRootProps {
  children: React.ReactNode;
}

export default function DroppableRoot({ children }: DroppableRootProps) {
  const { effectiveTheme } = useTheme();
  const isDark = effectiveTheme === "dark";

  const { isOver, setNodeRef } = useDroppable({
    id: "root",
  });

  return (
    <div
      ref={setNodeRef}
      className={`
        transition-all duration-200 rounded-lg p-2
        ${
          isOver
            ? isDark
              ? "bg-blue-500/10 border-blue-500/30"
              : "bg-blue-100/50 border-blue-300/30"
            : "border-transparent"
        }
        border-2 border-dashed
      `}
    >
      {children}
    </div>
  );
}
