"use client";

import React, { createContext, useContext, useReducer, useCallback } from 'react';

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
            return { ...state, messages: [] };
        default:
            return state;
    }
}

const ChatContext = createContext<{
    state: ChatState;
    dispatch: React.Dispatch<ChatAction>;
} | null>(null);

export function ChatProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(chatReducer, initialState);

    return (
        <ChatContext.Provider value={{ state, dispatch }}>
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