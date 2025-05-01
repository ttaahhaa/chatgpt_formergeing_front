// src/components/Layouts/sidebar/index.tsx
"use client";

import { useEffect, useState } from "react";
import ConversationList from "./ConversationList";
import { useSidebarContext } from "./sidebar-context";

export function Sidebar({
  onSelectConversation,
  selectedId,
}: {
  onSelectConversation: (id: string) => void;
  selectedId?: string | null;
}) {
  const { isOpen } = useSidebarContext();
  const [isVisible, setIsVisible] = useState(true);

  // Handle sidebar open/close state
  useEffect(() => {
    setIsVisible(isOpen);
  }, [isOpen]);

  return (
    <aside
      className={`fixed left-0 top-0 z-20 h-screen w-[280px] shrink-0 overflow-hidden border-r border-gray-200 bg-white transition-all duration-300 dark:border-gray-800 dark:bg-gray-900 lg:static ${isVisible ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
    >
      <div className="flex flex-col items-center py-2">
        <img
          src="/favicon.svg"
          alt="Logo"
          className="w-40"
        />
      </div>


      <div className="h-[calc(100vh-64px)] overflow-hidden">
        <ConversationList
          onSelectConversation={onSelectConversation}
          selectedId={selectedId}
        />
      </div>
    </aside>
  );
}