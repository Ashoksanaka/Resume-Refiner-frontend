'use client';

import { usePathname } from 'next/navigation';
import { useRequireAuth } from '@/lib/auth/AuthContext';
import { Loading } from '@/components/ui';
import { SideMenu } from '@/components/SideMenu';
import { TopBar } from '@/components/TopBar';
import styles from './layout.module.css';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const auth = useRequireAuth();
    const pathname = usePathname();

    if (auth.isLoading) {
        return <Loading fullPage text="Loading..." />;
    }

    if (!auth.isAuthenticated) {
        return null; // Will redirect via useRequireAuth
    }

    return (
        <div className="min-h-screen flex flex-col lg:flex-row">
            <SideMenu />
            <div className="flex-1 flex flex-col min-w-0">
                <TopBar />
                <main className={`${styles.main} mt-16 lg:mt-0`}>
                    {children}
                </main>
            </div>
        </div>
    );
}
