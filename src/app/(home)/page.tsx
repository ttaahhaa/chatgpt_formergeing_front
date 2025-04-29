"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { SearchIcon } from "@/assets/icons";
import { createTimeFrameExtractor } from "@/utils/timeframe-extractor";
import DocumentManagement from "@/components/DocumentManagement/DocumentManagement";
import SettingsPanel from "@/components/Settings/SettingsPanel";
import LogsPanel from "@/components/Logs/LogsPanel";
import StatusPanel from "@/components/Status/StatusPanel";
type PropsType = {
  searchParams: Promise<{
    selected_time_frame?: string;
  }>;
};

const tabs = [
  { id: "chats", label: "Chats" },
  { id: "documents", label: "Documents" },
  { id: "settings", label: "Settings" },
  { id: "logs", label: "Logs" },
  { id: "status", label: "Status" },
];

export default function Home({ searchParams }: PropsType) {
  const [selectedTimeFrame, setSelectedTimeFrame] = useState<string | undefined>(undefined);
  const [activeTab, setActiveTab] = useState("chats");

  useEffect(() => {
    async function fetchSearchParams() {
      const { selected_time_frame } = await searchParams;
      setSelectedTimeFrame(selected_time_frame);
    }
    fetchSearchParams();
  }, [searchParams]);

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-gray-50 dark:bg-gray-900 px-4 py-10">
      {/* Tabs */}
      <div className="mb-8 flex w-full max-w-4xl items-center justify-center gap-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-full px-6 py-3 text-sm font-medium transition
              ${activeTab === tab.id
                ? "bg-primary text-white shadow"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-dark-3 dark:text-gray-300 dark:hover:bg-dark-4"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="w-full max-w-4xl">
        {activeTab === "chats" && (
          <>
            {/* Centered Title */}
            <h1 className="mb-6 text-center text-2xl font-semibold text-gray-800 dark:text-white">
              Ready when you are.
            </h1>

            {/* Radio Buttons */}
            <div className="mb-5 flex items-center justify-center gap-6">
              <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-800 dark:text-gray-200">
                <input
                  type="radio"
                  name="knowledgeSource"
                  value="auto"
                  defaultChecked
                  className="text-red-500 focus:ring-red-500 dark:focus:ring-red-400"
                />
                Auto (Recommended)
              </label>
              <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-800 dark:text-gray-200">
                <input
                  type="radio"
                  name="knowledgeSource"
                  value="documents"
                  className="text-red-500 focus:ring-red-500 dark:focus:ring-red-400"
                />
                Documents Only
              </label>
              <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-800 dark:text-gray-200">
                <input
                  type="radio"
                  name="knowledgeSource"
                  value="general"
                  className="text-red-500 focus:ring-red-500 dark:focus:ring-red-400"
                />
                General Knowledge Only
              </label>
            </div>

            {/* Search Box */}
            <div className="relative w-full max-w-[800px] mx-auto">
              <input
                type="search"
                placeholder="Ask anything"
                className="flex w-full items-center gap-3.5 rounded-full border border-gray-300 bg-white py-5 pl-[60px] pr-[60px] text-lg outline-none shadow-md transition-all focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus-visible:border-primary dark:focus-visible:ring-primary"
              />
              <SearchIcon className="pointer-events-none absolute left-6 top-1/2 -translate-y-1/2 size-6 text-gray-500 dark:text-gray-400" />
              <button
                type="button"
                className="absolute right-6 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-gray-200 p-2 flex items-center justify-center hover:bg-gray-300 dark:bg-dark-3 dark:hover:bg-dark-4"
              >
                <Image
                  src="/images/query/plus.png"
                  alt="Add"
                  width={20}
                  height={20}
                />
              </button>
            </div>
          </>
        )}

        {activeTab === "documents" && (<DocumentManagement />)}

        {activeTab === "settings" && (<SettingsPanel />)}

        {activeTab === "logs" && (<LogsPanel />)}

        {activeTab === "status" && (<StatusPanel />
        )}
      </div>
    </div>
  );
}
