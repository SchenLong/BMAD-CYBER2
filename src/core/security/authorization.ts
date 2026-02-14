/**
 * BMAD Authorization Module
 *
 * Implements Role-Based Access Control (RBAC) for the BMAD framework.
 * Checks permissions for agents, workflows, and modules based on user roles.
 *
 * Part of Phase 2 Security Implementation.
 */

import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// Types
// ============================================================================

export interface Permission {
  agents: string[];
  workflows: string[];
  modules: string[];
  actions: string[];
}

export interface RoleRequirements {
  credential_verification?: boolean;
}

export interface RoleRestrictions {
  session_timeout_minutes?: number;
  max_requests_per_hour?: number;
}

export interface RoleSpecial {
  privileged?: boolean;
}

export interface Role {
  description: string;
  inherits: string[];
  permissions: Permission;
  requires?: RoleRequirements;
  restrictions?: RoleRestrictions;
  special?: RoleSpecial;
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

export interface AgentRestriction {
  description: string;
  require_roles: string[];
  require_credential_verification?: boolean;
  warning_message?: string;
}

export interface RBACConfig {
  enabled: boolean;
  default_role: string;
  deny_by_default: boolean;
  roles: Record<string, Role>;
  module_restrictions: Record<string, ModuleRestriction>;
  workflow_restrictions: Record<string, WorkflowRestriction>;
  agent_restrictions?: Record<string, AgentRestriction>;
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
// YAML Parser (simple implementation for config files)
// ============================================================================

function parseYaml(content: string): any {
  // Simple YAML parser for our config format
  const lines = content.split('\n');
  const result: any = {};
  // Stack tracks: indent level, the object at that level, and the key that created it
  const stack: { indent: number; obj: any; key: string }[] = [{ indent: -1, obj: result, key: '' }];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.replace(/\s+$/, ''); // Right trim only

    // Skip empty lines and comments
    if (!trimmed || trimmed.trim().startsWith('#')) continue;

    // Calculate indent
    const indent = line.search(/\S/);
    if (indent === -1) continue;

    // Get key-value or list item
    const content_part = trimmed.trim();

    // Pop stack to find the right parent level
    while (stack.length > 1 && stack[stack.length - 1]?.indent >= indent) {
      stack.pop();
    }

    // Get the current context
    const currentStack = stack[stack.length - 1];
    if (!currentStack) continue;
    let parent = currentStack.obj;

    // If the parent key points to an object, use that object
    if (currentStack.key && parent[currentStack.key] && typeof parent[currentStack.key] === 'object' && !Array.isArray(parent[currentStack.key])) {
      parent = parent[currentStack.key];
    }

    // List item
    if (content_part.startsWith('- ')) {
      let value = content_part.slice(2).trim();

      // Handle quoted strings - extract the quoted value and ignore everything after
      if (value.startsWith('"')) {
        const closeQuote = value.indexOf('"', 1);
        if (closeQuote > 0) {
          value = value.slice(1, closeQuote);
        }
      } else if (value.startsWith("'")) {
        const closeQuote = value.indexOf("'", 1);
        if (closeQuote > 0) {
          value = value.slice(1, closeQuote);
        }
      } else {
        // Strip inline comments from unquoted values
        const commentIdx = value.indexOf('#');
        if (commentIdx > 0) {
          value = value.slice(0, commentIdx).trim();
        }
      }

      const parentKey = currentStack.key;

      // Find the array to add to
      let targetArray: any[];
      if (parentKey && currentStack.obj[parentKey]) {
        if (!Array.isArray(currentStack.obj[parentKey])) {
          currentStack.obj[parentKey] = [];
        }
        targetArray = currentStack.obj[parentKey] ?? [];
      } else {
        // This shouldn't happen with well-formed YAML
        continue;
      }

      targetArray.push(value);
      continue;
    }

    // Key-value pair
    const colonIdx = content_part.indexOf(':');
    if (colonIdx === -1) continue;

    const key = content_part.slice(0, colonIdx).trim();
    let value = content_part.slice(colonIdx + 1).trim();

    // Strip inline comments (but not inside quoted strings)
    if (value && !value.startsWith('"') && !value.startsWith("'")) {
      const commentIdx = value.indexOf('#');
      if (commentIdx > 0) {
        value = value.slice(0, commentIdx).trim();
      }
    }

    // Handle multi-line strings (|)
    if (value === '|') {
      const multilineIndent = indent + 2;
      let multilineValue = '';
      let j = i + 1;
      while (j < lines.length) {
        const nextLine = lines[j];
        const nextIndent = nextLine.search(/\S/);
        if (nextIndent !== -1 && nextIndent < multilineIndent && nextLine.trim()) {
          break;
        }
        if (nextLine.trim()) {
          multilineValue += `${nextLine.trim()  }\n`;
        }
        j++;
      }
      i = j - 1;
      parent[key] = multilineValue.trim();
      continue;
    }

    // Empty value means nested object
    if (!value) {
      parent[key] = {};
      stack.push({ indent, obj: parent, key });
      continue;
    }

    // Parse value
    if (value === 'true') {
      parent[key] = true;
    } else if (value === 'false') {
      parent[key] = false;
    } else if (value === '[]') {
      parent[key] = [];
    } else if (/^-?\d+$/.test(value)) {
      parent[key] = parseInt(value, 10);
    } else if (/^-?\d+\.\d+$/.test(value)) {
      parent[key] = parseFloat(value);
    } else if ((value.startsWith('"') && value.endsWith('"')) ||
               (value.startsWith("'") && value.endsWith("'"))) {
      parent[key] = value.slice(1, -1);
    } else {
      parent[key] = value;
    }
  }

  return result;
}

// ============================================================================
// Agent Path Resolver (CRIT-1: Dual-format agent ID support)
// ============================================================================

export interface AgentPathResult {
  module: string;
  agent: string;
  format: 'v6' | 'legacy' | 'single' | 'invalid';
}

/**
 * Resolves agent IDs in both legacy and v6 formats.
 * Legacy: "module/agent" (e.g., "cybersec-team/threat-analyst")
 * V6: "src/module/agents/agent" (e.g., "src/cybersec-team/agents/threat-analyst")
 * Single: "agent" (e.g., "abdul")
 */
export function agentPathResolver(agentId: string): AgentPathResult {
  if (!agentId || typeof agentId !== 'string') {
    return { module: '', agent: '', format: 'invalid' };
  }
  // Handle v6 format: src/{module}/agents/{name} (post-migration)
  // Also handle legacy _bmad/{module}/agents/{name} for backward compatibility
  if (agentId.startsWith('src/') || agentId.startsWith('_bmad/')) {
    const parts = agentId.split('/');
    return { module: parts[1] || '', agent: parts[3] || '', format: 'v6' };
  }
  // Handle legacy format: {module}/{name} or single segment
  const parts = agentId.split('/');
  return { module: parts[0], agent: parts[1] || parts[0], format: parts.length > 1 ? 'legacy' : 'single' };
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
    const parsed = parseYaml(content);
    this.config = parsed.rbac;
    this.resolveAllRoles();
  }

  /**
   * Check if RBAC is enabled
   */
  isEnabled(): boolean {
    return this.config.enabled;
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
        if (value.startsWith(`${prefix  }/`) || value === prefix) {
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
    const restriction = this.config.module_restrictions?.[moduleName];
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

    // Extract module from agent path (supports legacy and v6 formats)
    const resolved = agentPathResolver(agentPath);
    const moduleName = resolved.module;

    // Normalize to src/ format for consistent RBAC matching (post-migration)
    let normalizedPath = agentPath;
    if (resolved.format === 'legacy') {
      normalizedPath = `src/${resolved.module}/agents/${resolved.agent}`;
    } else if (resolved.format === 'single') {
      normalizedPath = `src/${resolved.module}/agents/${resolved.agent}`;
    }
    // Normalize old _bmad/ prefix to src/ for backward compatibility
    if (normalizedPath.startsWith('_bmad/')) {
      normalizedPath = normalizedPath.replace(/^_bmad\//, 'src/');
    }

    // First check module access
    const moduleResult = this.canAccessModule(user, moduleName);
    if (!moduleResult.allowed) {
      return moduleResult;
    }

    // Check agent-specific restrictions
    const agentRestriction = this.config.agent_restrictions?.[normalizedPath];
    if (agentRestriction) {
      const hasRequiredRole = user.roles.some(r =>
        agentRestriction.require_roles.includes(r)
      );
      if (!hasRequiredRole) {
        return {
          allowed: false,
          reason: `Agent '${normalizedPath}' requires one of these roles: ${agentRestriction.require_roles.join(', ')}`,
          warning: agentRestriction.warning_message
        };
      }

      if (agentRestriction.require_credential_verification && !user.credentialVerified) {
        return {
          allowed: false,
          reason: `Agent '${normalizedPath}' requires verified credentials`
        };
      }
    }

    // Check role permissions
    const permissions = this.getEffectivePermissions(user.roles);
    if (!this.matchesPattern(normalizedPath, permissions.agents)) {
      if (this.config.deny_by_default) {
        return {
          allowed: false,
          reason: `Your roles (${user.roles.join(', ')}) do not grant access to agent '${normalizedPath}'`
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
    const restriction = this.config.workflow_restrictions?.[workflowName];
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
   * Check if user has a specific action permission
   */
  canPerformAction(user: UserContext, action: string): boolean {
    if (!this.config.enabled) {
      return true;
    }

    const permissions = this.getEffectivePermissions(user.roles);
    return permissions.actions.includes(action) || permissions.actions.includes('*');
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
   * Get default role
   */
  getDefaultRole(): string {
    return this.config.default_role;
  }

  /**
   * Format denial message for user display
   */
  formatDenialMessage(result: AuthorizationResult, resourceType: string, resourceName: string): string {
    const lines = [
      '',
      '======================================================================',
      '                         ACCESS DENIED',
      '======================================================================',
      '',
      `  ${resourceType}: ${resourceName}`,
      '',
    ];

    // Add reason (may need word wrapping)
    if (result.reason) {
      const reasonLines = this.wrapText(result.reason, 64);
      for (const line of reasonLines) {
        lines.push(`  ${line}`);
      }
    }

    lines.push('');

    // Add help text
    lines.push('  To request access:');
    lines.push('  1. Contact your administrator');
    lines.push('  2. Request the appropriate role for your needs');
    lines.push('');

    // Add warning if present
    if (result.warning) {
      lines.push('----------------------------------------------------------------------');
      lines.push('  Note:');
      const warningLines = this.wrapText(result.warning, 64);
      for (const line of warningLines) {
        lines.push(`  ${line}`);
      }
      lines.push('');
    }

    lines.push('======================================================================');
    lines.push('');

    return lines.join('\n');
  }

  /**
   * Format approval required message
   */
  formatApprovalMessage(resourceType: string, resourceName: string, warning?: string): string {
    const lines = [
      '',
      '======================================================================',
      '                      APPROVAL REQUIRED',
      '======================================================================',
      '',
      `  ${resourceType}: ${resourceName}`,
      '',
      '  This operation requires explicit approval before execution.',
      '',
    ];

    if (warning) {
      lines.push('----------------------------------------------------------------------');
      const warningLines = this.wrapText(warning, 64);
      for (const line of warningLines) {
        lines.push(`  ${line}`);
      }
      lines.push('');
    }

    lines.push('======================================================================');
    lines.push('');

    return lines.join('\n');
  }

  /**
   * Word wrap text to specified width
   */
  private wrapText(text: string, width: number): string[] {
    const words = text.split(/\s+/);
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      if ((`${currentLine  } ${  word}`).trim().length <= width) {
        currentLine = (`${currentLine  } ${  word}`).trim();
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
    // Try default path
    const defaultPath = path.join(__dirname, 'rbac-config.yaml');
    if (fs.existsSync(defaultPath)) {
      _instance = new AuthorizationManager(defaultPath);
    } else {
      throw new Error('AuthorizationManager not initialized. Provide configPath or ensure rbac-config.yaml exists.');
    }
  }
  return _instance;
}

export function resetAuthorizationManager(): void {
  _instance = null;
}

// ============================================================================
// CLI Entry Point
// ============================================================================

if (require.main === module) {
  // When run directly, show status
  const configPath = path.join(__dirname, 'rbac-config.yaml');

  if (!fs.existsSync(configPath)) {
    console.log('RBAC configuration not found:', configPath);
    process.exit(1);
  }

  const manager = new AuthorizationManager(configPath);

  console.log('');
  console.log('======================================================================');
  console.log('              BMAD RBAC Authorization System');
  console.log('======================================================================');
  console.log('');
  console.log(`  Status:        ${manager.isEnabled() ? 'ENABLED' : 'DISABLED'}`);
  console.log(`  Default Role:  ${manager.getDefaultRole()}`);
  console.log('');
  console.log('  Available Roles:');

  for (const roleName of manager.getAllRoles()) {
    const role = manager.getRoleDetails(roleName);
    if (role) {
      const inherits = role.inherits?.length ? ` (inherits: ${role.inherits.join(', ')})` : '';
      console.log(`    - ${roleName}: ${role.description}${inherits}`);
    }
  }

  console.log('');
  console.log('======================================================================');
  console.log('');
}
