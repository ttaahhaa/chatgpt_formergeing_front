"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import AuthService from '@/services/auth';
import { useRouter } from 'next/navigation';
import { api } from '@/services/api';
import { Message } from '@/contexts/ChatContext';

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

    const updateAuthState = useCallback(async () => {
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
    }, [auth]);

    // Initialize auth state
    useEffect(() => {
        updateAuthState();
    }, [updateAuthState]);

    // Listen for auth changes
    useEffect(() => {
        const handleStorageChange = () => {
            updateAuthState();
        };

        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [updateAuthState]);

    const createInitialConversation = async () => {
        try {
            // Check if user has chat permissions
            if (!auth.hasPermission('chat:stream')) {
                return;
            }

            console.log('Creating initial conversation after login');
            const result = await api.createNewConversation();

            if (result?.conversation_id) {
                // Store the conversation ID for future use
                localStorage.setItem('lastActiveConversationId', result.conversation_id);

                // Create welcome message
                const welcomeMessage: Message = {
                    role: 'assistant',
                    content: 'Welcome to the Saudi Interpol Chat Assistant. How can I help you today?',
                    timestamp: new Date().toISOString()
                };

                // Save conversation with welcome message
                await api.saveConversation({
                    conversation_id: result.conversation_id,
                    preview: 'Welcome to Chat Assistant',
                    history: [welcomeMessage]
                });

                console.log('Initial conversation created successfully:', result.conversation_id);
            }
        } catch (err) {
            console.error('Failed to create initial conversation after login:', err);
        }
    };

    const login = async (username: string, password: string) => {
        try {
            await auth.login({ username, password });
            await updateAuthState();

            // Create initial conversation after successful login
            await createInitialConversation();

            router.push('/');
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    };

    const logout = () => {
        auth.logout();
        updateAuthState();

        // Clear conversation-related storage on logout
        Object.keys(localStorage).forEach(key => {
            if (key === 'lastActiveConversationId' || key.startsWith('conversation_preview_')) {
                localStorage.removeItem(key);
            }
        });

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