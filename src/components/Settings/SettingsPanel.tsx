import { useState } from "react";
import { CheckCircle, Settings2, Brain, Trash2, FileText, Database } from "lucide-react";

export default function SettingsPanel() {
    const [model, setModel] = useState("mistral:latest");
    const [dimension, setDimension] = useState(384);

    return (
        <div className="w-full max-w-6xl mx-auto px-4 py-10">
            {/* Header */}
            <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
                <Settings2 size={28} /> Settings
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
                Configure the Document QA Assistant and manage system settings.
            </p>

            {/* LLM Config */}
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                🤖 LLM Configuration
            </h2>
            <div className="bg-green-100 text-green-800 text-sm rounded-md px-4 py-2 mb-4">
                ✅ Ollama is running and available
            </div>

            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Select Ollama model to use
            </label>
            <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full border rounded-md px-4 py-2 mb-4 bg-gray-100 dark:bg-dark-2 dark:border-gray-700"
            >
                <option value="mistral:latest">mistral:latest</option>
                <option value="llama2:7b">llama2:7b</option>
            </select>

            <button className="w-full bg-purple-500 hover:bg-purple-600 text-white rounded-md py-3 mb-10 font-medium">
                Apply Model Change
            </button>

            {/* Data Management */}
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FileText className="text-black dark:text-white" size={20} /> Data Management
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                <button className="bg-purple-500 hover:bg-purple-600 text-white rounded-md py-3 font-medium">
                    Clear Conversations
                </button>
                <button className="bg-purple-500 hover:bg-purple-600 text-white rounded-md py-3 font-medium">
                    Clear Documents
                </button>
                <button className="bg-purple-500 hover:bg-purple-600 text-white rounded-md py-3 font-medium">
                    Clear Cache
                </button>
            </div>

            {/* Embeddings Section */}
            <details className="rounded-md bg-white dark:bg-dark-3 shadow p-4">
                <summary className="text-lg font-semibold mb-4 cursor-pointer">Embeddings Settings</summary>

                <div className="bg-green-100 text-green-800 text-sm rounded-md px-4 py-2 mb-4">
                    ✅ Embedding model is available
                </div>

                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Embedding Dimensions
                </label>
                <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs text-gray-400">128</span>
                    <input
                        type="range"
                        min="128"
                        max="768"
                        step="8"
                        value={dimension}
                        onChange={(e) => setDimension(Number(e.target.value))}
                        className="w-full accent-purple-500"
                    />
                    <span className="text-xs text-red-500 font-bold">{dimension}</span>
                    <span className="text-xs text-gray-400">768</span>
                </div>

                <button className="w-full bg-purple-500 hover:bg-purple-600 text-white rounded-md py-3 font-medium">
                    Update Embedding Settings
                </button>
            </details>
        </div>
    );
}
