'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';

export const ProfileMenu: React.FC = () => {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const toggleMenu = () => setIsOpen(!isOpen);

    const handleLogout = async () => {
        await logout();
        router.push('/login');
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen]);

    if (!user) return null;

    const initials = user.email
        ? user.email.substring(0, 2).toUpperCase()
        : 'U';

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={toggleMenu}
                className="flex items-center gap-2 p-1.5 rounded-full hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-haspopup="true"
                aria-expanded={isOpen}
                aria-label="User profile menu"
            >
                <div className="flex items-center gap-3 px-2">
                    <span className="hidden md:block text-sm font-medium text-text-secondary truncate max-w-[150px]" title={user.email || ''}>
                        {user.email}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs border border-border">
                        {initials}
                    </div>
                    <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </button>

            {isOpen && (
                <div
                    className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg py-1 z-50 animate-in fade-in zoom-in duration-150"
                    role="menu"
                    aria-orientation="vertical"
                >
                    <div className="px-4 py-2 border-b border-border md:hidden">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Account</p>
                        <p className="text-sm truncate font-medium text-foreground">{user.email}</p>
                    </div>

                    <Link
                        href="/settings"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                        role="menuitem"
                        onClick={() => setIsOpen(false)}
                    >
                        <Settings className="w-4 h-4 text-muted-foreground" />
                        Settings
                    </Link>

                    <button
                        onClick={() => {
                            handleLogout();
                            setIsOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                        role="menuitem"
                    >
                        <LogOut className="w-4 h-4" />
                        Logout
                    </button>
                </div>
            )}
        </div>
    );
};
