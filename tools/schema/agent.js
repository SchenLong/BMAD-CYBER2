/**
 * Zod schemas for BMAD agent definitions.
 *
 * Agents are `.md` files with YAML frontmatter and embedded XML.
 * They also have entries in `_bmad/_config/agent-manifest.csv`
 * and optional `.customize.yaml` overlay files.
 *
 * @module tools/schema/agent
 */

import { z } from 'zod';

// ---------------------------------------------------------------------------
// Shared patterns
// ---------------------------------------------------------------------------

/** kebab-case identifier: starts with lowercase letter, then lowercase letters, digits, or hyphens */
const KEBAB_CASE = /^[a-z][a-z0-9-]*$/;

/** Valid module names across the BMAD ecosystem */
const VALID_MODULES = [
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
// 1. Agent Frontmatter Schema
// ---------------------------------------------------------------------------

/**
 * Validates the YAML frontmatter block found at the top of agent `.md` files.
 *
 * Example frontmatter:
 * ```yaml
 * ---
 * name: threat-analyst
 * description: Analyzes cyber threats and produces intelligence reports
 * ---
 * ```
 */
export const agentFrontmatterSchema = z.object({
  name: z
    .string()
    .regex(KEBAB_CASE, 'Agent name must be kebab-case (lowercase letters, digits, hyphens)'),
  description: z
    .string()
    .min(5, 'Description must be at least 5 characters'),
});

// ---------------------------------------------------------------------------
// 2. Agent Manifest Entry Schema
// ---------------------------------------------------------------------------

/**
 * Validates a single row from `_bmad/_config/agent-manifest.csv`.
 *
 * The CSV columns map to these fields. The `principles` field is stored as
 * dash-separated text in the CSV (e.g. "accuracy - thoroughness - clarity").
 */
export const agentManifestEntrySchema = z.object({
  name: z
    .string()
    .regex(KEBAB_CASE, 'Agent name must be kebab-case'),
  displayName: z
    .string()
    .min(1, 'Display name is required'),
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters'),
  icon: z
    .string()
    .min(1, 'Icon is required (single emoji or short string)'),
  role: z
    .string()
    .min(5, 'Role must be at least 5 characters'),
  identity: z
    .string()
    .min(10, 'Identity must be at least 10 characters'),
  communicationStyle: z
    .string()
    .min(5, 'Communication style must be at least 5 characters'),
  principles: z
    .string()
    .min(5, 'Principles must be at least 5 characters (dash-separated text)'),
  module: z.enum(/** @type {[string, ...string[]]} */ (VALID_MODULES)),
  path: z
    .string()
    .refine(
      (p) => (p.startsWith('_bmad/') || p.startsWith('src/')) && p.endsWith('.md'),
      'Path must start with "_bmad/" or "src/" and end with ".md"',
    ),
});

// ---------------------------------------------------------------------------
// 3. Agent Customize Schema (.customize.yaml overlays)
// ---------------------------------------------------------------------------

/**
 * Validates the structure of `.customize.yaml` overlay files.
 * All fields are optional — overlays only specify what they override.
 */
export const agentCustomizeSchema = z.object({
  agent: z
    .object({
      metadata: z
        .object({
          name: z.string().optional(),
        })
        .optional(),
    })
    .optional(),

  persona: z
    .object({
      role: z.string().optional(),
      identity: z.string().optional(),
      communication_style: z.string().optional(),
      principles: z.array(z.string()).optional(),
    })
    .optional(),

  critical_actions: z.array(z.string()).optional(),

  memories: z.array(z.string()).optional(),

  menu: z
    .array(
      z.object({
        trigger: z.string(),
        workflow: z.string(),
        description: z.string(),
      }),
    )
    .optional(),

  prompts: z
    .array(
      z.object({
        id: z.string(),
        content: z.string(),
      }),
    )
    .optional(),
});
