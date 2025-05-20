// src/app/client-wrapper.tsx
"use client";

import { usePathname } from 'next/navigation';
import { Sidebar } from "@/components/Layouts/sidebar";
import { Header } from "@/components/Layouts/header";
import { ConversationProvider } from "@/contexts/ConversationContext";

export function ClientRootLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAuthPage = pathname?.startsWith('/auth');

    // If it's an auth page, render only the children without layout
    if (isAuthPage) {
        return <>{children}</>;
    }

    // For non-auth pages, render the full layout
    return (
        <div className="flex min-h-screen">
            <ConversationProvider>
                <Sidebar />
                <div className="flex-1 flex flex-col bg-gray-2 dark:bg-[#020d1a]">
                    <Header />
                    <main id="main-content" className="flex-1 overflow-hidden">
                        {children}
                    </main>
                </div>
            </ConversationProvider>
        </div>
    );
}
