"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AuthService from '@/services/auth';
import { useRouter } from 'next/navigation';

interface AuthContextType {
    role: string | null;
    permissions: string[];
    isAuthenticated: boolean;
    userInfo: {
        name: string;
        email: string;
        img: string;
    } | null;
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [authState, setAuthState] = useState<AuthContextType>({
        role: null,
        permissions: [],
        isAuthenticated: false,
        userInfo: null,
        login: async () => { },
        logout: () => { }
    });
    const router = useRouter();
    const auth = AuthService.getInstance();

    const updateAuthState = async () => {
        try {
            if (auth.isAuthenticated()) {
                const userInfo = await auth.fetchUserInfo();
                setAuthState(prev => ({
                    ...prev,
                    role: userInfo.role,
                    permissions: userInfo.permissions,
                    isAuthenticated: true,
                    userInfo: {
                        name: userInfo.name || userInfo.username,
                        email: userInfo.email || '',
                        img: userInfo.img || ''
                    }
                }));
            } else {
                setAuthState(prev => ({
                    ...prev,
                    role: null,
                    permissions: [],
                    isAuthenticated: false,
                    userInfo: null
                }));
            }
        } catch (error) {
            console.error('Failed to update auth state:', error);
            setAuthState(prev => ({
                ...prev,
                role: null,
                permissions: [],
                isAuthenticated: false,
                userInfo: null
            }));
        }
    };

    // Initialize auth state
    useEffect(() => {
        updateAuthState();
    }, []);

    // Listen for auth changes
    useEffect(() => {
        const handleStorageChange = () => {
            updateAuthState();
        };

        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    const login = async (username: string, password: string) => {
        try {
            await auth.login({ username, password });
            await updateAuthState();
            router.push('/');
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    };

    const logout = () => {
        auth.logout();
        updateAuthState();
        router.push('/auth/login');
    };

    // Update the context value with the latest state and methods
    const contextValue: AuthContextType = {
        ...authState,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
} 