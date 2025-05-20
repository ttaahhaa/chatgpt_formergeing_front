// src/components/Conversation/ConversationList.tsx
"use client";

import { useState, useCallback, useEffect } from "react";
import { useConversation } from "@/contexts/ConversationContext";
import { formatDate } from "@/lib/format-date";

export default function ConversationList() {
    const {
        state: { conversations, selectedConversationId, isLoading, error },
        createConversation,
        selectConversation,
        deleteConversation,
        clearAllConversations,
        fetchConversations
    } = useConversation();

    const [searchTerm, setSearchTerm] = useState("");
    const [showConfirmClear, setShowConfirmClear] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
    const [isMounted, setIsMounted] = useState(false);

    // Set mounted state on client
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Function to determine if a conversation is recent (less than 24 hours old)
    const isRecentConversation = useCallback((lastUpdated: string) => {
        if (!isMounted) return false;
        const now = new Date();
        const conversationDate = new Date(lastUpdated);
        const timeDiff = now.getTime() - conversationDate.getTime();
        const hoursDiff = timeDiff / (1000 * 60 * 60);
        return hoursDiff < 24;
    }, [isMounted]);

    // Filter conversations based on search term
    const filteredConversations = conversations.filter(conv => {
        const matchesSearch = conv.preview.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    // Handle delete conversation
    const handleDeleteConversation = async (id: string) => {
        setShowDeleteConfirm(null);
        await deleteConversation(id);
    };

    // Handle creating a new conversation
    const handleNewConversation = async () => {
        await createConversation();
    };

    // Handle clearing all conversations
    const handleClearAllConversations = async () => {
        setShowConfirmClear(false);
        await clearAllConversations();
    };

    // If not mounted (SSR), return a placeholder/skeleton
    if (!isMounted) {
        return (
            <div className="flex flex-col h-full animate-pulse">
                <div className="px-4 py-4 space-y-2">
                    <div className="w-full h-10 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
                    <div className="w-full h-8 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
                </div>
                <div className="px-4 pb-2">
                    <div className="w-full h-10 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
                </div>
                <div className="mt-2 px-4 pb-2 flex flex-wrap gap-2">
                    <div className="w-16 h-5 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    <div className="w-16 h-5 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    <div className="w-16 h-5 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                </div>
                <div className="flex-1 overflow-y-auto px-3 space-y-1">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="w-full h-16 bg-gray-200 dark:bg-gray-700 rounded-md mb-2"></div>
                    ))}
                </div>
            </div>
        );
    }

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
                    New Chat
                </button>

                <button
                    onClick={() => setShowConfirmClear(true)}
                    disabled={isLoading || conversations.length === 0}
                    className="w-full bg-red-600 text-white text-sm py-1.5 px-3 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                >
                    {isLoading ? "Loading..." : "Reset All Conversations"}
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
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
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

            <div className="flex-1 overflow-y-auto px-3 space-y-1">
                {isLoading ? (
                    <div className="flex items-center justify-center h-20">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                    </div>
                ) : filteredConversations.length === 0 ? (
                    <div className="text-sm text-gray-500 text-center py-8">
                        {searchTerm ? 'No matching conversations found' : 'No conversations found'}
                    </div>
                ) : (
                    filteredConversations.map((conv) => (
                        <div key={conv.id} className="relative group">
                            <button
                                onClick={() => selectConversation(conv.id)}
                                className={`w-full text-left rounded-md px-3 py-2.5 mb-1 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${selectedConversationId === conv.id
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

                            {/* Delete button (visible on hover) */}
                            <button
                                onClick={() => setShowDeleteConfirm(conv.id)}
                                className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-opacity"
                                aria-label="Delete conversation"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>

                            {/* Delete confirmation dialog */}
                            {showDeleteConfirm === conv.id && (
                                <div className="absolute right-0 top-0 z-10 bg-white dark:bg-gray-800 rounded-md shadow-lg p-3 border border-gray-200 dark:border-gray-700 w-64">
                                    <p className="text-sm mb-2">Delete this conversation?</p>
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => setShowDeleteConfirm(null)}
                                            className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => handleDeleteConversation(conv.id)}
                                            className="px-2 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
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
