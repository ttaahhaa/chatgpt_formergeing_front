import { useState } from "react";
import { Upload, FileText, FileSearch, RefreshCcw, Trash2 } from "lucide-react";

export default function DocumentManagement() {
  const [documents, setDocuments] = useState([{ name: "response.txt", size: "11.6 KB", type: "text" }]);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-10">
      {/* Header */}
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <span className="text-yellow-600">📁</span> Document Management
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">Upload, view, and manage your documents for the QA system.</p>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 p-6 rounded-xl bg-white dark:bg-dark-3 shadow">
        <div className="flex flex-col items-center">
          <FileText className="mb-2 text-gray-500 dark:text-gray-300" size={32} />
          <p className="text-lg font-semibold text-indigo-600">1</p>
          <p className="text-sm text-gray-500">Documents</p>
        </div>
        <div className="flex flex-col items-center">
          <FileSearch className="mb-2 text-gray-500 dark:text-gray-300" size={32} />
          <p className="text-lg font-semibold text-indigo-600">7744</p>
          <p className="text-sm text-gray-500">Total Characters</p>
        </div>
        <div className="flex flex-col items-center">
          <FileText className="mb-2 text-gray-500 dark:text-gray-300" size={32} />
          <p className="text-lg font-semibold text-indigo-600">997</p>
          <p className="text-sm text-gray-500">Total Words</p>
        </div>
      </div>

      {/* Upload Section */}
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Upload className="text-blue-600" size={20} /> Upload Documents
      </h2>
      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 mb-10 bg-gray-50 dark:bg-dark-2 flex flex-col items-center text-center">
        <p className="text-gray-500">Drag and drop files here</p>
        <p className="text-sm text-gray-400">Limit 200MB per file</p>
        <button className="mt-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-dark-3 dark:hover:bg-dark-4 rounded text-sm font-medium">
          Browse files
        </button>
      </div>

      {/* Loaded Documents */}
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <FileText className="text-orange-500" size={20} /> Loaded Documents
      </h2>
      <div className="bg-white dark:bg-dark-3 p-4 rounded-md shadow mb-6">
        {documents.map((doc, index) => (
          <div key={index} className="flex items-center justify-between border-b last:border-none py-2">
            <div>
              <p className="font-medium text-gray-800 dark:text-white">{doc.name}</p>
              <p className="text-xs text-gray-500">{doc.type} - {doc.size}</p>
            </div>
            <button className="text-sm text-blue-600 hover:underline">Preview & Actions</button>
          </div>
        ))}
      </div>

      {/* Batch Actions */}
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <span className="text-red-500">🗂️</span> Batch Actions
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button className="flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-600 text-white rounded-md py-3">
          <Trash2 size={16} /> Clear All Documents
        </button>
        <button className="flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-600 text-white rounded-md py-3">
          <RefreshCcw size={16} /> Refresh Document List
        </button>
      </div>
    </div>
  );
}
