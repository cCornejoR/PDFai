import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Minus,
  Square,
  X,
  Settings,
  Info,
  Key,
  FileText,
  MessageCircle,
  Palette,
  Monitor,
  Sun,
  Moon,
  ChevronDown,
  Sparkles,
} from "lucide-react";

interface TitleBarProps {
  title?: string;
  onMenuAction?: (action: string) => void;
  currentTheme?: "light" | "dark" | "system";
  onThemeChange?: (theme: "light" | "dark" | "system") => void;
  onApiKeyConfig?: () => void;
  hasPDFSelected?: boolean;
  chatVisible?: boolean;
}

export default function TitleBar({
  title = "PDFai",
  onMenuAction,
  currentTheme = "system",
  onThemeChange,
  onApiKeyConfig,
  hasPDFSelected = false,
  chatVisible = false,
}: TitleBarProps) {
  const [showMenu, setShowMenu] = useState<string | null>(null);
  const [showConfig, setShowConfig] = useState(false);

  // Detectar sistema operativo para mostrar teclas correctas
  const isMac =
    navigator.platform.toUpperCase().indexOf("MAC") >= 0 ||
    navigator.userAgent.toUpperCase().indexOf("MAC") >= 0;
  const cmdKey = isMac ? "⌘" : "Ctrl+";

  const menuItems = [
    {
      id: "file",
      label: "Archivo",
      items: [
        {
          id: "new",
          label: "Nuevo PDF",
          icon: FileText,
          shortcut: `${cmdKey}N`,
        },
        {
          id: "open",
          label: "Abrir PDF",
          icon: FileText,
          shortcut: `${cmdKey}O`,
        },
      ],
    },
    {
      id: "edit",
      label: "Editar",
      items: [
        { id: "undo", label: "Deshacer", shortcut: `${cmdKey}Z` },
        {
          id: "redo",
          label: "Rehacer",
          shortcut: `${cmdKey}${isMac ? "⇧" : "Shift+"}Z`,
        },
        { type: "separator" },
        { id: "copy", label: "Copiar", shortcut: `${cmdKey}C` },
        { id: "paste", label: "Pegar", shortcut: `${cmdKey}V` },
      ],
    },
    {
      id: "view",
      label: "Vista",
      items: [
        { id: "sidebar", label: "Mostrar Sidebar", shortcut: `${cmdKey}B` },
        { 
          id: "chat", 
          label: hasPDFSelected ? (chatVisible ? "Ocultar Chat" : "Mostrar Chat") : "Panel de Chat (PDF requerido)", 
          shortcut: `${cmdKey}K`,
          disabled: !hasPDFSelected
        },
      ],
    },
    {
      id: "help",
      label: "Ayuda",
      items: [
        { id: "about", label: "Acerca de PDFai", icon: Info },
        {
          id: "shortcuts",
          label: "Atajos de Teclado",
          shortcut: `${cmdKey}O`,
        },
        { id: "support", label: "Soporte", icon: MessageCircle },
      ],
    },
  ];

  const handleMinimize = () => {
    if (window.electronAPI) {
      window.electronAPI.minimizeWindow();
    }
  };

  const handleMaximize = () => {
    if (window.electronAPI) {
      window.electronAPI.maximizeWindow();
    }
  };

  const handleClose = () => {
    if (window.electronAPI) {
      window.electronAPI.closeWindow();
    }
  };

  const themeIcons = {
    light: Sun,
    dark: Moon,
    system: Monitor,
  };

  const ThemeIcon = themeIcons[currentTheme];

  // Manejar atajos de teclado
  useEffect(() => {
    // Función para verificar si el elemento es editable
    const isEditableElement = (element: Element | null): boolean => {
      if (!element) return false;

      const tagName = element.tagName.toLowerCase();
      if (tagName === "input" || tagName === "textarea") return true;

      const isContentEditable =
        element.getAttribute("contenteditable") === "true";
      return isContentEditable;
    };

    // Función para verificar si hay texto seleccionado
    const hasSelectedText = (): boolean => {
      const selection = window.getSelection();
      return selection ? selection.toString().length > 0 : false;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrlOrCmd = isMac ? e.metaKey : e.ctrlKey;
      const target = e.target as Element;

      if (isCtrlOrCmd) {
        switch (e.key.toLowerCase()) {
          case "n":
            e.preventDefault();
            onMenuAction?.("new");
            break;
          case "o":
            e.preventDefault();
            onMenuAction?.("open");
            break;
          case "s":
            e.preventDefault();
            onMenuAction?.("save");
            break;
          case "z":
            // Solo prevenir default en elementos que no son inputs
            if (!isEditableElement(target)) {
              e.preventDefault();
              if (e.shiftKey) {
                onMenuAction?.("redo");
              } else {
                onMenuAction?.("undo");
              }
            }
            break;
          case "c":
            // Solo interceptar si no hay texto seleccionado o no es un elemento editable
            if (!isEditableElement(target) && !hasSelectedText()) {
              e.preventDefault();
              onMenuAction?.("copy");
            }
            // Si hay texto seleccionado o es editable, permitir comportamiento nativo
            break;
          case "v":
            // Solo interceptar si no es un elemento editable
            if (!isEditableElement(target)) {
              e.preventDefault();
              onMenuAction?.("paste");
            }
            // Si es editable, permitir comportamiento nativo
            break;
          case "a":
            // Solo interceptar si no es un elemento editable
            if (!isEditableElement(target)) {
              e.preventDefault();
              onMenuAction?.("select-all");
            }
            break;
          case "f":
            e.preventDefault();
            onMenuAction?.("find");
            break;
          case "b":
            e.preventDefault();
            onMenuAction?.("sidebar");
            break;
          case "k":
            e.preventDefault();
            if (hasPDFSelected) {
              onMenuAction?.("chat");
            } else {
              console.log("📱 Chat shortcut disabled: No PDF selected");
            }
            break;
          case "/":
          case "?":
            if (e.shiftKey || e.key === "?") {
              e.preventDefault();
              onMenuAction?.("shortcuts");
            }
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onMenuAction, isMac]);

  return (
    <div className="fixed top-0 left-0 right-0 z-[999999]">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex items-center justify-between h-11 bg-gradient-to-r from-dark-bg/80 via-dark-surface/80 to-dark-bg/80 backdrop-blur-xl border-b border-dark-blue-gray/30 drag-region shadow-sm"
        style={{
          backdropFilter: "blur(40px) saturate(180%)",
          WebkitBackdropFilter: "blur(40px) saturate(180%)",
        }}
      >
        {/* Menu Bar (lado izquierdo) */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="flex items-center space-x-1 px-4 no-drag"
        >
          {menuItems.map((menu) => (
            <div key={menu.id} className="relative">
              <motion.button
                whileHover={{
                  scale: 1.05,
                }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                onClick={() =>
                  setShowMenu(showMenu === menu.id ? null : menu.id)
                }
                className="px-3 py-1.5 text-sm font-medium text-dark-rose transition-all duration-150 border border-transparent hover:border-dark-blue-gray/30 hover:text-white"
              >
                {menu.label}
              </motion.button>

              <AnimatePresence>
                {showMenu === menu.id && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute top-full left-0 mt-1 w-64 backdrop-blur-3xl rounded-macos-md shadow-2xl border border-dark-blue-gray/50 py-2 z-dropdown"
                    style={{
                      backgroundColor: "rgba(30, 31, 35, 0.95)",
                      backdropFilter: "blur(40px) saturate(180%)",
                      WebkitBackdropFilter: "blur(40px) saturate(180%)",
                      zIndex: 1000000,
                    }}
                  >
                    {menu.items.map((item, index) =>
                      "type" in item && item.type === "separator" ? (
                        <motion.div
                          key={index}
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ delay: index * 0.02 }}
                          className="h-px bg-dark-blue-gray/50 mx-2 my-1"
                        />
                      ) : (
                        <motion.button
                          key={item.id || index}
                          initial={{ x: -10, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{
                            delay: index * 0.03,
                            duration: 0.2,
                            ease: "easeOut",
                          }}
                          onClick={() => {
                            if (item.id && !("disabled" in item && item.disabled)) {
                              onMenuAction?.(item.id);
                              setShowMenu(null);
                            }
                          }}
                          className={`menu-dropdown-item w-full flex items-center justify-between px-4 py-2.5 text-sm rounded-macos-sm mx-1 ${
                            "disabled" in item && item.disabled 
                              ? "text-dark-blue-gray/50 cursor-not-allowed" 
                              : "text-dark-rose cursor-pointer hover:bg-dark-surface/30"
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            {"icon" in item && item.icon && (
                              <item.icon className="w-4 h-4" />
                            )}
                            <span>{item.label}</span>
                          </div>
                          {"shortcut" in item && item.shortcut && (
                            <span className="text-xs text-dark-blue-gray font-mono">
                              {item.shortcut}
                            </span>
                          )}
                        </motion.button>
                      )
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </motion.div>

        {/* Logo y título centrado */}
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="flex items-center space-x-2 absolute left-1/2 transform -translate-x-1/2 no-drag"
        >
          <motion.img
            whileHover={{ scale: 1.05, rotate: 5 }}
            src="/Logo.svg"
            alt="PDFai Logo"
            className="w-6 h-6 rounded-lg shadow-sm"
          />
          <span className="text-sm font-semibold text-dark-rose font-system tracking-wide">
            {title}
          </span>
        </motion.div>

        {/* Controles derecha: Config + Controles nativos */}
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.3 }}
          className="flex items-center space-x-3 px-4 no-drag"
        >
          {/* Config Dropdown */}
          <div className="relative">
            <motion.button
              whileHover={{
                scale: 1.05,
                backgroundColor: "rgba(64, 65, 71, 0.8)",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                borderColor: "rgba(156, 163, 175, 0.5)",
              }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              onClick={() => setShowConfig(!showConfig)}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-macos-sm bg-gradient-to-r from-dark-surface/20 to-dark-bg/20 border border-dark-blue-gray/30 backdrop-blur-sm transition-all duration-150 shadow-lg hover:shadow-xl"
            >
              <Settings className="w-3.5 h-3.5 text-dark-blue-gray" />
              <motion.div
                animate={{ rotate: showConfig ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-3 h-3 text-dark-blue-gray" />
              </motion.div>
            </motion.button>

            <AnimatePresence>
              {showConfig && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute top-full right-0 mt-2 w-80 backdrop-blur-3xl rounded-macos-lg shadow-2xl border border-dark-blue-gray/50 p-1"
                  style={{
                    backgroundColor: "rgba(30, 31, 35, 0.95)",
                    backdropFilter: "blur(40px) saturate(180%)",
                    WebkitBackdropFilter: "blur(40px) saturate(180%)",
                    zIndex: 1000001,
                  }}
                >
                  {/* Header */}
                  <div className="p-4 border-b border-dark-blue-gray/50 bg-dark-surface/30 rounded-t-macos-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-dark-red to-dark-coral rounded-macos flex items-center justify-center shadow-lg">
                        <Sparkles className="w-4 h-4 text-dark-rose" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-dark-rose">
                          Configuración
                        </h3>
                        <p className="text-xs text-dark-blue-gray">
                          Personaliza tu experiencia
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Theme Selection */}
                  <div className="p-3 bg-dark-surface/20">
                    <h4 className="text-xs font-semibold text-dark-blue-gray mb-2 flex items-center space-x-2">
                      <Palette className="w-3 h-3" />
                      <span>Tema</span>
                    </h4>
                    <div className="grid grid-cols-3 gap-2">
                      {(["light", "dark", "system"] as const).map((theme) => {
                        const Icon = themeIcons[theme];
                        return (
                          <motion.button
                            key={theme}
                            whileHover={{
                              scale: 1.05,
                              y: -1,
                              backgroundColor:
                                currentTheme === theme
                                  ? "rgba(220, 38, 127, 0.2)"
                                  : "rgba(64, 65, 71, 0.9)",
                              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
                              borderColor: "rgba(156, 163, 175, 0.4)",
                            }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ duration: 0.15, ease: "easeOut" }}
                            onClick={() => onThemeChange?.(theme)}
                            className={`flex flex-col items-center space-y-1 p-3 rounded-macos-md transition-all duration-150 ${
                              currentTheme === theme
                                ? "bg-gradient-to-br from-dark-red to-dark-coral text-dark-rose shadow-lg border border-dark-coral/30"
                                : "bg-dark-surface/50 text-dark-blue-gray border border-transparent hover:text-white"
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                            <span className="text-xs font-medium capitalize">
                              {theme === "system" ? "Auto" : theme}
                            </span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  {/* API Key */}
                  <div className="p-3 border-t border-dark-blue-gray/50 bg-dark-surface/20">
                    <motion.button
                      whileHover={{
                        scale: 1.02,
                        x: 3,
                        backgroundColor: "rgba(64, 65, 71, 0.9)",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
                        borderColor: "rgba(156, 163, 175, 0.4)",
                      }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      onClick={() => {
                        onApiKeyConfig?.();
                        setShowConfig(false);
                      }}
                      className="w-full flex items-center space-x-3 p-3 rounded-macos-md bg-dark-surface/50 transition-all duration-150 border border-transparent hover:text-white"
                    >
                      <Key className="w-4 h-4 text-dark-blue-gray" />
                      <div className="text-left">
                        <p className="text-sm font-medium text-dark-rose">
                          API Key
                        </p>
                        <p className="text-xs text-dark-blue-gray">
                          Configurar Gemini AI
                        </p>
                      </div>
                    </motion.button>
                  </div>

                  {/* Other Settings */}
                  <div className="p-3 border-t border-dark-blue-gray/50 bg-dark-surface/20">
                    <div className="space-y-2">
                      <motion.button
                        whileHover={{
                          scale: 1.02,
                          x: 3,
                          backgroundColor: "rgba(64, 65, 71, 0.9)",
                          boxShadow: "0 2px 6px rgba(0, 0, 0, 0.15)",
                        }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ duration: 0.12, ease: "easeOut" }}
                        onClick={() => {
                          onMenuAction?.("about");
                          setShowConfig(false);
                        }}
                        className="w-full flex items-center space-x-3 p-2 rounded-macos-sm transition-all duration-120 hover:text-white border border-transparent hover:border-dark-blue-gray/30"
                      >
                        <Info className="w-4 h-4 text-dark-blue-gray" />
                        <span className="text-sm text-dark-rose">
                          Acerca de PDFai
                        </span>
                      </motion.button>
                      <motion.button
                        whileHover={{
                          scale: 1.02,
                          x: 3,
                          backgroundColor: "rgba(64, 65, 71, 0.9)",
                          boxShadow: "0 2px 6px rgba(0, 0, 0, 0.15)",
                        }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ duration: 0.12, ease: "easeOut" }}
                        onClick={() => {
                          onMenuAction?.("support");
                          setShowConfig(false);
                        }}
                        className="w-full flex items-center space-x-3 p-2 rounded-macos-sm transition-all duration-120 hover:text-white border border-transparent hover:border-dark-blue-gray/30"
                      >
                        <MessageCircle className="w-4 h-4 text-dark-blue-gray" />
                        <span className="text-sm text-dark-rose">Soporte</span>
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Controles de ventana estilo macOS (iconos redondeados) */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            className="flex items-center space-x-2"
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleClose}
              className="w-3 h-3 rounded-full bg-gradient-to-br from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 hover:shadow-md transition-all duration-200 group flex items-center justify-center shadow-sm"
              title="Cerrar"
            >
              <X
                size={7}
                className="text-red-900/80 opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleMinimize}
              className="w-3 h-3 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 hover:shadow-md transition-all duration-200 group flex items-center justify-center shadow-sm"
              title="Minimizar"
            >
              <Minus
                size={7}
                className="text-yellow-900/80 opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleMaximize}
              className="w-3 h-3 rounded-full bg-gradient-to-br from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 hover:shadow-md transition-all duration-200 group flex items-center justify-center shadow-sm"
              title="Maximizar"
            >
              <Square
                size={6}
                className="text-green-900/80 opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Overlay para cerrar menús */}
      <AnimatePresence>
        {(showMenu || showConfig) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-dropdown-overlay"
            style={{ zIndex: 999999 }}
            onClick={() => {
              setShowMenu(null);
              setShowConfig(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
