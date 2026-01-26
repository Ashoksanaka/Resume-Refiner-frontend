'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { Button, Input, Card, ErrorDisplay } from '@/components/ui';
import { ApiClientError } from '@/services/apiClient';
import { getAuthErrorMessage, getFieldErrorMessage } from '@/lib/auth/authErrorMessages';
import styles from './page.module.css';

export default function SignupPage() {
    const router = useRouter();
    const { signup } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [success, setSuccess] = useState(false);

    // Client-side validation
    const [validationErrors, setValidationErrors] = useState<{
        email?: string;
        password?: string;
        confirmPassword?: string;
    }>({});

    const validate = (): boolean => {
        const errors: typeof validationErrors = {};

        if (!email) {
            errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.email = 'Please enter a valid email address';
        }

        if (!password) {
            errors.password = 'Password is required';
        } else if (password.length < 8) {
            errors.password = 'Password must be at least 8 characters';
        }

        if (password !== confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        // Clear all errors when resubmitting
        setFormError(null);
        setFieldErrors({});
        setValidationErrors({});

        if (!validate()) {
            return;
        }

        setIsLoading(true);

        try {
            await signup({ email, password });
            setSuccess(true);
        } catch (err) {
            if (err instanceof ApiClientError) {
                // Handle field-level errors from backend
                if (err.fieldErrors && err.fieldErrors.length > 0) {
                    const newFieldErrors: Record<string, string> = {};
                    err.fieldErrors.forEach((fieldError) => {
                        const fieldName = fieldError.field === 'confirm_password' ? 'confirmPassword' : fieldError.field;
                        newFieldErrors[fieldName] = getFieldErrorMessage(fieldError.code as any);
                    });
                    setFieldErrors(newFieldErrors);
                }

                // Handle global errors
                if (err.errorCode && !err.fieldErrors) {
                    setFormError(getAuthErrorMessage(err.errorCode));
                } else if (err.errorCode === 'INVALID_PAYLOAD' && err.fieldErrors && err.fieldErrors.length === 0) {
                    // If INVALID_PAYLOAD but no field errors, show global error
                    setFormError(getAuthErrorMessage(err.errorCode));
                }
            } else {
                setFormError('Something went wrong. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Clear field error when user edits the field
    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
        if (fieldErrors.email) {
            setFieldErrors((prev) => {
                const updated = { ...prev };
                delete updated.email;
                return updated;
            });
        }
        if (validationErrors.email) {
            setValidationErrors((prev) => {
                const updated = { ...prev };
                delete updated.email;
                return updated;
            });
        }
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
        if (fieldErrors.password) {
            setFieldErrors((prev) => {
                const updated = { ...prev };
                delete updated.password;
                return updated;
            });
        }
        if (validationErrors.password) {
            setValidationErrors((prev) => {
                const updated = { ...prev };
                delete updated.password;
                return updated;
            });
        }
    };

    const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setConfirmPassword(e.target.value);
        if (fieldErrors.confirmPassword) {
            setFieldErrors((prev) => {
                const updated = { ...prev };
                delete updated.confirmPassword;
                return updated;
            });
        }
        if (validationErrors.confirmPassword) {
            setValidationErrors((prev) => {
                const updated = { ...prev };
                delete updated.confirmPassword;
                return updated;
            });
        }
    };

    if (success) {
        return (
            <Card>
                <div className={styles.success}>
                    <div className={styles.successIcon}>✓</div>
                    <h2>Check your email</h2>
                    <p>
                        We&apos;ve sent a verification link to <strong>{email}</strong>.
                        Please check your inbox and click the link to verify your account.
                    </p>
                    <Link href="/login">
                        <Button variant="secondary">Back to Login</Button>
                    </Link>
                </div>
            </Card>
        );
    }

    return (
        <Card title="Create your account" subtitle="Start customizing your resume with AI">
            <form onSubmit={handleSubmit} className={styles.form}>
                {formError && (
                    <ErrorDisplay error={formError} onDismiss={() => setFormError(null)} />
                )}

                <Input
                    label="Email"
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    error={fieldErrors.email || validationErrors.email}
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                />

                <Input
                    label="Password"
                    type="password"
                    value={password}
                    onChange={handlePasswordChange}
                    error={fieldErrors.password || validationErrors.password}
                    helperText="At least 8 characters"
                    placeholder="••••••••"
                    required
                    autoComplete="new-password"
                />

                <Input
                    label="Confirm Password"
                    type="password"
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    error={fieldErrors.confirmPassword || validationErrors.confirmPassword}
                    placeholder="••••••••"
                    required
                    autoComplete="new-password"
                />

                <Button type="submit" isLoading={isLoading} disabled={isLoading} fullWidth>
                    Create Account
                </Button>

                <p className={styles.footer}>
                    Already have an account?{' '}
                    <Link href="/login">Log in</Link>
                </p>
            </form>
        </Card>
    );
}
