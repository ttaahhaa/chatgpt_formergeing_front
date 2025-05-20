// src/services/api/logs.ts
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface LogsResponse {
    logs: {
        filename: string;
        size: number;
        last_modified: number;
    }[];
}

export interface LogContentResponse {
    filename: string;
    content: string;
}

export const getLogs = async (): Promise<LogsResponse> => {
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
};

export const getLogContent = async (filename: string): Promise<LogContentResponse> => {
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
}; 