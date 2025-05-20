// src/components/Chat/ChatArea.tsx
"use client";

import { useState, useEffect, useRef, useCallback, memo } from "react";
import { api } from "@/services/api";
import { SearchIcon } from "@/assets/icons";
import ChatBubble from "@/components/Chat/ChatBubble";
import TextareaAutosize from 'react-textarea-autosize';
import { useConversation, Message } from "@/contexts/ConversationContext";

interface RetryPayload {
    message: string;
}

// Typing indicator component for streaming messages
const TypingIndicator = () => (
    <div className="flex space-x-1.5 mt-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0s" }}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
    </div>
);

// Input component
const ChatInput = memo(function ChatInput({
    onSubmit,
    disabled,
    placeholder = "Ask anything..."
}: {
    onSubmit: (message: string) => void;
    disabled: boolean;
    placeholder?: string;
}) {
    const [inputValue, setInputValue] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleSubmit = useCallback((e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!inputValue.trim()) return;
        onSubmit(inputValue);
        setInputValue("");
    }, [inputValue, onSubmit]);

    // Focus input on mount
    useEffect(() => {
        if (textareaRef.current && !disabled) {
            textareaRef.current.focus();
        }
    }, [disabled]);

    return (
        <form onSubmit={handleSubmit} className="mt-4">
            <div className="relative flex items-center">
                <TextareaAutosize
                    ref={textareaRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={placeholder}
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

// Empty state component
const EmptyState = memo(function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 dark:text-gray-500 px-4">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-16 h-16 mb-6 text-gray-300 dark:text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.5"
            >
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8-1.364 0-2.646-.273-3.778-.76L3 21l1.846-4.615A7.966 7.966 0 0 1 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <h2 className="text-xl font-medium mb-2">How can I help you today?</h2>
            <p className="max-w-md">Ask me anything about your documents, or any general knowledge questions.</p>
            <div className="mt-8 grid gap-4 max-w-md w-full">
                <button className="p-3 border border-gray-300 dark:border-gray-700 rounded-lg text-left hover:bg-gray-50 dark:hover:bg-dark-3 transition-colors">
                    <span className="font-medium text-gray-700 dark:text-gray-300">Explain the Saudi legal system</span>
                </button>
                <button className="p-3 border border-gray-300 dark:border-gray-700 rounded-lg text-left hover:bg-gray-50 dark:hover:bg-dark-3 transition-colors">
                    <span className="font-medium text-gray-700 dark:text-gray-300">Summarize document trends and patterns</span>
                </button>
                <button className="p-3 border border-gray-300 dark:border-gray-700 rounded-lg text-left hover:bg-gray-50 dark:hover:bg-dark-3 transition-colors">
                    <span className="font-medium text-gray-700 dark:text-gray-300">How do I upload more documents?</span>
                </button>
            </div>
        </div>
    );
});

export default function ChatArea() {
    const { state: conversationState, createConversation } = useConversation();
    const [messages, setMessages] = useState<Message[]>([]);
    const [isStreaming, setIsStreaming] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [retryPayload, setRetryPayload] = useState<RetryPayload | null>(null);
    const [mode, setMode] = useState<"auto" | "documents_only" | "general_knowledge">("auto");

    const abortControllerRef = useRef<AbortController | null>(null);
    const streamingMessageRef = useRef<string>("");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const currentConversationIdRef = useRef<string | null>(null);

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

    // Load conversation when selected conversation changes
    useEffect(() => {
        const selectedId = conversationState.selectedConversationId;
        
        // Update the current conversation id ref
        currentConversationIdRef.current = selectedId;
        
        if (!selectedId) {
            setMessages([]);
            return;
        }

        const loadConversation = async () => {
            try {
                setIsLoading(true);
                setError(null);
                
                const response = await api.getConversation(selectedId);
                if (Array.isArray(response.messages)) {
                    setMessages(response.messages);
                } else {
                    setMessages([]);
                }
            } catch (err: any) {
                console.error("Error loading conversation:", err);
                setError(err.message || "Failed to load conversation");
                
                // If conversation not found, create a new one
                if (err.message && err.message.includes("not found")) {
                    try {
                        const newId = await createConversation();
                        if (newId) {
                            // Don't need to set messages here as the conversation change
                            // will trigger this effect again
                            setError(null);
                        }
                    } catch (createErr) {
                        console.error("Error creating new conversation:", createErr);
                    }
                }
            } finally {
                setIsLoading(false);
            }
        };

        loadConversation();
    }, [conversationState.selectedConversationId, createConversation]);

    // Handle error recovery
    const handleStreamError = useCallback((error: string) => {
        // Display error to user
        setError(error);

        // Clean up streaming state
        setIsStreaming(false);

        // Remove partial streaming message if present
        if (messages.length > 0 && messages[messages.length - 1].isStreaming) {
            setMessages(prev => prev.filter((_, idx) => idx !== prev.length - 1));
        }
    }, [messages]);

    // Handle message submission
    const handleSubmit = useCallback(async (userMessage: string) => {
        if (isStreaming) return;

        let currentConversationId = conversationState.selectedConversationId;
        setIsLoading(true);
        setError(null);
        setRetryPayload(null);

        try {
            // If no conversation exists, create a new one
            if (!currentConversationId) {
                const newId = await createConversation();
                currentConversationId = newId;
                
                if (!currentConversationId) {
                    throw new Error("Failed to create conversation");
                }
            }

            // Add user message
            const newUserMessage: Message = {
                role: 'user',
                content: userMessage,
                timestamp: new Date().toISOString()
            };

            setMessages(prev => [...prev, newUserMessage]);

            // Create placeholder for assistant response
            streamingMessageRef.current = "";
            const streamingMessage: Message = {
                role: 'assistant',
                content: '',
                timestamp: new Date().toISOString(),
                isStreaming: true
            };

            setMessages(prev => [...prev, streamingMessage]);
            setIsStreaming(true);

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
                        setMessages(prev => {
                            const updated = [...prev];
                            const lastMsg = updated[updated.length - 1];
                            if (lastMsg && lastMsg.isStreaming) {
                                updated[updated.length - 1] = {
                                    ...lastMsg,
                                    content: streamingMessageRef.current
                                };
                            }
                            return updated;
                        });
                    },
                    onComplete: (sources) => {
                        setMessages(prev => {
                            const updated = [...prev];
                            const lastMsg = updated[updated.length - 1];
                            if (lastMsg && lastMsg.isStreaming) {
                                updated[updated.length - 1] = {
                                    ...lastMsg,
                                    content: streamingMessageRef.current,
                                    isStreaming: false,
                                    sources
                                };
                            }
                            return updated;
                        });
                        
                        setIsStreaming(false);

                        // Save conversation automatically after completion
                        if (currentConversationId) {
                            api.saveConversation({
                                conversation_id: currentConversationId,
                                preview: userMessage.slice(0, 50) + (userMessage.length > 50 ? "..." : ""),
                                history: [
                                    ...messages,
                                    newUserMessage,
                                    {
                                        role: 'assistant',
                                        content: streamingMessageRef.current,
                                        timestamp: new Date().toISOString(),
                                        sources
                                    }
                                ]
                            }).catch(err => {
                                console.error("Failed to save conversation:", err);
                            });
                        }
                    },
                    onError: (errMsg) => {
                        handleStreamError(errMsg);
                        setRetryPayload({
                            message: userMessage
                        });
                    }
                },
                signal
            );
        } catch (err: any) {
            console.error('Streaming error:', err);
            if (err.name !== 'AbortError') {
                setError(err.message || 'Failed to stream message');
                setRetryPayload({
                    message: userMessage
                });
            }
        } finally {
            setIsStreaming(false);
            setIsLoading(false);
            abortControllerRef.current = null;
        }
    }, [conversationState.selectedConversationId, createConversation, isStreaming, messages, mode, handleStreamError]);

    // Handle retry
    const handleRetry = useCallback(() => {
        if (!retryPayload) return;
        handleSubmit(retryPayload.message);
    }, [retryPayload, handleSubmit]);

    // Handle cancel streaming
    const handleCancelStreaming = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            setIsStreaming(false);
            
            // Remove the streaming message
            setMessages(prev => {
                if (prev[prev.length - 1]?.isStreaming) {
                    return prev.slice(0, -1);
                }
                return prev;
            });
        }
    }, []);

    // Set up keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Escape key to cancel streaming
            if (e.key === 'Escape' && isStreaming && abortControllerRef.current) {
                handleCancelStreaming();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isStreaming, handleCancelStreaming]);

    // Show empty state if no conversation is selected
    if (!conversationState.selectedConversationId && !isLoading) {
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
                    <button
                        onClick={() => createConversation()}
                        className="mt-6 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                    >
                        Create New Chat
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col w-full max-w-6xl mx-auto px-4 py-6 h-full">
            {/* Mode selector */}
            <div className="mb-5 flex items-center justify-between gap-6 flex-wrap">
                <div className="flex items-center gap-6 flex-wrap">
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

                <button
                    onClick={() => createConversation()}
                    disabled={isStreaming}
                    className="text-sm bg-gray-100 hover:bg-gray-200 dark:bg-dark-3 dark:hover:bg-dark-4 rounded-md px-3 py-1.5 flex items-center gap-1 transition-colors disabled:opacity-50"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    New Chat
                </button>
            </div>

            {/* Chat messages */}
            <div
                ref={scrollContainerRef}
                className="flex-1 overflow-y-auto px-2 space-y-4 mb-4"
                style={{ maxHeight: "calc(100vh - 340px)", minHeight: "200px" }}
            >
                {isLoading && messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 bg-primary rounded-full animate-bounce"></div>
                            <div className="w-4 h-4 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                            <div className="w-4 h-4 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                        </div>
                    </div>
                ) : messages.length === 0 ? (
                    <EmptyState />
                ) : (
                    <div className="space-y-4">
                        {messages.map((message, index) => (
                            <div key={index}>
                                {message.role === 'user' ? (
                                    <div className="flex justify-end">
                                        <div className="max-w-3xl p-4 rounded-lg shadow text-sm bg-primary text-white">
                                            <ChatBubble message={message.content} isUser={true} />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex justify-start">
                                        <div className={`max-w-3xl p-4 rounded-lg shadow text-sm bg-white dark:bg-dark-3 dark:text-white ${message.isStreaming ? 'relative' : ''}`}>
                                            <ChatBubble message={message.content} isUser={false} />

                                            {message.isStreaming && (
                                                <div className="absolute top-2 right-2">
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                                </div>
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
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {error && (
                    <div className="text-red-600 text-sm text-center p-4 bg-red-50 dark:bg-red-900/20 rounded flex flex-col items-center">
                        <p className="mb-2">{error}</p>
                        {retryPayload && (
                            <button
                                onClick={handleRetry}
                                className="px-4 py-2 mt-2 bg-red-100 hover:bg-red-200 text-red-800 rounded text-xs font-medium"
                            >
                                Retry Message
                            </button>
                        )}
                    </div>
                )}

                {isStreaming && (
                    <div className="flex justify-center mt-2">
                        <button
                            onClick={handleCancelStreaming}
                            className="px-3 py-1 text-xs bg-gray-200 text-gray-700 hover:bg-gray-300 rounded"
                        >
                            Stop Generating
                        </button>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input form */}
            <ChatInput
                onSubmit={handleSubmit}
                disabled={isLoading || !conversationState.selectedConversationId || isStreaming}
                placeholder={
                    isStreaming
                        ? "Wait for response to complete..."
                        : "Ask anything..."
                }
            />

            {/* Keyboard shortcuts helper */}
            <div className="mt-2 flex justify-center">
                <div className="text-xs text-gray-500 flex gap-4">
                    <span>Press <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-dark-3 rounded">Enter</kbd> to send</span>
                    <span>Press <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-dark-3 rounded">Shift + Enter</kbd> for line break</span>
                    <span>Press <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-dark-3 rounded">Esc</kbd> to cancel response</span>
                </div>
            </div>
        </div>
    );
}
