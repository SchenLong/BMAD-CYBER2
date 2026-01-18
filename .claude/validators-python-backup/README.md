# Python Validators Archive

**Archive Date**: 2026-01-18
**Archive Reason**: Migration to Node.js validators for publication readiness
**Archived By**: Team Beta (Winston & Murat) - Repository Architecture & Cleanup

## Contents

This directory contains the archived Python validator system that was originally developed for the BMAD-CYBER2 framework. These validators provided security controls including:

### Security Validators
- `anomaly_detector.py` - Behavioral anomaly detection
- `audit_integrity.py` - Audit trail verification
- `confidence_tracker.py` - Confidence scoring system
- `context_manager.py` - Context validation and management
- `jailbreak_guard.py` - Prompt injection and jailbreak detection
- `plugin_permissions.py` - Plugin permission management
- `production_guard.py` - Production environment protection
- `prompt_injection_guard.py` - Prompt injection prevention
- `rate_limiter.py` - Rate limiting controls
- `recursion_guard.py` - Recursion prevention
- `resource_limits.py` - Resource usage monitoring
- `supply_chain_verifier.py` - Supply chain security
- `telemetry_collector.py` - Security telemetry collection
- `token_validator.py` - Token validation and management

### Protection Guards
- `bash_safety.py` - Bash command safety validation
- `env_protection.py` - Environment variable protection
- `outside_repo_guard.py` - Repository boundary enforcement
- `pii_guard.py` - Personal information protection
- `secret_guard.py` - Secret detection and protection

### Common Utilities
- `security_common.py` - Shared security utilities and functions

## Migration Status

These Python validators have been **replaced** by the Node.js validator system located in `.claude/validators-node/`. The Node.js implementation provides:

- Better performance and resource usage
- Enhanced type safety with TypeScript
- Improved integration with the overall system architecture
- More maintainable codebase for publication

## Archive Integrity

- **Total Files**: 22 Python files + 1 README
- **Archive Method**: Complete directory copy
- **Verification**: File count and content checksums verified
- **Original Location**: `.claude/validators/`
- **Archive Location**: `.claude/validators-python-backup/`

## Important Notes

1. **DO NOT DELETE**: These files are archived for reference and potential debugging
2. **Security Relevance**: Contains production security logic that may be referenced
3. **Migration Reference**: Useful for understanding the original implementation approach
4. **Backup Purpose**: Maintains complete history of the security validation evolution

## Related Files

- Original test files: `/tests/test_*.py`
- Migration documentation: `.claude/validators-node/MIGRATION-PLAN.md`
- Current implementation: `.claude/validators-node/`

---

*This archive is part of the BMAD-CYBER2 repository cleanup for publication readiness.*