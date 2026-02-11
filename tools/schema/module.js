/**
 * Zod schemas for BMAD module definitions.
 *
 * Modules are directories under `_bmad/` with a `module.yaml` configuration file.
 * Each module.yaml defines metadata (code, name, prompt) and configuration fields
 * (static and interactive) used during installation and runtime.
 *
 * @module tools/schema/module
 */

import { z } from 'zod';

// ---------------------------------------------------------------------------
// Shared patterns
// ---------------------------------------------------------------------------

/** kebab-case identifier: starts with lowercase letter, then lowercase letters, digits, or hyphens */
const KEBAB_CASE = /^[a-z][a-z0-9-]*$/;

/** Loose semver pattern: major.minor.patch with optional pre-release suffix */
const SEMVER_ISH = /^\d+\.\d+\.\d+(-[a-zA-Z0-9.]+)?$/;

/** Valid module names across the BMAD ecosystem */
export const VALID_MODULES = [
  'core',
  'bmm',
  'bmb',
  'bmgd',
  'cis',
  'cybersec-team',
  'intel-team',
  'legal-team',
  'strategy-team',
];

/** Required configuration field keys every module must have */
export const REQUIRED_CONFIG_KEYS = [
  'module_code',
  'module_version',
  'agents_path',
  'workflows_path',
];

// ---------------------------------------------------------------------------
// 1. Static Configuration Field Schema
// ---------------------------------------------------------------------------

/**
 * Validates a static configuration field in module.yaml.
 * Static fields have only a `result` key (no user prompt).
 *
 * Example:
 * ```yaml
 * module_code:
 *   result: "bmm"
 * ```
 */
export const staticConfigFieldSchema = z.object({
  result: z
    .string()
    .min(1, 'result must not be empty'),
}).passthrough();

// ---------------------------------------------------------------------------
// 2. Interactive Configuration Field Schema
// ---------------------------------------------------------------------------

/**
 * Validates an interactive configuration field in module.yaml.
 * Interactive fields have `prompt`, `default`, and `result` keys.
 *
 * Example:
 * ```yaml
 * output_folder:
 *   prompt: "Where should BMM save project artifacts?"
 *   default: "_bmad-output/bmm"
 *   result: "{project-root}/{value}"
 * ```
 */
export const interactiveConfigFieldSchema = z.object({
  prompt: z
    .string()
    .min(1, 'prompt must not be empty'),
  default: z.string(),
  result: z
    .string()
    .min(1, 'result must not be empty'),
}).passthrough();

// ---------------------------------------------------------------------------
// 3. Generic Configuration Field Schema
// ---------------------------------------------------------------------------

/**
 * Validates any configuration field — either static or interactive.
 */
export const configFieldSchema = z.union([
  interactiveConfigFieldSchema,
  staticConfigFieldSchema,
]);

// ---------------------------------------------------------------------------
// 4. Module YAML Schema
// ---------------------------------------------------------------------------

/**
 * Validates the top-level structure of a `module.yaml` file.
 *
 * Example:
 * ```yaml
 * code: "bmm"
 * name: "BMAD Method - Business & Product Development"
 * default_selected: true
 * prompt:
 *   - "BMAD Method (BMM) Module Installation"
 *   - "This is the core product development module."
 *
 * module_code:
 *   result: "bmm"
 * module_version:
 *   result: "6.0.0"
 * agents_path:
 *   result: "{project-root}/src/bmm/agents"
 * workflows_path:
 *   result: "{project-root}/src/bmm/workflows"
 * ```
 *
 * Uses `.passthrough()` to allow additional configuration fields
 * (output_folder, subdirectories, domain-specific fields, etc.)
 */
export const moduleYamlSchema = z.object({
  code: z
    .string()
    .regex(KEBAB_CASE, 'Module code must be kebab-case (lowercase letters, digits, hyphens)'),
  name: z
    .string()
    .min(3, 'Module name must be at least 3 characters'),
  default_selected: z.boolean(),
  required: z.boolean().optional(),
  prompt: z
    .array(z.string())
    .min(1, 'At least one prompt line required'),
}).passthrough();

// ---------------------------------------------------------------------------
// 5. Module Help CSV Entry Schema
// ---------------------------------------------------------------------------

/**
 * Validates a single row from `_bmad/_config/module-help.csv`.
 *
 * The CSV columns map to these fields:
 *   code, name, version, agents, workflows, domain
 */
export const moduleHelpEntrySchema = z.object({
  code: z.enum(/** @type {[string, ...string[]]} */ (VALID_MODULES)),
  name: z
    .string()
    .min(3, 'Module name must be at least 3 characters'),
  version: z
    .string()
    .regex(SEMVER_ISH, 'Version must match semver pattern (e.g. 1.0.0 or 1.0.0-beta.1)'),
  agents: z.coerce.number().int().nonnegative(),
  workflows: z.coerce.number().int().nonnegative(),
  domain: z
    .string()
    .min(3, 'Domain description must be at least 3 characters'),
});
