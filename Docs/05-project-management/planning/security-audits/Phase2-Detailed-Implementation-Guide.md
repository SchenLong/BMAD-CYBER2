# Phase 2: Access Control & Audit - Detailed Implementation Guide

**Project:** BMAD-Security-Review
**Phase:** 2 of 4
**Duration:** Weeks 4-6
**Author:** Bastion (Security Architect)
**Date:** 2026-01-13

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Solution 2.1: Role-Based Access Control (RBAC)](#2-solution-21-role-based-access-control-rbac)
3. [Solution 2.2: Audit Logging System](#3-solution-22-audit-logging-system)
4. [Implementation Order & Dependencies](#4-implementation-order--dependencies)
5. [Files Requiring Updates](#5-files-requiring-updates)
6. [Testing & Validation](#6-testing--validation)

---

## 1. Executive Summary

Phase 2 addresses the authorization and accountability gaps identified in the BMAD Framework Security Audit:

| Solution | Finding Addressed | Severity | User Impact |
|----------|-------------------|----------|-------------|
| 2.1 RBAC | No authorization controls | CRITICAL | Medium friction |
| 2.2 Audit Logging | No audit trail | HIGH | Zero friction |

### User Experience Philosophy

Phase 2 introduces visible security controls, but follows these principles:

1. **Roles should match natural team structures** - Users get roles that align with their job function
2. **Authorization failures should be educational** - Explain why access was denied and who can help
3. **Audit logging is completely invisible** - No user interaction, runs in background
4. **Least privilege with escape hatches** - Start restrictive, provide clear escalation paths

### Prerequisites

Phase 2 requires Phase 1 components:
- **Authentication (1.2)** - RBAC needs verified user identity
- **File Integrity (1.1)** - RBAC config must be tamper-proof (recommended but can defer)

---

## 2. Solution 2.1: Role-Based Access Control (RBAC)

### 2.1 Problem Statement

**Current State:**
- All 100+ agents accessible to anyone
- All 150+ workflows executable by anyone
- No permission boundaries between modules
- Intel-team workflows (sensitive OSINT) available without verification
- Legal-team workflows (privileged content) available without restriction
- Phase gates describe approval but don't enforce

**Risk Scenario:**
```
1. Developer needs to check sprint status
2. Accidentally (or intentionally) invokes intel-team/operation-mosaic
3. Full-spectrum intelligence collection executes
4. No authorization check, no restriction
5. Sensitive capabilities used outside intended context
```

### 2.2 Proposed Solution: Hierarchical RBAC

**How It Works:**

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      RBAC AUTHORIZATION SYSTEM                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   USER IDENTITY (from Authentication)                                   │
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
│   │  User wants  │───▶│   Check      │───▶│  ✓ ALLOW or      │         │
│   │  to access   │    │  Permission  │    │  ✗ DENY + reason │         │
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

**Why Hierarchical RBAC?**
- **Role inheritance** reduces duplication (security_lead inherits from security_analyst)
- **Wildcard patterns** simplify configuration (`cybersec-team/*` grants all agents)
- **Deny-by-default** ensures forgotten resources are protected
- **Module-level gates** provide coarse-grained control
- **Workflow-level restrictions** enable fine-grained control

### 2.3 Role Definitions

#### Core Roles

| Role | Description | Typical User | Default Modules |
|------|-------------|--------------|-----------------|
| `admin` | Full system access | System administrators | `*` (all) |
| `security_lead` | Security team lead | CISO, Security managers | cybersec, intel, core |
| `security_analyst` | Security analyst | SOC analysts, pentesters | cybersec, core |
| `intel_analyst` | Intelligence analyst | OSINT researchers | intel, core |
| `legal_counsel` | Legal team member | Lawyers, paralegals | legal, core |
| `developer` | Software developer | Engineers, architects | bmm, bmgd, bmb, cis, core |
| `product_manager` | Product management | PMs, BAs | bmm, cis, core |
| `strategist` | Strategic advisor | Executives, consultants | strategy, core |
| `viewer` | Read-only access | Observers, auditors | core |
| `guest` | Minimal access | External parties | core (limited) |

#### Role Hierarchy

```
                    ┌─────────┐
                    │  admin  │
                    └────┬────┘
                         │ (has all permissions)
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
   ┌───────────┐   ┌───────────┐   ┌───────────┐
   │ security  │   │   legal   │   │ developer │
   │   _lead   │   │  _lead    │   │   _lead   │
   └─────┬─────┘   └───────────┘   └───────────┘
         │
         │ (inherits from)
         ▼
   ┌───────────┐
   │ security  │
   │ _analyst  │
   └───────────┘
```

### 2.4 Detailed Implementation

#### Step 1: Create RBAC Configuration

**File:** `_bmad/core/security/rbac-config.yaml`

```yaml
# =============================================================================
# BMAD ROLE-BASED ACCESS CONTROL CONFIGURATION
# =============================================================================
# This file defines roles, permissions, and access restrictions for the
# BMAD framework. Modify with caution - incorrect configuration may lock
# out users or expose sensitive workflows.

rbac:
  # Enable/disable RBAC (default: true)
  enabled: true

  # Default role for authenticated users without explicit role assignment
  default_role: viewer

  # Deny access by default if no permission explicitly grants it
  deny_by_default: true

  # ---------------------------------------------------------------------------
  # ROLE DEFINITIONS
  # ---------------------------------------------------------------------------
  roles:
    # =========================================================================
    # ADMINISTRATIVE ROLES
    # =========================================================================
    admin:
      description: "Full system administrator with unrestricted access"
      inherits: []
      permissions:
        agents:
          - "*"                           # All agents in all modules
        workflows:
          - "*"                           # All workflows
        modules:
          - "*"                           # All modules
        actions:
          - "read"
          - "write"
          - "execute"
          - "admin"                       # Can modify RBAC config

    # =========================================================================
    # SECURITY TEAM ROLES
    # =========================================================================
    security_lead:
      description: "Security team lead - manages security operations"
      inherits:
        - security_analyst                # Inherits all analyst permissions
      permissions:
        agents:
          - "cybersec-team/*"             # All cybersec agents
          - "intel-team/*"                # All intel agents
          - "core/*"                      # Core agents (Abdul, BMAD Master)
        workflows:
          - "incident-*"                  # Incident response workflows
          - "threat-*"                    # Threat modeling/analysis
          - "security-*"                  # Security assessments
          - "compliance-*"                # Compliance workflows
          - "vulnerability-*"             # Vulnerability management
          - "campaign-*"                  # OSINT campaigns
          - "operation-*"                 # Intelligence operations
        modules:
          - "cybersec-team"
          - "intel-team"
          - "core"
        actions:
          - "read"
          - "write"
          - "execute"

    security_analyst:
      description: "Security analyst - performs security assessments"
      inherits: []
      permissions:
        agents:
          - "cybersec-team/security-architect"
          - "cybersec-team/threat-analyst"
          - "cybersec-team/penetration-tester"
          - "cybersec-team/soc-analyst"
          - "cybersec-team/web-app-security-expert"
          - "cybersec-team/cloud-security-specialist"
          - "core/abdul"
          - "core/bmad-master"
        workflows:
          - "threat-modeling"
          - "security-architecture-review"
          - "web-app-security-testing"
          - "cloud-security-assessment"
          - "vulnerability-management"
          - "compliance-audit-prep"
        modules:
          - "cybersec-team"
          - "core"
        actions:
          - "read"
          - "execute"

    # =========================================================================
    # INTELLIGENCE TEAM ROLES
    # =========================================================================
    intel_analyst:
      description: "Intelligence analyst - OSINT and threat intelligence"
      inherits: []
      permissions:
        agents:
          - "intel-team/*"                # All intel agents
          - "core/*"
        workflows:
          - "flash-*"                     # Flash assessments
          - "campaign-*"                  # Campaign planning
          - "spider-*"                    # Network mapping
          - "breach-*"                    # Breach archaeology
          - "pattern-*"                   # Pattern of life
          - "infrastructure-*"            # Infrastructure analysis
        modules:
          - "intel-team"
          - "core"
        actions:
          - "read"
          - "execute"
      requires:
        credential_verification: true     # Must verify professional status

    # =========================================================================
    # LEGAL TEAM ROLES
    # =========================================================================
    legal_counsel:
      description: "Legal team member - legal matters and compliance"
      inherits: []
      permissions:
        agents:
          - "legal-team/*"                # All legal agents
          - "core/*"
        workflows:
          - "legal-*"                     # Legal matter workflows
          - "contract-*"                  # Contract workflows
          - "corporate-*"                 # Corporate formation
          - "dispute-*"                   # Dispute resolution
          - "tax-*"                       # Tax planning
          - "cross-border-*"              # Cross-border matters
        modules:
          - "legal-team"
          - "core"
        actions:
          - "read"
          - "write"
          - "execute"
      special:
        privileged: true                  # Attorney-client privilege flag

    # =========================================================================
    # DEVELOPMENT TEAM ROLES
    # =========================================================================
    developer:
      description: "Software developer - development and implementation"
      inherits: []
      permissions:
        agents:
          - "bmm/*"                       # All BMM agents
          - "bmgd/*"                      # All game dev agents
          - "bmb/*"                       # Module builder agents
          - "cis/*"                       # Creative/innovation agents
          - "core/*"
        workflows:
          - "create-*"                    # Creation workflows
          - "dev-*"                       # Development workflows
          - "sprint-*"                    # Sprint management
          - "code-*"                      # Code review
          - "quick-*"                     # Quick flow
          - "workflow-*"                  # Workflow status
          - "testarch-*"                  # Testing workflows
          - "brainstorm*"                 # Brainstorming
          - "design-*"                    # Design workflows
          - "research"                    # Research workflow
        modules:
          - "bmm"
          - "bmgd"
          - "bmb"
          - "cis"
          - "core"
        actions:
          - "read"
          - "write"
          - "execute"

    product_manager:
      description: "Product manager - product planning and requirements"
      inherits: []
      permissions:
        agents:
          - "bmm/pm"
          - "bmm/analyst"
          - "bmm/ux-designer"
          - "bmm/architect"
          - "cis/*"
          - "core/*"
        workflows:
          - "create-prd"
          - "create-product-brief"
          - "create-ux-design"
          - "research"
          - "brainstorm*"
          - "design-thinking"
          - "innovation-*"
          - "storytelling"
        modules:
          - "bmm"
          - "cis"
          - "core"
        actions:
          - "read"
          - "write"
          - "execute"

    # =========================================================================
    # STRATEGY TEAM ROLES
    # =========================================================================
    strategist:
      description: "Strategic advisor - strategy and decision making"
      inherits: []
      permissions:
        agents:
          - "strategy-team/*"             # All strategy agents
          - "core/*"
        workflows:
          - "strategic-*"                 # Strategic workflows
          - "board-*"                     # Board-related
          - "competitive-*"               # Competitive analysis
          - "crisis-*"                    # Crisis management
          - "ethical-*"                   # Ethics workflows
          - "leadership-*"                # Leadership workflows
          - "policy-*"                    # Policy development
          - "political-*"                 # Political risk
          - "stakeholder-*"               # Stakeholder management
          - "conflict-*"                  # Conflict resolution
          - "ma-*"                        # M&A workflows
          - "performance-*"               # Performance reviews
        modules:
          - "strategy-team"
          - "core"
        actions:
          - "read"
          - "execute"

    # =========================================================================
    # LIMITED ACCESS ROLES
    # =========================================================================
    viewer:
      description: "Read-only access to core functionality"
      inherits: []
      permissions:
        agents:
          - "core/abdul"                  # Project manager only
        workflows: []                     # Cannot execute workflows
        modules:
          - "core"
        actions:
          - "read"                        # Read-only

    guest:
      description: "Minimal guest access"
      inherits: []
      permissions:
        agents:
          - "core/abdul"
        workflows: []
        modules:
          - "core"
        actions:
          - "read"
      restrictions:
        session_timeout_minutes: 60       # Shorter session
        max_requests_per_hour: 100        # Rate limited

  # ---------------------------------------------------------------------------
  # MODULE-LEVEL RESTRICTIONS
  # ---------------------------------------------------------------------------
  # These restrictions apply to entire modules regardless of role permissions.
  # A user must satisfy BOTH role permissions AND module restrictions.

  module_restrictions:
    intel-team:
      description: "Intelligence operations require verified credentials"
      require_roles:
        - intel_analyst
        - security_lead
        - admin
      require_credential_verification: true
      audit_level: full
      warning_message: |
        Intel-team contains sensitive intelligence gathering capabilities.
        Access is restricted to verified intelligence professionals.

    legal-team:
      description: "Legal team requires legal counsel role"
      require_roles:
        - legal_counsel
        - admin
      privileged: true
      audit_level: full
      warning_message: |
        Legal-team workflows may involve privileged legal matters.
        Access is restricted to authorized legal personnel.

    cybersec-team:
      description: "Security operations require security roles"
      require_roles:
        - security_analyst
        - security_lead
        - admin
      audit_level: standard

    strategy-team:
      description: "Strategy requires strategist or admin role"
      require_roles:
        - strategist
        - admin
      audit_level: standard

  # ---------------------------------------------------------------------------
  # WORKFLOW-LEVEL RESTRICTIONS
  # ---------------------------------------------------------------------------
  # Fine-grained restrictions for specific sensitive workflows.

  workflow_restrictions:
    # Critical security workflows
    incident-response-playbook:
      description: "Incident response requires security lead"
      require_roles:
        - security_lead
        - admin
      require_approval: true
      audit_level: full

    # Full-spectrum intelligence
    operation-mosaic:
      description: "Full-spectrum intelligence requires senior analyst"
      require_roles:
        - intel_analyst
        - security_lead
        - admin
      require_credential_verification: true
      audit_level: full
      warning_message: |
        Operation Mosaic deploys all 11 intelligence agents for
        comprehensive target analysis. Ensure you have authorization
        for this level of collection.

    # Approach vector (HUMINT planning)
    approach-vector:
      description: "HUMINT operation planning is highly sensitive"
      require_roles:
        - intel_analyst
        - admin
      require_credential_verification: true
      audit_level: full

    # Competitive warfare
    competitive-warfare:
      description: "Maximum competitive intensity strategy"
      require_roles:
        - strategist
        - admin
      require_approval: true
      audit_level: full

  # ---------------------------------------------------------------------------
  # AGENT-LEVEL RESTRICTIONS
  # ---------------------------------------------------------------------------
  # Restrictions for specific sensitive agents.

  agent_restrictions:
    # Field operative (physical operations)
    intel-team/field-operative:
      description: "Field operations specialist"
      require_roles:
        - intel_analyst
        - security_lead
        - admin
      require_credential_verification: true

    # Social engineer
    cybersec-team/social-engineer:
      description: "Social engineering requires careful oversight"
      require_roles:
        - security_analyst
        - security_lead
        - admin
      warning_message: |
        Social engineering techniques must be used ethically
        and only with proper authorization.

# =============================================================================
# PERMISSION PATTERNS REFERENCE
# =============================================================================
#
# Wildcards:
#   "*"              - Match everything
#   "module/*"       - Match all items in module
#   "prefix-*"       - Match all items starting with prefix
#
# Inheritance:
#   Roles can inherit from other roles using 'inherits' array.
#   Inherited permissions are merged (union).
#   Explicit permissions override inherited ones.
#
# Action Types:
#   "read"    - Can view/list agents and workflows
#   "execute" - Can invoke workflows and activate agents
#   "write"   - Can create/modify outputs
#   "admin"   - Can modify RBAC configuration
#
# Special Flags:
#   require_credential_verification - Must verify professional credentials
#   require_approval - Requires explicit approval before execution
#   privileged - Marks privileged/confidential content
#   audit_level - "none", "standard", "full"
```

---

#### Step 2: Create Authorization Module

**File:** `_bmad/core/security/authorization.ts`

```typescript
/**
 * BMAD Authorization Module
 *
 * Implements Role-Based Access Control (RBAC) for the BMAD framework.
 * Checks permissions for agents, workflows, and modules based on user roles.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';

// ============================================================================
// Types
// ============================================================================

export interface Permission {
  agents: string[];
  workflows: string[];
  modules: string[];
  actions: string[];
}

export interface Role {
  description: string;
  inherits: string[];
  permissions: Permission;
  requires?: {
    credential_verification?: boolean;
  };
  restrictions?: {
    session_timeout_minutes?: number;
    max_requests_per_hour?: number;
  };
  special?: {
    privileged?: boolean;
  };
}

export interface ModuleRestriction {
  description: string;
  require_roles: string[];
  require_credential_verification?: boolean;
  privileged?: boolean;
  audit_level?: string;
  warning_message?: string;
}

export interface WorkflowRestriction {
  description: string;
  require_roles: string[];
  require_approval?: boolean;
  require_credential_verification?: boolean;
  audit_level?: string;
  warning_message?: string;
}

export interface RBACConfig {
  enabled: boolean;
  default_role: string;
  deny_by_default: boolean;
  roles: Record<string, Role>;
  module_restrictions: Record<string, ModuleRestriction>;
  workflow_restrictions: Record<string, WorkflowRestriction>;
  agent_restrictions?: Record<string, any>;
}

export interface AuthorizationResult {
  allowed: boolean;
  reason?: string;
  warning?: string;
  requires_approval?: boolean;
  audit_level?: string;
}

export interface UserContext {
  userId: string;
  userName: string;
  roles: string[];
  modules: string[];
  credentialVerified?: boolean;
}

// ============================================================================
// Authorization Manager
// ============================================================================

export class AuthorizationManager {
  private config: RBACConfig;
  private resolvedRoles: Map<string, Permission> = new Map();
  private resolutionInProgress: Set<string> = new Set();

  constructor(configPath: string) {
    const content = fs.readFileSync(configPath, 'utf-8');
    const parsed = yaml.parse(content);
    this.config = parsed.rbac;
    this.resolveAllRoles();
  }

  /**
   * Pre-resolve all role inheritances
   */
  private resolveAllRoles(): void {
    for (const roleName of Object.keys(this.config.roles)) {
      this.resolveRole(roleName);
    }
  }

  /**
   * Resolve a role including all inherited permissions
   */
  private resolveRole(roleName: string): Permission {
    // Return cached if already resolved
    if (this.resolvedRoles.has(roleName)) {
      return this.resolvedRoles.get(roleName)!;
    }

    // Check for circular inheritance
    if (this.resolutionInProgress.has(roleName)) {
      throw new Error(`Circular role inheritance detected: ${roleName}`);
    }

    const role = this.config.roles[roleName];
    if (!role) {
      throw new Error(`Unknown role: ${roleName}`);
    }

    this.resolutionInProgress.add(roleName);

    // Start with this role's permissions
    let permissions: Permission = {
      agents: [...(role.permissions.agents || [])],
      workflows: [...(role.permissions.workflows || [])],
      modules: [...(role.permissions.modules || [])],
      actions: [...(role.permissions.actions || [])]
    };

    // Merge inherited permissions
    for (const parentRoleName of role.inherits || []) {
      const parentPerms = this.resolveRole(parentRoleName);
      permissions = this.mergePermissions(permissions, parentPerms);
    }

    this.resolutionInProgress.delete(roleName);
    this.resolvedRoles.set(roleName, permissions);

    return permissions;
  }

  /**
   * Merge two permission sets (union)
   */
  private mergePermissions(a: Permission, b: Permission): Permission {
    return {
      agents: [...new Set([...a.agents, ...b.agents])],
      workflows: [...new Set([...a.workflows, ...b.workflows])],
      modules: [...new Set([...a.modules, ...b.modules])],
      actions: [...new Set([...a.actions, ...b.actions])]
    };
  }

  /**
   * Check if a value matches any pattern in the list
   */
  private matchesPattern(value: string, patterns: string[]): boolean {
    for (const pattern of patterns) {
      // Exact match for "*"
      if (pattern === '*') return true;

      // Module wildcard: "module/*"
      if (pattern.endsWith('/*')) {
        const prefix = pattern.slice(0, -2);
        if (value.startsWith(prefix + '/') || value === prefix) {
          return true;
        }
      }

      // Prefix wildcard: "prefix-*"
      if (pattern.endsWith('*') && !pattern.endsWith('/*')) {
        const prefix = pattern.slice(0, -1);
        if (value.startsWith(prefix)) {
          return true;
        }
      }

      // Exact match
      if (pattern === value) return true;
    }

    return false;
  }

  /**
   * Get effective permissions for a user based on their roles
   */
  getEffectivePermissions(userRoles: string[]): Permission {
    let effective: Permission = {
      agents: [],
      workflows: [],
      modules: [],
      actions: []
    };

    for (const role of userRoles) {
      const permissions = this.resolvedRoles.get(role);
      if (permissions) {
        effective = this.mergePermissions(effective, permissions);
      }
    }

    return effective;
  }

  /**
   * Check if user can access a module
   */
  canAccessModule(user: UserContext, moduleName: string): AuthorizationResult {
    if (!this.config.enabled) {
      return { allowed: true };
    }

    // Check module restrictions first
    const restriction = this.config.module_restrictions[moduleName];
    if (restriction) {
      // Check required roles
      const hasRequiredRole = user.roles.some(r =>
        restriction.require_roles.includes(r)
      );
      if (!hasRequiredRole) {
        return {
          allowed: false,
          reason: `Module '${moduleName}' requires one of these roles: ${restriction.require_roles.join(', ')}`,
          warning: restriction.warning_message
        };
      }

      // Check credential verification
      if (restriction.require_credential_verification && !user.credentialVerified) {
        return {
          allowed: false,
          reason: `Module '${moduleName}' requires verified credentials`
        };
      }
    }

    // Check role permissions
    const permissions = this.getEffectivePermissions(user.roles);
    if (!this.matchesPattern(moduleName, permissions.modules)) {
      if (this.config.deny_by_default) {
        return {
          allowed: false,
          reason: `Your roles (${user.roles.join(', ')}) do not grant access to module '${moduleName}'`
        };
      }
    }

    return {
      allowed: true,
      audit_level: restriction?.audit_level,
      warning: restriction?.warning_message
    };
  }

  /**
   * Check if user can access an agent
   */
  canAccessAgent(user: UserContext, agentPath: string): AuthorizationResult {
    if (!this.config.enabled) {
      return { allowed: true };
    }

    // Extract module from agent path (e.g., "intel-team/osint-lead" -> "intel-team")
    const moduleName = agentPath.split('/')[0];

    // First check module access
    const moduleResult = this.canAccessModule(user, moduleName);
    if (!moduleResult.allowed) {
      return moduleResult;
    }

    // Check agent-specific restrictions
    const agentRestriction = this.config.agent_restrictions?.[agentPath];
    if (agentRestriction) {
      const hasRequiredRole = user.roles.some(r =>
        agentRestriction.require_roles.includes(r)
      );
      if (!hasRequiredRole) {
        return {
          allowed: false,
          reason: `Agent '${agentPath}' requires one of these roles: ${agentRestriction.require_roles.join(', ')}`,
          warning: agentRestriction.warning_message
        };
      }

      if (agentRestriction.require_credential_verification && !user.credentialVerified) {
        return {
          allowed: false,
          reason: `Agent '${agentPath}' requires verified credentials`
        };
      }
    }

    // Check role permissions
    const permissions = this.getEffectivePermissions(user.roles);
    if (!this.matchesPattern(agentPath, permissions.agents)) {
      if (this.config.deny_by_default) {
        return {
          allowed: false,
          reason: `Your roles (${user.roles.join(', ')}) do not grant access to agent '${agentPath}'`
        };
      }
    }

    return {
      allowed: true,
      warning: moduleResult.warning || agentRestriction?.warning_message,
      audit_level: moduleResult.audit_level
    };
  }

  /**
   * Check if user can execute a workflow
   */
  canExecuteWorkflow(user: UserContext, workflowName: string): AuthorizationResult {
    if (!this.config.enabled) {
      return { allowed: true };
    }

    // Check workflow-specific restrictions
    const restriction = this.config.workflow_restrictions[workflowName];
    if (restriction) {
      // Check required roles
      const hasRequiredRole = user.roles.some(r =>
        restriction.require_roles.includes(r)
      );
      if (!hasRequiredRole) {
        return {
          allowed: false,
          reason: `Workflow '${workflowName}' requires one of these roles: ${restriction.require_roles.join(', ')}`,
          warning: restriction.warning_message
        };
      }

      // Check credential verification
      if (restriction.require_credential_verification && !user.credentialVerified) {
        return {
          allowed: false,
          reason: `Workflow '${workflowName}' requires verified credentials`
        };
      }

      // Check if approval is required
      if (restriction.require_approval) {
        return {
          allowed: true,
          requires_approval: true,
          warning: restriction.warning_message,
          audit_level: restriction.audit_level
        };
      }
    }

    // Check role permissions
    const permissions = this.getEffectivePermissions(user.roles);

    // Check if user has execute action
    if (!permissions.actions.includes('execute') && !permissions.actions.includes('*')) {
      return {
        allowed: false,
        reason: `Your roles (${user.roles.join(', ')}) do not grant workflow execution permission`
      };
    }

    // Check workflow permission
    if (!this.matchesPattern(workflowName, permissions.workflows)) {
      if (this.config.deny_by_default) {
        return {
          allowed: false,
          reason: `Your roles (${user.roles.join(', ')}) do not grant access to workflow '${workflowName}'`
        };
      }
    }

    return {
      allowed: true,
      warning: restriction?.warning_message,
      audit_level: restriction?.audit_level
    };
  }

  /**
   * Check if user has a specific role
   */
  hasRole(user: UserContext, requiredRole: string): boolean {
    // Admin has all roles
    if (user.roles.includes('admin')) return true;
    return user.roles.includes(requiredRole);
  }

  /**
   * Get list of all roles
   */
  getAllRoles(): string[] {
    return Object.keys(this.config.roles);
  }

  /**
   * Get role details
   */
  getRoleDetails(roleName: string): Role | undefined {
    return this.config.roles[roleName];
  }

  /**
   * Format denial message for user display
   */
  formatDenialMessage(result: AuthorizationResult, resourceType: string, resourceName: string): string {
    const lines = [
      '╔══════════════════════════════════════════════════════════════════╗',
      '║                  🔒 Access Denied                                 ║',
      '╠══════════════════════════════════════════════════════════════════╣',
      '║                                                                   ║',
      `║  ${resourceType}: ${resourceName.padEnd(48)}║`,
      '║                                                                   ║',
    ];

    // Add reason (may need word wrapping)
    if (result.reason) {
      const reasonLines = this.wrapText(result.reason, 60);
      for (const line of reasonLines) {
        lines.push(`║  ${line.padEnd(63)}║`);
      }
    }

    lines.push('║                                                                   ║');

    // Add help text
    lines.push('║  To request access:                                              ║');
    lines.push('║  1. Contact your administrator                                   ║');
    lines.push('║  2. Request the appropriate role for your needs                  ║');
    lines.push('║                                                                   ║');

    // Add warning if present
    if (result.warning) {
      lines.push('╠══════════════════════════════════════════════════════════════════╣');
      const warningLines = this.wrapText(result.warning, 60);
      for (const line of warningLines) {
        lines.push(`║  ${line.padEnd(63)}║`);
      }
      lines.push('║                                                                   ║');
    }

    lines.push('╚══════════════════════════════════════════════════════════════════╝');

    return lines.join('\n');
  }

  /**
   * Word wrap text to specified width
   */
  private wrapText(text: string, width: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      if ((currentLine + ' ' + word).trim().length <= width) {
        currentLine = (currentLine + ' ' + word).trim();
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) lines.push(currentLine);

    return lines;
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let _instance: AuthorizationManager | null = null;

export function getAuthorizationManager(configPath?: string): AuthorizationManager {
  if (!_instance && configPath) {
    _instance = new AuthorizationManager(configPath);
  }
  if (!_instance) {
    throw new Error('AuthorizationManager not initialized. Provide configPath.');
  }
  return _instance;
}
```

---

#### Step 3: Integrate into Agent Activation and Workflow Execution

**File to Modify:** `_bmad/core/agents/abdul.md` (and all other agents)

**Add authorization step after authentication:**

```xml
<activation critical="MANDATORY">
  <step n="0" critical="SECURITY">
    🔐 AUTHENTICATION CHECK
    [... existing authentication step ...]
  </step>

  <!-- NEW: Authorization Step -->
  <step n="1" critical="SECURITY">
    🔒 AUTHORIZATION CHECK - AFTER AUTHENTICATION:

    1. Get user context from session:
       - user_id, user_name, roles, modules

    2. Determine agent path:
       - This agent: core/abdul

    3. Check authorization:
       - Call AuthorizationManager.canAccessAgent(user, "core/abdul")

    4. On authorization SUCCESS:
       - Log access granted (if audit_level requires)
       - Display warning if present
       - Proceed to step 2

    5. On authorization FAILURE:
       - Display formatted denial message
       - Log access denied with full details
       - DO NOT proceed - session ends

    AUTHORIZATION DENIED MESSAGE:
    ╔══════════════════════════════════════════════════════════════════╗
    ║                  🔒 Access Denied                                 ║
    ╠══════════════════════════════════════════════════════════════════╣
    ║                                                                   ║
    ║  Agent: {agent_path}                                             ║
    ║                                                                   ║
    ║  {denial_reason}                                                  ║
    ║                                                                   ║
    ║  Your roles: {user_roles}                                        ║
    ║  Required: {required_roles}                                       ║
    ║                                                                   ║
    ║  To request access:                                              ║
    ║  1. Contact your administrator                                   ║
    ║  2. Request the appropriate role                                 ║
    ║                                                                   ║
    ╚══════════════════════════════════════════════════════════════════╝
  </step>

  <!-- Existing steps renumbered: 1→2, 2→3, etc. -->
  <step n="2">Load persona from this current agent file</step>
  ...
</activation>
```

**File to Modify:** `_bmad/core/tasks/workflow.xml`

**Add authorization check before workflow execution:**

```xml
<security-directive id="workflow-authorization" mandatory="true" order="3">
  <description>
    Check user authorization before executing workflow.
    Blocks execution if user lacks required permissions.
  </description>

  <pre-execution-check>
    Before executing any workflow:

    1. Get user context from session
    2. Call AuthorizationManager.canExecuteWorkflow(user, workflow_name)
    3. If not allowed:
       - Display denial message with reason
       - Log authorization failure
       - STOP execution
    4. If requires_approval:
       - Display approval requirement message
       - Wait for explicit user confirmation
       - Log approval decision
    5. If allowed:
       - Display warning if present
       - Log workflow start with user context
       - Proceed with execution
  </pre-execution-check>

  <on-denied>
    ╔══════════════════════════════════════════════════════════════════╗
    ║                  🔒 Workflow Access Denied                        ║
    ╠══════════════════════════════════════════════════════════════════╣
    ║                                                                   ║
    ║  Workflow: {workflow_name}                                       ║
    ║                                                                   ║
    ║  {denial_reason}                                                  ║
    ║                                                                   ║
    ║  Your roles: {user_roles}                                        ║
    ║                                                                   ║
    ║  To request access, contact your administrator.                  ║
    ║                                                                   ║
    ╚══════════════════════════════════════════════════════════════════╝
  </on-denied>

  <on-approval-required>
    ╔══════════════════════════════════════════════════════════════════╗
    ║              ⚠️  Approval Required                                ║
    ╠══════════════════════════════════════════════════════════════════╣
    ║                                                                   ║
    ║  Workflow: {workflow_name}                                       ║
    ║                                                                   ║
    ║  This workflow requires explicit approval before execution.      ║
    ║                                                                   ║
    ║  {warning_message}                                                ║
    ║                                                                   ║
    ║  Type 'APPROVE' to confirm execution, or 'CANCEL' to abort.     ║
    ║                                                                   ║
    ╚══════════════════════════════════════════════════════════════════╝
  </on-approval-required>
</security-directive>
```

---

### 2.5 User Experience Impact

#### Role Assignment (Administrator Task)

When generating a user's token, roles are assigned:

```
$ npx ts-node _bmad/core/security/generate-token.ts

╔══════════════════════════════════════════════════════════════════╗
║              BMAD Authentication Token Generator                  ║
╚══════════════════════════════════════════════════════════════════╝

Enter your name: Alice
Enter your email: alice@example.com

Available roles:
  1. admin            - Full system access
  2. security_lead    - Security team lead
  3. security_analyst - Security analyst
  4. intel_analyst    - Intelligence analyst
  5. legal_counsel    - Legal team member
  6. developer        - Software developer
  7. product_manager  - Product manager
  8. strategist       - Strategic advisor
  9. viewer           - Read-only access

Enter role numbers (comma-separated): 6

Token generated with roles: developer
Accessible modules: bmm, bmgd, bmb, cis, core
```

---

#### Normal Access (Authorized)

**User with `developer` role accessing `bmm/dev` agent:**

```
User: /bmad:bmm:agents:dev

[Authorization check passes silently]

Amelia: Ready to execute your story. What's the task?
```

**No friction** - user has the required role.

---

#### Access Denied (Unauthorized)

**User with `developer` role trying to access `intel-team/osint-lead`:**

```
User: /bmad:intel-team:agents:osint-lead

╔══════════════════════════════════════════════════════════════════╗
║                  🔒 Access Denied                                 ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  Agent: intel-team/osint-lead                                    ║
║                                                                   ║
║  Module 'intel-team' requires one of these roles:                ║
║  intel_analyst, security_lead, admin                             ║
║                                                                   ║
║  Your roles: developer                                           ║
║                                                                   ║
║  To request access:                                              ║
║  1. Contact your administrator                                   ║
║  2. Request the intel_analyst role                               ║
║                                                                   ║
╠══════════════════════════════════════════════════════════════════╣
║  Intel-team contains sensitive intelligence gathering            ║
║  capabilities. Access is restricted to verified                  ║
║  intelligence professionals.                                     ║
╚══════════════════════════════════════════════════════════════════╝
```

**Clear explanation** of why access was denied and how to get it.

---

#### Workflow Requiring Approval

**User with `security_lead` role executing `incident-response-playbook`:**

```
User: Run incident-response-playbook

╔══════════════════════════════════════════════════════════════════╗
║              ⚠️  Approval Required                                ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  Workflow: incident-response-playbook                            ║
║                                                                   ║
║  This workflow requires explicit approval before execution.      ║
║                                                                   ║
║  This will initiate a formal incident response process.          ║
║  Ensure you have proper authorization for this incident.         ║
║                                                                   ║
║  Type 'APPROVE' to confirm execution, or 'CANCEL' to abort.     ║
║                                                                   ║
╚══════════════════════════════════════════════════════════════════╝

User: APPROVE

[Workflow execution begins]
```

**Approval gate** for sensitive workflows provides extra confirmation.

---

#### Credential Verification Required

**User with `intel_analyst` role but unverified credentials:**

```
User: /bmad:intel-team:agents:osint-lead

╔══════════════════════════════════════════════════════════════════╗
║                  🔒 Credential Verification Required              ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  Agent: intel-team/osint-lead                                    ║
║                                                                   ║
║  This resource requires verified professional credentials.       ║
║                                                                   ║
║  Your credentials have not been verified.                        ║
║                                                                   ║
║  To verify credentials:                                          ║
║  1. Contact your administrator                                   ║
║  2. Provide professional certification documentation             ║
║  3. Once verified, regenerate your token                         ║
║                                                                   ║
╚══════════════════════════════════════════════════════════════════╝
```

---

### 2.6 Files Summary for Solution 2.1

| File | Action | Description |
|------|--------|-------------|
| `_bmad/core/security/rbac-config.yaml` | CREATE | Role and permission definitions |
| `_bmad/core/security/authorization.ts` | CREATE | Authorization logic module |
| `_bmad/core/tasks/workflow.xml` | MODIFY | Add authorization directive |
| All agent files (100+) | MODIFY | Add authorization step |
| `_bmad/core/config.yaml` | MODIFY | Add RBAC enable/disable flag |

---

## 3. Solution 2.2: Audit Logging System

### 3.1 Problem Statement

**Current State:**
- No centralized logging of framework operations
- No record of who executed what workflow
- No trail of agent activations
- Git provides history but not real-time audit
- Incident investigation would be nearly impossible

**Risk Scenario:**
```
1. Suspicious activity detected in outputs
2. Need to determine: Who? What? When? From where?
3. No audit logs available
4. Investigation fails
5. Cannot attribute actions or assess impact
```

### 3.2 Proposed Solution: Comprehensive Audit Logging

**How It Works:**

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      AUDIT LOGGING SYSTEM                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   EVENT SOURCES                                                         │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│   │   Auth   │  │   Authz  │  │  Agent   │  │ Workflow │              │
│   │  Events  │  │  Events  │  │  Events  │  │  Events  │              │
│   └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘              │
│        │             │             │             │                      │
│        └─────────────┴─────────────┴─────────────┘                      │
│                             │                                            │
│                             ▼                                            │
│   ┌─────────────────────────────────────────────────────────────────┐  │
│   │                    AUDIT LOG PROCESSOR                           │  │
│   │                                                                   │  │
│   │  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐    │  │
│   │  │  Enrich   │─▶│  Filter   │─▶│  Format   │─▶│  Chain    │    │  │
│   │  │  Context  │  │  Events   │  │  Output   │  │  Hash     │    │  │
│   │  └───────────┘  └───────────┘  └───────────┘  └───────────┘    │  │
│   │                                                                   │  │
│   └─────────────────────────────────────────────────────────────────┘  │
│                             │                                            │
│                             ▼                                            │
│   ┌─────────────────────────────────────────────────────────────────┐  │
│   │                    STORAGE BACKENDS                              │  │
│   │                                                                   │  │
│   │  ┌───────────┐  ┌───────────┐  ┌───────────┐                    │  │
│   │  │   File    │  │   SIEM    │  │  Console  │                    │  │
│   │  │  (JSONL)  │  │  (CEF)    │  │  (Debug)  │                    │  │
│   │  └───────────┘  └───────────┘  └───────────┘                    │  │
│   │                                                                   │  │
│   └─────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│   LOG INTEGRITY                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐  │
│   │  Each log entry includes:                                        │  │
│   │  - SHA-256 hash of entry content                                 │  │
│   │  - Hash of previous entry (blockchain-style chain)               │  │
│   │  - Sequence number (monotonically increasing)                    │  │
│   │  - Tamper detection on read                                      │  │
│   └─────────────────────────────────────────────────────────────────┘  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

**Why This Design?**
- **Append-only** logs are harder to tamper with
- **Hash chaining** detects any modification to historical entries
- **Multiple backends** support enterprise SIEM integration
- **Filtering** prevents log flooding from verbose events
- **Zero user interaction** - completely invisible to users

### 3.3 Event Categories

| Category | Events | Severity |
|----------|--------|----------|
| **Authentication** | login_success, login_failure, logout, token_refresh, session_expired | INFO/CRITICAL |
| **Authorization** | access_granted, access_denied, role_checked | INFO/WARNING |
| **Agent** | activated, deactivated, command_executed | INFO |
| **Workflow** | started, step_executed, completed, failed, yolo_invoked | INFO/WARNING |
| **Security** | injection_detected, manipulation_detected, integrity_failed | CRITICAL |
| **File** | read, write, integrity_verified, integrity_failed | DEBUG/CRITICAL |
| **Config** | loaded, modified, invalid | INFO/WARNING |

### 3.4 Detailed Implementation

#### Step 1: Create Audit Configuration

**File:** `_bmad/core/security/audit-config.yaml`

```yaml
# =============================================================================
# BMAD AUDIT LOGGING CONFIGURATION
# =============================================================================
# Comprehensive audit logging for security, compliance, and forensics.
# Logs are tamper-evident with hash chaining for integrity verification.

audit:
  # Enable/disable audit logging (should always be true in production)
  enabled: true

  # ---------------------------------------------------------------------------
  # STORAGE CONFIGURATION
  # ---------------------------------------------------------------------------
  storage:
    # Primary storage type: file | siem | console
    type: file

    file:
      # Log file directory
      path: "{project-root}/_bmad-output/audit"

      # Log file format
      format: jsonl  # jsonl (one JSON per line), json (array), csv

      # File naming pattern (supports date placeholders)
      filename_pattern: "audit-{date}.jsonl"

      # Rotation settings
      rotation:
        enabled: true
        max_size_mb: 100
        max_age_days: 90
        compress_old: true

      # Retention settings
      retention:
        days: 365
        archive_after_days: 30

    # SIEM integration (for enterprise deployments)
    siem:
      enabled: false
      format: cef  # cef (Common Event Format), leef, json
      endpoint: ""
      api_key_env: "SIEM_API_KEY"
      batch_size: 100
      flush_interval_seconds: 30

    # Console output (for debugging)
    console:
      enabled: false
      level: warning  # Only show warnings and above

  # ---------------------------------------------------------------------------
  # EVENT FILTERING
  # ---------------------------------------------------------------------------
  events:
    # Events to include (supports wildcards)
    include:
      - "auth.*"
      - "authz.*"
      - "agent.*"
      - "workflow.*"
      - "security.*"
      - "config.*"

    # Events to exclude (takes precedence over include)
    exclude:
      - "file.read"         # Too verbose by default
      - "*.debug"           # Debug events

    # Event-specific configurations
    levels:
      auth.login_failure: critical
      auth.login_success: info
      authz.access_denied: warning
      authz.access_granted: info
      security.injection_detected: critical
      security.integrity_failed: critical
      workflow.yolo_invoked: warning
      workflow.started: info
      workflow.completed: info
      workflow.failed: warning
      agent.activated: info
      config.modified: warning
      default: info

  # ---------------------------------------------------------------------------
  # LOG INTEGRITY
  # ---------------------------------------------------------------------------
  integrity:
    # Enable hash chaining for tamper detection
    enabled: true

    # Hash algorithm for integrity verification
    algorithm: sha256

    # Include hash of previous entry (blockchain-style)
    chain_previous: true

    # Verify chain integrity on startup
    verify_on_startup: false  # Can be slow for large logs

  # ---------------------------------------------------------------------------
  # ENRICHMENT
  # ---------------------------------------------------------------------------
  enrichment:
    # Add these fields to every log entry
    include_fields:
      - timestamp
      - sequence
      - session_id
      - user_id
      - user_name
      - user_roles
      - source_ip     # If available
      - hostname

    # Redact sensitive data
    redact_patterns:
      - "password"
      - "token"
      - "secret"
      - "api_key"
      - "credential"

  # ---------------------------------------------------------------------------
  # ALERTING
  # ---------------------------------------------------------------------------
  alerting:
    # Alert on critical events
    enabled: false
    threshold:
      critical_per_minute: 5
      warning_per_minute: 50
    notification:
      type: file  # file | webhook | email
      path: "{project-root}/_bmad-output/audit/alerts.log"
```

---

#### Step 2: Create Audit Logger Module

**File:** `_bmad/core/security/audit-logger.ts`

```typescript
/**
 * BMAD Audit Logging System
 *
 * Comprehensive, tamper-evident audit logging for the BMAD framework.
 * Supports multiple storage backends and provides hash chain integrity.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import * as yaml from 'yaml';

// ============================================================================
// Types
// ============================================================================

export type EventCategory =
  | 'auth'
  | 'authz'
  | 'agent'
  | 'workflow'
  | 'security'
  | 'file'
  | 'config';

export type EventSeverity = 'debug' | 'info' | 'warning' | 'critical';

export type EventOutcome = 'success' | 'failure' | 'error' | 'pending';

export interface AuditActor {
  id: string;
  name: string;
  roles: string[];
  session_id: string;
  ip_address?: string;
}

export interface AuditTarget {
  type: string;      // agent | workflow | file | module | system
  id: string;
  name: string;
  module?: string;
}

export interface AuditEvent {
  // Event identification
  id: string;
  timestamp: string;
  sequence: number;

  // Event classification
  type: string;
  category: EventCategory;
  severity: EventSeverity;

  // Actor information
  actor: AuditActor;

  // Target information
  target: AuditTarget;

  // Event details
  action: string;
  outcome: EventOutcome;
  reason?: string;
  details?: Record<string, any>;

  // Enrichment
  hostname?: string;

  // Integrity
  integrity: {
    hash: string;
    previous_hash: string;
  };
}

export interface AuditConfig {
  enabled: boolean;
  storage: {
    type: string;
    file: {
      path: string;
      format: string;
      filename_pattern: string;
      rotation: any;
      retention: any;
    };
    siem?: any;
    console?: any;
  };
  events: {
    include: string[];
    exclude: string[];
    levels: Record<string, string>;
  };
  integrity: {
    enabled: boolean;
    algorithm: string;
    chain_previous: boolean;
  };
  enrichment: {
    include_fields: string[];
    redact_patterns: string[];
  };
}

// ============================================================================
// Audit Logger Class
// ============================================================================

export class AuditLogger {
  private config: AuditConfig;
  private sequence: number = 0;
  private previousHash: string = '0'.repeat(64);
  private logStream: fs.WriteStream | null = null;
  private currentLogFile: string = '';
  private hostname: string;

  constructor(configPath: string) {
    const content = fs.readFileSync(configPath, 'utf-8');
    const parsed = yaml.parse(content);
    this.config = parsed.audit;
    this.hostname = require('os').hostname();
    this.initializeStorage();
  }

  /**
   * Initialize storage backend
   */
  private initializeStorage(): void {
    if (!this.config.enabled) return;

    if (this.config.storage.type === 'file') {
      const logDir = this.resolvePath(this.config.storage.file.path);

      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }

      this.rotateLogFile();
    }
  }

  /**
   * Resolve path with variable substitution
   */
  private resolvePath(pathTemplate: string): string {
    return pathTemplate.replace('{project-root}', process.cwd());
  }

  /**
   * Get current date string for log file naming
   */
  private getDateString(): string {
    return new Date().toISOString().split('T')[0];
  }

  /**
   * Rotate log file if needed
   */
  private rotateLogFile(): void {
    const logDir = this.resolvePath(this.config.storage.file.path);
    const pattern = this.config.storage.file.filename_pattern;
    const filename = pattern.replace('{date}', this.getDateString());
    const logFile = path.join(logDir, filename);

    if (logFile !== this.currentLogFile) {
      // Close existing stream
      if (this.logStream) {
        this.logStream.end();
      }

      // Load previous hash from existing file if present
      if (fs.existsSync(logFile)) {
        this.loadPreviousHash(logFile);
      }

      // Open new stream
      this.logStream = fs.createWriteStream(logFile, { flags: 'a' });
      this.currentLogFile = logFile;
    }
  }

  /**
   * Load previous hash from last entry in existing log file
   */
  private loadPreviousHash(logFile: string): void {
    try {
      const content = fs.readFileSync(logFile, 'utf-8');
      const lines = content.trim().split('\n');
      if (lines.length > 0) {
        const lastLine = lines[lines.length - 1];
        const lastEntry = JSON.parse(lastLine) as AuditEvent;
        this.previousHash = lastEntry.integrity.hash;
        this.sequence = lastEntry.sequence;
      }
    } catch {
      // Start fresh if file is corrupted
      this.previousHash = '0'.repeat(64);
      this.sequence = 0;
    }
  }

  /**
   * Check if event type should be logged
   */
  private shouldLog(eventType: string): boolean {
    // Check exclusions first
    for (const pattern of this.config.events.exclude) {
      if (this.matchPattern(eventType, pattern)) return false;
    }

    // Check inclusions
    for (const pattern of this.config.events.include) {
      if (this.matchPattern(eventType, pattern)) return true;
    }

    return false;
  }

  /**
   * Match event type against pattern
   */
  private matchPattern(value: string, pattern: string): boolean {
    if (pattern === '*') return true;
    if (pattern.endsWith('*')) {
      return value.startsWith(pattern.slice(0, -1));
    }
    return value === pattern;
  }

  /**
   * Get severity level for event type
   */
  private getSeverity(eventType: string): EventSeverity {
    const level = this.config.events.levels[eventType];
    if (level) return level as EventSeverity;
    return (this.config.events.levels.default || 'info') as EventSeverity;
  }

  /**
   * Compute SHA-256 hash of event
   */
  private computeHash(event: Omit<AuditEvent, 'integrity'> & { integrity: { hash: '', previous_hash: string } }): string {
    const content = JSON.stringify(event);
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  /**
   * Redact sensitive data from details
   */
  private redactSensitiveData(details: Record<string, any>): Record<string, any> {
    const redacted: Record<string, any> = {};

    for (const [key, value] of Object.entries(details)) {
      const keyLower = key.toLowerCase();
      const shouldRedact = this.config.enrichment.redact_patterns.some(
        pattern => keyLower.includes(pattern.toLowerCase())
      );

      if (shouldRedact) {
        redacted[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        redacted[key] = this.redactSensitiveData(value);
      } else {
        redacted[key] = value;
      }
    }

    return redacted;
  }

  /**
   * Main logging method
   */
  async log(
    eventType: string,
    category: EventCategory,
    actor: AuditActor,
    target: AuditTarget,
    action: string,
    outcome: EventOutcome,
    details?: Record<string, any>,
    reason?: string
  ): Promise<void> {
    if (!this.config.enabled) return;
    if (!this.shouldLog(eventType)) return;

    // Rotate file if date changed
    this.rotateLogFile();

    // Build event
    const event: AuditEvent = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      sequence: ++this.sequence,
      type: eventType,
      category,
      severity: this.getSeverity(eventType),
      actor,
      target,
      action,
      outcome,
      reason,
      details: details ? this.redactSensitiveData(details) : undefined,
      hostname: this.hostname,
      integrity: {
        hash: '',
        previous_hash: this.previousHash
      }
    };

    // Compute integrity hash
    event.integrity.hash = this.computeHash(event as any);
    this.previousHash = event.integrity.hash;

    // Write to storage
    this.writeEvent(event);
  }

  /**
   * Write event to configured storage
   */
  private writeEvent(event: AuditEvent): void {
    if (this.config.storage.type === 'file' && this.logStream) {
      this.logStream.write(JSON.stringify(event) + '\n');
    }

    if (this.config.storage.console?.enabled) {
      const severityColors: Record<string, string> = {
        critical: '\x1b[31m', // Red
        warning: '\x1b[33m',  // Yellow
        info: '\x1b[36m',     // Cyan
        debug: '\x1b[90m'     // Gray
      };
      const color = severityColors[event.severity] || '';
      const reset = '\x1b[0m';
      console.log(
        `${color}[AUDIT] ${event.timestamp} ${event.type} ` +
        `${event.actor.name} -> ${event.target.name}: ${event.action} (${event.outcome})${reset}`
      );
    }
  }

  // ===========================================================================
  // Convenience Methods for Common Events
  // ===========================================================================

  async logAuthSuccess(actor: AuditActor, method: string): Promise<void> {
    await this.log(
      'auth.login_success',
      'auth',
      actor,
      { type: 'system', id: 'bmad', name: 'BMAD Framework' },
      'authenticate',
      'success',
      { method }
    );
  }

  async logAuthFailure(actorName: string, reason: string, details?: any): Promise<void> {
    await this.log(
      'auth.login_failure',
      'auth',
      {
        id: 'unknown',
        name: actorName,
        roles: [],
        session_id: 'none'
      },
      { type: 'system', id: 'bmad', name: 'BMAD Framework' },
      'authenticate',
      'failure',
      details,
      reason
    );
  }

  async logAccessGranted(
    actor: AuditActor,
    targetType: string,
    targetName: string,
    targetModule?: string
  ): Promise<void> {
    await this.log(
      'authz.access_granted',
      'authz',
      actor,
      { type: targetType, id: targetName, name: targetName, module: targetModule },
      'authorize',
      'success'
    );
  }

  async logAccessDenied(
    actor: AuditActor,
    targetType: string,
    targetName: string,
    reason: string,
    targetModule?: string
  ): Promise<void> {
    await this.log(
      'authz.access_denied',
      'authz',
      actor,
      { type: targetType, id: targetName, name: targetName, module: targetModule },
      'authorize',
      'failure',
      undefined,
      reason
    );
  }

  async logAgentActivation(
    actor: AuditActor,
    agentName: string,
    agentModule: string
  ): Promise<void> {
    await this.log(
      'agent.activated',
      'agent',
      actor,
      { type: 'agent', id: agentName, name: agentName, module: agentModule },
      'activate',
      'success'
    );
  }

  async logWorkflowStart(
    actor: AuditActor,
    workflowName: string,
    workflowModule?: string,
    yoloMode: boolean = false
  ): Promise<void> {
    const eventType = yoloMode ? 'workflow.yolo_invoked' : 'workflow.started';
    await this.log(
      eventType,
      'workflow',
      actor,
      { type: 'workflow', id: workflowName, name: workflowName, module: workflowModule },
      'start',
      'pending',
      { yolo_mode: yoloMode }
    );
  }

  async logWorkflowComplete(
    actor: AuditActor,
    workflowName: string,
    duration_ms: number,
    workflowModule?: string
  ): Promise<void> {
    await this.log(
      'workflow.completed',
      'workflow',
      actor,
      { type: 'workflow', id: workflowName, name: workflowName, module: workflowModule },
      'complete',
      'success',
      { duration_ms }
    );
  }

  async logWorkflowFailure(
    actor: AuditActor,
    workflowName: string,
    error: string,
    workflowModule?: string
  ): Promise<void> {
    await this.log(
      'workflow.failed',
      'workflow',
      actor,
      { type: 'workflow', id: workflowName, name: workflowName, module: workflowModule },
      'execute',
      'error',
      undefined,
      error
    );
  }

  async logSecurityEvent(
    actor: AuditActor,
    eventType: string,
    target: AuditTarget,
    details: any
  ): Promise<void> {
    await this.log(
      eventType,
      'security',
      actor,
      target,
      'detect',
      'success',
      details
    );
  }

  // ===========================================================================
  // Integrity Verification
  // ===========================================================================

  /**
   * Verify integrity of audit log file
   */
  verifyLogIntegrity(logFile: string): {
    valid: boolean;
    entries: number;
    errors: Array<{ line: number; error: string }>;
  } {
    const errors: Array<{ line: number; error: string }> = [];
    let previousHash = '0'.repeat(64);
    let lineNumber = 0;

    try {
      const content = fs.readFileSync(logFile, 'utf-8');
      const lines = content.trim().split('\n');

      for (const line of lines) {
        lineNumber++;

        try {
          const entry = JSON.parse(line) as AuditEvent;

          // Verify previous hash chain
          if (entry.integrity.previous_hash !== previousHash) {
            errors.push({
              line: lineNumber,
              error: `Chain broken: expected previous_hash ${previousHash.slice(0, 16)}...`
            });
          }

          // Verify entry hash
          const savedHash = entry.integrity.hash;
          entry.integrity.hash = '';
          const computedHash = this.computeHash(entry as any);
          entry.integrity.hash = savedHash;

          if (computedHash !== savedHash) {
            errors.push({
              line: lineNumber,
              error: 'Entry hash mismatch - possible tampering'
            });
          }

          previousHash = savedHash;

        } catch (parseError) {
          errors.push({
            line: lineNumber,
            error: `Parse error: ${parseError}`
          });
        }
      }

      return {
        valid: errors.length === 0,
        entries: lineNumber,
        errors
      };

    } catch (readError) {
      return {
        valid: false,
        entries: 0,
        errors: [{ line: 0, error: `Cannot read file: ${readError}` }]
      };
    }
  }

  /**
   * Close the logger gracefully
   */
  async close(): Promise<void> {
    if (this.logStream) {
      this.logStream.end();
    }
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let _instance: AuditLogger | null = null;

export function getAuditLogger(configPath?: string): AuditLogger {
  if (!_instance && configPath) {
    _instance = new AuditLogger(configPath);
  }
  if (!_instance) {
    throw new Error('AuditLogger not initialized. Provide configPath.');
  }
  return _instance;
}
```

---

#### Step 3: Integrate Audit Logging Throughout Framework

**Integration Points:**

| Location | Events to Log |
|----------|---------------|
| Session Manager | auth.login_success, auth.login_failure, auth.session_expired |
| Authorization Manager | authz.access_granted, authz.access_denied |
| Agent Activation | agent.activated, agent.deactivated |
| Workflow Executor | workflow.started, workflow.completed, workflow.failed, workflow.yolo_invoked |
| Integrity Verifier | security.integrity_failed |
| Injection Detector | security.injection_detected |

**File to Modify:** `_bmad/core/security/session-manager.ts`

Add audit logging calls:

```typescript
// In authenticate() method, after successful authentication:
const auditLogger = getAuditLogger();
await auditLogger.logAuthSuccess(
  {
    id: claims.sub,
    name: claims.name,
    roles: claims.roles,
    session_id: session.id
  },
  'local_token'
);

// On authentication failure:
await auditLogger.logAuthFailure(
  'unknown',
  'Token validation failed',
  { reason: 'expired' }
);
```

---

### 3.5 User Experience Impact

#### Normal Operation

**What Users See:** Nothing. Audit logging is completely invisible.

```
User: /bmad:core:agents:abdul

[Behind the scenes: auth.login_success logged]
[Behind the scenes: authz.access_granted logged]
[Behind the scenes: agent.activated logged]

Welcome back, J! I'm Abdul...
```

**Zero friction** - no user interaction with audit system.

---

#### Audit Log Output (For Administrators)

**Log file:** `_bmad-output/audit/audit-2026-01-13.jsonl`

```json
{"id":"a1b2c3d4","timestamp":"2026-01-13T12:00:00.000Z","sequence":1,"type":"auth.login_success","category":"auth","severity":"info","actor":{"id":"user-123","name":"J","roles":["admin"],"session_id":"sess-456"},"target":{"type":"system","id":"bmad","name":"BMAD Framework"},"action":"authenticate","outcome":"success","details":{"method":"local_token"},"hostname":"workstation","integrity":{"hash":"abc123...","previous_hash":"000000..."}}
{"id":"e5f6g7h8","timestamp":"2026-01-13T12:00:01.000Z","sequence":2,"type":"agent.activated","category":"agent","severity":"info","actor":{"id":"user-123","name":"J","roles":["admin"],"session_id":"sess-456"},"target":{"type":"agent","id":"abdul","name":"abdul","module":"core"},"action":"activate","outcome":"success","hostname":"workstation","integrity":{"hash":"def456...","previous_hash":"abc123..."}}
```

---

#### Integrity Verification (For Security Teams)

```
$ npx ts-node _bmad/core/security/verify-audit-logs.ts

╔══════════════════════════════════════════════════════════════════╗
║                 Audit Log Integrity Verification                  ║
╚══════════════════════════════════════════════════════════════════╝

Checking: _bmad-output/audit/audit-2026-01-13.jsonl

Entries verified: 1,247
Chain integrity: ✓ VALID
Hash verification: ✓ ALL PASSED

No tampering detected.
```

---

### 3.6 Files Summary for Solution 2.2

| File | Action | Description |
|------|--------|-------------|
| `_bmad/core/security/audit-config.yaml` | CREATE | Audit configuration |
| `_bmad/core/security/audit-logger.ts` | CREATE | Audit logging module |
| `_bmad/core/security/verify-audit-logs.ts` | CREATE | Integrity verification CLI |
| `_bmad/core/security/session-manager.ts` | MODIFY | Add audit logging calls |
| `_bmad/core/security/authorization.ts` | MODIFY | Add audit logging calls |
| `_bmad/core/tasks/workflow.xml` | MODIFY | Add workflow audit logging |
| All agent files | MODIFY | Add activation audit logging |
| `.gitignore` | MODIFY | Optionally exclude audit logs |

---

## 4. Implementation Order & Dependencies

### Dependency Graph

```
Phase 1 Prerequisites:
┌─────────────────┐
│ 1.2 Auth System │ (REQUIRED for Phase 2)
└────────┬────────┘
         │
         ▼
Phase 2 Components:
┌─────────────────┐   ┌─────────────────┐
│   2.1 RBAC      │──▶│ 2.2 Audit Log   │
│  (needs users)  │   │ (needs events)  │
└─────────────────┘   └─────────────────┘
```

### Recommended Implementation Order

| Order | Solution | Duration | Prerequisites |
|-------|----------|----------|---------------|
| 1 | 2.1 RBAC Configuration | 2 days | Auth system (1.2) |
| 2 | 2.1 Authorization Module | 3 days | RBAC config |
| 3 | 2.1 Integration | 3 days | Authorization module |
| 4 | 2.2 Audit Configuration | 1 day | None |
| 5 | 2.2 Audit Logger Module | 3 days | Audit config |
| 6 | 2.2 Integration | 2 days | Audit logger, RBAC |

### Week-by-Week Schedule

**Week 4:**
- Day 1-2: Create RBAC configuration file
- Day 3-5: Implement authorization module

**Week 5:**
- Day 1-3: Integrate authorization into agents and workflows
- Day 3-5: Create audit configuration and logger module

**Week 6:**
- Day 1-2: Integrate audit logging throughout framework
- Day 3-4: Create integrity verification tool
- Day 5: Testing and documentation

---

## 5. Files Requiring Updates

### Complete File Inventory

#### New Files to Create

| File | Solution | Size Est. | Purpose |
|------|----------|-----------|---------|
| `_bmad/core/security/rbac-config.yaml` | 2.1 | 8 KB | Role and permission definitions |
| `_bmad/core/security/authorization.ts` | 2.1 | 10 KB | Authorization logic |
| `_bmad/core/security/audit-config.yaml` | 2.2 | 4 KB | Audit configuration |
| `_bmad/core/security/audit-logger.ts` | 2.2 | 12 KB | Audit logging system |
| `_bmad/core/security/verify-audit-logs.ts` | 2.2 | 3 KB | Integrity verification |

#### Files to Modify

| File | Solution | Changes |
|------|----------|---------|
| `_bmad/core/tasks/workflow.xml` | 2.1, 2.2 | Add authorization + audit directives |
| `_bmad/core/security/session-manager.ts` | 2.2 | Add audit logging |
| `_bmad/core/security/authorization.ts` | 2.2 | Add audit logging |
| All agent files (100+) | 2.1 | Add authorization step |
| `_bmad/core/config.yaml` | 2.1, 2.2 | Add enable flags |

---

## 6. Testing & Validation

### Test Cases for Solution 2.1 (RBAC)

| Test | Expected Result |
|------|-----------------|
| Admin accesses any agent | Allowed |
| Developer accesses bmm/dev | Allowed |
| Developer accesses intel-team/osint-lead | Denied with clear message |
| Security analyst accesses cybersec-team agent | Allowed |
| Viewer tries to execute workflow | Denied (no execute permission) |
| Role inheritance resolves correctly | Child has parent permissions |
| Circular inheritance detected | Error thrown on config load |
| Credential verification required | Denied if not verified |
| Workflow requiring approval | Approval prompt shown |
| Module restriction enforced | Cannot access restricted module |

### Test Cases for Solution 2.2 (Audit Logging)

| Test | Expected Result |
|------|-----------------|
| Successful auth logged | Entry in audit log |
| Failed auth logged | Entry with failure reason |
| Access denied logged | Entry with denial reason |
| Agent activation logged | Entry with agent details |
| Workflow start/complete logged | Entries with timing |
| YOLO mode logged as warning | Entry with warning severity |
| Sensitive data redacted | Passwords show [REDACTED] |
| Hash chain maintains integrity | Sequential hashes verify |
| Tampered log detected | Integrity verification fails |
| Log rotation works | New file created on date change |

---

## Summary

### Solution Comparison

| Solution | User Friction | Security Value | Implementation Effort |
|----------|---------------|----------------|----------------------|
| 2.1 RBAC | Medium | Very High | High |
| 2.2 Audit Logging | Zero | Very High | Medium |

### User Experience Summary

| Scenario | Solution 2.1 (RBAC) | Solution 2.2 (Audit) |
|----------|---------------------|----------------------|
| Normal access | Invisible | Invisible |
| Access denied | Clear explanation | N/A (no user interaction) |
| Sensitive workflow | Approval prompt | Logged automatically |
| Investigation | N/A | Full audit trail |

### Key Takeaways

1. **RBAC adds meaningful friction only when access is denied** - authorized users see no change
2. **Audit logging is completely invisible** - zero user impact
3. **Both solutions require authentication (Phase 1.2)** as prerequisite
4. **Role assignment happens at token generation** - one-time admin task
5. **Audit logs are tamper-evident** - hash chain detects modifications

---

*End of Phase 2 Detailed Implementation Guide*
