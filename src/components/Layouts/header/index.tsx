"use client";

import Image from "next/image";
import { ThemeToggleSwitch } from "./theme-toggle";
import { UserInfo } from "./user-info";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useEffect, useState } from "react";

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
] as const;

export function Header() {
  const { role, permissions, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const currentTab = pathname.split('/').pop() || 'chats';
  const [isLoading, setIsLoading] = useState(true);

  // Filter tabs based on permissions using useMemo
  const visibleTabs = useMemo(() => {
    console.log('Auth State:', { role, permissions, isAuthenticated });

    if (!isAuthenticated || !role || !permissions) {
      console.log('Not fully authenticated, returning empty tabs');
      return [];
    }

    const filteredTabs = tabs.filter(tab => {
      if (tab.permission === "admin") {
        const hasAccess = role === "admin";
        console.log(`Tab ${tab.id} (admin): ${hasAccess}`);
        return hasAccess;
      }
      const hasAccess = permissions.includes(tab.permission);
      console.log(`Tab ${tab.id} (${tab.permission}): ${hasAccess}`);
      return hasAccess;
    });

    console.log('Filtered tabs:', filteredTabs);
    return filteredTabs;
  }, [role, permissions, isAuthenticated]);

  // Handle loading state
  useEffect(() => {
    if (isAuthenticated && role && permissions) {
      setIsLoading(false);
    }
  }, [isAuthenticated, role, permissions]);

  if (isLoading) {
    return (
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-stroke bg-white px-4 py-5 shadow-1 dark:border-stroke-dark dark:bg-gray-dark md:px-5 2xl:px-10">
        <div>
          <h1 className="mb-0.5 text-heading-5 font-bold text-dark dark:text-white">
            Saudi Interpol
          </h1>
          <p className="font-medium">Chat Assistant of the Saudi Interpol</p>
        </div>
        <div className="flex-1 flex justify-center">
          <div className="animate-pulse flex space-x-4">
            <div className="h-10 w-20 bg-gray-200 rounded dark:bg-gray-700"></div>
            <div className="h-10 w-20 bg-gray-200 rounded dark:bg-gray-700"></div>
            <div className="h-10 w-20 bg-gray-200 rounded dark:bg-gray-700"></div>
          </div>
        </div>
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
          <Link
            key={tab.id}
            href={`/${tab.id}`}
            className={`text-sm font-medium px-4 py-2 rounded-md transition ${currentTab === tab.id
              ? "bg-primary bg-opacity-10 text-primary"
              : "text-gray-700 hover:text-primary dark:text-white dark:hover:text-primary"
              }`}
          >
            {tab.label}
          </Link>
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
