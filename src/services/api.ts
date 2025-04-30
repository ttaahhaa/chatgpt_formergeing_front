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
  documents: string[];
  total?: number;
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
      const response = await fetch('/api/documents');

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch documents');
      }

      return await response.json();
    } catch (error) {
      console.error('API error in getDocuments:', error);
      throw error;
    }
  },

  // Upload a document
  async uploadDocument(file: File): Promise<Document> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to upload document');
      }

      return await response.json();
    } catch (error) {
      console.error('API error in uploadDocument:', error);
      throw error;
    }
  },

  // Clear all documents
  async clearDocuments(): Promise<void> {
    try {
      const response = await fetch('/api/clear_documents', {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to clear documents');
      }
    } catch (error) {
      console.error('API error in clearDocuments:', error);
      throw error;
    }
  },

  // Get all logs
  async getLogs(): Promise<LogsResponse> {
    try {
      const response = await fetch('/api/logs');

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to get logs');
      }

      return await response.json();
    } catch (error) {
      console.error('API error in getLogs:', error);
      throw error;
    }
  },

  // Get log content
  async getLogContent(filename: string): Promise<LogContentResponse> {
    try {
      const response = await fetch(`/api/logs/${filename}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to get log content');
      }

      return await response.json();
    } catch (error) {
      console.error('API error in getLogContent:', error);
      throw error;
    }
  },

  // Get system status
  async getStatus(): Promise<StatusResponse> {
    try {
      const response = await fetch('/api/status');

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to get system status');
      }

      return await response.json();
    } catch (error) {
      console.error('API error in getStatus:', error);
      throw error;
    }
  },

  // Check Ollama status
  async checkOllama(): Promise<OllamaStatusResponse> {
    try {
      const response = await fetch('/api/check_ollama');

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to check Ollama status');
      }

      return await response.json();
    } catch (error) {
      console.error('API error in checkOllama:', error);
      throw error;
    }
  },

  // Chat with the assistant
  async chat(request: ChatRequest): Promise<ChatResponse> {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to get chat response');
      }

      return await response.json();
    } catch (error) {
      console.error('API error in chat:', error);
      throw error;
    }
  },

  // Query the knowledge base
  async query(query: string): Promise<ChatResponse> {
    try {
      const response = await fetch('/api/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to query knowledge base');
      }

      return await response.json();
    } catch (error) {
      console.error('API error in query:', error);
      throw error;
    }
  }
};