import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Copy, Check } from "lucide-react";
import type { PDFFile } from "../utils/storage";
import { chatWithPdfContextStream } from "../services/geminiService";
import { useTheme } from "../lib/hooks/useTheme";
import type { ChatMessage, ProcessedPdf } from "../types";
import { MessageAuthor } from "../types";
import { Spinner } from "./Spinner";

interface ChatPanelProps {
  isVisible?: boolean;
  onToggle?: () => void;
  selectedPDF?: (PDFFile & { data?: string }) | null;
  readyPdfs?: ProcessedPdf[];
  apiKeyStatus?: {
    hasKey: boolean;
    isReady: boolean;
    maskedKey: string | null;
  };
  onReset?: () => void;
}

export default function ChatPanel({
  isVisible = true,
  selectedPDF,
  readyPdfs = [],
  apiKeyStatus,
  onReset,
}: ChatPanelProps) {
  const { effectiveTheme } = useTheme();
  const isDark = effectiveTheme === "dark";
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Autocomplete state for @mentions
  const [autocomplete, setAutocomplete] = useState({
    visible: false,
    suggestions: [] as string[],
    activeIndex: 0,
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Handle input changes with autocomplete
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInput(value);

    const cursorPosition = e.target.selectionStart;
    const textBeforeCursor = value.substring(0, cursorPosition);
    const atMatch = textBeforeCursor.match(/@([\w\s.-]*)$/);

    if (atMatch) {
      const query = atMatch[1].toLowerCase();
      const suggestions = readyPdfs
        .map(pdf => pdf.name)
        .filter(name => name.toLowerCase().includes(query));

      if (suggestions.length > 0) {
        setAutocomplete({
          visible: true,
          suggestions,
          activeIndex: 0,
        });
      } else {
        setAutocomplete(prev => ({ ...prev, visible: false }));
      }
    } else {
      setAutocomplete(prev => ({ ...prev, visible: false }));
    }
  };

  // Handle sending messages with streaming
  const handleSendMessage = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim() || isLoading) return;

      const userMessage: ChatMessage = {
        author: MessageAuthor.USER,
        text: input,
      };
      const newMessages: ChatMessage[] = [...messages, userMessage];

      setMessages(newMessages);
      setInput("");
      setIsLoading(true);
      setAutocomplete({ visible: false, suggestions: [], activeIndex: 0 });

      const aiMessage: ChatMessage = { author: MessageAuthor.AI, text: "" };
      setMessages(prev => [...prev, aiMessage]);

      try {
        const stream = await chatWithPdfContextStream(readyPdfs, newMessages);

        for await (const chunk of stream) {
          setMessages(prev => {
            const lastMessage = prev[prev.length - 1];
            if (lastMessage.author === MessageAuthor.AI) {
              lastMessage.text += chunk.text;
              return [...prev.slice(0, -1), { ...lastMessage }];
            }
            return prev;
          });
        }
      } catch (error) {
        console.error("Error en la transmisión de Gemini:", error);
        setMessages(prev => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage.author === MessageAuthor.AI) {
            lastMessage.text =
              "Lo siento, ocurrió un error al contactar a la IA. Por favor, inténtalo de nuevo.";
            return [...prev.slice(0, -1), { ...lastMessage }];
          }
          return prev;
        });
      } finally {
        setIsLoading(false);
      }
    },
    [input, isLoading, readyPdfs, messages]
  );

  // Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
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
    setMessages([]);
  };

  // Render individual message
  const renderMessage = (message: ChatMessage, index: number) => {
    const isUser = message.author === MessageAuthor.USER;
    const messageId = `msg-${index}`;

    return (
      <motion.div
        key={index}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className={`flex ${isUser ? "justify-end" : "justify-start"}`}
      >
        <div className={`group max-w-[80%] ${isUser ? "order-2" : "order-1"}`}>
          <div className="flex items-start space-x-3">
            {!isUser && (
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg ${
                  isDark
                    ? "bg-gradient-to-br from-dark-red to-dark-coral"
                    : "bg-gradient-to-br from-pink-400 to-purple-500"
                }`}
              >
                <Bot
                  className={`w-4 h-4 ${
                    isDark ? "text-dark-rose" : "text-white"
                  }`}
                />
              </div>
            )}
            <div
              id={`message-${messageId}`}
              className={`relative px-4 py-3 rounded-2xl shadow-lg ${
                isUser
                  ? isDark
                    ? "bg-gradient-to-br from-dark-red to-dark-coral text-dark-rose"
                    : "bg-gradient-to-br from-pink-400 to-purple-500 text-white"
                  : isDark
                    ? "bg-dark-surface/80 text-dark-rose border border-dark-blue-gray/30"
                    : "text-gray-800 border border-gray-200/50"
              }`}
              style={
                !isUser && !isDark
                  ? {
                      backgroundColor: "rgba(255,255,255,0.4)",
                      backdropFilter: "blur(12px) saturate(150%)",
                      WebkitBackdropFilter: "blur(12px) saturate(150%)",
                      boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                    }
                  : {
                      backdropFilter: "blur(20px)",
                      WebkitBackdropFilter: "blur(20px)",
                    }
              }
            >
              <p className="text-sm font-bricolage leading-relaxed whitespace-pre-wrap">
                {message.text || "..."}
              </p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs opacity-70">
                  {new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                {!isUser && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => copyToClipboard(messageId, message.text)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-dark-surface/60 transition-all duration-200"
                  >
                    {copiedId === messageId ? (
                      <Check className="w-3 h-3 text-green-400" />
                    ) : (
                      <Copy className="w-3 h-3 text-dark-blue-gray" />
                    )}
                  </motion.button>
                )}
              </div>
            </div>
            {isUser && (
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg ${
                  isDark
                    ? "bg-gradient-to-br from-dark-red to-dark-coral"
                    : "bg-gradient-to-br from-pink-400 to-purple-500"
                }`}
              >
                <User
                  className={`w-4 h-4 ${
                    isDark ? "text-dark-rose" : "text-white"
                  }`}
                />
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`w-96 h-full flex flex-col shadow-2xl rounded-l-macos-lg ${
        isDark
          ? "border-l border-dark-blue-gray/30"
          : "border-l border-gray-200/50"
      }`}
      style={{
        backdropFilter: "blur(30px) saturate(150%)",
        WebkitBackdropFilter: "blur(30px) saturate(150%)",
        background: isDark
          ? "linear-gradient(180deg, rgba(30, 31, 35, 0.95) 0%, rgba(64, 65, 71, 0.85) 100%)"
          : "linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 249, 250, 0.85) 100%)",
        boxShadow: isDark
          ? "0 8px 32px rgba(0,0,0,0.25)"
          : "0 8px 32px rgba(0,0,0,0.15)",
        borderLeft: isDark
          ? "1px solid rgba(124,130,141,0.18)"
          : "1px solid rgba(0,0,0,0.1)",
      }}
    >
      {/* Header */}
      <div
        className={`p-4 border-b ${
          isDark ? "border-dark-blue-gray/30" : "border-gray-200/50"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-lg ${
                isDark
                  ? "bg-gradient-to-br from-dark-red to-dark-coral"
                  : "bg-gradient-to-br from-pink-400 to-purple-500"
              }`}
            >
              <Bot
                className={`w-4 h-4 ${
                  isDark ? "text-dark-rose" : "text-white"
                }`}
              />
            </div>
            <div>
              <h2
                className={`text-lg font-semibold font-bricolage-semibold ${
                  isDark ? "text-dark-rose" : "text-light-text"
                }`}
              >
                Chat AI
              </h2>
              <p
                className={`text-xs ${
                  isDark ? "text-dark-blue-gray" : "text-light-text-secondary"
                }`}
              >
                Asistente inteligente
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={clearChat}
              className={`p-2 rounded-macos-md transition-all duration-200 ${
                isDark
                  ? "bg-dark-surface/50 hover:bg-dark-surface/80 text-dark-blue-gray hover:text-dark-rose"
                  : "text-gray-600 hover:text-gray-900 hover:bg-white/40"
              }`}
              style={
                isDark
                  ? {}
                  : {
                      backgroundColor: "rgba(255,255,255,0.25)",
                      backdropFilter: "blur(12px) saturate(150%)",
                      WebkitBackdropFilter: "blur(12px) saturate(150%)",
                      border: "1px solid rgba(255,255,255,0.3)",
                      boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                    }
              }
              title="Limpiar chat"
            >
              ✕
            </motion.button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4"
      >
        {messages.length === 0 && (
          <div className="text-center text-slate-400">
            <p className="font-bricolage">
              Chat listo. Haz cualquier pregunta sobre tus documentos.
            </p>
            <p className="text-sm font-bricolage mt-2">
              Usa <code className="bg-slate-700 p-1 rounded">@</code> para
              autocompletar nombres de archivo.
            </p>
          </div>
        )}
        <AnimatePresence>
          {messages.map((message, index) => renderMessage(message, index))}
        </AnimatePresence>

        {/* Loading indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="flex items-start space-x-3">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-lg ${
                  isDark
                    ? "bg-gradient-to-br from-dark-red to-dark-coral"
                    : "bg-gradient-to-br from-pink-400 to-purple-500"
                }`}
              >
                <Bot
                  className={`w-4 h-4 ${
                    isDark ? "text-dark-rose" : "text-white"
                  }`}
                />
              </div>
              <div
                className={`px-4 py-3 rounded-2xl ${
                  isDark
                    ? "bg-dark-surface/80"
                    : "bg-white/40 border border-gray-200/50"
                }`}
                style={
                  !isDark
                    ? {
                        backdropFilter: "blur(12px) saturate(150%)",
                        WebkitBackdropFilter: "blur(12px) saturate(150%)",
                        boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                      }
                    : {}
                }
              >
                <div className="flex space-x-1">
                  {[0, 1, 2].map(i => (
                    <motion.div
                      key={i}
                      className={`w-2 h-2 rounded-full ${
                        isDark ? "bg-dark-rose" : "bg-gray-600"
                      }`}
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

        {/* Loading indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="flex items-start space-x-3">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-lg ${
                  isDark
                    ? "bg-gradient-to-br from-dark-red to-dark-coral"
                    : "bg-gradient-to-br from-pink-400 to-purple-500"
                }`}
              >
                <Bot
                  className={`w-4 h-4 ${
                    isDark ? "text-dark-rose" : "text-white"
                  }`}
                />
              </div>
              <div
                className={`px-4 py-3 rounded-2xl shadow-lg ${
                  isDark
                    ? "bg-dark-surface/80 text-dark-rose border border-dark-blue-gray/30"
                    : "text-gray-800 border border-gray-200/50"
                }`}
                style={
                  !isDark
                    ? {
                        backgroundColor: "rgba(255,255,255,0.4)",
                        backdropFilter: "blur(12px) saturate(150%)",
                        WebkitBackdropFilter: "blur(12px) saturate(150%)",
                        boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                      }
                    : {
                        backdropFilter: "blur(20px)",
                        WebkitBackdropFilter: "blur(20px)",
                      }
                }
              >
                <div className="flex items-center space-x-2">
                  <Spinner />
                  <span className="text-sm">Escribiendo...</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-dark-blue-gray/30">
        <form onSubmit={handleSendMessage} className="flex items-center gap-3">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={
              isLoading
                ? "Esperando respuesta..."
                : "Escribe tu pregunta aquí..."
            }
            className="flex-1 w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-200 placeholder-slate-400 resize-none"
            rows={1}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="p-3 bg-sky-600 rounded-lg text-white disabled:bg-slate-600 disabled:cursor-not-allowed hover:bg-sky-500 transition-colors self-end"
          >
            {isLoading ? <Spinner /> : <Send className="w-6 h-6" />}
          </button>
        </form>
      </div>
    </motion.div>
  );
}
