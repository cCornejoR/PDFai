import React, { useState, useRef, useEffect, useCallback } from "react";
import { ChatMessageComponent } from "./ChatMessage.js";
import { Spinner } from "./Spinner.js";
import { chatWithPdfContextStream } from "../services/geminiService.js";
import type { ChatMessage, ProcessedPdf } from "../types.js";
import { MessageAuthor } from "../types.js";
import { Send, Sparkles } from "lucide-react";
import { PdfCardStack } from "./PdfCardStack.js";
import { AutocompletePopup } from "./AutocompletePopup.js";

interface ChatViewProps {
  readyPdfs: ProcessedPdf[];
  onReset: () => void;
}

export const ChatView: React.FC<ChatViewProps> = ({ readyPdfs, onReset }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [autocomplete, setAutocomplete] = useState({
    visible: false,
    suggestions: [] as string[],
    activeIndex: 0,
  });

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSelectSuggestion = (suggestion: string) => {
    const lastAt = input.lastIndexOf("@");
    if (lastAt === -1) return;

    const newInput = input.substring(0, lastAt) + `@${suggestion} `;
    setInput(newInput);

    setAutocomplete({ visible: false, suggestions: [], activeIndex: 0 });
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!autocomplete.visible || autocomplete.suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setAutocomplete(prev => ({
        ...prev,
        activeIndex: (prev.activeIndex + 1) % prev.suggestions.length,
      }));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setAutocomplete(prev => ({
        ...prev,
        activeIndex:
          (prev.activeIndex - 1 + prev.suggestions.length) %
          prev.suggestions.length,
      }));
    } else if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      handleSelectSuggestion(
        autocomplete.suggestions[autocomplete.activeIndex]
      );
    } else if (e.key === "Escape") {
      e.preventDefault();
      setAutocomplete(prev => ({ ...prev, visible: false }));
    }
  };

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

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="p-3 sm:p-4 border-b border-slate-700 bg-slate-800/80 rounded-t-xl flex justify-between items-center flex-shrink-0">
        <h2 className="font-semibold text-slate-200 text-sm sm:text-base">
          Contexto de Chat
        </h2>
        <button
          onClick={onReset}
          className="text-xs sm:text-sm text-sky-400 hover:text-sky-300 hover:underline flex-shrink-0 ml-2 sm:ml-4"
        >
          Empezar de nuevo
        </button>
      </div>

      <div className="pt-3 sm:pt-6 bg-slate-800/50 flex-shrink-0">
        <PdfCardStack pdfs={readyPdfs} />
      </div>

      <div
        ref={chatContainerRef}
        className="flex-1 p-3 sm:p-6 overflow-y-auto space-y-4 sm:space-y-6 min-h-0"
      >
        {messages.length === 0 && (
          <div className="text-center text-slate-400">
            <p>Chat listo. Haz cualquier pregunta sobre tus documentos.</p>
            <p className="text-sm mt-2">
              Usa <code className="bg-slate-700 p-1 rounded">@</code> para
              autocompletar nombres de archivo.
            </p>
          </div>
        )}
        {messages.map((msg, index) => (
          <ChatMessageComponent key={index} message={msg} />
        ))}
        {isLoading &&
          messages[messages.length - 1]?.author === MessageAuthor.AI && (
            <div className="flex justify-start">
              <div className="flex items-start gap-3 max-w-2xl">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center mt-1">
                  <Sparkles className="w-6 h-6 text-sky-400" />
                </div>
                <div className="bg-slate-700 text-slate-200 rounded-lg rounded-bl-none px-4 py-3 flex items-center gap-2">
                  <Spinner className="w-5 h-5" />
                  <span className="text-slate-300 italic">Pensando...</span>
                </div>
              </div>
            </div>
          )}
      </div>

      <div className="p-3 sm:p-4 border-t border-slate-700 relative flex-shrink-0">
        {autocomplete.visible && (
          <AutocompletePopup
            suggestions={autocomplete.suggestions}
            activeIndex={autocomplete.activeIndex}
            onSelect={handleSelectSuggestion}
          />
        )}
        <form
          onSubmit={handleSendMessage}
          className="flex items-center gap-2 sm:gap-3"
        >
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
            className="flex-1 w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-200 placeholder-slate-400 resize-none text-sm sm:text-base"
            rows={1}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="p-2 sm:p-3 bg-sky-600 rounded-lg text-white disabled:bg-slate-600 disabled:cursor-not-allowed hover:bg-sky-500 transition-colors self-end"
          >
            {isLoading ? (
              <Spinner />
            ) : (
              <Send className="w-5 h-5 sm:w-6 sm:h-6" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
