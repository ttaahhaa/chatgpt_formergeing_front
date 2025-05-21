"use client";

import React, { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { getOrCreateEmptyConversation } from '@/utils/conversation';

interface Conversation {
    id: string;
    preview: string;
    lastUpdated: string;
    messageCount: number;
}

export default function ConversationList({
    onSelectConversation,
    selectedId,
}: {
    onSelectConversation: (id: string) => void;
    selectedId?: string | null;
}) {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchConversations = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await api.getConversations();
            setConversations(response.conversations);
        } catch (err: any) {
            setError(err.message || 'Failed to load conversations');
            console.error('Error fetching conversations:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchConversations();
    }, []);

    const handleDeleteConversation = async (id: string) => {
        try {
            await api.deleteConversation(id);
            setConversations(prev => prev.filter(conv => conv.id !== id));
        } catch (err: any) {
            setError(err.message || 'Failed to delete conversation');
            console.error('Error deleting conversation:', err);
        }
    };

    const handleNewConversation = async () => {
        try {
            // Check for existing empty conversations
            const { conversations } = await api.getConversations();
            const emptyConversation = conversations.find(conv => conv.messageCount === 0);

            if (emptyConversation) {
                // If an empty conversation exists, select it instead of creating a new one
                console.log('Using existing empty conversation:', emptyConversation.id);
                onSelectConversation(emptyConversation.id);
                return;
            }

            // If no empty conversation exists, create a new one
            const conversationId = await getOrCreateEmptyConversation();
            onSelectConversation(conversationId);
            await fetchConversations(); // Refresh the list
        } catch (err) {
            console.error("Failed to create new conversation:", err);
            setError('Failed to create new conversation');
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 text-red-500">
                <p>{error}</p>
                <button
                    onClick={fetchConversations}
                    className="mt-2 text-sm text-red-500 underline"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <div className="p-4">
                <button
                    onClick={handleNewConversation}
                    className="w-full flex items-center justify-center gap-2 bg-primary text-white rounded-lg py-2 hover:bg-primary/90"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                        <path
                            fillRule="evenodd"
                            d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                            clipRule="evenodd"
                        />
                    </svg>
                    New Chat
                </button>
            </div>

            <div className="flex-1 overflow-y-auto">
                {conversations.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                        No conversations yet
                    </div>
                ) : (
                    <div className="space-y-1 p-2">
                        {conversations.map((conversation) => (
                            <div
                                key={conversation.id}
                                className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 ${selectedId === conversation.id
                                    ? 'bg-gray-100 dark:bg-gray-800'
                                    : ''
                                    }`}
                                onClick={() => onSelectConversation(conversation.id)}
                            >
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                        {conversation.preview || 'New Conversation'}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {new Date(conversation.lastUpdated).toLocaleDateString()}
                                    </p>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteConversation(conversation.id);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-red-500"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-4 w-4"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
} 