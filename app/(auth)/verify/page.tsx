'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { authApi, ApiClientError } from '@/services/apiClient';
import { Button, Card, Loading, ErrorDisplay } from '@/components/ui';
import styles from './page.module.css';

type VerifyState = 'verifying' | 'success' | 'error' | 'no-token';

function VerifyContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [state, setState] = useState<VerifyState>(token ? 'verifying' : 'no-token');
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!token) {
            setState('no-token');
            return;
        }

        const verify = async () => {
            try {
                await authApi.verify({ token });
                setState('success');
            } catch (err) {
                setError(err as Error);
                setState('error');
            }
        };

        verify();
    }, [token]);

    if (state === 'verifying') {
        return (
            <Card>
                <div className={styles.center}>
                    <Loading text="Verifying your email..." />
                </div>
            </Card>
        );
    }

    if (state === 'no-token') {
        return (
            <Card>
                <div className={styles.center}>
                    <div className={styles.errorIcon}>!</div>
                    <h2>Invalid Link</h2>
                    <p>
                        This verification link appears to be invalid or has expired.
                        Please check your email for the correct link or request a new one.
                    </p>
                    <Link href="/login">
                        <Button variant="secondary">Back to Login</Button>
                    </Link>
                </div>
            </Card>
        );
    }

    if (state === 'error') {
        return (
            <Card>
                <div className={styles.center}>
                    <div className={styles.errorIcon}>✕</div>
                    <h2>Verification Failed</h2>
                    {error && <ErrorDisplay error={error} />}
                    <p className="mt-md">
                        Please try again or contact support if the problem persists.
                    </p>
                    <Link href="/login">
                        <Button variant="secondary">Back to Login</Button>
                    </Link>
                </div>
            </Card>
        );
    }

    return (
        <Card>
            <div className={styles.center}>
                <div className={styles.successIcon}>✓</div>
                <h2>Email Verified!</h2>
                <p>
                    Your email has been successfully verified. You can now log in to your
                    account.
                </p>
                <Link href="/login">
                    <Button>Continue to Login</Button>
                </Link>
            </div>
        </Card>
    );
}

export default function VerifyPage() {
    return (
        <Suspense
            fallback={
                <Card>
                    <div className={styles.center}>
                        <Loading text="Loading..." />
                    </div>
                </Card>
            }
        >
            <VerifyContent />
        </Suspense>
    );
}
