import { FetchOptions, apiFetch, handleError } from './core';

/**
 * Get available models and current model
 */
export async function getModels() {
    const options: FetchOptions = {
        method: 'GET',
        path: '/models',
    };

    try {
        return await apiFetch<{ models: string[], current_model: string }>(options);
    } catch (error) {
        throw handleError(error, 'Failed to fetch models');
    }
}

/**
 * Set the current model
 */
export async function setModel(data: { model: string }) {
    const options: FetchOptions = {
        method: 'POST',
        path: '/set_model',
        body: data,
    };

    try {
        return await apiFetch(options);
    } catch (error) {
        throw handleError(error, 'Failed to set model');
    }
}

/**
 * Get user's preferred model
 */
export async function getPreferredModel() {
    const options: FetchOptions = {
        method: 'GET',
        path: '/user/preferred-model',
    };

    try {
        return await apiFetch<{ preferred_model: string }>(options);
    } catch (error) {
        throw handleError(error, 'Failed to fetch preferred model');
    }
} 