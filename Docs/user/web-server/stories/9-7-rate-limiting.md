# Story 9.7: Rate Limiting

**Status:** ready-for-dev
**Epic:** Epic 9 - Security Hardening
**Story ID:** 9.7
**Story Key:** 9-7-rate-limiting
**Dependencies:** Story 1.1 (Project Scaffold)

---

## Story

**As a** Security Architect,
**I want** rate limiting at multiple levels,
**So that** the system is protected from abuse and DoS.

---

## Acceptance Criteria

**Given** the rate limiting middleware
**When** requests exceed limits
**Then** enforce 100 requests per minute per user
**And** enforce 1000 requests per hour per user
**And** enforce 10 failed auth attempts per IP per minute
**And** enforce 5 failed auth attempts per user per minute
**And** return 429 status with Retry-After header
**And** use Redis-backed storage for distributed rate limiting
**And** log rate limit violations for monitoring

---

## Tasks / Subtasks

- [ ] **Task 1: Install Rate Limiting Dependencies** (AC: Given - rate limiting middleware)
  - [ ] Install upstash/ratelimit or @upstash/redis
  - [ ] Install ioredis for Redis client
  - [ ] Create rate limiting configuration
  - [ ] Set up Redis connection (optional for development)

- [ ] **Task 2: Create Rate Limiter Core** (AC: When - requests exceed limits)
  - [ ] Create `src/lib/rate-limiting/limiter.ts`
  - [ ] Define RateLimit type (limit, window, key)
  - [ ] Create RateLimiter class
  - [ ] Implement sliding window counter algorithm
  - [ ] Implement token bucket algorithm (for burst allowance)
  - [ ] Support both in-memory and Redis backends

- [ ] **Task 3: Implement User Rate Limits** (AC: Then - 100 req/min, 1000 req/hour per user)
  - [ ] Define user rate limits
  - [ ] Create userRateLimiter instance (100/minute)
  - [ ] Create userHourlyRateLimiter instance (1000/hour)
  - [ ] Implement user identification (session token, API key)
  - [ ] Create middleware for user rate limiting

- [ ] **Task 4: Implement IP Rate Limits** (AC: And - 10 failed auth per IP per minute)
  - [ ] Define IP-based rate limits
  - [ ] Create ipAuthRateLimiter instance (10/minute)
  - [ ] Implement IP extraction (x-forwarded-for, x-real-ip)
  - [ ] Create middleware for IP rate limiting
  - [ ] Handle IPv6 addresses

- [ ] **Task 5: Implement Per-User Auth Limits** (AC: And - 5 failed auth per user per minute)
  - [ ] Define per-user auth rate limits
  - [ ] Create userAuthRateLimiter instance (5/minute)
  - [ ] Track failed login attempts by email/username
  - [ ] Reset on successful login
  - [ ] Create middleware for auth rate limiting

- [ ] **Task 6: Create HTTP Response** (AC: And - return 429 with Retry-After)
  - [ ] Return 429 Too Many Requests status
  - [ ] Calculate Retry-After header value
  - [ ] Include rate limit info in response body
  - [ ] Add rate limit headers to successful requests (X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset)

- [ ] **Task 7: Implement Redis Backend** (AC: And - Redis-backed storage)
  - [ ] Create Redis client configuration
  - [ ] Implement Redis-based counter
  - [ ] Handle Redis connection errors
  - [ ] Fallback to in-memory for development
  - [ ] Support distributed deployments

- [ ] **Task 8: Implement Logging** (AC: And - log violations for monitoring)
  - [ ] Create rate limit violation logger
  - [ ] Log with timestamp, identifier, limit exceeded
  - [ ] Log to audit trail
  - [ ] Send alerts for repeated violations
  - [ ] Create metrics for monitoring

- [ ] **Task 9: Create Middleware Integration** (AC: Given - middleware)
  - [ ] Create `src/middleware/rate-limit.ts`
  - [ ] Integrate user rate limiting
  - [ ] Integrate auth rate limiting
  - [ ] Integrate IP rate limiting
  - [ ] Configure route matching
  - [ ] Add to root middleware chain

- [ ] **Task 10: Write Unit Tests** (AC: All)
  - [ ] Test sliding window algorithm
  - [ ] Test rate limit enforcement
  - [ ] Test Retry-After header calculation
  - [ ] Test Redis backend
  - [ ] Test in-memory fallback
  - [ ] Test IP extraction

- [ ] **Task 11: Write Integration Tests** (AC: All)
  - [ ] Test user rate limiting
  - [ ] Test auth rate limiting
  - [ ] Test IP rate limiting
  - [ ] Test distributed scenarios
  - [ ] Test 429 response format

- [ ] **Task 12: Documentation & Verification** (AC: All)
  - [ ] Document rate limit tiers
  - [ ] Create configuration guide
  - [ ] Document Redis setup
  - [ ] Create rate limit bypass guide (for testing)
  - [ ] Document monitoring and alerting
  - [ ] Run test suite to verify 100% pass rate

---

## Dev Notes

### Architecture Patterns & Constraints

**Rate Limiting Tiers:**

| Tier | Limit | Window | Key | Purpose |
|------|-------|--------|-----|---------|
| User | 100 | 1 minute | User ID | General API usage |
| User | 1000 | 1 hour | User ID | Burst allowance |
| Auth IP | 10 | 1 minute | IP | Failed login attempts (IP) |
| Auth User | 5 | 1 minute | Email/Username | Failed login attempts (user) |
| Global | 10000 | 1 minute | * | System-wide protection |

**Algorithms:**
- **Sliding Window**: Accurate rate limiting
- **Token Bucket**: Allows bursts
- **Fixed Window**: Simple but has edge cases

**Storage Options:**
- Redis (production, distributed)
- In-memory (development, single instance)
- Hybrid (Redis with in-memory fallback)

### File Structure Requirements

**Must-Create Files:**
1. `src/lib/rate-limiting/limiter.ts` - Core rate limiter
2. `src/lib/rate-limiting/storage.ts` - Storage backends
3. `src/lib/rate-limiting/middleware.ts` - Middleware factory
4. `src/middleware/rate-limit.ts` - Next.js middleware
5. `src/lib/rate-limiting/config.ts` - Configuration
6. `tests/rate-limiting/limiter.test.ts` - Unit tests
7. `tests/rate-limiting/middleware.test.ts` - Integration tests

**Configuration File:**
```typescript
// src/lib/rate-limiting/config.ts
export const RATE_LIMITS = {
  user: {
    perMinute: 100,
    perHour: 1000,
  },
  auth: {
    perIpPerMinute: 10,
    perUserPerMinute: 5,
  },
  global: {
    perMinute: 10000,
  },
}
```

### Testing Requirements

**Rate Limiting Tests:**
```typescript
describe('Rate Limiter', () => {
  it('should allow requests within limit', async () => {
    const limiter = new RateLimiter({ limit: 10, window: 60000 })
    for (let i = 0; i < 10; i++) {
      const result = await limiter.check('user-123')
      expect(result.allowed).toBe(true)
    }
  })

  it('should block requests exceeding limit', async () => {
    const limiter = new RateLimiter({ limit: 10, window: 60000 })
    for (let i = 0; i < 10; i++) {
      await limiter.check('user-123')
    }
    const result = await limiter.check('user-123')
    expect(result.allowed).toBe(false)
  })

  it('should calculate correct Retry-After', async () => {
    const limiter = new RateLimiter({ limit: 1, window: 60000 })
    await limiter.check('user-123')
    const result = await limiter.check('user-123')
    expect(result.retryAfter).toBeGreaterThan(0)
    expect(result.retryAfter).toBeLessThanOrEqual(60)
  })
})
```

**Integration Tests:**
```typescript
describe('Rate Limiting Middleware', () => {
  it('should return 429 when user exceeds limit', async () => {
    // Make 101 requests
    for (let i = 0; i < 101; i++) {
      await fetch('/api/test', { headers: { 'x-user-id': 'user-123' } })
    }
    const response = await fetch('/api/test', { headers: { 'x-user-id': 'user-123' } })
    expect(response.status).toBe(429)
    expect(response.headers.get('Retry-After')).toBeTruthy()
  })
})
```

### Security Considerations

**Rate Limit Evasion:**
- Track by user ID, not just IP (IP spoofing)
- Handle multiple users behind NAT
- Consider API key-based limiting
- Implement gradual backoff for repeat offenders

**Distributed Rate Limiting:**
- Use Redis for shared state
- Handle Redis failures gracefully
- Use consistent hashing for key distribution
- Consider geo-distributed Redis

**DoS Protection:**
- Global rate limit as last resort
- Prioritize authenticated users over anonymous
- Implement circuit breakers
- Monitor for attacks

---

## Dev Agent Guardrails

### Technical Requirements

**RateLimiter Interface:**
```typescript
interface RateLimitConfig {
  limit: number
  window: number // milliseconds
  key?: string | ((req: NextRequest) => string)
}

interface RateLimitResult {
  allowed: boolean
  limit: number
  remaining: number
  reset: Date
  retryAfter?: number
}

class RateLimiter {
  constructor(config: RateLimitConfig)
  async check(identifier: string): Promise<RateLimitResult>
  async reset(identifier: string): Promise<void>
}
```

**Middleware Factory:**
```typescript
function createRateLimitMiddleware(limiter: RateLimiter) {
  return async (req: NextRequest): Promise<NextResponse | null> => {
    const identifier = getIdentifier(req)
    const result = await limiter.check(identifier)

    if (!result.allowed) {
      return createRateLimitResponse(result)
    }

    // Add rate limit headers to successful responses
    const response = NextResponse.next()
    response.headers.set('X-RateLimit-Limit', result.limit.toString())
    response.headers.set('X-RateLimit-Remaining', result.remaining.toString())
    response.headers.set('X-RateLimit-Reset', result.reset.toISOString())

    return null // Pass through
  }
}
```

**Response Format:**
```typescript
function createRateLimitResponse(result: RateLimitResult): NextResponse {
  return NextResponse.json(
    {
      error: 'Too Many Requests',
      retryAfter: result.retryAfter,
      limit: result.limit,
      reset: result.reset,
    },
    {
      status: 429,
      headers: {
        'Retry-After': result.retryAfter?.toString() || '60',
        'X-RateLimit-Limit': result.limit.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': result.reset.toISOString(),
      }
    }
  )
}
```

### Architecture Compliance

**Sliding Window Algorithm:**
```typescript
class SlidingWindowLimiter {
  private requests: Map<string, number[]> = new Map()

  async check(identifier: string, limit: number, window: number): Promise<RateLimitResult> {
    const now = Date.now()
    const windowStart = now - window

    // Get existing requests for this identifier
    let userRequests = this.requests.get(identifier) || []

    // Remove requests outside the window
    userRequests = userRequests.filter(time => time > windowStart)

    // Check if limit exceeded
    if (userRequests.length >= limit) {
      const oldestRequest = userRequests[0]
      const retryAfter = Math.ceil((oldestRequest + window - now) / 1000)
      return {
        allowed: false,
        limit,
        remaining: 0,
        reset: new Date(oldestRequest + window),
        retryAfter,
      }
    }

    // Add current request
    userRequests.push(now)
    this.requests.set(identifier, userRequests)

    return {
      allowed: true,
      limit,
      remaining: limit - userRequests.length,
      reset: new Date(now + window),
    }
  }
}
```

**Redis Backend:**
```typescript
import { Redis } from 'ioredis'

class RedisRateLimiter {
  constructor(private redis: Redis) {}

  async check(identifier: string, limit: number, window: number): Promise<RateLimitResult> {
    const key = `ratelimit:${identifier}`
    const now = Date.now()
    const windowStart = now - window

    // Remove old entries
    await this.redis.zremrangebyscore(key, 0, windowStart)

    // Count current requests
    const count = await this.redis.zcard(key)

    if (count >= limit) {
      // Get oldest request time
      const oldest = await this.redis.zrange(key, 0, 0, 'WITHSCORES')
      const oldestTime = parseInt(oldest[1])
      const retryAfter = Math.ceil((oldestTime + window - now) / 1000)

      return {
        allowed: false,
        limit,
        remaining: 0,
        reset: new Date(oldestTime + window),
        retryAfter,
      }
    }

    // Add current request
    await this.redis.zadd(key, now, `${now}-${Math.random()}`)
    await this.redis.expire(key, Math.ceil(window / 1000))

    return {
      allowed: true,
      limit,
      remaining: limit - count - 1,
      reset: new Date(now + window),
    }
  }
}
```

### Library/Framework Requirements

**Dependencies:**
```json
{
  "dependencies": {
    "ioredis": "^5.3.0",
    "@upstash/redis": "^1.25.0"
  }
}
```

**Environment Variables:**
```bash
# Redis configuration
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=
UPSTASH_REDIS_REST_URL=

# Rate limiting configuration
RATE_LIMIT_ENABLED=true
RATE_LIMIT_MODE=production # production, development, disabled
```

### File Structure Requirements

**Export Structure:**
```typescript
// src/lib/rate-limiting/index.ts
export { RateLimiter } from './limiter'
export { SlidingWindowLimiter, TokenBucketLimiter } from './algorithms'
export { RedisStorage, MemoryStorage } from './storage'
export { createRateLimitMiddleware } from './middleware'
export { RATE_LIMITS } from './config'

// src/middleware/rate-limit.ts
export { rateLimitMiddleware } from './rate-limit'
```

### Testing Requirements

**Test Structure:**
```typescript
describe('Rate Limiting', () => {
  describe('Algorithms', () => {
    it('should implement sliding window correctly')
    it('should implement token bucket correctly')
  })

  describe('Storage', () => {
    it('should use Redis in production')
    it('should fallback to memory if Redis unavailable')
  })

  describe('Middleware', () => {
    it('should apply user rate limits')
    it('should apply auth rate limits')
    it('should return 429 with correct headers')
  })
})
```

---

## Project Context Reference

**Project:** BMAD Web Server with Full UI
**Epic:** Security Hardening (Epic 9)

**Rate Limiting Strategy:**
- Protect against brute force attacks (auth endpoints)
- Prevent API abuse (general endpoints)
- Protect system resources (global limits)
- Allow legitimate bursts (token bucket)

**Integration Points:**
- Story 9.2: Prompt injection rate limiting
- Story 9.4: Audit logging for violations
- Story 9.5: CORS and security headers

**Monitoring:**
- Log rate limit violations
- Alert on repeated violations
- Track per-user usage patterns
- Monitor system-wide limits

---

## Story Completion Status

**Status:** ready-for-dev
**Context Analysis:** Complete
**All Required Documentation:** Loaded and analyzed
**Developer Guardrails:** Established
**Next Step:** Run `dev-story` workflow for implementation

---

## References

**Source Documents:**
- [Security Deep Dive](../11-security-deep-dive.md#6-security-monitoring--incident-response) - Monitoring context
- [Architecture & Security](../02-architecture-security.md) - Security architecture overview
- [Epic 9 Details](../epics.md#story-97-rate-limiting) - Story requirements

**Story Breakdown Reference:**
- Epic 9: Security Hardening - [epics.md#epic-9](../epics.md#epic-9-security-hardening)
- Story 9.7 Details - [epics.md#story-97-rate-limiting](../epics.md#story-97-rate-limiting)

**Depends On:**
- Story 1.1: Project Scaffold & Base Configuration

**Related Stories:**
- Story 9.2: Prompt Injection Middleware (uses rate limiting)
- Story 9.4: Comprehensive Audit Logging (logs violations)

---

## Dev Agent Record

### Agent Model Used
*To be filled by Dev agent during implementation*

### Debug Log References
*To be filled by Dev agent during implementation*

### Completion Notes List
*To be filled by Dev agent during implementation*

### File List
*To be filled by Dev agent during implementation*
