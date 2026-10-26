"use client";
import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { MessageSquare, Send, Bot, User, Loader2, Trash2, Info } from "lucide-react";
import { ChatMessage } from "@/types";
import { sendChatMessage } from "@/lib/api";
import toast from "react-hot-toast";
import clsx from "clsx";

interface ChatPanelProps { transcript: string; sessionId: string; }

const SUGGESTED_QUESTIONS = [
  "Summarize the main points in 3 sentences",
  "What are the most important concepts?",
  "Create 5 quiz questions from this content",
  "What action items were mentioned?",
  "Explain the key terms used",
];

const ChatPanel: React.FC<ChatPanelProps> = ({ transcript, sessionId }) => {
  const [messages,  setMessages]  = useState<ChatMessage[]>([]);
  const [input,     setInput]     = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef            = useRef<HTMLDivElement>(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSend = async (messageText?: string) => {
    const text = (messageText || input).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage    = { id: crypto.randomUUID(), role: "user",      content: text, timestamp: new Date() };
    const loadingMsg: ChatMessage = { id: crypto.randomUUID(), role: "assistant", content: "",   timestamp: new Date(), isLoading: true };

    setMessages((prev) => [...prev, userMsg, loadingMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      const res     = await sendChatMessage(text, transcript, sessionId, history);
      setMessages((prev) => prev.map((m) =>
        m.id === loadingMsg.id ? { ...m, content: res.data?.answer || "No response", isLoading: false } : m
      ));
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== loadingMsg.id));
      toast.error("Failed to get response. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="glass rounded-2xl overflow-hidden flex flex-col h-[600px] animate-fade-in">
      <div className="flex items-center justify-between px-5 py-4 border-b border-dark-700/50 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-green-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-dark-100">Ask AI About Your Notes</h3>
            <p className="text-xs text-dark-500">Context-grounded answers from your transcript</p>
          </div>
        </div>
        {messages.length > 0 && (
          <button onClick={() => { setMessages([]); toast.success("Chat cleared"); }}
            className="p-1.5 rounded-lg text-dark-500 hover:text-red-400 hover:bg-red-500/10 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="animate-fade-in">
            <div className="flex items-start gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-purple-600
                              flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="chat-bubble-ai px-4 py-3 max-w-[85%]">
                <p className="text-dark-200 text-sm leading-relaxed">
                  👋 Hi! I&apos;ve read your transcript and I&apos;m ready to answer questions about it.
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-dark-500 flex items-center gap-1.5 px-1">
                <Info className="w-3.5 h-3.5" /> Suggested questions
              </p>
              {SUGGESTED_QUESTIONS.map((q, i) => (
                <button key={i} onClick={() => handleSend(q)}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-xs text-dark-300
                             bg-dark-800/60 border border-dark-700/50 hover:border-primary-500/30
                             hover:text-dark-100 hover:bg-primary-500/5 transition-all duration-200">
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={clsx("flex items-start gap-3 animate-slide-up",
            msg.role === "user" && "flex-row-reverse")}>
            <div className={clsx("w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0",
              msg.role === "user" ? "bg-primary-600" : "bg-gradient-to-br from-primary-500 to-purple-600")}>
              {msg.role === "user" ? <User className="w-3.5 h-3.5 text-white" /> : <Bot className="w-3.5 h-3.5 text-white" />}
            </div>
            <div className={clsx("max-w-[80%] px-4 py-3",
              msg.role === "user" ? "chat-bubble-user" : "chat-bubble-ai")}>
              {msg.isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 text-primary-400 animate-spin" />
                  <span className="text-xs text-dark-400">Thinking…</span>
                </div>
              ) : (
                <>
                  <div className="prose-dark text-sm"><ReactMarkdown>{msg.content}</ReactMarkdown></div>
                  <p className={clsx("text-xs mt-1.5",
                    msg.role === "user" ? "text-primary-300/60" : "text-dark-600")}>
                    {formatTime(msg.timestamp)}
                  </p>
                </>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex-shrink-0 p-4 border-t border-dark-700/50">
        <div className="flex items-end gap-2">
          <textarea value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Ask a question about your notes… (Enter to send)"
            rows={1} disabled={isLoading}
            className="flex-1 bg-dark-800/60 border border-dark-700 rounded-xl px-4 py-3 text-sm
                       text-dark-100 placeholder-dark-600 focus:outline-none focus:border-primary-500/50
                       resize-none transition-colors disabled:opacity-50 max-h-32 overflow-y-auto"
            style={{ minHeight: "44px" }}
            onInput={(e) => {
              const el = e.currentTarget;
              el.style.height = "auto";
              el.style.height = Math.min(el.scrollHeight, 128) + "px";
            }} />
          <button onClick={() => handleSend()} disabled={!input.trim() || isLoading}
            className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-600 to-purple-600
                       flex items-center justify-center hover:opacity-90 transition-opacity
                       disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0">
            {isLoading ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Send className="w-4 h-4 text-white" />}
          </button>
        </div>
        <p className="text-xs text-dark-600 mt-2 text-center">Shift+Enter for new line · Enter to send</p>
      </div>
    </div>
  );
};

export default ChatPanel;