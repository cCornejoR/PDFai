import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Download, 
  ChevronLeft, 
  ChevronRight,
  FileText,
  Maximize2,
  Minimize2
} from "lucide-react";
import { useTheme } from "@/lib/hooks/useTheme";
import type { PDFFile } from "@/utils/storage";

interface PdfViewerProps {
  pdf: PDFFile & { data?: string } | null;
  onClose?: () => void;
  className?: string;
}

export default function PdfViewer({ pdf, onClose, className = "" }: PdfViewerProps) {
  const { effectiveTheme } = useTheme();
  const isDark = effectiveTheme === "dark";
  
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [totalPages, setTotalPages] = useState(1);

  // Reset state when PDF changes
  useEffect(() => {
    if (pdf) {
      setCurrentPage(1);
      setZoom(100);
      setRotation(0);
      setIsFullscreen(false);
      // In a real implementation, you would extract the total pages from the PDF
      setTotalPages(1); // Placeholder
    }
  }, [pdf]);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 300));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 25));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const handleDownload = () => {
    if (pdf?.path) {
      // In a real implementation, you would trigger a download
      console.log("Downloading PDF:", pdf.name);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (!pdf) {
    return (
      <div 
        className={`
          flex items-center justify-center h-full rounded-macos-lg border-2 border-dashed
          ${isDark 
            ? "border-dark-blue-gray/30 bg-gradient-dark-surface" 
            : "border-gray-300/50 bg-gradient-light-surface"
          }
          ${className}
        `}
      >
        <div className="text-center space-y-4">
          <FileText 
            className={`w-16 h-16 mx-auto ${
              isDark ? "text-dark-blue-gray" : "text-gray-400"
            }`} 
          />
          <div>
            <h3 className={`text-lg font-bricolage-semibold ${
              isDark ? "text-dark-rose" : "text-light-text"
            }`}>
              Selecciona un PDF
            </h3>
            <p className={`text-sm ${
              isDark ? "text-dark-blue-gray" : "text-light-text-secondary"
            }`}>
              Elige un archivo desde la barra lateral para comenzar
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className={`
        flex flex-col h-full rounded-macos-lg overflow-hidden
        ${isDark ? "bg-gradient-dark-surface" : "bg-gradient-light-surface"}
        border shadow-lg
        ${isDark ? "border-dark-blue-gray/30" : "border-gray-200/50"}
        ${className}
      `}
    >
      {/* Toolbar */}
      <div 
        className={`
          flex items-center justify-between p-4 border-b
          ${isDark ? "border-dark-blue-gray/30" : "border-gray-200/50"}
        `}
      >
        <div className="flex items-center space-x-3">
          <div
            className={`
              w-8 h-8 rounded-macos-md flex items-center justify-center
              ${isDark 
                ? "bg-gradient-to-br from-dark-red to-dark-coral" 
                : "bg-gradient-to-br from-red-400 to-red-600"
              }
              shadow-sm
            `}
          >
            <FileText 
              className={`w-4 h-4 ${
                isDark ? "text-dark-rose" : "text-white"
              }`} 
            />
          </div>
          <div>
            <h3 className={`font-bricolage-semibold text-sm ${
              isDark ? "text-dark-rose" : "text-light-text"
            }`}>
              {pdf.name}
            </h3>
            <p className={`text-xs ${
              isDark ? "text-dark-blue-gray" : "text-light-text-secondary"
            }`}>
              Página {currentPage} de {totalPages}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-2">
          {/* Zoom Controls */}
          <div className="flex items-center space-x-1">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleZoomOut}
              className={`
                p-2 rounded-macos-sm transition-colors duration-200
                ${isDark 
                  ? "text-dark-blue-gray hover:text-dark-rose hover:bg-dark-surface/50" 
                  : "text-light-text-secondary hover:text-light-text hover:bg-gray-100/50"
                }
              `}
            >
              <ZoomOut className="w-4 h-4" />
            </motion.button>
            
            <span className={`text-xs font-medium px-2 ${
              isDark ? "text-dark-blue-gray" : "text-light-text-secondary"
            }`}>
              {zoom}%
            </span>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleZoomIn}
              className={`
                p-2 rounded-macos-sm transition-colors duration-200
                ${isDark 
                  ? "text-dark-blue-gray hover:text-dark-rose hover:bg-dark-surface/50" 
                  : "text-light-text-secondary hover:text-light-text hover:bg-gray-100/50"
                }
              `}
            >
              <ZoomIn className="w-4 h-4" />
            </motion.button>
          </div>

          {/* Page Navigation */}
          <div className="flex items-center space-x-1">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className={`
                p-2 rounded-macos-sm transition-colors duration-200 disabled:opacity-50
                ${isDark 
                  ? "text-dark-blue-gray hover:text-dark-rose hover:bg-dark-surface/50" 
                  : "text-light-text-secondary hover:text-light-text hover:bg-gray-100/50"
                }
              `}
            >
              <ChevronLeft className="w-4 h-4" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`
                p-2 rounded-macos-sm transition-colors duration-200 disabled:opacity-50
                ${isDark 
                  ? "text-dark-blue-gray hover:text-dark-rose hover:bg-dark-surface/50" 
                  : "text-light-text-secondary hover:text-light-text hover:bg-gray-100/50"
                }
              `}
            >
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-1">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleRotate}
              className={`
                p-2 rounded-macos-sm transition-colors duration-200
                ${isDark 
                  ? "text-dark-blue-gray hover:text-dark-rose hover:bg-dark-surface/50" 
                  : "text-light-text-secondary hover:text-light-text hover:bg-gray-100/50"
                }
              `}
            >
              <RotateCw className="w-4 h-4" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleDownload}
              className={`
                p-2 rounded-macos-sm transition-colors duration-200
                ${isDark 
                  ? "text-dark-blue-gray hover:text-dark-rose hover:bg-dark-surface/50" 
                  : "text-light-text-secondary hover:text-light-text hover:bg-gray-100/50"
                }
              `}
            >
              <Download className="w-4 h-4" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleFullscreen}
              className={`
                p-2 rounded-macos-sm transition-colors duration-200
                ${isDark 
                  ? "text-dark-blue-gray hover:text-dark-rose hover:bg-dark-surface/50" 
                  : "text-light-text-secondary hover:text-light-text hover:bg-gray-100/50"
                }
              `}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* PDF Content Area */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
        <div 
          className={`
            w-full h-full rounded-macos-md border-2 border-dashed flex items-center justify-center
            ${isDark 
              ? "border-dark-blue-gray/30 bg-dark-bg/50" 
              : "border-gray-300/50 bg-white/50"
            }
          `}
          style={{
            transform: `rotate(${rotation}deg) scale(${zoom / 100})`,
            transition: "transform 0.3s ease",
          }}
        >
          <div className="text-center space-y-2">
            <FileText 
              className={`w-12 h-12 mx-auto ${
                isDark ? "text-dark-blue-gray" : "text-gray-400"
              }`} 
            />
            <p className={`text-sm ${
              isDark ? "text-dark-blue-gray" : "text-light-text-secondary"
            }`}>
              Vista previa del PDF se mostrará aquí
            </p>
            <p className={`text-xs ${
              isDark ? "text-dark-blue-gray/70" : "text-light-text-secondary/70"
            }`}>
              {pdf.name}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
