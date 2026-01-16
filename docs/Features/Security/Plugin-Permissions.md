# Plugin Permission Model

**OWASP Reference:** LLM07 - Insecure Plugin Design
**Implementation:** `.claude/validators/plugin_permissions.py`
**Status:** Implemented (Phase 1 - 2026-01-16)

---

## Overview

The Plugin Permission Model implements capability-based security for BMAD plugins/modules. Each plugin declares its required permissions in a manifest file, and the permission checker validates operations against these declarations at runtime.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Tool Invocation                          │
│            (file path, command, URL, etc.)                   │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                Plugin Detection                              │
│         (detect plugin from path: _bmad/{plugin}/...)        │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              Permission Checker                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Load      │  │   Check     │  │   RBAC              │  │
│  │  Manifest   │──▶│ Capability  │──▶│  Override           │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────┬───────────────────────────────────────┘
                      │
           ┌──────────┴──────────┐
           ▼                     ▼
    ┌────────────┐        ┌────────────┐
    │  ALLOWED   │        │  BLOCKED   │
    └────────────┘        └────────────┘
```

## Capabilities

The permission model defines four capability types:

| Capability | Description | Operations |
|------------|-------------|------------|
| `filesystem` | File system access | read, write, delete, list |
| `network` | Network operations | fetch, search, api_call |
| `shell` | Command execution | execute, spawn |
| `sensitive_data` | PII/sensitive data access | read, process |

## Plugin Manifest Schema

Each plugin should have a `manifest.yaml` in its root directory:

```yaml
# _bmad/{plugin-name}/manifest.yaml
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

# Optional GPG signature for verification
signature: |
  -----BEGIN PGP SIGNATURE-----
  ...
  -----END PGP SIGNATURE-----
```

### Permission Patterns

#### Filesystem Permissions

Use glob patterns to define allowed paths:

```yaml
filesystem:
  read:
    - "_bmad/my-plugin/**"      # All files in plugin directory
    - "docs/**"                  # All documentation
    - "_bmad/core/templates/*"   # Specific templates only
  write:
    - "_bmad/my-plugin/output/**"  # Output directory only
```

#### Shell Permissions

Define allowed and blocked commands:

```yaml
shell:
  allowed_commands: ["git", "npm", "python"]  # Whitelist
  blocked_commands: ["rm", "sudo", "*"]       # Blocklist (* = block all not in allowed)
```

#### Boolean Permissions

Network and sensitive data can be simple booleans:

```yaml
network: true          # Allow all network operations
sensitive_data: false  # Deny access to sensitive data
```

## Plugin Types

The system recognizes different plugin types with pre-configured permissions:

| Type | Network | Shell | Sensitive Data | Example Plugins |
|------|---------|-------|----------------|-----------------|
| `intel` | Yes | curl, wget, whois, dig | Yes | intel-team, cybersec-team |
| `legal` | Yes | None (blocked) | Yes | legal-team |
| `strategy` | Yes | None (blocked) | No | strategy-team |
| `dev` | Yes | git, npm, python, pytest | No | bmm, bmb, bmgd |
| `general` | No | None (blocked) | No | cis, core |

## RBAC Integration

The permission system integrates with RBAC roles:

| Role | Filesystem | Shell | Network | Sensitive Data |
|------|------------|-------|---------|----------------|
| `admin` | Full access | All commands | Yes | Yes |
| `developer` | Full read, limited write | dev tools | Yes | No |
| `analyst` | Read _bmad, docs | recon tools | Yes | No |
| `viewer` | Read docs only | None | No | No |

**Important:** Plugin manifest restrictions take precedence over RBAC grants. RBAC only provides additional permissions for plugins without explicit manifests.

Set role via environment variable:
```bash
export BMAD_USER_ROLE=developer
```

## Usage

### As a Hook Validator

Add to `.claude/settings.json`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "*",
        "hooks": [
          "python3 .claude/validators/plugin_permissions.py validate"
        ]
      }
    ]
  }
}
```

### Programmatic Usage

```python
from plugin_permissions import (
    check_plugin_permission,
    detect_plugin_from_path,
    PluginPermissionChecker
)

# Check permission
allowed, message = check_plugin_permission(
    'intel-team',      # plugin name
    'shell',           # capability
    'execute',         # operation
    'whois example.com' # target
)

# Detect plugin from path
plugin = detect_plugin_from_path('_bmad/intel-team/agents/analyst.md')
# Returns: 'intel-team'

# Get full checker with all capabilities
checker = PluginPermissionChecker()
result = checker.check_permission('intel-team', 'network', 'fetch', 'https://api.example.com')
print(f"Allowed: {result.allowed}, Reason: {result.reason}")
```

### CLI Commands

```bash
# List all plugins and their manifest status
python3 .claude/validators/plugin_permissions.py list

# Check a specific permission
python3 .claude/validators/plugin_permissions.py check intel-team shell execute "curl https://example.com"

# Generate manifests for all plugins
python3 .claude/validators/plugin_permissions.py generate _bmad/
```

## Generated Manifests

Phase 1 generated manifests for all 9 BMAD plugins:

| Plugin | Type | Location |
|--------|------|----------|
| intel-team | intel | `_bmad/intel-team/manifest.yaml` |
| cybersec-team | intel | `_bmad/cybersec-team/manifest.yaml` |
| legal-team | legal | `_bmad/legal-team/manifest.yaml` |
| strategy-team | strategy | `_bmad/strategy-team/manifest.yaml` |
| bmm | dev | `_bmad/bmm/manifest.yaml` |
| bmb | dev | `_bmad/bmb/manifest.yaml` |
| bmgd | dev | `_bmad/bmgd/manifest.yaml` |
| cis | general | `_bmad/cis/manifest.yaml` |
| core | general | `_bmad/core/manifest.yaml` |

## Default Permissions

Plugins without manifests receive restrictive defaults:

```python
DEFAULT_PERMISSIONS = {
    'filesystem': {
        'read': ['_bmad/${plugin}/**', 'docs/**'],
        'write': ['_bmad/${plugin}/output/**'],
    },
    'network': False,
    'shell': {
        'allowed_commands': [],
        'blocked_commands': ['rm', 'mv', 'chmod', 'chown', 'sudo', 'su'],
    },
    'sensitive_data': False,
}
```

## Dangerous Commands

These commands are always blocked unless explicitly allowed:

```python
DANGEROUS_COMMANDS = {
    'rm', 'mv', 'chmod', 'chown', 'sudo', 'su', 'dd', 'mkfs',
    'kill', 'killall', 'reboot', 'shutdown', 'systemctl',
    'iptables', 'netstat', 'passwd', 'useradd', 'userdel',
}
```

## Audit Logging

All permission checks are logged to `.claude/logs/security.log`:

```json
{
  "timestamp": "2026-01-16T01:00:00.000000",
  "session_id": "abc123",
  "validator": "plugin_permissions",
  "severity": "BLOCKED",
  "action": "PERMISSION_CHECK",
  "details": {
    "plugin": "legal-team",
    "capability": "shell",
    "operation": "execute",
    "target": "rm -rf /",
    "allowed": false,
    "reason": "Command 'rm' blocked (all commands blocked by '*')",
    "manifest_found": true
  }
}
```

## Error Messages

When blocked, users see:

```
============================================================
BMAD GUARDRAIL: PLUGIN PERMISSION DENIED
============================================================

Plugin: legal-team
Capability: shell
Operation: execute
Target: rm -rf /

Reason: Command 'rm' blocked (all commands blocked by '*')

Note: Plugin 'legal-team' has explicit manifest restrictions.

============================================================
```

## Testing

Run tests:

```bash
python3 tests/test_plugin_permissions.py
```

Test coverage includes:
- Manifest parsing (4 tests)
- Filesystem permissions (5 tests)
- Shell permissions (5 tests)
- Network permissions (2 tests)
- Sensitive data permissions (2 tests)
- RBAC integration (3 tests)
- Default permissions (3 tests)
- Plugin detection (4 tests)
- Manifest generation (4 tests)

## Security Considerations

1. **Manifest Priority**: Plugin manifests always take precedence over RBAC to prevent privilege escalation
2. **Default Deny**: Unknown operations are denied by default
3. **Path Normalization**: Paths are normalized to prevent traversal attacks
4. **Command Parsing**: Command names are extracted from full command strings

## Related Documents

- [OWASP AI Security Checklist](/_bmad/core/security/OWASP-AI-SECURITY-CHECKLIST.md)
- [OWASP Remediation Plan](/_bmad/core/security/OWASP-REMEDIATION-PLAN.md)
- [RBAC Roles Guide](/docs/UserGuide/RBAC-ROLES-GUIDE.md)
- [Hooks & Validators Guide](/docs/Features/HOOKS-VALIDATORS-GUIDE.md)
