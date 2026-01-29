#!/usr/bin/env npx ts-node
/**
 * Micro-Manifest Generator
 *
 * Story: CONCURA-3.1 - Implement Micro-Manifest Generator
 * Author: BlackUnicorn.Tech
 *
 * Purpose: Generate compressed micro-manifests from full BMAD manifests
 * achieving 80%+ token reduction while preserving routing capability.
 *
 * Compression Rules (from micro-manifest-spec.md):
 * - Summaries: 10-15 words max, action-verb start
 * - Tags: max 5 comma-separated routing tags
 * - Dropped fields: displayName, title, icon, identity, communicationStyle, principles
 *
 * Usage: npx ts-node manifest-compressor.ts [--dry-run] [--verbose]
 */
export {};
//# sourceMappingURL=manifest-compressor.d.ts.map