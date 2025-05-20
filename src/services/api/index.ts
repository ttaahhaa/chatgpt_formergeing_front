// src/services/api/index.ts
import AuthService from '../auth';
import * as documents from './documents';
import * as conversation from './conversation';
import * as status from './status';
import * as logs from './logs';
import * as settings from './settings';

// Define shared types
export interface ChatRequest {
    message: string;
    conversation_id?: string;
    conversation_context?: { role: string; content: string }[];
    mode?: 'auto' | 'documents_only' | 'general_knowledge';
}

export interface ChatResponse {
    response: string;
    sources?: { document: string; relevance: number }[];
    conversation_id?: string;
}

export interface StreamingChatRequest {
    message: string;
    conversation_id?: string;
    mode?: 'auto' | 'documents_only' | 'general_knowledge';
}

export interface StreamingData {
    token?: string;
    done?: boolean;
    sources?: any[];
    error?: string;
}

export type OnTokenCallback = (token: string) => void;
export type OnCompleteCallback = (sources: any[]) => void;
export type OnErrorCallback = (error: string) => void;

export interface StreamChatResponse {
    token?: string;
    error?: string;
    done?: boolean;
    sources?: { document: string; relevance: number; content?: string; page?: number }[];
}

export interface Conversation {
    id: string;
    preview: string;
    lastUpdated: string;
    messageCount: number;
}

export interface ConversationsResponse {
    conversations: Conversation[];
}

// Re-export types from other modules
export type { StatusResponse, OllamaStatusResponse } from './status';
export type { LogsResponse, LogContentResponse } from './logs';
export type { Document, DocumentsResponse } from './documents';

// API service with methods for all operations
export const api = {
    // Auth methods - using the singleton AuthService
    get auth() {
        return AuthService.getInstance();
    },

    // Document methods
    uploadDocument: documents.uploadDocument,
    getDocuments: documents.getDocuments,
    deleteDocument: documents.deleteDocument,
    clearDocuments: documents.clearDocuments,

    // Conversation methods
    createNewConversation: conversation.createNewConversation,
    getConversations: conversation.getConversations,
    getConversation: conversation.getConversation,
    saveConversation: conversation.saveConversation,
    deleteConversation: conversation.deleteConversation,
    clearAllConversations: conversation.clearAllConversations,
    chat: conversation.chat,
    createAbortController: conversation.createAbortController,
    streamChatWithAbort: conversation.streamChatWithAbort,

    // Status methods
    getStatus: status.getStatus,
    checkOllama: status.checkOllama,

    // Log methods
    getLogs: logs.getLogs,
    getLogContent: logs.getLogContent,

    // Query the knowledge base
    async query(query: string): Promise<ChatResponse> {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/query`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query }),
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.message || `Failed to query knowledge base: ${response.statusText}`);
            }

            return await response.json();
        } catch (error: any) {
            console.error('API error in query:', error);
            throw error;
        }
    },

    // Settings
    getModels: settings.getModels,
    setModel: settings.setModel,
};
