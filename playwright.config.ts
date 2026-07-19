import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './tests/e2e',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: 'html',
    use: {
        baseURL: (() => {
            const baseURL = process.env.PLAYWRIGHT_BASE_URL;
            if (!baseURL) {
                throw new Error(
                    'PLAYWRIGHT_BASE_URL must be set (see .env.example).'
                );
            }
            return baseURL;
        })(),
        trace: 'on-first-retry',
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],
});
