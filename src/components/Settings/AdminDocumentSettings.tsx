"use client";

import { useState } from "react";
import { clearAllDocuments } from "@/services/api/documents";
import { useAuth } from "@/contexts/AuthContext";
import AuthService from "@/services/auth";

export default function AdminDocumentSettings() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const { permissions } = useAuth();
    const authService = AuthService.getInstance();

    const canManageDocuments = authService.hasPermission("admin:manage");

    const handleClearAllDocuments = () => {
        if (!canManageDocuments) {
            setError("You don't have permission to manage documents");
            return;
        }
        setShowConfirmation(true);
    };

    const confirmClearDocuments = async () => {
        if (!showConfirmation) return; // Extra safety check

        try {
            setLoading(true);
            setError(null);
            setSuccess(null);

            const result = await clearAllDocuments();
            setSuccess(result.message);
        } catch (err: any) {
            setError(err.message || "Failed to clear documents");
        } finally {
            setLoading(false);
            setShowConfirmation(false);
        }
    };

    const cancelClearDocuments = () => {
        setShowConfirmation(false);
        setError(null);
    };

    if (!canManageDocuments) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        You don&apos;t have permission to manage documents.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Document Management</h1>

            <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Clear All Documents</h2>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                        {success}
                    </div>
                )}

                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-lg font-semibold text-red-800 mb-2">Danger Zone</h3>
                            <div className="text-red-700">
                                <p className="mb-2">This action will:</p>
                                <ul className="list-disc list-inside space-y-1">
                                    <li>Permanently delete ALL documents for ALL users</li>
                                    <li>Remove all document metadata and history</li>
                                    <li>This action cannot be undone</li>
                                    <li>All users will lose access to their documents</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleClearAllDocuments}
                    disabled={loading || showConfirmation}
                    className={`px-4 py-2 rounded-lg font-medium ${loading || showConfirmation
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-red-600 hover:bg-red-700 text-white"
                        }`}
                >
                    {loading ? "Clearing..." : "Clear All Documents"}
                </button>
            </section>

            {/* Confirmation Modal */}
            {showConfirmation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
                        <div className="flex items-center mb-4">
                            <div className="flex-shrink-0">
                                <svg className="h-6 w-6 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <h3 className="ml-3 text-lg font-medium text-gray-900 dark:text-white">
                                Confirm Document Deletion
                            </h3>
                        </div>
                        <div className="mt-2">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Are you absolutely sure you want to delete ALL documents? This action cannot be undone and will affect all users in the system.
                            </p>
                        </div>
                        <div className="mt-4 flex justify-end space-x-3">
                            <button
                                onClick={cancelClearDocuments}
                                disabled={loading}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmClearDocuments}
                                disabled={loading}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? "Deleting..." : "Yes, Delete All Documents"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 