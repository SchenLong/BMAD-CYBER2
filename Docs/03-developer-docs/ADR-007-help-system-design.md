# ADR-007: AI-Powered Help System Design

**Status**: Accepted
**Date**: 2026-02-09
**Context**: CYBER-V6-03 (Story 3: AI-Powered Help System)

## Decision

Implement the `/bmad-help` command as a standalone XML task that leverages Claude's capabilities for natural language understanding, backed by a JavaScript help generator module that loads and sanitizes manifest data from CSV files.

## Architecture

```
/bmad-help Command (XML task)
    |
    v
Help Generator (ESM module)
    |
    +-- Manifest Loader (CSV parser)
    |       +-- agent-manifest.csv (79 agents)
    |       +-- workflow-manifest.csv (138 workflows)
    |       +-- task-manifest.csv (5 tasks)
    |       +-- manifest.yaml (9 modules)
    |
    +-- Content Sanitizer (VULN-013)
    |       +-- Truncation (200 char descriptions)
    |       +-- Injection pattern filtering
    |       +-- HTML/code block stripping
    |
    +-- Help Content Templates (markdown)
            +-- overview.md
            +-- module-*.md (per-module)
            +-- no-results.md
```

## Key Decisions

### 1. Data Source: CSV Manifests (not per-module manifest.yaml)

Per-module `manifest.yaml` files contain only permissions and signatures, not agent/workflow listings. The CSV manifests in `_bmad/_config/` are the authoritative source for agent and workflow metadata.

### 2. File Location: `src/core/help/`

Following the pattern established by the slash command router (`src/core/routing/`), help system files live under `src/core/help/`. This keeps runtime code in `_bmad/` separate from source/build code in `src/`.

### 3. Task-Based Architecture (XML)

The help command is an XML task registered in the task-manifest, following the existing BMAD task pattern. Claude reads the task definition and executes the help flow using the manifest data.

### 4. VULN-013 Mitigation: Manifest Content Sanitization

All manifest-sourced content is sanitized before rendering to the AI context:

- Description truncation to 200 characters
- Instruction-like pattern filtering (ignore/disregard/forget/override/bypass)
- HTML tag and code block stripping
- Name length validation (100 chars max)

### 5. Module Format: ESM JavaScript

The help generator is ESM JavaScript (.js with import/export), consistent with the project's `"type": "module"` in package.json and the slash command router pattern.

## Alternatives Considered

1. **TypeScript help generator** - Rejected. Would require build step. The project's runtime modules use plain ESM JS.
2. **Per-module help files** - Partially adopted as templates, but dynamic generation from manifests is primary.
3. **Full v6 help.md task adoption** - Rejected. v6's approach assumes different manifest structure and lacks our RBAC/audit integration.

## Consequences

- Help content stays current automatically as manifests are updated
- VULN-013 is addressed at the generator level, not just in templates
- The system scales with new modules without template changes for the overview
- Natural language search leverages Claude's built-in capabilities
