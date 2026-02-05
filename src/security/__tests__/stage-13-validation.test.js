/**
 * Stage 13 Validation Tests
 * Comprehensive tests for all VAL-13 compliance modules
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test results
const results = {
    passed: 0,
    failed: 0,
    tests: []
};

function test(name, fn) {
    try {
        fn();
        results.passed++;
        results.tests.push({ name, status: 'PASS' });
        console.log(`  ✓ ${name}`);
    } catch (err) {
        results.failed++;
        results.tests.push({ name, status: 'FAIL', error: err.message });
        console.log(`  ✗ ${name}: ${err.message}`);
    }
}

function assertEqual(actual, expected, message) {
    if (actual !== expected) {
        throw new Error(`${message}: expected ${expected}, got ${actual}`);
    }
}

function assertTrue(value, message) {
    if (!value) {
        throw new Error(message || 'Expected true');
    }
}

// =====================================================
// VAL-13-001: Evidence Integrity Tests
// =====================================================
console.log('\n=== VAL-13-001: Evidence Integrity ===');

test('evidence-integrity module exports hashFile', async () => {
    const module = await import('../evidence-integrity.js');
    assertTrue(typeof module.hashFile === 'function', 'hashFile should be a function');
});

test('evidence-integrity module exports generateTimestampToken', async () => {
    const module = await import('../evidence-integrity.js');
    assertTrue(typeof module.generateTimestampToken === 'function', 'generateTimestampToken should be a function');
});

test('evidence-integrity module exports verifyTimestampToken', async () => {
    const module = await import('../evidence-integrity.js');
    assertTrue(typeof module.verifyTimestampToken === 'function', 'verifyTimestampToken should be a function');
});

test('evidence-integrity module exports setReadOnly', async () => {
    const module = await import('../evidence-integrity.js');
    assertTrue(typeof module.setReadOnly === 'function', 'setReadOnly should be a function');
});

test('evidence-integrity module exports registerAlertHandler', async () => {
    const module = await import('../evidence-integrity.js');
    assertTrue(typeof module.registerAlertHandler === 'function', 'registerAlertHandler should be a function');
});

test('TSA timestamp token generation works', async () => {
    const module = await import('../evidence-integrity.js');
    const testHash = crypto.createHash('sha256').update('test').digest('hex');
    const token = module.generateTimestampToken(testHash);

    assertTrue(token.timestamp !== undefined, 'Token should have timestamp');
    assertTrue(token.signature !== undefined, 'Token should have signature');
    assertTrue(token.dataHash === testHash, 'Token should contain data hash');
});

test('TSA timestamp verification works', async () => {
    const module = await import('../evidence-integrity.js');
    const testHash = crypto.createHash('sha256').update('test').digest('hex');
    const token = module.generateTimestampToken(testHash);
    const result = module.verifyTimestampToken(token, testHash);

    assertTrue(result.valid, 'Valid token should verify');
});

test('hashString function works', async () => {
    const module = await import('../evidence-integrity.js');
    const hash = module.hashString('test content');
    assertEqual(hash.length, 64, 'SHA256 hash should be 64 chars');
});

// =====================================================
// VAL-13-002: Chain of Custody Tests
// =====================================================
console.log('\n=== VAL-13-002: Chain of Custody ===');

test('chain-of-custody module exports CustodyChain', async () => {
    const module = await import('../chain-of-custody.js');
    assertTrue(typeof module.CustodyChain === 'function', 'CustodyChain should be a class');
});

test('chain-of-custody module exports CustodyEventType', async () => {
    const module = await import('../chain-of-custody.js');
    assertTrue(module.CustodyEventType.CREATED !== undefined, 'CustodyEventType should have CREATED');
    assertTrue(module.CustodyEventType.TRANSFERRED !== undefined, 'CustodyEventType should have TRANSFERRED');
    assertTrue(module.CustodyEventType.ACKNOWLEDGED !== undefined, 'CustodyEventType should have ACKNOWLEDGED');
});

test('CustodyChain can be instantiated', async () => {
    const module = await import('../chain-of-custody.js');
    const chain = new module.CustodyChain('test-evidence-001', '/tmp/test-custody');
    assertTrue(chain.evidenceId === 'test-evidence-001', 'Should store evidence ID');
});

test('CustodyChain can record creation', async () => {
    const module = await import('../chain-of-custody.js');
    const chain = new module.CustodyChain('test-evidence-002', '/tmp/test-custody');
    const event = chain.recordCreation('user-001', 'Security Analyst', 'scan', 'Validation testing');

    assertTrue(event.eventType === 'CREATED', 'Event type should be CREATED');
    assertTrue(event.hash !== undefined, 'Event should have hash');
});

test('CustodyChain transfer acknowledgment works', async () => {
    const module = await import('../chain-of-custody.js');
    const chain = new module.CustodyChain('test-evidence-003', '/tmp/test-custody');

    const transfer = chain.createTransferRecord({
        fromUserId: 'user-001',
        fromRole: 'Analyst',
        fromSystem: 'system-a',
        toUserId: 'user-002',
        toRole: 'Auditor',
        toSystem: 'system-b',
        transferMethod: 'SFTP',
        reason: 'Audit review',
        evidenceHash: 'abc123'
    });

    assertTrue(transfer.transferId !== undefined, 'Transfer should have ID');
    assertTrue(transfer.status === 'PENDING', 'Transfer should be pending');

    const ack = chain.acknowledgeTransfer(transfer.transferId, {
        recipientId: 'user-002',
        hashAfterTransfer: 'abc123',
        verificationStatus: 'VERIFIED'
    });

    assertTrue(ack.success, 'Acknowledgment should succeed');
    assertTrue(ack.integrityVerified, 'Integrity should be verified');
});

// =====================================================
// VAL-13-003: Retention Policy Tests
// =====================================================
console.log('\n=== VAL-13-003: Retention Policy ===');

test('retention-policy module exports RetentionPolicy', async () => {
    const module = await import('../retention-policy.js');
    assertTrue(typeof module.RetentionPolicy === 'function', 'RetentionPolicy should be a class');
});

test('retention-policy module exports RetentionPeriods', async () => {
    const module = await import('../retention-policy.js');
    assertTrue(module.RetentionPeriods.SECURITY_INCIDENT === 365 * 7, 'Security incident should be 7 years');
    assertTrue(module.RetentionPeriods.VALIDATION_LOGS === 90, 'Validation logs should be 90 days');
});

test('RetentionPolicy getRetentionPeriod works', async () => {
    const module = await import('../retention-policy.js');
    const policy = new module.RetentionPolicy('/tmp/test-retention');

    assertEqual(policy.getRetentionPeriod('security-finding'), 365 * 7, 'Security finding retention');
    assertEqual(policy.getRetentionPeriod('validation-log'), 90, 'Validation log retention');
});

test('RetentionPolicy legal hold works', async () => {
    const module = await import('../retention-policy.js');
    const policy = new module.RetentionPolicy('/tmp/test-retention');

    const hold = policy.setLegalHold('evidence-001', {
        reason: 'Litigation pending',
        authorizedBy: 'legal-001',
        caseReference: 'CASE-2026-001'
    });

    assertTrue(hold.holdId !== undefined, 'Hold should have ID');
    assertTrue(policy.hasLegalHold('evidence-001'), 'Evidence should have legal hold');
});

test('RetentionPolicy isExpired checks legal hold', async () => {
    const module = await import('../retention-policy.js');
    const policy = new module.RetentionPolicy('/tmp/test-retention');

    policy.setLegalHold('evidence-002', {
        reason: 'Test hold',
        authorizedBy: 'admin'
    });

    const record = {
        evidenceId: 'evidence-002',
        type: 'validation-log',
        createdAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString() // 100 days ago
    };

    const status = policy.isExpired(record);
    assertTrue(!status.expired, 'Should not be expired due to legal hold');
    assertEqual(status.reason, 'LEGAL_HOLD', 'Reason should be legal hold');
});

// =====================================================
// VAL-13-004: GDPR Compliance Tests
// =====================================================
console.log('\n=== VAL-13-004: GDPR Compliance ===');

test('gdpr-compliance module exports PIIScanner', async () => {
    const module = await import('../gdpr-compliance.js');
    assertTrue(typeof module.PIIScanner === 'function', 'PIIScanner should be a class');
});

test('gdpr-compliance module exports DataSubjectRequestHandler', async () => {
    const module = await import('../gdpr-compliance.js');
    assertTrue(typeof module.DataSubjectRequestHandler === 'function', 'DataSubjectRequestHandler should be a class');
});

test('PIIScanner detects email addresses', async () => {
    const module = await import('../gdpr-compliance.js');
    const scanner = new module.PIIScanner();
    const result = scanner.scan('Contact us at test@example.com for more info');

    assertTrue(result.hasPII, 'Should detect PII');
    assertTrue(result.findings.some(f => f.type === 'email'), 'Should find email');
});

test('PIIScanner detects phone numbers', async () => {
    const module = await import('../gdpr-compliance.js');
    const scanner = new module.PIIScanner();
    const result = scanner.scan('Call us at 555-123-4567');

    assertTrue(result.hasPII, 'Should detect PII');
    assertTrue(result.findings.some(f => f.type === 'phone'), 'Should find phone');
});

test('PIIScanner redact function works', async () => {
    const module = await import('../gdpr-compliance.js');
    const scanner = new module.PIIScanner();
    const result = scanner.redact('Email: test@example.com');

    assertTrue(result.redactedContent.includes('[REDACTED-EMAIL]'), 'Should redact email');
    assertTrue(result.redactionCount > 0, 'Should count redactions');
});

test('DSR handler creates access request', async () => {
    const module = await import('../gdpr-compliance.js');
    const handler = new module.DataSubjectRequestHandler('/tmp/test-dsr');

    const request = handler.createAccessRequest({
        subjectId: 'user-001',
        email: 'user@example.com',
        name: 'Test User',
        verificationMethod: 'email'
    });

    assertTrue(request.requestId !== undefined, 'Request should have ID');
    assertEqual(request.type, 'ACCESS', 'Type should be ACCESS');
    assertEqual(request.gdprArticle, '15', 'Should reference Article 15');
});

test('DSR handler creates erasure request', async () => {
    const module = await import('../gdpr-compliance.js');
    const handler = new module.DataSubjectRequestHandler('/tmp/test-dsr');

    const request = handler.createErasureRequest({
        subjectId: 'user-002',
        email: 'user2@example.com',
        reason: 'User requested deletion',
        scope: 'ALL'
    });

    assertEqual(request.type, 'ERASURE', 'Type should be ERASURE');
    assertEqual(request.gdprArticle, '17', 'Should reference Article 17');
});

// =====================================================
// VAL-13-005: Audit Alerting Tests
// =====================================================
console.log('\n=== VAL-13-005: Audit Trail Alerting ===');

test('audit-alerting module exports AuditAlerter', async () => {
    const module = await import('../audit/audit-alerting.js');
    assertTrue(typeof module.AuditAlerter === 'function', 'AuditAlerter should be a class');
});

test('audit-alerting module exports AlertType enum', async () => {
    const module = await import('../audit/audit-alerting.js');
    assertTrue(module.AlertType.TAMPER_DETECTED !== undefined, 'Should have TAMPER_DETECTED');
    assertTrue(module.AlertType.CHAIN_BREAK !== undefined, 'Should have CHAIN_BREAK');
});

test('AuditAlerter triggers alerts', async () => {
    const module = await import('../audit/audit-alerting.js');
    const alerter = new module.AuditAlerter({ alertStorePath: '/tmp/test-alerts' });

    let receivedAlert = null;
    alerter.registerAlertHandler((alert) => {
        receivedAlert = alert;
    });

    const alert = alerter.triggerAlert(module.AlertType.TAMPER_DETECTED, {
        file: 'test.json',
        expectedHash: 'abc',
        actualHash: 'def'
    });

    assertTrue(alert !== null, 'Alert should be created');
    assertEqual(alert.type, 'TAMPER_DETECTED', 'Alert type should match');
    assertTrue(receivedAlert !== null, 'Handler should receive alert');
});

test('AuditCompletenessChecker verifies chain integrity', async () => {
    const module = await import('../audit/audit-alerting.js');
    const checker = new module.AuditCompletenessChecker();

    const entries = [
        { id: '1', timestamp: '2026-01-01T00:00:00Z', hash: 'hash1', previousHash: '0'.repeat(64) },
        { id: '2', timestamp: '2026-01-01T00:01:00Z', hash: 'hash2', previousHash: 'hash1' }
    ];

    const result = checker.verifyChainIntegrity(entries);
    assertTrue(result.entriesVerified === 2, 'Should verify 2 entries');
});

// =====================================================
// VAL-13-006: Auditor Portal Tests
// =====================================================
console.log('\n=== VAL-13-006: Auditor Portal ===');

test('auditor-portal module exports AuditorSession', async () => {
    const module = await import('../auditor-portal.js');
    assertTrue(typeof module.AuditorSession === 'function', 'AuditorSession should be a class');
});

test('auditor-portal module exports AuditorAccessManager', async () => {
    const module = await import('../auditor-portal.js');
    assertTrue(typeof module.AuditorAccessManager === 'function', 'AuditorAccessManager should be a class');
});

test('AuditorSession creates session with token', async () => {
    const module = await import('../auditor-portal.js');
    const sessionManager = new module.AuditorSession('/tmp/test-auditor-sessions');

    const session = sessionManager.createSession('auditor-001', {
        evidenceTypes: ['all'],
        categories: ['compliance']
    });

    assertTrue(session.sessionId !== undefined, 'Should have session ID');
    assertTrue(session.token !== undefined, 'Should have token');
    assertTrue(session.token.length === 64, 'Token should be 64 chars hex');
});

test('AuditorSession validates session token', async () => {
    const module = await import('../auditor-portal.js');
    const sessionManager = new module.AuditorSession('/tmp/test-auditor-sessions');

    const session = sessionManager.createSession('auditor-002', {
        evidenceTypes: ['all']
    });

    const validation = sessionManager.validateSession(session.token);
    assertTrue(validation.valid, 'Token should be valid');
    assertEqual(validation.session.auditorId, 'auditor-002', 'Should return correct auditor');
});

test('AuditorSession rejects invalid token', async () => {
    const module = await import('../auditor-portal.js');
    const sessionManager = new module.AuditorSession('/tmp/test-auditor-sessions');

    const validation = sessionManager.validateSession('invalid-token');
    assertTrue(!validation.valid, 'Invalid token should fail');
    assertEqual(validation.error, 'INVALID_TOKEN', 'Error should be INVALID_TOKEN');
});

// =====================================================
// VAL-13-007: Remediation Tracking Tests
// =====================================================
console.log('\n=== VAL-13-007: Remediation Tracking ===');

test('remediation-tracker module exports RemediationTracker', async () => {
    const module = await import('../remediation-tracker.js');
    assertTrue(typeof module.RemediationTracker === 'function', 'RemediationTracker should be a class');
});

test('remediation-tracker module exports Finding', async () => {
    const module = await import('../remediation-tracker.js');
    assertTrue(typeof module.Finding === 'function', 'Finding should be a class');
});

test('RemediationTracker creates finding', async () => {
    const module = await import('../remediation-tracker.js');
    const tracker = new module.RemediationTracker('/tmp/test-remediation');

    const finding = tracker.createFinding({
        title: 'Test Vulnerability',
        description: 'A test vulnerability for validation',
        severity: 'HIGH',
        category: 'VULNERABILITY'
    });

    assertTrue(finding.id !== undefined, 'Finding should have ID');
    assertEqual(finding.status, 'OPEN', 'Initial status should be OPEN');
});

test('RemediationTracker links evidence to finding', async () => {
    const module = await import('../remediation-tracker.js');
    const tracker = new module.RemediationTracker('/tmp/test-remediation');

    const finding = tracker.createFinding({
        title: 'Test Finding',
        severity: 'MEDIUM'
    });

    const link = tracker.linkEvidence(finding.id, 'evidence/scan-result.json', {
        linkType: 'supporting',
        linkedBy: 'user-001',
        hash: 'abc123'
    });

    assertTrue(link.evidenceId === 'evidence/scan-result.json', 'Evidence ID should match');
    assertEqual(link.linkType, 'supporting', 'Link type should match');
});

test('RemediationTracker updates status', async () => {
    const module = await import('../remediation-tracker.js');
    const tracker = new module.RemediationTracker('/tmp/test-remediation');

    const finding = tracker.createFinding({
        title: 'Status Test',
        severity: 'LOW'
    });

    tracker.updateStatus(finding.id, 'IN_PROGRESS', {
        changedBy: 'user-001',
        reason: 'Starting remediation'
    });

    const updated = tracker.getFinding(finding.id);
    assertEqual(updated.status, 'IN_PROGRESS', 'Status should be updated');
});

test('Finding calculates SLA status', async () => {
    const module = await import('../remediation-tracker.js');

    const finding = new module.Finding({
        title: 'SLA Test',
        severity: 'CRITICAL',
        createdAt: new Date().toISOString()
    });

    const slaStatus = finding.getSLAStatus();
    assertEqual(slaStatus.status, 'ON_TRACK', 'New critical finding should be on track');
    assertTrue(slaStatus.hoursRemaining <= 24, 'Critical SLA is 24 hours');
});

test('RemediationTracker generates report', async () => {
    const module = await import('../remediation-tracker.js');
    const tracker = new module.RemediationTracker('/tmp/test-remediation');

    tracker.createFinding({ title: 'Report Test 1', severity: 'HIGH' });
    tracker.createFinding({ title: 'Report Test 2', severity: 'MEDIUM' });

    const report = tracker.generateRemediationReport();
    assertTrue(report.summary.totalFindings >= 2, 'Report should include findings');
    assertTrue(report.compliance !== undefined, 'Report should have compliance section');
});

// =====================================================
// Print Results
// =====================================================
console.log('\n' + '='.repeat(60));
console.log('STAGE 13 VALIDATION TEST RESULTS');
console.log('='.repeat(60));
console.log(`Total Tests: ${results.passed + results.failed}`);
console.log(`Passed: ${results.passed}`);
console.log(`Failed: ${results.failed}`);
console.log('='.repeat(60));

if (results.failed > 0) {
    console.log('\nFailed Tests:');
    results.tests.filter(t => t.status === 'FAIL').forEach(t => {
        console.log(`  - ${t.name}: ${t.error}`);
    });
}

// Exit with appropriate code
process.exit(results.failed > 0 ? 1 : 0);
