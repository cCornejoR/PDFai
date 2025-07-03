import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/lib/hooks/useTheme";
import { useScreenSize } from "@/lib/hooks/useScreenSize";
import AppMenu from "@/components/ui/AppMenu";
import { Menu, Minus, Square, X } from "lucide-react";

// Declare Tauri types for TypeScript
declare global {
  interface Window {
    __TAURI__?: {
      window?: {
        getCurrentWindow: () => any;
      };
      [key: string]: any;
    };
  }
}

// Tauri window management utilities
const getTauriWindow = async (): Promise<any | null> => {
  try {
    if (typeof window !== "undefined" && window.__TAURI__) {
      const { getCurrentWindow } = await import("@tauri-apps/api/window");
      return getCurrentWindow();
    }
    return null;
  } catch (error) {
    console.error("❌ Failed to get Tauri window:", error);
    return null;
  }
};

// Alternative method using window.__TAURI__ directly
const getTauriWindowDirect = (): any | null => {
  try {
    if (
      typeof window !== "undefined" &&
      window.__TAURI__ &&
      window.__TAURI__.window &&
      window.__TAURI__.window.getCurrentWindow
    ) {
      return window.__TAURI__.window.getCurrentWindow();
    }
    return null;
  } catch (error) {
    console.error("❌ Failed to get Tauri window directly:", error);
    return null;
  }
};

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
  const [isMaximized, setIsMaximized] = useState(false);
  const logoRef = useRef<HTMLImageElement>(null);
  const [menuPosition, setMenuPosition] = useState<{
    top: number;
    left: number;
    height: number;
  } | null>(null);

  // Check if window is maximized on mount and listen for changes
  useEffect(() => {
    const initializeAndCheck = async () => {
      console.log("🔍 TitleBar mounted, checking Tauri availability...");
      console.log("window.__TAURI__:", !!window.__TAURI__);

      if (window.__TAURI__) {
        console.log("window.__TAURI__.window:", !!window.__TAURI__.window);
        console.log("Available Tauri APIs:", Object.keys(window.__TAURI__));
      }

      // Try multiple methods to get the window
      let appWindow = await getTauriWindow();
      if (!appWindow) {
        console.log("🔄 Trying direct method...");
        appWindow = getTauriWindowDirect();
      }

      if (appWindow) {
        try {
          console.log("✅ Tauri window obtained, checking maximized state...");
          const maximized = await appWindow.isMaximized();
          setIsMaximized(maximized);
          console.log("📊 Current maximized state:", maximized);
        } catch (error) {
          console.error("❌ Error checking maximized state:", error);
        }
      } else {
        console.warn(
          "⚠️ Could not obtain Tauri window - controls may not work"
        );
      }
    };

    initializeAndCheck();

    // Listen for window resize events to update maximized state
    const handleResize = async () => {
      const appWindow = (await getTauriWindow()) || getTauriWindowDirect();
      if (appWindow) {
        try {
          const maximized = await appWindow.isMaximized();
          setIsMaximized(maximized);
        } catch (error) {
          console.error("❌ Error checking maximized state on resize:", error);
        }
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleMinimize = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      console.log("🔽 Attempting to minimize window...");
      const appWindow = (await getTauriWindow()) || getTauriWindowDirect();

      if (appWindow) {
        await appWindow.minimize();
        console.log("✅ Window minimized successfully");
      } else {
        console.warn("⚠️ Could not get Tauri window for minimize operation");
      }
    } catch (error) {
      console.error("❌ Error minimizing window:", error);
    }
  };

  const handleMaximize = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      console.log("🔄 Attempting to toggle maximize state...");
      const appWindow = (await getTauriWindow()) || getTauriWindowDirect();

      if (appWindow) {
        await appWindow.toggleMaximize();
        // Update maximized state after toggle
        const maximized = await appWindow.isMaximized();
        setIsMaximized(maximized);
        console.log(
          "✅ Window maximize toggled successfully, new state:",
          maximized
        );
      } else {
        console.warn("⚠️ Could not get Tauri window for maximize operation");
      }
    } catch (error) {
      console.error("❌ Error maximizing window:", error);
    }
  };

  const handleClose = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      console.log("🔴 Attempting to close window...");
      const appWindow = (await getTauriWindow()) || getTauriWindowDirect();

      if (appWindow) {
        await appWindow.close();
        console.log("✅ Window closed successfully");
      } else {
        console.warn("⚠️ Could not get Tauri window for close operation");
      }
    } catch (error) {
      console.error("❌ Error closing window:", error);
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

  const handleTitleBarDoubleClick = async (e: React.MouseEvent) => {
    // Double-click on title bar to toggle maximize (macOS behavior)
    await handleMaximize(e);
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
        className="h-11 flex items-center justify-between macos-titlebar theme-transition px-2 sm:px-3 lg:px-4 tauri-drag"
        onDoubleClick={handleTitleBarDoubleClick}
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
            onMouseDown={e => e.stopPropagation()}
            className="group w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors duration-200 shadow-sm tauri-no-drag flex items-center justify-center"
            aria-label="Close"
            title="Close"
            type="button"
          >
            <X className="w-2 h-2 text-red-900 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          </motion.button>
          <motion.button
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={handleMinimize}
            onMouseDown={e => e.stopPropagation()}
            className="group w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-colors duration-200 shadow-sm tauri-no-drag flex items-center justify-center"
            aria-label="Minimize"
            title="Minimize"
            type="button"
          >
            <Minus className="w-2 h-2 text-yellow-900 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          </motion.button>
          <motion.button
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={handleMaximize}
            onMouseDown={e => e.stopPropagation()}
            className="group w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 transition-colors duration-200 shadow-sm tauri-no-drag flex items-center justify-center"
            aria-label={isMaximized ? "Restore" : "Maximize"}
            title={isMaximized ? "Restore" : "Maximize"}
            type="button"
          >
            <Square className="w-1.5 h-1.5 text-green-900 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          </motion.button>
        </motion.div>

        {/* Logo y título centrado */}
        <div className="flex-1 flex justify-center items-center space-x-2">
          <motion.img
            ref={logoRef}
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ duration: 0.2 }}
            src="/appicon.png"
            alt="ChatPDFai Logo"
            className={`rounded-macos-md shadow-sm cursor-pointer tauri-no-drag ${getResponsiveClasses(
              {
                mobile: "w-5 h-5",
                tablet: "w-6 h-6",
                desktop: "w-6 h-6",
              }
            )}`}
            onClick={handleLogoClick}
          />
          <h1
            className={`font-aventi tracking-wide theme-transition select-none ${
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
