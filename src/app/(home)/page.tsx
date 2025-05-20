"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/services/api";

export default function Home() {
  const router = useRouter();
  const { role, permissions, isAuthenticated } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !role || permissions.length === 0) {
      return;
    }

    if (isRedirecting || isCreatingConversation) {
      return;
    }

    const redirectUser = async () => {
      setIsRedirecting(true);

      // Try to restore previous session
      const lastActiveConversationId = localStorage.getItem('lastActiveConversationId');
      
      // Check if we have a previous conversation to restore
      if (permissions.includes("chat:stream") && lastActiveConversationId) {
        try {
          // Verify the conversation exists
          await api.getConversation(lastActiveConversationId);
          router.push(`/chats?conversationId=${lastActiveConversationId}`);
          return;
        } catch (err) {
          console.error("Failed to restore previous conversation:", err);
          // If error, create a new conversation below
          localStorage.removeItem('lastActiveConversationId');
        }
      }

      // No valid conversation to restore, decide based on permissions
      if (permissions.includes("chat:stream")) {
        // Create a new conversation if needed
        try {
          setIsCreatingConversation(true);
          const result = await api.createNewConversation();
          if (result?.conversation_id) {
            localStorage.setItem('lastActiveConversationId', result.conversation_id);
            router.push(`/chats?conversationId=${result.conversation_id}`);
          } else {
            router.push("/chats");
          }
        } catch (err) {
          console.error("Failed to create initial conversation:", err);
          router.push("/chats");
        } finally {
          setIsCreatingConversation(false);
        }
      } else if (permissions.includes("documents:upload")) {
        router.push("/documents");
      } else if (role === "admin") {
        router.push("/settings");
      }
    };

    redirectUser();
  }, [permissions, role, router, isAuthenticated, isRedirecting, isCreatingConversation]);

  if (!isAuthenticated || !role || permissions.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Setting up your workspace...</p>
      </div>
    </div>
  );
}