# Security Examples

## Authentication Examples

### Basic Token Authentication
```typescript
import { TokenGenerator } from "../../generate-token";

const tokenGen = new TokenGenerator();

// Generate token for user
const token = await tokenGen.generateSecureToken({
  userId: "alice123",
  permissions: ["dashboard:read", "data:write"], 
  expiresIn: "2h"
});

// Store token for client use
res.json({ token, expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000) });
```

### Session Management
```typescript
// SessionManager is now in the canonical _bmad/core/security location
import { SessionManager } from "../../../../_bmad/core/security/session-manager";

const sessionMgr = new SessionManager();

// Login flow
async function handleLogin(userId: string, password: string) {
  // Validate credentials (your auth logic)
  if (await validateCredentials(userId, password)) {
    const session = await sessionMgr.createSession(userId, ["user"]);
    return { success: true, sessionId: session.id };
  }
  return { success: false };
}

// Middleware for protected routes
async function requireAuth(req, res, next) {
  const sessionId = req.headers["x-session-id"];
  if (await sessionMgr.validateSession(sessionId)) {
    next();
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
}
```

## Role-Based Access Control
```typescript
import { RBACManager } from "../../rbac/rbac-manager";

const rbac = new RBACManager();

// Define roles and permissions
await rbac.createRole("admin", [
  "users:*", "system:*", "security:*"
]);

await rbac.createRole("analyst", [
  "data:read", "reports:read", "dashboard:read"
]);

// Check permissions
if (await rbac.hasPermission(userId, "users:delete")) {
  // Allow action
}
```

## Security Monitoring
```typescript
import { SecurityMonitor } from "../../monitoring/security-monitor";

const monitor = new SecurityMonitor();

// Log security events
monitor.logSecurityEvent({
  type: "suspicious_activity",
  severity: "high", 
  userId: "user123",
  details: "Multiple failed login attempts",
  ip: req.ip
});

// Set up alerts
monitor.onAlert("high", (event) => {
  console.log("HIGH SEVERITY ALERT:", event);
  // Send to security team
});
```
