"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import AuthService from '@/services/auth';

export default function AuthCheck({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const auth = AuthService.getInstance();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const checkAuth = () => {
            const isAuth = auth.isAuthenticated();
            const isAuthPage = pathname?.startsWith('/auth');

            if (!isAuth && !isAuthPage) {
                router.replace('/auth/login');
                return;
            }

            if (isAuth && isAuthPage) {
                router.replace('/');
                return;
            }

            setIsChecking(false);
        };

        checkAuth();
    }, [pathname, auth, router]);

    if (isChecking) {
        return null;
    }

    return <>{children}</>;
} 