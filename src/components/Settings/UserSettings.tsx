"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { api } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import AuthService from "@/services/auth";

export default function UserSettings() {
    const [models, setModels] = useState<string[]>([]);
    const [currentModel, setCurrentModel] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
    const { permissions } = useAuth();
    const authService = AuthService.getInstance();

    // Check if user can view and change models
    const canViewModels = useMemo(() => authService.hasPermission("model:view"), [authService]);
    const canChangeModel = useMemo(() => authService.hasPermission("model:change"), [authService]);

    const fetchModels = useCallback(async () => {
        if (!canViewModels) return;

        try {
            setLoading(true);
            setError(null);
            const response = await api.getModels();
            setModels(response.models || []);
            setCurrentModel(response.current_model || "");
        } catch (err: any) {
            console.error("UserSettings: Error fetching models:", err);
            setError(err.message || "Failed to load models");
        } finally {
            setLoading(false);
        }
    }, [canViewModels]);

    useEffect(() => {
        fetchModels();
    }, [fetchModels]);

    const handleModelChange = useCallback(async (model: string) => {
        if (!canChangeModel || model === currentModel) return;

        try {
            setSaveStatus("saving");
            await api.setModel({ model });
            setCurrentModel(model);
            setSaveStatus("success");
            setTimeout(() => setSaveStatus("idle"), 3000);
        } catch (err: any) {
            console.error("UserSettings: Error setting model:", err);
            setError(err.message || "Failed to set model");
            setSaveStatus("error");
        }
    }, [canChangeModel, currentModel]);

    if (!canViewModels) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        You don&apos;t have permission to view settings.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">User Settings</h1>

            {/* Debug Information */}
            <div className="bg-blue-50 p-4 mb-6 rounded border border-blue-200">
                <h2 className="text-lg font-bold mb-2">Debug Info</h2>
                <p><strong>Loading:</strong> {loading ? 'True' : 'False'}</p>
                <p><strong>Has model:view permission:</strong> {canViewModels ? 'Yes' : 'No'}</p>
                <p><strong>Has model:change permission:</strong> {canChangeModel ? 'Yes' : 'No'}</p>
                <p><strong>Models count:</strong> {models.length}</p>
                <p><strong>Available models:</strong> {models.join(", ") || "None"}</p>
                <p><strong>Current model:</strong> {currentModel || 'None'}</p>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {saveStatus === "success" && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                    Settings saved successfully
                </div>
            )}

            <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Model Selection</h2>

                {loading ? (
                    <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <div>
                        <p className="mb-3">Current model: <span className="font-semibold">{currentModel || "None selected"}</span></p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            {models.map((model) => (
                                <button
                                    key={model}
                                    onClick={() => handleModelChange(model)}
                                    disabled={!canChangeModel || model === currentModel || saveStatus === "saving"}
                                    className={`p-4 border rounded-lg text-left transition-colors ${model === currentModel
                                            ? "bg-primary text-white border-primary"
                                            : "bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
                                        } ${!canChangeModel ? "opacity-60 cursor-not-allowed" : ""}`}
                                >
                                    <div className="font-medium">{model}</div>
                                </button>
                            ))}

                            {models.length === 0 && (
                                <p className="text-gray-500 col-span-2">No models available</p>
                            )}
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
} 