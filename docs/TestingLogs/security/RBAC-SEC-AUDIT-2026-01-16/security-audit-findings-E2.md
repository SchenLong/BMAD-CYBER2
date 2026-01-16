# Epic 2: RBAC & Access Control Audit - FINDINGS

**Lead:** Sentinel (Compliance Guardian)
**Date:** 2026-01-16
**Status:** COMPLETE

---

## Executive Summary

**CRITICAL SECURITY GAP DISCOVERED**

The RBAC system is **fully designed and implemented** but **NOT ENFORCED**. The authorization code exists and works correctly when manually tested, but there is NO hook in the Claude Code settings that intercepts Skill/Agent invocations to perform RBAC checks.

**Impact:** Any authenticated user can bypass role restrictions and access ANY agent, workflow, or module regardless of their assigned role.

---

## CRITICAL FINDING: RBAC Not Enforced

### FINDING-2.0.1: RBAC Enforcement Gap - CRITICAL
**Verdict:** TRUE POSITIVE - Critical Security Vulnerability

**Evidence:**

1. **RBAC Configuration exists and is comprehensive:**
   - [rbac-config.yaml](_bmad/core/security/rbac-config.yaml) - 547 lines
   - 10 roles defined with inheritance
   - 8 module restrictions
   - 10 workflow restrictions
   - 5 agent restrictions
   - `deny_by_default: true` configured

2. **Authorization code is fully implemented:**
   - [authorization.js](_bmad/core/security/authorization.js) - 600 lines
   - `canAccessAgent()`, `canAccessModule()`, `canExecuteWorkflow()` methods
   - Role inheritance resolution
   - Wildcard pattern matching
   - Proper denial messages

3. **BUT: No enforcement hook exists:**
   - [settings.json](.claude/settings.json) has NO `Skill` matcher
   - No hook intercepts agent activation
   - No hook intercepts workflow execution
   - Authorization code is NEVER called during normal operation

**Attack Scenario:**
```
1. Attacker generates token with "developer" role (has access to bmm, bmgd, cis, core)
2. Attacker invokes: /skill:intel-team:workflows:operation-mosaic
3. Claude Code processes Skill tool use
4. NO hook intercepts to check RBAC
5. Operation-mosaic runs with full 11-agent intelligence collection
6. Attacker gains unauthorized access to sensitive intel workflows
```

**Current Hook Configuration (settings.json):**
```json
{
  "PreToolUse": [
    { "matcher": "Bash", "hooks": [...] },
    { "matcher": "Write", "hooks": [...] },
    { "matcher": "Edit", "hooks": [...] },
    { "matcher": "Read", "hooks": [...] },
    { "matcher": "Glob", "hooks": [...] },
    { "matcher": "Grep", "hooks": [...] }
    // NO "Skill" MATCHER!
  ]
}
```

**Impact:**
- **Severity:** CRITICAL
- **CVSS 3.1 Base Score:** 9.1 (Critical)
- **Attack Vector:** Network (authenticated)
- **Privileges Required:** Low (any valid token)
- **User Interaction:** None
- **Scope:** Changed (can access restricted modules)
- **Confidentiality Impact:** High
- **Integrity Impact:** High
- **Availability Impact:** None

**Remediation Required:**
1. Create `rbac_enforcer.py` validator
2. Add to settings.json with `"matcher": "Skill"` (or applicable hook point)
3. Validator must:
   - Load user claims from `.claude/.session_claims.json`
   - Parse skill name to extract module/workflow/agent
   - Call `AuthorizationManager.canExecuteWorkflow()` or appropriate method
   - Exit code 2 to block if denied

**Status:** 🔴 CRITICAL - Requires Immediate Remediation

---

## Story 2.1: Role Definition & Inheritance Review

**Files Reviewed:**
- [rbac-config.yaml](_bmad/core/security/rbac-config.yaml)
- [authorization.js](_bmad/core/security/authorization.js)

### Findings

#### FINDING-2.1.1: Role Definitions - PASS
**Verdict:** TRUE POSITIVE - Well Designed

**Evidence:**
```yaml
# rbac-config.yaml:23-307
roles:
  admin:           # Full unrestricted access
  security_lead:   # Inherits security_analyst
  security_analyst:
  intel_analyst:   # Requires credential verification
  legal_counsel:   # Privileged flag
  developer:
  product_manager:
  strategist:
  viewer:          # Read-only
  guest:           # Minimal, rate limited
```

**Analysis:**
- 10 roles properly defined
- Clear descriptions and permissions
- Appropriate separation of concerns
- Principle of least privilege followed

**Status:** ✅ SECURE (design)

---

#### FINDING-2.1.2: Role Inheritance - PASS
**Verdict:** TRUE POSITIVE - Implemented Correctly

**Evidence:**
```javascript
// authorization.js:178-209
resolveRole(roleName) {
  if (this.resolutionInProgress.has(roleName)) {
    throw new Error(`Circular role inheritance detected: ${roleName}`);
  }
  // ... merges inherited permissions
}
```

**Analysis:**
- Circular dependency detection implemented
- Permissions properly merged (union)
- Inheritance chain: security_lead → security_analyst

**Status:** ✅ SECURE (implementation)

---

#### FINDING-2.1.3: Default Role Assignment - PASS
**Verdict:** TRUE POSITIVE - Secure Default

**Evidence:**
```yaml
# rbac-config.yaml:14
default_role: viewer
```

**Analysis:**
- Default role is `viewer` (read-only)
- Not `guest` (which would be even more restrictive) but reasonable
- Follows principle of least privilege

**Status:** ✅ SECURE

---

#### FINDING-2.1.4: Deny by Default - PASS
**Verdict:** TRUE POSITIVE - Correct Security Posture

**Evidence:**
```yaml
# rbac-config.yaml:17
deny_by_default: true
```

**Analysis:**
- Explicit configuration for deny-by-default
- Code respects this flag in all permission checks
- No access granted unless explicitly permitted

**Status:** ✅ SECURE

---

## Story 2.2: Module Access Control Verification

### Findings

#### FINDING-2.2.1: Module Restrictions - PASS (Design)
**Verdict:** TRUE POSITIVE - Well Designed

**Evidence:**
```yaml
# rbac-config.yaml:315-377
module_restrictions:
  intel-team:
    require_roles: [intel_analyst, security_lead, admin]
    require_credential_verification: true
    audit_level: full
  legal-team:
    require_roles: [legal_counsel, admin]
    privileged: true
  cybersec-team:
    require_roles: [security_analyst, security_lead, admin]
```

**Analysis:**
- 8 modules have restrictions defined
- intel-team requires credential verification
- legal-team marked as privileged
- Appropriate roles assigned to each module

**Status:** ✅ SECURE (design) / 🔴 NOT ENFORCED (runtime)

---

#### FINDING-2.2.2: Module Check Implementation - PASS (Code)
**Verdict:** TRUE POSITIVE - Correctly Implemented

**Evidence:**
```javascript
// authorization.js:263-304
canAccessModule(user, moduleName) {
  const restriction = this.config.module_restrictions?.[moduleName];
  if (restriction) {
    const hasRequiredRole = user.roles.some(r =>
      restriction.require_roles.includes(r)
    );
    if (!hasRequiredRole) {
      return { allowed: false, reason: '...' };
    }
    if (restriction.require_credential_verification && !user.credentialVerified) {
      return { allowed: false, reason: '...' };
    }
  }
  // ... pattern matching
}
```

**Analysis:**
- Checks required roles
- Checks credential verification
- Returns structured denial with reason
- Pattern matching for module permissions

**Status:** ✅ SECURE (code) / 🔴 NOT ENFORCED (runtime)

---

## Story 2.3: Workflow Restriction Enforcement

### Findings

#### FINDING-2.3.1: Sensitive Workflow Restrictions - PASS (Design)
**Verdict:** TRUE POSITIVE - Appropriate Restrictions

**Evidence:**
```yaml
# rbac-config.yaml:383-459
workflow_restrictions:
  incident-response:
    require_roles: [security_lead, admin]
  operation-mosaic:
    require_roles: [intel_analyst, security_lead, admin]
    require_credential_verification: true
  approach-vector:
    require_roles: [intel_analyst, admin]
    require_credential_verification: true
  competitive-warfare:
    require_roles: [strategist, admin]
    require_approval: true
```

**Analysis:**
- 10 sensitive workflows have restrictions
- High-risk workflows require credential verification
- Some require explicit approval
- Full audit logging enabled for sensitive operations

**Status:** ✅ SECURE (design) / 🔴 NOT ENFORCED (runtime)

---

#### FINDING-2.3.2: Workflow Check Implementation - PASS (Code)
**Verdict:** TRUE POSITIVE - Correctly Implemented

**Evidence:**
```javascript
// authorization.js:356-414
canExecuteWorkflow(user, workflowName) {
  const restriction = this.config.workflow_restrictions?.[workflowName];
  if (restriction) {
    if (restriction.require_approval) {
      return { allowed: true, requires_approval: true, ... };
    }
  }
  // ... checks execute action permission
  // ... pattern matching
}
```

**Analysis:**
- Checks workflow restrictions
- Handles approval requirements
- Verifies execute action permission
- Pattern matching for workflow permissions

**Status:** ✅ SECURE (code) / 🔴 NOT ENFORCED (runtime)

---

## Story 2.4: Agent-Level Access Control

### Findings

#### FINDING-2.4.1: Sensitive Agent Restrictions - PASS (Design)
**Verdict:** TRUE POSITIVE - Appropriate Restrictions

**Evidence:**
```yaml
# rbac-config.yaml:466-520
agent_restrictions:
  intel-team/field-operative:
    require_roles: [intel_analyst, security_lead, admin]
    require_credential_verification: true
  intel-team/humint-specialist:
    require_roles: [intel_analyst, security_lead, admin]
    require_credential_verification: true
  intel-team/dark-web-analyst:
    require_credential_verification: true
  cybersec-team/red-team-operator:
    require_roles: [security_analyst, security_lead, admin]
  cybersec-team/social-engineer:
    require_roles: [security_analyst, security_lead, admin]
```

**Analysis:**
- 5 high-risk agents have explicit restrictions
- HUMINT and field operations require credential verification
- Red team and social engineering require security roles
- Warning messages provided

**Status:** ✅ SECURE (design) / 🔴 NOT ENFORCED (runtime)

---

#### FINDING-2.4.2: Agent Check Implementation - PASS (Code)
**Verdict:** TRUE POSITIVE - Correctly Implemented

**Evidence:**
```javascript
// authorization.js:306-354
canAccessAgent(user, agentPath) {
  const moduleName = agentPath.split('/')[0];
  const moduleResult = this.canAccessModule(user, moduleName);
  if (!moduleResult.allowed) {
    return moduleResult;
  }
  const agentRestriction = this.config.agent_restrictions?.[agentPath];
  // ... checks agent-specific restrictions
}
```

**Analysis:**
- First checks module access (layered security)
- Then checks agent-specific restrictions
- Credential verification enforced
- Warning messages included

**Status:** ✅ SECURE (code) / 🔴 NOT ENFORCED (runtime)

---

## Story 2.5: Wildcard & Permission Resolution

### Findings

#### FINDING-2.5.1: Wildcard Pattern Matching - PASS
**Verdict:** TRUE POSITIVE - Correctly Implemented

**Evidence:**
```javascript
// authorization.js:221-243
matchesPattern(value, patterns) {
  for (const pattern of patterns) {
    if (pattern === '*') return true;
    if (pattern.endsWith('/*')) {
      const prefix = pattern.slice(0, -2);
      if (value.startsWith(prefix + '/') || value === prefix) {
        return true;
      }
    }
    if (pattern.endsWith('*') && !pattern.endsWith('/*')) {
      const prefix = pattern.slice(0, -1);
      if (value.startsWith(prefix)) {
        return true;
      }
    }
    if (pattern === value) return true;
  }
  return false;
}
```

**Analysis:**
- Supports `*` (match all)
- Supports `module/*` (all in module)
- Supports `prefix-*` (prefix matching)
- Supports exact match
- No regex injection vulnerability (simple string matching)

**Status:** ✅ SECURE

---

#### FINDING-2.5.2: Effective Permissions Merge - PASS
**Verdict:** TRUE POSITIVE - Correctly Implemented

**Evidence:**
```javascript
// authorization.js:245-261
getEffectivePermissions(userRoles) {
  let effective = { agents: [], workflows: [], modules: [], actions: [] };
  for (const role of userRoles) {
    const permissions = this.resolvedRoles.get(role);
    if (permissions) {
      effective = this.mergePermissions(effective, permissions);
    }
  }
  return effective;
}
```

**Analysis:**
- Properly merges permissions from all user roles
- Uses Set to deduplicate (via mergePermissions)
- Pre-resolved role permissions for performance

**Status:** ✅ SECURE

---

## Additional Findings

### FINDING-2.6.1: Validation Tests Pass But Manual
**Verdict:** TRUE POSITIVE - False Sense of Security

**Evidence:**
From `docs/TestingLogs/security/2026-01-15/rbac-validation-report.md`:
- 40 tests, all pass
- Tests call `check-authorization.js` manually
- Tests prove code WORKS when called
- Tests do NOT prove code IS called during normal operation

**Analysis:**
- Tests create false confidence
- Need integration tests that verify enforcement hook

**Status:** ⚠️ MODERATE - Tests need enhancement

---

### FINDING-2.6.2: Session Claims Available for Enforcement
**Verdict:** TRUE POSITIVE - Infrastructure Ready

**Evidence:**
```python
# token_validator.py:89-94
def save_session_claims(claims: Dict) -> None:
    with open(SESSION_CLAIMS_FILE, 'w') as f:
        json.dump(claims, f)
    os.chmod(SESSION_CLAIMS_FILE, 0o600)
```

File: `.claude/.session_claims.json`

**Analysis:**
- User claims (including roles) are saved at session start
- File is properly secured (600 permissions)
- Available for RBAC enforcer to read
- Infrastructure is ready, just needs the enforcer hook

**Status:** ✅ Ready for integration

---

## Summary: Epic 2 Findings

### Critical Findings (Require Immediate Remediation)
| ID | Finding | Severity | Status |
|----|---------|----------|--------|
| 2.0.1 | RBAC Not Enforced - No Skill Hook | CRITICAL | 🔴 REQUIRES IMMEDIATE ACTION |

### Design/Implementation Pass (But Not Enforced)
| Component | Design | Implementation | Enforcement |
|-----------|--------|----------------|-------------|
| Role Definitions | ✅ | ✅ | 🔴 Not enforced |
| Role Inheritance | ✅ | ✅ | 🔴 Not enforced |
| Module Restrictions | ✅ | ✅ | 🔴 Not enforced |
| Workflow Restrictions | ✅ | ✅ | 🔴 Not enforced |
| Agent Restrictions | ✅ | ✅ | 🔴 Not enforced |
| Wildcard Matching | ✅ | ✅ | 🔴 Not enforced |
| Deny by Default | ✅ | ✅ | 🔴 Not enforced |

### Moderate/Low Findings
| ID | Finding | Severity | Status |
|----|---------|----------|--------|
| 2.6.1 | Tests create false confidence | MODERATE | ⚠️ Enhance tests |

---

## Remediation Plan for FINDING-2.0.1

### Step 1: Create RBAC Enforcer Validator

Create `.claude/validators/rbac_enforcer.py`:

```python
#!/usr/bin/env python3
"""
BMAD Guardrails: RBAC Enforcer
==============================
Enforces role-based access control on Skill/Agent invocations.
"""

import json
import sys
import os
import subprocess

PROJECT_DIR = os.environ.get('CLAUDE_PROJECT_DIR', os.getcwd())
SESSION_CLAIMS_FILE = os.path.join(PROJECT_DIR, '.claude', '.session_claims.json')
AUTH_SCRIPT = os.path.join(PROJECT_DIR, '_bmad/core/security/check-authorization.js')

def get_user_context():
    """Load user claims from session."""
    try:
        with open(SESSION_CLAIMS_FILE, 'r') as f:
            return json.load(f)
    except Exception:
        return None

def check_authorization(resource_type, resource_name, user_roles):
    """Call authorization check script."""
    result = subprocess.run(
        ['node', AUTH_SCRIPT, resource_type, resource_name, '--roles', ','.join(user_roles)],
        capture_output=True,
        text=True,
        cwd=PROJECT_DIR
    )
    return result.returncode == 0, result.stdout, result.stderr

def main():
    # Parse tool input
    tool_input = json.loads(sys.stdin.read())
    skill_name = tool_input.get('skill', '')

    # Parse skill name: bmad:module:type:name
    parts = skill_name.split(':')
    if len(parts) >= 3:
        module = parts[1] if parts[0] == 'bmad' else parts[0]
        resource_type = parts[-2] if len(parts) >= 3 else 'workflows'
        resource_name = parts[-1]
    else:
        # Can't parse, allow (fail open for now)
        sys.exit(0)

    # Get user context
    user = get_user_context()
    if not user:
        print("RBAC: No user context found", file=sys.stderr)
        sys.exit(2)

    roles = user.get('roles', [])

    # Check authorization
    if resource_type in ['agents', 'agent']:
        authorized, _, _ = check_authorization('agent', f'{module}/{resource_name}', roles)
    elif resource_type in ['workflows', 'workflow']:
        authorized, _, _ = check_authorization('workflow', resource_name, roles)
    else:
        authorized, _, _ = check_authorization('module', module, roles)

    if not authorized:
        print(f"RBAC: Access denied to {skill_name}", file=sys.stderr)
        print(f"       Your roles: {', '.join(roles)}", file=sys.stderr)
        sys.exit(2)

    sys.exit(0)

if __name__ == '__main__':
    main()
```

### Step 2: Add to settings.json

```json
{
  "PreToolUse": [
    {
      "matcher": "Skill",
      "hooks": [
        {
          "type": "command",
          "command": "python3 \"$CLAUDE_PROJECT_DIR\"/.claude/validators/rbac_enforcer.py"
        }
      ]
    },
    // ... existing hooks
  ]
}
```

### Step 3: Test Enforcement

1. Generate developer token
2. Attempt to invoke intel-team workflow
3. Verify access denied

---

## Next Steps

1. **REMEDIATE:** Create rbac_enforcer.py (CRITICAL)
2. **REMEDIATE:** Add Skill hook to settings.json (CRITICAL)
3. **TEST:** Verify enforcement works end-to-end
4. **ENHANCE:** Add integration tests for enforcement
5. **PROCEED:** Continue to Epic 3 (Shell Injection Audit)

---

*Audit conducted by Sentinel (Compliance Guardian)*
*BMAD-RBAC-SEC-AUDIT - Epic 2 - 2026-01-16*
