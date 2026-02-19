/**
 * K6 Smoke Test for BMAD Web UI
 *
 * Story 10.5: Performance Testing
 *
 * Quick smoke test to verify basic functionality under minimal load.
 * This is a lightweight test that runs quickly to catch major issues.
 *
 * Run with: k6 run tests/performance/smoke-test.k6.js
 */

import http from 'k6/http';
import { check } from 'k6';

// Smoke test configuration - low load, short duration
export const options = {
  vus: 5,                // 5 virtual users
  duration: '30s',       // 30 seconds
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% under 500ms
    http_req_failed: ['rate<0.05'],    // Error rate < 5%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:42001';

export default function() {
  const headers = {
    'Content-Type': 'application/json',
  };

  // Test 1: Health check
  const healthRes = http.get(`${BASE_URL}/api/v1/health`, { headers });
  check(healthRes, {
    'health check is accessible': (r) => r.status === 200,
  });

  // Test 2: Agents list
  const agentsRes = http.get(`${BASE_URL}/api/v1/agents`, { headers });
  check(agentsRes, {
    'agents list is accessible': (r) => r.status === 200,
  });

  // Test 3: Test login
  const loginRes = http.post(`${BASE_URL}/api/auth/test-login`,
    JSON.stringify({ email: 'smoke-test@example.com', role: 'USER' }),
    { headers }
  );
  check(loginRes, {
    'test login works': (r) => r.status === 200,
    'test login returns token': (r) => {
      try {
        return JSON.parse(r.body).token !== undefined;
      } catch {
        return false;
      }
    },
  });
}
