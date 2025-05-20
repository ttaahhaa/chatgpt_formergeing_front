"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/services/api";
import { formatDate } from "@/lib/format-date";

interface Conversation {
    id: string;
    preview: string;
    lastUpdated: string;
    messageCount: number;
}

export default function ConversationList({
    selectedId,
    onSelectConversation,
}: {
    selectedId?: string | null;
    onSelectConversation: (id: string) => void;
}) {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [clearingConversations, setClearingConversations] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showConfirmClear, setShowConfirmClear] = useState(false);

    // Function to fetch conversations
    const fetchConversations = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/conversations`,
                {
                    headers: {
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`Failed to fetch conversations: ${response.status}`);
            }

            const data = await response.json();

            // Sort conversations by lastUpdated (newest first)
            const sortedConversations = (data.conversations || []).sort((a: Conversation, b: Conversation) => {
                return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
            });

            setConversations(sortedConversations);

            // If no conversation is selected but we have conversations, select the most recent one
            if (!selectedId && sortedConversations.length > 0) {
                // Check if there's a last active conversation ID in localStorage
                const lastActiveId = localStorage.getItem('lastActiveConversationId');

                if (lastActiveId && sortedConversations.some((conv: Conversation) => conv.id === lastActiveId)) {
                    onSelectConversation(lastActiveId);
                } else {
                    // Otherwise select the most recent one
                    onSelectConversation(sortedConversations[0].id);
                }
            }
        } catch (err) {
            console.error("Error fetching conversations:", err);
            setError("Failed to load conversations");
        } finally {
            setLoading(false);
        }
    }, [selectedId, onSelectConversation]);

    // Create new conversation
    const handleNewConversation = useCallback(async () => {
        try {
            setError(null);

            // Create new conversation
            const result = await api.createNewConversation();
            if (result?.conversation_id) {
                // Update localStorage
                localStorage.setItem("selectedConversationId", result.conversation_id);
                localStorage.setItem("lastActiveConversationId", result.conversation_id);

                // Select the new conversation
                onSelectConversation(result.conversation_id);

                // Refresh the conversation list
                await fetchConversations();
            }
        } catch (err: any) {
            console.error("Failed to create new conversation:", err);
            setError(err.message || "Failed to create new conversation");
        }
    }, [onSelectConversation, fetchConversations]);

    useEffect(() => {
        fetchConversations();

        const handleConversationCreated = (event: CustomEvent<{ conversationId: string }>) => {
            console.log("Conversation created event received:", event.detail);
            // Immediately fetch updated conversation list
            fetchConversations().then(() => {
                // Then select the new conversation if it exists
                if (event.detail && event.detail.conversationId) {
                    handleSelectConversation(event.detail.conversationId);
                }
            });
        };

        const handleConversationNotFound = (event: CustomEvent) => {
            const detail = (event as CustomEvent<{ conversation: Conversation }>).detail;
            if (detail && detail.conversation) {
                const conv: Conversation = detail.conversation;
                setConversations(prev => prev.filter(c => c.id !== conv.id));
                handleNewConversation();
            }
        };

        window.addEventListener('conversationCreated', handleConversationCreated as EventListener);
        window.addEventListener('conversationNotFound', handleConversationNotFound as EventListener);

        return () => {
            window.removeEventListener('conversationCreated', handleConversationCreated as EventListener);
            window.removeEventListener('conversationNotFound', handleConversationNotFound as EventListener);
        };
    }, [fetchConversations, handleNewConversation]);

    // Function to determine if a conversation is recent (less than 24 hours old)
    const isRecentConversation = useCallback((lastUpdated: string) => {
        const now = new Date();
        const conversationDate = new Date(lastUpdated);
        const timeDiff = now.getTime() - conversationDate.getTime();
        const hoursDiff = timeDiff / (1000 * 60 * 60);
        return hoursDiff < 24;
    }, []);

    // Clear all conversations
    const handleClearAllConversations = async () => {
        try {
            setClearingConversations(true);
            setError(null);
            setShowConfirmClear(false);

            // Call the API to clear all conversations
            await api.clearAllConversations();

            // Clear local storage entries related to conversations
            Object.keys(localStorage).forEach(key => {
                if (key === "selectedConversationId" || key === "lastActiveConversationId" || key.startsWith("conversation_preview_")) {
                    localStorage.removeItem(key);
                }
            });

            // Reset the conversations list
            setConversations([]);

            // Fire event to clear messages in the chat component
            window.dispatchEvent(new CustomEvent('conversationCleared'));

            // Create a new conversation automatically after clearing
            try {
                const result = await api.createNewConversation();
                if (result?.conversation_id) {
                    // Update localStorage
                    localStorage.setItem("selectedConversationId", result.conversation_id);
                    localStorage.setItem("lastActiveConversationId", result.conversation_id);

                    // Select the new conversation
                    onSelectConversation(result.conversation_id);

                    // Fire event to update the chat component
                    window.dispatchEvent(new CustomEvent('conversationCreated', {
                        detail: { conversationId: result.conversation_id }
                    }));
                }
            } catch (newConvErr) {
                console.error("Failed to create new conversation after clearing:", newConvErr);
            }
        } catch (err: any) {
            console.error("Failed to clear conversations:", err);
            setError(err.message || "Failed to clear conversations");
        } finally {
            setClearingConversations(false);
        }
    };

    // Handle conversation selection
    const handleSelectConversation = async (id: string) => {
        if (id === selectedId) return; // Skip if already selected

        try {
            // Verify the conversation exists before selecting it
            await api.getConversation(id);

            // Save current conversation before switching
            const currentId = localStorage.getItem("selectedConversationId");
            if (currentId && currentId !== id) {
                // Fire event to save current conversation
                window.dispatchEvent(new CustomEvent('saveCurrentConversation', {
                    detail: { conversationId: currentId }
                }));
            }

            // Select the new conversation
            onSelectConversation(id);
            localStorage.setItem("lastActiveConversationId", id);

            // Fire event to load the new conversation
            window.dispatchEvent(new CustomEvent('conversationSelected', {
                detail: { conversationId: id }
            }));

            // Refresh the conversation list to ensure it's up-to-date
            await fetchConversations();
        } catch (err) {
            console.error("Error selecting conversation:", err);
            // If conversation doesn't exist, remove it from the list
            setConversations(prev => prev.filter(c => c.id !== id));
            // Create a new conversation
            handleNewConversation();
        }
    };

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="px-4 py-4 space-y-2">
                <button
                    onClick={handleNewConversation}
                    className="w-full bg-primary text-white font-semibold py-2 px-4 rounded-md hover:bg-opacity-90 transition duration-200 flex items-center justify-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    New Conversation
                </button>

                <button
                    onClick={() => setShowConfirmClear(true)}
                    disabled={clearingConversations || conversations.length === 0}
                    className="w-full bg-red-600 text-white text-sm py-1.5 px-3 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                >
                    {clearingConversations ? "Clearing..." : "Reset All Conversations"}
                </button>
            </div>

            {error && (
                <div className="text-red-500 text-sm text-center px-4 py-2 bg-red-50 dark:bg-red-900/20 rounded mx-4 mb-2">
                    {error}
                    <button
                        onClick={fetchConversations}
                        className="block mx-auto mt-1 text-xs underline"
                    >
                        Try Again
                    </button>
                </div>
            )}

            <div className="px-4 pb-2">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search conversations..."
                        className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 absolute left-3 top-2.5 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </div>

            <div className="mt-2 px-4 pb-2 flex flex-wrap gap-2">
                <span className="text-xs text-gray-500">Filter:</span>
                <button className="text-xs py-1 px-2 bg-primary/10 text-primary rounded-full">All</button>
                <button className="text-xs py-1 px-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full">Today</button>
                <button className="text-xs py-1 px-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full">Last 7 days</button>
            </div>

            <div className="flex-1 overflow-y-auto px-3 space-y-1">
                {loading ? (
                    <div className="flex items-center justify-center h-20">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                    </div>
                ) : conversations.length === 0 ? (
                    <div className="text-sm text-gray-500 text-center py-8">
                        No conversations found
                    </div>
                ) : (
                    conversations.map((conv) => (
                        <button
                            key={conv.id}
                            onClick={() => handleSelectConversation(conv.id)}
                            className={`w-full text-left rounded-md px-3 py-2.5 mb-1 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${selectedId === conv.id
                                ? "bg-gray-200 dark:bg-gray-700 border-l-2 border-primary"
                                : ""
                                }`}
                        >
                            <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold truncate text-sm flex-1">
                                        {conv.preview || "New Conversation"}
                                    </span>
                                    {isRecentConversation(conv.lastUpdated) && (
                                        <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full shrink-0">
                                            Recent
                                        </span>
                                    )}
                                </div>
                                <div className="flex justify-between items-center text-xs text-gray-500 mt-1">
                                    <span>{conv.messageCount || 0} messages</span>
                                    <span>{formatDate(conv.lastUpdated || new Date().toISOString())}</span>
                                </div>
                            </div>
                        </button>
                    ))
                )}
            </div>

            {/* Confirmation dialog for clearing conversations */}
            {showConfirmClear && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full p-6">
                        <h3 className="text-lg font-semibold mb-2">Confirm Delete</h3>
                        <p className="mb-6 text-gray-600 dark:text-gray-300">
                            Are you sure you want to delete ALL conversations? This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowConfirmClear(false)}
                                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded text-gray-800 dark:text-gray-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleClearAllConversations}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
                            >
                                Delete All
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}