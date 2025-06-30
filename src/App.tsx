import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import TitleBar from "./components/TitleBar";
import Sidebar from "./components/Sidebar";
import ChatPanel from "./components/ChatPanel";
import PDFViewer from "./components/PDFViewer";
import ApiKeyModal from "./components/ui/ApiKeyModal";
import { GlowEffect } from "./components/core/glow-effect";
import { SpotlightBorder } from "./components/ui/SpotlightBorder";
import { PDFFile } from "./utils/storage";
import { apiKeyService } from "./lib/apiKeyService";
import { bckImage } from "./assets";
import PDFai3D from "./assets/PDFai-3D.png";
import "./index.css";

const App: React.FC = () => {
  const [isDark, setIsDark] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<"light" | "dark" | "system">(
    "system"
  );
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [apiKeyStatus, setApiKeyStatus] = useState(apiKeyService.getStatus());
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [chatVisible, setChatVisible] = useState(false); // Start hidden
  const [selectedPDF, setSelectedPDF] = useState<
    (PDFFile & { data?: string }) | null
  >(null);

  // Auto-open chat when PDF is selected
  const handlePDFSelection = (pdf: (PDFFile & { data?: string }) | null) => {
    console.log("📄 PDF selection changed:", pdf?.name || "None");
    setSelectedPDF(pdf);

    // Auto-open chat panel when a PDF is selected (if API key is available)
    if (pdf && apiKeyStatus.hasKey) {
      console.log("🚀 Auto-opening chat panel for PDF:", pdf.name);
      setChatVisible(true);
    } else if (!pdf) {
      // Close chat when no PDF is selected
      console.log("🔒 Closing chat panel - no PDF selected");
      setChatVisible(false);
    }
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
        handlePDFSelection(null);
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
        <Sidebar isVisible={sidebarVisible} onFileSelect={handlePDFSelection} />

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
            <div className="flex-1 flex items-center justify-center relative p-8">
              {/* Background Glow Effects */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-96 h-96">
                  <GlowEffect
                    colors={["#9d3d3d", "#ce7c73", "#f9e1dd", "#7c828d"]}
                    mode="animated"
                    blur="large"
                  />
                </div>
              </div>

              {/* Main Welcome Card with Spotlight Effect */}
              <SpotlightBorder
                className="max-w-4xl w-full"
                height="h-[500px]"
                size={200}
              >
                <div className="h-full flex items-center justify-center p-12">
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="text-center space-y-8"
                  >
                    {/* Logo with enhanced animations */}
                    <motion.div
                      className="relative"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                    >
                      <motion.img
                        src={PDFai3D}
                        alt="PDFai 3D Logo"
                        className="mx-auto w-32 h-32 drop-shadow-2xl"
                        animate={{
                          y: [0, -8, 0],
                          rotate: [0, 2, -2, 0],
                        }}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                      {/* Glow ring around logo */}
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-dark-red/20 via-dark-coral/30 to-dark-rose/20 blur-xl animate-pulse" />
                    </motion.div>

                    {/* Enhanced Typography */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.4 }}
                      className="space-y-4"
                    >
                      <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-dark-rose to-dark-coral bg-clip-text text-transparent leading-tight">
                        Bienvenido a{" "}
                        <span className="bg-gradient-to-r from-dark-red via-dark-coral to-dark-rose bg-clip-text text-transparent font-black">
                          PDFai
                        </span>
                      </h1>

                      <p className="text-xl text-dark-rose/90 font-medium max-w-2xl mx-auto leading-relaxed">
                        Tu asistente inteligente para interactuar con documentos
                        PDF
                      </p>
                    </motion.div>

                    {/* Call to action */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.6 }}
                      className="space-y-6"
                    >
                      <p className="text-dark-blue-gray text-lg max-w-xl mx-auto leading-relaxed">
                        Selecciona un PDF desde la barra lateral para comenzar a
                        chatear y obtener análisis inteligentes
                      </p>

                      {/* Feature highlights */}
                      <div className="flex justify-center space-x-8 text-sm">
                        {[
                          { icon: "🤖", text: "IA Avanzada" },
                          { icon: "📄", text: "Análisis PDF" },
                          { icon: "💬", text: "Chat Inteligente" },
                        ].map((feature, index) => (
                          <motion.div
                            key={feature.text}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{
                              duration: 0.5,
                              delay: 0.8 + index * 0.1,
                            }}
                            className="flex items-center space-x-2 px-4 py-2 bg-dark-surface/40 rounded-full border border-dark-blue-gray/20"
                          >
                            <span className="text-lg">{feature.icon}</span>
                            <span className="text-dark-rose font-medium">
                              {feature.text}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  </motion.div>
                </div>
              </SpotlightBorder>
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
