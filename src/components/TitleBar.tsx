import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/lib/hooks/useTheme";
import { useScreenSize } from "@/lib/hooks/useScreenSize";
import AppMenu from "@/components/ui/AppMenu";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Menu } from "lucide-react";

interface TitleBarProps {
  title?: string;
  onMenuAction?: (action: string) => void;
  onMenuToggle?: () => void;
}

export default function TitleBar({
  title = "ChatPDFai",
  onMenuAction,
  onMenuToggle,
}: TitleBarProps) {
  const { effectiveTheme } = useTheme();
  const { getResponsiveClasses } = useScreenSize();
  const isDark = effectiveTheme === "dark";
  const [isAppMenuOpen, setIsAppMenuOpen] = useState(false);
  const logoRef = useRef<HTMLImageElement>(null);
  const [menuPosition, setMenuPosition] = useState<{
    top: number;
    left: number;
    height: number;
  } | null>(null);

  const handleMinimize = async () => {
    try {
      if (window.__TAURI__) {
        const appWindow = getCurrentWindow();
        await appWindow.minimize();
      }
    } catch (error) {
      console.error("Error minimizing window:", error);
    }
  };

  const handleMaximize = async () => {
    try {
      if (window.__TAURI__) {
        const appWindow = getCurrentWindow();
        await appWindow.toggleMaximize();
      }
    } catch (error) {
      console.error("Error maximizing window:", error);
    }
  };

  const handleClose = async () => {
    try {
      if (window.__TAURI__) {
        const appWindow = getCurrentWindow();
        await appWindow.close();
      }
    } catch (error) {
      console.error("Error closing window:", error);
    }
  };

  const handleLogoClick = () => {
    if (logoRef.current) {
      const rect = logoRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom,
        left: rect.left,
        height: rect.height,
      });
    }
    setIsAppMenuOpen(!isAppMenuOpen);
  };

  const handleAppMenuAction = (action: string) => {
    setIsAppMenuOpen(false); // Close menu after action
    if (onMenuAction) {
      onMenuAction(action);
    }
  };

  const buttonVariants = {
    hover: { scale: 1.1 },
    tap: { scale: 0.95 },
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-[999999]">
      <motion.div
        initial={{ y: -44, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="h-11 flex items-center justify-between macos-titlebar theme-transition px-2 sm:px-3 lg:px-4"
        data-tauri-drag-region
        style={{
          backdropFilter: "blur(20px) saturate(150%)",
          WebkitBackdropFilter: "blur(20px) saturate(150%)",
          background: isDark
            ? "linear-gradient(180deg, rgba(30, 31, 35, 0.85) 0%, rgba(64, 65, 71, 0.85) 100%)"
            : "linear-gradient(180deg, rgba(255, 255, 255, 0.85) 0%, rgba(248, 249, 250, 0.85) 100%)",
          borderBottom: isDark
            ? "1px solid rgba(255,255,255,0.1)"
            : "1px solid rgba(0,0,0,0.1)",
        }}
      >
        {/* Botones de control estilo macOS */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.3 }}
          className="flex items-center space-x-2 tauri-no-drag"
        >
          <motion.button
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={handleClose}
            className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors duration-200 shadow-sm tauri-no-drag"
            aria-label="Close"
          />
          <motion.button
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={handleMinimize}
            className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-colors duration-200 shadow-sm tauri-no-drag"
            aria-label="Minimize"
          />
          <motion.button
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={handleMaximize}
            className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 transition-colors duration-200 shadow-sm tauri-no-drag"
            aria-label="Maximize"
          />
        </motion.div>

        {/* Logo y título centrado */}
        <div className="flex-1 flex justify-center items-center space-x-2">
          <motion.img
            ref={logoRef}
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ duration: 0.2 }}
            src="/Logo.svg"
            alt="ChatPDFai Logo"
            className={`rounded-macos-md shadow-sm cursor-pointer ${getResponsiveClasses(
              {
                mobile: "w-5 h-5",
                tablet: "w-6 h-6",
                desktop: "w-6 h-6",
              }
            )}`}
            onClick={handleLogoClick}
          />
          <h1
            className={`font-aventi tracking-wide theme-transition ${
              isDark ? "text-white" : "text-gray-900"
            } ${getResponsiveClasses({
              mobile: "text-xs",
              tablet: "text-sm",
              desktop: "text-sm",
            })}`}
            style={{
              textShadow: isDark
                ? "0 1px 3px rgba(0,0,0,0.5)"
                : "0 1px 2px rgba(255,255,255,0.8)",
            }}
          >
            {title}
          </h1>
        </div>

        {/* Botón de menú y versión */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="w-28 flex-shrink-0 flex items-center justify-end space-x-2 tauri-no-drag"
        >
          {onMenuToggle && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onMenuToggle}
              className={`p-1.5 rounded-md transition-all duration-200 ${
                isDark
                  ? "hover:bg-white/10 text-dark-blue-gray hover:text-dark-rose"
                  : "hover:bg-black/10 text-light-text-secondary hover:text-light-text"
              }`}
              title="Abrir menú"
            >
              <Menu className="w-4 h-4" />
            </motion.button>
          )}
          <span
            className={`text-xs font-medium theme-transition ${
              isDark ? "text-gray-300" : "text-gray-600"
            }`}
            style={{
              textShadow: isDark
                ? "0 1px 2px rgba(0,0,0,0.5)"
                : "0 1px 1px rgba(255,255,255,0.8)",
            }}
          >
            v0.1.0
          </span>
        </motion.div>
      </motion.div>
      <AppMenu
        isOpen={isAppMenuOpen}
        onClose={() => setIsAppMenuOpen(false)}
        onAction={handleAppMenuAction}
        position={menuPosition}
      />
    </div>
  );
}
