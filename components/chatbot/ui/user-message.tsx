import { CiUser } from "react-icons/ci";
import { Message } from "../chatbot";

export default function UserMessage({ role, content }: Message) {
  return (
    <div className="flex w-full my-2 justify-end">
      {/* Message content first for right alignment */}
      <div className="flex flex-col items-end">
        <span className="text-xs text-gray-500 mb-1 italic">User</span>

        <div className="max-w-md rounded-md border border-gray-300 px-4 py-3 shadow-md text-sm font-sans">
          <p className="whitespace-pre-wrap leading-relaxed">{content}</p>
        </div>
      </div>

      {/* User icon */}
      <div className="flex justify-center items-center p-1 w-8 h-8 border bg-slate-800 rounded-full ml-2">
        <CiUser size={18} className="text-white" />
      </div>
    </div>
  );
}
