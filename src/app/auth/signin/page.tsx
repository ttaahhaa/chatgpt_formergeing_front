"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SigninWithPassword from "@/components/Auth/SigninWithPassword";
import { isAuthenticated } from "@/utils/auth";

export default function SigninPage() {
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        // If user is already authenticated, redirect to home
        if (isAuthenticated()) {
            router.push("/");
        } else {
            setIsChecking(false);
        }
    }, [router]);

    if (isChecking) {
        return (
            <div className="flex h-screen w-screen items-center justify-center">
                <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-primary rounded-full animate-bounce"></div>
                    <div className="w-4 h-4 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                    <div className="w-4 h-4 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen w-full items-center justify-center bg-white dark:bg-gray-900">
            <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md dark:bg-gray-800">
                <div className="mb-8 text-center">
                    <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
                        Welcome Back
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Sign in to access your account
                    </p>
                </div>
                <SigninWithPassword />
            </div>
        </div>
    );
} 