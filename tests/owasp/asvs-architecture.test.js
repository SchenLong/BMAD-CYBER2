/**
 * BMAD Security Tests: ASVS Architecture Verification
 * ========================================================
 *
 * OWASP ASVS v4.0 - V1: Architecture, Design, and Threat Modeling
 *
 * Test IDs: V1-001, V1-002, V1-003
 *
 * Covers:
 * - V1-001: Security architecture documentation exists
 * - V1-002: Threat modeling documented
 * - V1-003: Secure design patterns used
 *
 * Source files:
 *   Docs/04-operations/security/ARCHITECTURE.md
 *   Docs/04-operations/security/THREAT-MODEL-TEMPLATE.md
 *   src/core/security/rbac-config.yaml
 *   .claude/validators-node/
 *   src/cybersec-team/workflows/threat-modeling/
 */

import { describe, expect, it } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const __dirname = resolve(import.meta.dirname);
const PROJECT_ROOT = resolve(__dirname, '../..');

// ============================================================================
// V1-001: Security architecture documentation exists
// ============================================================================

describe('V1-001: Security architecture documentation exists', () => {
  const architecturePath = resolve(
    PROJECT_ROOT,
    'Docs/04-operations/security/ARCHITECTURE.md'
  );
  let architectureContent;

  it('V1-001-01: should have ARCHITECTURE.md file in security docs', () => {
    expect(existsSync(architecturePath)).toBe(true);
  });

  it('V1-001-02: should contain system overview section', () => {
    architectureContent = readFileSync(architecturePath, 'utf-8');
    expect(architectureContent).toContain('## 1. System Overview');
    expect(architectureContent).toContain('System Purpose');
  });

  it('V1-001-03: should document component architecture', () => {
    architectureContent = readFileSync(architecturePath, 'utf-8');
    expect(architectureContent).toContain('## 2. Component Architecture');
    expect(architectureContent).toContain('Hook Validation Pipeline');
    expect(architectureContent).toContain('RBAC System');
    expect(architectureContent).toContain('Audit Pipeline');
  });

  it('V1-001-04: should define trust boundaries', () => {
    architectureContent = readFileSync(architecturePath, 'utf-8');
    expect(architectureContent).toContain('## 3. Trust Boundaries');
    expect(architectureContent).toContain('TRUST BOUNDARY');
    expect(architectureContent).toContain('EXTERNAL UNTRUSTED');
    expect(architectureContent).toContain('TRUSTED INTERNAL');
  });

  it('V1-001-05: should include data flow documentation', () => {
    architectureContent = readFileSync(architecturePath, 'utf-8');
    expect(architectureContent).toContain('## 4. Data Flow');
    expect(architectureContent).toContain('User Request Flow');
    expect(architectureContent).toContain('Audit Data Flow');
  });

  it('V1-001-06: should document security controls', () => {
    architectureContent = readFileSync(architecturePath, 'utf-8');
    expect(architectureContent).toContain('## 5. Security Controls');
    expect(architectureContent).toContain('AI Safety Controls');
    expect(architectureContent).toContain('Input Validation Controls');
    expect(architectureContent).toContain('Access Control Controls');
  });

  it('V1-001-07: should include threat model summary', () => {
    architectureContent = readFileSync(architecturePath, 'utf-8');
    expect(architectureContent).toContain('## 6. Threat Model Summary');
    expect(architectureContent).toContain('STRIDE Analysis Summary');
    expect(architectureContent).toContain('Current Risk Posture');
  });

  it('V1-001-08: should reference OWASP ASVS V1 compliance', () => {
    architectureContent = readFileSync(architecturePath, 'utf-8');
    expect(architectureContent).toContain('ASVS V1-001');
    expect(architectureContent).toContain('OWASP ASVS v4.0');
  });

  it('V1-001-09: should document defense-in-depth architecture', () => {
    architectureContent = readFileSync(architecturePath, 'utf-8');
    expect(architectureContent).toContain('Defense in Depth');
    expect(architectureContent).toContain('multiple validation layers');
  });

  it('V1-001-10: should list related reference documents', () => {
    architectureContent = readFileSync(architecturePath, 'utf-8');
    expect(architectureContent).toContain('## References');
    expect(architectureContent).toContain('THREAT-MODEL-TEMPLATE.md');
    expect(architectureContent).toContain('OWASP-TESTING-PLAN.md');
  });
});

// ============================================================================
// V1-002: Threat modeling documented
// ============================================================================

describe('V1-002: Threat modeling documented', () => {
  const threatModelTemplatePath = resolve(
    PROJECT_ROOT,
    'Docs/04-operations/security/THREAT-MODEL-TEMPLATE.md'
  );
  const strideWorkflowPath = resolve(
    PROJECT_ROOT,
    'src/cybersec-team/workflows/threat-modeling/workflow.yaml'
  );
  const strideAnalysisStepPath = resolve(
    PROJECT_ROOT,
    'src/cybersec-team/workflows/threat-modeling/steps/step-04-stride-analysis.md'
  );
  const threatSchemaPath = resolve(
    PROJECT_ROOT,
    'src/core/schemas/threat-model.schema.yaml'
  );
  let threatModelContent;

  it('V1-002-01: should have threat model template file', () => {
    expect(existsSync(threatModelTemplatePath)).toBe(true);
  });

  it('V1-002-02: should have STRIDE workflow definition', () => {
    expect(existsSync(strideWorkflowPath)).toBe(true);
  });

  it('V1-002-03: should have STRIDE analysis step', () => {
    expect(existsSync(strideAnalysisStepPath)).toBe(true);
  });

  it('V1-002-04: should have threat model schema', () => {
    expect(existsSync(threatSchemaPath)).toBe(true);
  });

  it('V1-002-05: template should include STRIDE methodology', () => {
    threatModelContent = readFileSync(threatModelTemplatePath, 'utf-8');

    expect(threatModelContent).toContain('STRIDE Analysis');
    expect(threatModelContent).toContain('Spoofing');
    expect(threatModelContent).toContain('Tampering');
    expect(threatModelContent).toContain('Repudiation');
    expect(threatModelContent).toContain('Information Disclosure');
    expect(threatModelContent).toContain('Denial of Service');
    expect(threatModelContent).toContain('Elevation of Privilege');
  });

  it('V1-002-06: template should include asset identification', () => {
    threatModelContent = readFileSync(threatModelTemplatePath, 'utf-8');

    expect(threatModelContent).toContain('## 2. Asset Identification');
    expect(threatModelContent).toContain('Information Assets');
    expect(threatModelContent).toContain('Software Assets');
  });

  it('V1-002-07: template should include trust boundaries', () => {
    threatModelContent = readFileSync(threatModelTemplatePath, 'utf-8');

    expect(threatModelContent).toContain('## 3. Trust Boundaries');
    expect(threatModelContent).toContain('Trust Zones');
    expect(threatModelContent).toContain('Data Flow Diagram');
  });

  it('V1-002-08: template should include security controls mapping', () => {
    threatModelContent = readFileSync(threatModelTemplatePath, 'utf-8');

    expect(threatModelContent).toContain('## 5. Security Controls Mapping');
    expect(threatModelContent).toContain('Controls by Threat');
    expect(threatModelContent).toContain('Control Catalog');
  });

  it('V1-002-09: template should include risk assessment', () => {
    threatModelContent = readFileSync(threatModelTemplatePath, 'utf-8');

    expect(threatModelContent).toContain('## 6. Risk Assessment');
    expect(threatModelContent).toContain('CVSS 3.1');
    expect(threatModelContent).toContain('Risk Treatment');
    expect(threatModelContent).toContain('Residual Risk');
  });

  it('V1-002-10: template should include OWASP control mapping', () => {
    threatModelContent = readFileSync(threatModelTemplatePath, 'utf-8');

    expect(threatModelContent).toContain('## 7. OWASP Control Mapping');
    expect(threatModelContent).toContain('OWASP Top 10 2021');
    expect(threatModelContent).toContain('OWASP ASVS v4.0');
  });
});

// ============================================================================
// V1-003: Secure design patterns used
// ============================================================================

describe('V1-003: Secure design patterns used', () => {
  const architecturePath = resolve(
    PROJECT_ROOT,
    'Docs/04-operations/security/ARCHITECTURE.md'
  );
  let architectureContent;

  it('V1-003-01: should document defense-in-depth pattern', () => {
    architectureContent = readFileSync(architecturePath, 'utf-8');
    expect(architectureContent).toContain('## 7. Secure Design Patterns');
    expect(architectureContent).toContain('### 7.1 Defense in Depth');
    expect(architectureContent).toContain('Multiple independent validation layers');
  });

  it('V1-003-02: should document fail-secure pattern', () => {
    architectureContent = readFileSync(architecturePath, 'utf-8');
    expect(architectureContent).toContain('### 7.2 Fail Secure');
    expect(architectureContent).toContain('Default-deny');
    expect(architectureContent).toContain('DENIED unless explicitly allowed');
  });

  it('V1-003-03: should document least privilege pattern', () => {
    architectureContent = readFileSync(architecturePath, 'utf-8');
    expect(architectureContent).toContain('### 7.3 Least Privilege');
    expect(architectureContent).toContain('Role hierarchy');
    expect(architectureContent).toContain('scoped permissions');
  });

  it('V1-003-04: should document zero trust pattern', () => {
    architectureContent = readFileSync(architecturePath, 'utf-8');
    expect(architectureContent).toContain('### 7.4 Zero Trust');
    expect(architectureContent).toContain('Never trust external input');
    expect(architectureContent).toContain('Validate at entry point');
  });

  it('V1-003-05: should document audit everything pattern', () => {
    architectureContent = readFileSync(architecturePath, 'utf-8');
    expect(architectureContent).toContain('### 7.5 Audit Everything');
    expect(architectureContent).toContain('Tamper-evident');
    expect(architectureContent).toContain('hash chain');
  });

  it('V1-003-06: should document separation of concerns pattern', () => {
    architectureContent = readFileSync(architecturePath, 'utf-8');
    expect(architectureContent).toContain('### 7.6 Separation of Concerns');
    expect(architectureContent).toContain('Independent validator categories');
    expect(architectureContent).toContain('Single responsibility');
  });

  it('V1-003-07: should validate deny-by-default implementation in RBAC', () => {
    const rbacPath = resolve(PROJECT_ROOT, 'src/core/security/rbac-config.yaml');
    const rbacContent = readFileSync(rbacPath, 'utf-8');

    expect(rbacContent).toContain('deny_by_default');
    expect(rbacContent).toContain('true');
  });

  it('V1-003-08: should validate multiple validation layers in validators', () => {
    const validatorsDir = resolve(PROJECT_ROOT, '.claude/validators-node/src');

    const categories = [
      'ai-safety',
      'guards',
      'permissions',
      'resource-management',
    ];

    for (const category of categories) {
      const categoryPath = resolve(validatorsDir, category);
      expect(existsSync(categoryPath)).toBe(true);
    }
  });

  it('V1-003-09: should validate tamper-evident audit implementation', () => {
    const auditIntegrityPath = resolve(
      PROJECT_ROOT,
      'src/core/audit/integrity.js'
    );

    if (existsSync(auditIntegrityPath)) {
      const auditContent = readFileSync(auditIntegrityPath, 'utf-8');
      expect(auditContent).toMatch(/HMAC|hmac|sha256|SHA-256|hash|signature/i);
    } else {
      // Check in alternative location
      const auditPath = resolve(PROJECT_ROOT, 'src/core/audit/audit-logger.js');
      if (existsSync(auditPath)) {
        const auditContent = readFileSync(auditPath, 'utf-8');
        expect(auditContent).toMatch(/HMAC|hmac|sha256|SHA-256|hash|signature/i);
      }
    }
  });

  it('V1-003-10: should validate least privilege in role definitions', () => {
    const rbacPath = resolve(PROJECT_ROOT, 'src/core/security/rbac-config.yaml');
    const rbacContent = readFileSync(rbacPath, 'utf-8');

    // Should have roles with different privilege levels
    expect(rbacContent).toContain('roles:');
    expect(rbacContent).toContain('admin:');
    expect(rbacContent).toContain('viewer:');

    // Viewer should have restricted access
    expect(rbacContent).toMatch(/viewer[\s\S]*?agents:/);
  });
});
