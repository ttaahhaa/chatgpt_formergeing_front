// src/contexts/ConversationContext.tsx
"use client";

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { api } from '@/services/api';
import { useRouter } from 'next/navigation';

// Types
export interface Conversation {
    id: string;
    preview: string;
    lastUpdated: string;
    messageCount: number;
}

export interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp?: string;
    sources?: { document: string; relevance: number }[];
    isStreaming?: boolean;
}

interface ConversationState {
    conversations: Conversation[];
    selectedConversationId: string | null;
    isLoading: boolean;
    error: string | null;
}

type ConversationAction =
    | { type: 'SET_CONVERSATIONS'; payload: Conversation[] }
    | { type: 'ADD_CONVERSATION'; payload: Conversation }
    | { type: 'REMOVE_CONVERSATION'; payload: string }
    | { type: 'CLEAR_CONVERSATIONS' }
    | { type: 'SELECT_CONVERSATION'; payload: string | null }
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_ERROR'; payload: string | null };

const initialState: ConversationState = {
    conversations: [],
    selectedConversationId: null,
    isLoading: false,
    error: null
};

// Reducer
function conversationReducer(state: ConversationState, action: ConversationAction): ConversationState {
    switch (action.type) {
        case 'SET_CONVERSATIONS':
            return { ...state, conversations: action.payload };
        case 'ADD_CONVERSATION':
            return { 
                ...state, 
                conversations: [action.payload, ...state.conversations] 
            };
        case 'REMOVE_CONVERSATION':
            return { 
                ...state, 
                conversations: state.conversations.filter(conv => conv.id !== action.payload),
                // If the removed conversation was selected, deselect it
                selectedConversationId: state.selectedConversationId === action.payload 
                    ? null 
                    : state.selectedConversationId
            };
        case 'CLEAR_CONVERSATIONS':
            return { 
                ...state, 
                conversations: [],
                selectedConversationId: null
            };
        case 'SELECT_CONVERSATION':
            return { ...state, selectedConversationId: action.payload };
        case 'SET_LOADING':
            return { ...state, isLoading: action.payload };
        case 'SET_ERROR':
            return { ...state, error: action.payload };
        default:
            return state;
    }
}

// Context
interface ConversationContextValue {
    state: ConversationState;
    dispatch: React.Dispatch<ConversationAction>;
    fetchConversations: () => Promise<void>;
    createConversation: () => Promise<string | null>;
    deleteConversation: (id: string) => Promise<void>;
    clearAllConversations: () => Promise<void>;
    selectConversation: (id: string) => void;
}

// Create default no-op functions for when the context is used outside a provider
// This prevents errors during static generation
const defaultContextValue: ConversationContextValue = {
    state: initialState,
    dispatch: () => null,
    fetchConversations: async () => {},
    createConversation: async () => null,
    deleteConversation: async () => {},
    clearAllConversations: async () => {},
    selectConversation: () => {}
};

const ConversationContext = createContext<ConversationContextValue>(defaultContextValue);

// Provider
export function ConversationProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(conversationReducer, initialState);
    const router = useRouter();

    // Fetch all conversations
    const fetchConversations = useCallback(async () => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            dispatch({ type: 'SET_ERROR', payload: null });

            const data = await api.getConversations();
            
            // Sort conversations by lastUpdated (newest first)
            const sortedConversations = data.conversations.sort(
                (a: Conversation, b: Conversation) => 
                    new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
            );
            
            dispatch({ type: 'SET_CONVERSATIONS', payload: sortedConversations });
            
            // If no conversation is selected but we have conversations, select the most recent
            if (!state.selectedConversationId && sortedConversations.length > 0) {
                const lastActiveId = localStorage.getItem('lastActiveConversationId');
                
                // If we have a stored ID and it exists in our conversations, select it
                if (lastActiveId && sortedConversations.some(conv => conv.id === lastActiveId)) {
                    dispatch({ type: 'SELECT_CONVERSATION', payload: lastActiveId });
                    router.push(`/chats?conversationId=${lastActiveId}`);
                } else {
                    // Otherwise select the most recent conversation
                    dispatch({ type: 'SELECT_CONVERSATION', payload: sortedConversations[0].id });
                    router.push(`/chats?conversationId=${sortedConversations[0].id}`);
                    localStorage.setItem('lastActiveConversationId', sortedConversations[0].id);
                }
            }
        } catch (err: any) {
            console.error('Error fetching conversations:', err);
            dispatch({ type: 'SET_ERROR', payload: err.message || 'Failed to load conversations' });
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    }, [state.selectedConversationId, router]);

    // Create a new conversation
    const createConversation = useCallback(async (): Promise<string | null> => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            dispatch({ type: 'SET_ERROR', payload: null });

            const result = await api.createNewConversation();
            
            if (result?.conversation_id) {
                const newConversation: Conversation = {
                    id: result.conversation_id,
                    preview: 'New Conversation',
                    lastUpdated: new Date().toISOString(),
                    messageCount: 0
                };
                
                dispatch({ type: 'ADD_CONVERSATION', payload: newConversation });
                dispatch({ type: 'SELECT_CONVERSATION', payload: result.conversation_id });
                
                // Store as last active conversation
                localStorage.setItem('lastActiveConversationId', result.conversation_id);
                
                // Update URL
                router.push(`/chats?conversationId=${result.conversation_id}`);
                
                return result.conversation_id;
            }
            return null;
        } catch (err: any) {
            console.error('Error creating conversation:', err);
            dispatch({ type: 'SET_ERROR', payload: err.message || 'Failed to create conversation' });
            return null;
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    }, [router]);

    // Delete a conversation
    const deleteConversation = useCallback(async (id: string) => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            
            await api.deleteConversation(id);
            
            dispatch({ type: 'REMOVE_CONVERSATION', payload: id });
            
            // If the deleted conversation was selected, and we have other conversations,
            // select the first available one
            if (state.selectedConversationId === id && state.conversations.length > 1) {
                const remainingConversations = state.conversations.filter(conv => conv.id !== id);
                const nextConversation = remainingConversations[0];
                
                if (nextConversation) {
                    dispatch({ type: 'SELECT_CONVERSATION', payload: nextConversation.id });
                    router.push(`/chats?conversationId=${nextConversation.id}`);
                    localStorage.setItem('lastActiveConversationId', nextConversation.id);
                } else {
                    // If no conversations left, create a new one
                    const newId = await createConversation();
                    if (newId) {
                        dispatch({ type: 'SELECT_CONVERSATION', payload: newId });
                        router.push(`/chats?conversationId=${newId}`);
                    }
                }
            }
            
            // Remove from localStorage
            localStorage.removeItem(`conversation_preview_${id}`);
            if (localStorage.getItem('lastActiveConversationId') === id) {
                localStorage.removeItem('lastActiveConversationId');
            }
        } catch (err: any) {
            console.error('Error deleting conversation:', err);
            dispatch({ type: 'SET_ERROR', payload: err.message || 'Failed to delete conversation' });
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    }, [state.conversations, state.selectedConversationId, router, createConversation]);

    // Clear all conversations
    const clearAllConversations = useCallback(async () => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            
            await api.clearAllConversations();
            
            // Clear all conversation data from localStorage
            Object.keys(localStorage).forEach(key => {
                if (key === "lastActiveConversationId" || key.startsWith("conversation_preview_")) {
                    localStorage.removeItem(key);
                }
            });
            
            dispatch({ type: 'CLEAR_CONVERSATIONS' });
            
            // Create a new conversation
            const newId = await createConversation();
            if (newId) {
                dispatch({ type: 'SELECT_CONVERSATION', payload: newId });
                router.push(`/chats?conversationId=${newId}`);
            }
        } catch (err: any) {
            console.error('Error clearing conversations:', err);
            dispatch({ type: 'SET_ERROR', payload: err.message || 'Failed to clear conversations' });
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    }, [router, createConversation]);

    // Select a conversation
    const selectConversation = useCallback((id: string) => {
        if (id === state.selectedConversationId) return;
        
        dispatch({ type: 'SELECT_CONVERSATION', payload: id });
        localStorage.setItem('lastActiveConversationId', id);
        router.push(`/chats?conversationId=${id}`);
        
        // Dispatch a custom event for other components to react to
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('conversationSelected', {
                detail: { conversationId: id }
            }));
        }
    }, [state.selectedConversationId, router]);

    // Initialize on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            fetchConversations();
        }
    }, [fetchConversations]);

    return (
        <ConversationContext.Provider
            value={{
                state,
                dispatch,
                fetchConversations,
                createConversation,
                deleteConversation,
                clearAllConversations,
                selectConversation
            }}
        >
            {children}
        </ConversationContext.Provider>
    );
}

// Hook with server-rendering safety
export function useConversation() {
    // Get the context
    const context = useContext(ConversationContext);
    
    // Return the context (it will use default values if outside provider)
    return context;
}
