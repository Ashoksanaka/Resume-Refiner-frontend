'use client';

import { ResumeGenerationRequest } from '@/types/api';
import { GeneratingLoader } from '@/components/ui';
import styles from './GenerationProgress.module.css';

interface GenerationProgressProps {
    generation: ResumeGenerationRequest | null;
}

export function GenerationProgress({ generation }: GenerationProgressProps) {
    if (!generation) return null;

    return (
        <div className={styles.container}>
            <GeneratingLoader />
            <h2>Generating Your Resume</h2>
            <p className={styles.status}>
                {generation.status === 'pending'
                    ? 'Your request is queued...'
                    : 'AI is customizing your resume...'}
            </p>
            <div className={styles.badge}>Status: {generation.status}</div>
        </div>
    );
}
