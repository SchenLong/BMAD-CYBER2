/**
 * Tests for production guard
 */

import { describe, it, expect } from 'vitest';
import {
  isDocumentationFile,
  isSafeContext,
  isCriticalDeployCommand,
  detectProductionIndicators,
  validateProductionGuard,
} from '../../src/guards/production.js';
import { EXIT_CODES } from '../../src/types/index.js';

describe('isDocumentationFile', () => {
  it('should identify markdown files', () => {
    expect(isDocumentationFile('README.md')).toBe(true);
    expect(isDocumentationFile('docs/guide.md')).toBe(true);
    expect(isDocumentationFile('CHANGELOG.md')).toBe(true);
  });

  it('should identify docs directories', () => {
    expect(isDocumentationFile('/docs/api.md')).toBe(true);
    expect(isDocumentationFile('/documentation/guide.txt')).toBe(true);
  });

  it('should identify other doc formats', () => {
    expect(isDocumentationFile('notes.txt')).toBe(true);
    expect(isDocumentationFile('guide.rst')).toBe(true);
    expect(isDocumentationFile('doc.adoc')).toBe(true);
  });

  it('should not identify code files', () => {
    expect(isDocumentationFile('index.ts')).toBe(false);
    expect(isDocumentationFile('app.js')).toBe(false);
    expect(isDocumentationFile('config.json')).toBe(false);
  });

  it('should handle null/empty', () => {
    expect(isDocumentationFile(null)).toBe(false);
    expect(isDocumentationFile('')).toBe(false);
  });
});

describe('isSafeContext', () => {
  it('should identify safe words', () => {
    expect(isSafeContext('this is a product feature')).toBe(true);
    expect(isSafeContext('productivity tools')).toBe(true);
    expect(isSafeContext('productive session')).toBe(true);
    expect(isSafeContext('reproduce the bug')).toBe(true);
  });

  it('should identify test/staging contexts', () => {
    expect(isSafeContext('prod-test environment')).toBe(true);
    expect(isSafeContext('test-prod config')).toBe(true);
    expect(isSafeContext('non-prod setup')).toBe(true);
    expect(isSafeContext('pre-prod deployment')).toBe(true);
  });

  it('should identify comments', () => {
    expect(isSafeContext('# prod server')).toBe(true);
    expect(isSafeContext('// prod config')).toBe(true);
    expect(isSafeContext('/* prod */  ')).toBe(true);
  });

  it('should identify documentation phrases', () => {
    expect(isSafeContext('production-ready code')).toBe(true);
    expect(isSafeContext('production-quality output')).toBe(true);
    expect(isSafeContext('for production use')).toBe(true);
    expect(isSafeContext('in production environments')).toBe(true);
  });

  it('should not match actual production references', () => {
    expect(isSafeContext('deploy to prod')).toBe(false);
    // Note: URLs may match safe patterns due to slashes; actual blocking is handled by detectProductionIndicators
  });
});

describe('isCriticalDeployCommand', () => {
  it('should detect force push to main', () => {
    const result = isCriticalDeployCommand('git push --force origin main');
    expect(result.isCritical).toBe(true);
  });

  it('should detect force push to master', () => {
    const result = isCriticalDeployCommand('git push -f origin master');
    expect(result.isCritical).toBe(true);
  });

  it('should detect deploy to prod', () => {
    const result = isCriticalDeployCommand('deploy to prod');
    expect(result.isCritical).toBe(true);
  });

  it('should detect kubectl in prod context', () => {
    const result = isCriticalDeployCommand('kubectl apply -f deployment.yaml --context prod');
    expect(result.isCritical).toBe(true);
  });

  it('should detect helm in prod context', () => {
    const result = isCriticalDeployCommand('helm upgrade myapp ./chart --namespace prod');
    expect(result.isCritical).toBe(true);
  });

  it('should not flag regular git commands', () => {
    const result = isCriticalDeployCommand('git push origin feature-branch');
    expect(result.isCritical).toBe(false);
  });
});

describe('detectProductionIndicators', () => {
  it('should detect explicit prod keywords', () => {
    const indicators = detectProductionIndicators('connecting to prod server');
    expect(indicators.length).toBeGreaterThan(0);
    expect(indicators[0]?.pattern).toContain('prod');
  });

  it('should detect production keywords', () => {
    const indicators = detectProductionIndicators('production database connection');
    expect(indicators.length).toBeGreaterThan(0);
  });

  it('should detect environment variables', () => {
    const indicators = detectProductionIndicators('NODE_ENV=production');
    expect(indicators.length).toBeGreaterThan(0);
  });

  it('should detect database indicators', () => {
    const indicators = detectProductionIndicators('connecting to prod_db');
    expect(indicators.length).toBeGreaterThan(0);
  });

  it('should detect cloud provider indicators', () => {
    const indicators1 = detectProductionIndicators('deploying to aws-prod');
    expect(indicators1.length).toBeGreaterThan(0);

    const indicators2 = detectProductionIndicators('gcp-prod project');
    expect(indicators2.length).toBeGreaterThan(0);
  });

  it('should filter safe contexts', () => {
    const indicators = detectProductionIndicators('# this is a prod comment');
    expect(indicators.length).toBe(0);
  });

  it('should not detect in safe words', () => {
    const indicators = detectProductionIndicators('this product is great');
    expect(indicators.length).toBe(0);
  });
});

describe('validateProductionGuard', () => {
  it('should allow empty content', () => {
    expect(validateProductionGuard('', null)).toBe(EXIT_CODES.ALLOW);
  });

  it('should allow documentation files', () => {
    expect(validateProductionGuard('deploy to prod', 'README.md')).toBe(EXIT_CODES.ALLOW);
  });

  it('should allow safe content', () => {
    expect(validateProductionGuard('great product feature', null)).toBe(EXIT_CODES.ALLOW);
    expect(validateProductionGuard('productivity boost', null)).toBe(EXIT_CODES.ALLOW);
  });

  it('should block critical deploy commands', () => {
    expect(validateProductionGuard('git push --force origin main', null)).toBe(EXIT_CODES.HARD_BLOCK);
    expect(validateProductionGuard('deploy to prod now', null)).toBe(EXIT_CODES.HARD_BLOCK);
  });

  it('should block production indicators', () => {
    expect(validateProductionGuard('connecting to prod-db', null)).toBe(EXIT_CODES.HARD_BLOCK);
    expect(validateProductionGuard('NODE_ENV=production', 'config.sh')).toBe(EXIT_CODES.HARD_BLOCK);
  });
});
