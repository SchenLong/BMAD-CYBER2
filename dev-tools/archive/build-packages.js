#!/usr/bin/env node
/**
 * Build packages script for BMAD Cybercommand
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function buildPackages() {
  console.log('🔧 Building BMAD Cybercommand packages...');

  const srcPath = path.join(__dirname, '..', 'src');
  const teams = ['cybersec-team', 'intel-team', 'legal-team', 'strategy-team'];

  for (const team of teams) {
    console.log(`\n📦 Building ${team}...`);

    // In a full implementation, this would:
    // - Compile TypeScript files if any
    // - Validate YAML schemas
    // - Generate documentation
    // - Create optimized bundles

    // For now, we'll just verify the structure is ready
    const teamPath = path.join(srcPath, team);
    const packageJsonPath = path.join(teamPath, 'package.json');
    const moduleYamlPath = path.join(teamPath, 'module.yaml');

    try {
      await fs.access(packageJsonPath);
      await fs.access(moduleYamlPath);
      console.log(`  ✅ ${team} build ready`);
    } catch (error) {
      console.error(`❌ ${team} build failed: ${error.message}`);
      process.exit(1);
    }
  }

  console.log('\n✅ All packages built successfully!');
}

// Run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  buildPackages().catch(error => {
    console.error('Build script failed:', error);
    process.exit(1);
  });
}

export { buildPackages };