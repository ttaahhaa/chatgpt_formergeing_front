"use client";

import { useState, useEffect, useCallback, memo } from "react";
import { useSearchParams } from "next/navigation";
import StreamingChatTab from "@/components/Chat/StreamingChatTab";
import DocumentManagement from "@/components/DocumentManagement/DocumentManagement";
import SettingsPanel from "@/components/Settings/SettingsPanel";
import { LogViewer } from "@/components/Logs/LogViewer";
import StatusPanel from "@/components/Status/StatusPanel";
import ProtectedRoute from '@/components/ProtectedRoute';
import { notFound, useRouter } from 'next/navigation';
import AuthService from '@/services/auth';
import { ChatProvider } from "@/contexts/ChatContext";

// Define valid tab IDs
const validTabIds = ['chats', 'documents', 'settings', 'logs', 'status'] as const;
type TabId = typeof validTabIds[number];

const TabPage = memo(function TabPage({ params }: { params: { tab: string } }) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const tab = params.tab as TabId;
    const [isLoading, setIsLoading] = useState(true);
    const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
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

    // Get conversation ID from URL if present
    useEffect(() => {
        const conversationIdFromUrl = searchParams.get('conversationId');
        if (conversationIdFromUrl) {
            setCurrentConversationId(conversationIdFromUrl);
            // Store as last active
            localStorage.setItem('lastActiveConversationId', conversationIdFromUrl);
        } else if (tab === 'chats') {
            // If on chats tab but no ID in URL, check localStorage
            const lastActiveId = localStorage.getItem('lastActiveConversationId');
            if (lastActiveId) {
                setCurrentConversationId(lastActiveId);
                // Update URL to include the conversation ID
                router.replace(`/chats?conversationId=${lastActiveId}`);
            }
        }
    }, [searchParams, tab, router]);

    useEffect(() => {
        const authService = AuthService.getInstance();
        const userInfo = authService.getUserInfo();

        const newPermissions = {
            canAccessChat: authService.hasPermission('chat:stream'),
            canAccessDocuments: authService.hasPermission('documents:upload'),
            canAccessSettings: authService.hasPermission('admin'),
            canAccessLogs: authService.hasPermission('admin'),
            canAccessStatus: authService.hasPermission('admin')
        };

        setPermissions(newPermissions);
        setIsLoading(false);
    }, []);

    const handleConversationChange = useCallback((newConversationId: string) => {
        setCurrentConversationId(newConversationId);
        // Update URL with the new conversation ID
        router.replace(`/chats?conversationId=${newConversationId}`);
    }, [router]);

    if (isLoading) {
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
                        <ChatProvider>
                            <div className="flex-1">
                                <StreamingChatTab
                                    key={`chat-${currentConversationId || 'new'}`}
                                    conversationId={currentConversationId}
                                    onConversationChange={handleConversationChange}
                                />
                            </div>
                        </ChatProvider>
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
                                <p className="text-gray-600 dark:text-gray-400">
                                    You don't have permission to access the chat feature.
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
});

export default TabPage;