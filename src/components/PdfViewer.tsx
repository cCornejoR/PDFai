import React, { useState, useEffect, useRef, useCallback } from "react";
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
  Minimize2,
  RotateCcw,
  Home,
  Loader2,
} from "lucide-react";
import { useTheme } from "@/lib/hooks/useTheme";
import type { PDFFile } from "@/utils/storage";
import type { ProcessedPdf } from "@/types";
import * as pdfjsLib from "pdfjs-dist";

interface PdfViewerProps {
  pdf: (PDFFile & { data?: string }) | ProcessedPdf | null;
  onClose?: () => void;
  className?: string;
}

export default function PdfViewer({
  pdf,
  onClose,
  className = "",
}: PdfViewerProps) {
  const { effectiveTheme } = useTheme();
  const isDark = effectiveTheme === "dark";

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [pdfDocument, setPdfDocument] =
    useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(1.0);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pageRendering, setPageRendering] = useState(false);

  // Función para cargar el PDF
  const loadPdf = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("📄 Cargando PDF para visualización:", file.name);

      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({
        data: arrayBuffer,
        verbosity: 0,
        cMapUrl: "https://unpkg.com/pdfjs-dist@5.3.31/cmaps/",
        cMapPacked: true,
      });

      const pdfDoc = await loadingTask.promise;
      setPdfDocument(pdfDoc);
      setTotalPages(pdfDoc.numPages);
      setCurrentPage(1);
      setZoom(1.0);
      setRotation(0);

      console.log(`✅ PDF cargado exitosamente. Páginas: ${pdfDoc.numPages}`);
    } catch (err) {
      console.error("❌ Error cargando PDF:", err);
      setError(
        `Error cargando PDF: ${err instanceof Error ? err.message : "Error desconocido"}`
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Función para renderizar una página
  const renderPage = useCallback(
    async (pageNum: number) => {
      if (!pdfDocument || !canvasRef.current || pageRendering) return;

      setPageRendering(true);

      try {
        console.log(`🎨 Renderizando página ${pageNum}`);

        const page = await pdfDocument.getPage(pageNum);
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");

        if (!context) {
          throw new Error("No se pudo obtener el contexto del canvas");
        }

        // Calcular el viewport con zoom y rotación
        const viewport = page.getViewport({
          scale: zoom,
          rotation: rotation,
        });

        // Configurar el canvas
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Limpiar el canvas
        context.clearRect(0, 0, canvas.width, canvas.height);

        // Renderizar la página
        const renderContext = {
          canvasContext: context,
          viewport: viewport,
          intent: "display" as const,
        };

        await page.render(renderContext).promise;
        console.log(`✅ Página ${pageNum} renderizada exitosamente`);
      } catch (err) {
        console.error(`❌ Error renderizando página ${pageNum}:`, err);
        setError(
          `Error renderizando página: ${err instanceof Error ? err.message : "Error desconocido"}`
        );
      } finally {
        setPageRendering(false);
      }
    },
    [pdfDocument, zoom, rotation, pageRendering]
  );

  // Cargar PDF cuando cambia
  useEffect(() => {
    if (!pdf) {
      setPdfDocument(null);
      setTotalPages(1);
      setCurrentPage(1);
      return;
    }

    // Verificar si es un ProcessedPdf (tiene campo 'file')
    if ("file" in pdf && pdf.file) {
      console.log("📄 Cargando ProcessedPdf:", pdf.name);
      loadPdf(pdf.file);
      return;
    }

    // Verificar si es un PDFFile con data
    if ("data" in pdf && pdf.data) {
      console.log("📄 Cargando PDFFile con data:", pdf.name);
      try {
        // Si tenemos data como string base64, convertir a File
        const byteCharacters = atob(pdf.data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const file = new File([byteArray], pdf.name, {
          type: "application/pdf",
        });
        loadPdf(file);
      } catch (error) {
        console.error("❌ Error convirtiendo data a File:", error);
        setError("Error convirtiendo datos del PDF");
      }
      return;
    }

    // Si es un PDFFile con path pero sin data, mostrar mensaje
    if ("path" in pdf && pdf.path) {
      console.log("📄 PDFFile con path pero sin data:", pdf.name);
      setError(
        "PDF no disponible para visualización. Necesita ser procesado primero."
      );
      return;
    }

    // Si llegamos aquí, no tenemos forma de cargar el PDF
    console.warn("⚠️ PDF sin datos disponibles para cargar:", pdf);
    setError("No se encontraron datos del PDF para mostrar");
  }, [pdf, loadPdf]);

  // Renderizar página cuando cambia currentPage, zoom o rotation
  useEffect(() => {
    if (pdfDocument) {
      renderPage(currentPage);
    }
  }, [pdfDocument, currentPage, zoom, rotation, renderPage]);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3.0));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.25));
  };

  const handleZoomReset = () => {
    setZoom(1.0);
  };

  const handleRotateClockwise = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleRotateCounterClockwise = () => {
    setRotation(prev => (prev - 90 + 360) % 360);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pageNum = parseInt(e.target.value);
    if (pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
    }
  };

  const handleDownload = () => {
    if (pdf?.path) {
      console.log("📥 Descargando PDF:", pdf.name);
      // En un entorno real, implementarías la descarga aquí
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
          ${
            isDark
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
            <h3
              className={`text-lg font-bricolage-semibold ${
                isDark ? "text-dark-rose" : "text-light-text"
              }`}
            >
              Selecciona un PDF
            </h3>
            <p
              className={`text-sm ${
                isDark ? "text-dark-blue-gray" : "text-light-text-secondary"
              }`}
            >
              Elige un archivo desde la barra lateral para comenzar
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`
          flex items-center justify-center h-full rounded-macos-lg border-2 border-dashed
          ${
            isDark
              ? "border-red-500/30 bg-gradient-dark-surface"
              : "border-red-300/50 bg-gradient-light-surface"
          }
          ${className}
        `}
      >
        <div className="text-center space-y-4">
          <FileText
            className={`w-16 h-16 mx-auto ${
              isDark ? "text-red-400" : "text-red-500"
            }`}
          />
          <div>
            <h3
              className={`text-lg font-bricolage-semibold ${
                isDark ? "text-red-400" : "text-red-600"
              }`}
            >
              Error cargando PDF
            </h3>
            <p
              className={`text-sm ${
                isDark ? "text-dark-blue-gray" : "text-light-text-secondary"
              }`}
            >
              {error}
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
              ${
                isDark
                  ? "bg-gradient-to-br from-dark-red to-dark-coral"
                  : "bg-gradient-to-br from-red-400 to-red-600"
              }
              shadow-sm
            `}
          >
            <FileText
              className={`w-4 h-4 ${isDark ? "text-dark-rose" : "text-white"}`}
            />
          </div>
          <div>
            <h3
              className={`font-bricolage-semibold text-sm ${
                isDark ? "text-dark-rose" : "text-light-text"
              }`}
            >
              {pdf.name}
            </h3>
            <div className="flex items-center space-x-2">
              <p
                className={`text-xs ${
                  isDark ? "text-dark-blue-gray" : "text-light-text-secondary"
                }`}
              >
                Página
              </p>
              <input
                type="number"
                min="1"
                max={totalPages}
                value={currentPage}
                onChange={handlePageInput}
                className={`w-12 px-1 py-0.5 text-xs text-center rounded border ${
                  isDark
                    ? "bg-dark-surface border-dark-blue-gray/30 text-dark-rose"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
              />
              <p
                className={`text-xs ${
                  isDark ? "text-dark-blue-gray" : "text-light-text-secondary"
                }`}
              >
                de {totalPages}
              </p>
              <span
                className={`text-xs px-2 py-0.5 rounded ${
                  isDark
                    ? "bg-dark-surface/50 text-dark-blue-gray"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {Math.round(zoom * 100)}%
              </span>
            </div>
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
              disabled={zoom <= 0.25}
              className={`
                p-2 rounded-macos-sm transition-colors duration-200 disabled:opacity-50
                ${
                  isDark
                    ? "text-dark-blue-gray hover:text-dark-rose hover:bg-dark-surface/50"
                    : "text-light-text-secondary hover:text-light-text hover:bg-gray-100/50"
                }
              `}
              title="Alejar"
            >
              <ZoomOut className="w-4 h-4" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleZoomReset}
              className={`
                px-2 py-1 text-xs font-medium rounded-macos-sm transition-colors duration-200
                ${
                  isDark
                    ? "text-dark-blue-gray hover:text-dark-rose hover:bg-dark-surface/50"
                    : "text-light-text-secondary hover:text-light-text hover:bg-gray-100/50"
                }
              `}
              title="Restablecer zoom"
            >
              {Math.round(zoom * 100)}%
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleZoomIn}
              disabled={zoom >= 3.0}
              className={`
                p-2 rounded-macos-sm transition-colors duration-200 disabled:opacity-50
                ${
                  isDark
                    ? "text-dark-blue-gray hover:text-dark-rose hover:bg-dark-surface/50"
                    : "text-light-text-secondary hover:text-light-text hover:bg-gray-100/50"
                }
              `}
              title="Acercar"
            >
              <ZoomIn className="w-4 h-4" />
            </motion.button>
          </div>

          {/* Rotation Controls */}
          <div className="flex items-center space-x-1">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleRotateCounterClockwise}
              className={`
                p-2 rounded-macos-sm transition-colors duration-200
                ${
                  isDark
                    ? "text-dark-blue-gray hover:text-dark-rose hover:bg-dark-surface/50"
                    : "text-light-text-secondary hover:text-light-text hover:bg-gray-100/50"
                }
              `}
              title="Rotar izquierda"
            >
              <RotateCcw className="w-4 h-4" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleRotateClockwise}
              className={`
                p-2 rounded-macos-sm transition-colors duration-200
                ${
                  isDark
                    ? "text-dark-blue-gray hover:text-dark-rose hover:bg-dark-surface/50"
                    : "text-light-text-secondary hover:text-light-text hover:bg-gray-100/50"
                }
              `}
              title="Rotar derecha"
            >
              <RotateCw className="w-4 h-4" />
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
                ${
                  isDark
                    ? "text-dark-blue-gray hover:text-dark-rose hover:bg-dark-surface/50"
                    : "text-light-text-secondary hover:text-light-text hover:bg-gray-100/50"
                }
              `}
              title="Página anterior"
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
                ${
                  isDark
                    ? "text-dark-blue-gray hover:text-dark-rose hover:bg-dark-surface/50"
                    : "text-light-text-secondary hover:text-light-text hover:bg-gray-100/50"
                }
              `}
              title="Página siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-1">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleDownload}
              className={`
                p-2 rounded-macos-sm transition-colors duration-200
                ${
                  isDark
                    ? "text-dark-blue-gray hover:text-dark-rose hover:bg-dark-surface/50"
                    : "text-light-text-secondary hover:text-light-text hover:bg-gray-100/50"
                }
              `}
              title="Descargar PDF"
            >
              <Download className="w-4 h-4" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleFullscreen}
              className={`
                p-2 rounded-macos-sm transition-colors duration-200
                ${
                  isDark
                    ? "text-dark-blue-gray hover:text-dark-rose hover:bg-dark-surface/50"
                    : "text-light-text-secondary hover:text-light-text hover:bg-gray-100/50"
                }
              `}
              title={
                isFullscreen
                  ? "Salir de pantalla completa"
                  : "Pantalla completa"
              }
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* PDF Content Area */}
      <div
        ref={containerRef}
        className="flex-1 flex items-center justify-center p-4 overflow-auto"
        style={{
          background: isDark
            ? "linear-gradient(135deg, rgba(30, 31, 35, 0.8) 0%, rgba(44, 44, 46, 0.6) 100%)"
            : "linear-gradient(135deg, rgba(248, 250, 252, 0.8) 0%, rgba(241, 245, 249, 0.6) 100%)",
        }}
      >
        {isLoading ? (
          <div className="text-center space-y-4">
            <Loader2
              className={`w-12 h-12 mx-auto animate-spin ${
                isDark ? "text-dark-rose" : "text-blue-500"
              }`}
            />
            <p
              className={`text-sm ${
                isDark ? "text-dark-blue-gray" : "text-light-text-secondary"
              }`}
            >
              Cargando PDF...
            </p>
          </div>
        ) : pdfDocument ? (
          <div className="relative">
            {pageRendering && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-macos-md z-10">
                <Loader2
                  className={`w-8 h-8 animate-spin ${
                    isDark ? "text-dark-rose" : "text-blue-500"
                  }`}
                />
              </div>
            )}
            <canvas
              ref={canvasRef}
              className={`
                max-w-full max-h-full rounded-macos-md shadow-lg border
                ${isDark ? "border-dark-blue-gray/30" : "border-gray-200/50"}
                transition-all duration-300 ease-in-out
              `}
              style={{
                transform: `rotate(${rotation}deg)`,
                transformOrigin: "center center",
              }}
            />
          </div>
        ) : (
          <div className="text-center space-y-4">
            <FileText
              className={`w-16 h-16 mx-auto ${
                isDark ? "text-dark-blue-gray" : "text-gray-400"
              }`}
            />
            <div>
              <h3
                className={`text-lg font-bricolage-semibold ${
                  isDark ? "text-dark-rose" : "text-light-text"
                }`}
              >
                PDF no disponible
              </h3>
              <p
                className={`text-sm ${
                  isDark ? "text-dark-blue-gray" : "text-light-text-secondary"
                }`}
              >
                No se pudo cargar el contenido del PDF
              </p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
