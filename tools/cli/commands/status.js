import { existsSync } from 'fs';
import { join } from 'path';
import { readFile } from 'fs/promises';
import pc from 'picocolors';
import { CONFIG } from '../lib/config.js';
import { logger } from '../lib/logger.js';
import { getInstalledModules, getInstalledVersion, isBmadInstalled } from '../lib/cli-utils.js';

export async function statusCommand() {
  const targetDir = process.cwd();

  console.log(pc.bold('BMAD-CYBER Status'));
  console.log(pc.dim('\u2500'.repeat(40)));
  console.log('');

  // CLI version
  console.log(`  CLI Version:       ${pc.cyan(`v${CONFIG.VERSION}`)}`);

  // Installation check
  if (!isBmadInstalled(targetDir)) {
    console.log(`  Installation:      ${pc.yellow('Not installed')}`);
    console.log('');
    console.log(pc.dim('  Run `npx bmad-cybersec install` to install.'));
    return;
  }

  console.log(`  Installation:      ${pc.green('Installed')}`);

  // Installed version
  const installedVersion = getInstalledVersion(targetDir);
  console.log(`  Framework Version: ${installedVersion ? pc.cyan(`v${installedVersion}`) : pc.dim('unknown')}`);

  // Check key directories
  const dirs = [
    { name: '_bmad', label: 'Framework Core' },
    { name: '.claude', label: 'Claude Config' },
    { name: 'src/core/security', label: 'Security Module' },
  ];

  console.log('');
  console.log(pc.bold('  Components:'));

  for (const dir of dirs) {
    const exists = existsSync(join(targetDir, dir.name));
    const status = exists ? pc.green('\u2713') : pc.red('\u2717');
    console.log(`    ${status} ${dir.label}`);
  }

  // Check for active modules (supports both src/ and _bmad/ layouts)
  const modules = getInstalledModules(targetDir).filter(m => m !== 'core');

  console.log('');
  console.log(pc.bold('  Active Modules:'));
  if (modules.length === 0) {
    console.log(`    ${pc.dim('No modules installed')}`);
  } else {
    for (const mod of modules) {
      console.log(`    ${pc.green('\u2713')} ${mod}`);
    }
  }

  // Check package.json for BMAD deps
  const pkgPath = join(targetDir, 'package.json');
  if (existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(await readFile(pkgPath, 'utf-8'));
      const bmadDeps = Object.keys(pkg.dependencies || {}).filter(d => d.startsWith('@bmad/'));
      if (bmadDeps.length > 0) {
        console.log('');
        console.log(pc.bold('  BMAD Dependencies:'));
        for (const dep of bmadDeps) {
          console.log(`    ${pc.cyan(dep)}: ${pkg.dependencies[dep]}`);
        }
      }
    } catch {
      // Ignore JSON parse errors
    }
  }

  console.log('');
}
