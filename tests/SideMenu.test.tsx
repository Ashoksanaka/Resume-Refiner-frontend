import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SideMenu } from '../components/SideMenu';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { profileApi } from '@/services/apiClient';

// Mocks
jest.mock('next/navigation', () => ({
    usePathname: jest.fn(),
    useRouter: jest.fn(),
}));

jest.mock('@/lib/auth/AuthContext', () => ({
    useAuth: jest.fn(),
}));

jest.mock('@/services/apiClient', () => ({
    profileApi: {
        get: jest.fn(),
    },
}));

describe('SideMenu Component', () => {
    const mockPush = jest.fn();
    const mockLogout = jest.fn();

    beforeEach(() => {
        (usePathname as jest.Mock).mockReturnValue('/profile');
        (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
        (useAuth as jest.Mock).mockReturnValue({
            user: { email: 'test@example.com' },
            logout: mockLogout,
        });
        (profileApi.get as jest.Mock).mockResolvedValue({
            personalInfo: { full_name: 'John Doe', email: 'test@example.com' },
            summary: 'Some summary...',
            experience: [],
            education: [],
            skills: [],
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders correctly on desktop', async () => {
        render(<SideMenu />);
        await screen.findAllByText(/Resume AI/i);

        // Groups should be visible
        expect(screen.getByText('Profile')).toBeInTheDocument();
        expect(screen.getByText('Resume')).toBeInTheDocument();

        // Sub-items should be visible (initially expanded)
        expect(screen.getByText('Overview')).toBeInTheDocument();
        expect(screen.getByText('Experience')).toBeInTheDocument();
        expect(screen.getByText('Skills')).toBeInTheDocument();

        // User info and Settings are now moved to TopBar/ProfileMenu
        expect(screen.queryByText('test@example.com')).not.toBeInTheDocument();
        expect(screen.queryByText('Settings')).not.toBeInTheDocument();
        expect(screen.queryByText('Logout')).not.toBeInTheDocument();
    });

    it('collapses and expands on desktop', async () => {
        render(<SideMenu />);
        await screen.findAllByText(/Resume AI/i);
        const collapseBtn = screen.getByLabelText('Collapse sidebar');

        // Initially expanded - label should be visible
        expect(screen.getByText('Overview')).toBeVisible();

        // Collapse
        fireEvent.click(collapseBtn);
        // Nav labels (spans) should be hidden, but tooltip (div) will be present
        expect(screen.queryByText('Overview', { selector: 'span' })).not.toBeInTheDocument();

        // Expand
        const expandBtn = screen.getByLabelText('Expand sidebar');
        fireEvent.click(expandBtn);
        expect(screen.getByText('Overview')).toBeInTheDocument();
    });

    it('toggles profile submenu', async () => {
        render(<SideMenu />);
        await screen.findAllByText(/Resume AI/i);

        const profileToggle = screen.getByText('Profile');

        // Initially expanded
        expect(screen.getByText('Overview')).toBeInTheDocument();

        // Collapse profile group
        fireEvent.click(profileToggle);

        // Sub-items should be removed from DOM when collapsed
        expect(screen.queryByText('Overview')).not.toBeInTheDocument();
    });
});
