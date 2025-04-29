import { useState } from "react";
import { FileText, Loader2, RefreshCcw } from "lucide-react";

export default function LogsPanel() {
  const [logFiles] = useState([
    { name: "streamlit_20250429.log", size: "5.0 KB", modified: "2025-04-29 16:02" },
  ]);
  const [selectedFile, setSelectedFile] = useState(logFiles[0]);
  const [logContent] = useState(`2025-04-29 15:19:56,525 - root - INFO - Logging to file: ...\n...`);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-10">
      {/* Header */}
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <FileText size={28} /> System Logs
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">Monitor system logs and debug application issues.</p>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 text-center">
        <div>
          <p className="text-2xl font-bold text-purple-600">6</p>
          <p className="text-sm text-gray-500">Log Files</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-purple-600">0 seconds ago</p>
          <p className="text-sm text-gray-500">Last Update</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-purple-600">80.3 KB</p>
          <p className="text-sm text-gray-500">Total Size</p>
        </div>
      </div>

      {/* Log File Select */}
      <div className="mb-4">
        <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Select log file to view:</label>
        <select
          value={selectedFile.name}
          onChange={(e) => setSelectedFile(logFiles.find(f => f.name === e.target.value) || logFiles[0])}
          className="w-full border rounded-md px-4 py-2 bg-gray-100 dark:bg-dark-2 dark:border-gray-700"
        >
          {logFiles.map((file) => (
            <option key={file.name} value={file.name}>{file.name} ({file.size}, {file.modified})</option>
          ))}
        </select>
      </div>

      {/* Log Viewer */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Log Viewer</label>
        <textarea
          readOnly
          value={logContent}
          className="w-full h-64 p-4 rounded-md bg-gray-100 dark:bg-dark-2 dark:text-white border border-gray-300 dark:border-gray-700 text-sm font-mono"
        />
        <p className="mt-2 text-green-600 text-sm">Found 51 matching lines</p>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mb-6">
        <button className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white rounded-md px-4 py-2 text-sm font-medium">
          <RefreshCcw size={16} /> Refresh
        </button>
        <button className="text-sm text-blue-600 hover:underline">Download Log</button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center bg-white dark:bg-dark-3 p-4 rounded-md shadow">
        <div>
          <p className="text-2xl font-bold text-red-500">0</p>
          <p className="text-sm text-gray-500">Errors</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-yellow-500">0</p>
          <p className="text-sm text-gray-500">Warnings</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-blue-500">51</p>
          <p className="text-sm text-gray-500">Info</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-400">0</p>
          <p className="text-sm text-gray-500">Debug</p>
        </div>
      </div>
    </div>
  );
}
