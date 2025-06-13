"use client";

import { useRef, useState, useEffect, FormEvent, KeyboardEvent } from "react";
import Lottie from "lottie-react";
import botAnimation from "../../public/lottie/bot.json";
import {
  HiOutlineDocumentDownload,
  HiOutlineX,
  HiUser,
  HiChatAlt2,
} from "react-icons/hi";
import BotMessage from "./ui/bot-message";
import UserMessage from "./ui/user-message";
import LoadingMessage from "./ui/loading-message";
import { chatCompletion } from "@/../actions/index";
import {
  Document,
  Page,
  Text,
  StyleSheet,
  Font,
  PDFDownloadLink,
} from "@react-pdf/renderer";
import { motion, AnimatePresence } from "framer-motion";

// Register Japanese font for PDF
Font.register({
  family: "NotoSansJP",
  src: "/fonts/NotoSansJP-Regular.ttf",
});

// PDF Styles
const pdfStyles = StyleSheet.create({
  page: {
    fontFamily: "NotoSansJP",
    padding: 32,
    fontSize: 12,
    lineHeight: 1.5,
  },
  block: {
    marginBottom: 12,
    padding: 10,
    borderRadius: 5,
  },
  userBlock: {
    backgroundColor: "#f2f7ff",
  },
  botBlock: {
    backgroundColor: "#e8efff",
  },
  sender: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  content: {
    marginLeft: 5,
  },
});

// Parse **bold** text in PDF
function parseBold(text: string): JSX.Element[] {
  const parts = text.split(/(\*\*.*?\*\*)/);
  return parts.map((part, idx) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <Text key={idx} style={{ fontWeight: "bold" }}>
        {part.slice(2, -2)}
      </Text>
    ) : (
      <Text key={idx}>{part}</Text>
    )
  );
}

// PDF Component with capitalized role labels
const ChatHistoryPDF = ({ messages }: { messages: Message[] }) => (
  <Document>
    <Page size="A4" style={pdfStyles.page}>
      {messages.map((msg, idx) => (
        <Text
          key={idx}
          style={[
            pdfStyles.block,
            msg.role === "user" ? pdfStyles.userBlock : pdfStyles.botBlock,
          ]}
        >
          <Text style={pdfStyles.sender}>
            {msg.role === "user" ? "User:" : "Assistant:"}
          </Text>
          {"\n"}
          <Text style={pdfStyles.content}>{parseBold(msg.content)}</Text>
        </Text>
      ))}
    </Page>
  </Document>
);

// Types
export type Message = {
  content: string;
  role: "user" | "assistant" | "system";
};

// Main Component
export default function ChatbotWithJapanesePDF() {
  const [showChat, setShowChat] = useState(false);
  const [userMessage, setUserMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "こんにちは！なにかおてつだいできますか？\n(Hello! How can I help you?)",
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const hints = [
    "💬 Open Chat",
    "💡 Ask me anything...",
    "🧠 Any doubts?",
    "📄 Need a plan?",
    "🈶 Learn Japanese today!",
    "📘 What's 'hello' in Japanese?",
    "🎌 Translate Japanese to English!",
    "📝 Get your chat as a PDF!",
    "🧩 Confused with grammar?",
    "🚀 Boost your Nihongo skills!",
    "🤔 Unsure about a word? Ask me!",
    "📚 Get study tips in Japanese!",
    "⏳ Save chat & study later!",
    "📄 Get a plan for JLPT practice!",
    "🔖 Learn a daily phrase!",
  ];
  const [currentHint, setCurrentHint] = useState(0);
  const [showHint, setShowHint] = useState(false);

  // Rotate hints
  useEffect(() => {
    let showTimeout: NodeJS.Timeout;
    let hideTimeout: NodeJS.Timeout;

    const cycleHint = () => {
      setCurrentHint((prev) => (prev + 1) % hints.length);
      setShowHint(true);
      hideTimeout = setTimeout(() => {
        setShowHint(false);
        const randomGap = Math.floor(Math.random() * (8000 - 5000 + 1)) + 5000;
        showTimeout = setTimeout(cycleHint, randomGap);
      }, 3000);
    };

    cycleHint();

    return () => {
      clearTimeout(showTimeout);
      clearTimeout(hideTimeout);
    };
  }, []);

  // Auto scroll
  useEffect(() => {
    const timer = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
    return () => clearTimeout(timer);
  }, [messages, loading]);

  // Send message
  const handleSendMessage = async (
    e: FormEvent | KeyboardEvent<HTMLTextAreaElement>
  ) => {
    e.preventDefault?.();
    if (!userMessage.trim()) return;

    const newMessage: Message = { role: "user", content: userMessage };
    setMessages((prev) => [...prev, newMessage]);
    setUserMessage("");
    setLoading(true);

    try {
      const chatMessages = messages.slice(1);
      const res = await chatCompletion([...chatMessages, newMessage]);
      setTimeout(() => {
        const assistantContent = res?.choices?.[0]?.message?.content;
        if (assistantContent) {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: assistantContent },
          ]);
        }
        setLoading(false);
      }, 1500);
    } catch (err) {
      console.error("Chat API Error:", err);
      setLoading(false);
    }
  };

  const hasChat = messages.length > 1;

  return (
    <>
      {/* Floating Toggle */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
        <AnimatePresence mode="wait">
          {!showChat && showHint && (
            <motion.div
              key={currentHint}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="text-[#7494EC] text-xs bg-[#ffffff] px-3 py-1 rounded shadow-md border-1"
            >
              {hints[currentHint]}
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setShowChat((prev) => !prev)}
          aria-label="Toggle Chat"
          title="Toggle Chat"
          className="w-20 h-20 flex items-center justify-center transition-transform duration-300 cursor-pointer"
        >
          <Lottie animationData={botAnimation} loop autoplay />
        </button>
      </div>

      {/* Chat Panel */}
      <div
        className={`fixed right-4 bottom-[100px] sm:bottom-[90px] w-[95%] sm:w-[400px] h-[80vh] rounded-lg border border-[#7494EC] bg-white shadow-2xl z-40 flex flex-col transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          showChat
            ? "opacity-100 scale-100 translate-x-0"
            : "opacity-0 scale-95 translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="border-b border-[#7494EC] px-4 py-3 flex items-center justify-between bg-[#7494EC] text-white rounded-t-lg">
          <h2 className="text-base font-semibold">Chatbot</h2>
          <div className="flex items-center gap-3">
            {hasChat && (
              <PDFDownloadLink
                document={<ChatHistoryPDF messages={messages} />}
                fileName="chat_history.pdf"
                title="Download Chat"
                className="text-white cursor-pointer"
              >
                <HiOutlineDocumentDownload size={20} />
              </PDFDownloadLink>
            )}
            <button
              onClick={() => setShowChat(false)}
              aria-label="Close Chat"
              title="Close Chat"
              className="text-white cursor-pointer"
            >
              <HiOutlineX size={20} />
            </button>
          </div>
        </div>

        {/* Messages with icons only */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <AnimatePresence initial={false}>
            {messages.map((msg, idx) => {
              const isUser = msg.role === "user";
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  className={`flex items-start gap-2 ${
                    isUser ? "justify-end" : "justify-start"
                  }`}
                >
                  {isUser ? (
                    <HiUser className="text-[#2563EB]" size={20} />
                  ) : (
                    <HiChatAlt2 className="text-[#7494EC]" size={20} />
                  )}

                  {isUser ? <UserMessage {...msg} /> : <BotMessage {...msg} />}
                </motion.div>
              );
            })}
          </AnimatePresence>
          {loading && <LoadingMessage />}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-[#7494EC] px-4 py-3">
          <form
            onSubmit={handleSendMessage}
            className="flex items-center gap-2"
          >
            <textarea
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
              rows={1}
              placeholder="Type a message..."
              className="flex-1 resize-none rounded-md border border-[#7494EC] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7494EC]"
            />
            <button
              type="submit"
              className="rounded-md bg-[#7494EC] px-4 py-2 text-white hover:bg-[#5c7cdb] transition shadow-sm cursor-pointer"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
