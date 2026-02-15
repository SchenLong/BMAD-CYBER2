# Changelog

All notable changes to BMAD CYBERCOMMAND will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- No unreleased features (current release: v2.3.0)

### Changed
- None

### Fixed
- None

### Security
- None

## [2.3.0] - 2026-02-13

## [2.3.0] - 2026-02-13

### Added

#### Branding & Documentation Updates
- New tagline: **Production-Ready AI Cybersecurity Operations Framework**
- Added LLM provider support badges: Claude, OpenAI, Ollama, LM Studio, GLM, Kimi, vLLM, Groq
- Added OWASP compliance badges: OWASP Top 10, API Top 10, LLM Top 10, ASVS v4.0
- Added dedicated Compliance Framework section with 20+ standards
- Added emojis throughout README for better visual appeal
- Updated LICENSE with **A BlackUnicorn Open Source Project** attribution
- Updated test counts: 7,117+ tests across 208 test files

#### TPI-CrowdStrike Prompt Injection Taxonomy (6 Epics, ~540 Tests)
- Comprehensive prompt injection defenses aligned with CrowdStrike "Taxonomy of Prompt Injection Methods" (2026)
- 22 stories (TPI-PRE-1 through TPI-21) covering all 14 identified gaps (G1-G14)
- New validators in `src/ai-safety/`:
  - `text-normalizer.ts`: Unicode/encoding normalization shared module
  - `pattern-engine.ts`: Centralized detection with synonym expansion
  - `output-validator.ts`: PostToolUse framework for WebFetch/Task/Skill/WebSearch
  - `context-integrity.ts`: Knowledge base integrity scanning
  - `media-validator.ts`: Image metadata, file validation, audio/SVG scanning
  - `reformulation-detector.ts`: Code-format, encoding, overload, fragmentation
  - `boundary-detector.ts`: System prompt closing, control tokens, whitespace evasion
  - `multilingual-patterns.ts`: 10-language injection detection
  - `web-content-patterns.ts` + `web-search-patterns.ts`: Indirect injection scanning
  - `agent-output-patterns.ts`: Agent-to-agent output validation
  - `settings-guard.ts`: settings.json write protection
- New entry points in `bin/`: output-validator.js, context-integrity.js, media-validator.js, settings-guard.js
- 20 new test files in `tests/security/` covering all TPI vectors

#### OWASP Compliance Testing Framework
- Complete OWASP security testing implementation covering:
  - OWASP Top 10 (2021)
  - API Security Top 10 (2023)
  - LLM Top 10 (2025)
  - ASVS v4.0
- 6 epics, 24 stories, 113 unique test IDs, 404 test functions
- New test files:
  - `crypto-verification.test.js`: 1038 lines of cryptographic validation tests
  - `llm-validators.test.js`: 1822 lines of LLM security validator tests
  - `misconfiguration-hardening.test.js`: 1296 lines of configuration hardening tests
  - `monitoring-alerting.test.js`: 835 lines of monitoring and alerting tests
  - `override-token-security.test.js`: 1102 lines of override token security tests
  - `plugin-capability.test.js`: 815 lines of plugin capability tests
  - `api-asset-management.test.js`, `api-misconfiguration.test.js`, `api-xxe-security.test.js`
  - `asvs-access-control.test.js`, `asvs-api-microservices.test.js`, `asvs-architecture.test.js`
  - `asvs-communication.test.js`, `asvs-data-protection.test.js`, `asvs-input-validation.test.js`
  - `threat-modeling.test.js`, `openapi-validation.test.js`, `web-injection-extended.test.js`
- OWASP Compliance Report (`src/security/reports/OWASP-COMPLIANCE-REPORT.md`)
- Zero regressions across full suite of 6,582 tests

#### V6 Alignment and Phase 2 Upgrade
- Epic 0-4 (Stories 4-17, 14 stories) delivering:
  - Testing infrastructure modernization
  - CLI modernization with @clack/prompts migration
  - Module standardization across 9 modules
  - Directory restructure (_bmad/ → src/)
- Agent ID standardization across 79 agents
- Module manifest schemas and registry scaffolding
- Schema validation: 80 agents + 139 workflows + 9 modules pass

### Changed

#### AI-Powered Help System
- `/bmad-help` interactive command for discovering modules, agents, workflows, and commands
- Module-aware help generator reading CSV manifests (9 modules, 79 agents, 138 workflows)
- Natural language search with 4-tier fuzzy matching (exact, substring, contains, Levenshtein)
- 8 contextual help templates covering all installed modules
- VULN-013: Manifest content sanitization preventing prompt injection

#### Direct Slash Command Invocation
- Slash command router with RBAC enforcement and audit trail integration
- Workflow alias registry (112 unique + 26 prefixed aliases, 13 conflict resolutions)
- Settings integrity validator (VULN-012 protection)
- Slash command reference card documentation

#### Node.js 20 Upgrade
- Minimum Node.js version updated to 20.0.0 (from 18.0.0)
- Minimum npm version updated to 10.0.0 (from 9.0.0)
- CI/CD pipelines updated (continuous-testing, extraction-qa, quality-gate)
- All crypto APIs verified compatible (AES-256-GCM, PBKDF2-SHA256, SHA-256)

### Security

#### TPI-CrowdStrike Implementation
- Closes all 14 identified prompt injection gaps
- 9 PostToolUse hooks, 1 Read media-validator hook
- 12 matchers in settings.json
- 23 hook content hash files baselined
- 72 validator checksums baselined
- MIN_HOOK_COUNT updated to 63

#### Static Code Analysis (SA-02)
- 7 HIGH findings remediated with 80 new tests
- Remediations:
  - `key-generator.js`: execSync→execFileSync for GPG calls (command injection)
  - `migration-executor.js`: shell opt-out→opt-in
  - `play-tts-termux-ssh.sh`: printf '%q' replaces incomplete escaping
  - `authorization.js`: reject .., %, // in agentPathResolver
  - `extractor.js`: strip setuid/setgid/sticky bits
  - `downloader.js`: sanitize tagName path separators
  - `safe-cli.js`: structural URL validation

#### Pre-UAT Remediation
- 9 risks mitigated, 11 compliance gaps closed
- Sprint A code fixes:
  - SA-04: deterministicStringify() for hash chain integrity
  - SA-02: PII sanitization in audit-logger.ts
  - SA-03: SIEM forwarding via setSiemIntegration()
  - SA-01: RBAC decision JSONL logging
  - SA-05: stripAnsi() in prompts.js
- Sprint B documentation: SECRET-MANAGEMENT.md, IR-TABLETOP-EXERCISE.md, test-backup-restore.sh
- Sprint C: HMAC-signed hook execution receipt, purgeUserData() + exportUserData()

#### Audit Infrastructure (QE-06)
- 92 new tests (28 signature + 19 rotation + 28 compliance + 17 key validation)
- Replace broken RSA signData() with HMAC-SHA256
- Real verifySignature() with timingSafeEqual
- Fix verifyIntegrity() hash chain reconstruction
- Implement rotateLog() with size-based triggers
- Implement enforceRetention() with category-based retention periods
- Implement generateComplianceReport() with SOC 2 and ISO 27001 control mapping

#### Shell Hook Sanitization (QE-03)
- All 40 shell hooks now source input-validation.sh (was 23/40)
- Fixed play-tts.sh exec chain injection
- Fixed audio-processor.sh IFS splitting
- 468 security tests pass, 0 regressions

#### Quality Engineering Improvements
- QE-01/QE-02: Fix vitest config discovery, ESLint expansion, framework build fixes
- QE-04/QE-07: SSRF allowlist bypass tests, e2e hook chain tests, npm tarball leak fix
- QE-09/QE-10: Shell hook sanitization (SC2168), L10 attack vector protocol, vitest config validation

#### ESLint and Code Quality
- Expand ESLint scope to include tests/ and tools/
- Auto-fix 383 violations + manually fix 12 remaining (0 errors)
- Rewrite stage-13-validation.test.js from custom runner to proper vitest (41 tests)
- Fix verify-validators.js process.exit() with isDirectRun guard

### Fixed

#### Critical Bug Fixes (Stage 0)
- Path sanitization with 7 bypass vector defenses (VULN-001 through VULN-007)
- Cross-file reference validator with CSV scanning support
- YAML CRLF line ending normalization for dual library setup
- Cross-platform glob wrapper for consistent behavior
- npm version checking with registry lookup

#### Known Issues
- Increase vitest heap to 4096MB (exclude memory.test.ts stress test from default runs)
- Add UAT-01 through UAT-12 test suites

### Documentation
- OWASP Compliance Report (6 epics, 404 tests)
- REPO-AUDIT-PLAN-PHASE0-COMPLETE.md (843 lines)
- SLASH-COMMAND-REFERENCE.md (289 lines)
- 8 help templates for all modules
- 53 markdown lint errors fixed

### Tests
- Total test count: 7,117 passing (208 files, 0 failures, 0 regressions)
- 20 new TPI prompt injection test files
- 17 new OWASP compliance test files
- UAT-01 through UAT-12 test suites
- SA-01 through SA-08 security assessment tests

### Breaking Changes
- **Node.js 18 no longer supported.** Minimum required version is now Node.js 20.0.0 (npm >= 10.0.0).

## [2.2.0] - 2026-02-09

### Added

#### AI-Powered Help System (Story 03)
- `/bmad-help` interactive command for discovering modules, agents, workflows, and commands
- Module-aware help generator reading CSV manifests (9 modules, 79 agents, 138 workflows)
- Natural language search with 4-tier fuzzy matching (exact, substring, contains, Levenshtein)
- 8 contextual help templates covering all installed modules
- ADR-007 documenting help system architecture decisions
- 42 new tests for help system (help-system.test.js)

#### Direct Slash Command Invocation (Story 01)
- Slash command router with RBAC enforcement and audit trail integration
- Workflow alias registry (112 unique + 26 prefixed aliases, 13 conflict resolutions)
- 138-workflow inventory with full alias mapping
- Settings integrity validator (VULN-012 protection)
- Slash command reference card documentation
- 59 new tests for routing and settings integrity

#### Bug Fixes Backport (Story 00)
- Path sanitization with 6 bypass vector protections (VULN-001 through VULN-007)
- Cross-file reference validator with CSV scanning support
- YAML CRLF line ending normalization for dual library setup (js-yaml + yaml)
- Cross-platform glob wrapper for consistent behavior
- npm version checking with registry lookup

### Changed

#### Node.js 20 Upgrade (Story 02)
- Minimum Node.js version updated to 20.0.0 (from 18.0.0)
- Minimum npm version updated to 10.0.0 (from 9.0.0)
- CI/CD pipelines updated to use Node.js 20 (continuous-testing, extraction-qa, quality-gate)
- All crypto APIs verified compatible (AES-256-GCM, PBKDF2-SHA256, SHA-256 hash chains)
- Source code version checks updated across cli.js, package-merger.js, dependency-manager.js, registry-manager.js
- Config templates updated (team-package.json.template, package.json.template, dependencies.yaml)

### Breaking Changes
- **Node.js 18 no longer supported.** Minimum required version is now Node.js 20.0.0 (npm >= 10.0.0). Users on Node 18 must upgrade before installing v2.2.0.

### Security
- **VULN-012**: Settings.json SPOF protection via integrity validator (54 hooks, 12 matchers assertion)
- **VULN-013**: Manifest content sanitization preventing prompt injection in help system (6 regex patterns, HTML stripping, code block stripping, length truncation)
- Reserved command names protected from alias override (13 conflicts + blocklist)
- All 139+ security validators verified functional across all 4 upgrade stages
- RBAC integration verified for slash command router entry points
- Audit trail captures all slash command operations via TamperEvidentAuditLogger

### Tests
- Total test count: 1387 passing (+101 new tests across all stories)
- Zero regressions across all 4 upgrade stages
- 2 pre-existing test failures unchanged (stage-13-validation process.exit, package-merger VAL-11-005)

## [2.1.1] - 2026-02-09

### Fixed

#### Stage 0 Critical Bug Fixes Backport (9 Tasks)
- Path sanitization with 7 bypass vector defenses (VULN-001 through VULN-007)
  - `sanitizePath()`, `preprocessPath()`, `sanitizeErrorMessage()` implementations
  - Integrated into block-message.js with 35 tests
- Cross-file reference validator (`src/utility/tools/reference-validator/`)
- YAML CRLF normalization (`src/utility/normalize-line-endings.js` + .cjs)
- Variable naming standardization ({project_root} → {project-root}, etc.)
- Cross-platform glob wrapper (`src/utility/cross-platform-glob.js`)
- Version checker with npm registry (`src/utility/version-checker.js`)
- Party-mode return protocol
- Workflow prompt verb standardization (~120 replacements, ~70 files)
- Deprecated npm flag updates

### Tests
- Total test count: 1298 passing, 0 regressions

## [2.1.0] - 2026-01-24

### Added

#### Strategic Positioning & Deployment Package (EPIC 5)
- Final integration achievement: 96.3% success rate
- Strategic Positioning Framework (Magnus): 98.5% complete
- Legal Compliance Validation (Counsel): 85.0% conditional
- Intelligence Assessment (Vector): 94.7% verified
- Technical Documentation (Winston): 97.2% ready
- Executive Integration Summary with Board decision framework
- Strategic Positioning Implementation with $2.1B market opportunity
- Legal Compliance roadmap with 7-day critical path resolution
- Competitive Intelligence validation with 94.7% confidence

#### Production Readiness (EPIC 4)
- Release Readiness Validation & Testing Certification
- 96.2% overall readiness score (exceeded 90% target)
- Cross-module integration: 94% success rate across all 4 core teams
- Security posture: 98.5% maintained
- 21-lesson validation framework: 95.7% completion rate
- Enterprise-grade professional presentation
- All 6 cross-module communication paths operational

#### Performance & Integration Testing (EPIC 2)
- Enterprise Security Testing Framework
- Security Monitoring Framework Implementation
- Comprehensive Performance & Integration Testing
- Test remediation: encryption, EDR deployment, alert correlation

#### RBAC & Security Infrastructure
- Role-based access control deployment (599+ lines authorization.js)
- Authorization and token management (546+ lines rbac-config.yaml)
- Session manager implementation (423+ lines)
- PGP signing for artifact verification
- Security audit logging and file integrity
- L10 attack vector protocol for 9 specific agents

#### Infrastructure Improvements
- Audit encryption performance optimization: 74% improvement (163% regression fixed)
  - 11,129ms → 43ms (430x better than 10,000ms target)
  - LRU key cache with 5-min TTL for security
  - Async PBKDF2 to prevent event loop blocking
- Context curation configurations to reduce token consumption
- Rate and memory limits fine-tuning
- Prompt database to avoid garbage in - garbage out for new users
- Validators migrated from Python to TypeScript

### Documentation
- Decision frameworks documentation
- Hooks and validators guide
- Security architecture documentation
- Schemas and data structures reference

### Tests
- Quality assurance validation complete
- Performance benchmarks exceeded in all categories
- Integration audit pass

## [2.0.0] - 2026-01-31

### Added

#### Multi-Agent Architecture
- 4 specialized teams: Cybersecurity, Intelligence, Legal, Strategy
- 53 AI agents across all teams with role-based capabilities
- 55 workflows with step-by-step execution guides
- Abdul Master Project Manager for cross-team orchestration
- NPX installer (`npx @blackunicorn/bmad-cybersec`) for easy deployment

#### Testing Framework
- 232 test suites covering unit, integration, and e2e scenarios
- Performance testing framework achieving 8.5x improvement over baseline
- Enterprise security testing framework with automated vulnerability scanning
- Regression test suite for critical security paths
- Test coverage reporting with threshold enforcement

#### CI/CD Pipeline
- 4 automated GitHub Actions workflows:
  - **Continuous Testing**: Runs on every push/PR with parallel test execution
  - **Extraction QA**: Validates BMAD extraction and configuration integrity
  - **Quality Gate**: Enforces code quality, security scans, and coverage thresholds
  - **Release**: Automated semantic versioning and changelog generation

#### Documentation
- Comprehensive AGENTS.md documenting all 53 agents with capabilities matrix
- WORKFLOWS.md with detailed execution guides for all 55 workflows
- 21 lessons learned from security incidents and operational improvements
- Chain of custody procedures for evidence handling
- Auditor portal documentation for compliance verification

### Security

#### Validators and Hardening
- 139+ security validators covering input validation, output sanitization, and runtime checks
- Hook sandboxing implementation preventing privilege escalation
- Supply chain security modules with dependency verification
- OWASP AI security checklist compliance (95/100 score)

#### Encryption and Data Protection
- AES-256-GCM encryption for sensitive data at rest (BLOCK-002 fix)
- YAML CORE_SCHEMA security preventing arbitrary code execution in configs
- Secure credential storage with automatic rotation support
- Evidence integrity verification with cryptographic hashing

#### Access Control
- Sub-agent permission inheritance model with least-privilege defaults
- Role-based access control (RBAC) for all agent operations
- Audit logging for all security-relevant events
- Session management with automatic timeout enforcement

### Fixed

#### Critical Bug Fixes
- **Sub-agent permission inheritance**: Fixed issue where child agents could inherit elevated permissions from parent context
- **STDIN hang resolution**: Resolved blocking I/O issue causing agent hangs during interactive operations
- **Shell injection prevention**: Hardened all shell command execution paths against injection attacks
- **Race condition in evidence collection**: Fixed timing vulnerability in concurrent evidence gathering
- **Memory leak in long-running validators**: Resolved resource exhaustion in continuous validation loops

#### Security Patches
- Patched path traversal vulnerability in file extraction (CVE-2026-XXXXX)
- Fixed insecure deserialization in YAML configuration loading
- Addressed timing attack vulnerability in authentication flow
- Corrected improper error handling exposing internal paths

### Changed
- Reorganized documentation to numbered directory structure (01-docs through 05-reference)
- Enhanced agent prompts with improved context awareness and security boundaries
- Migrated from SHA-1 to SHA-256 for all hash operations
- Upgraded all dependencies to address known vulnerabilities
- Standardized error messages to prevent information disclosure

### Deprecated
- Legacy configuration format (pre-2.0) - will be removed in 3.0.0
- Direct file system access from agents - use sandboxed file operations instead
- Unencrypted credential storage - automatic migration to encrypted storage

### Removed
- Insecure default configurations
- Deprecated v1 API endpoints
- Legacy agent communication protocol (replaced with secure message passing)

## [1.0.0] - 2025-06-15

### Added
- Core BMAD framework with multi-agent orchestration
- Initial agent definitions for basic cybersecurity operations
- Basic workflow support with sequential execution
- Configuration management via YAML files
- Logging infrastructure with structured output
- Initial documentation and getting started guide
