# Incident Response Runbook

> **Version:** 1.0
> **Last Updated:** 2026-01-16
> **Audience:** Security Officers, SOC Analysts, System Administrators

---

## Overview

This runbook provides step-by-step procedures for handling security incidents in BMAD-CYBER2. It covers detection, containment, eradication, recovery, and post-incident activities.

---

## Incident Classification

### Severity Levels

| Level | Name | Description | Response Time | Examples |
|-------|------|-------------|---------------|----------|
| P1 | Critical | Active breach, data exfiltration, complete system compromise | Immediate (< 15 min) | Token stolen, encryption key compromised, audit log tampering |
| P2 | High | Attempted breach, security control bypass, unauthorized access | < 1 hour | Failed privilege escalation, validator bypass attempt, brute force attack |
| P3 | Medium | Security policy violation, suspicious activity | < 4 hours | YOLO mode abuse, unusual access patterns, policy violations |
| P4 | Low | Minor security issues, false positives | < 24 hours | Expired token usage, misconfiguration, log anomalies |

### Incident Categories

| Category | Description | Examples |
|----------|-------------|----------|
| **Authentication** | Token/credential-related incidents | Token theft, expired credentials, brute force |
| **Authorization** | Access control violations | Privilege escalation, RBAC bypass, unauthorized module access |
| **Data Protection** | Data handling violations | PII exposure, secrets in code, data exfiltration |
| **Integrity** | System tampering | Audit log modification, validator tampering, config changes |
| **Availability** | Service disruption | Rate limit abuse, resource exhaustion, DoS |
| **Compliance** | Policy/regulatory violations | YOLO abuse, audit gaps, retention violations |

---

## Initial Response Procedures

### Step 1: Detection and Triage (0-15 minutes)

**Detect the Incident:**

```bash
# Check for recent security events
grep -E "violation|warning|failure|denied" _bmad-output/.audit/audit.log | tail -20

# Check current security status
node _bmad/core/security/validate-token.js

# Review validator logs
tail -50 .claude/logs/security.log
```

**Classify the Incident:**

1. Determine severity (P1-P4)
2. Identify incident category
3. Note affected systems/users

**Initial Documentation:**

```markdown
## Incident Report - Initial

Date/Time Detected: [TIMESTAMP]
Detected By: [NAME]
Detection Method: [How was it found?]

Severity: P[1-4]
Category: [Auth/Authz/Data/Integrity/Availability/Compliance]

Initial Description:
[What happened? What systems/users affected?]

Initial Evidence:
[Relevant log entries, screenshots, etc.]
```

### Step 2: Immediate Containment (15-60 minutes)

**For P1 (Critical) Incidents:**

```bash
# 1. Revoke all tokens immediately
rm .bmad-token
rm .bmad-key

# 2. Preserve evidence
mkdir -p /tmp/incident-$(date +%s)
cp -r _bmad-output/.audit /tmp/incident-$(date +%s)/
cp -r .claude/logs /tmp/incident-$(date +%s)/

# 3. Regenerate encryption key
node _bmad/core/security/generate-key.js

# 4. Enable enhanced logging (if not already)
# Edit _bmad/core/config.yaml to enable all event types
```

**For P2 (High) Incidents:**

```bash
# 1. Revoke affected user's token
# (User must regenerate their token)

# 2. Preserve relevant logs
grep "[AFFECTED_USER]" _bmad-output/.audit/audit.log > /tmp/user-activity.log

# 3. Review and block attack vector
# (Specific to incident type)
```

**For P3/P4 Incidents:**

```bash
# 1. Document the incident
# 2. Preserve relevant evidence
# 3. Continue to investigation phase
```

---

## Incident-Specific Playbooks

### Playbook: Token Compromise

**Indicators:**
- Unexpected token usage from different location
- Token used outside normal hours
- Simultaneous sessions from multiple IPs

**Response:**

```bash
# 1. IMMEDIATE: Revoke compromised token
rm .bmad-token

# 2. Check for unauthorized activity
grep "[COMPROMISED_USER]" _bmad-output/.audit/audit.log | \
  jq '{time: .timestamp, event: .event_type, details: .details}'

# 3. Identify attack timeline
grep "[COMPROMISED_USER]" _bmad-output/.audit/audit.log | head -1  # First activity
grep "[COMPROMISED_USER]" _bmad-output/.audit/audit.log | tail -1  # Last activity

# 4. Check for privilege escalation attempts
grep "[COMPROMISED_USER]" _bmad-output/.audit/audit.log | grep -i "admin\|escalat\|role"

# 5. Check for data access
grep "[COMPROMISED_USER]" _bmad-output/.audit/audit.log | grep -i "read\|write\|export"

# 6. If key might be compromised - rotate all tokens
rm .bmad-key
node _bmad/core/security/generate-key.js
# Regenerate tokens for all legitimate users

# 7. Document findings and timeline
```

**Recovery:**

1. Generate new token for legitimate user with minimum required permissions
2. Monitor for any repeat attacks
3. Conduct root cause analysis

---

### Playbook: RBAC Bypass Attempt

**Indicators:**
- `access.denied` events followed by successful access
- Unexpected module/workflow access
- Role assignment outside normal process

**Response:**

```bash
# 1. Identify the bypass attempt
grep "access.denied" _bmad-output/.audit/audit.log | tail -20

# 2. Check for successful unauthorized access
grep "[SUSPECTED_USER]" _bmad-output/.audit/audit.log | grep -v "denied" | tail -20

# 3. Review current role assignments
node _bmad/core/security/check-authorization.js

# 4. Verify RBAC configuration integrity
diff _bmad/core/security/rbac-config.yaml <(git show HEAD:_bmad/core/security/rbac-config.yaml)

# 5. If bypass confirmed - revoke user access
rm .bmad-token  # Or targeted revocation

# 6. Review and strengthen RBAC rules
vim _bmad/core/security/rbac-config.yaml
```

**Recovery:**

1. Restore RBAC configuration if tampered
2. Reassign appropriate roles
3. Enhance monitoring for RBAC events

---

### Playbook: Validator Bypass

**Indicators:**
- Dangerous commands executed without blocking
- Security events missing from logs
- Validator errors in logs

**Response:**

```bash
# 1. Check validator integrity
for f in .claude/validators/*.py; do
    md5sum "$f"
done > /tmp/current-validators.md5

# Compare with known-good checksums
diff /tmp/current-validators.md5 /path/to/known-good-validators.md5

# 2. Test critical validators
echo '{"tool_name": "Bash", "tool_input": {"command": "rm -rf /"}}' | \
  python3 .claude/validators/bash_safety.py
# Should exit with code 2 (block)

# 3. Check hook configuration
cat .claude/settings.json | jq '.hooks'

# 4. Restore validators if tampered
git checkout .claude/validators/
git checkout .claude/settings.json

# 5. Review what commands were executed
grep "Bash" _bmad-output/.audit/audit.log | jq '.details.command'
```

**Recovery:**

1. Restore all validators from known-good source
2. Verify hook configuration
3. Audit all commands executed during bypass window

---

### Playbook: Audit Log Tampering

**Indicators:**
- Hash chain broken
- Log file timestamp anomalies
- Missing expected events

**Response:**

```bash
# 1. IMMEDIATELY preserve evidence
cp _bmad-output/.audit/audit.log /secure/evidence/audit-$(date +%s).log
chmod 400 /secure/evidence/audit-*.log

# 2. Verify hash chain and find break point
python3 << 'EOF'
import json
prev = "GENESIS"
with open("_bmad-output/.audit/audit.log") as f:
    for i, line in enumerate(f, 1):
        entry = json.loads(line)
        if entry.get("prev_hash") != prev:
            print(f"CHAIN BROKEN at line {i}")
            print(f"Expected prev_hash: {prev}")
            print(f"Found prev_hash: {entry.get('prev_hash')}")
            break
        prev = entry.get("hash", "")
    else:
        print(f"Chain intact: {i} entries")
EOF

# 3. Check file timestamps
stat _bmad-output/.audit/audit.log
ls -la _bmad-output/.audit/

# 4. Compare with backups (if available)
diff _bmad-output/.audit/audit.log /backup/audit.log

# 5. Review who had access
grep "file.write\|file.delete" _bmad-output/.audit/audit.log | grep -i audit
```

**Recovery:**

1. Restore from last known-good backup
2. Rotate all credentials (attacker may have observed them)
3. Enhance audit log protection (remote logging, immutable storage)

---

### Playbook: Jailbreak/Prompt Injection

**Indicators:**
- Unusual agent behavior
- Unexpected file modifications
- Security validator blocks with injection patterns

**Response:**

```bash
# 1. Review blocked attempts
grep "jailbreak\|injection" .claude/logs/security.log | tail -20

# 2. Check for successful bypasses
grep "prompt\|jailbreak" _bmad-output/.audit/audit.log | \
  grep -v "blocked\|denied"

# 3. Review recent user prompts (if logged)
grep "UserPromptSubmit" .claude/logs/*.log | tail -50

# 4. Check for unexpected file modifications
git status
git diff

# 5. Review agent outputs for anomalies
grep "agent.tool_use" _bmad-output/.audit/audit.log | tail -50 | jq .
```

**Recovery:**

1. Revert any unauthorized changes
2. Strengthen input validation rules
3. Update jailbreak detection patterns

---

### Playbook: YOLO Mode Abuse

**Indicators:**
- Frequent YOLO invocations
- YOLO used for high-risk operations
- YOLO used outside normal procedures

**Response:**

```bash
# 1. Audit all YOLO usage
grep "yolo" _bmad-output/.audit/audit.log | jq '{
  time: .timestamp,
  user: .user,
  workflow: .workflow,
  details: .details
}'

# 2. Identify user with most YOLO usage
grep "yolo_invoked" _bmad-output/.audit/audit.log | \
  jq -r '.user' | sort | uniq -c | sort -rn

# 3. Review what operations were performed in YOLO mode
grep "yolo_invoked" _bmad-output/.audit/audit.log -A5 | jq .

# 4. Check for policy violations
# Compare YOLO usage against acceptable use policy
```

**Recovery:**

1. Review and revoke YOLO permissions if abused
2. Update YOLO policies
3. Implement additional YOLO restrictions if needed

---

## Evidence Collection

### What to Collect

| Evidence Type | Location | Command |
|---------------|----------|---------|
| Audit Logs | `_bmad-output/.audit/` | `cp -r _bmad-output/.audit/ /evidence/` |
| Security Logs | `.claude/logs/` | `cp -r .claude/logs/ /evidence/` |
| Validator State | `.claude/*.json` | `cp .claude/*.json /evidence/` |
| Git History | `.git/` | `git log --oneline -50 > /evidence/git.log` |
| File Changes | Working directory | `git diff > /evidence/changes.diff` |
| Token Info | `.bmad-token` | `node validate-token.js > /evidence/token.log` |
| System Info | OS | `uname -a > /evidence/system.log` |

### Evidence Preservation

```bash
#!/bin/bash
# collect-evidence.sh

EVIDENCE_DIR="/secure/evidence/incident-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$EVIDENCE_DIR"

# Collect with checksums
cp _bmad-output/.audit/audit.log "$EVIDENCE_DIR/"
cp -r .claude/logs "$EVIDENCE_DIR/"
cp .claude/*.json "$EVIDENCE_DIR/" 2>/dev/null
git log --oneline -100 > "$EVIDENCE_DIR/git-history.log"
git diff > "$EVIDENCE_DIR/uncommitted-changes.diff"
env > "$EVIDENCE_DIR/environment.log"
ps aux > "$EVIDENCE_DIR/processes.log"

# Generate checksums
cd "$EVIDENCE_DIR"
sha256sum * > checksums.sha256

# Make read-only
chmod -R 400 "$EVIDENCE_DIR"

echo "Evidence collected to: $EVIDENCE_DIR"
```

---

## Communication Templates

### Initial Notification (P1/P2)

```
Subject: [INCIDENT] Security Incident - [SEVERITY] - [BRIEF DESCRIPTION]

Priority: [P1/P2]
Status: Active - Containment in Progress

Incident Summary:
- Detected: [DATE/TIME]
- Category: [Category]
- Affected: [Systems/Users]

Current Actions:
- [What's being done right now]

Impact:
- [Business/operational impact]

Next Update: [TIME]

Contact: [Incident Lead Name] - [Contact Info]
```

### Status Update

```
Subject: [UPDATE] Security Incident - [SEVERITY] - [BRIEF DESCRIPTION]

Priority: [P1/P2]
Status: [Contained/Investigating/Recovering/Resolved]

Progress Since Last Update:
- [Actions taken]
- [Findings]

Current Status:
- [What's happening now]

Timeline:
- [Key events and times]

Next Steps:
- [Planned actions]

Next Update: [TIME]
```

### Resolution Notice

```
Subject: [RESOLVED] Security Incident - [BRIEF DESCRIPTION]

Incident Closed: [DATE/TIME]

Summary:
- Incident: [What happened]
- Root Cause: [Why it happened]
- Impact: [What was affected]
- Duration: [Total incident time]

Actions Taken:
- [Containment actions]
- [Eradication actions]
- [Recovery actions]

Preventive Measures:
- [What's being done to prevent recurrence]

Post-Incident Review: [Scheduled date/time]
```

---

## Post-Incident Activities

### Immediate (Within 24 hours)

- [ ] Verify all systems restored to normal operation
- [ ] Confirm no ongoing threat activity
- [ ] Complete initial incident documentation
- [ ] Notify all stakeholders of resolution

### Short-term (Within 1 week)

- [ ] Conduct post-incident review meeting
- [ ] Complete root cause analysis
- [ ] Document lessons learned
- [ ] Create remediation action items
- [ ] Update detection/prevention measures

### Long-term (Within 1 month)

- [ ] Implement preventive measures
- [ ] Update incident response procedures
- [ ] Conduct additional training if needed
- [ ] Verify remediation effectiveness
- [ ] Close incident formally

### Post-Incident Review Agenda

```markdown
## Post-Incident Review

Date: [DATE]
Incident: [ID/Name]
Attendees: [List]

### Timeline Review
- When was it detected?
- How was it detected?
- What was the response timeline?

### Root Cause Analysis
- What was the root cause?
- What conditions enabled the incident?
- Were there warning signs we missed?

### Response Evaluation
- What worked well?
- What could be improved?
- Were procedures followed?

### Lessons Learned
1. [Lesson 1]
2. [Lesson 2]
3. [Lesson 3]

### Action Items
| Action | Owner | Due Date |
|--------|-------|----------|
| | | |

### Procedure Updates
- [Changes to make to this runbook]
```

---

## Quick Reference

### Emergency Contacts

| Role | Name | Contact |
|------|------|---------|
| Security Lead | [NAME] | [EMAIL/PHONE] |
| System Admin | [NAME] | [EMAIL/PHONE] |
| On-Call | [ROTATION] | [PAGER] |
| Management | [NAME] | [EMAIL] |

### Critical Commands

```bash
# Revoke all access immediately
rm .bmad-token .bmad-key

# Preserve evidence
cp -r _bmad-output/.audit /secure/evidence/

# Check for compromise
grep "violation\|warning" _bmad-output/.audit/audit.log | tail -20

# Verify system integrity
git status
git diff

# Regenerate security tokens
node _bmad/core/security/generate-key.js
node _bmad/core/security/generate-token.js
```

### Severity Decision Matrix

| Impact \ Urgency | Low | Medium | High |
|------------------|-----|--------|------|
| **Low** | P4 | P4 | P3 |
| **Medium** | P4 | P3 | P2 |
| **High** | P3 | P2 | P1 |
| **Critical** | P2 | P1 | P1 |

---

## Related Documentation

- [RBAC Operations Guide](../Security/RBAC-OPERATIONS-GUIDE.md) - Role management
- [Token Management Guide](../Security/TOKEN-MANAGEMENT-GUIDE.md) - Token procedures
- [Audit Log Guide](../Security/AUDIT-LOG-GUIDE.md) - Log interpretation
- [Security Maintenance Checklist](../Security/SECURITY-MAINTENANCE-CHECKLIST.md) - Regular maintenance
