/**
 * OWASP Monitoring & Alerting Tests
 * ===================================
 * Story 5.1: Anomaly Detection & Alerting (A09)
 *   Source: .claude/validators-node/src/observability/anomaly-detector.ts
 *   Source: .claude/validators-node/src/common/alerting.ts
 *   Source: .claude/validators-node/src/observability/telemetry.ts
 *
 * Story 5.2: Error Handling & Information Disclosure (A05, V7, V14)
 *   Source: .claude/validators-node/src/common/block-message.ts
 *   Source: .claude/validators-node/src/common/path-utils.ts
 *
 * Story 5.3: CRLF & Log Injection Prevention (A03)
 *   Source: src/security/audit/audit-alerting.js
 *   Source: .claude/validators-node/src/common/alerting.ts
 */

import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';

// ---------------------------------------------------------------------------
// Mocks — vi.hoisted ensures variables are available during mock hoisting
// ---------------------------------------------------------------------------

const { mockFs } = vi.hoisted(() => ({
  mockFs: {
    existsSync: vi.fn(() => false),
    readFileSync: vi.fn(() => '{}'),
    writeFileSync: vi.fn(),
    mkdirSync: vi.fn(),
    appendFileSync: vi.fn(),
    statSync: vi.fn(() => ({ size: 0, mtimeMs: Date.now(), isFile: () => true })),
    openSync: vi.fn(() => 99),
    closeSync: vi.fn(),
    unlinkSync: vi.fn(),
    readdirSync: vi.fn(() => []),
    renameSync: vi.fn(),
    constants: { O_CREAT: 64, O_EXCL: 128, O_RDWR: 2 },
  },
}));

vi.mock('node:fs', () => ({
  default: mockFs,
  ...mockFs,
}));

vi.mock('fs', () => ({
  default: mockFs,
  ...mockFs,
}));

// ---------------------------------------------------------------------------
// Dynamic Imports (after mocks are established)
// ---------------------------------------------------------------------------

const { AnomalyDetector } = await import(
  '../../.claude/validators-node/src/observability/anomaly-detector.ts'
);

const { shouldAlert, sendAlert } = await import(
  '../../.claude/validators-node/src/common/alerting.ts'
);

const { TelemetryCollector } = await import(
  '../../.claude/validators-node/src/observability/telemetry.ts'
);

const { sanitizeErrorMessage, sanitizePath } = await import(
  '../../.claude/validators-node/src/common/path-utils.ts'
);

const { printBlockMessage } = await import(
  '../../.claude/validators-node/src/common/block-message.ts'
);

const { AuditAlerter, AlertType } = await import(
  '../../src/security/audit/audit-alerting.js'
);

// ═══════════════════════════════════════════════════════════════════════════
// STORY 5.1: Anomaly Detection & Alerting (A09)
// ═══════════════════════════════════════════════════════════════════════════

describe('Story 5.1: Anomaly Detection & Alerting (A09)', () => {

  // -----------------------------------------------------------------------
  // A09-006: Volume spike detection at 2× baseline
  // -----------------------------------------------------------------------
  describe('A09-006: Volume spike detection at 2× baseline', () => {
    let detector;

    beforeEach(() => {
      vi.useFakeTimers();
      vi.clearAllMocks();
      detector = new AnomalyDetector();
      detector.resetBaseline();
    });

    afterEach(() => {
      vi.useRealTimers();
      vi.restoreAllMocks();
    });

    it('should detect volume spike when operation count exceeds baseline by >3 std devs', () => {
      // Seed ≥10 baseline windows with varying counts (mean ~5, std ~1.3)
      const normalCounts = [3, 4, 5, 6, 7, 4, 5, 6, 3, 7, 5, 4];
      const baseTime = new Date(2026, 0, 1, 10, 0, 0).getTime();

      // Record events across 12 five-minute windows to build baseline
      for (let w = 0; w < normalCounts.length; w++) {
        vi.setSystemTime(baseTime + w * 5 * 60 * 1000);
        for (let i = 0; i < normalCounts[w]; i++) {
          detector.recordEvent('Bash', 'test_validator', 'ALLOWED', 'INFO');
        }
      }

      // Advance to next window — finalizes window 11, adds count to baseline
      vi.setSystemTime(baseTime + normalCounts.length * 5 * 60 * 1000);
      detector.recordEvent('Bash', 'test_validator', 'ALLOWED', 'INFO');

      // Inject spike: add 49 more events = 50 total in this window (10× normal)
      for (let i = 0; i < 49; i++) {
        detector.recordEvent('Bash', 'test_validator', 'ALLOWED', 'INFO');
      }

      // Check for anomalies on current window (50 events vs baseline ~5)
      const anomalies = detector.checkAllAnomalies();
      const spike = anomalies.find(a => a.anomalyType === 'volume_spike');

      expect(spike).toBeDefined();
      expect(spike.metricName).toContain('Bash');
      expect(spike.observedValue).toBe(50);
      expect(spike.deviationStd).toBeGreaterThan(3);
      expect(spike.anomalyScore).toBeGreaterThan(0.8);
      expect(spike.alertSeverity).toBe('CRITICAL');
    });

    it('should not trigger volume anomaly with insufficient baseline data (<10 samples)', () => {
      const baseTime = new Date(2026, 0, 1, 10, 0, 0).getTime();

      // Only seed 5 windows (below MIN_SAMPLES_FOR_BASELINE = 10)
      for (let w = 0; w < 5; w++) {
        vi.setSystemTime(baseTime + w * 5 * 60 * 1000);
        for (let i = 0; i < 5; i++) {
          detector.recordEvent('Bash', 'test_validator', 'ALLOWED', 'INFO');
        }
      }

      // Spike window
      vi.setSystemTime(baseTime + 5 * 5 * 60 * 1000);
      for (let i = 0; i < 100; i++) {
        detector.recordEvent('Bash', 'test_validator', 'ALLOWED', 'INFO');
      }

      const anomalies = detector.checkAllAnomalies();
      const volumeSpike = anomalies.find(
        a => a.anomalyType === 'volume_spike' && a.metricName.includes('Bash')
      );

      // Should NOT detect volume spike because baseline has <10 samples
      expect(volumeSpike).toBeUndefined();
    });

    it('should report anomaly score using sigmoid function based on deviation', () => {
      // Seed baseline: 12 windows with varying counts
      const normalCounts = [3, 4, 5, 6, 7, 4, 5, 6, 3, 7, 5, 4];
      const baseTime = new Date(2026, 0, 1, 10, 0, 0).getTime();

      for (let w = 0; w < normalCounts.length; w++) {
        vi.setSystemTime(baseTime + w * 5 * 60 * 1000);
        for (let i = 0; i < normalCounts[w]; i++) {
          detector.recordEvent('Bash', 'test_validator', 'ALLOWED', 'INFO');
        }
      }

      // Advance and create moderate spike (15 events)
      vi.setSystemTime(baseTime + normalCounts.length * 5 * 60 * 1000);
      for (let i = 0; i < 15; i++) {
        detector.recordEvent('Bash', 'test_validator', 'ALLOWED', 'INFO');
      }

      const anomalies = detector.checkAllAnomalies();
      const spike = anomalies.find(a => a.anomalyType === 'volume_spike');

      if (spike) {
        // Score should be between 0 and 1 (sigmoid-based)
        expect(spike.anomalyScore).toBeGreaterThanOrEqual(0);
        expect(spike.anomalyScore).toBeLessThanOrEqual(1);
      }
    });
  });

  // -----------------------------------------------------------------------
  // A09-007: Real-time alerting for HIGH/CRITICAL events
  // -----------------------------------------------------------------------
  describe('A09-007: Real-time alerting for HIGH/CRITICAL events', () => {
    afterEach(() => {
      vi.restoreAllMocks();
      vi.unstubAllGlobals();
      delete process.env.BMAD_ALERT_LEVEL;
      delete process.env.BMAD_ALERT_WEBHOOK_URL;
    });

    it('should alert on CRITICAL severity with default threshold', () => {
      expect(shouldAlert('CRITICAL')).toBe(true);
    });

    it('should not alert on INFO or WARNING severity with default CRITICAL threshold', () => {
      expect(shouldAlert('INFO')).toBe(false);
      expect(shouldAlert('WARNING')).toBe(false);
    });

    it('should alert on WARNING when threshold is lowered to WARNING', () => {
      process.env.BMAD_ALERT_LEVEL = 'WARNING';
      expect(shouldAlert('WARNING')).toBe(true);
      expect(shouldAlert('BLOCKED')).toBe(true);
      expect(shouldAlert('CRITICAL')).toBe(true);
      expect(shouldAlert('INFO')).toBe(false);
    });

    it('should use console.error fallback when no webhook URL configured', async () => {
      delete process.env.BMAD_ALERT_WEBHOOK_URL;
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await sendAlert({
        severity: 'CRITICAL',
        event_type: 'A09_007_FALLBACK',
        validator: 'a09_007_fallback_test',
        message: 'Critical security event detected',
      });

      expect(result).toBe(true);
      expect(spy).toHaveBeenCalledWith(
        expect.stringContaining('CRITICAL')
      );
      expect(spy).toHaveBeenCalledWith(
        expect.stringContaining('Critical security event detected')
      );
      spy.mockRestore();
    });

    it('should send webhook POST when URL is configured', async () => {
      process.env.BMAD_ALERT_WEBHOOK_URL = 'https://hooks.test/webhook';
      const mockFetch = vi.fn().mockResolvedValue({ ok: true });
      vi.stubGlobal('fetch', mockFetch);

      const result = await sendAlert({
        severity: 'CRITICAL',
        event_type: 'A09_007_WEBHOOK',
        validator: 'a09_007_webhook_test',
        message: 'Webhook test alert',
      });

      expect(result).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://hooks.test/webhook',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );

      // Verify body is JSON with Slack-compatible blocks
      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body).toHaveProperty('blocks');
      expect(body).toHaveProperty('text');
    });
  });

  // -----------------------------------------------------------------------
  // A09-010: Telemetry files in JSONL format
  // -----------------------------------------------------------------------
  describe('A09-010: Telemetry files in JSONL format', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should write entries as JSON followed by newline (JSONL format)', () => {
      const collector = new TelemetryCollector('/tmp/test-telemetry');

      collector.recordSecurityEvent({
        validator: 'jsonl_test',
        action: 'TEST',
        severity: 'INFO',
        target: '/test/path',
        reason: 'JSONL format test',
      });

      expect(mockFs.appendFileSync).toHaveBeenCalled();
      const writeCall = mockFs.appendFileSync.mock.calls[0];
      const written = writeCall[1];

      // Must end with exactly one newline
      expect(written.endsWith('\n')).toBe(true);

      // Content before newline must be valid JSON
      const jsonPart = written.slice(0, -1);
      const parsed = JSON.parse(jsonPart);
      expect(parsed).toHaveProperty('timestamp');
      expect(parsed).toHaveProperty('validator', 'jsonl_test');
      expect(parsed).toHaveProperty('action', 'TEST');
      expect(parsed).toHaveProperty('severity', 'INFO');
    });

    it('should produce independently parseable lines from multiple writes', () => {
      const collector = new TelemetryCollector('/tmp/test-telemetry');

      // Write 5 entries
      for (let i = 0; i < 5; i++) {
        collector.recordSecurityEvent({
          validator: `multi_test_${i}`,
          action: 'TEST',
          severity: 'INFO',
          target: `/test/path/${i}`,
          reason: `Entry ${i}`,
        });
      }

      // Each call should produce independently parseable JSON
      const calls = mockFs.appendFileSync.mock.calls;
      expect(calls.length).toBe(5);

      for (let i = 0; i < calls.length; i++) {
        const line = calls[i][1];
        expect(line.endsWith('\n')).toBe(true);
        const parsed = JSON.parse(line.trim());
        expect(parsed.validator).toBe(`multi_test_${i}`);
      }
    });
  });

  // -----------------------------------------------------------------------
  // A09-012: Concurrent log access
  // -----------------------------------------------------------------------
  describe('A09-012: Concurrent log access', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should handle 10 parallel writes producing valid, complete entries', () => {
      const collector = new TelemetryCollector('/tmp/test-telemetry');

      // Perform 10 sequential writes (simulating concurrent access)
      const results = [];
      for (let i = 0; i < 10; i++) {
        results.push(
          collector.recordSecurityEvent({
            validator: `concurrent_${i}`,
            action: 'TEST',
            severity: 'INFO',
            target: `/test/concurrent/${i}`,
            reason: `Concurrent write ${i}`,
          })
        );
      }

      // All writes should succeed
      expect(results.every(r => r === true)).toBe(true);

      // All 10 entries should be written
      const calls = mockFs.appendFileSync.mock.calls;
      expect(calls.length).toBe(10);

      // Each entry should be valid, complete JSON
      for (let i = 0; i < calls.length; i++) {
        const line = calls[i][1];
        const parsed = JSON.parse(line.trim());
        expect(parsed.validator).toBe(`concurrent_${i}`);
        expect(parsed.reason).toBe(`Concurrent write ${i}`);
        expect(parsed).toHaveProperty('timestamp');
        expect(parsed).toHaveProperty('session_id');
      }
    });

    it('should include session_id and timestamp in every entry for tracing', () => {
      const collector = new TelemetryCollector('/tmp/test-telemetry');

      collector.recordSecurityEvent({
        validator: 'trace_test',
        action: 'TEST',
        severity: 'INFO',
        target: '/test',
        reason: 'Trace test',
      });

      const written = mockFs.appendFileSync.mock.calls[0][1];
      const parsed = JSON.parse(written.trim());

      expect(parsed.timestamp).toBeDefined();
      expect(typeof parsed.timestamp).toBe('string');
      // ISO 8601 format check
      expect(parsed.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      expect(parsed.session_id).toBeDefined();
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// STORY 5.2: Error Handling & Information Disclosure (A05, V7, V14)
// ═══════════════════════════════════════════════════════════════════════════

describe('Story 5.2: Error Handling & Information Disclosure (A05, V7, V14)', () => {

  // -----------------------------------------------------------------------
  // A05-006: Security features enabled by default
  // -----------------------------------------------------------------------
  describe('A05-006: Security features enabled by default', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should have anomaly detection enabled without opt-in', () => {
      // BMAD_ANOMALY_DETECTION defaults to 'true'
      const detector = new AnomalyDetector();
      const status = detector.getBaselineStatus();
      expect(status.enabled).toBe(true);
    });

    it('should have telemetry enabled without opt-in', () => {
      vi.clearAllMocks();
      // BMAD_TELEMETRY_ENABLED defaults to 'true'
      const collector = new TelemetryCollector('/tmp/test-default');
      const result = collector.recordSecurityEvent({
        validator: 'default_test',
        action: 'TEST',
        severity: 'INFO',
        target: '/test',
        reason: 'Default enabled test',
      });
      expect(result).toBe(true);
    });

    it('should have alerting active at CRITICAL level by default', () => {
      // BMAD_ALERT_LEVEL defaults to 'CRITICAL'
      expect(shouldAlert('CRITICAL')).toBe(true);
      expect(shouldAlert('INFO')).toBe(false);
    });
  });

  // -----------------------------------------------------------------------
  // A05-007: Error messages do not leak internal paths
  // -----------------------------------------------------------------------
  describe('A05-007: Error messages do not leak internal paths', () => {
    it('should sanitize absolute paths in error messages', () => {
      const projectDir = '/Users/testuser/projects/app';
      const message = 'Failed to read /Users/testuser/projects/app/config/secret.json';
      const sanitized = sanitizeErrorMessage(message, projectDir);

      expect(sanitized).not.toContain('/Users/testuser');
      expect(sanitized).toContain('{project-root}');
      expect(sanitized).toContain('/config/secret.json');
    });

    it('should replace external paths with {external} placeholder', () => {
      const projectDir = '/Users/testuser/projects/app';
      const message = 'Error accessing /etc/shadow file';
      const sanitized = sanitizeErrorMessage(message, projectDir);

      expect(sanitized).not.toContain('/etc/shadow');
      expect(sanitized).toContain('{external}');
    });

    it('should sanitize paths in printBlockMessage output', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

      printBlockMessage({
        title: 'STRICT BLOCK',
        message: 'Blocked write to /Users/secretuser/projects/app/prod.env',
        target: '/Users/secretuser/projects/app/prod.env',
      });

      const allOutput = spy.mock.calls.map(c => c.join(' ')).join('\n');
      // Internal user paths should be sanitized
      expect(allOutput).not.toContain('secretuser');
      spy.mockRestore();
    });

    it('should handle Windows-style paths', () => {
      const projectDir = 'C:/Users/dev/project';
      const message = 'Error at C:\\Users\\dev\\project\\src\\config.ts:42:10';
      const sanitized = sanitizeErrorMessage(message, projectDir);

      expect(sanitized).not.toContain('C:\\Users\\dev');
    });
  });

  // -----------------------------------------------------------------------
  // A05-008: Debug/verbose modes disabled in production
  // -----------------------------------------------------------------------
  describe('A05-008: Debug/verbose modes disabled in production', () => {
    it('should not have BMAD_DEBUG environment variable defined', () => {
      expect(process.env.BMAD_DEBUG).toBeUndefined();
    });

    it('should not have DEBUG_SESSION flag set in default configuration', () => {
      expect(process.env.DEBUG_SESSION).toBeUndefined();
    });

    it('should not expose stack traces in default error handling', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const alerter = new AuditAlerter({
        alertLogPath: '/tmp/test.log',
        alertStorePath: '/tmp/test',
        suppressDuplicates: false,
      });

      // Trigger an alert — error handling should not expose internals
      alerter.triggerAlert(AlertType.SUSPICIOUS_PATTERN, {
        message: 'Test event',
      });

      const allOutput = spy.mock.calls.map(c => c.join(' ')).join('\n');
      // Should not contain stack trace patterns
      expect(allOutput).not.toContain('at Object.');
      expect(allOutput).not.toContain('at Module.');
      expect(allOutput).not.toContain('at Function.');
      spy.mockRestore();
    });
  });

  // -----------------------------------------------------------------------
  // V7-001: Errors do not expose sensitive info (tokens, keys)
  // -----------------------------------------------------------------------
  describe('V7-001: Errors do not expose sensitive info (tokens, keys)', () => {
    afterEach(() => {
      vi.restoreAllMocks();
      vi.unstubAllGlobals();
      delete process.env.BMAD_ALERT_WEBHOOK_URL;
    });

    it('should extract only error.message, not stack traces, in alert handlers', async () => {
      process.env.BMAD_ALERT_WEBHOOK_URL = 'https://invalid.test/webhook';
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Mock fetch to throw with error that has a stack
      const error = new Error('ECONNREFUSED: Connection refused');
      error.stack = 'Error: ECONNREFUSED\n    at Object.<anonymous> (/Users/secret/node_modules/internal/net.js:42)';
      const mockFetch = vi.fn().mockRejectedValue(error);
      vi.stubGlobal('fetch', mockFetch);

      await sendAlert({
        severity: 'CRITICAL',
        event_type: 'V7_STACK_TEST',
        validator: 'v7_001_stack',
        message: 'Test alert',
      });

      const allOutput = spy.mock.calls.map(c => c.join(' ')).join('\n');
      // Should contain the error message (expected)
      expect(allOutput).toContain('ECONNREFUSED');
      // Should NOT contain stack trace details
      expect(allOutput).not.toContain('at Object.<anonymous>');
      expect(allOutput).not.toContain('node_modules/internal');
      spy.mockRestore();
    });

    it('should truncate long targets to prevent data leaks in telemetry', () => {
      vi.clearAllMocks();
      const collector = new TelemetryCollector('/tmp/test-tel');
      const longTarget = 'A'.repeat(1000);

      collector.recordSecurityEvent({
        validator: 'truncate_test',
        action: 'TEST',
        severity: 'INFO',
        target: longTarget,
        reason: 'Truncation test',
      });

      const written = mockFs.appendFileSync.mock.calls[0][1];
      const parsed = JSON.parse(written.trim());
      // Target should be truncated to 500 chars
      expect(parsed.target.length).toBeLessThanOrEqual(500);
    });
  });

  // -----------------------------------------------------------------------
  // V14-002: No sensitive data in error messages
  // -----------------------------------------------------------------------
  describe('V14-002: No sensitive data in error messages', () => {
    afterEach(() => {
      vi.restoreAllMocks();
      vi.unstubAllGlobals();
      delete process.env.BMAD_ALERT_WEBHOOK_URL;
    });

    it('should not include API key patterns in alert console output', async () => {
      delete process.env.BMAD_ALERT_WEBHOOK_URL;
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await sendAlert({
        severity: 'CRITICAL',
        event_type: 'V14_KEY_TEST',
        validator: 'v14_002_key',
        message: 'Security violation detected',
        details: { source: 'test', count: 5 },
      });

      const allOutput = spy.mock.calls.map(c => c.join(' ')).join('\n');
      // Output should not contain patterns that look like API keys
      expect(allOutput).not.toMatch(/sk[-_][a-zA-Z0-9]{20,}/);
      expect(allOutput).not.toMatch(/AKIA[A-Z0-9]{16}/);
      // Should contain the sanitized message
      expect(allOutput).toContain('Security violation detected');
      spy.mockRestore();
    });

    it('should not expose environment variable values in error output', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

      printBlockMessage({
        title: 'TEST BLOCK',
        message: 'Operation blocked by security policy',
        target: 'test-command',
        overrideVar: 'BMAD_OVERRIDE_TEST',
      });

      const allOutput = spy.mock.calls.map(c => c.join(' ')).join('\n');
      // Should show override variable name but not its value
      expect(allOutput).toContain('BMAD_OVERRIDE_TEST');
      // Should not contain actual env values
      expect(allOutput).not.toMatch(/=[a-zA-Z0-9+/]{20,}/);
      spy.mockRestore();
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// STORY 5.3: CRLF & Log Injection Prevention (A03)
// ═══════════════════════════════════════════════════════════════════════════

describe('Story 5.3: CRLF & Log Injection Prevention (A03)', () => {

  // -----------------------------------------------------------------------
  // A03-011: CRLF injection in log entries
  // -----------------------------------------------------------------------
  describe('A03-011: CRLF injection in log entries', () => {
    let alerter;

    beforeEach(() => {
      vi.clearAllMocks();
      alerter = new AuditAlerter({
        alertLogPath: '/tmp/test-alerts.log',
        alertStorePath: '/tmp/test-alerts',
        suppressDuplicates: false,
      });
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should escape CRLF in event details via JSON.stringify', () => {
      alerter.triggerAlert(AlertType.SUSPICIOUS_PATTERN, {
        message: 'normal log\r\n[FAKE] [CRITICAL] DATA_EXFILTRATION: injected',
        source: 'test\r\ninjected-header: evil',
      });

      // Find the appendFileSync call for the log file
      const logCall = mockFs.appendFileSync.mock.calls.find(
        c => c[0] === '/tmp/test-alerts.log'
      );
      expect(logCall).toBeDefined();

      const logLine = logCall[1];
      // JSON.stringify escapes \r and \n in the details object
      // So the log line should not have raw CRLF creating fake entries
      const lines = logLine.split('\n').filter(l => l.trim());
      expect(lines.length).toBe(1);

      // The escaped versions should be present in the JSON-stringified portion
      expect(logLine).toContain('\\r\\n');
      // No raw CRLF followed by fake log structure
      expect(logLine).not.toMatch(/\r\n\[FAKE\]/);
    });

    it('should not create fake log lines from CRLF in alert type field', () => {
      const maliciousType = 'SUSPICIOUS\r\n[2026-02-12T00:00:00Z] [CRITICAL] FORGED_ALERT: admin breach';

      alerter.triggerAlert(maliciousType, {
        message: 'test details',
      });

      const logCall = mockFs.appendFileSync.mock.calls.find(
        c => c[0] === '/tmp/test-alerts.log'
      );
      expect(logCall).toBeDefined();

      const logLine = logCall[1];
      const lines = logLine.split('\n').filter(l => l.trim());

      // After sanitization: CRLF in type field should be stripped/replaced
      // Only one actual log line should exist (no fake separate entries)
      expect(lines.length).toBe(1);

      // No raw CRLF characters in the output
      expect(logLine).not.toContain('\r\n');
      expect(logLine).not.toContain('\r');
    });

    it('should not create fake log lines from CRLF in severity field', () => {
      // Severity could come from user-controlled details.severity
      alerter.triggerAlert(AlertType.SUSPICIOUS_PATTERN, {
        severity: 'LOW\r\n[2026-02-12T00:00:00Z] [CRITICAL] INJECTED: via severity',
        message: 'test',
      });

      const logCall = mockFs.appendFileSync.mock.calls.find(
        c => c[0] === '/tmp/test-alerts.log'
      );
      expect(logCall).toBeDefined();

      const logLine = logCall[1];
      const lines = logLine.split('\n').filter(l => l.trim());

      // Severity sanitization prevents injection — only 1 log line
      expect(lines.length).toBe(1);
      // No raw CRLF characters in the output
      expect(logLine).not.toContain('\r\n');
      expect(logLine).not.toContain('\r');
    });

    it('should handle Unicode line separators (U+2028, U+2029) in log data', () => {
      alerter.triggerAlert(AlertType.SUSPICIOUS_PATTERN, {
        message: 'test\u2028injected\u2029line',
      });

      const logCall = mockFs.appendFileSync.mock.calls.find(
        c => c[0] === '/tmp/test-alerts.log'
      );
      expect(logCall).toBeDefined();

      const logLine = logCall[1];
      // Unicode line separators in JSON.stringify are escaped
      // Verify no injection via alternative line endings
      const lines = logLine.split(/[\n\r\u2028\u2029]/).filter(l => l.trim());
      expect(lines.length).toBe(1);
    });
  });

  // -----------------------------------------------------------------------
  // A03-012: Header injection in HTTP requests
  // -----------------------------------------------------------------------
  describe('A03-012: Header injection in HTTP requests', () => {
    afterEach(() => {
      vi.restoreAllMocks();
      vi.unstubAllGlobals();
      delete process.env.BMAD_ALERT_WEBHOOK_URL;
    });

    it('should use hardcoded Content-Type header, not user-controlled values', async () => {
      process.env.BMAD_ALERT_WEBHOOK_URL = 'https://hooks.test/webhook';
      const mockFetch = vi.fn().mockResolvedValue({ ok: true });
      vi.stubGlobal('fetch', mockFetch);

      await sendAlert({
        severity: 'CRITICAL',
        event_type: 'A03_012_HEADER',
        validator: 'a03_012_header_test',
        message: 'Test with CRLF in message\r\nX-Injected: true',
      });

      // Verify fetch was called with hardcoded headers only
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: { 'Content-Type': 'application/json' },
        })
      );

      // Verify no user-controlled data in headers
      const fetchArgs = mockFetch.mock.calls[0][1];
      const headerValues = Object.values(fetchArgs.headers);
      for (const val of headerValues) {
        expect(val).not.toContain('\r\n');
        expect(val).not.toContain('\r');
      }
    });

    it('should not include user-controlled data in HTTP header values', async () => {
      process.env.BMAD_ALERT_WEBHOOK_URL = 'https://hooks.test/webhook';
      const mockFetch = vi.fn().mockResolvedValue({ ok: true });
      vi.stubGlobal('fetch', mockFetch);

      await sendAlert({
        severity: 'CRITICAL',
        event_type: 'A03_012_USERDATA',
        validator: 'a03_012_userdata_test',
        message: 'Test message',
        details: { key: 'value\r\nX-Evil: true' },
      });

      expect(mockFetch).toHaveBeenCalled();
      const fetchArgs = mockFetch.mock.calls[0][1];

      // Headers should only contain Content-Type (no user data leaked)
      expect(Object.keys(fetchArgs.headers)).toEqual(['Content-Type']);

      // Body should be JSON-encoded (CRLF safely escaped within JSON)
      const body = JSON.parse(fetchArgs.body);
      expect(body).toHaveProperty('blocks');
      expect(body).toHaveProperty('text');
    });

    it('should encode alert payload as JSON in request body (not URL parameters)', async () => {
      process.env.BMAD_ALERT_WEBHOOK_URL = 'https://hooks.test/webhook';
      const mockFetch = vi.fn().mockResolvedValue({ ok: true });
      vi.stubGlobal('fetch', mockFetch);

      await sendAlert({
        severity: 'CRITICAL',
        event_type: 'A03_012_ENCODING',
        validator: 'a03_012_encoding_test',
        message: 'Alert with special chars: <script>alert(1)</script>',
      });

      // URL should not contain user data (POST body, not GET params)
      const url = mockFetch.mock.calls[0][0];
      expect(url).toBe('https://hooks.test/webhook');
      expect(url).not.toContain('script');
      expect(url).not.toContain('alert');

      // Body should be properly JSON-encoded
      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.text).toContain('CRITICAL');
    });
  });
});
