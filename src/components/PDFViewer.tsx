import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Viewer, Worker } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import { FileText, AlertCircle, Loader2 } from "lucide-react";

// Import CSS for the PDF viewer
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import "./PDFViewer.css";

interface PDFViewerProps {
  fileUrl?: string;
  fileName?: string;
  onError?: (error: string) => void;
}

export default function PDFViewer({
  fileUrl,
  fileName,
  onError,
}: PDFViewerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pdfData, setPdfData] = useState<string | null>(null);

  // Create default layout plugin with custom theme
  const defaultLayoutPluginInstance = defaultLayoutPlugin({
    sidebarTabs: (defaultTabs) => [
      defaultTabs[0], // Thumbnails
      defaultTabs[1], // Bookmarks
    ],
  });

  useEffect(() => {
    if (fileUrl) {
      loadPDF(fileUrl);
    } else {
      setPdfData(null);
      setError(null);
    }
  }, [fileUrl]);

  const loadPDF = async (url: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // For Electron, we need to handle file:// URLs
      if (url.startsWith("file://")) {
        // Convert file:// URL to a format that can be loaded
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to load PDF: ${response.statusText}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        setPdfData(uint8Array as any);
      } else {
        // For regular URLs or base64 data
        setPdfData(url);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load PDF";
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDocumentLoad = () => {
    setIsLoading(false);
    setError(null);
  };

  if (!fileUrl && !pdfData) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-dark-rose max-w-md mx-auto p-8"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-dark-red to-dark-coral rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <FileText className="w-12 h-12 text-dark-rose" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No PDF Selected</h3>
          <p className="text-dark-blue-gray">
            Select a PDF file from the sidebar to view it here
          </p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-dark-rose max-w-md mx-auto p-8"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <AlertCircle className="w-12 h-12 text-white" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Error Loading PDF</h3>
          <p className="text-dark-blue-gray mb-4">{error}</p>
          <button
            type="button"
            onClick={() => fileUrl && loadPDF(fileUrl)}
            className="px-4 py-2 bg-gradient-to-r from-dark-red to-dark-coral hover:from-dark-red/80 hover:to-dark-coral/80 text-dark-rose rounded-macos-lg transition-all duration-200 font-medium shadow-lg"
          >
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-dark-surface/10 backdrop-blur-xl rounded-3xl border border-dark-blue-gray/20 shadow-2xl overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 bg-dark-bg/50 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-dark-surface/90 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-dark-blue-gray/20"
          >
            <div className="flex items-center space-x-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Loader2 className="w-6 h-6 text-dark-coral" />
              </motion.div>
              <span className="text-dark-rose font-medium">Loading PDF...</span>
            </div>
          </motion.div>
        </div>
      )}

      {fileName && (
        <div className="px-6 py-4 border-b border-dark-blue-gray/20 bg-dark-surface/20">
          <h2 className="text-lg font-semibold text-dark-rose truncate">
            {fileName}
          </h2>
        </div>
      )}

      <div className="flex-1 relative">
        {pdfData && (
          <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.0.279/build/pdf.worker.min.js">
            <div className="h-full pdf-viewer-container">
              <Viewer
                fileUrl={pdfData}
                plugins={[defaultLayoutPluginInstance]}
                onDocumentLoad={handleDocumentLoad}
              />
            </div>
          </Worker>
        )}
      </div>
    </div>
  );
}
