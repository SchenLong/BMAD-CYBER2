#!/usr/bin/env python3
"""
BMAD Guardrails: Plugin Permission Model
==========================================
Implements capability-based security for BMAD plugins/modules.

Features:
- Plugin manifest schema with declared permissions
- Runtime permission checking
- Capability sets (filesystem, network, shell, sensitive_data)
- Integration with RBAC for permission inheritance
- Full audit logging

OWASP Reference: LLM07 - Insecure Plugin Design
Requirements: REQ-1.2.1 through REQ-1.2.6

Usage:
    from plugin_permissions import PluginPermissionChecker, check_plugin_permission

    checker = PluginPermissionChecker()
    allowed, message = checker.check_permission('intel-team', 'filesystem', 'read', '_bmad/intel-team/data.txt')
"""

import json
import os
import sys
import re
import fnmatch
import hashlib
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Set, Tuple, Any, Union
from pathlib import Path
from datetime import datetime

# Import shared security utilities
try:
    from security_common import (
        AuditLogger,
        PROJECT_DIR,
        resolve_path,
    )
except ImportError:
    PROJECT_DIR = os.environ.get('CLAUDE_PROJECT_DIR', os.getcwd())

    class AuditLogger:
        @classmethod
        def log(cls, validator: str, action: str, details: Dict, severity: str = 'INFO'):
            timestamp = datetime.now().isoformat()
            entry = {'timestamp': timestamp, 'validator': validator, 'action': action,
                     'details': details, 'severity': severity}
            print(f"AUDIT: {json.dumps(entry)}", file=sys.stderr)

    def resolve_path(path: str, cwd: str) -> str:
        if not path:
            return ''
        path = os.path.expanduser(path)
        if not os.path.isabs(path):
            path = os.path.join(cwd, path)
        return os.path.realpath(path)

# Import telemetry collector (graceful fallback)
try:
    from telemetry_collector import record_permission_check
    TELEMETRY_AVAILABLE = True
except ImportError:
    TELEMETRY_AVAILABLE = False
    def record_permission_check(*args, **kwargs): pass


# ============================================================================
# Configuration
# ============================================================================

# Directory containing BMAD modules
BMAD_DIR = os.path.join(PROJECT_DIR, '_bmad')

# Core manifest directory
MANIFESTS_DIR = os.path.join(PROJECT_DIR, '_bmad', 'core', 'manifests')

# Permission capabilities
CAPABILITIES = {
    'filesystem': {
        'description': 'Read/write access to files',
        'operations': ['read', 'write', 'delete', 'list']
    },
    'network': {
        'description': 'Network access (API calls, web fetch)',
        'operations': ['fetch', 'search', 'api_call']
    },
    'shell': {
        'description': 'Shell command execution',
        'operations': ['execute', 'spawn']
    },
    'sensitive_data': {
        'description': 'Access to sensitive/PII data',
        'operations': ['read', 'process']
    },
}

# Default permissions for plugins without manifest
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

# RBAC role to permission mapping
RBAC_PERMISSIONS = {
    'admin': {
        'filesystem': {'read': ['**'], 'write': ['**']},
        'network': True,
        'shell': {'allowed_commands': ['*']},
        'sensitive_data': True,
    },
    'developer': {
        'filesystem': {'read': ['**'], 'write': ['_bmad/**', 'docs/**', 'tests/**']},
        'network': True,
        'shell': {'allowed_commands': ['git', 'npm', 'python', 'pytest']},
        'sensitive_data': False,
    },
    'analyst': {
        'filesystem': {'read': ['_bmad/**', 'docs/**'], 'write': ['_bmad/*/output/**']},
        'network': True,
        'shell': {'allowed_commands': ['curl', 'wget', 'whois', 'dig', 'nslookup']},
        'sensitive_data': False,
    },
    'viewer': {
        'filesystem': {'read': ['docs/**'], 'write': []},
        'network': False,
        'shell': {'allowed_commands': []},
        'sensitive_data': False,
    },
}

# Dangerous commands that require explicit allowlisting
DANGEROUS_COMMANDS = {
    'rm', 'mv', 'chmod', 'chown', 'sudo', 'su', 'dd', 'mkfs',
    'kill', 'killall', 'reboot', 'shutdown', 'systemctl',
    'iptables', 'netstat', 'passwd', 'useradd', 'userdel',
}


# ============================================================================
# Data Classes
# ============================================================================

@dataclass
class PluginManifest:
    """Plugin manifest with declared permissions."""
    name: str
    version: str
    permissions: Dict[str, Any] = field(default_factory=dict)
    signature: Optional[str] = None
    checksum: Optional[str] = None

    @classmethod
    def from_yaml(cls, data: Dict[str, Any]) -> 'PluginManifest':
        """Create manifest from YAML dictionary."""
        return cls(
            name=data.get('name', 'unknown'),
            version=data.get('version', '0.0.0'),
            permissions=data.get('permissions', {}),
            signature=data.get('signature'),
            checksum=data.get('checksum'),
        )

    @classmethod
    def from_file(cls, path: str) -> Optional['PluginManifest']:
        """Load manifest from file."""
        try:
            import yaml
            with open(path, 'r') as f:
                data = yaml.safe_load(f)
                return cls.from_yaml(data)
        except ImportError:
            # Fallback to JSON-style YAML parsing if pyyaml not available
            try:
                with open(path, 'r') as f:
                    content = f.read()
                    # Simple YAML parser for basic manifests
                    data = cls._parse_simple_yaml(content)
                    return cls.from_yaml(data)
            except Exception:
                return None
        except Exception:
            return None

    @staticmethod
    def _parse_simple_yaml(content: str) -> Dict[str, Any]:
        """Simple YAML parser for basic manifests (no pyyaml dependency)."""
        result = {}
        current_key = None
        current_section = None

        for line in content.split('\n'):
            line = line.rstrip()
            if not line or line.startswith('#'):
                continue

            # Check for section (key:)
            if ':' in line and not line.startswith(' ') and not line.startswith('\t'):
                parts = line.split(':', 1)
                key = parts[0].strip()
                value = parts[1].strip() if len(parts) > 1 else ''

                if value:
                    # Simple key: value
                    if value == 'true':
                        result[key] = True
                    elif value == 'false':
                        result[key] = False
                    else:
                        result[key] = value
                else:
                    # Section start
                    current_key = key
                    result[key] = {}
                    current_section = result[key]

            elif current_section is not None and line.startswith('  '):
                # Nested content
                stripped = line.strip()
                if ':' in stripped:
                    parts = stripped.split(':', 1)
                    sub_key = parts[0].strip()
                    sub_value = parts[1].strip() if len(parts) > 1 else ''

                    if sub_value.startswith('[') and sub_value.endswith(']'):
                        # List
                        items = sub_value[1:-1].split(',')
                        current_section[sub_key] = [i.strip().strip('"\'') for i in items if i.strip()]
                    elif sub_value == 'true':
                        current_section[sub_key] = True
                    elif sub_value == 'false':
                        current_section[sub_key] = False
                    elif sub_value:
                        current_section[sub_key] = sub_value
                    else:
                        current_section[sub_key] = {}
                elif stripped.startswith('- '):
                    # List item
                    if not isinstance(current_section, list):
                        if current_key:
                            result[current_key] = []
                            current_section = result[current_key]
                    current_section.append(stripped[2:].strip().strip('"\''))

        return result


@dataclass
class PermissionCheck:
    """Result of a permission check."""
    allowed: bool
    reason: str
    plugin: str
    capability: str
    operation: str
    target: str
    manifest_found: bool = False
    rbac_override: bool = False


# ============================================================================
# Permission Checker Implementation
# ============================================================================

class PluginPermissionChecker:
    """
    Checks plugin permissions against declared capabilities.

    Loads plugin manifests and validates operations against
    declared permissions. Integrates with RBAC for user-based
    permission inheritance.
    """

    def __init__(self):
        self.manifests: Dict[str, PluginManifest] = {}
        self._load_manifests()
        self.current_role: Optional[str] = os.environ.get('BMAD_USER_ROLE', 'developer')

    def _load_manifests(self) -> None:
        """Load all plugin manifests from BMAD directories."""
        if not os.path.exists(BMAD_DIR):
            return

        # Look for manifest.yaml in each plugin directory
        for plugin_name in os.listdir(BMAD_DIR):
            plugin_path = os.path.join(BMAD_DIR, plugin_name)
            if not os.path.isdir(plugin_path):
                continue
            if plugin_name.startswith('_'):
                continue  # Skip config directories

            manifest_path = os.path.join(plugin_path, 'manifest.yaml')
            if os.path.exists(manifest_path):
                manifest = PluginManifest.from_file(manifest_path)
                if manifest:
                    self.manifests[plugin_name] = manifest

    def _get_plugin_permissions(self, plugin: str) -> Dict[str, Any]:
        """Get permissions for a plugin (from manifest or defaults)."""
        if plugin in self.manifests:
            return self.manifests[plugin].permissions

        # Return default permissions with plugin name substituted
        defaults = json.loads(
            json.dumps(DEFAULT_PERMISSIONS).replace('${plugin}', plugin)
        )
        return defaults

    def _get_rbac_permissions(self) -> Optional[Dict[str, Any]]:
        """Get RBAC permissions for current role."""
        if self.current_role and self.current_role in RBAC_PERMISSIONS:
            return RBAC_PERMISSIONS[self.current_role]
        return None

    def _match_path_pattern(self, path: str, patterns: List[str]) -> bool:
        """Check if path matches any of the patterns."""
        # Normalize path
        path = path.replace('\\', '/')
        if path.startswith('./'):
            path = path[2:]

        for pattern in patterns:
            pattern = pattern.replace('${plugin}', '*')

            # Convert glob pattern to regex-friendly format
            if fnmatch.fnmatch(path, pattern):
                return True

            # Also check parent directories
            path_parts = path.split('/')
            for i in range(len(path_parts)):
                partial_path = '/'.join(path_parts[:i+1])
                if fnmatch.fnmatch(partial_path, pattern):
                    return True

        return False

    def _check_filesystem_permission(self, plugin: str, operation: str,
                                     target: str) -> Tuple[bool, str]:
        """Check filesystem permission for an operation."""
        plugin_perms = self._get_plugin_permissions(plugin)
        fs_perms = plugin_perms.get('filesystem', {})

        if isinstance(fs_perms, bool):
            return fs_perms, "Filesystem access allowed" if fs_perms else "Filesystem access denied"

        # Get operation-specific patterns
        allowed_patterns = fs_perms.get(operation, [])
        if isinstance(allowed_patterns, bool):
            return allowed_patterns, f"Filesystem {operation} allowed" if allowed_patterns else f"Filesystem {operation} denied"

        if not allowed_patterns:
            return False, f"No {operation} patterns defined for plugin {plugin}"

        # Normalize target path
        target_normalized = target.replace(PROJECT_DIR + '/', '')
        target_normalized = target_normalized.lstrip('./')

        if self._match_path_pattern(target_normalized, allowed_patterns):
            return True, f"Path matches allowed pattern"

        return False, f"Path '{target_normalized}' not in allowed patterns for {operation}"

    def _check_shell_permission(self, plugin: str, operation: str,
                                command: str) -> Tuple[bool, str]:
        """Check shell permission for a command."""
        plugin_perms = self._get_plugin_permissions(plugin)
        shell_perms = plugin_perms.get('shell', {})

        if isinstance(shell_perms, bool):
            return shell_perms, "Shell access allowed" if shell_perms else "Shell access denied"

        # Extract command name
        cmd_parts = command.strip().split()
        if not cmd_parts:
            return False, "Empty command"

        cmd_name = os.path.basename(cmd_parts[0])

        # Check allowed commands first
        allowed = shell_perms.get('allowed_commands', [])

        # If no allowed commands and blocked is '*', block all
        blocked = shell_perms.get('blocked_commands', [])
        if '*' in blocked:
            # Block all unless explicitly in allowed list
            if '*' in allowed:
                return True, "All commands allowed"
            if cmd_name in allowed:
                return True, f"Command '{cmd_name}' in allowed list"
            return False, f"Command '{cmd_name}' blocked (all commands blocked by '*')"

        # Check specific blocked commands
        if cmd_name in blocked or cmd_name in DANGEROUS_COMMANDS:
            # Check if explicitly allowed
            if '*' not in allowed and cmd_name not in allowed:
                return False, f"Command '{cmd_name}' is blocked"

        # Check allowed commands
        if '*' in allowed:
            return True, "All commands allowed"

        if allowed and cmd_name not in allowed:
            return False, f"Command '{cmd_name}' not in allowed commands"

        return True, "Command allowed"

    def _check_network_permission(self, plugin: str, operation: str,
                                  target: str) -> Tuple[bool, str]:
        """Check network permission."""
        plugin_perms = self._get_plugin_permissions(plugin)
        network_perms = plugin_perms.get('network', False)

        if isinstance(network_perms, bool):
            return network_perms, "Network access allowed" if network_perms else "Network access denied"

        # Could expand to check specific domains, etc.
        return True, "Network access allowed"

    def _check_sensitive_data_permission(self, plugin: str, operation: str,
                                         target: str) -> Tuple[bool, str]:
        """Check sensitive data permission."""
        plugin_perms = self._get_plugin_permissions(plugin)
        sensitive_perms = plugin_perms.get('sensitive_data', False)

        if isinstance(sensitive_perms, bool):
            return sensitive_perms, "Sensitive data access allowed" if sensitive_perms else "Sensitive data access denied"

        return False, "Sensitive data access requires explicit permission"

    def _apply_rbac_override(self, plugin: str, capability: str,
                              operation: str, target: str) -> Optional[Tuple[bool, str]]:
        """
        Apply RBAC override if applicable.

        Note: RBAC only grants additional permissions, it does NOT override
        plugin manifest restrictions. Plugin manifests take precedence for
        security reasons.
        """
        # If plugin has explicit manifest, respect its restrictions
        # RBAC can only expand permissions for unknown plugins or within manifest bounds
        if plugin in self.manifests:
            return None  # Let plugin manifest control permissions

        rbac_perms = self._get_rbac_permissions()
        if not rbac_perms:
            return None

        if capability == 'filesystem':
            fs_perms = rbac_perms.get('filesystem', {})
            patterns = fs_perms.get(operation, [])
            if patterns and self._match_path_pattern(target, patterns):
                return True, f"RBAC override ({self.current_role})"

        elif capability == 'shell':
            shell_perms = rbac_perms.get('shell', {})
            allowed = shell_perms.get('allowed_commands', [])
            cmd_name = os.path.basename(target.split()[0]) if target else ''
            if '*' in allowed or cmd_name in allowed:
                return True, f"RBAC override ({self.current_role})"

        elif capability in ('network', 'sensitive_data'):
            cap_perm = rbac_perms.get(capability, False)
            if cap_perm:
                return True, f"RBAC override ({self.current_role})"

        return None

    def check_permission(self, plugin: str, capability: str, operation: str,
                         target: str = "") -> PermissionCheck:
        """
        Check if an operation is permitted for a plugin.

        Args:
            plugin: Plugin name (e.g., 'intel-team')
            capability: Capability type (filesystem, network, shell, sensitive_data)
            operation: Specific operation (read, write, execute, etc.)
            target: Target of operation (path, command, URL, etc.)

        Returns:
            PermissionCheck with result details
        """
        # Validate capability
        if capability not in CAPABILITIES:
            return PermissionCheck(
                allowed=False,
                reason=f"Unknown capability: {capability}",
                plugin=plugin,
                capability=capability,
                operation=operation,
                target=target,
            )

        # Validate operation
        valid_ops = CAPABILITIES[capability]['operations']
        if operation not in valid_ops:
            return PermissionCheck(
                allowed=False,
                reason=f"Unknown operation '{operation}' for capability '{capability}'",
                plugin=plugin,
                capability=capability,
                operation=operation,
                target=target,
            )

        # Check RBAC override first
        rbac_result = self._apply_rbac_override(plugin, capability, operation, target)
        if rbac_result:
            allowed, reason = rbac_result
            return PermissionCheck(
                allowed=allowed,
                reason=reason,
                plugin=plugin,
                capability=capability,
                operation=operation,
                target=target,
                manifest_found=plugin in self.manifests,
                rbac_override=True,
            )

        # Check capability-specific permissions
        if capability == 'filesystem':
            allowed, reason = self._check_filesystem_permission(plugin, operation, target)
        elif capability == 'shell':
            allowed, reason = self._check_shell_permission(plugin, operation, target)
        elif capability == 'network':
            allowed, reason = self._check_network_permission(plugin, operation, target)
        elif capability == 'sensitive_data':
            allowed, reason = self._check_sensitive_data_permission(plugin, operation, target)
        else:
            allowed, reason = False, f"Capability '{capability}' not implemented"

        result = PermissionCheck(
            allowed=allowed,
            reason=reason,
            plugin=plugin,
            capability=capability,
            operation=operation,
            target=target,
            manifest_found=plugin in self.manifests,
        )

        # Log permission checks
        severity = 'INFO' if allowed else 'BLOCKED'
        AuditLogger.log('plugin_permissions', 'PERMISSION_CHECK', {
            'plugin': plugin,
            'capability': capability,
            'operation': operation,
            'target': target[:200] if target else '',
            'allowed': allowed,
            'reason': reason,
            'manifest_found': plugin in self.manifests,
        }, severity=severity)

        # Emit telemetry for permission audit
        if TELEMETRY_AVAILABLE:
            manifest = self.manifests.get(plugin)
            record_permission_check(
                plugin_name=plugin,
                capability=f"{capability}.{operation}",
                requested_resource=target[:500] if target else '',
                decision='GRANTED' if allowed else 'DENIED',
                reason=reason,
                manifest_version=manifest.version if manifest else None,
                rbac_role=self.current_role,
            )

        return result

    def get_plugin_capabilities(self, plugin: str) -> Dict[str, Any]:
        """Get all capabilities for a plugin."""
        return self._get_plugin_permissions(plugin)

    def list_plugins(self) -> List[Dict[str, Any]]:
        """List all known plugins with their manifest status."""
        plugins = []

        if os.path.exists(BMAD_DIR):
            for name in os.listdir(BMAD_DIR):
                path = os.path.join(BMAD_DIR, name)
                if os.path.isdir(path) and not name.startswith('_'):
                    plugins.append({
                        'name': name,
                        'has_manifest': name in self.manifests,
                        'version': self.manifests[name].version if name in self.manifests else None,
                    })

        return plugins


# ============================================================================
# Manifest Generation
# ============================================================================

def generate_manifest_template(plugin_name: str, plugin_type: str = 'general') -> str:
    """
    Generate a manifest template for a plugin.

    Args:
        plugin_name: Name of the plugin
        plugin_type: Type of plugin (intel, legal, strategy, dev, general)

    Returns:
        YAML manifest template as string
    """
    # Type-specific permission templates
    type_permissions = {
        'intel': {
            'filesystem': {
                'read': [f'_bmad/{plugin_name}/**', 'docs/**', '_bmad/core/**'],
                'write': [f'_bmad/{plugin_name}/output/**'],
            },
            'network': True,
            'shell': {
                'allowed_commands': ['curl', 'wget', 'whois', 'dig', 'nslookup', 'host'],
                'blocked_commands': ['rm', 'mv', 'chmod', 'sudo'],
            },
            'sensitive_data': True,
        },
        'legal': {
            'filesystem': {
                'read': [f'_bmad/{plugin_name}/**', 'docs/**', '_bmad/core/**'],
                'write': [f'_bmad/{plugin_name}/output/**', 'docs/legal/**'],
            },
            'network': True,
            'shell': {
                'allowed_commands': [],
                'blocked_commands': ['*'],
            },
            'sensitive_data': True,
        },
        'strategy': {
            'filesystem': {
                'read': [f'_bmad/{plugin_name}/**', 'docs/**', '_bmad/core/**'],
                'write': [f'_bmad/{plugin_name}/output/**'],
            },
            'network': True,
            'shell': {
                'allowed_commands': [],
                'blocked_commands': ['*'],
            },
            'sensitive_data': False,
        },
        'dev': {
            'filesystem': {
                'read': ['**'],
                'write': ['src/**', 'tests/**', 'docs/**'],
            },
            'network': True,
            'shell': {
                'allowed_commands': ['git', 'npm', 'python', 'pytest', 'node'],
                'blocked_commands': ['rm -rf', 'sudo'],
            },
            'sensitive_data': False,
        },
        'general': {
            'filesystem': {
                'read': [f'_bmad/{plugin_name}/**', 'docs/**'],
                'write': [f'_bmad/{plugin_name}/output/**'],
            },
            'network': False,
            'shell': {
                'allowed_commands': [],
                'blocked_commands': ['*'],
            },
            'sensitive_data': False,
        },
    }

    perms = type_permissions.get(plugin_type, type_permissions['general'])

    # Build YAML content
    lines = [
        f"# BMAD Plugin Manifest: {plugin_name}",
        f"# Type: {plugin_type}",
        f"# Generated: {datetime.now().isoformat()}",
        "",
        f"name: {plugin_name}",
        "version: 1.0.0",
        "",
        "permissions:",
        "  filesystem:",
    ]

    fs_perms = perms.get('filesystem', {})
    for op, patterns in fs_perms.items():
        if patterns:
            lines.append(f"    {op}: {json.dumps(patterns)}")

    lines.append(f"  network: {str(perms.get('network', False)).lower()}")

    shell_perms = perms.get('shell', {})
    lines.append("  shell:")
    lines.append(f"    allowed_commands: {json.dumps(shell_perms.get('allowed_commands', []))}")
    lines.append(f"    blocked_commands: {json.dumps(shell_perms.get('blocked_commands', []))}")

    lines.append(f"  sensitive_data: {str(perms.get('sensitive_data', False)).lower()}")

    lines.extend([
        "",
        "# Signature (optional GPG signature for verification)",
        "signature: |",
        "  -----BEGIN PGP SIGNATURE-----",
        "  (signature placeholder)",
        "  -----END PGP SIGNATURE-----",
    ])

    return '\n'.join(lines)


def generate_all_manifests(output_dir: Optional[str] = None) -> Dict[str, str]:
    """
    Generate manifests for all BMAD plugins.

    Args:
        output_dir: Optional directory to write manifests (if None, returns dict)

    Returns:
        Dictionary of plugin_name -> manifest content
    """
    manifests = {}

    # Plugin type mappings
    plugin_types = {
        'intel-team': 'intel',
        'legal-team': 'legal',
        'strategy-team': 'strategy',
        'cybersec-team': 'intel',
        'bmm': 'dev',
        'bmb': 'dev',
        'bmgd': 'dev',
        'cis': 'general',
        'core': 'general',
    }

    if os.path.exists(BMAD_DIR):
        for name in os.listdir(BMAD_DIR):
            path = os.path.join(BMAD_DIR, name)
            if os.path.isdir(path) and not name.startswith('_'):
                plugin_type = plugin_types.get(name, 'general')
                manifest_content = generate_manifest_template(name, plugin_type)
                manifests[name] = manifest_content

                if output_dir:
                    manifest_path = os.path.join(output_dir, name, 'manifest.yaml')
                    os.makedirs(os.path.dirname(manifest_path), exist_ok=True)
                    with open(manifest_path, 'w') as f:
                        f.write(manifest_content)

    return manifests


# ============================================================================
# Convenience Functions
# ============================================================================

_permission_checker: Optional[PluginPermissionChecker] = None


def get_permission_checker() -> PluginPermissionChecker:
    """Get or create the global permission checker instance."""
    global _permission_checker
    if _permission_checker is None:
        _permission_checker = PluginPermissionChecker()
    return _permission_checker


def check_plugin_permission(plugin: str, capability: str, operation: str,
                            target: str = "") -> Tuple[bool, str]:
    """
    Check if a plugin operation is permitted.

    Args:
        plugin: Plugin name
        capability: Capability type
        operation: Operation type
        target: Target of operation

    Returns:
        Tuple of (allowed, message)
    """
    checker = get_permission_checker()
    result = checker.check_permission(plugin, capability, operation, target)
    return result.allowed, result.reason


def detect_plugin_from_path(path: str) -> Optional[str]:
    """
    Detect which plugin a path belongs to.

    Args:
        path: File path

    Returns:
        Plugin name or None if not in a plugin directory
    """
    normalized = path.replace(PROJECT_DIR, '').lstrip('/')

    if normalized.startswith('_bmad/'):
        parts = normalized.split('/')
        if len(parts) >= 2:
            plugin_name = parts[1]
            if not plugin_name.startswith('_'):
                return plugin_name

    return None


# ============================================================================
# Hook Integration
# ============================================================================

def validate_plugin_permission() -> int:
    """
    Validate plugin permission as a pre-tool hook.

    Returns:
        Exit code: 0 for allowed, 1 for blocked
    """
    try:
        data = json.load(sys.stdin)
    except (json.JSONDecodeError, IOError):
        return 0  # Allow if can't parse input

    tool_name = data.get('tool_name', '').lower()
    tool_input = data.get('tool_input', {})
    cwd = data.get('cwd', PROJECT_DIR)

    # Map tool to capability/operation
    capability_mapping = {
        'read': ('filesystem', 'read'),
        'write': ('filesystem', 'write'),
        'edit': ('filesystem', 'write'),
        'glob': ('filesystem', 'list'),
        'grep': ('filesystem', 'read'),
        'bash': ('shell', 'execute'),
        'webfetch': ('network', 'fetch'),
        'websearch': ('network', 'search'),
    }

    if tool_name not in capability_mapping:
        return 0  # Unknown tool, allow

    capability, operation = capability_mapping[tool_name]

    # Get target
    target = ""
    if tool_name == 'bash':
        target = tool_input.get('command', '')
    elif tool_name in ('read', 'write', 'edit'):
        target = tool_input.get('file_path', '')
    elif tool_name in ('glob', 'grep'):
        target = tool_input.get('path', cwd)
    elif tool_name in ('webfetch', 'websearch'):
        target = tool_input.get('url', tool_input.get('query', ''))

    # Detect plugin from target path
    plugin = detect_plugin_from_path(target)
    if not plugin:
        return 0  # Not in a plugin directory, allow

    # Check permission
    checker = get_permission_checker()
    result = checker.check_permission(plugin, capability, operation, target)

    if not result.allowed:
        print(f"\n{'='*60}", file=sys.stderr)
        print("BMAD GUARDRAIL: PLUGIN PERMISSION DENIED", file=sys.stderr)
        print(f"{'='*60}", file=sys.stderr)
        print(f"\nPlugin: {plugin}", file=sys.stderr)
        print(f"Capability: {capability}", file=sys.stderr)
        print(f"Operation: {operation}", file=sys.stderr)
        print(f"Target: {target[:100]}", file=sys.stderr)
        print(f"\nReason: {result.reason}", file=sys.stderr)

        if not result.manifest_found:
            print(f"\nNote: No manifest.yaml found for plugin '{plugin}'", file=sys.stderr)
            print("Using default restrictive permissions.", file=sys.stderr)

        print(f"\n{'='*60}\n", file=sys.stderr)
        return 1

    return 0


# ============================================================================
# Main Entry Point
# ============================================================================

if __name__ == '__main__':
    if len(sys.argv) > 1:
        command = sys.argv[1]

        if command == 'list':
            checker = get_permission_checker()
            plugins = checker.list_plugins()
            print(json.dumps(plugins, indent=2))

        elif command == 'check':
            if len(sys.argv) < 5:
                print("Usage: plugin_permissions.py check <plugin> <capability> <operation> [target]")
                sys.exit(1)
            plugin = sys.argv[2]
            capability = sys.argv[3]
            operation = sys.argv[4]
            target = sys.argv[5] if len(sys.argv) > 5 else ""

            allowed, message = check_plugin_permission(plugin, capability, operation, target)
            print(f"Allowed: {allowed}")
            print(f"Message: {message}")
            sys.exit(0 if allowed else 1)

        elif command == 'generate':
            output_dir = sys.argv[2] if len(sys.argv) > 2 else None
            manifests = generate_all_manifests(output_dir)
            if not output_dir:
                for name, content in manifests.items():
                    print(f"\n--- {name} ---")
                    print(content)
            else:
                print(f"Generated {len(manifests)} manifests in {output_dir}")

        elif command == 'validate':
            sys.exit(validate_plugin_permission())

        else:
            print(f"Usage: {sys.argv[0]} [list|check|generate|validate]")
            sys.exit(1)
    else:
        # Run as validator hook
        sys.exit(validate_plugin_permission())
