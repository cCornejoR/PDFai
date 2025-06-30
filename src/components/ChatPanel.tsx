import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Mic,
  MicOff,
  PaperclipIcon,
  Bot,
  User,
  RotateCcw,
  Copy,
  Check,
  Trash2,
  Sparkles,
  MessageCircle,
  Zap,
  Key,
  AlertCircle,
} from "lucide-react";
import { PDFFile } from "../utils/storage";
import { generateAIResponse } from "../lib/utils";
import { PDFService } from "../lib/pdfService";
import { geminiService, ChatMessage } from "../lib/geminiService";
import { pdfParseService } from "../lib/pdfParseService";
import { apiKeyService } from "../lib/apiKeyService";
import ApiKeyModal from "./ui/ApiKeyModal";

interface ChatPanelProps {
  isVisible?: boolean;
  onToggle?: () => void;
  selectedPDF?: (PDFFile & { data?: string }) | null;
  apiKeyStatus?: {
    hasKey: boolean;
    isReady: boolean;
    maskedKey: string | null;
  };
}

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

export default function ChatPanel({
  isVisible = true,
  selectedPDF,
  apiKeyStatus,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "assistant",
      content: apiKeyStatus?.hasKey
        ? "¡Hola! Soy tu asistente de IA para documentos PDF. Puedes hacerme preguntas sobre cualquier PDF que tengas cargado, o simplemente charlar conmigo. ¿En qué puedo ayudarte hoy?"
        : "¡Hola! Para comenzar a chatear conmigo, necesitas configurar tu API key de Google Gemini. Haz clic en el botón de configuración en la barra superior.",
      timestamp: new Date(),
    },
  ]);
  const [pdfTextContent, setPdfTextContent] = useState<string | null>(null);
  const [inputMessage, setInputMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Extract PDF text when a new PDF is selected
  useEffect(() => {
    const extractPDFText = async () => {
      if (selectedPDF?.path) {
        try {
          console.log("🔍 Extracting text from PDF using pdf-parse...");

          // Use our new pdf-parse service
          const result = await pdfParseService.extractPDFContent(
            selectedPDF.path
          );

          if (result.success && result.content) {
            setPdfTextContent(result.content.text);

            // Check if this is a new document that needs automatic analysis
            // For new uploads, the document might have documentId but no previous chat history
            const currentChatHistory = geminiService.getChatHistory();
            const shouldGenerateAnalysis = currentChatHistory.length === 0; // No previous chat = new document
            
            if (shouldGenerateAnalysis) {
              // Generate automatic analysis for new documents
              console.log(`🔄 Generating automatic analysis for new document...`);
              
              // Check if Gemini service is initialized
              if (!geminiService.isInitialized()) {
                console.error("❌ Gemini service not initialized - cannot generate analysis");
                const errorMessage: Message = {
                  id: `error-${Date.now()}`,
                  type: "assistant",
                  content: "❌ El servicio de IA no está inicializado. Por favor configura tu API key de Google Gemini.",
                  timestamp: new Date(),
                };
                setMessages([errorMessage]);
                return;
              }
              
              // Show loading message
              const loadingMessage: Message = {
                id: `loading-${Date.now()}`,
                type: "assistant",
                content: "🤖 Analizando el documento... Generando resumen automático y preguntas clave...",
                timestamp: new Date(),
                isTyping: true,
              };
              setMessages([loadingMessage]);
              
              console.log(`📋 Gemini service initialized: ${geminiService.isInitialized()}`);
              console.log(`📄 PDF content length: ${result.content.text.length} characters`);
              
              const analysisResult = await geminiService.setPDFContent(result.content);
              
              if (analysisResult.success) {
                console.log(
                  `✅ PDF extracted and analyzed: ${result.content.text.length} characters, ${result.content.pages} pages`
                );
                
                // Load chat history which now includes the automatic analysis
                const chatHistory = geminiService.getChatHistory();
                if (chatHistory.length > 0) {
                  // Convert Gemini chat messages to local message format
                  const convertedMessages: Message[] = chatHistory.map(msg => ({
                    id: `gemini-${msg.timestamp.getTime()}`,
                    type: msg.role === 'user' ? 'user' : 'assistant',
                    content: msg.content,
                    timestamp: msg.timestamp,
                  }));
                  
                  // Update messages to include the automatic analysis
                  setMessages(convertedMessages);
                }
              } else {
                console.error("❌ Error generating automatic analysis:", analysisResult.error);
              }
            } else {
              // For existing documents, just set the content without generating new analysis
              console.log(`📄 Loading existing document: ${result.content.text.length} characters, ${result.content.pages} pages`);
              await geminiService.setPDFContentOnly(result.content, selectedPDF.documentId);
              
              // Clear chat for new document selection (optional)
              setMessages([]);
            }
          } else {
            console.error("❌ Error extracting PDF text:", result.error);
            setPdfTextContent(null);
          }
        } catch (error) {
          console.error("❌ Error extracting PDF text:", error);
          setPdfTextContent(null);
        }
      } else {
        // Clear everything when no PDF is selected
        setPdfTextContent(null);
        setMessages([]); // Clear chat messages
        geminiService.clearPDFContent();
        geminiService.clearChatHistory();
        console.log("🧹 Chat and PDF content cleared");
      }
    };

    extractPDFText();
  }, [selectedPDF]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputMessage.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    // Check if API key is configured
    if (!apiKeyStatus?.isReady) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content:
          "❌ Para usar el chat, necesitas configurar tu API key de Google Gemini. Haz clic en el botón de configuración en la barra superior.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      setIsLoading(false);
      return;
    }

    try {
      // Initialize Gemini if not already done
      if (!geminiService.isInitialized() && apiKeyStatus?.hasKey) {
        const apiKey = apiKeyService.getApiKey();
        if (apiKey) {
          geminiService.initialize(apiKey);
        }
      }

      // Generate AI response using Gemini service
      const result = await geminiService.sendMessage(userMessage.content);

      if (result.success && result.response) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: "assistant",
          content: result.response,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        throw new Error(result.error || "Error generating response");
      }
    } catch (error) {
      console.error("❌ Error generating AI response:", error);

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content:
          "❌ Lo siento, hubo un error al procesar tu mensaje. Por favor, verifica tu conexión y tu API key.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const copyToClipboard = async (messageId: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(messageId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: "1",
        type: "assistant",
        content: "Chat limpiado. ¿En qué puedo ayudarte?",
        timestamp: new Date(),
      },
    ]);
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-96 h-full flex flex-col shadow-2xl border-l border-dark-blue-gray/30"
      style={{
        backdropFilter: "blur(30px) saturate(150%)",
        WebkitBackdropFilter: "blur(30px) saturate(150%)",
        backgroundColor: "rgba(30, 31, 35, 0.18)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
        borderLeft: "1px solid rgba(124,130,141,0.18)",
      }}
    >
      {/* Header */}
      <div className="p-4 border-b border-dark-blue-gray/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-dark-red to-dark-coral rounded-lg flex items-center justify-center shadow-lg">
              <Bot className="w-4 h-4 text-dark-rose" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-dark-rose font-system">
                Chat AI
              </h2>
              <p className="text-xs text-dark-blue-gray">
                Asistente inteligente
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsApiKeyModalOpen(true)}
              className={`p-2 rounded-macos-md transition-all duration-200 ${
                apiKeyStatus?.hasKey
                  ? "bg-green-500/20 hover:bg-green-500/30 text-green-400"
                  : "bg-red-500/20 hover:bg-red-500/30 text-red-400"
              }`}
              title={
                apiKeyStatus?.hasKey
                  ? "API Key configurada"
                  : "Configurar API Key"
              }
            >
              <Key className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={clearChat}
              className="p-2 rounded-macos-md bg-dark-surface/50 hover:bg-dark-surface/80 text-dark-blue-gray hover:text-dark-rose transition-all duration-200"
              title="Limpiar chat"
            >
              <Trash2 className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center space-x-2 mt-4">
          {[
            { icon: Sparkles, label: "Resumir", color: "text-purple-400" },
            { icon: MessageCircle, label: "Preguntar", color: "text-blue-400" },
            { icon: Zap, label: "Analizar", color: "text-yellow-400" },
          ].map((action, index) => (
            <motion.button
              key={action.label}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 px-3 py-2 rounded-macos-md bg-dark-surface/30 hover:bg-dark-surface/60 transition-all duration-200 group"
            >
              <action.icon className={`w-4 h-4 ${action.color}`} />
              <span className="text-xs text-dark-blue-gray group-hover:text-dark-rose font-medium">
                {action.label}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={`flex ${
                message.type === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`group max-w-[80%] ${
                  message.type === "user" ? "order-2" : "order-1"
                }`}
              >
                <div className="flex items-start space-x-3">
                  {message.type === "assistant" && (
                    <div className="w-8 h-8 bg-gradient-to-br from-dark-red to-dark-coral rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg">
                      <Bot className="w-4 h-4 text-dark-rose" />
                    </div>
                  )}
                  <div
                    className={`relative px-4 py-3 rounded-2xl shadow-lg ${
                      message.type === "user"
                        ? "bg-gradient-to-br from-dark-red to-dark-coral text-dark-rose"
                        : "bg-dark-surface/80 text-dark-rose border border-dark-blue-gray/30"
                    }`}
                    style={{
                      backdropFilter: "blur(20px)",
                      WebkitBackdropFilter: "blur(20px)",
                    }}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs opacity-70">
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {message.type === "assistant" && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() =>
                            copyToClipboard(message.id, message.content)
                          }
                          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-dark-surface/60 transition-all duration-200"
                        >
                          {copiedId === message.id ? (
                            <Check className="w-3 h-3 text-green-400" />
                          ) : (
                            <Copy className="w-3 h-3 text-dark-blue-gray" />
                          )}
                        </motion.button>
                      )}
                    </div>
                  </div>
                  {message.type === "user" && (
                    <div className="w-8 h-8 bg-dark-blue-gray/50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-dark-rose" />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-dark-red to-dark-coral rounded-lg flex items-center justify-center shadow-lg">
                <Bot className="w-4 h-4 text-dark-rose" />
              </div>
              <div className="bg-dark-surface/80 px-4 py-3 rounded-2xl">
                <div className="flex space-x-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 bg-dark-rose rounded-full"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.2,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-dark-blue-gray/30">
        <div className="flex items-end space-x-3">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Escribe tu mensaje aquí..."
              className="w-full resize-none rounded-macos-lg bg-dark-bg/50 border border-dark-blue-gray/30 px-4 py-3 pr-12 text-sm text-dark-rose placeholder-dark-blue-gray focus:outline-none focus:ring-2 focus:ring-dark-coral/50 focus:border-dark-coral transition-all duration-200 scrollbar-thin"
              rows={1}
              style={{
                minHeight: "44px",
                maxHeight: "120px",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
              }}
            />
            <div className="absolute right-3 top-3 flex items-center space-x-1">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-1 rounded hover:bg-dark-surface/60 text-dark-blue-gray hover:text-dark-rose transition-colors duration-200"
                title="Adjuntar archivo"
              >
                <PaperclipIcon className="w-4 h-4" />
              </motion.button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsRecording(!isRecording)}
              className={`p-3 rounded-macos-lg transition-all duration-200 ${
                isRecording
                  ? "bg-red-500/20 text-red-400 border border-red-500/50"
                  : "bg-dark-surface/50 hover:bg-dark-surface/80 text-dark-blue-gray hover:text-dark-rose border border-dark-blue-gray/30"
              }`}
              title={isRecording ? "Detener grabación" : "Grabar mensaje"}
            >
              {isRecording ? (
                <MicOff className="w-5 h-5" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="px-4 py-3 bg-gradient-to-r from-dark-red to-dark-coral hover:from-dark-red/80 hover:to-dark-coral/80 disabled:from-dark-surface/50 disabled:to-dark-surface/50 text-dark-rose disabled:text-dark-blue-gray rounded-macos-lg transition-all duration-200 font-medium shadow-lg disabled:shadow-none"
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <RotateCcw className="w-5 h-5" />
                </motion.div>
              ) : (
                <Send className="w-5 h-5" />
              )}
            </motion.button>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center justify-between mt-3 text-xs text-dark-blue-gray">
          <span>
            {isRecording
              ? "🔴 Grabando..."
              : "Escribe un mensaje o graba tu voz"}
          </span>
          <span>{messages.length} mensajes</span>
        </div>
      </div>

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onSave={async (apiKey) => {
          try {
            const success = await apiKeyService.setApiKey(apiKey);
            if (success) {
              console.log("✅ API Key saved successfully");
              setIsApiKeyModalOpen(false);
              // Force a re-render to update the UI status
              window.location.reload();
            }
            return success;
          } catch (error) {
            console.error("❌ Error saving API key:", error);
            return false;
          }
        }}
      />
    </motion.div>
  );
}
