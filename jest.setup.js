import '@testing-library/jest-dom';

jest.mock('@clerk/nextjs', () => ({
    ClerkProvider: ({ children }) => children,
    UserButton: () => null,
    useAuth: jest.fn(() => ({
        isLoaded: true,
        isSignedIn: true,
        getToken: jest.fn(async () => 'test-token'),
    })),
    useUser: jest.fn(() => ({
        user: {
            primaryEmailAddress: { emailAddress: 'test@example.com' },
        },
    })),
    useClerk: jest.fn(() => ({
        signOut: jest.fn(),
    })),
    SignIn: () => null,
    SignUp: () => null,
}));

global.IntersectionObserver = class IntersectionObserver {
    constructor() { }
    observe() { return null; }
    unobserve() { return null; }
    disconnect() { return null; }
};
