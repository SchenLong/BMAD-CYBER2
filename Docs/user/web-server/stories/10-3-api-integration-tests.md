# Story 10.3: API Integration Tests

**ID:** 10-3-api-integration-tests
**Epic:** 10 - Testing & Quality Assurance
**Status:** ready-for-dev
**Priority:** High
**Estimate:** 8 hours
**Dependencies:** 10-1-fix-test-failures

---

## DESCRIPTION

Implement integration tests for all API workflows, validating end-to-end functionality from HTTP request to response. Test file already created at `tests/integration/api-workflows.test.ts` with mock implementations.

## ACCEPTANCE CRITERIA

- [ ] Authentication flow tested (OAuth → session → validation)
- [ ] Project CRUD operations tested
- [ ] Agent invocation API tested
- [ ] CLI command execution API tested
- [ ] File upload security tested
- [ ] Rate limiting validated
- [ ] Tests can run via `npm run test:integration`

## IMPLEMENTATION STEPS

### Step 1: Set Up Test Database

Create or update `prisma/schema.test.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = "file:./test.db"
}

model User {
  id            String    @id @default(uuid())
  email         String    @unique
  name          String?
  role          UserRole  @default(USER)
  sessions      Session[]
  projects      Project[]
  createdAt     DateTime  @default(now())
}

model Session {
  id           String   @id @default(uuid())
  userId       String
  user         User     @relation(fields: [userId], references: [id])
  token        String   @unique
  expiresAt    DateTime
  createdAt    DateTime @default(now())
}

model Project {
  id          String   @id @default(uuid())
  name        String
  type        String
  team        String
  createdById String
  createdBy   User     @relation(fields: [createdById], references: [id])
  createdAt   DateTime @default(now())
}

enum UserRole {
  SUPERADMIN
  ADMIN
  USER
  READONLY
  API
}
```

Add to `.env.test`:
```
DATABASE_URL="file:./test.db"
NODE_ENV="test"
```

### Step 2: Create Test API Helpers

Create `tests/helpers/test-api.ts`:

```typescript
import { createMocks } from 'node-mocks-http';

export interface TestAuthContext {
  token: string;
  userId: string;
  email: string;
  role: string;
}

export async function createTestUser(options: {
  role: string;
  email?: string;
}): Promise<TestAuthContext> {
  const userId = `test-user-${Date.now()}`;
  const token = Buffer.from(JSON.stringify({
    userId,
    email: options.email || `test-${Date.now()}@example.com`,
    role: options.role,
    exp: Math.floor(Date.now() / 1000) + 3600
  })).toString('base64');

  return {
    token,
    userId,
    email: options.email || `test-${Date.now()}@example.com`,
    role: options.role
  };
}

export async function createTestProject(userId: string, name: string) {
  return {
    id: `project-${Date.now()}`,
    name,
    createdById: userId,
    type: 'test',
    createdAt: new Date().toISOString()
  };
}

export async function setupTestDatabase() {
  // Initialize test database schema
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient({
    datasources: {
      db: { url: process.env.DATABASE_URL }
    }
  });

  // Run migrations or seed data
  await prisma.$connect();
  return prisma;
}

export async function teardownTestDatabase() {
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  await prisma.$disconnect();
}
```

### Step 3: Create Test Authentication Endpoint

Create `app/api/test/auth/route.ts` (test-only endpoint):

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';

export async function POST(request: NextRequest) {
  // Only allow in test environment
  if (process.env.NODE_ENV !== 'test') {
    return NextResponse.json({ error: 'Not allowed' }, { status: 403 });
  }

  const { role, email } = await request.json();

  const secret = new TextEncoder().encode(
    process.env.JWT_SECRET || 'test-secret'
  );

  const token = await new SignJWT({
    userId: `test-user-${Date.now()}`,
    email: email || `test@example.com`,
    role: role || 'USER'
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('1h')
    .sign(secret);

  return NextResponse.json({
    token,
    userId: 'test-user',
    email: email || 'test@example.com'
  });
}
```

### Step 4: Update Integration Tests

Edit `tests/integration/api-workflows.test.ts`:

1. Replace mock `fetch` calls with actual API route testing
2. Use Next.js `createMocks` for request/response testing
3. Connect to test database for data persistence tests

Example update:

```typescript
import { POST } from '@/app/api/test/auth/route';

describe('Authentication Flow', () => {
  it('should create test session', async () => {
    const request = new Request('http://localhost:42001/api/test/auth', {
      method: 'POST',
      body: JSON.stringify({ role: 'USER' })
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.token).toBeDefined();
  });
});
```

### Step 5: Create Project API Integration Test

Create `tests/integration/project-api.test.ts`:

```typescript
import { POST, GET, PATCH, DELETE } from '@/app/api/projects/route';
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';

describe('Project API Integration', () => {
  let authToken: string;
  let testUserId: string;

  beforeEach(async () => {
    // Setup test user
    const authResponse = await fetch('http://localhost:42001/api/test/auth', {
      method: 'POST',
      body: JSON.stringify({ role: 'USER' })
    });
    const auth = await authResponse.json();
    authToken = auth.token;
    testUserId = auth.userId;
  });

  it('should create project', async () => {
    const response = await fetch('http://localhost:42001/api/projects', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Test Project',
        type: 'incident-response',
        team: 'intel'
      })
    });

    expect(response.status).toBe(201);
    const project = await response.json();
    expect(project.name).toBe('Test Project');
  });

  it('should list projects', async () => {
    const response = await fetch('http://localhost:42001/api/projects', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    expect(response.status).toBe(200);
    const projects = await response.json();
    expect(Array.isArray(projects)).toBe(true);
  });
});
```

### Step 6: Run Integration Tests

```bash
cd /Users/paultinp/BMAD-CYBER2/team/bmad-web-ui
npm run test:integration
```

## FILES TO CREATE/MODIFY

1. `/Users/paultinp/BMAD-CYBER2/team/bmad-web-ui/prisma/schema.test.prisma` - Create
2. `/Users/paultinp/BMAD-CYBER2/team/bmad-web-ui/.env.test` - Create
3. `/Users/paultinp/BMAD-CYBER2/team/bmad-web-ui/tests/helpers/test-api.ts` - Create
4. `/Users/paultinp/BMAD-CYBER2/team/bmad-web-ui/app/api/test/auth/route.ts` - Create
5. `/Users/paultinp/BMAD-CYBER2/team/bmad-web-ui/tests/integration/api-workflows.test.ts` - Update
6. `/Users/paultinp/BMAD-CYBER2/team/bmad-web-ui/tests/integration/project-api.test.ts` - Create

## TESTING

```bash
# Run integration tests
npm run test:integration

# Expected: All API workflow tests pass
```

## RISKS

| Risk | Mitigation |
|------|------------|
| Test database not isolated | Use separate test.db file |
| API routes not implemented | Create mock responses |
| Authentication tests fail | Use test auth endpoint |

## DEFINITION OF DONE

- [ ] Test database schema created
- [ ] Test helpers created
- [ ] Test auth endpoint created
- [ ] All integration tests pass
- [ ] Tests can run independently
- [ ] `npm run test:integration` works
