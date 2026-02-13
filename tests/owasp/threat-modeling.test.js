/**
 * BMAD Security Tests: Threat Modeling Integration
 * ==================================================
 *
 * OWASP Top 10 2021 - A04: Insecure Design
 *
 * Test IDs: A04-101, A04-102, A04-103
 *
 * Covers:
 * - A04-101: STRIDE categories documented
 * - A04-102: Security controls mapped per threat
 * - A04-103: Architecture reviewed against OWASP
 *
 * Source files:
 *   Docs/04-operations/security/THREAT-MODEL-TEMPLATE.md
 *   Docs/04-operations/security/ARCHITECTURE.md
 *   src/core/schemas/threat-model.schema.yaml
 *   src/cybersec-team/workflows/threat-modeling/
 */

import { describe, expect, it } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { parse as parseYaml } from 'yaml';

const __dirname = resolve(import.meta.dirname);
const PROJECT_ROOT = resolve(__dirname, '../..');

// ============================================================================
// A04-101: STRIDE categories documented
// ============================================================================

describe('A04-101: STRIDE categories documented', () => {
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

  // ---------------------------------------------------------------------
  // Template validation
  // ---------------------------------------------------------------------
  describe('Threat model template includes all STRIDE categories', () => {
    let templateContent;

    it('A04-101-01: template file exists', () => {
      expect(existsSync(threatModelTemplatePath)).toBe(true);
    });

    it('A04-101-02: template documents all 6 STRIDE categories', () => {
      templateContent = readFileSync(threatModelTemplatePath, 'utf-8');

      const strideCategories = [
        'Spoofing',
        'Tampering',
        'Repudiation',
        'Information Disclosure',
        'Denial of Service',
        'Elevation of Privilege',
      ];

      for (const category of strideCategories) {
        expect(templateContent).toContain(category);
      }
    });

    it('A04-101-03: template includes STRIDE analysis section', () => {
      templateContent = readFileSync(threatModelTemplatePath, 'utf-8');

      expect(templateContent).toContain('## 4. STRIDE Analysis');
      expect(templateContent).toContain('### 4.1 STRIDE Categories Reference');
    });

    it('A04-101-04: template includes STRIDE matrix table', () => {
      templateContent = readFileSync(threatModelTemplatePath, 'utf-8');

      expect(templateContent).toContain('### 4.2 Component STRIDE Matrix');
      expect(templateContent).toContain('STRIDE Category');
      expect(templateContent).toContain('Threat ID');
    });

    it('A04-101-05: template includes detailed threat analysis format', () => {
      templateContent = readFileSync(threatModelTemplatePath, 'utf-8');

      expect(templateContent).toContain('### 4.3 Detailed Threat Analysis');
      expect(templateContent).toContain('Attack Scenario');
      expect(templateContent).toContain('Prerequisites');
    });
  });

  // ---------------------------------------------------------------------
  // Workflow validation
  // ---------------------------------------------------------------------
  describe('STRIDE workflow implements methodology', () => {
    let workflowContent;

    it('A04-101-06: STRIDE analysis workflow step exists', () => {
      expect(existsSync(strideWorkflowPath)).toBe(true);
    });

    it('A04-101-07: STRIDE analysis step exists', () => {
      expect(existsSync(strideAnalysisStepPath)).toBe(true);
    });

    it('A04-101-08: workflow file has STRIDE step in steps directory', () => {
      // The workflow uses steps/ directory with step-04-stride-analysis.md
      const stepsDir = resolve(PROJECT_ROOT, 'src/cybersec-team/workflows/threat-modeling/steps');
      expect(existsSync(stepsDir)).toBe(true);

      const strideStep = resolve(stepsDir, 'step-04-stride-analysis.md');
      expect(existsSync(strideStep)).toBe(true);
    });

    it('A04-101-09: STRIDE analysis step contains all categories', () => {
      const stepContent = readFileSync(strideAnalysisStepPath, 'utf-8');

      expect(stepContent).toContain('Spoofing');
      expect(stepContent).toContain('Tampering');
      expect(stepContent).toContain('Repudiation');
      expect(stepContent).toContain('Information Disclosure');
      expect(stepContent).toContain('Denial of Service');
      expect(stepContent).toContain('Elevation of Privilege');
    });
  });

  // ---------------------------------------------------------------------
  // Schema validation
  // ---------------------------------------------------------------------
  describe('Threat model schema supports STRIDE', () => {
    let schemaContent;

    it('A04-101-10: threat model schema exists', () => {
      expect(existsSync(threatSchemaPath)).toBe(true);
    });

    it('A04-101-11: schema includes STRIDE category enum', () => {
      schemaContent = readFileSync(threatSchemaPath, 'utf-8');

      expect(schemaContent).toMatch(/STRIDE|stride/i);
      expect(schemaContent).toMatch(/Spoofing|Tampering|Repudiation/i);
    });
  });
});

// ============================================================================
// A04-102: Security controls mapped per threat
// ============================================================================

describe('A04-102: Security controls mapped per threat', () => {
  const threatModelTemplatePath = resolve(
    PROJECT_ROOT,
    'Docs/04-operations/security/THREAT-MODEL-TEMPLATE.md'
  );
  const owaspControlsPath = resolve(
    PROJECT_ROOT,
    'Docs/04-operations/security/owasp-controls.yaml'
  );

  describe('Template includes controls mapping', () => {
    let templateContent;

    it('A04-102-01: template has security controls mapping section', () => {
      templateContent = readFileSync(threatModelTemplatePath, 'utf-8');

      expect(templateContent).toContain('## 5. Security Controls Mapping');
      expect(templateContent).toContain('### 5.1 Controls by Threat');
    });

    it('A04-102-02: template includes control catalog', () => {
      templateContent = readFileSync(threatModelTemplatePath, 'utf-8');

      expect(templateContent).toContain('### 5.2 Control Catalog');
      expect(templateContent).toContain('Control ID');
      expect(templateContent).toContain('Control Name');
      expect(templateContent).toContain('Control Type');
    });

    it('A04-102-03: template defines control types', () => {
      templateContent = readFileSync(threatModelTemplatePath, 'utf-8');

      expect(templateContent).toContain('Preventive');
      expect(templateContent).toContain('Detective');
      expect(templateContent).toContain('Corrective');
      expect(templateContent).toContain('Compensating');
    });

    it('A04-102-04: template maps controls to threats in table', () => {
      templateContent = readFileSync(threatModelTemplatePath, 'utf-8');

      expect(templateContent).toContain('| Threat ID | Control ID');
      expect(templateContent).toContain('| Status |');
    });
  });

  describe('Architecture document maps controls to threats', () => {
    let architectureContent;

    it('A04-102-05: architecture references security controls', () => {
      const architecturePath = resolve(
        PROJECT_ROOT,
        'Docs/04-operations/security/ARCHITECTURE.md'
      );
      architectureContent = readFileSync(architecturePath, 'utf-8');

      expect(architectureContent).toContain('## 5. Security Controls');
      expect(architectureContent).toContain('AI Safety Controls');
      expect(architectureContent).toContain('Input Validation Controls');
      expect(architectureContent).toContain('Access Control Controls');
    });
  });

  describe('OWASP controls inventory is maintained', () => {
    let controlsContent;

    it('A04-102-06: owasp-controls.yaml exists', () => {
      expect(existsSync(owaspControlsPath)).toBe(true);
    });

    it('A04-102-07: controls inventory has structure', () => {
      controlsContent = readFileSync(owaspControlsPath, 'utf-8');

      expect(controlsContent).toContain('owasp_web_top_10:');
      expect(controlsContent).toContain('owasp_api_security_top_10:');
      expect(controlsContent).toContain('owasp_asvs:');
    });

    it('A04-102-08: controls map to test files', () => {
      controlsContent = readFileSync(owaspControlsPath, 'utf-8');

      // Should have test_file references for implemented controls
      expect(controlsContent).toMatch(/test_file:\s*['"]/);
    });

    it('A04-102-09: controls have implementation status', () => {
      controlsContent = readFileSync(owaspControlsPath, 'utf-8');

      expect(controlsContent).toContain('implemented:');
    });
  });
});

// ============================================================================
// A04-103: Architecture reviewed against OWASP
// ============================================================================

describe('A04-103: Architecture reviewed against OWASP', () => {
  const architecturePath = resolve(
    PROJECT_ROOT,
    'Docs/04-operations/security/ARCHITECTURE.md'
  );
  const threatModelTemplatePath = resolve(
    PROJECT_ROOT,
    'Docs/04-operations/security/THREAT-MODEL-TEMPLATE.md'
  );
  let architectureContent;

  describe('Architecture document references OWASP', () => {
    it('A04-103-01: ARCHITECTURE.md exists', () => {
      expect(existsSync(architecturePath)).toBe(true);
    });

    it('A04-103-02: architecture document references OWASP ASVS V1', () => {
      architectureContent = readFileSync(architecturePath, 'utf-8');

      expect(architectureContent).toContain('OWASP ASVS v4.0');
      expect(architectureContent).toContain('V1-001');
    });

    it('A04-103-03: architecture references OWASP Top 10', () => {
      architectureContent = readFileSync(architecturePath, 'utf-8');

      expect(architectureContent).toContain('OWASP Top 10');
      expect(architectureContent).toContain('A01') ||
        expect(architectureContent).toContain('A04');
    });

    it('A04-103-04: architecture references OWASP API Security', () => {
      architectureContent = readFileSync(architecturePath, 'utf-8');

      expect(architectureContent).toContain('OWASP API Security');
    });

    it('A04-103-05: architecture references OWASP LLM Top 10', () => {
      architectureContent = readFileSync(architecturePath, 'utf-8');

      expect(architectureContent).toContain('OWASP LLM Top 10');
      expect(architectureContent).toContain('LLM01');
    });
  });

  describe('Threat model template includes OWASP mapping', () => {
    let templateContent;

    it('A04-103-06: template has OWASP control mapping section', () => {
      templateContent = readFileSync(threatModelTemplatePath, 'utf-8');

      expect(templateContent).toContain('## 7. OWASP Control Mapping');
    });

    it('A04-103-07: template maps to OWASP Top 10 2021', () => {
      templateContent = readFileSync(threatModelTemplatePath, 'utf-8');

      expect(templateContent).toContain('### 7.1 OWASP Top 10 2021 Mapping');
      expect(templateContent).toContain('A01 | Broken Access Control');
    });

    it('A04-103-08: template maps to OWASP ASVS v4.0', () => {
      templateContent = readFileSync(threatModelTemplatePath, 'utf-8');

      expect(templateContent).toContain('### 7.2 OWASP ASVS v4.0 Mapping');
      expect(templateContent).toContain('V1-001');
      expect(templateContent).toContain('V1-002');
      expect(templateContent).toContain('V1-003');
    });

    it('A04-103-09: template mapping table has required columns', () => {
      templateContent = readFileSync(threatModelTemplatePath, 'utf-8');

      expect(templateContent).toContain('OWASP ID');
      expect(templateContent).toContain('Category');
      expect(templateContent).toContain('Threats Addressed');
      expect(templateContent).toContain('Controls');
    });
  });

  describe('Architecture document has standards compliance section', () => {
    it('A04-103-10: architecture document has standards compliance section', () => {
      architectureContent = readFileSync(architecturePath, 'utf-8');

      expect(architectureContent).toContain('Standards Compliance');
    });
  });

  describe('Cross-reference validation', () => {
    it('A04-103-11: architecture references threat model template', () => {
      architectureContent = readFileSync(architecturePath, 'utf-8');

      expect(architectureContent).toMatch(/Threat Model|THREAT-MODEL/);
    });

    it('A04-103-12: architecture references threat modeling workflow', () => {
      architectureContent = readFileSync(architecturePath, 'utf-8');

      expect(architectureContent).toContain('Threat Modeling');
    });
  });

  describe('OWASP compliance documentation exists', () => {
    it('A04-103-13: architecture references OWASP testing plan', () => {
      architectureContent = readFileSync(architecturePath, 'utf-8');

      expect(architectureContent).toContain('OWASP Testing');
    });
  });
});
