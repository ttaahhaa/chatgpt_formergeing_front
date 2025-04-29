// src/components/Layouts/sidebar/ConversationList.tsx
"use client"

import { useState, useEffect } from 'react';
import Image from "next/image";

interface Conversation {
    id: string;
    preview: string;
    lastUpdated: string;
    messageCount: number;
}

export function ConversationList({ onSelectConversation, selectedId }: {
    onSelectConversation: (id: string) => void;
    selectedId?: string;
}) {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                // In a real implementation, fetch from an API
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/conversations`);
                if (!response.ok) throw new Error('Failed to fetch conversations');

                const data = await response.json();
                setConversations(data.conversations || []);
            } catch (err) {
                console.error('Error fetching conversations:', err);
                // Fallback data for demo
                setConversations([
                    {
                        id: '1',
                        preview: 'How do I use the system?',
                        lastUpdated: new Date().toISOString(),
                        messageCount: 5
                    },
                    {
                        id: '2',
                        preview: 'Tell me about embedding models',
                        lastUpdated: new Date(Date.now() - 86400000).toISOString(),
                        messageCount: 3
                    }
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchConversations();
    }, []);

    return (
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-3">
            <div className="space-y-2">
                {loading ? (
                    <div className="flex justify-center py-4">
                        <div className="w-6 h-6 border-2 border-gray-300 border-t-primary rounded-full animate-spin"></div>
                    </div>
                ) : conversations.length === 0 ? (
                    <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
                        No conversations yet
                    </div>
                ) : (
                    conversations.map((conv) => (
                        <button
                            key={conv.id}
                            onClick={() => onSelectConversation(conv.id)}
                            className={`w-full rounded-md px-4 py-3 text-left text-sm hover:bg-gray-100 dark:hover:bg-dark-4 ${selectedId === conv.id ? 'bg-gray-100 dark:bg-dark-4' : ''
                                }`}
                        >
                            <div className="truncate font-medium">{conv.preview}</div>
                            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                                <span>{formatDate(conv.lastUpdated)}</span>
                                <span>{conv.messageCount} messages</span>
                            </div>
                        </button>
                    ))
                )}
            </div>
        </div>
    );
}

function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();

    // If today, show time
    if (date.toDateString() === now.toDateString()) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    // If this year, show month and day
    if (date.getFullYear() === now.getFullYear()) {
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }

    // Otherwise show full date
    return date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
}