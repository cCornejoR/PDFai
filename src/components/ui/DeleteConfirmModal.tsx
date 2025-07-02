import { motion, AnimatePresence } from "framer-motion";
import { Trash2, X } from "lucide-react";
import { useTheme } from "@/lib/hooks/useTheme";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  fileName?: string;
  folderName?: string;
  fileCount?: number;
  title?: string;
  message?: string;
  type?: "file" | "folder";
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  fileName,
  folderName,
  fileCount = 0,
  title = "Confirmar eliminación",
  message,
  type = "file",
}: DeleteConfirmModalProps) {
  const { effectiveTheme } = useTheme();
  const isDark = effectiveTheme === "dark";

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const getDefaultMessage = () => {
    if (type === "folder" && folderName) {
      if (fileCount > 0) {
        return `¿Estás seguro de que quieres eliminar la carpeta "${folderName}" y todos sus ${fileCount} archivo${fileCount > 1 ? "s" : ""}? Esta acción no se puede deshacer.`;
      } else {
        return `¿Estás seguro de que quieres eliminar la carpeta "${folderName}"? Esta acción no se puede deshacer.`;
      }
    } else if (fileName) {
      return `¿Estás seguro de que quieres eliminar "${fileName}"? Esta acción no se puede deshacer.`;
    } else {
      return "¿Estás seguro de que quieres eliminar este elemento? Esta acción no se puede deshacer.";
    }
  };

  const defaultMessage = getDefaultMessage();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999]"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 flex items-center justify-center z-[10000] p-4"
          >
            <div
              className={`w-full max-w-md rounded-xl shadow-2xl border ${
                isDark
                  ? "bg-neutral-900/95 border-neutral-700/50"
                  : "bg-white/95 border-neutral-200/50"
              }`}
              style={{
                backdropFilter: "blur(20px) saturate(180%)",
                WebkitBackdropFilter: "blur(20px) saturate(180%)",
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                    <Trash2 className="w-5 h-5 text-red-500" />
                  </div>
                  <h2
                    className={`text-lg font-semibold ${
                      isDark ? "text-neutral-100" : "text-neutral-900"
                    }`}
                  >
                    {title}
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className={`p-2 rounded-lg transition-colors ${
                    isDark
                      ? "hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200"
                      : "hover:bg-neutral-100 text-neutral-500 hover:text-neutral-700"
                  }`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Content */}
              <div className="px-6 pb-6">
                <p
                  className={`text-sm leading-relaxed ${
                    isDark ? "text-neutral-300" : "text-neutral-600"
                  }`}
                >
                  {message || defaultMessage}
                </p>

                {/* Actions */}
                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={onClose}
                    className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                      isDark
                        ? "bg-neutral-800 hover:bg-neutral-700 text-neutral-200"
                        : "bg-neutral-100 hover:bg-neutral-200 text-neutral-700"
                    }`}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleConfirm}
                    className="flex-1 px-4 py-2.5 rounded-lg font-medium bg-red-500 hover:bg-red-600 text-white transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
