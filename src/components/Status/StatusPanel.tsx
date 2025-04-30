"use client"

import { useState, useEffect } from 'react';

// Define types for API responses
interface SystemStatus {
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

export default function StatusPanel() {
    const [status, setStatus] = useState<SystemStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [runningHealthCheck, setRunningHealthCheck] = useState(false);
    const [healthCheckResults, setHealthCheckResults] = useState<any>(null);
    const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

    // Fetch status from the API
    const fetchStatus = async () => {
        setLoading(true);
        setError(null);

        try {
            // Call our API endpoint
            const response = await fetch('/api/status');

            if (!response.ok) {
                throw new Error(`Error fetching status: ${response.statusText}`);
            }

            const data = await response.json();
            setStatus(data);
            setLastRefreshed(new Date());
        } catch (err: any) {
            console.error('Error fetching status:', err);
            setError(err.message || 'Failed to fetch system status');
        } finally {
            setLoading(false);
        }
    };

    // Check Ollama status
    const checkOllamaStatus = async () => {
        setRunningHealthCheck(true);
        setHealthCheckResults(null);

        try {
            const response = await fetch('/api/check_ollama');

            if (!response.ok) {
                throw new Error(`Error checking Ollama: ${response.statusText}`);
            }

            const data = await response.json();
            setHealthCheckResults({
                success: data.status === 'available',
                checks: {
                    'LLM Service': data.status === 'available',
                    'Models Available': data.models?.length > 0
                },
                models: data.models || [],
                warnings: data.status !== 'available' ? ['Ollama service is not available'] : []
            });
        } catch (err: any) {
            console.error('Error checking Ollama:', err);
            setHealthCheckResults({
                success: false,
                checks: {
                    'LLM Service': false
                },
                warnings: ['Error connecting to Ollama service']
            });
        } finally {
            setRunningHealthCheck(false);
        }
    };

    // Clear vector store cache
    const clearVectorStore = async () => {
        try {
            const response = await fetch('/api/clear_documents', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Error clearing documents: ${response.statusText}`);
            }

            alert('Vector store cleared successfully');
            fetchStatus(); // Refresh status
        } catch (err: any) {
            console.error('Error clearing vector store:', err);
            alert(`Failed to clear vector store: ${err.message}`);
        }
    };

    // Initial fetch of data
    useEffect(() => {
        fetchStatus();

        // Optional: set up auto-refresh every 30 seconds
        const intervalId = setInterval(fetchStatus, 30000);

        // Clean up interval on component unmount
        return () => clearInterval(intervalId);
    }, []);

    // Status indicator component
    const StatusIndicator = ({ status }: { status: 'available' | 'unavailable' }) => {
        const colors = {
            available: 'bg-green-500',
            unavailable: 'bg-red-500'
        };

        return (
            <div className="flex items-center gap-2">
                <span className={`inline-block w-3 h-3 ${colors[status]} rounded-full`}></span>
                <span className="capitalize">{status}</span>
            </div>
        );
    };

    if (loading && !status) {
        return (
            <div className="w-full max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">System Status</h1>
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">System Status</h1>
                <div className="bg-red-100 text-red-700 p-6 rounded-lg">
                    <h2 className="text-lg font-semibold mb-2">Error Loading Status</h2>
                    <p>{error}</p>
                    <button
                        onClick={fetchStatus}
                        className="mt-4 px-4 py-2 bg-red-200 hover:bg-red-300 text-red-800 rounded-md"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">System Status</h1>

                <div className="flex items-center gap-3">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Last updated: {lastRefreshed.toLocaleTimeString()}
                    </p>
                    <button
                        onClick={fetchStatus}
                        className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-dark-4 dark:hover:bg-dark-5 text-gray-700 dark:text-gray-300 rounded-md text-sm"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 2v6h-6"></path>
                            <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
                            <path d="M3 12a9 9 0 0 0 6.7 15L13 21"></path>
                            <path d="M13 21h6v-6"></path>
                        </svg>
                        Refresh
                    </button>
                </div>
            </div>

            {/* Status Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className={`px-4 py-3 rounded-md text-sm ${status?.llm_status === 'available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {status?.llm_status === 'available' ? '✅ LLM Service: Online' : '❌ LLM Service: Offline'}
                </div>
                <div className={`px-4 py-3 rounded-md text-sm ${status?.embeddings_status === 'available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {status?.embeddings_status === 'available' ? '✅ Embeddings: Online' : '❌ Embeddings: Offline'}
                </div>
                <div className="bg-blue-100 text-blue-800 px-4 py-3 rounded-md text-sm">
                    📄 Documents: {status?.document_count || 0} loaded
                </div>
                <div className="bg-blue-100 text-blue-800 px-4 py-3 rounded-md text-sm">
                    💾 Memory Usage: {status?.memory_usage || 'Normal'}
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* LLM Status */}
                <div className="bg-white dark:bg-dark-3 rounded-lg shadow p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            LLM Status
                        </h2>
                        <StatusIndicator status={status?.llm_status || 'unavailable'} />
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Current Model</span>
                            <span className="font-medium text-gray-800 dark:text-white">{status?.current_model || 'mistral:latest'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Endpoint</span>
                            <span className="font-medium text-gray-800 dark:text-white">http://localhost:11434</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">API Type</span>
                            <span className="font-medium text-gray-800 dark:text-white">Ollama</span>
                        </div>
                    </div>
                </div>

                {/* Embeddings Status */}
                <div className="bg-white dark:bg-dark-3 rounded-lg shadow p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            Embeddings Status
                        </h2>
                        <StatusIndicator status={status?.embeddings_status || 'unavailable'} />
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Model</span>
                            <span className="font-medium text-gray-800 dark:text-white">ArabERT</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Dimension</span>
                            <span className="font-medium text-gray-800 dark:text-white">768</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Location</span>
                            <span className="font-medium text-gray-800 dark:text-white">Local (data/embeddings/arabert)</span>
                        </div>
                    </div>
                </div>

                {/* Vector Store Status */}
                <div className="bg-white dark:bg-dark-3 rounded-lg shadow p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            Vector Store
                        </h2>
                        <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-blue-50 text-blue-800 border-blue-200">
                            FAISS
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Documents Indexed</span>
                            <span className="font-medium text-gray-800 dark:text-white">
                                {status?.vector_store_info?.documents || status?.document_count || 0}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Embeddings</span>
                            <span className="font-medium text-gray-800 dark:text-white">
                                {status?.vector_store_info?.embeddings || status?.document_count || 0}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Location</span>
                            <span className="font-medium text-gray-800 dark:text-white">data/cache/vector_store</span>
                        </div>
                    </div>
                </div>

                {/* System Info */}
                <div className="bg-white dark:bg-dark-3 rounded-lg shadow p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            System Information
                        </h2>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Operating System</span>
                            <span className="font-medium text-gray-800 dark:text-white">
                                {status?.system_info?.os || 'Linux/Windows/MacOS'}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Python Version</span>
                            <span className="font-medium text-gray-800 dark:text-white">
                                {status?.system_info?.python_version || '3.9+'}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">App Version</span>
                            <span className="font-medium text-gray-800 dark:text-white">
                                {status?.system_info?.app_version || '1.0.0'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Health Check */}
            <h2 className="text-lg font-semibold mt-8 mb-3">Quick Health Check</h2>

            {runningHealthCheck ? (
                <div className="space-y-4 bg-white dark:bg-dark-3 shadow rounded-md p-4 mb-6">
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                        <div className="bg-primary h-2.5 rounded-full animate-pulse" style={{ width: '100%' }}></div>
                    </div>
                    <p className="text-center">Running health check...</p>
                </div>
            ) : (
                <button
                    onClick={checkOllamaStatus}
                    className="w-full bg-purple-500 hover:bg-purple-600 text-white rounded-md py-3 font-medium mb-6"
                >
                    Run Health Check
                </button>
            )}

            {healthCheckResults && (
                <div className="bg-white dark:bg-dark-3 shadow rounded-md p-4 mb-6">
                    <h3 className="font-medium mb-2">
                        {healthCheckResults.success ? 'All systems operational ✅' : 'Issues detected ⚠️'}
                    </h3>

                    <div className="space-y-2">
                        {Object.entries(healthCheckResults.checks).map(([check, passed]: [string, any]) => (
                            <div key={check} className="flex items-center gap-2">
                                <span className={passed ? 'text-green-500' : 'text-red-500'}>
                                    {passed ? '✓' : '✗'}
                                </span>
                                <span>{check}</span>
                            </div>
                        ))}
                    </div>

                    {healthCheckResults.models && healthCheckResults.models.length > 0 && (
                        <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
                            <h4 className="font-medium mb-1">Available Models:</h4>
                            <div className="flex flex-wrap gap-2">
                                {healthCheckResults.models.map((model: string, index: number) => (
                                    <span key={index} className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-blue-50 text-blue-800 border-blue-200">
                                        {model}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {healthCheckResults.warnings && healthCheckResults.warnings.length > 0 && (
                        <div className="mt-4 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-md">
                            <h4 className="font-medium mb-1">Warnings:</h4>
                            <ul className="list-disc list-inside text-sm">
                                {healthCheckResults.warnings.map((warning: string, index: number) => (
                                    <li key={index}>{warning}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            {/* System Actions */}
            <h2 className="text-lg font-semibold mb-3">System Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <button
                    onClick={fetchStatus}
                    className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md py-3"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="1 4 1 10 7 10"></polyline>
                        <polyline points="23 20 23 14 17 14"></polyline>
                        <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
                    </svg>
                    Refresh Status
                </button>

                <button
                    onClick={clearVectorStore}
                    className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white rounded-md py-3"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="9" y1="9" x2="15" y2="15"></line>
                        <line x1="15" y1="9" x2="9" y2="15"></line>
                    </svg>
                    Clear Vector Store
                </button>
            </div>
        </div>
    );
}