/**
 * Centralized error code mapping for authentication errors.
 * Maps backend error codes to user-friendly messages.
 */

export type AuthErrorCode =
    // Global error codes
    | 'INVALID_CREDENTIALS'
    | 'EMAIL_ALREADY_REGISTERED'
    | 'EMAIL_NOT_VERIFIED'
    | 'ACCOUNT_LOCKED'
    | 'RATE_LIMITED'
    | 'INVALID_PAYLOAD'
    // Field-level error codes
    | 'INVALID_EMAIL_FORMAT'
    | 'PASSWORD_TOO_WEAK'
    | 'PASSWORD_MISMATCH';

export type FieldErrorCode = 'INVALID_EMAIL_FORMAT' | 'PASSWORD_TOO_WEAK' | 'PASSWORD_MISMATCH';

/**
 * Maps backend error codes to user-friendly messages.
 * Provides safe fallbacks for unknown error codes.
 */
export function getAuthErrorMessage(code: string): string {
    const errorMessages: Record<string, string> = {
        // Global errors
        INVALID_CREDENTIALS: 'Invalid email or password',
        EMAIL_ALREADY_REGISTERED: 'An account with this email already exists',
        EMAIL_NOT_VERIFIED: 'Please verify your email before logging in',
        ACCOUNT_LOCKED: 'Account temporarily locked. Try again later',
        RATE_LIMITED: 'Too many attempts. Please wait and try again',
        INVALID_PAYLOAD: 'Some of the information you entered is invalid',
        // Field-level errors
        INVALID_EMAIL_FORMAT: 'Enter a valid email address',
        PASSWORD_TOO_WEAK: 'Password does not meet requirements',
        PASSWORD_MISMATCH: 'Passwords do not match',
    };

    return errorMessages[code] || 'Something went wrong. Please try again.';
}

/**
 * Maps field-level error codes to user-friendly messages.
 */
export function getFieldErrorMessage(code: FieldErrorCode): string {
    return getAuthErrorMessage(code);
}
