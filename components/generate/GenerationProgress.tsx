'use client';

import { ResumeGenerationRequest } from '@/types/api';
import { GeneratingLoader, Button } from '@/components/ui';
import styles from './GenerationProgress.module.css';

interface GenerationProgressProps {
    generation: ResumeGenerationRequest | null;
    roleName?: string;
    onStop?: () => void;
    isStopping?: boolean;
}

export function GenerationProgress({
    generation,
    roleName,
    onStop,
    isStopping = false,
}: GenerationProgressProps) {
    if (!generation) return null;

    const canStop =
        onStop &&
        (generation.status === 'pending' || generation.status === 'processing');

    return (
        <div className={styles.container}>
            <GeneratingLoader />
            <h2>Generating Your Resume</h2>
            {roleName && (
                <p className={styles.roleName}>Tailoring for: {roleName}</p>
            )}
            <p className={styles.status}>
                {generation.status === 'pending'
                    ? 'Your request is queued...'
                    : 'AI is customizing your resume...'}
            </p>
            <div className={styles.badge}>Status: {generation.status}</div>
            {canStop && (
                <div className={styles.stopAction}>
                    <Button
                        variant="secondary"
                        onClick={onStop}
                        isLoading={isStopping}
                        disabled={isStopping}
                    >
                        Stop generation
                    </Button>
                </div>
            )}
        </div>
    );
}
