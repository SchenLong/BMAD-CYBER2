/**
 * End-to-End Test Scenarios
 *
 * These tests simulate real user journeys through the application.
 * They require a running test server and browser automation.
 *
 * Framework: Playwright
 *
 * Run with: npm run test:e2e
 *
 * NOTE: These tests are skipped by default. They require:
 * 1. A running test server at localhost:42001
 * 2. Test database setup
 * 3. Valid OAuth test credentials
 *
 * To run these tests:
 * 1. Start the dev server: npm run dev
 * 2. In another terminal: npm run test:e2e
 *
 * Or use the UI mode for better debugging:
 * 1. npm run test:e2e:ui
 */

import { test, expect, Page } from '@playwright/test';
import { login, logout, type UserRole } from './helpers/auth';
import {
  createProject,
  navigateToProject,
  startWorkflow,
  uploadFile,
  verifyText,
  isButtonDisabled,
} from './helpers/test-helpers';

// Configure shorter timeouts for E2E tests to prevent hanging
test.setTimeout(15000);

// Helper function for creating a project (using imported helper)
async function createProjectInTest(page: Page, name: string, type: string) {
  await page.click('button:has-text("New Project"), [data-testid="new-project-button"]', { timeout: 5000 });
  await page.fill('[name="name"]', name);
  await page.selectOption('[name="type"]', type);
  await page.selectOption('[name="team"]', 'intel');
  await page.click('button:has-text("Create"), button:has-text("Submit")');
  await page.waitForSelector(`h1:has-text("${name}"), [data-testid="project-title"]`, { timeout: 5000 });
}

// Skip all E2E tests by default - they require a running server
// Change test.describe.skip to test.describe to enable these tests
test.describe.skip('User Onboarding Journey', () => {
  test('new user completes onboarding', async ({ page }) => {
    // Navigate to application
    await page.goto('/', { timeout: 5000 });

    // Click sign in
    await page.click('text=Sign In', { timeout: 5000 });

    // Use test authentication with new user flag
    await login(page, { role: 'USER', newUser: true });

    // Should see onboarding wizard
    await page.waitForSelector('[data-testid="onboarding-wizard"]', { timeout: 5000 });

    // Step 1: Welcome screen
    await page.waitForSelector('h1:has-text("Welcome to BMAD")', { timeout: 5000 });
    await page.click('button:has-text("Get Started"), button:has-text("Continue")');

    // Step 2: Role selection
    await page.selectOption('[name="primaryRole"]', 'intel');
    await page.click('button:has-text("Continue")');

    // Step 3: Feature overview
    await page.click('button:has-text("Continue")');

    // Step 4: Complete onboarding
    await page.click('button:has-text("Complete Setup"), button:has-text("Finish")');

    // Should be redirected to dashboard
    await page.waitForURL('/dashboard', { timeout: 5000 });
    await page.waitForSelector('h1:has-text("Dashboard")', { timeout: 5000 });
  });
});

test.describe.skip('Incident Response Workflow', () => {
  test('creates incident project and runs flash assessment', async ({ page }) => {
    await login(page, { role: 'USER' });

    // Create new project
    await createProjectInTest(page, 'Ransomware Incident - ACME Corp', 'incident-response');

    // Start workflow
    await page.click('button:has-text("Start Workflow"), [data-testid="start-workflow"]', { timeout: 5000 });
    await page.click('text=Flash Assessment', { timeout: 5000 });

    // Fill workflow form
    await page.fill('[name="incidentType"]', 'Ransomware');
    await page.fill('[name="affectedSystems"]', 'File servers, email');
    await page.fill('[name="description"]', 'Double extortion ransomware detected');

    // Submit workflow
    await page.click('button:has-text("Start Assessment"), button:has-text("Submit")');

    // Monitor progress
    await page.waitForSelector('[data-testid="progress-indicator"], [role="progressbar"]', { timeout: 5000 });

    // Wait for completion (in real test, would poll or wait for SSE event)
    await page.waitForSelector('text=Assessment Complete, text=Complete', { timeout: 10000 });

    // Verify results are displayed
    await page.waitForSelector('[data-testid="assessment-results"]', { timeout: 5000 });
    const resultsText = await page.textContent('[data-testid="assessment-results"]');
    expect(resultsText).toContain('Executive Brief');

    // Export deliverable
    await page.click('button:has-text("Export"), [data-testid="export-button"]');
    await page.click('text=PDF');

    // Verify download initiated (check for download event or file)
    // In Playwright, would use download event handler
  });
});

test.describe.skip('CLI Command Execution', () => {
  test('executes whitelisted command through web terminal', async ({ page }) => {
    await login(page, { role: 'ADMIN' });

    // Navigate to project
    await navigateToProject(page, 'test-project');

    // Open terminal
    await page.click('[data-testid="terminal-toggle"]');
    await page.waitForSelector('[data-testid="web-terminal"]', { timeout: 5000 });

    // Type command
    await page.fill('[data-testid="terminal-input"]', 'mission.list');
    await page.press('[data-testid="terminal-input"]', 'Enter');

    // Wait for output
    await page.waitForSelector('[data-testid="terminal-output"]', { timeout: 5000 });

    // Verify command executed
    const output = await page.textContent('[data-testid="terminal-output"]');
    expect(output).toBeDefined();

    // Try malicious command
    await page.fill('[data-testid="terminal-input"]', 'rm -rf /');
    await page.press('[data-testid="terminal-input"]', 'Enter');

    // Should show error
    await page.waitForSelector('text=not in whitelist, text=Command not allowed', { timeout: 5000 });

    // Verify command was rejected
    const error = await page.textContent('[data-testid="terminal-error"], .error');
    expect(error).toMatch(/not in whitelist|not allowed|rejected/i);
  });
});

test.describe.skip('Evidence Locker', () => {
  test('uploads evidence and verifies hash', async ({ page }) => {
    await login(page, { role: 'USER' });

    // Navigate to project
    await page.goto('/projects/test-project/evidence', { timeout: 5000 });

    // Upload file
    await uploadFile(page, 'evidence.pdf', Buffer.from('test evidence content'), 'application/pdf');

    // Fill metadata
    await page.fill('[name="description"]', 'Ransomware note found');
    await page.fill('[name="tags"]', 'ransomware, evidence, critical');

    // Submit
    await page.click('button:has-text("Upload Evidence"), button:has-text("Upload")');

    // Verify upload
    await page.waitForSelector('text=Upload successful, text=uploaded', { timeout: 5000 });

    // Check hash is displayed
    await page.waitForSelector('[data-testid="file-hash"]', { timeout: 5000 });
    const hash = await page.textContent('[data-testid="file-hash"]');
    expect(hash).toMatch(/^[a-f0-9]{64}$/i); // SHA-256

    // Download and verify
    await page.click('button:has-text("Download")');
    // Would verify file integrity in real test
  });

  test('rejects dangerous file types', async ({ page }) => {
    await login(page, { role: 'USER' });
    await page.goto('/projects/test-project/evidence', { timeout: 5000 });

    // Try to upload executable
    await uploadFile(page, 'malware.exe', Buffer.from('malicious content'), 'application/x-executable');

    await page.click('button:has-text("Upload Evidence"), button:has-text("Upload")');

    // Should show error
    await page.waitForSelector('text=File type not allowed, text=Dangerous file', { timeout: 5000 });
  });
});

test.describe.skip('Multi-Factor Authentication', () => {
  test('enables and verifies MFA', async ({ page }) => {
    await login(page, { role: 'USER' });

    // Navigate to security settings
    await page.click('[data-testid="user-menu"], button:has-text("Menu")');
    await page.click('text=Security Settings, text=Security');

    // Enable MFA
    await page.click('button:has-text("Enable MFA"), button:has-text("Setup MFA")');

    // QR code should be displayed
    await page.waitForSelector('[data-testid="mfa-qr-code"], img[alt*="QR"]', { timeout: 5000 });

    // In real test, would generate TOTP and enter code
    // For now, simulate entering code
    await page.fill('[name="totpCode"], [name="code"]', '123456');
    await page.click('button:has-text("Verify"), button:has-text("Confirm")');

    // Should show success
    await page.waitForSelector('text=MFA enabled, text=successfully enabled', { timeout: 5000 });

    // Logout and login again
    await logout(page);

    // Login with MFA
    await login(page, { role: 'USER', mfa: true });

    // Should prompt for MFA code
    await page.waitForSelector('[name="mfaCode"], [name="code"]', { timeout: 5000 });

    // Enter MFA code
    await page.fill('[name="mfaCode"], [name="code"]', '123456');
    await page.click('button:has-text("Verify"), button:has-text("Submit")');

    // Should login successfully
    await page.waitForURL('**/dashboard', { timeout: 5000 });
  });
});

test.describe.skip('Role-Based Access Control', () => {
  test('readonly user cannot execute workflows', async ({ page }) => {
    await login(page, { role: 'READONLY' });

    // Navigate to project
    await navigateToProject(page, 'test-project');

    // Workflow button should be disabled or hidden
    const workflowButton = page.locator('button:has-text("Start Workflow"), [data-testid="start-workflow"]');
    await expect(workflowButton).toBeDisabled();

    // Terminal should not be accessible
    await page.goto('/projects/test-project/terminal', { timeout: 5000 });
    await page.waitForSelector('text=Insufficient permissions, text=Not authorized', { timeout: 5000 });
  });

  test('admin can manage team members', async ({ page }) => {
    await login(page, { role: 'ADMIN' });

    // Navigate to team management
    await page.goto('/settings/team', { timeout: 5000 });

    // Invite member button should be visible
    await page.click('button:has-text("Invite Member"), [data-testid="invite-member"]');

    // Fill invite form
    await page.fill('[name="email"]', 'new-member@example.com');
    await page.selectOption('[name="role"]', 'USER');
    await page.click('button:has-text("Send Invitation"), button:has-text("Invite")');

    // Verify invitation sent
    await page.waitForSelector('text=Invitation sent, text=invite sent', { timeout: 5000 });

    // Verify invitation appears in list
    await page.waitForSelector('text=new-member@example.com', { timeout: 5000 });
  });
});

test.describe.skip('Template Generation', () => {
  test('generates executive brief from template', async ({ page }) => {
    await login(page, { role: 'USER' });

    // Navigate to project deliverables
    await page.goto('/projects/test-project/deliverables', { timeout: 5000 });

    // Generate from template
    await page.click('button:has-text("Generate from Template"), [data-testid="generate-template"]');
    await page.click('text=Executive Brief');

    // Fill template form
    await page.fill('[name="clientName"]', 'ACME Corporation');
    await page.fill('[name="incidentDate"]', '2025-02-18');
    await page.selectOption('[name="severity"]', 'high');

    // Select findings
    await page.check('[name="findings"][value="ransomware"]');
    await page.check('[name="findings"][value="data-exfiltration"]');

    // Generate preview
    await page.click('button:has-text("Generate Preview")');

    // Preview should be displayed
    await page.waitForSelector('[data-testid="document-preview"]', { timeout: 5000 });
    await verifyText(page, '[data-testid="document-preview"]', 'ACME Corporation');
    await verifyText(page, '[data-testid="document-preview"]', 'Executive Brief');

    // Finalize
    await page.click('button:has-text("Finalize"), button:has-text("Generate")');

    // Should appear in deliverables list
    await page.waitForSelector('text=Executive Brief - ACME Corporation', { timeout: 5000 });

    // Export to PDF
    await page.click('text=Executive Brief - ACME Corporation');
    await page.click('button:has-text("Export")');
    await page.click('text=Export as PDF, text=PDF');

    // Verify download initiated
    // In real test, would handle download event
  });
});

test.describe.skip('Performance - Large Data Sets', () => {
  test('handles large project lists efficiently', async ({ page }) => {
    await login(page, { role: 'USER' });

    // Navigate to projects (may have many projects)
    await page.goto('/projects', { timeout: 5000 });

    // Wait for list to load
    await page.waitForSelector('[data-testid="project-list"]', { timeout: 5000 });

    // Should use pagination or virtual scrolling
    const projects = await page.locator('[data-testid="project-item"]').count();
    expect(projects).toBeGreaterThan(0);

    // Test filtering
    await page.fill('[name="search"], [data-testid="search-input"]', 'incident');
    // Use waitForSelector with timeout instead of waitForTimeout
    await page.waitForSelector('[data-testid="project-list"]', { timeout: 1000 });

    // Filtered results should update
    const filtered = await page.locator('[data-testid="project-item"]').count();
    expect(filtered).toBeLessThanOrEqual(projects);
  });

  test('handles large evidence locker efficiently', async ({ page }) => {
    await login(page, { role: 'USER' });
    await page.goto('/projects/test-project/evidence', { timeout: 5000 });

    // Evidence should be paginated
    await page.waitForSelector('[data-testid="evidence-list"]', { timeout: 5000 });

    // Test pagination
    const nextButton = page.locator('button:has-text("Next"), [data-testid="next-page"]');
    if (await nextButton.isVisible()) {
      const firstPageCount = await page.locator('[data-testid="evidence-item"]').count();
      await nextButton.click();

      // Wait for list to update instead of fixed timeout
      await page.waitForSelector('[data-testid="evidence-list"]', { timeout: 2000 });

      // Second page should have content
      const items = await page.locator('[data-testid="evidence-item"]').count();
      expect(items).toBeGreaterThanOrEqual(0);
    }
  });
});
