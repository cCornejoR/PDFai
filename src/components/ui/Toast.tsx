import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info" | "warning";
  duration?: number;
  onClose: () => void;
}

export default function Toast({
  message,
  type = "info",
  duration = 3000,
  onClose,
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      default:
        return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case "success":
        return {
          iconBg: "bg-green-500/20",
          accentColor: "border-l-green-400",
        };
      case "error":
        return {
          iconBg: "bg-red-500/20",
          accentColor: "border-l-red-400",
        };
      case "warning":
        return {
          iconBg: "bg-yellow-500/20",
          accentColor: "border-l-yellow-400",
        };
      default:
        return {
          iconBg: "bg-blue-500/20",
          accentColor: "border-l-blue-400",
        };
    }
  };

  const styles = getStyles();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.3 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.5 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="fixed bottom-4 right-4 z-50"
      >
        <div
          className={`
            flex items-center space-x-4 p-4 rounded-2xl border border-dark-blue-gray/30 shadow-2xl backdrop-blur-xl max-w-sm
            bg-dark-surface/80 border-l-4 ${styles.accentColor}
          `}
          style={{
            backdropFilter: "blur(40px) saturate(180%)",
            WebkitBackdropFilter: "blur(40px) saturate(180%)",
          }}
        >
          <div
            className={`w-8 h-8 rounded-xl ${styles.iconBg} flex items-center justify-center flex-shrink-0`}
          >
            {getIcon()}
          </div>
          <p className="text-sm font-medium text-dark-rose flex-1 leading-relaxed">
            {message}
          </p>
          <motion.button
            whileHover={{
              scale: 1.1,
              backgroundColor: "rgba(64, 65, 71, 0.8)",
            }}
            whileTap={{ scale: 0.9 }}
            title="Cerrar notificación"
            onClick={onClose}
            className="p-2 rounded-xl bg-dark-surface/40 hover:bg-dark-surface/70 transition-all duration-200 flex-shrink-0"
          >
            <X className="w-4 h-4 text-dark-blue-gray hover:text-dark-rose" />
          </motion.button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
