'use client';

import { ApiClientError } from '@/services/apiClient';
import { ErrorCode } from '@/types/api';
import styles from './ErrorDisplay.module.css';

interface ErrorDisplayProps {
    error: Error | ApiClientError | string;
    onRetry?: () => void;
    onDismiss?: () => void;
}

// User-friendly error messages for each error code
const errorMessages: Record<ErrorCode, string> = {
    AUTH_REQUIRED: 'Please log in to continue.',
    INVALID_PAYLOAD: 'Some of the information you entered is invalid.',
    TTL_EXPIRED:
        'This resource has expired and is no longer available. Please start a new request.',
    MODEL_OUTPUT_INVALID:
        'Our AI encountered an issue generating your resume. The output contained invalid or unexpected content. Please try again.',
    LATEX_COMPILE_ERROR:
        'There was a problem creating your resume PDF. Please try again.',
    RATE_LIMITED:
        'Too many requests. Please wait a moment and try again.',
    NOT_FOUND: 'The requested item could not be found.',
    INTERNAL_SERVER_ERROR:
        'Something went wrong on our end. Please try again later.',
    AI_SERVICE_ERROR:
        'Our AI service is temporarily unavailable. Please try again in a few moments.',
    AI_SERVICE_QUOTA_EXCEEDED:
        'AI service quota exceeded. The daily limit has been reached. Please try again tomorrow or contact support.',
    LATEX_SERVICE_ERROR:
        'The PDF generation service is temporarily unavailable. Please try again in a few moments.',
    GENERATION_TIMEOUT:
        'Resume generation took too long. Please try again with a simpler profile or job description.',
    EMAIL_NOT_VERIFIED:
        'Please verify your email address before using this feature. Check your inbox for the verification link.',
    INVALID_TOKEN:
        'This link has expired or is invalid. Please request a new verification email.',
};

export function ErrorDisplay({ error, onRetry, onDismiss }: ErrorDisplayProps) {
    let message: string;
    let details: Record<string, string[]> | undefined;
    let isTTLExpired = false;

    if (typeof error === 'string') {
        message = error;
    } else if (error instanceof ApiClientError) {
        message =
            errorMessages[error.errorCode as ErrorCode] || error.message;
        details = error.details;
        isTTLExpired = error.isTTLExpired();
    } else {
        message = error.message || 'An unexpected error occurred.';
    }

    return (
        <div
            className={`${styles.container} ${isTTLExpired ? styles.expired : ''}`}
            role="alert"
        >
            <div className={styles.icon}>
                {isTTLExpired ? (
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                    </svg>
                ) : (
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                )}
            </div>
            <div className={styles.content}>
                <p className={styles.message}>{message}</p>
                {details && Object.keys(details).length > 0 && (
                    <ul className={styles.details}>
                        {Object.entries(details).map(([field, errors]) => (
                            <li key={field}>
                                <strong>{field}:</strong> {errors.join(', ')}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <div className={styles.actions}>
                {onRetry && !isTTLExpired && (
                    <button onClick={onRetry} className={styles.retryButton} type="button">
                        Try Again
                    </button>
                )}
                {onDismiss && (
                    <button
                        onClick={onDismiss}
                        className={styles.dismissButton}
                        type="button"
                        aria-label="Dismiss error"
                    >
                        ✕
                    </button>
                )}
            </div>
        </div>
    );
}
