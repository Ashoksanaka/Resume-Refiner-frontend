import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProfileMenu } from '../ProfileMenu';
import { useClerk, useUser } from '@clerk/nextjs';

jest.mock('@clerk/nextjs', () => ({
    useUser: jest.fn(),
    useClerk: jest.fn(),
}));

describe('ProfileMenu Component', () => {
    const mockSignOut = jest.fn();

    beforeEach(() => {
        (useUser as jest.Mock).mockReturnValue({
            user: {
                primaryEmailAddress: { emailAddress: 'test@example.com' },
            },
        });
        (useClerk as jest.Mock).mockReturnValue({
            signOut: mockSignOut,
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

        expect(screen.queryByRole('menu')).not.toBeInTheDocument();

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
        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('handles logout correctly', async () => {
        mockSignOut.mockResolvedValue(undefined);
        render(<ProfileMenu />);
        fireEvent.click(screen.getByRole('button', { name: /user profile menu/i }));

        const logoutBtn = screen.getByRole('menuitem', { name: /logout/i });
        fireEvent.click(logoutBtn);

        expect(mockSignOut).toHaveBeenCalledWith({ redirectUrl: '/sign-in' });
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
