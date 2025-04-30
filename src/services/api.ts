// src/services/api.ts

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
  documents: Document[];
  total: number;
}

// API service with methods for document operations
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

      const response = await fetch('/api/documents/upload', {
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

  // Delete a specific document
  async deleteDocument(documentId: string): Promise<void> {
    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete document');
      }
    } catch (error) {
      console.error('API error in deleteDocument:', error);
      throw error;
    }
  },

  // Clear all documents
  async clearDocuments(): Promise<void> {
    try {
      const response = await fetch('/api/documents', {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to clear documents');
      }
    } catch (error) {
      console.error('API error in clearDocuments:', error);
      throw error;
    }
  }
};