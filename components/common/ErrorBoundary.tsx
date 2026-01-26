'use client';

import { Component, ErrorInfo, ReactNode } from 'react';
import { Card, Button } from '@/components/ui';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto' }}>
                    <Card>
                        <div style={{ textAlign: 'center', padding: '24px 0' }}>
                            <div
                                style={{
                                    fontSize: '48px',
                                    marginBottom: '16px',
                                    color: '#ef4444',
                                }}
                            >
                                ⚠
                            </div>
                            <h2 style={{ marginBottom: '12px' }}>Something went wrong</h2>
                            <p
                                style={{
                                    color: '#64748b',
                                    marginBottom: '24px',
                                }}
                            >
                                We're sorry, but an unexpected error occurred. Please try refreshing
                                the page.
                            </p>
                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                                <Button onClick={() => window.location.reload()}>
                                    Refresh Page
                                </Button>
                                <Button
                                    variant="secondary"
                                    onClick={() => this.setState({ hasError: false, error: null })}
                                >
                                    Try Again
                                </Button>
                            </div>
                            {process.env.NODE_ENV === 'development' && this.state.error && (
                                <pre
                                    style={{
                                        marginTop: '24px',
                                        padding: '12px',
                                        background: '#f1f5f9',
                                        borderRadius: '8px',
                                        textAlign: 'left',
                                        overflow: 'auto',
                                        fontSize: '12px',
                                        color: '#ef4444',
                                    }}
                                >
                                    {this.state.error.toString()}
                                </pre>
                            )}
                        </div>
                    </Card>
                </div>
            );
        }

        return this.props.children;
    }
}
