"use client";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css"; // choose your preferred style

export default function ChatBubble({
    message,
    isUser,
}: {
    message: string;
    isUser: boolean;
}) {
    return (
        <div className={`my-2 ${isUser ? "text-right" : "text-left"}`}>
            <div
                className={`inline-block px-4 py-3 rounded-xl max-w-2xl text-sm whitespace-pre-wrap ${isUser ? "bg-blue-600 text-white" : "bg-gray-800 text-white"
                    }`}
            >
                <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
                    {message}
                </ReactMarkdown>
            </div>
        </div>
    );
}