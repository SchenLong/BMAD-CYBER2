# Pre-Development Baseline - Stage 0

**Captured**: 2026-02-09
**Branch**: ROAD2V6
**Backup Tag**: `pre-v6-stage0-backup`

## Environment

- Node.js: v25.2.1 (already past target v20)
- npm: 11.6.2
- OS: Darwin 25.2.0 (macOS)

## Test Results

- **Test Files**: 21 passed | 2 failed (24 total)
- **Tests**: 1298 passed | 1 failed (1337 total)
- **Duration**: 34.22s

### Pre-existing Failures

1. `tools/npx/__tests__/package-merger.test.js` - "should not be fooled by encoded path traversal"
   - Test expects encoded path traversal to be allowed (returns merged result), but security hardening now throws
   - This is a **pre-existing test bug**, not caused by v6 upgrade work
2. Worker exited unexpectedly error (process.exit in test worker)

## npm Audit

- 6 moderate severity vulnerabilities (all in vitest dependency chain)
- Not actionable without vitest version upgrade

## Pre-Upgrade Package.json Engine Values

| File | engines.node | engines.npm |
|------|-------------|-------------|
| `package.json` (root) | `>=18.0.0` | `>=9.0.0` |
| `.claude/validators-node/package.json` | `>=18.0.0` | — |
| `_bmad/framework/package.json` | `>=18.0.0` | — |
| `src/package-management/versioning/package.json` | `>=14.0.0` | `>=6.0.0` |
| `src/utility/tools/installer/package.json` | `>=18.0.0` | — |
| `tools/npx/package.json` | `>=18.0.0` | — |
| `tools/npx/__tests__/fixtures/bmad-package.json` | `>=18.0.0` | — |
| `tools/npx/__tests__/fixtures/sample-package.json` | `>=16.0.0` | — |

## Notes

- Plan referenced 232 tests; actual count is 1337 (repo grew significantly)
- Node already at v25 - Story 2 (Node 20 upgrade) may need scope adjustment
