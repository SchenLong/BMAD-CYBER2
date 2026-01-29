# Security API Reference

## Core Security Classes

### TokenGenerator
Secure token generation with configurable algorithms and expiration.

#### Methods

**generateSecureToken(options: TokenOptions): Promise<string>**
```typescript
interface TokenOptions {
  userId: string;
  permissions: string[];
  expiresIn?: string; // "1h", "1d", "7d"
  algorithm?: "HS256" | "RS256";
}

// Example
const token = await tokenGen.generateSecureToken({
  userId: "user123", 
  permissions: ["read", "write"],
  expiresIn: "1h"
});
```

**verifyToken(token: string): Promise<TokenPayload>**
```typescript
const payload = await tokenGen.verifyToken(token);
console.log(payload.userId, payload.permissions);
```

### SessionManager  
Encrypted session management with automatic cleanup.

#### Methods

**createSession(userId: string, permissions: string[]): Promise<Session>**
```typescript
const session = await sessionMgr.createSession("user123", ["admin"]);
```

**validateSession(sessionId: string): Promise<boolean>**
```typescript
const isValid = await sessionMgr.validateSession(sessionId);
```

**revokeSession(sessionId: string): Promise<void>**
```typescript
await sessionMgr.revokeSession(sessionId);
```

### SecurityMonitor
Real-time security monitoring and alerting.

#### Methods

**logSecurityEvent(event: SecurityEvent): void**
```typescript
monitor.logSecurityEvent({
  type: "failed_login",
  userId: "user123", 
  ip: "192.168.1.1",
  timestamp: new Date()
});
```

## Security Patches
Applied automatically via patch system:
- Privilege escalation protection
- Prompt injection detection
- Encoded payload filtering
