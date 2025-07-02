import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, FolderPlus, Folder } from "lucide-react";
import { useTheme } from "../../lib/hooks/useTheme";

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
  const { effectiveTheme } = useTheme();
  const isDark = effectiveTheme === "dark";

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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              className={`rounded-2xl shadow-2xl max-w-md w-full p-6 backdrop-blur-xl ${
                isDark
                  ? "bg-dark-surface/90 border border-dark-blue-gray/30"
                  : "bg-gradient-to-br from-white/80 to-white/70 border border-white/50"
              }`}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isDark
                        ? "bg-gradient-to-br from-dark-red to-dark-coral"
                        : "bg-light-accent"
                    }`}
                  >
                    <FolderPlus
                      className={`w-5 h-5 ${
                        isDark ? "text-dark-rose" : "text-white"
                      }`}
                    />
                  </div>
                  <div>
                    <h2
                      className={`text-lg font-bold ${
                        isDark ? "text-dark-rose" : "text-gray-800"
                      }`}
                    >
                      Crear Nueva Carpeta
                    </h2>
                    <p
                      className={`text-sm ${
                        isDark ? "text-dark-blue-gray" : "text-gray-500"
                      }`}
                    >
                      Organiza tus documentos PDF
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  title="Cerrar modal"
                  className={`p-2 rounded-lg transition-colors ${
                    isDark ? "hover:bg-dark-surface/50" : "hover:bg-gray-200/50"
                  }`}
                >
                  <X
                    className={`w-5 h-5 ${
                      isDark ? "text-dark-blue-gray" : "text-gray-500"
                    }`}
                  />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      isDark ? "text-dark-rose" : "text-gray-700"
                    }`}
                  >
                    Nombre de la carpeta
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={folderName}
                      onChange={e => setFolderName(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder="Mi nueva carpeta"
                      className={`w-full px-4 py-3 pl-12 text-sm rounded-xl transition-all duration-200 ${
                        isDark
                          ? "bg-dark-surface/40 border-dark-blue-gray/30 text-dark-rose placeholder-dark-blue-gray focus:ring-dark-red/50 focus:border-dark-red/50"
                          : "bg-white/60 border-gray-200/80 text-gray-800 placeholder-gray-400 focus:ring-macos-blue/50 focus:border-macos-blue/50"
                      }`}
                      autoFocus
                    />
                    <Folder
                      className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                        isDark ? "text-dark-blue-gray" : "text-gray-400"
                      }`}
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3">
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                )}

                <div
                  className={`rounded-xl p-4 ${
                    isDark
                      ? "bg-dark-surface/20 border-dark-blue-gray/20"
                      : "bg-gray-100/60 border-gray-200/70"
                  }`}
                >
                  <p
                    className={`text-sm mb-2 ${
                      isDark ? "text-dark-blue-gray" : "text-gray-600"
                    }`}
                  >
                    💡 Consejos para nombrar carpetas:
                  </p>
                  <ul
                    className={`text-xs space-y-1 ${
                      isDark ? "text-dark-blue-gray" : "text-gray-500"
                    }`}
                  >
                    <li>• Usa nombres descriptivos y claros</li>
                    <li>
                      • Evita caracteres especiales como /, \, :, *, ?, ", &lt;,
                      &gt; y |
                    </li>
                    <li>• Máximo 50 caracteres</li>
                  </ul>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className={`flex-1 px-4 py-3 rounded-xl transition-all duration-150 font-medium ${
                    isDark
                      ? "bg-dark-surface/40 hover:bg-dark-surface/60 text-dark-blue-gray hover:text-dark-rose border border-dark-blue-gray/30 hover:border-dark-blue-gray/50"
                      : "bg-white/60 hover:bg-gray-50/80 text-gray-600 hover:text-gray-800 border border-gray-200/80 hover:border-gray-300/80"
                  }`}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isLoading || !folderName.trim()}
                  className={`flex-1 px-4 py-3 rounded-xl transition-all duration-150 font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
                    isDark
                      ? "bg-gradient-to-r from-dark-red to-dark-coral text-dark-rose hover:shadow-lg hover:shadow-dark-red/30"
                      : "bg-light-accent hover:bg-light-accent-hover text-white hover:shadow-lg hover:shadow-light-accent/30"
                  }`}
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
