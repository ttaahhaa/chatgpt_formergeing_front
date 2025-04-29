"use client"

import { useState, useEffect } from 'react';
import { api } from '@/services/api';

export function ModelSelector() {
    const [models, setModels] = useState<string[]>([]);
    const [selectedModel, setSelectedModel] = useState<string>('mistral:latest');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    useEffect(() => {
        const fetchModels = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/models`);
                if (!response.ok) throw new Error('Failed to fetch models');

                const data = await response.json();
                setModels(data.models || []);
                setSelectedModel(data.current_model || 'mistral:latest');
            } catch (err) {
                console.error('Error fetching models:', err);
                // Fallback model list
                setModels(['mistral:latest', 'llama2:7b']);
            }
        };

        fetchModels();
    }, []);

    const handleModelChange = async () => {
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/set_model`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ model: selectedModel })
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update model');
            }

            setSuccess('Model updated successfully');

            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-dark-3 p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="text-xl">🤖</span> LLM Configuration
            </h2>

            <div className="bg-green-100 text-green-800 text-sm rounded-md px-4 py-2 mb-4">
                ✅ Ollama is running and available
            </div>

            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Select Ollama model to use
            </label>

            <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full border rounded-md px-4 py-2 mb-4 bg-gray-100 dark:bg-dark-2 dark:border-gray-700"
            >
                {models.map(model => (
                    <option key={model} value={model}>{model}</option>
                ))}
            </select>

            <button
                onClick={handleModelChange}
                disabled={loading}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white rounded-md py-3 mb-2 font-medium disabled:bg-purple-300"
            >
                {loading ? 'Updating...' : 'Apply Model Change'}
            </button>

            {error && (
                <div className="mt-2 text-red-500 text-sm">
                    {error}
                </div>
            )}

            {success && (
                <div className="mt-2 text-green-500 text-sm">
                    {success}
                </div>
            )}
        </div>
    );
}