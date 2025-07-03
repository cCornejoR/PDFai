import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Monitor, Tablet, Smartphone, Check, ChevronDown } from "lucide-react";
import { useScreenSize, type ScreenSize } from "@/lib/hooks/useScreenSize";
import { useTheme } from "@/lib/hooks/useTheme";

interface ScreenSizeSelectorProps {
  className?: string;
}

const getIcon = (size: ScreenSize) => {
  switch (size) {
    case "mobile":
      return Smartphone;
    case "tablet":
      return Tablet;
    case "desktop":
      return Monitor;
    default:
      return Monitor;
  }
};

const getSizeLabel = (size: ScreenSize) => {
  switch (size) {
    case "mobile":
      return "iPhone";
    case "tablet":
      return "Tablet";
    case "desktop":
      return "Desktop";
    default:
      return "Desktop";
  }
};

export default function ScreenSizeSelector({
  className = "",
}: ScreenSizeSelectorProps) {
  const { effectiveTheme } = useTheme();
  const { currentSize, setScreenSize, availableSizes } = useScreenSize();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isDark = effectiveTheme === "dark";

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSizeChange = async (size: ScreenSize) => {
    await setScreenSize(size);
    setIsOpen(false);
  };

  const currentConfig = availableSizes.find(s => s.size === currentSize);
  const CurrentIcon = getIcon(currentSize);

  return (
    <div
      ref={dropdownRef}
      className={`relative ${className}`}
      data-config-element="true"
    >
      <h4
        className={`text-xs font-semibold mb-2 flex items-center space-x-2 transition-colors duration-300 ${
          isDark ? "text-white" : "text-gray-800"
        }`}
        style={{
          textShadow: isDark
            ? "0 1px 3px rgba(0,0,0,0.5)"
            : "0 1px 2px rgba(255,255,255,0.8)",
        }}
        data-config-element="true"
      >
        <Monitor className="w-3 h-3" />
        <span>Tamaño de Pantalla</span>
      </h4>

      {/* Dropdown Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={e => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        data-config-element="true"
        className={`
          w-full flex items-center justify-between p-2 rounded-macos-md transition-all duration-200
          ${
            isDark
              ? "bg-neutral-800/50 border-neutral-700/50 hover:bg-neutral-700/50 text-white"
              : "bg-neutral-100/60 border-neutral-200/50 hover:bg-neutral-200/60 text-gray-900"
          }
          border
        `}
        style={{
          backdropFilter: "blur(8px) saturate(120%)",
          WebkitBackdropFilter: "blur(8px) saturate(120%)",
        }}
      >
        <div className="flex items-center space-x-2">
          <div
            className={`
              w-6 h-6 rounded-macos-sm flex items-center justify-center
              ${
                isDark
                  ? "bg-blue-600/20 text-blue-400"
                  : "bg-blue-100/80 text-blue-600"
              }
            `}
          >
            <CurrentIcon className="w-3 h-3" />
          </div>
          <div className="text-left">
            <div className="text-xs font-medium">
              {getSizeLabel(currentSize)}
            </div>
            <div
              className={`text-xs ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {currentConfig?.width} × {currentConfig?.height}
            </div>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-3 h-3" />
        </motion.div>
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={`
              absolute top-full left-0 right-0 mt-1 rounded-macos-lg border shadow-xl z-50
              ${
                isDark
                  ? "bg-neutral-900/95 border-neutral-700/50"
                  : "bg-white/95 border-neutral-200/50"
              }
            `}
            style={{
              backdropFilter: "blur(20px) saturate(150%)",
              WebkitBackdropFilter: "blur(20px) saturate(150%)",
              zIndex: 10001, // Z-index alto para estar por encima del dropdown de configuración
            }}
            data-config-element="true"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-1">
              {availableSizes.map((config, index) => {
                const Icon = getIcon(config.size);
                const isSelected = currentSize === config.size;

                return (
                  <motion.button
                    key={config.size}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={e => {
                      e.stopPropagation();
                      handleSizeChange(config.size);
                    }}
                    data-config-element="true"
                    className={`
                      w-full flex items-center space-x-2 p-2 rounded-macos-sm transition-all duration-150
                      ${
                        isSelected
                          ? isDark
                            ? "bg-blue-600/20 text-blue-400"
                            : "bg-blue-100/80 text-blue-600"
                          : isDark
                            ? "hover:bg-neutral-800/50 text-gray-300 hover:text-white"
                            : "hover:bg-neutral-100/60 text-gray-700 hover:text-gray-900"
                      }
                      ${index > 0 ? "mt-0.5" : ""}
                    `}
                  >
                    <div
                      className={`
                        w-5 h-5 rounded-macos-sm flex items-center justify-center flex-shrink-0
                        ${
                          isSelected
                            ? isDark
                              ? "bg-blue-600/30"
                              : "bg-blue-200/80"
                            : isDark
                              ? "bg-neutral-700/50"
                              : "bg-neutral-200/60"
                        }
                      `}
                    >
                      <Icon className="w-3 h-3" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-xs font-medium">{config.label}</div>
                      <div
                        className={`text-xs ${
                          isDark ? "text-gray-500" : "text-gray-500"
                        }`}
                      >
                        {config.width} × {config.height}
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="w-3 h-3 text-blue-500 flex-shrink-0" />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
