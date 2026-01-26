'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/services/apiClient';
import { User, LoginRequest, SignupRequest } from '@/types/api';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (credentials: LoginRequest) => Promise<void>;
    signup: (credentials: SignupRequest) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check authentication status on mount
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const currentUser = await authApi.me();
                setUser(currentUser);
            } catch (error) {
                // User is not authenticated
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, []);

    const login = useCallback(async (credentials: LoginRequest) => {
        const loggedInUser = await authApi.login(credentials);
        setUser(loggedInUser);
    }, []);

    const signup = useCallback(async (credentials: SignupRequest) => {
        await authApi.signup(credentials);
        // Don't set user here - they need to verify email first
    }, []);

    const logout = useCallback(async () => {
        await authApi.logout();
        setUser(null);
    }, []);

    const value: AuthContextType = {
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export function useRequireAuth() {
    const auth = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!auth.isLoading && !auth.isAuthenticated) {
            router.push('/login');
        }
    }, [auth.isLoading, auth.isAuthenticated, router]);

    return {
        ...auth,
        isAuthenticated: auth.isAuthenticated,
        isLoading: auth.isLoading,
    };
}
