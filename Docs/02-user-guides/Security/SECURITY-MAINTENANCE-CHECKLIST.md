# Security Maintenance Checklist

> **Version:** 1.0
> **Last Updated:** 2026-01-16
> **Audience:** System Administrators, Security Officers

---

## Overview

This checklist defines regular security maintenance procedures for BMAD-CYBER2. Following these procedures ensures the security posture remains strong and compliant.

---

## Daily Tasks

### Token Validation (5 minutes)

- [ ] Verify authentication is working
  ```bash
  node _bmad/core/security/validate-token.js
  ```

- [ ] Check for token expiration warnings
  ```bash
  grep "expir" .claude/logs/security.log | tail -5
  ```

### Security Log Review (10 minutes)

- [ ] Check for security violations
  ```bash
  grep "security.violation" _bmad-output/.audit/audit.log | tail -10
  ```

- [ ] Review authentication failures
  ```bash
  grep "auth.failure" _bmad-output/.audit/audit.log | tail -10
  ```

- [ ] Check for access denied events
  ```bash
  grep "access.denied" _bmad-output/.audit/audit.log | tail -10
  ```

### YOLO Mode Audit (5 minutes)

- [ ] Review any YOLO mode activations
  ```bash
  grep "yolo" _bmad-output/.audit/audit.log | tail -10
  ```

- [ ] Verify YOLO usage was authorized
  - Document justification for each YOLO invocation

---

## Weekly Tasks

### Validator Health Check (15 minutes)

- [ ] Verify all validators are present and executable
  ```bash
  for f in .claude/validators-node/bin/*.js; do
    node --check "$f" 2>/dev/null && echo "OK: $f" || echo "ERROR: $f"
  done
  ```

- [ ] Check validator permissions
  ```bash
  ls -la .claude/validators-node/bin/*.js | grep -v "^-rw"
  # Should return empty (all files should be readable)
  ```

- [ ] Test critical validators
  ```bash
  # Test bash safety validator
  echo '{"tool_name": "Bash", "tool_input": {"command": "echo test"}}' | \
    node .claude/validators-node/bin/bash-safety.js
  # Should exit 0
  ```

### Token Rotation Check (10 minutes)

- [ ] Review token expiration dates
  ```bash
  node _bmad/core/security/validate-token.js | grep "expires"
  ```

- [ ] Rotate tokens expiring within 24 hours
  ```bash
  # If token expires soon:
  node _bmad/core/security/quick-token.cjs "User" "role" 168
  ```

### RBAC Audit (15 minutes)

- [ ] Review current role assignments
  ```bash
  node _bmad/core/security/check-authorization.js roles
  ```

- [ ] Verify no unauthorized role escalations
  ```bash
  grep "role" .claude/logs/security.log | grep -i "change\|escalat\|modif" | tail -10
  ```

- [ ] Confirm role assignments match job functions
  - Cross-reference with HR/team roster

### Audit Log Integrity (10 minutes)

- [ ] Verify audit log hash chain
  ```bash
  python3 << 'EOF'
  import json
  prev = "GENESIS"
  with open("_bmad-output/.audit/audit.log") as f:
      for i, line in enumerate(f, 1):
          entry = json.loads(line)
          if entry.get("prev_hash") != prev:
              print(f"Chain broken at line {i}")
              break
          prev = entry.get("hash", "")
      else:
          print(f"Chain OK: {i} entries verified")
  EOF
  ```

- [ ] Check log file permissions
  ```bash
  ls -la _bmad-output/.audit/audit.log
  # Should be owned by appropriate user
  ```

### Security Metrics Report (15 minutes)

Generate weekly metrics:

```bash
echo "=== Weekly Security Metrics ==="
echo "Date Range: $(date -v-7d +%Y-%m-%d) to $(date +%Y-%m-%d)"
echo ""
echo "Total Events: $(wc -l < _bmad-output/.audit/audit.log)"
echo "Security Violations: $(grep -c 'security.violation' _bmad-output/.audit/audit.log)"
echo "Security Warnings: $(grep -c 'security.warning' _bmad-output/.audit/audit.log)"
echo "Auth Failures: $(grep -c 'auth.failure' _bmad-output/.audit/audit.log)"
echo "YOLO Invocations: $(grep -c 'yolo_invoked' _bmad-output/.audit/audit.log)"
echo "Access Denied: $(grep -c 'access.denied' _bmad-output/.audit/audit.log)"
```

---

## Monthly Tasks

### Full Security Review (1-2 hours)

#### Configuration Review

- [ ] Review RBAC configuration
  ```bash
  cat _bmad/core/security/rbac-config.yaml
  ```
  - Verify role definitions are appropriate
  - Check module restrictions are current
  - Confirm workflow restrictions are accurate

- [ ] Review authentication configuration
  ```bash
  cat _bmad/core/security/auth-config.yaml
  ```
  - Verify token expiration settings
  - Check session timeout values
  - Confirm allowed roles list

- [ ] Review hook configuration
  ```bash
  cat .claude/settings.json | jq '.hooks'
  ```
  - Verify all security validators are configured
  - Check for any disabled validators

#### Access Review

- [ ] Generate user access report
  ```bash
  # List all users with their roles
  for f in $(find . -name ".bmad-token" 2>/dev/null); do
    echo "Token: $f"
    node _bmad/core/security/validate-token.js "$f" 2>/dev/null | grep -E "User|Roles"
  done
  ```

- [ ] Verify least privilege principle
  - Each user should have minimum required access
  - Remove unused role assignments

- [ ] Review service accounts
  - Verify service accounts still needed
  - Rotate service account tokens

#### Encryption Key Review

- [ ] Verify encryption key age
  ```bash
  stat -f "%Sm" .bmad-key
  # Consider rotation if older than 90 days
  ```

- [ ] Verify key file permissions
  ```bash
  ls -la .bmad-key
  # Must be -rw------- (0600)
  ```

### Vulnerability Assessment (2 hours)

- [ ] Review validator code for vulnerabilities
  ```bash
  # Static analysis of Python validators
  bandit -r .claude/validators/ 2>/dev/null || echo "Install bandit: pip install bandit"
  ```

- [ ] Check for outdated dependencies
  ```bash
  npm audit 2>/dev/null
  pip check 2>/dev/null
  ```

- [ ] Review recent security advisories
  - Check BMAD-CYBER2 release notes
  - Review Claude Code security updates

### Log Retention Management (30 minutes)

- [ ] Archive old logs
  ```bash
  # Compress logs older than 30 days
  find _bmad-output/.audit/ -name "*.log" -mtime +30 -exec gzip {} \;
  ```

- [ ] Remove expired logs
  ```bash
  # Remove logs older than retention period (90 days)
  find _bmad-output/.audit/ -name "*.gz" -mtime +90 -delete
  ```

- [ ] Verify log storage usage
  ```bash
  du -sh _bmad-output/.audit/
  ```

### Documentation Review (30 minutes)

- [ ] Verify security documentation is current
- [ ] Update procedures that have changed
- [ ] Review and update emergency contacts
- [ ] Confirm incident response procedures are accurate

---

## Quarterly Tasks

### Key Rotation (1 hour)

- [ ] Notify all users of upcoming key rotation
- [ ] Schedule rotation window

- [ ] Execute key rotation
  ```bash
  # 1. Backup current key (encrypted)
  gpg -c .bmad-key -o .bmad-key.backup.gpg

  # 2. Generate new key
  rm .bmad-key
  node _bmad/core/security/generate-key.js

  # 3. Regenerate all user tokens
  # (coordinate with each user)
  node _bmad/core/security/quick-token.cjs "User1" "role1" 168
  node _bmad/core/security/quick-token.cjs "User2" "role2" 168
  # ...
  ```

- [ ] Verify all users can authenticate
- [ ] Securely delete backup after confirmation

### RBAC Policy Review (2 hours)

- [ ] Review all role definitions
  - Are roles still appropriate?
  - Should new roles be created?
  - Should existing roles be consolidated?

- [ ] Review module access policies
  - Are restrictions appropriate?
  - Have module requirements changed?

- [ ] Review workflow restrictions
  - Are high-sensitivity workflows properly protected?
  - Have new sensitive workflows been added?

- [ ] Update RBAC configuration as needed
- [ ] Document all changes

### Security Training Review (1 hour)

- [ ] Review security awareness status
  - Have all users completed security training?
  - Is training material current?

- [ ] Conduct tabletop exercise
  - Practice incident response procedures
  - Identify gaps in procedures

- [ ] Update training materials if needed

### Penetration Testing (4+ hours)

- [ ] Schedule penetration test
- [ ] Execute test scenarios:
  - [ ] Token bypass attempts
  - [ ] RBAC escalation attempts
  - [ ] Validator bypass attempts
  - [ ] Prompt injection attempts
  - [ ] Jailbreak attempts

- [ ] Document findings
- [ ] Remediate vulnerabilities
- [ ] Re-test after remediation

---

## Annual Tasks

### Full Security Audit (1-2 days)

- [ ] Engage third-party auditor (if required)
- [ ] Provide access to security configurations
- [ ] Facilitate testing activities
- [ ] Review audit findings
- [ ] Create remediation plan
- [ ] Execute remediations
- [ ] Obtain sign-off

### Policy Review (4 hours)

- [ ] Review security policies
  - Access control policy
  - Data handling policy
  - Incident response policy
  - Acceptable use policy

- [ ] Update policies as needed
- [ ] Obtain management approval
- [ ] Communicate changes to users

### Disaster Recovery Test (4 hours)

- [ ] Test backup restoration
  - Restore security configurations
  - Restore audit logs
  - Verify integrity

- [ ] Test key recovery procedures
- [ ] Document any issues
- [ ] Update procedures if needed

### Compliance Review (2-4 hours)

- [ ] Review compliance requirements
  - OWASP compliance
  - Industry-specific requirements
  - Organizational requirements

- [ ] Verify continued compliance
- [ ] Document compliance status
- [ ] Address any gaps

---

## Emergency Procedures

### Token Compromise Response

If a token is suspected compromised:

1. **Immediate:** Revoke the compromised token
   ```bash
   rm .bmad-token
   ```

2. **If key compromised:** Rotate encryption key
   ```bash
   rm .bmad-key
   node _bmad/core/security/generate-key.js
   ```

3. **Audit:** Review recent activity
   ```bash
   grep "$(date +%Y-%m-%d)" _bmad-output/.audit/audit.log | jq .
   ```

4. **Report:** Follow incident response procedures

### Validator Failure Response

If a validator is failing:

1. **Diagnose:** Test validator manually
   ```bash
   echo '{"tool_name": "Bash", "tool_input": {"command": "echo test"}}' | \
     python3 .claude/validators/<validator>.py
   ```

2. **Check logs:**
   ```bash
   tail -50 .claude/logs/validation.log
   ```

3. **Restore:** If corrupted, restore from git
   ```bash
   git checkout .claude/validators/<validator>.py
   ```

4. **Report:** Document the incident

### Audit Log Tampering Response

If hash chain is broken:

1. **Preserve evidence:**
   ```bash
   cp _bmad-output/.audit/audit.log /tmp/audit-evidence-$(date +%s).log
   ```

2. **Identify breach point:**
   ```bash
   python3 verify-audit-chain.py
   ```

3. **Report:** Escalate to security team immediately

4. **Investigate:** Determine scope of tampering

---

## Checklist Templates

### Daily Checklist (Copy for Use)

```
Date: _______________
Operator: _______________

[ ] Token validation passed
[ ] No security violations in last 24h
[ ] No unexpected auth failures
[ ] YOLO usage reviewed and justified
[ ] Signature: _______________
```

### Weekly Checklist (Copy for Use)

```
Week of: _______________
Operator: _______________

[ ] All validators healthy
[ ] Token rotation check complete
[ ] RBAC audit complete
[ ] Audit log integrity verified
[ ] Weekly metrics generated
[ ] Signature: _______________
```

### Monthly Checklist (Copy for Use)

```
Month: _______________
Operator: _______________

[ ] Full security review complete
[ ] Configuration review complete
[ ] Access review complete
[ ] Vulnerability assessment complete
[ ] Log retention management complete
[ ] Documentation review complete
[ ] Signature: _______________
[ ] Manager Approval: _______________
```

---

## Related Documentation

- [RBAC Operations Guide](RBAC-OPERATIONS-GUIDE.md) - Role and permission management
- [Token Management Guide](TOKEN-MANAGEMENT-GUIDE.md) - Authentication token procedures
- [Audit Log Guide](AUDIT-LOG-GUIDE.md) - Log interpretation and monitoring
- [Incident Response Runbook](../Operations/INCIDENT-RESPONSE-RUNBOOK.md) - Security incident handling
