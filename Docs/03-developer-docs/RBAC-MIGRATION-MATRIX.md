# RBAC Migration Matrix - Story 12 (CRIT-2)

**Version:** 1.0.0
**Date:** 2026-02-09
**Status:** Pre-Migration Reference
**Purpose:** Complete old-to-new agent ID mapping for the v6 agent path migration, ensuring zero RBAC bypass windows during the transition from legacy `module/agent` format to v6 `_bmad/module/agents/agent` format.

---

## 1. Threat Model

During agent ID migration, if RBAC rules are partially updated, an attacker could:

1. **Reference agents by old IDs** to bypass new RBAC rules that only check v6 paths
2. **Reference agents by new IDs** to bypass old RBAC rules that only check legacy paths
3. **Exploit the transition window** where some agents use old IDs and others use new IDs

**Mitigation:** Atomic commit strategy with dual-format validation during migration lock period.

---

## 2. Complete Agent ID Migration Matrix

### Legend

- **Legacy ID**: Current format used in RBAC rules (`module/agent-name`)
- **V6 ID**: Target format after migration (`_bmad/module/agents/agent-name`)
- **RBAC Pattern**: Wildcard pattern in rbac-config.yaml that currently grants access
- **Restrictions**: Agent-level restrictions defined in `agent_restrictions` section

### 2.1 Core Module (2 agents)

| # | Module | Legacy ID | V6 ID | RBAC Pattern | Restrictions |
|---|--------|-----------|-------|--------------|--------------|
| 1 | core | core/bmad-master | src/core/agents/bmad-master | core/* | None |
| 2 | core | core/abdul | src/core/agents/abdul | core/* | None |

### 2.2 BMB Module - BMAD Module Builder (3 agents)

| # | Module | Legacy ID | V6 ID | RBAC Pattern | Restrictions |
|---|--------|-----------|-------|--------------|--------------|
| 3 | bmb | bmb/agent-builder | src/bmb/agents/agent-builder | bmb/* | None |
| 4 | bmb | bmb/module-builder | src/bmb/agents/module-builder | bmb/* | None |
| 5 | bmb | bmb/workflow-builder | src/bmb/agents/workflow-builder | bmb/* | None |

### 2.3 BMGD Module - Game Development (6 agents)

| # | Module | Legacy ID | V6 ID | RBAC Pattern | Restrictions |
|---|--------|-----------|-------|--------------|--------------|
| 6 | bmgd | bmgd/game-architect | src/bmgd/agents/game-architect | bmgd/* | None |
| 7 | bmgd | bmgd/game-designer | src/bmgd/agents/game-designer | bmgd/* | None |
| 8 | bmgd | bmgd/game-dev | src/bmgd/agents/game-dev | bmgd/* | None |
| 9 | bmgd | bmgd/game-qa | src/bmgd/agents/game-qa | bmgd/* | None |
| 10 | bmgd | bmgd/game-scrum-master | src/bmgd/agents/game-scrum-master | bmgd/* | None |
| 11 | bmgd | bmgd/game-solo-dev | src/bmgd/agents/game-solo-dev | bmgd/* | None |

### 2.4 BMM Module - BMAD Methodology (10 agents)

| # | Module | Legacy ID | V6 ID | RBAC Pattern | Restrictions |
|---|--------|-----------|-------|--------------|--------------|
| 12 | bmm | bmm/analyst | src/bmm/agents/analyst | bmm/* | None |
| 13 | bmm | bmm/architect | src/bmm/agents/architect | bmm/* | None |
| 14 | bmm | bmm/dev | src/bmm/agents/dev | bmm/* | None |
| 15 | bmm | bmm/pm | src/bmm/agents/pm | bmm/* | None |
| 16 | bmm | bmm/qa | src/bmm/agents/qa | bmm/* | None |
| 17 | bmm | bmm/quick-flow-solo-dev | src/bmm/agents/quick-flow-solo-dev | bmm/* | None |
| 18 | bmm | bmm/sm | src/bmm/agents/sm | bmm/* | None |
| 19 | bmm | bmm/tea | src/bmm/agents/tea | bmm/* | None |
| 20 | bmm | bmm/tech-writer | src/bmm/agents/tech-writer | bmm/* | None |
| 21 | bmm | bmm/ux-designer | src/bmm/agents/ux-designer | bmm/* | None |

### 2.5 CIS Module - Creative Innovation Suite (6 agents)

| # | Module | Legacy ID | V6 ID | RBAC Pattern | Restrictions |
|---|--------|-----------|-------|--------------|--------------|
| 22 | cis | cis/brainstorming-coach | src/cis/agents/brainstorming-coach | cis/* | None |
| 23 | cis | cis/creative-problem-solver | src/cis/agents/creative-problem-solver | cis/* | None |
| 24 | cis | cis/design-thinking-coach | src/cis/agents/design-thinking-coach | cis/* | None |
| 25 | cis | cis/innovation-strategist | src/cis/agents/innovation-strategist | cis/* | None |
| 26 | cis | cis/presentation-master | src/cis/agents/presentation-master | cis/* | None |
| 27 | cis | cis/storyteller | src/cis/agents/storyteller | cis/* | None |

> **Note:** The storyteller agent file is at a nested path `src/cis/agents/storyteller/storyteller.md`. The V6 ID should resolve to the agent directory, not the file directly. During migration, ensure the RBAC resolver handles this nested structure.

### 2.6 Cybersec-Team Module (15 agents)

| # | Module | Legacy ID | V6 ID | RBAC Pattern | Restrictions |
|---|--------|-----------|-------|--------------|--------------|
| 28 | cybersec-team | cybersec-team/api-security-expert | src/cybersec-team/agents/api-security-expert | cybersec-team/* | None |
| 29 | cybersec-team | cybersec-team/blockchain-security-expert | src/cybersec-team/agents/blockchain-security-expert | cybersec-team/* | None |
| 30 | cybersec-team | cybersec-team/blue-team-lead | src/cybersec-team/agents/blue-team-lead | cybersec-team/* | None |
| 31 | cybersec-team | cybersec-team/cloud-security-specialist | src/cybersec-team/agents/cloud-security-specialist | cybersec-team/* | None |
| 32 | cybersec-team | cybersec-team/compliance-guardian | src/cybersec-team/agents/compliance-guardian | cybersec-team/* | None |
| 33 | cybersec-team | cybersec-team/forensic-investigator | src/cybersec-team/agents/forensic-investigator | cybersec-team/* | None |
| 34 | cybersec-team | cybersec-team/incident-commander | src/cybersec-team/agents/incident-commander | cybersec-team/* | None |
| 35 | cybersec-team | cybersec-team/llm-ai-security-expert | src/cybersec-team/agents/llm-ai-security-expert | cybersec-team/* | None |
| 36 | cybersec-team | cybersec-team/mobile-security-expert | src/cybersec-team/agents/mobile-security-expert | cybersec-team/* | None |
| 37 | cybersec-team | cybersec-team/penetration-tester | src/cybersec-team/agents/penetration-tester | cybersec-team/* | None |
| 38 | cybersec-team | cybersec-team/security-architect | src/cybersec-team/agents/security-architect | cybersec-team/* | None |
| 39 | cybersec-team | cybersec-team/soc-analyst | src/cybersec-team/agents/soc-analyst | cybersec-team/* | None |
| 40 | cybersec-team | cybersec-team/social-engineer | src/cybersec-team/agents/social-engineer | cybersec-team/* | Agent-level restriction |
| 41 | cybersec-team | cybersec-team/threat-analyst | src/cybersec-team/agents/threat-analyst | cybersec-team/* | None |
| 42 | cybersec-team | cybersec-team/web-app-security-expert | src/cybersec-team/agents/web-app-security-expert | cybersec-team/* | None |

### 2.7 Intel-Team Module (11 agents)

| # | Module | Legacy ID | V6 ID | RBAC Pattern | Restrictions |
|---|--------|-----------|-------|--------------|--------------|
| 43 | intel-team | intel-team/corporate-intel-specialist | src/intel-team/agents/corporate-intel-specialist | intel-team/* | None |
| 44 | intel-team | intel-team/dark-web-analyst | src/intel-team/agents/dark-web-analyst | intel-team/* | Agent-level restriction |
| 45 | intel-team | intel-team/domain-intel-specialist | src/intel-team/agents/domain-intel-specialist | intel-team/* | None |
| 46 | intel-team | intel-team/field-operative | src/intel-team/agents/field-operative | intel-team/* | Agent-level restriction |
| 47 | intel-team | intel-team/geospatial-analyst | src/intel-team/agents/geospatial-analyst | intel-team/* | None |
| 48 | intel-team | intel-team/humint-specialist | src/intel-team/agents/humint-specialist | intel-team/* | Agent-level restriction |
| 49 | intel-team | intel-team/osint-lead | src/intel-team/agents/osint-lead | intel-team/* | None |
| 50 | intel-team | intel-team/sigint-specialist | src/intel-team/agents/sigint-specialist | intel-team/* | None |
| 51 | intel-team | intel-team/social-media-analyst | src/intel-team/agents/social-media-analyst | intel-team/* | None |
| 52 | intel-team | intel-team/technical-researcher | src/intel-team/agents/technical-researcher | intel-team/* | None |
| 53 | intel-team | intel-team/threat-actor-profiler | src/intel-team/agents/threat-actor-profiler | intel-team/* | None |

### 2.8 Legal-Team Module (13 agents)

| # | Module | Legacy ID | V6 ID | RBAC Pattern | Restrictions |
|---|--------|-----------|-------|--------------|--------------|
| 54 | legal-team | legal-team/advocate | src/legal-team/agents/advocate | legal-team/* | None |
| 55 | legal-team | legal-team/baltic | src/legal-team/agents/baltic | legal-team/* | None |
| 56 | legal-team | legal-team/castile | src/legal-team/agents/castile | legal-team/* | None |
| 57 | legal-team | legal-team/charter | src/legal-team/agents/charter | legal-team/* | None |
| 58 | legal-team | legal-team/counsel | src/legal-team/agents/counsel | legal-team/* | None |
| 59 | legal-team | legal-team/covenant | src/legal-team/agents/covenant | legal-team/* | None |
| 60 | legal-team | legal-team/deed | src/legal-team/agents/deed | legal-team/* | None |
| 61 | legal-team | legal-team/europa | src/legal-team/agents/europa | legal-team/* | None |
| 62 | legal-team | legal-team/gremio | src/legal-team/agents/gremio | legal-team/* | None |
| 63 | legal-team | legal-team/iberia | src/legal-team/agents/iberia | legal-team/* | None |
| 64 | legal-team | legal-team/insignia | src/legal-team/agents/insignia | legal-team/* | None |
| 65 | legal-team | legal-team/liberty | src/legal-team/agents/liberty | legal-team/* | None |
| 66 | legal-team | legal-team/tribute | src/legal-team/agents/tribute | legal-team/* | None |

### 2.9 Strategy-Team Module (14 agents)

| # | Module | Legacy ID | V6 ID | RBAC Pattern | Restrictions |
|---|--------|-----------|-------|--------------|--------------|
| 67 | strategy-team | strategy-team/communications-director | src/strategy-team/agents/communications-director | strategy-team/* | None |
| 68 | strategy-team | strategy-team/debate-coach | src/strategy-team/agents/debate-coach | strategy-team/* | None |
| 69 | strategy-team | strategy-team/ethics-advisor | src/strategy-team/agents/ethics-advisor | strategy-team/* | None |
| 70 | strategy-team | strategy-team/policy-analyst | src/strategy-team/agents/policy-analyst | strategy-team/* | None |
| 71 | strategy-team | strategy-team/political-strategist | src/strategy-team/agents/political-strategist | strategy-team/* | None |
| 72 | strategy-team | strategy-team/stakeholder-mediator | src/strategy-team/agents/stakeholder-mediator | strategy-team/* | None |
| 73 | strategy-team | strategy-team/the-conservative | src/strategy-team/agents/the-conservative | strategy-team/* | None |
| 74 | strategy-team | strategy-team/the-liberator | src/strategy-team/agents/the-liberator | strategy-team/* | None |
| 75 | strategy-team | strategy-team/the-master-strategist | src/strategy-team/agents/the-master-strategist | strategy-team/* | None |
| 76 | strategy-team | strategy-team/the-principled-commander | src/strategy-team/agents/the-principled-commander | strategy-team/* | None |
| 77 | strategy-team | strategy-team/the-realist | src/strategy-team/agents/the-realist | strategy-team/* | None |
| 78 | strategy-team | strategy-team/the-revolutionary | src/strategy-team/agents/the-revolutionary | strategy-team/* | None |
| 79 | strategy-team | strategy-team/the-strategist-warrior | src/strategy-team/agents/the-strategist-warrior | strategy-team/* | None |
| 80 | strategy-team | strategy-team/the-technocrat | src/strategy-team/agents/the-technocrat | strategy-team/* | None |

### Summary

| Module | Agent Count |
|--------|-------------|
| core | 2 |
| bmb | 3 |
| bmgd | 6 |
| bmm | 10 |
| cis | 6 |
| cybersec-team | 15 |
| intel-team | 11 |
| legal-team | 13 |
| strategy-team | 14 |
| **Total** | **80** |

---

## 3. RBAC Rules That Must Change

All patterns in `src/core/security/rbac-config.yaml` that reference agent IDs must be updated atomically.

### 3.1 Wildcard Agent Patterns (by role)

These patterns use `module/*` format and must migrate to `_bmad/module/agents/*`:

| Role | Current Pattern | New Pattern | Section |
|------|----------------|-------------|---------|
| admin | `*` | `*` | No change needed (universal wildcard) |
| security_lead | `cybersec-team/*` | `src/cybersec-team/agents/*` | roles.security_lead.permissions.agents |
| security_lead | `intel-team/*` | `src/intel-team/agents/*` | roles.security_lead.permissions.agents |
| security_lead | `core/*` | `src/core/agents/*` | roles.security_lead.permissions.agents |
| intel_analyst | `intel-team/*` | `src/intel-team/agents/*` | roles.intel_analyst.permissions.agents |
| intel_analyst | `core/*` | `src/core/agents/*` | roles.intel_analyst.permissions.agents |
| legal_counsel | `legal-team/*` | `src/legal-team/agents/*` | roles.legal_counsel.permissions.agents |
| legal_counsel | `core/*` | `src/core/agents/*` | roles.legal_counsel.permissions.agents |
| developer | `bmm/*` | `src/bmm/agents/*` | roles.developer.permissions.agents |
| developer | `bmgd/*` | `src/bmgd/agents/*` | roles.developer.permissions.agents |
| developer | `bmb/*` | `src/bmb/agents/*` | roles.developer.permissions.agents |
| developer | `cis/*` | `src/cis/agents/*` | roles.developer.permissions.agents |
| developer | `core/*` | `src/core/agents/*` | roles.developer.permissions.agents |
| product_manager | `cis/*` | `src/cis/agents/*` | roles.product_manager.permissions.agents |
| product_manager | `core/*` | `src/core/agents/*` | roles.product_manager.permissions.agents |
| strategist | `strategy-team/*` | `src/strategy-team/agents/*` | roles.strategist.permissions.agents |
| strategist | `core/*` | `src/core/agents/*` | roles.strategist.permissions.agents |

### 3.2 Explicit Agent References (by role)

These are specific agent IDs (not wildcards) that must be updated:

| Role | Current Reference | New Reference | Section |
|------|-------------------|---------------|---------|
| security_analyst | `cybersec-team/security-architect` | `src/cybersec-team/agents/security-architect` | roles.security_analyst.permissions.agents |
| security_analyst | `cybersec-team/threat-analyst` | `src/cybersec-team/agents/threat-analyst` | roles.security_analyst.permissions.agents |
| security_analyst | `cybersec-team/penetration-tester` | `src/cybersec-team/agents/penetration-tester` | roles.security_analyst.permissions.agents |
| security_analyst | `cybersec-team/soc-analyst` | `src/cybersec-team/agents/soc-analyst` | roles.security_analyst.permissions.agents |
| security_analyst | `cybersec-team/web-app-security-expert` | `src/cybersec-team/agents/web-app-security-expert` | roles.security_analyst.permissions.agents |
| security_analyst | `cybersec-team/cloud-security-specialist` | `src/cybersec-team/agents/cloud-security-specialist` | roles.security_analyst.permissions.agents |
| security_analyst | `cybersec-team/appsec-engineer` | **PHANTOM** - No agent file exists | roles.security_analyst.permissions.agents |
| security_analyst | `cybersec-team/devsecops-engineer` | **PHANTOM** - No agent file exists | roles.security_analyst.permissions.agents |
| security_analyst | `cybersec-team/red-team-operator` | **PHANTOM** - No agent file exists | roles.security_analyst.permissions.agents |
| security_analyst | `cybersec-team/grc-specialist` | **PHANTOM** - No agent file exists | roles.security_analyst.permissions.agents |
| security_analyst | `core/abdul` | `src/core/agents/abdul` | roles.security_analyst.permissions.agents |
| security_analyst | `core/bmad-master` | `src/core/agents/bmad-master` | roles.security_analyst.permissions.agents |
| product_manager | `bmm/pm` | `src/bmm/agents/pm` | roles.product_manager.permissions.agents |
| product_manager | `bmm/analyst` | `src/bmm/agents/analyst` | roles.product_manager.permissions.agents |
| product_manager | `bmm/ux-designer` | `src/bmm/agents/ux-designer` | roles.product_manager.permissions.agents |
| product_manager | `bmm/architect` | `src/bmm/agents/architect` | roles.product_manager.permissions.agents |
| viewer | `core/abdul` | `src/core/agents/abdul` | roles.viewer.permissions.agents |
| viewer | `core/bmad-master` | `src/core/agents/bmad-master` | roles.viewer.permissions.agents |
| guest | `core/abdul` | `src/core/agents/abdul` | roles.guest.permissions.agents |

### 3.3 Agent-Level Restriction Keys

These keys in the `agent_restrictions` section use legacy `module/agent` format:

| Current Key | New Key |
|-------------|---------|
| `intel-team/field-operative` | `src/intel-team/agents/field-operative` |
| `intel-team/humint-specialist` | `src/intel-team/agents/humint-specialist` |
| `intel-team/dark-web-analyst` | `src/intel-team/agents/dark-web-analyst` |
| `cybersec-team/red-team-operator` | `src/cybersec-team/agents/red-team-operator` |
| `cybersec-team/social-engineer` | `src/cybersec-team/agents/social-engineer` |

### 3.4 Phantom Agent References (CRITICAL)

The following agent IDs appear in `rbac-config.yaml` but have **no corresponding agent file** on disk. These must be resolved before or during migration:

| Phantom ID | Referenced In | Resolution |
|------------|---------------|------------|
| `cybersec-team/appsec-engineer` | security_analyst role | Remove or create agent |
| `cybersec-team/devsecops-engineer` | security_analyst role | Remove or create agent |
| `cybersec-team/red-team-operator` | security_analyst role, agent_restrictions | Remove or create agent |
| `cybersec-team/grc-specialist` | security_analyst role | Remove or create agent |

> **SECURITY NOTE:** Phantom RBAC entries are not directly exploitable (they grant access to nonexistent agents), but they indicate configuration drift and should be cleaned up during migration.

---

## 4. Migration Lock Mechanism

During the migration window, both old and new ID formats must be validated to prevent bypass. The following configuration should be added to the BMAD config:

```yaml
# In src/core/security/config.yaml during migration:
security:
  agent_id_migration:
    active: true          # When true, RBAC checker validates BOTH old and new ID formats
    completed: false      # Set to true only after ALL IDs are migrated and verified
    started_at: null      # Timestamp when migration began
    completed_at: null    # Timestamp when migration completed

    # During active migration, the RBAC resolver must:
    # 1. Accept BOTH legacy (module/agent) and v6 (_bmad/module/agents/agent) formats
    # 2. Normalize all IDs to a canonical format before permission checks
    # 3. Log warnings for any legacy ID usage (indicates incomplete migration)
    # 4. Block any agent requests that don't match EITHER format

    # ID normalization rules:
    normalization:
      legacy_to_v6: true       # Convert module/agent -> _bmad/module/agents/agent
      v6_to_legacy: true       # Convert _bmad/module/agents/agent -> module/agent
      reject_unknown: true     # Reject IDs that don't match any known format
```

### Migration Lock Lifecycle

```
1. PRE-MIGRATION
   agent_id_migration.active = false
   agent_id_migration.completed = false
   -> All agent IDs use legacy format
   -> RBAC checks legacy format only

2. MIGRATION ACTIVE (single atomic commit)
   agent_id_migration.active = true
   agent_id_migration.completed = false
   agent_id_migration.started_at = <timestamp>
   -> Update ALL agent file paths
   -> Update ALL RBAC rules
   -> Update ALL agent_restrictions keys
   -> RBAC checks BOTH formats (dual-path validation)

3. VERIFICATION PHASE
   agent_id_migration.active = true
   agent_id_migration.completed = false
   -> Run full verification suite (rbac-migration-matrix.test.js)
   -> Verify every agent accessible via RBAC
   -> Check no legacy ID references remain in code

4. MIGRATION COMPLETE
   agent_id_migration.active = false
   agent_id_migration.completed = true
   agent_id_migration.completed_at = <timestamp>
   -> All agent IDs use v6 format
   -> RBAC checks v6 format only
   -> Legacy format is REJECTED (not silently ignored)
```

---

## 5. Atomic Commit Strategy

**CRITICAL:** ALL ID changes and ALL RBAC rule changes MUST be applied in a single atomic commit to prevent a dual-path exploitation window.

### What Must Be In the Single Commit

1. **All agent file relocations** (if paths change on disk)
2. **rbac-config.yaml** - All pattern updates (Section 3.1-3.3)
3. **agent_restrictions** keys updated to v6 format
4. **Migration lock activation** in config.yaml
5. **Any code that resolves agent IDs** (slash-command-router.js, help-generator.js, etc.)
6. **agent-manifest.csv** path column updates
7. **task-manifest.csv** path column updates (if agent references exist)
8. **settings.json** hook commands that reference agent paths

### What Must NOT Be Split Across Commits

- Never update RBAC rules in one commit and agent paths in another
- Never update wildcard patterns without updating explicit references
- Never update agent_restrictions keys without updating role permissions
- Never activate migration lock without having all changes in place

### Commit Verification Checklist

```
[ ] All 80 agents have v6 IDs in rbac-config.yaml
[ ] All wildcard patterns updated (17 patterns across 7 roles)
[ ] All explicit references updated (19 references across 4 roles)
[ ] All agent_restrictions keys updated (5 keys)
[ ] Migration lock activated in config.yaml
[ ] Phantom entries resolved (4 entries)
[ ] agent-manifest.csv paths verified
[ ] All tests pass (rbac-migration-matrix.test.js)
[ ] No legacy format IDs remain in any config file
```

---

## 6. Verification Criteria Per Agent

Every agent must satisfy ALL of the following after migration:

### 6.1 Accessibility Check

For each of the 80 agents:

1. **File exists** at the v6 path (`_bmad/module/agents/agent-name.md`)
2. **RBAC grants access** via the appropriate role (wildcard or explicit)
3. **Module restriction** allows the required role
4. **Agent restriction** (if any) allows the required role
5. **No legacy ID** remains in any RBAC rule, restriction, or config file
6. **Slash command router** resolves the agent correctly with v6 ID
7. **Help system** displays the agent correctly with v6 ID

### 6.2 Regression Check

For each RBAC role:

1. All agents accessible before migration remain accessible after
2. No agents become accessible that were previously restricted
3. Wildcard patterns match the same agent set (adjusted for path format)
4. Inheritance chains produce the same effective permissions
5. Agent-level restrictions still apply to the correct agents

### 6.3 Automated Verification

Run the following test suites after migration:

```bash
# Migration matrix completeness
npx vitest run tests/security/rbac-migration-matrix.test.js

# RBAC authorization (existing tests)
npx vitest run tests/security/

# Slash command routing (existing tests)
npx vitest run tests/core/routing/

# Help system (existing tests)
npx vitest run tests/core/help/
```

---

## 7. Module Reference for RBAC Pattern Updates

For quick reference, here are the module-level RBAC wildcard patterns and which roles use them:

| Module | Wildcard Pattern | Used By Roles |
|--------|-----------------|---------------|
| core | `core/*` | security_lead, intel_analyst, legal_counsel, developer, product_manager, strategist, viewer (explicit), guest (explicit) |
| bmb | `bmb/*` | developer |
| bmgd | `bmgd/*` | developer |
| bmm | `bmm/*` | developer, product_manager (explicit agents only) |
| cis | `cis/*` | developer, product_manager |
| cybersec-team | `cybersec-team/*` | security_lead, security_analyst (explicit agents only) |
| intel-team | `intel-team/*` | security_lead, intel_analyst |
| legal-team | `legal-team/*` | legal_counsel |
| strategy-team | `strategy-team/*` | strategist |

---

## Appendix A: Storyteller Nested Path

The storyteller agent has a non-standard nested directory structure:

- **Standard agents**: `_bmad/module/agents/agent-name.md`
- **Storyteller**: `src/cis/agents/storyteller/storyteller.md`

During migration, the RBAC resolver must handle this case. Options:

1. **Flatten** the storyteller to `src/cis/agents/storyteller.md` (breaking change)
2. **Support nested paths** in the RBAC resolver (recommended)
3. **Use the directory name** as the agent ID (current behavior based on CSV manifest)

The agent-manifest.csv currently lists the path as `src/cis/agents/storyteller/storyteller.md`, so the resolver should strip the filename and use the parent directory name for ID matching when a nested structure is detected.

---

## Appendix B: Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-02-09 | BMAD Security Team | Initial matrix creation - 79 agents, 9 modules |
| 1.1.0 | 2026-02-10 | BMAD Security Team | Added QA agent (bmm/qa) - 80 agents, 9 modules |
