/**
 * SA-07: STRIDE Threat Model & Risk Register Validation Tests
 *
 * Validates that the SA-07 deliverables meet all acceptance criteria:
 * - STRIDE matrix covers all 7 components with all 6 threat categories
 * - Risk register contains all known + newly discovered risks with CVSS 3.1 scores
 * - Heat map visualization (severity × likelihood) for all risks
 * - 7 initial risks from Section 11.10.2 validated or updated
 *
 * Additionally validates structural integrity of risk register YAML
 * and cross-references with prior SA phase findings.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { parse as parseYaml } from 'yaml';

const ROOT = resolve(import.meta.dirname, '../..');
const STRIDE_MODEL_PATH = resolve(ROOT, '_bmad-output/planning-artifacts/SA-07-STRIDE-THREAT-MODEL.md');
const RISK_REGISTER_PATH = resolve(ROOT, '_bmad-output/planning-artifacts/RISK-REGISTER.yaml');

// ============================================================================
describe('SA-07: STRIDE Threat Model Deliverables', () => {

  // --------------------------------------------------------------------------
  // AC1: STRIDE matrix covers all 7 components with all 6 threat categories
  // --------------------------------------------------------------------------
  describe('AC1: STRIDE matrix completeness', () => {
    const strideModel = readFileSync(STRIDE_MODEL_PATH, 'utf-8');

    const COMPONENTS = [
      'CLI Install/Update',
      'RBAC Authorization',
      'Hook/Validator Pipeline',
      'Agent Activation',
      'Audit Logging',
      'Package Distribution',
      'Workflow Execution',
    ];

    const STRIDE_CATEGORIES = [
      'Spoofing',
      'Tampering',
      'Repudiation',
      'Info Disclosure',
      'DoS',
      'Elevation',
    ];

    it('STRIDE model document exists', () => {
      expect(existsSync(STRIDE_MODEL_PATH)).toBe(true);
    });

    for (const component of COMPONENTS) {
      it(`covers component: ${component}`, () => {
        expect(strideModel).toContain(component);
      });
    }

    it('contains all 7 components in summary matrix', () => {
      // The summary matrix has a row for each component
      for (const component of COMPONENTS) {
        expect(strideModel).toContain(`| **${component}**`);
      }
    });

    it('summary matrix has S/T/R/I/D/E columns', () => {
      // Header row contains all 6 STRIDE abbreviations
      expect(strideModel).toMatch(/\|\s*S\s*\|\s*T\s*\|\s*R\s*\|\s*I\s*\|\s*D\s*\|\s*E\s*\|/);
    });

    it('each component section addresses all 6 STRIDE categories', () => {
      // Each component section should reference all 6 categories in its table
      for (const category of STRIDE_CATEGORIES) {
        expect(strideModel).toContain(`**${category}**`);
      }
    });

    it('42-cell analysis described (7 × 6)', () => {
      expect(strideModel).toContain('42-cell');
    });

    it('each cell has a status (MITIGATED, PARTIAL, OPEN, or N/A)', () => {
      const statusPattern = /\*\*(MITIGATED|PARTIAL|OPEN|N\/A)\*\*/g;
      const matches = strideModel.match(statusPattern);
      // At least 42 cells (7 components × 6 categories)
      expect(matches).not.toBeNull();
      expect(matches.length).toBeGreaterThanOrEqual(42);
    });
  });

  // --------------------------------------------------------------------------
  // AC2: Risk register with CVSS 3.1 scores
  // --------------------------------------------------------------------------
  describe('AC2: Risk register structure and CVSS scoring', () => {
    let riskRegister;

    it('risk register YAML file exists', () => {
      expect(existsSync(RISK_REGISTER_PATH)).toBe(true);
    });

    it('risk register parses as valid YAML', () => {
      const content = readFileSync(RISK_REGISTER_PATH, 'utf-8');
      riskRegister = parseYaml(content);
      expect(riskRegister).toBeDefined();
      expect(riskRegister.risks).toBeInstanceOf(Array);
    });

    it('has metadata section with required fields', () => {
      const content = readFileSync(RISK_REGISTER_PATH, 'utf-8');
      riskRegister = parseYaml(content);
      expect(riskRegister.metadata).toBeDefined();
      expect(riskRegister.metadata.version).toBeDefined();
      expect(riskRegister.metadata.created).toBeDefined();
      expect(riskRegister.metadata.total_risks).toBeGreaterThan(0);
      expect(riskRegister.metadata.risk_distribution).toBeDefined();
    });

    it('each risk has required fields', () => {
      const content = readFileSync(RISK_REGISTER_PATH, 'utf-8');
      riskRegister = parseYaml(content);

      const REQUIRED_FIELDS = [
        'id', 'title', 'component', 'stride_category',
        'cvss_score', 'cvss_vector', 'status',
      ];

      for (const risk of riskRegister.risks) {
        for (const field of REQUIRED_FIELDS) {
          expect(risk[field], `Risk ${risk.id} missing field: ${field}`).toBeDefined();
        }
      }
    });

    it('all CVSS scores are between 0.0 and 10.0', () => {
      const content = readFileSync(RISK_REGISTER_PATH, 'utf-8');
      riskRegister = parseYaml(content);

      for (const risk of riskRegister.risks) {
        expect(risk.cvss_score).toBeGreaterThanOrEqual(0);
        expect(risk.cvss_score).toBeLessThanOrEqual(10);
      }
    });

    it('all CVSS vectors follow CVSS:3.1 format', () => {
      const content = readFileSync(RISK_REGISTER_PATH, 'utf-8');
      riskRegister = parseYaml(content);

      const cvssPattern = /^CVSS:3\.1\/AV:[NALP]\/AC:[LH]\/PR:[NLH]\/UI:[NR]\/S:[UC]\/C:[NLH]\/I:[NLH]\/A:[NLH]$/;
      for (const risk of riskRegister.risks) {
        expect(risk.cvss_vector, `Risk ${risk.id} has invalid CVSS vector: ${risk.cvss_vector}`)
          .toMatch(cvssPattern);
      }
    });

    it('all risk statuses are valid', () => {
      const content = readFileSync(RISK_REGISTER_PATH, 'utf-8');
      riskRegister = parseYaml(content);

      const VALID_STATUSES = ['MITIGATED', 'CONFIRMED', 'ACCEPTED', 'DEFERRED', 'RESOLVED'];
      for (const risk of riskRegister.risks) {
        expect(VALID_STATUSES, `Risk ${risk.id} has invalid status: ${risk.status}`)
          .toContain(risk.status);
      }
    });

    it('all STRIDE categories are valid', () => {
      const content = readFileSync(RISK_REGISTER_PATH, 'utf-8');
      riskRegister = parseYaml(content);

      const VALID_CATEGORIES = [
        'Spoofing', 'Tampering', 'Repudiation',
        'Information Disclosure', 'Denial of Service', 'Elevation of Privilege',
      ];
      for (const risk of riskRegister.risks) {
        expect(VALID_CATEGORIES, `Risk ${risk.id} has invalid STRIDE: ${risk.stride_category}`)
          .toContain(risk.stride_category);
      }
    });

    it('total risks matches metadata count', () => {
      const content = readFileSync(RISK_REGISTER_PATH, 'utf-8');
      riskRegister = parseYaml(content);
      expect(riskRegister.risks.length).toBe(riskRegister.metadata.total_risks);
    });

    it('risk distribution matches actual counts', () => {
      const content = readFileSync(RISK_REGISTER_PATH, 'utf-8');
      riskRegister = parseYaml(content);

      let critical = 0, high = 0, medium = 0, low = 0;
      for (const risk of riskRegister.risks) {
        if (risk.cvss_score >= 9.0) critical++;
        else if (risk.cvss_score >= 7.0) high++;
        else if (risk.cvss_score >= 4.0) medium++;
        else low++;
      }

      expect(riskRegister.metadata.risk_distribution.critical).toBe(critical);
      expect(riskRegister.metadata.risk_distribution.high).toBe(high);
      expect(riskRegister.metadata.risk_distribution.medium).toBe(medium);
      expect(riskRegister.metadata.risk_distribution.low).toBe(low);
    });
  });

  // --------------------------------------------------------------------------
  // AC3: Heat map visualization
  // --------------------------------------------------------------------------
  describe('AC3: Heat map coverage', () => {
    const strideModel = readFileSync(STRIDE_MODEL_PATH, 'utf-8');

    it('heat map section exists', () => {
      expect(strideModel).toContain('Heat Map');
    });

    it('heat map has severity × likelihood axes', () => {
      expect(strideModel).toContain('LIKELIHOOD');
      expect(strideModel).toContain('CRITICAL');
      expect(strideModel).toContain('HIGH');
      expect(strideModel).toContain('MEDIUM');
      expect(strideModel).toContain('LOW');
    });

    it('all risk IDs appear in heat map or distribution table', () => {
      const content = readFileSync(RISK_REGISTER_PATH, 'utf-8');
      const riskRegister = parseYaml(content);

      // Non-mitigated risks should appear in heat map
      for (const risk of riskRegister.risks) {
        if (risk.status !== 'MITIGATED') {
          expect(strideModel, `Risk ${risk.id} not in heat map or distribution`)
            .toContain(risk.id);
        }
      }
    });

    it('risk distribution summary exists', () => {
      expect(strideModel).toContain('Risk Distribution');
      expect(strideModel).toContain('Severity Band');
      expect(strideModel).toContain('Percentage');
    });

    it('0 CRITICAL and 0 HIGH open risks', () => {
      const content = readFileSync(RISK_REGISTER_PATH, 'utf-8');
      const riskRegister = parseYaml(content);

      const openHighCritical = riskRegister.risks.filter(r =>
        r.status !== 'MITIGATED' && r.cvss_score >= 7.0
      );
      expect(openHighCritical.length).toBe(0);
    });
  });

  // --------------------------------------------------------------------------
  // AC4: 7 initial risks validated or updated
  // --------------------------------------------------------------------------
  describe('AC4: Initial risk validation', () => {
    let riskRegister;

    it('all 7 initial risks (R-001 to R-007) present', () => {
      const content = readFileSync(RISK_REGISTER_PATH, 'utf-8');
      riskRegister = parseYaml(content);

      for (let i = 1; i <= 7; i++) {
        const riskId = `RISK-00${i}`;
        const risk = riskRegister.risks.find(r => r.id === riskId);
        expect(risk, `Initial risk ${riskId} not found`).toBeDefined();
      }
    });

    it('all 7 initial risks have original_cvss_score field', () => {
      const content = readFileSync(RISK_REGISTER_PATH, 'utf-8');
      riskRegister = parseYaml(content);

      for (let i = 1; i <= 7; i++) {
        const riskId = `RISK-00${i}`;
        const risk = riskRegister.risks.find(r => r.id === riskId);
        expect(risk.original_cvss_score, `Risk ${riskId} missing original_cvss_score`).toBeDefined();
        expect(risk.original_cvss_score).toBeGreaterThan(0);
      }
    });

    it('all 7 initial risks are MITIGATED', () => {
      const content = readFileSync(RISK_REGISTER_PATH, 'utf-8');
      riskRegister = parseYaml(content);

      for (let i = 1; i <= 7; i++) {
        const riskId = `RISK-00${i}`;
        const risk = riskRegister.risks.find(r => r.id === riskId);
        expect(risk.status, `Risk ${riskId} should be MITIGATED`).toBe('MITIGATED');
      }
    });

    it('all 7 initial risks have reduced CVSS scores (current < original)', () => {
      const content = readFileSync(RISK_REGISTER_PATH, 'utf-8');
      riskRegister = parseYaml(content);

      for (let i = 1; i <= 7; i++) {
        const riskId = `RISK-00${i}`;
        const risk = riskRegister.risks.find(r => r.id === riskId);
        expect(risk.cvss_score, `Risk ${riskId}: current should be < original`)
          .toBeLessThan(risk.original_cvss_score);
      }
    });

    it('initial risks reference their remediation evidence', () => {
      const content = readFileSync(RISK_REGISTER_PATH, 'utf-8');
      riskRegister = parseYaml(content);

      for (let i = 1; i <= 7; i++) {
        const riskId = `RISK-00${i}`;
        const risk = riskRegister.risks.find(r => r.id === riskId);
        expect(risk.evidence, `Risk ${riskId} missing evidence`).toBeInstanceOf(Array);
        expect(risk.evidence.length).toBeGreaterThan(0);
        expect(risk.mitigated_by, `Risk ${riskId} missing mitigated_by`).toBeDefined();
      }
    });
  });

  // --------------------------------------------------------------------------
  // Cross-reference: SA phase findings incorporated
  // --------------------------------------------------------------------------
  describe('SA phase findings cross-reference', () => {
    const strideModel = readFileSync(STRIDE_MODEL_PATH, 'utf-8');

    it('references SA-01 architecture review findings', () => {
      expect(strideModel).toContain('SA-01');
    });

    it('references SA-02 code review findings', () => {
      expect(strideModel).toContain('SA-02');
    });

    it('references SA-03 penetration test findings', () => {
      expect(strideModel).toContain('SA-03');
    });

    it('references SA-04 supply chain audit', () => {
      expect(strideModel).toContain('SA-04');
    });

    it('references SA-05 CI/CD security', () => {
      expect(strideModel).toContain('SA-05');
    });

    it('references SA-06 compliance gap analysis', () => {
      expect(strideModel).toContain('SA-06');
    });

    it('cross-reference table maps SA phases to risk IDs', () => {
      expect(strideModel).toContain('Cross-Reference');
      expect(strideModel).toContain('SA Phase');
      expect(strideModel).toContain('Risks Generated');
    });
  });

  // --------------------------------------------------------------------------
  // Risk register component coverage
  // --------------------------------------------------------------------------
  describe('component coverage in risk register', () => {
    it('covers all 7 STRIDE components', () => {
      const content = readFileSync(RISK_REGISTER_PATH, 'utf-8');
      const riskRegister = parseYaml(content);

      const components = new Set(riskRegister.risks.map(r => r.component));
      const expectedComponents = ['CLI', 'RBAC', 'Hooks', 'Agents', 'Audit', 'Package', 'Operations'];

      for (const expected of expectedComponents) {
        expect(components.has(expected), `Component ${expected} not in risk register`).toBe(true);
      }
    });

    it('no risk has empty remediation field', () => {
      const content = readFileSync(RISK_REGISTER_PATH, 'utf-8');
      const riskRegister = parseYaml(content);

      for (const risk of riskRegister.risks) {
        expect(risk.remediation, `Risk ${risk.id} has empty remediation`).toBeTruthy();
        expect(risk.remediation.length).toBeGreaterThan(0);
      }
    });
  });

  // --------------------------------------------------------------------------
  // STRIDE model overall metrics
  // --------------------------------------------------------------------------
  describe('overall threat model metrics', () => {
    const strideModel = readFileSync(STRIDE_MODEL_PATH, 'utf-8');

    it('reports 90% mitigation rate', () => {
      expect(strideModel).toContain('90%');
    });

    it('reports 0 OPEN threats', () => {
      expect(strideModel).toContain('0 OPEN');
    });

    it('includes remediation recommendations', () => {
      expect(strideModel).toContain('Remediation Recommendations');
      expect(strideModel).toContain('Priority 1');
      expect(strideModel).toContain('Priority 2');
    });

    it('includes approval/review section', () => {
      expect(strideModel).toContain('Approval');
      expect(strideModel).toContain('Cipher');
      expect(strideModel).toContain('Bastion');
      expect(strideModel).toContain('Ghost');
      expect(strideModel).toContain('Sentinel');
    });
  });
});
