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
        alert("Nuevo PDF - funcionalidad próximamente");
        break;
      case "open":
        alert("Abrir PDF - funcionalidad próximamente");
        break;
      case "sidebar":
        setSidebarVisible(!sidebarVisible);
        break;
      case "chat":
        setChatVisible(!chatVisible);
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
  const [chatVisible, setChatVisible] = useState(true);
  const [selectedPDF, setSelectedPDF] = useState<
    (PDFFile & { data?: string }) | null
  >(null);


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
          <PDFViewer
            fileUrl={selectedPDF?.data}
            fileName={selectedPDF?.name}
            onError={(error) => {
              console.error("PDF Viewer Error:", error);
              // You could show a toast notification here
            }}
          />
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
