// src/services/api/index.ts
import AuthService from '../auth';
import * as documents from './documents';
import * as conversation from './conversation';
import * as status from './status';
import * as logs from './logs';
import * as settings from './settings';
import { apiFetch, FetchOptions } from './core';
import { handleError } from './utils';

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

export const clearCache = async (): Promise<void> => {
    const options: FetchOptions = {
        method: 'POST',
        path: '/clear_cache',
    };

    try {
        return await apiFetch(options);
    } catch (error) {
        throw handleError(error, 'Failed to clear cache');
    }
};

export const api = {
    auth: AuthService.getInstance(),
    uploadDocument: documents.uploadDocument,
    getDocuments: documents.getDocuments,
    deleteDocument: documents.deleteDocument,
    clearDocuments: documents.clearDocuments,
    clearAllDocuments: documents.clearAllDocuments,
    getConversations: conversation.getConversations,
    getConversation: conversation.getConversation,
    createNewConversation: conversation.createNewConversation,
    deleteConversation: conversation.deleteConversation,
    clearAllConversations: conversation.clearAllConversations,
    chat: conversation.chat,
    createAbortController: conversation.createAbortController,
    streamChatWithAbort: conversation.streamChatWithAbort,
    getStatus: status.getStatus,
    checkOllama: status.checkOllama,
    getLogs: logs.getLogs,
    getLogContent: logs.getLogContent,
    getModels: settings.getModels,
    setModel: settings.setModel,
    getPreferredModel: settings.getPreferredModel,
    clearCache,
    buildKnowledgeGraph: documents.buildKnowledgeGraph,
    saveConversation: conversation.saveConversation,
};
