import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher(['/', '/sign-in(.*)', '/sign-up(.*)']);
const isAuthRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)']);

export default clerkMiddleware(async (auth, req) => {
    const { userId } = await auth();

    // Signed-in users should not see sign-in/sign-up (avoids Clerk redirect console noise)
    if (userId && isAuthRoute(req)) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    if (!isPublicRoute(req)) {
        await auth.protect();
    }
});

export const config = {
    // Exclude /api/v1 — proxied to Django; auth is handled via Bearer JWT there
    matcher: ['/((?!.*\\..*|_next|api/v1).*)', '/'],
};
