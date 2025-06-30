import React, { useState, useEffect } from "react";
import TitleBar from "./components/TitleBar";
import Sidebar from "./components/Sidebar";
import ChatPanel from "./components/ChatPanel";
import PDFViewer from "./components/PDFViewer";
import ApiKeyModal from "./components/ui/ApiKeyModal";
import { PDFFile } from "./utils/storage";
import { apiKeyService } from "./lib/apiKeyService";
import { bckImage } from "./assets";
import "./index.css";

const App: React.FC = () => {
  const [isDark, setIsDark] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<"light" | "dark" | "system">(
    "system"
  );
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [apiKeyStatus, setApiKeyStatus] = useState(apiKeyService.getStatus());

  const toggleDarkMode = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  // Update API key status when component mounts
  useEffect(() => {
    const updateStatus = () => {
      setApiKeyStatus(apiKeyService.getStatus());
    };

    // Initial status update
    updateStatus();

    // Set up interval to check status periodically
    const interval = setInterval(updateStatus, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleThemeChange = (theme: "light" | "dark" | "system") => {
    setCurrentTheme(theme);
    // Implementar lógica de cambio de tema
    if (theme === "dark") {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    } else if (theme === "light") {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
    } else {
      // System theme - detectar preferencia del sistema
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      setIsDark(prefersDark);
      if (prefersDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  };

  const handleMenuAction = (action: string) => {
    console.log("Menu action:", action);
    // Implementar acciones del menú
    switch (action) {
      case "new":
        // Clear current PDF selection
        setSelectedPDF(null);
        console.log("📄 PDF selection cleared");
        break;
      case "open":
        alert("Abrir PDF - funcionalidad próximamente");
        break;
      case "sidebar":
        setSidebarVisible(!sidebarVisible);
        break;
      case "chat":
        // Only allow toggling chat when a PDF is selected
        if (selectedPDF) {
          setChatVisible(!chatVisible);
        } else {
          console.log("📱 Chat toggle disabled: No PDF selected");
        }
        break;
      default:
        console.log("Acción no implementada:", action);
    }
  };

  const handleApiKeyConfig = () => {
    setIsApiKeyModalOpen(true);
  };

  const handleApiKeySave = async (apiKey: string): Promise<boolean> => {
    try {
      const success = await apiKeyService.setApiKey(apiKey);
      if (success) {
        setApiKeyStatus(apiKeyService.getStatus());
        console.log("✅ API key saved successfully");
      }
      return success;
    } catch (error) {
      console.error("❌ Error saving API key:", error);
      return false;
    }
  };

  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [chatVisible, setChatVisible] = useState(false); // Start hidden
  const [selectedPDF, setSelectedPDF] = useState<
    (PDFFile & { data?: string }) | null
  >(null);

  // Automatically show ChatPanel when a PDF is selected
  useEffect(() => {
    if (selectedPDF) {
      setChatVisible(true);
      console.log(`📱 ChatPanel activated for PDF: ${selectedPDF.name}`);
    } else {
      setChatVisible(false);
      console.log(`📱 ChatPanel deactivated (no PDF selected)`);
    }
  }, [selectedPDF]);

  return (
    <div
      className={`min-h-screen transition-all duration-500 select-none ${
        isDark ? "dark" : ""
      }`}
      style={{
        backgroundImage: `url("${bckImage}")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: "hidden",
      }}
    >
      {/* Overlay glassmorphism */}
      <div
        className="absolute inset-0 bg-dark-bg/30 backdrop-blur-sm"
        style={{
          backdropFilter: "blur(8px) saturate(150%)",
          WebkitBackdropFilter: "blur(8px) saturate(150%)",
        }}
      />
      {/* TitleBar personalizada */}
      <TitleBar
        title="PDFai"
        onMenuAction={handleMenuAction}
        currentTheme={currentTheme}
        onThemeChange={handleThemeChange}
        onApiKeyConfig={handleApiKeyConfig}
        hasPDFSelected={!!selectedPDF}
        chatVisible={chatVisible}
      />

      {/* Layout principal */}
      <div
        className="flex relative z-10"
        style={{ marginTop: "44px", height: "calc(100vh - 44px)" }}
      >
        {/* Sidebar */}
        <Sidebar isVisible={sidebarVisible} onFileSelect={setSelectedPDF} />

        {/* Área central */}
        <div className="flex-1 flex p-4">
          {selectedPDF ? (
            <PDFViewer
              fileUrl={selectedPDF?.data}
              fileName={selectedPDF?.name}
              onError={(error) => {
                console.error("PDF Viewer Error:", error);
                // You could show a toast notification here
              }}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center p-8 rounded-lg bg-dark-surface/10 backdrop-blur-sm border border-dark-blue-gray/20 shadow-lg"
              >
                <motion.img
                  src="./public/PDFai-3D.png"
                  alt="PDFai 3D Logo"
                  className="mx-auto mb-6 w-48 h-48"
                  animate={{
                    y: [0, -10, 0],
                    transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                  }}
                />
                <h2 className="text-3xl font-bold text-dark-rose mb-3">
                  Bienvenido a <span className="text-dark-coral">PDFai</span>
                </h2>
                <p className="text-dark-blue-gray text-lg mb-4">
                  Tu asistente inteligente para interactuar con documentos PDF.
                </p>
                <p className="text-dark-blue-gray/80 text-md">
                  Selecciona un PDF desde la barra lateral para comenzar a chatear y obtener análisis inteligentes.
                </p>
              </motion.div>
            </div>
          )}
        </div>

        {/* Chat Panel */}
        {chatVisible && (
          <ChatPanel
            isVisible={true}
            selectedPDF={selectedPDF}
            apiKeyStatus={apiKeyStatus}
          />
        )}
      </div>

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onSave={handleApiKeySave}
        currentApiKey={apiKeyStatus.maskedKey || ""}
      />
    </div>
  );
};

export default App;
