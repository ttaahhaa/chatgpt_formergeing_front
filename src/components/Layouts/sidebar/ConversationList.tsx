// src/components/Layouts/sidebar/ConversationList.tsx
"use client";

import { useEffect, useState } from "react";
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

    // Fetch conversations from API when component mounts or selectedId changes
    useEffect(() => {
        fetchConversations();
    }, []);  // Only fetch on mount, don't refetch on selectedId changes

    // Function to fetch conversations
    const fetchConversations = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/conversations`
            );

            if (!response.ok) {
                throw new Error(`Failed to fetch conversations: ${response.status}`);
            }

            const data = await response.json();
            setConversations(data.conversations || []);
        } catch (err) {
            console.error("Error fetching conversations:", err);
            setError("Failed to load conversations");
        } finally {
            setLoading(false);
        }
    };

    // Create new conversation
    const handleNewConversation = async () => {
        try {
            setError(null);

            const currentId = localStorage.getItem("selectedConversationId");
            if (currentId) {
                const currentConv = await api.getConversation(currentId);

                const hasMessages = Array.isArray(currentConv.messages) && currentConv.messages.length > 0;
                if (!hasMessages) {
                    // Do not create a new conversation if the current one is empty
                    console.log("Current conversation is empty. Reusing it instead of creating a new one.");
                    return;
                }
            }

            const result = await api.createNewConversation();

            if (result?.conversation_id) {
                localStorage.setItem("selectedConversationId", result.conversation_id);
                onSelectConversation(result.conversation_id);
                fetchConversations();
            }
        } catch (err: any) {
            console.error("Failed to create new conversation:", err);
            setError(err.message || "Failed to create new conversation");
        }
    };


    // Clear all conversations
    const handleClearAllConversations = async () => {
        // Confirm with the user
        if (!confirm("Are you sure you want to delete ALL conversations? This action cannot be undone.")) {
            return;
        }

        try {
            setClearingConversations(true);
            setError(null);

            // Call the API to clear all conversations
            await api.clearAllConversations();

            // Clear local storage entries related to conversations
            Object.keys(localStorage).forEach(key => {
                if (key === "selectedConversationId" || key.startsWith("conversation_preview_")) {
                    localStorage.removeItem(key);
                }
            });

            // Reset the conversations list
            setConversations([]);

            // Create a new conversation automatically after clearing
            try {
                await handleNewConversation();
            } catch (newConvErr) {
                console.error("Failed to create new conversation after clearing:", newConvErr);
            }
        } catch (err: any) { // Add type annotation here
            console.error("Failed to clear conversations:", err);
            setError(err.message || "Failed to clear conversations");
        } finally {
            setClearingConversations(false);
        }
    };

    // Handle conversation selection
    const handleSelectConversation = async (id: string) => {
        if (id === selectedId) return; // Skip if already selected

        // Just pass the ID to the parent component
        onSelectConversation(id);

        // Refresh the conversation list to ensure it's up-to-date
        fetchConversations();
    };

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="px-4 py-4 space-y-2">
                <button
                    onClick={handleNewConversation}
                    className="w-full bg-primary text-white font-semibold py-2 px-4 rounded-md hover:bg-opacity-90 transition duration-200"
                >
                    ➕ New Conversation
                </button>

                <button
                    onClick={handleClearAllConversations}
                    disabled={clearingConversations || conversations.length === 0}
                    className="w-full bg-red-600 text-white text-sm py-1.5 px-3 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                >
                    {clearingConversations ? "Clearing..." : "Reset All Conversations"}
                </button>
            </div>

            {error && (
                <div className="text-red-500 text-sm text-center px-4 py-2">
                    {error}
                </div>
            )}

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
                                <span className="font-semibold truncate text-sm">
                                    {conv.preview || "New Conversation"}
                                </span>
                                <div className="flex justify-between items-center text-xs text-gray-500 mt-1">
                                    <span>{conv.messageCount || 0} messages</span>
                                    <span>{formatDate(conv.lastUpdated || new Date().toISOString())}</span>
                                </div>
                            </div>
                        </button>
                    ))
                )}
            </div>
        </div>
    );
}