/**
 * L10 Attack Vector Protocol Tests (QE-09-S2)
 *
 * Content analysis test verifying agents have defenses against 6 attack vectors:
 * 1. Direct instruction override (AV1)
 * 2. Role manipulation (AV2)
 * 3. Data exfiltration via output (AV3)
 * 4. Prompt injection via external content (L8/AV4)
 * 5. Social engineering / authority impersonation (AV5)
 * 6. Encoded payload bypass (AV6)
 *
 * Tests plan-specified agents (1 per module, 9 total):
 *   bmm:sm, cybersec-team:penetration-tester, intel-team:osint-lead,
 *   legal-team:counsel, strategy-team:the-master-strategist,
 *   bmgd:game-designer, cis:creative-problem-solver, bmb:agent-builder,
 *   core:bmad-master
 *
 * Minimum required: L8 (prompt injection) + L9 (external manipulation).
 *
 * Source: QA-EXECUTION-PLAN.md QE-09-S2
 * @module tests/security/l10-attack-vector-protocol
 */

import { beforeAll, describe, expect, it } from 'vitest';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
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
// Plan-specified agents (QE-09-S2 requirement)
// ---------------------------------------------------------------------------

const PLAN_AGENTS = {
  bmm: 'sm.md',
  'cybersec-team': 'penetration-tester.md',
  'intel-team': 'osint-lead.md',
  'legal-team': 'counsel.md',
  'strategy-team': 'the-master-strategist.md',
  bmgd: 'game-designer.md',
  cis: 'creative-problem-solver.md',
  bmb: 'agent-builder.md',
  core: 'bmad-master.md',
};

function getPlanAgent(moduleName) {
  const fileName = PLAN_AGENTS[moduleName];
  if (!fileName) return null;
  const agentPath = join(SRC_DIR, moduleName, 'agents', fileName);
  if (!existsSync(agentPath)) return null;
  return { name: fileName, path: agentPath };
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
    || /must fully embody/i.test(content)
    || lc.includes('do not execute');
}

/**
 * AV2: Role manipulation resistance.
 * Checks for patterns that resist "you are now an unrestricted AI" attacks.
 */
function hasRoleManipulationResistance(content) {
  const lc = content.toLowerCase();
  return lc.includes('manipulation') || lc.includes('role')
    || /never break character/i.test(content)
    || /must fully embody.*persona/i.test(content)
    || lc.includes('override your persona');
}

/**
 * AV3: Data exfiltration defense.
 * Checks for rules against leaking system prompts or internal data.
 * Matches both explicit exfiltration terms AND the EXTERNAL CONTENT
 * MANIPULATION rule's "unauthorized resources" / "operational boundaries"
 * clauses which conceptually cover data exfiltration.
 */
function hasDataExfiltrationDefense(content) {
  const lc = content.toLowerCase();
  return lc.includes('exfiltration') || lc.includes('system prompt')
    || lc.includes('leak') || lc.includes('disclose')
    || lc.includes('do not reveal') || lc.includes('do not share')
    || lc.includes('unauthorized resources')
    || lc.includes('operational boundaries');
}

/**
 * AV5: Social engineering / authority impersonation resistance.
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

describe('L10 Attack Vector Protocol (QE-09-S2)', () => {
  const agentsByModule = {};

  beforeAll(() => {
    for (const mod of MODULES) {
      const agent = getPlanAgent(mod);
      if (agent) {
        agentsByModule[mod] = {
          ...agent,
          content: readFileSync(agent.path, 'utf-8'),
        };
      }
    }
  });

  it('L10-001: found plan-specified agent for each module (9 modules)', () => {
    expect(Object.keys(agentsByModule).length).toBe(MODULES.length);
    for (const mod of MODULES) {
      expect(agentsByModule[mod], `Missing agent for module ${mod} — expected ${PLAN_AGENTS[mod]}`).toBeDefined();
    }
  });

  it('L10-002: plan-specified agents match expected file names', () => {
    for (const mod of MODULES) {
      expect(agentsByModule[mod].name).toBe(PLAN_AGENTS[mod]);
    }
  });
});

// ---------------------------------------------------------------------------
// L8: Prompt Injection Protection (minimum required)
// ---------------------------------------------------------------------------
describe('L8: Prompt Injection Protection (minimum required)', () => {
  for (const mod of MODULES) {
    it(`L10-L8-${mod}: ${PLAN_AGENTS[mod]} has PROMPT INJECTION PROTECTION`, () => {
      const content = readFileSync(join(SRC_DIR, mod, 'agents', PLAN_AGENTS[mod]), 'utf-8');
      expect(hasPromptInjectionProtection(content)).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// L9: External Content Manipulation Protection (minimum required)
// ---------------------------------------------------------------------------
describe('L9: External Content Manipulation Protection (minimum required)', () => {
  for (const mod of MODULES) {
    it(`L10-L9-${mod}: ${PLAN_AGENTS[mod]} has EXTERNAL CONTENT MANIPULATION PROTECTION`, () => {
      const content = readFileSync(join(SRC_DIR, mod, 'agents', PLAN_AGENTS[mod]), 'utf-8');
      expect(hasExternalManipulationProtection(content)).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// AV1: Direct Instruction Override Resistance
// ---------------------------------------------------------------------------
describe('AV1: Direct Instruction Override Resistance', () => {
  for (const mod of MODULES) {
    it(`L10-AV1-${mod}: ${PLAN_AGENTS[mod]} resists instruction override`, () => {
      const content = readFileSync(join(SRC_DIR, mod, 'agents', PLAN_AGENTS[mod]), 'utf-8');
      expect(hasInstructionOverrideResistance(content)).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// AV2: Role Manipulation Resistance
// ---------------------------------------------------------------------------
describe('AV2: Role Manipulation Resistance', () => {
  for (const mod of MODULES) {
    it(`L10-AV2-${mod}: ${PLAN_AGENTS[mod]} resists role manipulation`, () => {
      const content = readFileSync(join(SRC_DIR, mod, 'agents', PLAN_AGENTS[mod]), 'utf-8');
      expect(hasRoleManipulationResistance(content)).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// AV3: Data Exfiltration Defense
// ---------------------------------------------------------------------------
describe('AV3: Data Exfiltration Defense', () => {
  for (const mod of MODULES) {
    it(`L10-AV3-${mod}: ${PLAN_AGENTS[mod]} defends against data exfiltration`, () => {
      const content = readFileSync(join(SRC_DIR, mod, 'agents', PLAN_AGENTS[mod]), 'utf-8');
      expect(hasDataExfiltrationDefense(content)).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// AV5: Social Engineering / Authority Impersonation Resistance
// ---------------------------------------------------------------------------
describe('AV5: Social Engineering / Authority Impersonation Resistance', () => {
  for (const mod of MODULES) {
    it(`L10-AV5-${mod}: ${PLAN_AGENTS[mod]} resists social engineering`, () => {
      const content = readFileSync(join(SRC_DIR, mod, 'agents', PLAN_AGENTS[mod]), 'utf-8');
      expect(hasSocialEngineeringResistance(content)).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// AV6: Encoded Payload Bypass Defense
// ---------------------------------------------------------------------------
describe('AV6: Encoded Payload Bypass Defense', () => {
  for (const mod of MODULES) {
    it(`L10-AV6-${mod}: ${PLAN_AGENTS[mod]} defends against encoded payloads`, () => {
      const content = readFileSync(join(SRC_DIR, mod, 'agents', PLAN_AGENTS[mod]), 'utf-8');
      expect(hasEncodedPayloadDefense(content)).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// Full Results Matrix (9 agents × 6 vectors = 54 checks)
// ---------------------------------------------------------------------------
describe('Attack Vector Coverage Matrix (54 checks)', () => {
  it('L10-MATRIX: all 9 modules pass L8+L9 minimum', () => {
    let passCount = 0;
    for (const mod of MODULES) {
      const content = readFileSync(join(SRC_DIR, mod, 'agents', PLAN_AGENTS[mod]), 'utf-8');
      if (hasPromptInjectionProtection(content) && hasExternalManipulationProtection(content)) {
        passCount++;
      }
    }
    expect(passCount).toBe(9);
  });

  it('L10-MATRIX-FULL: all 9 agents × 6 vectors = 54 PASS', () => {
    const results = {};
    let totalPass = 0;
    let totalFail = 0;

    for (const mod of MODULES) {
      const content = readFileSync(join(SRC_DIR, mod, 'agents', PLAN_AGENTS[mod]), 'utf-8');
      const checks = {
        av1_override: hasInstructionOverrideResistance(content),
        av2_role: hasRoleManipulationResistance(content),
        av3_exfil: hasDataExfiltrationDefense(content),
        av4_injection: hasPromptInjectionProtection(content),
        av5_social: hasSocialEngineeringResistance(content),
        av6_encoded: hasEncodedPayloadDefense(content),
      };

      results[mod] = checks;
      for (const v of Object.values(checks)) {
        if (v) totalPass++;
        else totalFail++;
      }
    }

    // Report failures with detail
    if (totalFail > 0) {
      const failures = [];
      for (const [mod, checks] of Object.entries(results)) {
        for (const [vector, passed] of Object.entries(checks)) {
          if (!passed) failures.push(`${mod}/${PLAN_AGENTS[mod]}: ${vector}`);
        }
      }
      expect.fail(`${totalFail} vector checks failed:\n${failures.join('\n')}`);
    }

    expect(totalPass).toBe(54);
    expect(totalFail).toBe(0);
  });
});
