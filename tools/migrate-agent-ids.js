#!/usr/bin/env node

/**
 * migrate-agent-ids.js
 *
 * Migrates agent XML id attributes from old format to v6 format.
 *
 * OLD formats:
 *   <agent id="name.agent.yaml" ...>
 *   <agent id="name.agent.md" ...>
 *   <agent id="dir/name.agent.yaml" ...>
 *
 * NEW v6 format:
 *   <agent id="_bmad/{module}/agents/{name}" ...>
 *   (derived from the path column in agent-manifest.csv, minus the .md extension)
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');

// --- CSV Parsing ---

/**
 * Parse a CSV line respecting quoted fields that may contain commas.
 */
function parseCsvLine(line) {
  const fields = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
        // Escaped quote inside quoted field
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      fields.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  fields.push(current);
  return fields;
}

/**
 * Parse the agent-manifest.csv and return an array of { name, path } objects.
 */
function parseManifest(csvPath) {
  const content = readFileSync(csvPath, 'utf-8');
  const lines = content.split('\n').filter((l) => l.trim());

  // Parse header
  const header = parseCsvLine(lines[0]);
  const nameIdx = header.indexOf('name');
  const pathIdx = header.indexOf('path');

  if (nameIdx === -1 || pathIdx === -1) {
    throw new Error(`CSV header missing 'name' or 'path' column. Header: ${header.join(', ')}`);
  }

  const agents = [];
  for (let i = 1; i < lines.length; i++) {
    const fields = parseCsvLine(lines[i]);
    if (fields.length <= Math.max(nameIdx, pathIdx)) continue;

    const name = fields[nameIdx].replace(/^"|"$/g, '');
    const path = fields[pathIdx].replace(/^"|"$/g, '');

    if (name && path) {
      agents.push({ name, path });
    }
  }

  return agents;
}

// --- Migration Logic ---

function migrateAgentIds() {
  const manifestPath = resolve(projectRoot, '_bmad/_config/agent-manifest.csv');
  const agents = parseManifest(manifestPath);

  console.log(`Found ${agents.length} agents in manifest.\n`);

  let updated = 0;
  let skipped = 0;
  let alreadyV6 = 0;
  let errors = 0;

  for (const agent of agents) {
    const filePath = resolve(projectRoot, agent.path);

    // The new v6 id is the path without the .md extension
    const newId = agent.path.replace(/\.md$/, '');

    let content;
    try {
      content = readFileSync(filePath, 'utf-8');
    } catch (err) {
      console.error(`  ERROR: Cannot read ${agent.path}: ${err.message}`);
      errors++;
      continue;
    }

    // Match the <agent id="..." pattern on the actual agent tag line
    // We look for <agent id="<something>" where <something> is NOT "..."
    const agentIdRegex = /(<agent\s+id=")([^"]+)(")/;
    const match = content.match(agentIdRegex);

    if (!match) {
      console.warn(`  WARN: No <agent id="..."> tag found in ${agent.path}`);
      skipped++;
      continue;
    }

    const oldId = match[2];

    // Skip template reference lines (they have literal "...")
    if (oldId === '...') {
      // This shouldn't happen with our regex since we check the first match,
      // but just in case
      console.warn(`  WARN: Only found template reference in ${agent.path}`);
      skipped++;
      continue;
    }

    // Check if already in v6 format
    if (oldId === newId) {
      console.log(`  SKIP: ${agent.path} — already v6 format (id="${newId}")`);
      alreadyV6++;
      continue;
    }

    // Replace ONLY the first occurrence (the actual agent tag, not template refs)
    const newContent = content.replace(agentIdRegex, `$1${newId}$3`);

    if (newContent === content) {
      console.warn(`  WARN: Replacement had no effect for ${agent.path}`);
      skipped++;
      continue;
    }

    writeFileSync(filePath, newContent, 'utf-8');
    updated++;
    console.log(`  OK: ${agent.path}`);
    console.log(`      OLD: id="${oldId}"`);
    console.log(`      NEW: id="${newId}"`);
  }

  console.log('\n--- Migration Summary ---');
  console.log(`Total agents in manifest: ${agents.length}`);
  console.log(`Updated:      ${updated}`);
  console.log(`Already v6:   ${alreadyV6}`);
  console.log(`Skipped:      ${skipped}`);
  console.log(`Errors:       ${errors}`);
  console.log(`Total:        ${updated + alreadyV6 + skipped + errors}`);

  if (updated + alreadyV6 === agents.length) {
    console.log('\nAll agents processed successfully.');
  } else {
    console.log('\nWARNING: Some agents were not updated. Check warnings above.');
  }

  return { updated, alreadyV6, skipped, errors, total: agents.length };
}

// --- Main ---
migrateAgentIds();
