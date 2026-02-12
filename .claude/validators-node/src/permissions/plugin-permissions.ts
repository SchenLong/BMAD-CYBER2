/**
 * BMAD Guardrails: Plugin Permission Model
 * =========================================
 * Implements capability-based security for BMAD plugins/modules.
 *
 * Features:
 * - Plugin manifest schema with declared permissions
 * - Runtime permission checking
 * - Capability sets (filesystem, network, shell, sensitive_data)
 * - Integration with RBAC for permission inheritance
 * - Full audit logging
 *
 * OWASP Reference: LLM07 - Insecure Plugin Design
 * Requirements: REQ-1.2.1 through REQ-1.2.6
 *
 * Exit Codes:
 * - 0: Allow the operation
 * - 1: Block the operation (permission denied)
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  AuditLogger,
  getProjectDir,
  getToolInputFromStdinSync,
  printBlockMessage,
} from '../common/index.js';
import { EXIT_CODES } from '../types/index.js';

const VALIDATOR_NAME = 'plugin_permissions';

// ============================================================================
// Configuration
// ============================================================================

/** Get project directory from environment or cwd */
const PROJECT_DIR = getProjectDir();

/** Directory containing BMAD modules (post-migration: src/) */
const BMAD_DIR = path.join(PROJECT_DIR, 'src');

/** Core manifest directory - reserved for future manifest generation */
export const MANIFESTS_DIR = path.join(PROJECT_DIR, 'src', 'core', 'manifests');

/** Known module names for directory scanning */
const KNOWN_MODULES = new Set(Object.keys({
  'intel-team': 1, 'legal-team': 1, 'strategy-team': 1,
  'cybersec-team': 1, 'bmm': 1, 'bmb': 1, 'bmgd': 1, 'cis': 1, 'core': 1,
}));

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Capability definition with description and valid operations.
 */
interface CapabilityDefinition {
  description: string;
  operations: string[];
}

/**
 * Filesystem permissions structure.
 */
interface FilesystemPermissions {
  read?: string[] | boolean;
  write?: string[] | boolean;
  delete?: string[] | boolean;
  list?: string[] | boolean;
}

/**
 * Shell permissions structure.
 */
interface ShellPermissions {
  allowed_commands?: string[];
  blocked_commands?: string[];
}

/**
 * Plugin permissions structure.
 */
interface PluginPermissions {
  filesystem?: FilesystemPermissions | boolean;
  network?: boolean | Record<string, unknown>;
  shell?: ShellPermissions | boolean;
  sensitive_data?: boolean;
}

/**
 * Plugin manifest with declared permissions.
 */
interface PluginManifest {
  name: string;
  version: string;
  permissions: PluginPermissions;
  signature?: string | undefined;
  checksum?: string | undefined;
}

/**
 * Result of a permission check.
 */
interface PermissionCheck {
  allowed: boolean;
  reason: string;
  plugin: string;
  capability: string;
  operation: string;
  target: string;
  manifest_found: boolean;
  rbac_override: boolean;
}

/**
 * Plugin info for listing.
 */
interface PluginInfo {
  name: string;
  has_manifest: boolean;
  version: string | null;
}

/**
 * RBAC permission structure.
 */
interface RBACPermissions {
  filesystem?: {
    read?: string[];
    write?: string[];
  };
  network?: boolean;
  shell?: {
    allowed_commands?: string[];
  };
  sensitive_data?: boolean;
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Permission capabilities definition.
 */
const CAPABILITIES: Record<string, CapabilityDefinition> = {
  filesystem: {
    description: 'Read/write access to files',
    operations: ['read', 'write', 'delete', 'list'],
  },
  network: {
    description: 'Network access (API calls, web fetch)',
    operations: ['fetch', 'search', 'api_call'],
  },
  shell: {
    description: 'Shell command execution',
    operations: ['execute', 'spawn'],
  },
  sensitive_data: {
    description: 'Access to sensitive/PII data',
    operations: ['read', 'process'],
  },
};

/**
 * Default permissions for plugins without manifest.
 */
const DEFAULT_PERMISSIONS: PluginPermissions = {
  filesystem: {
    read: ['src/${plugin}/**', 'docs/**'],
    write: ['src/${plugin}/output/**'],
  },
  network: false,
  shell: {
    allowed_commands: [],
    blocked_commands: ['rm', 'mv', 'chmod', 'chown', 'sudo', 'su'],
  },
  sensitive_data: false,
};

/**
 * RBAC role to permission mapping.
 */
const RBAC_PERMISSIONS: Record<string, RBACPermissions> = {
  admin: {
    filesystem: { read: ['**'], write: ['**'] },
    network: true,
    shell: { allowed_commands: ['*'] },
    sensitive_data: true,
  },
  developer: {
    filesystem: { read: ['**'], write: ['src/**', 'docs/**', 'dev-tools/**'] },
    network: true,
    shell: { allowed_commands: ['git', 'npm', 'python', 'pytest'] },
    sensitive_data: false,
  },
  analyst: {
    filesystem: { read: ['src/**', 'docs/**'], write: ['src/*/output/**'] },
    network: true,
    shell: { allowed_commands: ['curl', 'wget', 'whois', 'dig', 'nslookup'] },
    sensitive_data: false,
  },
  viewer: {
    filesystem: { read: ['docs/**'], write: [] },
    network: false,
    shell: { allowed_commands: [] },
    sensitive_data: false,
  },
};

/**
 * Dangerous commands that require explicit allowlisting.
 */
const DANGEROUS_COMMANDS = new Set([
  'rm', 'mv', 'chmod', 'chown', 'sudo', 'su', 'dd', 'mkfs',
  'kill', 'killall', 'reboot', 'shutdown', 'systemctl',
  'iptables', 'netstat', 'passwd', 'useradd', 'userdel',
]);

/**
 * Tool to capability/operation mapping.
 */
const CAPABILITY_MAPPING: Record<string, [string, string]> = {
  read: ['filesystem', 'read'],
  write: ['filesystem', 'write'],
  edit: ['filesystem', 'write'],
  glob: ['filesystem', 'list'],
  grep: ['filesystem', 'read'],
  bash: ['shell', 'execute'],
  webfetch: ['network', 'fetch'],
  websearch: ['network', 'search'],
};

/**
 * Plugin type to permission template mapping.
 */
const PLUGIN_TYPES: Record<string, string> = {
  'intel-team': 'intel',
  'legal-team': 'legal',
  'strategy-team': 'strategy',
  'cybersec-team': 'intel',
  'bmm': 'dev',
  'bmb': 'dev',
  'bmgd': 'dev',
  'cis': 'general',
  'core': 'general',
};

// ============================================================================
// Simple YAML Parser
// ============================================================================

/**
 * Parse simple YAML content without external dependencies.
 * Handles basic key: value, nested objects, and arrays.
 */
function parseSimpleYaml(content: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  let currentKey: string | null = null;
  let currentSection: Record<string, unknown> | unknown[] | null = null;

  for (const rawLine of content.split('\n')) {
    const line = rawLine.trimEnd();
    if (!line || line.startsWith('#')) {
      continue;
    }

    // Check for section (key:) at root level
    if (line.includes(':') && !line.startsWith(' ') && !line.startsWith('\t')) {
      const colonIdx = line.indexOf(':');
      const key = line.slice(0, colonIdx).trim();
      const value = line.slice(colonIdx + 1).trim();

      if (value) {
        // Simple key: value
        if (value === 'true') {
          result[key] = true;
        } else if (value === 'false') {
          result[key] = false;
        } else if (value.startsWith('[') && value.endsWith(']')) {
          // Inline array
          const items = value.slice(1, -1).split(',');
          result[key] = items.map(i => i.trim().replace(/^["']|["']$/g, '')).filter(i => i);
        } else {
          result[key] = value.replace(/^["']|["']$/g, '');
        }
        currentKey = null;
        currentSection = null;
      } else {
        // Section start
        currentKey = key;
        result[key] = {};
        currentSection = result[key] as Record<string, unknown>;
      }
    } else if (currentSection !== null && (line.startsWith('  ') || line.startsWith('\t'))) {
      // Nested content
      const stripped = line.trim();

      if (stripped.includes(':')) {
        const colonIdx = stripped.indexOf(':');
        const subKey = stripped.slice(0, colonIdx).trim();
        const subValue = stripped.slice(colonIdx + 1).trim();

        if (Array.isArray(currentSection)) {
          continue; // Skip nested keys in arrays
        }

        if (subValue.startsWith('[') && subValue.endsWith(']')) {
          // Inline array
          const items = subValue.slice(1, -1).split(',');
          currentSection[subKey] = items.map(i => i.trim().replace(/^["']|["']$/g, '')).filter(i => i);
        } else if (subValue === 'true') {
          currentSection[subKey] = true;
        } else if (subValue === 'false') {
          currentSection[subKey] = false;
        } else if (subValue) {
          currentSection[subKey] = subValue.replace(/^["']|["']$/g, '');
        } else {
          currentSection[subKey] = {};
        }
      } else if (stripped.startsWith('- ')) {
        // List item
        const item = stripped.slice(2).trim().replace(/^["']|["']$/g, '');
        if (!Array.isArray(currentSection)) {
          if (currentKey) {
            result[currentKey] = [];
            currentSection = result[currentKey] as unknown[];
          }
        }
        if (Array.isArray(currentSection)) {
          currentSection.push(item);
        }
      }
    }
  }

  return result;
}

// ============================================================================
// Plugin Manifest Functions
// ============================================================================

/**
 * Create a PluginManifest from parsed YAML data.
 */
function manifestFromYaml(data: Record<string, unknown>): PluginManifest {
  return {
    name: (data.name as string) || 'unknown',
    version: (data.version as string) || '0.0.0',
    permissions: (data.permissions as PluginPermissions) || {},
    signature: data.signature as string | undefined,
    checksum: data.checksum as string | undefined,
  };
}

/**
 * Load a plugin manifest from file.
 */
function loadManifestFromFile(manifestPath: string): PluginManifest | null {
  try {
    const content = fs.readFileSync(manifestPath, 'utf-8');
    const data = parseSimpleYaml(content);
    return manifestFromYaml(data);
  } catch {
    return null;
  }
}

// ============================================================================
// Plugin Permission Checker Class
// ============================================================================

/**
 * Checks plugin permissions against declared capabilities.
 *
 * Loads plugin manifests and validates operations against
 * declared permissions. Integrates with RBAC for user-based
 * permission inheritance.
 */
class PluginPermissionChecker {
  private manifests: Map<string, PluginManifest> = new Map();
  private currentRole: string | null;

  constructor() {
    this.currentRole = process.env.BMAD_USER_ROLE || 'developer';
    this.loadManifests();
  }

  /**
   * Load all plugin manifests from BMAD directories.
   */
  private loadManifests(): void {
    if (!fs.existsSync(BMAD_DIR)) {
      return;
    }

    try {
      const entries = fs.readdirSync(BMAD_DIR);
      for (const pluginName of entries) {
        const pluginPath = path.join(BMAD_DIR, pluginName);

        // Skip non-directories, config directories, and non-module directories
        if (!fs.statSync(pluginPath).isDirectory()) {
          continue;
        }
        if (pluginName.startsWith('_') || !KNOWN_MODULES.has(pluginName)) {
          continue;
        }

        const manifestPath = path.join(pluginPath, 'manifest.yaml');
        if (fs.existsSync(manifestPath)) {
          const manifest = loadManifestFromFile(manifestPath);
          if (manifest) {
            this.manifests.set(pluginName, manifest);
          }
        }
      }
    } catch {
      // Silently fail if directory cannot be read
    }
  }

  /**
   * Get permissions for a plugin (from manifest or defaults).
   */
  private getPluginPermissions(plugin: string): PluginPermissions {
    const manifest = this.manifests.get(plugin);
    if (manifest) {
      return manifest.permissions;
    }

    // Return default permissions with plugin name substituted
    const defaultsJson = JSON.stringify(DEFAULT_PERMISSIONS);
    const substituted = defaultsJson.replace(/\$\{plugin\}/g, plugin);
    return JSON.parse(substituted);
  }

  /**
   * Get RBAC permissions for current role.
   */
  private getRBACPermissions(): RBACPermissions | null {
    if (this.currentRole && this.currentRole in RBAC_PERMISSIONS) {
      return RBAC_PERMISSIONS[this.currentRole] ?? null;
    }
    return null;
  }

  /**
   * Check if path matches any of the patterns.
   */
  private matchPathPattern(targetPath: string, patterns: string[]): boolean {
    // Normalize path
    let normalizedPath = targetPath.replace(/\\/g, '/');
    if (normalizedPath.startsWith('./')) {
      normalizedPath = normalizedPath.slice(2);
    }

    for (let pattern of patterns) {
      pattern = pattern.replace(/\$\{plugin\}/g, '*');

      // Convert glob pattern to regex
      if (this.fnmatch(normalizedPath, pattern)) {
        return true;
      }

      // Also check parent directories
      const pathParts = normalizedPath.split('/');
      for (let i = 0; i < pathParts.length; i++) {
        const partialPath = pathParts.slice(0, i + 1).join('/');
        if (this.fnmatch(partialPath, pattern)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Simple fnmatch-style glob matching.
   */
  private fnmatch(name: string, pattern: string): boolean {
    // Convert glob pattern to regex
    const regex = pattern
      .replace(/[.+^${}()|[\]\\]/g, '\\$&') // Escape special chars
      .replace(/\*\*/g, '{{GLOBSTAR}}')      // Temp replace **
      .replace(/\*/g, '[^/]*')               // * matches anything except /
      .replace(/\?/g, '[^/]')                // ? matches single char
      .replace(/\{\{GLOBSTAR\}\}/g, '.*');   // ** matches anything

    try {
      return new RegExp(`^${regex}$`).test(name);
    } catch {
      return false;
    }
  }

  /**
   * Check filesystem permission for an operation.
   */
  private checkFilesystemPermission(
    plugin: string,
    operation: string,
    target: string
  ): [boolean, string] {
    const pluginPerms = this.getPluginPermissions(plugin);
    const fsPerms = pluginPerms.filesystem;

    if (typeof fsPerms === 'boolean') {
      return [fsPerms, fsPerms ? 'Filesystem access allowed' : 'Filesystem access denied'];
    }

    if (!fsPerms) {
      return [false, `No filesystem permissions defined for plugin ${plugin}`];
    }

    // Get operation-specific patterns
    const allowedPatterns = fsPerms[operation as keyof FilesystemPermissions];

    if (typeof allowedPatterns === 'boolean') {
      return [allowedPatterns, allowedPatterns ? `Filesystem ${operation} allowed` : `Filesystem ${operation} denied`];
    }

    if (!allowedPatterns || !Array.isArray(allowedPatterns) || allowedPatterns.length === 0) {
      return [false, `No ${operation} patterns defined for plugin ${plugin}`];
    }

    // Normalize target path
    let targetNormalized = target.replace(`${PROJECT_DIR  }/`, '');
    targetNormalized = targetNormalized.replace(/^\.\//, '');

    if (this.matchPathPattern(targetNormalized, allowedPatterns)) {
      return [true, 'Path matches allowed pattern'];
    }

    return [false, `Path '${targetNormalized}' not in allowed patterns for ${operation}`];
  }

  /**
   * Check shell permission for a command.
   */
  private checkShellPermission(
    plugin: string,
    _operation: string,
    command: string
  ): [boolean, string] {
    const pluginPerms = this.getPluginPermissions(plugin);
    const shellPerms = pluginPerms.shell;

    if (typeof shellPerms === 'boolean') {
      return [shellPerms, shellPerms ? 'Shell access allowed' : 'Shell access denied'];
    }

    if (!shellPerms) {
      return [false, 'Shell access denied'];
    }

    // Extract command name
    const cmdParts = command.trim().split(/\s+/);
    const firstPart = cmdParts[0];
    if (cmdParts.length === 0 || firstPart === undefined) {
      return [false, 'Empty command'];
    }

    const cmdName = path.basename(firstPart);

    // Check allowed commands first
    const allowed = shellPerms.allowed_commands || [];
    const blocked = shellPerms.blocked_commands || [];

    // If blocked is '*', block all unless explicitly allowed
    if (blocked.includes('*')) {
      if (allowed.includes('*')) {
        return [true, 'All commands allowed'];
      }
      if (allowed.includes(cmdName)) {
        return [true, `Command '${cmdName}' in allowed list`];
      }
      return [false, `Command '${cmdName}' blocked (all commands blocked by '*')`];
    }

    // Check specific blocked commands
    if (blocked.includes(cmdName) || DANGEROUS_COMMANDS.has(cmdName)) {
      // Check if explicitly allowed
      if (!allowed.includes('*') && !allowed.includes(cmdName)) {
        return [false, `Command '${cmdName}' is blocked`];
      }
    }

    // Check allowed commands
    if (allowed.includes('*')) {
      return [true, 'All commands allowed'];
    }

    if (allowed.length > 0 && !allowed.includes(cmdName)) {
      return [false, `Command '${cmdName}' not in allowed commands`];
    }

    return [true, 'Command allowed'];
  }

  /**
   * Check network permission.
   */
  private checkNetworkPermission(
    plugin: string,
    _operation: string,
    _target: string
  ): [boolean, string] {
    const pluginPerms = this.getPluginPermissions(plugin);
    const networkPerms = pluginPerms.network;

    if (typeof networkPerms === 'boolean') {
      return [networkPerms, networkPerms ? 'Network access allowed' : 'Network access denied'];
    }

    // Could expand to check specific domains, etc.
    return [true, 'Network access allowed'];
  }

  /**
   * Check sensitive data permission.
   */
  private checkSensitiveDataPermission(
    plugin: string,
    _operation: string,
    _target: string
  ): [boolean, string] {
    const pluginPerms = this.getPluginPermissions(plugin);
    const sensitivePerms = pluginPerms.sensitive_data;

    if (typeof sensitivePerms === 'boolean') {
      return [sensitivePerms, sensitivePerms ? 'Sensitive data access allowed' : 'Sensitive data access denied'];
    }

    return [false, 'Sensitive data access requires explicit permission'];
  }

  /**
   * Apply RBAC override if applicable.
   *
   * Note: RBAC only grants additional permissions, it does NOT override
   * plugin manifest restrictions. Plugin manifests take precedence for
   * security reasons.
   */
  private applyRBACOverride(
    plugin: string,
    capability: string,
    operation: string,
    target: string
  ): [boolean, string] | null {
    // If plugin has explicit manifest, respect its restrictions
    // RBAC can only expand permissions for unknown plugins or within manifest bounds
    if (this.manifests.has(plugin)) {
      return null; // Let plugin manifest control permissions
    }

    const rbacPerms = this.getRBACPermissions();
    if (!rbacPerms) {
      return null;
    }

    if (capability === 'filesystem') {
      const fsPerms = rbacPerms.filesystem;
      if (fsPerms) {
        const patterns = fsPerms[operation as 'read' | 'write'];
        if (patterns && this.matchPathPattern(target, patterns)) {
          return [true, `RBAC override (${this.currentRole})`];
        }
      }
    } else if (capability === 'shell') {
      const shellPerms = rbacPerms.shell;
      if (shellPerms) {
        const allowed = shellPerms.allowed_commands || [];
        const targetParts = target ? target.split(/\s+/) : [];
        const cmdName = targetParts[0] ? path.basename(targetParts[0]) : '';
        if (allowed.includes('*') || allowed.includes(cmdName)) {
          return [true, `RBAC override (${this.currentRole})`];
        }
      }
    } else if (capability === 'network' || capability === 'sensitive_data') {
      const capPerm = rbacPerms[capability];
      if (capPerm) {
        return [true, `RBAC override (${this.currentRole})`];
      }
    }

    return null;
  }

  /**
   * Check if an operation is permitted for a plugin.
   *
   * @param plugin - Plugin name (e.g., 'intel-team')
   * @param capability - Capability type (filesystem, network, shell, sensitive_data)
   * @param operation - Specific operation (read, write, execute, etc.)
   * @param target - Target of operation (path, command, URL, etc.)
   * @returns PermissionCheck with result details
   */
  checkPermission(
    plugin: string,
    capability: string,
    operation: string,
    target: string = ''
  ): PermissionCheck {
    // Validate capability
    if (!(capability in CAPABILITIES)) {
      return {
        allowed: false,
        reason: `Unknown capability: ${capability}`,
        plugin,
        capability,
        operation,
        target,
        manifest_found: false,
        rbac_override: false,
      };
    }

    // Validate operation
    const capabilityDef = CAPABILITIES[capability];
    const validOps = capabilityDef?.operations;
    if (!validOps || !validOps.includes(operation)) {
      return {
        allowed: false,
        reason: `Unknown operation '${operation}' for capability '${capability}'`,
        plugin,
        capability,
        operation,
        target,
        manifest_found: false,
        rbac_override: false,
      };
    }

    // Check RBAC override first
    const rbacResult = this.applyRBACOverride(plugin, capability, operation, target);
    if (rbacResult) {
      const [allowed, reason] = rbacResult;
      return {
        allowed,
        reason,
        plugin,
        capability,
        operation,
        target,
        manifest_found: this.manifests.has(plugin),
        rbac_override: true,
      };
    }

    // Check capability-specific permissions
    let allowed: boolean;
    let reason: string;

    switch (capability) {
      case 'filesystem':
        [allowed, reason] = this.checkFilesystemPermission(plugin, operation, target);
        break;
      case 'shell':
        [allowed, reason] = this.checkShellPermission(plugin, operation, target);
        break;
      case 'network':
        [allowed, reason] = this.checkNetworkPermission(plugin, operation, target);
        break;
      case 'sensitive_data':
        [allowed, reason] = this.checkSensitiveDataPermission(plugin, operation, target);
        break;
      default:
        allowed = false;
        reason = `Capability '${capability}' not implemented`;
    }

    const result: PermissionCheck = {
      allowed,
      reason,
      plugin,
      capability,
      operation,
      target,
      manifest_found: this.manifests.has(plugin),
      rbac_override: false,
    };

    // Log permission checks
    const severity = allowed ? 'INFO' : 'BLOCKED';
    AuditLogger.logSync(VALIDATOR_NAME, 'PERMISSION_CHECK', {
      plugin,
      capability,
      operation,
      target: target.slice(0, 200),
      allowed,
      reason,
      manifest_found: this.manifests.has(plugin),
    }, severity);

    return result;
  }

  /**
   * Get all capabilities for a plugin.
   */
  getPluginCapabilities(plugin: string): PluginPermissions {
    return this.getPluginPermissions(plugin);
  }

  /**
   * List all known plugins with their manifest status.
   */
  listPlugins(): PluginInfo[] {
    const plugins: PluginInfo[] = [];

    if (fs.existsSync(BMAD_DIR)) {
      try {
        const entries = fs.readdirSync(BMAD_DIR);
        for (const name of entries) {
          const pluginPath = path.join(BMAD_DIR, name);
          if (fs.statSync(pluginPath).isDirectory() && KNOWN_MODULES.has(name)) {
            const manifest = this.manifests.get(name);
            plugins.push({
              name,
              has_manifest: this.manifests.has(name),
              version: manifest?.version || null,
            });
          }
        }
      } catch {
        // Silently fail
      }
    }

    return plugins;
  }
}

// ============================================================================
// Manifest Generation
// ============================================================================

/**
 * Type-specific permission templates for manifest generation.
 */
interface TypePermissionTemplate {
  filesystem: FilesystemPermissions;
  network: boolean;
  shell: ShellPermissions;
  sensitive_data: boolean;
}

const TYPE_PERMISSIONS: Record<string, TypePermissionTemplate> = {
  intel: {
    filesystem: {
      read: ['src/${plugin}/**', 'docs/**', 'src/core/**'],
      write: ['src/${plugin}/output/**'],
    },
    network: true,
    shell: {
      allowed_commands: ['curl', 'wget', 'whois', 'dig', 'nslookup', 'host'],
      blocked_commands: ['rm', 'mv', 'chmod', 'sudo'],
    },
    sensitive_data: true,
  },
  legal: {
    filesystem: {
      read: ['src/${plugin}/**', 'docs/**', 'src/core/**'],
      write: ['src/${plugin}/output/**', 'docs/legal/**'],
    },
    network: true,
    shell: {
      allowed_commands: [],
      blocked_commands: ['*'],
    },
    sensitive_data: true,
  },
  strategy: {
    filesystem: {
      read: ['src/${plugin}/**', 'docs/**', 'src/core/**'],
      write: ['src/${plugin}/output/**'],
    },
    network: true,
    shell: {
      allowed_commands: [],
      blocked_commands: ['*'],
    },
    sensitive_data: false,
  },
  dev: {
    filesystem: {
      read: ['**'],
      write: ['src/**', 'dev-tools/**', 'docs/**'],
    },
    network: true,
    shell: {
      allowed_commands: ['git', 'npm', 'python', 'pytest', 'node'],
      blocked_commands: ['rm -rf', 'sudo'],
    },
    sensitive_data: false,
  },
  general: {
    filesystem: {
      read: ['src/${plugin}/**', 'docs/**'],
      write: ['src/${plugin}/output/**'],
    },
    network: false,
    shell: {
      allowed_commands: [],
      blocked_commands: ['*'],
    },
    sensitive_data: false,
  },
};

/**
 * Generate a manifest template for a plugin.
 *
 * @param pluginName - Name of the plugin
 * @param pluginType - Type of plugin (intel, legal, strategy, dev, general)
 * @returns YAML manifest template as string
 */
export function generateManifestTemplate(pluginName: string, pluginType: string = 'general'): string {
  const perms = TYPE_PERMISSIONS[pluginType] || TYPE_PERMISSIONS.general;
  const timestamp = new Date().toISOString();

  // Substitute plugin name in patterns
  const substitutedPerms = JSON.parse(
    JSON.stringify(perms).replace(/\$\{plugin\}/g, pluginName)
  ) as TypePermissionTemplate;

  const lines: string[] = [
    `# BMAD Plugin Manifest: ${pluginName}`,
    `# Type: ${pluginType}`,
    `# Generated: ${timestamp}`,
    '',
    `name: ${pluginName}`,
    'version: 1.0.0',
    '',
    'permissions:',
    '  filesystem:',
  ];

  const fsPerms = substitutedPerms.filesystem;
  if (fsPerms.read) {
    lines.push(`    read: ${JSON.stringify(fsPerms.read)}`);
  }
  if (fsPerms.write) {
    lines.push(`    write: ${JSON.stringify(fsPerms.write)}`);
  }

  lines.push(`  network: ${substitutedPerms.network}`);

  const shellPerms = substitutedPerms.shell;
  lines.push('  shell:');
  lines.push(`    allowed_commands: ${JSON.stringify(shellPerms.allowed_commands || [])}`);
  lines.push(`    blocked_commands: ${JSON.stringify(shellPerms.blocked_commands || [])}`);

  lines.push(`  sensitive_data: ${substitutedPerms.sensitive_data}`);

  lines.push('');
  lines.push('# Signature (optional GPG signature for verification)');
  lines.push('signature: |');
  lines.push('  -----BEGIN PGP SIGNATURE-----');
  lines.push('  (signature placeholder)');
  lines.push('  -----END PGP SIGNATURE-----');

  return lines.join('\n');
}

/**
 * Generate manifests for all BMAD plugins.
 *
 * @param outputDir - Optional directory to write manifests (if null, returns dict)
 * @returns Dictionary of plugin_name -> manifest content
 */
export function generateAllManifests(outputDir: string | null = null): Record<string, string> {
  const manifests: Record<string, string> = {};

  if (fs.existsSync(BMAD_DIR)) {
    try {
      const entries = fs.readdirSync(BMAD_DIR);
      for (const name of entries) {
        const pluginPath = path.join(BMAD_DIR, name);
        if (fs.statSync(pluginPath).isDirectory() && KNOWN_MODULES.has(name)) {
          const pluginType = PLUGIN_TYPES[name] || 'general';
          const manifestContent = generateManifestTemplate(name, pluginType);
          manifests[name] = manifestContent;

          if (outputDir) {
            const manifestDir = path.join(outputDir, name);
            const manifestPath = path.join(manifestDir, 'manifest.yaml');
            fs.mkdirSync(manifestDir, { recursive: true });
            fs.writeFileSync(manifestPath, manifestContent);
          }
        }
      }
    } catch {
      // Silently fail
    }
  }

  return manifests;
}

// ============================================================================
// Convenience Functions
// ============================================================================

let _permissionChecker: PluginPermissionChecker | null = null;

/**
 * Get or create the global permission checker instance.
 */
export function getPermissionChecker(): PluginPermissionChecker {
  if (_permissionChecker === null) {
    _permissionChecker = new PluginPermissionChecker();
  }
  return _permissionChecker;
}

/**
 * Check if a plugin operation is permitted.
 *
 * @param plugin - Plugin name
 * @param capability - Capability type
 * @param operation - Operation type
 * @param target - Target of operation
 * @returns Tuple of [allowed, message]
 */
export function checkPluginPermission(
  plugin: string,
  capability: string,
  operation: string,
  target: string = ''
): [boolean, string] {
  const checker = getPermissionChecker();
  const result = checker.checkPermission(plugin, capability, operation, target);
  return [result.allowed, result.reason];
}

/**
 * Detect which plugin a path belongs to.
 *
 * @param filePath - File path
 * @returns Plugin name or null if not in a plugin directory
 */
export function detectPluginFromPath(filePath: string): string | null {
  const normalized = filePath.replace(PROJECT_DIR, '').replace(/^[/\\]/, '');

  // Check src/ prefix (post-migration v6 format)
  if (normalized.startsWith('src/') || normalized.startsWith('src\\')) {
    const parts = normalized.split(/[/\\]/);
    const pluginName = parts[1];
    if (parts.length >= 2 && pluginName !== undefined && KNOWN_MODULES.has(pluginName)) {
      return pluginName;
    }
  }

  // Legacy: check _bmad/ prefix (pre-migration format)
  if (normalized.startsWith('_bmad/') || normalized.startsWith('_bmad\\')) {
    const parts = normalized.split(/[/\\]/);
    const pluginName = parts[1];
    if (parts.length >= 2 && pluginName !== undefined && !pluginName.startsWith('_')) {
      return pluginName;
    }
  }

  return null;
}

// ============================================================================
// Hook Integration
// ============================================================================

/**
 * Validate plugin permission as a pre-tool hook.
 *
 * @returns Exit code: 0 for allowed, 1 for blocked
 */
export function validatePluginPermission(): number {
  let data: { tool_name?: string; tool_input?: Record<string, unknown>; cwd?: string };

  try {
    data = getToolInputFromStdinSync();
  } catch {
    return EXIT_CODES.ALLOW; // Allow if can't parse input
  }

  const toolName = (data.tool_name || '').toLowerCase();
  const toolInput = data.tool_input || {};
  const cwd = data.cwd || PROJECT_DIR;

  // Map tool to capability/operation
  const mapping = CAPABILITY_MAPPING[toolName];
  if (!mapping) {
    return EXIT_CODES.ALLOW; // Unknown tool, allow
  }

  const [capability, operation] = mapping;

  // Get target
  let target = '';
  if (toolName === 'bash') {
    target = (toolInput.command as string) || '';
  } else if (['read', 'write', 'edit'].includes(toolName)) {
    target = (toolInput.file_path as string) || '';
  } else if (['glob', 'grep'].includes(toolName)) {
    target = (toolInput.path as string) || cwd;
  } else if (['webfetch', 'websearch'].includes(toolName)) {
    target = (toolInput.url as string) || (toolInput.query as string) || '';
  }

  // Detect plugin from target path
  const plugin = detectPluginFromPath(target);
  if (!plugin) {
    return EXIT_CODES.ALLOW; // Not in a plugin directory, allow
  }

  // Check permission
  const checker = getPermissionChecker();
  const result = checker.checkPermission(plugin, capability, operation, target);

  if (!result.allowed) {
    printBlockMessage({
      title: 'BMAD GUARDRAIL: PLUGIN PERMISSION DENIED',
      message: result.reason,
      target: target.slice(0, 100),
      recommendations: !result.manifest_found
        ? [
            `No manifest.yaml found for plugin '${plugin}'`,
            'Using default restrictive permissions.',
            `Run 'generate' command to create manifest templates.`,
          ]
        : undefined,
    });

    console.error(`\nPlugin: ${plugin}`);
    console.error(`Capability: ${capability}`);
    console.error(`Operation: ${operation}`);

    return EXIT_CODES.SOFT_BLOCK;
  }

  return EXIT_CODES.ALLOW;
}

// ============================================================================
// CLI Entry Point
// ============================================================================

/**
 * CLI entry point with subcommands.
 */
export function main(): void {
  const args = process.argv.slice(2);

  if (args.length > 0) {
    const command = args[0];

    if (command === 'list') {
      const checker = getPermissionChecker();
      const plugins = checker.listPlugins();
      console.log(JSON.stringify(plugins, null, 2));
      process.exit(EXIT_CODES.ALLOW);
    } else if (command === 'check') {
      if (args.length < 4) {
        console.error('Usage: plugin-permissions check <plugin> <capability> <operation> [target]');
        process.exit(EXIT_CODES.SOFT_BLOCK);
      }
      const plugin = args[1] ?? '';
      const capability = args[2] ?? '';
      const operation = args[3] ?? '';
      const target = args[4] ?? '';

      const [allowed, message] = checkPluginPermission(plugin, capability, operation, target);
      console.log(`Allowed: ${allowed}`);
      console.log(`Message: ${message}`);
      process.exit(allowed ? EXIT_CODES.ALLOW : EXIT_CODES.SOFT_BLOCK);
    } else if (command === 'generate') {
      const outputDir = args[1] || null;
      const manifests = generateAllManifests(outputDir);
      if (!outputDir) {
        for (const [name, content] of Object.entries(manifests)) {
          console.log(`\n--- ${name} ---`);
          console.log(content);
        }
      } else {
        console.log(`Generated ${Object.keys(manifests).length} manifests in ${outputDir}`);
      }
      process.exit(EXIT_CODES.ALLOW);
    } else if (command === 'validate') {
      process.exit(validatePluginPermission());
    } else {
      console.error(`Usage: ${process.argv[1]} [list|check|generate|validate]`);
      process.exit(EXIT_CODES.SOFT_BLOCK);
    }
  } else {
    // Run as validator hook (reads from stdin)
    process.exit(validatePluginPermission());
  }
}

// Run if executed directly
const isMain =
  process.argv[1]?.endsWith('plugin-permissions.js') ||
  process.argv[1]?.endsWith('plugin-permissions.ts');

if (isMain) {
  main();
}

// ============================================================================
// Exports
// ============================================================================

export {
  PluginPermissionChecker,
  CAPABILITIES,
  DEFAULT_PERMISSIONS,
  RBAC_PERMISSIONS,
  DANGEROUS_COMMANDS,
  CAPABILITY_MAPPING,
};

export type {
  PluginManifest,
  PermissionCheck,
  PluginInfo,
  PluginPermissions,
  FilesystemPermissions,
  ShellPermissions,
  RBACPermissions,
  CapabilityDefinition,
};
