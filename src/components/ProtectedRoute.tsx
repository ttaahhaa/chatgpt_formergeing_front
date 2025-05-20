"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthService from '@/services/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
}

export default function ProtectedRoute({ children, requiredPermission }: ProtectedRouteProps) {
  const router = useRouter();
  const auth = AuthService.getInstance();

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/auth/login');
      return;
    }

    if (requiredPermission && !auth.hasPermission(requiredPermission)) {
      router.push('/unauthorized');
      return;
    }
  }, [requiredPermission, auth, router]);

  return <>{children}</>;
} 