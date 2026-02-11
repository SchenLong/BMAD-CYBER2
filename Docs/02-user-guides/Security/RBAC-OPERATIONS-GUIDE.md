# RBAC Operations Guide

> **Version:** 1.0
> **Last Updated:** 2026-01-16
> **Audience:** System Administrators, Security Officers

---

## Overview

BMAD-CYBER2 implements Role-Based Access Control (RBAC) to manage access to modules, agents, and workflows. This guide covers operational procedures for role assignment, permission management, and authorization troubleshooting.

**Key Principles:**

- **Deny by Default** - All access is denied unless explicitly granted
- **Role Inheritance** - Roles can inherit permissions from parent roles
- **Module-Level Gating** - Coarse-grained control at module level
- **Fine-Grained Restrictions** - Specific workflows can have additional requirements

---

## Available Roles

### Role Hierarchy

```
                    ┌─────────┐
                    │  admin  │ ← Full access to all modules
                    └────┬────┘
                         │
          ┌──────────────┼──────────────┐
          │              │              │
    ┌─────┴─────┐  ┌─────┴─────┐  ┌─────┴─────┐
    │ security  │  │   intel   │  │   legal   │
    │   lead    │  │  analyst  │  │  counsel  │
    └─────┬─────┘  └───────────┘  └───────────┘
          │
    ┌─────┴─────┐
    │ security  │
    │  analyst  │
    └───────────┘
```

### Role Reference Table

| Role | Access Level | Module Access | Special Requirements |
|------|-------------|---------------|---------------------|
| `admin` | Full | All modules (`*`) | Can modify RBAC config |
| `security_lead` | High | cybersec-team, intel-team, core | Inherits security_analyst |
| `security_analyst` | High | cybersec-team, core | - |
| `intel_analyst` | High | intel-team, core | Credential verification required |
| `legal_counsel` | Medium | legal-team, core | Privileged content flag |
| `developer` | Medium | bmm, bmgd, bmb, cis, core | - |
| `product_manager` | Medium | bmm, cis, core | - |
| `strategist` | Medium | strategy-team, core | - |
| `viewer` | Low | core | Read-only, no execution |
| `guest` | Minimal | core | Rate-limited, short session |

---

## Role Assignment Procedures

### Assigning a Role to a New User

**Step 1: Generate Authentication Token with Role**

```bash
# Interactive method (recommended for first-time setup)
node _bmad/core/security/generate-token.js

# Quick method for subsequent users
node _bmad/core/security/quick-token.cjs "UserName" "role_name" [hours]

# Examples:
node _bmad/core/security/quick-token.cjs "Alice" "developer" 168
node _bmad/core/security/quick-token.cjs "Bob" "security_analyst" 24
node _bmad/core/security/quick-token.cjs "Carol" "admin" 8
```

**Step 2: Verify Token Creation**

```bash
# Validate the generated token
node _bmad/core/security/validate-token.js
```

**Step 3: Confirm Role Assignment**

```bash
# Check current user's permissions
node _bmad/core/security/check-authorization.js

# Verify specific role was assigned
node _bmad/core/security/check-authorization.js roles
```

### Changing a User's Role

To change a user's role, you must regenerate their token:

```bash
# Generate new token with updated role
node _bmad/core/security/quick-token.cjs "UserName" "new_role" 168

# Verify the change
node _bmad/core/security/check-authorization.js
```

**Note:** The old token is automatically invalidated when a new token is generated for the same user.

### Assigning Multiple Roles

Users can have multiple roles for cross-functional access:

```bash
# During interactive token generation, select multiple roles
node _bmad/core/security/generate-token.js

# When prompted for roles, enter comma-separated list:
# > Enter roles: developer,product_manager
```

---

## Permission Management

### Checking User Permissions

**View All Permissions:**

```bash
node _bmad/core/security/check-authorization.js
```

**Check Module Access:**

```bash
node _bmad/core/security/check-authorization.js module intel-team
node _bmad/core/security/check-authorization.js module cybersec-team
```

**Check Workflow Access:**

```bash
node _bmad/core/security/check-authorization.js workflow operation-mosaic
node _bmad/core/security/check-authorization.js workflow incident-response
```

**Check Agent Access:**

```bash
node _bmad/core/security/check-authorization.js agent intel-team/osint-lead
node _bmad/core/security/check-authorization.js agent cybersec-team/red-team-lead
```

### Module Restrictions

Different modules have different access requirements:

| Module | Required Roles | Additional Requirements |
|--------|---------------|------------------------|
| `core` | Any role | None |
| `cybersec-team` | security_analyst, security_lead, admin | None |
| `intel-team` | intel_analyst, security_lead, admin | Credential verification |
| `legal-team` | legal_counsel, admin | Privileged content flag |
| `strategy-team` | strategist, admin | None |
| `bmm` | developer, product_manager, admin | None |
| `bmgd` | developer, admin | None |
| `bmb` | developer, admin | None |
| `cis` | developer, product_manager, admin | None |

### Workflow-Specific Restrictions

Certain high-sensitivity workflows have additional requirements:

| Workflow | Required Roles | Additional Requirements |
|----------|---------------|------------------------|
| `operation-mosaic` | intel_analyst | Credential verification + Full audit |
| `approach-vector` | intel_analyst | Credential verification |
| `incident-response` | security_lead | Full audit |
| `counter-intel-audit` | security_lead | Full audit |
| `secure-software` | security_analyst | None |
| `compliance-first` | legal_counsel | None |

---

## RBAC Configuration

### Configuration File Location

```
_bmad/core/security/rbac-config.yaml
```

### Configuration Structure

```yaml
rbac:
  enabled: true
  default_role: viewer
  deny_by_default: true

  roles:
    admin:
      description: "Full system access"
      permissions:
        actions: ["*"]
        agents: ["*"]
        workflows: ["*"]
      modules: ["*"]

    developer:
      description: "Development team access"
      permissions:
        actions: ["read", "write", "execute"]
        agents: ["bmm/*", "bmgd/*", "bmb/*", "cis/*", "core/*"]
        workflows: ["bmm/*", "bmgd/*", "bmb/*", "cis/*", "core/*"]
      modules: ["bmm", "bmgd", "bmb", "cis", "core"]

  module_restrictions:
    intel-team:
      require_roles: [intel_analyst, security_lead, admin]
      require_credential_verification: true
      audit_level: full

  workflow_restrictions:
    operation-mosaic:
      require_roles: [intel_analyst]
      require_credential_verification: true
      audit_level: full
```

### Modifying RBAC Configuration

**Prerequisites:**

- Must have `admin` role
- Changes require service restart

**Procedure:**

1. **Edit Configuration:**

   ```bash
   # Edit the RBAC config file
   vim _bmad/core/security/rbac-config.yaml
   ```

2. **Validate Configuration:**

   ```bash
   # Check YAML syntax
   python3 -c "import yaml; yaml.safe_load(open('_bmad/core/security/rbac-config.yaml'))"
   ```

3. **Test Changes:**

   ```bash
   # Verify role definitions
   node _bmad/core/security/check-authorization.js roles
   ```

4. **Document Changes:**
   - Update this operations guide if roles change
   - Notify affected users
   - Log change in security audit

---

## Common Operations

### Onboarding a New Team Member

```bash
# 1. Determine appropriate role based on team
#    - Development: developer
#    - Security: security_analyst or security_lead
#    - Intel: intel_analyst
#    - Legal: legal_counsel
#    - Product: product_manager
#    - Strategy: strategist

# 2. Generate token with appropriate role
node _bmad/core/security/quick-token.cjs "NewUser" "developer" 168

# 3. Provide token file to user (.bmad-token)
# 4. Verify access
node _bmad/core/security/check-authorization.js
```

### Offboarding a Team Member

```bash
# 1. Remove token file
rm .bmad-token

# 2. Regenerate encryption key (if security concern)
rm .bmad-key
node _bmad/core/security/generate-key.js

# 3. Regenerate tokens for remaining users
# All existing tokens are now invalid
```

### Temporary Elevated Access

For temporary elevated access (e.g., incident response):

```bash
# 1. Generate temporary token with elevated role
node _bmad/core/security/quick-token.cjs "User" "security_lead" 4  # 4 hours

# 2. Document the elevation in security log
# 3. After incident, regenerate normal token
node _bmad/core/security/quick-token.cjs "User" "security_analyst" 168
```

### Viewing All Defined Roles

```bash
node _bmad/core/security/check-authorization.js roles
```

---

## Troubleshooting

### Common Issues

**Issue: "Access Denied" for Module**

```bash
# Check current role
node _bmad/core/security/check-authorization.js

# Check module requirements
node _bmad/core/security/check-authorization.js module <module-name>

# Solution: Assign user a role with module access
```

**Issue: "Credential Verification Required"**

Some modules (intel-team) require credential verification:

```bash
# Ensure token was generated with verification flag
node _bmad/core/security/generate-token.js
# Select "Yes" for credential verification when prompted
```

**Issue: Token Invalid or Expired**

```bash
# Validate token
node _bmad/core/security/validate-token.js

# Regenerate if expired
node _bmad/core/security/quick-token.cjs "User" "role" 168
```

**Issue: Permission Denied for Workflow**

```bash
# Check workflow restrictions
node _bmad/core/security/check-authorization.js workflow <workflow-name>

# Verify user has required role AND any additional requirements
```

### Debugging Authorization

Enable verbose authorization logging:

```bash
export BMAD_AUTH_DEBUG=true
node _bmad/core/security/check-authorization.js workflow operation-mosaic
```

### Audit Trail

All authorization decisions are logged:

```bash
# View recent authorization events
tail -50 .claude/logs/security.log | grep "authorization"

# View denied access attempts
grep "DENIED" .claude/logs/security.log
```

---

## Best Practices

### Principle of Least Privilege

- Assign the minimum role required for job function
- Use `viewer` for read-only access needs
- Avoid assigning `admin` unless absolutely necessary

### Role Assignment Guidelines

| Job Function | Recommended Role |
|--------------|-----------------|
| DevOps Engineer | developer |
| Security Engineer | security_analyst |
| SOC Manager | security_lead |
| Intelligence Analyst | intel_analyst |
| Legal Counsel | legal_counsel |
| Product Manager | product_manager |
| Executive | strategist |
| Auditor | viewer |
| Contractor | guest |

### Token Expiration Policy

| Role | Recommended Max Duration |
|------|-------------------------|
| admin | 8 hours (session-based) |
| security_lead | 24 hours |
| security_analyst | 168 hours (7 days) |
| intel_analyst | 24 hours |
| developer | 168 hours (7 days) |
| guest | 4 hours |

### Regular Audits

- Review role assignments monthly
- Audit access logs weekly
- Validate RBAC configuration after changes
- Remove unused roles promptly

---

## Quick Reference

### Authorization Check Commands

```bash
# Current user permissions
node _bmad/core/security/check-authorization.js

# List all roles
node _bmad/core/security/check-authorization.js roles

# Check module access
node _bmad/core/security/check-authorization.js module <module>

# Check workflow access
node _bmad/core/security/check-authorization.js workflow <workflow>

# Check agent access
node _bmad/core/security/check-authorization.js agent <module/agent>
```

### Token Management Commands

```bash
# Generate token (interactive)
node _bmad/core/security/generate-token.js

# Generate token (quick)
node _bmad/core/security/quick-token.cjs "Name" "role" hours

# Validate token
node _bmad/core/security/validate-token.js
```

---

## Related Documentation

- [Token Management Guide](TOKEN-MANAGEMENT-GUIDE.md) - Token lifecycle procedures
- [Audit Log Guide](AUDIT-LOG-GUIDE.md) - Log interpretation and monitoring
- [Security Maintenance Checklist](SECURITY-MAINTENANCE-CHECKLIST.md) - Regular maintenance procedures
- [Incident Response Runbook](../Operations/INCIDENT-RESPONSE-RUNBOOK.md) - Security incident handling
