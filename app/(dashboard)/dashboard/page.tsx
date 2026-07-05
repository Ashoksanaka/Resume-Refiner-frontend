'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { profileApi, resumeApi, ApiClientError } from '@/services/apiClient';
import { ProfileSaveEvent, ResumeGenerationRequest } from '@/types/api';
import { Button, Card, ErrorDisplay, Loading } from '@/components/ui';
import styles from './page.module.css';

function formatDate(isoDate: string): string {
    return new Date(isoDate).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
    });
}

function statusClassName(status: ResumeGenerationRequest['status']): string {
    switch (status) {
        case 'success':
            return styles.statusSuccess;
        case 'failed':
            return styles.statusFailed;
        default:
            return styles.statusPending;
    }
}

export default function DashboardPage() {
    const { isLoaded, isSignedIn } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [hasProfile, setHasProfile] = useState(false);
    const [resumes, setResumes] = useState<ResumeGenerationRequest[]>([]);
    const [history, setHistory] = useState<ProfileSaveEvent[]>([]);

    useEffect(() => {
        if (!isLoaded) {
            return;
        }

        if (!isSignedIn) {
            setIsLoading(false);
            return;
        }

        const loadDashboard = async () => {
            try {
                const [profileResult, resumeResult, historyResult] = await Promise.allSettled([
                    profileApi.get(),
                    resumeApi.list(),
                    profileApi.getHistory(3),
                ]);

                if (profileResult.status === 'fulfilled') {
                    setHasProfile(true);
                } else if (
                    profileResult.reason instanceof ApiClientError &&
                    profileResult.reason.status === 404
                ) {
                    setHasProfile(false);
                } else if (profileResult.status === 'rejected') {
                    throw profileResult.reason;
                }

                if (resumeResult.status === 'fulfilled') {
                    setResumes(resumeResult.value);
                } else {
                    throw resumeResult.reason;
                }

                if (historyResult.status === 'fulfilled') {
                    setHistory(historyResult.value);
                } else if (
                    historyResult.reason instanceof ApiClientError &&
                    historyResult.reason.status === 404
                ) {
                    setHistory([]);
                } else if (historyResult.status === 'rejected') {
                    throw historyResult.reason;
                }
            } catch (err) {
                setError(err as Error);
            } finally {
                setIsLoading(false);
            }
        };

        loadDashboard();
    }, [isLoaded, isSignedIn]);

    if (isLoading) {
        return <Loading fullPage text="Loading dashboard..." />;
    }

    const isNewUser = !hasProfile && resumes.length === 0;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Dashboard</h1>
                <p className="text-muted-foreground">
                    Your resumes and recent profile activity in one place.
                </p>
            </div>

            {error && <ErrorDisplay error={error} onDismiss={() => setError(null)} />}

            {isNewUser && (
                <Card className={styles.welcomeCard}>
                    <h2 className="text-2xl font-bold mb-3">Welcome to Resume AI</h2>
                    <p className="text-muted-foreground mb-6">
                        Get started by filling in your professional profile. We will use it to
                        generate tailored, ATS-friendly resumes for each job you apply to.
                    </p>
                    <Link href="/profile">
                        <Button size="lg">Fill your profile</Button>
                    </Link>
                </Card>
            )}

            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Generated Resumes</h2>
                {resumes.length === 0 ? (
                    <div className={styles.emptyState}>
                        No active resumes yet.{' '}
                        {!isNewUser && (
                            <Link href="/generate" className="text-primary underline">
                                Generate your first resume
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className={styles.list}>
                        {resumes.map((resume) => (
                            <div key={resume.id} className={styles.listItem}>
                                <div className={styles.listItemMeta}>
                                    <span className="font-medium">Resume {resume.id.slice(0, 8)}</span>
                                    <span className="text-sm text-muted-foreground">
                                        Created {formatDate(resume.created_at)}
                                    </span>
                                    <span className={`${styles.statusBadge} ${statusClassName(resume.status)}`}>
                                        {resume.status}
                                    </span>
                                </div>
                                {resume.status === 'success' && (
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={async () => {
                                            try {
                                                const blob = await resumeApi.download(resume.id);
                                                const url = URL.createObjectURL(blob);
                                                const link = document.createElement('a');
                                                link.href = url;
                                                link.download = `resume-${resume.id.slice(0, 8)}.pdf`;
                                                link.click();
                                                URL.revokeObjectURL(url);
                                            } catch (err) {
                                                setError(err as Error);
                                            }
                                        }}
                                    >
                                        Download
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {!isNewUser && (
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>Recent Profile Changes</h2>
                    {history.length === 0 ? (
                        <div className={styles.emptyState}>
                            No profile save history yet.
                        </div>
                    ) : (
                        <div className={styles.list}>
                            {history.map((event, index) => (
                                <div key={`${event.saved_at}-${index}`} className={styles.historyItem}>
                                    <div className={styles.historyLabel}>{event.label}</div>
                                    <div className={styles.historyTime}>{formatDate(event.saved_at)}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            )}
        </div>
    );
}
