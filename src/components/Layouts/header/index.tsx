"use client";

import Image from "next/image";
import { ThemeToggleSwitch } from "./theme-toggle";
import { UserInfo } from "./user-info";
import AuthService from '@/services/auth';
import { useTab } from "@/contexts/TabContext";

// Define tab permissions
const tabs = [
  { 
    id: "chats", 
    label: "Chat",
    permission: "chat:stream"
  },
  { 
    id: "documents", 
    label: "Documents",
    permission: "documents:upload"
  },
  { 
    id: "settings", 
    label: "Settings",
    permission: "admin"
  },
  { 
    id: "logs", 
    label: "Logs",
    permission: "admin"
  },
  { 
    id: "status", 
    label: "Status",
    permission: "admin"
  },
];

export function Header() {
  const { activeTab, setActiveTab } = useTab();
  const auth = AuthService.getInstance();

  // Filter tabs based on user permissions
  const visibleTabs = tabs.filter(tab => {
    if (tab.permission === "admin") {
      return auth.getUserInfo()?.role === "admin";
    }
    return auth.hasPermission(tab.permission);
  });

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-stroke bg-white px-4 py-5 shadow-1 dark:border-stroke-dark dark:bg-gray-dark md:px-5 2xl:px-10">
      {/* Title and subtitle */}
      <div>
        <h1 className="mb-0.5 text-heading-5 font-bold text-dark dark:text-white">
          Saudi Interpol
        </h1>
        <p className="font-medium">Chat Assistant of the Saudi Interpol</p>
      </div>

      {/* Tabs */}
      <div className="flex-1 flex justify-center gap-4">
        {visibleTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`text-sm font-medium px-4 py-2 rounded-md transition ${
              activeTab === tab.id
                ? "bg-primary bg-opacity-10 text-primary"
                : "text-gray-700 hover:text-primary dark:text-white dark:hover:text-primary"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Right-side icons */}
      <div className="flex items-center gap-2 min-[375px]:gap-4">
        <div className="ml-4">
          <ThemeToggleSwitch />
        </div>
        <div className="shrink-0">
          <UserInfo />
        </div>
      </div>
    </header>
  );
}
