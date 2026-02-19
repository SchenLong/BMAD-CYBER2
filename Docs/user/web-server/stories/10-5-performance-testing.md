# Story 10.5: Performance Testing

**ID:** 10-5-performance-testing
**Epic:** 10 - Testing & Quality Assurance
**Status:** ready-for-dev
**Priority:** Medium
**Estimate:** 4 hours
**Dependencies:** 10-3-api-integration-tests

---

## DESCRIPTION

Set up K6 for load testing and establish performance benchmarks for the BMAD Web UI API. Load test script already created at `tests/performance/load-test.k6.js`.

## ACCEPTANCE CRITERIA

- [ ] K6 installed and configured
- [ ] Load test script validates API endpoints
- [ ] Performance benchmarks documented
- [ ] Tests can run against staging environment
- [ ] Baseline metrics established

## PERFORMANCE TARGETS

| Metric | Target | Measurement |
|--------|--------|-------------|
| API Response (p95) | < 500ms | k6 HTTP req duration |
| API Response (p99) | < 1000ms | k6 HTTP req duration |
| Error Rate | < 1% | k6 HTTP req failed |
| Concurrent Users | 100+ | k6 stages |
| Page Load | < 2s | Lighthouse |
| Time to Interactive | < 3s | Lighthouse |

## IMPLEMENTATION STEPS

### Step 1: Install K6

```bash
# macOS
brew install k6

# Linux
sudo apt-get install k6

# Or download from https://k6.io/

# Verify installation
k6 version
```

### Step 2: Review Existing Load Test

**File:** `tests/performance/load-test.k6.js`

The test includes:
- Staged load testing (10→50→100→200 users)
- Response time thresholds
- Error rate monitoring

### Step 3: Create Health Check Endpoint

Create `app/api/health/route.ts`:

```typescript
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: Date.now(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
}
```

### Step 4: Create Performance Baseline Test

Create `tests/performance/baseline.k6.js`:

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 10 },  // Warm up
    { duration: '5m', target: 50 },  // Normal load
    { duration: '2m', target: 0 },   // Cool down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    http_req_failed: ['rate<0.01'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:42001';

export default function () {
  // Health check
  let res = http.get(`${BASE_URL}/api/health`);
  check(res, {
    'health check status is 200': (r) => r.status === 200,
    'health check time < 100ms': (r) => r.timings.duration < 100,
  });

  sleep(1);

  // List projects
  res = http.get(`${BASE_URL}/api/projects`, {
    headers: { 'Authorization': `Bearer ${__ENV.TEST_TOKEN}` }
  });
  check(res, {
    'projects list status is 200': (r) => r.status === 200,
    'projects list time < 300ms': (r) => r.timings.duration < 300,
  });

  sleep(2);
}
```

### Step 5: Create API Stress Test

Create `tests/performance/stress.k6.js`:

```javascript
import http from 'k6/http';
import { check, group } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 100 },
    { duration: '3m', target: 100 },
    { duration: '1m', target: 200 },
    { duration: '3m', target: 200 },
    { duration: '1m', target: 0 },
  ],
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:42001';

export default function () {
  group('Authentication Flow', () => {
    const res = http.post(`${BASE_URL}/api/auth/test-login`, JSON.stringify({
      role: 'USER'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
    check(res, { 'auth successful': (r) => r.status === 200 });
  });

  group('API Endpoints', () => {
    const endpoints = [
      '/api/health',
      '/api/agents/roster',
      '/api/workflows',
    ];

    endpoints.forEach(endpoint => {
      const res = http.get(`${BASE_URL}${endpoint}`);
      check(res, {
        [`${endpoint} responds`]: (r) => r.status === 200,
        [`${endpoint} responds in < 500ms`]: (r) => r.timings.duration < 500,
      });
    });
  });
}
```

### Step 6: Create Performance Documentation

Create `docs/testing/PERFORMANCE-BASELINES.md`:

```markdown
# BMAD Web UI - Performance Baselines

**Date Established:** 2025-02-18
**Environment:** Local / Staging

## Baseline Metrics

| Metric | Baseline | Target | Status |
|--------|----------|--------|--------|
| Health Check (p95) | TBD | < 100ms | TBD |
| API Response (p95) | TBD | < 500ms | TBD |
| API Response (p99) | TBD | < 1000ms | TBD |
| Error Rate | TBD | < 1% | TBD |
| Max Concurrent Users | TBD | 100+ | TBD |

## Test Results

### Baseline Test (Date: TBD)
```
k6 run tests/performance/baseline.k6.js
```

Results to be documented after first run.

### Stress Test (Date: TBD)
```
k6 run tests/performance/stress.k6.js
```

Results to be documented after first run.
```

### Step 7: Run Performance Tests

```bash
# Against local (requires dev server running)
export TEST_TOKEN="test-token"
k6 run tests/performance/baseline.k6.js

# Against staging
export BASE_URL=https://staging.bmad.example.com
export TEST_TOKEN=$STAGING_TEST_TOKEN
k6 run tests/performance/baseline.k6.js
```

## FILES TO CREATE

1. `/Users/paultinp/BMAD-CYBER2/team/bmad-web-ui/app/api/health/route.ts`
2. `/Users/paultinp/BMAD-CYBER2/team/bmad-web-ui/tests/performance/baseline.k6.js`
3. `/Users/paultinp/BMAD-CYBER2/team/bmad-web-ui/tests/performance/stress.k6.js`
4. `/Users/paultinp/BMAD-CYBER2/team/bmad-web-ui/docs/testing/PERFORMANCE-BASELINES.md`

## ADD TO PACKAGE.JSON

```json
{
  "scripts": {
    "test:performance": "k6 run tests/performance/baseline.k6.js",
    "test:performance:stress": "k6 run tests/performance/stress.k6.js",
    "test:performance:staging": "BASE_URL=https://staging.bmad.example.com k6 run tests/performance/baseline.k6.js"
  }
}
```

## TESTING

```bash
# Start dev server in background
npm run dev &

# Run baseline test
k6 run tests/performance/baseline.k6.js

# Expected: All thresholds pass
```

## RISKS

| Risk | Mitigation |
|------|------------|
| k6 not installed | Document installation in README |
| Dev server not running | Start server before tests |
| Staging auth fails | Use test token |

## DEFINITION OF DONE

- [ ] K6 installed
- [ ] Health check endpoint created
- [ ] Baseline test runs successfully
- [ ] Stress test runs successfully
- [ ] Baseline metrics documented
- [ ] Tests work against staging
- [ ] `npm run test:performance` works
