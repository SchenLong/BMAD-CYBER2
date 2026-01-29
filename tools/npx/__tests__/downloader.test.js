import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { tmpdir } from 'os';
import { join } from 'path';
import { rm, readdir, mkdir, writeFile } from 'fs/promises';

// Mock modules before imports
vi.mock('ora', () => ({
  default: () => ({
    start: vi.fn().mockReturnThis(),
    succeed: vi.fn().mockReturnThis(),
    fail: vi.fn().mockReturnThis(),
    stop: vi.fn().mockReturnThis(),
  }),
}));

vi.mock('../lib/logger.js', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

// Store original fetch
const originalFetch = global.fetch;

describe('downloader', () => {
  const TEMP_DIR = join(tmpdir(), 'bmad-cyber-install');

  // Mock release data
  const mockRelease = {
    tag_name: 'v2.0.0',
    tarball_url: 'https://api.github.com/repos/SchenLong/BMAD-CYBERSEC/tarball/v2.0.0',
    assets: [
      {
        name: 'bmad-cyber-v2.0.0.tar.gz',
        browser_download_url: 'https://github.com/SchenLong/BMAD-CYBERSEC/releases/download/v2.0.0/bmad-cyber-v2.0.0.tar.gz',
        size: 1024,
      },
      {
        name: 'bmad-cyber-v2.0.0.tar.gz.sha256',
        browser_download_url: 'https://github.com/SchenLong/BMAD-CYBERSEC/releases/download/v2.0.0/bmad-cyber-v2.0.0.tar.gz.sha256',
      },
    ],
  };

  // Helper to create a mock readable stream
  const createMockReadableStream = (content = 'mock-tarball-content') => {
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    let read = false;
    return new ReadableStream({
      pull(controller) {
        if (!read) {
          controller.enqueue(data);
          read = true;
        } else {
          controller.close();
        }
      },
    });
  };

  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();

    // Clean up temp directory before each test
    try {
      await rm(TEMP_DIR, { recursive: true, force: true });
    } catch {
      // Ignore if doesn't exist
    }

    // Reset environment variables
    delete process.env.GITHUB_TOKEN;
  });

  afterEach(async () => {
    // Restore original fetch
    global.fetch = originalFetch;

    // Clean up temp directory after each test
    try {
      await rm(TEMP_DIR, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('fetchReleaseInfo', () => {
    it('fetches latest release by default', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockRelease),
      });

      const { downloadRelease } = await import('../lib/downloader.js');

      // Mock the tarball download and checksum
      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          body: createMockReadableStream(),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          text: () => Promise.resolve('abc123 bmad-cyber-v2.0.0.tar.gz'),
        });

      // This will fail checksum but we're testing fetchReleaseInfo
      try {
        await downloadRelease();
      } catch {
        // Expected to fail on checksum
      }

      // Verify fetch was called with correct URL for latest release
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.github.com/repos/SchenLong/BMAD-CYBERSEC/releases/latest',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'bmad-cyber-installer',
          }),
        })
      );
    });

    it('fetches specific version when provided', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockRelease),
      });

      const { downloadRelease } = await import('../lib/downloader.js');

      // Mock subsequent calls
      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          body: createMockReadableStream(),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          text: () => Promise.resolve('abc123 bmad-cyber-v2.0.0.tar.gz'),
        });

      try {
        await downloadRelease({ version: 'v1.5.0' });
      } catch {
        // Expected to fail on checksum
      }

      // Verify fetch was called with correct URL for specific version
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.github.com/repos/SchenLong/BMAD-CYBERSEC/releases/tags/v1.5.0',
        expect.any(Object)
      );
    });

    it('handles 404 for non-existent version', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const { downloadRelease } = await import('../lib/downloader.js');

      await expect(downloadRelease({ version: 'v99.99.99' }))
        .rejects.toThrow('Release v99.99.99 not found');
    });

    it('handles rate limit error (403)', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 403,
      });

      const { downloadRelease } = await import('../lib/downloader.js');

      await expect(downloadRelease())
        .rejects.toThrow('GitHub API rate limit exceeded');
    });

    it('handles generic API errors', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const { downloadRelease } = await import('../lib/downloader.js');

      await expect(downloadRelease())
        .rejects.toThrow('GitHub API error: 500');
    });

    it('uses GITHUB_TOKEN when available', async () => {
      process.env.GITHUB_TOKEN = 'test-token-12345';

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockRelease),
      });

      const { downloadRelease } = await import('../lib/downloader.js');

      // Mock subsequent calls
      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          body: createMockReadableStream(),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          text: () => Promise.resolve('abc123 bmad-cyber-v2.0.0.tar.gz'),
        });

      try {
        await downloadRelease();
      } catch {
        // Expected to fail on checksum
      }

      // Verify Authorization header was included
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'token test-token-12345',
          }),
        })
      );
    });
  });

  describe('downloadTarball', () => {
    it('downloads tarball with progress', async () => {
      const tarballContent = 'mock-tarball-binary-content';

      global.fetch = vi.fn()
        // Release info
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockRelease),
        })
        // Tarball download
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          body: createMockReadableStream(tarballContent),
        })
        // Checksum file
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          text: () => Promise.resolve('abc123 bmad-cyber-v2.0.0.tar.gz'),
        });

      const { downloadRelease } = await import('../lib/downloader.js');

      // Will fail on checksum verification but download should complete
      try {
        await downloadRelease();
      } catch (error) {
        expect(error.message).toContain('Checksum verification failed');
      }

      // Verify tarball download was attempted
      expect(global.fetch).toHaveBeenCalledWith(
        'https://github.com/SchenLong/BMAD-CYBERSEC/releases/download/v2.0.0/bmad-cyber-v2.0.0.tar.gz',
        expect.any(Object)
      );
    });

    it('verifies SHA256 checksum correctly', async () => {
      // Create content with known hash
      const tarballContent = 'test-content-for-checksum';
      const crypto = await import('crypto');
      const expectedHash = crypto.createHash('sha256').update(tarballContent).digest('hex');

      global.fetch = vi.fn()
        // Release info
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockRelease),
        })
        // Tarball download
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          body: createMockReadableStream(tarballContent),
        })
        // Checksum file with correct hash
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          text: () => Promise.resolve(`${expectedHash}  bmad-cyber-v2.0.0.tar.gz`),
        });

      const { downloadRelease } = await import('../lib/downloader.js');

      const result = await downloadRelease();

      expect(result).toBeDefined();
      expect(result).toContain('bmad-cyber-v2.0.0.tar.gz');
    });

    it('fails on checksum mismatch', async () => {
      const tarballContent = 'corrupted-or-modified-content';
      const wrongHash = 'deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef';

      global.fetch = vi.fn()
        // Release info
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockRelease),
        })
        // Tarball download
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          body: createMockReadableStream(tarballContent),
        })
        // Checksum file with wrong hash
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          text: () => Promise.resolve(`${wrongHash}  bmad-cyber-v2.0.0.tar.gz`),
        });

      const { downloadRelease } = await import('../lib/downloader.js');

      await expect(downloadRelease())
        .rejects.toThrow('Checksum verification failed');
    });

    it('falls back to source tarball when no release assets found', async () => {
      const releaseWithNoAssets = {
        tag_name: 'v2.0.0',
        tarball_url: 'https://api.github.com/repos/SchenLong/BMAD-CYBERSEC/tarball/v2.0.0',
        assets: [],
      };

      global.fetch = vi.fn()
        // Release info
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve(releaseWithNoAssets),
        })
        // Source tarball download
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          body: createMockReadableStream('source-tarball-content'),
        });

      const { downloadRelease } = await import('../lib/downloader.js');

      const result = await downloadRelease();

      expect(result).toBeDefined();
      expect(result).toContain('v2.0.0.tar.gz');

      // Verify source tarball URL was used
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.github.com/repos/SchenLong/BMAD-CYBERSEC/tarball/v2.0.0',
        expect.any(Object)
      );
    });

    it('handles download failure', async () => {
      global.fetch = vi.fn()
        // Release info
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockRelease),
        })
        // Tarball download fails
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
        });

      const { downloadRelease } = await import('../lib/downloader.js');

      await expect(downloadRelease())
        .rejects.toThrow('Download failed: 500');
    });
  });

  describe('cleanup', () => {
    it('cleans up temp files on success', async () => {
      const tarballContent = 'test-content';
      const crypto = await import('crypto');
      const expectedHash = crypto.createHash('sha256').update(tarballContent).digest('hex');

      global.fetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockRelease),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          body: createMockReadableStream(tarballContent),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          text: () => Promise.resolve(`${expectedHash}  bmad-cyber-v2.0.0.tar.gz`),
        });

      const { downloadRelease, cleanup } = await import('../lib/downloader.js');

      // Download successfully
      const filePath = await downloadRelease();
      expect(filePath).toBeDefined();

      // Verify temp directory exists
      const tempDir = join(tmpdir(), 'bmad-cyber-install');
      let files = await readdir(tempDir);
      expect(files.length).toBeGreaterThan(0);

      // Clean up
      await cleanup();

      // Verify temp directory is removed
      await expect(readdir(tempDir)).rejects.toThrow();
    });

    it('cleans up temp files on failure', async () => {
      // Create temp directory with some files
      const tempDir = join(tmpdir(), 'bmad-cyber-install');
      await mkdir(tempDir, { recursive: true });
      await writeFile(join(tempDir, 'test-file.txt'), 'test content');

      const { cleanup } = await import('../lib/downloader.js');

      // Verify file exists
      let files = await readdir(tempDir);
      expect(files).toContain('test-file.txt');

      // Clean up
      await cleanup();

      // Verify temp directory is removed
      await expect(readdir(tempDir)).rejects.toThrow();
    });

    it('does not throw on cleanup when no temp files exist', async () => {
      // Ensure temp dir does not exist
      const tempDir = join(tmpdir(), 'bmad-cyber-install');
      try {
        await rm(tempDir, { recursive: true, force: true });
      } catch {
        // Ignore
      }

      const { cleanup } = await import('../lib/downloader.js');

      // Should not throw
      await expect(cleanup()).resolves.not.toThrow();
    });
  });

  describe('edge cases', () => {
    it('handles release without checksum file', async () => {
      const releaseWithoutChecksum = {
        tag_name: 'v2.0.0',
        tarball_url: 'https://api.github.com/repos/SchenLong/BMAD-CYBERSEC/tarball/v2.0.0',
        assets: [
          {
            name: 'bmad-cyber-v2.0.0.tar.gz',
            browser_download_url: 'https://github.com/SchenLong/BMAD-CYBERSEC/releases/download/v2.0.0/bmad-cyber-v2.0.0.tar.gz',
            size: 1024,
          },
          // No .sha256 file
        ],
      };

      global.fetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve(releaseWithoutChecksum),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          body: createMockReadableStream('tarball-content'),
        });

      const { downloadRelease } = await import('../lib/downloader.js');
      const { logger } = await import('../lib/logger.js');

      const result = await downloadRelease();

      expect(result).toBeDefined();
      // Should warn about missing checksum
      expect(logger.warn).toHaveBeenCalledWith(expect.stringMatching(/No checksum file found/));
    });

    it('handles empty release assets array', async () => {
      const emptyRelease = {
        tag_name: 'v2.0.0',
        tarball_url: 'https://api.github.com/repos/SchenLong/BMAD-CYBERSEC/tarball/v2.0.0',
        assets: [],
      };

      global.fetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve(emptyRelease),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          body: createMockReadableStream('source-tarball'),
        });

      const { downloadRelease } = await import('../lib/downloader.js');
      const { logger } = await import('../lib/logger.js');

      const result = await downloadRelease();

      expect(result).toBeDefined();
      expect(logger.info).toHaveBeenCalledWith(expect.stringMatching(/No release tarball found/));
    });
  });
});
