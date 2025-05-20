"use client";

import { useEffect, useState } from "react";
import { api } from "@/services/api";

export default function SettingsPanel() {
    const [ollamaStatus, setOllamaStatus] = useState("loading");
    const [availableModels, setAvailableModels] = useState<string[]>([]);
    const [currentModel, setCurrentModel] = useState<string>("");
    const [selectedModel, setSelectedModel] = useState<string>("");
    const [message, setMessage] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [clearingConversations, setClearingConversations] = useState(false);

    useEffect(() => {
        async function initialize() {
            try {
                setLoading(true);
                const status = await api.getStatus();
                setOllamaStatus(status.llm_status);
                setCurrentModel(status.current_model);
                setSelectedModel(status.current_model);

                const modelsRes = await api.checkOllama();
                setAvailableModels(modelsRes.models || []);
            } catch (error) {
                setMessage("⚠️ Failed to fetch system status or models");
            } finally {
                setLoading(false);
            }
        }

        initialize();
    }, []);

    const handleModelChange = async () => {
        try {
            await api.setModel({ model: selectedModel });
            setMessage(`✅ Model updated to ${selectedModel}`);
            setCurrentModel(selectedModel);
        } catch (error) {
            setMessage("❌ Failed to update model");
        }
    };

    const clearData = async (type: "conversations" | "documents" | "cache") => {
        if (type === "conversations") {
            if (!confirm("Are you sure you want to delete ALL conversations? This action cannot be undone.")) {
                return;
            }
            setClearingConversations(true);
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
                case "documents":
                    await api.clearDocuments();
                    setMessage("✅ Documents cleared successfully");
                    break;
                case "cache":
                    // Note: There's no direct API call for clearing cache in the current API
                    setMessage("⚠️ Cache clearing not implemented in API");
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
                        <h3 className="text-xl font-semibold">🧠 LLM Configuration</h3>
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
                                className="bg-gray-100 dark:bg-dark-2 px-4 py-2 rounded border shadow hover:bg-gray-200"
                            >
                                🗂 Clear Documents
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
        </div>
    );
}