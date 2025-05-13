"use client";

import { useState, useEffect } from "react";
import StreamingChatTab from "@/components/Chat/StreamingChatTab";
import DocumentManagement from "@/components/DocumentManagement/DocumentManagement";
import SettingsPanel from "@/components/Settings/SettingsPanel";
import { LogViewer } from "@/components/Logs/LogViewer";
import StatusPanel from "@/components/Status/StatusPanel";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import { api } from "@/services/api";
import "@/css/page.css";

const tabs = [
  { id: "chats", label: "Chat" },
  { id: "documents", label: "Documents" },
  { id: "settings", label: "Settings" },
  { id: "logs", label: "Logs" },
  { id: "status", label: "Status" },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState("chats");
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
  }, []);

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

  const HomeContent = () => (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Main content */}
      <div className="flex flex-col flex-1">
        {/* Tab navigation */}
        <div className="flex justify-center py-4 gap-4 bg-white dark:bg-gray-800 shadow-sm">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`text-sm font-medium px-4 py-2 rounded-md transition ${activeTab === tab.id
                ? "bg-primary bg-opacity-10 text-primary"
                : "text-gray-700 hover:text-primary dark:text-white dark:hover:text-primary"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto">
          <div className={activeTab === "chats" ? "block h-full" : "hidden"}>
            {initializing ? (
              <div className="flex items-center justify-center h-full">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-primary rounded-full animate-bounce"></div>
                  <div className="w-4 h-4 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  <div className="w-4 h-4 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                </div>
              </div>
            ) : (
              <StreamingChatTab conversationId={selectedConversationId} />
            )}
          </div>
          <div className={activeTab === "documents" ? "block" : "hidden"}>
            <DocumentManagement />
          </div>
          <div className={activeTab === "settings" ? "block" : "hidden"}>
            <SettingsPanel />
          </div>
          <div className={activeTab === "logs" ? "block" : "hidden"}>
            <LogViewer />
          </div>
          <div className={activeTab === "status" ? "block" : "hidden"}>
            <StatusPanel />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <ProtectedRoute>
      <HomeContent />
    </ProtectedRoute>
  );
}