import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Key, ExternalLink, Eye, EyeOff } from "lucide-react";
import { validateGeminiApiKey } from "@/lib/utils";
import { useTheme } from "@/lib/hooks/useTheme";
import { useApiKey } from "@/lib/hooks/useApiKey";

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (apiKey: string) => Promise<boolean>;
  currentApiKey?: string;
}

export default function ApiKeyModal({
  isOpen,
  onClose,
  onSave,
}: ApiKeyModalProps) {
  const [apiKey, setApiKey] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { effectiveTheme } = useTheme();
  const { getApiKey } = useApiKey();
  const isDark = effectiveTheme === "dark";

  useEffect(() => {
    if (isOpen) {
      const loadCurrentApiKey = () => {
        try {
          const actualApiKey = getApiKey();
          setApiKey(actualApiKey || "");
        } catch (error) {
          console.error("Error loading API key:", error);
          setApiKey("");
        }
      };

      loadCurrentApiKey();
      setError("");
    }
  }, [isOpen, getApiKey]);

  const handleSave = async () => {
    const trimmedApiKey = apiKey.trim();
    if (!trimmedApiKey) {
      setError("Por favor ingresa una API key");
      return;
    }

    if (!validateGeminiApiKey(trimmedApiKey)) {
      setError(
        "API key inválida. Debe comenzar con 'AIza' y tener al menos 35 caracteres"
      );
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const success = await onSave(trimmedApiKey);
      if (success) {
        onClose();
      } else {
        setError("Error al guardar la API key");
      }
    } catch (error) {
      setError("Error al guardar la API key");
      console.error("Error saving API key:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSave();
    else if (e.key === "Escape") onClose();
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
                    <Key
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
                      Configurar API Key
                    </h2>
                    <p
                      className={`text-sm ${
                        isDark ? "text-dark-blue-gray" : "text-gray-500"
                      }`}
                    >
                      Conecta con Gemini AI
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
                    API Key de Gemini
                  </label>
                  <div className="relative">
                    <input
                      type={isVisible ? "text" : "password"}
                      value={apiKey}
                      onChange={e => setApiKey(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder="AIza..."
                      className={`w-full px-4 py-3 pr-12 text-sm rounded-xl transition-all duration-200 ${
                        isDark
                          ? "bg-dark-surface/40 border-dark-blue-gray/30 text-dark-rose placeholder-dark-blue-gray focus:ring-dark-red/50 focus:border-dark-red/50"
                          : "bg-white/60 border-gray-200/80 text-gray-800 placeholder-gray-400 focus:ring-macos-blue/50 focus:border-macos-blue/50"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setIsVisible(!isVisible)}
                      title={isVisible ? "Ocultar API key" : "Mostrar API key"}
                      className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-lg transition-colors ${
                        isDark
                          ? "hover:bg-dark-surface/40"
                          : "hover:bg-gray-200/50"
                      }`}
                    >
                      {isVisible ? (
                        <EyeOff
                          className={`w-4 h-4 ${
                            isDark ? "text-dark-blue-gray" : "text-gray-400"
                          }`}
                        />
                      ) : (
                        <Eye
                          className={`w-4 h-4 ${
                            isDark ? "text-dark-blue-gray" : "text-gray-400"
                          }`}
                        />
                      )}
                    </button>
                  </div>
                  {error && (
                    <p className="text-sm text-red-400 mt-2">{error}</p>
                  )}
                </div>

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
                    ¿No tienes una API key?
                  </p>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center space-x-2 text-sm transition-colors ${
                      isDark
                        ? "text-dark-red hover:text-dark-coral"
                        : "text-light-accent hover:text-light-accent-hover"
                    }`}
                  >
                    <span>Obtener API key gratis</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              <div className="flex items-center space-x-3 mt-6">
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
                  disabled={isLoading || !apiKey.trim()}
                  className={`flex-1 px-4 py-3 rounded-xl transition-all duration-150 font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
                    isDark
                      ? "bg-gradient-to-r from-dark-red to-dark-coral text-dark-rose hover:shadow-lg hover:shadow-dark-red/30"
                      : "bg-light-accent hover:bg-light-accent-hover text-white hover:shadow-lg hover:shadow-light-accent/30"
                  }`}
                >
                  {isLoading ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
