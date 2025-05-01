// src/app/client-wrapper.tsx
"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Layouts/sidebar";
import { Header } from "@/components/Layouts/header";

export function ClientRootLayout({ children }: { children: React.ReactNode }) {
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

    // Handle conversation selection
    const handleSelectConversation = (id: string) => {
        setSelectedConversationId(id);

        // Store in local storage for persistence
        localStorage.setItem('selectedConversationId', id);
    };

    // Load selected conversation from local storage on mount
    useEffect(() => {
        const savedId = localStorage.getItem('selectedConversationId');
        if (savedId) {
            setSelectedConversationId(savedId);
        }
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
                    {/* 
                        Instead of trying to clone elements with props,
                        we'll use a custom event to communicate with children
                    */}
                    {children}
                </main>
            </div>
        </div>
    );
}