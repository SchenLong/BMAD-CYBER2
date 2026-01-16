# Plugin Manifest Schema Reference

**Version:** 1.0.0
**Status:** Implemented (Phase 1 - 2026-01-16)

---

## Overview

The Plugin Manifest Schema defines the structure for declaring plugin permissions in BMAD modules. Each plugin should have a `manifest.yaml` file in its root directory.

## Schema Definition

### Full Schema

```yaml
# Required fields
name: string                    # Plugin identifier (e.g., "intel-team")
version: string                 # Semantic version (e.g., "1.0.0")

# Permission declarations
permissions:
  filesystem:
    read: string[]              # Glob patterns for read access
    write: string[]             # Glob patterns for write access
    delete: string[]            # Glob patterns for delete access (optional)
    list: string[]              # Glob patterns for directory listing (optional)

  network: boolean | object     # Network access permission
    # If object:
    allowed_domains: string[]   # Domain whitelist (optional)
    blocked_domains: string[]   # Domain blacklist (optional)

  shell:
    allowed_commands: string[]  # Commands that can be executed
    blocked_commands: string[]  # Commands that are blocked (use "*" for all)

  sensitive_data: boolean       # Access to PII/sensitive data

# Optional: GPG signature for verification
signature: string               # PGP signature block

# Optional: SHA256 checksum for integrity
checksum: string                # SHA256 hash of plugin files
```

### Minimal Schema

```yaml
name: my-plugin
version: 1.0.0
```

Without explicit permissions, default restrictive permissions apply.

## Field Definitions

### `name` (required)

The unique identifier for the plugin. Should match the directory name under `_bmad/`.

```yaml
name: intel-team
```

### `version` (required)

Semantic version of the plugin manifest.

```yaml
version: 1.0.0
```

### `permissions.filesystem`

File system access patterns using glob syntax:

| Pattern | Matches |
|---------|---------|
| `**` | All files recursively |
| `*` | All files in directory |
| `*.md` | All markdown files |
| `docs/**/*.md` | All markdown files under docs |

```yaml
permissions:
  filesystem:
    read:
      - "_bmad/my-plugin/**"
      - "docs/**"
    write:
      - "_bmad/my-plugin/output/**"
```

### `permissions.network`

Network access control. Can be:

**Boolean (simple):**
```yaml
permissions:
  network: true   # Allow all network access
  network: false  # Deny all network access
```

**Object (granular - future):**
```yaml
permissions:
  network:
    allowed_domains:
      - "api.example.com"
      - "*.github.com"
    blocked_domains:
      - "evil.com"
```

### `permissions.shell`

Shell command execution control:

```yaml
permissions:
  shell:
    allowed_commands:
      - "git"
      - "npm"
      - "python"
    blocked_commands:
      - "rm"
      - "sudo"
      - "*"        # Block all commands not in allowed_commands
```

**Priority:**
1. If command is in `blocked_commands` (or `*` in blocked), check `allowed_commands`
2. If command is in `allowed_commands`, allow
3. If `*` is in `allowed_commands`, allow all
4. Otherwise, deny

### `permissions.sensitive_data`

Access to PII and sensitive data:

```yaml
permissions:
  sensitive_data: true   # Can process sensitive data
  sensitive_data: false  # Cannot access sensitive data
```

### `signature` (optional)

GPG signature for manifest verification:

```yaml
signature: |
  -----BEGIN PGP SIGNATURE-----

  iQEzBAABCAAdFiEE...
  ...
  -----END PGP SIGNATURE-----
```

### `checksum` (optional)

SHA256 checksum for integrity verification:

```yaml
checksum: sha256:a1b2c3d4e5f6...
```

## Examples

### Intel/Security Plugin

```yaml
name: intel-team
version: 1.0.0

permissions:
  filesystem:
    read: ["_bmad/intel-team/**", "docs/**", "_bmad/core/**"]
    write: ["_bmad/intel-team/output/**"]
  network: true
  shell:
    allowed_commands: ["curl", "wget", "whois", "dig", "nslookup", "host"]
    blocked_commands: ["rm", "mv", "chmod", "sudo"]
  sensitive_data: true
```

### Legal Plugin (Restricted Shell)

```yaml
name: legal-team
version: 1.0.0

permissions:
  filesystem:
    read: ["_bmad/legal-team/**", "docs/**", "_bmad/core/**"]
    write: ["_bmad/legal-team/output/**", "docs/legal/**"]
  network: true
  shell:
    allowed_commands: []
    blocked_commands: ["*"]
  sensitive_data: true
```

### Development Plugin

```yaml
name: bmm
version: 1.0.0

permissions:
  filesystem:
    read: ["**"]
    write: ["src/**", "tests/**", "docs/**"]
  network: true
  shell:
    allowed_commands: ["git", "npm", "python", "pytest", "node"]
    blocked_commands: ["rm -rf", "sudo"]
  sensitive_data: false
```

### Minimal/Restricted Plugin

```yaml
name: viewer-only
version: 1.0.0

permissions:
  filesystem:
    read: ["docs/**"]
    write: []
  network: false
  shell:
    allowed_commands: []
    blocked_commands: ["*"]
  sensitive_data: false
```

## Validation Rules

1. **name**: Must match directory name in `_bmad/`
2. **version**: Must be valid semantic version
3. **filesystem patterns**: Must use valid glob syntax
4. **shell commands**: Command names only, no arguments
5. **signature**: Must be valid PGP signature if present

## Default Permissions

Plugins without manifests receive these defaults:

```yaml
permissions:
  filesystem:
    read: ["_bmad/${plugin}/**", "docs/**"]
    write: ["_bmad/${plugin}/output/**"]
  network: false
  shell:
    allowed_commands: []
    blocked_commands: ["rm", "mv", "chmod", "chown", "sudo", "su"]
  sensitive_data: false
```

## Generating Manifests

Use the CLI to generate manifests:

```bash
# Generate for all plugins
python3 .claude/validators/plugin_permissions.py generate _bmad/

# Preview without writing
python3 .claude/validators/plugin_permissions.py generate
```

## Manifest Location

Manifests should be placed at:

```
_bmad/
├── intel-team/
│   ├── manifest.yaml    <-- Here
│   ├── agents/
│   └── workflows/
├── legal-team/
│   ├── manifest.yaml    <-- Here
│   └── ...
```

## Related Documents

- [Plugin Permissions](/docs/Features/Security/Plugin-Permissions.md)
- [RBAC Roles Guide](/docs/UserGuide/RBAC-ROLES-GUIDE.md)
- [OWASP Remediation Plan](/_bmad/core/security/OWASP-REMEDIATION-PLAN.md)
