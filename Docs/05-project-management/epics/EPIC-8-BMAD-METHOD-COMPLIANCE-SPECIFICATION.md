# EPIC 8: BMAD METHOD COMPLIANCE & CYBERCOMMAND RESTRUCTURE

**Epic ID:** EPIC-8
**Epic Title:** Complete BMAD METHOD Compliance & Repository Restructure
**Priority:** Critical
**Status:** Planning
**Epic Owner:** Claude Code (BMAD Compliance Agent)
**Created:** 2026-01-23
**Target Completion:** 2026-02-20 (4 weeks)

---

## EXECUTIVE SUMMARY

This epic addresses the **32% BMAD METHOD compliance gap** identified in the current repository structure and implements the **CYBERCOMMAND rebranding** from Epic 6. The current repository has **59 files scattered in root directory** that need proper organization according to BMAD METHOD standards.

### Key Problems Addressed:

1. **Structural Non-Compliance**: 32% compliance gap with BMAD METHOD standard
2. **File Organization Chaos**: 31 core files (22 JS, 8 YAML, 1 Python) scattered in root
3. **Brand Inconsistency**: Folder name `BMAD-CYBERCOMMAND/` conflicts with CYBERCOMMAND branding
4. **Documentation Fragmentation**: 27 MD files in root need proper hierarchy
5. **Missing Standards**: No LICENSE, CONTRIBUTING.md, SECURITY.md, etc.

### Success Metrics:
- **32% → 100%** BMAD METHOD compliance
- **59 → 0** files in root directory (proper /src organization)
- **120+ references** updated from bmad-specialized-teams → BMAD-CYBERCOMMAND
- **100%** test pass rate after restructure
- **4-week** implementation timeline

---

## CURRENT STATE ANALYSIS

### Repository Structure Assessment

```
Current Root Directory (59 files):
├── Core Implementation (22 files)
│   ├── JavaScript Files: 22
│   │   ├── Core Systems: 12 (bmad-*.js, install.js)
│   │   ├── Package Registry: 5 (package-registry-*.js)
│   │   ├── Validation/Testing: 3 (abdul-*.js, final-*.js)
│   │   └── Examples/CLI: 2 (cli-example.js, example-usage.js)
│   ├── Configuration Files: 8 YAML
│   └── Validation Scripts: 1 Python
├── Documentation: 27 MD files
├── Module Directories: 2 (_bmad/, BMAD-CYBERCOMMAND/)
└── Support: 1 template, 1 TypeScript file
```

### Compliance Gap Analysis

**BMAD METHOD Standards Violations:**

1. **Structure**: No /src directory (CRITICAL)
2. **Organization**: Core files scattered in root (HIGH)
3. **Naming**: bmad-specialized-teams vs CYBERCOMMAND (HIGH)
4. **Documentation**: No /docs hierarchy (MEDIUM)
5. **Standards**: Missing standard files (MEDIUM)
6. **Testing**: No /test directory structure (HIGH)

### Folder Rename Impact Analysis

**120+ References to Update:**

```yaml
File Categories Affected:
- JavaScript Files: 15 files (path references, imports)
- YAML Configuration: 12 files (package names, paths)
- Documentation: 27 MD files (links, references)
- GitHub Workflows: 1 file
- Test Files: 65+ files (test paths, module names)

Critical Dependencies:
- NPM package scope: @bmad-specialized-teams → @bmad-cybercommand
- Module paths: BMAD-CYBERCOMMAND/ → BMAD-CYBERCOMMAND/
- Import statements: No direct imports found (✓ Safe)
- Configuration references: 8 YAML files need updating
```

---

## EPIC BREAKDOWN

### Story 8.1: Core /src Structure Creation
**Priority:** Critical **Effort:** 8 points **Duration:** 1 week

**Objective:** Establish BMAD METHOD compliant /src directory structure

**Tasks:**
- Create /src directory with standard subdirectories
- Move 22 JavaScript files to appropriate locations
- Move 8 YAML configuration files to /src/config/
- Update package.json entry points and scripts
- Update imports and require statements

**File Movement Plan:**
```
/src/
├── bin/
│   ├── install.js
│   ├── cli-example.js
│   └── example-usage.js
├── lib/
│   ├── core/
│   │   ├── bmad-configuration-manager.js
│   │   ├── bmad-dependency-manager.js
│   │   ├── bmad-installation-orchestrator.js
│   │   └── bmad-template-engine.js
│   ├── validators/
│   │   ├── bmad-configuration-validator.js
│   │   ├── bmad-agent-communication-validator.js
│   │   ├── bmad-circular-detection.js
│   │   ├── bmad-post-install-verifier.js
│   │   └── bmad-dependency-validator.py
│   ├── registry/
│   │   ├── package-registry-manager.js
│   │   ├── package-registry-integration.js
│   │   ├── package-registry-cli.js
│   │   └── package-registry-test-suite.js
│   └── packagers/
│       ├── bmad-specialized-teams-packager.js
│       └── bmad-version-compatibility.js
├── config/
│   ├── bmad-agent-schema.yaml
│   ├── bmad-package-metadata.yaml
│   ├── bmad-validation-rules.yaml
│   ├── dependencies.yaml
│   ├── installation-validation-logic.yaml
│   ├── conflict-detection-specifications.yaml
│   ├── version-compatibility-rules.yaml
│   └── bmad-agent-schema-extracted.yaml
└── modules/
    └── (content from _bmad/ directory)
```

**Acceptance Criteria:**
- [ ] All 31 core files moved to /src structure
- [ ] Package.json updated with new entry points
- [ ] All internal imports updated
- [ ] Scripts run without errors
- [ ] Tests pass with new structure

### Story 8.2: CYBERCOMMAND Folder Rename & Path Updates
**Priority:** Critical **Effort:** 13 points **Duration:** 1.5 weeks

**Objective:** Rename bmad-specialized-teams → BMAD-CYBERCOMMAND and update all references

**Tasks:**
- Rename folder: BMAD-CYBERCOMMAND/ → BMAD-CYBERCOMMAND/
- Update NPM package scope: @bmad-specialized-teams → @bmad-cybercommand
- Update 120+ file references across repository
- Update GitHub repository references
- Update all documentation links

**Path Update Strategy:**
```yaml
Phase 1: Folder Rename
- BMAD-CYBERCOMMAND/ → BMAD-CYBERCOMMAND/

Phase 2: Package References
- @bmad-specialized-teams → @bmad-cybercommand (NPM scope)
- bmad-specialized-teams → bmad-cybercommand (GitHub repo)

Phase 3: File Content Updates
- JavaScript: 15 files with path references
- YAML Config: 12 files with package names
- Documentation: 27 MD files with links
- Workflows: 1 GitHub Actions file

Phase 4: Module Integration
- Move _bmad/ content to /src/modules/
- Maintain Epic 6 CYBERCOMMAND branding
```

**Critical Files to Update:**
```yaml
High Priority:
- package-registry-manager.js (package scope logic)
- bmad-installation-orchestrator.js (installation paths)
- bmad-configuration-manager.js (team paths)
- dependencies.yaml (module references)
- bmad-package-metadata.yaml (category definitions)

Medium Priority:
- All YAML example files (*-team-module.yaml.example)
- Documentation files (EPIC-*, STORY-*, README.md)
- GitHub workflow (.github/workflows/*)

Low Priority:
- Test files (test-installation/*)
- Legacy example files
```

**Acceptance Criteria:**
- [ ] Folder successfully renamed
- [ ] All 120+ references updated
- [ ] Package scope updated throughout
- [ ] Documentation links functional
- [ ] Build and test pipelines work

### Story 8.3: Documentation Reorganization & Hierarchy
**Priority:** High **Effort:** 5 points **Duration:** 1 week

**Objective:** Organize 27 MD files into proper /docs hierarchy structure

**Tasks:**
- Create /docs directory structure
- Move and categorize documentation files
- Update internal documentation links
- Create documentation index and navigation

**Documentation Structure:**
```
/docs/
├── epics/
│   ├── EPIC-3-STORY-3.1-DELIVERY-SUMMARY.md
│   ├── EPIC-5-STORY-5.1-COMPLETION-SUMMARY.md
│   ├── EPIC-5.1-SPECIALIZED-TEAMS-PILOT-COMPLETION-SUMMARY.md
│   ├── EPIC-5.2-CROSS-MODULE-INTEGRATION-TEST-REPORT.md
│   ├── EPIC-5.3-USER-ACCEPTANCE-VALIDATION-REPORT.md
│   ├── EPIC-6-ABDUL-CORE-INTEGRATION.md
│   ├── EPIC-6-COMPLETION-SUMMARY.md
│   ├── EPIC-6-PLANNING-SUMMARY.md
│   ├── EPIC-6-PROJECT-SCOPE-UPDATE.md
│   ├── EPIC-6-STORY-6.1-ABDUL-EXTRACTION-COMPLETION-REPORT.md
│   └── epic-1-integration-report.md
├── stories/
│   ├── STORY-5.2-CROSS-MODULE-INTEGRATION-VALIDATION-REPORT.md
│   ├── STORY-6.3-ABDUL-VALIDATION-FINAL-REPORT.json
│   ├── STORY-6.3-ABDUL-VALIDATION-REPORT.json
│   ├── STORY-6.3-MASTER-PROJECT-MANAGER-VALIDATION-REPORT.md
│   ├── STORY-6.3-VALIDATION-SUMMARY.md
│   ├── STORY-6.5-FINAL-INTEGRATION-CERTIFICATION.json
│   ├── STORY-6.5-PRODUCTION-CERTIFICATION-REPORT.md
│   └── story-1.2-completion-summary.md
├── guides/
│   ├── BMAD-DEPENDENCY-MANAGEMENT-GUIDE.md
│   ├── BMAD-SCHEMA-IMPLEMENTATION-GUIDE.md
│   ├── INSTALLATION-FRAMEWORK-README.md
│   └── PACKAGE-REGISTRY-README.md
├── systems/
│   ├── BMAD-DEPENDENCY-SYSTEM-SUMMARY.md
│   ├── BMAD-INSTALLATION-SYSTEM-README.md
│   └── BMAD-SPECIALIZED-TEAMS-README.md
├── validation/
│   ├── AGENT-STRUCTURE-VALIDATION-REPORT.md
│   └── module-compatibility-matrix.md
├── specs/
│   └── agent-conversion-spec.md
└── README.md (documentation index)
```

**Acceptance Criteria:**
- [ ] All 27 MD files properly categorized
- [ ] Documentation hierarchy established
- [ ] Internal links updated and functional
- [ ] Documentation index created
- [ ] Navigation structure implemented

### Story 8.4: Testing & Validation Structure
**Priority:** High **Effort:** 8 points **Duration:** 1 week

**Objective:** Create proper /test directory and organize all testing files

**Tasks:**
- Create /test directory structure
- Move test files from root and test-installation/
- Organize validators and test suites
- Update test configurations
- Ensure all tests pass with new structure

**Test Structure:**
```
/test/
├── unit/
│   ├── abdul-validation-test-suite.js
│   ├── package-registry-test-suite.js
│   ├── bmad-cross-module-integration-tests.js
│   └── final-integration-test-suite.js
├── integration/
│   ├── installation/ (from test-installation/)
│   ├── validation/
│   │   ├── abdul-validation-enhanced.js
│   │   └── bmad-performance-benchmark.js
│   └── end-to-end/
├── benchmarks/
│   ├── BMAD-PERFORMANCE-BENCHMARK-REPORT.json
│   └── performance-reports/
├── fixtures/
│   ├── *-team-module.yaml.example files
│   ├── module.yaml.template
│   ├── package.json.template
│   └── team-package.json.template
└── config/
    └── jest.config.js (new test configuration)
```

**Acceptance Criteria:**
- [ ] All test files moved to /test structure
- [ ] Test categories properly organized
- [ ] Test configuration updated
- [ ] All tests pass with new paths
- [ ] Benchmarking suite functional

### Story 8.5: Standards Compliance & Tooling
**Priority:** Medium **Effort:** 5 points **Duration:** 1 week

**Objective:** Add missing standard files and tooling for full BMAD METHOD compliance

**Tasks:**
- Add missing standard files (LICENSE, CONTRIBUTING.md, etc.)
- Create tooling configurations (ESLint, Prettier, Husky)
- Add development environment files
- Final compliance validation
- Documentation updates

**New Standard Files:**
```
Root Level:
├── LICENSE (MIT license)
├── CONTRIBUTING.md (contribution guidelines)
├── SECURITY.md (security policy)
├── CODE_OF_CONDUCT.md
├── .nvmrc (Node version specification)
├── .npmrc (NPM configuration)
├── .editorconfig (editor configuration)
├── eslint.config.mjs (ESLint configuration)
├── prettier.config.mjs (Prettier configuration)
├── .husky/ (Git hooks)
│   ├── pre-commit
│   └── pre-push
└── .vscode/
    ├── settings.json
    ├── extensions.json
    └── launch.json
```

**Tooling Configuration:**
```json
package.json additions:
{
  "scripts": {
    "lint": "eslint src/ test/",
    "lint:fix": "eslint src/ test/ --fix",
    "format": "prettier --write src/ test/ docs/",
    "format:check": "prettier --check src/ test/ docs/",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "prepare": "husky install"
  },
  "devDependencies": {
    "eslint": "^8.55.0",
    "prettier": "^3.1.0",
    "husky": "^8.0.3",
    "lint-staged": "^15.2.0"
  }
}
```

**Acceptance Criteria:**
- [ ] All standard files created
- [ ] Tooling configurations functional
- [ ] Git hooks operational
- [ ] Linting and formatting working
- [ ] 100% BMAD METHOD compliance achieved

---

## IMPLEMENTATION TIMELINE

### Week 1: Foundation & Core Structure
**Story 8.1 Complete**
- [ ] Day 1-2: Create /src directory structure
- [ ] Day 3-4: Move core JavaScript files
- [ ] Day 5: Move YAML configuration files
- [ ] Day 6-7: Update package.json and test structure

### Week 2: CYBERCOMMAND Rename (Part 1)
**Story 8.2 Start**
- [ ] Day 8-9: Folder rename and immediate fixes
- [ ] Day 10-11: Update JavaScript file references
- [ ] Day 12-14: Update YAML configuration files

### Week 3: CYBERCOMMAND Rename (Part 2) & Documentation
**Stories 8.2 & 8.3**
- [ ] Day 15-16: Complete documentation reference updates
- [ ] Day 17-18: Documentation reorganization
- [ ] Day 19-21: GitHub workflow and final reference updates

### Week 4: Testing & Standards Completion
**Stories 8.4 & 8.5**
- [ ] Day 22-24: Test structure and validation
- [ ] Day 25-26: Standards compliance implementation
- [ ] Day 27-28: Final validation and cleanup

---

## RISK ANALYSIS & MITIGATION

### High Risk Items

**1. Breaking Changes During Rename**
- **Risk:** File references break during bmad-specialized-teams rename
- **Impact:** High - System unusable
- **Mitigation:**
  - Create comprehensive reference mapping
  - Test in isolated branch
  - Implement rollback plan
  - Update files in dependency order

**2. Import Statement Failures**
- **Risk:** JavaScript imports fail after /src restructure
- **Impact:** High - Build failures
- **Mitigation:**
  - Map all import dependencies first
  - Update package.json entry points
  - Test imports before file moves
  - Use automated import updating tools

**3. Test Suite Failures**
- **Risk:** Tests fail with new structure
- **Impact:** Medium - Delays delivery
- **Mitigation:**
  - Run test suite after each major change
  - Update test paths incrementally
  - Maintain test isolation
  - Create comprehensive test plan

### Medium Risk Items

**4. Documentation Link Rot**
- **Risk:** Internal documentation links break
- **Impact:** Medium - User experience degraded
- **Mitigation:**
  - Create link inventory before moves
  - Use automated link checking
  - Update links systematically
  - Test documentation navigation

**5. GitHub Integration Issues**
- **Risk:** CI/CD pipelines break with new structure
- **Impact:** Medium - Development workflow disrupted
- **Mitigation:**
  - Update workflows before major changes
  - Test pipeline with new paths
  - Use environment-specific configurations
  - Maintain backup workflows

---

## SUCCESS CRITERIA

### Primary Objectives (Must Have)
- [ ] **100% BMAD METHOD Compliance** - All structure standards met
- [ ] **Zero Root Files** - All files properly organized in /src
- [ ] **Complete Rename** - All bmad-specialized-teams → CYBERCOMMAND
- [ ] **Functional System** - All tests pass, builds succeed
- [ ] **Updated Documentation** - All links functional, hierarchy established

### Secondary Objectives (Should Have)
- [ ] **Improved Performance** - Faster builds with organized structure
- [ ] **Enhanced DX** - Better development experience with tooling
- [ ] **Clear Navigation** - Easy to find files and documentation
- [ ] **Automated Quality** - Linting, formatting, pre-commit hooks

### Stretch Goals (Nice to Have)
- [ ] **VS Code Integration** - Workspace configuration optimized
- [ ] **Documentation Site** - Generated documentation website
- [ ] **Performance Benchmarks** - Before/after performance comparison
- [ ] **Migration Guide** - Documentation for future similar migrations

---

## DEPENDENCIES & PREREQUISITES

### Internal Dependencies
- **Epic 6 Completion** - CYBERCOMMAND branding established
- **Stable Main Branch** - No active development conflicts
- **Test Suite Baseline** - All current tests passing

### External Dependencies
- **Node.js 18+** - Runtime environment
- **NPM Registry Access** - Package publication capability
- **GitHub Permissions** - Repository modification rights

### Team Dependencies
- **Development Team** - Available for testing and validation
- **Documentation Team** - Available for content review
- **DevOps Team** - CI/CD pipeline updates

---

## VALIDATION & ACCEPTANCE

### Automated Validation
```bash
# BMAD METHOD Compliance Check
npm run validate:structure
npm run validate:compliance
npm run test:full-suite

# Reference Validation
npm run validate:references
npm run validate:links
npm run validate:imports

# Quality Assurance
npm run lint
npm run format:check
npm run test:coverage
```

### Manual Validation Checklist
- [ ] **Structure Review** - /src directory properly organized
- [ ] **Rename Verification** - No bmad-specialized-teams references remain
- [ ] **Documentation Review** - All links functional, content accurate
- [ ] **Build Testing** - Clean builds on multiple environments
- [ ] **Integration Testing** - End-to-end workflows functional

### Stakeholder Sign-off
- [ ] **Technical Lead** - Architecture and implementation approved
- [ ] **Product Owner** - Requirements met and documented
- [ ] **QA Lead** - Testing strategy executed and passed
- [ ] **DevOps Lead** - Infrastructure and tooling validated

---

## POST-EPIC ACTIVITIES

### Immediate (Week 5)
- [ ] **Team Training** - New structure orientation
- [ ] **Documentation Publishing** - Update external documentation
- [ ] **Monitoring Setup** - Track system health post-migration
- [ ] **Performance Baseline** - Establish new performance metrics

### Short-term (Month 2)
- [ ] **Feedback Collection** - Developer experience assessment
- [ ] **Optimization** - Address any performance issues
- [ ] **Documentation Updates** - Refine based on usage patterns
- [ ] **Process Documentation** - Create migration playbook

### Long-term (Quarter 2)
- [ ] **Standards Evolution** - Update BMAD METHOD based on learnings
- [ ] **Automation Enhancement** - Improve compliance checking tools
- [ ] **Template Creation** - New project templates with proper structure
- [ ] **Best Practices** - Share learnings across organization

---

## APPENDICES

### Appendix A: File Movement Mapping

**Complete file relocation plan with source → destination mappings**

### Appendix B: Reference Update Matrix

**Comprehensive list of all bmad-specialized-teams references requiring updates**

### Appendix C: Testing Strategy

**Detailed testing approach for each story and integration points**

### Appendix D: Rollback Procedures

**Step-by-step rollback plan in case of critical failures**

---

**Epic Status:** Ready for Implementation
**Next Action:** Story 8.1 Sprint Planning
**Review Date:** 2026-01-30
**Epic Owner Approval:** Claude Code (BMAD Compliance Agent) - 2026-01-23