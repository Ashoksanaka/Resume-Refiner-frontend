import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorDisplay } from '../ErrorDisplay';
import { ApiClientError } from '@/services/apiClient';

describe('ErrorDisplay Component', () => {
    it('renders string error message', () => {
        render(<ErrorDisplay error="Something went wrong" />);
        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
        expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('renders ApiClientError with mapped message', () => {
        const error = new ApiClientError(400, {
            error_code: 'INVALID_PAYLOAD',
            message: 'Invalid input',
        });
        render(<ErrorDisplay error={error} />);
        expect(screen.getByText('Some of the information you entered is invalid.')).toBeInTheDocument();
        expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('calls onDismiss when dismiss button is clicked', () => {
        const onDismiss = jest.fn();
        render(<ErrorDisplay error="Error message" onDismiss={onDismiss} />);
        const dismissButton = screen.getByLabelText('Dismiss error');
        fireEvent.click(dismissButton);
        expect(onDismiss).toHaveBeenCalledTimes(1);
    });

    it('calls onRetry when retry button is clicked', () => {
        const onRetry = jest.fn();
        render(<ErrorDisplay error="Error message" onRetry={onRetry} />);
        const retryButton = screen.getByText('Try Again');
        fireEvent.click(retryButton);
        expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it('does not show retry button for TTL expired errors', () => {
        const error = new ApiClientError(410, {
            error_code: 'TTL_EXPIRED',
            message: 'Resource expired',
        });
        render(<ErrorDisplay error={error} onRetry={jest.fn()} />);
        expect(screen.queryByText('Try Again')).not.toBeInTheDocument();
    });

    it('has role="alert" for accessibility', () => {
        render(<ErrorDisplay error="Error message" />);
        expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('renders details when ApiClientError has details', () => {
        const error = new ApiClientError(400, {
            error_code: 'INVALID_PAYLOAD',
            message: 'Invalid input',
            details: {
                email: ['Invalid email format'],
            },
        });
        render(<ErrorDisplay error={error} />);
        expect(screen.getByText('Invalid email format')).toBeInTheDocument();
        expect(screen.getByText(/email:/i)).toBeInTheDocument();
    });
});
