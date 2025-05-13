"use client";

import { useEffect, useState } from "react";
import { isAuthenticated } from "@/utils/auth";
import { useRouter } from "next/navigation";

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthed, setIsAuthed] = useState(false);

    useEffect(() => {
        // Check auth status
        const authStatus = isAuthenticated();
        setIsAuthed(authStatus);

        if (!authStatus) {
            // Redirect to login if not authenticated
            router.push("/auth/signin");
        } else {
            setIsLoading(false);
        }
    }, [router]);

    if (isLoading) {
        // Show loading indicator while checking authentication
        return (
            <div className="flex h-screen w-screen items-center justify-center">
                <div className="flex flex-col items-center space-y-4">
                    <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-primary rounded-full animate-bounce"></div>
                        <div className="w-4 h-4 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                        <div className="w-4 h-4 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                    </div>
                    <p className="text-gray-500">Checking authentication...</p>
                </div>
            </div>
        );
    }

    // Render children only if authenticated
    return isAuthed ? <>{children}</> : null;
} 