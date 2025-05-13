// src/app/client-wrapper.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { Sidebar } from "@/components/Layouts/sidebar";
import { Header } from "@/components/Layouts/header";
import { usePathname } from "next/navigation";

export function ClientRootLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

    // Check if we're on an auth page
    const isAuthPage = pathname?.startsWith('/auth');

    // Handle conversation selection with a useCallback to avoid recreating this function on each render
    const handleSelectConversation = useCallback((id: string) => {
        if (id === selectedConversationId) return; // Skip if same ID
        setSelectedConversationId(id);
        localStorage.setItem('selectedConversationId', id);
        window.dispatchEvent(new CustomEvent('conversation-changed', {
            detail: { id }
        }));
    }, [selectedConversationId]);

    // Load selected conversation from local storage on mount
    useEffect(() => {
        const savedId = localStorage.getItem('selectedConversationId');
        if (savedId) {
            setSelectedConversationId(savedId);
        }
    }, []);

    // Listen for storage events (for multi-tab support)
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'selectedConversationId' && e.newValue) {
                setSelectedConversationId(e.newValue);
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    // If we're on an auth page, just render the children without the layout
    if (isAuthPage) {
        return <>{children}</>;
    }

    return (
        <div className="flex min-h-screen">
            <Sidebar
                selectedId={selectedConversationId}
                onSelectConversation={handleSelectConversation}
            />

            <div className="flex-1 flex flex-col bg-gray-2 dark:bg-[#020d1a]">
                <Header />
                <main id="main-content" className="flex-1 overflow-hidden">
                    {children}
                </main>
            </div>
        </div>
    );
}