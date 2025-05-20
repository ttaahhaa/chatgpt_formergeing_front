"use client";

import { useEffect, useState } from "react";
import ConversationList from "./ConversationList";
import { useSidebarContext } from "./sidebar-context";
import Image from "next/image";

export function Sidebar({
  onSelectConversation,
  selectedId,
}: {
  onSelectConversation: (id: string) => void;
  selectedId?: string | null;
}) {
  const { isOpen, toggleSidebar } = useSidebarContext();
  const [isVisible, setIsVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Check if viewport is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);

    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  // Handle sidebar open/close state
  useEffect(() => {
    setIsVisible(isOpen);
  }, [isOpen]);

  // Function to handle selection and close sidebar on mobile
  const handleSelectConversation = (id: string) => {
    onSelectConversation(id);
    if (isMobile) {
      // Just toggle the visible state directly for mobile
      setIsVisible(false);
    }
  };

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
          <ConversationList
            onSelectConversation={handleSelectConversation}
            selectedId={selectedId}
          />
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