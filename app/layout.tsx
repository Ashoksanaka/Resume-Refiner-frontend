import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { ClerkAuthBridge } from '@/lib/auth/ClerkAuthBridge';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import './globals.css';

export const metadata: Metadata = {
  title: 'Resume AI - Customize Your Resume with AI',
  description:
    'AI-powered resume customization platform. Generate tailored, ATS-friendly resumes for any job description.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="antialiased bg-background text-foreground">
        <ErrorBoundary>
          <ClerkProvider
            signInUrl="/sign-in"
            signUpUrl="/sign-up"
            signInFallbackRedirectUrl="/dashboard"
            signUpFallbackRedirectUrl="/dashboard"
          >
            <ClerkAuthBridge>
              {children}
            </ClerkAuthBridge>
          </ClerkProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
