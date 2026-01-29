import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { join } from 'path';
import { tmpdir } from 'os';

// Mock child_process
vi.mock('child_process', () => ({
  exec: vi.fn()
}));

// Mock util
vi.mock('util', () => ({
  promisify: vi.fn((fn) => fn)
}));

// Mock fs/promises
vi.mock('fs/promises', () => ({
  mkdir: vi.fn().mockResolvedValue(undefined),
  rm: vi.fn().mockResolvedValue(undefined),
  cp: vi.fn().mockResolvedValue(undefined),
  readdir: vi.fn().mockResolvedValue([]),
  stat: vi.fn().mockResolvedValue({ isDirectory: () => false })
}));

// Mock ora
vi.mock('ora', () => ({
  default: vi.fn(() => ({
    start: vi.fn().mockReturnThis(),
    succeed: vi.fn().mockReturnThis(),
    fail: vi.fn().mockReturnThis(),
    stop: vi.fn().mockReturnThis()
  }))
}));

// Mock logger
vi.mock('../lib/logger.js', () => ({
  logger: {
    info: vi.fn(),
    success: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn()
  }
}));

// Mock config
vi.mock('../lib/config.js', () => ({
  CONFIG: {
    GITHUB_OWNER: 'TestOwner',
    GITHUB_REPO: 'TestRepo',
    TEMP_DIR_PREFIX: 'test-prefix'
  }
}));

describe('git-clone', () => {
  let exec;
  let mkdir;
  let rm;
  let cp;
  let readdir;
  let cloneRepository;
  let copyRelevantFiles;
  let cleanupClone;

  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();

    // Get mocked modules
    const childProcess = await import('child_process');
    const fsPromises = await import('fs/promises');

    exec = childProcess.exec;
    mkdir = fsPromises.mkdir;
    rm = fsPromises.rm;
    cp = fsPromises.cp;
    readdir = fsPromises.readdir;

    // Import module under test
    const gitClone = await import('../lib/git-clone.js');
    cloneRepository = gitClone.cloneRepository;
    copyRelevantFiles = gitClone.copyRelevantFiles;
    cleanupClone = gitClone.cleanupClone;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('cloneRepository', () => {
    it('should clone with shallow depth by default', async () => {
      exec.mockResolvedValueOnce({ stdout: 'git version 2.40.0' }); // git --version
      exec.mockResolvedValueOnce({ stdout: '' }); // git clone

      const result = await cloneRepository();

      expect(result).toMatch(/test-prefix-clone-\d+/);
      expect(exec).toHaveBeenCalledTimes(2);

      const cloneCall = exec.mock.calls[1][0];
      expect(cloneCall).toContain('--depth 1');
    });

    it('should clone with custom depth when specified', async () => {
      exec.mockResolvedValueOnce({ stdout: 'git version 2.40.0' });
      exec.mockResolvedValueOnce({ stdout: '' });

      await cloneRepository({ depth: 5 });

      const cloneCall = exec.mock.calls[1][0];
      expect(cloneCall).toContain('--depth 5');
    });

    it('should support specific branch', async () => {
      exec.mockResolvedValueOnce({ stdout: 'git version 2.40.0' });
      exec.mockResolvedValueOnce({ stdout: '' });

      await cloneRepository({ branch: 'develop' });

      const cloneCall = exec.mock.calls[1][0];
      expect(cloneCall).toContain('--branch develop');
    });

    it('should use default branch "main" when not specified', async () => {
      exec.mockResolvedValueOnce({ stdout: 'git version 2.40.0' });
      exec.mockResolvedValueOnce({ stdout: '' });

      await cloneRepository();

      const cloneCall = exec.mock.calls[1][0];
      expect(cloneCall).toContain('--branch main');
    });

    it('should use default repository URL from config', async () => {
      exec.mockResolvedValueOnce({ stdout: 'git version 2.40.0' });
      exec.mockResolvedValueOnce({ stdout: '' });

      await cloneRepository();

      const cloneCall = exec.mock.calls[1][0];
      expect(cloneCall).toContain('https://github.com/TestOwner/TestRepo.git');
    });

    it('should use custom repository URL when provided', async () => {
      exec.mockResolvedValueOnce({ stdout: 'git version 2.40.0' });
      exec.mockResolvedValueOnce({ stdout: '' });

      await cloneRepository({ repoUrl: 'https://github.com/custom/repo.git' });

      const cloneCall = exec.mock.calls[1][0];
      expect(cloneCall).toContain('https://github.com/custom/repo.git');
    });

    it('should create temp directory for clone', async () => {
      exec.mockResolvedValueOnce({ stdout: 'git version 2.40.0' });
      exec.mockResolvedValueOnce({ stdout: '' });

      await cloneRepository();

      expect(mkdir).toHaveBeenCalledWith(
        expect.stringContaining('test-prefix-clone-'),
        { recursive: true }
      );
    });

    it('should return the temp directory path', async () => {
      exec.mockResolvedValueOnce({ stdout: 'git version 2.40.0' });
      exec.mockResolvedValueOnce({ stdout: '' });

      const result = await cloneRepository();

      expect(result).toBeDefined();
      expect(result).toContain(tmpdir());
      expect(result).toContain('test-prefix-clone-');
    });
  });

  describe('isGitAvailable (via cloneRepository)', () => {
    it('should detect git availability', async () => {
      exec.mockResolvedValueOnce({ stdout: 'git version 2.40.0' });
      exec.mockResolvedValueOnce({ stdout: '' });

      await cloneRepository();

      expect(exec).toHaveBeenCalledWith('git --version');
    });

    it('should throw error when git is not installed', async () => {
      exec.mockRejectedValueOnce(new Error('command not found: git'));

      await expect(cloneRepository()).rejects.toThrow('Git is not installed or not in PATH');
    });

    it('should include helpful message when git not installed', async () => {
      exec.mockRejectedValueOnce(new Error('command not found: git'));

      await expect(cloneRepository()).rejects.toThrow('--from-git');
    });
  });

  describe('error handling', () => {
    it('should handle network failures gracefully', async () => {
      exec.mockResolvedValueOnce({ stdout: 'git version 2.40.0' });
      exec.mockRejectedValueOnce(new Error('fatal: unable to access repository'));

      await expect(cloneRepository()).rejects.toThrow('unable to access repository');
    });

    it('should handle invalid repository URL', async () => {
      exec.mockResolvedValueOnce({ stdout: 'git version 2.40.0' });
      exec.mockRejectedValueOnce(new Error('fatal: repository not found'));

      await expect(cloneRepository({ repoUrl: 'https://github.com/invalid/repo.git' }))
        .rejects.toThrow('repository not found');
    });

    it('should handle branch not found error', async () => {
      exec.mockResolvedValueOnce({ stdout: 'git version 2.40.0' });
      const error = new Error('Remote branch not found');
      error.stderr = 'error: not found';
      exec.mockRejectedValueOnce(error);

      await expect(cloneRepository({ branch: 'nonexistent' }))
        .rejects.toThrow("Branch 'nonexistent' not found in repository");
    });

    it('should handle timeout on slow network', async () => {
      exec.mockResolvedValueOnce({ stdout: 'git version 2.40.0' });
      const timeoutError = new Error('Command timed out');
      timeoutError.killed = true;
      exec.mockRejectedValueOnce(timeoutError);

      await expect(cloneRepository()).rejects.toThrow('timed out');
    });
  });

  describe('copyRelevantFiles', () => {
    it('should exclude .git directory', async () => {
      readdir.mockResolvedValue([
        { name: '.git', isDirectory: () => true },
        { name: 'src', isDirectory: () => true }
      ]);

      await copyRelevantFiles('/source', '/dest');

      // .git should be excluded, src should be processed
      expect(cp).not.toHaveBeenCalledWith(
        expect.stringContaining('.git'),
        expect.any(String)
      );
    });

    it('should exclude node_modules directory', async () => {
      readdir.mockResolvedValueOnce([
        { name: 'node_modules', isDirectory: () => true },
        { name: 'package.json', isDirectory: () => false }
      ]);

      await copyRelevantFiles('/source', '/dest');

      expect(cp).not.toHaveBeenCalledWith(
        expect.stringContaining('node_modules'),
        expect.any(String)
      );
    });

    it('should exclude __tests__ directory', async () => {
      readdir.mockResolvedValueOnce([
        { name: '__tests__', isDirectory: () => true },
        { name: 'index.js', isDirectory: () => false }
      ]);

      await copyRelevantFiles('/source', '/dest');

      expect(cp).not.toHaveBeenCalledWith(
        expect.stringContaining('__tests__'),
        expect.any(String)
      );
    });

    it('should exclude test files by pattern (*.test.js)', async () => {
      readdir.mockResolvedValueOnce([
        { name: 'module.test.js', isDirectory: () => false },
        { name: 'module.js', isDirectory: () => false }
      ]);

      await copyRelevantFiles('/source', '/dest');

      expect(cp).not.toHaveBeenCalledWith(
        expect.stringContaining('.test.js'),
        expect.any(String)
      );
      expect(cp).toHaveBeenCalledWith(
        join('/source', 'module.js'),
        join('/dest', 'module.js')
      );
    });

    it('should exclude spec files by pattern (*.spec.js)', async () => {
      readdir.mockResolvedValueOnce([
        { name: 'module.spec.js', isDirectory: () => false },
        { name: 'module.js', isDirectory: () => false }
      ]);

      await copyRelevantFiles('/source', '/dest');

      expect(cp).not.toHaveBeenCalledWith(
        expect.stringContaining('.spec.js'),
        expect.any(String)
      );
    });

    it('should exclude coverage directory', async () => {
      readdir.mockResolvedValueOnce([
        { name: 'coverage', isDirectory: () => true },
        { name: 'src', isDirectory: () => true }
      ]);

      await copyRelevantFiles('/source', '/dest');

      expect(mkdir).not.toHaveBeenCalledWith(
        expect.stringContaining('coverage'),
        expect.any(Object)
      );
    });

    it('should exclude .github directory', async () => {
      readdir.mockResolvedValueOnce([
        { name: '.github', isDirectory: () => true },
        { name: 'lib', isDirectory: () => true }
      ]);

      await copyRelevantFiles('/source', '/dest');

      expect(mkdir).not.toHaveBeenCalledWith(
        expect.stringContaining('.github'),
        expect.any(Object)
      );
    });

    it('should exclude Docs when withDocs is false', async () => {
      readdir.mockResolvedValueOnce([
        { name: 'Docs', isDirectory: () => true },
        { name: 'src', isDirectory: () => true }
      ]);

      await copyRelevantFiles('/source', '/dest', { withDocs: false });

      expect(mkdir).not.toHaveBeenCalledWith(
        expect.stringContaining('Docs'),
        expect.any(Object)
      );
    });

    it('should include Docs when withDocs is true', async () => {
      readdir.mockResolvedValueOnce([
        { name: 'Docs', isDirectory: () => true }
      ]);
      readdir.mockResolvedValueOnce([
        { name: 'readme.md', isDirectory: () => false }
      ]);

      await copyRelevantFiles('/source', '/dest', { withDocs: true });

      expect(mkdir).toHaveBeenCalledWith(
        join('/dest', 'Docs'),
        { recursive: true }
      );
    });

    it('should exclude dev-tools when withDev is false', async () => {
      readdir.mockResolvedValueOnce([
        { name: 'dev-tools', isDirectory: () => true },
        { name: 'src', isDirectory: () => true }
      ]);

      await copyRelevantFiles('/source', '/dest', { withDev: false });

      expect(mkdir).not.toHaveBeenCalledWith(
        expect.stringContaining('dev-tools'),
        expect.any(Object)
      );
    });

    it('should include dev-tools when withDev is true', async () => {
      readdir.mockResolvedValueOnce([
        { name: 'dev-tools', isDirectory: () => true }
      ]);
      readdir.mockResolvedValueOnce([
        { name: 'tool.js', isDirectory: () => false }
      ]);

      await copyRelevantFiles('/source', '/dest', { withDev: true });

      expect(mkdir).toHaveBeenCalledWith(
        join('/dest', 'dev-tools'),
        { recursive: true }
      );
    });

    it('should copy regular files', async () => {
      readdir.mockResolvedValueOnce([
        { name: 'index.js', isDirectory: () => false },
        { name: 'config.json', isDirectory: () => false }
      ]);

      await copyRelevantFiles('/source', '/dest');

      expect(cp).toHaveBeenCalledWith(
        join('/source', 'index.js'),
        join('/dest', 'index.js')
      );
      expect(cp).toHaveBeenCalledWith(
        join('/source', 'config.json'),
        join('/dest', 'config.json')
      );
    });

    it('should return count of copied files', async () => {
      readdir.mockResolvedValueOnce([
        { name: 'file1.js', isDirectory: () => false },
        { name: 'file2.js', isDirectory: () => false },
        { name: 'file3.js', isDirectory: () => false }
      ]);

      const count = await copyRelevantFiles('/source', '/dest');

      expect(count).toBe(3);
    });

    it('should recursively copy subdirectories', async () => {
      // First call - root directory
      readdir.mockResolvedValueOnce([
        { name: 'src', isDirectory: () => true }
      ]);
      // Second call - src directory
      readdir.mockResolvedValueOnce([
        { name: 'app.js', isDirectory: () => false }
      ]);

      await copyRelevantFiles('/source', '/dest');

      expect(mkdir).toHaveBeenCalledWith(join('/dest', 'src'), { recursive: true });
      expect(cp).toHaveBeenCalledWith(
        join('/source', 'src', 'app.js'),
        join('/dest', 'src', 'app.js')
      );
    });
  });

  describe('cleanupClone', () => {
    it('should remove temp directory after clone', async () => {
      const tempDir = '/tmp/test-prefix-clone-12345';

      await cleanupClone(tempDir);

      expect(rm).toHaveBeenCalledWith(tempDir, { recursive: true, force: true });
    });

    it('should not throw on cleanup errors', async () => {
      rm.mockRejectedValueOnce(new Error('Permission denied'));

      const tempDir = '/tmp/test-prefix-clone-12345';

      // Should not throw
      await expect(cleanupClone(tempDir)).resolves.toBeUndefined();
    });

    it('should handle non-existent directories gracefully', async () => {
      rm.mockRejectedValueOnce(new Error('ENOENT: no such file or directory'));

      await expect(cleanupClone('/nonexistent/path')).resolves.toBeUndefined();
    });
  });

  describe('git clone command construction', () => {
    it('should construct proper git clone command', async () => {
      exec.mockResolvedValueOnce({ stdout: 'git version 2.40.0' });
      exec.mockResolvedValueOnce({ stdout: '' });

      await cloneRepository({
        branch: 'feature',
        depth: 3,
        repoUrl: 'https://github.com/test/repo.git'
      });

      const cloneCall = exec.mock.calls[1][0];
      expect(cloneCall).toContain('git clone');
      expect(cloneCall).toContain('--depth 3');
      expect(cloneCall).toContain('--branch feature');
      expect(cloneCall).toContain('https://github.com/test/repo.git');
    });

    it('should set timeout on clone command', async () => {
      exec.mockResolvedValueOnce({ stdout: 'git version 2.40.0' });
      exec.mockResolvedValueOnce({ stdout: '' });

      await cloneRepository();

      const cloneOptions = exec.mock.calls[1][1];
      expect(cloneOptions).toEqual({ timeout: 120000 });
    });
  });
});
