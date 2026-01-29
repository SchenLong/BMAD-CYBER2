# Path Audit Execution Plan

**Date:** 2026-01-26
**Scope:** Complete path reference audit after major repository restructure
**Priority:** High - Required before next release

---

## Executive Summary

After the massive update, a comprehensive path audit is required to ensure all file references, imports, links, and configurations point to correct locations. The exploration has identified **6 issues** (3 critical, 2 high, 1 low) that need remediation.

---

## Phase 1: Critical Configuration Fixes

**Priority:** CRITICAL - Blocks build/lint processes
**Files to modify:** 2

### 1.1 ESLint Configuration Path Fix

| Item | Details |
|------|---------|
| **File** | `.eslintrc.js` |
| **Line** | ~17 (in project array) |
| **Current** | `'./framework/tsconfig.json'` |
| **Correct** | `'./_bmad/framework/tsconfig.json'` |
| **Impact** | ESLint cannot find framework tsconfig |

### 1.2 TypeScript Configuration Fixes

| Item | Details |
|------|---------|
| **File** | `tsconfig.json` |
| **Issue 1** | Path alias `@bmad/framework` wrong |
| **Current** | `["./framework/index.ts"]` |
| **Correct** | `["./_bmad/framework/index.ts"]` |
| **Issue 2** | Path alias `@bmad/framework/*` wrong |
| **Current** | `["./framework/*/index.ts"]` |
| **Correct** | `["./_bmad/framework/*/index.ts"]` |
| **Issue 3** | Include pattern wrong |
| **Current** | `"framework/**/*"` in include array |
| **Correct** | `"_bmad/framework/**/*"` |

### 1.3 Validation Steps

```bash
# After fixes, run:
npm run lint          # Should pass
npx tsc --noEmit      # Should pass
npm run build         # Should succeed
```

---

## Phase 2: Documentation Path Audit

**Priority:** HIGH - User-facing documentation
**Estimated files:** 15-25

### 2.1 Path Migration Mapping

| Old Path Pattern | New Correct Path |
|------------------|------------------|
| `../Features/` | `../06-reference/features/` |
| `../TestingLogs/` | `../testing/` |
| `docs/Features/` | `Docs/06-reference/features/` |
| `docs/TestingLogs/` | `Docs/testing/` |
| `docs/getting-started/` | `Docs/01-getting-started/` |
| `docs/user-guide/` | `Docs/02-user-guides/` |
| `docs/developer/` | `Docs/03-developer-docs/` |
| `docs/operations/` | `Docs/04-operations/` |

### 2.2 Files Requiring Fixes

**Known broken files:**

1. **`Docs/01-getting-started/installation.md`**
   - Contains `../Features/Security-File-Integrity.md`
   - Contains `../TestingLogs/...` references
   - Contains `../Features/CONTEXT-EFFICIENCY.md`

2. **`Docs/05-project-management/planning/security-audits/BMAD-Security-Audit-Report.md`**
   - Contains `../../docs/Features/` references
   - Contains `../../docs/TestingLogs/` references

### 2.3 Search Commands to Find All Issues

```bash
# Find all broken path patterns
grep -rn "../Features/" Docs/
grep -rn "../TestingLogs/" Docs/
grep -rn "docs/Features" Docs/
grep -rn "docs/TestingLogs" Docs/
grep -rn "\[.*\](.*Features.*\.md)" Docs/
```

### 2.4 Fix Strategy

For each broken link found:
1. Identify the source file location
2. Calculate correct relative path to target
3. Update the markdown link
4. Verify target file exists

---

## Phase 3: Source Code Import Validation

**Priority:** MEDIUM
**Scope:** Validation pass (likely minimal changes)

### 3.1 Areas to Validate

| Directory | Import Style | Check For |
|-----------|--------------|-----------|
| `src/` | Relative `../` | Cross-directory imports |
| `_bmad/framework/` | Relative with `.js` | Imports to `.claude/` |
| `.claude/validators-node/` | Relative | Internal imports |
| `dev-tools/` | Relative | Config imports |

### 3.2 Validation Commands

```bash
# TypeScript type checking
npx tsc --noEmit

# Look for potentially broken cross-workspace imports
grep -rn "from '.*\.\.\/\.\.\/\.claude" _bmad/
grep -rn "from '.*\.\.\/\.\.\/framework" src/
```

### 3.3 Known Architecture Note

The framework at `_bmad/framework/` imports from `.claude/` workspace. This is a known cross-workspace pattern. Verify these imports still resolve after the restructure.

---

## Phase 4: Configuration File Audit

**Priority:** MEDIUM
**Files:** 8-12

### 4.1 Files to Audit

| File | What to Check |
|------|---------------|
| `package.json` | Workspaces array, file: dependencies, exports paths |
| `tsconfig.json` | All path aliases, include/exclude patterns |
| `.eslintrc.js` | Project references |
| `dev-tools/config/vitest.config.ts` | Include patterns |
| `dev-tools/config/vitest.config.unit.ts` | Include patterns |
| `dev-tools/config/vitest.config.integration.ts` | Include patterns |
| `_bmad/framework/package.json` | Dependency paths, exports |
| `.claude/validators-node/package.json` | Bin paths, exports |

### 4.2 Validation

```bash
# Verify workspace dependencies
npm ls @bmad/validators
npm ls @bmad/framework

# Check file: dependencies resolve
grep -n "file:" package.json
grep -n "file:" _bmad/framework/package.json
```

---

## Phase 5: Registry and Manifest Audit

**Priority:** LOW
**Files:** 3-5

### 5.1 Files to Fix

| File | Issue | Fix |
|------|-------|-----|
| `_bmad-output/project-registry.yaml` | `docs: "docs"` | Change to `docs: "Docs"` |

### 5.2 Files to Validate

- `_bmad/_config/manifest.yaml` - Verify all module paths exist
- `.claude/settings.json` - Check path configurations (if any)

---

## Phase 6: Final Validation

**Priority:** REQUIRED
**Scope:** Full build and test pass

### 6.1 Build Validation Sequence

```bash
# 1. Clean state
rm -rf node_modules/.cache
rm -rf dist/
rm -rf _bmad/framework/dist/
rm -rf .claude/validators-node/dist/

# 2. Fresh install
npm install

# 3. Build all workspaces
npm run build

# 4. Type check entire project
npx tsc --noEmit

# 5. Lint check
npm run lint

# 6. Run tests (if available)
npm test
```

### 6.2 Documentation Link Validation

```bash
# Spot check critical documentation
head -100 Docs/01-getting-started/installation.md
head -100 README.md

# Look for any remaining broken patterns
grep -rn "\.\./Features" Docs/ | wc -l    # Should be 0
grep -rn "\.\./TestingLogs" Docs/ | wc -l # Should be 0
```

---

## Execution Checklist

### Pre-Execution
- [ ] Commit or stash current changes
- [ ] Note current branch: `Integration-Prep`

### Phase 1: Critical Fixes
- [ ] Read and fix `.eslintrc.js`
- [ ] Read and fix `tsconfig.json` path aliases
- [ ] Read and fix `tsconfig.json` include patterns
- [ ] Run `npm run lint` - verify passes
- [ ] Run `npx tsc --noEmit` - verify passes

### Phase 2: Documentation
- [ ] Search for all `../Features/` references
- [ ] Search for all `../TestingLogs/` references
- [ ] Fix `Docs/01-getting-started/installation.md`
- [ ] Fix `Docs/05-project-management/.../BMAD-Security-Audit-Report.md`
- [ ] Fix any other files found by search
- [ ] Verify README.md links are correct

### Phase 3: Source Code
- [ ] Run `npx tsc --noEmit` - full project check
- [ ] Verify framework builds: `cd _bmad/framework && npm run build`
- [ ] Verify validators build: `cd .claude/validators-node && npm run build`

### Phase 4: Configurations
- [ ] Audit vitest config files
- [ ] Verify package.json exports
- [ ] Verify workspace dependencies resolve

### Phase 5: Registry/Manifest
- [ ] Fix `_bmad-output/project-registry.yaml`
- [ ] Validate manifest.yaml module paths

### Phase 6: Final Validation
- [ ] Full clean build succeeds
- [ ] All linting passes
- [ ] All tests pass
- [ ] No broken path patterns remain

---

## Issue Tracker

| ID | Severity | File | Issue | Status |
|----|----------|------|-------|--------|
| 1 | CRITICAL | `.eslintrc.js` | Wrong framework tsconfig path | TODO |
| 2 | CRITICAL | `tsconfig.json` | Wrong `@bmad/framework` alias | TODO |
| 3 | CRITICAL | `tsconfig.json` | Wrong include pattern | TODO |
| 4 | HIGH | `Docs/01-getting-started/installation.md` | Broken `../Features/` links | TODO |
| 5 | HIGH | `Docs/.../BMAD-Security-Audit-Report.md` | Broken doc paths | TODO |
| 6 | LOW | `_bmad-output/project-registry.yaml` | Lowercase `docs` | TODO |

---

## Rollback Plan

If issues arise after fixes:

```bash
# View all changes made
git diff

# Rollback single file
git checkout -- <filename>

# Rollback all changes
git checkout -- .

# Or reset to before changes
git stash
```

---

## Success Criteria

1. **Build passes:** `npm run build` completes without errors
2. **Types check:** `npx tsc --noEmit` passes
3. **Lint passes:** `npm run lint` passes
4. **No broken doc links:** Zero results from broken path searches
5. **Dependencies resolve:** `npm ls` shows no missing packages

---

## Estimated Effort

| Phase | Files | Complexity |
|-------|-------|------------|
| Phase 1 | 2 | Low - known fixes |
| Phase 2 | 15-25 | Medium - search and replace |
| Phase 3 | 0-5 | Low - validation mostly |
| Phase 4 | 8-12 | Low - verification |
| Phase 5 | 1-3 | Low - simple fixes |
| Phase 6 | 0 | Low - running commands |

**Total:** ~30-50 files to review/modify

---

*Plan created: 2026-01-26*
*Ready for execution upon approval*
