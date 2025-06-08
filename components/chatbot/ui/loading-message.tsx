"use client";

import { useEffect, useState } from "react";

const messages = [
  "おまちください... (Please wait...)",
  "ちょっとまってね〜 (Hold on a sec~)",
  "Thinking about your question 🤔",
  "Getting your answer ready…",
  "Processing… Please wait a moment.",
];

export default function LoadingMessage() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-sm rounded-md border px-4 py-2 text-sm text-gray-700 shadow">
      {messages[index]}
    </div>
  );
}
