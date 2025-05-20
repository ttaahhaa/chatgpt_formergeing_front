// src/app/(home)/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
  const router = useRouter();
  const { role, permissions, isAuthenticated } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Set isMounted on client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    if (!isAuthenticated || !role || permissions.length === 0) {
      return;
    }

    if (isRedirecting) {
      return;
    }

    const redirectUser = async () => {
      setIsRedirecting(true);

      // Check permissions and redirect to the appropriate page
      if (permissions.includes("chat:stream")) {
        router.push("/chats");
      } else if (permissions.includes("documents:upload")) {
        router.push("/documents");
      } else if (role === "admin") {
        router.push("/settings");
      }
    };

    redirectUser();
  }, [permissions, role, router, isAuthenticated, isRedirecting, isMounted]);

  // Show loading state regardless of client/server to avoid flickering
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Setting up your workspace...</p>
      </div>
    </div>
  );
}
