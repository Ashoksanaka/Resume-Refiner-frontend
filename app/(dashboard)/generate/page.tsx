'use client';

import { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
    jobDescriptionApi,
    resumeApi,
    profileApi,
    ApiClientError,
} from '@/services/apiClient';
import {
    JobDescription,
    Profile,
    ResumeGenerationRequest,
} from '@/types/api';
import { FilePlus } from 'lucide-react';
import {
    Button,
    Input,
    Textarea,
    Card,
    ErrorDisplay,
} from '@/components/ui';
import { GenerationProgress } from '@/components/generate/GenerationProgress';
import { SectionSelector } from '@/components/generate/SectionSelector';
import { ResumeViewer } from '@/components/generate/ResumeViewer';
import {
    ProfileSectionKey,
    getDefaultSelectedSections,
} from '@/lib/constants/profileSections';
import { migrateProfile } from '@/lib/validation/profileSections';
import styles from './page.module.css';

// -------------------------------------------------
// Steps
// -------------------------------------------------

type Step = 'jd' | 'generating' | 'complete';

const DEFAULT_TEMPLATE_ID = 'main';
const MIN_JD_LENGTH = 50;

// -------------------------------------------------
// Main Component
// -------------------------------------------------

export default function GeneratePage() {
    const [step, setStep] = useState<Step>('jd');

    const [roleName, setRoleName] = useState('');
    const [jdText, setJdText] = useState('');
    const [jobDescription, setJobDescription] = useState<JobDescription | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [selectedSections, setSelectedSections] = useState<Set<ProfileSectionKey>>(new Set());
    const [sectionsInitialized, setSectionsInitialized] = useState(false);

    const [generation, setGeneration] = useState<ResumeGenerationRequest | null>(null);
    const idempotencyKeyRef = useRef<string | null>(null);

    const [isLoading, setIsLoading] = useState(false);
    const [isStopping, setIsStopping] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const showSectionSelector = jdText.trim().length >= MIN_JD_LENGTH && profile !== null;

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const data = await profileApi.get();
                const migrated = migrateProfile(data);
                setProfile(migrated);
            } catch (err) {
                console.error('Failed to load profile for section selection:', err);
            }
        };
        loadProfile();
    }, []);

    useEffect(() => {
        if (!profile || !showSectionSelector || sectionsInitialized) return;
        setSelectedSections(getDefaultSelectedSections(profile));
        setSectionsInitialized(true);
    }, [profile, showSectionSelector, sectionsInitialized]);

    useEffect(() => {
        if (jdText.trim().length < MIN_JD_LENGTH) {
            setSectionsInitialized(false);
            setSelectedSections(new Set());
        }
    }, [jdText]);

    const canGenerate =
        roleName.trim().length >= 2 &&
        jdText.trim().length >= MIN_JD_LENGTH &&
        selectedSections.size > 0;

    const handleGenerate = async () => {
        if (!canGenerate) return;

        setError(null);
        setIsLoading(true);

        if (!idempotencyKeyRef.current) {
            idempotencyKeyRef.current = uuidv4();
        }
        const requestIdempotencyKey = idempotencyKeyRef.current;

        try {
            const jd = await jobDescriptionApi.submit({
                role_name: roleName.trim(),
                text: jdText.trim(),
            });
            setJobDescription(jd);

            const gen = await resumeApi.trigger(
                {
                    job_description_id: jd.id,
                    template_id: DEFAULT_TEMPLATE_ID,
                    sections: Array.from(selectedSections),
                },
                requestIdempotencyKey
            );
            idempotencyKeyRef.current = null;
            setGeneration(gen);
            setStep('generating');
        } catch (err) {
            setError(err as Error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (step !== 'generating' || !generation) return;

        let isCancelled = false;
        const pollInterval = 2000;

        const poll = async () => {
            try {
                const status = await resumeApi.getStatus(generation.id);

                if (isCancelled) return;

                setGeneration(status);

                if (
                    status.status === 'success' ||
                    status.status === 'failed' ||
                    status.status === 'cancelled'
                ) {
                    setStep('complete');
                } else {
                    setTimeout(poll, pollInterval);
                }
            } catch (err) {
                if (isCancelled) return;

                if (err instanceof ApiClientError && err.isTTLExpired()) {
                    setError(err);
                    setStep('complete');
                } else {
                    setTimeout(poll, pollInterval);
                }
            }
        };

        poll();

        return () => {
            isCancelled = true;
        };
    }, [step, generation?.id]);

    const handleStopGeneration = async () => {
        if (!generation) return;

        setIsStopping(true);
        setError(null);

        try {
            const cancelled = await resumeApi.cancel(generation.id);
            setGeneration(cancelled);
            setStep('complete');
        } catch (err) {
            setError(err as Error);
        } finally {
            setIsStopping(false);
        }
    };

    const handleStartOver = () => {
        idempotencyKeyRef.current = null;
        setStep('jd');
        setRoleName('');
        setJdText('');
        setJobDescription(null);
        setGeneration(null);
        setSelectedSections(new Set());
        setSectionsInitialized(false);
        setError(null);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Generate Resume</h1>
                <p className="text-muted" style={{ color: 'white' }}>
                    Enter the role, paste a job description, and choose profile sections for AI customization.
                </p>
            </div>

            <div className={styles.progress}>
                <div className={`${styles.progressStep} ${step === 'jd' ? styles.active : ''} ${['generating', 'complete'].includes(step) ? styles.completed : ''}`}>
                    <span className={styles.progressNumber}>1</span>
                    <span className={styles.progressLabel}>Job Description</span>
                </div>
                <div className={styles.progressLine}></div>
                <div className={`${styles.progressStep} ${step === 'generating' ? styles.active : ''} ${step === 'complete' ? styles.completed : ''}`}>
                    <span className={styles.progressNumber}>2</span>
                    <span className={styles.progressLabel}>Generate</span>
                </div>
            </div>

            {error && (
                <ErrorDisplay
                    error={error}
                    onDismiss={() => setError(null)}
                    onRetry={step === 'jd' ? handleGenerate : undefined}
                />
            )}

            {step === 'jd' && (
                <Card title="Prepare Your Application" subtitle="Tell us the role and paste the job description">
                    <div className={styles.form}>
                        <Input
                            label="Role name"
                            value={roleName}
                            onChange={(e) => setRoleName(e.target.value)}
                            placeholder="e.g. Senior Software Engineer"
                            maxLength={200}
                            required
                        />
                        <Textarea
                            label="Job Description"
                            value={jdText}
                            onChange={(e) => setJdText(e.target.value)}
                            placeholder="Paste the full job description here..."
                            maxLength={20000}
                            charCount
                            rows={12}
                            required
                        />
                        {showSectionSelector && profile && (
                            <SectionSelector
                                profile={profile}
                                selectedSections={selectedSections}
                                onChange={setSelectedSections}
                            />
                        )}
                        <div className={styles.actions}>
                            <Button
                                id="generate-resume-btn"
                                onClick={handleGenerate}
                                isLoading={isLoading}
                                disabled={!canGenerate}
                            >
                                Generate Resume
                            </Button>
                        </div>
                    </div>
                </Card>
            )}

            {step === 'generating' && (
                <Card>
                    <GenerationProgress
                        generation={generation}
                        roleName={roleName.trim() || jobDescription?.role_name}
                        onStop={handleStopGeneration}
                        isStopping={isStopping}
                    />
                </Card>
            )}

            {step === 'complete' && generation && (
                <Card>
                    <div className={styles.complete}>
                        {generation.status === 'success' ? (
                            <>
                                <div className={styles.successIcon}>✓</div>
                                <h2>Your Resume is Ready!</h2>
                                <div className={styles.previewContainer}>
                                    <ResumeViewer
                                        key={generation.id}
                                        generationId={generation.id}
                                        expiresAt={generation.expires_at}
                                    />
                                </div>
                                <div className={styles.actions}>
                                    <Button variant="secondary" onClick={handleStartOver}>
                                        Generate Another
                                    </Button>
                                </div>
                            </>
                        ) : generation.status === 'cancelled' ? (
                            <>
                                <div className={styles.errorIcon}>✕</div>
                                <h2>Generation Cancelled</h2>
                                <p className="text-muted">
                                    {generation.failure_reason || 'Resume generation was stopped.'}
                                </p>
                                <div className={styles.actions}>
                                    <Button onClick={handleStartOver}>Start Over</Button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className={styles.errorIcon}>✕</div>
                                <h2>Generation Failed</h2>
                                <p className="text-muted">
                                    {generation.failure_reason || 'An error occurred while generating your resume.'}
                                </p>
                                <div className={styles.actions}>
                                    <Button onClick={handleStartOver}>Try Again</Button>
                                </div>
                            </>
                        )}
                    </div>
                </Card>
            )}

            {step === 'jd' && (
                <button
                    className="lg:hidden fixed bottom-6 right-6 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg flex items-center justify-center z-40 hover:scale-105 active:scale-95 transition-transform"
                    aria-label="Generate Resume"
                    onClick={handleGenerate}
                    disabled={!canGenerate || isLoading}
                >
                    <FilePlus className="w-6 h-6" />
                </button>
            )}
        </div>
    );
}
