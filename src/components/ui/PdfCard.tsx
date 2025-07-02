import { motion } from "framer-motion";
import { FileText, Star, Trash2, Eye } from "lucide-react";
import { useTheme } from "@/lib/hooks/useTheme";
import type { PDFFile } from "@/utils/storage";

interface PdfCardProps {
  pdf: PDFFile & { data?: string };
  onSelect?: (pdf: PDFFile & { data?: string }) => void;
  onToggleStar?: (id: string) => void;
  onDelete?: (id: string) => void;
  onPreview?: (pdf: PDFFile & { data?: string }) => void;
  isSelected?: boolean;
  compact?: boolean;
}

export default function PdfCard({
  pdf,
  onSelect,
  onToggleStar,
  onDelete,
  onPreview,
  isSelected = false,
  compact = false,
}: PdfCardProps) {
  const { effectiveTheme } = useTheme();
  const isDark = effectiveTheme === "dark";

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        relative rounded-macos-lg p-4 cursor-pointer transition-all duration-200
        ${isSelected 
          ? isDark 
            ? "bg-gradient-theme-accent border-dark-coral" 
            : "bg-gradient-theme-accent border-light-accent"
          : isDark
            ? "bg-gradient-theme-surface hover:bg-gradient-theme-secondary border-dark-blue-gray/30"
            : "bg-gradient-theme-surface hover:bg-gradient-theme-secondary border-gray-200/50"
        }
        border shadow-sm hover:shadow-md
        ${compact ? "p-3" : "p-4"}
      `}
      style={{
        backdropFilter: "blur(12px) saturate(150%)",
        WebkitBackdropFilter: "blur(12px) saturate(150%)",
      }}
      onClick={() => onSelect?.(pdf)}
    >
      {/* PDF Icon and Title */}
      <div className="flex items-start space-x-3">
        <div
          className={`
            flex-shrink-0 w-10 h-10 rounded-macos-md flex items-center justify-center
            ${isDark 
              ? "bg-gradient-to-br from-dark-red to-dark-coral" 
              : "bg-gradient-to-br from-red-400 to-red-600"
            }
            shadow-sm
          `}
        >
          <FileText 
            className={`w-5 h-5 ${
              isDark ? "text-dark-rose" : "text-white"
            }`} 
          />
        </div>

        <div className="flex-1 min-w-0">
          <h3 
            className={`
              font-bricolage-medium text-sm truncate
              ${isSelected 
                ? "text-white" 
                : isDark 
                  ? "text-dark-rose" 
                  : "text-light-text"
              }
            `}
            title={pdf.name}
          >
            {pdf.name}
          </h3>
          
          {!compact && (
            <div className="flex items-center space-x-2 mt-1">
              <span 
                className={`
                  text-xs
                  ${isSelected 
                    ? "text-white/80" 
                    : isDark 
                      ? "text-dark-blue-gray" 
                      : "text-light-text-secondary"
                  }
                `}
              >
                {formatFileSize(pdf.size)}
              </span>
              <span 
                className={`
                  text-xs
                  ${isSelected 
                    ? "text-white/60" 
                    : isDark 
                      ? "text-dark-blue-gray/70" 
                      : "text-light-text-secondary/70"
                  }
                `}
              >
                {formatDate(pdf.lastModified)}
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-1">
          {onToggleStar && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                onToggleStar(pdf.id);
              }}
              className={`
                p-1.5 rounded-macos-sm transition-colors duration-200
                ${pdf.starred 
                  ? "text-yellow-400 hover:text-yellow-300" 
                  : isDark 
                    ? "text-dark-blue-gray hover:text-dark-rose" 
                    : "text-light-text-secondary hover:text-light-text"
                }
              `}
            >
              <Star className={`w-3.5 h-3.5 ${pdf.starred ? "fill-current" : ""}`} />
            </motion.button>
          )}

          {onPreview && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                onPreview(pdf);
              }}
              className={`
                p-1.5 rounded-macos-sm transition-colors duration-200
                ${isDark 
                  ? "text-dark-blue-gray hover:text-dark-rose" 
                  : "text-light-text-secondary hover:text-light-text"
                }
              `}
            >
              <Eye className="w-3.5 h-3.5" />
            </motion.button>
          )}

          {onDelete && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(pdf.id);
              }}
              className={`
                p-1.5 rounded-macos-sm transition-colors duration-200
                ${isDark 
                  ? "text-dark-blue-gray hover:text-red-400" 
                  : "text-light-text-secondary hover:text-red-500"
                }
              `}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </motion.button>
          )}
        </div>
      </div>

      {/* Selected Indicator */}
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white shadow-sm"
        />
      )}
    </motion.div>
  );
}
