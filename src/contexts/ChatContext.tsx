// src/contexts/ChatContext.tsx
"use client";

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { api } from '@/services/api';
import { useRouter } from 'next/navigation';

export interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp?: string;
    sources?: { document: string; relevance: number }[];
    isStreaming?: boolean;
}

interface ChatState {
    messages: Message[];
    currentConversationId: string | null;
    isStreaming: boolean;
    error: string | null;
}

type ChatAction =
    | { type: 'SET_MESSAGES'; payload: Message[] }
    | { type: 'ADD_MESSAGE'; payload: Message }
    | { type: 'UPDATE_LAST_MESSAGE'; payload: Partial<Message> }
    | { type: 'SET_CONVERSATION_ID'; payload: string | null }
    | { type: 'SET_STREAMING'; payload: boolean }
    | { type: 'SET_ERROR'; payload: string | null }
    | { type: 'CLEAR_MESSAGES' };

const initialState: ChatState = {
    messages: [],
    currentConversationId: null,
    isStreaming: false,
    error: null,
};

function chatReducer(state: ChatState, action: ChatAction): ChatState {
    switch (action.type) {
        case 'SET_MESSAGES':
            return { ...state, messages: action.payload };
        case 'ADD_MESSAGE':
            return { ...state, messages: [...state.messages, action.payload] };
        case 'UPDATE_LAST_MESSAGE':
            if (state.messages.length === 0) return state;

            const updatedMessages = [...state.messages];
            const lastMessage = updatedMessages[updatedMessages.length - 1];
            if (lastMessage) {
                updatedMessages[updatedMessages.length - 1] = { ...lastMessage, ...action.payload };
            }
            return { ...state, messages: updatedMessages };
        case 'SET_CONVERSATION_ID':
            return { ...state, currentConversationId: action.payload };
        case 'SET_STREAMING':
            return { ...state, isStreaming: action.payload };
        case 'SET_ERROR':
            return { ...state, error: action.payload };
        case 'CLEAR_MESSAGES':
            return {
                ...state,
                messages: [],
                error: null,
                isStreaming: false
            };
        default:
            return state;
    }
}

interface ChatContextValue {
    state: ChatState;
    dispatch: React.Dispatch<ChatAction>;
    persistConversation: (conversationId: string, messages: Message[]) => Promise<void>;
    handleNewConversation: () => Promise<void>;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(chatReducer, initialState);
    const router = useRouter();

    // Function to save conversation to the server
    const persistConversation = useCallback(async (conversationId: string, messages: Message[]) => {
        if (!conversationId || messages.length === 0) return;

        try {
            // Find the last user message to use as preview
            const userMessages = messages.filter(m => m.role === 'user');
            const lastUserMessage = userMessages[userMessages.length - 1]?.content || 'New Conversation';
            const preview = lastUserMessage.slice(0, 50) + (lastUserMessage.length > 50 ? '...' : '');

            // Save to API
            await api.saveConversation({
                conversation_id: conversationId,
                preview,
                history: messages
            });

            console.log('Conversation saved successfully:', conversationId);
        } catch (err) {
            console.error('Failed to persist conversation:', err);
        }
    }, []);

    // Function to create a new conversation
    const handleNewConversation = useCallback(async () => {
        try {
            // Save current conversation if it exists
            if (state.currentConversationId && state.messages.length > 0) {
                await persistConversation(state.currentConversationId, state.messages);
            }

            // Get all conversations
            const { conversations } = await api.getConversations();

            // Find an empty conversation
            const emptyConversation = conversations.find(conv => conv.messageCount === 0);

            let newConversationId;
            if (emptyConversation) {
                // Use existing empty conversation
                console.log('Using existing empty conversation:', emptyConversation.id);
                newConversationId = emptyConversation.id;
            } else {
                // Create new conversation if no empty one exists
                const result = await api.createNewConversation();
                if (result?.conversation_id) {
                    newConversationId = result.conversation_id;
                    console.log("New conversation created:", newConversationId);
                }
            }

            if (newConversationId) {
                // Update state with new conversation ID
                dispatch({ type: 'SET_CONVERSATION_ID', payload: newConversationId });
                dispatch({ type: 'CLEAR_MESSAGES' });

                // Update URL and localStorage
                router.push(`/chats?conversationId=${newConversationId}`);
                localStorage.setItem('lastActiveConversationId', newConversationId);

                // Notify about conversation creation (for other components to update)
                window.dispatchEvent(new CustomEvent('conversationCreated', {
                    detail: { conversationId: newConversationId }
                }));
            }
        } catch (err) {
            console.error('Failed to create new conversation:', err);
            dispatch({ type: 'SET_ERROR', payload: 'Failed to create new conversation' });
        }
    }, [state.currentConversationId, state.messages, persistConversation, router]);

    return (
        <ChatContext.Provider value={{
            state,
            dispatch,
            persistConversation,
            handleNewConversation
        }}>
            {children}
        </ChatContext.Provider>
    );
}

export function useChat() {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
}
