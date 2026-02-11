/**
 * No-Eval Audit Tests (P7-31 / INV-11)
 *
 * Scans security-critical paths for dangerous code-execution patterns.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'fs';
import { resolve, join, extname } from 'path';

const PROJECT_ROOT = resolve(import.meta.dirname, '../..');

function collectFiles(dir, extensions) {
  const results = [];
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return results; }
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || (entry.name.startsWith('.') && entry.name !== '.claude')) continue;
      results.push(...collectFiles(fullPath, extensions));
    } else if (entry.isFile() && extensions.includes(extname(entry.name))) {
      results.push(fullPath);
    }
  }
  return results;
}


function scanForPatterns(filePath, patterns, descriptions) {
  const violations = [];
  let content;
  try { content = readFileSync(filePath, 'utf-8'); } catch { return violations; }
  const lns = content.split('\n');
  for (let i = 0; i < lns.length; i++) {
    const line = lns[i];
    const trimmed = line.trim();
    if (trimmed.startsWith('//')||trimmed.startsWith('#')||trimmed.startsWith('*')||trimmed.startsWith('/*')) continue;
    for (let p = 0; p < patterns.length; p++) {
      if (patterns[p].test(line)) {
        violations.push({ file: filePath.replace(PROJECT_ROOT+'/',''), line: i+1, text: trimmed.substring(0,120), pattern: descriptions[p] });
      }
    }
  }
  return violations;
}


const JS_PATTERNS = [/\beval\s*\(/,/\bnew\s+Function\s*\(/];
const JS_DESCRIPTIONS = ['eval() call','new Function() constructor'];
const SH_PATTERNS = [/\beval\s/,/\bsource\s+<\(/];
const SH_DESCRIPTIONS = ['eval command','source process substitution'];

const HOOK_DIR = resolve(PROJECT_ROOT, '.claude/hooks');
const VALIDATORS_DIR = resolve(PROJECT_ROOT, '.claude/validators-node/src');
const SCRIPTS_DIR = resolve(PROJECT_ROOT, 'scripts');
const SECURITY_DIR = resolve(PROJECT_ROOT, 'src/core/security');


function scanFiles(files, patterns, descriptions) {
  const v = [];
  for (const f of files) v.push(...scanForPatterns(f, patterns, descriptions));
  return v;
}

function reportViolations(v, label) {
  if (v.length > 0) {
    const report = v.map(x => `  ${x.file}:${x.line} [${x.pattern}] ${x.text}`).join('\n');
    expect.fail(`Found ${v.length} ${label}:\n${report}`);
  }
  expect(v).toHaveLength(0);
}


describe('No-Eval Audit (INV-11)', () => {

  describe('Shell Hooks', () => {
    const shellFiles = collectFiles(HOOK_DIR, ['.sh']);
    it('should discover shell hook files', () => { expect(shellFiles.length).toBeGreaterThan(0); });
    it('should have zero eval violations', () => { reportViolations(scanFiles(shellFiles, SH_PATTERNS, SH_DESCRIPTIONS), 'dangerous shell patterns'); });
  });

  describe('TypeScript Validators', () => {
    const tsFiles = collectFiles(VALIDATORS_DIR, ['.ts']).filter(f => !f.endsWith('.d.ts') && !f.includes('__tests__'));
    it('should discover TypeScript validator files', () => { expect(tsFiles.length).toBeGreaterThan(0); });
    it('should have zero eval/Function violations', () => { reportViolations(scanFiles(tsFiles, JS_PATTERNS, JS_DESCRIPTIONS), 'dangerous JS patterns in validators'); });
  });


  describe('Scripts', () => {
    const jsFiles = collectFiles(SCRIPTS_DIR, ['.js']);
    const shFiles = collectFiles(SCRIPTS_DIR, ['.sh']);
    it('should discover script files', () => { expect(jsFiles.length + shFiles.length).toBeGreaterThan(0); });
    it('should have zero eval violations in JS', () => { expect(scanFiles(jsFiles, JS_PATTERNS, JS_DESCRIPTIONS)).toHaveLength(0); });
    it('should have zero eval violations in shell', () => { expect(scanFiles(shFiles, SH_PATTERNS, SH_DESCRIPTIONS)).toHaveLength(0); });
  });

  describe('Security Modules', () => {
    const secFiles = collectFiles(SECURITY_DIR, ['.ts','.js']).filter(f => !f.endsWith('.d.ts'));
    it('should discover security module files', () => { expect(secFiles.length).toBeGreaterThan(0); });
    it('should have zero eval/Function violations', () => { reportViolations(scanFiles(secFiles, JS_PATTERNS, JS_DESCRIPTIONS), 'dangerous JS patterns in security'); });
  });


  describe('No Dynamic Require', () => {
    const allFiles = [
      ...collectFiles(VALIDATORS_DIR, ['.ts','.js']).filter(f => !f.endsWith('.d.ts') && !f.includes('__tests__')),
      ...collectFiles(SECURITY_DIR, ['.ts','.js']).filter(f => !f.endsWith('.d.ts')),
      ...collectFiles(SCRIPTS_DIR, ['.js']),
    ];
    it('should not use dynamic require with variable arguments', () => {
      const pat = [/\brequire\s*\(\s*[^'"]/];
      reportViolations(scanFiles(allFiles, pat, ['dynamic require()']), 'dynamic require calls');
    });
  });

  describe('Aggregate', () => {
    it('should pass audit across all scanned directories', () => {
      const sh = collectFiles(HOOK_DIR, ['.sh']);
      const ts = collectFiles(VALIDATORS_DIR, ['.ts']).filter(f => !f.endsWith('.d.ts') && !f.includes('__tests__'));
      const js = collectFiles(SCRIPTS_DIR, ['.js']);
      const shS = collectFiles(SCRIPTS_DIR, ['.sh']);
      const sec = collectFiles(SECURITY_DIR, ['.ts','.js']).filter(f => !f.endsWith('.d.ts'));
      expect(sh.length+ts.length+js.length+shS.length+sec.length).toBeGreaterThan(20);
      const v = [];
      for (const f of sh) v.push(...scanForPatterns(f, SH_PATTERNS, SH_DESCRIPTIONS));
      for (const f of ts) v.push(...scanForPatterns(f, JS_PATTERNS, JS_DESCRIPTIONS));
      for (const f of js) v.push(...scanForPatterns(f, JS_PATTERNS, JS_DESCRIPTIONS));
      for (const f of shS) v.push(...scanForPatterns(f, SH_PATTERNS, SH_DESCRIPTIONS));
      for (const f of sec) v.push(...scanForPatterns(f, JS_PATTERNS, JS_DESCRIPTIONS));
      expect(v).toHaveLength(0);
    });
  });
});
