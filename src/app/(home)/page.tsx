"use client";

import { useState, useEffect } from "react";
import StreamingChatTab from "@/components/Chat/StreamingChatTab";
import DocumentManagement from "@/components/DocumentManagement/DocumentManagement";
import SettingsPanel from "@/components/Settings/SettingsPanel";
import { LogViewer } from "@/components/Logs/LogViewer";
import StatusPanel from "@/components/Status/StatusPanel";
import { api } from "@/services/api";
import { useTab } from "@/contexts/TabContext";
import "@/css/page.css";
import ProtectedRoute from '@/components/ProtectedRoute';

export default function Home() {
  const { activeTab, setActiveTab } = useTab();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);

  // Auto-start a new conversation if none exists
  useEffect(() => {
    const initializeConversation = async () => {
      try {
        setInitializing(true);

        // Check for a saved conversation ID in localStorage
        const savedId = localStorage.getItem("selectedConversationId");

        if (savedId) {
          // If we have a saved ID, use it
          setSelectedConversationId(savedId);
        } else {
          // Otherwise, create a new conversation
          const result = await api.createNewConversation();
          if (result?.conversation_id) {
            // Save the new conversation ID
            setSelectedConversationId(result.conversation_id);
            localStorage.setItem("selectedConversationId", result.conversation_id);
          }
        }
      } catch (error) {
        console.error("Failed to initialize conversation:", error);
      } finally {
        setInitializing(false);
      }
    };

    initializeConversation();
  }, []);

  // Restore active tab from localStorage
  useEffect(() => {
    const savedTab = localStorage.getItem("active_tab");
    if (savedTab) setActiveTab(savedTab);
  }, [setActiveTab]);

  // Save active tab to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("active_tab", activeTab);
  }, [activeTab]);

  // Listen for selected conversation changes
  useEffect(() => {
    // Handler for localStorage changes (from other tabs)
    const handleStorageChange = () => {
      const savedConversationId = localStorage.getItem("selectedConversationId");
      if (savedConversationId && savedConversationId !== selectedConversationId) {
        setSelectedConversationId(savedConversationId);
      }
    };

    // Handler for custom events (from within the same tab)
    const handleConversationChange = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail && customEvent.detail.id) {
        setSelectedConversationId(customEvent.detail.id);
      }
    };

    // Set up event listeners
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("conversation-changed", handleConversationChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("conversation-changed", handleConversationChange);
    };
  }, [selectedConversationId]);

  return (
    <ProtectedRoute>
      <div className="flex-1 overflow-hidden">
        {activeTab === "chats" && (
          <div className={initializing ? "flex items-center justify-center h-full" : "h-full"}>
            {initializing ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-primary rounded-full animate-bounce"></div>
                <div className="w-4 h-4 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                <div className="w-4 h-4 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
              </div>
            ) : (
              <StreamingChatTab conversationId={selectedConversationId} />
            )}
          </div>
        )}
        {activeTab === "documents" && <DocumentManagement />}
        {activeTab === "settings" && <SettingsPanel />}
        {activeTab === "logs" && <LogViewer />}
        {activeTab === "status" && <StatusPanel />}
      </div>
    </ProtectedRoute>
  );
}