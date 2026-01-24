#!/usr/bin/env node
/**
 * Module validation script for BMAD Specialized Teams
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function validateModules() {
  console.log('🔍 Validating BMAD Specialized Teams modules...');

  const srcPath = path.join(__dirname, '..', 'src');
  const teams = ['cybersec-team', 'intel-team', 'legal-team', 'strategy-team'];
  let errors = 0;

  for (const team of teams) {
    const teamPath = path.join(srcPath, team);
    console.log(`\n📋 Validating ${team}...`);

    try {
      // Check module.yaml exists
      const moduleYamlPath = path.join(teamPath, 'module.yaml');
      const moduleContent = await fs.readFile(moduleYamlPath, 'utf8');
      const moduleConfig = yaml.load(moduleContent);

      // Check required directories
      const requiredDirs = ['agents', 'workflows', 'tools'];
      for (const dir of requiredDirs) {
        const dirPath = path.join(teamPath, dir);
        try {
          const stat = await fs.stat(dirPath);
          if (!stat.isDirectory()) {
            console.error(`❌ ${team}: ${dir} is not a directory`);
            errors++;
          }
        } catch {
          console.error(`❌ ${team}: Missing directory ${dir}`);
          errors++;
        }
      }

      // Count agents
      const agentsPath = path.join(teamPath, 'agents');
      const agentFiles = await fs.readdir(agentsPath);
      const yamlAgents = agentFiles.filter(f => f.endsWith('.agent.yaml'));

      console.log(`  ✅ Found ${yamlAgents.length} agents`);

      // Check package.json
      const packageJsonPath = path.join(teamPath, 'package.json');
      const packageContent = await fs.readFile(packageJsonPath, 'utf8');
      const packageData = JSON.parse(packageContent);

      if (packageData.bmad && packageData.bmad.agents !== yamlAgents.length) {
        console.warn(`⚠️  ${team}: Agent count mismatch - package.json says ${packageData.bmad.agents}, found ${yamlAgents.length}`);
      }

      console.log(`  ✅ ${team} validation passed`);

    } catch (error) {
      console.error(`❌ ${team}: Validation failed - ${error.message}`);
      errors++;
    }
  }

  if (errors > 0) {
    console.error(`\n❌ Validation failed with ${errors} errors`);
    process.exit(1);
  } else {
    console.log(`\n✅ All modules validated successfully!`);
  }
}

// Run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  validateModules().catch(error => {
    console.error('Validation script failed:', error);
    process.exit(1);
  });
}

export { validateModules };