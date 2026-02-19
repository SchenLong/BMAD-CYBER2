# Story 10.4: End-to-End Testing Setup

**ID:** 10-4-e2e-testing-setup
**Epic:** 10 - Testing & Quality Assurance
**Status:** ready-for-dev
**Priority:** High
**Estimate:** 6 hours
**Dependencies:** 10-1-fix-test-failures

---

## DESCRIPTION

Set up Playwright for end-to-end testing of critical user journeys. Test scenarios already documented in `tests/e2e/user-journeys.spec.ts`. This story focuses on installation and configuration.

## ACCEPTANCE CRITERIA

- [ ] Playwright installed and configured
- [ ] Browsers installed (Chromium, Firefox, WebKit)
- [ ] Test server can start in test mode
- [ ] At least 3 critical E2E scenarios pass
- [ ] E2E tests can run via `npx playwright test`

## IMPLEMENTATION STEPS

### Step 1: Install Playwright

```bash
cd /Users/paultinp/BMAD-CYBER2/team/bmad-web-ui
npm install -D @playwright/test
npx playwright install
```

### Step 2: Create Playwright Configuration

Create `playwright.config.ts`:

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['junit', { outputFile: 'test-results/junit.xml' }]
  ],
  use: {
    baseURL: 'http://localhost:42001',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:42001',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
```

### Step 3: Create E2E Test Helpers

Create `tests/e2e/helpers/auth.ts`:

```typescript
import { Page, expect } from '@playwright/test';

export async function login(page: Page, role: string = 'USER') {
  // Navigate to test auth endpoint
  await page.goto('/api/auth/test-login?role=' + role);
  // Wait for redirect to dashboard
  await page.waitForURL('/dashboard', { timeout: 5000 });
  // Verify we're logged in
  await expect(page.locator('h1:has-text("Dashboard")')).toBeVisible();
}

export async function logout(page: Page) {
  await page.click('[data-testid="user-menu"]');
  await page.click('text=Logout');
  await page.waitForURL('/login');
}

export async function createProject(page: Page, name: string, type: string) {
  await page.click('button:has-text("New Project")');
  await page.fill('[name="name"]', name);
  await page.selectOption('[name="type"]', type);
  await page.selectOption('[name="team"]', 'intel');
  await page.click('button:has-text("Create")');
  await page.waitForSelector(`h1:has-text("${name}")`);
}
```

Create `tests/e2e/helpers/test-data.ts`:

```typescript
export const testUsers = {
  superadmin: { email: 'uat-superadmin@bmad.test', role: 'SUPERADMIN' },
  admin: { email: 'uat-admin@bmad.test', role: 'ADMIN' },
  user: { email: 'uat-user@bmad.test', role: 'USER' },
  readonly: { email: 'uat-readonly@bmad.test', role: 'READONLY' },
};

export const testProjects = {
  incident: { name: 'Test Incident', type: 'incident-response' },
  pentest: { name: 'Test Pen Test', type: 'penetration-test' },
  intel: { name: 'Test Intel', type: 'intel-assessment' },
};
```

### Step 4: Update Test Environment Variables

Add to `.env.test`:
```
# E2E Testing
NEXT_PUBLIC_E2E_MODE=true
NEXT_PUBLIC_TEST_MODE=true
```

### Step 5: Create Test Authentication Endpoint

Create `app/api/test/auth/route.ts` for E2E testing:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';

export async function GET(request: NextRequest) {
  // Only allow in test mode
  if (process.env.NODE_ENV !== 'test' && !process.env.NEXT_PUBLIC_E2E_MODE) {
    return NextResponse.json({ error: 'Not allowed' }, { status: 403 });
  }

  const searchParams = request.nextUrl.searchParams;
  const role = searchParams.get('role') || 'USER';
  const newUser = searchParams.get('new') === 'true';

  const secret = new TextEncoder().encode(
    process.env.JWT_SECRET || 'test-secret'
  );

  const userId = `test-user-${role.toLowerCase()}-${Date.now()}`;
  const token = await new SignJWT({
    userId,
    email: `test-${role.toLowerCase()}@bmad.test`,
    role: role.toUpperCase(),
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .sign(secret);

  // Set session cookie
  const response = NextResponse.redirect(new URL('/dashboard', request.url));
  response.cookies.set('session-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 24 hours
  });

  return response;
}
```

### Step 6: Simplify E2E Tests

Update `tests/e2e/user-journeys.spec.ts` to use helpers:

```typescript
import { test, expect } from '@playwright/test';
import { login } from './helpers/auth';

test.describe('User Onboarding', () => {
  test('new user completes onboarding', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Sign In');
    await page.goto('/api/auth/test-login?role=USER&new=true');
    await page.waitForSelector('[data-testid="onboarding-wizard"]');
    await page.click('button:has-text("Get Started")');
    // ... continue test
  });
});
```

### Step 7: Run E2E Tests

```bash
# Run all E2E tests
npx playwright test

# Run with UI (for debugging)
npx playwright test --ui

# Run specific test
npx playwright test --grep "onboarding"
```

## FILES TO CREATE

1. `/Users/paultinp/BMAD-CYBER2/team/bmad-web-ui/playwright.config.ts`
2. `/Users/paultinp/BMAD-CYBER2/team/bmad-web-ui/tests/e2e/helpers/auth.ts`
3. `/Users/paultinp/BMAD-CYBER2/team/bmad-web-ui/tests/e2e/helpers/test-data.ts`
4. `/Users/paultinp/BMAD-CYBER2/team/bmad-web-ui/app/api/test/auth/route.ts`

## FILES TO MODIFY

1. `/Users/paultinp/BMAD-CYBER2/team/bmad-web-ui/tests/e2e/user-journeys.spec.ts`
2. `/Users/paultinp/BMAD-CYBER2/team/bmad-web-ui/.env.test`

## TESTING

```bash
# Install browsers
npx playwright install

# Run tests (headed for debugging)
npx playwright test --headed

# Run tests in UI mode
npx playwright test --ui

# Expected: At least 3 critical scenarios pass
```

## ADD E2E SCRIPT TO PACKAGE.JSON

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug"
  }
}
```

## RISKS

| Risk | Mitigation |
|------|------------|
| Playwright browsers not available | Run `npx playwright install` |
| Dev server not starting | Check port 42001 availability |
| Flaky tests due to timing | Add proper `waitForSelector` calls |

## DEFINITION OF DONE

- [ ] Playwright installed
- [ ] Configuration created
- [ ] Test helpers created
- [ ] Test auth endpoint created
- [ ] At least 3 E2E scenarios pass
- [ ] `npm run test:e2e` works
- [ ] Documentation updated
