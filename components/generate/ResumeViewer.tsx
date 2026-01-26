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
                // Fetch PDF for preview (inline, not as attachment)
                const response = await fetch(`/api/v1/resumes/${generationId}/download?inline=true`, {
                    credentials: 'include',
                });
                
                if (!response.ok) {
                    throw new Error('Failed to fetch PDF');
                }
                
                const blob = await response.blob();
                if (!active) return;
                
                // Store the blob for later download
                setPdfBlob(blob);
                
                // Create URL for preview
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
            // Prepare filename upfront
            const filename = `resume_${generationId}.pdf`;
            
            // Fetch the PDF as attachment (not inline) to trigger proper download
            const response = await fetch(`/api/v1/resumes/${generationId}/download`, {
                credentials: 'include',
            });
            
            if (!response.ok) {
                throw new Error('Failed to download PDF');
            }
            
            // Extract filename from Content-Disposition header
            const contentDisposition = response.headers.get('Content-Disposition') || '';
            let extractedFilename = filename; // Default fallback
            
            if (contentDisposition) {
                // Try multiple patterns to extract filename
                // Pattern 1: RFC 5987 format: filename*=UTF-8''filename
                const rfc5987Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
                if (rfc5987Match && rfc5987Match[1]) {
                    try {
                        extractedFilename = decodeURIComponent(rfc5987Match[1].trim());
                    } catch (e) {
                        // If decoding fails, fall back to standard format
                    }
                }
                
                // Pattern 2: Standard format: filename="value" or filename=value
                if (extractedFilename === filename) {
                    const standardMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]+)/);
                    if (standardMatch && standardMatch[1]) {
                        extractedFilename = standardMatch[1].replace(/['"]/g, '').trim();
                    }
                }
            }
            
            // Ensure filename has .pdf extension
            if (!extractedFilename.toLowerCase().endsWith('.pdf')) {
                extractedFilename = `${extractedFilename}.pdf`;
            }
            
            // Sanitize filename (remove any path components and ensure it's safe)
            extractedFilename = extractedFilename.split('/').pop() || extractedFilename;
            extractedFilename = extractedFilename.split('\\').pop() || extractedFilename;
            // Remove any characters that might cause issues
            extractedFilename = extractedFilename.replace(/[<>:"|?*\x00-\x1f]/g, '');
            
            // Get the blob
            const blob = await response.blob();
            
            // Create object URL
            const url = URL.createObjectURL(blob);
            
            // Create and configure download link
            const link = document.createElement('a');
            link.href = url;
            link.download = extractedFilename;  // Explicitly set filename with .pdf extension
            link.style.display = 'none';
            link.setAttribute('download', extractedFilename); // Set attribute as well for maximum compatibility
            
            // Add to DOM, click, and cleanup
            document.body.appendChild(link);
            link.click();
            
            // Cleanup after download starts
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
                <GeneratingLoader />
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
                    <iframe
                        src={`${pdfUrl}#toolbar=0&navpanes=0`}
                        className={styles.iframe}
                        title="Resume Preview"
                    />
                )}
            </div>
        </div>
    );
}
