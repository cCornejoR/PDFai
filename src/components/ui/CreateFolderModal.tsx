import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, FolderPlus, Folder } from "lucide-react";

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (folderName: string) => Promise<boolean>;
}

export default function CreateFolderModal({
  isOpen,
  onClose,
  onSave,
}: CreateFolderModalProps) {
  const [folderName, setFolderName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setFolderName("");
      setError("");
    }
  }, [isOpen]);

  const handleSave = async () => {
    const trimmedName = folderName.trim();

    if (!trimmedName) {
      setError("Por favor ingresa un nombre para la carpeta");
      return;
    }

    if (trimmedName.length < 2) {
      setError("El nombre debe tener al menos 2 caracteres");
      return;
    }

    if (trimmedName.length > 50) {
      setError("El nombre no puede tener más de 50 caracteres");
      return;
    }

    // Validar caracteres especiales
    const invalidChars = /[<>:"/\\|?*]/;
    if (invalidChars.test(trimmedName)) {
      setError("El nombre contiene caracteres no válidos");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const success = await onSave(trimmedName);
      if (success) {
        onClose();
      } else {
        setError("Error al crear la carpeta");
      }
    } catch (error) {
      setError("Error al crear la carpeta");
      console.error("Error creating folder:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              className="bg-dark-surface/90 backdrop-blur-xl border border-dark-blue-gray/30 rounded-2xl shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-dark-red to-dark-coral rounded-xl flex items-center justify-center">
                    <FolderPlus className="w-5 h-5 text-dark-rose" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-dark-rose">
                      Crear Nueva Carpeta
                    </h2>
                    <p className="text-sm text-dark-blue-gray">
                      Organiza tus documentos PDF
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  title="Cerrar modal"
                  className="p-2 hover:bg-dark-surface/50 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-dark-blue-gray" />
                </button>
              </div>

              {/* Content */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-dark-rose mb-2">
                    Nombre de la carpeta
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={folderName}
                      onChange={(e) => setFolderName(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder="Mi nueva carpeta"
                      className="w-full px-4 py-3 pl-12 bg-dark-surface/40 border border-dark-blue-gray/30 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-dark-red/50 focus:border-dark-red/50 transition-all duration-200 text-dark-rose placeholder-dark-blue-gray"
                      autoFocus
                    />
                    <Folder className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-dark-blue-gray" />
                  </div>
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3">
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                )}

                <div className="bg-dark-surface/20 border border-dark-blue-gray/20 rounded-xl p-4">
                  <p className="text-sm text-dark-blue-gray mb-2">
                    💡 Consejos para nombrar carpetas:
                  </p>
                  <ul className="text-xs text-dark-blue-gray space-y-1">
                    <li>• Usa nombres descriptivos y claros</li>
                    <li>
                      • Evita caracteres especiales como / \ : * ? " &lt; &gt; |
                    </li>
                    <li>• Máximo 50 caracteres</li>
                  </ul>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-3 bg-dark-surface/40 hover:bg-dark-surface/60 hover:scale-[1.02] hover:shadow-lg text-dark-blue-gray hover:text-dark-rose border border-dark-blue-gray/30 hover:border-dark-blue-gray/50 rounded-xl transition-all duration-150 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isLoading || !folderName.trim()}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-dark-red to-dark-coral hover:from-dark-red/80 hover:to-dark-coral/80 hover:scale-[1.02] hover:shadow-lg hover:shadow-dark-red/30 text-dark-rose rounded-xl transition-all duration-150 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Creando..." : "Crear Carpeta"}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
