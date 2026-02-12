/**
 * BMAD Help Generator
 * ====================
 * Generates contextual help content from CSV/YAML manifests for the BMAD help system.
 *
 * Part of v6 Hybrid Upgrade - Story 03, Task 3.2: Help Generator Module.
 *
 * Security features:
 * - VULN-013: All manifest content sanitized before rendering to AI context
 * - No absolute paths in any output (relative paths only)
 * - Name/description length enforcement
 * - Prompt injection pattern filtering
 *
 * Module format: ESM (import/export) — required by root package.json "type": "module"
 */

import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { safeYamlLoad } from '../../../src/utility/safe-yaml.js';
import { normalizeLineEndings } from '../../../src/utility/normalize-line-endings.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ============================================================================
// Constants
// ============================================================================

/** Maximum allowed length for description fields (VULN-013) */
export const MAX_DESCRIPTION_LENGTH = 200;

/** Maximum allowed length for name fields (VULN-013) */
export const MAX_NAME_LENGTH = 100;

/** Default path to _bmad/_config/ relative to project root */
const DEFAULT_CONFIG_DIR = join(__dirname, '..', '..', '_config');

// ============================================================================
// VULN-013: Content Sanitizer
// ============================================================================

/**
 * Sanitize manifest content before rendering to AI context.
 *
 * This is a CRITICAL security function (VULN-013). Manifest CSV files are
 * user-editable and could contain prompt injection payloads. All content
 * from manifests MUST pass through this function before appearing in any
 * help output that will be consumed by an LLM.
 *
 * Filters:
 * 1. Truncates to MAX_DESCRIPTION_LENGTH
 * 2. Removes common prompt injection patterns (ignore/disregard/override)
 * 3. Removes role assumption patterns (you are/act as/pretend)
 * 4. Removes references to system internals (system prompt/instructions)
 * 5. Strips HTML tags
 * 6. Strips code blocks
 *
 * @param {string} content - Raw content from manifest
 * @returns {string} Sanitized content safe for AI context
 */
export function sanitizeManifestContent(content) {
  if (!content) return '';

  let sanitized = String(content);

  // Enforce maximum length
  sanitized = sanitized.slice(0, MAX_DESCRIPTION_LENGTH);

  // Remove prompt injection patterns
  sanitized = sanitized
    // Instruction override patterns
    .replace(
      /\b(ignore|disregard|forget|override|bypass)\s+(all|previous|above|prior)\b/gi,
      '[FILTERED]'
    )
    // Role assumption patterns
    .replace(
      /\b(you are|act as|pretend|simulate|roleplay)\b/gi,
      '[FILTERED]'
    )
    // System internals references
    .replace(
      /\b(system prompt|instructions|confidential|secret)\b/gi,
      '[FILTERED]'
    )
    // Strip HTML tags
    .replace(/<\/?[a-z][^>]*>/gi, '')
    // Strip code blocks (triple backtick fenced blocks)
    .replace(/```[\s\S]*?```/g, '')
    .trim();

  return sanitized;
}

/**
 * Sanitize a name field. Names are shorter and have stricter rules.
 *
 * @param {string} name - Raw name from manifest
 * @returns {string} Sanitized name
 */
function sanitizeName(name) {
  if (!name) return '';
  let sanitized = String(name).slice(0, MAX_NAME_LENGTH);
  // Names should be simple identifiers — strip anything suspicious
  sanitized = sanitized
    .replace(/<\/?[a-z][^>]*>/gi, '')
    .replace(/```[\s\S]*?```/g, '')
    .trim();
  return sanitized;
}

/**
 * Sanitize a file path for output — strip absolute path prefixes, ensure
 * only relative paths appear in help content.
 *
 * @param {string} filePath - Path from manifest (should already be relative)
 * @returns {string} Relative path safe for display
 */
function sanitizePath(filePath) {
  if (!filePath) return '';
  let p = String(filePath).trim();
  // If it looks absolute, convert to relative from _bmad/
  if (p.startsWith('/')) {
    const bmadIdx = p.indexOf('_bmad/');
    if (bmadIdx >= 0) {
      p = p.slice(bmadIdx);
    } else {
      // Last resort: just use the basename portion
      p = p.split('/').pop() || '';
    }
  }
  return p;
}

// ============================================================================
// CSV Parser
// ============================================================================

/**
 * Parse a CSV string into an array of objects.
 *
 * Handles:
 * - Quoted fields containing commas
 * - Escaped quotes ("" inside quoted fields)
 * - Mixed quoted and unquoted fields
 * - Empty fields
 * - Windows/Unix line endings
 *
 * @param {string} csvText - Raw CSV content
 * @returns {Array<Object>} Array of row objects keyed by header names
 */
export function parseCsv(csvText) {
  if (!csvText || typeof csvText !== 'string') return [];

  // Normalize line endings
  const text = csvText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  const rows = parseCsvRows(text);
  if (rows.length < 2) return []; // Need header + at least one data row

  const headers = rows[0];
  const results = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    // Skip empty rows
    if (row.length === 0 || (row.length === 1 && row[0] === '')) continue;

    const obj = {};
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = j < row.length ? row[j] : '';
    }
    results.push(obj);
  }

  return results;
}

/**
 * Parse CSV text into a 2D array of strings.
 * Handles RFC 4180 compliant CSV with quoted fields.
 *
 * @param {string} text - Normalized CSV text (LF line endings)
 * @returns {Array<Array<string>>} 2D array of field values
 */
function parseCsvRows(text) {
  const rows = [];
  let currentRow = [];
  let currentField = '';
  let inQuotes = false;
  let i = 0;

  while (i < text.length) {
    const ch = text[i];

    if (inQuotes) {
      if (ch === '"') {
        // Check for escaped quote ("") vs end of quoted field
        if (i + 1 < text.length && text[i + 1] === '"') {
          // Escaped quote
          currentField += '"';
          i += 2;
        } else {
          // End of quoted field
          inQuotes = false;
          i++;
        }
      } else {
        currentField += ch;
        i++;
      }
    } else {
      if (ch === '"' && currentField === '') {
        // Start of quoted field (only at beginning of field)
        inQuotes = true;
        i++;
      } else if (ch === ',') {
        // Field separator
        currentRow.push(currentField);
        currentField = '';
        i++;
      } else if (ch === '\n') {
        // Row separator
        currentRow.push(currentField);
        currentField = '';
        rows.push(currentRow);
        currentRow = [];
        i++;
      } else {
        currentField += ch;
        i++;
      }
    }
  }

  // Push the last field and row if there's remaining content
  if (currentField !== '' || currentRow.length > 0) {
    currentRow.push(currentField);
    rows.push(currentRow);
  }

  return rows;
}

// ============================================================================
// HelpGenerator Class
// ============================================================================

/**
 * Generates contextual help content from BMAD manifest files.
 *
 * Usage:
 *   const gen = new HelpGenerator();
 *   await gen.initialize();            // Uses default config path
 *   const help = gen.generateOverview();
 *
 * All generated content passes through VULN-013 sanitization.
 */
export class HelpGenerator {
  constructor() {
    /** @type {string} Path to _bmad/_config/ directory */
    this.configDir = '';

    /** @type {string[]} List of installed module names */
    this.installedModules = [];

    /** @type {Array<Object>} Parsed agent manifest entries */
    this.agents = [];

    /** @type {Array<Object>} Parsed workflow manifest entries */
    this.workflows = [];

    /** @type {Array<Object>} Parsed task manifest entries */
    this.tasks = [];

    /** @type {boolean} Whether initialize() has been called successfully */
    this.initialized = false;

    /** @type {string[]} Warnings accumulated during initialization */
    this.initWarnings = [];
  }

  // --------------------------------------------------------------------------
  // Initialization
  // --------------------------------------------------------------------------

  /**
   * Initialize the help generator by loading all manifest files.
   *
   * @param {string} [configDir] - Path to _bmad/_config/ directory.
   *   Defaults to the _config/ directory relative to this module's location.
   * @returns {Promise<void>}
   */
  async initialize(configDir) {
    this.configDir = configDir || DEFAULT_CONFIG_DIR;
    this.initWarnings = [];

    // Load all manifests in parallel — each loader handles its own errors
    const [modules, agents, workflows, tasks] = await Promise.all([
      this.loadInstalledModules(),
      this.loadAgentManifest(),
      this.loadWorkflowManifest(),
      this.loadTaskManifest(),
    ]);

    this.installedModules = modules;
    this.agents = agents;
    this.workflows = workflows;
    this.tasks = tasks;

    this.initialized = true;
  }

  /**
   * Ensure the generator has been initialized before use.
   * @throws {Error} If not initialized
   */
  _ensureInitialized() {
    if (!this.initialized) {
      throw new Error(
        'HelpGenerator not initialized. Call await generator.initialize() first.'
      );
    }
  }

  // --------------------------------------------------------------------------
  // Manifest Loaders
  // --------------------------------------------------------------------------

  /**
   * Read and parse manifest.yaml to get the list of installed modules.
   *
   * @returns {Promise<string[]>} Array of module name strings
   */
  async loadInstalledModules() {
    try {
      const filePath = join(this.configDir, 'manifest.yaml');
      const content = await readFile(filePath, 'utf-8');
      const parsed = safeYamlLoad(normalizeLineEndings(content));

      if (parsed && Array.isArray(parsed.modules)) {
        return parsed.modules.map((m) => sanitizeName(String(m)));
      }

      this.initWarnings.push(
        'manifest.yaml loaded but "modules" key is missing or not an array.'
      );
      return [];
    } catch (err) {
      this.initWarnings.push(
        `Failed to load manifest.yaml: ${err.message || 'unknown error'}`
      );
      return [];
    }
  }

  /**
   * Read and parse agent-manifest.csv.
   * Expected columns: name, displayName, title, icon, role, identity,
   *                    communicationStyle, principles, module, path
   *
   * @returns {Promise<Array<Object>>} Array of sanitized agent objects
   */
  async loadAgentManifest() {
    try {
      const filePath = join(this.configDir, 'agent-manifest.csv');
      const content = await readFile(filePath, 'utf-8');
      const rows = parseCsv(content);

      return rows.map((row) => ({
        name: sanitizeName(row.name),
        displayName: sanitizeName(row.displayName),
        title: sanitizeManifestContent(row.title),
        icon: (row.icon || '').slice(0, 10), // Icons are short emoji strings
        role: sanitizeManifestContent(row.role),
        identity: sanitizeManifestContent(row.identity),
        communicationStyle: sanitizeManifestContent(row.communicationStyle),
        principles: sanitizeManifestContent(row.principles),
        module: sanitizeName(row.module),
        path: sanitizePath(row.path),
      }));
    } catch (err) {
      this.initWarnings.push(
        `Failed to load agent-manifest.csv: ${err.message || 'unknown error'}`
      );
      return [];
    }
  }

  /**
   * Read and parse workflow-manifest.csv.
   * Expected columns: name, description, module, path
   *
   * @returns {Promise<Array<Object>>} Array of sanitized workflow objects
   */
  async loadWorkflowManifest() {
    try {
      const filePath = join(this.configDir, 'workflow-manifest.csv');
      const content = await readFile(filePath, 'utf-8');
      const rows = parseCsv(content);

      return rows.map((row) => ({
        name: sanitizeName(row.name),
        description: sanitizeManifestContent(row.description),
        module: sanitizeName(row.module),
        path: sanitizePath(row.path),
      }));
    } catch (err) {
      this.initWarnings.push(
        `Failed to load workflow-manifest.csv: ${err.message || 'unknown error'}`
      );
      return [];
    }
  }

  /**
   * Read and parse task-manifest.csv.
   * Expected columns: name, displayName, description, module, path, standalone
   *
   * @returns {Promise<Array<Object>>} Array of sanitized task objects
   */
  async loadTaskManifest() {
    try {
      const filePath = join(this.configDir, 'task-manifest.csv');
      const content = await readFile(filePath, 'utf-8');
      const rows = parseCsv(content);

      return rows.map((row) => ({
        name: sanitizeName(row.name),
        displayName: sanitizeName(row.displayName),
        description: sanitizeManifestContent(row.description),
        module: sanitizeName(row.module),
        path: sanitizePath(row.path),
        standalone: row.standalone === 'true',
      }));
    } catch (err) {
      this.initWarnings.push(
        `Failed to load task-manifest.csv: ${err.message || 'unknown error'}`
      );
      return [];
    }
  }

  // --------------------------------------------------------------------------
  // Help Generation Methods
  // --------------------------------------------------------------------------

  /**
   * Generate an overview of the entire BMAD installation.
   * Shows installed modules, total counts of agents/workflows/tasks.
   *
   * @returns {Object} Help result with type 'overview'
   */
  generateOverview() {
    this._ensureInitialized();

    const moduleCount = this.installedModules.length;
    const agentCount = this.agents.length;
    const workflowCount = this.workflows.length;
    const taskCount = this.tasks.length;

    // Build per-module summary
    const moduleSummaries = this.installedModules.map((mod) => {
      const modAgents = this.agents.filter((a) => a.module === mod);
      const modWorkflows = this.workflows.filter((w) => w.module === mod);
      const modTasks = this.tasks.filter((t) => t.module === mod);
      return `- **${mod}**: ${modAgents.length} agents, ${modWorkflows.length} workflows, ${modTasks.length} tasks`;
    });

    const warningBlock =
      this.initWarnings.length > 0
        ? `\n\n> **Warnings:** ${this.initWarnings.join('; ')}`
        : '';

    const content = [
      `# BMAD Help Overview`,
      ``,
      `**Installed Modules:** ${moduleCount}`,
      `**Total Agents:** ${agentCount}`,
      `**Total Workflows:** ${workflowCount}`,
      `**Total Tasks:** ${taskCount}`,
      ``,
      `## Modules`,
      ``,
      ...moduleSummaries,
      warningBlock,
    ].join('\n');

    return {
      type: 'overview',
      title: 'BMAD Help Overview',
      content,
      relatedCommands: this.installedModules.map(
        (m) => `/help ${m}`
      ),
      examples: [
        '/help overview',
        '/help <module-name>',
        '/help search <query>',
      ],
      nextSteps: [
        'Use `/help <module-name>` to explore a specific module',
        'Use `/help search <query>` to find capabilities by keyword',
        'Use `/help list` to see all available commands',
      ],
    };
  }

  /**
   * Generate help for a specific installed module.
   * Shows all agents and workflows belonging to that module.
   *
   * @param {string} moduleName - Module name (e.g. "core", "bmm", "cybersec-team")
   * @returns {Object} Help result with type 'module'
   */
  generateModuleHelp(moduleName) {
    this._ensureInitialized();

    const mod = sanitizeName(moduleName);

    if (!this.installedModules.includes(mod)) {
      // Attempt fuzzy match
      const suggestion = this._fuzzyMatchModule(mod);
      const hint = suggestion
        ? ` Did you mean **${suggestion}**?`
        : '';

      return {
        type: 'module',
        title: `Module Not Found: ${mod}`,
        content: `Module **${mod}** is not installed.${hint}\n\nInstalled modules: ${this.installedModules.join(', ')}`,
        relatedCommands: this.installedModules.map(
          (m) => `/help ${m}`
        ),
        examples: [],
        nextSteps: [
          'Check the module name and try again',
          'Use `/help overview` to see all installed modules',
        ],
      };
    }

    const modAgents = this.agents.filter((a) => a.module === mod);
    const modWorkflows = this.workflows.filter((w) => w.module === mod);
    const modTasks = this.tasks.filter((t) => t.module === mod);

    const agentLines =
      modAgents.length > 0
        ? modAgents.map(
            (a) =>
              `- **${a.displayName || a.name}** (${a.name})${a.icon ? ` ${  a.icon}` : ''} — ${a.title || a.role || 'No description'}`
          )
        : ['- _No agents in this module_'];

    const workflowLines =
      modWorkflows.length > 0
        ? modWorkflows.map(
            (w) => `- **${w.name}** — ${w.description || 'No description'}`
          )
        : ['- _No workflows in this module_'];

    const taskLines =
      modTasks.length > 0
        ? modTasks.map(
            (t) =>
              `- **${t.displayName || t.name}** (${t.name})${t.standalone ? ' [standalone]' : ''} — ${t.description || 'No description'}`
          )
        : ['- _No tasks in this module_'];

    const content = [
      `# Module: ${mod}`,
      ``,
      `## Agents (${modAgents.length})`,
      ``,
      ...agentLines,
      ``,
      `## Workflows (${modWorkflows.length})`,
      ``,
      ...workflowLines,
      ``,
      `## Tasks (${modTasks.length})`,
      ``,
      ...taskLines,
    ].join('\n');

    const relatedCommands = [
      ...modAgents.map((a) => `/help agent ${a.name}`),
      ...modWorkflows.map((w) => `/${w.name}`),
    ];

    return {
      type: 'module',
      title: `Module: ${mod}`,
      content,
      relatedCommands,
      examples: modWorkflows.slice(0, 3).map((w) => `/${w.name}`),
      nextSteps: [
        modAgents.length > 0
          ? `Use \`/help agent <name>\` to learn about a specific agent`
          : null,
        modWorkflows.length > 0
          ? `Use \`/<workflow-name>\` to run a workflow`
          : null,
        'Use `/help overview` to see all modules',
      ].filter(Boolean),
    };
  }

  /**
   * Generate help for a specific workflow.
   *
   * @param {string} workflowName - Workflow name (e.g. "threat-modeling")
   * @returns {Object} Help result with type 'workflow'
   */
  generateWorkflowHelp(workflowName) {
    this._ensureInitialized();

    const name = sanitizeName(workflowName);
    const workflow = this.workflows.find((w) => w.name === name);

    if (!workflow) {
      const suggestion = this._fuzzyMatchWorkflow(name);
      const hint = suggestion
        ? ` Did you mean **${suggestion}**?`
        : '';

      return {
        type: 'workflow',
        title: `Workflow Not Found: ${name}`,
        content: `Workflow **${name}** was not found.${hint}`,
        relatedCommands: [],
        examples: [],
        nextSteps: [
          'Use `/help list` to see all available workflows',
          'Use `/help search <query>` to search by keyword',
        ],
      };
    }

    // Find agents in the same module for context
    const sameModuleAgents = this.agents
      .filter((a) => a.module === workflow.module)
      .slice(0, 5);

    // Find related workflows in the same module
    const relatedWorkflows = this.workflows
      .filter((w) => w.module === workflow.module && w.name !== workflow.name)
      .slice(0, 5);

    const contentParts = [
      `# Workflow: ${workflow.name}`,
      ``,
      `**Module:** ${workflow.module}`,
      `**Path:** ${workflow.path}`,
      ``,
      `## Description`,
      ``,
      workflow.description || '_No description available_',
    ];

    if (sameModuleAgents.length > 0) {
      contentParts.push(
        ``,
        `## Related Agents (${workflow.module})`,
        ``,
        ...sameModuleAgents.map(
          (a) => `- ${a.displayName || a.name} (${a.name})`
        )
      );
    }

    if (relatedWorkflows.length > 0) {
      contentParts.push(
        ``,
        `## Other Workflows in ${workflow.module}`,
        ``,
        ...relatedWorkflows.map(
          (w) =>
            `- **${w.name}** — ${w.description || 'No description'}`
        )
      );
    }

    const content = contentParts.join('\n');

    return {
      type: 'workflow',
      title: `Workflow: ${workflow.name}`,
      content,
      relatedCommands: [
        `/${workflow.name}`,
        `/help ${workflow.module}`,
        ...relatedWorkflows.map((w) => `/${w.name}`),
      ],
      examples: [`/${workflow.name}`],
      nextSteps: [
        `Run \`/${workflow.name}\` to execute this workflow`,
        `Use \`/help ${workflow.module}\` to see all resources in this module`,
      ],
    };
  }

  /**
   * Generate help for a specific agent.
   *
   * @param {string} agentName - Agent name (e.g. "bmad-master", "threat-analyst")
   * @returns {Object} Help result with type 'agent'
   */
  generateAgentHelp(agentName) {
    this._ensureInitialized();

    const name = sanitizeName(agentName);
    const agent = this.agents.find((a) => a.name === name);

    if (!agent) {
      const suggestion = this._fuzzyMatchAgent(name);
      const hint = suggestion
        ? ` Did you mean **${suggestion}**?`
        : '';

      return {
        type: 'agent',
        title: `Agent Not Found: ${name}`,
        content: `Agent **${name}** was not found.${hint}`,
        relatedCommands: [],
        examples: [],
        nextSteps: [
          'Use `/help list` to see all available agents',
          'Use `/help search <query>` to search by keyword',
        ],
      };
    }

    // Find workflows in the same module
    const sameModuleWorkflows = this.workflows
      .filter((w) => w.module === agent.module)
      .slice(0, 5);

    const contentParts = [
      `# Agent: ${agent.displayName || agent.name}${agent.icon ? ` ${  agent.icon}` : ''}`,
      ``,
      `**Name:** ${agent.name}`,
      `**Module:** ${agent.module}`,
      `**Path:** ${agent.path}`,
    ];

    if (agent.title) {
      contentParts.push(`**Title:** ${agent.title}`);
    }
    if (agent.role) {
      contentParts.push(`**Role:** ${agent.role}`);
    }

    if (agent.identity) {
      contentParts.push(``, `## Identity`, ``, agent.identity);
    }

    if (agent.communicationStyle) {
      contentParts.push(
        ``,
        `## Communication Style`,
        ``,
        agent.communicationStyle
      );
    }

    if (agent.principles) {
      contentParts.push(``, `## Principles`, ``, agent.principles);
    }

    if (sameModuleWorkflows.length > 0) {
      contentParts.push(
        ``,
        `## Available Workflows (${agent.module})`,
        ``,
        ...sameModuleWorkflows.map(
          (w) =>
            `- **${w.name}** — ${w.description || 'No description'}`
        )
      );
    }

    const content = contentParts.join('\n');

    return {
      type: 'agent',
      title: `Agent: ${agent.displayName || agent.name}`,
      content,
      relatedCommands: [
        `/help ${agent.module}`,
        ...sameModuleWorkflows.map((w) => `/${w.name}`),
      ],
      examples: sameModuleWorkflows.slice(0, 3).map((w) => `/${w.name}`),
      nextSteps: [
        `Use \`/help ${agent.module}\` to see all resources in this module`,
        sameModuleWorkflows.length > 0
          ? 'Run one of the available workflows listed above'
          : null,
      ].filter(Boolean),
    };
  }

  /**
   * Search across all agents, workflows, tasks, and modules by keyword.
   * Uses simple case-insensitive substring matching.
   *
   * @param {string} query - Search query string
   * @returns {Object} Help result with type 'search'
   */
  searchCapabilities(query) {
    this._ensureInitialized();

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return {
        type: 'search',
        title: 'Search: (empty query)',
        content:
          'Please provide a search query. Example: `/help search security`',
        relatedCommands: [],
        examples: [
          '/help search security',
          '/help search workflow',
          '/help search architect',
        ],
        nextSteps: ['Provide a keyword to search for'],
      };
    }

    const q = query.toLowerCase().trim();

    // Search modules
    const matchedModules = this.installedModules.filter((m) =>
      m.toLowerCase().includes(q)
    );

    // Search agents — match across name, displayName, title, role, identity
    const matchedAgents = this.agents.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        (a.displayName && a.displayName.toLowerCase().includes(q)) ||
        (a.title && a.title.toLowerCase().includes(q)) ||
        (a.role && a.role.toLowerCase().includes(q)) ||
        (a.identity && a.identity.toLowerCase().includes(q))
    );

    // Search workflows — match across name and description
    const matchedWorkflows = this.workflows.filter(
      (w) =>
        w.name.toLowerCase().includes(q) ||
        (w.description && w.description.toLowerCase().includes(q))
    );

    // Search tasks — match across name, displayName, description
    const matchedTasks = this.tasks.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        (t.displayName && t.displayName.toLowerCase().includes(q)) ||
        (t.description && t.description.toLowerCase().includes(q))
    );

    const totalMatches =
      matchedModules.length +
      matchedAgents.length +
      matchedWorkflows.length +
      matchedTasks.length;

    const sections = [];

    if (matchedModules.length > 0) {
      sections.push(
        `## Modules (${matchedModules.length})\n\n${ 
          matchedModules.map((m) => `- **${m}**`).join('\n')}`
      );
    }

    if (matchedAgents.length > 0) {
      sections.push(
        `## Agents (${matchedAgents.length})\n\n${ 
          matchedAgents
            .map(
              (a) =>
                `- **${a.displayName || a.name}** (${a.name}) [${a.module}] — ${a.title || a.role || 'No description'}`
            )
            .join('\n')}`
      );
    }

    if (matchedWorkflows.length > 0) {
      sections.push(
        `## Workflows (${matchedWorkflows.length})\n\n${ 
          matchedWorkflows
            .map(
              (w) =>
                `- **${w.name}** [${w.module}] — ${w.description || 'No description'}`
            )
            .join('\n')}`
      );
    }

    if (matchedTasks.length > 0) {
      sections.push(
        `## Tasks (${matchedTasks.length})\n\n${ 
          matchedTasks
            .map(
              (t) =>
                `- **${t.displayName || t.name}** (${t.name}) [${t.module}] — ${t.description || 'No description'}`
            )
            .join('\n')}`
      );
    }

    const content =
      totalMatches > 0
        ? [
            `# Search Results for "${q}"`,
            ``,
            `**${totalMatches} results found**`,
            ``,
            ...sections,
          ].join('\n')
        : `# Search Results for "${q}"\n\nNo results found. Try a different search term.`;

    const relatedCommands = [
      ...matchedWorkflows.slice(0, 5).map((w) => `/${w.name}`),
      ...matchedAgents.slice(0, 3).map((a) => `/help agent ${a.name}`),
      ...matchedModules.slice(0, 3).map((m) => `/help ${m}`),
    ];

    return {
      type: 'search',
      title: `Search: ${q}`,
      content,
      relatedCommands,
      examples: [],
      nextSteps:
        totalMatches > 0
          ? [
              'Use `/help <name>` for more details on any result',
              'Use `/help overview` for a full system overview',
            ]
          : [
              'Try broader search terms',
              'Use `/help list` to see all available commands',
              'Use `/help overview` for a full system overview',
            ],
    };
  }

  /**
   * List all available agents, workflows, and tasks organized by module.
   *
   * @returns {Object} Help result with type 'list'
   */
  listAllCommands() {
    this._ensureInitialized();

    const sections = this.installedModules.map((mod) => {
      const modAgents = this.agents.filter((a) => a.module === mod);
      const modWorkflows = this.workflows.filter((w) => w.module === mod);
      const modTasks = this.tasks.filter((t) => t.module === mod);

      const lines = [`## ${mod}`];

      if (modAgents.length > 0) {
        lines.push('');
        lines.push('**Agents:**');
        for (const a of modAgents) {
          lines.push(
            `- ${a.displayName || a.name} (${a.name})${a.icon ? ` ${  a.icon}` : ''}`
          );
        }
      }

      if (modWorkflows.length > 0) {
        lines.push('');
        lines.push('**Workflows:**');
        for (const w of modWorkflows) {
          lines.push(
            `- \`/${w.name}\` — ${w.description || 'No description'}`
          );
        }
      }

      if (modTasks.length > 0) {
        lines.push('');
        lines.push('**Tasks:**');
        for (const t of modTasks) {
          lines.push(
            `- ${t.displayName || t.name}${t.standalone ? ' [standalone]' : ''} — ${t.description || 'No description'}`
          );
        }
      }

      return lines.join('\n');
    });

    const content = [
      `# All Available Commands`,
      ``,
      `**${this.installedModules.length} modules** | **${this.agents.length} agents** | **${this.workflows.length} workflows** | **${this.tasks.length} tasks**`,
      ``,
      ...sections,
    ].join('\n\n');

    return {
      type: 'list',
      title: 'All Available Commands',
      content,
      relatedCommands: this.workflows.slice(0, 10).map((w) => `/${w.name}`),
      examples: [
        '/help <module-name>',
        '/help agent <agent-name>',
        '/help workflow <workflow-name>',
        '/help search <query>',
      ],
      nextSteps: [
        'Use `/help <module-name>` to explore a specific module',
        'Use `/<workflow-name>` to run a workflow',
      ],
    };
  }

  // --------------------------------------------------------------------------
  // Type Checkers
  // --------------------------------------------------------------------------

  /**
   * Check if a name corresponds to an installed module.
   *
   * @param {string} name - Name to check
   * @returns {boolean}
   */
  isModule(name) {
    this._ensureInitialized();
    if (!name) return false;
    return this.installedModules.includes(sanitizeName(name));
  }

  /**
   * Check if a name corresponds to a known workflow.
   *
   * @param {string} name - Name to check
   * @returns {boolean}
   */
  isWorkflow(name) {
    this._ensureInitialized();
    if (!name) return false;
    const sanitized = sanitizeName(name);
    return this.workflows.some((w) => w.name === sanitized);
  }

  /**
   * Check if a name corresponds to a known agent.
   *
   * @param {string} name - Name to check
   * @returns {boolean}
   */
  isAgent(name) {
    this._ensureInitialized();
    if (!name) return false;
    const sanitized = sanitizeName(name);
    return this.agents.some((a) => a.name === sanitized);
  }

  // --------------------------------------------------------------------------
  // Fuzzy Matching Helpers (private)
  // --------------------------------------------------------------------------

  /**
   * Simple fuzzy match: find the best substring match among module names.
   *
   * @param {string} input - User input to match
   * @returns {string|null} Best matching module name, or null
   */
  _fuzzyMatchModule(input) {
    return this._bestSubstringMatch(input, this.installedModules);
  }

  /**
   * Simple fuzzy match for workflow names.
   *
   * @param {string} input - User input to match
   * @returns {string|null} Best matching workflow name, or null
   */
  _fuzzyMatchWorkflow(input) {
    return this._bestSubstringMatch(
      input,
      this.workflows.map((w) => w.name)
    );
  }

  /**
   * Simple fuzzy match for agent names.
   *
   * @param {string} input - User input to match
   * @returns {string|null} Best matching agent name, or null
   */
  _fuzzyMatchAgent(input) {
    return this._bestSubstringMatch(
      input,
      this.agents.map((a) => a.name)
    );
  }

  /**
   * Find the best substring match from a list of candidates.
   *
   * Strategy:
   * 1. Exact match (case-insensitive) — highest priority
   * 2. Input is substring of candidate
   * 3. Candidate is substring of input
   * 4. Levenshtein distance within threshold
   *
   * @param {string} input - The query
   * @param {string[]} candidates - List of valid names
   * @returns {string|null} Best match or null
   */
  _bestSubstringMatch(input, candidates) {
    if (!input || !candidates || candidates.length === 0) return null;

    const lower = input.toLowerCase();

    // Exact case-insensitive match
    const exact = candidates.find((c) => c.toLowerCase() === lower);
    if (exact) return exact;

    // Substring match (input in candidate)
    const substringOf = candidates.filter((c) =>
      c.toLowerCase().includes(lower)
    );
    if (substringOf.length === 1) return substringOf[0];
    if (substringOf.length > 1) {
      // Return the shortest match (most specific)
      substringOf.sort((a, b) => a.length - b.length);
      return substringOf[0];
    }

    // Reverse substring (candidate in input)
    const containedIn = candidates.filter((c) =>
      lower.includes(c.toLowerCase())
    );
    if (containedIn.length === 1) return containedIn[0];
    if (containedIn.length > 1) {
      containedIn.sort((a, b) => b.length - a.length); // longest match
      return containedIn[0];
    }

    // Levenshtein distance fallback
    let bestDist = Infinity;
    let bestMatch = null;
    const maxDist = Math.max(2, Math.floor(input.length / 3));

    for (const candidate of candidates) {
      const dist = levenshteinDistance(lower, candidate.toLowerCase());
      if (dist < bestDist && dist <= maxDist) {
        bestDist = dist;
        bestMatch = candidate;
      }
    }

    return bestMatch;
  }
}

// ============================================================================
// Levenshtein Distance (for fuzzy matching)
// ============================================================================

/**
 * Calculate the Levenshtein edit distance between two strings.
 *
 * @param {string} a - First string
 * @param {string} b - Second string
 * @returns {number} Edit distance
 */
function levenshteinDistance(a, b) {
  const m = a.length;
  const n = b.length;

  // Optimize for common cases
  if (m === 0) return n;
  if (n === 0) return m;
  if (a === b) return 0;

  // Use single-row optimization for space efficiency
  const row = new Array(n + 1);
  for (let j = 0; j <= n; j++) {
    row[j] = j;
  }

  for (let i = 1; i <= m; i++) {
    let prev = i - 1;
    row[0] = i;

    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      const val = Math.min(
        row[j] + 1, // deletion
        row[j - 1] + 1, // insertion
        prev + cost // substitution
      );
      prev = row[j];
      row[j] = val;
    }
  }

  return row[n];
}

// ============================================================================
// Factory / Singleton
// ============================================================================

/** @type {HelpGenerator|null} Singleton instance */
let _instance = null;

/**
 * Get or create a singleton HelpGenerator instance.
 * Initializes on first call.
 *
 * @param {string} [configDir] - Optional config directory override
 * @returns {Promise<HelpGenerator>} Initialized HelpGenerator instance
 */
export async function getHelpGenerator(configDir) {
  if (!_instance) {
    _instance = new HelpGenerator();
    await _instance.initialize(configDir);
  }
  return _instance;
}

/**
 * Reset the singleton instance (primarily for testing).
 */
export function resetHelpGenerator() {
  _instance = null;
}
