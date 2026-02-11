/**
 * BMAD Authorization Module (JavaScript)
 *
 * Implements Role-Based Access Control (RBAC) for the BMAD framework.
 * Checks permissions for agents, workflows, and modules based on user roles.
 *
 * Part of Phase 2 Security Implementation.
 */

const fs = require('fs');
const path = require('path');

// ============================================================================
// YAML Parser (simple implementation for config files)
// ============================================================================

function parseYaml(content) {
  const lines = content.split('\n');
  const result = {};
  // Stack tracks: indent level, the object at that level, and the key that created it
  const stack = [{ indent: -1, obj: result, key: '' }];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.replace(/\s+$/, '');

    if (!trimmed || trimmed.trim().startsWith('#')) continue;

    const indent = line.search(/\S/);
    if (indent === -1) continue;

    const content_part = trimmed.trim();

    // Pop stack to find the right parent level
    while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
      stack.pop();
    }

    // Get the current context
    const currentStack = stack[stack.length - 1];
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
      let targetArray;
      if (parentKey && currentStack.obj[parentKey]) {
        if (!Array.isArray(currentStack.obj[parentKey])) {
          currentStack.obj[parentKey] = [];
        }
        targetArray = currentStack.obj[parentKey];
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

    // Multi-line string
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
          multilineValue += nextLine.trim() + '\n';
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

/**
 * Resolves agent IDs in both legacy and v6 formats.
 * Legacy: "module/agent" (e.g., "cybersec-team/threat-analyst")
 * V6: "src/module/agents/agent" (e.g., "src/cybersec-team/agents/threat-analyst")
 * Single: "agent" (e.g., "abdul")
 */
function agentPathResolver(agentId) {
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

class AuthorizationManager {
  constructor(configPath) {
    const content = fs.readFileSync(configPath, 'utf-8');
    const parsed = parseYaml(content);
    this.config = parsed.rbac;
    this.resolvedRoles = new Map();
    this.resolutionInProgress = new Set();
    this.resolveAllRoles();
  }

  isEnabled() {
    return this.config.enabled;
  }

  resolveAllRoles() {
    for (const roleName of Object.keys(this.config.roles)) {
      this.resolveRole(roleName);
    }
  }

  resolveRole(roleName) {
    if (this.resolvedRoles.has(roleName)) {
      return this.resolvedRoles.get(roleName);
    }

    if (this.resolutionInProgress.has(roleName)) {
      throw new Error(`Circular role inheritance detected: ${roleName}`);
    }

    const role = this.config.roles[roleName];
    if (!role) {
      throw new Error(`Unknown role: ${roleName}`);
    }

    this.resolutionInProgress.add(roleName);

    let permissions = {
      agents: [...(role.permissions.agents || [])],
      workflows: [...(role.permissions.workflows || [])],
      modules: [...(role.permissions.modules || [])],
      actions: [...(role.permissions.actions || [])]
    };

    for (const parentRoleName of role.inherits || []) {
      const parentPerms = this.resolveRole(parentRoleName);
      permissions = this.mergePermissions(permissions, parentPerms);
    }

    this.resolutionInProgress.delete(roleName);
    this.resolvedRoles.set(roleName, permissions);

    return permissions;
  }

  mergePermissions(a, b) {
    return {
      agents: [...new Set([...a.agents, ...b.agents])],
      workflows: [...new Set([...a.workflows, ...b.workflows])],
      modules: [...new Set([...a.modules, ...b.modules])],
      actions: [...new Set([...a.actions, ...b.actions])]
    };
  }

  matchesPattern(value, patterns) {
    for (const pattern of patterns) {
      if (pattern === '*') return true;

      if (pattern.endsWith('/*')) {
        const prefix = pattern.slice(0, -2);
        if (value.startsWith(prefix + '/') || value === prefix) {
          return true;
        }
      }

      if (pattern.endsWith('*') && !pattern.endsWith('/*')) {
        const prefix = pattern.slice(0, -1);
        if (value.startsWith(prefix)) {
          return true;
        }
      }

      if (pattern === value) return true;
    }

    return false;
  }

  getEffectivePermissions(userRoles) {
    let effective = {
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

  canAccessModule(user, moduleName) {
    if (!this.config.enabled) {
      return { allowed: true };
    }

    const restriction = this.config.module_restrictions?.[moduleName];
    if (restriction) {
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

      if (restriction.require_credential_verification && !user.credentialVerified) {
        return {
          allowed: false,
          reason: `Module '${moduleName}' requires verified credentials`
        };
      }
    }

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

  canAccessAgent(user, agentPath) {
    if (!this.config.enabled) {
      return { allowed: true };
    }

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

    const moduleResult = this.canAccessModule(user, moduleName);
    if (!moduleResult.allowed) {
      return moduleResult;
    }

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

  canExecuteWorkflow(user, workflowName) {
    if (!this.config.enabled) {
      return { allowed: true };
    }

    const restriction = this.config.workflow_restrictions?.[workflowName];
    if (restriction) {
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

      if (restriction.require_credential_verification && !user.credentialVerified) {
        return {
          allowed: false,
          reason: `Workflow '${workflowName}' requires verified credentials`
        };
      }

      if (restriction.require_approval) {
        return {
          allowed: true,
          requires_approval: true,
          warning: restriction.warning_message,
          audit_level: restriction.audit_level
        };
      }
    }

    const permissions = this.getEffectivePermissions(user.roles);

    if (!permissions.actions.includes('execute') && !permissions.actions.includes('*')) {
      return {
        allowed: false,
        reason: `Your roles (${user.roles.join(', ')}) do not grant workflow execution permission`
      };
    }

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

  canPerformAction(user, action) {
    if (!this.config.enabled) {
      return true;
    }

    const permissions = this.getEffectivePermissions(user.roles);
    return permissions.actions.includes(action) || permissions.actions.includes('*');
  }

  hasRole(user, requiredRole) {
    if (user.roles.includes('admin')) return true;
    return user.roles.includes(requiredRole);
  }

  getAllRoles() {
    return Object.keys(this.config.roles);
  }

  getRoleDetails(roleName) {
    return this.config.roles[roleName];
  }

  getDefaultRole() {
    return this.config.default_role;
  }

  formatDenialMessage(result, resourceType, resourceName) {
    const lines = [
      '',
      '======================================================================',
      '                         ACCESS DENIED',
      '======================================================================',
      '',
      `  ${resourceType}: ${resourceName}`,
      '',
    ];

    if (result.reason) {
      const reasonLines = this.wrapText(result.reason, 64);
      for (const line of reasonLines) {
        lines.push(`  ${line}`);
      }
    }

    lines.push('');
    lines.push('  To request access:');
    lines.push('  1. Contact your administrator');
    lines.push('  2. Request the appropriate role for your needs');
    lines.push('');

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

  formatApprovalMessage(resourceType, resourceName, warning) {
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

  wrapText(text, width) {
    const words = text.split(/\s+/);
    const lines = [];
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

let _instance = null;

function getAuthorizationManager(configPath) {
  if (!_instance && configPath) {
    _instance = new AuthorizationManager(configPath);
  }
  if (!_instance) {
    const defaultPath = path.join(__dirname, 'rbac-config.yaml');
    if (fs.existsSync(defaultPath)) {
      _instance = new AuthorizationManager(defaultPath);
    } else {
      throw new Error('AuthorizationManager not initialized. Provide configPath or ensure rbac-config.yaml exists.');
    }
  }
  return _instance;
}

function resetAuthorizationManager() {
  _instance = null;
}

// ============================================================================
// Exports
// ============================================================================

module.exports = {
  AuthorizationManager,
  getAuthorizationManager,
  resetAuthorizationManager,
  agentPathResolver
};

// ============================================================================
// CLI Entry Point
// ============================================================================

if (require.main === module) {
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
