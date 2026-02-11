# BMAD-CYBER2 Operational Runbooks

> **Version:** 1.0
> **Last Updated:** 2026-01-16
> **Audience:** System Administrators, Operations Teams

---

## Overview

This document provides operational runbooks for maintaining BMAD-CYBER2 in production environments. Each runbook covers a specific operational scenario with step-by-step procedures.

---

## Table of Contents

1. [Daily Operations](#daily-operations)
2. [Weekly Maintenance](#weekly-maintenance)
3. [Monthly Procedures](#monthly-procedures)
4. [Backup & Recovery](#backup--recovery)
5. [Update Procedures](#update-procedures)
6. [Health Checks](#health-checks)
7. [Log Management](#log-management)
8. [Token Operations](#token-operations)
9. [Module Management](#module-management)
10. [Emergency Procedures](#emergency-procedures)

---

## Daily Operations

### Runbook: Daily Health Check

**Schedule:** Every morning before business hours
**Duration:** 10-15 minutes
**Role Required:** Operator

#### Steps

1. **Verify System Status**

   ```bash
   # Check overall system health
   ./scripts/health-check.sh

   # Expected output:
   # ✓ Core module: healthy
   # ✓ Security validators: active (21/21)
   # ✓ Token service: running
   # ✓ Audit logging: enabled
   # ✓ All modules: loaded
   ```

2. **Review Overnight Logs**

   ```bash
   # Check for errors in last 24 hours
   ./scripts/log-summary.sh --since "24 hours ago" --level error

   # Check security events
   ./scripts/security-events.sh --since "24 hours ago"
   ```

3. **Verify Audit Log Integrity**

   ```bash
   # Verify hash chain
   ./scripts/verify-audit-chain.sh

   # Expected: "Hash chain valid: 1234 entries verified"
   ```

4. **Check Resource Usage**

   ```bash
   # Check disk space
   df -h _bmad-output/

   # Check log sizes
   du -sh .claude/logs/*
   du -sh _bmad-output/.audit/
   ```

5. **Document Status**
   - Record any issues in operations log
   - Escalate critical issues immediately

#### Escalation

If any check fails:

1. Check [Troubleshooting](#troubleshooting-common-issues) section
2. If unresolved, escalate to security team
3. Document in incident tracker

---

### Runbook: Token Rotation Check

**Schedule:** Daily
**Duration:** 5 minutes
**Role Required:** Security Operator

#### Steps

1. **Check Token Status**

   ```bash
   # List active tokens with expiration
   ./scripts/token-status.sh

   # Example output:
   # Token ID     User           Expires          Status
   # abc123...    admin          2026-01-23       valid
   # def456...    developer      2026-01-18       expiring_soon
   ```

2. **Identify Expiring Tokens**

   ```bash
   # Find tokens expiring within 48 hours
   ./scripts/token-status.sh --expiring-within 48h
   ```

3. **Notify Users**
   - Send expiration warnings to affected users
   - Provide renewal instructions

4. **Revoke Inactive Tokens**

   ```bash
   # Revoke tokens unused for 14 days
   ./scripts/token-cleanup.sh --inactive-days 14 --dry-run

   # If dry-run looks correct, execute
   ./scripts/token-cleanup.sh --inactive-days 14
   ```

---

## Weekly Maintenance

### Runbook: Weekly Security Audit

**Schedule:** Every Monday
**Duration:** 30-45 minutes
**Role Required:** Security Admin

#### Steps

1. **Review RBAC Usage**

   ```bash
   # Generate RBAC usage report
   ./scripts/rbac-audit.sh --period 7d --output rbac-report.html
   ```

2. **Review Permission Changes**

   ```bash
   # List permission changes in last week
   ./scripts/audit-query.sh --event-type permission_change --since "7 days ago"
   ```

3. **Check for Anomalies**

   ```bash
   # Run anomaly detection report
   ./scripts/anomaly-report.sh --period 7d

   # Review flagged items:
   # - Unusual access patterns
   # - Failed authentication attempts
   # - Out-of-hours activity
   ```

4. **Validate Security Validators**

   ```bash
   # Test all validators
   ./tests/run-validator-tests.sh

   # Verify all 21 validators pass
   ```

5. **Review Blocked Operations**

   ```bash
   # List blocked operations
   ./scripts/audit-query.sh --blocked true --since "7 days ago"

   # Investigate any unexpected blocks
   ```

6. **Generate Weekly Report**

   ```bash
   ./scripts/security-weekly-report.sh --output weekly-security-$(date +%Y%m%d).pdf
   ```

---

### Runbook: Log Rotation & Cleanup

**Schedule:** Every Sunday
**Duration:** 15-20 minutes
**Role Required:** Operator

#### Steps

1. **Rotate Audit Logs**

   ```bash
   # Rotate audit logs
   ./scripts/rotate-logs.sh --type audit

   # Verify rotation
   ls -la _bmad-output/.audit/*.gz
   ```

2. **Clean Old Logs**

   ```bash
   # Remove logs older than retention period (90 days default)
   ./scripts/cleanup-logs.sh --older-than 90d --dry-run

   # If dry-run looks correct
   ./scripts/cleanup-logs.sh --older-than 90d
   ```

3. **Archive Important Logs**

   ```bash
   # Archive security-relevant logs
   ./scripts/archive-logs.sh --type security --month $(date -d "last month" +%Y-%m)
   ```

4. **Verify Disk Space**

   ```bash
   # Check space recovered
   df -h _bmad-output/

   # Alert if usage > 80%
   ```

---

### Runbook: Cache Maintenance

**Schedule:** Every Sunday
**Duration:** 10 minutes
**Role Required:** Operator

#### Steps

1. **View Cache Statistics**

   ```bash
   ./scripts/cache-stats.sh

   # Example output:
   # Cache Type          Size      Hit Rate   Entries
   # Workflow Config     2.3 MB    94%        156
   # Templates           1.1 MB    89%        48
   # Token Cache         0.5 MB    97%        234
   ```

2. **Clear Stale Caches**

   ```bash
   # Clear entries older than 7 days
   ./scripts/cache-cleanup.sh --older-than 7d
   ```

3. **Optimize Cache Size**

   ```bash
   # Compact caches
   ./scripts/cache-optimize.sh

   # Rebuild indexes
   ./scripts/cache-rebuild-index.sh
   ```

---

## Monthly Procedures

### Runbook: Monthly Security Review

**Schedule:** First Monday of each month
**Duration:** 1-2 hours
**Role Required:** Security Admin

#### Steps

1. **Generate Monthly Security Report**

   ```bash
   ./scripts/security-monthly-report.sh \
     --month $(date -d "last month" +%Y-%m) \
     --output monthly-security-report.pdf
   ```

2. **Review Access Patterns**
   - Identify dormant accounts (no activity > 30 days)
   - Review high-privilege usage
   - Check for permission creep

3. **Audit Configuration Changes**

   ```bash
   # List all config changes
   git log --since="1 month ago" --oneline -- _bmad/*/config.yaml
   git log --since="1 month ago" --oneline -- _bmad/core/security/
   ```

4. **Validate Manifest Signatures**

   ```bash
   # Verify all module signatures
   ./scripts/verify-manifests.sh --all

   # Expected: All signatures valid
   ```

5. **Review and Update RBAC**
   - Remove access for departed users
   - Review role assignments
   - Update for new team members

6. **Update Security Policies**
   - Review and update as needed
   - Document any changes

---

### Runbook: System Update

**Schedule:** Monthly or as needed
**Duration:** 1-2 hours
**Role Required:** Admin

#### Pre-Update Checklist

- [ ] Backup current configuration
- [ ] Review release notes
- [ ] Schedule maintenance window
- [ ] Notify users
- [ ] Verify rollback procedure

#### Steps

1. **Create Backup**

   ```bash
   # Full backup before update
   ./scripts/backup.sh --full --label "pre-update-$(date +%Y%m%d)"
   ```

2. **Download Update**

   ```bash
   # Fetch latest version
   git fetch origin
   git log HEAD..origin/main --oneline
   ```

3. **Apply Update**

   ```bash
   # Stop active sessions (if applicable)
   ./scripts/maintenance-mode.sh --enable

   # Apply update
   git pull origin main

   # Update dependencies
   ./scripts/update-dependencies.sh
   ```

4. **Verify Update**

   ```bash
   # Run health checks
   ./scripts/health-check.sh

   # Run test suite
   ./tests/run-critical-tests.sh
   ```

5. **Resume Operations**

   ```bash
   # Disable maintenance mode
   ./scripts/maintenance-mode.sh --disable

   # Verify user access
   ./scripts/verify-access.sh
   ```

6. **Post-Update Validation**
   - Monitor for 24 hours
   - Check error rates
   - Verify all modules functional

#### Rollback Procedure

If update fails:

```bash
# Restore from backup
./scripts/restore.sh --label "pre-update-$(date +%Y%m%d)"

# Verify restoration
./scripts/health-check.sh

# Notify users
# Document incident
```

---

## Backup & Recovery

### Runbook: Full System Backup

**Schedule:** Weekly (recommended)
**Duration:** 15-30 minutes
**Role Required:** Admin

#### Steps

1. **Verify Backup Location**

   ```bash
   # Check backup storage availability
   df -h /backup/bmad-cyber2/
   ```

2. **Execute Full Backup**

   ```bash
   ./scripts/backup.sh --full \
     --destination /backup/bmad-cyber2/ \
     --label "weekly-$(date +%Y%m%d)"
   ```

3. **Backup Contents**
   - `_bmad/` - All modules and configurations
   - `.claude/` - Hooks, validators, settings
   - `_bmad-output/` - Output artifacts
   - `_bmad-output/.audit/` - Audit logs
   - Token files

4. **Verify Backup**

   ```bash
   # Verify backup integrity
   ./scripts/verify-backup.sh --label "weekly-$(date +%Y%m%d)"
   ```

5. **Test Restoration (Quarterly)**

   ```bash
   # Restore to test environment
   ./scripts/restore.sh \
     --source /backup/bmad-cyber2/weekly-YYYYMMDD/ \
     --destination /test/bmad-cyber2/ \
     --dry-run

   # If dry-run successful
   ./scripts/restore.sh \
     --source /backup/bmad-cyber2/weekly-YYYYMMDD/ \
     --destination /test/bmad-cyber2/
   ```

---

### Runbook: Configuration Backup

**Schedule:** After any config change
**Duration:** 5 minutes
**Role Required:** Operator

#### Steps

1. **Backup Configuration Only**

   ```bash
   ./scripts/backup.sh --config-only \
     --label "config-$(date +%Y%m%d-%H%M)"
   ```

2. **Verify Backup**

   ```bash
   ./scripts/verify-backup.sh --label "config-$(date +%Y%m%d-%H%M)"
   ```

3. **Commit to Version Control**

   ```bash
   git add _bmad/*/config.yaml
   git add _bmad/core/security/*.yaml
   git commit -m "Config backup: $(date +%Y%m%d)"
   ```

---

### Runbook: Disaster Recovery

**Trigger:** System failure or data loss
**Duration:** Variable
**Role Required:** Admin

#### Steps

1. **Assess Damage**

   ```bash
   # Check what's affected
   ./scripts/health-check.sh --verbose

   # List corrupted/missing files
   ./scripts/integrity-check.sh
   ```

2. **Identify Recovery Point**

   ```bash
   # List available backups
   ./scripts/list-backups.sh

   # Select appropriate backup
   # (most recent before incident)
   ```

3. **Execute Recovery**

   ```bash
   # Full restoration
   ./scripts/restore.sh \
     --source /backup/bmad-cyber2/weekly-YYYYMMDD/ \
     --destination /path/to/bmad-cyber2/

   # Or selective restoration
   ./scripts/restore.sh \
     --source /backup/bmad-cyber2/weekly-YYYYMMDD/ \
     --components "config,audit" \
     --destination /path/to/bmad-cyber2/
   ```

4. **Verify Recovery**

   ```bash
   # Run full health check
   ./scripts/health-check.sh

   # Run test suite
   ./tests/run-critical-tests.sh

   # Verify audit chain
   ./scripts/verify-audit-chain.sh
   ```

5. **Post-Recovery**
   - Document incident
   - Review cause
   - Update procedures if needed

---

## Update Procedures

### Runbook: Hot-Fix Deployment

**Trigger:** Critical bug or security fix
**Duration:** 30-60 minutes
**Role Required:** Admin

#### Steps

1. **Assess Urgency**
   - Is this a security vulnerability?
   - What's the blast radius?
   - Can we wait for maintenance window?

2. **Prepare Fix**

   ```bash
   # Create hotfix branch
   git checkout -b hotfix/issue-description

   # Apply fix
   # ... make changes ...

   # Test fix locally
   ./tests/run-critical-tests.sh
   ```

3. **Deploy Fix**

   ```bash
   # If can't wait for maintenance window:
   # Backup current state
   ./scripts/backup.sh --quick --label "pre-hotfix"

   # Apply fix
   git checkout main
   git merge hotfix/issue-description

   # Verify
   ./scripts/health-check.sh
   ```

4. **Monitor**
   - Watch for 2 hours minimum
   - Check error rates
   - Verify fix effective

5. **Document**
   - Update incident record
   - Add to lessons learned

---

## Health Checks

### Runbook: Comprehensive Health Check

**Trigger:** On-demand or troubleshooting
**Duration:** 15-20 minutes
**Role Required:** Operator

#### Steps

1. **Core System Check**

   ```bash
   # Full health check
   ./scripts/health-check.sh --verbose

   # Check output for:
   # ✓ Core module loaded
   # ✓ All 9 modules available
   # ✓ Security validators active
   # ✓ Token service operational
   # ✓ Audit logging functional
   ```

2. **Module Verification**

   ```bash
   # Verify each module
   for module in core cybersec-team intel-team strategy-team legal-team bmm bmgd bmb cis; do
     echo "Checking $module..."
     ./scripts/verify-module.sh $module
   done
   ```

3. **Agent Verification**

   ```bash
   # Verify agent manifest
   ./scripts/verify-agents.sh

   # Expected: 80+ agents verified
   ```

4. **Workflow Verification**

   ```bash
   # Verify workflow manifest
   ./scripts/verify-workflows.sh

   # Expected: 143+ workflows verified
   ```

5. **Security Verification**

   ```bash
   # Verify all security components
   ./scripts/security-check.sh

   # Check:
   # - RBAC configuration valid
   # - Auth config valid
   # - All validators operational
   # - Audit chain intact
   ```

6. **Performance Check**

   ```bash
   # Quick performance test
   ./scripts/quick-perf-test.sh

   # Verify within acceptable ranges
   ```

---

## Log Management

### Runbook: Log Analysis

**Trigger:** Investigation or routine review
**Duration:** Variable
**Role Required:** Operator

#### Steps

1. **Search Logs by Time Range**

   ```bash
   # Last hour
   ./scripts/log-search.sh --since "1 hour ago"

   # Specific date range
   ./scripts/log-search.sh \
     --from "2026-01-15 00:00" \
     --to "2026-01-16 00:00"
   ```

2. **Search by Severity**

   ```bash
   # Errors only
   ./scripts/log-search.sh --level error

   # Warnings and above
   ./scripts/log-search.sh --level warning
   ```

3. **Search by Component**

   ```bash
   # Security events
   ./scripts/log-search.sh --component security

   # Specific workflow
   ./scripts/log-search.sh --workflow incident-response

   # Specific agent
   ./scripts/log-search.sh --agent cybersec-team/bastion
   ```

4. **Search by User**

   ```bash
   # Specific user activity
   ./scripts/log-search.sh --user admin@example.com
   ```

5. **Export Results**

   ```bash
   # Export to CSV
   ./scripts/log-search.sh --level error --since "24 hours ago" \
     --output errors.csv --format csv

   # Export to JSON
   ./scripts/log-search.sh --workflow incident-response \
     --output workflow-log.json --format json
   ```

---

## Token Operations

### Runbook: Generate New Token

**Trigger:** New user or token rotation
**Duration:** 5 minutes
**Role Required:** Security Admin

#### Steps

1. **Identify User and Roles**

   ```bash
   # List available roles
   cat _bmad/core/security/rbac-config.yaml | grep "role:"
   ```

2. **Generate Token**

   ```bash
   # Generate token for user
   ./scripts/generate-token.sh \
     --user "user@example.com" \
     --name "User Name" \
     --roles "developer,product_manager" \
     --expires "7d"
   ```

3. **Distribute Token**
   - Send securely to user
   - Never email tokens in plain text
   - Use secure channel

4. **Verify Token Works**

   ```bash
   # Test token validation
   ./scripts/verify-token.sh --token "generated-token"
   ```

5. **Document**
   - Record token issuance
   - Note expiration date
   - Document roles granted

---

### Runbook: Revoke Token

**Trigger:** User departure, compromise, or rotation
**Duration:** 5 minutes
**Role Required:** Security Admin

#### Steps

1. **Identify Token**

   ```bash
   # Find token by user
   ./scripts/token-status.sh --user "user@example.com"
   ```

2. **Revoke Token**

   ```bash
   # Revoke specific token
   ./scripts/revoke-token.sh --token-id "abc123"

   # Or revoke all tokens for user
   ./scripts/revoke-token.sh --user "user@example.com" --all
   ```

3. **Verify Revocation**

   ```bash
   # Confirm token invalid
   ./scripts/verify-token.sh --token "revoked-token"
   # Expected: Token invalid
   ```

4. **Clear Token Cache**

   ```bash
   # Clear cached token
   ./scripts/cache-cleanup.sh --token "abc123"
   ```

5. **Document**
   - Record revocation reason
   - Update access records

---

## Module Management

### Runbook: Enable/Disable Module

**Trigger:** Administrative decision
**Duration:** 10 minutes
**Role Required:** Admin

#### Enable Module

```bash
# 1. Verify module exists
ls _bmad/module-name/

# 2. Enable in manifest
./scripts/module-enable.sh module-name

# 3. Verify enabled
./scripts/verify-module.sh module-name

# 4. Test access
./scripts/test-module-access.sh module-name
```

#### Disable Module

```bash
# 1. Notify affected users
# (manual step)

# 2. Disable module
./scripts/module-disable.sh module-name

# 3. Verify disabled
./scripts/verify-module.sh module-name
# Expected: Module disabled

# 4. Document reason
```

---

### Runbook: Add Custom Module

**Trigger:** New module installation
**Duration:** 30-60 minutes
**Role Required:** Admin

#### Steps

1. **Verify Module Structure**

   ```bash
   # Check required files exist
   ls new-module/manifest.yaml
   ls new-module/config.yaml
   ls new-module/agents/
   ls new-module/workflows/
   ```

2. **Validate Manifest**

   ```bash
   ./scripts/validate-manifest.sh new-module/manifest.yaml
   ```

3. **Verify Signature (if signed)**

   ```bash
   gpg --verify new-module/manifest.yaml.sig new-module/manifest.yaml
   ```

4. **Install Module**

   ```bash
   # Copy to _bmad
   cp -r new-module _bmad/

   # Register in central manifest
   ./scripts/register-module.sh new-module
   ```

5. **Configure RBAC**

   ```bash
   # Edit rbac-config.yaml to add permissions
   # (manual step - edit file)

   # Validate RBAC config
   ./scripts/validate-rbac.sh
   ```

6. **Test Module**

   ```bash
   # Run module tests
   ./tests/run-module-tests.sh new-module

   # Test agent activation
   ./scripts/test-agent.sh new-module/agents/main-agent.md
   ```

7. **Document**
   - Update documentation
   - Train users
   - Announce availability

---

## Emergency Procedures

### Runbook: Security Incident Response

**Trigger:** Suspected security breach
**Duration:** Variable
**Role Required:** Security Admin

**See also:** [INCIDENT-RESPONSE-RUNBOOK.md](INCIDENT-RESPONSE-RUNBOOK.md)

#### Immediate Actions (First 15 minutes)

1. **Assess Severity**
   - Is data compromised?
   - Is system integrity affected?
   - Are credentials exposed?

2. **Contain**

   ```bash
   # If critical - enable lockdown
   ./scripts/emergency-lockdown.sh

   # This will:
   # - Block all non-admin access
   # - Preserve audit logs
   # - Alert security team
   ```

3. **Preserve Evidence**

   ```bash
   # Capture current state
   ./scripts/capture-state.sh --output incident-$(date +%Y%m%d-%H%M%S)

   # Do NOT modify or delete logs
   ```

4. **Notify**
   - Security team
   - Management (if required)
   - Legal (if data breach)

#### Investigation (Next steps)

See [INCIDENT-RESPONSE-RUNBOOK.md](INCIDENT-RESPONSE-RUNBOOK.md) for full procedure.

---

### Runbook: Emergency Shutdown

**Trigger:** Critical system failure
**Duration:** Immediate
**Role Required:** Admin

#### Steps

1. **Initiate Shutdown**

   ```bash
   # Graceful shutdown
   ./scripts/emergency-shutdown.sh --graceful

   # If system unresponsive
   ./scripts/emergency-shutdown.sh --force
   ```

2. **Preserve State**

   ```bash
   # State is automatically captured during shutdown
   # Check: _bmad-output/.emergency/
   ```

3. **Notify**
   - All users
   - Management
   - Support team

4. **Document**
   - Record time of shutdown
   - Record reason
   - Record who authorized

5. **Recovery**
   - See [Disaster Recovery](#runbook-disaster-recovery)

---

## Quick Reference

### Daily Checklist

- [ ] Health check passed
- [ ] No critical errors in logs
- [ ] Audit chain intact
- [ ] Disk space adequate
- [ ] Expiring tokens notified

### Weekly Checklist

- [ ] Security audit complete
- [ ] Logs rotated
- [ ] Caches cleaned
- [ ] Performance baseline stable

### Monthly Checklist

- [ ] Monthly security review
- [ ] RBAC audit complete
- [ ] Manifest signatures valid
- [ ] Backup restoration tested
- [ ] System updated (if available)

### Key Commands

```bash
# Health
./scripts/health-check.sh

# Security
./scripts/security-check.sh
./scripts/verify-audit-chain.sh

# Backup
./scripts/backup.sh --full
./scripts/restore.sh --source /backup/

# Logs
./scripts/log-search.sh --level error
./scripts/rotate-logs.sh

# Tokens
./scripts/token-status.sh
./scripts/generate-token.sh
./scripts/revoke-token.sh

# Emergency
./scripts/emergency-lockdown.sh
./scripts/emergency-shutdown.sh
```

---

## Related Documentation

- [INCIDENT-RESPONSE-RUNBOOK.md](INCIDENT-RESPONSE-RUNBOOK.md) - Security incidents
- [PERFORMANCE-TUNING.md](PERFORMANCE-TUNING.md) - Performance optimization
- [SECURITY-MAINTENANCE-CHECKLIST.md](../Security/SECURITY-MAINTENANCE-CHECKLIST.md) - Security procedures
- [TOKEN-MANAGEMENT-GUIDE.md](../Security/TOKEN-MANAGEMENT-GUIDE.md) - Token operations
- [AUDIT-LOG-GUIDE.md](../Security/AUDIT-LOG-GUIDE.md) - Audit log management
