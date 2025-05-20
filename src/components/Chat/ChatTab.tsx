// src/components/Chat/ChatTab.tsx
"use client";

import React, { useState, useEffect } from "react";
import ChatArea from "./ChatArea";
import { useConversation } from "@/contexts/ConversationContext";

export default function ChatTab() {
  const [isMounted, setIsMounted] = useState(false);

  // Set mounted flag when component mounts on client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Render loading state during SSR or before component is mounted
  if (!isMounted) {
    return (
      <div className="flex-1 h-full w-full">
        <div className="animate-pulse flex flex-col h-full w-full p-4">
          {/* Mode selector skeleton */}
          <div className="mb-5 flex items-center justify-between gap-6 flex-wrap">
            <div className="flex items-center gap-6 flex-wrap">
              <div className="h-5 w-40 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-5 w-40 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-5 w-40 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
            <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
          
          {/* Chat area skeleton */}
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center p-8">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gray-200 dark:bg-gray-700"></div>
              <div className="h-6 w-64 mx-auto bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
              <div className="h-4 w-96 mx-auto bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
          
          {/* Input area skeleton */}
          <div className="h-16 w-full bg-gray-200 dark:bg-gray-700 rounded-xl mt-4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 h-full overflow-hidden">
      <ChatArea />
    </div>
  );
}
