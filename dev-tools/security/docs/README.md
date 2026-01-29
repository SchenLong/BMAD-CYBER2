# Security Testing Guide

## Running Security Tests

### Unit Tests
```bash
# Run all security unit tests
npm test src/security/

# Run specific component tests
npm test dev-tools/security/testing/token-generator.test.ts
npm test dev-tools/security/testing/session-manager.test.ts
```

### Integration Tests
```bash
# Run integration test suite
npm run test:integration

# Run security-specific integration tests
npm test dev-tools/security/testing/integration/
```

### Security Audit Tests
```bash
# Run security audit
npm run security:audit

# Generate security report
npm run security:report
```

## Test Examples

### Token Generator Tests
```typescript
import { TokenGenerator } from "../../generate-token";

describe("TokenGenerator", () => {
  let tokenGen: TokenGenerator;

  beforeEach(() => {
    tokenGen = new TokenGenerator();
  });

  test("generates valid tokens", async () => {
    const token = await tokenGen.generateSecureToken({
      userId: "test123",
      permissions: ["read"],
      expiresIn: "1h"
    });
    
    expect(token).toBeTruthy();
    expect(typeof token).toBe("string");
  });

  test("verifies token payload", async () => {
    const options = {
      userId: "test123", 
      permissions: ["read", "write"],
      expiresIn: "1h"
    };
    
    const token = await tokenGen.generateSecureToken(options);
    const payload = await tokenGen.verifyToken(token);
    
    expect(payload.userId).toBe(options.userId);
    expect(payload.permissions).toEqual(options.permissions);
  });
});
```

### Session Manager Tests
```typescript
import { SessionManager } from "../../session-manager";

describe("SessionManager", () => {
  let sessionMgr: SessionManager;

  beforeEach(() => {
    sessionMgr = new SessionManager();
  });

  test("creates valid sessions", async () => {
    const session = await sessionMgr.createSession("user123", ["read"]);
    
    expect(session.id).toBeTruthy();
    expect(session.userId).toBe("user123");
    expect(session.permissions).toContain("read");
  });

  test("validates active sessions", async () => {
    const session = await sessionMgr.createSession("user123", ["read"]);
    const isValid = await sessionMgr.validateSession(session.id);
    
    expect(isValid).toBe(true);
  });
});
```

## Security Checklist
- [ ] All tokens expire appropriately
- [ ] Sessions are encrypted in storage
- [ ] Failed login attempts are logged
- [ ] Rate limiting is working
- [ ] Input validation catches malicious payloads
- [ ] Security patches are applied
