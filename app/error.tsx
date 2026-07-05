'use client';

import { useEffect } from 'react';
import { Button, Card } from '@/components/ui';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-background">
            <Card>
                <div className="text-center p-6 max-w-md">
                    <div className="text-5xl mb-4 text-destructive">!</div>
                    <h2 className="text-xl font-semibold mb-3">Something went wrong</h2>
                    <p className="text-muted-foreground mb-6">
                        An unexpected error occurred. Please try again or return to the home page.
                    </p>
                    <div className="flex gap-3 justify-center">
                        <Button onClick={reset}>Try again</Button>
                        <Button variant="secondary" onClick={() => (window.location.href = '/')}>
                            Go home
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}
