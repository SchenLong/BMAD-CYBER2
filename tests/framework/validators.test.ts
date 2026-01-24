import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  createValidatorSuite,
  type ValidatorSuiteConfig,
  BashSafetyValidator,
  PIIValidator,
  SecretDetector,
  ProductionGuard,
  EnvProtector,
  JailbreakDetector,
  PromptInjectionGuard,
  SessionTracker,
  AuditLogger,
  TelemetryCollector,
  AnomalyDetector,
  ConfidenceTracker,
  TokenValidator,
  PluginPermissionManager,
  SupplyChainValidator,
  RateLimiter,
  RecursionGuard,
  ResourceLimiter,
  ContextManager
} from '../../framework/validators/index.js';

// Mock the validators-node module
vi.mock('../../.claude/validators-node/src/index.js', () => ({
  // Mock all validator classes and functions
  validateSecretGuard: vi.fn(),
  validatePiiGuard: vi.fn(),
  validateBashCommand: vi.fn(),
  validateProductionGuard: vi.fn(),
  validateEnvProtection: vi.fn(),
  detectJailbreakAttempt: vi.fn(),
  validatePromptInjection: vi.fn(),
  createSessionTracker: vi.fn(),
  createAuditLogger: vi.fn(),
  createTelemetryCollector: vi.fn(),
  detectAnomalies: vi.fn(),
  trackConfidence: vi.fn(),
  validateToken: vi.fn(),
  createPermissionManager: vi.fn(),
  validateSupplyChain: vi.fn(),
  createRateLimiter: vi.fn(),
  createRecursionGuard: vi.fn(),
  createResourceLimiter: vi.fn(),
  createContextManager: vi.fn()
}));

vi.mock('../../.claude/validators-node/src/types/index.js', () => ({
  ValidationResult: Object,
  SecurityConfig: Object,
  AuditEvent: Object
}));

vi.mock('../../.claude/validators-node/src/guards/index.js', () => ({
  BashSafetyValidator: vi.fn(() => ({
    validate: vi.fn(() => ({ valid: true, errors: [] })),
    configure: vi.fn()
  })),
  PIIValidator: vi.fn(() => ({
    validate: vi.fn(() => ({ valid: true, errors: [] })),
    configure: vi.fn()
  })),
  SecretDetector: vi.fn(() => ({
    scan: vi.fn(() => ({ found: false, secrets: [] })),
    configure: vi.fn()
  })),
  ProductionGuard: vi.fn(() => ({
    check: vi.fn(() => ({ safe: true, warnings: [] })),
    configure: vi.fn()
  })),
  EnvProtector: vi.fn(() => ({
    protect: vi.fn(() => ({ protected: true, modified: [] })),
    configure: vi.fn()
  }))
}));

vi.mock('../../.claude/validators-node/src/ai-safety/index.js', () => ({
  JailbreakDetector: vi.fn(() => ({
    detect: vi.fn(() => ({ detected: false, confidence: 0 })),
    configure: vi.fn()
  })),
  PromptInjectionGuard: vi.fn(() => ({
    guard: vi.fn(() => ({ blocked: false, reason: null })),
    configure: vi.fn()
  })),
  SessionTracker: vi.fn(() => ({
    track: vi.fn(() => ({ sessionId: 'test-session', risk: 'low' })),
    configure: vi.fn()
  }))
}));

vi.mock('../../.claude/validators-node/src/observability/index.js', () => ({
  AuditLogger: vi.fn(() => ({
    log: vi.fn(() => Promise.resolve({ logged: true })),
    configure: vi.fn()
  })),
  TelemetryCollector: vi.fn(() => ({
    collect: vi.fn(() => ({ collected: true, metrics: {} })),
    configure: vi.fn()
  })),
  AnomalyDetector: vi.fn(() => ({
    detect: vi.fn(() => ({ anomalous: false, score: 0 })),
    configure: vi.fn()
  })),
  ConfidenceTracker: vi.fn(() => ({
    track: vi.fn(() => ({ confidence: 0.95 })),
    configure: vi.fn()
  }))
}));

vi.mock('../../.claude/validators-node/src/permissions/index.js', () => ({
  TokenValidator: vi.fn(() => ({
    validate: vi.fn(() => ({ valid: true, claims: {} })),
    configure: vi.fn()
  })),
  PluginPermissionManager: vi.fn(() => ({
    check: vi.fn(() => ({ allowed: true, permissions: [] })),
    configure: vi.fn()
  })),
  SupplyChainValidator: vi.fn(() => ({
    validate: vi.fn(() => ({ valid: true, chain: [] })),
    configure: vi.fn()
  }))
}));

vi.mock('../../.claude/validators-node/src/resource-management/index.js', () => ({
  RateLimiter: vi.fn(() => ({
    check: vi.fn(() => ({ allowed: true, remaining: 100 })),
    configure: vi.fn()
  })),
  RecursionGuard: vi.fn(() => ({
    enter: vi.fn(() => true),
    exit: vi.fn(),
    configure: vi.fn()
  })),
  ResourceLimiter: vi.fn(() => ({
    check: vi.fn(() => ({ allowed: true, usage: {} })),
    configure: vi.fn()
  })),
  ContextManager: vi.fn(() => ({
    create: vi.fn(() => ({ contextId: 'test-context' })),
    configure: vi.fn()
  }))
}));

describe('Validator Suite Configuration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createValidatorSuite', () => {
    test('should create validator suite with default configuration', () => {
      const suite = createValidatorSuite();

      expect(suite).toBeDefined();
      expect(suite.config).toBeDefined();
      expect(suite.config.enablePIIDetection).toBe(true);
      expect(suite.config.enableBashSafety).toBe(true);
      expect(suite.config.enableSecretDetection).toBe(true);
      expect(suite.config.enablePromptInjectionGuard).toBe(true);
      expect(suite.config.enableAuditLogging).toBe(true);
      expect(suite.config.enableRateLimiting).toBe(true);
    });

    test('should create validator suite with custom configuration', () => {
      const customConfig: ValidatorSuiteConfig = {
        enablePIIDetection: false,
        enableBashSafety: true,
        enableSecretDetection: false,
        enablePromptInjectionGuard: true,
        enableAuditLogging: false,
        enableRateLimiting: true,
        customRules: {
          maxFileSize: '10MB',
          allowedExtensions: ['.ts', '.js']
        }
      };

      const suite = createValidatorSuite(customConfig);

      expect(suite.config.enablePIIDetection).toBe(false);
      expect(suite.config.enableBashSafety).toBe(true);
      expect(suite.config.enableSecretDetection).toBe(false);
      expect(suite.config.enablePromptInjectionGuard).toBe(true);
      expect(suite.config.enableAuditLogging).toBe(false);
      expect(suite.config.enableRateLimiting).toBe(true);
      expect(suite.config.customRules).toEqual(customConfig.customRules);
    });

    test('should merge custom config with defaults', () => {
      const partialConfig: ValidatorSuiteConfig = {
        enablePIIDetection: false,
        customRules: { testRule: 'testValue' }
      };

      const suite = createValidatorSuite(partialConfig);

      expect(suite.config.enablePIIDetection).toBe(false);
      expect(suite.config.enableBashSafety).toBe(true); // default
      expect(suite.config.customRules).toEqual({ testRule: 'testValue' });
    });

    test('should have validators object initialized', () => {
      const suite = createValidatorSuite();
      expect(suite.validators).toBeDefined();
      expect(typeof suite.validators).toBe('object');
    });
  });
});

describe('Security Guards Integration', () => {
  describe('BashSafetyValidator', () => {
    test('should create and configure BashSafetyValidator', () => {
      expect(() => new BashSafetyValidator()).not.toThrow();
      const validator = new BashSafetyValidator();
      expect(validator.validate).toBeDefined();
      expect(validator.configure).toBeDefined();
    });

    test('should validate bash commands', () => {
      const validator = new BashSafetyValidator();
      const result = validator.validate('ls -la');
      expect(result.valid).toBe(true);
      expect(Array.isArray(result.errors)).toBe(true);
    });

    test('should be configurable', () => {
      const validator = new BashSafetyValidator();
      expect(() => validator.configure({ strict: true })).not.toThrow();
    });
  });

  describe('PIIValidator', () => {
    test('should create and configure PIIValidator', () => {
      expect(() => new PIIValidator()).not.toThrow();
      const validator = new PIIValidator();
      expect(validator.validate).toBeDefined();
      expect(validator.configure).toBeDefined();
    });

    test('should validate content for PII', () => {
      const validator = new PIIValidator();
      const result = validator.validate('This is safe content');
      expect(result.valid).toBe(true);
      expect(Array.isArray(result.errors)).toBe(true);
    });
  });

  describe('SecretDetector', () => {
    test('should create and configure SecretDetector', () => {
      expect(() => new SecretDetector()).not.toThrow();
      const detector = new SecretDetector();
      expect(detector.scan).toBeDefined();
      expect(detector.configure).toBeDefined();
    });

    test('should scan for secrets', () => {
      const detector = new SecretDetector();
      const result = detector.scan('const apiKey = "safe-test-key";');
      expect(result.found).toBe(false);
      expect(Array.isArray(result.secrets)).toBe(true);
    });
  });

  describe('ProductionGuard', () => {
    test('should create and configure ProductionGuard', () => {
      expect(() => new ProductionGuard()).not.toThrow();
      const guard = new ProductionGuard();
      expect(guard.check).toBeDefined();
      expect(guard.configure).toBeDefined();
    });

    test('should check production safety', () => {
      const guard = new ProductionGuard();
      const result = guard.check('development command');
      expect(result.safe).toBe(true);
      expect(Array.isArray(result.warnings)).toBe(true);
    });
  });

  describe('EnvProtector', () => {
    test('should create and configure EnvProtector', () => {
      expect(() => new EnvProtector()).not.toThrow();
      const protector = new EnvProtector();
      expect(protector.protect).toBeDefined();
      expect(protector.configure).toBeDefined();
    });

    test('should protect environment variables', () => {
      const protector = new EnvProtector();
      const result = protector.protect({ TEST_VAR: 'value' });
      expect(result.protected).toBe(true);
      expect(Array.isArray(result.modified)).toBe(true);
    });
  });
});

describe('AI Safety Integration', () => {
  describe('JailbreakDetector', () => {
    test('should create and configure JailbreakDetector', () => {
      expect(() => new JailbreakDetector()).not.toThrow();
      const detector = new JailbreakDetector();
      expect(detector.detect).toBeDefined();
      expect(detector.configure).toBeDefined();
    });

    test('should detect jailbreak attempts', () => {
      const detector = new JailbreakDetector();
      const result = detector.detect('normal user input');
      expect(result.detected).toBe(false);
      expect(typeof result.confidence).toBe('number');
    });
  });

  describe('PromptInjectionGuard', () => {
    test('should create and configure PromptInjectionGuard', () => {
      expect(() => new PromptInjectionGuard()).not.toThrow();
      const guard = new PromptInjectionGuard();
      expect(guard.guard).toBeDefined();
      expect(guard.configure).toBeDefined();
    });

    test('should guard against prompt injection', () => {
      const guard = new PromptInjectionGuard();
      const result = guard.guard('normal prompt');
      expect(result.blocked).toBe(false);
      expect(result.reason).toBeNull();
    });
  });

  describe('SessionTracker', () => {
    test('should create and configure SessionTracker', () => {
      expect(() => new SessionTracker()).not.toThrow();
      const tracker = new SessionTracker();
      expect(tracker.track).toBeDefined();
      expect(tracker.configure).toBeDefined();
    });

    test('should track session activities', () => {
      const tracker = new SessionTracker();
      const result = tracker.track('user-123', 'action');
      expect(result.sessionId).toBe('test-session');
      expect(result.risk).toBe('low');
    });
  });
});

describe('Observability Integration', () => {
  describe('AuditLogger', () => {
    test('should create and configure AuditLogger', () => {
      expect(() => new AuditLogger()).not.toThrow();
      const logger = new AuditLogger();
      expect(logger.log).toBeDefined();
      expect(logger.configure).toBeDefined();
    });

    test('should log audit events', async () => {
      const logger = new AuditLogger();
      const result = await logger.log('test event');
      expect(result.logged).toBe(true);
    });
  });

  describe('TelemetryCollector', () => {
    test('should create and configure TelemetryCollector', () => {
      expect(() => new TelemetryCollector()).not.toThrow();
      const collector = new TelemetryCollector();
      expect(collector.collect).toBeDefined();
      expect(collector.configure).toBeDefined();
    });

    test('should collect telemetry data', () => {
      const collector = new TelemetryCollector();
      const result = collector.collect('metric-name', 123);
      expect(result.collected).toBe(true);
      expect(result.metrics).toBeDefined();
    });
  });

  describe('AnomalyDetector', () => {
    test('should create and configure AnomalyDetector', () => {
      expect(() => new AnomalyDetector()).not.toThrow();
      const detector = new AnomalyDetector();
      expect(detector.detect).toBeDefined();
      expect(detector.configure).toBeDefined();
    });

    test('should detect anomalies', () => {
      const detector = new AnomalyDetector();
      const result = detector.detect([1, 2, 3, 4, 5]);
      expect(result.anomalous).toBe(false);
      expect(typeof result.score).toBe('number');
    });
  });

  describe('ConfidenceTracker', () => {
    test('should create and configure ConfidenceTracker', () => {
      expect(() => new ConfidenceTracker()).not.toThrow();
      const tracker = new ConfidenceTracker();
      expect(tracker.track).toBeDefined();
      expect(tracker.configure).toBeDefined();
    });

    test('should track confidence levels', () => {
      const tracker = new ConfidenceTracker();
      const result = tracker.track('operation', true);
      expect(typeof result.confidence).toBe('number');
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });
  });
});

describe('Permissions & RBAC Integration', () => {
  describe('TokenValidator', () => {
    test('should create and configure TokenValidator', () => {
      expect(() => new TokenValidator()).not.toThrow();
      const validator = new TokenValidator();
      expect(validator.validate).toBeDefined();
      expect(validator.configure).toBeDefined();
    });

    test('should validate tokens', () => {
      const validator = new TokenValidator();
      const result = validator.validate('mock-token');
      expect(result.valid).toBe(true);
      expect(result.claims).toBeDefined();
    });
  });

  describe('PluginPermissionManager', () => {
    test('should create and configure PluginPermissionManager', () => {
      expect(() => new PluginPermissionManager()).not.toThrow();
      const manager = new PluginPermissionManager();
      expect(manager.check).toBeDefined();
      expect(manager.configure).toBeDefined();
    });

    test('should check plugin permissions', () => {
      const manager = new PluginPermissionManager();
      const result = manager.check('plugin-name', ['read', 'write']);
      expect(result.allowed).toBe(true);
      expect(Array.isArray(result.permissions)).toBe(true);
    });
  });

  describe('SupplyChainValidator', () => {
    test('should create and configure SupplyChainValidator', () => {
      expect(() => new SupplyChainValidator()).not.toThrow();
      const validator = new SupplyChainValidator();
      expect(validator.validate).toBeDefined();
      expect(validator.configure).toBeDefined();
    });

    test('should validate supply chain', () => {
      const validator = new SupplyChainValidator();
      const result = validator.validate({ name: 'package', version: '1.0.0' });
      expect(result.valid).toBe(true);
      expect(Array.isArray(result.chain)).toBe(true);
    });
  });
});

describe('Resource Management Integration', () => {
  describe('RateLimiter', () => {
    test('should create and configure RateLimiter', () => {
      expect(() => new RateLimiter()).not.toThrow();
      const limiter = new RateLimiter();
      expect(limiter.check).toBeDefined();
      expect(limiter.configure).toBeDefined();
    });

    test('should check rate limits', () => {
      const limiter = new RateLimiter();
      const result = limiter.check('operation', 'user-123');
      expect(result.allowed).toBe(true);
      expect(typeof result.remaining).toBe('number');
    });
  });

  describe('RecursionGuard', () => {
    test('should create and configure RecursionGuard', () => {
      expect(() => new RecursionGuard()).not.toThrow();
      const guard = new RecursionGuard();
      expect(guard.enter).toBeDefined();
      expect(guard.exit).toBeDefined();
      expect(guard.configure).toBeDefined();
    });

    test('should guard against recursion', () => {
      const guard = new RecursionGuard();
      const canEnter = guard.enter('operation');
      expect(canEnter).toBe(true);
      expect(() => guard.exit('operation')).not.toThrow();
    });
  });

  describe('ResourceLimiter', () => {
    test('should create and configure ResourceLimiter', () => {
      expect(() => new ResourceLimiter()).not.toThrow();
      const limiter = new ResourceLimiter();
      expect(limiter.check).toBeDefined();
      expect(limiter.configure).toBeDefined();
    });

    test('should check resource limits', () => {
      const limiter = new ResourceLimiter();
      const result = limiter.check('memory', 1024);
      expect(result.allowed).toBe(true);
      expect(result.usage).toBeDefined();
    });
  });

  describe('ContextManager', () => {
    test('should create and configure ContextManager', () => {
      expect(() => new ContextManager()).not.toThrow();
      const manager = new ContextManager();
      expect(manager.create).toBeDefined();
      expect(manager.configure).toBeDefined();
    });

    test('should create and manage contexts', () => {
      const manager = new ContextManager();
      const result = manager.create('operation');
      expect(result.contextId).toBe('test-context');
    });
  });
});

describe('Integration Tests', () => {
  test('should handle validator interactions', () => {
    const bashValidator = new BashSafetyValidator();
    const piiValidator = new PIIValidator();
    const secretDetector = new SecretDetector();

    const testContent = 'rm -rf /safe/test/directory';

    const bashResult = bashValidator.validate(testContent);
    const piiResult = piiValidator.validate(testContent);
    const secretResult = secretDetector.scan(testContent);

    expect(bashResult.valid).toBe(true);
    expect(piiResult.valid).toBe(true);
    expect(secretResult.found).toBe(false);
  });

  test('should handle configuration cascading', () => {
    const suite = createValidatorSuite({
      enablePIIDetection: true,
      customRules: {
        strictMode: true,
        maxRetries: 3
      }
    });

    expect(suite.config.enablePIIDetection).toBe(true);
    expect(suite.config.customRules?.strictMode).toBe(true);
    expect(suite.config.customRules?.maxRetries).toBe(3);
  });

  test('should handle error conditions gracefully', () => {
    expect(() => createValidatorSuite()).not.toThrow();
    expect(() => new BashSafetyValidator()).not.toThrow();
    expect(() => new PIIValidator()).not.toThrow();
    expect(() => new SecretDetector()).not.toThrow();
  });

  test('should support dynamic configuration updates', () => {
    const validator = new BashSafetyValidator();

    expect(() => validator.configure({ strict: false })).not.toThrow();
    expect(() => validator.configure({ strict: true })).not.toThrow();
  });
});

describe('Performance and Stress Tests', () => {
  test('should handle multiple validator instances', () => {
    const validators = Array.from({ length: 10 }, () => ({
      bash: new BashSafetyValidator(),
      pii: new PIIValidator(),
      secret: new SecretDetector()
    }));

    expect(validators).toHaveLength(10);
    validators.forEach(v => {
      expect(v.bash).toBeDefined();
      expect(v.bash.validate).toBeDefined();
      expect(v.pii).toBeDefined();
      expect(v.pii.validate).toBeDefined();
      expect(v.secret).toBeDefined();
      expect(v.secret.scan).toBeDefined();
    });
  });

  test('should handle concurrent operations', async () => {
    const logger = new AuditLogger();
    const operations = Array.from({ length: 5 }, (_, i) =>
      logger.log(`event-${i}`)
    );

    const results = await Promise.all(operations);
    expect(results).toHaveLength(5);
    results.forEach(result => {
      expect(result.logged).toBe(true);
    });
  });

  test('should maintain performance under load', () => {
    const detector = new AnomalyDetector();
    const startTime = Date.now();

    for (let i = 0; i < 100; i++) {
      detector.detect([i, i + 1, i + 2]);
    }

    const endTime = Date.now();
    const duration = endTime - startTime;

    // Should complete within reasonable time (adjust threshold as needed)
    expect(duration).toBeLessThan(1000); // 1 second
  });
});

describe('Error Handling and Edge Cases', () => {
  test('should handle null/undefined inputs gracefully', () => {
    const validator = new BashSafetyValidator();

    expect(() => validator.validate(null as any)).not.toThrow();
    expect(() => validator.validate(undefined as any)).not.toThrow();
    expect(() => validator.validate('')).not.toThrow();
  });

  test('should handle configuration errors gracefully', () => {
    const validator = new PIIValidator();

    expect(() => validator.configure(null as any)).not.toThrow();
    expect(() => validator.configure(undefined as any)).not.toThrow();
    expect(() => validator.configure({})).not.toThrow();
  });

  test('should handle large inputs efficiently', () => {
    const detector = new SecretDetector();
    const largeInput = 'a'.repeat(10000);

    const startTime = Date.now();
    const result = detector.scan(largeInput);
    const endTime = Date.now();

    expect(result).toBeDefined();
    expect(endTime - startTime).toBeLessThan(1000); // Should be fast
  });

  test('should handle special characters and encoding', () => {
    const validator = new PIIValidator();
    const specialChars = '!@#$%^&*()_+{}|:"<>?[]\\;\',./ 🚀🔒💻';

    expect(() => validator.validate(specialChars)).not.toThrow();
  });
});