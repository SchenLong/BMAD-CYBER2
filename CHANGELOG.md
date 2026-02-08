# Changelog

All notable changes to BMAD CYBERCOMMAND will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
