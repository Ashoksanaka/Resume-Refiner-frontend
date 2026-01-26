'use client';

import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
    jobDescriptionApi,
    resumeApi,
    ApiClientError,
} from '@/services/apiClient';
import {
    JobDescription,
    ResumeGenerationRequest,
} from '@/types/api';
import { FilePlus } from 'lucide-react';
import {
    Button,
    Textarea,
    Card,
    ErrorDisplay,
} from '@/components/ui';
import { GenerationProgress } from '@/components/generate/GenerationProgress';
import { ResumeViewer } from '@/components/generate/ResumeViewer';
import styles from './page.module.css';

// -------------------------------------------------
// Steps
// -------------------------------------------------

type Step = 'jd' | 'generating' | 'complete';

// Default template ID - users can no longer select templates
const DEFAULT_TEMPLATE_ID = 'main';

// -------------------------------------------------
// Main Component
// -------------------------------------------------

export default function GeneratePage() {
    // Step state
    const [step, setStep] = useState<Step>('jd');

    // JD state
    const [jdText, setJdText] = useState('');
    const [jobDescription, setJobDescription] = useState<JobDescription | null>(null);

    // Generation state
    const [generation, setGeneration] = useState<ResumeGenerationRequest | null>(null);
    const [idempotencyKey] = useState(() => uuidv4());

    // General state
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    // -------------------------------------------------
    // Submit Job Description & Generate Resume
    // -------------------------------------------------

    const handleSubmitJD = async () => {
        if (!jdText.trim()) return;

        setError(null);
        setIsLoading(true);

        try {
            const jd = await jobDescriptionApi.submit({ text: jdText });
            setJobDescription(jd);

            // Immediately trigger resume generation with default template
            const gen = await resumeApi.trigger(
                {
                    job_description_id: jd.id,
                    template_id: DEFAULT_TEMPLATE_ID,
                },
                idempotencyKey
            );
            setGeneration(gen);
            setStep('generating');
        } catch (err) {
            setError(err as Error);
        } finally {
            setIsLoading(false);
        }
    };

    // -------------------------------------------------
    // Step 3: Poll for Status
    // -------------------------------------------------

    useEffect(() => {
        if (step !== 'generating' || !generation) return;

        let isCancelled = false;
        const pollInterval = 2000; // 2 seconds

        const poll = async () => {
            try {
                const status = await resumeApi.getStatus(generation.id);

                if (isCancelled) return;

                setGeneration(status);

                if (status.status === 'success' || status.status === 'failed') {
                    setStep('complete');
                } else {
                    // Continue polling
                    setTimeout(poll, pollInterval);
                }
            } catch (err) {
                if (isCancelled) return;

                if (err instanceof ApiClientError && err.isTTLExpired()) {
                    setError(err);
                    setStep('complete');
                } else {
                    // Retry on transient errors
                    setTimeout(poll, pollInterval);
                }
            }
        };

        poll();

        return () => {
            isCancelled = true;
        };
    }, [step, generation]);

    // -------------------------------------------------
    // Reset to start over
    // -------------------------------------------------

    const handleStartOver = () => {
        setStep('jd');
        setJdText('');
        setJobDescription(null);
        setGeneration(null);
        setError(null);
    };

    // -------------------------------------------------
    // Render
    // -------------------------------------------------

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Generate Resume</h1>
                <p className="text-muted">
                    Paste a job description and let AI customize your resume for the role.
                </p>
            </div>

            {/* Progress Steps */}
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
                    onRetry={step === 'jd' ? handleSubmitJD : undefined}
                />
            )}

            {/* Step 1: Job Description */}
            {step === 'jd' && (
                <Card title="Paste Job Description" subtitle="The AI will analyze the requirements and customize your resume">
                    <div className={styles.form}>
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
                        <div className={styles.actions}>
                            <Button
                                id="generate-resume-btn"
                                onClick={handleSubmitJD}
                                isLoading={isLoading}
                                disabled={!jdText.trim()}
                            >
                                Generate Resume
                            </Button>
                        </div>
                    </div>
                </Card>
            )}

            {/* Step 2: Generating */}
            {step === 'generating' && (
                <Card>
                    <GenerationProgress generation={generation} />
                </Card>
            )}

            {/* Step 3: Complete */}
            {step === 'complete' && generation && (
                <Card>
                    <div className={styles.complete}>
                        {generation.status === 'success' ? (
                            <>
                                <div className={styles.successIcon}>✓</div>
                                <h2>Your Resume is Ready!</h2>
                                <div className={styles.previewContainer}>
                                    <ResumeViewer
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
            {/* FAB for Mobile */}
            {step === 'jd' && (
                <button
                    className="lg:hidden fixed bottom-6 right-6 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg flex items-center justify-center z-40 hover:scale-105 active:scale-95 transition-transform"
                    aria-label="Generate Resume"
                    onClick={handleSubmitJD}
                    disabled={!jdText.trim() || isLoading}
                >
                    <FilePlus className="w-6 h-6" />
                </button>
            )}
        </div>
    );
}
