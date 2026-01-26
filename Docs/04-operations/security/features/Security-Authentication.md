# Security Feature: Token-Based Authentication

**Status:** Implemented
**Phase:** 1 (Foundation & Critical Fixes)
**Finding Addressed:** CRITICAL - No authentication system

---

## Overview

The BMAD Authentication System provides secure identity verification using encrypted tokens. This ensures that all framework operations are attributed to verified users and prevents unauthorized access to sensitive modules.

## Problem Solved

**Before:** User identity was stored as plaintext in `config.yaml`:
```yaml
user_name: J  # Anyone could change this
```

**After:** User identity is cryptographically verified via encrypted tokens that contain:
- Verified user ID
- Display name
- Assigned roles
- Module access permissions
- Expiration timestamp

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      AUTHENTICATION SYSTEM                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   INITIAL SETUP (One-time per user)                                     │
│   ┌──────────────┐    ┌──────────────┐    ┌──────────────────┐         │
│   │    User      │───▶│   Generate   │───▶│   Token File     │         │
│   │ Credentials  │    │    Token     │    │  (.bmad-token)   │         │
│   └──────────────┘    └──────────────┘    └──────────────────┘         │
│                                                                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   EVERY SESSION (Agent Activation)                                      │
│   ┌──────────────┐    ┌──────────────┐    ┌──────────────────┐         │
│   │  Read Token  │───▶│   Validate   │───▶│ Create Session   │         │
│   │    File      │    │   & Decode   │    │ (or Block)       │         │
│   └──────────────┘    └──────────────┘    └──────────────────┘         │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Quick Start

### 1. Generate Your Token

**Quick method (non-interactive):**
```bash
node _bmad/core/security/quick-token.js "YourName" "admin" 168
```

**Interactive method:**
```bash
node _bmad/core/security/generate-token.js
```

You'll be prompted for:
- Your name
- Email (optional)
- Role selection (1-8)
- Token validity period

### 2. Validate Your Token

Run the validation test to verify your token is working:
```bash
node _bmad/core/security/validate-token.js
```

Example output:
```
======================================================================
              BMAD Token Validation Test
======================================================================

  Test Results
----------------------------------------------------------------------
  [PASS] Encryption key exists (.bmad-key)
  [PASS] Key file permissions (should be 600)
  [PASS] Key size (should be 32 bytes)
  [PASS] Token file exists (.bmad-token)
  [PASS] Token file permissions (should be 600)
  [PASS] Token format (bmad.v1.* prefix)
  [PASS] Token decryption
  [PASS] Required claims present
  [PASS] Token not expired
  [PASS] Token issued date valid
  [PASS] Roles are valid
  [PASS] UUID format valid (sub, jti)

----------------------------------------------------------------------
  Summary: 12 passed, 0 failed

  ✓ All validation tests passed!

----------------------------------------------------------------------
  Token Details
----------------------------------------------------------------------
  User ID:    6d253447-d748-4039-a28a-89c924d2b9cb
  Name:       J
  Roles:      admin
  Modules:    *
  Expires:    2026-01-22T18:04:59.249Z
```

### 3. Use BMAD Normally

After token generation, authentication happens automatically. You won't see any prompts unless your token expires.

## Token Structure

Tokens are encrypted using AES-256-GCM and contain:

```json
{
  "sub": "uuid",           // Unique user ID
  "name": "J",             // Display name
  "email": "j@example.com", // Optional email
  "roles": ["admin"],      // Assigned roles
  "modules": ["*"],        // Accessible modules
  "iat": "2026-01-15T...", // Issued at
  "exp": "2026-01-22T...", // Expiration
  "jti": "uuid"            // Unique token ID
}
```

## Available Roles

| Role | Description | Default Modules |
|------|-------------|-----------------|
| `admin` | Full system access | `*` (all) |
| `security_lead` | Security team lead | cybersec-team, intel-team, core |
| `security_analyst` | Security analyst | cybersec-team, core |
| `intel_analyst` | Intelligence analyst | intel-team, core |
| `developer` | Software developer | bmm, bmgd, bmb, cis, core |
| `product_manager` | Product manager | bmm, cis, core |
| `viewer` | Read-only access | core |
| `guest` | Limited guest access | core |

## Files

| File | Purpose | Commit to Git? |
|------|---------|----------------|
| `.bmad-token` | Your encrypted authentication token | **NO** |
| `.bmad-key` | Encryption key for tokens | **NO** |
| `_bmad/core/security/auth-config.yaml` | Authentication configuration | Yes |
| `_bmad/core/security/generate-token.js` | Interactive token generation | Yes |
| `_bmad/core/security/quick-token.js` | Non-interactive token generation | Yes |
| `_bmad/core/security/validate-token.js` | Token validation test suite | Yes |
| `_bmad/core/security/session-manager.ts` | Session management module | Yes |

## Configuration

Authentication settings in `_bmad/core/security/auth-config.yaml`:

```yaml
authentication:
  enabled: true
  method: local_token

  local_token:
    token_file: "{project-root}/.bmad-token"
    max_age_hours: 168  # 7 days
    refresh_threshold_hours: 24

  session:
    timeout_minutes: 480  # 8 hours
    max_lifetime_hours: 24
```

## User Experience

### First-Time Setup (~30 seconds)

**Quick setup (recommended):**
```bash
$ node _bmad/core/security/quick-token.js "J" "admin" 168

[OK] Generated new encryption key: .bmad-key

============================================================
            Token Generated Successfully
============================================================
  Name:    J
  User ID: 6d253447-d748-4039-a28a-89c924d2b9cb
  Roles:   admin
  Modules: *
  Expires: 2026-01-22T18:04:59.249Z

  Token saved to: .bmad-token
```

**Interactive setup:**
```
$ node _bmad/core/security/generate-token.js

======================================================================
              BMAD Authentication Token Generator
======================================================================

Enter your name: J
Enter your email (optional): j@example.com

Available roles:
  1. admin            - Full system access
  2. security_lead    - Security team lead
  ...

Enter role numbers (comma-separated): 1

Token validity in hours (default 168 = 7 days):

[OK] Generated new encryption key: .bmad-key

======================================================================
                   Token Generated Successfully
======================================================================

  Name:    J
  Roles:   admin
  Modules: *
  Expires: 2026-01-22T12:00:00.000Z

  Token saved to: .bmad-token
```

### Normal Operation (Invisible)

After setup, authentication is silent. You'll only see messages if:
- Token is expiring soon (warning)
- Token has expired (error + regeneration prompt)

### Token Expiring Soon

```
[WARNING] Your authentication token expires in 18 hours.
         Consider generating a new token soon.
```

### Token Expired

```
╔══════════════════════════════════════════════════════════════════╗
║                      Token Expired                                ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  Your authentication token has expired.                           ║
║                                                                   ║
║  To generate a new token, run:                                    ║
║  npx ts-node _bmad/core/security/generate-token.ts                ║
║                                                                   ║
╚══════════════════════════════════════════════════════════════════╝
```

## Check Authentication Status

**Quick validation (recommended):**
```bash
node _bmad/core/security/validate-token.js
```

This runs 12 comprehensive tests and shows token details.

**Status check only:**
```bash
npx ts-node _bmad/core/security/session-manager.ts
```

Output:
```
BMAD Authentication Status
========================================
Key exists:      Yes
Token exists:    Yes
Token valid:     Yes
User:            J
Expires:         2026-01-22T12:00:00.000Z
Hours remaining: 142.5
```

## Validation Tests

The validation suite (`validate-token.js`) checks:

| Test | Description |
|------|-------------|
| Key exists | `.bmad-key` file present |
| Key permissions | File permissions are 600 (owner only) |
| Key size | 32 bytes for AES-256 |
| Token exists | `.bmad-token` file present |
| Token permissions | File permissions are 600 |
| Token format | Starts with `bmad.v1.` prefix |
| Token decryption | Successfully decrypts with key |
| Required claims | All claims present (sub, name, roles, etc.) |
| Not expired | Expiration date is in the future |
| Issued date valid | Not issued in the future |
| Roles valid | Only recognized roles present |
| UUID format | Valid UUIDs for sub and jti |

## Security Considerations

1. **Token Encryption**: Tokens use AES-256-GCM encryption - they cannot be decoded without the key
2. **File Permissions**: Token and key files are created with 0600 permissions (owner read/write only)
3. **Expiration**: Tokens expire after 7 days by default (configurable)
4. **Session Timeout**: Sessions expire after 8 hours of inactivity
5. **Never Commit**: `.bmad-token` and `.bmad-key` are in `.gitignore` - never commit these files

## Environment Variable Alternative

For CI/CD or automation, set the token via environment variable:

```bash
export BMAD_AUTH_TOKEN="bmad.v1.xxxxx..."
```

Configure in `auth-config.yaml`:
```yaml
authentication:
  method: env_token
  env_token:
    variable_name: "BMAD_AUTH_TOKEN"
```

## Troubleshooting

### "Authentication key not found"
Run the token generator to create both key and token:
```bash
node _bmad/core/security/quick-token.js "YourName" "admin"
```

### "Token is invalid or expired"
Regenerate your token (uses existing key):
```bash
node _bmad/core/security/quick-token.js "YourName" "admin"
```

### Token not recognized after regeneration
Delete old files and regenerate:
```bash
rm .bmad-token .bmad-key
node _bmad/core/security/quick-token.js "YourName" "admin"
```

### Check what's wrong
Run the validation suite to diagnose issues:
```bash
node _bmad/core/security/validate-token.js
```

This will show exactly which test is failing.

## Integration with Other Security Features

- **File Integrity**: Authentication credentials are verified before file operations
- **Audit Logging**: All authenticated sessions are logged with user identity
- **RBAC**: User roles from authentication gate access to agents and workflows - see [Security-RBAC.md](Security-RBAC.md)

## New Roles (with RBAC)

With RBAC implementation, two additional roles are available:

| Role | Description | Default Modules |
|------|-------------|-----------------|
| `legal_counsel` | Legal team access | legal-team, core |
| `strategist` | Strategic advisory | strategy-team, core |

---

## Validation Status

### Latest Validation: 2026-01-15

| Test | Status |
|------|--------|
| Encryption key exists (.bmad-key) | PASS |
| Key file permissions (600) | PASS |
| Key size (32 bytes for AES-256) | PASS |
| Token file exists (.bmad-token) | PASS |
| Token file permissions (600) | PASS |
| Token format (bmad.v1.* prefix) | PASS |
| Token decryption | PASS |
| Required claims present | PASS |
| Token not expired | PASS |
| Token issued date valid | PASS |
| Roles are valid | PASS |
| UUID format valid (sub, jti) | PASS |
| **Summary** | **12/12 PASS** |

### Security Features Verified

1. **AES-256-GCM Encryption** - Industry-standard authenticated encryption
2. **Secure File Permissions** - Key and token files restricted to owner (600)
3. **Token Structure** - Proper claims, UUIDs, and expiration handling
4. **Role Integration** - Tokens correctly store and validate role assignments

### Test Report

Full validation report: [rbac-validation-report.md](../../TestingLogs/security/2026-01-15/rbac-validation-report.md)

---

*Part of BMAD Security Phase 1 Implementation*
