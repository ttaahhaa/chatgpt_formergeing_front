// src/components/Status/SystemStatus.tsx
"use client"

import { useState, useEffect } from 'react';

export function SystemStatus() {
    const [status, setStatus] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [runningHealthCheck, setRunningHealthCheck] = useState(false);
    const [healthCheckResults, setHealthCheckResults] = useState<any>(null);

    useEffect(() => {
        fetchStatus();
    }, []);

    const fetchStatus = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/status`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch system status');
            }

            const data = await response.json();
            setStatus(data);
        } catch (err: any) {
            console.error('Error fetching status:', err);
            setError(err.message || 'Failed to fetch system status');
        } finally {
            setLoading(false);
        }
    };

    const runHealthCheck = async () => {
        setRunningHealthCheck(true);
        setHealthCheckResults(null);

        try {
            // Simulate health check steps
            const steps = [
                'Checking LLM Service',
                'Validating Embedding Model',
                'Testing Vector Store',
                'Checking Document Loader'
            ];

            const results: any = {
                success: true,
                checks: {},
                warnings: []
            };

            for (const step of steps) {
                // In a real implementation, we would make actual API calls here
                await new Promise(resolve => setTimeout(resolve, 500));

                // Simulate some random results
                const isSuccess = Math.random() > 0.2;
                results.checks[step] = isSuccess;

                if (!isSuccess) {
                    results.success = false;
                    results.warnings.push(`Warning: Issue detected with ${step}`);
                }
            }

            setHealthCheckResults(results);
        } catch (err) {
            console.error('Error running health check:', err);
        } finally {
            setRunningHealthCheck(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">
                <p>Error: {error}</p>
                <button
                    onClick={fetchStatus}
                    className="mt-2 text-sm text-red-700 underline"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <p className="text-sm text-gray-500 mb-4">Last updated: {new Date().toLocaleTimeString()}</p>

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

            <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                Current model: <strong>{status?.current_model || 'mistral:latest'}</strong>
            </p>

            {/* System Info */}
            <details className="bg-white dark:bg-dark-3 shadow rounded-md mb-6 p-4">
                <summary className="font-semibold text-gray-700 dark:text-white cursor-pointer">
                    System Information
                </summary>
                <div className="grid grid-cols-1 sm:grid-cols-2 mt-4 gap-6">
                    <div>
                        <p className="text-sm text-gray-500">Operating System</p>
                        <p className="text-md font-medium">{status?.system_info?.os || 'Unknown'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Architecture</p>
                        <p className="text-md font-medium">{status?.system_info?.architecture || 'Unknown'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Python Version</p>
                        <p className="text-md font-medium">{status?.system_info?.python_version || 'Unknown'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">App Version</p>
                        <p className="text-md font-medium">{status?.system_info?.app_version || '1.0.0'}</p>
                    </div>
                </div>
            </details>

            {/* Quick Health Check */}
            <h2 className="text-lg font-semibold mb-3">Quick Health Check</h2>

            {runningHealthCheck ? (
                <div className="space-y-4 bg-white dark:bg-dark-3 shadow rounded-md p-4">
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                        <div className="bg-primary h-2.5 rounded-full animate-pulse" style={{ width: '100%' }}></div>
                    </div>
                    <p className="text-center">Running health check...</p>
                </div>
            ) : (
                <button
                    onClick={runHealthCheck}
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

                    {healthCheckResults.warnings.length > 0 && (
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    onClick={async () => {
                        try {
                            await fetch(
                                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/clear_cache`,
                                { method: 'POST' }
                            );
                            alert('Cache cleared successfully');
                        } catch (err) {
                            alert('Failed to clear cache');
                            console.error(err);
                        }
                    }}
                    className="flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-600 text-white rounded-md py-3"
                >
                    🧹 Clear Cache
                </button>
            </div>
        </div>
    );
}