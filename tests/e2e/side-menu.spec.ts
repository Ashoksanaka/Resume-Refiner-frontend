import { test, expect } from '@playwright/test';

test.describe('Navigation and Layout', () => {
    test.describe('Landing Page (Unauthenticated)', () => {
        test('should NOT render SideMenu on landing page', async ({ page }) => {
            await page.goto('/');

            // Landing page content should be visible
            await expect(page.locator('text=Your resume, tailored precisely for the job')).toBeVisible();

            // SideMenu should NOT be in the DOM
            const sideMenu = page.locator('aside');
            await expect(sideMenu).toHaveCount(0);

            // TopBar should NOT be in the DOM
            const topBar = page.locator('header[class*="h-16"]');
            await expect(topBar).toHaveCount(0);

            // Landing page has its own navigation
            await expect(page.locator('text=ResumeTailor')).toBeVisible();
            await expect(page.locator('text=Login')).toBeVisible();
        });

        test('should NOT render SideMenu on landing page (mobile)', async ({ page }) => {
            await page.setViewportSize({ width: 375, height: 667 });
            await page.goto('/');

            // SideMenu should NOT be in the DOM
            const sideMenu = page.locator('aside');
            await expect(sideMenu).toHaveCount(0);

            // Mobile menu button from SideMenu should NOT be present
            const mobileMenuButton = page.locator('[aria-label="Open menu"]');
            await expect(mobileMenuButton).toHaveCount(0);
        });

        test('should NOT flash SideMenu on initial load (slow network)', async ({ page }) => {
            // Simulate slow network to test for flash
            await page.route('**/*', async (route) => {
                // Add delay to network requests
                await new Promise(resolve => setTimeout(resolve, 100));
                await route.continue();
            });

            await page.goto('/');

            // Wait a bit to ensure any potential flash would have occurred
            await page.waitForTimeout(500);

            // SideMenu should never appear
            const sideMenu = page.locator('aside');
            await expect(sideMenu).toHaveCount(0);

            // Landing page content should be visible
            await expect(page.locator('text=Your resume, tailored precisely for the job')).toBeVisible();
        });
    });

    test.describe('Authenticated Pages', () => {
        test.beforeEach(async ({ page }) => {
            // Note: These tests assume authentication is set up via cookies/session
            // In a real scenario, you'd need to authenticate first
            // For now, we'll test the authenticated layout structure
            await page.goto('/profile');
        });

        test('should have a functional sidebar and topbar on desktop', async ({ page }) => {
        // Check if side menu is visible
        const sideMenu = page.locator('aside');
        await expect(sideMenu).toBeVisible();

        // Check if top bar is visible
        const topBar = page.locator('header');
        await expect(topBar).toBeVisible();

        // Check if ProfileMenu is in the header
        const profileMenu = topBar.locator('button[aria-label="User profile menu"]');
        await expect(profileMenu).toBeVisible();

        // Click on Experience in sidebar
        await page.click('aside >> text=Experience');

        // URL should have #experience
        await expect(page).toHaveURL(/.*#experience/);

        // Section should be in view
        const experienceSection = page.locator('#experience');
        await expect(experienceSection).toBeVisible();
    });

    test('should show/hide side menu on mobile', async ({ page }) => {
        // Set viewport to mobile
        await page.setViewportSize({ width: 375, height: 667 });

        await page.goto('/profile');

        // Sidebar should be hidden initially (translated off-screen)
        const sideMenu = page.locator('aside');
        await expect(sideMenu).toHaveClass(/.*-translate-x-full.*/);

        // Click hamburger (now in TopBar or Mobile Header)
        // In our implementation, the mobile menu button is inside SideMenu's mobile top bar
        await page.click('[aria-label="Open menu"]');

        // Sidebar should be visible
        await expect(sideMenu).toHaveClass(/.*translate-x-0.*/);

        // Click backdrop or X to close
        await page.click('[aria-label="Open menu"]'); // Click button again or Backdrop if accessible
        // Let's check SideMenu.tsx - it has an X button
        const closeBtn = page.locator('button:has(svg.lucide-x)');
        await closeBtn.click();

        await expect(sideMenu).toHaveClass(/.*-translate-x-full.*/);
    });

    test('should open profile dropdown in topbar', async ({ page }) => {
        const profileMenuBtn = page.locator('button[aria-label="User profile menu"]');
        await profileMenuBtn.click();

        // Check for dropdown items
        await expect(page.locator('text=Settings')).toBeVisible();
        await expect(page.locator('text=Logout')).toBeVisible();

        // Close by clicking outside
        await page.mouse.click(0, 0);
        await expect(page.locator('text=Settings')).not.toBeVisible();
        });

        test('should render SideMenu on authenticated profile page', async ({ page }) => {
            // Check if side menu is visible
            const sideMenu = page.locator('aside');
            await expect(sideMenu).toBeVisible();

            // Check if Profile group is present
            await expect(page.locator('text=Profile')).toBeVisible();
            await expect(page.locator('text=Resume')).toBeVisible();
        });

        test('should render TopBar on authenticated pages', async ({ page }) => {
            // Check if top bar is visible
            const topBar = page.locator('header');
            await expect(topBar).toBeVisible();

            // Check if ProfileMenu is in the header
            const profileMenu = topBar.locator('button[aria-label="User profile menu"]');
            await expect(profileMenu).toBeVisible();
        });
    });
});
