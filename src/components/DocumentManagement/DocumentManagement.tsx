// src/components/DocumentManagement/DocumentManagement.tsx
"use client"

import { useState } from 'react';
import { DocumentList } from './DocumentList';
import { DocumentUpload } from './DocumentUpload';

export default function DocumentManagement() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // This function will be called when document upload is complete
  const handleUploadComplete = () => {
    // Increment the refresh trigger to cause DocumentList to refetch
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex-1 overflow-y-auto w-full max-w-4xl mx-auto px-6 py-8 pb-32" style={{ height: "100%" }}>
        <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
          Document Management
        </h1>

        {/* Upload Section */}
        <DocumentUpload onUploadComplete={handleUploadComplete} />

        {/* List Section */}
        <DocumentList key={refreshTrigger} />
      </div>
    </div>
  );
}