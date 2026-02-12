# RBAC Roles Guide

User-focused guide to Role-Based Access Control in BMAD-CYBER2.

---

## Overview

BMAD-CYBER2 uses Role-Based Access Control (RBAC) to manage who can access what. Your role determines:

- Which **modules** you can access
- Which **agents** you can activate
- Which **workflows** you can execute
- What **actions** you can perform

---

## Quick Start

### Check Your Current Role

```bash
node _bmad/core/security/check-authorization.js
```

### Check Specific Access

```bash
# Check module access
node _bmad/core/security/check-authorization.js module intel-team

# Check workflow access
node _bmad/core/security/check-authorization.js workflow operation-mosaic

# Check agent access
node _bmad/core/security/check-authorization.js agent intel-team/osint-lead
```

### Get a New Role

```bash
# Generate token with specific role
node _bmad/core/security/quick-token.cjs "YourName" "developer" 168
```

---

## Available Roles (10)

### Admin Role

**Role:** `admin`
**Description:** Full system administrator with unrestricted access

| Access Type | Permission |
|-------------|------------|
| Modules | All (`*`) |
| Agents | All (`*`) |
| Workflows | All (`*`) |
| Actions | read, write, execute, admin |

**Use for:** System administrators, framework maintainers

---

### Security Lead Role

**Role:** `security_lead`
**Description:** Security team lead - manages security operations
**Inherits from:** `security_analyst`

| Access Type | Permission |
|-------------|------------|
| Modules | cybersec-team, intel-team, core |
| Agents | cybersec-team/*, intel-team/*, core/* |
| Workflows | incident-*, threat-*, security-*, compliance-*, vulnerability-*, campaign-*, operation-*, secure-*, counter-*, attribution-*, doppelganger-* |
| Actions | read, write, execute |

**Use for:** CISOs, security directors, security team leads

---

### Security Analyst Role

**Role:** `security_analyst`
**Description:** Security analyst - performs security assessments

| Access Type | Permission |
|-------------|------------|
| Modules | cybersec-team, core |
| Agents | security-architect, threat-analyst, penetration-tester, soc-analyst, web-app-security-expert, cloud-security-specialist, appsec-engineer, devsecops-engineer, red-team-operator, grc-specialist, abdul, bmad-master |
| Workflows | threat-modeling, security-architecture-review, web-app-security-testing, cloud-security-assessment, vulnerability-management, compliance-audit-prep, secure-software, compliance-first |
| Actions | read, execute |

**Use for:** Security analysts, penetration testers, security engineers

---

### Intel Analyst Role

**Role:** `intel_analyst`
**Description:** Intelligence analyst - OSINT and threat intelligence
**Requires:** Credential verification

| Access Type | Permission |
|-------------|------------|
| Modules | intel-team, core |
| Agents | intel-team/*, core/* |
| Workflows | flash-*, campaign-*, spider-*, breach-*, pattern-*, infrastructure-*, signal-*, digital-*, tripwire*, ground-*, the-synthesis, threat-constellation |
| Actions | read, execute |

**Special Requirements:**

- Credential verification required for module access
- Some workflows require additional approval

**Use for:** Intelligence analysts, threat researchers, OSINT professionals

---

### Legal Counsel Role

**Role:** `legal_counsel`
**Description:** Legal team member - legal matters and compliance
**Special Flag:** Privileged content

| Access Type | Permission |
|-------------|------------|
| Modules | legal-team, core |
| Agents | legal-team/*, core/* |
| Workflows | legal-*, contract-*, corporate-*, dispute-*, tax-*, cross-border-* |
| Actions | read, write, execute |

**Use for:** In-house counsel, legal advisors (Party Mode support only)

---

### Developer Role

**Role:** `developer`
**Description:** Software developer - development and implementation

| Access Type | Permission |
|-------------|------------|
| Modules | bmm, bmgd, bmb, cis, core |
| Agents | bmm/*, bmgd/*, bmb/*, cis/*, core/* |
| Workflows | create-*, dev-*, sprint-*, code-*, quick-*, workflow-*, testarch-*, brainstorm*, design-*, research, check-*, index-*, whats-next, project-status, assign-task, phase-gate, select-*, party-mode, cross-module, conflict-resolution |
| Actions | read, write, execute |

**Use for:** Software developers, game developers, technical staff

---

### Product Manager Role

**Role:** `product_manager`
**Description:** Product manager - product planning and requirements

| Access Type | Permission |
|-------------|------------|
| Modules | bmm, cis, core |
| Agents | pm, analyst, ux-designer, architect, cis/*, core/* |
| Workflows | create-prd, create-product-brief, create-ux-design, create-architecture, create-epics-and-stories, create-story, research, brainstorm*, design-thinking, innovation-*, storytelling, whats-next, project-status, check-implementation-readiness |
| Actions | read, write, execute |

**Use for:** Product managers, product owners, business analysts

---

### Strategist Role

**Role:** `strategist`
**Description:** Strategic advisor - strategy and decision making

| Access Type | Permission |
|-------------|------------|
| Modules | strategy-team, core |
| Agents | strategy-team/*, core/* |
| Workflows | strategic-*, board-*, competitive-*, crisis-*, ethical-*, leadership-*, policy-*, political-*, stakeholder-*, conflict-*, ma-*, performance-* |
| Actions | read, execute |

**Use for:** Strategic advisors, executives, board members

---

### Viewer Role

**Role:** `viewer`
**Description:** Read-only access to core functionality

| Access Type | Permission |
|-------------|------------|
| Modules | core |
| Agents | abdul, bmad-master |
| Workflows | None (cannot execute) |
| Actions | read |

**Use for:** Observers, auditors (read-only access)

---

### Guest Role

**Role:** `guest`
**Description:** Minimal guest access

| Access Type | Permission |
|-------------|------------|
| Modules | core |
| Agents | abdul |
| Workflows | None |
| Actions | read |

**Restrictions:**

- Session timeout: 60 minutes (vs 8 hours standard)
- Rate limited: 100 requests/hour

**Use for:** Temporary access, demos

---

## Role Hierarchy

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

**Note:** `security_lead` inherits all permissions from `security_analyst`, plus additional access to intel-team and advanced workflows.

---

## Module Access by Role

| Module | Roles with Access |
|--------|------------------|
| core | All roles |
| cybersec-team | admin, security_lead, security_analyst |
| intel-team | admin, security_lead, intel_analyst |
| strategy-team | admin, strategist |
| legal-team | admin, legal_counsel |
| bmm | admin, developer, product_manager |
| bmgd | admin, developer |
| bmb | admin, developer |
| cis | admin, developer, product_manager, strategist |

---

## Restricted Resources

### Restricted Modules

Some modules have additional requirements beyond role permissions:

| Module | Additional Requirements |
|--------|------------------------|
| intel-team | Credential verification required |
| legal-team | Privileged content flag |

### Restricted Workflows

Some workflows have fine-grained restrictions:

| Workflow | Required Roles | Special Requirements |
|----------|---------------|---------------------|
| operation-mosaic | intel_analyst, security_lead, admin | Credential verification, full audit |
| approach-vector | intel_analyst, admin | Credential verification, full audit |
| ground-truth | intel_analyst, security_lead, admin | Credential verification |
| competitive-warfare | strategist, admin | Requires approval |
| incident-response | security_lead, admin | Full audit |
| counter-intel-audit | security_lead, admin | Full audit |
| doppelganger-hunt | intel_analyst, security_lead, admin | Full audit |
| attribution-chain | intel_analyst, security_lead, admin | Full audit |

### Restricted Agents

Some agents have additional controls:

| Agent | Module | Required Roles | Warning |
|-------|--------|---------------|---------|
| field-operative | intel-team | intel_analyst, security_lead, admin | Field operations guidance |
| humint-specialist | intel-team | intel_analyst, security_lead, admin | Ethical use requirement |
| dark-web-analyst | intel-team | intel_analyst, security_lead, admin | Credential verification |
| red-team-operator | cybersec-team | security_analyst, security_lead, admin | Authorization required |
| social-engineer | cybersec-team | security_analyst, security_lead, admin | Authorization required |

---

## Permission Patterns

### Wildcards

RBAC supports wildcard patterns for flexible permissions:

| Pattern | Meaning | Example |
|---------|---------|---------|
| `*` | Match everything | All agents/workflows |
| `module/*` | All items in module | `intel-team/*` matches all intel agents |
| `prefix-*` | Items starting with prefix | `create-*` matches create-prd, create-story |

### Action Types

| Action | Description |
|--------|-------------|
| `read` | Can view/list agents and workflows |
| `execute` | Can invoke workflows and activate agents |
| `write` | Can create/modify outputs |
| `admin` | Can modify RBAC configuration |

---

## Checking Permissions

### View Your Permissions

```bash
node _bmad/core/security/check-authorization.js
```

Output shows:

- Your user ID and name
- Your assigned roles
- Effective permissions (modules, agents, workflows)
- Credential verification status

### Check Specific Access

```bash
# Module access
node _bmad/core/security/check-authorization.js module cybersec-team

# Workflow access
node _bmad/core/security/check-authorization.js workflow incident-response

# Agent access
node _bmad/core/security/check-authorization.js agent cybersec-team/threat-analyst
```

### View Role Details

```bash
# List all roles
node _bmad/core/security/check-authorization.js roles

# View specific role
node _bmad/core/security/check-authorization.js role security_analyst
```

---

## Changing Roles

### Generate New Token with Different Role

```bash
node _bmad/core/security/quick-token.cjs "YourName" "new_role" 168
```

### Multiple Roles

You can have multiple roles. Permissions are combined (union):

```bash
# Generate token with multiple roles (modify token manually or use generate-token.js)
node _bmad/core/security/generate-token.js
# Enter roles: developer,product_manager
```

---

## Access Denied Messages

When access is denied, you'll see a message like:

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

---

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

3. Verify pattern matching covers your workflow

### "Requires verified credentials"

Some resources require credential verification:

- This must be set when generating your token
- Typically requires administrator verification

### Token expired

Generate a new token:

```bash
node _bmad/core/security/quick-token.cjs "YourName" "your_role" 168
```

---

## Related Documentation

- [SECURITY-OVERVIEW.md](SECURITY-OVERVIEW.md) - Security architecture
- [Security-RBAC.md](../06-reference/features/Security/Security-RBAC.md) - Detailed RBAC documentation
- [Security-Authentication.md](../06-reference/features/Security/Security-Authentication.md) - Token authentication
- [MODULES-OVERVIEW.md](MODULES-OVERVIEW.md) - Module descriptions
