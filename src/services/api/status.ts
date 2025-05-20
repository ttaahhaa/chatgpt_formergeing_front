// src/services/api/status.ts
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface StatusResponse {
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

export interface OllamaStatusResponse {
    status: 'available' | 'unavailable';
    models?: string[];
    error?: string;
}

export const getStatus = async (): Promise<StatusResponse> => {
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
};

export const checkOllama = async (): Promise<OllamaStatusResponse> => {
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
}; 