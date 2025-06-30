import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Key, ExternalLink, Eye, EyeOff, TestTube } from "lucide-react";
import { validateGeminiApiKey, testGeminiConnection } from "../../lib/utils";
import { apiKeyService } from "../../lib/apiKeyService";

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
  currentApiKey = "",
}: ApiKeyModalProps) {
  const [apiKey, setApiKey] = useState(currentApiKey);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      // Load the actual API key (not masked) when modal opens
      const loadCurrentApiKey = async () => {
        try {
          const actualApiKey = apiKeyService.getApiKey();
          if (actualApiKey) {
            setApiKey(actualApiKey);
          } else {
            setApiKey("");
          }
        } catch (error) {
          console.error("Error loading API key:", error);
          setApiKey("");
        }
      };

      loadCurrentApiKey();
      setError("");
    }
  }, [isOpen]);

  const handleSave = async () => {
    if (!apiKey.trim()) {
      setError("Por favor ingresa una API key");
      return;
    }

    if (!validateGeminiApiKey(apiKey.trim())) {
      setError(
        "API key inválida. Debe comenzar con 'AIza' y tener al menos 35 caracteres"
      );
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const success = await onSave(apiKey.trim());
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

  const handleTest = async () => {
    if (!apiKey.trim()) {
      setError("Ingresa una API key para probar");
      return;
    }

    setIsTesting(true);
    setError("");

    try {
      console.log("🧪 Iniciando test de API key...");
      await testGeminiConnection(apiKey.trim());
      setError("");
    } catch (error) {
      console.error("Error en test:", error);
    } finally {
      setIsTesting(false);
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
                    <Key className="w-5 h-5 text-dark-rose" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-dark-rose">
                      Configurar API Key
                    </h2>
                    <p className="text-sm text-dark-blue-gray">
                      Conecta con Gemini AI
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  title="Cerrar modal"
                  className="p-2 rounded-xl bg-dark-surface/40 hover:bg-dark-surface/60 transition-all duration-200"
                >
                  <X className="w-5 h-5 text-dark-blue-gray" />
                </button>
              </div>

              {/* Content */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-dark-rose mb-2">
                    API Key de Gemini
                  </label>
                  <div className="relative">
                    <input
                      type={isVisible ? "text" : "password"}
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder="AIza..."
                      className="w-full px-4 py-3 pr-12 bg-dark-surface/40 border border-dark-blue-gray/30 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-dark-red/50 focus:border-dark-red/50 transition-all duration-200 text-dark-rose placeholder-dark-blue-gray"
                    />
                    <button
                      type="button"
                      onClick={() => setIsVisible(!isVisible)}
                      title={isVisible ? "Ocultar API key" : "Mostrar API key"}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-lg hover:bg-dark-surface/40 transition-colors"
                    >
                      {isVisible ? (
                        <EyeOff className="w-4 h-4 text-dark-blue-gray" />
                      ) : (
                        <Eye className="w-4 h-4 text-dark-blue-gray" />
                      )}
                    </button>
                  </div>
                  {error && (
                    <p className="text-sm text-red-400 mt-2">{error}</p>
                  )}
                </div>

                <div className="bg-dark-surface/20 border border-dark-blue-gray/20 rounded-xl p-4">
                  <p className="text-sm text-dark-blue-gray mb-2">
                    ¿No tienes una API key?
                  </p>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 text-sm text-dark-red hover:text-dark-coral transition-colors"
                  >
                    <span>Obtener API key gratis</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-3 mt-6">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-3 bg-dark-surface/40 hover:bg-dark-surface/70 hover:scale-[1.02] hover:shadow-md text-dark-blue-gray hover:text-white rounded-xl transition-all duration-150 font-medium border border-transparent hover:border-dark-blue-gray/30"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleTest}
                  disabled={isTesting || !apiKey.trim()}
                  title="Probar conexión con Gemini (ver consola para detalles)"
                  className="px-4 py-3 bg-blue-600/20 hover:bg-blue-600/40 hover:scale-[1.02] hover:shadow-lg text-blue-400 hover:text-blue-300 border border-blue-600/30 hover:border-blue-500/50 rounded-xl transition-all duration-150 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <TestTube className="w-4 h-4" />
                  <span>{isTesting ? "..." : "Test"}</span>
                </button>
                <button
                  onClick={handleSave}
                  disabled={isLoading || !apiKey.trim()}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-dark-red to-dark-coral hover:from-dark-red/80 hover:to-dark-coral/80 hover:scale-[1.02] hover:shadow-lg hover:shadow-dark-red/30 text-dark-rose rounded-xl transition-all duration-150 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
