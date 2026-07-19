import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import DashboardPage from '../app/(dashboard)/dashboard/page';
import { profileApi, resumeApi, ApiClientError } from '@/services/apiClient';

jest.mock('@clerk/nextjs', () => ({
    useAuth: jest.fn(() => ({ isLoaded: true, isSignedIn: true })),
}));

jest.mock('@/services/apiClient', () => ({
    profileApi: {
        get: jest.fn(),
        getHistory: jest.fn(),
    },
    resumeApi: {
        list: jest.fn(),
        download: jest.fn(),
    },
    ApiClientError: class ApiClientError extends Error {
        status: number;
        errorCode: string;
        constructor(status: number, apiError: { message: string; error_code: string }) {
            super(apiError.message);
            this.status = status;
            this.errorCode = apiError.error_code;
        }
        isTTLExpired() {
            return this.errorCode === 'TTL_EXPIRED';
        }
    },
}));

describe('Dashboard Page', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('shows welcome state for new users', async () => {
        (profileApi.get as jest.Mock).mockRejectedValue(new ApiClientError(404, {
            error_code: 'NOT_FOUND',
            message: 'Not found',
        }));
        (resumeApi.list as jest.Mock).mockResolvedValue([]);
        (profileApi.getHistory as jest.Mock).mockResolvedValue([]);

        render(<DashboardPage />);

        expect(await screen.findByText('Welcome to Resume AI')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Fill your profile' })).toHaveAttribute('href', '/profile');
    });

    it('renders resume list and profile history', async () => {
        (profileApi.get as jest.Mock).mockResolvedValue({
            personalInfo: { full_name: 'Jane Doe', email: 'jane@example.com' },
            summary: 'A long enough summary for testing.',
        });
        (resumeApi.list as jest.Mock).mockResolvedValue([
            {
                id: '11111111-1111-1111-1111-111111111111',
                status: 'success',
                failure_reason: null,
                created_at: '2026-01-01T10:00:00Z',
                expires_at: '2026-02-01T10:00:00Z',
            },
        ]);
        (profileApi.getHistory as jest.Mock).mockResolvedValue([
            {
                sections: ['personalInfo'],
                saved_at: '2026-01-02T10:00:00Z',
                label: 'Updated Personal Info',
            },
        ]);

        render(<DashboardPage />);

        expect(await screen.findByText('Generated Resumes')).toBeInTheDocument();
        expect(screen.getByText('Recent Profile Changes')).toBeInTheDocument();
        expect(screen.getByText('Updated Personal Info')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Download' })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Download LaTeX' })).not.toBeInTheDocument();
    });
});
