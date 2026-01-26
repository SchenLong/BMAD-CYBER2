# Quick Start Guide

## Installation & Setup

### 1. Environment Configuration
```bash
# Set required environment variables
export BMAD_SECRET_KEY="your-secret-key-here"
export BMAD_ENCRYPTION_KEY="your-encryption-key"
export SESSION_TIMEOUT="3600"
```

### 2. Initialize Security Components
```typescript
import { SecurityManager } from "../security-manager";
import { TokenGenerator } from "../generate-token";
import { SessionManager } from "../session-manager";

// Initialize security
const security = new SecurityManager();
await security.initialize();
```

### 3. Generate API Token
```typescript
const tokenGen = new TokenGenerator();
const token = await tokenGen.generateSecureToken({
  userId: "user123",
  permissions: ["read", "write"],
  expiresIn: "1h"
});
```

### 4. Secure Session Management  
```typescript
const sessionMgr = new SessionManager();
const session = await sessionMgr.createSession(userId, permissions);
```

## Next Steps
- Review [API Documentation](../api/README.md)
- Explore [Security Examples](../examples/README.md)
- Run [Security Tests](../tests/README.md)
