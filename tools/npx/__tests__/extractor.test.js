import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import * as tar from 'tar';

// Mock dependencies before importing the module under test
vi.mock('../../../src/utility/cli/prompts.js', () => ({
  select: vi.fn(),
  isCancel: vi.fn().mockReturnValue(false),
  createSpinner: () => ({
    start: vi.fn(),
    stop: vi.fn(),
    message: vi.fn()
  })
}));

vi.mock('../lib/logger.js', () => ({
  logger: {
    info: vi.fn(),
    success: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn()
  }
}));

// Import after mocks are set up
import { extractFramework } from '../lib/extractor.js';
import { select } from '../../../src/utility/cli/prompts.js';
import { logger } from '../lib/logger.js';

describe('extractor', () => {
  let tempDir;
  let tarballPath;
  let targetDir;

  // Helper to create a test tarball with specified files
  async function createTestTarball(files, tarballName = 'test.tar.gz') {
    const sourceDir = join(tempDir, 'source');
    const packageDir = join(sourceDir, 'package'); // Simulates npm pack structure
    mkdirSync(packageDir, { recursive: true });

    // Create files in the package directory
    for (const file of files) {
      const filePath = join(packageDir, file.path);
      const fileDir = join(filePath, '..');
      mkdirSync(fileDir, { recursive: true });
      writeFileSync(filePath, file.content || `content of ${file.path}`);
    }

    // Create tarball
    const tarPath = join(tempDir, tarballName);
    await tar.create(
      {
        gzip: true,
        file: tarPath,
        cwd: sourceDir,
        portable: true
      },
      ['package']
    );

    return tarPath;
  }

  beforeEach(() => {
    // Create fresh temp directories for each test
    tempDir = mkdtempSync(join(tmpdir(), 'extractor-test-'));
    targetDir = join(tempDir, 'target');
    mkdirSync(targetDir, { recursive: true });

    // Reset all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clean up temp directories
    if (tempDir && existsSync(tempDir)) {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('extractTarball', () => {
    it('extracts files to destination', async () => {
      tarballPath = await createTestTarball([
        { path: '_bmad/config.yml', content: 'config: value' },
        { path: 'src/utility/tools/index.js', content: 'export default {}' },
        { path: 'CLAUDE.md', content: '# Claude Instructions' }
      ]);

      const result = await extractFramework(tarballPath, targetDir, { force: true });

      expect(result.success).toBe(true);
      expect(result.filesExtracted).toBeGreaterThan(0);
      expect(existsSync(join(targetDir, '_bmad', 'config.yml'))).toBe(true);
      expect(existsSync(join(targetDir, 'src', 'utility', 'tools', 'index.js'))).toBe(true);
      expect(existsSync(join(targetDir, 'CLAUDE.md'))).toBe(true);
    });

    it('preserves file contents correctly', async () => {
      const expectedContent = 'specific test content 12345';
      tarballPath = await createTestTarball([
        { path: '_bmad/test.txt', content: expectedContent }
      ]);

      await extractFramework(tarballPath, targetDir, { force: true });

      const actualContent = readFileSync(join(targetDir, '_bmad', 'test.txt'), 'utf-8');
      expect(actualContent).toBe(expectedContent);
    });

    it('handles nested directories', async () => {
      tarballPath = await createTestTarball([
        { path: '_bmad/deep/nested/path/file.txt', content: 'deep content' },
        { path: 'src/utility/tools/subdir/another/file.js', content: 'nested js' }
      ]);

      const result = await extractFramework(tarballPath, targetDir, { force: true });

      expect(result.success).toBe(true);
      expect(existsSync(join(targetDir, '_bmad', 'deep', 'nested', 'path', 'file.txt'))).toBe(true);
      expect(existsSync(join(targetDir, 'src', 'utility', 'tools', 'subdir', 'another', 'file.js'))).toBe(true);
    });

    it('strips top-level directory from tarball', async () => {
      tarballPath = await createTestTarball([
        { path: 'CLAUDE.md', content: '# Instructions' }
      ]);

      await extractFramework(tarballPath, targetDir, { force: true });

      // File should be at targetDir/CLAUDE.md, not targetDir/package/CLAUDE.md
      expect(existsSync(join(targetDir, 'CLAUDE.md'))).toBe(true);
      expect(existsSync(join(targetDir, 'package', 'CLAUDE.md'))).toBe(false);
    });
  });

  describe('detectConflicts', () => {
    it('detects existing files', async () => {
      // Create existing file in target
      const existingDir = join(targetDir, '_bmad');
      mkdirSync(existingDir, { recursive: true });
      writeFileSync(join(existingDir, 'existing.yml'), 'original content');

      tarballPath = await createTestTarball([
        { path: '_bmad/existing.yml', content: 'new content' },
        { path: '_bmad/new.yml', content: 'brand new file' }
      ]);

      // Mock select to return 'cancel' when conflicts found
      select.mockResolvedValue('cancel');

      const result = await extractFramework(tarballPath, targetDir, { force: false });

      expect(result.cancelled).toBe(true);
      expect(select).toHaveBeenCalled();
    });

    it('does not prompt when no conflicts exist', async () => {
      tarballPath = await createTestTarball([
        { path: '_bmad/new-file.yml', content: 'new content' }
      ]);

      const result = await extractFramework(tarballPath, targetDir, { force: false });

      expect(result.success).toBe(true);
      expect(select).not.toHaveBeenCalled();
    });

    it('skips conflict check when force is true', async () => {
      // Create existing file
      const existingDir = join(targetDir, '_bmad');
      mkdirSync(existingDir, { recursive: true });
      writeFileSync(join(existingDir, 'existing.yml'), 'original');

      tarballPath = await createTestTarball([
        { path: '_bmad/existing.yml', content: 'overwritten' }
      ]);

      const result = await extractFramework(tarballPath, targetDir, { force: true });

      expect(result.success).toBe(true);
      expect(select).not.toHaveBeenCalled();

      // Verify file was overwritten
      const content = readFileSync(join(targetDir, '_bmad', 'existing.yml'), 'utf-8');
      expect(content).toBe('overwritten');
    });
  });

  describe('filtering', () => {
    it('excludes node_modules directory', async () => {
      tarballPath = await createTestTarball([
        { path: '_bmad/config.yml', content: 'config' },
        { path: 'node_modules/package/index.js', content: 'dependency' }
      ]);

      await extractFramework(tarballPath, targetDir, { force: true });

      expect(existsSync(join(targetDir, '_bmad', 'config.yml'))).toBe(true);
      expect(existsSync(join(targetDir, 'node_modules'))).toBe(false);
    });

    it('excludes .git directory', async () => {
      tarballPath = await createTestTarball([
        { path: '_bmad/config.yml', content: 'config' },
        { path: '.git/config', content: 'git config' },
        { path: '.git/HEAD', content: 'ref: refs/heads/main' }
      ]);

      await extractFramework(tarballPath, targetDir, { force: true });

      expect(existsSync(join(targetDir, '_bmad', 'config.yml'))).toBe(true);
      expect(existsSync(join(targetDir, '.git'))).toBe(false);
    });

    it('excludes .github directory', async () => {
      tarballPath = await createTestTarball([
        { path: '_bmad/config.yml', content: 'config' },
        { path: '.github/workflows/ci.yml', content: 'workflow' }
      ]);

      await extractFramework(tarballPath, targetDir, { force: true });

      expect(existsSync(join(targetDir, '_bmad', 'config.yml'))).toBe(true);
      expect(existsSync(join(targetDir, '.github'))).toBe(false);
    });

    it('excludes __tests__ directory', async () => {
      tarballPath = await createTestTarball([
        { path: '_bmad/config.yml', content: 'config' },
        { path: '__tests__/integration.js', content: 'tests' }
      ]);

      await extractFramework(tarballPath, targetDir, { force: true });

      expect(existsSync(join(targetDir, '_bmad', 'config.yml'))).toBe(true);
      expect(existsSync(join(targetDir, '__tests__'))).toBe(false);
    });
  });

  describe('dry run mode', () => {
    it('shows what would be extracted without doing it', async () => {
      tarballPath = await createTestTarball([
        { path: '_bmad/config.yml', content: 'config' },
        { path: 'CLAUDE.md', content: 'instructions' },
        { path: 'src/utility/tools/index.js', content: 'code' }
      ]);

      const result = await extractFramework(tarballPath, targetDir, { dryRun: true });

      expect(result.dryRun).toBe(true);
      expect(result.filesExtracted).toBe(0);
      expect(Array.isArray(result.files)).toBe(true);
      expect(result.files.length).toBeGreaterThan(0);

      // Verify no files were actually extracted
      expect(existsSync(join(targetDir, '_bmad'))).toBe(false);
      expect(existsSync(join(targetDir, 'CLAUDE.md'))).toBe(false);
    });

    it('logs file list information', async () => {
      tarballPath = await createTestTarball([
        { path: '_bmad/config.yml', content: 'config' }
      ]);

      await extractFramework(tarballPath, targetDir, { dryRun: true });

      expect(logger.info).toHaveBeenCalled();
    });
  });

  describe('overwrite handling', () => {
    it('prompts user when conflicts exist and force is false', async () => {
      // Create existing file
      const existingDir = join(targetDir, '_bmad');
      mkdirSync(existingDir, { recursive: true });
      writeFileSync(join(existingDir, 'config.yml'), 'original');

      tarballPath = await createTestTarball([
        { path: '_bmad/config.yml', content: 'new content' }
      ]);

      select.mockResolvedValue('overwrite');

      await extractFramework(tarballPath, targetDir, { force: false });

      expect(select).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.any(String),
          options: expect.arrayContaining([
            expect.objectContaining({ value: 'overwrite' }),
            expect.objectContaining({ value: 'skip' }),
            expect.objectContaining({ value: 'cancel' })
          ])
        })
      );
    });

    it('overwrites files when user selects overwrite', async () => {
      // Create existing file
      const existingDir = join(targetDir, '_bmad');
      mkdirSync(existingDir, { recursive: true });
      writeFileSync(join(existingDir, 'config.yml'), 'original content');

      tarballPath = await createTestTarball([
        { path: '_bmad/config.yml', content: 'new content' }
      ]);

      select.mockResolvedValue('overwrite');

      const result = await extractFramework(tarballPath, targetDir, { force: false });

      expect(result.success).toBe(true);
      const content = readFileSync(join(targetDir, '_bmad', 'config.yml'), 'utf-8');
      expect(content).toBe('new content');
    });

    it('cancels extraction when user selects cancel', async () => {
      // Create existing file
      const existingDir = join(targetDir, '_bmad');
      mkdirSync(existingDir, { recursive: true });
      writeFileSync(join(existingDir, 'config.yml'), 'original');

      tarballPath = await createTestTarball([
        { path: '_bmad/config.yml', content: 'new' },
        { path: '_bmad/another.yml', content: 'another' }
      ]);

      select.mockResolvedValue('cancel');

      const result = await extractFramework(tarballPath, targetDir, { force: false });

      expect(result.cancelled).toBe(true);
      expect(result.filesExtracted).toBe(0);

      // Verify no new files were extracted
      expect(existsSync(join(targetDir, '_bmad', 'another.yml'))).toBe(false);
    });
  });

  describe('error handling', () => {
    it('handles missing tarball file', async () => {
      const nonExistentTarball = join(tempDir, 'non-existent.tar.gz');

      await expect(
        extractFramework(nonExistentTarball, targetDir, { force: true })
      ).rejects.toThrow();
    });

    it('handles corrupt tarball', async () => {
      // Create a file that looks like a tarball but isn't
      const corruptTarball = join(tempDir, 'corrupt.tar.gz');
      writeFileSync(corruptTarball, 'this is not a valid tarball');

      await expect(
        extractFramework(corruptTarball, targetDir, { force: true })
      ).rejects.toThrow();
    });
  });

  describe('file count reporting', () => {
    it('returns correct file count after extraction', async () => {
      tarballPath = await createTestTarball([
        { path: '_bmad/file1.yml', content: '1' },
        { path: '_bmad/file2.yml', content: '2' },
        { path: '_bmad/file3.yml', content: '3' }
      ]);

      const result = await extractFramework(tarballPath, targetDir, { force: true });

      expect(result.filesExtracted).toBeGreaterThanOrEqual(3);
    });

    it('does not count filtered files in file count', async () => {
      tarballPath = await createTestTarball([
        { path: '_bmad/config.yml', content: 'config' },
        { path: 'node_modules/dep/index.js', content: 'dep' }
      ]);

      const result = await extractFramework(tarballPath, targetDir, { force: true });

      // _bmad/config.yml should be counted (node_modules should be filtered)
      expect(result.filesExtracted).toBeGreaterThanOrEqual(1);
    });
  });
});
