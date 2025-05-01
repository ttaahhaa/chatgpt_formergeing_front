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

// API service with methods for all operations
export const api = {


  // Get all documents
  async getDocuments(): Promise<DocumentsResponse> {
    try {
      const response = await fetch(`${BASE_URL}/api/documents`);

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

  async saveConversation(data: {
    conversation_id: string;
    preview: string;
    history: any[];
  }): Promise<{ status: string }> {
    const response = await fetch(`${BASE_URL}/api/conversations/save`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  
    if (!response.ok) {
      throw new Error("Failed to save conversation");
    }
  
    return await response.json();
  },

  // Upload a document
  async uploadDocument(file: File): Promise<Document> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${BASE_URL}/api/upload`, {
        method: 'POST',
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
  async deleteDocument(filename: string): Promise<{ message: string }> {
    try {
      const formData = new FormData();
      formData.append('filename', filename);

      const response = await fetch(`${BASE_URL}/api/delete_document`, {
        method: 'POST',
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

  async createNewConversation(): Promise<{ conversation_id: string }> {
    try {
      const response = await fetch(`${BASE_URL}/api/conversations/new`, {
        method: 'POST',
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

