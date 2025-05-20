// src/app/(home)/[tab]/page.tsx
"use client";

import { useState, useEffect } from "react";
import ChatTab from "@/components/Chat/ChatTab";
import DocumentManagement from "@/components/DocumentManagement/DocumentManagement";
import SettingsPanel from "@/components/Settings/SettingsPanel";
import { LogViewer } from "@/components/Logs/LogViewer";
import StatusPanel from "@/components/Status/StatusPanel";
import ProtectedRoute from '@/components/ProtectedRoute';
import { notFound } from 'next/navigation';
import AuthService from '@/services/auth';

// Define valid tab IDs
const validTabIds = ['chats', 'documents', 'settings', 'logs', 'status'] as const;
type TabId = typeof validTabIds[number];

export default function TabPage({ params }: { params: { tab: string } }) {
    const tab = params.tab as TabId;
    const [isLoading, setIsLoading] = useState(true);
    const [isMounted, setIsMounted] = useState(false);
    const [permissions, setPermissions] = useState({
        canAccessChat: false,
        canAccessDocuments: false,
        canAccessSettings: false,
        canAccessLogs: false,
        canAccessStatus: false
    });

    // Validate tab parameter
    if (!validTabIds.includes(tab)) {
        notFound();
    }

    // Set mounted state on client
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Load permissions after component mounts
    useEffect(() => {
        if (!isMounted) return;

        const authService = AuthService.getInstance();
        
        try {
            const userInfo = authService.getUserInfo();

            const newPermissions = {
                canAccessChat: authService.hasPermission('chat:stream'),
                canAccessDocuments: authService.hasPermission('documents:upload'),
                canAccessSettings: authService.hasPermission('admin'),
                canAccessLogs: authService.hasPermission('admin'),
                canAccessStatus: authService.hasPermission('admin')
            };

            setPermissions(newPermissions);
        } catch (err) {
            console.error("Error getting permissions:", err);
        } finally {
            setIsLoading(false);
        }
    }, [isMounted]);

    // During SSR or when loading, show a loading skeleton
    if (isLoading || !isMounted) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-primary rounded-full animate-bounce"></div>
                    <div className="w-4 h-4 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                    <div className="w-4 h-4 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                </div>
            </div>
        );
    }

    return (
        <ProtectedRoute>
            <div className="flex-1 overflow-hidden flex">
                {tab === "chats" && (
                    permissions.canAccessChat ? (
                        <ChatTab />
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
                                <p className="text-gray-600 dark:text-gray-400">
                                    You don&apos;t have permission to access the chat feature.
                                </p>
                            </div>
                        </div>
                    )
                )}
                {tab === "documents" && (
                    permissions.canAccessDocuments ? (
                        <DocumentManagement />
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <h2 className="text-2xl font-semibold mb-3">Access Denied</h2>
                                <p className="text-gray-600 dark:text-gray-400">
                                    You don&apos;t have permission to access the documents feature.
                                </p>
                            </div>
                        </div>
                    )
                )}
                {tab === "settings" && permissions.canAccessSettings && <SettingsPanel />}
                {tab === "logs" && permissions.canAccessLogs && <LogViewer />}
                {tab === "status" && permissions.canAccessStatus && <StatusPanel />}
            </div>
        </ProtectedRoute>
    );
}
