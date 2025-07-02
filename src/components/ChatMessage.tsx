import React from "react";
import type { ChatMessage } from "../types.js";
import { MessageAuthor } from "../types.js";
import { User, Sparkles } from "lucide-react";

interface ChatMessageProps {
  message: ChatMessage;
}

export const ChatMessageComponent: React.FC<ChatMessageProps> = ({
  message,
}) => {
  const isUser = message.author === MessageAuthor.USER;

  const wrapperClasses = isUser ? "flex justify-end" : "flex justify-start";
  const bubbleClasses = isUser
    ? "bg-sky-600 text-white rounded-lg rounded-br-none"
    : "bg-slate-700 text-slate-200 rounded-lg rounded-bl-none";
  const icon = isUser ? (
    <User className="w-6 h-6" />
  ) : (
    <Sparkles className="w-6 h-6 text-sky-400" />
  );

  return (
    <div className={`${wrapperClasses} w-full`}>
      <div className="flex items-start gap-3 max-w-2xl">
        {!isUser && (
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center mt-1">
            {icon}
          </div>
        )}
        <div className={`${bubbleClasses} px-4 py-3`}>
          <p className="whitespace-pre-wrap">{message.text || "..."}</p>
        </div>
        {isUser && (
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center mt-1">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};
