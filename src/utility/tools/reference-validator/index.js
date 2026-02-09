/**
 * Cross-File Reference Validator
 * Task 0.2 - Validates cross-file references in markdown and YAML files
 *
 * Scans the project for markdown and YAML files, extracts references
 * (workflow:, agent:, and markdown links to local files), and verifies
 * that each referenced file actually exists on disk.
 *
 * @module reference-validator/index
 * @version 1.0.0
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { globSync } from 'glob';

// ============================================================================
// Constants
// ============================================================================

export const VERSION = '1.0.0';

/** Directories to exclude from scanning */
const EXCLUDE_DIRS = ['node_modules', 'dist', 'coverage', '.git'];

/** Glob patterns for files to scan */
const SCAN_PATTERNS = ['**/*.md', '**/*.yaml', '**/*.yml'];

/** Glob ignore patterns built from EXCLUDE_DIRS */
const IGNORE_PATTERNS = EXCLUDE_DIRS.flatMap((dir) => [
  `${dir}/**`,
  `**/${dir}/**`,
]);

// ============================================================================
// Reference Extraction
// ============================================================================

/**
 * Regex patterns for extracting references from file content.
 *
 * - workflowRef: matches `workflow: path/to/file.md` in YAML-like content
 * - agentRef: matches `agent: path/to/file.md` in YAML-like content
 * - markdownLink: matches `[text](path)` markdown links
 */
const PATTERNS = {
  workflowRef: /workflow:\s*["']?([^\s"'#]+\.md)["']?/g,
  agentRef: /agent:\s*["']?([^\s"'#]+\.md)["']?/g,
  markdownLink: /\[(?:[^\]]*)\]\(([^)]+)\)/g,
};

/**
 * Determines if a string looks like a URL or anchor-only link
 * rather than a relative file path.
 *
 * @param {string} ref - The reference string to check
 * @returns {boolean} True if the reference is a URL or anchor
 */
export function isUrlOrAnchor(ref) {
  if (!ref || typeof ref !== 'string') return true;
  const trimmed = ref.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return true;
  if (trimmed.startsWith('mailto:')) return true;
  if (trimmed.startsWith('#')) return true;
  if (trimmed.startsWith('data:')) return true;
  if (trimmed.startsWith('javascript:')) return true;
  return false;
}

/**
 * Strips any anchor fragment from a file path reference.
 * For example: "file.md#section" becomes "file.md"
 *
 * @param {string} ref - The reference that may contain an anchor
 * @returns {string} The reference without the anchor
 */
function stripAnchor(ref) {
  const hashIndex = ref.indexOf('#');
  if (hashIndex > 0) {
    return ref.substring(0, hashIndex);
  }
  return ref;
}

/**
 * Checks if a markdown link target looks like a local file reference
 * (as opposed to a URL, anchor, or non-file reference).
 * Only considers .md, .yaml, and .yml files.
 *
 * @param {string} ref - The link target from a markdown link
 * @returns {boolean} True if this looks like a local file reference
 */
export function isLocalFileRef(ref) {
  if (isUrlOrAnchor(ref)) return false;
  const cleaned = stripAnchor(ref.trim());
  if (!cleaned) return false;
  // Only validate references to markdown and yaml files
  return /\.(md|yaml|yml)$/i.test(cleaned);
}

/**
 * Extracts all cross-file references from a file's content.
 *
 * Looks for:
 * - `workflow: <path.md>` directives
 * - `agent: <path.md>` directives
 * - Markdown links `[text](path.md)` or `[text](path.yaml)` to local files
 *
 * @param {string} content - The file content to scan
 * @param {string} sourceFile - The path of the source file (for context in results)
 * @returns {Array<{ref: string, type: string, line: number}>} Array of extracted references
 */
export function extractReferences(content, sourceFile) {
  const references = [];
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    // Extract workflow: references
    let match;
    const workflowRegex = /workflow:\s*["']?([^\s"'#]+\.md)["']?/g;
    while ((match = workflowRegex.exec(line)) !== null) {
      references.push({
        ref: match[1],
        type: 'workflow',
        line: lineNum,
      });
    }

    // Extract agent: references
    const agentRegex = /agent:\s*["']?([^\s"'#]+\.md)["']?/g;
    while ((match = agentRegex.exec(line)) !== null) {
      references.push({
        ref: match[1],
        type: 'agent',
        line: lineNum,
      });
    }

    // Extract markdown links to local files
    const linkRegex = /\[(?:[^\]]*)\]\(([^)]+)\)/g;
    while ((match = linkRegex.exec(line)) !== null) {
      const target = match[1].trim();
      if (isLocalFileRef(target)) {
        references.push({
          ref: stripAnchor(target),
          type: 'markdown-link',
          line: lineNum,
        });
      }
    }
  }

  return references;
}

// ============================================================================
// File Discovery
// ============================================================================

/**
 * Finds all markdown and YAML files in the project, excluding
 * node_modules, dist, coverage, and .git directories.
 *
 * @param {string} projectRoot - The root directory to scan
 * @returns {string[]} Array of absolute file paths
 */
export function findFiles(projectRoot) {
  const allFiles = [];
  for (const pattern of SCAN_PATTERNS) {
    const matches = globSync(pattern, {
      cwd: projectRoot,
      ignore: IGNORE_PATTERNS,
      nodir: true,
      absolute: false,
    });
    allFiles.push(...matches);
  }
  // Deduplicate and return absolute paths
  const unique = [...new Set(allFiles)];
  return unique.map((f) => path.resolve(projectRoot, f));
}

// ============================================================================
// Reference Resolution
// ============================================================================

/**
 * Resolves a reference path relative to the source file's directory
 * and checks if the target file exists.
 *
 * @param {string} ref - The reference path to resolve
 * @param {string} sourceFilePath - Absolute path to the source file containing the reference
 * @param {string} projectRoot - The project root directory
 * @returns {Promise<{resolved: string, exists: boolean}>} Resolution result
 */
export async function resolveReference(ref, sourceFilePath, projectRoot) {
  const sourceDir = path.dirname(sourceFilePath);
  let resolved;

  if (path.isAbsolute(ref)) {
    // Absolute references are resolved from project root
    resolved = path.resolve(projectRoot, ref.replace(/^\//, ''));
  } else {
    // Relative references are resolved from the source file's directory
    resolved = path.resolve(sourceDir, ref);
  }

  try {
    await fs.access(resolved);
    return { resolved, exists: true };
  } catch {
    return { resolved, exists: false };
  }
}

// ============================================================================
// Main Validator
// ============================================================================

/**
 * @typedef {Object} BrokenReference
 * @property {string} sourceFile - The file containing the broken reference
 * @property {string} ref - The reference string that was found
 * @property {string} type - The type of reference (workflow, agent, markdown-link)
 * @property {number} line - The line number where the reference appears
 * @property {string} resolvedPath - The absolute path the reference resolved to
 */

/**
 * @typedef {Object} ValidatorResult
 * @property {number} totalFiles - Number of files scanned
 * @property {number} totalReferences - Total references found
 * @property {number} validReferences - Number of valid (existing) references
 * @property {number} brokenReferences - Number of broken (missing target) references
 * @property {BrokenReference[]} broken - Details of each broken reference
 * @property {string[]} errors - Files that could not be read
 */

/**
 * Validates all cross-file references in the project.
 *
 * Scans all markdown and YAML files, extracts references, and checks
 * that each referenced file exists. Returns a structured result with
 * counts and details of broken references.
 *
 * @param {string} [projectRoot] - The project root directory (defaults to cwd)
 * @returns {Promise<ValidatorResult>} The validation result
 */
export async function validateReferences(projectRoot) {
  if (!projectRoot) {
    projectRoot = process.cwd();
  }

  const result = {
    totalFiles: 0,
    totalReferences: 0,
    validReferences: 0,
    brokenReferences: 0,
    broken: [],
    errors: [],
  };

  // Find all files to scan
  const files = findFiles(projectRoot);
  result.totalFiles = files.length;

  // Process each file
  for (const filePath of files) {
    let content;
    try {
      content = await fs.readFile(filePath, 'utf-8');
    } catch (err) {
      // Gracefully skip files that can't be read
      const relPath = path.relative(projectRoot, filePath);
      result.errors.push(`{project-root}/${relPath}: ${err.message}`);
      continue;
    }

    const refs = extractReferences(content, filePath);
    result.totalReferences += refs.length;

    for (const refInfo of refs) {
      const resolution = await resolveReference(refInfo.ref, filePath, projectRoot);
      if (resolution.exists) {
        result.validReferences++;
      } else {
        result.brokenReferences++;
        const relSource = path.relative(projectRoot, filePath);
        const relResolved = path.relative(projectRoot, resolution.resolved);
        result.broken.push({
          sourceFile: `{project-root}/${relSource}`,
          ref: refInfo.ref,
          type: refInfo.type,
          line: refInfo.line,
          resolvedPath: `{project-root}/${relResolved}`,
        });
      }
    }
  }

  return result;
}
