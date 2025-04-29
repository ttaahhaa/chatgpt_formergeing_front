import { useState } from "react";
import { CheckCircle, Info, RefreshCcw } from "lucide-react";

export default function StatusPanel() {
    const [lastUpdated] = useState("16:02:15");
    const [model] = useState("mistral:latest");

    return (
        <div className="w-full max-w-6xl mx-auto px-4 py-10">
            <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
                <Info size={28} /> System Status
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Essential information about your Document QA system</p>

            <p className="text-sm text-gray-500 mb-4">Last updated: {lastUpdated}</p>

            {/* Status Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-green-100 text-green-800 px-4 py-3 rounded-md text-sm">✅ LLM Service: Online</div>
                <div className="bg-green-100 text-green-800 px-4 py-3 rounded-md text-sm">✅ Embeddings: Online</div>
                <div className="bg-blue-100 text-blue-800 px-4 py-3 rounded-md text-sm">📄 Documents: 1 loaded</div>
                <div className="bg-blue-100 text-blue-800 px-4 py-3 rounded-md text-sm">💾 Memory Usage: Normal</div>
            </div>

            <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">Current model: <strong>{model}</strong></p>

            {/* System Info */}
            <details className="bg-white dark:bg-dark-3 shadow rounded-md mb-6 p-4">
                <summary className="font-semibold text-gray-700 dark:text-white cursor-pointer">System Information</summary>
                <div className="grid grid-cols-1 sm:grid-cols-2 mt-4 gap-6">
                    <div>
                        <p className="text-sm text-gray-500">Operating System</p>
                        <p className="text-md font-medium">Windows 10</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Architecture</p>
                        <p className="text-md font-medium">AMD64</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Python Version</p>
                        <p className="text-md font-medium">3.11.1</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">App Version</p>
                        <p className="text-md font-medium">1.0.0</p>
                    </div>
                </div>
            </details>

            {/* Document Stats */}
            <details className="bg-white dark:bg-dark-3 shadow rounded-md mb-6 p-4">
                <summary className="font-semibold text-gray-700 dark:text-white cursor-pointer">Document Statistics</summary>
                <p className="text-sm text-gray-600 mt-2 mb-1">Total Size: 11.6 KB</p>
                <p className="text-sm text-gray-600 mb-4">Document Types:</p>
                <div className="bg-blue-600 h-36 w-full rounded" /> {/* Placeholder for chart */}
            </details>

            {/* Quick Health Check */}
            <h2 className="text-lg font-semibold mb-3">Quick Health Check</h2>
            <button className="w-full bg-purple-500 hover:bg-purple-600 text-white rounded-md py-3 font-medium mb-6">
                Run Health Check
            </button>

            {/* System Actions */}
            <h2 className="text-lg font-semibold mb-3">System Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md py-3">
                    <RefreshCcw size={16} /> Refresh Status
                </button>
                <button className="flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-600 text-white rounded-md py-3">
                    🧹 Clear Cache
                </button>
            </div>
        </div>
    );
}
