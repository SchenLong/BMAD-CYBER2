/**
 * ATOMIC OPERATIONS - Race Condition Prevention (Story 107 - VAL-10-002)
 * Implements file locking and atomic operations to prevent TOCTOU vulnerabilities
 *
 * Fixes:
 * - GH-107-001: Concurrent installation race condition
 * - GH-107-003: Mid-installation privilege escalation
 * - BA-107-001: TOCTOU in state transitions
 * - SE-107-001: NIST atomic state transitions
 *
 * @author BlackUnicorn.Tech
 * @version 1.0.0
 * @classification SECURITY-CRITICAL
 */

const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');
const os = require('os');
const { EventEmitter } = require('events');

/**
 * Lock types
 */
const LOCK_TYPES = {
  SHARED: 'shared',         // Multiple readers allowed
  EXCLUSIVE: 'exclusive'    // Single writer only
};

/**
 * Lock status
 */
const LOCK_STATUS = {
  ACQUIRED: 'acquired',
  WAITING: 'waiting',
  RELEASED: 'released',
  TIMEOUT: 'timeout',
  ERROR: 'error'
};

class AtomicOperations extends EventEmitter {
  constructor(config = {}) {
    super();

    this.config = this._mergeConfig(config);
    this.activeLocks = new Map();
    this.lockQueue = new Map();
    this.isInitialized = false;
  }

  /**
   * Initialize the atomic operations manager
   */
  async initialize(options = {}) {
    console.log('🔒 Initializing Atomic Operations Manager...');

    // Ensure lock directory exists
    await fs.ensureDir(this.config.lockDir);

    // Clean stale locks
    if (this.config.cleanStaleLocks) {
      await this._cleanStaleLocks();
    }

    this.isInitialized = true;
    console.log('✅ Atomic Operations Manager initialized');

    this.emit('initialized', {
      lockDir: this.config.lockDir,
      defaultTimeout: this.config.defaultTimeout
    });

    return true;
  }

  /**
   * Acquire a file lock
   * @param {string} resourceId - Unique identifier for the resource
   * @param {object} options - Lock options
   * @returns {object} Lock handle
   */
  async acquireLock(resourceId, options = {}) {
    const lockType = options.type || LOCK_TYPES.EXCLUSIVE;
    const timeout = options.timeout || this.config.defaultTimeout;
    const lockId = this._generateLockId(resourceId);
    const lockPath = this._getLockPath(resourceId);

    console.log(`🔒 Acquiring ${lockType} lock: ${resourceId}`);

    const startTime = Date.now();
    let attempts = 0;

    while (Date.now() - startTime < timeout) {
      attempts++;

      try {
        // Try to create lock file atomically
        const lockData = {
          lockId,
          resourceId,
          type: lockType,
          pid: process.pid,
          hostname: os.hostname(),
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + this.config.lockExpiry).toISOString()
        };

        // Use exclusive flag for atomic creation
        const fd = await fs.open(lockPath, 'wx');
        await fs.write(fd, JSON.stringify(lockData, null, 2));
        await fs.close(fd);

        // Lock acquired
        const lockHandle = {
          lockId,
          resourceId,
          type: lockType,
          path: lockPath,
          acquiredAt: Date.now(),
          release: () => this.releaseLock(lockId)
        };

        this.activeLocks.set(lockId, lockHandle);

        console.log(`✅ Lock acquired: ${resourceId} (attempts: ${attempts})`);

        this.emit('lock-acquired', {
          lockId,
          resourceId,
          type: lockType,
          attempts
        });

        return lockHandle;

      } catch (error) {
        if (error.code === 'EEXIST') {
          // Lock file exists - check if stale
          const existing = await this._checkExistingLock(lockPath);

          if (existing.stale) {
            // Remove stale lock and retry
            await fs.remove(lockPath);
            continue;
          }

          // Lock is held by another process
          if (lockType === LOCK_TYPES.SHARED && existing.type === LOCK_TYPES.SHARED) {
            // Shared locks can coexist - add to shared lock list
            return this._addSharedLock(resourceId, lockId, existing);
          }

          // Wait and retry
          await this._sleep(this.config.retryInterval);

        } else {
          throw error;
        }
      }
    }

    // Timeout
    console.error(`❌ Lock timeout: ${resourceId} (${timeout}ms)`);

    this.emit('lock-timeout', {
      resourceId,
      timeout,
      attempts
    });

    throw new Error(`Lock acquisition timeout: ${resourceId}`);
  }

  /**
   * Release a lock
   */
  async releaseLock(lockId) {
    const lockHandle = this.activeLocks.get(lockId);

    if (!lockHandle) {
      console.warn(`⚠️ Lock not found: ${lockId}`);
      return false;
    }

    try {
      await fs.remove(lockHandle.path);
      this.activeLocks.delete(lockId);

      console.log(`🔓 Lock released: ${lockHandle.resourceId}`);

      this.emit('lock-released', {
        lockId,
        resourceId: lockHandle.resourceId,
        heldFor: Date.now() - lockHandle.acquiredAt
      });

      return true;

    } catch (error) {
      console.error(`❌ Failed to release lock: ${lockId}`, error);
      return false;
    }
  }

  /**
   * Execute operation with automatic lock management
   * @param {string} resourceId - Resource to lock
   * @param {Function} operation - Async operation to execute
   * @param {object} options - Lock options
   */
  async withLock(resourceId, operation, options = {}) {
    const lock = await this.acquireLock(resourceId, options);

    try {
      const result = await operation();
      return result;
    } finally {
      await this.releaseLock(lock.lockId);
    }
  }

  /**
   * Atomic file write with temp file and rename
   * @param {string} filePath - Target file path
   * @param {string|Buffer} content - Content to write
   * @param {object} options - Write options
   */
  async atomicWrite(filePath, content, options = {}) {
    const lockId = `write:${filePath}`;

    return this.withLock(lockId, async () => {
      // Validate path is safe
      this._validatePath(filePath);

      // Create temp file in same directory (for atomic rename)
      const tempPath = `${filePath}.${crypto.randomBytes(8).toString('hex')}.tmp`;

      try {
        // Write to temp file
        await fs.writeFile(tempPath, content, options);

        // Verify write was successful
        const stat = await fs.stat(tempPath);
        if (stat.size === 0 && content.length > 0) {
          throw new Error('Write verification failed: empty file');
        }

        // Atomic rename
        await fs.rename(tempPath, filePath);

        console.log(`✅ Atomic write completed: ${path.basename(filePath)}`);

        return {
          success: true,
          path: filePath,
          size: stat.size
        };

      } catch (error) {
        // Clean up temp file on error
        try {
          await fs.remove(tempPath);
        } catch {}

        throw error;
      }
    });
  }

  /**
   * Atomic JSON write
   */
  async atomicWriteJson(filePath, data, options = {}) {
    const content = JSON.stringify(data, null, options.spaces || 2);
    return this.atomicWrite(filePath, content, options);
  }

  /**
   * Atomic file copy
   */
  async atomicCopy(srcPath, destPath, options = {}) {
    const lockId = `copy:${destPath}`;

    return this.withLock(lockId, async () => {
      this._validatePath(srcPath);
      this._validatePath(destPath);

      // Verify source exists and is readable
      await fs.access(srcPath, fs.constants.R_OK);

      const tempPath = `${destPath}.${crypto.randomBytes(8).toString('hex')}.tmp`;

      try {
        // Copy to temp
        await fs.copy(srcPath, tempPath, options);

        // Verify copy
        const srcStat = await fs.stat(srcPath);
        const tempStat = await fs.stat(tempPath);

        if (srcStat.size !== tempStat.size) {
          throw new Error('Copy verification failed: size mismatch');
        }

        // Atomic rename
        await fs.rename(tempPath, destPath);

        return {
          success: true,
          src: srcPath,
          dest: destPath,
          size: srcStat.size
        };

      } catch (error) {
        try {
          await fs.remove(tempPath);
        } catch {}
        throw error;
      }
    });
  }

  /**
   * Safe directory creation with proper permissions
   */
  async safeCreateDir(dirPath, options = {}) {
    this._validatePath(dirPath);

    const mode = options.mode || 0o755;
    const lockId = `mkdir:${dirPath}`;

    return this.withLock(lockId, async () => {
      // Check if already exists
      const exists = await fs.pathExists(dirPath);
      if (exists) {
        const stat = await fs.stat(dirPath);
        if (!stat.isDirectory()) {
          throw new Error(`Path exists but is not a directory: ${dirPath}`);
        }
        return { success: true, created: false, path: dirPath };
      }

      // Create with proper permissions
      await fs.mkdir(dirPath, { recursive: true, mode });

      // Verify creation
      const stat = await fs.stat(dirPath);
      if (!stat.isDirectory()) {
        throw new Error('Directory creation verification failed');
      }

      return { success: true, created: true, path: dirPath };
    });
  }

  /**
   * Check-then-act with lock (prevents TOCTOU)
   */
  async checkAndAct(resourceId, checkFn, actFn, options = {}) {
    return this.withLock(resourceId, async () => {
      const checkResult = await checkFn();

      if (checkResult.proceed) {
        return await actFn(checkResult);
      }

      return {
        success: false,
        reason: 'check-failed',
        checkResult
      };
    }, options);
  }

  /**
   * Transactional file operations with rollback
   */
  async transaction(operations) {
    const executed = [];
    const rollbacks = [];

    try {
      for (const op of operations) {
        const result = await this._executeOperation(op);
        executed.push({ op, result });

        if (op.rollback) {
          rollbacks.unshift(op.rollback);
        }
      }

      return {
        success: true,
        results: executed
      };

    } catch (error) {
      console.error('Transaction failed, rolling back...');

      // Execute rollbacks in reverse order
      for (const rollback of rollbacks) {
        try {
          await rollback();
        } catch (rollbackError) {
          console.error('Rollback error:', rollbackError.message);
        }
      }

      return {
        success: false,
        error: error.message,
        executedCount: executed.length,
        rolledBack: true
      };
    }
  }

  /**
   * Get lock status
   */
  getLockStatus(resourceId) {
    const lockPath = this._getLockPath(resourceId);

    for (const [lockId, handle] of this.activeLocks) {
      if (handle.resourceId === resourceId) {
        return {
          locked: true,
          lockId,
          type: handle.type,
          heldSince: handle.acquiredAt
        };
      }
    }

    return { locked: false };
  }

  /**
   * Force release all locks (cleanup)
   */
  async releaseAllLocks() {
    const released = [];

    for (const [lockId, handle] of this.activeLocks) {
      try {
        await this.releaseLock(lockId);
        released.push(lockId);
      } catch (error) {
        console.error(`Failed to release lock ${lockId}:`, error.message);
      }
    }

    return released;
  }

  // Private methods

  _mergeConfig(userConfig) {
    return {
      lockDir: path.join(os.tmpdir(), 'bmad-locks'),
      defaultTimeout: 30000,      // 30 seconds
      lockExpiry: 60000,          // 1 minute
      retryInterval: 100,         // 100ms between retries
      cleanStaleLocks: true,
      staleThreshold: 300000,     // 5 minutes
      ...userConfig
    };
  }

  _generateLockId(resourceId) {
    return `${resourceId}-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
  }

  _getLockPath(resourceId) {
    const safeId = resourceId.replace(/[^a-zA-Z0-9-_]/g, '_');
    return path.join(this.config.lockDir, `${safeId}.lock`);
  }

  async _checkExistingLock(lockPath) {
    try {
      const content = await fs.readFile(lockPath, 'utf8');
      const lockData = JSON.parse(content);

      // Check if expired
      const expiry = new Date(lockData.expiresAt).getTime();
      if (Date.now() > expiry) {
        return { stale: true, reason: 'expired' };
      }

      // Check if process is still running
      if (lockData.pid && !this._isProcessRunning(lockData.pid)) {
        return { stale: true, reason: 'process-dead' };
      }

      return {
        stale: false,
        type: lockData.type,
        pid: lockData.pid,
        createdAt: lockData.createdAt
      };

    } catch (error) {
      // Can't read lock file - consider stale
      return { stale: true, reason: 'unreadable' };
    }
  }

  _isProcessRunning(pid) {
    try {
      process.kill(pid, 0);
      return true;
    } catch {
      return false;
    }
  }

  async _cleanStaleLocks() {
    try {
      const files = await fs.readdir(this.config.lockDir);
      let cleaned = 0;

      for (const file of files) {
        if (!file.endsWith('.lock')) continue;

        const lockPath = path.join(this.config.lockDir, file);
        const check = await this._checkExistingLock(lockPath);

        if (check.stale) {
          await fs.remove(lockPath);
          cleaned++;
        }
      }

      if (cleaned > 0) {
        console.log(`🧹 Cleaned ${cleaned} stale locks`);
      }

    } catch (error) {
      console.warn('Could not clean stale locks:', error.message);
    }
  }

  async _addSharedLock(resourceId, lockId, existing) {
    // For shared locks, we track multiple holders
    // This is a simplified implementation
    return {
      lockId,
      resourceId,
      type: LOCK_TYPES.SHARED,
      sharedWith: existing.pid,
      acquiredAt: Date.now(),
      release: () => Promise.resolve(true) // Shared locks release differently
    };
  }

  _validatePath(filePath) {
    const resolved = path.resolve(filePath);

    // Check for path traversal
    if (filePath.includes('..')) {
      throw new Error('Path traversal not allowed');
    }

    // Check for null bytes
    if (filePath.includes('\0')) {
      throw new Error('Null bytes in path not allowed');
    }

    // Check for symbolic link attacks (would need async check)
    // For now, just basic validation

    return resolved;
  }

  async _executeOperation(op) {
    switch (op.type) {
      case 'write':
        return this.atomicWrite(op.path, op.content, op.options);

      case 'copy':
        return this.atomicCopy(op.src, op.dest, op.options);

      case 'mkdir':
        return this.safeCreateDir(op.path, op.options);

      case 'remove':
        await fs.remove(op.path);
        return { success: true, path: op.path };

      case 'custom':
        return await op.execute();

      default:
        throw new Error(`Unknown operation type: ${op.type}`);
    }
  }

  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export constants
AtomicOperations.LOCK_TYPES = LOCK_TYPES;
AtomicOperations.LOCK_STATUS = LOCK_STATUS;

module.exports = AtomicOperations;
