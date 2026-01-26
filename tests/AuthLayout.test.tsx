import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import DashboardLayout from '../app/(dashboard)/layout';
import { useRequireAuth } from '@/lib/auth/AuthContext';
import { SideMenu } from '@/components/SideMenu';
import { TopBar } from '@/components/TopBar';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
    usePathname: jest.fn(() => '/profile'),
    useRouter: jest.fn(() => ({
        push: jest.fn(),
        replace: jest.fn(),
        prefetch: jest.fn(),
    })),
}));

// Mock auth context
jest.mock('@/lib/auth/AuthContext', () => ({
    useRequireAuth: jest.fn(),
    useAuth: jest.fn(() => ({
        user: { email: 'test@example.com' },
        isLoading: false,
        isAuthenticated: true,
    })),
}));

// Mock components
jest.mock('@/components/SideMenu', () => ({
    SideMenu: () => <aside data-testid="side-menu">SideMenu</aside>,
}));

jest.mock('@/components/TopBar', () => ({
    TopBar: () => <header data-testid="top-bar">TopBar</header>,
}));

jest.mock('@/components/ui', () => ({
    Loading: ({ text }: { text: string }) => <div data-testid="loading">{text}</div>,
}));

jest.mock('../app/(dashboard)/layout.module.css', () => ({
    main: 'main-class',
}));

describe('Authenticated Layout (Dashboard)', () => {
    beforeEach(() => {
        (useRequireAuth as jest.Mock).mockReturnValue({
            user: { email: 'test@example.com' },
            isLoading: false,
            isAuthenticated: true,
        });
    });

    it('should render SideMenu when authenticated', () => {
        render(
            <DashboardLayout>
                <div>Dashboard Content</div>
            </DashboardLayout>
        );

        // SideMenu should be present
        expect(screen.getByTestId('side-menu')).toBeInTheDocument();
    });

    it('should render TopBar when authenticated', () => {
        render(
            <DashboardLayout>
                <div>Dashboard Content</div>
            </DashboardLayout>
        );

        // TopBar should be present
        expect(screen.getByTestId('top-bar')).toBeInTheDocument();
    });

    it('should render children content when authenticated', () => {
        render(
            <DashboardLayout>
                <div data-testid="dashboard-content">Dashboard Content</div>
            </DashboardLayout>
        );

        expect(screen.getByTestId('dashboard-content')).toBeInTheDocument();
    });

    it('should show loading state while checking auth', () => {
        (useRequireAuth as jest.Mock).mockReturnValue({
            user: null,
            isLoading: true,
            isAuthenticated: false,
        });

        render(
            <DashboardLayout>
                <div>Dashboard Content</div>
            </DashboardLayout>
        );

        expect(screen.getByTestId('loading')).toBeInTheDocument();
        expect(screen.queryByTestId('side-menu')).not.toBeInTheDocument();
    });

    it('should not render SideMenu when not authenticated', () => {
        (useRequireAuth as jest.Mock).mockReturnValue({
            user: null,
            isLoading: false,
            isAuthenticated: false,
        });

        render(
            <DashboardLayout>
                <div>Dashboard Content</div>
            </DashboardLayout>
        );

        // Should return null and redirect (handled by useRequireAuth)
        expect(screen.queryByTestId('side-menu')).not.toBeInTheDocument();
    });
});
