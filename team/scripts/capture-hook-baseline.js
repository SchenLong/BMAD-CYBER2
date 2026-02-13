/**
 * Hook Content Baseline Capture
 * ==============================
 * Generates SHA-256 hashes of all hook command files for integrity verification.
 * Part of CRIT-3 security fix — detects moved/truncated/tampered hook files.
 *
 * Output: tests/baselines/hook-content-hashes.json
 *
 * Usage:
 *   node scripts/capture-hook-baseline.js
 */
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function findProjectRoot() {
  let dir = path.resolve(__dirname, '..');
  for (let i = 0; i < 10; i++) {
    if (fs.existsSync(path.join(dir, 'package.json')) && fs.existsSync(path.join(dir, '_bmad'))) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return process.cwd();
}

function extractHookFiles(settings, projectRoot) {
  const files = new Set();
  for (const [eventName, handlers] of Object.entries(settings.hooks || {})) {
    const handlerList = Array.isArray(handlers) ? handlers : [handlers];
    for (const handler of handlerList) {
      for (const hook of handler.hooks || []) {
        if (hook.type === 'command' && hook.command) {
          const cmd = hook.command.replace(/"\$CLAUDE_PROJECT_DIR"/g, projectRoot);
          const parts = cmd.split(' ');
          const filePath = parts.find(p => p.startsWith(projectRoot) || p.startsWith('/'));
          if (filePath && fs.existsSync(filePath)) {
            files.add(filePath);
          }
        }
      }
    }
  }
  return [...files];
}

function main() {
  const projectRoot = findProjectRoot();
  const settingsPath = path.join(projectRoot, '.claude', 'settings.json');

  if (!fs.existsSync(settingsPath)) {
    console.error(`settings.json not found at: ${settingsPath}`);
    process.exit(1);
  }

  const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
  const hookFiles = extractHookFiles(settings, projectRoot);

  const hashes = {};
  for (const filePath of hookFiles.sort()) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const hash = crypto.createHash('sha256').update(content, 'utf-8').digest('hex');
    // Store relative path from project root for portability
    const relativePath = path.relative(projectRoot, filePath);
    hashes[relativePath] = hash;
  }

  const baseline = {
    version: '1.0.0',
    capturedAt: new Date().toISOString(),
    fileCount: Object.keys(hashes).length,
    hashes
  };

  const outputDir = path.join(projectRoot, 'tests', 'baselines');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, 'hook-content-hashes.json');
  fs.writeFileSync(outputPath, `${JSON.stringify(baseline, null, 2)}\n`);

  console.log(`Baseline captured: ${Object.keys(hashes).length} files`);
  console.log(`Output: ${outputPath}`);
}

main();
