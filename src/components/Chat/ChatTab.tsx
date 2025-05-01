"use client";

import { useState, useEffect, useRef } from "react";
import { api } from "@/services/api";
import ReactMarkdown from "react-markdown";
import Image from "next/image";
import { SearchIcon } from "@/assets/icons";

export default function ChatTab({ conversationId }: { conversationId: string | null }) {
    const [messages, setMessages] = useState<any[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mode, setMode] = useState<"auto" | "documents_only" | "general_knowledge">("auto");

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const prevConversationId = useRef<string | null>(null);

    // Scroll on new messages
    useEffect(() => {
        if (messagesEndRef.current && scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
        }
    }, [messages]);

    // Load mode once
    useEffect(() => {
        const savedMode = localStorage.getItem("chat_mode");
        if (savedMode) setMode(savedMode as typeof mode);
    }, []);

    useEffect(() => {
        localStorage.setItem("chat_mode", mode);
    }, [mode]);

    // Save previous conversation on ID change
    useEffect(() => {
        const savePrevConversation = async () => {
            const prevId = prevConversationId.current;
            if (prevId && messages.length > 0) {
                try {
                    await api.saveConversation({
                        conversation_id: prevId,
                        preview: messages[0]?.content?.slice(0, 100) || "Conversation",
                        history: messages,
                    });
                } catch (err) {
                    console.error("Failed to save previous conversation:", err);
                }
            }
        };

        savePrevConversation().then(() => {
            setMessages([]);
            prevConversationId.current = conversationId;
        });
    }, [conversationId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!inputValue.trim()) {
            console.warn("Empty input, skipping submit.");
            return;
        }

        if (!conversationId) {
            console.error("No conversationId provided.");
            setError("⚠ Please create or select a conversation first.");
            return;
        }

        const userMessage = inputValue;
        setInputValue('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setLoading(true);
        setError(null);

        try {
            console.log("Submitting message:", {
                message: userMessage,
                conversationId,
                mode,
            });

            const context = messages.map(m => ({ role: m.role, content: m.content }));

            const response = await api.chat({
                message: userMessage,
                conversation_id: conversationId,
                conversation_context: context,
                mode: mode,
            });

            console.log("API Response:", response);

            if (!response.response?.trim()) {
                console.warn("Received empty response from API.");
                setError("⚠ Assistant responded with an empty message.");
                return;
            }

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: response.response,
                sources: response.sources,
            }]);
        } catch (err: any) {
            console.error('Chat error:', err);
            setError(err.message || '❌ Failed to send message. Please try again.');
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="flex flex-col w-full max-w-6xl mx-auto px-4 py-10 h-full">
            <div className="mb-6 flex justify-center items-center">
                <h1 className="text-2xl font-semibold text-gray-800 dark:text-white text-center">
                    Ready when you are.
                </h1>
            </div>

            {/* Radio Options */}
            <div className="mb-5 flex items-center justify-center gap-6 flex-wrap">
                {["auto", "documents_only", "general_knowledge"].map((opt) => (
                    <label
                        key={opt}
                        className="inline-flex items-center gap-2 text-sm font-medium text-gray-800 dark:text-gray-200"
                    >
                        <input
                            type="radio"
                            name="knowledgeSource"
                            value={opt}
                            checked={mode === opt}
                            onChange={() => setMode(opt as typeof mode)}
                            className="text-primary focus:ring-primary"
                        />
                        {opt === "auto" && "Auto (Recommended)"}
                        {opt === "documents_only" && "Documents Only"}
                        {opt === "general_knowledge" && "General Knowledge Only"}
                    </label>
                ))}
            </div>

            {/* Chat History */}
            <div
                ref={scrollContainerRef}
                className="flex-1 overflow-y-auto px-2 space-y-4 mb-6"
                style={{ maxHeight: "50vh", minHeight: "30vh" }}
            >
                {messages.map((message, index) => (
                    <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div
                            className={`max-w-2xl p-4 rounded-lg shadow text-sm whitespace-pre-wrap ${message.role === "user"
                                ? "bg-primary text-white"
                                : "bg-white dark:bg-dark-3 dark:text-white"
                                }`}
                        >
                            <div className="prose dark:prose-invert">
                                <ReactMarkdown>{message.content}</ReactMarkdown>
                            </div>
                            {message.sources?.length > 0 && (
                                <div className="mt-3 border-t pt-2 text-xs text-gray-500 dark:text-gray-400">
                                    <p className="font-semibold mb-1">Sources:</p>
                                    <ul>
                                        {message.sources.map((src: any, idx: number) => (
                                            <li key={idx} className="flex justify-between">
                                                <span>{src.document}</span>
                                                <span>{Math.round(src.relevance * 100)}%</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="p-4 bg-white dark:bg-dark-3 rounded-lg shadow">
                            <div className="flex gap-1 animate-bounce">
                                <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                            </div>
                        </div>
                    </div>
                )}
                {error && <div className="text-red-600 text-sm text-center">{error}</div>}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="w-full mx-auto pb-8">
                <div className="relative flex items-center max-w-6xl mx-auto">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Ask anything..."
                        disabled={loading}
                        className="w-full rounded-full border border-gray-300 bg-white py-5 pl-[60px] pr-[60px] text-lg outline-none shadow-md transition-all focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus-visible:border-primary dark:focus-visible:ring-primary"
                    />
                    <div className="absolute left-6 top-1/2 -translate-y-1/2">
                        <SearchIcon className="size-6 text-gray-500 dark:text-gray-400" />
                    </div>
                    <button
                        type="submit"
                        className="absolute right-6 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-gray-200 p-2 flex items-center justify-center hover:bg-gray-300 dark:bg-dark-3 dark:hover:bg-dark-4"
                    >
                        <Image src="/images/query/plus.png" alt="Send" width={20} height={20} />
                    </button>
                </div>
            </form>
        </div>
    );
}
