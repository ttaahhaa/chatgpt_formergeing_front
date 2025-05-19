"use client";

import { useState, useEffect, useRef, useCallback, memo } from "react";
import { api } from "@/services/api";
import ReactMarkdown from "react-markdown";
import { SearchIcon } from "@/assets/icons";
import ChatBubble from "@/components/Chat/ChatBubble";
import TextareaAutosize from 'react-textarea-autosize';
import { useChat } from "@/contexts/ChatContext";

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp?: string;
    sources?: { document: string; relevance: number }[];
    isStreaming?: boolean;
}

const ChatInput = memo(function ChatInput({
    onSubmit,
    disabled
}: {
    onSubmit: (message: string) => void;
    disabled: boolean;
}) {
    const [inputValue, setInputValue] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleSubmit = useCallback((e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!inputValue.trim()) return;
        onSubmit(inputValue);
        setInputValue("");
    }, [inputValue, onSubmit]);

    return (
        <form onSubmit={handleSubmit} className="mt-4">
            <div className="relative flex items-center">
                <TextareaAutosize
                    ref={textareaRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Ask anything..."
                    disabled={disabled}
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

                <button
                    type="submit"
                    disabled={disabled || !inputValue.trim()}
                    className="absolute right-6 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full p-2 flex items-center justify-center transition-colors bg-gray-200 hover:bg-gray-300 dark:bg-dark-3 dark:hover:bg-dark-4 disabled:opacity-50"
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
    );
});

const StreamingChatTab = memo(function StreamingChatTab({
    conversationId,
    onConversationChange
}: {
    conversationId: string | null;
    onConversationChange?: (newConversationId: string) => void;
}) {
    const { state, dispatch } = useChat();
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState<"auto" | "documents_only" | "general_knowledge">("auto");
    const [isLoadingConversation, setIsLoadingConversation] = useState(false);
    const [isClient, setIsClient] = useState(false);

    const abortControllerRef = useRef<AbortController | null>(null);
    const streamingMessageRef = useRef<string>("");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const previousConversationIdRef = useRef<string | null>(null);

    // Set isClient to true after component mounts
    useEffect(() => {
        setIsClient(true);
    }, []);

    // Load saved mode preference
    useEffect(() => {
        if (!isClient) return;
        const savedMode = localStorage.getItem("chat_mode");
        if (savedMode) {
            setMode(savedMode as "auto" | "documents_only" | "general_knowledge");
        }
    }, [isClient]);

    // Save mode preference when changed
    useEffect(() => {
        if (!isClient) return;
        localStorage.setItem("chat_mode", mode);
    }, [mode, isClient]);

    // Scroll to bottom when messages change
    useEffect(() => {
        if (messagesEndRef.current && scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
        }
    }, [state.messages]);

    // Handle conversation ID changes
    useEffect(() => {
        if (!conversationId || previousConversationIdRef.current === conversationId) {
            previousConversationIdRef.current = conversationId;
            return;
        }

        const handleConversationChange = async () => {
            setIsLoadingConversation(true);
            dispatch({ type: 'CLEAR_MESSAGES' });
            dispatch({ type: 'SET_ERROR', payload: null });

            try {
                const data = await api.getConversation(conversationId);
                if (Array.isArray(data.messages)) {
                    dispatch({ type: 'SET_MESSAGES', payload: data.messages });
                } else {
                    dispatch({ type: 'SET_MESSAGES', payload: [] });
                }
            } catch (err: any) {
                console.error("StreamingChatTab: Error loading conversation:", err);
                dispatch({ type: 'SET_ERROR', payload: `Failed to load conversation: ${err.message}` });
            } finally {
                setIsLoadingConversation(false);
            }

            previousConversationIdRef.current = conversationId;
        };

        handleConversationChange();
    }, [conversationId, dispatch]);

    const handleSubmit = useCallback(async (userMessage: string) => {
        if (state.isStreaming) return;

        let currentConversationId = conversationId;
        setLoading(true);
        dispatch({ type: 'SET_ERROR', payload: null });

        try {
            // If no conversation exists, create a new one
            if (!currentConversationId) {
                const response = await api.createNewConversation();
                currentConversationId = response.conversation_id;
                if (onConversationChange) {
                    onConversationChange(currentConversationId);
                }
            }

            // Add user message
            const newUserMessage: Message = {
                role: 'user',
                content: userMessage,
                timestamp: new Date().toISOString()
            };

            dispatch({ type: 'ADD_MESSAGE', payload: newUserMessage });

            // Create placeholder for assistant response
            streamingMessageRef.current = "";
            const streamingMessage: Message = {
                role: 'assistant',
                content: '',
                timestamp: new Date().toISOString(),
                isStreaming: true
            };

            dispatch({ type: 'ADD_MESSAGE', payload: streamingMessage });
            dispatch({ type: 'SET_STREAMING', payload: true });

            // Create abort controller for this request
            const { controller, signal } = api.createAbortController();
            abortControllerRef.current = controller;

            await api.streamChatWithAbort(
                {
                    message: userMessage,
                    conversation_id: currentConversationId || undefined,
                    mode: mode,
                },
                {
                    onToken: (token) => {
                        streamingMessageRef.current += token;
                        dispatch({
                            type: 'UPDATE_LAST_MESSAGE',
                            payload: { content: streamingMessageRef.current }
                        });
                    },
                    onComplete: (sources) => {
                        dispatch({
                            type: 'UPDATE_LAST_MESSAGE',
                            payload: {
                                isStreaming: false,
                                sources: sources
                            }
                        });

                        const preview = userMessage.slice(0, 50) + (userMessage.length > 50 ? "..." : "");
                        localStorage.setItem(`conversation_preview_${currentConversationId}`, preview);
                    },
                    onError: (errMsg) => {
                        dispatch({ type: 'SET_ERROR', payload: errMsg });
                        dispatch({
                            type: 'SET_MESSAGES', payload: state.messages.filter((msg, idx) =>
                                !(idx === state.messages.length - 1 && msg.isStreaming)
                            )
                        });
                    }
                },
                signal
            );
        } catch (err: any) {
            console.error('Streaming error:', err);
            if (err.name !== 'AbortError') {
                dispatch({ type: 'SET_ERROR', payload: err.message || 'Failed to stream message' });
            }
        } finally {
            dispatch({ type: 'SET_STREAMING', payload: false });
            setLoading(false);
            abortControllerRef.current = null;
        }
    }, [conversationId, state.isStreaming, mode, onConversationChange, dispatch, state.messages]);

    if (!isClient) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-primary rounded-full animate-bounce"></div>
                    <div className="w-4 h-4 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                    <div className="w-4 h-4 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
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
                ) : state.messages.length === 0 && !loading ? (
                    <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 dark:text-gray-500">
                        <h2 className="text-lg font-medium">How can I help?</h2>
                        <p className="text-sm mt-1">Ask a question or start a new conversation.</p>
                    </div>
                ) : (
                    state.messages.map((message, index) => (
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

                {state.error && (
                    <div className="text-red-600 text-sm text-center p-2 bg-red-50 dark:bg-red-900/20 rounded">
                        {state.error}
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input form */}
            <ChatInput
                onSubmit={handleSubmit}
                disabled={loading || isLoadingConversation || state.isStreaming}
            />
        </div>
    );
});

export default StreamingChatTab; 