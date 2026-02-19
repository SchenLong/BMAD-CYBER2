# Pre-Release Testing Checklist

**Project:** BMAD Web UI / Web Server
**Version:** 1.0.0
**Last Updated:** 2026-02-19

---

## INDEX

| Section | Description |
|---------|-------------|
| [Before Every Release](#before-every-release) | Required pre-release tasks |
| [Security Verification](#security-verification) | Security testing requirements |
| [Performance Verification](#performance-verification) | Performance benchmarks |
| [Documentation](#documentation) | Documentation updates |
| [Sign-Off Process](#sign-off-process) | Release approval |

---

## BEFORE EVERY RELEASE

### Automated Tests

- [ ] **All unit tests pass** (`npm test`)
  - Test Suites: 36 passed
  - Tests: 921 passed
  - Zero failures allowed

- [ ] **All security tests pass** (`npm run test:security`)
  - OWASP Top 10: 41/41 pass
  - Prompt injection: All tests pass
  - Authentication: All tests pass
  - Authorization: All tests pass

- [ ] **All integration tests pass** (`npm run test:integration`)
  - API workflows: 51/51 pass
  - Authentication flow: All tests pass

- [ ] **Coverage meets targets** (`npm run test:coverage`)
  - Security modules: 90%+
  - Authentication: 85%+
  - CLI Bridge: 80%+
  - Overall: 80%+

### Code Quality

- [ ] **No linting errors** (`npm run lint`)
  - ESLint: Zero errors
  - TypeScript: Zero type errors

- [ ] **No new npm vulnerabilities** (`npm audit`)
  - Critical vulnerabilities: 0
  - High vulnerabilities: 0
  - Moderate vulnerabilities: Documented if acceptable

- [ ] **Build succeeds** (`npm run build`)
  - Production build completes
  - No build warnings

### E2E Tests

- [ ] **All E2E tests pass** (`npm run test:e2e`)
  - Basic setup: 20/20 pass
  - User journeys: All tests pass

### Performance Tests

- [ ] **Smoke test passes** (`npm run test:perf:smoke`)
  - Response time (p95): < 500ms
  - Error rate: < 5%
  - Throughput: > 100 req/s

---

## SECURITY VERIFICATION

### OWASP Top 10 Compliance

| Category | Test File | Status |
|----------|-----------|--------|
| A01: Broken Access Control | owasp-top10.test.ts | [ ] Pass |
| A02: Cryptographic Failures | owasp-top10.test.ts | [ ] Pass |
| A03: Injection | owasp-top10.test.ts | [ ] Pass |
| A04: Insecure Design | owasp-top10.test.ts | [ ] Pass |
| A05: Security Misconfiguration | owasp-top10.test.ts | [ ] Pass |
| A06: Vulnerable Components | owasp-top10.test.ts | [ ] Pass |
| A07: Authentication Failures | owasp-top10.test.ts | [ ] Pass |
| A08: Data Integrity Failures | owasp-top10.test.ts | [ ] Pass |
| A09: Logging Failures | owasp-top10.test.ts | [ ] Pass |
| A10: SSRF | owasp-top10.test.ts | [ ] Pass |

### Security Best Practices

- [ ] **No hardcoded secrets in code**
  - Check for: API keys, tokens, passwords
  - Use: Environment variables

- [ ] **Environment variables documented**
  - All required env vars listed in .env.example
  - Sensitive vars marked as required

- [ ] **Authentication flows tested**
  - OAuth login/logout
  - Session management
  - Token refresh

- [ ] **Authorization tested for all roles**
  - SUPERADMIN: All access
  - ADMIN: Team management
  - USER: Limited access
  - READONLY: View only
  - API: API access only

- [ ] **Input validation tested**
  - Command injection prevention
  - SQL injection prevention
  - XSS prevention
  - Path traversal blocking

- [ ] **Rate limiting tested**
  - Per-user limits enforced
  - Per-hour limits enforced
  - Distributed attacks prevented

- [ ] **CLI bridge security tested**
  - Command whitelist enforced
  - Role-based command permissions
  - Process isolation working
  - Output sanitization working

---

## PERFORMANCE VERIFICATION

### API Benchmarks

| Endpoint | Metric | Target | Actual | Status |
|----------|--------|--------|--------|--------|
| GET /api/v1/health | Response time (p95) | < 100ms | ___ ms | [ ] |
| GET /api/v1/projects | Response time (p95) | < 500ms | ___ ms | [ ] |
| POST /api/v1/projects | Response time (p95) | < 500ms | ___ ms | [ ] |
| SSE /api/sse | Latency | < 100ms | ___ ms | [ ] |

### Load Test Results

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Concurrent users | 100+ | ___ | [ ] |
| Requests per second | > 100 | ___ | [ ] |
| Error rate | < 5% | ___ % | [ ] |
| Memory usage | < 2GB | ___ | [ ] |

### Performance Regression Check

- [ ] No new performance regressions
- [ ] Response times within acceptable range
- [ ] No memory leaks detected
- [ ] Page load times acceptable

---

## DOCUMENTATION

### Required Updates

- [ ] **README updated** with new features
- [ ] **API documentation updated** (OpenAPI/Swagger)
- [ ] **Test documentation updated** (this file)
- [ ] **Changelog updated** with release notes

### User Documentation

- [ ] **User guides updated** (if UI changes)
- [ ] **FAQ updated** (if common issues)
- [ ] **Migration guide** (if breaking changes)

### Developer Documentation

- [ ] **Technical specs updated**
- [ ] **Architecture diagrams updated**
- [ ] **API examples updated**

---

## UAT VERIFICATION

### UAT Sign-Off

Before production release:
- [ ] UAT test scenarios executed
- [ ] UAT results documented
- [ ] Stakeholder sign-off obtained
- [ ] Critical issues resolved

### Role-Based Testing

- [ ] **SuperAdmin** scenarios tested
- [ ] **Admin** scenarios tested
- [ ] **User** scenarios tested
- [ ] **ReadOnly** scenarios tested

---

## CI/CD VERIFICATION

### Pipeline Status

- [ ] **CI pipeline passes** on release branch
- [ ] **All builds successful**
- [ ] **All deployments successful**

### Required Checks

- [ ] Security Tests: ✅
- [ ] Unit Tests: ✅
- [ ] Integration Tests: ✅
- [ ] E2E Tests: ✅
- [ ] Coverage Threshold: ✅
- [ ] Lint: ✅
- [ ] Build: ✅

---

## SIGN-OFF PROCESS

### Pre-Release Review

1. **Complete checklist above**
2. **Create release notes**
3. **Tag release version**
4. **Create GitHub Release**

### Approval Chain

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Developer | ___________________ | _____________ | _____ |
| QA Lead | ___________________ | _____________ | _____ |
| Tech Lead | ___________________ | _____________ | _____ |
| Product Owner | ___________________ | _____________ | _____ |

### Go/No-Go Decision

**Release Version:** ___________

**Go/No-Go:** [ ] GO [ ] NO-GO

**Reasoning:**
_________________________________________________
_________________________________________________
_________________________________________________

### Release Notes Template

```markdown
# Release [Version] - [Date]

## Summary
[Brief description of release]

## Features
- [Feature 1]
- [Feature 2]

## Fixes
- [Bug fix 1]
- [Bug fix 2]

## Security
- [Security update 1]

## Performance
- [Performance improvement 1]

## Breaking Changes
- [Breaking change details]

## Migration Notes
- [Migration instructions]

## Known Issues
- [Known issue 1]
```

---

## ROLLLBACK PROCEDURES

If critical issues found post-release:

1. **Stop deployment** immediately
2. **Assess impact** and severity
3. **Create hotfix branch**
4. **Test hotfix** thoroughly
5. **Deploy hotfix** to production
6. **Monitor** for issues

### Rollback Decision Matrix

| Severity | Action | Timeframe |
|----------|--------|-----------|
| Critical (Security) | Immediate rollback | < 15 minutes |
| Critical (Data Loss) | Immediate rollback | < 15 minutes |
| High | Rollback or hotfix | < 1 hour |
| Medium | Hotfix | < 24 hours |
| Low | Next release | Scheduled |

---

**Document Status:** Active
**Last Updated:** 2026-02-19
**Maintained By:** Release Manager
