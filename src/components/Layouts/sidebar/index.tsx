// src/components/Layouts/sidebar/index.tsx
"use client";

import { useEffect, useState } from "react";
import ConversationList from "@/components/Conversation/ConversationList";
import { useSidebarContext } from "./sidebar-context";
import Image from "next/image";

export function Sidebar() {
  const { isOpen, toggleSidebar } = useSidebarContext();
  const [isVisible, setIsVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Mark component as mounted (client-side only)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Check if viewport is mobile
  useEffect(() => {
    if (!isMounted) return;

    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);

    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, [isMounted]);

  // Handle sidebar open/close state
  useEffect(() => {
    setIsVisible(isOpen);
  }, [isOpen]);

  // During SSR or when not mounted, return simple skeleton
  if (!isMounted) {
    return (
      <aside className="fixed left-0 top-0 z-20 h-screen w-[280px] shrink-0 overflow-hidden border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 lg:static">
        <div className="flex flex-col items-center py-2">
          <div className="w-40 h-10 bg-gray-200 dark:bg-gray-800 animate-pulse rounded"></div>
        </div>
        <div className="h-[calc(100vh-64px)] overflow-hidden">
          <div className="flex flex-col h-full">
            <div className="p-4">
              <div className="w-full h-10 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-md"></div>
            </div>
            <div className="flex-1 overflow-y-auto px-3 space-y-1">
              {/* Loading skeleton items */}
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="w-full h-16 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-md mb-2"></div>
              ))}
            </div>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <>
      {/* Mobile overlay when sidebar is open */}
      {isMobile && isVisible && (
        <div
          className="fixed inset-0 bg-black/50 z-10"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-20 h-screen w-[280px] shrink-0 overflow-hidden border-r border-gray-200 bg-white transition-all duration-300 dark:border-gray-800 dark:bg-gray-900 lg:static ${isVisible ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
      >
        <div className="flex flex-col items-center py-2">
          <Image
            src="/favicon.svg"
            alt="Logo"
            width={160}
            height={40}
            className="w-40"
          />
        </div>

        <div className="h-[calc(100vh-64px)] overflow-hidden">
          <ConversationList />
        </div>
      </aside>

      {/* Mobile toggle button for sidebar */}
      {isMobile && (
        <button
          onClick={toggleSidebar}
          className={`fixed bottom-4 left-4 z-30 rounded-full bg-primary p-3 text-white shadow-lg transition-transform ${isVisible ? "rotate-180" : ""
            }`}
          aria-label={isVisible ? "Close sidebar" : "Open sidebar"}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16m-7 6h7"
            />
          </svg>
        </button>
      )}
    </>
  );
}
