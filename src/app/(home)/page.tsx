// ✅ AGGRESSIVELY CLEAN + INTEGRATED VERSION
// src/app/(home)/page.tsx
"use client";

import { useState, useEffect } from "react";
import ChatTab from "@/components/Chat/ChatTab";
import DocumentManagement from "@/components/DocumentManagement/DocumentManagement";
import SettingsPanel from "@/components/Settings/SettingsPanel";
import { LogViewer } from "@/components/Logs/LogViewer";
import StatusPanel from "@/components/Status/StatusPanel";
import ConversationList from "@/components/Layouts/sidebar/ConversationList";
import "@/css/page.css";

const tabs = [
  { id: "chats", label: "Chats" },
  { id: "documents", label: "Documents" },
  { id: "settings", label: "Settings" },
  { id: "logs", label: "Logs" },
  { id: "status", label: "Status" },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState("chats");
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  useEffect(() => {
    const savedTab = localStorage.getItem("active_tab");
    if (savedTab) setActiveTab(savedTab);
  }, []);

  useEffect(() => {
    localStorage.setItem("active_tab", activeTab);
  }, [activeTab]);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">

      {/* Main content */}
      <div className="flex flex-col flex-1">
        <div className="flex justify-center py-4 gap-4 bg-transparent">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`text-sm font-medium px-4 py-2 rounded transition ${activeTab === tab.id
                ? "text-primary underline underline-offset-4"
                : "text-gray-700 hover:text-primary dark:text-white dark:hover:text-primary"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className={activeTab === "chats" ? "block" : "hidden"}>
            <ChatTab conversationId={selectedConversationId} />
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
}