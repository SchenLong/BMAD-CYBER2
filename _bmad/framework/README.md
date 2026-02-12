# BMAD Framework

**Comprehensive Security & Automation Framework for BMAD Applications**

The BMAD Framework provides a unified, production-ready toolkit for building secure applications with comprehensive validation, authentication, audit logging, and automation capabilities.

## Features

- **🔒 Security Validation Suite** - PII detection, bash safety, secret scanning, prompt injection guards
- **🔐 Authentication & RBAC** - Token-based auth with role-based access control
- **📋 Audit Logging** - Comprehensive activity tracking with compliance reporting
- **🪝 Hook System** - Session management and event handling
- **🛠️ Script Automation** - Build tools, compression utilities, and custom scripts
- **⚡ TypeScript-First** - Full type safety with modern ESM support

## Quick Start

### Installation

```bash
npm install @bmad/framework
```

### Basic Usage

```typescript
import { createBMADFramework } from '@bmad/framework';

// Create framework instance
const framework = createBMADFramework({
  framework: {
    enableValidation: true,
    enableAuditLogging: true,
    enableRBAC: true
  }
});

// Use validators
await framework.validators.validate(userInput);

// Authenticate users
const token = await framework.auth.authenticate({
  username: 'user123',
  roles: ['developer']
});

// Log audit events
await framework.audit.logAuthentication('user123', true);
```

### Framework Presets

```typescript
import { FrameworkPresets } from '@bmad/framework/exports';

// Development environment
const devFramework = FrameworkPresets.development();

// Production environment
const prodFramework = FrameworkPresets.production();

// Testing environment
const testFramework = FrameworkPresets.testing();
```

## Module Exports

### Core Framework

```typescript
import {
  createBMADFramework,
  initializeFramework,
  FRAMEWORK_VERSION
} from '@bmad/framework';
```

### Validators

```typescript
import {
  createValidatorSuite,
  PIIValidator,
  BashSafetyValidator,
  SecretDetector
} from '@bmad/framework/validators';
```

### Authentication & RBAC

```typescript
import {
  createAuthManager,
  RBACManager,
  requireAuth,
  requirePermission
} from '@bmad/framework/auth';
```

### Audit Logging

```typescript
import {
  createAuditLogger,
  AuditEventBuilder,
  auditAuth,
  auditAccess
} from '@bmad/framework/audit';
```

### Hooks & Session Management

```typescript
import {
  createHookManager,
  HookRegistry
} from '@bmad/framework/hooks';
```

### Scripts & Automation

```typescript
import {
  createScriptManager,
  compressAgents,
  buildModules
} from '@bmad/framework/scripts';
```

## Configuration

### Complete Framework Configuration

```typescript
interface CompleteFrameworkConfig {
  framework?: {
    enableValidation?: boolean;
    enableAuditLogging?: boolean;
    enableRBAC?: boolean;
    logLevel?: 'debug' | 'info' | 'warn' | 'error';
    outputPath?: string;
  };
  validators?: {
    enablePIIDetection?: boolean;
    enableBashSafety?: boolean;
    enableSecretDetection?: boolean;
    enablePromptInjectionGuard?: boolean;
    customRules?: Record<string, any>;
  };
  auth?: {
    tokenExpiry?: number;
    enableRBAC?: boolean;
    secretKey?: string;
    algorithm?: 'HS256' | 'RS256';
  };
  audit?: {
    enableEncryption?: boolean;
    enableArchival?: boolean;
    retentionPeriod?: number;
    compressionLevel?: 'none' | 'low' | 'high';
  };
  hooks?: {
    enableSessionSecurity?: boolean;
    enableEventLogging?: boolean;
    customHooks?: Array<HookHandler>;
  };
  scripts?: {
    outputPath?: string;
    compressionLevel?: 'low' | 'medium' | 'high';
    customScripts?: Array<CustomScript>;
  };
}
```

## Examples

### Security Validation

```typescript
import { createValidatorSuite } from '@bmad/framework/validators';

const validators = createValidatorSuite({
  enablePIIDetection: true,
  enableBashSafety: true,
  enableSecretDetection: true
});

// Validate user input
const result = await validators.validateInput(userContent);
if (!result.isValid) {
  console.error('Validation failed:', result.errors);
}
```

### Authentication & Authorization

```typescript
import { createAuthManager } from '@bmad/framework/auth';

const authManager = createAuthManager({
  enableRBAC: true,
  tokenExpiry: 3600
});

// Authenticate user
const token = await authManager.authenticate({
  username: 'developer1',
  roles: ['developer', 'admin']
});

// Check permissions
const canAccess = await authManager.authorize(
  token.accessToken,
  'modules',
  'write'
);
```

### Audit Logging

```typescript
import { AuditEventBuilder, createAuditLogger } from '@bmad/framework/audit';

const auditLogger = createAuditLogger({
  enableEncryption: true,
  retentionPeriod: 90
});

// Log security event
await auditLogger.logEvent(
  AuditEventBuilder.create()
    .user('user123')
    .type('security_violation')
    .resource('sensitive-data')
    .action('unauthorized-access')
    .result('blocked')
    .severity('critical')
    .metadata({ reason: 'Invalid token' })
    .build()
);

// Generate compliance report
const report = await auditLogger.generateComplianceReport(
  new Date('2024-01-01'),
  new Date('2024-01-31')
);
```

### Custom Scripts

```typescript
import { createScriptManager } from '@bmad/framework/scripts';

const scriptManager = createScriptManager({
  outputPath: './dist',
  compressionLevel: 'high'
});

// Execute built-in scripts
await scriptManager.executeScript('compress-agents', ['./agents']);
await scriptManager.executeScript('build', ['production']);

// Register custom script
scriptManager.getRegistry().register({
  name: 'deploy',
  description: 'Deploy application',
  execute: async (args, config) => {
    // Custom deployment logic
    return { success: true, output: 'Deployed successfully' };
  }
});
```

## Health Monitoring

```typescript
// Check framework health
const health = await framework.healthCheck();
console.log('Framework healthy:', health.healthy);

// Get statistics
const stats = await framework.getStatistics();
console.log('Active sessions:', stats.auth.activeSessions);
console.log('Available scripts:', stats.scripts.available);
```

## Production Considerations

### Security Best Practices

1. **Use Production Preset**: Always use `FrameworkPresets.production()` in production
2. **Enable Encryption**: Enable audit log encryption for sensitive data
3. **Token Security**: Use RS256 algorithm with short token expiry
4. **Rate Limiting**: Enable rate limiting for all validators
5. **Secret Management**: Store secret keys in environment variables

### Performance Optimization

1. **Lazy Loading**: Import only needed modules using subpath exports
2. **Configuration**: Disable unused features in production
3. **Audit Retention**: Configure appropriate log retention periods
4. **Compression**: Use high compression for archived logs

### Monitoring & Alerting

```typescript
// Set up health checks
setInterval(async () => {
  const health = await framework.healthCheck();
  if (!health.healthy) {
    // Send alert
    console.error('Framework unhealthy:', health.error);
  }
}, 30000); // Every 30 seconds
```

## API Reference

### Framework Class

```typescript
class BMADFramework {
  constructor(config?: CompleteFrameworkConfig);
  getInfo(): FrameworkInfo;
  healthCheck(): Promise<HealthResult>;
  getStatistics(): Promise<FrameworkStatistics>;
}
```

### Validators

```typescript
interface ValidatorSuiteConfig {
  enablePIIDetection?: boolean;
  enableBashSafety?: boolean;
  enableSecretDetection?: boolean;
  enablePromptInjectionGuard?: boolean;
  enableAuditLogging?: boolean;
  enableRateLimiting?: boolean;
  customRules?: Record<string, any>;
}
```

### Auth Manager

```typescript
class AuthManager {
  authenticate(credentials: UserCredentials): Promise<AuthToken | null>;
  validateAuthToken(token: string): Promise<AuthContext | null>;
  authorize(token: string, resource: string, action: string): Promise<boolean>;
  logout(token: string): void;
}
```

### Audit Logger

```typescript
class BMADAuditLogger {
  logEvent(event: Partial<AuditEvent>): Promise<void>;
  logAuthentication(userId: string, success: boolean): Promise<void>;
  logAuthorization(userId: string, resource: string, action: string, granted: boolean): Promise<void>;
  logSecurityViolation(resource: string, action: string, details: string): Promise<void>;
  queryEvents(query: AuditQuery): Promise<AuditEvent[]>;
  generateComplianceReport(start: Date, end: Date): Promise<ComplianceReport>;
}
```

## Changelog

### 1.0.0

- Initial release with full TypeScript support
- Complete security validation suite
- RBAC-based authentication system
- Comprehensive audit logging
- Hook system for session management
- Script automation framework
- Production-ready configuration presets

## Contributing

Please read our contributing guidelines and code of conduct before submitting pull requests.

## License

MIT License - see LICENSE file for details.

## Support

For support and questions, please open an issue on our GitHub repository.

---

**Built with ❤️ by the BMAD Framework Team**
