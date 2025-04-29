"use client";

import Image from "next/image";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useSidebarContext } from "./sidebar-context";
import { ArrowLeftIcon } from "./icons";

export function Sidebar() {
  const { isOpen, isMobile, toggleSidebar, setIsOpen } = useSidebarContext();

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "max-w-[290px] overflow-hidden border-r border-gray-200 bg-white transition-[width] duration-200 ease-linear dark:border-gray-800 dark:bg-gray-dark",
          isMobile ? "fixed bottom-0 top-0 z-50" : "sticky top-0 h-screen",
          isOpen ? "w-full" : "w-0",
        )}
        aria-label="Sidebar"
        aria-hidden={!isOpen}
        inert={!isOpen}
      >
        <div className="flex h-full flex-col py-10 pl-[25px] pr-[7px]">
          {/* Logo */}
          <div className="relative pr-4.5 mb-8">
            <Link
              href={"/"}
              onClick={() => isMobile && toggleSidebar()}
              className="px-0 py-2.5 min-[850px]:py-0"
            >
              <Logo />
            </Link>

            {isMobile && (
              <button
                onClick={toggleSidebar}
                className="absolute left-3/4 right-4.5 top-1/2 -translate-y-1/2 text-right"
              >
                <span className="sr-only">Close Menu</span>
                <ArrowLeftIcon className="ml-auto size-7" />
              </button>
            )}
          </div>

          {/* New Conversation Button */}
          <button
            className="mb-6 flex w-full items-center gap-3 rounded-md border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-100 dark:border-gray-700 dark:bg-dark-3 dark:text-white dark:hover:bg-dark-4"
          >
            <Image
              src="/images/new_chat/new_chat.png"
              alt="New Chat"
              width={20}
              height={20}
            />
            New Conversation
          </button>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-3">
            <div className="space-y-2">
              {/* Example conversations */}
              <button className="w-full rounded-md px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-dark-4">
                Conversation 1
              </button>
              <button className="w-full rounded-md px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-dark-4">
                Conversation 2
              </button>
              <button className="w-full rounded-md px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-dark-4">
                Conversation 3
              </button>
              {/* You can later dynamically generate more conversations */}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
