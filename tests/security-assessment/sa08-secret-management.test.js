/**
 * SA-08: Secret Management Documentation Validation
 * ==================================================
 * Verifies that REM-006 secret management documentation exists
 * and contains required sections.
 */

import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';

const DOC_PATH = path.join(process.cwd(), 'Docs/04-operations/security/SECRET-MANAGEMENT.md');

describe('Secret Management Documentation (SB-01)', () => {
  it('should exist at the expected path', () => {
    expect(fs.existsSync(DOC_PATH)).toBe(true);
  });

  it('should contain required headings', () => {
    const content = fs.readFileSync(DOC_PATH, 'utf-8');

    expect(content).toContain('## Secret Inventory');
    expect(content).toContain('## Key Generation');
    expect(content).toContain('## Storage Recommendations');
    expect(content).toContain('## Rotation Procedure');
    expect(content).toContain('## Emergency Rotation');
  });

  it('should document AUDIT_PRIVATE_KEY', () => {
    const content = fs.readFileSync(DOC_PATH, 'utf-8');
    expect(content).toContain('AUDIT_PRIVATE_KEY');
  });

  it('should recommend vault integration', () => {
    const content = fs.readFileSync(DOC_PATH, 'utf-8');
    expect(content).toMatch(/vault|Vault|AWS Secrets Manager|Key Vault/i);
  });

  it('should document current risk and mitigation', () => {
    const content = fs.readFileSync(DOC_PATH, 'utf-8');
    expect(content).toContain('Risk');
    expect(content).toContain('Mitigation');
  });
});
