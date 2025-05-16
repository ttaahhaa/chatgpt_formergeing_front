// src/services/api.ts
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Define types for API responses
interface Document {
  id: string;
  filename: string;
  metadata?: {
    type?: string;
    size?: number;
    created?: string;
    lastModified?: string;
  };
}

interface DocumentsResponse {
  documents: any[];
}

interface LogsResponse {
  logs: {
    filename: string;
    size: number;
    last_modified: number;
  }[];
}

interface LogContentResponse {
  filename: string;
  content: string;
}

interface StatusResponse {
  llm_status: 'available' | 'unavailable';
  embeddings_status: 'available' | 'unavailable';
  current_model: string;
  document_count: number;
  vector_store_info?: {
    documents: number;
    embeddings: number;
  };
  memory_usage?: string;
  system_info?: {
    os: string;
    architecture: string;
    python_version: string;
    app_version: string;
  };
}

interface OllamaStatusResponse {
  status: 'available' | 'unavailable';
  models?: string[];
  error?: string;
}

interface ChatRequest {
  message: string;
  conversation_id?: string;
  conversation_context?: { role: string; content: string }[];
  mode?: 'auto' | 'documents_only' | 'general_knowledge';
}

interface ChatResponse {
  response: string;
  sources?: { document: string; relevance: number }[];
  conversation_id?: string;
}

// Define streaming chat request interface
interface StreamingChatRequest {
  message: string;
  conversation_id?: string;
  mode?: 'auto' | 'documents_only' | 'general_knowledge';
}

// Define streaming response type
interface StreamingData {
  token?: string;
  done?: boolean;
  sources?: any[];
  error?: string;
}

// Define callback types for streaming
type OnTokenCallback = (token: string) => void;
type OnCompleteCallback = (sources: any[]) => void;
type OnErrorCallback = (error: string) => void;

interface StreamChatResponse {
  token?: string;
  error?: string;
  done?: boolean;
  sources?: { document: string; relevance: number; content?: string; page?: number }[];
}

interface Conversation {
  id: string;
  preview: string;
  lastUpdated: string;
  messageCount: number;
}

interface ConversationsResponse {
  conversations: Conversation[];
}

// API service with methods for all operations
export const api = {
  // Get all documents
  async getDocuments(): Promise<DocumentsResponse> {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const response = await fetch(`${BASE_URL}/api/documents`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `Failed to fetch documents: ${response.statusText}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error('API error in getDocuments:', error);
      throw error;
    }
  },

  // Get all conversations
  async getConversations(): Promise<ConversationsResponse> {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const response = await fetch(`${BASE_URL}/api/conversations`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `Failed to fetch conversations: ${response.statusText}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error('API error in getConversations:', error);
      throw error;
    }
  },

  // Get a specific conversation with its messages
  async getConversation(conversationId: string): Promise<{
    conversation_id: string;
    messages: any[];
    preview: string;
    last_updated: string;
  }> {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const response = await fetch(`${BASE_URL}/api/conversations/${conversationId}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      // Parse response as text first to avoid JSON parsing errors
      const responseText = await response.text();

      let data;
      try {
        // Now try to parse as JSON
        data = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error(`Failed to parse conversation response: ${parseError}`);
      }

      // Check for error response
      if (!response.ok) {
        throw new Error(data.error || `Failed to fetch conversation: ${response.statusText}`);
      }

      return data;
    } catch (error: any) {
      console.error(`API error in getConversation(${conversationId}):`, error);
      throw error;
    }
  },

  // Get conversation messages
  async getConversationMessages(conversationId: string): Promise<{ messages: any[] }> {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const response = await fetch(`${BASE_URL}/api/conversations/${conversationId}/messages`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `Failed to fetch conversation messages: ${response.statusText}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error('API error in getConversationMessages:', error);
      throw error;
    }
  },

  // Save conversation
  async saveConversation(data: {
    conversation_id: string;
    preview?: string;
    history?: any[];
  }): Promise<{ status: string }> {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      // Ensure preview and history exist
      const payload = {
        conversation_id: data.conversation_id,
        preview: data.preview || "New Conversation",
        messages: data.history || [], // Use "messages" key for consistency with backend
        last_updated: new Date().toISOString() // Add timestamp
      };

      const response = await fetch(`${BASE_URL}/api/conversations/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || "Failed to save conversation");
      }

      return await response.json();
    } catch (error: any) {
      console.error('API error in saveConversation:', error);
      throw error;
    }
  },

  // Create new conversation
  async createNewConversation(): Promise<{ conversation_id: string }> {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const response = await fetch(`${BASE_URL}/api/conversations/new`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `Failed to create new conversation`);
      }

      return await response.json();
    } catch (error: any) {
      console.error('API error in createNewConversation:', error);
      throw error;
    }
  },

  // Clear all conversations
  async clearAllConversations(): Promise<{ message: string }> {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const response = await fetch(`${BASE_URL}/api/conversations/clear`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || `Failed to clear conversations: ${response.statusText}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error('API error in clearAllConversations:', error);
      throw error;
    }
  },
  // Upload a document
  async uploadDocument(file: File): Promise<Document> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const response = await fetch(`${BASE_URL}/api/upload`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `Failed to upload document: ${response.statusText}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error('API error in uploadDocument:', error);
      throw error;
    }
  },

  // Clear all documents
  async clearDocuments(): Promise<void> {
    try {
      const response = await fetch(`${BASE_URL}/api/clear_documents`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `Failed to clear documents: ${response.statusText}`);
      }
    } catch (error: any) {
      console.error('API error in clearDocuments:', error);
      throw error;
    }
  },

  // Delete a single document
  async deleteDocument(documentId: string): Promise<{ message: string }> {
    try {
      const formData = new FormData();
      formData.append('document_id', documentId);

      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const response = await fetch(`${BASE_URL}/api/delete_document`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `Failed to delete document: ${response.statusText}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error('API error in deleteDocument:', error);
      throw error;
    }
  },

  // Get all logs
  async getLogs(): Promise<LogsResponse> {
    try {
      const response = await fetch(`${BASE_URL}/api/logs`);

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `Failed to get logs: ${response.statusText}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error('API error in getLogs:', error);
      throw error;
    }
  },

  // Get log content
  async getLogContent(filename: string): Promise<LogContentResponse> {
    try {
      const response = await fetch(`${BASE_URL}/api/logs/${filename}`);

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `Failed to get log content: ${response.statusText}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error('API error in getLogContent:', error);
      throw error;
    }
  },

  // Get system status
  async getStatus(): Promise<StatusResponse> {
    try {
      const response = await fetch(`${BASE_URL}/api/status`);

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `Failed to get system status: ${response.statusText}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error('API error in getStatus:', error);
      throw error;
    }
  },

  // Check Ollama status
  async checkOllama(): Promise<OllamaStatusResponse> {
    try {
      const response = await fetch(`${BASE_URL}/api/check_ollama`);

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `Failed to check Ollama status: ${response.statusText}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error('API error in checkOllama:', error);
      throw error;
    }
  },

  // Chat with the assistant
  async chat(request: ChatRequest): Promise<ChatResponse> {
    try {
      const response = await fetch(`${BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `Failed to get chat response: ${response.statusText}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error('API error in chat:', error);
      throw error;
    }
  },

  // Add streaming chat method
  async streamChat(
    request: StreamingChatRequest,
    callbacks: {
      onToken?: OnTokenCallback;
      onComplete?: OnCompleteCallback;
      onError?: OnErrorCallback;
    }
  ): Promise<void> {
    try {
      const response = await fetch(`${BASE_URL}/api/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No response body");
      }

      try {
        let done = false;

        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;

          if (value) {
            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.trim() === '') continue;

              if (line.startsWith('data: ')) {
                const data = line.slice(6);

                if (data === '[DONE]') {
                  done = true;
                  break;
                }

                try {
                  const parsed: StreamingData = JSON.parse(data);

                  if (parsed.token && callbacks.onToken) {
                    callbacks.onToken(parsed.token);
                  } else if (parsed.done && callbacks.onComplete) {
                    callbacks.onComplete(parsed.sources || []);
                    done = true;
                  } else if (parsed.error && callbacks.onError) {
                    callbacks.onError(parsed.error);
                    done = true;
                  }
                } catch (parseError) {
                  console.error("Error parsing SSE data:", parseError);
                }
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error: any) {
      console.error('Streaming API error:', error);
      if (callbacks.onError) {
        callbacks.onError(error.message || 'Failed to stream chat response');
      }
      throw error;
    }
  },

  // Add method to create abort controller
  createAbortController(): { controller: AbortController; signal: AbortSignal } {
    const controller = new AbortController();
    return { controller, signal: controller.signal };
  },

  // Modified streaming chat method with abort support
  async streamChatWithAbort(
    request: StreamingChatRequest,
    callbacks: {
      onToken?: OnTokenCallback;
      onComplete?: OnCompleteCallback;
      onError?: OnErrorCallback;
    },
    signal?: AbortSignal
  ): Promise<void> {
    try {
      const response = await fetch(`${BASE_URL}/api/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
        signal, // Add abort signal
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Handle streaming response with abort support
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No response body");
      }

      try {
        let done = false;

        while (!done && !signal?.aborted) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;

          if (value) {
            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.trim() === '') continue;

              if (line.startsWith('data: ')) {
                const data = line.slice(6);

                if (data === '[DONE]') {
                  done = true;
                  break;
                }

                try {
                  const parsed: StreamingData = JSON.parse(data);

                  if (parsed.token && callbacks.onToken) {
                    callbacks.onToken(parsed.token);
                  } else if (parsed.done && callbacks.onComplete) {
                    callbacks.onComplete(parsed.sources || []);
                    done = true;
                  } else if (parsed.error && callbacks.onError) {
                    callbacks.onError(parsed.error);
                    done = true;
                  }
                } catch (parseError) {
                  console.error("Error parsing SSE data:", parseError);
                }
              }
            }
          }
        }

        // Handle abort
        if (signal?.aborted) {
          reader.cancel();
          throw new Error('Stream cancelled');
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error: any) {
      console.error('Streaming API error:', error);
      if (error.name === 'AbortError') {
        if (callbacks.onError) {
          callbacks.onError('Request was cancelled');
        }
      } else if (callbacks.onError) {
        callbacks.onError(error.message || 'Failed to stream chat response');
      }
      throw error;
    }
  },

  // Query the knowledge base
  async query(query: string): Promise<ChatResponse> {
    try {
      const response = await fetch(`${BASE_URL}/api/query`, {
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
  }
};