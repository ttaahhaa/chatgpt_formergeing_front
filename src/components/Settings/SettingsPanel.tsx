"use client";

import { useEffect, useState } from "react";
import { api } from "@/services/api";

// Constants for localStorage keys
const STORED_MODELS_KEY = 'ollama_models';
const MODELS_TIMESTAMP_KEY = 'ollama_models_timestamp';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export default function SettingsPanel() {
    const [ollamaStatus, setOllamaStatus] = useState("loading");
    const [availableModels, setAvailableModels] = useState<string[]>([]);
    const [selectedModel, setSelectedModel] = useState<string>("");
    const [message, setMessage] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [clearingConversations, setClearingConversations] = useState(false);
    const [showDocumentConfirmation, setShowDocumentConfirmation] = useState(false);
    const [clearingDocuments, setClearingDocuments] = useState(false);

    // Function to fetch available models
    const fetchAvailableModels = async () => {
        try {
            const response = await api.getModels();
            setAvailableModels(response.models || []);
        } catch (error) {
            setMessage("⚠️ Failed to fetch available models");
        }
    };

    // Function to fetch user's preferred model
    const fetchUserPreferredModel = async () => {
        try {
            const [status, preferredModel] = await Promise.all([
                api.getStatus(),
                api.getPreferredModel()
            ]);
            setOllamaStatus(status.llm_status);
            setSelectedModel(preferredModel.preferred_model);
        } catch (error) {
            setMessage("⚠️ Failed to fetch user's preferred model");
        }
    };

    // Initial load when component mounts
    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true);
            try {
                await Promise.all([
                    fetchAvailableModels(),
                    fetchUserPreferredModel()
                ]);
            } catch (error) {
                setMessage("⚠️ Failed to load initial data");
            } finally {
                setLoading(false);
            }
        };

        loadInitialData();
    }, []);

    // Handle model change
    const handleModelChange = async () => {
        try {
            setLoading(true);
            await api.setModel({ model: selectedModel });
            setMessage(`✅ Model updated to ${selectedModel}`);
            // Refresh the preferred model to ensure sync
            await fetchUserPreferredModel();
        } catch (error) {
            setMessage("❌ Failed to update model");
        } finally {
            setLoading(false);
        }
    };

    // Handle manual refresh of models
    const handleRefreshModels = async () => {
        setLoading(true);
        await fetchAvailableModels();
        setLoading(false);
    };

    const clearData = async (type: "conversations" | "documents" | "cache") => {
        if (type === "conversations") {
            if (!confirm("Are you sure you want to delete ALL conversations? This action cannot be undone.")) {
                return;
            }
            setClearingConversations(true);
        } else if (type === "documents") {
            setShowDocumentConfirmation(true);
            return;
        }

        try {
            switch (type) {
                case "conversations":
                    await api.clearAllConversations();
                    localStorage.removeItem("selectedConversationId");
                    const newConvResult = await api.createNewConversation();
                    if (newConvResult?.conversation_id) {
                        localStorage.setItem("selectedConversationId", newConvResult.conversation_id);
                    }
                    setMessage("✅ All conversations cleared successfully. A new conversation has been created.");
                    setTimeout(() => {
                        window.location.reload();
                    }, 1500);
                    break;
                case "cache":
                    setMessage("✅ Cache cleared successfully");
                    break;
            }
        } catch (error: any) {
            setMessage(`❌ Failed to clear ${type}: ${error.message || error}`);
        } finally {
            if (type === "conversations") {
                setClearingConversations(false);
            }
        }
    };

    const confirmClearDocuments = async () => {
        try {
            setClearingDocuments(true);
            const result = await api.clearAllDocuments();
            setMessage(result.message || "✅ All documents cleared successfully");
        } catch (error: any) {
            setMessage(`❌ Failed to clear documents: ${error.message || error}`);
        } finally {
            setClearingDocuments(false);
            setShowDocumentConfirmation(false);
        }
    };

    const cancelClearDocuments = () => {
        setShowDocumentConfirmation(false);
    };

    return (
        <div className="w-full max-w-4xl mx-auto space-y-10 px-6 py-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">⚙️ Assistant Settings</h2>

            {loading ? (
                <div className="flex justify-center items-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* LLM Section */}
                    <div className="bg-white dark:bg-dark-3 p-6 rounded-lg shadow space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-semibold">🧠 LLM Configuration</h3>
                            <button
                                onClick={handleRefreshModels}
                                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                            >
                                🔄 Refresh Models
                            </button>
                        </div>
                        <p className={`text-sm ${ollamaStatus === "available" ? "text-green-600" : "text-red-500"}`}>
                            Status: {ollamaStatus}
                        </p>
                        <label className="block font-medium text-sm mb-1">Model:</label>
                        <select
                            value={selectedModel}
                            onChange={(e) => setSelectedModel(e.target.value)}
                            className="w-full px-4 py-2 rounded-md border dark:bg-dark-2 dark:text-white"
                        >
                            {availableModels.map((model) => (
                                <option key={model} value={model}>{model}</option>
                            ))}
                        </select>
                        <button
                            onClick={handleModelChange}
                            className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full"
                        >
                            Apply Model
                        </button>
                    </div>

                    {/* Data Management */}
                    <div className="bg-white dark:bg-dark-3 p-6 rounded-lg shadow space-y-4">
                        <h3 className="text-xl font-semibold">💾 Data Management</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <button
                                onClick={() => clearData("conversations")}
                                disabled={clearingConversations}
                                className="bg-gray-100 dark:bg-dark-2 px-4 py-2 rounded border shadow hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {clearingConversations ? "Clearing..." : "🧹 Clear Conversations"}
                            </button>
                            <button
                                onClick={() => clearData("documents")}
                                disabled={clearingDocuments}
                                className="bg-gray-100 dark:bg-dark-2 px-4 py-2 rounded border shadow hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {clearingDocuments ? "Clearing..." : "🗂 Clear Documents"}
                            </button>
                            <button
                                onClick={() => clearData("cache")}
                                className="bg-gray-100 dark:bg-dark-2 px-4 py-2 rounded border shadow hover:bg-gray-200"
                            >
                                🚮 Clear Cache
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {message && (
                <div className="mt-6 text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-dark-2 px-4 py-2 rounded">
                    {message}
                </div>
            )}

            {/* Document Clear Confirmation Modal */}
            {showDocumentConfirmation && (
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
                                disabled={clearingDocuments}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmClearDocuments}
                                disabled={clearingDocuments}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {clearingDocuments ? "Deleting..." : "Yes, Delete All Documents"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}