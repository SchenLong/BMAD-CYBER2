# EPIC 8 APPENDICES: DETAILED IMPLEMENTATION GUIDES

**Epic:** BMAD METHOD Compliance & CYBERCOMMAND Restructure
**Document:** Implementation Appendices
**Created:** 2026-01-23

---

## APPENDIX A: COMPLETE FILE MOVEMENT MAPPING

### A.1 Root Directory Analysis (59 Total Files)

**Current Root Structure:**
```
Root Directory Inventory:
├── Core Implementation (31 files)
│   ├── JavaScript Files: 22
│   ├── YAML Configuration: 8
│   └── Python Scripts: 1
├── Documentation: 27 MD files
└── Templates/Examples: 1 TypeScript, various templates
```

### A.2 JavaScript File Movement Plan (22 files)

```yaml
Source → Destination Mapping:

# Core System Files → /src/lib/core/
bmad-configuration-manager.js → /src/lib/core/bmad-configuration-manager.js
bmad-dependency-manager.js → /src/lib/core/bmad-dependency-manager.js
bmad-installation-orchestrator.js → /src/lib/core/bmad-installation-orchestrator.js
bmad-template-engine.js → /src/lib/core/bmad-template-engine.js

# Validation Files → /src/lib/validators/
bmad-configuration-validator.js → /src/lib/validators/bmad-configuration-validator.js
bmad-agent-communication-validator.js → /src/lib/validators/bmad-agent-communication-validator.js
bmad-circular-detection.js → /src/lib/validators/bmad-circular-detection.js
bmad-post-install-verifier.js → /src/lib/validators/bmad-post-install-verifier.js

# Package Registry → /src/lib/registry/
package-registry-manager.js → /src/lib/registry/package-registry-manager.js
package-registry-integration.js → /src/lib/registry/package-registry-integration.js
package-registry-cli.js → /src/lib/registry/package-registry-cli.js

# Packaging/Distribution → /src/lib/packagers/
bmad-specialized-teams-packager.js → /src/lib/packagers/bmad-cybercommand-packager.js
bmad-version-compatibility.js → /src/lib/packagers/bmad-version-compatibility.js

# CLI/Bin Files → /src/bin/
install.js → /src/bin/install.js
cli-example.js → /src/bin/cli-example.js
example-usage.js → /src/bin/example-usage.js

# Test Files → /test/unit/
abdul-validation-enhanced.js → /test/integration/validation/abdul-validation-enhanced.js
abdul-validation-test-suite.js → /test/unit/abdul-validation-test-suite.js
package-registry-test-suite.js → /test/unit/package-registry-test-suite.js
bmad-cross-module-integration-tests.js → /test/integration/bmad-cross-module-integration-tests.js
final-integration-test-suite.js → /test/integration/final-integration-test-suite.js
bmad-performance-benchmark.js → /test/benchmarks/bmad-performance-benchmark.js
```

### A.3 YAML Configuration Movement Plan (8 files)

```yaml
Source → Destination Mapping:

# Core Configuration → /src/config/
bmad-agent-schema.yaml → /src/config/bmad-agent-schema.yaml
bmad-package-metadata.yaml → /src/config/bmad-package-metadata.yaml
bmad-validation-rules.yaml → /src/config/bmad-validation-rules.yaml
dependencies.yaml → /src/config/dependencies.yaml
installation-validation-logic.yaml → /src/config/installation-validation-logic.yaml
conflict-detection-specifications.yaml → /src/config/conflict-detection-specifications.yaml
version-compatibility-rules.yaml → /src/config/version-compatibility-rules.yaml
bmad-agent-schema-extracted.yaml → /src/config/bmad-agent-schema-extracted.yaml
```

### A.4 Python Scripts Movement Plan (1 file)

```yaml
# Validation Scripts → /src/lib/validators/
bmad-validator.py → /src/lib/validators/bmad-validator.py
bmad-dependency-validator.py → /src/lib/validators/bmad-dependency-validator.py
```

### A.5 Template/Example Files Movement Plan

```yaml
# Templates → /test/fixtures/
module.yaml.template → /test/fixtures/module.yaml.template
package.json.template → /test/fixtures/package.json.template
team-package.json.template → /test/fixtures/team-package.json.template
cybersec-team-module.yaml.example → /test/fixtures/cybersec-team-module.yaml.example
intel-team-module.yaml.example → /test/fixtures/intel-team-module.yaml.example
legal-team-module.yaml.example → /test/fixtures/legal-team-module.yaml.example
strategy-team-module.yaml.example → /test/fixtures/strategy-team-module.yaml.example

# TypeScript → /src/lib/registry/
package-registry-manager.ts → /src/lib/registry/package-registry-manager.ts
```

---

## APPENDIX B: REFERENCE UPDATE MATRIX

### B.1 Critical File Reference Mapping

**120+ References requiring updates from `bmad-specialized-teams` → `BMAD-CYBERCOMMAND`**

#### B.1.1 JavaScript File References (15 files)

```yaml
package-registry-manager.js:
  Line 450: "if (packageName.includes('@bmad-specialized-teams'))"
  Action: Update to '@bmad-cybercommand'

bmad-installation-orchestrator.js:
  Line 224: "installationPath: session.steps[4].result.installedModules?.[0] || `./node_modules/@bmad-cybercommand/${teamCode}`"
  Line 401: "installationPath: `./node_modules/@bmad-cybercommand/${teamCode}`"
  Action: Update both paths to '@bmad-cybercommand'

bmad-configuration-manager.js:
  Line 190: "teamVars.set('TEAM_AGENTS_PATH', `node_modules/@bmad-cybercommand/${context.teamCode}/dist/agents`);"
  Line 191: "teamVars.set('TEAM_WORKFLOWS_PATH', `node_modules/@bmad-cybercommand/${context.teamCode}/dist/workflows`);"
  Action: Update both paths to 'BMAD-CYBERCOMMAND'

cli-example.js:
  Line 252: "console.log('  📦 @bmad-cybercommand/intel-team@2.0.0');"
  Line 253: "console.log('  📦 @bmad-cybercommand/cybersec-team@2.0.0');"
  Line 254: "console.log('  📦 @bmad-cybercommand/legal-team@2.0.0');"
  Line 288: "node cli-example.js install @bmad-cybercommand/intel-team"
  Line 330: "- Full NPM name: @bmad-cybercommand/intel-team"
  Action: Update all scope references to '@bmad-cybercommand'
```

#### B.1.2 YAML Configuration References (12 files)

```yaml
installation-validation-logic.yaml:
  Line 8: "target_ecosystem: \"bmad-specialized-teams\""
  Action: Update to "bmad-cybercommand"

conflict-detection-specifications.yaml:
  Line 8: "target_ecosystem: \"bmad-specialized-teams\""
  Action: Update to "bmad-cybercommand"

version-compatibility-rules.yaml:
  Line 8: "target_ecosystem: \"bmad-specialized-teams\""
  Action: Update to "bmad-cybercommand"

dependencies.yaml:
  Line 7: "name: \"@bmad-cybercommand/cybersec-team\""
  Line 11: "repository: \"https://github.com/bmad-code-org/bmad-specialized-teams.git\""
  Line 74: "- module: \"@bmad-cybercommand/intel-team\""
  Line 86: "- module: \"@bmad-cybercommand/legal-team\""
  Line 98: "- module: \"@bmad-cybercommand/strategy-team\""
  Line 261: "trusted_publishers: [\"bmad-code-org\", \"bmad-specialized-teams\"]"
  Action: Update scope to '@bmad-cybercommand' and repo name

bmad-package-metadata.yaml:
  Line 46: "enum: [\"bmad-specialized-teams\", \"bmad-core\", \"bmad-plugins\", \"bmad-templates\"]"
  Line 58: "examples: [\"@bmad-specialized-teams\", \"@bmad-core\"]"
  Line 651: "category: \"bmad-specialized-teams\""
  Line 653: "scope: \"@bmad-specialized-teams\""
  Line 655: "full_name: \"@bmad-cybercommand/example-team\""
  Line 658: "url: \"https://github.com/bmad-code-org/bmad-specialized-teams.git\""
  Action: Update all references to 'bmad-cybercommand' and new scope
```

#### B.1.3 Documentation References (27+ files)

```yaml
High Priority Documentation Updates:

README.md:
  - Multiple references to bmad-specialized-teams folder
  - Installation instructions with old paths
  - Example commands with old scope

EPIC-6-COMPLETION-SUMMARY.md:
  - CYBERCOMMAND branding references
  - Folder structure documentation

BMAD-SPECIALIZED-TEAMS-README.md:
  - Entire document needs rebranding
  - File should be renamed to BMAD-CYBERCOMMAND-README.md

Epic/Story Documentation:
  - 15+ epic and story documents with references
  - Installation paths and examples
  - Module references throughout
```

### B.2 Package Scope Update Strategy

#### B.2.1 NPM Package Scope Migration

```yaml
Current Scope: @bmad-specialized-teams
Target Scope: @bmad-cybercommand

Affected Packages:
- @bmad-cybercommand/multi-module
- @bmad-cybercommand/cybersec-team
- @bmad-cybercommand/intel-team
- @bmad-cybercommand/legal-team
- @bmad-cybercommand/strategy-team

Migration Strategy:
1. Update package.json in BMAD-CYBERCOMMAND/
2. Deprecate old scope packages on NPM
3. Publish new packages under @bmad-cybercommand
4. Update all consumer references
5. Maintain backward compatibility period
```

#### B.2.2 GitHub Repository References

```yaml
Current Repository: bmad-specialized-teams
Target Repository: BMAD-CYBERCOMMAND

References to Update:
- package.json repository fields
- GitHub Actions workflows
- Documentation clone instructions
- Submodule references (if any)
- Issue/PR templates
```

---

## APPENDIX C: DETAILED TESTING STRATEGY

### C.1 Pre-Migration Testing Baseline

#### C.1.1 Current Test Suite Inventory

```yaml
Test Files in Root (5 files):
- abdul-validation-test-suite.js (25,269 lines)
- package-registry-test-suite.js (23,381 lines)
- bmad-cross-module-integration-tests.js (32,133 lines)
- final-integration-test-suite.js (15,494 lines)
- abdul-validation-enhanced.js (13,703 lines)

Test Files in test-installation/ (16 files):
- Complete BMAD installation test suite
- Module-specific validation tests
- Integration test scenarios
- Build verification tests

Benchmark Files:
- bmad-performance-benchmark.js (22,890 lines)
- BMAD-PERFORMANCE-BENCHMARK-REPORT.json (2,533 chars)
```

#### C.1.2 Test Categories and Scope

```yaml
Unit Tests:
- Configuration management
- Dependency resolution
- Package registry operations
- Validation logic

Integration Tests:
- Module installation workflows
- Cross-module communication
- End-to-end installation process
- Abdul core integration

Performance Tests:
- Installation speed benchmarks
- Memory usage optimization
- Build time measurements
- Module loading performance

Validation Tests:
- YAML schema validation
- Agent communication protocols
- Workflow integrity checks
- Metadata compliance
```

### C.2 Migration Testing Phases

#### C.2.1 Phase 1: Structure Migration Testing

```yaml
Story 8.1 Testing:
  Pre-Migration:
    - [ ] Run full test suite baseline
    - [ ] Document all test outputs
    - [ ] Create test results snapshot

  During Migration:
    - [ ] Test after each file move
    - [ ] Verify import resolution
    - [ ] Check package.json entry points

  Post-Migration:
    - [ ] Full test suite execution
    - [ ] Import/require validation
    - [ ] Build process verification
    - [ ] Compare against baseline

Test Commands:
  npm test                    # Full test suite
  npm run test:unit          # Unit tests only
  npm run test:integration   # Integration tests only
  npm run validate           # Structure validation
```

#### C.2.2 Phase 2: Reference Update Testing

```yaml
Story 8.2 Testing:
  Pre-Rename:
    - [ ] Catalog all bmad-specialized-teams references
    - [ ] Test current functionality baseline
    - [ ] Document expected behaviors

  During Rename:
    - [ ] Test after each batch of updates
    - [ ] Verify package scope resolution
    - [ ] Check GitHub integration

  Post-Rename:
    - [ ] Reference resolution validation
    - [ ] Package installation tests
    - [ ] Documentation link verification
    - [ ] CI/CD pipeline testing

Critical Test Areas:
  - NPM package resolution
  - Module installation paths
  - Configuration file loading
  - Documentation navigation
```

#### C.2.3 Phase 3: Integration Testing

```yaml
Story 8.3 & 8.4 Testing:
  Documentation Testing:
    - [ ] Link validation (automated)
    - [ ] Content accuracy review
    - [ ] Navigation structure testing
    - [ ] Search functionality (if applicable)

  Test Structure Testing:
    - [ ] Test discovery and execution
    - [ ] Coverage reporting accuracy
    - [ ] Benchmark result consistency
    - [ ] Fixture loading verification

Automated Testing Tools:
  - Link checkers for documentation
  - Import analyzers for code
  - Test runner configuration
  - Coverage analysis tools
```

### C.3 Rollback Testing Procedures

#### C.3.1 Rollback Triggers

```yaml
Critical Failures Requiring Rollback:
- More than 10% test suite failure
- Core installation functionality broken
- Build process completely fails
- Major security vulnerabilities introduced
- Performance degradation > 50%

Rollback Decision Matrix:
  Story 8.1: Can rollback file moves individually
  Story 8.2: Must rollback as complete unit
  Story 8.3: Can rollback documentation changes
  Story 8.4: Can rollback test structure changes
  Story 8.5: Can rollback tooling additions
```

#### C.3.2 Rollback Validation

```yaml
Post-Rollback Testing:
- [ ] Full test suite execution
- [ ] Core functionality verification
- [ ] Performance baseline confirmation
- [ ] Security scan completion
- [ ] Integration endpoint testing

Rollback Success Criteria:
- All tests return to pre-migration state
- No new failures introduced
- Performance matches baseline
- All documented features functional
```

---

## APPENDIX D: ROLLBACK PROCEDURES

### D.1 Emergency Rollback Plan

#### D.1.1 Immediate Response (< 1 hour)

```yaml
Step 1: Assess Situation
- [ ] Identify failure type and scope
- [ ] Determine if rollback necessary
- [ ] Alert stakeholders
- [ ] Create incident report

Step 2: Git-based Rollback
- [ ] Identify last known good commit
- [ ] Create rollback branch
- [ ] Execute git revert or reset
- [ ] Test core functionality

Commands:
  git log --oneline -10                    # Find good commit
  git checkout -b emergency-rollback       # Create rollback branch
  git revert <commit-hash> --no-edit       # Revert specific commit
  git reset --hard <good-commit-hash>      # Hard reset if needed
```

#### D.1.2 Validation After Emergency Rollback

```yaml
Critical Function Tests:
- [ ] npm install works
- [ ] Basic CLI commands functional
- [ ] Test suite runs (even with failures)
- [ ] Documentation accessible
- [ ] Build process completes

Time Limit: 30 minutes maximum for validation
```

### D.2 Planned Rollback Procedures by Story

#### D.2.1 Story 8.1: /src Structure Rollback

```yaml
Rollback Steps:
1. [ ] Restore original package.json
2. [ ] Move all files back to root directory
3. [ ] Remove /src directory structure
4. [ ] Update any changed import statements
5. [ ] Test core installation functionality

Time Required: 2-4 hours
Risk Level: Low
Dependencies: None
```

#### D.2.2 Story 8.2: CYBERCOMMAND Rename Rollback

```yaml
Rollback Steps:
1. [ ] Rename BMAD-CYBERCOMMAND back to bmad-specialized-teams
2. [ ] Revert all @bmad-cybercommand scope changes
3. [ ] Restore original GitHub references
4. [ ] Update reverted documentation
5. [ ] Test package installation and references

Time Required: 4-8 hours
Risk Level: Medium
Dependencies: NPM package state, GitHub repository
```

#### D.2.3 Story 8.3: Documentation Rollback

```yaml
Rollback Steps:
1. [ ] Move documentation files back to root
2. [ ] Remove /docs directory structure
3. [ ] Restore original internal links
4. [ ] Update any navigation changes
5. [ ] Verify all documentation accessible

Time Required: 1-2 hours
Risk Level: Low
Dependencies: None
```

#### D.2.4 Story 8.4: Test Structure Rollback

```yaml
Rollback Steps:
1. [ ] Move test files back to original locations
2. [ ] Remove /test directory structure
3. [ ] Restore original test configurations
4. [ ] Update test runner settings
5. [ ] Verify all tests discoverable

Time Required: 2-3 hours
Risk Level: Low
Dependencies: Test runner configuration
```

#### D.2.5 Story 8.5: Standards Rollback

```yaml
Rollback Steps:
1. [ ] Remove added standard files
2. [ ] Remove tooling configurations
3. [ ] Restore original package.json
4. [ ] Remove Git hooks
5. [ ] Clean up any generated files

Time Required: 1 hour
Risk Level: Very Low
Dependencies: None
```

### D.3 Data Preservation During Rollback

#### D.3.1 Critical Data to Preserve

```yaml
Configuration Data:
- User-specific settings
- Environment configurations
- Custom module configurations
- Performance benchmarks

Version Control:
- All commits preserved
- Branch history maintained
- Tag information retained
- Issue/PR associations kept

Documentation State:
- Custom documentation additions
- User-generated content
- Configuration examples
- Installation notes
```

#### D.3.2 Rollback Testing Matrix

```yaml
Post-Rollback Validation:
                          Story: 8.1  8.2  8.3  8.4  8.5
Core Installation Works:    ✓    ✓    ✓    ✓    ✓
Module Loading Functions:   ✓    ✓    ✓    ✓    ✓
Tests Execute Successfully: ✓    ✓    ✓    ✓    ✓
Documentation Accessible:  ✓    ✓    ✓    ✓    ✓
Build Process Completes:    ✓    ✓    ✓    ✓    ✓
Performance Baseline Met:   ✓    ✓    ✓    ✓    ✓

Estimated Rollback Time:    4h   8h   2h   3h   1h
Risk of Data Loss:         Low  Med  Low  Low  VLow
```

---

## APPENDIX E: DETAILED STORY BREAKDOWN

### E.1 Story 8.1: Core /src Structure Creation

#### E.1.1 Task Breakdown with Time Estimates

```yaml
Task 1.1: Create Directory Structure (4 hours)
  Subtasks:
    - Create /src/bin/ directory (15 min)
    - Create /src/lib/core/ directory (15 min)
    - Create /src/lib/validators/ directory (15 min)
    - Create /src/lib/registry/ directory (15 min)
    - Create /src/lib/packagers/ directory (15 min)
    - Create /src/config/ directory (15 min)
    - Create /src/modules/ directory (15 min)
    - Create directory README files (2 hours)
    - Create index files for each directory (45 min)

Task 1.2: Move Core System Files (8 hours)
  Subtasks:
    - Move bmad-configuration-manager.js (30 min)
    - Move bmad-dependency-manager.js (30 min)
    - Move bmad-installation-orchestrator.js (30 min)
    - Move bmad-template-engine.js (30 min)
    - Update imports in moved files (2 hours)
    - Test core system functionality (4 hours)

Task 1.3: Move Validator Files (6 hours)
  Subtasks:
    - Move bmad-configuration-validator.js (30 min)
    - Move bmad-agent-communication-validator.js (30 min)
    - Move bmad-circular-detection.js (30 min)
    - Move bmad-post-install-verifier.js (30 min)
    - Move bmad-dependency-validator.py (30 min)
    - Update Python imports and paths (1 hour)
    - Update JavaScript imports (2 hours)
    - Test validation functionality (1.5 hours)

Task 1.4: Move Registry Files (6 hours)
  Subtasks:
    - Move package-registry-manager.js (30 min)
    - Move package-registry-integration.js (30 min)
    - Move package-registry-cli.js (30 min)
    - Move package-registry-manager.ts (30 min)
    - Update TypeScript configurations (1 hour)
    - Update imports and exports (2 hours)
    - Test registry functionality (1.5 hours)

Task 1.5: Update Package Configuration (4 hours)
  Subtasks:
    - Update package.json main entry (30 min)
    - Update package.json scripts (1 hour)
    - Update NPM scripts paths (1 hour)
    - Create new entry point files (1 hour)
    - Test npm commands (30 min)

Total Estimated Time: 28 hours (3.5 days)
```

#### E.1.2 Acceptance Criteria Detail

```yaml
Functional Requirements:
- [ ] All 22 JavaScript files moved to appropriate /src subdirectories
- [ ] All 8 YAML files moved to /src/config/
- [ ] All 1 Python file moved to /src/lib/validators/
- [ ] Package.json updated with new entry points
- [ ] All imports updated to use new paths

Technical Requirements:
- [ ] No broken import statements
- [ ] All npm scripts function correctly
- [ ] Module resolution works from new locations
- [ ] TypeScript compilation succeeds (if applicable)

Quality Requirements:
- [ ] All existing tests pass
- [ ] No linting errors introduced
- [ ] Code formatting maintained
- [ ] Documentation updated for new structure
```

### E.2 Story 8.2: CYBERCOMMAND Folder Rename & Path Updates

#### E.2.1 Task Breakdown with Dependencies

```yaml
Task 2.1: Folder Rename Preparation (4 hours)
  Subtasks:
    - Create complete reference inventory (2 hours)
    - Create automated update scripts (1.5 hours)
    - Test scripts on copy of repository (30 min)
  Dependencies: None
  Risk: Low

Task 2.2: Physical Folder Rename (2 hours)
  Subtasks:
    - Rename BMAD-CYBERCOMMAND/ to BMAD-CYBERCOMMAND/ (15 min)
    - Update immediate path references (1 hour)
    - Test basic folder access (15 min)
    - Update .gitignore if needed (30 min)
  Dependencies: Task 2.1 complete
  Risk: Medium (breaking change)

Task 2.3: NPM Scope Updates (8 hours)
  Subtasks:
    - Update package.json in BMAD-CYBERCOMMAND/ (30 min)
    - Update all @bmad-specialized-teams references (3 hours)
    - Test package resolution locally (1 hour)
    - Update dependencies.yaml (1 hour)
    - Update configuration files (2 hours)
    - Test installation workflows (30 min)
  Dependencies: Task 2.2 complete
  Risk: High (package resolution)

Task 2.4: GitHub Integration Updates (4 hours)
  Subtasks:
    - Update GitHub Actions workflows (1 hour)
    - Update repository references (1 hour)
    - Update issue/PR templates (30 min)
    - Update clone instructions (30 min)
    - Test CI/CD pipelines (1 hour)
  Dependencies: Task 2.3 complete
  Risk: Medium

Task 2.5: Documentation Updates (12 hours)
  Subtasks:
    - Update README.md (2 hours)
    - Update Epic documentation (4 hours)
    - Update Story documentation (3 hours)
    - Update system guides (2 hours)
    - Update example files (1 hour)
  Dependencies: Tasks 2.2-2.4 complete
  Risk: Low

Total Estimated Time: 30 hours (3.75 days)
```

#### E.2.2 Critical Dependencies and Order

```yaml
Execution Order (Critical):
1. Task 2.1: Preparation (can run in parallel with other stories)
2. Task 2.2: Folder rename (BLOCKING - affects all subsequent tasks)
3. Task 2.3: NPM scope updates (BLOCKING - affects package resolution)
4. Task 2.4: GitHub integration (can run in parallel with 2.5)
5. Task 2.5: Documentation updates (can run in parallel with 2.4)

Parallel Execution Opportunities:
- Tasks 2.4 and 2.5 can run simultaneously
- Task 2.1 can run during other story execution
- Documentation updates can be split across team members
```

### E.3 Implementation Timeline with Milestones

#### E.3.1 Weekly Milestone Breakdown

```yaml
Week 1: Foundation (Story 8.1)
  Day 1-2: Directory structure creation and initial moves
    Milestone: /src structure exists, core files moved
    Deliverable: Basic /src structure with core system files

  Day 3-4: Validation and registry files movement
    Milestone: All files moved, imports updated
    Deliverable: Complete file organization in /src

  Day 5: Testing and package.json updates
    Milestone: npm commands work, tests pass
    Deliverable: Functional system with new structure

Week 2: CYBERCOMMAND Rename Phase 1 (Story 8.2 Start)
  Day 6-7: Preparation and folder rename
    Milestone: Folder renamed, immediate fixes applied
    Deliverable: BMAD-CYBERCOMMAND folder functional

  Day 8-9: NPM scope updates
    Milestone: Package scope updated, resolution working
    Deliverable: @bmad-cybercommand packages functional

  Day 10: Testing and validation
    Milestone: Installation workflows functional
    Deliverable: Working package installation

Week 3: CYBERCOMMAND Rename Phase 2 + Documentation (Stories 8.2 & 8.3)
  Day 11-12: GitHub integration updates
    Milestone: CI/CD working with new structure
    Deliverable: Functional development workflow

  Day 13-14: Documentation updates and organization
    Milestone: All references updated, /docs created
    Deliverable: Organized, accurate documentation

  Day 15: Integration testing
    Milestone: End-to-end workflows functional
    Deliverable: Complete CYBERCOMMAND integration

Week 4: Testing Structure + Standards (Stories 8.4 & 8.5)
  Day 16-17: Test organization and structure
    Milestone: /test directory functional
    Deliverable: Organized test suite

  Day 18-19: Standards and tooling implementation
    Milestone: All standard files added, tooling functional
    Deliverable: 100% BMAD METHOD compliance

  Day 20: Final validation and cleanup
    Milestone: All acceptance criteria met
    Deliverable: Production-ready Epic 8 completion
```

#### E.3.2 Risk Mitigation Timeline

```yaml
Week 1 Risks:
- Import resolution failures
  Mitigation: Incremental testing after each move

- Package.json entry point issues
  Mitigation: Test each update immediately

Week 2 Risks:
- Folder rename breaking references
  Mitigation: Comprehensive reference inventory first

- NPM scope resolution problems
  Mitigation: Local testing before global changes

Week 3 Risks:
- CI/CD pipeline failures
  Mitigation: Test in feature branch first

- Documentation link rot
  Mitigation: Automated link checking

Week 4 Risks:
- Test discovery failures
  Mitigation: Incremental test organization

- Tooling configuration conflicts
  Mitigation: Test each tool individually
```

---

**Document Status:** Complete
**Last Updated:** 2026-01-23
**Next Review:** 2026-01-30 (Pre-Implementation)