/**
 * BMAD Slash Command Router
 * ==========================
 * Routes short slash commands to full workflow paths with RBAC enforcement
 * and audit logging.
 *
 * Part of v6 Hybrid Upgrade - Story 01: Direct Slash Command Invocation.
 *
 * Security features (per consolidated review):
 * - Input validation (VULN-011: command injection prevention)
 * - Reserved name blocking (VULN-008: validator name collision)
 * - RBAC enforcement (REC-P0-01: all 5 review agents)
 * - Audit logging (REC-P0-06: every invocation logged)
 * - Fuzzy matching for typo suggestions
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// Constants
// ============================================================================

// Input validation: only allow safe characters (Ghost VULN-011)
// Allows: lowercase letters, digits, hyphens, and colon (for module:name disambiguation)
export const VALID_COMMAND_PATTERN = /^[a-z0-9][a-z0-9:-]*[a-z0-9]$/;
export const VALID_BMAD_PATH_PATTERN = /^bmad:[a-z0-9-]+:(workflows|agents):[a-zA-Z0-9 &-]+$/;
export const MAX_COMMAND_LENGTH = 100;
export const MIN_COMMAND_LENGTH = 2;

// ============================================================================
// Simple YAML Parser (reused from authorization.js pattern)
// ============================================================================

export function parseSimpleYaml(content) {
  const lines = content.split('\n');
  const result = {};
  const stack = [{ indent: -1, obj: result, key: '' }];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.replace(/\s+$/, '');

    if (!trimmed || trimmed.trim().startsWith('#')) continue;

    const indent = line.search(/\S/);
    if (indent === -1) continue;

    const contentPart = trimmed.trim();

    while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
      stack.pop();
    }

    const currentStack = stack[stack.length - 1];
    let parent = currentStack.obj;

    if (currentStack.key && parent[currentStack.key] && typeof parent[currentStack.key] === 'object' && !Array.isArray(parent[currentStack.key])) {
      parent = parent[currentStack.key];
    }

    if (contentPart.startsWith('- ')) {
      let itemContent = contentPart.slice(2).trim();

      const parentKey = currentStack.key;
      let targetArray;
      if (parentKey && currentStack.obj[parentKey]) {
        if (!Array.isArray(currentStack.obj[parentKey])) {
          currentStack.obj[parentKey] = [];
        }
        targetArray = currentStack.obj[parentKey];
      } else {
        continue;
      }

      // Check if list item is a key-value pair (object item)
      const kvIdx = itemContent.indexOf(': ');
      if (kvIdx !== -1) {
        const itemKey = itemContent.slice(0, kvIdx).trim();
        let itemVal = itemContent.slice(kvIdx + 2).trim();
        if ((itemVal.startsWith('"') && itemVal.endsWith('"')) ||
            (itemVal.startsWith("'") && itemVal.endsWith("'"))) {
          itemVal = itemVal.slice(1, -1);
        }
        const obj = { [itemKey]: itemVal };
        targetArray.push(obj);
        // Track this object on stack so continuation lines add properties to it
        stack.push({ indent, obj: obj, key: '', isListItem: true });
        continue;
      }

      // Simple string value
      if (itemContent.startsWith('"')) {
        const closeQuote = itemContent.indexOf('"', 1);
        if (closeQuote > 0) itemContent = itemContent.slice(1, closeQuote);
      } else if (itemContent.startsWith("'")) {
        const closeQuote = itemContent.indexOf("'", 1);
        if (closeQuote > 0) itemContent = itemContent.slice(1, closeQuote);
      } else {
        const commentIdx = itemContent.indexOf('#');
        if (commentIdx > 0) itemContent = itemContent.slice(0, commentIdx).trim();
      }

      targetArray.push(itemContent);
      continue;
    }

    // YAML key-value: split on ": " (colon-space) to handle keys containing colons
    let key, value;
    const colonSpaceIdx = contentPart.indexOf(': ');
    if (colonSpaceIdx !== -1) {
      key = contentPart.slice(0, colonSpaceIdx).trim();
      value = contentPart.slice(colonSpaceIdx + 2).trim();
    } else if (contentPart.endsWith(':')) {
      key = contentPart.slice(0, -1).trim();
      value = '';
    } else {
      continue;
    }

    if (value && !value.startsWith('"') && !value.startsWith("'")) {
      const commentIdx = value.indexOf('#');
      if (commentIdx > 0) value = value.slice(0, commentIdx).trim();
    }

    if (!value) {
      parent[key] = {};
      stack.push({ indent, obj: parent, key });
      continue;
    }

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
// Audit Logger (lightweight, writes to security.log in same format)
// ============================================================================

function logAuditEvent(validator, action, details, severity) {
  try {
    const projectDir = findProjectRoot();
    const logDir = path.join(projectDir, '.claude', 'logs');
    fs.mkdirSync(logDir, { recursive: true });

    const logFile = path.join(logDir, 'security.log');
    const entry = {
      timestamp: new Date().toISOString(),
      session_id: process.env.CLAUDE_SESSION_ID || 'unknown',
      validator: validator || 'slash-command-router',
      severity: severity || 'INFO',
      action: action,
      details: details
    };

    fs.appendFileSync(logFile, `${JSON.stringify(entry)  }\n`);
  } catch (_e) {
    // Don't fail routing due to logging issues
  }
}

function findProjectRoot() {
  let dir = __dirname;
  for (let i = 0; i < 10; i++) {
    if (fs.existsSync(path.join(dir, 'package.json')) && fs.existsSync(path.join(dir, '_bmad'))) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return process.cwd();
}

// ============================================================================
// Levenshtein Distance for Fuzzy Matching
// ============================================================================

export function levenshteinDistance(a, b) {
  const matrix = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

// ============================================================================
// Slash Command Router
// ============================================================================

export class SlashCommandRouter {
  constructor(options = {}) {
    this.aliases = new Map();
    this.conflicts = new Map();
    this.reservedNames = new Set();
    this.authManager = options.authManager || null;
    this.registryPath = options.registryPath || null;
    this.loaded = false;
  }

  /**
   * Load the alias registry from YAML file.
   */
  load(registryPath) {
    const resolvedPath = registryPath || this.registryPath;
    if (!resolvedPath) {
      throw new Error('No registry path provided');
    }

    if (!fs.existsSync(resolvedPath)) {
      throw new Error(`Alias registry not found: ${resolvedPath}`);
    }

    const content = fs.readFileSync(resolvedPath, 'utf-8');
    const registry = parseSimpleYaml(content);

    // Load reserved names
    if (registry.reserved_names && Array.isArray(registry.reserved_names)) {
      for (const name of registry.reserved_names) {
        this.reservedNames.add(name);
      }
    }

    // Load aliases
    if (registry.aliases) {
      for (const [aliasName, config] of Object.entries(registry.aliases)) {
        if (config.options && Array.isArray(config.options)) {
          // Disambiguation entry with options array
          this.conflicts.set(aliasName, {
            options: config.options
          });
        } else if (config.target) {
          // Regular alias (including prefixed disambiguation resolutions)
          this.aliases.set(aliasName, {
            target: config.target,
            module: config.module || '',
            description: config.description || ''
          });
        }
      }
    }

    this.loaded = true;
    return this;
  }

  /**
   * Load aliases from a pre-built Map (for testing or programmatic use).
   */
  loadFromMap(aliasMap, conflictMap, reservedSet) {
    this.aliases = aliasMap instanceof Map ? aliasMap : new Map(Object.entries(aliasMap || {}));
    this.conflicts = conflictMap instanceof Map ? conflictMap : new Map(Object.entries(conflictMap || {}));
    this.reservedNames = reservedSet instanceof Set ? reservedSet : new Set(reservedSet || []);
    this.loaded = true;
    return this;
  }

  /**
   * Validate command input before any processing.
   * Prevents path traversal and command injection (VULN-011).
   */
  validateInput(command) {
    if (!command || typeof command !== 'string') {
      return { valid: false, error: 'Command must be a non-empty string' };
    }

    if (command.length > MAX_COMMAND_LENGTH) {
      return { valid: false, error: `Command exceeds maximum length of ${MAX_COMMAND_LENGTH}` };
    }

    if (command.length < MIN_COMMAND_LENGTH) {
      return { valid: false, error: `Command must be at least ${MIN_COMMAND_LENGTH} characters` };
    }

    // Allow full bmad: paths through (backward compat)
    if (command.startsWith('bmad:')) {
      if (!VALID_BMAD_PATH_PATTERN.test(command)) {
        return { valid: false, error: 'Invalid BMAD path format' };
      }
      return { valid: true };
    }

    // Short commands: strict character whitelist
    if (!VALID_COMMAND_PATTERN.test(command)) {
      return { valid: false, error: 'Invalid characters in command name. Only lowercase letters, digits, hyphens, and colons allowed.' };
    }

    // Block reserved names (security validator collision - VULN-008)
    const baseName = command.includes(':') ? command.split(':').pop() : command;
    if (this.reservedNames.has(command) || this.reservedNames.has(baseName)) {
      return { valid: false, error: `"${command}" is a reserved system name` };
    }

    // Block path traversal patterns
    if (command.includes('..') || command.includes('//') || command.includes('\\')) {
      return { valid: false, error: 'Path traversal characters not allowed' };
    }

    return { valid: true };
  }

  /**
   * Resolve a command to its full workflow path.
   */
  resolve(command) {
    if (!this.loaded) {
      return { type: 'error', error: 'Router not loaded. Call load() first.' };
    }

    // Full bmad: paths pass through directly
    if (command.startsWith('bmad:')) {
      return { type: 'direct', path: command };
    }

    // Check exact alias match
    const alias = this.aliases.get(command);
    if (alias) {
      return { type: 'resolved', path: alias.target, module: alias.module, description: alias.description };
    }

    // Check if it's a conflicted name needing disambiguation
    const conflict = this.conflicts.get(command);
    if (conflict) {
      return {
        type: 'disambiguation',
        command: command,
        options: conflict.options || []
      };
    }

    // Not found - provide fuzzy suggestions
    return {
      type: 'not_found',
      command: command,
      suggestions: this.fuzzyMatch(command, 3)
    };
  }

  /**
   * Execute the full routing pipeline: validate → resolve → RBAC → audit.
   */
  execute(command, user) {
    // Step 1: Input validation
    const validation = this.validateInput(command);
    if (!validation.valid) {
      logAuditEvent('slash-command-router', 'REJECTED', {
        command: command,
        reason: validation.error,
        user_roles: user ? user.roles : []
      }, 'WARNING');
      return { type: 'rejected', error: validation.error };
    }

    // Step 2: Resolve command to workflow path
    const resolved = this.resolve(command);

    if (resolved.type === 'error') {
      return resolved;
    }

    if (resolved.type === 'not_found') {
      logAuditEvent('slash-command-router', 'NOT_FOUND', {
        command: command,
        suggestions: resolved.suggestions,
        user_roles: user ? user.roles : []
      }, 'INFO');
      return resolved;
    }

    if (resolved.type === 'disambiguation') {
      logAuditEvent('slash-command-router', 'DISAMBIGUATION', {
        command: command,
        options: resolved.options.map(o => o.alias || o.target),
        user_roles: user ? user.roles : []
      }, 'INFO');
      return resolved;
    }

    // Step 3: RBAC check (REC-P0-01: critical gap from all 5 review agents)
    const workflowPath = resolved.path;
    const workflowName = this.extractWorkflowName(workflowPath);

    if (this.authManager) {
      const authResult = this.authManager.canExecuteWorkflow(user, workflowName);

      if (!authResult.allowed) {
        logAuditEvent('slash-command-router', 'DENIED', {
          command: command,
          workflow_path: workflowPath,
          workflow_name: workflowName,
          reason: authResult.reason,
          user_roles: user ? user.roles : []
        }, 'WARNING');

        return {
          type: 'denied',
          command: command,
          workflowPath: workflowPath,
          reason: authResult.reason,
          warning: authResult.warning,
          message: this.authManager.formatDenialMessage
            ? this.authManager.formatDenialMessage(authResult, 'Workflow', workflowName)
            : `Access denied: ${authResult.reason}`
        };
      }

      if (authResult.requires_approval) {
        logAuditEvent('slash-command-router', 'APPROVAL_REQUIRED', {
          command: command,
          workflow_path: workflowPath,
          workflow_name: workflowName,
          user_roles: user ? user.roles : []
        }, 'INFO');

        return {
          type: 'approval_required',
          command: command,
          workflowPath: workflowPath,
          warning: authResult.warning
        };
      }
    }

    // Step 4: Audit log successful dispatch
    logAuditEvent('slash-command-router', 'DISPATCHED', {
      command: command,
      workflow_path: workflowPath,
      workflow_name: workflowName,
      user_roles: user ? user.roles : [],
      resolved_from: resolved.type
    }, 'INFO');

    return {
      type: 'resolved',
      command: command,
      path: workflowPath,
      module: resolved.module,
      description: resolved.description
    };
  }

  /**
   * Extract the workflow name from a full bmad: path.
   * e.g., "bmad:cybersec-team:workflows:threat-modeling" → "threat-modeling"
   */
  extractWorkflowName(fullPath) {
    if (!fullPath) return '';
    const parts = fullPath.split(':');
    return parts[parts.length - 1];
  }

  /**
   * Fuzzy match for typos and partial matches.
   */
  fuzzyMatch(input, maxResults) {
    const limit = maxResults || 5;
    const results = [];

    // Check aliases
    for (const [aliasName] of this.aliases) {
      const distance = levenshteinDistance(input, aliasName);
      const maxDist = Math.max(2, Math.floor(input.length / 3));
      if (distance <= maxDist) {
        results.push({ name: aliasName, distance: distance });
      }
    }

    // Check conflict names too
    for (const [conflictName] of this.conflicts) {
      const distance = levenshteinDistance(input, conflictName);
      const maxDist = Math.max(2, Math.floor(input.length / 3));
      if (distance <= maxDist) {
        results.push({ name: conflictName, distance: distance });
      }
    }

    // Also check for substring matches
    for (const [aliasName] of this.aliases) {
      if (aliasName.includes(input) || input.includes(aliasName)) {
        const existing = results.find(r => r.name === aliasName);
        if (!existing) {
          results.push({ name: aliasName, distance: 0.5 });
        }
      }
    }

    return results
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit)
      .map(r => r.name);
  }

  /**
   * Get all registered aliases (for help/documentation).
   */
  getAllAliases() {
    const result = [];
    for (const [name, config] of this.aliases) {
      result.push({
        alias: name,
        target: config.target,
        module: config.module,
        description: config.description
      });
    }
    return result;
  }

  /**
   * Get all conflicts (for disambiguation UI).
   */
  getAllConflicts() {
    const result = [];
    for (const [name, config] of this.conflicts) {
      result.push({
        name: name,
        options: config.options
      });
    }
    return result;
  }

  /**
   * Get statistics about the registry.
   */
  getStats() {
    return {
      totalAliases: this.aliases.size,
      totalConflicts: this.conflicts.size,
      totalReservedNames: this.reservedNames.size,
      loaded: this.loaded
    };
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let _instance = null;

export function getSlashCommandRouter(options) {
  if (!_instance && options) {
    _instance = new SlashCommandRouter(options);
  }
  if (!_instance) {
    const projectRoot = findProjectRoot();
    const defaultRegistryPath = path.join(projectRoot, '_bmad', '_config', 'workflow-aliases.yaml');
    _instance = new SlashCommandRouter({ registryPath: defaultRegistryPath });

    if (fs.existsSync(defaultRegistryPath)) {
      _instance.load(defaultRegistryPath);
    }
  }
  return _instance;
}

export function resetSlashCommandRouter() {
  _instance = null;
}
