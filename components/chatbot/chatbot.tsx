"use client";

import { FormEvent, useState } from "react";
import { TbMessageChatbot } from "react-icons/tb";
import BotMessage from "./ui/bot-message";
import UserMessage from "./ui/user-message";
import ChatInput from "./ui/chat-input";
import { chatCompletion } from "@/../actions/index";

// 📝  PDF helpers 
import {
  Document,
  Page,
  Text,
  StyleSheet,
  Font,
  PDFDownloadLink,
} from "@react-pdf/renderer";

// Import your LoadingMessage component
import LoadingMessage from "./ui/loading-message"; // adjust path if needed

// Register a font that supports Japanese (Google Noto Sans JP)
Font.register({
  family: "NotoSansJP",
  src: "/fonts/NotoSansJP-Regular.ttf",
});

// PDF styles
const pdfStyles = StyleSheet.create({
  page: {
    fontFamily: "NotoSansJP",
    padding: 32,
    fontSize: 12,
    lineHeight: 1.4,
  },
  line: {
    marginBottom: 8,
    wordBreak: "break-all",
  },
});

export type Message = {
  content: string;
  role: "user" | "assistant" | "system";
};

// Component that turns the in‑memory chat history into a PDF document
const ChatHistoryPDF = ({ messages }: { messages: Message[] }) => (
  <Document>
    <Page size="A4" style={pdfStyles.page} wrap>
      {messages.map((msg, idx) => {
        const sender =
          msg.role === "assistant" ? "Assistant" : msg.role === "user" ? "User" : "System";
        return (
          <Text key={idx} style={pdfStyles.line}>
            {sender}: {msg.content}
          </Text>
        );
      })}
    </Page>
  </Document>
);

// -----------------------------------------------------------------------------
// Main chatbot component
// -----------------------------------------------------------------------------
export default function ChatbotWithJapanesePDF() {
  const [showChat, setShowChat] = useState(false);
  const [userMessage, setUserMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "こんにちは！ なにかおてつだいできますか？" },
  ]);

  // Submit handler ------------------------------------------------------------
  const handleSendMessage = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userMessage.trim()) return;

    const newMessage: Message = { role: "user", content: userMessage };
    setMessages((prev) => [...prev, newMessage]);
    setUserMessage("");
    setLoading(true);

    try {
      const chatMessages = messages.slice(1); // skip initial welcome for context
      const res = await chatCompletion([...chatMessages, newMessage]);

      if (res?.choices?.[0]?.message?.content) {
        const assistantMessage: Message = {
          role: "assistant",
          content: res.choices[0].message.content,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error("OpenAI API error:", error);
    } finally {
      setLoading(false);
    }
  };

  const hasChat = messages.length > 1; // once the user has replied at least once

  // ---------------------------------------------------------------------------
  // UI ------------------------------------------------------------------------
  return (
    <>
      {/* Floating toggle button */}
      <TbMessageChatbot
        size={64}
        onClick={() => setShowChat(!showChat)}
        className="fixed right-12 bottom-[calc(1rem)] cursor-pointer z-50"
      />

      {/* Chat window */}
      {showChat && (
        <div className="fixed right-12 bottom-[calc(4rem+1.5rem)] h-[474px] w-[500px] rounded-md border bg-white p-5 shadow-md z-50">
          <div className="flex h-full flex-col">
            {/* Header */}
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Chatbot</h2>
              <p className="text-sm text-gray-500">Powered by OpenAI</p>
            </div>

            {/* Messages */}
            <div className="mt-5 flex flex-1 flex-col items-center overflow-y-auto p-2 space-y-2">
              {messages.map((m, i) =>
                m.role === "assistant" ? (
                  <BotMessage {...m} key={i} />
                ) : (
                  <UserMessage {...m} key={i} />
                )
              )}
              {loading && <LoadingMessage />}
            </div>

            {/* Download button (renders PDF client‑side) */}
            {hasChat && (
              <PDFDownloadLink
                document={<ChatHistoryPDF messages={messages} />}
                fileName="chat_history.pdf"
                className="mb-2 inline-block rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 text-center"
              >
                {({ loading: pdfLoading }: { loading: boolean }) =>
                  pdfLoading ? "Preparing PDF…" : "Download Chat as PDF"
                }
              </PDFDownloadLink>
            )}

            {/* Input */}
            <ChatInput
              userMessage={userMessage}
              setUserMessage={setUserMessage}
              handleSendMessage={handleSendMessage}
            />
          </div>
        </div>
      )}
    </>
  );
}
