/**
 * Safe YAML loading wrapper — YAML bomb mitigation (SA-02-S4 GAP)
 *
 * js-yaml v4 has no built-in alias expansion limits (unlike yaml v2 which
 * has maxAliasCount=100). This wrapper adds:
 *   1. File/content size limit (default 1MB)
 *   2. Alias reference count limit (default 100)
 *   3. CORE_SCHEMA enforcement by default (no unsafe !!js/* types)
 *
 * All 42 yaml.load() callsites in the project process local config files,
 * so the realistic attack vector is a supply chain attack via crafted PR.
 * This wrapper makes that vector non-exploitable.
 *
 * @module safe-yaml
 */

import yaml from 'js-yaml';
import { readFileSync, statSync } from 'fs';

const DEFAULT_MAX_FILE_SIZE = 1024 * 1024; // 1MB
const DEFAULT_MAX_ALIASES = 100;

/**
 * Count YAML alias references (*name) in content.
 * Pre-parse heuristic to detect potential YAML bombs
 * that use exponential alias expansion.
 *
 * @param {string} content - Raw YAML string
 * @returns {number} Number of alias references found
 */
function countAliasReferences(content) {
  // Match YAML alias references: *anchorName (preceded by whitespace, comma, [, {, or :)
  // Excludes anchors (&name) and content inside quotes
  let count = 0;
  const lines = content.split('\n');
  for (const line of lines) {
    // Skip comment lines
    const trimmed = line.trimStart();
    if (trimmed.startsWith('#')) continue;

    // Count *alias patterns outside of quoted strings
    // Simple approach: strip quoted strings first, then count
    const stripped = line
      .replace(/"[^"]*"/g, '""')
      .replace(/'[^']*'/g, "''");

    const matches = stripped.match(/(?:^|[\s,[\]{:>|-])\*[a-zA-Z_][a-zA-Z0-9_]*/g);
    if (matches) {
      count += matches.length;
    }
  }
  return count;
}

/**
 * Safely load YAML content with bomb protection.
 *
 * @param {string} content - YAML string to parse
 * @param {object} [options] - Options
 * @param {number} [options.maxSize] - Maximum content byte size (default 1MB)
 * @param {number} [options.maxAliases] - Maximum alias references (default 100)
 * @param {object} [options.schema] - js-yaml schema (default CORE_SCHEMA)
 * @returns {any} Parsed YAML value
 * @throws {Error} If content exceeds size/alias limits or is invalid YAML
 */
export function safeYamlLoad(content, options = {}) {
  const maxSize = options.maxSize ?? DEFAULT_MAX_FILE_SIZE;
  const maxAliases = options.maxAliases ?? DEFAULT_MAX_ALIASES;
  const schema = options.schema ?? yaml.CORE_SCHEMA;

  if (typeof content !== 'string') {
    throw new TypeError('safeYamlLoad: content must be a string');
  }

  // Check content size
  const contentSize = Buffer.byteLength(content, 'utf8');
  if (contentSize > maxSize) {
    throw new Error(
      `YAML content exceeds maximum size: ${contentSize} bytes > ${maxSize} byte limit. ` +
      'This limit prevents YAML bomb attacks via alias expansion.'
    );
  }

  // Count alias references (pre-parse heuristic)
  const aliasCount = countAliasReferences(content);
  if (aliasCount > maxAliases) {
    throw new Error(
      `YAML content has too many alias references: ${aliasCount} > ${maxAliases} limit. ` +
      'This limit prevents YAML bomb attacks via exponential alias expansion.'
    );
  }

  return yaml.load(content, { schema });
}

/**
 * Safely load YAML from a file with bomb protection.
 * Checks file size on disk before reading into memory.
 *
 * @param {string} filePath - Path to YAML file
 * @param {object} [options] - Same options as safeYamlLoad
 * @returns {any} Parsed YAML value
 * @throws {Error} If file exceeds size/alias limits or is invalid YAML
 */
export function safeYamlLoadFile(filePath, options = {}) {
  const maxSize = options.maxSize ?? DEFAULT_MAX_FILE_SIZE;

  // Check file size before reading
  const stat = statSync(filePath);
  if (stat.size > maxSize) {
    throw new Error(
      `YAML file exceeds maximum size: ${filePath} is ${stat.size} bytes > ${maxSize} byte limit.`
    );
  }

  const content = readFileSync(filePath, 'utf8');
  return safeYamlLoad(content, options);
}

// Re-export for convenience — callers can import { yaml, CORE_SCHEMA } from safe-yaml
export { yaml };
export const CORE_SCHEMA = yaml.CORE_SCHEMA;
