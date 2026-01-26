import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import LoginPage from '../login/page';
import { ApiClientError } from '@/services/apiClient';

// Mocks
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}));

jest.mock('@/lib/auth/AuthContext', () => ({
    useAuth: jest.fn(),
}));

describe('LoginPage', () => {
    const mockPush = jest.fn();
    const mockLogin = jest.fn();

    beforeEach(() => {
        (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
        (useAuth as jest.Mock).mockReturnValue({
            login: mockLogin,
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('displays global error for INVALID_CREDENTIALS', async () => {
        mockLogin.mockRejectedValueOnce(
            new ApiClientError(401, {
                code: 'INVALID_CREDENTIALS',
                message: 'Invalid email or password',
            })
        );

        render(<LoginPage />);

        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const submitButton = screen.getByRole('button', { name: /log in/i });

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
            expect(screen.getByRole('alert')).toBeInTheDocument();
        });
    });

    it('displays global error for EMAIL_NOT_VERIFIED', async () => {
        mockLogin.mockRejectedValueOnce(
            new ApiClientError(401, {
                code: 'EMAIL_NOT_VERIFIED',
                message: 'Email not verified',
            })
        );

        render(<LoginPage />);

        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const submitButton = screen.getByRole('button', { name: /log in/i });

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('Please verify your email before logging in')).toBeInTheDocument();
        });
    });

    it('displays global error for ACCOUNT_LOCKED', async () => {
        mockLogin.mockRejectedValueOnce(
            new ApiClientError(401, {
                code: 'ACCOUNT_LOCKED',
                message: 'Account locked',
            })
        );

        render(<LoginPage />);

        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const submitButton = screen.getByRole('button', { name: /log in/i });

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('Account temporarily locked. Try again later')).toBeInTheDocument();
        });
    });

    it('clears global error when user edits email field', async () => {
        mockLogin.mockRejectedValueOnce(
            new ApiClientError(401, {
                code: 'INVALID_CREDENTIALS',
                message: 'Invalid email or password',
            })
        );

        render(<LoginPage />);

        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const submitButton = screen.getByRole('button', { name: /log in/i });

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
        });

        // User edits the email field
        fireEvent.change(emailInput, { target: { value: 'new@example.com' } });

        await waitFor(() => {
            expect(screen.queryByText('Invalid email or password')).not.toBeInTheDocument();
        });
    });

    it('clears global error when user edits password field', async () => {
        mockLogin.mockRejectedValueOnce(
            new ApiClientError(401, {
                code: 'INVALID_CREDENTIALS',
                message: 'Invalid email or password',
            })
        );

        render(<LoginPage />);

        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const submitButton = screen.getByRole('button', { name: /log in/i });

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
        });

        // User edits the password field
        fireEvent.change(passwordInput, { target: { value: 'newpassword' } });

        await waitFor(() => {
            expect(screen.queryByText('Invalid email or password')).not.toBeInTheDocument();
        });
    });

    it('clears errors when form is resubmitted', async () => {
        mockLogin
            .mockRejectedValueOnce(
                new ApiClientError(401, {
                    code: 'INVALID_CREDENTIALS',
                    message: 'Invalid email or password',
                })
            )
            .mockResolvedValueOnce({ id: '1', email: 'test@example.com', is_verified: true });

        render(<LoginPage />);

        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const submitButton = screen.getByRole('button', { name: /log in/i });

        // First submission - error
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
        });

        // Second submission - should clear errors
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.queryByText('Invalid email or password')).not.toBeInTheDocument();
        });
    });

    it('disables submit button while loading', async () => {
        mockLogin.mockImplementation(() => new Promise(() => {})); // Never resolves

        render(<LoginPage />);

        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const submitButton = screen.getByRole('button', { name: /log in/i });

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(submitButton).toBeDisabled();
        });
    });
});
