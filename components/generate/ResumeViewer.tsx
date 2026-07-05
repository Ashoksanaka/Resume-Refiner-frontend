'use client';

import { useState, useEffect } from 'react';
import { resumeApi, ApiClientError } from '@/services/apiClient';
import { Button, GeneratingLoader, ErrorDisplay } from '@/components/ui';
import styles from './ResumeViewer.module.css';

interface ResumeViewerProps {
    generationId: string;
    expiresAt: string;
}

export function ResumeViewer({ generationId, expiresAt }: ResumeViewerProps) {
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDownloading, setIsDownloading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        let active = true;

        const fetchPdf = async () => {
            try {
                const blob = await resumeApi.download(generationId);
                if (!active) return;

                setPdfBlob(blob);

                const url = URL.createObjectURL(blob);
                setPdfUrl(url);
            } catch (err) {
                if (!active) return;
                setError(err as Error);
            } finally {
                if (active) {
                    setIsLoading(false);
                }
            }
        };

        fetchPdf();

        return () => {
            active = false;
            if (pdfUrl) {
                URL.revokeObjectURL(pdfUrl);
            }
        };
    }, [generationId]);

    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            const filename = `resume_${generationId}.pdf`;
            const blob = pdfBlob ?? await resumeApi.download(generationId);
            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            link.style.display = 'none';
            link.setAttribute('download', filename);

            document.body.appendChild(link);
            link.click();

            setTimeout(() => {
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            }, 250);
        } catch (err) {
            console.error('Download failed:', err);
            setError(err as Error);
        } finally {
            setIsDownloading(false);
        }
    };

    if (isLoading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.pageFrame}>
                    <GeneratingLoader />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.errorContainer}>
                <ErrorDisplay error={error} />
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.toolbar}>
                <div className={styles.expiryInfo}>
                    Expires: {new Date(expiresAt).toLocaleString()}
                </div>
                <Button onClick={handleDownload} size="sm" disabled={isDownloading}>
                    {isDownloading ? 'Downloading...' : 'Download PDF'}
                </Button>
            </div>
            <div className={styles.preview}>
                {pdfUrl && (
                    <div className={styles.pageFrame}>
                        <iframe
                            src={`${pdfUrl}#toolbar=0&navpanes=0`}
                            className={styles.iframe}
                            title="Resume Preview"
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
