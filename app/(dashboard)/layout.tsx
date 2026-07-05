'use client';

import { SideMenu } from '@/components/SideMenu';
import { TopBar } from '@/components/TopBar';
import styles from './layout.module.css';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
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
