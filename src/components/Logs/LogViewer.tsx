// src/components/Logs/LogViewer.tsx
"use client"

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/services/api';

function extractDateFromFilename(filename: string): Date {
    const match = filename.match(/(\d{8})/); // e.g. 20250429
    if (match) {
        const [year, month, day] = [
            match[1].slice(0, 4),
            match[1].slice(4, 6),
            match[1].slice(6, 8),
        ];
        return new Date(`${year}-${month}-${day}`);
    }
    return new Date(0); // fallback to oldest possible
}

export function LogViewer() {
    const [logs, setLogs] = useState<any[]>([]);
    const [selectedLog, setSelectedLog] = useState<string | null>(null);
    const [logContent, setLogContent] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [contentLoading, setContentLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [logLevels, setLogLevels] = useState(['ERROR', 'WARNING', 'INFO', 'DEBUG']);

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await api.getLogs();
            const sortedLogs = (response.logs || []).sort((a, b) => {
                // Try extracting date from filename like "streamlit_20250429.log"
                const dateA = extractDateFromFilename(a.filename);
                const dateB = extractDateFromFilename(b.filename);
                return dateB.getTime() - dateA.getTime(); // Newest first
            });
            setLogs(sortedLogs);

            // Select the first log file by default
            if (response.logs && response.logs.length > 0) {
                setSelectedLog(response.logs[0].filename);
                await fetchLogContent(response.logs[0].filename);
            }
        } catch (err: any) {
            console.error('Error fetching logs:', err);
            setError(err.message || 'Failed to fetch logs');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const fetchLogContent = async (filename: string) => {
        if (!filename) return;

        setContentLoading(true);
        setError(null);

        try {
            const response = await api.getLogContent(filename);
            setLogContent(response.content || '');
        } catch (err: any) {
            console.error('Error fetching log content:', err);
            setError(err.message || 'Failed to fetch log content');
        } finally {
            setContentLoading(false);
        }
    };

    const handleLogSelect = async (filename: string) => {
        setSelectedLog(filename);
        await fetchLogContent(filename);
    };

    // Filter log content based on search term and selected log levels
    const getFilteredContent = () => {
        if (!logContent) return '';

        const lines = logContent.split('\n');
        return lines
            .filter(line => {
                // Check if line contains search term
                const matchesSearch = !searchTerm || line.toLowerCase().includes(searchTerm.toLowerCase());

                // Check if line matches any of the selected log levels
                const matchesLevel = logLevels.some(level => line.includes(level));

                return matchesSearch && matchesLevel;
            })
            .join('\n');
    };

    const filteredContent = getFilteredContent();
    const lineCount = filteredContent ? filteredContent.split('\n').length : 0;

    // Calculate log level counts
    const errorCount = logContent.split('\n').filter(line => line.includes('ERROR')).length;
    const warningCount = logContent.split('\n').filter(line => line.includes('WARNING')).length;
    const infoCount = logContent.split('\n').filter(line => line.includes('INFO')).length;
    const debugCount = logContent.split('\n').filter(line => line.includes('DEBUG')).length;

    if (loading) {
        return (
            <div className="flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div
            className="flex-1 overflow-y-auto w-full max-w-4xl mx-auto px-6 py-8 pb-32" style={{ height: "100%" }}>
            <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 text-center">
                    <div className="bg-white dark:bg-dark-3 p-4 rounded-lg shadow">
                        <p className="text-2xl font-bold text-purple-600">{logs.length}</p>
                        <p className="text-sm text-gray-500">Log Files</p>
                    </div>
                    <div className="bg-white dark:bg-dark-3 p-4 rounded-lg shadow">
                        <p className="text-2xl font-bold text-purple-600">
                            {selectedLog && logs.find(l => l.filename === selectedLog)?.last_modified
                                ? formatTimeSince(logs.find(l => l.filename === selectedLog)?.last_modified)
                                : 'Unknown'}
                        </p>
                        <p className="text-sm text-gray-500">Last Update</p>
                    </div>
                    <div className="bg-white dark:bg-dark-3 p-4 rounded-lg shadow">
                        <p className="text-2xl font-bold text-purple-600">
                            {logs.reduce((total, log) => total + (log.size || 0), 0) / 1024 > 1024
                                ? `${(logs.reduce((total, log) => total + (log.size || 0), 0) / 1024 / 1024).toFixed(1)} MB`
                                : `${(logs.reduce((total, log) => total + (log.size || 0), 0) / 1024).toFixed(1)} KB`}
                        </p>
                        <p className="text-sm text-gray-500">Total Size</p>
                    </div>
                </div>

                <div className="mb-4">
                    <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Select log file to view:
                    </label>
                    <select
                        value={selectedLog || ''}
                        onChange={(e) => handleLogSelect(e.target.value)}
                        className="w-full border rounded-md px-4 py-2 bg-gray-100 dark:bg-dark-2 dark:border-gray-700"
                    >
                        {logs.map((log) => (
                            <option key={log.filename} value={log.filename}>
                                {log.filename} ({formatFileSize(log.size || 0)}, {formatDate(log.last_modified)})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-col md:flex-row gap-4 mb-4">
                    <div className="flex-1">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search logs..."
                            className="w-full border rounded-md px-4 py-2 bg-gray-100 dark:bg-dark-2 dark:border-gray-700"
                        />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {['ERROR', 'WARNING', 'INFO', 'DEBUG'].map((level) => (
                            <label key={level} className="inline-flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={logLevels.includes(level)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setLogLevels([...logLevels, level]);
                                        } else {
                                            setLogLevels(logLevels.filter(l => l !== level));
                                        }
                                    }}
                                    className="rounded text-purple-500"
                                />
                                <span className="text-sm">{level}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Log Viewer
                    </label>
                    {contentLoading ? (
                        <div className="flex justify-center items-center py-10">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : (
                        <>
                            <textarea
                                readOnly
                                value={filteredContent}
                                className="w-full h-64 p-4 rounded-md bg-gray-100 dark:bg-dark-2 dark:text-white border border-gray-300 dark:border-gray-700 text-sm font-mono"
                            />
                            <p className="mt-2 text-green-600 text-sm">
                                Found {lineCount} matching lines
                            </p>
                        </>
                    )}
                </div>

                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={fetchLogs}
                        className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white rounded-md px-4 py-2 text-sm font-medium"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="1 4 1 10 7 10"></polyline>
                            <polyline points="23 20 23 14 17 14"></polyline>
                            <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
                        </svg>
                        Refresh
                    </button>

                    <button
                        onClick={() => {
                            // Create a download link for the log content
                            const element = document.createElement('a');
                            const file = new Blob([logContent], { type: 'text/plain' });
                            element.href = URL.createObjectURL(file);
                            element.download = selectedLog || 'log.txt';
                            document.body.appendChild(element);
                            element.click();
                            document.body.removeChild(element);
                        }}
                        className="text-sm text-blue-600 hover:underline"
                    >
                        Download Log
                    </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center bg-white dark:bg-dark-3 p-4 rounded-md shadow">
                    <div>
                        <p className="text-2xl font-bold text-red-500">{errorCount}</p>
                        <p className="text-sm text-gray-500">Errors</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-yellow-500">{warningCount}</p>
                        <p className="text-sm text-gray-500">Warnings</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-blue-500">{infoCount}</p>
                        <p className="text-sm text-gray-500">Info</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-400">{debugCount}</p>
                        <p className="text-sm text-gray-500">Debug</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Helper functions
function formatFileSize(bytes: number) {
    if (bytes < 1024) {
        return `${bytes} bytes`;
    } else if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`;
    } else {
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
}

function formatDate(timestamp: number) {
    if (!timestamp) return 'Unknown';
    return new Date(timestamp * 1000).toLocaleString();
}

function formatTimeSince(timestamp: number) {
    if (!timestamp) return 'Unknown';

    const now = new Date();
    const date = new Date(timestamp * 1000);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return `${seconds} seconds ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
}