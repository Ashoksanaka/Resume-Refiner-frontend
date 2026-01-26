import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProfileMenu } from '../ProfileMenu';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';

// Mocks
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}));

jest.mock('@/lib/auth/AuthContext', () => ({
    useAuth: jest.fn(),
}));

describe('ProfileMenu Component', () => {
    const mockPush = jest.fn();
    const mockLogout = jest.fn();

    beforeEach(() => {
        (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
        (useAuth as jest.Mock).mockReturnValue({
            user: { email: 'test@example.com' },
            logout: mockLogout,
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders the user email and avatar', () => {
        render(<ProfileMenu />);
        expect(screen.getByText('test@example.com')).toBeInTheDocument();
        expect(screen.getByText('TE')).toBeInTheDocument();
    });

    it('opens the dropdown menu on click', () => {
        render(<ProfileMenu />);
        const button = screen.getByRole('button', { name: /user profile menu/i });

        // Dropdown should be closed initially
        expect(screen.queryByRole('menu')).not.toBeInTheDocument();

        // Open dropdown
        fireEvent.click(button);
        expect(screen.getByRole('menu')).toBeInTheDocument();
        expect(screen.getByText('Settings')).toBeInTheDocument();
        expect(screen.getByText('Logout')).toBeInTheDocument();
    });

    it('handles settings navigation', () => {
        render(<ProfileMenu />);
        fireEvent.click(screen.getByRole('button', { name: /user profile menu/i }));

        const settingsLink = screen.getByRole('menuitem', { name: /settings/i });
        expect(settingsLink).toHaveAttribute('href', '/settings');

        fireEvent.click(settingsLink);
        // Menu should close
        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('handles logout correctly', async () => {
        render(<ProfileMenu />);
        fireEvent.click(screen.getByRole('button', { name: /user profile menu/i }));

        const logoutBtn = screen.getByRole('menuitem', { name: /logout/i });
        fireEvent.click(logoutBtn);

        expect(mockLogout).toHaveBeenCalled();
        // Menu should close
        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('closes the menu on escape key', () => {
        render(<ProfileMenu />);
        fireEvent.click(screen.getByRole('button', { name: /user profile menu/i }));
        expect(screen.getByRole('menu')).toBeInTheDocument();

        fireEvent.keyDown(document, { key: 'Escape' });
        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });
});
