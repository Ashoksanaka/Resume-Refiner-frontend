import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { SideMenu } from '../components/SideMenu';
import { usePathname } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { profileApi } from '@/services/apiClient';

jest.mock('next/navigation', () => ({
    usePathname: jest.fn(),
}));

jest.mock('@clerk/nextjs', () => ({
    useAuth: jest.fn(),
}));

jest.mock('@/services/apiClient', () => ({
    profileApi: {
        get: jest.fn(),
    },
}));

describe('SideMenu Component', () => {
    beforeEach(() => {
        (usePathname as jest.Mock).mockReturnValue('/profile');
        (useAuth as jest.Mock).mockReturnValue({
            isSignedIn: true,
            isLoaded: true,
        });
        (profileApi.get as jest.Mock).mockResolvedValue({
            personalInfo: {
                full_name: 'John Doe',
                email: 'test@example.com',
                phone_number: '+1-5551234567',
                location: 'San Francisco, California, United States',
            },
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

        expect(screen.getByText('Profile')).toBeInTheDocument();
        expect(screen.getByText('Resume')).toBeInTheDocument();
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
        expect(screen.getByText('Overview')).toBeInTheDocument();
        expect(screen.getByText('Experience')).toBeInTheDocument();
        expect(screen.getByText('Skills')).toBeInTheDocument();
    });

    it('collapses and expands on desktop', async () => {
        render(<SideMenu />);
        await screen.findAllByText(/Resume AI/i);
        const collapseBtn = screen.getByLabelText('Collapse sidebar');

        expect(screen.getByText('Overview')).toBeVisible();

        fireEvent.click(collapseBtn);
        expect(screen.queryByText('Overview', { selector: 'span' })).not.toBeInTheDocument();

        const expandBtn = screen.getByLabelText('Expand sidebar');
        fireEvent.click(expandBtn);
        expect(screen.getByText('Overview')).toBeInTheDocument();
    });

    it('toggles profile submenu', async () => {
        render(<SideMenu />);
        await screen.findAllByText(/Resume AI/i);

        const profileToggle = screen.getByText('Profile');
        expect(screen.getByText('Overview')).toBeInTheDocument();

        fireEvent.click(profileToggle);
        expect(screen.queryByText('Overview')).not.toBeInTheDocument();
    });
});
