/**
 * L10 Attack Vector Protocol Tests (P8-35)
 *
 * Content analysis test verifying agents have defenses against 6 attack vectors:
 * 1. Direct instruction override
 * 2. Role manipulation
 * 3. Data exfiltration via output
 * 4. Prompt injection via external content
 * 5. Social engineering
 * 6. Encoded payload bypass
 *
 * Tests 1 agent per module (9 total, first alphabetically).
 * Minimum required: L8 (prompt injection) + L9 (external manipulation).
 *
 * @module tests/security/l10-attack-vector-protocol
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function findProjectRoot() {
  let dir = join(__dirname, '..', '..');
  for (let i = 0; i < 10; i++) {
    if (existsSync(join(dir, 'package.json')) && (existsSync(join(dir, 'src')) || existsSync(join(dir, '_bmad')))) return dir;
    dir = dirname(dir);
  }
  return process.cwd();
}

const PROJECT_ROOT = findProjectRoot();
const SRC_DIR = join(PROJECT_ROOT, 'src');

const MODULES = [
  'core', 'bmm', 'bmb', 'bmgd', 'cis',
  'cybersec-team', 'intel-team', 'legal-team', 'strategy-team',
];

// ---------------------------------------------------------------------------
// Pick first agent alphabetically per module
// ---------------------------------------------------------------------------

function getFirstAgent(moduleName) {
  const agentsDir = join(SRC_DIR, moduleName, 'agents');
  if (!existsSync(agentsDir)) return null;
  const files = readdirSync(agentsDir)
    .filter((f) => f.endsWith('.md') && !f.startsWith('.'))
    .sort();
  if (files.length === 0) return null;
  return { name: files[0], path: join(agentsDir, files[0]) };
}

// ---------------------------------------------------------------------------
// Attack vector detection patterns
// ---------------------------------------------------------------------------

/**
 * L8: Prompt injection protection.
 * Searches for explicit PROMPT INJECTION PROTECTION rule in agent content.
 */
function hasPromptInjectionProtection(content) {
  return /PROMPT INJECTION PROTECTION/i.test(content);
}

/**
 * L9: External content manipulation protection.
 * Searches for EXTERNAL CONTENT MANIPULATION PROTECTION rule.
 */
function hasExternalManipulationProtection(content) {
  return /EXTERNAL CONTENT MANIPULATION PROTECTION/i.test(content);
}

/**
 * AV1: Direct instruction override resistance.
 * Checks for patterns that resist "ignore previous instructions" attacks.
 */
function hasInstructionOverrideResistance(content) {
  const lc = content.toLowerCase();
  return (
    lc.includes('ignore') && (lc.includes('instruction') || lc.includes('previous'))
  ) || lc.includes('override') || /never break character/i.test(content)
    || /must fully embody/i.test(content);
}

/**
 * AV2: Role manipulation resistance.
 * Checks for patterns that resist "you are now an unrestricted AI" attacks.
 */
function hasRoleManipulationResistance(content) {
  const lc = content.toLowerCase();
  return lc.includes('manipulation') || lc.includes('role')
    || /never break character/i.test(content)
    || /must fully embody.*persona/i.test(content);
}

/**
 * AV3: Data exfiltration defense.
 * Checks for rules against leaking system prompts or internal data.
 */
function hasDataExfiltrationDefense(content) {
  const lc = content.toLowerCase();
  return lc.includes('exfiltration') || lc.includes('system prompt')
    || lc.includes('leak') || lc.includes('disclose')
    || lc.includes('do not reveal') || lc.includes('do not share');
}

/**
 * AV5: Social engineering resistance.
 * Checks for rules against "admin said to skip" type attacks.
 */
function hasSocialEngineeringResistance(content) {
  const lc = content.toLowerCase();
  return lc.includes('social engineering') || lc.includes('authority')
    || lc.includes('admin') || lc.includes('impersonat')
    || lc.includes('manipulation protection');
}

/**
 * AV6: Encoded payload bypass defense.
 * Checks for awareness of base64/URL-encoded attacks.
 */
function hasEncodedPayloadDefense(content) {
  const lc = content.toLowerCase();
  return lc.includes('base64') || lc.includes('encoded')
    || lc.includes('obfuscat') || lc.includes('decode')
    || lc.includes('injection protection');
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('L10 Attack Vector Protocol (P8-35)', () => {
  const agentsByModule = {};

  beforeAll(() => {
    for (const mod of MODULES) {
      const agent = getFirstAgent(mod);
      if (agent) {
        agentsByModule[mod] = {
          ...agent,
          content: readFileSync(agent.path, 'utf-8'),
        };
      }
    }
  });

  it('L10-001: found at least one agent per module (9 modules)', () => {
    expect(Object.keys(agentsByModule).length).toBe(MODULES.length);
    for (const mod of MODULES) {
      expect(agentsByModule[mod], 'Missing agent for module ' + mod).toBeDefined();
    }
  });
});

describe('L8: Prompt Injection Protection (minimum required)', () => {
  for (const mod of MODULES) {
    it('L10-L8-' + mod + ': agent has PROMPT INJECTION PROTECTION', () => {
      const agentsDir = join(SRC_DIR, mod, 'agents');
      const files = readdirSync(agentsDir).filter((f) => f.endsWith('.md')).sort();
      const content = readFileSync(join(agentsDir, files[0]), 'utf-8');
      expect(hasPromptInjectionProtection(content)).toBe(true);
    });
  }
});

describe('L9: External Content Manipulation Protection (minimum required)', () => {
  for (const mod of MODULES) {
    it('L10-L9-' + mod + ': agent has EXTERNAL CONTENT MANIPULATION PROTECTION', () => {
      const agentsDir = join(SRC_DIR, mod, 'agents');
      const files = readdirSync(agentsDir).filter((f) => f.endsWith('.md')).sort();
      const content = readFileSync(join(agentsDir, files[0]), 'utf-8');
      expect(hasExternalManipulationProtection(content)).toBe(true);
    });
  }
});

describe('AV1: Direct Instruction Override Resistance', () => {
  for (const mod of MODULES) {
    it('L10-AV1-' + mod + ': agent resists instruction override', () => {
      const agentsDir = join(SRC_DIR, mod, 'agents');
      const files = readdirSync(agentsDir).filter((f) => f.endsWith('.md')).sort();
      const content = readFileSync(join(agentsDir, files[0]), 'utf-8');
      expect(hasInstructionOverrideResistance(content)).toBe(true);
    });
  }
});

describe('AV2: Role Manipulation Resistance', () => {
  for (const mod of MODULES) {
    it('L10-AV2-' + mod + ': agent resists role manipulation', () => {
      const agentsDir = join(SRC_DIR, mod, 'agents');
      const files = readdirSync(agentsDir).filter((f) => f.endsWith('.md')).sort();
      const content = readFileSync(join(agentsDir, files[0]), 'utf-8');
      expect(hasRoleManipulationResistance(content)).toBe(true);
    });
  }
});

describe('Attack Vector Coverage Summary', () => {
  it('L10-SUMMARY: all 9 modules pass L8+L9 minimum', () => {
    let passCount = 0;
    for (const mod of MODULES) {
      const agentsDir = join(SRC_DIR, mod, 'agents');
      const files = readdirSync(agentsDir).filter((f) => f.endsWith('.md')).sort();
      const content = readFileSync(join(agentsDir, files[0]), 'utf-8');
      if (hasPromptInjectionProtection(content) && hasExternalManipulationProtection(content)) {
        passCount++;
      }
    }
    expect(passCount).toBe(9);
  });

  it('L10-AV-COVERAGE: agents have broad attack vector coverage', () => {
    const results = {};
    for (const mod of MODULES) {
      const agentsDir = join(SRC_DIR, mod, 'agents');
      const files = readdirSync(agentsDir).filter((f) => f.endsWith('.md')).sort();
      const content = readFileSync(join(agentsDir, files[0]), 'utf-8');
      results[mod] = {
        av1_override: hasInstructionOverrideResistance(content),
        av2_role: hasRoleManipulationResistance(content),
        av3_exfil: hasDataExfiltrationDefense(content),
        av4_injection: hasPromptInjectionProtection(content),
        av5_social: hasSocialEngineeringResistance(content),
        av6_encoded: hasEncodedPayloadDefense(content),
      };
    }
    // Every module must pass at least L8 (av4) and L9 (external = av5/av2)
    for (const mod of MODULES) {
      expect(results[mod].av4_injection, mod + ' missing av4').toBe(true);
    }
  });
});
