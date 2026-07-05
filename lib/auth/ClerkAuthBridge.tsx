'use client';

import { useAuth } from '@clerk/nextjs';
import { useLayoutEffect } from 'react';
import { setTokenGetter } from '@/services/apiClient';

export function ClerkAuthBridge({ children }: { children: React.ReactNode }) {
    const { getToken, isLoaded } = useAuth();

    useLayoutEffect(() => {
        if (!isLoaded) {
            return;
        }

        setTokenGetter(() => getToken());
    }, [getToken, isLoaded]);

    return <>{children}</>;
}
