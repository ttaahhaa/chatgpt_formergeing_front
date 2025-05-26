// src/services/api/documents.ts
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface Document {
    id: string;
    filename: string;
    metadata?: {
        type?: string;
        size?: number;
        created?: string;
        lastModified?: string;
    };
}

export interface DocumentsResponse {
    documents: any[];
}

export const uploadDocument = async (file: File): Promise<Document> => {
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
};

export const getDocuments = async (): Promise<DocumentsResponse> => {
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
};

export const deleteDocument = async (documentId: string): Promise<{ message: string }> => {
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
};

export const clearDocuments = async (): Promise<void> => {
    try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const response = await fetch(`${BASE_URL}/api/clear_documents`, {
            method: 'POST',
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || `Failed to clear documents: ${response.statusText}`);
        }
    } catch (error: any) {
        console.error('API error in clearDocuments:', error);
        throw error;
    }
};

export const clearAllDocuments = async (): Promise<{ message: string }> => {
    try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const response = await fetch(`${BASE_URL}/api/clear_all_documents`, {
            method: 'POST',
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                'Content-Type': 'application/json'
            },
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            if (response.status === 403) {
                throw new Error('Permission denied: Admin access required');
            }
            throw new Error(error.error || `Failed to clear all documents: ${response.statusText}`);
        }

        return await response.json();
    } catch (error: any) {
        console.error('API error in clearAllDocuments:', error);
        throw error;
    }
};

export const buildKnowledgeGraph = async (userId?: string): Promise<{ message: string }> => {
    try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const response = await fetch(`${BASE_URL}/api/knowledge_graph/build`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({ user_id: userId })
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || `Failed to build knowledge graph: ${response.statusText}`);
        }

        return await response.json();
    } catch (error: any) {
        console.error('API error in buildKnowledgeGraph:', error);
        throw error;
    }
}; 