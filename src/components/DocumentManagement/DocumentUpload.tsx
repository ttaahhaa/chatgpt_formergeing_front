// src/components/DocumentManagement/DocumentUpload.tsx
"use client"

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { api } from '@/services/api';

export function DocumentUpload({ onUploadComplete }: { onUploadComplete: () => void }) {
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (!acceptedFiles.length) return;

        setUploading(true);
        setError(null);
        setUploadProgress(0);

        try {
            // Process each file sequentially
            for (let i = 0; i < acceptedFiles.length; i++) {
                const file = acceptedFiles[i];

                // Update progress
                setUploadProgress(Math.round((i / acceptedFiles.length) * 100));

                // Upload document
                await api.uploadDocument(file);
            }

            // Final progress update
            setUploadProgress(100);

            // Notify parent component
            onUploadComplete();

            // Reset after short delay
            setTimeout(() => {
                setUploading(false);
                setUploadProgress(0);
            }, 1000);
        } catch (err: any) {
            console.error('Upload error:', err);
            setError(err.message || 'Failed to upload document');
            setUploading(false);
        }
    }, [onUploadComplete]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

    return (
        <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    className="text-blue-600">
                    <path d="M3 15v4c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2v-4M17 8l-5-5-5 5M12 3v12" />
                </svg>
                Upload Documents
            </h2>

            <div
                {...getRootProps()}
                className={`border-2 border-dashed ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 dark:border-gray-600'
                    } rounded-xl p-6 text-center hover:bg-gray-50 dark:hover:bg-dark-2 transition cursor-pointer`}
            >
                <input {...getInputProps()} />

                {uploading ? (
                    <div className="space-y-4">
                        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                            <div className="bg-primary h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                        </div>
                        <p className="text-gray-500">Uploading documents... {uploadProgress}%</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"
                            className="mx-auto text-gray-400">
                            <path d="M3 15v4c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2v-4M17 8l-5-5-5 5M12 3v12" />
                        </svg>
                        <p className="text-gray-500">Drag and drop files here, or click to select files</p>
                        <p className="text-sm text-gray-400">Limit 200MB per file</p>
                    </div>
                )}

                {error && <p className="mt-2 text-red-500 text-sm">{error}</p>}
            </div>
        </div>
    );
}