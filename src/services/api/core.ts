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

    try {
        const response = await fetch(`${BASE_URL}/api${path}`, {
            method,
            headers: { ...defaultHeaders, ...headers },
            body: body ? JSON.stringify(body) : undefined,
            credentials: 'include', // Include cookies in the request
        });

        if (!response.ok) {
            if (response.status === 401) {
                // Clear token if unauthorized
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('token');
                    localStorage.removeItem('userInfo');
                    // Clear the token cookie
                    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict; Secure; HttpOnly';
                }
                throw new Error('Authentication required');
            }
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || `HTTP error ${response.status}`);
        }

        return response.json();
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
}

export function handleError(error: any, defaultMessage: string): Error {
    console.error('API error:', error);
    if (error instanceof Error) {
        return error;
    }
    return new Error(defaultMessage);
} 