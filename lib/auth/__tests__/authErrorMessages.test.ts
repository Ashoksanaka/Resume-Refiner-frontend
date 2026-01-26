import { getAuthErrorMessage, getFieldErrorMessage } from '../authErrorMessages';

describe('authErrorMessages', () => {
    describe('getAuthErrorMessage', () => {
        it('maps known global error codes to user-friendly messages', () => {
            expect(getAuthErrorMessage('INVALID_CREDENTIALS')).toBe('Invalid email or password');
            expect(getAuthErrorMessage('EMAIL_ALREADY_REGISTERED')).toBe('An account with this email already exists');
            expect(getAuthErrorMessage('EMAIL_NOT_VERIFIED')).toBe('Please verify your email before logging in');
            expect(getAuthErrorMessage('ACCOUNT_LOCKED')).toBe('Account temporarily locked. Try again later');
            expect(getAuthErrorMessage('RATE_LIMITED')).toBe('Too many attempts. Please wait and try again');
        });

        it('maps known field-level error codes to user-friendly messages', () => {
            expect(getAuthErrorMessage('INVALID_EMAIL_FORMAT')).toBe('Enter a valid email address');
            expect(getAuthErrorMessage('PASSWORD_TOO_WEAK')).toBe('Password does not meet requirements');
            expect(getAuthErrorMessage('PASSWORD_MISMATCH')).toBe('Passwords do not match');
        });

        it('returns fallback message for unknown error codes', () => {
            expect(getAuthErrorMessage('UNKNOWN_ERROR')).toBe('Something went wrong. Please try again.');
            expect(getAuthErrorMessage('')).toBe('Something went wrong. Please try again.');
        });
    });

    describe('getFieldErrorMessage', () => {
        it('maps field error codes correctly', () => {
            expect(getFieldErrorMessage('INVALID_EMAIL_FORMAT')).toBe('Enter a valid email address');
            expect(getFieldErrorMessage('PASSWORD_TOO_WEAK')).toBe('Password does not meet requirements');
            expect(getFieldErrorMessage('PASSWORD_MISMATCH')).toBe('Passwords do not match');
        });
    });
});
