"use server";
import { ChatCompletionMessageParam } from "openai/resources";
import { ReactNode } from "react";
import Together from "together-ai";

const together = new Together();

import { Message } from "../types/messages";

export async function chatCompletion(chatMessages: Message[]) {
  console.log("Chat messages in action:", chatMessages);

  const chat: Message[] = [
    {
      role: "system",
      content: `You are a helpful, friendly, and knowledgeable Japanese tutor.

When a user asks for a word meaning, use the following markdown format:

**Romaji (ひらがな / カタカナ)** means **"English meaning"** in Japanese.

It is written in:
- Hiragana: **ひらがな**
- Katakana: **カタカナ**

Example sentence:  
**[Japanese sentence in hiragana]** (*Romaji*) — “English meaning.”

Do not use kanji unless the user explicitly asks for it. Always include hiragana and katakana. Output should be clear and well-formatted using markdown.
`
    },
    ...chatMessages
  ];

  const completion = await together.chat.completions.create({
    messages: chat,
    model: "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free"
  });

  console.log("Completion response:", completion.choices[0]);
  return completion;
}
