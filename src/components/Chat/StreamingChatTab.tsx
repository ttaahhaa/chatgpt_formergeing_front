"use client";

import { useState, useEffect, useRef } from "react";
import { api } from "@/services/api";
import ReactMarkdown from "react-markdown";
import { SearchIcon } from "@/assets/icons";
import ChatBubble from "@/components/Chat/ChatBubble";
import TextareaAutosize from 'react-textarea-autosize';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp?: string;
    sources?: { document: string; relevance: number }[];
    isStreaming?: boolean;
}

export default function StreamingChatTab({ conversationId }: { conversationId: string | null }) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mode, setMode] = useState<"auto" | "documents_only" | "general_knowledge">("auto");
    const [isLoadingConversation, setIsLoadingConversation] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);

    const abortControllerRef = useRef<AbortController | null>(null);
    const streamingMessageRef = useRef<string>("");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Track previous conversation ID to detect changes
    const previousConversationIdRef = useRef<string | null>(null);

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

    // Handle conversation ID changes
    useEffect(() => {
        if (!conversationId || previousConversationIdRef.current === conversationId) {
            previousConversationIdRef.current = conversationId;
            return;
        }

        const handleConversationChange = async () => {
            setIsLoadingConversation(true);
            setMessages([]);
            setError(null);

            try {
                const data = await api.getConversation(conversationId);
                if (Array.isArray(data.messages)) {
                    setMessages(data.messages);
                } else {
                    setMessages([]);
                }
            } catch (err: any) {
                console.error("Error loading conversation:", err);
                setError(`Failed to load conversation: ${err.message}`);
            } finally {
                setIsLoadingConversation(false);
            }

            previousConversationIdRef.current = conversationId;
        };

        handleConversationChange();
    }, [conversationId]);

    // Handle message submission with streaming
    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        if (!inputValue.trim() || isStreaming) {
            return;
        }

        if (!conversationId) {
            setError("Please create or select a conversation first");
            return;
        }

        const userMessage = inputValue;
        setInputValue('');

        // Add user message
        const newUserMessage: Message = {
            role: 'user',
            content: userMessage,
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, newUserMessage]);
        setError(null);
        setIsStreaming(true);

        // Create placeholder for assistant response
        streamingMessageRef.current = "";
        const streamingMessage: Message = {
            role: 'assistant',
            content: '',
            timestamp: new Date().toISOString(),
            isStreaming: true
        };

        setMessages(prev => [...prev, streamingMessage]);

        // Create abort controller for this request
        const { controller, signal } = api.createAbortController();
        abortControllerRef.current = controller;

        try {
            await api.streamChatWithAbort(
                {
                    message: userMessage,
                    conversation_id: conversationId,
                    mode: mode,
                },
                {
                    onToken: (token) => {
                        // Add token to streaming message
                        streamingMessageRef.current += token;

                        // Update the last message
                        setMessages(prev => {
                            const updated = [...prev];
                            const lastMessage = updated[updated.length - 1];
                            if (lastMessage.role === 'assistant' && lastMessage.isStreaming) {
                                lastMessage.content = streamingMessageRef.current;
                            }
                            return updated;
                        });
                    },
                    onComplete: (sources) => {
                        // Finalize the streaming message
                        setMessages(prev => {
                            const updated = [...prev];
                            const lastMessage = updated[updated.length - 1];
                            if (lastMessage.role === 'assistant' && lastMessage.isStreaming) {
                                lastMessage.isStreaming = false;
                                lastMessage.sources = sources;
                            }
                            return updated;
                        });

                        // Save the conversation
                        const preview = userMessage.slice(0, 50) + (userMessage.length > 50 ? "..." : "");
                        localStorage.setItem(`conversation_preview_${conversationId}`, preview);

                        // Note: The conversation is saved on the backend automatically after streaming completes
                    },
                    onError: (errMsg) => {
                        setError(errMsg);
                        // Remove the streaming message if there was an error
                        setMessages(prev => prev.filter((msg, idx) => !(idx === prev.length - 1 && msg.isStreaming)));
                    }
                },
                signal
            );
        } catch (err: any) {
            console.error('Streaming error:', err);

            if (err.name !== 'AbortError') {
                // Only show error if not manually aborted
                setError(err.message || 'Failed to stream message');
            }
        } finally {
            setIsStreaming(false);
            abortControllerRef.current = null;
        }
    };

    // Stop streaming
    const stopStreaming = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            setIsStreaming(false);
        }
    };

    // Render empty state
    if (!conversationId) {
        return (
            <div className="flex flex-col items-center justify-center h-full">
                <div className="text-center">
                    <h2 className="text-2xl font-semibold mb-3">Welcome to the Chat Assistant</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Please select an existing conversation or create a new one to get started.
                    </p>
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
                className="flex-1 overflow-y-auto px-2 space-y-4 mb-4"
                style={{ maxHeight: "calc(100vh - 340px)", minHeight: "200px" }}
            >
                {isLoadingConversation ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 bg-primary rounded-full animate-bounce"></div>
                            <div className="w-4 h-4 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                            <div className="w-4 h-4 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                        </div>
                    </div>
                ) : messages.length === 0 && !loading ? (
                    <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 dark:text-gray-500">
                        <h2 className="text-lg font-medium">How can I help?</h2>
                        <p className="text-sm mt-1">Ask a question or start a new conversation.</p>
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
                                {message.isStreaming ? (
                                    <div className="relative">
                                        <ChatBubble message={message.content} isUser={false} />
                                        <div className="absolute top-0 right-0">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                        </div>
                                    </div>
                                ) : (
                                    <ChatBubble message={message.content} isUser={message.role === "user"} />
                                )}

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
                    <TextareaAutosize
                        ref={textareaRef}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Ask anything..."
                        disabled={loading || !conversationId || isLoadingConversation || isStreaming}
                        minRows={1}
                        maxRows={8}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit(e);
                            }
                        }}
                        className="w-full rounded-xl border border-gray-300 bg-white py-4 pl-[60px] pr-[60px] text-lg outline-none shadow-md focus:border-primary focus:ring-2 focus:ring-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white resize-none overflow-y-auto"
                    />
                    <div className="absolute left-6 top-1/2 -translate-y-1/2">
                        <SearchIcon className="size-6 text-gray-500 dark:text-gray-400" />
                    </div>

                    {/* Submit/Stop button */}
                    <button
                        type={isStreaming ? "button" : "submit"}
                        onClick={isStreaming ? stopStreaming : undefined}
                        disabled={loading || !conversationId || isLoadingConversation || (!isStreaming && !inputValue.trim())}
                        className={`absolute right-6 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full p-2 flex items-center justify-center transition-colors ${isStreaming
                                ? "bg-red-500 hover:bg-red-600 text-white"
                                : "bg-gray-200 hover:bg-gray-300 dark:bg-dark-3 dark:hover:bg-dark-4"
                            } disabled:opacity-50`}
                    >
                        {isStreaming ? (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="w-5 h-5"
                            >
                                <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M6 6h12v12H6V6z"
                                />
                            </svg>
                        ) : (
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
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
} 