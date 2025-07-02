import React, { useState, useCallback, useEffect } from "react";
import { PdfUpload } from "@/components/PdfUpload";
import { ChatView } from "@/components/ChatView";
import { processPdf } from "@/services/pdfParser";
import type { ProcessedPdf } from "@/types";
import { PdfPreviewCard } from "@/components/PdfPreviewCard";
import TitleBar from "@/components/TitleBar";
import Sidebar from "@/components/Sidebar";
import HomePage from "@/components/HomePage";
import DynamicBackground from "@/components/ui/DynamicBackground";
import PdfViewer from "@/components/PdfViewer";
import ChatPanel from "@/components/ChatPanel";
import { useTheme } from "@/lib/hooks/useTheme";
import { useApiKey } from "@/lib/hooks/useApiKey";
import { Sparkles } from "lucide-react";
import type { PDFFile } from "@/utils/storage";

type AppState = "HOME" | "WORKSPACE" | "CHATTING";

const MainApp: React.FC = () => {
  const { effectiveTheme } = useTheme();
  const { apiKeyStatus } = useApiKey();
  const isDark = effectiveTheme === "dark";

  const [appState, setAppState] = useState<AppState>("HOME");
  const [processedPdfs, setProcessedPdfs] = useState<ProcessedPdf[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState<
    (PDFFile & { data?: string }) | null
  >(null);
  const [isChatPanelVisible, setIsChatPanelVisible] = useState(false);

  // Verificar si hay API key configurada al cargar
  useEffect(() => {
    if (!apiKeyStatus?.hasKey) {
      console.log("⚠️ No hay API key configurada. Mostrando página de inicio.");
    }
  }, [apiKeyStatus]);

  const handlePdfUpload = useCallback(async (files: FileList) => {
    const newPdfs: ProcessedPdf[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type === "application/pdf") {
        const id = crypto.randomUUID();
        const newPdf: ProcessedPdf = {
          id,
          name: file.name,
          status: "processing",
          file,
          pages: [],
        };

        newPdfs.push(newPdf);
        setProcessedPdfs(prev => [...prev, newPdf]);

        try {
          const result = await processPdf(file);
          setProcessedPdfs(prev =>
            prev.map(p =>
              p.id === id
                ? {
                    ...p,
                    status: "ready",
                    pages: result.pages,
                  }
                : p
            )
          );
        } catch (error) {
          console.error("Error processing PDF:", error);
          setProcessedPdfs(prev =>
            prev.map(p =>
              p.id === id
                ? {
                    ...p,
                    status: "error",
                    error:
                      error instanceof Error ? error.message : "Unknown error",
                  }
                : p
            )
          );
        }
      }
    }
  }, []);

  const handleRemovePdf = (id: string) => {
    setProcessedPdfs(prev => prev.filter(p => p.id !== id));
  };

  const handleReset = () => {
    setAppState("WORKSPACE");
  };

  const handleStartChat = () => {
    if (!apiKeyStatus?.hasKey) {
      console.log("⚠️ Se necesita configurar una API key primero");
      setIsSidebarOpen(true);
      return;
    }

    if (processedPdfs.some(p => p.status === "ready")) {
      setAppState("CHATTING");
    } else {
      setAppState("WORKSPACE");
    }
  };

  const handleGoToWorkspace = () => {
    setAppState("WORKSPACE");
  };

  const handleGoHome = () => {
    setAppState("HOME");
    setProcessedPdfs([]);
    setSelectedPdf(null);
    setIsChatPanelVisible(false);
  };

  // Handle PDF selection from sidebar
  const handlePdfSelect = (pdf: (PDFFile & { data?: string }) | null) => {
    if (!pdf) return;

    setSelectedPdf(pdf);

    // Automatically transition from HOME to WORKSPACE when PDF is selected
    if (appState === "HOME") {
      setAppState("WORKSPACE");
    }

    // Show chat panel if API key is available
    if (apiKeyStatus?.hasKey) {
      setIsChatPanelVisible(true);
    }
  };

  const readyPdfs = processedPdfs.filter(p => p.status === "ready");

  const renderContent = () => {
    switch (appState) {
      case "HOME":
        return <HomePage onStartChat={handleStartChat} />;

      case "WORKSPACE":
        return (
          <div className="flex-1 flex">
            {/* Main Content Area */}
            <div className="flex-1 p-6">
              {selectedPdf ? (
                /* PDF Viewer + Chat Layout */
                <div className="h-full flex space-x-6">
                  {/* PDF Viewer */}
                  <div className="flex-1">
                    <PdfViewer pdf={selectedPdf} />
                  </div>

                  {/* Chat Panel */}
                  {isChatPanelVisible && (
                    <div className="w-96 flex-shrink-0">
                      <ChatPanel
                        isVisible={isChatPanelVisible}
                        selectedPDF={selectedPdf}
                        readyPdfs={readyPdfs}
                        apiKeyStatus={apiKeyStatus}
                        onReset={() => {
                          setSelectedPdf(null);
                          setIsChatPanelVisible(false);
                        }}
                      />
                    </div>
                  )}
                </div>
              ) : (
                /* No PDF Selected - Show Upload Area */
                <div className="h-full flex items-center justify-center">
                  <div className="max-w-md text-center space-y-6">
                    <div className="space-y-2">
                      <h2
                        className={`text-2xl font-bricolage-bold ${
                          isDark ? "text-dark-rose" : "text-light-text"
                        }`}
                      >
                        Selecciona un PDF
                      </h2>
                      <p
                        className={`${
                          isDark
                            ? "text-dark-blue-gray"
                            : "text-light-text-secondary"
                        }`}
                      >
                        Elige un archivo desde la barra lateral o sube uno nuevo
                        para comenzar
                      </p>
                    </div>

                    <div
                      className={`border-2 border-dashed rounded-macos-lg p-8 ${
                        isDark
                          ? "border-dark-blue-gray/30 bg-gradient-dark-surface"
                          : "border-gray-300/50 bg-gradient-light-surface"
                      }`}
                    >
                      <div className="text-center space-y-4">
                        <Sparkles
                          className={`w-12 h-12 mx-auto ${
                            isDark ? "text-dark-blue-gray" : "text-gray-400"
                          }`}
                        />
                        <p
                          className={`text-sm ${
                            isDark
                              ? "text-dark-blue-gray"
                              : "text-light-text-secondary"
                          }`}
                        >
                          Arrastra archivos PDF aquí o usa la barra lateral
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case "CHATTING":
        return <ChatView readyPdfs={readyPdfs} onReset={handleReset} />;

      default:
        return null;
    }
  };

  return (
    <DynamicBackground className="flex flex-col">
      {/* TitleBar personalizado */}
      <TitleBar
        title="ChatPDFai"
        onMenuAction={action => {
          if (action === "home") handleGoHome();
          if (action === "workspace") handleGoToWorkspace();
          if (action === "settings") setIsSidebarOpen(true);
        }}
        onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <div className="flex flex-1 pt-11">
        {/* Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onFileSelect={handlePdfSelect}
        />

        {/* Main Content */}
        <main
          className={`flex-1 transition-all duration-300 ${
            isSidebarOpen ? "ml-0 lg:ml-80" : "ml-0"
          } min-h-0 overflow-hidden`}
        >
          <div className="w-full h-full">{renderContent()}</div>
        </main>
      </div>
    </DynamicBackground>
  );
};

export default MainApp;
