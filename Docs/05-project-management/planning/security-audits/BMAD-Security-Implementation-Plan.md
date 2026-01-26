# BMAD Framework Security Remediation Implementation Plan

**Project:** BMAD-Security-Review
**Document Type:** Implementation Plan
**Based On:** BMAD-Security-Audit-Report.md
**Author:** Bastion (Security Architect)
**Date:** 2026-01-13
**Version:** 1.1
**Last Updated:** 2026-01-15

---

## Implementation Progress Summary

| Phase | Status | Completion |
|-------|--------|------------|
| **Phase 1** | ✅ **COMPLETE** | 100% |
| **Phase 2** | ⏳ Not Started | 0% |
| **Phase 3** | ⏳ Not Started | 0% |
| **Phase 4** | ⏳ Not Started | 0% |

---

## Executive Summary

This implementation plan addresses the 20 security findings identified in the BMAD Framework Security Audit. The plan is organized into 4 phases over 12 weeks, prioritizing critical vulnerabilities first while building toward a production-ready security posture.

### Implementation Overview

| Phase | Focus | Duration | Key Deliverables | Status |
|-------|-------|----------|------------------|--------|
| **Phase 1** | Foundation & Critical Fixes | Weeks 1-3 | File signing, authentication framework | ✅ COMPLETE |
| **Phase 2** | Access Control & Audit | Weeks 4-6 | RBAC, audit logging system | ⏳ Next |
| **Phase 3** | Data Protection & Hardening | Weeks 7-9 | Encryption, shell hardening, sandboxing | ⏳ Pending |
| **Phase 4** | Advanced Security & Compliance | Weeks 10-12 | Rate limiting, compliance validation | ⏳ Pending |

### Resource Requirements

| Role | Allocation | Responsibilities |
|------|------------|------------------|
| Security Architect | 50% | Architecture, review, guidance |
| Backend Developer | 100% | Core implementation |
| DevOps Engineer | 50% | Infrastructure, CI/CD integration |
| QA Engineer | 25% | Security testing |

---

## Phase 1: Foundation & Critical Fixes (Weeks 1-3)

### Objective
Address the most critical vulnerabilities: file integrity and authentication.

---

### 1.1 File Integrity Verification System

**Finding Addressed:** CRITICAL - No file integrity verification
**Target:** Week 1-2

#### 1.1.1 Design Specification

**Architecture:**
```
┌─────────────────────────────────────────────────────────────┐
│                    File Integrity System                     │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────┐ │
│  │ GPG Keyring │───▶│  Signature  │───▶│   Verification  │ │
│  │             │    │  Generator  │    │     Engine      │ │
│  └─────────────┘    └─────────────┘    └─────────────────┘ │
│         │                  │                    │           │
│         ▼                  ▼                    ▼           │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────┐ │
│  │  Key Store  │    │ .sig Files  │    │  Load Blocker   │ │
│  │  (secure)   │    │ (per file)  │    │  (if invalid)   │ │
│  └─────────────┘    └─────────────┘    └─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**Files to Sign:**
- All `*.md` agent files (100+)
- All `*.yaml` workflow configurations (150+)
- All `*.xml` task files (6)
- All `*.yaml` schema files
- All `config.yaml` files
- All shell scripts in `.claude/hooks/`

#### 1.1.2 Implementation Tasks

| Task | Description | Assignee | Est. Hours |
|------|-------------|----------|------------|
| 1.1.2.1 | Create GPG key pair for BMAD signing | DevOps | 2 |
| 1.1.2.2 | Develop signature generation script | Backend | 8 |
| 1.1.2.3 | Develop signature verification module | Backend | 16 |
| 1.1.2.4 | Integrate verification into workflow.xml loader | Backend | 8 |
| 1.1.2.5 | Create CI/CD hook for auto-signing on commit | DevOps | 4 |
| 1.1.2.6 | Sign all existing framework files | DevOps | 4 |
| 1.1.2.7 | Document key management procedures | Security | 4 |
| 1.1.2.8 | Test signature verification edge cases | QA | 8 |

#### 1.1.3 Technical Implementation

**Signature Generation Script (`_bmad/core/security/sign-files.sh`):**
```bash
#!/bin/bash
# BMAD File Signing Script
# Signs all framework files with BMAD signing key

BMAD_KEY_ID="${BMAD_SIGNING_KEY:-bmad-framework@internal}"
SIGN_EXTENSIONS=("md" "yaml" "xml" "sh")

sign_file() {
    local file="$1"
    gpg --armor --detach-sign --local-user "$BMAD_KEY_ID" "$file"
    echo "Signed: $file -> ${file}.asc"
}

find_and_sign() {
    local dir="$1"
    for ext in "${SIGN_EXTENSIONS[@]}"; do
        find "$dir" -name "*.$ext" -type f | while read -r file; do
            sign_file "$file"
        done
    done
}

# Sign all BMAD framework files
find_and_sign "_bmad/"
find_and_sign ".claude/hooks/"

echo "Signing complete."
```

**Verification Module (`_bmad/core/security/verify-integrity.ts`):**
```typescript
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

interface VerificationResult {
  file: string;
  valid: boolean;
  error?: string;
  signedBy?: string;
  signedAt?: Date;
}

export class IntegrityVerifier {
  private trustedKeyIds: string[];

  constructor(trustedKeys: string[]) {
    this.trustedKeyIds = trustedKeys;
  }

  verifyFile(filePath: string): VerificationResult {
    const sigPath = `${filePath}.asc`;

    // Check signature file exists
    if (!fs.existsSync(sigPath)) {
      return {
        file: filePath,
        valid: false,
        error: 'Signature file not found'
      };
    }

    try {
      // Verify signature using GPG
      const result = execSync(
        `gpg --verify "${sigPath}" "${filePath}" 2>&1`,
        { encoding: 'utf-8' }
      );

      // Parse GPG output for signer info
      const signerMatch = result.match(/Good signature from "([^"]+)"/);
      const dateMatch = result.match(/Signature made (.+)/);

      return {
        file: filePath,
        valid: true,
        signedBy: signerMatch?.[1],
        signedAt: dateMatch ? new Date(dateMatch[1]) : undefined
      };
    } catch (error: any) {
      return {
        file: filePath,
        valid: false,
        error: error.message || 'Verification failed'
      };
    }
  }

  verifyDirectory(dirPath: string, extensions: string[]): VerificationResult[] {
    const results: VerificationResult[] = [];

    const walkDir = (dir: string) => {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          walkDir(fullPath);
        } else if (extensions.some(ext => file.endsWith(`.${ext}`))) {
          results.push(this.verifyFile(fullPath));
        }
      }
    };

    walkDir(dirPath);
    return results;
  }

  enforceIntegrity(filePath: string): void {
    const result = this.verifyFile(filePath);
    if (!result.valid) {
      throw new Error(
        `SECURITY VIOLATION: File integrity check failed for ${filePath}. ` +
        `Error: ${result.error}. Framework load blocked.`
      );
    }
  }
}
```

**Integration Point (workflow.xml modification):**
```xml
<!-- Add to workflow.xml before file loading -->
<security-check type="integrity" mandatory="true">
  <description>Verify file signature before loading</description>
  <action>
    Before loading ANY workflow, agent, or configuration file:
    1. Check for corresponding .asc signature file
    2. Verify signature using trusted BMAD signing key
    3. If verification fails: STOP, log security event, alert user
    4. If verification passes: proceed with file loading
  </action>
  <on-failure>
    CRITICAL SECURITY ALERT: File integrity verification failed.
    File may have been tampered with. Loading blocked.
    Contact security team immediately.
  </on-failure>
</security-check>
```

#### 1.1.4 Acceptance Criteria ✅ COMPLETE (2026-01-15)

- [x] All framework files have corresponding `.asc` signature files
- [x] Verification runs automatically before any file load
- [x] Tampered files are blocked from loading
- [x] Clear error messages identify which file failed verification
- [x] CI/CD auto-signs files on merge to main branch
- [x] Key rotation procedure documented and tested

**Implementation Notes:**
- GPG key pair created (RSA-4096): `_bmad/core/security/bmad-public-key.asc`
- Manifest-based approach: `MANIFEST.sha256` with 679 files protected
- Scripts: `sign-manifest.sh`, `verify-integrity.sh`
- Documentation: `docs/Features/Security-File-Integrity.md`

---

### 1.2 Authentication System

**Finding Addressed:** CRITICAL - No authentication system
**Target:** Week 2-3

#### 1.2.1 Design Specification

**Architecture:**
```
┌─────────────────────────────────────────────────────────────┐
│                   Authentication System                      │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────┐ │
│  │   Token     │───▶│   Session   │───▶│    Identity     │ │
│  │  Provider   │    │   Manager   │    │    Context      │ │
│  └─────────────┘    └─────────────┘    └─────────────────┘ │
│         │                  │                    │           │
│         ▼                  ▼                    ▼           │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────┐ │
│  │  JWT/PASETO │    │  Session    │    │   User Info     │ │
│  │   Tokens    │    │   Store     │    │   (verified)    │ │
│  └─────────────┘    └─────────────┘    └─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**Authentication Methods:**
1. **Local Token** - File-based token for single-user scenarios
2. **Environment Token** - Token from environment variable
3. **SSO Integration** - OAuth2/OIDC for enterprise scenarios (future)

#### 1.2.2 Implementation Tasks

| Task | Description | Assignee | Est. Hours |
|------|-------------|----------|------------|
| 1.2.2.1 | Design token format and claims | Security | 4 |
| 1.2.2.2 | Implement token generation utility | Backend | 8 |
| 1.2.2.3 | Implement token validation module | Backend | 12 |
| 1.2.2.4 | Create session manager | Backend | 8 |
| 1.2.2.5 | Integrate auth check into agent activation | Backend | 8 |
| 1.2.2.6 | Create user identity context provider | Backend | 4 |
| 1.2.2.7 | Update config.yaml schema for auth settings | Backend | 2 |
| 1.2.2.8 | Document authentication setup procedures | Security | 4 |
| 1.2.2.9 | Security testing of auth implementation | QA | 8 |

#### 1.2.3 Technical Implementation

**Token Structure (PASETO v4):**
```json
{
  "sub": "user-uuid",
  "name": "J",
  "email": "j@example.com",
  "roles": ["admin", "intel-analyst"],
  "modules": ["*"],
  "iat": "2026-01-13T00:00:00Z",
  "exp": "2026-01-14T00:00:00Z",
  "jti": "unique-token-id"
}
```

**Authentication Configuration (`_bmad/core/security/auth-config.yaml`):**
```yaml
# BMAD Authentication Configuration
authentication:
  enabled: true
  method: local_token  # local_token | env_token | sso

  local_token:
    token_file: "{project-root}/.bmad-token"
    max_age_hours: 24

  env_token:
    variable_name: "BMAD_AUTH_TOKEN"

  sso:  # Future implementation
    provider: oauth2
    issuer_url: ""
    client_id: ""

  session:
    timeout_minutes: 480  # 8 hours
    refresh_enabled: true

  security:
    require_auth_for_all: true
    allow_anonymous_read: false
    token_algorithm: "paseto-v4"
```

**Token Generator (`_bmad/core/security/generate-token.ts`):**
```typescript
import { V4 } from 'paseto';
import { randomUUID } from 'crypto';
import * as fs from 'fs';

interface TokenClaims {
  sub: string;
  name: string;
  email?: string;
  roles: string[];
  modules: string[];
}

export class TokenGenerator {
  private secretKey: Buffer;

  constructor(keyPath: string) {
    this.secretKey = fs.readFileSync(keyPath);
  }

  async generateToken(claims: TokenClaims, expiresInHours: number = 24): Promise<string> {
    const now = new Date();
    const exp = new Date(now.getTime() + expiresInHours * 60 * 60 * 1000);

    const payload = {
      ...claims,
      iat: now.toISOString(),
      exp: exp.toISOString(),
      jti: randomUUID()
    };

    return await V4.encrypt(payload, this.secretKey);
  }

  async validateToken(token: string): Promise<TokenClaims | null> {
    try {
      const payload = await V4.decrypt(token, this.secretKey);

      // Check expiration
      if (new Date(payload.exp) < new Date()) {
        return null;
      }

      return payload as TokenClaims;
    } catch {
      return null;
    }
  }
}
```

**Session Manager (`_bmad/core/security/session-manager.ts`):**
```typescript
import { TokenGenerator } from './generate-token';
import * as fs from 'fs';
import * as path from 'path';

interface Session {
  id: string;
  userId: string;
  userName: string;
  roles: string[];
  modules: string[];
  createdAt: Date;
  lastActivity: Date;
  expiresAt: Date;
}

export class SessionManager {
  private sessions: Map<string, Session> = new Map();
  private tokenGenerator: TokenGenerator;
  private timeoutMinutes: number;

  constructor(tokenGenerator: TokenGenerator, timeoutMinutes: number = 480) {
    this.tokenGenerator = tokenGenerator;
    this.timeoutMinutes = timeoutMinutes;
  }

  async createSession(token: string): Promise<Session | null> {
    const claims = await this.tokenGenerator.validateToken(token);
    if (!claims) return null;

    const session: Session = {
      id: crypto.randomUUID(),
      userId: claims.sub,
      userName: claims.name,
      roles: claims.roles,
      modules: claims.modules,
      createdAt: new Date(),
      lastActivity: new Date(),
      expiresAt: new Date(Date.now() + this.timeoutMinutes * 60 * 1000)
    };

    this.sessions.set(session.id, session);
    return session;
  }

  getSession(sessionId: string): Session | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    // Check expiration
    if (session.expiresAt < new Date()) {
      this.sessions.delete(sessionId);
      return null;
    }

    // Update last activity
    session.lastActivity = new Date();
    return session;
  }

  getCurrentUser(sessionId: string): { name: string; roles: string[] } | null {
    const session = this.getSession(sessionId);
    if (!session) return null;
    return { name: session.userName, roles: session.roles };
  }

  endSession(sessionId: string): void {
    this.sessions.delete(sessionId);
  }
}
```

**Agent Activation Integration:**
```xml
<!-- Add to agent activation steps -->
<step n="0" critical="SECURITY">
  AUTHENTICATION CHECK - BEFORE ANY OTHER STEP:
  1. Check for valid BMAD session token
  2. If no token: prompt user to authenticate
  3. If invalid token: reject activation, log security event
  4. If valid token: extract user identity, proceed to step 1

  Store authenticated user in session:
  - {authenticated_user_id}
  - {authenticated_user_name}
  - {authenticated_user_roles}
  - {authenticated_user_modules}
</step>
```

#### 1.2.4 Acceptance Criteria ✅ COMPLETE (2026-01-15)

- [x] Token generation utility creates valid tokens
- [x] Token validation correctly identifies expired/invalid tokens
- [x] Session management tracks active sessions
- [x] Agent activation requires valid authentication
- [x] Clear error messages for authentication failures
- [x] Token refresh mechanism working
- [x] Documentation covers all authentication scenarios

**Implementation Notes:**
- Used AES-256-GCM encryption instead of PASETO (simpler, no external dependencies)
- Token format: `bmad.v1.<base64url-encoded-encrypted-payload>`
- Files created:
  - `_bmad/core/security/auth-config.yaml` - Configuration
  - `_bmad/core/security/generate-token.js` - Interactive generator
  - `_bmad/core/security/quick-token.js` - Non-interactive generator
  - `_bmad/core/security/validate-token.js` - 12-point validation suite
  - `_bmad/core/security/session-manager.ts` - Session management
- 8 predefined roles: admin, security_lead, security_analyst, intel_analyst, developer, product_manager, viewer, guest
- Token validity: 7 days default, 24-hour expiration warnings
- Session timeout: 8 hours of inactivity
- Documentation: `docs/Features/Security-Authentication.md`

---

### 1.3 Immediate Quick Wins ✅ COMPLETE

**Target:** Week 1 (parallel with above)

#### 1.3.1 Restrict YOLO Mode ✅ COMPLETE (2026-01-15)

| Task | Description | Assignee | Est. Hours | Status |
|------|-------------|----------|------------|--------|
| 1.3.1.1 | Add YOLO_MODE_ENABLED flag to config | Backend | 1 | ✅ Done |
| 1.3.1.2 | Gate YOLO mode behind explicit flag | Backend | 2 | ✅ Done |
| 1.3.1.3 | Log all YOLO mode invocations | Backend | 2 | ✅ Done |
| 1.3.1.4 | Add warning banner when YOLO active | Backend | 1 | ✅ Done |

**Implementation Notes:**
- Documentation: `docs/Features/Security-YOLO-Mode-Restrictions.md`
- YOLO mode now requires explicit enablement
- All YOLO invocations are logged with audit trail

#### 1.3.2 Secure Default Configuration ✅ COMPLETE

| Task | Description | Assignee | Est. Hours | Status |
|------|-------------|----------|------------|--------|
| 1.3.2.1 | Set secure defaults in all configs | Security | 2 | ✅ Done |
| 1.3.2.2 | Add security warnings to sensitive options | Backend | 2 | ✅ Done |
| 1.3.2.3 | Document security implications of settings | Security | 4 | ✅ Done |

---

## Phase 1 Summary ✅ COMPLETE

**Completion Date:** 2026-01-15

| Item | Status | Documentation |
|------|--------|---------------|
| 1.1 File Integrity Verification | ✅ Complete | [Security-File-Integrity.md](../../docs/Features/Security-File-Integrity.md) |
| 1.2 Authentication System | ✅ Complete | [Security-Authentication.md](../../docs/Features/Security-Authentication.md) |
| 1.3.1 YOLO Mode Restrictions | ✅ Complete | [Security-YOLO-Mode-Restrictions.md](../../docs/Features/Security-YOLO-Mode-Restrictions.md) |
| 1.3.2 Secure Defaults | ✅ Complete | Integrated into config files |

**Files Created:**
```
_bmad/core/security/
├── bmad-public-key.asc          # GPG public key
├── bmad-private-key.asc         # GPG private key (gitignored)
├── MANIFEST.sha256              # File hashes (679 files)
├── MANIFEST.sha256.asc          # Signed manifest
├── sign-manifest.sh             # Signing script
├── verify-integrity.sh          # Verification script
├── KEY-INFO.md                  # Key documentation
├── auth-config.yaml             # Auth configuration
├── generate-token.js            # Interactive token generator
├── generate-token.ts            # TypeScript version
├── quick-token.js               # Non-interactive generator
├── validate-token.js            # 12-point validation suite
└── session-manager.ts           # Session management
```

---

## Phase 2: Access Control & Audit (Weeks 4-6)

### Objective
Implement RBAC authorization and comprehensive audit logging.

---

### 2.1 Role-Based Access Control (RBAC)

**Finding Addressed:** CRITICAL - No authorization controls
**Target:** Week 4-5

#### 2.1.1 Design Specification

**RBAC Model:**
```
┌─────────────────────────────────────────────────────────────┐
│                      RBAC System                             │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────┐ │
│  │    Users    │───▶│    Roles    │───▶│   Permissions   │ │
│  └─────────────┘    └─────────────┘    └─────────────────┘ │
│                            │                    │           │
│                            ▼                    ▼           │
│                     ┌─────────────┐    ┌─────────────────┐ │
│                     │   Module    │    │    Workflow     │ │
│                     │   Access    │    │    Access       │ │
│                     └─────────────┘    └─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**Role Hierarchy:**
```yaml
roles:
  admin:
    description: "Full system access"
    permissions: ["*"]
    modules: ["*"]

  security_analyst:
    description: "Security operations access"
    permissions: ["read", "execute"]
    modules: ["cybersec-team", "intel-team"]
    workflows:
      allow: ["incident-response-*", "threat-*", "security-*"]
      deny: []

  developer:
    description: "Development operations access"
    permissions: ["read", "execute"]
    modules: ["bmm", "bmgd", "cis"]
    workflows:
      allow: ["*"]
      deny: ["incident-response-*", "legal-*"]

  legal_counsel:
    description: "Legal team access"
    permissions: ["read", "execute"]
    modules: ["legal-team"]
    workflows:
      allow: ["legal-*", "contract-*", "compliance-*"]
      deny: []

  analyst:
    description: "Read-only analysis access"
    permissions: ["read"]
    modules: ["*"]
    workflows:
      allow: []
      deny: ["*"]  # Can read, cannot execute

  guest:
    description: "Limited read access"
    permissions: ["read"]
    modules: ["core"]
    workflows:
      allow: []
      deny: ["*"]
```

#### 2.1.2 Implementation Tasks

| Task | Description | Assignee | Est. Hours |
|------|-------------|----------|------------|
| 2.1.2.1 | Design RBAC schema and data model | Security | 8 |
| 2.1.2.2 | Implement role definition parser | Backend | 8 |
| 2.1.2.3 | Implement permission checker module | Backend | 16 |
| 2.1.2.4 | Create authorization middleware | Backend | 8 |
| 2.1.2.5 | Integrate authorization into agent activation | Backend | 8 |
| 2.1.2.6 | Integrate authorization into workflow execution | Backend | 8 |
| 2.1.2.7 | Create role management utilities | Backend | 8 |
| 2.1.2.8 | Update all agent files with required roles | Backend | 16 |
| 2.1.2.9 | Security testing of RBAC implementation | QA | 12 |

#### 2.1.3 Technical Implementation

**RBAC Configuration (`_bmad/core/security/rbac-config.yaml`):**
```yaml
# BMAD Role-Based Access Control Configuration
rbac:
  enabled: true
  default_role: guest
  deny_by_default: true

  roles:
    admin:
      description: "Full system administrator"
      inherits: []
      permissions:
        agents: ["*"]
        workflows: ["*"]
        modules: ["*"]
        actions: ["read", "write", "execute", "admin"]

    security_lead:
      description: "Security team lead"
      inherits: [security_analyst]
      permissions:
        agents: ["cybersec-team/*", "intel-team/*"]
        workflows: ["incident-*", "threat-*", "security-*", "compliance-*"]
        modules: ["cybersec-team", "intel-team", "core"]
        actions: ["read", "write", "execute"]

    security_analyst:
      description: "Security analyst"
      inherits: []
      permissions:
        agents: ["cybersec-team/*"]
        workflows: ["threat-modeling", "security-architecture-*", "compliance-*"]
        modules: ["cybersec-team"]
        actions: ["read", "execute"]

    intel_analyst:
      description: "Intelligence analyst"
      inherits: []
      permissions:
        agents: ["intel-team/*"]
        workflows: ["flash-*", "campaign-*", "osint-*"]
        modules: ["intel-team"]
        actions: ["read", "execute"]
      requires:
        credential_verification: true

    developer:
      description: "Software developer"
      inherits: []
      permissions:
        agents: ["bmm/*", "bmgd/*", "bmb/*"]
        workflows: ["dev-*", "create-*", "sprint-*", "code-*"]
        modules: ["bmm", "bmgd", "bmb", "cis"]
        actions: ["read", "write", "execute"]

    product_manager:
      description: "Product manager"
      inherits: []
      permissions:
        agents: ["bmm/pm", "bmm/analyst", "bmm/ux-designer"]
        workflows: ["create-prd", "create-product-brief", "research"]
        modules: ["bmm", "cis"]
        actions: ["read", "write", "execute"]

    viewer:
      description: "Read-only access"
      inherits: []
      permissions:
        agents: ["core/*"]
        workflows: []
        modules: ["core"]
        actions: ["read"]

  # Module-level restrictions
  module_restrictions:
    intel-team:
      require_roles: [intel_analyst, security_lead, admin]
      require_credential_verification: true

    legal-team:
      require_roles: [legal_counsel, admin]
      privileged: true

    cybersec-team:
      require_roles: [security_analyst, security_lead, admin]

  # Workflow-level restrictions
  workflow_restrictions:
    incident-response-playbook:
      require_roles: [security_lead, admin]
      require_approval: true

    operation-mosaic:
      require_roles: [intel_analyst, admin]
      require_credential_verification: true
      audit_level: full
```

**Authorization Module (`_bmad/core/security/authorization.ts`):**
```typescript
import * as yaml from 'yaml';
import * as fs from 'fs';

interface Permission {
  agents: string[];
  workflows: string[];
  modules: string[];
  actions: string[];
}

interface Role {
  description: string;
  inherits: string[];
  permissions: Permission;
  requires?: {
    credential_verification?: boolean;
  };
}

interface RBACConfig {
  enabled: boolean;
  default_role: string;
  deny_by_default: boolean;
  roles: Record<string, Role>;
  module_restrictions: Record<string, any>;
  workflow_restrictions: Record<string, any>;
}

export class AuthorizationManager {
  private config: RBACConfig;
  private resolvedRoles: Map<string, Permission> = new Map();

  constructor(configPath: string) {
    const content = fs.readFileSync(configPath, 'utf-8');
    this.config = yaml.parse(content).rbac;
    this.resolveInheritance();
  }

  private resolveInheritance(): void {
    for (const [roleName, role] of Object.entries(this.config.roles)) {
      const resolved = this.resolveRole(roleName, new Set());
      this.resolvedRoles.set(roleName, resolved);
    }
  }

  private resolveRole(roleName: string, visited: Set<string>): Permission {
    if (visited.has(roleName)) {
      throw new Error(`Circular inheritance detected: ${roleName}`);
    }
    visited.add(roleName);

    const role = this.config.roles[roleName];
    if (!role) {
      throw new Error(`Unknown role: ${roleName}`);
    }

    let permissions: Permission = { ...role.permissions };

    // Resolve inherited permissions
    for (const parentRole of role.inherits) {
      const parentPerms = this.resolveRole(parentRole, visited);
      permissions = this.mergePermissions(permissions, parentPerms);
    }

    return permissions;
  }

  private mergePermissions(a: Permission, b: Permission): Permission {
    return {
      agents: [...new Set([...a.agents, ...b.agents])],
      workflows: [...new Set([...a.workflows, ...b.workflows])],
      modules: [...new Set([...a.modules, ...b.modules])],
      actions: [...new Set([...a.actions, ...b.actions])]
    };
  }

  private matchesPattern(value: string, patterns: string[]): boolean {
    for (const pattern of patterns) {
      if (pattern === '*') return true;
      if (pattern.endsWith('/*')) {
        const prefix = pattern.slice(0, -2);
        if (value.startsWith(prefix)) return true;
      }
      if (pattern.endsWith('*')) {
        const prefix = pattern.slice(0, -1);
        if (value.startsWith(prefix)) return true;
      }
      if (pattern === value) return true;
    }
    return false;
  }

  canAccessAgent(userRoles: string[], agentPath: string): boolean {
    if (!this.config.enabled) return true;

    for (const role of userRoles) {
      const permissions = this.resolvedRoles.get(role);
      if (permissions && this.matchesPattern(agentPath, permissions.agents)) {
        return true;
      }
    }

    return !this.config.deny_by_default;
  }

  canExecuteWorkflow(userRoles: string[], workflowName: string): boolean {
    if (!this.config.enabled) return true;

    // Check workflow-specific restrictions
    const restriction = this.config.workflow_restrictions[workflowName];
    if (restriction?.require_roles) {
      const hasRequiredRole = userRoles.some(r =>
        restriction.require_roles.includes(r)
      );
      if (!hasRequiredRole) return false;
    }

    // Check role permissions
    for (const role of userRoles) {
      const permissions = this.resolvedRoles.get(role);
      if (permissions) {
        if (this.matchesPattern(workflowName, permissions.workflows)) {
          if (permissions.actions.includes('execute')) {
            return true;
          }
        }
      }
    }

    return !this.config.deny_by_default;
  }

  canAccessModule(userRoles: string[], moduleName: string): boolean {
    if (!this.config.enabled) return true;

    // Check module-specific restrictions
    const restriction = this.config.module_restrictions[moduleName];
    if (restriction?.require_roles) {
      const hasRequiredRole = userRoles.some(r =>
        restriction.require_roles.includes(r)
      );
      if (!hasRequiredRole) return false;
    }

    // Check role permissions
    for (const role of userRoles) {
      const permissions = this.resolvedRoles.get(role);
      if (permissions && this.matchesPattern(moduleName, permissions.modules)) {
        return true;
      }
    }

    return !this.config.deny_by_default;
  }

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
}
```

**Authorization Check Integration:**
```xml
<!-- Add to workflow.xml after authentication check -->
<security-check type="authorization" mandatory="true">
  <description>Verify user has permission to execute this workflow</description>
  <action>
    After authentication, before workflow execution:
    1. Get user's roles from session
    2. Check if any role grants 'execute' permission for this workflow
    3. Check module-level restrictions
    4. Check workflow-specific restrictions
    5. If not authorized: STOP, log security event, inform user
    6. If authorized: proceed with workflow execution
  </action>
  <on-failure>
    AUTHORIZATION DENIED: You do not have permission to execute this workflow.
    Required roles: {required_roles}
    Your roles: {user_roles}
    Contact your administrator for access.
  </on-failure>
</security-check>
```

#### 2.1.4 Acceptance Criteria

- [ ] Role configuration parsed correctly
- [ ] Role inheritance resolves without circular dependencies
- [ ] Agent access controlled by role permissions
- [ ] Workflow execution gated by authorization
- [ ] Module access restricted per configuration
- [ ] Clear error messages for authorization failures
- [ ] Admin can manage role assignments
- [ ] Audit log captures authorization decisions

---

### 2.2 Audit Logging System

**Finding Addressed:** HIGH - No audit logging
**Target:** Week 5-6

#### 2.2.1 Design Specification

**Audit Architecture:**
```
┌─────────────────────────────────────────────────────────────┐
│                    Audit Logging System                      │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────┐ │
│  │   Event     │───▶│    Log      │───▶│    Storage      │ │
│  │  Emitter    │    │  Processor  │    │    Backend      │ │
│  └─────────────┘    └─────────────┘    └─────────────────┘ │
│         │                  │                    │           │
│         ▼                  ▼                    ▼           │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────┐ │
│  │ Agent/WF    │    │  Formatter  │    │  File/SIEM/DB   │ │
│  │ Events      │    │  & Filter   │    │  Integration    │ │
│  └─────────────┘    └─────────────┘    └─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**Event Types:**
```yaml
audit_events:
  authentication:
    - auth.login_success
    - auth.login_failure
    - auth.logout
    - auth.token_refresh
    - auth.session_expired

  authorization:
    - authz.access_granted
    - authz.access_denied
    - authz.role_changed

  agent:
    - agent.activated
    - agent.deactivated
    - agent.command_executed

  workflow:
    - workflow.started
    - workflow.step_executed
    - workflow.completed
    - workflow.failed
    - workflow.yolo_invoked

  file:
    - file.read
    - file.write
    - file.integrity_verified
    - file.integrity_failed

  security:
    - security.injection_detected
    - security.manipulation_detected
    - security.config_changed
```

#### 2.2.2 Implementation Tasks

| Task | Description | Assignee | Est. Hours |
|------|-------------|----------|------------|
| 2.2.2.1 | Design audit event schema | Security | 4 |
| 2.2.2.2 | Implement audit event emitter | Backend | 8 |
| 2.2.2.3 | Implement log processor with filtering | Backend | 8 |
| 2.2.2.4 | Implement file-based storage backend | Backend | 8 |
| 2.2.2.5 | Add SIEM integration (optional) | DevOps | 8 |
| 2.2.2.6 | Integrate audit events into auth module | Backend | 4 |
| 2.2.2.7 | Integrate audit events into authz module | Backend | 4 |
| 2.2.2.8 | Integrate audit events into workflow engine | Backend | 8 |
| 2.2.2.9 | Integrate audit events into agent activation | Backend | 4 |
| 2.2.2.10 | Create audit log viewer utility | Backend | 8 |
| 2.2.2.11 | Implement log rotation and retention | DevOps | 4 |
| 2.2.2.12 | Security testing of audit system | QA | 8 |

#### 2.2.3 Technical Implementation

**Audit Configuration (`_bmad/core/security/audit-config.yaml`):**
```yaml
# BMAD Audit Logging Configuration
audit:
  enabled: true

  # Storage configuration
  storage:
    type: file  # file | siem | database

    file:
      path: "{project-root}/_bmad-output/audit"
      format: jsonl  # jsonl | json | csv
      rotation:
        enabled: true
        max_size_mb: 100
        max_age_days: 90
        compress: true
      retention:
        days: 365

    siem:
      enabled: false
      endpoint: ""
      api_key_env: "SIEM_API_KEY"
      format: cef  # cef | leef | json

  # Event filtering
  events:
    include:
      - "auth.*"
      - "authz.*"
      - "agent.*"
      - "workflow.*"
      - "security.*"
    exclude:
      - "file.read"  # Too verbose for default

  # Log levels
  levels:
    auth.login_failure: critical
    authz.access_denied: warning
    security.injection_detected: critical
    workflow.yolo_invoked: warning
    default: info

  # Tamper protection
  integrity:
    enabled: true
    algorithm: sha256
    chain_previous: true  # Each entry includes hash of previous
```

**Audit Event Schema:**
```typescript
interface AuditEvent {
  // Event identification
  id: string;
  timestamp: string;  // ISO 8601
  sequence: number;   // Monotonic sequence number

  // Event classification
  type: string;       // e.g., "auth.login_success"
  category: string;   // auth | authz | agent | workflow | file | security
  severity: 'critical' | 'warning' | 'info' | 'debug';

  // Actor information
  actor: {
    id: string;
    name: string;
    roles: string[];
    session_id: string;
    ip_address?: string;
  };

  // Target information
  target: {
    type: string;     // agent | workflow | file | module
    id: string;
    name: string;
    module?: string;
  };

  // Event details
  action: string;
  outcome: 'success' | 'failure' | 'error';
  details: Record<string, any>;

  // Security metadata
  integrity: {
    hash: string;           // SHA-256 of event
    previous_hash: string;  // Hash of previous event (chain)
  };
}
```

**Audit Logger (`_bmad/core/security/audit-logger.ts`):**
```typescript
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import * as yaml from 'yaml';

interface AuditConfig {
  enabled: boolean;
  storage: {
    type: string;
    file: {
      path: string;
      format: string;
      rotation: any;
    };
  };
  events: {
    include: string[];
    exclude: string[];
  };
  levels: Record<string, string>;
  integrity: {
    enabled: boolean;
    algorithm: string;
    chain_previous: boolean;
  };
}

export class AuditLogger {
  private config: AuditConfig;
  private sequence: number = 0;
  private previousHash: string = '';
  private logStream: fs.WriteStream | null = null;

  constructor(configPath: string) {
    const content = fs.readFileSync(configPath, 'utf-8');
    this.config = yaml.parse(content).audit;
    this.initializeStorage();
  }

  private initializeStorage(): void {
    if (this.config.storage.type === 'file') {
      const logDir = this.config.storage.file.path;
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }

      const logFile = path.join(logDir, `audit-${this.getDateString()}.jsonl`);
      this.logStream = fs.createWriteStream(logFile, { flags: 'a' });
    }
  }

  private getDateString(): string {
    return new Date().toISOString().split('T')[0];
  }

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

  private matchPattern(value: string, pattern: string): boolean {
    if (pattern === '*') return true;
    if (pattern.endsWith('*')) {
      return value.startsWith(pattern.slice(0, -1));
    }
    return value === pattern;
  }

  private computeHash(event: any): string {
    const content = JSON.stringify(event);
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  async log(event: Omit<AuditEvent, 'id' | 'timestamp' | 'sequence' | 'integrity'>): Promise<void> {
    if (!this.config.enabled) return;
    if (!this.shouldLog(event.type)) return;

    const fullEvent: AuditEvent = {
      ...event,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      sequence: ++this.sequence,
      integrity: {
        hash: '',
        previous_hash: this.previousHash
      }
    };

    // Compute integrity hash
    const hashInput = { ...fullEvent, integrity: { hash: '', previous_hash: fullEvent.integrity.previous_hash } };
    fullEvent.integrity.hash = this.computeHash(hashInput);
    this.previousHash = fullEvent.integrity.hash;

    // Write to storage
    if (this.logStream) {
      this.logStream.write(JSON.stringify(fullEvent) + '\n');
    }
  }

  // Convenience methods for common events
  async logAuthSuccess(actor: any, details: any): Promise<void> {
    await this.log({
      type: 'auth.login_success',
      category: 'auth',
      severity: 'info',
      actor,
      target: { type: 'system', id: 'bmad', name: 'BMAD Framework' },
      action: 'login',
      outcome: 'success',
      details
    });
  }

  async logAuthFailure(actor: any, details: any): Promise<void> {
    await this.log({
      type: 'auth.login_failure',
      category: 'auth',
      severity: 'critical',
      actor,
      target: { type: 'system', id: 'bmad', name: 'BMAD Framework' },
      action: 'login',
      outcome: 'failure',
      details
    });
  }

  async logWorkflowStart(actor: any, workflow: any, details: any): Promise<void> {
    await this.log({
      type: 'workflow.started',
      category: 'workflow',
      severity: 'info',
      actor,
      target: { type: 'workflow', id: workflow.id, name: workflow.name, module: workflow.module },
      action: 'start',
      outcome: 'success',
      details
    });
  }

  async logSecurityEvent(actor: any, eventType: string, target: any, details: any): Promise<void> {
    await this.log({
      type: eventType,
      category: 'security',
      severity: 'critical',
      actor,
      target,
      action: 'detect',
      outcome: 'success',
      details
    });
  }

  async close(): Promise<void> {
    if (this.logStream) {
      this.logStream.end();
    }
  }
}
```

#### 2.2.4 Acceptance Criteria

- [ ] All authentication events logged
- [ ] All authorization decisions logged
- [ ] All workflow executions logged
- [ ] All security events logged
- [ ] Log integrity chain verifiable
- [ ] Log rotation working correctly
- [ ] SIEM integration functional (if enabled)
- [ ] Audit log viewer utility working
- [ ] Tamper detection identifies modified logs

---

## Phase 3: Data Protection & Hardening (Weeks 7-9)

### Objective
Implement encryption, harden shell execution, and add sandboxing.

---

### 3.1 Configuration Encryption

**Finding Addressed:** HIGH - No encryption at rest
**Target:** Week 7

#### 3.1.1 Implementation Tasks

| Task | Description | Assignee | Est. Hours |
|------|-------------|----------|------------|
| 3.1.1.1 | Design encrypted config format | Security | 4 |
| 3.1.1.2 | Implement config encryption utility | Backend | 8 |
| 3.1.1.3 | Implement config decryption at load | Backend | 8 |
| 3.1.1.4 | Integrate with secret management (optional) | DevOps | 8 |
| 3.1.1.5 | Create key management procedures | Security | 4 |
| 3.1.1.6 | Migrate existing configs to encrypted format | DevOps | 4 |

#### 3.1.2 Technical Implementation

**Encrypted Configuration Format:**
```yaml
# Unencrypted (development)
user_name: J
api_keys:
  openai: sk-xxx...

# Encrypted (production)
_encrypted: true
_algorithm: aes-256-gcm
_key_source: env:BMAD_CONFIG_KEY
data: |
  eyJhbGciOiJBMjU2R0NNIiwiZW5jIjoiQTI1NkdDTSJ9...
```

**Config Encryption Module:**
```typescript
import * as crypto from 'crypto';

export class ConfigEncryption {
  private algorithm = 'aes-256-gcm';

  encrypt(data: any, key: Buffer): EncryptedConfig {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, key, iv);

    const plaintext = JSON.stringify(data);
    let encrypted = cipher.update(plaintext, 'utf8', 'base64');
    encrypted += cipher.final('base64');

    const authTag = cipher.getAuthTag();

    return {
      _encrypted: true,
      _algorithm: this.algorithm,
      _iv: iv.toString('base64'),
      _authTag: authTag.toString('base64'),
      data: encrypted
    };
  }

  decrypt(config: EncryptedConfig, key: Buffer): any {
    const iv = Buffer.from(config._iv, 'base64');
    const authTag = Buffer.from(config._authTag, 'base64');

    const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(config.data, 'base64', 'utf8');
    decrypted += decipher.final('utf8');

    return JSON.parse(decrypted);
  }
}
```

---

### 3.2 Shell Script Hardening

**Finding Addressed:** HIGH - Shell execution attack surface
**Target:** Week 7-8

#### 3.2.1 Implementation Tasks

| Task | Description | Assignee | Est. Hours |
|------|-------------|----------|------------|
| 3.2.1.1 | Audit all 42 shell scripts for injection | Security | 16 |
| 3.2.1.2 | Implement input sanitization helpers | Backend | 8 |
| 3.2.1.3 | Refactor scripts to use parameterized commands | Backend | 24 |
| 3.2.1.4 | Add shell execution allowlist | Backend | 8 |
| 3.2.1.5 | Create shell security guidelines | Security | 4 |
| 3.2.1.6 | Security testing of hardened scripts | QA | 12 |

#### 3.2.2 Shell Security Guidelines

**Input Sanitization:**
```bash
#!/bin/bash
# Safe input handling

sanitize_input() {
    local input="$1"
    # Remove shell metacharacters
    echo "${input//[^a-zA-Z0-9_.-]/}"
}

# UNSAFE: Direct variable expansion
# echo "Processing: $USER_INPUT"

# SAFE: Quoted and sanitized
sanitized=$(sanitize_input "$USER_INPUT")
echo "Processing: ${sanitized}"
```

**Command Allowlist:**
```yaml
# _bmad/core/security/shell-allowlist.yaml
allowed_commands:
  tts:
    - say
    - espeak
    - festival
  audio:
    - ffmpeg
    - sox
  system:
    - ls
    - cat
    - grep
    - head
    - tail

denied_patterns:
  - "eval"
  - "exec"
  - "`"
  - "$("
  - "&&"
  - "||"
  - ";"
  - "|"
```

---

### 3.3 File System Sandboxing

**Finding Addressed:** MEDIUM - No sandbox for file system access
**Target:** Week 8-9

#### 3.3.1 Implementation Tasks

| Task | Description | Assignee | Est. Hours |
|------|-------------|----------|------------|
| 3.3.1.1 | Design sandbox architecture | Security | 8 |
| 3.3.1.2 | Implement path validation module | Backend | 12 |
| 3.3.1.3 | Create per-module access boundaries | Backend | 8 |
| 3.3.1.4 | Integrate sandbox into file operations | Backend | 12 |
| 3.3.1.5 | Add escape attempt detection | Backend | 8 |
| 3.3.1.6 | Security testing of sandbox | QA | 12 |

#### 3.3.2 Technical Implementation

**Sandbox Configuration:**
```yaml
# _bmad/core/security/sandbox-config.yaml
sandbox:
  enabled: true
  default_policy: deny

  boundaries:
    global:
      read:
        - "{project-root}/_bmad"
        - "{project-root}/_bmad-output"
      write:
        - "{project-root}/_bmad-output"
      deny:
        - "{project-root}/.git"
        - "{project-root}/.claude"
        - "~/.ssh"
        - "~/.gnupg"

    per_module:
      intel-team:
        write:
          - "{project-root}/_bmad-output/intel"
      legal-team:
        write:
          - "{project-root}/_bmad-output/legal"

  escape_detection:
    patterns:
      - "../"
      - "..%2f"
      - "%2e%2e/"
    action: block_and_alert
```

**Sandbox Module:**
```typescript
export class FileSandbox {
  private config: SandboxConfig;

  constructor(configPath: string) {
    this.config = this.loadConfig(configPath);
  }

  validatePath(requestedPath: string, operation: 'read' | 'write', module?: string): boolean {
    // Resolve to absolute path
    const absolutePath = path.resolve(requestedPath);

    // Check for escape attempts
    if (this.detectEscapeAttempt(requestedPath)) {
      this.logSecurityEvent('sandbox.escape_attempt', requestedPath);
      return false;
    }

    // Check global boundaries
    const globalAllowed = this.checkBoundary(
      absolutePath,
      this.config.boundaries.global[operation]
    );

    // Check module-specific boundaries
    if (module && this.config.boundaries.per_module[module]) {
      const moduleAllowed = this.checkBoundary(
        absolutePath,
        this.config.boundaries.per_module[module][operation] || []
      );
      return globalAllowed && moduleAllowed;
    }

    return globalAllowed;
  }

  private detectEscapeAttempt(path: string): boolean {
    for (const pattern of this.config.escape_detection.patterns) {
      if (path.includes(pattern)) {
        return true;
      }
    }
    return false;
  }

  private checkBoundary(path: string, allowedPaths: string[]): boolean {
    for (const allowed of allowedPaths) {
      const resolvedAllowed = this.resolvePath(allowed);
      if (path.startsWith(resolvedAllowed)) {
        return true;
      }
    }
    return this.config.default_policy !== 'deny';
  }
}
```

---

## Phase 4: Advanced Security & Compliance (Weeks 10-12)

### Objective
Implement rate limiting, compliance validation, and advanced threat detection.

---

### 4.1 Rate Limiting

**Finding Addressed:** MEDIUM - No rate limiting
**Target:** Week 10

#### 4.1.1 Implementation Tasks

| Task | Description | Assignee | Est. Hours |
|------|-------------|----------|------------|
| 4.1.1.1 | Design rate limiting strategy | Security | 4 |
| 4.1.1.2 | Implement token bucket algorithm | Backend | 8 |
| 4.1.1.3 | Create per-session rate limiters | Backend | 8 |
| 4.1.1.4 | Add rate limit configuration | Backend | 4 |
| 4.1.1.5 | Integrate into workflow engine | Backend | 8 |
| 4.1.1.6 | Add alerting for rate limit violations | Backend | 4 |

#### 4.1.2 Rate Limit Configuration

```yaml
# _bmad/core/security/rate-limit-config.yaml
rate_limits:
  enabled: true

  defaults:
    requests_per_minute: 60
    burst_size: 10

  per_resource:
    workflow_execution:
      requests_per_minute: 30
      burst_size: 5

    agent_activation:
      requests_per_minute: 20
      burst_size: 3

    file_operations:
      requests_per_minute: 100
      burst_size: 20

    api_calls:
      requests_per_minute: 50
      burst_size: 10

  per_role:
    admin:
      multiplier: 2.0
    developer:
      multiplier: 1.5
    viewer:
      multiplier: 0.5

  actions:
    on_limit_reached:
      - log_warning
      - delay_request
    on_sustained_abuse:
      - log_critical
      - notify_admin
      - temporary_block
```

---

### 4.2 Compliance Validation

**Finding Addressed:** Non-conformities identified in audit
**Target:** Week 10-11

#### 4.2.1 Implementation Tasks

| Task | Description | Assignee | Est. Hours |
|------|-------------|----------|------------|
| 4.2.1.1 | Create compliance checklist automation | Security | 8 |
| 4.2.1.2 | Implement SOC 2 control validation | Security | 12 |
| 4.2.1.3 | Implement GDPR requirement checks | Security | 8 |
| 4.2.1.4 | Create compliance reporting dashboard | Backend | 12 |
| 4.2.1.5 | Document compliance mappings | Security | 8 |

#### 4.2.2 Compliance Dashboard

```yaml
# _bmad/core/security/compliance-status.yaml
compliance:
  last_assessment: "2026-01-13"

  frameworks:
    soc2:
      status: partial
      controls:
        CC6.1:
          status: implemented
          evidence: "RBAC system deployed"
        CC6.2:
          status: implemented
          evidence: "Authentication required"
        CC7.2:
          status: implemented
          evidence: "Audit logging active"

    gdpr:
      status: partial
      requirements:
        data_minimization:
          status: manual
          notes: "Requires policy enforcement"
        right_to_erasure:
          status: not_implemented
          notes: "Data deletion API needed"

    hipaa:
      status: not_applicable
      notes: "No PHI processed in current deployment"
```

---

### 4.3 Advanced Threat Detection

**Finding Addressed:** MEDIUM - LLM-based security enforcement
**Target:** Week 11-12

#### 4.3.1 Implementation Tasks

| Task | Description | Assignee | Est. Hours |
|------|-------------|----------|------------|
| 4.3.1.1 | Implement instruction pattern detector | Backend | 16 |
| 4.3.1.2 | Add encoding detection layer | Backend | 8 |
| 4.3.1.3 | Create anomaly detection baseline | Backend | 12 |
| 4.3.1.4 | Implement behavioral analysis | Backend | 16 |
| 4.3.1.5 | Security testing of detection system | QA | 12 |

#### 4.3.2 Instruction Pattern Detection

```typescript
export class InstructionDetector {
  private patterns: RegExp[] = [
    // Direct instruction patterns
    /ignore\s+(previous|above|all)\s+(instructions?|prompts?)/i,
    /disregard\s+(previous|above|all)/i,
    /forget\s+(everything|what)\s+(you|i)\s+(told|said)/i,

    // Role manipulation
    /you\s+are\s+(now|actually)\s+a/i,
    /act\s+as\s+(if|though)\s+you/i,
    /pretend\s+(to\s+be|you\s+are)/i,

    // System prompt extraction
    /what\s+(is|are)\s+your\s+(system|initial)\s+(prompt|instructions?)/i,
    /repeat\s+(your|the)\s+(system|initial)\s+(prompt|instructions?)/i,

    // Encoded instructions
    /execute\s+base64/i,
    /decode\s+and\s+run/i,
    /eval\s*\(/i,

    // Authority claims
    /i\s+am\s+(your|the)\s+(admin|administrator|developer|creator)/i,
    /admin\s+override/i,
    /sudo\s+mode/i
  ];

  private encodingPatterns: RegExp[] = [
    /[A-Za-z0-9+/]{50,}={0,2}/,  // Base64
    /%[0-9A-Fa-f]{2}/,           // URL encoding
    /\\x[0-9A-Fa-f]{2}/,         // Hex encoding
    /&#\d+;/,                     // HTML entities
    /\\u[0-9A-Fa-f]{4}/          // Unicode escapes
  ];

  detectInjection(content: string): DetectionResult {
    const findings: Finding[] = [];

    // Check instruction patterns
    for (const pattern of this.patterns) {
      const match = content.match(pattern);
      if (match) {
        findings.push({
          type: 'instruction_pattern',
          pattern: pattern.source,
          match: match[0],
          severity: 'high'
        });
      }
    }

    // Check for encoded content
    for (const pattern of this.encodingPatterns) {
      const match = content.match(pattern);
      if (match && match[0].length > 20) {
        findings.push({
          type: 'encoded_content',
          pattern: pattern.source,
          match: match[0].substring(0, 50) + '...',
          severity: 'medium'
        });
      }
    }

    return {
      safe: findings.length === 0,
      findings,
      recommendation: findings.length > 0
        ? 'Content flagged for manual review'
        : 'Content appears safe'
    };
  }
}
```

---

## Implementation Schedule

### Gantt Chart Overview

```
Week:    1    2    3    4    5    6    7    8    9   10   11   12
         |----|----|----|----|----|----|----|----|----|----|----|
Phase 1: ████████████████
  1.1 File Signing    ████████
  1.2 Authentication       ████████
  1.3 Quick Wins      ████

Phase 2:                 ████████████████
  2.1 RBAC                   ████████████
  2.2 Audit Logging              ████████

Phase 3:                             ████████████████
  3.1 Encryption                         ████
  3.2 Shell Hardening                    ████████
  3.3 Sandboxing                             ████████

Phase 4:                                         ████████████
  4.1 Rate Limiting                                  ████
  4.2 Compliance                                     ████████
  4.3 Threat Detection                                   ████████
```

### Milestones

| Milestone | Target | Deliverables |
|-----------|--------|--------------|
| **M1: Foundation Complete** | Week 3 | File signing, authentication working |
| **M2: Access Control Live** | Week 6 | RBAC enforced, audit logging active |
| **M3: Hardening Complete** | Week 9 | Encryption, shell hardening, sandbox |
| **M4: Production Ready** | Week 12 | All security controls implemented |

---

## Testing Strategy

### Security Testing Requirements

| Phase | Test Type | Coverage |
|-------|-----------|----------|
| Phase 1 | Unit tests for crypto operations | 100% |
| Phase 1 | Integration tests for auth flow | All scenarios |
| Phase 2 | RBAC permission matrix testing | All role combinations |
| Phase 2 | Audit log integrity testing | Tamper detection |
| Phase 3 | Penetration testing of sandbox | Escape attempts |
| Phase 3 | Shell injection testing | All 42 scripts |
| Phase 4 | Load testing with rate limits | Peak scenarios |
| Phase 4 | Red team exercise | Full attack simulation |

### Test Environment

```yaml
environments:
  development:
    auth: disabled
    audit: verbose
    sandbox: permissive

  staging:
    auth: enabled
    audit: full
    sandbox: enforced

  production:
    auth: required
    audit: full
    sandbox: strict
    encryption: required
```

---

## Risk Management

### Implementation Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| File signing breaks CI/CD | Medium | High | Test signing in staging first |
| Auth adds friction | High | Medium | Implement token refresh, long sessions |
| RBAC too restrictive | Medium | Medium | Start permissive, tighten gradually |
| Audit logging performance | Low | Medium | Async logging, batching |
| Sandbox false positives | Medium | Medium | Allowlist common patterns |

### Rollback Plan

Each phase includes rollback capability:

1. **Phase 1**: Disable signing verification in config
2. **Phase 2**: Set `rbac.enabled: false`, `audit.enabled: false`
3. **Phase 3**: Set `sandbox.enabled: false`, `encryption.enabled: false`
4. **Phase 4**: Set `rate_limits.enabled: false`

---

## Success Criteria

### Phase 1 Success
- [ ] All framework files signed with valid signatures
- [ ] Tampered files blocked from loading
- [ ] Authentication required for all agent activations
- [ ] Session management working correctly
- [ ] YOLO mode restricted and logged

### Phase 2 Success
- [ ] RBAC enforced for all agents and workflows
- [ ] Unauthorized access blocked with clear messages
- [ ] All security events logged with integrity chain
- [ ] Audit logs retrievable and searchable
- [ ] Log rotation and retention working

### Phase 3 Success
- [ ] Sensitive configuration encrypted
- [ ] All shell scripts hardened against injection
- [ ] File access restricted to defined boundaries
- [ ] Escape attempts detected and blocked

### Phase 4 Success
- [ ] Rate limiting prevents abuse
- [ ] Compliance dashboard shows status
- [ ] Instruction patterns detected pre-LLM
- [ ] Anomaly detection baseline established

---

## Appendix A: File Inventory

### Files to Create

| File | Phase | Purpose |
|------|-------|---------|
| `_bmad/core/security/sign-files.sh` | 1 | File signing script |
| `_bmad/core/security/verify-integrity.ts` | 1 | Integrity verification |
| `_bmad/core/security/auth-config.yaml` | 1 | Authentication config |
| `_bmad/core/security/generate-token.ts` | 1 | Token generation |
| `_bmad/core/security/session-manager.ts` | 1 | Session management |
| `_bmad/core/security/rbac-config.yaml` | 2 | RBAC configuration |
| `_bmad/core/security/authorization.ts` | 2 | Authorization module |
| `_bmad/core/security/audit-config.yaml` | 2 | Audit configuration |
| `_bmad/core/security/audit-logger.ts` | 2 | Audit logging |
| `_bmad/core/security/config-encryption.ts` | 3 | Config encryption |
| `_bmad/core/security/shell-allowlist.yaml` | 3 | Shell command allowlist |
| `_bmad/core/security/sandbox-config.yaml` | 3 | Sandbox configuration |
| `_bmad/core/security/sandbox.ts` | 3 | Sandbox module |
| `_bmad/core/security/rate-limit-config.yaml` | 4 | Rate limit config |
| `_bmad/core/security/rate-limiter.ts` | 4 | Rate limiting |
| `_bmad/core/security/instruction-detector.ts` | 4 | Injection detection |

### Files to Modify

| File | Phase | Changes |
|------|-------|---------|
| `_bmad/core/tasks/workflow.xml` | 1-2 | Add security checks |
| `_bmad/core/config.yaml` | 1 | Add security section |
| All agent files (100+) | 1-2 | Add auth/authz steps |
| `.claude/hooks/*.sh` (42) | 3 | Harden against injection |

---

## Appendix B: Dependencies

### External Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `paseto` | ^3.0.0 | Token encryption |
| `yaml` | ^2.0.0 | Config parsing |
| `winston` | ^3.0.0 | Logging |
| `rate-limiter-flexible` | ^2.0.0 | Rate limiting |

### System Dependencies

| Dependency | Purpose |
|------------|---------|
| GPG | File signing |
| Node.js 18+ | Runtime |
| OpenSSL | Cryptographic operations |

---

*End of Implementation Plan*

**Document Prepared By:** Bastion (Security Architect)
**Review Required By:** Project Stakeholders
**Implementation Owner:** TBD
