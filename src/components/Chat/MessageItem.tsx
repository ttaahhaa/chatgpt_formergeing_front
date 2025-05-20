"use client";

import { createContext, useContext, useState, useEffect } from "react";

type SidebarState = "expanded" | "collapsed";

type SidebarContextType = {
  state: SidebarState;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  toggleSidebar: () => void;
};

const SidebarContext = createContext<SidebarContextType | null>(null);

export function useSidebarContext() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebarContext must be used within a SidebarProvider");
  }
  return context;
}

export function SidebarProvider({
  children,
  defaultOpen = true,
}: {
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  // Start with sidebar closed on mobile
  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;
  const [isOpen, setIsOpen] = useState(isMobile ? false : defaultOpen);

  // Listen for window resize to handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        // Close sidebar on mobile
        setIsOpen(false);
      } else {
        // Open sidebar on desktop
        setIsOpen(true);
      }
    };

    // Set initial state
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Listen for escape key to close sidebar on mobile
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && window.innerWidth < 768) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  function toggleSidebar() {
    setIsOpen((prev) => !prev);
  }

  return (
    <SidebarContext.Provider
      value={{
        state: isOpen ? "expanded" : "collapsed",
        isOpen,
        setIsOpen,
        toggleSidebar,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}