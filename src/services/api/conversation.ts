// src/services/api/conversation.ts
import { FetchOptions, apiFetch, handleError } from './core';
import { Message } from '@/contexts/ConversationContext';

export interface Conversation {
    id: string;
    preview: string;
    lastUpdated: string;
    messageCount: number;
}

export interface ChatRequest {
    message: string;
    conversation_id?: string;
    conversation_context?: Array<{ role: string, content: string }>;
    mode?: "auto" | "documents_only" | "general_knowledge";
}

export interface ChatResponse {
    response: string;
    sources?: { document: string; relevance: number }[];
}

export interface StreamCallbacks {
    onToken: (token: string) => void;
    onComplete: (sources?: { document: string; relevance: number }[]) => void;
    onError: (message: string) => void;
}

export interface SaveConversationRequest {
    conversation_id: string;
    preview: string;
    history: Message[];
}

/**
 * Creates a new conversation
 * @returns The created conversation data
 */
export async function createNewConversation() {
    const options: FetchOptions = {
        method: 'POST',
        path: '/conversations/new',
    };

    try {
        return await apiFetch<{ conversation_id: string }>(options);
    } catch (error) {
        throw handleError(error, 'Failed to create conversation');
    }
}

/**
 * Get all conversations
 * @returns List of conversations
 */
export async function getConversations() {
    const options: FetchOptions = {
        method: 'GET',
        path: '/conversations',
    };

    try {
        return await apiFetch<{ conversations: Conversation[] }>(options);
    } catch (error) {
        throw handleError(error, 'Failed to fetch conversations');
    }
}

/**
 * Get a specific conversation
 * @param id The conversation ID
 * @returns The conversation data
 */
export async function getConversation(id: string) {
    const options: FetchOptions = {
        method: 'GET',
        path: `/conversations/${id}`,
    };

    try {
        return await apiFetch<{ messages: Message[] }>(options);
    } catch (error) {
        throw handleError(error, 'Failed to fetch conversation');
    }
}

/**
 * Save a conversation
 * @param data The conversation data to save
 */
export async function saveConversation(data: SaveConversationRequest) {
    const options: FetchOptions = {
        method: 'POST',
        path: '/conversations/save',
        body: data,
    };

    try {
        return await apiFetch(options);
    } catch (error) {
        throw handleError(error, 'Failed to save conversation');
    }
}

/**
 * Delete a conversation
 * @param id The conversation ID to delete
 */
export async function deleteConversation(id: string) {
    const options: FetchOptions = {
        method: 'DELETE',
        path: `/conversations/${id}`,
    };

    try {
        return await apiFetch(options);
    } catch (error) {
        throw handleError(error, 'Failed to delete conversation');
    }
}

/**
 * Clear all conversations
 */
export async function clearAllConversations() {
    const options: FetchOptions = {
        method: 'POST',
        path: '/conversations/clear',
    };

    try {
        return await apiFetch(options);
    } catch (error) {
        throw handleError(error, 'Failed to clear conversations');
    }
}

/**
 * Send a chat message
 * @param data The chat request data
 * @returns The chat response
 */
export async function chat(data: ChatRequest) {
    const options: FetchOptions = {
        method: 'POST',
        path: '/chat',
        body: data,
    };

    try {
        return await apiFetch<ChatResponse>(options);
    } catch (error) {
        throw handleError(error, 'Failed to send chat message');
    }
}

/**
 * Create an AbortController for streaming
 * @returns The AbortController and signal
 */
export function createAbortController() {
    const controller = new AbortController();
    const signal = controller.signal;
    return { controller, signal };
}

/**
 * Stream a chat message with abort capability
 * @param data The chat request data
 * @param callbacks Callbacks for streaming
 * @param signal AbortSignal for cancellation
 */
export async function streamChatWithAbort(
    data: ChatRequest,
    callbacks: StreamCallbacks,
    signal?: AbortSignal
) {
    const { onToken, onComplete, onError } = callbacks;

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/chat/stream`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(localStorage.getItem('token') ? { 'Authorization': `Bearer ${localStorage.getItem('token')}` } : {})
            },
            body: JSON.stringify(data),
            signal
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || `HTTP error ${response.status}`);
        }

        if (!response.body) {
            throw new Error('No response body');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let sources = undefined;
        let buffer = '';

        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const text = decoder.decode(value);
                buffer += text;

                // Process complete events in the buffer
                let startIndex = 0;
                let eventEndIndex;
                while ((eventEndIndex = buffer.indexOf('\n\n', startIndex)) !== -1) {
                    const eventData = buffer.substring(startIndex, eventEndIndex).trim();
                    startIndex = eventEndIndex + 2;

                    if (eventData.startsWith('data:')) {
                        const jsonStr = eventData.substring(5).trim();
                        try {
                            const data = JSON.parse(jsonStr);

                            if (data.token) {
                                onToken(data.token);
                            } else if (data.sources) {
                                sources = data.sources;
                            } else if (data.error) {
                                onError(data.error || 'An error occurred during streaming');
                                return;
                            } else if (data.done) {
                                // End of streaming
                                onComplete(sources);
                                return;
                            }
                        } catch (e) {
                            console.error('Failed to parse event data:', e, jsonStr);
                        }
                    }
                }

                // Keep any remaining incomplete event data in the buffer
                buffer = buffer.substring(startIndex);
            }

            // If we reach here, the stream ended without a 'done' event
            onComplete(sources);
        } catch (error: any) {
            if (error.name === 'AbortError') {
                console.log('Stream aborted');
                return;
            }
            throw error;
        }
    } catch (error: any) {
        if (error.name === 'AbortError') {
            console.log('Request aborted');
            return;
        }
        onError(error.message || 'Failed to stream message');
    }
}
