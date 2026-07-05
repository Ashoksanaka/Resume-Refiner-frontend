import Link from 'next/link';
import { Card } from '@/components/ui';

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-background">
            <Card>
                <div className="text-center p-6 max-w-md">
                    <p className="text-6xl font-bold text-muted-foreground mb-2">404</p>
                    <h2 className="text-xl font-semibold mb-3">Page not found</h2>
                    <p className="text-muted-foreground mb-6">
                        The page you are looking for does not exist or has been moved.
                    </p>
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
                    >
                        Back to home
                    </Link>
                </div>
            </Card>
        </div>
    );
}
