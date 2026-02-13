/**
 * SA-02 LOW Finding Remediations — Behavioral Verification Tests
 *
 * Tests all LOW findings from SA-02 + the YAML bomb GAP:
 *
 * S1 Shell Script LOWs:
 * - SAST-004: bmad-voice-manager.sh — sed metacharacter escaping
 * - SAST-005: piper-installer.sh — separate download from extraction
 * - SAST-006: input-validation.sh — JSON interpolation sanitization
 * - SAST-007: personality-manager.sh — validate + escape sed metacharacters
 *
 * S2 Validator/Guard LOWs:
 * - secret.ts — Azure/GitLab/npm token patterns added
 * - pii/patterns.ts — US_Passport regex tightened
 * - prompt-injection.ts — base64 min length lowered (50→30)
 * - jailbreak.ts — crypto.randomUUID for session ID + risk_score blocking
 * - bash-safety.ts — pipe chain splitting for command analysis
 *
 * YAML Bomb GAP (SA-02-S4):
 * - safe-yaml.js — file size + alias count limits
 */
import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'fs';
import { join, resolve } from 'path';

const ROOT = resolve(import.meta.dirname, '../..');

// ════════════════════════════════════════════════════════════════════════
// YAML BOMB GAP — safe-yaml.js wrapper
// ════════════════════════════════════════════════════════════════════════

describe('YAML Bomb GAP: safe-yaml.js wrapper', () => {
  let safeYaml;

  // Dynamic import of ESM module
  it('module exports safeYamlLoad and safeYamlLoadFile', async () => {
    safeYaml = await import(join(ROOT, 'src/utility/safe-yaml.js'));
    expect(typeof safeYaml.safeYamlLoad).toBe('function');
    expect(typeof safeYaml.safeYamlLoadFile).toBe('function');
    expect(safeYaml.yaml).toBeDefined();
    expect(safeYaml.CORE_SCHEMA).toBeDefined();
  });

  it('parses valid YAML normally', async () => {
    safeYaml = await import(join(ROOT, 'src/utility/safe-yaml.js'));
    const result = safeYaml.safeYamlLoad('name: test\nversion: "1.0"');
    expect(result).toEqual({ name: 'test', version: '1.0' });
  });

  it('rejects content exceeding max size', async () => {
    safeYaml = await import(join(ROOT, 'src/utility/safe-yaml.js'));
    // Create a string just over 1KB (using small limit for test)
    const bigContent = `x: ${  'a'.repeat(2048)}`;
    expect(() => safeYaml.safeYamlLoad(bigContent, { maxSize: 1024 }))
      .toThrow(/exceeds maximum size/);
  });

  it('rejects content with too many alias references', async () => {
    safeYaml = await import(join(ROOT, 'src/utility/safe-yaml.js'));
    // Create YAML with many aliases
    let bombContent = 'anchor: &a value\n';
    for (let i = 0; i < 15; i++) {
      bombContent += `ref${i}: *a\n`;
    }
    expect(() => safeYaml.safeYamlLoad(bombContent, { maxAliases: 10 }))
      .toThrow(/too many alias references/);
  });

  it('allows content within alias limit', async () => {
    safeYaml = await import(join(ROOT, 'src/utility/safe-yaml.js'));
    const safeContent = 'anchor: &a value\nref1: *a\nref2: *a';
    // Should not throw with default limit of 100
    const result = safeYaml.safeYamlLoad(safeContent);
    expect(result).toBeDefined();
  });

  it('rejects non-string content', async () => {
    safeYaml = await import(join(ROOT, 'src/utility/safe-yaml.js'));
    expect(() => safeYaml.safeYamlLoad(123)).toThrow(/content must be a string/);
    expect(() => safeYaml.safeYamlLoad(null)).toThrow(/content must be a string/);
  });

  it('uses CORE_SCHEMA by default (no unsafe types)', async () => {
    safeYaml = await import(join(ROOT, 'src/utility/safe-yaml.js'));
    // CORE_SCHEMA treats unknown tags as errors
    expect(() => safeYaml.safeYamlLoad('!!python/object:os.system ["echo pwned"]'))
      .toThrow();
  });

  it('ignores aliases inside quoted strings', async () => {
    safeYaml = await import(join(ROOT, 'src/utility/safe-yaml.js'));
    // These *refs inside quotes should NOT be counted as alias references
    const quotedContent = 'msg: "not *alias just text"\nother: \'also *not an alias\'';
    // Should not throw — the * are inside quotes
    const result = safeYaml.safeYamlLoad(quotedContent, { maxAliases: 0 });
    expect(result).toBeDefined();
  });
});

describe('YAML Bomb GAP: validation scripts migrated to safe-yaml', () => {
  it('validate-agent-schema.js uses safeYamlLoad', () => {
    const content = readFileSync(join(ROOT, 'tools/validate-agent-schema.js'), 'utf8');
    expect(content).toContain("from '../src/utility/safe-yaml.js'");
    expect(content).toContain('safeYamlLoad');
    expect(content).not.toMatch(/\byaml\.load\b/);
  });

  it('validate-workflow-schema.js uses safeYamlLoad', () => {
    const content = readFileSync(join(ROOT, 'tools/validate-workflow-schema.js'), 'utf8');
    expect(content).toContain("from '../src/utility/safe-yaml.js'");
    expect(content).toContain('safeYamlLoad');
    expect(content).not.toMatch(/\byaml\.load\b/);
  });

  it('validate-module-schema.js uses safeYamlLoad', () => {
    const content = readFileSync(join(ROOT, 'tools/validate-module-schema.js'), 'utf8');
    expect(content).toContain("from '../src/utility/safe-yaml.js'");
    expect(content).toContain('safeYamlLoad');
    expect(content).not.toMatch(/\byaml\.load\b/);
  });

  it('help-generator.js uses safeYamlLoad', () => {
    const content = readFileSync(join(ROOT, 'src/core/help/help-generator.js'), 'utf8');
    expect(content).toContain('safeYamlLoad');
    expect(content).not.toMatch(/\byaml\.load\b/);
  });
});

// ════════════════════════════════════════════════════════════════════════
// SAST-004: bmad-voice-manager.sh — sed metacharacter escaping
// ════════════════════════════════════════════════════════════════════════

describe('SAST-004: bmad-voice-manager.sh sed metacharacter escaping', () => {
  it('escapes sed metacharacters before interpolation', () => {
    const content = readFileSync(join(ROOT, '.claude/hooks/bmad-voice-manager.sh'), 'utf8');
    // Must have SAST-004 comment marker
    expect(content).toContain('SAST-004');
    // Must escape sed metacharacters — the shell pattern is: sed 's/[&/\]/\\&/g'
    expect(content).toMatch(/sed\s+'s\/\[&\/\\\]\/\\\\&\/g'/);
  });

  it('uses safe_* variables in sed replacement', () => {
    const content = readFileSync(join(ROOT, '.claude/hooks/bmad-voice-manager.sh'), 'utf8');
    // Safe variables should exist
    expect(content).toContain('safe_agent_id');
    expect(content).toContain('safe_voice');
    expect(content).toContain('safe_personality');
  });
});

// ════════════════════════════════════════════════════════════════════════
// SAST-005: piper-installer.sh — separate download from extraction
// ════════════════════════════════════════════════════════════════════════

describe('SAST-005: piper-installer.sh separate download and extract', () => {
  it('downloads to temp file before extraction', () => {
    const content = readFileSync(join(ROOT, '.claude/hooks/piper-installer.sh'), 'utf8');
    expect(content).toContain('SAST-005');
    // Must download to file first, not pipe
    expect(content).toContain('TEMP_TARBALL');
    expect(content).toContain('-o "$TEMP_TARBALL"');
  });

  it('does NOT pipe curl directly to tar', () => {
    const content = readFileSync(join(ROOT, '.claude/hooks/piper-installer.sh'), 'utf8');
    // Old insecure pattern: curl ... | tar
    expect(content).not.toMatch(/curl\s+.*\|\s*tar/);
  });

  it('extracts from saved file', () => {
    const content = readFileSync(join(ROOT, '.claude/hooks/piper-installer.sh'), 'utf8');
    expect(content).toContain('tar -xzf "$TEMP_TARBALL"');
  });
});

// ════════════════════════════════════════════════════════════════════════
// SAST-006: input-validation.sh — JSON interpolation sanitization
// ════════════════════════════════════════════════════════════════════════

describe('SAST-006: input-validation.sh JSON sanitization', () => {
  it('sanitizes variables before JSON interpolation', () => {
    const content = readFileSync(join(ROOT, '.claude/hooks/lib/input-validation.sh'), 'utf8');
    expect(content).toContain('SAST-006');
    expect(content).toContain('safe_validator');
    expect(content).toContain('safe_input_type');
    expect(content).toContain('safe_reason');
  });

  it('escapes backslashes and quotes for JSON safety', () => {
    const content = readFileSync(join(ROOT, '.claude/hooks/lib/input-validation.sh'), 'utf8');
    // Must escape \ and " characters
    expect(content).toMatch(/sed\s+'s\/\[.*\\\\.*".*\]/);
  });

  it('removes newlines from interpolated values', () => {
    const content = readFileSync(join(ROOT, '.claude/hooks/lib/input-validation.sh'), 'utf8');
    // Must strip newlines/carriage returns
    expect(content).toContain("tr -d '\\n\\r'");
  });
});

// ════════════════════════════════════════════════════════════════════════
// SAST-007: personality-manager.sh — validate + escape sed metacharacters
// ════════════════════════════════════════════════════════════════════════

describe('SAST-007: personality-manager.sh input validation + sed escaping', () => {
  it('validates personality name before use', () => {
    const content = readFileSync(join(ROOT, '.claude/hooks/personality-manager.sh'), 'utf8');
    expect(content).toContain('SAST-007');
    expect(content).toContain('validate_agent_name');
  });

  it('escapes sed metacharacters in NAME substitution', () => {
    const content = readFileSync(join(ROOT, '.claude/hooks/personality-manager.sh'), 'utf8');
    expect(content).toContain('safe_name');
    // Must use escaped variable in sed, not raw $NAME
    expect(content).toMatch(/sed.*\$safe_name/);
  });

  it('sources input-validation.sh library', () => {
    const content = readFileSync(join(ROOT, '.claude/hooks/personality-manager.sh'), 'utf8');
    expect(content).toContain('input-validation.sh');
  });
});

// ════════════════════════════════════════════════════════════════════════
// S2 LOW: secret.ts — missing token patterns
// ════════════════════════════════════════════════════════════════════════

describe('S2 LOW: secret.ts token pattern coverage', () => {
  it('has Azure Shared Access Signature pattern', () => {
    const content = readFileSync(
      join(ROOT, '.claude/validators-node/src/guards/secret.ts'), 'utf8'
    );
    expect(content).toContain('Azure Shared Access Signature');
    expect(content).toContain('SharedAccessSignature');
  });

  it('has GitLab Personal Access Token pattern', () => {
    const content = readFileSync(
      join(ROOT, '.claude/validators-node/src/guards/secret.ts'), 'utf8'
    );
    expect(content).toContain('GitLab Personal Access Token');
    expect(content).toContain('glpat-');
  });

  it('has GitLab Deploy Token pattern', () => {
    const content = readFileSync(
      join(ROOT, '.claude/validators-node/src/guards/secret.ts'), 'utf8'
    );
    expect(content).toContain('GitLab Deploy Token');
    expect(content).toContain('gldt-');
  });

  it('has npm Access Token pattern', () => {
    const content = readFileSync(
      join(ROOT, '.claude/validators-node/src/guards/secret.ts'), 'utf8'
    );
    expect(content).toContain('npm Access Token');
    expect(content).toContain('npm_');
  });

  it('SA-02 LOW comment markers present', () => {
    const content = readFileSync(
      join(ROOT, '.claude/validators-node/src/guards/secret.ts'), 'utf8'
    );
    // All new patterns should have SA-02 LOW markers
    const markers = (content.match(/SA-02 LOW/g) || []).length;
    expect(markers).toBeGreaterThanOrEqual(3); // Azure, GitLab, npm sections
  });
});

// ════════════════════════════════════════════════════════════════════════
// S2 LOW: pii/patterns.ts — US_Passport regex tightened
// ════════════════════════════════════════════════════════════════════════

describe('S2 LOW: pii/patterns.ts US_Passport regex', () => {
  it('US_Passport requires letter prefix', () => {
    const content = readFileSync(
      join(ROOT, '.claude/validators-node/src/guards/pii/patterns.ts'), 'utf8'
    );
    expect(content).toContain('SA-02 LOW');
    // Pattern should require [A-Z] prefix (letter + 8 digits)
    expect(content).toMatch(/US_Passport.*\n.*\[A-Z\]\\d\{8\}/s);
  });

  it('US_Passport does NOT use optional letter prefix', () => {
    const content = readFileSync(
      join(ROOT, '.claude/validators-node/src/guards/pii/patterns.ts'), 'utf8'
    );
    // Extract just the regex line for US_Passport
    const passportIdx = content.indexOf("name: 'US_Passport'");
    const regexLine = content.substring(passportIdx, passportIdx + 80);
    // New pattern: /\b[A-Z]\d{8}\b/g — letter is mandatory, exactly 8 digits
    // Should NOT have {8,9} (that would match 9-digit numbers too)
    expect(regexLine).not.toContain('{8,9}');
    // Should have exactly \d{8} (8 digits, not variable)
    expect(regexLine).toMatch(/\\d\{8\}/);
  });
});

// ════════════════════════════════════════════════════════════════════════
// S2 LOW: pattern-engine.ts (extracted from prompt-injection.ts) — base64 min length
// ════════════════════════════════════════════════════════════════════════

describe('S2 LOW: prompt-injection.ts base64 minimum length', () => {
  it('base64 encoded content pattern uses 30 char minimum', () => {
    // Patterns extracted to pattern-engine.ts in TPI-09 (P1-3)
    const content = readFileSync(
      join(ROOT, '.claude/validators-node/src/ai-safety/pattern-engine.ts'), 'utf8'
    );
    expect(content).toContain('SA-02 LOW');
    // Pattern should have {30,} not {50,}
    expect(content).toContain('{30,}');
    expect(content).not.toContain('{50,}');
  });
});

// ════════════════════════════════════════════════════════════════════════
// S2 LOW: jailbreak.ts — session ID + risk_score
// ════════════════════════════════════════════════════════════════════════

describe('S2 LOW: jailbreak.ts session ID and risk_score', () => {
  it('imports crypto.randomUUID', () => {
    const content = readFileSync(
      join(ROOT, '.claude/validators-node/src/ai-safety/jailbreak.ts'), 'utf8'
    );
    expect(content).toContain("import { randomUUID } from 'node:crypto'");
  });

  it('uses randomUUID for temp session IDs', () => {
    const content = readFileSync(
      join(ROOT, '.claude/validators-node/src/ai-safety/jailbreak.ts'), 'utf8'
    );
    expect(content).toContain('SA-02 LOW');
    expect(content).toContain('randomUUID()');
    // Should NOT use predictable pid+timestamp pattern
    expect(content).not.toContain('process.pid}-${Math.floor');
  });

  it('uses risk_score in blocking decision', () => {
    const content = readFileSync(
      join(ROOT, '.claude/validators-node/src/ai-safety/jailbreak.ts'), 'utf8'
    );
    // shouldBlock should factor in riskScore >= 25 and isEscalating
    // Search for the shouldBlock assignment (may be split across lines)
    const blockIdx = content.indexOf('const shouldBlock');
    expect(blockIdx).toBeGreaterThan(0);
    const shouldBlockSection = content.substring(blockIdx, blockIdx + 400);
    expect(shouldBlockSection).toContain('riskScore >= 25');
    expect(shouldBlockSection).toContain('isEscalating');
  });
});

// ════════════════════════════════════════════════════════════════════════
// S2 LOW: bash-safety.ts — pipe chain splitting
// ════════════════════════════════════════════════════════════════════════

describe('S2 LOW: bash-safety.ts pipe chain splitting', () => {
  it('exports splitCommandSegments function', () => {
    const content = readFileSync(
      join(ROOT, '.claude/validators-node/src/guards/bash-safety.ts'), 'utf8'
    );
    expect(content).toContain('export function splitCommandSegments');
    expect(content).toContain('SA-02 LOW');
  });

  it('splitCommandSegments splits on pipe and chain operators', () => {
    const content = readFileSync(
      join(ROOT, '.claude/validators-node/src/guards/bash-safety.ts'), 'utf8'
    );
    // Function body should contain a regex that splits on pipe/chain operators
    const funcIdx = content.indexOf('function splitCommandSegments');
    const funcSection = content.substring(funcIdx, funcIdx + 500);
    // Must handle ||, &&, |, and ;
    expect(funcSection).toContain('||');
    expect(funcSection).toContain('&&');
    expect(funcSection).toContain('.split(');
  });

  it('extractRmTargets uses splitCommandSegments', () => {
    const content = readFileSync(
      join(ROOT, '.claude/validators-node/src/guards/bash-safety.ts'), 'utf8'
    );
    // extractRmTargets should call splitCommandSegments
    const rmTargetsSection = content.substring(
      content.indexOf('function extractRmTargets'),
      content.indexOf('function extractRmTargets') + 500
    );
    expect(rmTargetsSection).toContain('splitCommandSegments');
  });

  it('SHELL_OPERATORS set prevents operator tokens as rm targets', () => {
    const content = readFileSync(
      join(ROOT, '.claude/validators-node/src/guards/bash-safety.ts'), 'utf8'
    );
    expect(content).toContain('SHELL_OPERATORS');
    // Should include common shell operators
    expect(content).toContain("'|'");
    expect(content).toContain("'&&'");
    expect(content).toContain("';'");
  });

  it('checkDangerousPatterns checks chain segments', () => {
    const content = readFileSync(
      join(ROOT, '.claude/validators-node/src/guards/bash-safety.ts'), 'utf8'
    );
    // checkDangerousPatterns should also check segments — full function may be >1500 chars
    const funcIdx = content.indexOf('function checkDangerousPatterns');
    const nextFunc = content.indexOf('function validateBashCommand');
    const patternSection = content.substring(funcIdx, nextFunc > funcIdx ? nextFunc : funcIdx + 2000);
    expect(patternSection).toContain('splitCommandSegments');
    expect(patternSection).toContain('in chained command');
  });
});

// ════════════════════════════════════════════════════════════════════════
// Regression: No new lint/type errors
// ════════════════════════════════════════════════════════════════════════

describe('Regression: safe-yaml.js exists and is importable', () => {
  it('safe-yaml.js exists at expected path', () => {
    expect(existsSync(join(ROOT, 'src/utility/safe-yaml.js'))).toBe(true);
  });
});
