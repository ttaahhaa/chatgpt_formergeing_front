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
}



export default function ChatTab({ conversationId }: { conversationId: string | null }) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mode, setMode] = useState<"auto" | "documents_only" | "general_knowledge">("auto");
    const [isLoadingConversation, setIsLoadingConversation] = useState(false);

    // Track previous conversation ID to detect changes
    const previousConversationIdRef = useRef<string | null>(null);

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

    // Handle conversation ID changes
    useEffect(() => {
        // If this is the first render or no change in conversation ID, do nothing
        if (!conversationId || previousConversationIdRef.current === conversationId) {
            previousConversationIdRef.current = conversationId;
            return;
        }

        console.log("Conversation ID change detected", {
            previous: previousConversationIdRef.current,
            current: conversationId
        });

        const handleConversationChange = async () => {
            // Immediately set loading state and clear messages to prevent UI confusion
            setIsLoadingConversation(true);
            setMessages([]);
            setError(null);

            // Save the previous conversation if there was one
            const prevId = previousConversationIdRef.current;
            if (prevId && prevId !== conversationId) {
                try {
                    // Fetch current messages from the component state
                    const currentMessages = document.querySelectorAll('[data-message-container]');
                    if (currentMessages.length > 0) {
                        console.log(`Saving previous conversation: ${prevId}`);
                        // Use any existing user message as preview
                        const messageToPreview = localStorage.getItem(`conversation_preview_${prevId}`) || "New Conversation";
                        const userMessages = messages.filter(m => m.role === "user");
                        const lastUserMessage = userMessages[userMessages.length - 1]?.content || "New Conversation";

                        await api.saveConversation({
                            conversation_id: prevId,
                            preview: lastUserMessage.slice(0, 50),
                            history: [...messages] // Save actual message history
                        });
                        console.log("Previous conversation referenced successfully");
                    }
                } catch (err) {
                    console.error("Failed to save previous conversation:", err);
                    // Continue with loading the new conversation even if saving failed
                }
            }

            // Now load the new conversation
            try {
                console.log(`Loading conversation: ${conversationId}`);
                const data = await api.getConversation(conversationId);

                if (Array.isArray(data.messages)) {
                    console.log(`Setting ${data.messages.length} messages from conversation`);
                    setMessages(data.messages);
                } else {
                    console.warn("No messages array in response");
                    setMessages([]);
                }
            } catch (err: any) {
                console.error("Error loading conversation:", err);
                setError(`Failed to load conversation: ${err.message}`);
            } finally {
                setIsLoadingConversation(false);
            }

            // Update the ref to the current conversation ID
            previousConversationIdRef.current = conversationId;
        };

        handleConversationChange();
    }, [conversationId]); // Only depend on conversationId, not messages

    // Handle message submission
    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        if (!inputValue.trim()) {
            return;
        }

        if (!conversationId) {
            setError("Please create or select a conversation first");
            return;
        }

        const userMessage = inputValue;
        setInputValue('');

        const newUserMessage: Message = {
            role: 'user',
            content: userMessage,
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, newUserMessage]);
        setLoading(true);
        setError(null);

        try {
            const context = messages.map(m => ({
                role: m.role,
                content: m.content
            }));

            const response = await api.chat({
                message: userMessage,
                conversation_id: conversationId,
                conversation_context: context,
                mode: mode,
            });

            if (!response.response?.trim()) {
                throw new Error("Received empty response from assistant");
            }

            const assistantMessage: Message = {
                role: 'assistant',
                content: response.response,
                sources: response.sources,
                timestamp: new Date().toISOString()
            };

            setMessages(prev => [...prev, assistantMessage]);

            const preview = userMessage.slice(0, 50) + (userMessage.length > 50 ? "..." : "");
            localStorage.setItem(`conversation_preview_${conversationId}`, preview);

            await api.saveConversation({
                conversation_id: conversationId,
                preview: preview,
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
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-14 h-14 mb-4 text-gray-300 dark:text-gray-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="1.5"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8-1.364 0-2.646-.273-3.778-.76L3 21l1.846-4.615A7.966 7.966 0 0 1 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <h2 className="text-lg font-medium">How can I help?</h2>
                        <p className="text-sm mt-1">Ask a question or start a new conversation.</p>
                    </div>
                ) : (
                    messages.map((message, index) => (
                        <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                            <div
                                data-message-container
                                className={`max-w-3xl p-4 rounded-lg shadow text-sm ${message.role === "user"
                                    ? "bg-primary text-white"
                                    : "bg-white dark:bg-dark-3 dark:text-white"
                                    }`}
                            >
                                <ChatBubble message={message.content} isUser={message.role === "user"} />

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
                    <TextareaAutosize
                        ref={textareaRef}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Ask anything..."
                        disabled={loading || !conversationId || isLoadingConversation}
                        minRows={1}
                        maxRows={8}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault(); // prevent newline
                                handleSubmit(e);     // replace this with your actual send function
                            }
                        }}
                        className="w-full rounded-xl border border-gray-300 bg-white py-4 pl-[60px] pr-[60px] text-lg outline-none shadow-md focus:border-primary focus:ring-2 focus:ring-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white resize-none overflow-y-auto"
                    />
                    <div className="absolute left-6 top-1/2 -translate-y-1/2">
                        <SearchIcon className="size-6 text-gray-500 dark:text-gray-400" />
                    </div>
                    <button
                        type="submit"
                        disabled={loading || !inputValue.trim() || !conversationId || isLoadingConversation}
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