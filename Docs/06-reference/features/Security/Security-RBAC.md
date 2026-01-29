# Security Feature: Role-Based Access Control (RBAC)

**Status:** Implemented
**Phase:** 2 (Access Control & Audit)
**Finding Addressed:** CRITICAL - No authorization controls

---

## Overview

The BMAD RBAC system controls access to agents, workflows, and modules based on user roles. It implements a deny-by-default security model with role inheritance, wildcard patterns, and fine-grained restrictions for sensitive resources.

## Problem Solved

**Before:** All 100+ agents and 150+ workflows were accessible to anyone:
```
# Developer accidentally invokes intel operation
/bmad:intel-team:workflows:operation-mosaic  # No restriction!
```

**After:** Resources are gated by role with clear access denied messages:
```
======================================================================
                         ACCESS DENIED
======================================================================

  Workflow: operation-mosaic

  Workflow 'operation-mosaic' requires one of these roles:
  intel_analyst, security_lead, admin

  To request access:
  1. Contact your administrator
  2. Request the appropriate role for your needs

======================================================================
```

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      RBAC AUTHORIZATION SYSTEM                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   USER IDENTITY (from Authentication Token)                             │
│   ┌──────────────┐                                                      │
│   │  Session     │──┐                                                   │
│   │  user_id     │  │                                                   │
│   │  roles: []   │  │                                                   │
│   └──────────────┘  │                                                   │
│                     ▼                                                   │
│   ┌─────────────────────────────────────────────────────────────────┐  │
│   │                    ROLE RESOLUTION                               │  │
│   │  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐      │  │
│   │  │  admin  │    │security │    │developer│    │ viewer  │      │  │
│   │  │         │    │ _lead   │    │         │    │         │      │  │
│   │  └────┬────┘    └────┬────┘    └────┬────┘    └────┬────┘      │  │
│   │       │              │              │              │            │  │
│   │       │         inherits from       │              │            │  │
│   │       │              │              │              │            │  │
│   │       │         ┌────▼────┐         │              │            │  │
│   │       │         │security │         │              │            │  │
│   │       │         │_analyst │         │              │            │  │
│   │       │         └─────────┘         │              │            │  │
│   │       ▼              ▼              ▼              ▼            │  │
│   │   ┌─────────────────────────────────────────────────────────┐  │  │
│   │   │              EFFECTIVE PERMISSIONS                       │  │  │
│   │   │  agents: [list]  workflows: [list]  modules: [list]     │  │  │
│   │   └─────────────────────────────────────────────────────────┘  │  │
│   └─────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│   ACCESS REQUEST                                                        │
│   ┌──────────────┐    ┌──────────────┐    ┌──────────────────┐         │
│   │  User wants  │───▶│   Check      │───▶│  ALLOW or        │         │
│   │  to access   │    │  Permission  │    │  DENY + reason   │         │
│   │  resource    │    │              │    │                  │         │
│   └──────────────┘    └──────────────┘    └──────────────────┘         │
│                              │                                          │
│                              ▼                                          │
│                    Check order:                                         │
│                    1. Module access                                     │
│                    2. Agent access                                      │
│                    3. Workflow access                                   │
│                    4. Special restrictions                              │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Quick Start

### 1. Check Your Current Permissions

```bash
node _bmad/core/security/check-authorization.js
```

Example output:
```
======================================================================
              Current User Authorization
======================================================================

  User Information
  ----------------
  User ID:             6d253447-d748-4039-a28a-89c924d2b9cb
  Name:                J
  Roles:               admin
  Credential Verified: No

  Effective Permissions
  ---------------------
  Actions:  read, write, execute, admin

  Modules:
    - *

  Agents (patterns):
    - *

  Workflows (patterns):
    - *

======================================================================
```

### 2. Check Specific Access

```bash
# Check agent access
node _bmad/core/security/check-authorization.js agent intel-team/osint-lead

# Check workflow access
node _bmad/core/security/check-authorization.js workflow operation-mosaic

# Check module access
node _bmad/core/security/check-authorization.js module cybersec-team
```

### 3. View Role Details

```bash
# List all roles
node _bmad/core/security/check-authorization.js roles

# View specific role
node _bmad/core/security/check-authorization.js role security_analyst
```

## Available Roles

| Role | Description | Module Access | Special |
|------|-------------|---------------|---------|
| `admin` | Full system administrator | `*` (all) | Can modify RBAC config |
| `security_lead` | Security team lead | cybersec-team, intel-team, core | Inherits security_analyst |
| `security_analyst` | Security analyst | cybersec-team, core | - |
| `intel_analyst` | Intelligence analyst | intel-team, core | Requires credential verification |
| `legal_counsel` | Legal team member | legal-team, core | Privileged content flag |
| `developer` | Software developer | bmm, bmgd, bmb, cis, core | - |
| `product_manager` | Product manager | bmm, cis, core | - |
| `strategist` | Strategic advisor | strategy-team, core | - |
| `viewer` | Read-only access | core | Cannot execute workflows |
| `guest` | Minimal guest access | core | Rate limited, short session |

### Role Hierarchy

```
                    ┌─────────┐
                    │  admin  │  (has all permissions)
                    └────┬────┘
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
   ┌───────────┐   ┌───────────┐   ┌───────────┐
   │ security  │   │   legal   │   │ developer │
   │   _lead   │   │ _counsel  │   │           │
   └─────┬─────┘   └───────────┘   └───────────┘
         │
         │ (inherits from)
         ▼
   ┌───────────┐
   │ security  │
   │ _analyst  │
   └───────────┘
```

## Permission Patterns

### Wildcards

The RBAC system supports wildcard patterns for flexible permission grants:

| Pattern | Meaning | Example |
|---------|---------|---------|
| `*` | Match everything | All agents/workflows/modules |
| `module/*` | All items in module | `intel-team/*` matches all intel agents |
| `prefix-*` | All items starting with prefix | `create-*` matches create-prd, create-story, etc. |

### Action Types

| Action | Description |
|--------|-------------|
| `read` | Can view/list agents and workflows |
| `execute` | Can invoke workflows and activate agents |
| `write` | Can create/modify outputs |
| `admin` | Can modify RBAC configuration |

## Module Restrictions

Certain modules have additional access requirements beyond role permissions:

| Module | Required Roles | Special Requirements |
|--------|---------------|---------------------|
| `intel-team` | intel_analyst, security_lead, admin | Credential verification |
| `legal-team` | legal_counsel, admin | Privileged content flag |
| `cybersec-team` | security_analyst, security_lead, admin | - |
| `strategy-team` | strategist, admin | - |

## Workflow Restrictions

Sensitive workflows have fine-grained restrictions:

| Workflow | Required Roles | Special |
|----------|---------------|---------|
| `operation-mosaic` | intel_analyst, security_lead, admin | Credential verification, full audit |
| `approach-vector` | intel_analyst, admin | Credential verification, full audit |
| `competitive-warfare` | strategist, admin | Requires approval |
| `incident-response` | security_lead, admin | Full audit |
| `counter-intel-audit` | security_lead, admin | Full audit |
| `ground-truth` | intel_analyst, security_lead, admin | Credential verification |

## Agent Restrictions

Specific sensitive agents have additional controls:

| Agent | Required Roles | Warning |
|-------|---------------|---------|
| `intel-team/field-operative` | intel_analyst, security_lead, admin | Field operations guidance |
| `intel-team/humint-specialist` | intel_analyst, security_lead, admin | Ethical use requirement |
| `intel-team/dark-web-analyst` | intel_analyst, security_lead, admin | Credential verification |
| `cybersec-team/red-team-operator` | security_analyst, security_lead, admin | Authorization required |

## Files

| File | Purpose | Commit to Git? |
|------|---------|----------------|
| `_bmad/core/security/rbac-config.yaml` | Role and permission definitions | Yes |
| `_bmad/core/security/authorization.ts` | TypeScript authorization module | Yes |
| `_bmad/core/security/authorization.js` | JavaScript authorization module | Yes |
| `_bmad/core/security/check-authorization.js` | Permission check utility | Yes |

## Configuration

RBAC settings in `_bmad/core/security/rbac-config.yaml`:

```yaml
rbac:
  enabled: true
  default_role: viewer
  deny_by_default: true

  roles:
    admin:
      description: "Full system administrator"
      permissions:
        agents: ["*"]
        workflows: ["*"]
        modules: ["*"]
        actions: ["read", "write", "execute", "admin"]

    developer:
      description: "Software developer"
      permissions:
        agents: ["bmm/*", "bmgd/*", "core/*"]
        workflows: ["create-*", "dev-*", "sprint-*"]
        modules: ["bmm", "bmgd", "core"]
        actions: ["read", "write", "execute"]

  module_restrictions:
    intel-team:
      require_roles: ["intel_analyst", "security_lead", "admin"]
      require_credential_verification: true
      audit_level: full

  workflow_restrictions:
    operation-mosaic:
      require_roles: ["intel_analyst", "security_lead", "admin"]
      require_credential_verification: true
      audit_level: full
```

## Programmatic Usage

### JavaScript

```javascript
const { getAuthorizationManager } = require('./_bmad/core/security/authorization.js');

// Get the authorization manager
const manager = getAuthorizationManager();

// Create user context (from authentication token)
const user = {
  userId: 'abc-123',
  userName: 'J',
  roles: ['developer'],
  modules: ['bmm', 'core'],
  credentialVerified: false
};

// Check module access
const moduleResult = manager.canAccessModule(user, 'intel-team');
if (!moduleResult.allowed) {
  console.log(manager.formatDenialMessage(moduleResult, 'Module', 'intel-team'));
}

// Check workflow access
const workflowResult = manager.canExecuteWorkflow(user, 'create-prd');
if (workflowResult.allowed) {
  console.log('Workflow access granted');
  if (workflowResult.requires_approval) {
    console.log('Note: Requires approval before execution');
  }
}

// Check agent access
const agentResult = manager.canAccessAgent(user, 'bmm/pm');
console.log('Agent access:', agentResult.allowed ? 'ALLOWED' : 'DENIED');
```

### TypeScript

```typescript
import { getAuthorizationManager, UserContext } from './_bmad/core/security/authorization';

const manager = getAuthorizationManager();

const user: UserContext = {
  userId: 'abc-123',
  userName: 'J',
  roles: ['security_analyst'],
  modules: ['cybersec-team', 'core'],
  credentialVerified: true
};

const result = manager.canAccessAgent(user, 'cybersec-team/threat-analyst');
console.log(result.allowed ? 'Access granted' : `Denied: ${result.reason}`);
```

## Security Design Principles

1. **Deny by Default**: If no permission explicitly grants access, access is denied
2. **Role Inheritance**: Roles can inherit from other roles to reduce duplication
3. **Module-Level Gates**: Coarse-grained control at the module level
4. **Fine-Grained Restrictions**: Specific workflows and agents can have additional requirements
5. **Credential Verification**: Sensitive resources can require verified professional credentials
6. **Audit Levels**: Resources can specify audit intensity (minimal, standard, full)

## Integration with Authentication

RBAC reads user roles from the authentication token:

```json
{
  "sub": "uuid",
  "name": "J",
  "roles": ["developer", "product_manager"],
  "modules": ["bmm", "cis", "core"],
  "credential_verified": false
}
```

The `roles` array determines what the user can access through RBAC.

## Troubleshooting

### "Access Denied" for a workflow you should have access to

1. Check your current roles:
   ```bash
   node _bmad/core/security/check-authorization.js
   ```

2. Check the workflow requirements:
   ```bash
   node _bmad/core/security/check-authorization.js workflow <workflow-name>
   ```

3. If your role should have access, verify the pattern matching in `rbac-config.yaml`

### "Requires verified credentials"

Some sensitive resources require credential verification. This flag must be set when generating your token and typically requires verification by an administrator.

### Regenerating token with different roles

```bash
node _bmad/core/security/quick-token.js "YourName" "new_role" 168
```

### Viewing all available roles

```bash
node _bmad/core/security/check-authorization.js roles
```

---

## Validation Status

### Latest Validation: 2026-01-15

| Category | Tests | Passed | Status |
|----------|-------|--------|--------|
| Token Validation | 12 | 12 | PASS |
| Role Configuration | 10 | 10 | PASS |
| Module Access Control | 4 | 4 | PASS |
| Workflow Access Control | 4 | 4 | PASS |
| Agent Access Control | 4 | 4 | PASS |
| Role Inheritance | 2 | 2 | PASS |
| Cross-Role Verification | 4 | 4 | PASS |
| **TOTAL** | **40** | **40** | **PASS** |

### Key Security Features Validated

1. **AES-256-GCM Encryption** - Tokens securely encrypted with 32-byte keys
2. **File Permissions** - Key and token files restricted to owner only (600)
3. **Role Inheritance** - security_lead correctly inherits security_analyst permissions
4. **Credential Verification** - Intel-team operations require additional verification
5. **Approval Workflows** - High-risk workflows require explicit approval
6. **Audit Levels** - Different audit levels (minimal, standard, full) per resource
7. **Deny by Default** - Access denied unless explicitly granted

### Test Report

Full validation report: See `Docs/testing/` for validation reports

---

*Part of BMAD Security Phase 2 Implementation*
