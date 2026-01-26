/**
 * BMAD Telemetry Collector Tests
 * ================================
 * Unit tests for telemetry collection.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {
  TelemetryCollector,
  recordSecurityEvent,
  recordRateLimitMetrics,
} from '../../.claude/validators-node/src/observability/telemetry.js';

describe('TelemetryCollector', () => {
  let testDir: string;
  let collector: TelemetryCollector;

  beforeAll(() => {
    // Create a temp directory for tests
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bmad-telemetry-test-'));
    collector = new TelemetryCollector(testDir);
  });

  afterAll(() => {
    // Clean up temp directory
    fs.rmSync(testDir, { recursive: true, force: true });
  });

  it('should record security events', () => {
    const result = collector.recordSecurityEvent({
      validator: 'test_validator',
      action: 'ALLOWED',
      severity: 'INFO',
      target: '/test/path',
      reason: 'Test event',
    });

    expect(result).toBe(true);

    // Verify file was written
    const eventFile = path.join(testDir, 'security_events.jsonl');
    expect(fs.existsSync(eventFile)).toBe(true);

    // Read and verify content
    const content = fs.readFileSync(eventFile, 'utf8');
    const lines = content.trim().split('\n');
    expect(lines.length).toBeGreaterThanOrEqual(1);

    const event = JSON.parse(lines[lines.length - 1]!);
    expect(event.validator).toBe('test_validator');
    expect(event.action).toBe('ALLOWED');
    expect(event.severity).toBe('INFO');
    expect(event.target).toBe('/test/path');
    expect(event.reason).toBe('Test event');
    expect(event.timestamp).toBeDefined();
    expect(event.session_id).toBeDefined();
  });

  it('should record security events with metadata', () => {
    const result = collector.recordSecurityEvent({
      validator: 'test_validator',
      action: 'BLOCKED',
      severity: 'BLOCKED',
      target: '/dangerous/path',
      reason: 'Blocked for testing',
      latencyMs: 5.5,
      metadata: { block_type: 'ABSOLUTE', extra: 'data' },
    });

    expect(result).toBe(true);

    const eventFile = path.join(testDir, 'security_events.jsonl');
    const content = fs.readFileSync(eventFile, 'utf8');
    const lines = content.trim().split('\n');
    const event = JSON.parse(lines[lines.length - 1]!);

    expect(event.latency_ms).toBe(5.5);
    expect(event.metadata.block_type).toBe('ABSOLUTE');
    expect(event.metadata.extra).toBe('data');
  });

  it('should record rate limit metrics', () => {
    const result = collector.recordRateLimitMetrics({
      operationType: 'bash',
      requestsCount: 50,
      limit: 100,
      windowSeconds: 60,
      windowRemainingS: 30,
      backoffActive: false,
    });

    expect(result).toBe(true);

    const metricsFile = path.join(testDir, 'rate_limit_metrics.jsonl');
    expect(fs.existsSync(metricsFile)).toBe(true);

    const content = fs.readFileSync(metricsFile, 'utf8');
    const lines = content.trim().split('\n');
    const metrics = JSON.parse(lines[lines.length - 1]!);

    expect(metrics.operation_type).toBe('bash');
    expect(metrics.requests_count).toBe(50);
    expect(metrics.limit).toBe(100);
    expect(metrics.utilization_pct).toBe(50);
  });

  it('should record permission checks', () => {
    const result = collector.recordPermissionCheck({
      pluginName: 'test-plugin',
      capability: 'filesystem.read',
      requestedResource: '/test/file.txt',
      decision: 'GRANTED',
      reason: 'Path matches allowed pattern',
      matchedPattern: 'src/**/*.ts',
    });

    expect(result).toBe(true);

    const permFile = path.join(testDir, 'permission_audit.jsonl');
    expect(fs.existsSync(permFile)).toBe(true);
  });

  it('should record resource usage', () => {
    const result = collector.recordResourceUsage({
      contextTokensUsed: 50000,
      contextTokensMax: 200000,
      contextStatus: 'ok',
      memoryMb: 256.5,
      memoryLimitMb: 1024,
    });

    expect(result).toBe(true);

    const resourceFile = path.join(testDir, 'resource_usage.jsonl');
    expect(fs.existsSync(resourceFile)).toBe(true);

    const content = fs.readFileSync(resourceFile, 'utf8');
    const lines = content.trim().split('\n');
    const resource = JSON.parse(lines[lines.length - 1]!);

    expect(resource.context_tokens_used).toBe(50000);
    expect(resource.context_pct).toBe(25);
    expect(resource.memory_mb).toBe(256.5);
    expect(resource.memory_pct).toBeCloseTo(25.05, 1);
  });

  it('should record supply chain verification', () => {
    const result = collector.recordSupplyChainVerification({
      verificationType: 'file',
      filePath: '/test/skill.ts',
      verificationResult: 'VALID',
      verificationMode: 'strict',
      hashMatch: true,
      expectedHash: 'abc123',
      actualHash: 'abc123',
      latencyMs: 2.5,
    });

    expect(result).toBe(true);
  });

  it('should record confidence analysis', () => {
    const result = collector.recordConfidenceAnalysis({
      responseLength: 500,
      uncertaintyMarkers: { high: 0, medium: 1, low: 2 },
      confidenceScore: 0.85,
      confidenceLevel: 'HIGH',
      notes: ['Test analysis'],
    });

    expect(result).toBe(true);
  });

  it('should record anomaly signals', () => {
    const result = collector.recordAnomalySignal({
      anomalyType: 'volume_spike',
      metricName: 'operation_count.bash',
      baselineValue: 10.5,
      observedValue: 50.0,
      deviationStd: 4.2,
      anomalyScore: 0.75,
      alertTriggered: true,
      alertSeverity: 'WARNING',
    });

    expect(result).toBe(true);
  });

  it('should truncate long targets', () => {
    const longTarget = 'x'.repeat(1000);
    const result = collector.recordSecurityEvent({
      validator: 'test',
      action: 'ALLOWED',
      severity: 'INFO',
      target: longTarget,
      reason: 'Test',
    });

    expect(result).toBe(true);

    const eventFile = path.join(testDir, 'security_events.jsonl');
    const content = fs.readFileSync(eventFile, 'utf8');
    const lines = content.trim().split('\n');
    const event = JSON.parse(lines[lines.length - 1]!);

    // Target should be truncated to 500 chars
    expect(event.target.length).toBe(500);
  });
});

describe('Telemetry convenience functions', () => {
  it('should use global collector instance', () => {
    // These use the global singleton - just verify they don't throw
    expect(() => {
      recordSecurityEvent({
        validator: 'test',
        action: 'ALLOWED',
        severity: 'INFO',
        target: 'test',
        reason: 'test',
      });
    }).not.toThrow();

    expect(() => {
      recordRateLimitMetrics({
        operationType: 'test',
        requestsCount: 1,
        limit: 100,
        windowSeconds: 60,
        windowRemainingS: 59,
      });
    }).not.toThrow();
  });
});
