// src/app/client-wrapper.tsx
"use client";

import { useState } from "react";
import { Sidebar } from "@/components/Layouts/sidebar";
import { Header } from "@/components/Layouts/header";

export function ClientRootLayout({ children }: { children: React.ReactNode }) {
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

    return (
        <div className="flex min-h-screen">
            <Sidebar
                selectedId={selectedConversationId}
                onSelectConversation={(id: string) => setSelectedConversationId(id)}
            />

            <div className="w-full bg-gray-2 dark:bg-[#020d1a]">
                <Header />
                <main className="w-full h-full">{children}</main>
            </div>
        </div>
    );
}
