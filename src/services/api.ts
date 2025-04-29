// src/services/api.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const api = {
  async uploadDocument(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/api/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error uploading document');
    }

    return response.json();
  },

  async getDocuments() {
    const response = await fetch(`${API_BASE_URL}/api/documents`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error fetching documents');
    }

    return response.json();
  },

  async clearDocuments() {
    const response = await fetch(`${API_BASE_URL}/api/clear_documents`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error clearing documents');
    }

    return response.json();
  },

  async chat(message: string, conversationId?: string, context?: any[], mode: string = 'auto') {
    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        conversation_id: conversationId,
        conversation_context: context,
        mode
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error processing chat');
    }

    return response.json();
  },

  async getLogs() {
    const response = await fetch(`${API_BASE_URL}/api/logs`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error fetching logs');
    }

    return response.json();
  },

  async getLogContent(filename: string) {
    const response = await fetch(`${API_BASE_URL}/api/logs/${filename}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error fetching log content');
    }

    return response.json();
  }
};