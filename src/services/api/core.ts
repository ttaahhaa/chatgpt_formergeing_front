// src/services/api/core.ts

export interface FetchOptions {
    method: string;
    path: string;
    body?: any;
    headers?: Record<string, string>;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function apiFetch<T = any>(options: FetchOptions): Promise<T> {
    const { method, path, body, headers = {} } = options;

    const defaultHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    // Add authorization header if token exists
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
            defaultHeaders['Authorization'] = `Bearer ${token}`;
        }
    }

    const response = await fetch(`${BASE_URL}/api${path}`, {
        method,
        headers: { ...defaultHeaders, ...headers },
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `HTTP error ${response.status}`);
    }

    return response.json();
}

export function handleError(error: any, defaultMessage: string): Error {
    console.error('API error:', error);
    if (error instanceof Error) {
        return error;
    }
    return new Error(defaultMessage);
} 