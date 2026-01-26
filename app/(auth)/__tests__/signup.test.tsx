import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import SignupPage from '../signup/page';
import { ApiClientError } from '@/services/apiClient';

// Mocks
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}));

jest.mock('@/lib/auth/AuthContext', () => ({
    useAuth: jest.fn(),
}));

describe('SignupPage', () => {
    const mockPush = jest.fn();
    const mockSignup = jest.fn();

    beforeEach(() => {
        (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
        (useAuth as jest.Mock).mockReturnValue({
            signup: mockSignup,
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('displays field-level errors from backend', async () => {
        const fieldErrors = [
            { field: 'email', code: 'INVALID_EMAIL_FORMAT' },
            { field: 'password', code: 'PASSWORD_TOO_WEAK' },
        ];

        mockSignup.mockRejectedValueOnce(
            new ApiClientError(400, {
                code: 'INVALID_PAYLOAD',
                message: 'Validation failed',
                errors: fieldErrors,
            })
        );

        render(<SignupPage />);

        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const submitButton = screen.getByRole('button', { name: /create account/i });

        fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
        fireEvent.change(passwordInput, { target: { value: 'weak' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('Enter a valid email address')).toBeInTheDocument();
            expect(screen.getByText('Password does not meet requirements')).toBeInTheDocument();
        });
    });

    it('displays global error for EMAIL_ALREADY_REGISTERED', async () => {
        mockSignup.mockRejectedValueOnce(
            new ApiClientError(409, {
                code: 'EMAIL_ALREADY_REGISTERED',
                message: 'Account already exists',
            })
        );

        render(<SignupPage />);

        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const confirmPasswordInput = screen.getByLabelText('Confirm Password');
        const submitButton = screen.getByRole('button', { name: /create account/i });

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('An account with this email already exists')).toBeInTheDocument();
            expect(screen.getByRole('alert')).toBeInTheDocument();
        });
    });

    it('clears field error when user edits the field', async () => {
        const fieldErrors = [{ field: 'email', code: 'INVALID_EMAIL_FORMAT' }];

        mockSignup.mockRejectedValueOnce(
            new ApiClientError(400, {
                code: 'INVALID_PAYLOAD',
                message: 'Validation failed',
                errors: fieldErrors,
            })
        );

        render(<SignupPage />);

        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const confirmPasswordInput = screen.getByLabelText('Confirm Password');
        const submitButton = screen.getByRole('button', { name: /create account/i });

        fireEvent.change(emailInput, { target: { value: 'invalid' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('Enter a valid email address')).toBeInTheDocument();
        });

        // User edits the email field
        fireEvent.change(emailInput, { target: { value: 'valid@example.com' } });

        await waitFor(() => {
            expect(screen.queryByText('Enter a valid email address')).not.toBeInTheDocument();
        });
    });

    it('clears errors when form is resubmitted', async () => {
        mockSignup
            .mockRejectedValueOnce(
                new ApiClientError(409, {
                    code: 'EMAIL_ALREADY_REGISTERED',
                    message: 'Account already exists',
                })
            )
            .mockResolvedValueOnce(undefined);

        render(<SignupPage />);

        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const confirmPasswordInput = screen.getByLabelText('Confirm Password');
        const submitButton = screen.getByRole('button', { name: /create account/i });

        // First submission - error
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('An account with this email already exists')).toBeInTheDocument();
        });

        // Second submission - should clear errors
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.queryByText('An account with this email already exists')).not.toBeInTheDocument();
        });
    });

    it('disables submit button while loading', async () => {
        mockSignup.mockImplementation(() => new Promise(() => {})); // Never resolves

        render(<SignupPage />);

        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const confirmPasswordInput = screen.getByLabelText('Confirm Password');
        const submitButton = screen.getByRole('button', { name: /create account/i });

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(submitButton).toBeDisabled();
        });
    });
});
