// src/app/providers.tsx
"use client";

import { SidebarProvider } from "@/components/Layouts/sidebar/sidebar-context";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { ChatProvider } from "@/contexts/ChatContext";
import { ConversationProvider } from "@/contexts/ConversationContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="light" attribute="class">
      <AuthProvider>
        <ChatProvider>
          <ConversationProvider>
            <SidebarProvider>
              {children}
            </SidebarProvider>
          </ConversationProvider>
        </ChatProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
