"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
  const router = useRouter();
  const { role, permissions, isAuthenticated } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !role || permissions.length === 0) {
      return;
    }

    if (isRedirecting) {
      return;
    }

    setIsRedirecting(true);

    // Redirect to the first available tab based on permissions
    if (permissions.includes("chat:stream")) {
      router.push("/chats");
    } else if (permissions.includes("documents:upload")) {
      router.push("/documents");
    } else if (role === "admin") {
      router.push("/settings");
    }
  }, [permissions, role, router, isAuthenticated, isRedirecting]);

  if (!isAuthenticated || !role || permissions.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return null;
}