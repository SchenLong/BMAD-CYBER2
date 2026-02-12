/**
 * Stage 13 Validation Tests
 * Comprehensive tests for all VAL-13 compliance modules
 *
 * Rewritten from custom test runner to proper vitest format.
 */

import { describe, expect, it } from 'vitest';
import crypto from 'crypto';

// =====================================================
// VAL-13-001: Evidence Integrity Tests
// =====================================================
describe('VAL-13-001: Evidence Integrity', () => {
  it('exports hashFile', async () => {
    const mod = await import('../evidence-integrity.js');
    expect(typeof mod.hashFile).toBe('function');
  });

  it('exports generateTimestampToken', async () => {
    const mod = await import('../evidence-integrity.js');
    expect(typeof mod.generateTimestampToken).toBe('function');
  });

  it('exports verifyTimestampToken', async () => {
    const mod = await import('../evidence-integrity.js');
    expect(typeof mod.verifyTimestampToken).toBe('function');
  });

  it('exports setReadOnly', async () => {
    const mod = await import('../evidence-integrity.js');
    expect(typeof mod.setReadOnly).toBe('function');
  });

  it('exports registerAlertHandler', async () => {
    const mod = await import('../evidence-integrity.js');
    expect(typeof mod.registerAlertHandler).toBe('function');
  });

  it('TSA timestamp token generation works', async () => {
    const mod = await import('../evidence-integrity.js');
    const testHash = crypto.createHash('sha256').update('test').digest('hex');
    const token = mod.generateTimestampToken(testHash);

    expect(token.timestamp).toBeDefined();
    expect(token.signature).toBeDefined();
    expect(token.dataHash).toBe(testHash);
  });

  it('TSA timestamp verification works', async () => {
    const mod = await import('../evidence-integrity.js');
    const testHash = crypto.createHash('sha256').update('test').digest('hex');
    const token = mod.generateTimestampToken(testHash);
    const result = mod.verifyTimestampToken(token, testHash);

    expect(result.valid).toBe(true);
  });

  it('hashString function works', async () => {
    const mod = await import('../evidence-integrity.js');
    const hash = mod.hashString('test content');
    expect(hash).toHaveLength(64);
  });
});

// =====================================================
// VAL-13-002: Chain of Custody Tests
// =====================================================
describe('VAL-13-002: Chain of Custody', () => {
  it('exports CustodyChain', async () => {
    const mod = await import('../chain-of-custody.js');
    expect(typeof mod.CustodyChain).toBe('function');
  });

  it('exports CustodyEventType', async () => {
    const mod = await import('../chain-of-custody.js');
    expect(mod.CustodyEventType.CREATED).toBeDefined();
    expect(mod.CustodyEventType.TRANSFERRED).toBeDefined();
    expect(mod.CustodyEventType.ACKNOWLEDGED).toBeDefined();
  });

  it('CustodyChain can be instantiated', async () => {
    const mod = await import('../chain-of-custody.js');
    const chain = new mod.CustodyChain('test-evidence-001', '/tmp/test-custody');
    expect(chain.evidenceId).toBe('test-evidence-001');
  });

  it('CustodyChain can record creation', async () => {
    const mod = await import('../chain-of-custody.js');
    const chain = new mod.CustodyChain('test-evidence-002', '/tmp/test-custody');
    const event = chain.recordCreation('user-001', 'Security Analyst', 'scan', 'Validation testing');

    expect(event.eventType).toBe('CREATED');
    expect(event.hash).toBeDefined();
  });

  it('CustodyChain transfer acknowledgment works', async () => {
    const mod = await import('../chain-of-custody.js');
    const chain = new mod.CustodyChain('test-evidence-003', '/tmp/test-custody');

    const transfer = chain.createTransferRecord({
      fromUserId: 'user-001',
      fromRole: 'Analyst',
      fromSystem: 'system-a',
      toUserId: 'user-002',
      toRole: 'Auditor',
      toSystem: 'system-b',
      transferMethod: 'SFTP',
      reason: 'Audit review',
      evidenceHash: 'abc123',
    });

    expect(transfer.transferId).toBeDefined();
    expect(transfer.status).toBe('PENDING');

    const ack = chain.acknowledgeTransfer(transfer.transferId, {
      recipientId: 'user-002',
      hashAfterTransfer: 'abc123',
      verificationStatus: 'VERIFIED',
    });

    expect(ack.success).toBe(true);
    expect(ack.integrityVerified).toBe(true);
  });
});

// =====================================================
// VAL-13-003: Retention Policy Tests
// =====================================================
describe('VAL-13-003: Retention Policy', () => {
  it('exports RetentionPolicy', async () => {
    const mod = await import('../retention-policy.js');
    expect(typeof mod.RetentionPolicy).toBe('function');
  });

  it('exports RetentionPeriods', async () => {
    const mod = await import('../retention-policy.js');
    expect(mod.RetentionPeriods.SECURITY_INCIDENT).toBe(365 * 7);
    expect(mod.RetentionPeriods.VALIDATION_LOGS).toBe(90);
  });

  it('RetentionPolicy getRetentionPeriod works', async () => {
    const mod = await import('../retention-policy.js');
    const policy = new mod.RetentionPolicy('/tmp/test-retention');

    expect(policy.getRetentionPeriod('security-finding')).toBe(365 * 7);
    expect(policy.getRetentionPeriod('validation-log')).toBe(90);
  });

  it('RetentionPolicy legal hold works', async () => {
    const mod = await import('../retention-policy.js');
    const policy = new mod.RetentionPolicy('/tmp/test-retention');

    const hold = policy.setLegalHold('evidence-001', {
      reason: 'Litigation pending',
      authorizedBy: 'legal-001',
      caseReference: 'CASE-2026-001',
    });

    expect(hold.holdId).toBeDefined();
    expect(policy.hasLegalHold('evidence-001')).toBe(true);
  });

  it('RetentionPolicy isExpired checks legal hold', async () => {
    const mod = await import('../retention-policy.js');
    const policy = new mod.RetentionPolicy('/tmp/test-retention');

    policy.setLegalHold('evidence-002', {
      reason: 'Test hold',
      authorizedBy: 'admin',
    });

    const record = {
      evidenceId: 'evidence-002',
      type: 'validation-log',
      createdAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString(),
    };

    const status = policy.isExpired(record);
    expect(status.expired).toBe(false);
    expect(status.reason).toBe('LEGAL_HOLD');
  });
});

// =====================================================
// VAL-13-004: GDPR Compliance Tests
// =====================================================
describe('VAL-13-004: GDPR Compliance', () => {
  it('exports PIIScanner', async () => {
    const mod = await import('../gdpr-compliance.js');
    expect(typeof mod.PIIScanner).toBe('function');
  });

  it('exports DataSubjectRequestHandler', async () => {
    const mod = await import('../gdpr-compliance.js');
    expect(typeof mod.DataSubjectRequestHandler).toBe('function');
  });

  it('PIIScanner detects email addresses', async () => {
    const mod = await import('../gdpr-compliance.js');
    const scanner = new mod.PIIScanner();
    const result = scanner.scan('Contact us at test@example.com for more info');

    expect(result.hasPII).toBe(true);
    expect(result.findings.some(f => f.type === 'email')).toBe(true);
  });

  it('PIIScanner detects phone numbers', async () => {
    const mod = await import('../gdpr-compliance.js');
    const scanner = new mod.PIIScanner();
    const result = scanner.scan('Call us at 555-123-4567');

    expect(result.hasPII).toBe(true);
    expect(result.findings.some(f => f.type === 'phone')).toBe(true);
  });

  it('PIIScanner redact function works', async () => {
    const mod = await import('../gdpr-compliance.js');
    const scanner = new mod.PIIScanner();
    const result = scanner.redact('Email: test@example.com');

    expect(result.redactedContent).toContain('[REDACTED-EMAIL]');
    expect(result.redactionCount).toBeGreaterThan(0);
  });

  it('DSR handler creates access request', async () => {
    const mod = await import('../gdpr-compliance.js');
    const handler = new mod.DataSubjectRequestHandler('/tmp/test-dsr');

    const request = handler.createAccessRequest({
      subjectId: 'user-001',
      email: 'user@example.com',
      name: 'Test User',
      verificationMethod: 'email',
    });

    expect(request.requestId).toBeDefined();
    expect(request.type).toBe('ACCESS');
    expect(request.gdprArticle).toBe('15');
  });

  it('DSR handler creates erasure request', async () => {
    const mod = await import('../gdpr-compliance.js');
    const handler = new mod.DataSubjectRequestHandler('/tmp/test-dsr');

    const request = handler.createErasureRequest({
      subjectId: 'user-002',
      email: 'user2@example.com',
      reason: 'User requested deletion',
      scope: 'ALL',
    });

    expect(request.type).toBe('ERASURE');
    expect(request.gdprArticle).toBe('17');
  });
});

// =====================================================
// VAL-13-005: Audit Trail Alerting Tests
// =====================================================
describe('VAL-13-005: Audit Trail Alerting', () => {
  it('exports AuditAlerter', async () => {
    const mod = await import('../audit/audit-alerting.js');
    expect(typeof mod.AuditAlerter).toBe('function');
  });

  it('exports AlertType enum', async () => {
    const mod = await import('../audit/audit-alerting.js');
    expect(mod.AlertType.TAMPER_DETECTED).toBeDefined();
    expect(mod.AlertType.CHAIN_BREAK).toBeDefined();
  });

  it('AuditAlerter triggers alerts', async () => {
    const mod = await import('../audit/audit-alerting.js');
    const alerter = new mod.AuditAlerter({ alertStorePath: '/tmp/test-alerts' });

    let receivedAlert = null;
    alerter.registerAlertHandler((alert) => {
      receivedAlert = alert;
    });

    const alert = alerter.triggerAlert(mod.AlertType.TAMPER_DETECTED, {
      file: 'test.json',
      expectedHash: 'abc',
      actualHash: 'def',
    });

    expect(alert).not.toBeNull();
    expect(alert.type).toBe('TAMPER_DETECTED');
    expect(receivedAlert).not.toBeNull();
  });

  it('AuditCompletenessChecker verifies chain integrity', async () => {
    const mod = await import('../audit/audit-alerting.js');
    const checker = new mod.AuditCompletenessChecker();

    const entries = [
      { id: '1', timestamp: '2026-01-01T00:00:00Z', hash: 'hash1', previousHash: '0'.repeat(64) },
      { id: '2', timestamp: '2026-01-01T00:01:00Z', hash: 'hash2', previousHash: 'hash1' },
    ];

    const result = checker.verifyChainIntegrity(entries);
    expect(result.entriesVerified).toBe(2);
  });
});

// =====================================================
// VAL-13-006: Auditor Portal Tests
// =====================================================
describe('VAL-13-006: Auditor Portal', () => {
  it('exports AuditorSession', async () => {
    const mod = await import('../auditor-portal.js');
    expect(typeof mod.AuditorSession).toBe('function');
  });

  it('exports AuditorAccessManager', async () => {
    const mod = await import('../auditor-portal.js');
    expect(typeof mod.AuditorAccessManager).toBe('function');
  });

  it('AuditorSession creates session with token', async () => {
    const mod = await import('../auditor-portal.js');
    const sessionManager = new mod.AuditorSession('/tmp/test-auditor-sessions');

    const session = sessionManager.createSession('auditor-001', {
      evidenceTypes: ['all'],
      categories: ['compliance'],
    });

    expect(session.sessionId).toBeDefined();
    expect(session.token).toBeDefined();
    expect(session.token).toHaveLength(64);
  });

  it('AuditorSession validates session token', async () => {
    const mod = await import('../auditor-portal.js');
    const sessionManager = new mod.AuditorSession('/tmp/test-auditor-sessions');

    const session = sessionManager.createSession('auditor-002', {
      evidenceTypes: ['all'],
    });

    const validation = sessionManager.validateSession(session.token);
    expect(validation.valid).toBe(true);
    expect(validation.session.auditorId).toBe('auditor-002');
  });

  it('AuditorSession rejects invalid token', async () => {
    const mod = await import('../auditor-portal.js');
    const sessionManager = new mod.AuditorSession('/tmp/test-auditor-sessions');

    const validation = sessionManager.validateSession('invalid-token');
    expect(validation.valid).toBe(false);
    expect(validation.error).toBe('INVALID_TOKEN');
  });
});

// =====================================================
// VAL-13-007: Remediation Tracking Tests
// =====================================================
describe('VAL-13-007: Remediation Tracking', () => {
  it('exports RemediationTracker', async () => {
    const mod = await import('../remediation-tracker.js');
    expect(typeof mod.RemediationTracker).toBe('function');
  });

  it('exports Finding', async () => {
    const mod = await import('../remediation-tracker.js');
    expect(typeof mod.Finding).toBe('function');
  });

  it('RemediationTracker creates finding', async () => {
    const mod = await import('../remediation-tracker.js');
    const tracker = new mod.RemediationTracker('/tmp/test-remediation');

    const finding = tracker.createFinding({
      title: 'Test Vulnerability',
      description: 'A test vulnerability for validation',
      severity: 'HIGH',
      category: 'VULNERABILITY',
    });

    expect(finding.id).toBeDefined();
    expect(finding.status).toBe('OPEN');
  });

  it('RemediationTracker links evidence to finding', async () => {
    const mod = await import('../remediation-tracker.js');
    const tracker = new mod.RemediationTracker('/tmp/test-remediation');

    const finding = tracker.createFinding({
      title: 'Test Finding',
      severity: 'MEDIUM',
    });

    const link = tracker.linkEvidence(finding.id, 'evidence/scan-result.json', {
      linkType: 'supporting',
      linkedBy: 'user-001',
      hash: 'abc123',
    });

    expect(link.evidenceId).toBe('evidence/scan-result.json');
    expect(link.linkType).toBe('supporting');
  });

  it('RemediationTracker updates status', async () => {
    const mod = await import('../remediation-tracker.js');
    const tracker = new mod.RemediationTracker('/tmp/test-remediation');

    const finding = tracker.createFinding({
      title: 'Status Test',
      severity: 'LOW',
    });

    tracker.updateStatus(finding.id, 'IN_PROGRESS', {
      changedBy: 'user-001',
      reason: 'Starting remediation',
    });

    const updated = tracker.getFinding(finding.id);
    expect(updated.status).toBe('IN_PROGRESS');
  });

  it('Finding calculates SLA status', async () => {
    const mod = await import('../remediation-tracker.js');

    const finding = new mod.Finding({
      title: 'SLA Test',
      severity: 'CRITICAL',
      createdAt: new Date().toISOString(),
    });

    const slaStatus = finding.getSLAStatus();
    expect(slaStatus.status).toBe('ON_TRACK');
    expect(slaStatus.hoursRemaining).toBeLessThanOrEqual(24);
  });

  it('RemediationTracker generates report', async () => {
    const mod = await import('../remediation-tracker.js');
    const tracker = new mod.RemediationTracker('/tmp/test-remediation');

    tracker.createFinding({ title: 'Report Test 1', severity: 'HIGH' });
    tracker.createFinding({ title: 'Report Test 2', severity: 'MEDIUM' });

    const report = tracker.generateRemediationReport();
    expect(report.summary.totalFindings).toBeGreaterThanOrEqual(2);
    expect(report.compliance).toBeDefined();
  });
});
