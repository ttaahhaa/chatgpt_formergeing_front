// src/components/Layouts/sidebar/ConversationList.tsx
"use client";

import { useEffect, useState } from "react";
import { api } from "@/services/api";

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

    const fetchConversations = async () => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/conversations`
            );
            const data = await response.json();
            setConversations(data.conversations || []);
        } catch (err) {
            console.error("Error fetching conversations:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConversations();
    }, []);

    const handleNewConversation = async () => {
        try {
            const result = await api.createNewConversation();
            if (result?.conversation_id) {
                onSelectConversation(result.conversation_id); // 🔥 notify parent
                fetchConversations(); // refresh list
            }
        } catch (err) {
            console.error("Failed to create new conversation:", err);
        }
    };

    return (
        <div className="flex flex-col h-full px-3 pt-4 overflow-y-auto">
            <button
                onClick={handleNewConversation}
                className="mb-4 bg-indigo-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-indigo-600"
            >
                ➕ New Conversation
            </button>

            {loading ? (
                <div className="text-sm text-gray-500 text-center">Loading...</div>
            ) : conversations.length === 0 ? (
                <div className="text-sm text-gray-500 text-center">No conversations found</div>
            ) : (
                conversations.map((conv) => (
                    <button
                        key={conv.id}
                        onClick={() => onSelectConversation(conv.id)}
                        className={`w-full text-left text-sm rounded-md px-3 py-2 mb-1 hover:bg-gray-100 dark:hover:bg-gray-800 ${selectedId === conv.id ? "bg-gray-200 dark:bg-gray-700 font-semibold" : ""
                            }`}
                    >
                        <div className="truncate">{conv.preview}</div>
                        <div className="text-xs text-gray-500">{conv.messageCount} messages</div>
                    </button>
                ))
            )}
        </div>
    );
}
