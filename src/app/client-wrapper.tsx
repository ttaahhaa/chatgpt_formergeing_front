// src/app/client-wrapper.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { Sidebar } from "@/components/Layouts/sidebar";
import { Header } from "@/components/Layouts/header";

export function ClientRootLayout({ children }: { children: React.ReactNode }) {
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

    // Handle conversation selection with a useCallback to avoid recreating this function on each render
    const handleSelectConversation = useCallback((id: string) => {
        console.log("Conversation selected:", id);

        if (id === selectedConversationId) return; // Skip if same ID

        // Update the selected ID
        setSelectedConversationId(id);

        // Store in local storage for persistence
        localStorage.setItem('selectedConversationId', id);

        // Dispatch a custom event so other components can react to this change
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