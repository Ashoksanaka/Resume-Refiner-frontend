'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { Button, Input, Card, ErrorDisplay } from '@/components/ui';
import { ApiClientError } from '@/services/apiClient';
import { getAuthErrorMessage } from '@/lib/auth/authErrorMessages';
import styles from './page.module.css';

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        // Clear all errors when resubmitting
        setFormError(null);
        setFieldErrors({});
        setIsLoading(true);

        try {
            await login({ email, password });
            router.push('/profile');
        } catch (err) {
            if (err instanceof ApiClientError) {
                // Handle field-level errors (unlikely for login, but handle it)
                if (err.fieldErrors && err.fieldErrors.length > 0) {
                    const newFieldErrors: Record<string, string> = {};
                    err.fieldErrors.forEach((fieldError) => {
                        newFieldErrors[fieldError.field] = getAuthErrorMessage(fieldError.code);
                    });
                    setFieldErrors(newFieldErrors);
                }

                // Handle global errors (most common for login)
                if (err.errorCode) {
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
        // Clear global error when user starts typing
        if (formError) {
            setFormError(null);
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
        // Clear global error when user starts typing
        if (formError) {
            setFormError(null);
        }
    };

    return (
        <Card title="Welcome back" subtitle="Log in to continue customizing your resume">
            <form onSubmit={handleSubmit} className={styles.form}>
                {formError && (
                    <ErrorDisplay error={formError} onDismiss={() => setFormError(null)} />
                )}

                <Input
                    label="Email"
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    error={fieldErrors.email}
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                />

                <Input
                    label="Password"
                    type="password"
                    value={password}
                    onChange={handlePasswordChange}
                    error={fieldErrors.password}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                />

                <Button type="submit" isLoading={isLoading} disabled={isLoading} fullWidth>
                    Log In
                </Button>

                <p className={styles.footer}>
                    Don&apos;t have an account?{' '}
                    <Link href="/signup">Sign up</Link>
                </p>
            </form>
        </Card>
    );
}
