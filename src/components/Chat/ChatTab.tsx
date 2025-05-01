"use client";

import { useState, useEffect, useRef } from "react";
import { api } from "@/services/api";
import ReactMarkdown from "react-markdown";
import { SearchIcon } from "@/assets/icons";

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp?: string;
    sources?: { document: string; relevance: number }[];
}

export default function ChatTab({ conversationId }: { conversationId: string | null }) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mode, setMode] = useState<"auto" | "documents_only" | "general_knowledge">("auto");

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Load saved mode preference
    useEffect(() => {
        const savedMode = localStorage.getItem("chat_mode");
        if (savedMode) {
            setMode(savedMode as "auto" | "documents_only" | "general_knowledge");
        }
    }, []);

    // Save mode preference when changed
    useEffect(() => {
        localStorage.setItem("chat_mode", mode);
    }, [mode]);

    // Scroll to bottom when messages change
    useEffect(() => {
        if (messagesEndRef.current && scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
        }
    }, [messages]);

    // Load conversation messages when conversationId changes
    useEffect(() => {
        console.log("Conversation ID changed:", conversationId);

        if (!conversationId) {
            setMessages([]);
            return;
        }

        const loadMessages = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/conversations/${conversationId}`
                );

                if (!response.ok) {
                    if (response.status === 404) {
                        // New conversation
                        console.log("This is a new conversation");
                        setMessages([]);
                    } else {
                        throw new Error(`Failed to load conversation: ${response.status} ${response.statusText}`);
                    }
                    return;
                }

                const data = await response.json();
                console.log("Loaded conversation data:", data);

                if (Array.isArray(data.messages)) {
                    console.log(`Setting ${data.messages.length} messages`);
                    setMessages(data.messages);
                } else {
                    console.warn("No messages array in response");
                    setMessages([]);
                }
            } catch (err) {
                console.error("Error loading conversation:", err);
                setError("Failed to load conversation");
                setMessages([]);
            } finally {
                setLoading(false);
            }
        };

        loadMessages();
    }, [conversationId]);

    // Handle message submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!inputValue.trim()) {
            return;
        }

        if (!conversationId) {
            setError("Please create or select a conversation first");
            return;
        }

        const userMessage = inputValue;
        setInputValue('');

        // Add user message to chat
        const newUserMessage: Message = {
            role: 'user',
            content: userMessage,
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, newUserMessage]);
        setLoading(true);
        setError(null);

        try {
            // Prepare conversation context
            const context = messages.map(m => ({
                role: m.role,
                content: m.content
            }));

            // Send message to API
            const response = await api.chat({
                message: userMessage,
                conversation_id: conversationId,
                conversation_context: context,
                mode: mode,
            });

            if (!response.response?.trim()) {
                throw new Error("Received empty response from assistant");
            }

            // Add assistant response to chat
            const assistantMessage: Message = {
                role: 'assistant',
                content: response.response,
                sources: response.sources,
                timestamp: new Date().toISOString()
            };

            setMessages(prev => [...prev, assistantMessage]);

            // Save conversation
            await api.saveConversation({
                conversation_id: conversationId,
                preview: userMessage.slice(0, 50) + (userMessage.length > 50 ? "..." : ""),
                history: [...messages, newUserMessage, assistantMessage]
            });
        } catch (err: any) {
            console.error('Chat error:', err);
            setError(err.message || 'Failed to send message');
        } finally {
            setLoading(false);
        }
    };

    // Render empty state if no conversation is selected
    if (!conversationId) {
        return (
            <div className="flex flex-col items-center justify-center h-full">
                <div className="text-center">
                    <h2 className="text-2xl font-semibold mb-3">Welcome to the Chat Assistant</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Please select an existing conversation or create a new one to get started.
                    </p>
                    <div className="opacity-70">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="120"
                            height="120"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="mx-auto mb-4"
                        >
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                            <path d="M8 9h8"></path>
                            <path d="M8 13h6"></path>
                        </svg>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col w-full max-w-6xl mx-auto px-4 py-6 h-full">
            {/* Mode selector */}
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

            {/* Chat messages */}
            <div
                ref={scrollContainerRef}
                className="flex-1 overflow-y-auto px-2 space-y-4 mb-6"
                style={{ maxHeight: "calc(100vh - 280px)", minHeight: "300px" }}
            >
                {messages.length === 0 && !loading ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        Start a conversation...
                    </div>
                ) : (
                    messages.map((message, index) => (
                        <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                            <div
                                className={`max-w-3xl p-4 rounded-lg shadow text-sm ${message.role === "user"
                                    ? "bg-primary text-white"
                                    : "bg-white dark:bg-dark-3 dark:text-white"
                                    }`}
                            >
                                <div className="prose dark:prose-invert max-w-none">
                                    <ReactMarkdown>{message.content}</ReactMarkdown>
                                </div>

                                {message.sources && message.sources.length > 0 && (
                                    <div className="mt-3 border-t pt-2 text-xs">
                                        <p className="font-semibold mb-1">Sources:</p>
                                        <ul className="space-y-1">
                                            {message.sources.map((src, idx) => (
                                                <li key={idx} className="flex justify-between">
                                                    <span className="truncate">{src.document}</span>
                                                    <span className="ml-2">
                                                        {Math.round(src.relevance * 100)}%
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}

                {loading && (
                    <div className="flex justify-start">
                        <div className="p-4 bg-white dark:bg-dark-3 rounded-lg shadow">
                            <div className="flex gap-1">
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                            </div>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="text-red-600 text-sm text-center p-2 bg-red-50 dark:bg-red-900/20 rounded">
                        {error}
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input form */}
            <form onSubmit={handleSubmit} className="w-full mx-auto pb-4">
                <div className="relative flex items-center">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Ask anything..."
                        disabled={loading || !conversationId}
                        className="w-full rounded-full border border-gray-300 bg-white py-4 pl-[60px] pr-[60px] text-lg outline-none shadow-md focus:border-primary focus:ring-2 focus:ring-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white"
                    />
                    <div className="absolute left-6 top-1/2 -translate-y-1/2">
                        <SearchIcon className="size-6 text-gray-500 dark:text-gray-400" />
                    </div>
                    <button
                        type="submit"
                        disabled={loading || !inputValue.trim() || !conversationId}
                        className="absolute right-6 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-gray-200 p-2 flex items-center justify-center hover:bg-gray-300 dark:bg-dark-3 dark:hover:bg-dark-4 disabled:opacity-50"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            className="w-5 h-5"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M14 5l7 7m0 0l-7 7m7-7H3"
                            />
                        </svg>
                    </button>
                </div>
            </form>
        </div>
    );
}