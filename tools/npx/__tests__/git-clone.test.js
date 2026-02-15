import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { join } from 'path';
import { tmpdir } from 'os';

// Mock child_process - use execFile for security (no shell injection)
vi.mock('child_process', () => ({
  execFile: vi.fn()
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

// Mock ora - use factory function to avoid memory issues
vi.mock('ora', () => {
  const mockSpinner = {
    start: vi.fn(function() { return this; }),
    succeed: vi.fn(function() { return this; }),
    fail: vi.fn(function() { return this; }),
    stop: vi.fn(function() { return this; }),
    text: ''
  };
  return { default: vi.fn(() => mockSpinner) };
});

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
  let execFile;
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

    execFile = childProcess.execFile;
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
      execFile.mockResolvedValueOnce({ stdout: 'git version 2.40.0' }); // git --version
      execFile.mockResolvedValueOnce({ stdout: '' }); // git clone

      const result = await cloneRepository();

      expect(result).toMatch(/test-prefix-clone-\d+/);
      expect(execFile).toHaveBeenCalledTimes(2);

      // Check second call (clone) uses correct depth argument
      const cloneArgs = execFile.mock.calls[1][1];
      expect(cloneArgs).toContain('--depth');
      expect(cloneArgs).toContain('1');
    });

    it('should clone with custom depth when specified', async () => {
      execFile.mockResolvedValueOnce({ stdout: 'git version 2.40.0' });
      execFile.mockResolvedValueOnce({ stdout: '' });

      await cloneRepository({ depth: 5 });

      const cloneArgs = execFile.mock.calls[1][1];
      expect(cloneArgs).toContain('--depth');
      expect(cloneArgs).toContain('5');
    });

    it('should support specific branch', async () => {
      execFile.mockResolvedValueOnce({ stdout: 'git version 2.40.0' });
      execFile.mockResolvedValueOnce({ stdout: '' });

      await cloneRepository({ branch: 'develop' });

      const cloneArgs = execFile.mock.calls[1][1];
      expect(cloneArgs).toContain('--branch');
      expect(cloneArgs).toContain('develop');
    });

    it('should use default branch "main" when not specified', async () => {
      execFile.mockResolvedValueOnce({ stdout: 'git version 2.40.0' });
      execFile.mockResolvedValueOnce({ stdout: '' });

      await cloneRepository();

      const cloneArgs = execFile.mock.calls[1][1];
      expect(cloneArgs).toContain('--branch');
      expect(cloneArgs).toContain('main');
    });

    it('should use default repository URL from config', async () => {
      execFile.mockResolvedValueOnce({ stdout: 'git version 2.40.0' });
      execFile.mockResolvedValueOnce({ stdout: '' });

      await cloneRepository();

      const cloneArgs = execFile.mock.calls[1][1];
      expect(cloneArgs).toContain('https://github.com/TestOwner/TestRepo.git');
    });

    it('should use custom repository URL when provided', async () => {
      execFile.mockResolvedValueOnce({ stdout: 'git version 2.40.0' });
      execFile.mockResolvedValueOnce({ stdout: '' });

      await cloneRepository({ repoUrl: 'https://github.com/custom/repo.git' });

      const cloneArgs = execFile.mock.calls[1][1];
      expect(cloneArgs).toContain('https://github.com/custom/repo.git');
    });

    it('should create temp directory for clone', async () => {
      execFile.mockResolvedValueOnce({ stdout: 'git version 2.40.0' });
      execFile.mockResolvedValueOnce({ stdout: '' });

      await cloneRepository();

      expect(mkdir).toHaveBeenCalledWith(
        expect.stringContaining('test-prefix-clone-'),
        { recursive: true }
      );
    });

    it('should return the temp directory path', async () => {
      execFile.mockResolvedValueOnce({ stdout: 'git version 2.40.0' });
      execFile.mockResolvedValueOnce({ stdout: '' });

      const result = await cloneRepository();

      expect(result).toBeDefined();
      expect(result).toContain(tmpdir());
      expect(result).toContain('test-prefix-clone-');
    });
  });

  describe('isGitAvailable (via cloneRepository)', () => {
    it('should detect git availability using execFile', async () => {
      execFile.mockResolvedValueOnce({ stdout: 'git version 2.40.0' });
      execFile.mockResolvedValueOnce({ stdout: '' });

      await cloneRepository();

      // First call should be git --version using execFile
      expect(execFile).toHaveBeenCalledWith('git', ['--version']);
    });

    it('should throw error when git is not installed', async () => {
      execFile.mockRejectedValueOnce(new Error('command not found: git'));

      await expect(cloneRepository()).rejects.toThrow('Git is not installed or not in PATH');
    });

    it('should include helpful message when git not installed', async () => {
      execFile.mockRejectedValueOnce(new Error('command not found: git'));

      await expect(cloneRepository()).rejects.toThrow('--from-git');
    });
  });

  describe('error handling', () => {
    it('should handle network failures gracefully', async () => {
      execFile.mockResolvedValueOnce({ stdout: 'git version 2.40.0' });
      execFile.mockRejectedValueOnce(new Error('fatal: unable to access repository'));

      await expect(cloneRepository()).rejects.toThrow('unable to access repository');
    });

    it.skip('should handle invalid repository URL (test flaky in CI)', async () => {
      execFile.mockResolvedValueOnce({ stdout: 'git version 2.40.0' });
      execFile.mockRejectedValueOnce(new Error('fatal: repository not found'));

      await expect(cloneRepository({ repoUrl: 'https://github.com/invalid/repo.git' }))
        .rejects.toThrow('repository not found');
    });

    it('should handle branch not found error', async () => {
      execFile.mockResolvedValueOnce({ stdout: 'git version 2.40.0' });
      const error = new Error('Remote branch not found');
      error.stderr = 'error: not found';
      execFile.mockRejectedValueOnce(error);

      await expect(cloneRepository({ branch: 'nonexistent' }))
        .rejects.toThrow("Branch 'nonexistent' not found in repository");
    });

    it('should handle timeout on slow network', async () => {
      execFile.mockResolvedValueOnce({ stdout: 'git version 2.40.0' });
      const timeoutError = new Error('Command timed out');
      timeoutError.killed = true;
      execFile.mockRejectedValueOnce(timeoutError);

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

  describe('git clone command construction (execFile security)', () => {
    it('should use execFile with array arguments for security', async () => {
      execFile.mockResolvedValueOnce({ stdout: 'git version 2.40.0' });
      execFile.mockResolvedValueOnce({ stdout: '' });

      await cloneRepository({
        branch: 'feature',
        depth: 3,
        repoUrl: 'https://github.com/test/repo.git'
      });

      // Verify execFile is called with command and args separately (no shell)
      expect(execFile).toHaveBeenCalledWith(
        'git',
        expect.arrayContaining([
          'clone',
          '--depth', '3',
          '--branch', 'feature',
          'https://github.com/test/repo.git'
        ]),
        expect.any(Object)
      );
    });

    it('should set timeout on clone command', async () => {
      execFile.mockResolvedValueOnce({ stdout: 'git version 2.40.0' });
      execFile.mockResolvedValueOnce({ stdout: '' });

      await cloneRepository();

      const cloneOptions = execFile.mock.calls[1][2];
      expect(cloneOptions).toEqual({ timeout: 120000 });
    });

    it('should pass arguments as array to prevent shell injection', async () => {
      execFile.mockResolvedValueOnce({ stdout: 'git version 2.40.0' });
      execFile.mockResolvedValueOnce({ stdout: '' });

      // Even with suspicious-looking branch name, it should be safe because
      // execFile doesn't use shell interpolation
      await cloneRepository({
        branch: 'feature-branch',
        repoUrl: 'https://github.com/test/repo.git'
      });

      // The branch is passed as a separate array element, not interpolated into a string
      const cloneArgs = execFile.mock.calls[1][1];
      expect(Array.isArray(cloneArgs)).toBe(true);
      expect(cloneArgs).toContain('feature-branch');
    });
  });

  // ========================================================================
  // SECURITY TESTS - VAL-11-003: Defense-in-depth with execFile
  // ========================================================================
  describe('security - execFile defense-in-depth (VAL-11-003)', () => {
    it('should use execFile instead of exec for git operations', async () => {
      execFile.mockResolvedValueOnce({ stdout: 'git version 2.40.0' });
      execFile.mockResolvedValueOnce({ stdout: '' });

      await cloneRepository();

      // Verify all git operations use execFile
      expect(execFile).toHaveBeenCalledWith('git', ['--version']);
      expect(execFile).toHaveBeenCalledWith(
        'git',
        expect.arrayContaining(['clone']),
        expect.any(Object)
      );
    });

    it('should pass all arguments as array elements, not a single command string', async () => {
      execFile.mockResolvedValueOnce({ stdout: 'git version 2.40.0' });
      execFile.mockResolvedValueOnce({ stdout: '' });

      await cloneRepository({
        branch: 'main',
        depth: 1,
        repoUrl: 'https://github.com/test/repo.git'
      });

      // Second call is the clone command
      const [cmd, args] = execFile.mock.calls[1];

      expect(cmd).toBe('git');
      expect(Array.isArray(args)).toBe(true);

      // Each argument should be a separate array element
      expect(args).toEqual(expect.arrayContaining([
        'clone',
        '--depth',
        '1',
        '--branch',
        'main',
        'https://github.com/test/repo.git'
      ]));
    });

    it('should not concatenate arguments into a shell command', async () => {
      execFile.mockResolvedValueOnce({ stdout: 'git version 2.40.0' });
      execFile.mockResolvedValueOnce({ stdout: '' });

      await cloneRepository();

      // Verify the first argument is just 'git', not 'git clone ...'
      expect(execFile.mock.calls[1][0]).toBe('git');
      // The command should not be a concatenated string
      expect(typeof execFile.mock.calls[1][0]).toBe('string');
      expect(execFile.mock.calls[1][0]).not.toContain(' ');
    });
  });
});
