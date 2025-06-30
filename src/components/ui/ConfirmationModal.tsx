import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
  isLoading?: boolean;
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  type = "danger",
  isLoading = false,
}: ConfirmationModalProps) {
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  const handleConfirm = () => {
    if (!isLoading) {
      onConfirm();
    }
  };

  const getTypeStyles = () => {
    switch (type) {
      case "danger":
        return {
          iconColor: "text-red-400",
          iconBg: "bg-red-500/20",
          confirmButton:
            "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white",
        };
      case "warning":
        return {
          iconColor: "text-yellow-400",
          iconBg: "bg-yellow-500/20",
          confirmButton:
            "bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white",
        };
      case "info":
        return {
          iconColor: "text-blue-400",
          iconBg: "bg-blue-500/20",
          confirmButton:
            "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white",
        };
    }
  };

  const typeStyles = getTypeStyles();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={handleBackdropClick}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative w-full max-w-md mx-auto bg-dark-surface/80 backdrop-blur-xl border border-dark-blue-gray/30 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-dark-blue-gray/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div
                    className={`w-12 h-12 rounded-xl ${typeStyles.iconBg} flex items-center justify-center`}
                  >
                    <AlertTriangle
                      className={`w-6 h-6 ${typeStyles.iconColor}`}
                    />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-dark-rose">
                      {title}
                    </h2>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="p-2 rounded-xl bg-dark-surface/40 hover:bg-dark-surface/70 hover:scale-110 hover:shadow-md transition-all duration-150 text-dark-blue-gray hover:text-dark-rose disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Cerrar modal"
                  aria-label="Cerrar modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-dark-blue-gray leading-relaxed">{message}</p>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-dark-blue-gray/20 bg-dark-surface/20">
              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 rounded-xl bg-dark-surface/40 hover:bg-dark-surface/70 hover:scale-[1.02] hover:shadow-md text-dark-blue-gray hover:text-white transition-all duration-150 font-medium disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm border border-dark-blue-gray/30 hover:border-dark-blue-gray/50"
                >
                  {cancelText}
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={isLoading}
                  className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg ${typeStyles.confirmButton}`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Eliminando...</span>
                    </div>
                  ) : (
                    confirmText
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
