/**
 * E2E Test Helper Functions
 *
 * Common helper functions used across E2E tests for the BMAD Web UI.
 */

import { Page, expect } from '@playwright/test';

/**
 * Project types available in BMAD Web UI
 */
export type ProjectType =
  | 'incident-response'
  | 'threat-hunting'
  | 'digital-forensics'
  | 'intelligence-collection'
  | 'compliance-audit';

/**
 * Team types available in BMAD Web UI
 */
export type TeamType =
  | 'intel'
  | 'cybersec'
  | 'legal'
  | 'strategy';

/**
 * Creates a new project through the UI.
 *
 * @param page - Playwright Page object
 * @param name - Project name
 * @param type - Project type
 * @param team - Team assignment (default: 'intel')
 * @returns Promise that resolves when project is created
 *
 * @example
 * ```typescript
 * await createProject(page, 'Ransomware Incident', 'incident-response', 'cybersec');
 * ```
 */
export async function createProject(
  page: Page,
  name: string,
  type: ProjectType,
  team: TeamType = 'intel'
): Promise<void> {
  // Click new project button
  await page.click('button:has-text("New Project"), [data-testid="new-project-button"]', { timeout: 5000 });

  // Wait for modal to appear
  await page.waitForSelector('[data-testid="project-modal"], dialog', { timeout: 5000 });

  // Fill project form
  await page.fill('[name="name"]', name);
  await page.selectOption('[name="type"]', type);
  await page.selectOption('[name="team"]', team);

  // Submit form
  await page.click('button:has-text("Create"), button:has-text("Submit")');

  // Wait for success and redirect to project page
  await page.waitForSelector(`h1:has-text("${name}"), [data-testid="project-title"]`, { timeout: 5000 });
}

/**
 * Navigates to a project by name or ID.
 *
 * @param page - Playwright Page object
 * @param projectIdentifier - Project name or ID
 * @returns Promise that resolves when navigation is complete
 */
export async function navigateToProject(page: Page, projectIdentifier: string): Promise<void> {
  await page.goto(`/projects/${projectIdentifier}`, { timeout: 10000 });
  await page.waitForLoadState('networkidle');
}

/**
 * Starts a workflow for a project.
 *
 * @param page - Playwright Page object
 * @param workflowName - Name of the workflow to start
 * @returns Promise that resolves when workflow is started
 */
export async function startWorkflow(page: Page, workflowName: string): Promise<void> {
  await page.click('button:has-text("Start Workflow"), [data-testid="start-workflow"]', { timeout: 5000 });
  await page.click(`text=${workflowName}`, { timeout: 5000 });
}

/**
 * Fills a form field by label.
 *
 * @param page - Playwright Page object
 * @param label - Field label text
 * @param value - Value to fill
 */
export async function fillByLabel(page: Page, label: string, value: string): Promise<void> {
  const field = page.locator(`label:has-text("${label}")`).or(page.locator(`[aria-label="${label}"]`));
  const input = field.locator('..').locator('input, textarea, select').first();
  await input.fill(value);
}

/**
 * Waits for a toast/notification message to appear and return its text.
 *
 * @param page - Playwright Page object
 * @param timeout - Maximum time to wait (default: 5000ms)
 * @returns Promise resolving to the notification text
 */
export async function waitForNotification(page: Page, timeout = 5000): Promise<string | null> {
  const notification = page.locator('[data-testid="notification"], [role="alert"], .toast, .notification');
  await notification.waitFor({ state: 'visible', timeout });
  return await notification.textContent();
}

/**
 * Uploads a test file for evidence locker.
 *
 * @param page - Playwright Page object
 * @param filename - Name of the file
 * @param content - File content as buffer or string
 * @param mimeType - MIME type of the file
 */
export async function uploadFile(
  page: Page,
  filename: string,
  content: Buffer | string,
  mimeType: string
): Promise<void> {
  const fileInput = page.locator('input[type="file"]');
  const buffer = typeof content === 'string' ? Buffer.from(content) : content;

  await fileInput.setInputFiles({
    name: filename,
    mimeType,
    buffer,
  });
}

/**
 * Verifies that an element contains expected text.
 *
 * @param page - Playwright Page object
 * @param selector - CSS selector or test ID
 * @param text - Expected text content
 * @param timeout - Maximum time to wait (default: 5000ms)
 */
export async function verifyText(
  page: Page,
  selector: string,
  text: string,
  timeout = 5000
): Promise<void> {
  const element = page.locator(selector);
  await element.waitFor({ state: 'visible', timeout });
  const elementText = await element.textContent();
  expect(elementText).toContain(text);
}

/**
 * Checks if a button is disabled.
 *
 * @param page - Playwright Page object
 * @param buttonText - Button text content
 * @returns Promise resolving to true if disabled
 */
export async function isButtonDisabled(page: Page, buttonText: string): Promise<boolean> {
  const button = page.locator(`button:has-text("${buttonText}")`);
  return await button.isDisabled();
}

/**
 * Selects an option from a dropdown by text.
 *
 * @param page - Playwright Page object
 * @param selector - Element selector
 * @param optionText - Option text to select
 */
export async function selectOptionByText(page: Page, selector: string, optionText: string): Promise<void> {
  await page.selectOption(selector, { label: optionText });
}

/**
 * Takes a screenshot with a descriptive filename.
 *
 * @param page - Playwright Page object
 * @param name - Screenshot name (without extension)
 * @note Ensures the test-screenshots directory exists before saving
 */
export async function takeScreenshot(page: Page, name: string): Promise<void> {
  const fs = await import('fs/promises');
  const path = await import('path');

  const screenshotDir = 'test-screenshots';
  const screenshotPath = path.join(screenshotDir, `${name}.png`);

  // Ensure directory exists
  await fs.mkdir(screenshotDir, { recursive: true });

  await page.screenshot({
    path: screenshotPath,
    fullPage: true,
  });
}

/**
 * Clears all browser data (cookies, storage, cache) for a fresh session.
 *
 * @param page - Playwright Page object
 */
export async function clearBrowserData(page: Page): Promise<void> {
  await page.context().clearCookies();
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}

/**
 * Sets a mock response for an API endpoint (useful for testing).
 *
 * @param page - Playwright Page object
 * @param url - API endpoint URL pattern
 * @param response - Mock response data
 */
export async function mockApiResponse(page: Page, url: string, response: unknown): Promise<void> {
  await page.route(url, route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(response),
    });
  });
}
