'use client';

import React from 'react';
import { ProfileMenu } from './ProfileMenu';

export const TopBar: React.FC = () => {
    return (
        <header className="h-16 flex items-center justify-end px-6 border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-40 w-full lg:pl-0">
            <ProfileMenu />
        </header>
    );
};
