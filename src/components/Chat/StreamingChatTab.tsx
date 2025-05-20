"use client";

import { useState, useEffect, useRef, useCallback, memo } from "react";
import { api } from "@/services/api";
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

interface RetryPayload {
    message: string;
    conversationId?: string;
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

const StreamingChatTab = memo(function StreamingChatTab({
    conversationId,
    onConversationChange
}: {
    conversationId: string | null;
    onConversationChange?: (newConversationId: string) => void;
}) {
    const { state, dispatch, persistConversation } = useChat();
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState<"auto" | "documents_only" | "general_knowledge">("auto");
    const [isLoadingConversation, setIsLoadingConversation] = useState(false);
    const [isClient, setIsClient] = useState(false);
    const [retryPayload, setRetryPayload] = useState<RetryPayload | null>(null);

    const abortControllerRef = useRef<AbortController | null>(null);
    const streamingMessageRef = useRef<string>("");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const previousConversationIdRef = useRef<string | null>(null);
    const hasCreatedInitialConversation = useRef<boolean>(false);

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

    // Create initial conversation if none exists
    useEffect(() => {
        // When component first mounts and no conversation exists, create one automatically
        const initializeConversation = async () => {
            if (!conversationId && !isLoadingConversation && !hasCreatedInitialConversation.current) {
                hasCreatedInitialConversation.current = true;
                try {
                    setIsLoadingConversation(true);
                    const result = await api.createNewConversation();
                    if (result?.conversation_id && onConversationChange) {
                        onConversationChange(result.conversation_id);
                        // Store the conversation ID as last active
                        localStorage.setItem('lastActiveConversationId', result.conversation_id);
                    }
                } catch (err) {
                    console.error("Failed to create initial conversation:", err);
                    hasCreatedInitialConversation.current = false;
                } finally {
                    setIsLoadingConversation(false);
                }
            }
        };

        if (isClient) {
            initializeConversation();
        }
    }, [conversationId, isLoadingConversation, onConversationChange, isClient]);

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
            setRetryPayload(null);

            // Save previous conversation before loading the new one
            if (previousConversationIdRef.current && state.messages.length > 0) {
                try {
                    await persistConversation(
                        previousConversationIdRef.current,
                        state.messages
                    );
                } catch (err) {
                    console.error("Error saving previous conversation:", err);
                }
            }

            try {
                const data = await api.getConversation(conversationId);
                if (Array.isArray(data.messages)) {
                    dispatch({ type: 'SET_MESSAGES', payload: data.messages });
                } else {
                    dispatch({ type: 'SET_MESSAGES', payload: [] });
                }

                // Store as last active conversation
                localStorage.setItem('lastActiveConversationId', conversationId);
            } catch (err: any) {
                console.error("StreamingChatTab: Error loading conversation:", err);

                if (err.message && err.message.includes("not found")) {
                    // Conversation not found - remove it from localStorage
                    localStorage.removeItem('lastActiveConversationId');

                    // Trigger creation of a new conversation
                    window.dispatchEvent(new CustomEvent('conversationNotFound', {
                        detail: { conversationId }
                    }));

                    // Show a more helpful error message
                    dispatch({
                        type: 'SET_ERROR',
                        payload: 'This conversation no longer exists. A new one will be created.'
                    });
                } else {
                    dispatch({
                        type: 'SET_ERROR',
                        payload: `Failed to load conversation: ${err.message}`
                    });
                }
            } finally {
                setIsLoadingConversation(false);
            }

            previousConversationIdRef.current = conversationId;
        };

        handleConversationChange();
    }, [conversationId, dispatch, state.messages, persistConversation]);

    // Handle creating a new conversation
    const handleNewConversation = useCallback(async () => {
        if (state.isStreaming) return;

        try {
            // Save current conversation first if it exists and has messages
            if (conversationId && state.messages.length > 0) {
                await persistConversation(conversationId, state.messages);
            }

            // Clear messages immediately for better UX
            dispatch({ type: 'CLEAR_MESSAGES' });
            dispatch({ type: 'SET_ERROR', payload: null });
            setRetryPayload(null);

            // Show loading indicator
            setIsLoadingConversation(true);

            // Create new conversation
            const result = await api.createNewConversation();
            if (result?.conversation_id) {
                console.log("New conversation created:", result.conversation_id);

                // Update localStorage
                localStorage.setItem('lastActiveConversationId', result.conversation_id);

                // Reset component state
                previousConversationIdRef.current = result.conversation_id;
                streamingMessageRef.current = "";

                // Fire event to update sidebar BEFORE changing the conversation
                window.dispatchEvent(new CustomEvent('conversationCreated', {
                    detail: { conversationId: result.conversation_id }
                }));

                // Navigate to the new conversation (this will trigger URL/route change)
                if (onConversationChange) {
                    onConversationChange(result.conversation_id);
                }
            }
        } catch (err) {
            console.error("Failed to create new conversation:", err);
            dispatch({ type: 'SET_ERROR', payload: 'Failed to create new conversation. Please try again.' });
        } finally {
            setIsLoadingConversation(false);
        }
    }, [state.isStreaming, state.messages, conversationId, onConversationChange, persistConversation, dispatch]);

    // Add event listeners for conversation management
    useEffect(() => {
        const handleConversationSelected = async (event: Event) => {
            const customEvent = event as CustomEvent<{ conversationId: string }>;
            // Clear current messages
            dispatch({ type: 'CLEAR_MESSAGES' });
            dispatch({ type: 'SET_ERROR', payload: null });
            setRetryPayload(null);

            // Load the selected conversation
            try {
                const data = await api.getConversation(customEvent.detail.conversationId);
                if (Array.isArray(data.messages)) {
                    dispatch({ type: 'SET_MESSAGES', payload: data.messages });
                } else {
                    dispatch({ type: 'SET_MESSAGES', payload: [] });
                }
            } catch (err) {
                console.error("Error loading selected conversation:", err);
                dispatch({ type: 'SET_ERROR', payload: 'Failed to load conversation' });
            }
        };

        const handleSaveCurrentConversation = async (event: Event) => {
            const customEvent = event as CustomEvent<{ conversationId: string }>;
            // Save current conversation if it has messages
            if (state.messages.length > 0) {
                try {
                    await persistConversation(customEvent.detail.conversationId, state.messages);
                } catch (err) {
                    console.error("Error saving current conversation:", err);
                }
            }
        };

        window.addEventListener('conversationSelected', handleConversationSelected);
        window.addEventListener('saveCurrentConversation', handleSaveCurrentConversation);

        return () => {
            window.removeEventListener('conversationSelected', handleConversationSelected);
            window.removeEventListener('saveCurrentConversation', handleSaveCurrentConversation);
        };
    }, [dispatch, state.messages, persistConversation]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Escape key to cancel streaming
            if (e.key === 'Escape' && state.isStreaming && abortControllerRef.current) {
                abortControllerRef.current.abort();
                dispatch({ type: 'SET_STREAMING', payload: false });
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [state.isStreaming, dispatch]);

    // Handle error recovery
    const handleStreamError = useCallback((error: string) => {
        // Display error to user
        dispatch({ type: 'SET_ERROR', payload: error });

        // Clean up streaming state
        dispatch({ type: 'SET_STREAMING', payload: false });

        // Remove partial streaming message if present
        if (state.messages.length > 0 && state.messages[state.messages.length - 1].isStreaming) {
            dispatch({
                type: 'SET_MESSAGES',
                payload: state.messages.filter((_, idx) => idx !== state.messages.length - 1)
            });
        }
    }, [state.messages, dispatch]);

    // Handle message submission
    const handleSubmit = useCallback(async (userMessage: string) => {
        if (state.isStreaming) return;

        let currentConversationId = conversationId;
        setLoading(true);
        dispatch({ type: 'SET_ERROR', payload: null });
        setRetryPayload(null);

        try {
            // Only create a new conversation if there is truly no conversationId
            if (!currentConversationId) {
                const response = await api.createNewConversation();
                currentConversationId = response.conversation_id;
                if (onConversationChange) {
                    onConversationChange(currentConversationId);
                }
                // Store as last active conversation
                localStorage.setItem('lastActiveConversationId', currentConversationId);
            }

            // If still no conversationId, show error and abort
            if (!currentConversationId) {
                dispatch({ type: 'SET_ERROR', payload: 'No conversation selected. Please create or select a conversation.' });
                setLoading(false);
                return;
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

            // Set up cancel handler for Escape key
            const handleKeyDown = (e: KeyboardEvent) => {
                if (e.key === 'Escape' && controller) {
                    controller.abort();
                }
            };
            window.addEventListener('keydown', handleKeyDown);

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

                        // Save conversation automatically after completion
                        const allMessages = [
                            ...state.messages.slice(0, -1),
                            {
                                ...state.messages[state.messages.length - 1],
                                content: streamingMessageRef.current,
                                isStreaming: false,
                                sources
                            }
                        ];

                        persistConversation(
                            currentConversationId!,
                            allMessages
                        );

                        // Update conversation preview
                        const preview = userMessage.slice(0, 50) + (userMessage.length > 50 ? "..." : "");
                        localStorage.setItem(`conversation_preview_${currentConversationId}`, preview);
                    },
                    onError: (errMsg) => {
                        handleStreamError(errMsg);
                        setRetryPayload({
                            message: userMessage,
                            conversationId: currentConversationId || undefined
                        });
                    }
                },
                signal
            );

            // Clean up event listener
            window.removeEventListener('keydown', handleKeyDown);
        } catch (err: any) {
            console.error('Streaming error:', err);
            if (err.name !== 'AbortError') {
                dispatch({ type: 'SET_ERROR', payload: err.message || 'Failed to stream message' });
                setRetryPayload({
                    message: userMessage,
                    conversationId: currentConversationId || undefined
                });
            }
        } finally {
            dispatch({ type: 'SET_STREAMING', payload: false });
            setLoading(false);
            abortControllerRef.current = null;
        }
    }, [conversationId, state.isStreaming, mode, onConversationChange, dispatch, state.messages, persistConversation, handleStreamError]);

    // Handle retry
    const handleRetry = useCallback(() => {
        if (!retryPayload) return;
        handleSubmit(retryPayload.message);
    }, [retryPayload, handleSubmit]);

    // Handle cancel streaming
    const handleCancelStreaming = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
    }, []);

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
                    onClick={handleNewConversation}
                    disabled={state.isStreaming}
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
                {isLoadingConversation ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 bg-primary rounded-full animate-bounce"></div>
                            <div className="w-4 h-4 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                            <div className="w-4 h-4 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                        </div>
                    </div>
                ) : state.messages.length === 0 ? (
                    <EmptyState />
                ) : (
                    <div className="space-y-4">
                        {state.messages.map((message, index) => (
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

                {state.error && (
                    <div className="text-red-600 text-sm text-center p-4 bg-red-50 dark:bg-red-900/20 rounded flex flex-col items-center">
                        <p className="mb-2">{state.error}</p>
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

                {state.isStreaming && (
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
                disabled={loading || isLoadingConversation || state.isStreaming}
                placeholder={
                    state.isStreaming
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
});

export default StreamingChatTab;