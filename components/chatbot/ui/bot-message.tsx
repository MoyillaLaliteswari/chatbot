"use client";

import { RiRobot3Line } from "react-icons/ri";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// 🛠 Custom Markdown Component Mapping
const mdComponents = {
  h2: ({ node, ...props }: any) => (
    <h2
      className="font-bold italic underline text-blue-800 flex items-center gap-1 mb-2"
      {...props}
    >
      📘 {props.children}
    </h2>
  ),
  h3: ({ node, ...props }: any) => (
    <h3
      className="font-semibold italic text-gray-800 flex items-center gap-1 mb-1"
      {...props}
    >
      📝 {props.children}
    </h3>
  ),
  li: ({ node, ordered, ...props }: any) => (
    <li className="ml-4 list-disc list-inside text-gray-800" {...props} />
  ),
  blockquote: ({ node, ...props }: any) => (
    <blockquote
      className="border-l-4 border-blue-300 bg-blue-50 p-2 pl-4 italic text-gray-600"
      {...props}
    />
  ),
  code: ({ node, inline, className, children, ...props }: any) => (
    <code
      className={`bg-gray-100 px-1 py-0.5 rounded text-pink-700 font-mono text-xs ${
        inline ? "" : "block p-2"
      }`}
      {...props}
    >
      {children}
    </code>
  ),
};

export default function BotMessage({
  role,
  content,
}: {
  role: string;
  content: string; // ✅ Always markdown string
}) {
  return (
    <div className="flex w-full my-2">
      {/* Bot icon */}
      <div className="flex justify-center items-center p-1 w-8 h-8 border bg-slate-800 rounded-full mr-2">
        <RiRobot3Line size={18} className="text-white" />
      </div>

      {/* Message content */}
      <div className="flex flex-col">
        <span className="text-xs text-gray-500 mb-1 italic">{role}</span>

        <div className="max-w-md rounded-md border border-gray-300 bg-gray-50 px-4 py-3 shadow-md text-sm font-sans">
          <div className="prose prose-sm leading-relaxed whitespace-pre-wrap">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={mdComponents as any}
            >
              {content}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}
