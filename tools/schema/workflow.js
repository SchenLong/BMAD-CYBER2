/**
 * Zod schemas for BMAD workflow definitions.
 *
 * Workflows exist in two formats:
 * - `.yaml` files with plain YAML structure (name, description, author, etc.)
 * - `.md` files with YAML frontmatter (name, description, version, etc.)
 *
 * Both formats have entries in `_bmad/_config/workflow-manifest.csv`.
 *
 * @module tools/schema/workflow
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

// ---------------------------------------------------------------------------
// 1. Workflow YAML Schema
// ---------------------------------------------------------------------------

/**
 * Validates plain `.yaml` workflow definition files.
 *
 * Example:
 * ```yaml
 * name: threat-modeling
 * description: Guided STRIDE-based threat modeling workflow
 * author: cybersec-team
 * standalone: false
 * instructions: steps/step-01-init.md
 * ```
 */
export const workflowYamlSchema = z.object({
  name: z
    .string()
    .regex(KEBAB_CASE, 'Workflow name must be kebab-case'),
  description: z
    .string()
    .min(5, 'Description must be at least 5 characters'),
  author: z.string().optional(),
  config_source: z.string().optional(),
  llm_config: z.string().optional(),
  output_folder: z.string().optional(),
  installed_path: z.string().optional(),
  instructions: z.string().optional(),
  template: z.union([z.string(), z.boolean()]).optional(),
  standalone: z.boolean().optional(),
  default_output_file: z.string().optional(),
}).passthrough();

// ---------------------------------------------------------------------------
// 2. Workflow MD Frontmatter Schema
// ---------------------------------------------------------------------------

/**
 * Validates the YAML frontmatter block found at the top of workflow `.md` files.
 *
 * Example frontmatter:
 * ```yaml
 * ---
 * name: incident-response-playbook
 * description: Creates incident response playbooks for various threat types
 * version: 1.2.0
 * classification: cybersec
 * execution_mode: guided
 * estimated_duration: 45-60 min
 * agents:
 *   - incident-commander
 *   - threat-analyst
 * ---
 * ```
 */
export const workflowMdFrontmatterSchema = z.object({
  name: z
    .string()
    .regex(KEBAB_CASE, 'Workflow name must be kebab-case'),
  description: z
    .string()
    .min(5, 'Description must be at least 5 characters'),
  version: z
    .string()
    .regex(SEMVER_ISH, 'Version must match semver pattern (e.g. 1.0.0 or 1.0.0-beta.1)')
    .optional(),
  classification: z.string().optional(),
  web_bundle: z.boolean().optional(),
  workflow_path: z.string().optional(),
  steps_path: z.string().optional(),
  output_path: z.string().optional(),
  execution_mode: z.string().optional(),
  estimated_duration: z.string().optional(),
  agents: z.array(z.string()).optional(),
  context_file: z.string().optional(),
}).passthrough();

// ---------------------------------------------------------------------------
// 3. Workflow Manifest Entry Schema
// ---------------------------------------------------------------------------

/**
 * Validates a single row from `_bmad/_config/workflow-manifest.csv`.
 */
export const workflowManifestEntrySchema = z.object({
  name: z
    .string()
    .regex(KEBAB_CASE, 'Workflow name must be kebab-case'),
  description: z
    .string()
    .min(5, 'Description must be at least 5 characters'),
  module: z.enum(/** @type {[string, ...string[]]} */ (VALID_MODULES)),
  path: z
    .string()
    .refine(
      (p) => p.startsWith('_bmad/') || p.startsWith('src/'),
      'Path must start with "_bmad/" or "src/"',
    ),
});
