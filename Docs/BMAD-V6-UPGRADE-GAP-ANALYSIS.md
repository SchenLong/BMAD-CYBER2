# BMAD-CYBERSEC v6 Upgrade Gap Analysis

> **SUPERSEDED (2026-02-08)**: This document's content has been merged into the two primary working documents:
> - **Appendix C** of `Docs/05-project-management/HYBRID-V6-UPGRADE-PLAN.md` (v2.2.0) — Per-gap alignment decisions and inventory table
> - **Section 12** of `Docs/05-project-management/V6-UPGRADE-CONSOLIDATED-REVIEW.md` (v2.1.0) — Gap-to-recommendation cross-references and risk impact assessment
>
> This file is retained for reference only. The detailed per-gap comparison tables below are not reproduced in the merged documents. For authoritative gap status, consult the merged locations above.

**Document Version**: 2.0.0 (SUPERSEDED)
**Analysis Date**: 2026-02-08
**Updated**: 2026-02-08 (Beta.7 alignment review)
**Prepared By**: Claude Code Analysis
**Current Version**: BMAD-CYBERSEC 2.0.0 (based on BMAD v4 architecture)
**Target Version**: BMAD v6.0.0-Beta.7 (Hybrid Cherry-Pick Strategy)

---

## Executive Summary

BMAD-CYBERSEC is currently built on BMAD v4 architecture, while the upstream BMAD-METHOD has evolved to v6.0.0-Beta.7 (Feb 4, 2026, 326+ merged PRs). This analysis identifies **47 gaps** across 8 categories, with **12 critical**, **18 high**, and **17 medium** priority items.

> **v2.0.0 UPDATE**: Following the hybrid v6 upgrade strategy (see `HYBRID-V6-UPGRADE-PLAN.md` v2.2.0), many gaps have been re-assessed. The project is **not** doing a full v6 migration. Instead, high-value v6 features are being cherry-picked while preserving BMAD-CYBERSEC's security infrastructure. Each gap below now includes its **Alignment Decision** from the completed decision matrix.

### Key Findings

| Category | Critical | High | Medium | Total | In Scope | Deferred |
|----------|----------|------|--------|-------|----------|----------|
| Architecture | 3 | 4 | 2 | 9 | 4 | 5 |
| CLI & Tooling | 2 | 3 | 3 | 8 | 3 | 5 |
| Module System | 2 | 4 | 3 | 9 | 0 | 9 |
| Workflow System | 1 | 2 | 2 | 5 | 2 | 3 |
| Dependencies | 2 | 2 | 2 | 6 | 2 | 4 |
| Documentation | 0 | 1 | 3 | 4 | 1 | 3 |
| Testing | 1 | 1 | 1 | 3 | 2 | 1 |
| Security | 1 | 1 | 1 | 3 | 1 | 2 |
| **Total** | **12** | **18** | **17** | **47** | **15** | **32** |

### Overall Risk Assessment: **MODERATE** (revised from HIGH)

The hybrid cherry-pick strategy significantly reduces risk compared to a full migration. Only 15 of 47 gaps are in scope for the current upgrade cycle (Stories 0-3, ~52.5h effort). The remaining 32 gaps are explicitly deferred or out of scope.

### Upgrade Strategy Quick Reference

| Decision | Count | Description |
|----------|-------|-------------|
| ADOPT | 8 | Take v6 implementation directly |
| ADOPT+EXTEND | 1 | Take v6 impl + add security extensions |
| ADAPT | 4 | Use v6 concept, different implementation |
| DIVERGE | 2 | Incompatible with security requirements |
| OUT OF SCOPE | 3 | Deferred to future upgrade cycle |
| N/A | 1 | Not applicable to BMAD-CYBERSEC |

---

## 1. Architecture Gaps

### 1.1 Prompt Library Migration (CRITICAL) — OUT OF SCOPE

> **Alignment Decision**: OUT OF SCOPE. v6 migrated from Inquirer to @clack/prompts (Beta.1). Would affect ~45 files—too risky for the hybrid upgrade cycle. Deferred to future full migration.

| Aspect | BMAD-CYBERSEC (v4) | BMAD v6 |
|--------|-------------------|---------|
| Library | `inquirer@13.2.1` | `@clack/prompts@1.0.0` |
| Purpose | Interactive CLI prompts | Cross-platform CLI prompts |
| Issue | Inquirer deprecated in v6 | Complete migration required |

**Impact**: All interactive prompts will break without migration.

**Migration Actions**:
```javascript
// Current (Inquirer)
import inquirer from 'inquirer';
const { answer } = await inquirer.prompt([{ type: 'input', name: 'answer' }]);

// v6 (@clack/prompts)
import { text } from '@clack/prompts';
const answer = await text({ message: 'Enter value:' });
```

**Files Affected**: ~45 files using Inquirer prompts
- `src/utility/tools/module-selector/index.js`
- `src/utility/tools/security-config/index.js`
- All interactive workflow scripts

---

### 1.2 Node.js Version Requirement (CRITICAL) — ADOPT (Story 2)

> **Alignment Decision**: ADOPT. v6 requires `>=20.0.0` since alpha.0. Direct adoption. Crypto backward compatibility is our unique concern (not in v6). Addressed in Story 2, Tasks 2.1-2.4.

| Aspect | BMAD-CYBERSEC | BMAD v6 |
|--------|---------------|---------|
| Minimum | Node.js 18.0.0 | Node.js 20.0.0 |
| Engine | `"node": ">=18.0.0"` | `"node": ">=20.0.0"` |

**Impact**: Deployment environments must be updated.

**Migration Actions**:
1. Update `package.json` engines field
2. Update `.nvmrc` to `20`
3. Update CI/CD pipeline Node versions
4. Update Docker base images
5. Test all native modules with Node 20

---

### 1.3 Module Externalization (CRITICAL) — OUT OF SCOPE

> **Alignment Decision**: OUT OF SCOPE. v6 publishes modules as separate npm packages (@bmad/builder, etc.). Declared out of scope for the hybrid upgrade. Our monolithic structure with `_bmad/` directories is preserved. SDET replacement of TEA is also out of scope.

| Module | BMAD-CYBERSEC | BMAD v6 |
|--------|---------------|---------|
| BMB (Builder) | Embedded in `_bmad/bmb/` | Separate npm: `@bmad/builder` |
| CIS (Creative) | Embedded in `_bmad/cis/` | Separate npm package |
| BMGD (Game Dev) | Embedded in `_bmad/bmgd/` | Separate npm package |
| TEA (Test Arch) | Embedded in `_bmad/bmm/` | Replaced by SDET |

**Impact**: Current monolithic structure incompatible with v6 module loading.

**Migration Actions** (DEFERRED):
1. Refactor embedded modules to external packages
2. Create npm package structure for each team module
3. Update import paths throughout codebase
4. Implement dynamic module loading

---

### 1.4 CLI Entry Point Restructure (HIGH) — DEFERRED

| Aspect | BMAD-CYBERSEC | BMAD v6 |
|--------|---------------|---------|
| Entry | Custom NPX scripts | `tools/cli/bmad-cli.js` |
| Commands | `npx bmad-cybersec` | `npx bmad` or `npx bmad-method` |
| Installer | Custom installer | Unified installer architecture |

**Migration Actions**:
1. Restructure CLI to match v6 `tools/cli/` pattern
2. Implement dual command support (`bmad` + `bmad-cybersec`)
3. Migrate to unified installer architecture

---

### 1.5 Workflow File Structure (HIGH) — ADAPT (Story 1)

> **Alignment Decision**: ADAPT. v6 uses `workflow-*.md` file splitting + installer manifest generation. Our approach uses an alias registry with RBAC + audit + input validation. We adopt the concept of short slash commands but diverge on implementation due to security requirements. Addressed in Story 1, Tasks 1.1-1.5.

| Aspect | BMAD-CYBERSEC | BMAD v6 |
|--------|---------------|---------|
| Format | Single workflow files | Split `workflow-*.md` files |
| Invocation | Module-based | Direct slash command |
| Example | `/bmad:cybersec-team:workflows:threat-modeling` | `/threat-modeling` |

**Impact**: All 135 workflows need restructuring.

**Migration Actions** (ADAPTED):
1. ~~Split monolithic workflow files into individual `workflow-*.md` files~~ → Build alias registry mapping short names to existing module paths
2. Implement direct slash command invocation with RBAC checks
3. Update skill manifests for new invocation pattern
4. Add reserved names blocklist preventing collision with security validators

---

### 1.6 Help System Overhaul (HIGH) — ADAPT (Story 3)

> **Alignment Decision**: ADAPT. v6 uses `help.md` task + `module-help.csv` + `bmad-help.csv` catalogs (8-step execution flow). PR #1535 added project docs reading to prevent fabrication. We adopt the CSV-based catalog approach and project docs reading, add manifest sanitization (VULN-013) and security context awareness. Addressed in Story 3, Tasks 3.1-3.4.

| Aspect | BMAD-CYBERSEC | BMAD v6 |
|--------|---------------|---------|
| System | Static docs | AI-powered `/bmad-help` |
| Behavior | Fixed content | Adapts to installed modules |
| Implementation | Manual | CSV catalog + help.md task engine |

**Migration Actions** (ADAPTED):
1. Implement `/bmad-help` command using CSV-based catalog approach (from v6)
2. Create module-aware help content generation with manifest sanitization
3. Integrate project docs reading (PR #1535) to prevent fabrication
4. Add security context for RBAC-aware help responses

---

### 1.7 Source Directory Structure (HIGH) — DEFERRED

> **Alignment Decision**: DEFERRED. Our `src/` + `_bmad/` hybrid structure is preserved in the hybrid upgrade. The cross-file reference validator (Task 0.2) will be extended to validate our `_bmad/` directory layout. Full directory restructuring deferred to future cycle.

| Aspect | BMAD-CYBERSEC | BMAD v6 |
|--------|---------------|---------|
| Structure | `src/` + `_bmad/` hybrid | `src/bmm/`, `src/core/`, `src/utility/` |
| Agents | `_bmad/{module}/agents/` | `src/{module}/agents/` |
| Workflows | `src/core/workflows/` | `src/{module}/workflows/` |

**Migration Actions** (DEFERRED):
1. Consolidate directory structure
2. Migrate from `_bmad/` to `src/` pattern
3. Update all path references

---

### 1.8 Configuration Schema (MEDIUM) — ADOPT+EXTEND (Story 0, Task 0.2)

> **Alignment Decision**: ADOPT+EXTEND. v6 has `validate-file-refs.js` with multi-format scanning (YAML, MD, XML, CSV via PR #1573). Adopt structure and multi-format scanning, extend for our `_bmad/` directory layout and security hook path validation. Addressed in Story 0, Task 0.2.

| Aspect | BMAD-CYBERSEC | BMAD v6 |
|--------|---------------|---------|
| Validation | Custom YAML schemas | JSON Schema + validators |
| Cross-file | Manual checks | `validate-file-refs.js` automated scanner |
| Stats | Unknown | ~483 references across 217 files |

**Migration Actions** (IN SCOPE):
1. Adopt v6 cross-file reference validator structure
2. Extend with `_bmad/` directory path validation and security hook path checking
3. Add CSV workflow-file column scanning (PR #1573)
4. Add automated reference checking to CI

---

### 1.9 Documentation Platform (MEDIUM) — DEFERRED

> **Alignment Decision**: DEFERRED. Astro/Starlight website and Diataxis migration are not part of the hybrid upgrade. Current `Docs/` numbered directory structure preserved.

| Aspect | BMAD-CYBERSEC | BMAD v6 |
|--------|---------------|---------|
| Format | Markdown in `Docs/` | Astro/Starlight website |
| Structure | Numbered directories | Diataxis framework |
| Hosting | Repository only | docs.bmad-method.org equivalent |

**Migration Actions** (DEFERRED):
1. Migrate to Astro/Starlight (optional)
2. Implement Diataxis documentation structure
3. Create documentation website

---

## 2. CLI & Tooling Gaps

### 2.1 Script System Redesign (CRITICAL) — DEFERRED

| Scripts | BMAD-CYBERSEC | BMAD v6 |
|---------|---------------|---------|
| Count | 20+ npm scripts | Consolidated script set |
| Pattern | Build-focused | Tool-centric architecture |
| Tools | `scripts/` directory | `tools/` directory |

**Current Scripts to Migrate**:
```json
{
  "build": "npm run build:framework && npm run build:validators",
  "test": "vitest run",
  "modules": "node src/utility/tools/module-selector/index.js"
}
```

**v6 Pattern**:
```json
{
  "test": "comprehensive validation suite",
  "validate:schemas": "JSON Schema validation",
  "validate:refs": "Cross-file reference validation"
}
```

---

### 2.2 Build System Changes (CRITICAL) — DEFERRED

| Aspect | BMAD-CYBERSEC | BMAD v6 |
|--------|---------------|---------|
| Framework | TypeScript + Vitest | Minimal build, docs focus |
| Output | `dist/` compilation | Runtime execution |
| Bundler | Custom | `tools/build-docs.mjs` |

**Impact**: Build pipeline requires restructuring.

---

### 2.3 Linting Configuration (HIGH) — DEFERRED

| Aspect | BMAD-CYBERSEC | BMAD v6 |
|--------|---------------|---------|
| Config | `.eslintrc.cjs` (legacy) | `eslint.config.mjs` (flat config) |
| Rules | Custom ruleset | Standardized ruleset |

**Migration Actions**:
1. Migrate to ESLint flat config format
2. Update Prettier integration

---

### 2.4 Markdown Linting (HIGH) — DEFERRED

| Aspect | BMAD-CYBERSEC | BMAD v6 |
|--------|---------------|---------|
| Tool | Not implemented | `.markdownlint-cli2.yaml` |
| Scope | None | All markdown files |

**Migration Actions**:
1. Add markdownlint-cli2 configuration
2. Add markdown linting to CI pipeline

---

### 2.5 Git Hooks (HIGH) — DEFERRED

| Aspect | BMAD-CYBERSEC | BMAD v6 |
|--------|---------------|---------|
| Tool | `.githooks/` custom | `.husky/` standard |
| Integration | Manual setup | npm lifecycle hooks |

**Migration Actions**:
1. Migrate from custom `.githooks/` to Husky
2. Update hook scripts

---

### 2.6 Version Management (MEDIUM) — ADOPT (Story 0, Task 0.6)

> **Alignment Decision**: ADOPT. v6 has CLI version checking with npm registry lookup (Beta.7, commit d37ee7f2). Adopt directly, change registry URL from `bmad-method` to `bmad-cybersec`. Addressed in Story 0, Task 0.6.

| Aspect | BMAD-CYBERSEC | BMAD v6 |
|--------|---------------|---------|
| Checking | Manual | Automatic update notifications |
| Semver | Full semver | Beta versioning support |

---

### 2.7 Workspace Configuration (MEDIUM) — DEFERRED

| Aspect | BMAD-CYBERSEC | BMAD v6 |
|--------|---------------|---------|
| Type | npm workspaces | Monorepo with externals |
| Packages | 2 internal workspaces | Module registry pattern |

---

### 2.8 Code Review Tool (MEDIUM) — DEFERRED

| Aspect | BMAD-CYBERSEC | BMAD v6 |
|--------|---------------|---------|
| Integration | Not present | `.coderabbit.yaml` |
| Automation | Manual review | AI-assisted review |

---

## 3. Module System Gaps

### 3.1 Module Registry Pattern (CRITICAL) — OUT OF SCOPE

| Aspect | BMAD-CYBERSEC | BMAD v6 |
|--------|---------------|---------|
| Pattern | Local `_bmad/` directory | npm-based external packages |
| Discovery | Manifest files | npm registry + local |
| Installation | Git clone | `npx bmad-method install` |

**Current Structure**:
```
_bmad/
├── cybersec-team/manifest.yaml
├── intel-team/manifest.yaml
├── legal-team/manifest.yaml
└── strategy-team/manifest.yaml
```

**v6 Pattern**:
```
npm install @bmad/cybersec-team
npm install @bmad/intel-team
```

**Migration Actions**:
1. Publish team modules as npm packages
2. Implement module discovery from npm registry
3. Support hybrid local + npm module sources

---

### 3.2 TEA to SDET Replacement (CRITICAL) — OUT OF SCOPE

| Aspect | BMAD-CYBERSEC | BMAD v6 |
|--------|---------------|---------|
| Module | TEA (Test Architect) | SDET (Software Dev Engineer in Test) |
| Workflows | Embedded in BMM | 8 standalone workflows |
| Scope | Integrated testing | Streamlined test automation |

**Impact**: All TEA references and workflows need updating.

---

### 3.3 Module Manifest Schema (HIGH) — DEFERRED

| Aspect | BMAD-CYBERSEC | BMAD v6 |
|--------|---------------|---------|
| Format | Custom YAML schema | Standardized JSON Schema |
| Permissions | Filesystem/network/shell | Unified permission model |
| Validation | Runtime only | Build-time validation |

**Current Manifest**:
```yaml
name: cybersec-team
version: 1.0.0
permissions:
  filesystem:
    read: ["_bmad/cybersec-team/**"]
```

---

### 3.4 Agent ID Standardization (HIGH) — DEFERRED

| Aspect | BMAD-CYBERSEC | BMAD v6 |
|--------|---------------|---------|
| Format | Module-specific naming | Cross-platform standardized IDs |
| Prefix | Varies | `bmad-os-` prefix for internal |

**Migration Actions**:
1. Audit all 79 agent IDs
2. Implement standardized naming convention
3. Create agent ID migration script

---

### 3.5 Skill Loading Pattern (HIGH) — ADAPT (Story 1)

| Aspect | BMAD-CYBERSEC | BMAD v6 |
|--------|---------------|---------|
| Pattern | Long qualified names | Short direct invocation |
| Example | `bmad:cybersec-team:workflows:threat-modeling` | `/threat-modeling` |

---

### 3.6 Module Installation Flow (HIGH) — DEFERRED

| Aspect | BMAD-CYBERSEC | BMAD v6 |
|--------|---------------|---------|
| Flow | Custom npx scripts | Unified installer with prompts |
| Modes | Interactive only | Interactive + non-interactive |
| CI Support | Limited | Full `--yes` flag support |

---

### 3.7 Module Dependencies (MEDIUM) — DEFERRED

| Aspect | BMAD-CYBERSEC | BMAD v6 |
|--------|---------------|---------|
| Declaration | Implicit | Explicit in manifest |
| Conflict Detection | Manual | Automated |

---

### 3.8 Flattener Tool (MEDIUM) — N/A

| Aspect | BMAD-CYBERSEC | BMAD v6 |
|--------|---------------|---------|
| Tool | May still exist | Removed (3,798 lines deleted) |
| Purpose | Context flattening | Deprecated approach |

---

### 3.9 Excalidraw Integration (MEDIUM) — N/A

| Aspect | BMAD-CYBERSEC | BMAD v6 |
|--------|---------------|---------|
| Workflows | Present | Deprecated and removed |
| Diagrams | Custom workflows | External tooling |

---

## 4. Workflow System Gaps

### 4.1 Workflow Invocation Pattern (CRITICAL) — ADAPT (Story 1)

> **Alignment Decision**: ADAPT. v6 generates slash commands dynamically from `workflow-*.md` files during install. Our security model requires a pre-defined alias registry with RBAC + audit + reserved names blocklist. We achieve the same UX (short slash commands) via different mechanism. Addressed in Story 1.

| Aspect | BMAD-CYBERSEC | BMAD v6 |
|--------|---------------|---------|
| Pattern | Skill tool with full path | Direct slash command |
| Example | `/bmad:cybersec-team:workflows:incident-response` | `/incident-response` |

**Migration Actions** (ADAPTED):
1. Implement alias registry mapping short names to full module paths
2. Add RBAC checks before workflow dispatch
3. Register workflows for slash command access with collision prevention

---

### 4.2 Workflow File Splitting (HIGH) — DEFERRED

| Aspect | BMAD-CYBERSEC | BMAD v6 |
|--------|---------------|---------|
| Structure | Single large files | Individual `workflow-*.md` files |
| Invocation | Module path | Direct file reference |

**Current**: 135 workflows in monolithic structure
**Required**: Split into individual invocable files

---

### 4.3 Quick Flow vs Full Planning (HIGH) — DEFERRED

| Aspect | BMAD-CYBERSEC | BMAD v6 |
|--------|---------------|---------|
| Modes | Single mode | Quick Flow + Full Planning |
| Quick Flow | N/A | `/quick-spec`, `/dev-story`, `/code-review` |
| Full Planning | All workflows | `/product-brief`, `/create-prd`, etc. |

**Migration Actions**:
1. Categorize workflows into Quick Flow vs Full Planning
2. Implement appropriate invocation patterns

---

### 4.4 Scale-Adaptive Planning (MEDIUM) — DEFERRED

| Aspect | BMAD-CYBERSEC | BMAD v6 |
|--------|---------------|---------|
| Behavior | Fixed depth | Auto-adjusts to project complexity |
| Configuration | Manual | Automatic detection |

---

### 4.5 Workflow-Init Replacement (MEDIUM) — PARTIAL (Story 3)

| Aspect | BMAD-CYBERSEC | BMAD v6 |
|--------|---------------|---------|
| Tool | May have workflow-init | Replaced by `/bmad-help` |
| Guidance | Static | AI-powered adaptive |

---

## 5. Dependency Gaps

### 5.1 Core Dependencies Update (CRITICAL) — PARTIAL

| Dependency | BMAD-CYBERSEC | BMAD v6 | Action |
|------------|---------------|---------|--------|
| `inquirer` | 13.2.1 | REMOVED | Replace with @clack/prompts |
| `@clack/prompts` | Not present | 1.0.0 | Add |
| `chalk` | 5.6.2 | Present | Keep |
| `commander` | 11.0.0 | Present | Keep |
| `semver` | Not present | Present | Add |
| `glob` | Not present | Present | Add |

---

### 5.2 Framework Package Changes (CRITICAL) — DEFERRED

| Package | BMAD-CYBERSEC | BMAD v6 | Notes |
|---------|---------------|---------|-------|
| `@bmad/framework` | Internal workspace | N/A | Custom to CYBERSEC |
| `@bmad/validators` | Internal workspace | N/A | Custom to CYBERSEC |
| `zod` | 3.22.0 | Not present | Keep for CYBERSEC |

---

### 5.3 Dev Dependencies Update (HIGH) — DEFERRED

| Dependency | BMAD-CYBERSEC | BMAD v6 | Action |
|------------|---------------|---------|--------|
| `vitest` | 1.1.0 | Not present | Keep for CYBERSEC |
| `eslint` | 8.56.0 | Present | Update config format |
| `typedoc` | 0.25.0 | Not present | Keep for CYBERSEC |

---

### 5.4 Parser Dependencies (HIGH) — IN SCOPE (Story 0/3)

| Dependency | BMAD-CYBERSEC | BMAD v6 | Action |
|------------|---------------|---------|--------|
| `csv-parse` | Not present | Present | Add |
| `xml2js` | Not present | Present | Add |
| `yaml` | Via framework | Present | Verify compatibility |

---

### 5.5 bundledDependencies Pattern (MEDIUM) — DEFERRED

| Aspect | BMAD-CYBERSEC | BMAD v6 |
|--------|---------------|---------|
| Pattern | `bundledDependencies` array | Not used |
| Packages | chalk, commander, inquirer, zod | N/A |

---

### 5.6 Peer Dependencies (MEDIUM) — DEFERRED

| Aspect | BMAD-CYBERSEC | BMAD v6 |
|--------|---------------|---------|
| TypeScript | `^5.0.0` peer | Dev only |

---

## 6. Documentation Gaps

### 6.1 Diataxis Framework (HIGH) — DEFERRED

| Aspect | BMAD-CYBERSEC | BMAD v6 |
|--------|---------------|---------|
| Structure | Numbered directories | Diataxis (tutorials/guides/reference/explanation) |
| Compliance | Partial | Full implementation |

**Current Structure**:
```
Docs/
├── 01-getting-started/
├── 02-user-guides/
├── 03-developer-docs/
├── 04-operations/
└── 05-project-management/
```

**v6 Diataxis Structure**:
```
docs/
├── tutorials/     (learning-oriented)
├── how-to/        (problem-oriented)
├── reference/     (information-oriented)
└── explanation/   (understanding-oriented)
```

---

### 6.2 Website Infrastructure (MEDIUM) — DEFERRED

| Aspect | BMAD-CYBERSEC | BMAD v6 |
|--------|---------------|---------|
| Platform | Markdown only | Astro/Starlight |
| Build | None | `docs:dev`, `docs:build` |
| Hosting | Repository | Static site |

---

### 6.3 API Documentation (MEDIUM) — DEFERRED

| Aspect | BMAD-CYBERSEC | BMAD v6 |
|--------|---------------|---------|
| Tool | TypeDoc | Not specified |
| Output | `docs:generate` script | Integrated in website |

---

### 6.4 Changelog Format (MEDIUM) — IN SCOPE

| Aspect | BMAD-CYBERSEC | BMAD v6 |
|--------|---------------|---------|
| Format | Keep a Changelog | Keep a Changelog |
| Automation | Manual | CI-generated |

---

## 7. Testing Gaps

### 7.1 Test Schema Validation (CRITICAL) — DEFERRED

| Aspect | BMAD-CYBERSEC | BMAD v6 |
|--------|---------------|---------|
| Script | Not present | `test:schemas` |
| Scope | Vitest only | Schema + Reference + Install |

**v6 Test Suite**:
```bash
npm test  # Runs all validations
# - validate:schemas
# - validate:refs
# - test:install
# - lint
# - format:check
```

---

### 7.2 Installation Testing (HIGH) — IN SCOPE (Story 0)

| Aspect | BMAD-CYBERSEC | BMAD v6 |
|--------|---------------|---------|
| Script | Not present | `test:install` |
| Coverage | Manual | Automated installation validation |

---

### 7.3 Reference Validation (MEDIUM) — ADOPT+EXTEND (Story 0, Task 0.2)

> **Alignment Decision**: ADOPT+EXTEND. v6's `validate-file-refs.js` adopted as the foundation, extended with `_bmad/` directory support and security hook path validation.

| Aspect | BMAD-CYBERSEC | BMAD v6 |
|--------|---------------|---------|
| Script | Not present | `validate:refs` via `validate-file-refs.js` |
| Scope | None | Cross-file reference checking (YAML, MD, XML, CSV) |
| Stats | Unknown | ~483 references across 217 files |

---

## 8. Security Gaps

### 8.1 Security Infrastructure Compatibility (CRITICAL) — DIVERGE (Preserve)

> **Alignment Decision**: DIVERGE. v6 uses `.claude/skills/` for generated commands (changelog-social, release-module, etc.). Our settings.json has 16 matchers, 54 hook commands for security infrastructure. Completely different architecture—must preserve our approach. This is an **enhancement**, not a gap.

| Aspect | BMAD-CYBERSEC | BMAD v6 |
|--------|---------------|---------|
| Framework | Custom `@bmad/validators` | Not present in v6 |
| Hooks | 139+ validators, 16 matchers, 54 commands | Minimal hooks |
| RBAC | Full implementation | Not in core v6 |
| Audit | TamperEvidentAuditLogger | Not present |

**Risk**: Low. Divergence is deliberate and protective.

**Recommendation**: Maintain security infrastructure during upgrade; do not regress. All new features (slash commands, help system) must integrate with existing security validators.

---

### 8.2 Hook System Compatibility (HIGH) — DIVERGE (Preserve)

| Aspect | BMAD-CYBERSEC | BMAD v6 |
|--------|---------------|---------|
| Format | `.claude/settings.json` hooks | `.claude/skills/` pattern |
| Validators | Comprehensive suite | Minimal |

---

### 8.3 Audit System (MEDIUM) — PRESERVE

| Aspect | BMAD-CYBERSEC | BMAD v6 |
|--------|---------------|---------|
| Logging | `@bmad/audit` module | Not present |
| Compliance | Full reporting | Not implemented |

**Recommendation**: This is a BMAD-CYBERSEC enhancement to preserve.

---

## 9. Upgrade Plan

> **SUPERSEDED**: The original 5-phase, 4-6 week full migration plan below has been replaced by the **Hybrid V6 Upgrade Strategy** documented in `HYBRID-V6-UPGRADE-PLAN.md` (v2.2.0). The hybrid plan cherry-picks high-value v6 features across 4 Stories (~52.5h effort) while preserving BMAD-CYBERSEC's security infrastructure.

### Active Plan: Hybrid Cherry-Pick (Stories 0-3)

| Story | Focus | Tasks | Effort | v6 Alignment |
|-------|-------|-------|--------|--------------|
| Story 0 | Bug Fixes & Foundations | 9 tasks (0.1-0.9) | ~15h | 7 ADOPT, 1 ADOPT+EXTEND |
| Story 1 | Slash Command Router | 5 tasks | ~14.5h | 2 ADAPT, 1 DIVERGE |
| Story 2 | Node.js 20 | 4 tasks | ~10h | 1 ADOPT |
| Story 3 | Help System | 4 tasks | ~13h | 2 ADAPT, 1 ADOPT |

**Execution Order**: 0 → 2 → 1 → 3

See `HYBRID-V6-UPGRADE-PLAN.md` for full task breakdown, dependencies, and rollback plans.

### Original Full Migration Plan (DEFERRED)

The following phases are preserved for reference but are **not active**:

<details>
<summary>Phase 1-5: Full Migration (Click to expand)</summary>

#### Phase 1: Foundation (Week 1-2)

| Task | Priority | Effort | Dependencies |
|------|----------|--------|--------------|
| Update Node.js to 20.0.0 | CRITICAL | 2 days | None |
| Migrate Inquirer to @clack/prompts | CRITICAL | 5 days | Node.js 20 |
| Update ESLint to flat config | HIGH | 1 day | None |
| Add markdownlint-cli2 | HIGH | 0.5 days | None |
| Migrate .githooks to Husky | HIGH | 1 day | None |

#### Phase 2: Module System (Week 2-3)

| Task | Priority | Effort | Dependencies |
|------|----------|--------|--------------|
| Standardize agent IDs | HIGH | 2 days | None |
| Implement module registry pattern | CRITICAL | 3 days | Phase 1 |
| Restructure src/ directory | HIGH | 2 days | Phase 1 |
| Publish team modules to npm | CRITICAL | 3 days | Module registry |
| Update TEA to SDET pattern | CRITICAL | 2 days | None |

#### Phase 3: Workflow System (Week 3-4)

| Task | Priority | Effort | Dependencies |
|------|----------|--------|--------------|
| Split workflow files | HIGH | 3 days | Phase 2 |
| Implement direct slash commands | CRITICAL | 2 days | Split workflows |
| Categorize Quick Flow vs Full | MEDIUM | 1 day | Slash commands |
| Implement /bmad-help | HIGH | 2 days | Module registry |
| Migrate 135 workflows | HIGH | 3 days | All above |

#### Phase 4: CLI & Build (Week 4-5)

| Task | Priority | Effort | Dependencies |
|------|----------|--------|--------------|
| Restructure CLI to tools/cli/ | HIGH | 2 days | Phase 3 |
| Implement unified installer | CRITICAL | 3 days | CLI restructure |
| Add test:schemas script | CRITICAL | 1 day | None |
| Add validate:refs script | MEDIUM | 2 days | None |
| Add test:install script | HIGH | 1 day | Installer |

#### Phase 5: Documentation & Polish (Week 5-6)

| Task | Priority | Effort | Dependencies |
|------|----------|--------|--------------|
| Migrate to Diataxis structure | HIGH | 2 days | None |
| Update all documentation | MEDIUM | 3 days | All phases |
| Create migration guide | HIGH | 1 day | All phases |
| Final testing and validation | CRITICAL | 3 days | All phases |
| Release v3.0.0 | CRITICAL | 1 day | All testing |

</details>

---

## 10. Risk Assessment (Updated for Hybrid Strategy)

> **Risk dramatically reduced** by hybrid cherry-pick approach. Out-of-scope items (Inquirer migration, module externalization, agent ID standardization) are no longer active risks.

### 10.1 Active Risks (Hybrid Upgrade)

| Risk | Probability | Impact | Mitigation | Story |
|------|-------------|--------|------------|-------|
| Slash command collision with security validators | 0.40 | **HIGH** | Reserved names blocklist; collision tests | 1 |
| Missing RBAC in slash command router | Certain (if not fixed) | **CRITICAL** | Integrate canExecuteWorkflow before every dispatch | 1 |
| Node 20 crypto API changes break audit encryption | 0.30 | **CRITICAL** | Test backward-compatible decryption; pin cipher algorithms | 2 |
| Settings.json corruption disables all hooks | 0.20 | **CRITICAL** | JSON schema validation; hook count assertion; backup | 1 |
| Prompt injection via help manifest content | 0.25 | **CRITICAL** | Sanitize all manifest content; strip instruction patterns | 3 |
| Security regression | LOW | **CRITICAL** | Maintain all 139+ validators, comprehensive audit tests | All |

### 10.2 Deferred Risks (No Longer Active)

| Risk | Original Assessment | Status |
|------|-------------------|--------|
| Inquirer migration breaks workflows | HIGH/SEVERE | OUT OF SCOPE - deferred |
| Module externalization breaks imports | MEDIUM/SEVERE | OUT OF SCOPE - deferred |
| Agent ID migration conflicts | MEDIUM/HIGH | DEFERRED - not in hybrid plan |
| Workflow splitting errors | MEDIUM/HIGH | DEFERRED - using alias registry instead |

### 10.3 Residual Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Node.js 20 compatibility issues | LOW | HIGH | Test all native modules early |
| ESM import resolution failure on Node 20 | 0.25 | HIGH | Test every bin/*.js import; ensure explicit .js extensions |
| Help system data source mismatch | Certain (if not fixed) | HIGH | Fix loader to aggregate from CSV manifests |
| Backward compatibility silent degradation | 0.35 | MEDIUM | Behavioral parity tests; audit log comparison |

---

## 11. Recommendations (Updated for Hybrid Strategy)

### 11.1 In Scope — Current Upgrade (Stories 0-3)

1. **Story 0: Bug fixes & foundations** — Path sanitizer, cross-file ref validator, YAML CRLF, variable naming, version checker, party-mode return, prompt verb standardization, npm flag updates
2. **Story 2: Upgrade Node.js to 20.0.0** — Foundation for all other changes, with crypto backward compat
3. **Story 1: Slash command router** — Alias registry with RBAC + audit + collision prevention
4. **Story 3: Help system** — CSV-based catalog, project docs reading, manifest sanitization
5. **Maintain security infrastructure** — Do not regress 139+ validators, RBAC, audit pipeline

### 11.2 Deferred — Future Upgrade Cycle

1. **Migrate from Inquirer to @clack/prompts** — ~45 files, too risky for current cycle
2. **Module externalization to npm** — Major architectural change
3. **Standardize agent IDs** — 79 agents, lower priority
4. **SDET replacement of TEA** — Our TEA usage differs significantly
5. **Migrate to Diataxis documentation** — Professional documentation structure
6. **ESLint flat config migration** — Low urgency
7. **Astro/Starlight documentation site** — Enhanced documentation experience

### 11.3 Won't Do (Explicitly Skip)

1. **Remove security infrastructure** — CYBERSEC's validators are an enhancement over v6
2. **Remove RBAC system** — Critical for security operations; v6 has no equivalent
3. **Remove audit logging** — Essential for compliance; v6 has no equivalent
4. **Adopt v6 settings.json structure** — Incompatible with our security hook architecture

---

## 12. Version Strategy (Updated for Hybrid Strategy)

### Proposed Versioning

| Version | Content | Story |
|---------|---------|-------|
| 2.1.0 | Bug fixes & foundations (Story 0) | Story 0 |
| 2.1.1 | Node.js 20 upgrade (Story 2) | Story 2 |
| 2.2.0 | Slash command router + help system (Stories 1+3) | Stories 1, 3 |

### Breaking Changes in 2.2.0

1. Node.js 20.0.0 minimum requirement (Story 2)
2. New slash command aliases alongside existing long paths (Story 1)
3. New `/bmad-help` command (Story 3)

### Non-Breaking: Full Backward Compatibility

- All existing `bmad:{module}:workflows:{name}` invocations continue to work
- Settings.json hook architecture preserved
- All 139+ security validators maintained
- Audit pipeline unchanged

---

## 13. Appendix: File Inventory

### Files Requiring Inquirer Migration (~45 files)

```
src/utility/tools/module-selector/index.js
src/utility/tools/security-config/index.js
src/utility/tools/llm-setup/index.js
src/utility/tools/pgp-setup/index.js
tools/npx/src/*.js
_bmad/framework/src/hooks/*.ts
.claude/hooks/*.js
```

### Workflow Files Requiring Splitting (135 workflows)

```
_bmad/cybersec-team/workflows/ (13 workflows)
_bmad/intel-team/workflows/ (18 workflows)
_bmad/legal-team/workflows/ (7 workflows)
_bmad/strategy-team/workflows/ (15 workflows)
_bmad/bmm/workflows/ (34 workflows)
_bmad/bmb/workflows/ (3 workflows)
_bmad/bmgd/workflows/ (30 workflows)
_bmad/cis/workflows/ (6 workflows)
src/core/workflows/ (9 workflows)
```

### Agent Files Requiring ID Standardization (79 agents)

```
_bmad/cybersec-team/agents/ (15 agents)
_bmad/intel-team/agents/ (11 agents)
_bmad/legal-team/agents/ (13 agents)
_bmad/strategy-team/agents/ (14 agents)
_bmad/bmm/agents/ (9 agents)
_bmad/bmb/agents/ (3 agents)
_bmad/bmgd/agents/ (8 agents)
_bmad/cis/agents/ (6 agents)
```

---

**Document Control**:
- Author: Claude Code Analysis
- Version: 2.0.0
- Created: 2026-02-08
- Updated: 2026-02-08
- Upstream Reference: BMAD-METHOD v6.0.0-Beta.7 (326+ merged PRs, 12 open PRs)
- Companion: `Docs/05-project-management/HYBRID-V6-UPGRADE-PLAN.md` (v2.2.0)
- QA Plan: `Docs/05-project-management/POSTV6-QA-MASTER.md` (v1.2.0)
- Review Required: Before implementation
- Approval Required: Project Lead

**Changelog**:
- v2.0.0 (2026-02-08): SUPERSEDED — Content merged into HYBRID-V6-UPGRADE-PLAN.md (Appendix C) and V6-UPGRADE-CONSOLIDATED-REVIEW.md (Section 12). Major update following BMAD-METHOD v6.0.0-Beta.7 upstream analysis. Added alignment decisions (ADOPT/ADAPT/DIVERGE/DEFERRED/OUT OF SCOPE) to all 47 gaps. Updated executive summary with hybrid strategy metrics (15 in-scope, 32 deferred). Revised risk assessment from HIGH to MODERATE. Superseded original 5-phase full migration plan with hybrid cherry-pick strategy (Stories 0-3, ~52.5h). Updated recommendations, version strategy, and breaking changes list. Added companion document references.
- v1.0.0 (2026-02-08): Initial gap analysis identifying 47 gaps across 8 categories.
