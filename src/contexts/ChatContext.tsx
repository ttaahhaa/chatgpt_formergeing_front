"use client";

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { api } from '@/services/api';

interface Message {
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
                isStreaming: false,
                currentConversationId: null
            };
        default:
            return state;
    }
}

interface ChatContextValue {
    state: ChatState;
    dispatch: React.Dispatch<ChatAction>;
    persistConversation: (conversationId: string, messages: Message[]) => Promise<void>;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(chatReducer, initialState);

    // Function to save conversation to the server and localStorage
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

            // Store the last active conversation ID for session restoration
            localStorage.setItem('lastActiveConversationId', conversationId);
            localStorage.setItem(`conversation_preview_${conversationId}`, preview);

            console.log('Conversation saved successfully:', conversationId);
        } catch (err) {
            console.error('Failed to persist conversation:', err);
        }
    }, []);

    // Add window unload handler to save conversation before closing
    React.useEffect(() => {
        const handleBeforeUnload = () => {
            if (state.currentConversationId && state.messages.length > 0) {
                // For beforeunload, we need to use synchronous localStorage backup
                // instead of async API call that might not complete
                try {
                    const userMessages = state.messages.filter(m => m.role === 'user');
                    const lastUserMessage = userMessages[userMessages.length - 1]?.content || 'New Conversation';
                    const preview = lastUserMessage.slice(0, 50) + (lastUserMessage.length > 50 ? '...' : '');

                    // Store conversation in localStorage as backup
                    localStorage.setItem(`conversation_backup_${state.currentConversationId}`,
                        JSON.stringify({
                            messages: state.messages,
                            preview,
                            timestamp: new Date().toISOString()
                        })
                    );
                } catch (err) {
                    console.error('Failed to backup conversation to localStorage:', err);
                }
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [state.currentConversationId, state.messages]);

    return (
        <ChatContext.Provider value={{ state, dispatch, persistConversation }}>
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