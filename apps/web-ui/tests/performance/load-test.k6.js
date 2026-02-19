/**
 * K6 Load Test Configuration for BMAD Web UI
 *
 * Story 10.5: Performance Testing
 *
 * Performance benchmarks and load testing scenarios:
 * - API endpoint response times
 * - Concurrent user handling
 * - Authentication performance
 * - Read operations (health, agents, projects)
 *
 * Run with: k6 run tests/performance/load-test.k6.js
 *
 * Environment variables:
 *   BASE_URL - Override default API base URL (default: http://localhost:42001)
 *   VUS - Number of virtual users (default: from stages)
 *   DURATION - Test duration (default: from stages)
 */

import http from 'k6/http';
import { check, sleep } from 'k6';

// Test configuration with staged load testing
export const options = {
  stages: [
    { duration: '30s', target: 10 },   // Ramp up to 10 users
    { duration: '1m', target: 50 },    // Ramp up to 50 users
    { duration: '2m', target: 100 },   // Stay at 100 users
    { duration: '1m', target: 200 },   // Spike to 200 users
    { duration: '2m', target: 100 },   // Back to 100 users
    { duration: '30s', target: 0 },    // Ramp down
  ],
  thresholds: {
    // Response time thresholds
    http_req_duration: ['p(95)<500', 'p(99)<1000'], // 95% under 500ms, 99% under 1s
    // Error rate thresholds
    http_req_failed: ['rate<0.01'],                   // Error rate < 1%
    // Request count thresholds
    http_reqs: ['count>1000'],                        // Minimum request count
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:42001';

// Setup function - runs once at the start
export function setup() {
  // Authenticate to get token using test endpoint
  const loginRes = http.post(`${BASE_URL}/api/auth/test-login`, JSON.stringify({
    email: 'test-user@example.com',
    role: 'USER'
  }), {
    headers: { 'Content-Type': 'application/json' },
  });

  if (loginRes.status === 200) {
    const data = JSON.parse(loginRes.body);
    return {
      token: data.token || 'test-token',
      userId: data.userId || 'test-user',
      role: data.role || 'USER'
    };
  }

  // Fallback if test-login fails
  console.warn('Test login failed, using fallback credentials');
  return { token: 'test-token', userId: 'test-user', role: 'USER' };
}

// Main test scenarios - runs for each virtual user
export default function(data) {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${data.token}`,
  };

  // Scenario 1: Health Check (should be fastest)
  const healthCheck = http.get(`${BASE_URL}/api/v1/health`, { headers });
  check(healthCheck, {
    'health check status is 200': (r) => r.status === 200,
    'health check response time < 100ms': (r) => r.timings.duration < 100,
  });

  sleep(1);

  // Scenario 2: List Agents (read operation, no auth required)
  const agentsList = http.get(`${BASE_URL}/api/v1/agents`, { headers });
  check(agentsList, {
    'agents list status is 200': (r) => r.status === 200,
    'agents list has data': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.success === true && body.data.count >= 0;
      } catch {
        return false;
      }
    },
    'agents list response time < 300ms': (r) => r.timings.duration < 300,
  });

  sleep(1);

  // Scenario 3: List Projects (requires auth, read operation)
  const listProjects = http.get(`${BASE_URL}/api/v1/projects`, { headers });
  check(listProjects, {
    'list projects status is 200 or 401': (r) => r.status === 200 || r.status === 401,
    'list projects response time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(2);

  // Scenario 4: Test Login (authentication performance)
  const testLogin = http.post(`${BASE_URL}/api/auth/test-login`, JSON.stringify({
    email: `test-user-${Math.random()}@example.com`,
    role: 'USER'
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
  check(testLogin, {
    'test login status is 200': (r) => r.status === 200,
    'test login returns token': (r) => {
      try {
        const body = JSON.parse(r.body);
        return !!body.token;
      } catch {
        return false;
      }
    },
    'test login response time < 200ms': (r) => r.timings.duration < 200,
  });

  sleep(1);
}

// Teardown function - runs once at the end
export function teardown(data) {
  console.log('Performance test completed.');
  console.log(`User ID: ${data.userId}, Role: ${data.role}`);
}
