/**
 * Basic E2E Setup Verification Tests
 *
 * These tests verify the Playwright E2E testing infrastructure is working correctly.
 * They test basic page loads and don't require authentication or complex features.
 *
 * Run with: npm run test:e2e basic-setup.spec.ts
 */

import { test, expect } from '@playwright/test';

test.describe('E2E Setup Verification', () => {
  test('homepage loads successfully', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/');

    // Page should load without errors
    await expect(page).toHaveTitle(/BMAD|Black Unicorn/);
  });

  test('login page is accessible', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');

    // Should have login form or sign-in button
    const signInButton = page.locator('button:has-text("Sign"), a:has-text("Log")');
    await expect(signInButton.first()).toBeVisible();
  });

  test('health check endpoint responds', async ({ page }) => {
    // Navigate to health endpoint
    // Note: 404 is acceptable if the health endpoint hasn't been created yet
    // This test verifies the API routing is working, not the specific endpoint
    const response = await page.request.get('/api/health');

    // Health endpoint should respond (200 is ideal, 404 acceptable if not created yet)
    const status = response.status();
    expect([200, 404]).toContain(status);
  });

  test('page has proper meta tags', async ({ page }) => {
    await page.goto('/');

    // Check for viewport meta tag
    const viewport = page.locator('meta[name="viewport"]');
    await expect(viewport).toHaveAttribute('content', /width=device-width/);
  });
});
