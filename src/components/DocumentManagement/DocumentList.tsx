// src/components/DocumentManagement/DocumentList.tsx
"use client"

import { useState, useEffect } from 'react';
import { api } from '@/services/api';

export function DocumentList() {
    const [documents, setDocuments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);

    const fetchDocuments = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.getDocuments();
            setDocuments(response.documents || []);
        } catch (err: any) {
            console.error('Error fetching documents:', err);
            setError(err.message || 'Failed to load documents');
        } finally {
            setLoading(false);
        }
    };

    const clearAllDocuments = async () => {
        try {
            await api.clearDocuments();
            setDocuments([]);
            setShowConfirmDialog(false);
        } catch (err: any) {
            console.error('Error clearing documents:', err);
            setError(err.message || 'Failed to clear documents');
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, []);

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
                    onClick={fetchDocuments}
                    className="mt-2 text-sm text-red-700 underline"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    className="text-orange-500">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                Loaded Documents
            </h2>

            {documents.length === 0 ? (
                <div className="bg-gray-50 dark:bg-dark-2 p-6 text-center rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"
                        className="mx-auto text-gray-400 mb-2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                    </svg>
                    <p className="text-gray-500">No documents loaded yet. Upload documents to get started.</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                        {documents.map((doc, index) => (
                            <div key={index} className="bg-white dark:bg-dark-3 rounded-lg shadow p-4">
                                <div className="flex items-start">
                                    {/* Document icon based on type */}
                                    <div className="text-2xl mr-3">
                                        {getDocumentIcon(doc.metadata?.type || 'unknown')}
                                    </div>

                                    <div className="flex-1">
                                        <h3 className="font-medium text-gray-800 dark:text-white truncate">{doc.filename}</h3>
                                        <p className="text-xs text-gray-500">
                                            {doc.metadata?.type || 'Unknown'} • {formatFileSize(doc.metadata?.size || 0)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Document actions */}
                    <div className="mt-6">
                        <h3 className="text-lg font-medium mb-4">Batch Actions</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <button
                                onClick={() => setShowConfirmDialog(true)}
                                className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white rounded-md py-3"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                </svg>
                                Clear All Documents
                            </button>

                            <button
                                onClick={fetchDocuments}
                                className="flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-600 text-white rounded-md py-3"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="1 4 1 10 7 10"></polyline>
                                    <polyline points="23 20 23 14 17 14"></polyline>
                                    <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
                                </svg>
                                Refresh Document List
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* Confirmation Dialog */}
            {showConfirmDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-dark-3 p-6 rounded-lg max-w-md w-full">
                        <h3 className="text-lg font-semibold mb-2">Confirm Delete</h3>
                        <p className="mb-4 text-gray-600 dark:text-gray-300">
                            Are you sure you want to delete all documents? This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowConfirmDialog(false)}
                                className="px-4 py-2 bg-gray-200 dark:bg-dark-4 rounded"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={clearAllDocuments}
                                className="px-4 py-2 bg-red-500 text-white rounded"
                            >
                                Delete All
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Helper functions
function getDocumentIcon(type: string) {
    switch (type.toLowerCase()) {
        case 'pdf':
            return '📕';
        case 'docx':
        case 'doc':
            return '📘';
        case 'txt':
            return '📄';
        case 'csv':
            return '📊';
        case 'code':
            return '📝';
        default:
            return '📁';
    }
}

function formatFileSize(bytes: number) {
    if (bytes < 1024) {
        return `${bytes} bytes`;
    } else if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`;
    } else {
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
}