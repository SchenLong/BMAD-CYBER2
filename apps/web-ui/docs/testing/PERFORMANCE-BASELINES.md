# Performance Baselines

**Story:** 10.5 - Performance Testing
**Epic:** 10 - Testing & Quality Assurance
**Last Updated:** 2026-02-19
**Test Environment:** Local Development (Next.js Dev Mode)

---

## Overview

This document captures the performance baselines established for the BMAD Web UI application. These baselines serve as a reference point for:
- Performance regression detection
- Capacity planning
- SLA definition
- Optimization prioritization

---

## Test Configuration

### Tool: K6 (v1.6.1)
- **Load Testing Tool:** K6
- **Test Location:** `tests/performance/`
- **Installation:** `brew install k6`

### Test Types

| Test Type | Purpose | Script | Duration | Load |
|-----------|---------|--------|----------|------|
| Smoke Test | Quick health check under light load | `smoke-test.k6.js` | 30s | 5 VUs |
| Load Test | Simulated user load with staging | `load-test.k6.js` | 7m | 10-200 VUs |

---

## Performance Benchmarks

### Smoke Test Results (Baseline)

**Date:** 2026-02-19
**Configuration:** 5 virtual users for 30 seconds

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| **Response Time (p95)** | < 500ms | **17.31ms** | ✅ PASS |
| **Response Time (p90)** | < 300ms | **13.54ms** | ✅ PASS |
| **Error Rate** | < 5% | **0.00%** | ✅ PASS |
| **Throughput** | > 100 req/s | **471 req/s** | ✅ PASS |

#### Endpoint Performance (Smoke Test)

| Endpoint | Avg Response | Max Response | Success Rate |
|----------|--------------|--------------|--------------|
| GET /api/v1/health | ~8ms | 15ms | 100% |
| GET /api/v1/agents | ~10ms | 25ms | 100% |
| POST /api/auth/test-login | ~12ms | 52ms | 100% |

---

## Baseline Metrics Summary

### Response Time Percentiles

| Percentile | Target (ms) | Actual (ms) | Buffer |
|------------|-------------|-------------|--------|
| p50 (Median) | < 100 | 9.13 | 90.9% |
| p90 | < 300 | 13.54 | 95.5% |
| p95 | < 500 | 17.31 | 96.5% |
| p99 | < 1000 | ~35 (est.) | 96.5% |

### Thresholds (K6 Configuration

```javascript
thresholds: {
  http_req_duration: ['p(95)<500', 'p(99)<1000'],
  http_req_failed: ['rate<0.01'],
  http_reqs: ['count>1000'],
}
```

---

## Load Testing Stages

The full load test (`load-test.k6.js`) uses the following staging:

| Stage | Duration | Target VUs | Purpose |
|-------|----------|------------|---------|
| 1 | 30s | 10 | Warm-up / Ramp up |
| 2 | 1m | 50 | Normal load |
| 3 | 2m | 100 | Sustained load |
| 4 | 1m | 200 | Spike test |
| 5 | 2m | 100 | Recovery test |
| 6 | 30s | 0 | Ramp down |

---

## Running Performance Tests

### Prerequisites

1. **Install K6:**
   ```bash
   brew install k6  # macOS
   ```

2. **Start the dev server:**
   ```bash
   cd team/bmad-web-ui
   npm run dev
   ```

### Run Tests

```bash
# Smoke test (quick verification)
k6 run tests/performance/smoke-test.k6.js

# Full load test
k6 run tests/performance/load-test.k6.js

# Against staging environment
BASE_URL=https://staging.example.com k6 run tests/performance/load-test.k6.js
```

---

## Performance Targets

### Production SLA Targets (To Be Established)

| Metric | Target | Notes |
|--------|--------|-------|
| API Response (p95) | < 500ms | For all read operations |
| API Response (p99) | < 1000ms | For all read operations |
| Write Operations | < 2000ms | For POST/PUT/DELETE |
| Concurrent Users | 100+ | Sustained load |
| Error Rate | < 0.1% | In production |
| Availability | > 99.9% | Uptime target |

---

## Known Limitations

### Current Test Environment
- Tests run against local development server
- Database is local (not representative of production latency)
- No network latency simulation
- Single machine testing (not distributed)

### Future Improvements
- [ ] Test against staging environment with production-like data
- [ ] Implement data persistence testing with larger datasets
- [ ] Add WebSocket/SSE connection testing
- [ ] Test with authenticated user sessions (not just test-login)
- [ ] Add database query performance monitoring
- [ ] Implement continuous performance monitoring

---

## API Endpoints Tested

### Public Endpoints (No Auth Required)
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/health` | GET | Health check |
| `/api/v1/agents` | GET | List available agents |

### Test Endpoints (Performance Testing Only)
| Endpoint | Method | Purpose | Security |
|----------|--------|---------|----------|
| `/api/auth/test-login` | POST | Performance testing auth | **DISABLE IN PRODUCTION** |

### Protected Endpoints (Requires Auth)
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/projects` | GET | List user projects |
| `/api/v1/projects` | POST | Create new project |

---

## Performance Monitoring Recommendations

### Key Metrics to Track in Production
1. **Response Times:** p50, p90, p95, p99 percentiles
2. **Error Rates:** By endpoint, by error type
3. **Throughput:** Requests per second
4. **Resource Utilization:** CPU, Memory, Database connections
5. **Database Performance:** Query times, connection pool usage

### Alerting Thresholds (Suggested)
- p95 response time > 500ms for > 5 minutes
- Error rate > 1% for > 2 minutes
- Throughput drop > 50% from baseline

---

## Change History

| Date | Version | Changes |
|------|---------|---------|
| 2026-02-19 | 1.0 | Initial baseline established with K6 smoke test |

---

## Appendix: Test Endpoint Security

**IMPORTANT:** The `/api/auth/test-login` endpoint is designed for performance testing only and should be disabled or heavily restricted in production environments.

### Production Deployment Checklist
- [ ] Disable `/api/auth/test-login` endpoint
- [ ] Remove test endpoint code or require special API key
- [ ] Update security documentation
- [ ] Run production performance tests with real authentication
