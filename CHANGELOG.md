# Changelog

All notable changes to BMAD CYBERCOMMAND will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

## [2.0.0] - 2026-01-31

### Added

#### Multi-Agent Architecture
- 4 specialized teams: Cybersecurity, Intelligence, Legal, Strategy
- 53 AI agents across all teams with role-based capabilities
- 55 workflows with step-by-step execution guides
- Abdul Master Project Manager for cross-team orchestration
- NPX installer (`npx bmad-cybersec`) for easy deployment

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
