# Token Management Guide

> **Version:** 1.0
> **Last Updated:** 2026-01-16
> **Audience:** System Administrators, Security Officers

---

## Overview

BMAD-CYBER2 uses encrypted authentication tokens for session management. This guide covers the complete token lifecycle including generation, validation, rotation, and revocation.

**Security Features:**

- **AES-256-GCM Encryption** - Industry-standard authenticated encryption
- **File Permission Enforcement** - Token and key files restricted to owner-only (0600)
- **Automatic Expiration** - Configurable token lifetime with auto-refresh
- **Session Caching** - Validated sessions cached for 1 hour

---

## Token Architecture

### Token Components

| Component | File | Permissions | Purpose |
|-----------|------|-------------|---------|
| Encryption Key | `.bmad-key` | 0600 | AES-256 encryption key (32 bytes) |
| Auth Token | `.bmad-token` | 0600 | Encrypted user credentials |
| Session Cache | `.claude/.session_claims.json` | 0600 | Cached validation results |

### Token Contents (Encrypted)

```json
{
  "sub": "uuid",                    // Unique user ID
  "name": "Username",               // Display name
  "email": "user@example.com",      // Optional email
  "roles": ["developer"],           // Assigned roles
  "modules": ["bmm", "core"],       // Accessible modules
  "iat": "2026-01-15T12:00:00Z",   // Issued at
  "exp": "2026-01-22T12:00:00Z",   // Expiration
  "jti": "uuid"                    // Unique token ID
}
```

### Token Format

```
bmad.v1.<encrypted-payload>
```

- `bmad.v1` - Version prefix for format identification
- `<encrypted-payload>` - Base64-encoded AES-256-GCM encrypted JSON

---

## Token Lifecycle

### 1. Key Generation

Before generating tokens, an encryption key must exist:

```bash
# Generate new encryption key (if not exists)
node _bmad/core/security/generate-key.js

# Verify key exists and has correct permissions
ls -la .bmad-key
# Should show: -rw------- ... .bmad-key
```

**Warning:** Regenerating the key invalidates ALL existing tokens.

### 2. Token Generation

**Interactive Method (Recommended for First-Time Setup):**

```bash
node _bmad/core/security/generate-token.js
```

Prompts for:

- Display name
- Email (optional)
- Role selection (from available roles)
- Token duration (hours)
- Credential verification (for intel-team access)

**Quick Method (For Scripted Operations):**

```bash
node _bmad/core/security/quick-token.cjs "Name" "role" [hours]

# Examples:
node _bmad/core/security/quick-token.cjs "Alice" "developer" 168
node _bmad/core/security/quick-token.cjs "Bob" "admin" 8
node _bmad/core/security/quick-token.cjs "Carol" "security_analyst" 24
```

**Output:**

```
Token generated successfully!
Token file: .bmad-token
Expires: 2026-01-22T12:00:00Z (168 hours)
Roles: developer
```

### 3. Token Validation

Tokens are automatically validated at session start by the `token-validator.js` hook.

**Manual Validation:**

```bash
node _bmad/core/security/validate-token.js
```

**Validation Tests (12 Total):**

| # | Test | What It Checks |
|---|------|----------------|
| 1 | Key Exists | `.bmad-key` file present |
| 2 | Key Permissions | File mode is 0600 |
| 3 | Key Size | Exactly 32 bytes (256 bits) |
| 4 | Token Exists | `.bmad-token` file present |
| 5 | Token Permissions | File mode is 0600 |
| 6 | Token Format | Starts with `bmad.v1.` |
| 7 | Decryption | Can decrypt with current key |
| 8 | Required Claims | Has sub, name, roles, exp |
| 9 | Not Expired | exp > current time |
| 10 | Valid Issued Date | iat <= current time |
| 11 | Valid Roles | All roles exist in RBAC config |
| 12 | Valid UUIDs | sub and jti are valid UUIDs |

**Validation Output:**

```
Token Validation Results
========================
[PASS] Encryption key exists
[PASS] Key file has correct permissions (0600)
[PASS] Key is correct size (32 bytes)
[PASS] Token file exists
[PASS] Token file has correct permissions (0600)
[PASS] Token format is valid
[PASS] Token decrypted successfully
[PASS] Required claims present
[PASS] Token not expired (expires in 6 days, 23 hours)
[PASS] Issued date is valid
[PASS] All roles are valid
[PASS] UUIDs are valid format

Token is VALID
User: Alice
Roles: developer
Expires: 2026-01-22T12:00:00Z
```

### 4. Token Refresh

**Automatic Refresh:**

Tokens within 24 hours of expiration are automatically refreshed during session validation (if `refresh_threshold_hours` is configured).

**Manual Refresh:**

Generate a new token before expiration:

```bash
# Check current token status
node _bmad/core/security/validate-token.js

# Generate replacement token with same role
node _bmad/core/security/quick-token.cjs "Alice" "developer" 168
```

### 5. Token Revocation

**Single Token Revocation:**

```bash
# Remove the token file
rm .bmad-token

# Session ends immediately - no valid token
```

**Emergency Revocation (All Tokens):**

```bash
# Regenerate the encryption key
rm .bmad-key
node _bmad/core/security/generate-key.js

# All existing tokens are now invalid
# Regenerate tokens for legitimate users
```

---

## Token Configuration

### Configuration File

```
_bmad/core/security/auth-config.yaml
```

### Key Settings

```yaml
authentication:
  enabled: true
  method: local_token

  local_token:
    token_file: "{project-root}/.bmad-token"
    max_age_hours: 168              # 7 days default
    refresh_threshold_hours: 24     # Auto-refresh if within 24h of expiry

  session:
    timeout_minutes: 480            # 8 hours inactivity timeout
    max_lifetime_hours: 24          # Absolute session maximum

  security:
    algorithm: "aes-256-gcm"
    required_claims: ["sub", "name", "roles", "exp"]
    allowed_roles:
      - admin
      - security_lead
      - security_analyst
      - intel_analyst
      - legal_counsel
      - developer
      - product_manager
      - strategist
      - viewer
      - guest
```

### Modifying Configuration

```bash
# Edit configuration
vim _bmad/core/security/auth-config.yaml

# Validate YAML syntax
python3 -c "import yaml; yaml.safe_load(open('_bmad/core/security/auth-config.yaml'))"
```

---

## Token Rotation Procedures

### Scheduled Rotation (Recommended)

Rotate tokens on a regular schedule to limit exposure window.

**Weekly Rotation Script:**

```bash
#!/bin/bash
# token-rotation.sh - Run weekly via cron

# 1. Generate new token with current user's role
CURRENT_USER=$(node _bmad/core/security/get-current-user.js)
CURRENT_ROLE=$(node _bmad/core/security/get-current-role.js)

node _bmad/core/security/quick-token.cjs "$CURRENT_USER" "$CURRENT_ROLE" 168

# 2. Log rotation
echo "$(date): Token rotated for $CURRENT_USER" >> /var/log/bmad-token-rotation.log
```

### Emergency Rotation

When a token may be compromised:

```bash
# 1. Immediately revoke current token
rm .bmad-token

# 2. Regenerate encryption key (invalidates ALL tokens)
rm .bmad-key
node _bmad/core/security/generate-key.js

# 3. Generate new token
node _bmad/core/security/generate-token.js

# 4. Audit recent activity
grep "$(date +%Y-%m-%d)" .claude/logs/security.log
```

### Key Rotation

Rotate the encryption key periodically or after suspected compromise:

```bash
# 1. Backup current token info (if needed)
node _bmad/core/security/validate-token.js > /tmp/token-info.txt

# 2. Regenerate key
rm .bmad-key
node _bmad/core/security/generate-key.js

# 3. Regenerate all user tokens
# (coordinate with all users)
node _bmad/core/security/quick-token.cjs "Alice" "developer" 168
node _bmad/core/security/quick-token.cjs "Bob" "security_analyst" 168
# ... etc
```

---

## Session Management

### Session Caching

Validated sessions are cached to avoid repeated token validation:

- **Cache Location:** `.claude/.session_claims.json`
- **Cache Duration:** 1 hour
- **Permissions:** 0600 (owner-only)

**View Current Session:**

```bash
cat .claude/.session_claims.json | jq .
```

**Clear Session Cache:**

```bash
rm .claude/.session_claims.json
```

### Session Timeouts

| Timeout Type | Default | Description |
|--------------|---------|-------------|
| Inactivity | 8 hours | Session ends after 8 hours of inactivity |
| Maximum | 24 hours | Absolute session limit regardless of activity |
| Cache | 1 hour | Re-validation required hourly |

### Ending a Session

```bash
# Clear session cache (requires re-validation)
rm .claude/.session_claims.json

# Full session termination
rm .bmad-token
```

---

## Security Considerations

### File Permissions

Both token and key files MUST have 0600 permissions:

```bash
# Check permissions
ls -la .bmad-token .bmad-key

# Fix if incorrect
chmod 600 .bmad-token .bmad-key
```

**Validation will fail** if permissions are incorrect.

### Git Ignore

Both files are in `.gitignore` - NEVER commit them:

```gitignore
.bmad-token
.bmad-key
```

**If accidentally committed:**

```bash
# Remove from git history (requires force push)
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch .bmad-token .bmad-key' \
  --prune-empty --tag-name-filter cat -- --all

# Regenerate key and tokens (old ones are compromised)
rm .bmad-key
node _bmad/core/security/generate-key.js
node _bmad/core/security/generate-token.js
```

### Token Storage Best Practices

| DO | DON'T |
|----|-------|
| Store in project root only | Share tokens between users |
| Use 0600 permissions | Commit to version control |
| Rotate regularly | Use tokens longer than 7 days |
| Audit token usage | Email or message tokens |

---

## Troubleshooting

### Token Not Found

```
ERROR: Token file not found: .bmad-token
```

**Solution:**

```bash
node _bmad/core/security/generate-token.js
```

### Token Expired

```
ERROR: Token expired at 2026-01-15T12:00:00Z
```

**Solution:**

```bash
node _bmad/core/security/quick-token.cjs "User" "role" 168
```

### Permission Denied

```
ERROR: Token file permissions are incorrect (expected 0600)
```

**Solution:**

```bash
chmod 600 .bmad-token .bmad-key
```

### Decryption Failed

```
ERROR: Failed to decrypt token
```

**Causes:**

- Token was encrypted with a different key
- Token file is corrupted
- Key file is corrupted

**Solution:**

```bash
# Regenerate both key and token
rm .bmad-key .bmad-token
node _bmad/core/security/generate-key.js
node _bmad/core/security/generate-token.js
```

### Invalid Role

```
ERROR: Role 'invalid_role' is not defined in RBAC configuration
```

**Solution:**

```bash
# View available roles
node _bmad/core/security/check-authorization.js roles

# Regenerate with valid role
node _bmad/core/security/quick-token.cjs "User" "developer" 168
```

---

## Audit Trail

All token operations are logged:

```bash
# View token-related events
grep -E "token|auth|session" .claude/logs/security.log

# View recent validation attempts
grep "validate" .claude/logs/security.log | tail -20

# View failed validations
grep "FAILED\|DENIED\|ERROR" .claude/logs/security.log
```

---

## Quick Reference

### Token Commands

| Command | Purpose |
|---------|---------|
| `node _bmad/core/security/generate-key.js` | Generate encryption key |
| `node _bmad/core/security/generate-token.js` | Interactive token generation |
| `node _bmad/core/security/quick-token.cjs "Name" "role" hours` | Quick token generation |
| `node _bmad/core/security/validate-token.js` | Validate current token |
| `node _bmad/core/security/check-authorization.js` | Check permissions |

### File Locations

| File | Purpose |
|------|---------|
| `.bmad-key` | Encryption key (32 bytes) |
| `.bmad-token` | Encrypted auth token |
| `.claude/.session_claims.json` | Session cache |
| `_bmad/core/security/auth-config.yaml` | Configuration |

### Token Durations by Role

| Role | Recommended Duration |
|------|---------------------|
| admin | 8 hours |
| security_lead | 24 hours |
| security_analyst | 168 hours (7 days) |
| intel_analyst | 24 hours |
| developer | 168 hours (7 days) |
| guest | 4 hours |

---

## Related Documentation

- [RBAC Operations Guide](RBAC-OPERATIONS-GUIDE.md) - Role assignment procedures
- [Audit Log Guide](AUDIT-LOG-GUIDE.md) - Log interpretation and monitoring
- [Security Maintenance Checklist](SECURITY-MAINTENANCE-CHECKLIST.md) - Regular maintenance procedures
- [Incident Response Runbook](../Operations/INCIDENT-RESPONSE-RUNBOOK.md) - Security incident handling
