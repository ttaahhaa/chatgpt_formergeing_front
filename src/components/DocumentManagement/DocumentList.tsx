"use client";

import { useState, useEffect } from "react";
import { api } from "@/services/api";

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
            console.error("Error fetching documents:", err);
            setError(err.message || "Failed to load documents");
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
            console.error("Error clearing documents:", err);
            setError(err.message || "Failed to clear documents");
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await api.deleteDocument(id);
            setDocuments(prev => prev.filter(d => d.id !== id));
        } catch (err: any) {
            console.error("Error deleting document:", err);
            setError(err.message || "Failed to delete document");
        }
    };

    const handlePreview = (doc: any) => {
        alert(doc.content?.slice(0, 1000) + "...");
    };

    useEffect(() => {
        fetchDocuments();
    }, []);

    const totalWords = documents.reduce(
        (sum, doc) => sum + (doc.content?.split(/\s+/).length || 0),
        0
    );
    const totalChars = documents.reduce(
        (sum, doc) => sum + (doc.content?.length || 0),
        0
    );

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
                📁 Loaded Documents
            </h2>

            <div className="grid grid-cols-3 gap-4 text-center my-6">
                <div>
                    <p className="text-2xl font-bold text-purple-600">{documents.length}</p>
                    <p className="text-sm text-gray-500">Documents</p>
                </div>
                <div>
                    <p className="text-2xl font-bold text-purple-600">{totalChars}</p>
                    <p className="text-sm text-gray-500">Characters</p>
                </div>
                <div>
                    <p className="text-2xl font-bold text-purple-600">{totalWords}</p>
                    <p className="text-sm text-gray-500">Words</p>
                </div>
            </div>

            {documents.length === 0 ? (
                <div className="bg-gray-50 dark:bg-dark-2 p-6 text-center rounded-lg">
                    <p className="text-gray-500">No documents loaded yet.</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                        {documents.map((doc, index) => (
                            <div key={index} className="bg-white dark:bg-dark-3 rounded-lg shadow p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-3">
                                        <div className="text-2xl">
                                            {getDocumentIcon(doc.metadata?.type || "unknown")}
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-gray-800 dark:text-white">
                                                {doc.filename}
                                            </h3>
                                            <p className="text-xs text-gray-500">
                                                {doc.metadata?.type || "Unknown"} •{" "}
                                                {formatFileSize(doc.metadata?.size || 0)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <button
                                            onClick={() => handlePreview(doc)}
                                            className="text-sm text-blue-600 hover:underline"
                                        >
                                            Preview
                                        </button>
                                        <button
                                            onClick={() => handleDelete(doc.id)}
                                            className="text-sm text-red-600 hover:underline"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="mt-6">
                        <h3 className="text-lg font-medium mb-4">Batch Actions</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <button
                                onClick={() => setShowConfirmDialog(true)}
                                className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white rounded-md py-3"
                            >
                                🗑️ Clear All Documents
                            </button>

                            <button
                                onClick={fetchDocuments}
                                className="flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-600 text-white rounded-md py-3"
                            >
                                🔄 Refresh Document List
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* Confirm Dialog */}
            {showConfirmDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-dark-3 p-6 rounded-lg max-w-md w-full">
                        <h3 className="text-lg font-semibold mb-2">Confirm Delete</h3>
                        <p className="mb-4 text-gray-600 dark:text-gray-300">
                            Are you sure you want to delete all documents?
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

// Helpers
function getDocumentIcon(type: string) {
    switch (type.toLowerCase()) {
        case "pdf":
            return "📕";
        case "docx":
        case "doc":
            return "📘";
        case "txt":
            return "📄";
        case "csv":
            return "📊";
        case "code":
            return "📝";
        default:
            return "📁";
    }
}

function formatFileSize(bytes: number) {
    if (bytes < 1024) return `${bytes} bytes`;
    else if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    else return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
