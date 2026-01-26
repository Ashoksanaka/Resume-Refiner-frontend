import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import Page from '../app/page';

// Mock Next.js components and hooks
jest.mock('next/navigation', () => ({
    usePathname: jest.fn(() => '/'),
    useRouter: jest.fn(() => ({
        push: jest.fn(),
        replace: jest.fn(),
        prefetch: jest.fn(),
    })),
}));

jest.mock('next/link', () => {
    return ({ children, href }: { children: React.ReactNode; href: string }) => {
        return <a href={href}>{children}</a>;
    };
});

// Mock SideMenu to verify it's not imported/rendered
jest.mock('@/components/SideMenu', () => ({
    SideMenu: () => {
        throw new Error('SideMenu should not be rendered on landing page');
    },
}));

jest.mock('@/components/TopBar', () => ({
    TopBar: () => {
        throw new Error('TopBar should not be rendered on landing page');
    },
}));

describe('Landing Page Layout', () => {
    it('should render landing page without SideMenu', () => {
        render(<Page />);

        // Landing page content should be visible
        expect(screen.getByText(/Your resume, tailored precisely for the job/i)).toBeInTheDocument();
        
        // Landing page navigation should be visible
        const nav = screen.getByRole('navigation');
        expect(nav).toBeInTheDocument();
        expect(screen.getByText('Login')).toBeInTheDocument();
        expect(screen.getByText('Get Started')).toBeInTheDocument();

        // SideMenu should not be in the DOM
        const sideMenu = screen.queryByRole('complementary') || screen.queryByTestId('side-menu');
        expect(sideMenu).not.toBeInTheDocument();

        // TopBar (authenticated header) should not be in the DOM
        // Note: Landing page has its own nav, but not the authenticated TopBar
        const authenticatedTopBar = screen.queryByTestId('top-bar');
        expect(authenticatedTopBar).not.toBeInTheDocument();
    });

    it('should render landing page navigation without SideMenu', () => {
        render(<Page />);

        // Landing page has its own navigation
        expect(screen.getByText('Login')).toBeInTheDocument();
        expect(screen.getByText('Get Started')).toBeInTheDocument();

        // No SideMenu elements should be present
        expect(screen.queryByText('Profile')).not.toBeInTheDocument();
        expect(screen.queryByText('Resume')).not.toBeInTheDocument();
        expect(screen.queryByText('Overview')).not.toBeInTheDocument();
    });
});
