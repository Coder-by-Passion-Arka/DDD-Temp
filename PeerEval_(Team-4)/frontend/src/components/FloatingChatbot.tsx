import React, { useState, useRef, useEffect } from "react";
import { Bot, Send, X, Minimize2, Maximize2 } from "lucide-react";
import axios from "axios";

interface Message {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: Date;
}

const FloatingChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "bot",
      content:
        "Hi! I'm your Personal Assitant. Ask me anything about evaluating peers, feedback guidelines, or dashboard help!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: generateId(),
      type: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    const loadingMessage: Message = {
      id: generateId(),
      type: "bot",
      content: "Thinking...",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage, loadingMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "mistralai/mistral-7b-instruct",
          messages: [
            {
              role: "system",
              // TODO: Finetune Mistral model on Peer Evaluation Dashboard related content
              content:
                "You are a smart assistant built into a Student Performance monitoring Dashboard. Your task is to assist users understand how to navigate the dashboard and effectively make sense of the several cutting-edge features built-in. Your prime focus is to help the user make the most out of the Application. User can ask you about Scoring Criteria, Evaluation Metrics, Deadline notifications and Assignment Information.",
            },
            { 
              role: "user", 
              content: userMessage.content 
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer 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`, // Bearer Token for OpenRouter
            "Content-Type": "application/json",
            "HTTP-Referer": window.location.origin,
            "X-Title": "Your Personal Friendly Assistant",
          },
        }
      );

      const botReply =
        response.data.choices?.[0]?.message?.content ||
        "No response from the bot.";

      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          content: botReply,
        };
        return updated;
      });
    } catch (error) {
      console.error("API Error:", error);
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          content: "⚠️ Sorry, I encountered an error. Please try again.",
        };
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setIsMinimized(false);
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    <>
      {isOpen && (
        <div
          className={`fixed bottom-16 sm:bottom-20 right-2 sm:right-6 w-72 sm:w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 transition-all duration-300 ${
            isMinimized ? "h-16" : "h-80 sm:h-96"
          }`}
        >
          <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-t-2xl">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="w-3 h-3 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-xs sm:text-sm">
                  PeerBot
                </h3>
                <p className="text-xs text-white/80 hidden sm:block">
                  Ask about Peer Evaluation
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={toggleMinimize}
                className="p-1 sm:p-1.5 hover:bg-white/20 rounded-lg transition-colors duration-200"
              >
                {isMinimized ? (
                  <Maximize2 className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                ) : (
                  <Minimize2 className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                )}
              </button>
              <button
                onClick={toggleChat}
                className="p-1 sm:p-1.5 hover:bg-white/20 rounded-lg transition-colors duration-200"
              >
                <X className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              <div className="flex-1 p-3 sm:p-4 h-48 sm:h-64 overflow-y-auto space-y-3">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.type === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div className="max-w-[85%] sm:max-w-[80%]">
                      <div
                        className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-2xl text-xs sm:text-sm ${
                          message.type === "user"
                            ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-br-md"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-md"
                        }`}
                      >
                        {message.content === "Thinking..." ? (
                          <div className="flex space-x-1">
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div
                              className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.1s" }}
                            ></div>
                            <div
                              className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.2s" }}
                            ></div>
                          </div>
                        ) : (
                          message.content
                        )}
                      </div>
                      <p
                        className={`text-xs text-gray-500 dark:text-gray-400 mt-1 ${
                          message.type === "user" ? "text-right" : "text-left"
                        }`}
                      >
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about peer scoring..."
                    disabled={isLoading}
                    className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    className="p-1.5 sm:p-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    <Send className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      <button
        onClick={toggleChat}
        className={`fixed bottom-4 sm:bottom-6 right-4 sm:right-6 w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50 flex items-center justify-center group ${
          isOpen ? "scale-0" : "scale-100"
        }`}
      >
        <Bot className="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform duration-200" />
        <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-red-500 rounded-full flex items-center justify-center">
          <span className="text-xs font-bold text-white hidden sm:inline">
            !
          </span>
        </div>
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 animate-ping opacity-20"></div>
      </button>
    </>
  );
};

export default FloatingChatbot;
