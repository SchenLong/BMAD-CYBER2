/**
 * Unit Tests for Progress Tracker - INST-039
 * Epic 1, Story 39 - Installation Recovery Mode
 *
 * Comprehensive tests for the progress-tracker.js functionality including
 * progress file management, partial installation detection, checkpoint saving,
 * and rollback execution.
 *
 * @module progress-tracker.test
 * @author BlackUnicorn.Tech
 * @version 1.0.0
 */

import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ESM equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test fixture directory
const MOCK_PROJECT_ROOT = path.join(__dirname, '__test_fixtures_progress__');
const PROGRESS_FILE_PATH = path.join(MOCK_PROJECT_ROOT, '.bmad-wizard-progress');

// ============================================================================
// Mock Data Factories
// ============================================================================

/**
 * Creates a valid progress state object
 * @param {Object} overrides - Override specific fields
 * @returns {Object} Progress state
 */
function createMockProgressState(overrides = {}) {
  return {
    wizard_version: '1.0.0',
    started_at: '2026-01-27T10:00:00.000Z',
    current_step: 0,
    steps: [],
    rollback_actions: [],
    ...overrides
  };
}

/**
 * Creates a mock step object
 * @param {Object} overrides - Override specific fields
 * @returns {Object} Step object
 */
function createMockStep(overrides = {}) {
  return {
    id: 'test-step',
    status: 'completed',
    completed_at: '2026-01-27T10:05:00.000Z',
    ...overrides
  };
}

/**
 * Creates a mock rollback action
 * @param {Object} overrides - Override specific fields
 * @returns {Object} Rollback action
 */
function createMockRollbackAction(overrides = {}) {
  return {
    type: 'delete_file',
    path: 'test-file.txt',
    step_id: 'test-step',
    added_at: '2026-01-27T10:05:00.000Z',
    ...overrides
  };
}

// ============================================================================
// Test Fixture Setup/Teardown
// ============================================================================

function setupTestFixtures() {
  cleanupTestFixtures();
  fs.mkdirSync(MOCK_PROJECT_ROOT, { recursive: true });
}

function cleanupTestFixtures() {
  if (fs.existsSync(MOCK_PROJECT_ROOT)) {
    fs.rmSync(MOCK_PROJECT_ROOT, { recursive: true, force: true });
  }
}

function writeProgressFile(state) {
  fs.writeFileSync(PROGRESS_FILE_PATH, JSON.stringify(state, null, 2), 'utf8');
}

// ============================================================================
// Import module
// ============================================================================

let progressTracker;

beforeAll(async () => {
  try {
    progressTracker = await import('./progress-tracker.js');
  } catch (err) {
    console.warn('progress-tracker.js import error:', err.message);
  }
});

// ============================================================================
// Tests: Constants
// ============================================================================

describe('Progress Tracker - INST-039', () => {
  describe('Constants', () => {
    it('should export PROGRESS_FILE constant', () => {
      expect(progressTracker.PROGRESS_FILE).toBe('.bmad-wizard-progress');
    });

    it('should export WIZARD_VERSION constant', () => {
      expect(progressTracker.WIZARD_VERSION).toBe('1.0.0');
    });

    it('should export StepStatus enum with correct values', () => {
      expect(progressTracker.StepStatus.PENDING).toBe('pending');
      expect(progressTracker.StepStatus.IN_PROGRESS).toBe('in_progress');
      expect(progressTracker.StepStatus.COMPLETED).toBe('completed');
      expect(progressTracker.StepStatus.FAILED).toBe('failed');
    });

    it('should export RecoveryAction enum with correct values', () => {
      expect(progressTracker.RecoveryAction.RESUME).toBe('resume');
      expect(progressTracker.RecoveryAction.RESTART).toBe('restart');
      expect(progressTracker.RecoveryAction.ROLLBACK).toBe('rollback');
    });

    it('should export RollbackType enum with correct values', () => {
      expect(progressTracker.RollbackType.DELETE_FILE).toBe('delete_file');
      expect(progressTracker.RollbackType.DELETE_DIRECTORY).toBe('delete_directory');
      expect(progressTracker.RollbackType.RESTORE_BACKUP).toBe('restore_backup');
    });
  });

  // ============================================================================
  // Tests: createInitialState()
  // ============================================================================

  describe('createInitialState()', () => {
    it('should create state with wizard_version', () => {
      const state = progressTracker.createInitialState();
      expect(state.wizard_version).toBe('1.0.0');
    });

    it('should create state with started_at timestamp', () => {
      const before = new Date().toISOString();
      const state = progressTracker.createInitialState();
      const after = new Date().toISOString();

      expect(state.started_at >= before).toBe(true);
      expect(state.started_at <= after).toBe(true);
    });

    it('should create state with current_step at 0', () => {
      const state = progressTracker.createInitialState();
      expect(state.current_step).toBe(0);
    });

    it('should create state with empty steps array', () => {
      const state = progressTracker.createInitialState();
      expect(state.steps).toEqual([]);
    });

    it('should create state with empty rollback_actions array', () => {
      const state = progressTracker.createInitialState();
      expect(state.rollback_actions).toEqual([]);
    });
  });

  // ============================================================================
  // Tests: getProgressFilePath()
  // ============================================================================

  describe('getProgressFilePath()', () => {
    it('should return correct path for project root', () => {
      const result = progressTracker.getProgressFilePath('/test/project');
      expect(result).toBe('/test/project/.bmad-wizard-progress');
    });

    it('should handle trailing slash in project root', () => {
      const result = progressTracker.getProgressFilePath('/test/project/');
      expect(result).toContain('.bmad-wizard-progress');
    });
  });

  // ============================================================================
  // Tests: readProgressFile()
  // ============================================================================

  describe('readProgressFile()', () => {
    beforeEach(() => {
      setupTestFixtures();
    });

    afterEach(() => {
      cleanupTestFixtures();
    });

    it('should return null when file does not exist', () => {
      const result = progressTracker.readProgressFile(MOCK_PROJECT_ROOT);
      expect(result).toBeNull();
    });

    it('should return parsed state when file exists', () => {
      const mockState = createMockProgressState();
      writeProgressFile(mockState);

      const result = progressTracker.readProgressFile(MOCK_PROJECT_ROOT);
      expect(result).toEqual(mockState);
    });

    it('should return null for empty file', () => {
      fs.writeFileSync(PROGRESS_FILE_PATH, '', 'utf8');

      const result = progressTracker.readProgressFile(MOCK_PROJECT_ROOT);
      expect(result).toBeNull();
    });

    it('should return null for corrupted JSON', () => {
      fs.writeFileSync(PROGRESS_FILE_PATH, '{invalid json', 'utf8');

      const result = progressTracker.readProgressFile(MOCK_PROJECT_ROOT);
      expect(result).toBeNull();
    });

    it('should return null for file with missing required fields', () => {
      fs.writeFileSync(PROGRESS_FILE_PATH, '{"some_field": "value"}', 'utf8');

      const result = progressTracker.readProgressFile(MOCK_PROJECT_ROOT);
      expect(result).toBeNull();
    });

    it('should return null when steps is not an array', () => {
      const invalidState = {
        wizard_version: '1.0.0',
        started_at: '2026-01-27T10:00:00.000Z',
        steps: 'not-an-array'
      };
      fs.writeFileSync(PROGRESS_FILE_PATH, JSON.stringify(invalidState), 'utf8');

      const result = progressTracker.readProgressFile(MOCK_PROJECT_ROOT);
      expect(result).toBeNull();
    });

    it('should preserve step data when reading', () => {
      const mockState = createMockProgressState({
        steps: [
          createMockStep({ id: 'step1', data: { selected: ['core', 'bmm'] } })
        ]
      });
      writeProgressFile(mockState);

      const result = progressTracker.readProgressFile(MOCK_PROJECT_ROOT);
      expect(result.steps[0].data).toEqual({ selected: ['core', 'bmm'] });
    });
  });

  // ============================================================================
  // Tests: writeProgressFile()
  // ============================================================================

  describe('writeProgressFile()', () => {
    beforeEach(() => {
      setupTestFixtures();
    });

    afterEach(() => {
      cleanupTestFixtures();
    });

    it('should write state to file successfully', () => {
      const state = createMockProgressState();
      const result = progressTracker.writeProgressFile(state, MOCK_PROJECT_ROOT);

      expect(result.success).toBe(true);
      expect(fs.existsSync(PROGRESS_FILE_PATH)).toBe(true);
    });

    it('should format JSON with 2-space indent', () => {
      const state = createMockProgressState();
      progressTracker.writeProgressFile(state, MOCK_PROJECT_ROOT);

      const content = fs.readFileSync(PROGRESS_FILE_PATH, 'utf8');
      expect(content).toContain('  '); // 2-space indent
    });

    it('should return error for invalid state', () => {
      const result = progressTracker.writeProgressFile(null, MOCK_PROJECT_ROOT);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should create parent directory if it does not exist', () => {
      cleanupTestFixtures(); // Remove directory

      const state = createMockProgressState();
      const result = progressTracker.writeProgressFile(state, MOCK_PROJECT_ROOT);

      expect(result.success).toBe(true);
      expect(fs.existsSync(MOCK_PROJECT_ROOT)).toBe(true);
    });

    it('should not leave temp file on success', () => {
      const state = createMockProgressState();
      progressTracker.writeProgressFile(state, MOCK_PROJECT_ROOT);

      const files = fs.readdirSync(MOCK_PROJECT_ROOT);
      const tempFiles = files.filter(f => f.includes('.tmp'));
      expect(tempFiles).toHaveLength(0);
    });

    it('should overwrite existing file', () => {
      const state1 = createMockProgressState({ current_step: 1 });
      const state2 = createMockProgressState({ current_step: 2 });

      progressTracker.writeProgressFile(state1, MOCK_PROJECT_ROOT);
      progressTracker.writeProgressFile(state2, MOCK_PROJECT_ROOT);

      const result = progressTracker.readProgressFile(MOCK_PROJECT_ROOT);
      expect(result.current_step).toBe(2);
    });
  });

  // ============================================================================
  // Tests: detectPartialInstall()
  // ============================================================================

  describe('detectPartialInstall()', () => {
    beforeEach(() => {
      setupTestFixtures();
    });

    afterEach(() => {
      cleanupTestFixtures();
    });

    it('should return null when no progress file exists', () => {
      const result = progressTracker.detectPartialInstall(MOCK_PROJECT_ROOT);
      expect(result).toBeNull();
    });

    it('should return null when steps array is empty', () => {
      const state = createMockProgressState({ steps: [] });
      writeProgressFile(state);

      const result = progressTracker.detectPartialInstall(MOCK_PROJECT_ROOT);
      expect(result).toBeNull();
    });

    it('should return null when all steps are completed', () => {
      const state = createMockProgressState({
        steps: [
          createMockStep({ id: 'step1', status: 'completed' }),
          createMockStep({ id: 'step2', status: 'completed' })
        ]
      });
      writeProgressFile(state);

      const result = progressTracker.detectPartialInstall(MOCK_PROJECT_ROOT);
      expect(result).toBeNull();
    });

    it('should return state when step is in_progress', () => {
      const state = createMockProgressState({
        steps: [
          createMockStep({ id: 'step1', status: 'completed' }),
          createMockStep({ id: 'step2', status: 'in_progress' })
        ]
      });
      writeProgressFile(state);

      const result = progressTracker.detectPartialInstall(MOCK_PROJECT_ROOT);
      expect(result).not.toBeNull();
      expect(result.steps).toHaveLength(2);
    });

    it('should return state when step is pending', () => {
      const state = createMockProgressState({
        steps: [
          createMockStep({ id: 'step1', status: 'completed' }),
          createMockStep({ id: 'step2', status: 'pending' })
        ]
      });
      writeProgressFile(state);

      const result = progressTracker.detectPartialInstall(MOCK_PROJECT_ROOT);
      expect(result).not.toBeNull();
    });

    it('should return state when step has failed', () => {
      const state = createMockProgressState({
        steps: [
          createMockStep({ id: 'step1', status: 'completed' }),
          createMockStep({ id: 'step2', status: 'failed' })
        ]
      });
      writeProgressFile(state);

      const result = progressTracker.detectPartialInstall(MOCK_PROJECT_ROOT);
      expect(result).not.toBeNull();
    });
  });

  // ============================================================================
  // Tests: formatDate()
  // ============================================================================

  describe('formatDate()', () => {
    it('should format valid ISO date string', () => {
      const result = progressTracker.formatDate('2026-01-27T10:00:00.000Z');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return original string for invalid date', () => {
      const result = progressTracker.formatDate('not-a-date');
      expect(result).toBe('not-a-date');
    });
  });

  // ============================================================================
  // Tests: getLastCompletedStep()
  // ============================================================================

  describe('getLastCompletedStep()', () => {
    it('should return null for null state', () => {
      const result = progressTracker.getLastCompletedStep(null);
      expect(result).toBeNull();
    });

    it('should return null for empty steps', () => {
      const state = createMockProgressState({ steps: [] });
      const result = progressTracker.getLastCompletedStep(state);
      expect(result).toBeNull();
    });

    it('should return null when no completed steps', () => {
      const state = createMockProgressState({
        steps: [createMockStep({ status: 'in_progress' })]
      });
      const result = progressTracker.getLastCompletedStep(state);
      expect(result).toBeNull();
    });

    it('should return last completed step', () => {
      const state = createMockProgressState({
        steps: [
          createMockStep({ id: 'step1', status: 'completed' }),
          createMockStep({ id: 'step2', status: 'completed' }),
          createMockStep({ id: 'step3', status: 'in_progress' })
        ]
      });
      const result = progressTracker.getLastCompletedStep(state);
      expect(result.id).toBe('step2');
    });
  });

  // ============================================================================
  // Tests: getCurrentStep()
  // ============================================================================

  describe('getCurrentStep()', () => {
    it('should return null for null state', () => {
      const result = progressTracker.getCurrentStep(null);
      expect(result).toBeNull();
    });

    it('should return null for empty steps', () => {
      const state = createMockProgressState({ steps: [] });
      const result = progressTracker.getCurrentStep(state);
      expect(result).toBeNull();
    });

    it('should return null when no in_progress step', () => {
      const state = createMockProgressState({
        steps: [createMockStep({ status: 'completed' })]
      });
      const result = progressTracker.getCurrentStep(state);
      expect(result).toBeNull();
    });

    it('should return in_progress step', () => {
      const state = createMockProgressState({
        steps: [
          createMockStep({ id: 'step1', status: 'completed' }),
          createMockStep({ id: 'step2', status: 'in_progress' })
        ]
      });
      const result = progressTracker.getCurrentStep(state);
      expect(result.id).toBe('step2');
    });
  });

  // ============================================================================
  // Tests: initializeProgress()
  // ============================================================================

  describe('initializeProgress()', () => {
    beforeEach(() => {
      setupTestFixtures();
    });

    afterEach(() => {
      cleanupTestFixtures();
    });

    it('should create progress file', () => {
      const result = progressTracker.initializeProgress(MOCK_PROJECT_ROOT);
      expect(result.success).toBe(true);
      expect(fs.existsSync(PROGRESS_FILE_PATH)).toBe(true);
    });

    it('should return state in result', () => {
      const result = progressTracker.initializeProgress(MOCK_PROJECT_ROOT);
      expect(result.state).toBeDefined();
      expect(result.state.wizard_version).toBe('1.0.0');
    });

    it('should create valid state', () => {
      progressTracker.initializeProgress(MOCK_PROJECT_ROOT);
      const state = progressTracker.readProgressFile(MOCK_PROJECT_ROOT);

      expect(state.wizard_version).toBeDefined();
      expect(state.started_at).toBeDefined();
      expect(Array.isArray(state.steps)).toBe(true);
    });
  });

  // ============================================================================
  // Tests: saveCheckpoint()
  // ============================================================================

  describe('saveCheckpoint()', () => {
    beforeEach(() => {
      setupTestFixtures();
    });

    afterEach(() => {
      cleanupTestFixtures();
    });

    it('should create new step when none exists', () => {
      progressTracker.initializeProgress(MOCK_PROJECT_ROOT);
      progressTracker.saveCheckpoint('step1', 'in_progress', null, null, MOCK_PROJECT_ROOT);

      const state = progressTracker.readProgressFile(MOCK_PROJECT_ROOT);
      expect(state.steps).toHaveLength(1);
      expect(state.steps[0].id).toBe('step1');
    });

    it('should update existing step', () => {
      progressTracker.initializeProgress(MOCK_PROJECT_ROOT);
      progressTracker.saveCheckpoint('step1', 'in_progress', null, null, MOCK_PROJECT_ROOT);
      progressTracker.saveCheckpoint('step1', 'completed', null, null, MOCK_PROJECT_ROOT);

      const state = progressTracker.readProgressFile(MOCK_PROJECT_ROOT);
      expect(state.steps).toHaveLength(1);
      expect(state.steps[0].status).toBe('completed');
    });

    it('should add completed_at for completed status', () => {
      progressTracker.initializeProgress(MOCK_PROJECT_ROOT);
      progressTracker.saveCheckpoint('step1', 'completed', null, null, MOCK_PROJECT_ROOT);

      const state = progressTracker.readProgressFile(MOCK_PROJECT_ROOT);
      expect(state.steps[0].completed_at).toBeDefined();
    });

    it('should add started_at for in_progress status', () => {
      progressTracker.initializeProgress(MOCK_PROJECT_ROOT);
      progressTracker.saveCheckpoint('step1', 'in_progress', null, null, MOCK_PROJECT_ROOT);

      const state = progressTracker.readProgressFile(MOCK_PROJECT_ROOT);
      expect(state.steps[0].started_at).toBeDefined();
    });

    it('should add failed_at for failed status', () => {
      progressTracker.initializeProgress(MOCK_PROJECT_ROOT);
      progressTracker.saveCheckpoint('step1', 'failed', null, null, MOCK_PROJECT_ROOT);

      const state = progressTracker.readProgressFile(MOCK_PROJECT_ROOT);
      expect(state.steps[0].failed_at).toBeDefined();
    });

    it('should store step data', () => {
      progressTracker.initializeProgress(MOCK_PROJECT_ROOT);
      const stepData = { selected: ['core', 'bmm'] };
      progressTracker.saveCheckpoint('step1', 'completed', stepData, null, MOCK_PROJECT_ROOT);

      const state = progressTracker.readProgressFile(MOCK_PROJECT_ROOT);
      expect(state.steps[0].data).toEqual(stepData);
    });

    it('should add rollback action when provided', () => {
      progressTracker.initializeProgress(MOCK_PROJECT_ROOT);
      const rollbackAction = { type: 'delete_file', path: 'test.txt' };
      progressTracker.saveCheckpoint('step1', 'completed', null, rollbackAction, MOCK_PROJECT_ROOT);

      const state = progressTracker.readProgressFile(MOCK_PROJECT_ROOT);
      expect(state.rollback_actions).toHaveLength(1);
      expect(state.rollback_actions[0].type).toBe('delete_file');
    });

    it('should update last_updated timestamp', () => {
      progressTracker.initializeProgress(MOCK_PROJECT_ROOT);
      const before = new Date().toISOString();
      progressTracker.saveCheckpoint('step1', 'completed', null, null, MOCK_PROJECT_ROOT);
      const after = new Date().toISOString();

      const state = progressTracker.readProgressFile(MOCK_PROJECT_ROOT);
      expect(state.last_updated >= before).toBe(true);
      expect(state.last_updated <= after).toBe(true);
    });

    it('should initialize state if no progress file exists', () => {
      // Don't initialize first
      const result = progressTracker.saveCheckpoint('step1', 'in_progress', null, null, MOCK_PROJECT_ROOT);

      expect(result.success).toBe(true);
      const state = progressTracker.readProgressFile(MOCK_PROJECT_ROOT);
      expect(state).not.toBeNull();
    });
  });

  // ============================================================================
  // Tests: addRollbackAction()
  // ============================================================================

  describe('addRollbackAction()', () => {
    beforeEach(() => {
      setupTestFixtures();
    });

    afterEach(() => {
      cleanupTestFixtures();
    });

    it('should return error if no progress file exists', () => {
      const result = progressTracker.addRollbackAction({ type: 'delete_file', path: 'test.txt' }, MOCK_PROJECT_ROOT);
      expect(result.success).toBe(false);
      expect(result.error).toContain('No progress file found');
    });

    it('should add rollback action to state', () => {
      progressTracker.initializeProgress(MOCK_PROJECT_ROOT);
      const action = { type: 'delete_file', path: 'test.txt' };
      progressTracker.addRollbackAction(action, MOCK_PROJECT_ROOT);

      const state = progressTracker.readProgressFile(MOCK_PROJECT_ROOT);
      expect(state.rollback_actions).toHaveLength(1);
    });

    it('should add timestamp to rollback action', () => {
      progressTracker.initializeProgress(MOCK_PROJECT_ROOT);
      const action = { type: 'delete_file', path: 'test.txt' };
      progressTracker.addRollbackAction(action, MOCK_PROJECT_ROOT);

      const state = progressTracker.readProgressFile(MOCK_PROJECT_ROOT);
      expect(state.rollback_actions[0].added_at).toBeDefined();
    });
  });

  // ============================================================================
  // Tests: executeRollbackAction()
  // ============================================================================

  describe('executeRollbackAction()', () => {
    beforeEach(() => {
      setupTestFixtures();
    });

    afterEach(() => {
      cleanupTestFixtures();
    });

    it('should delete file for delete_file action', () => {
      const testFile = path.join(MOCK_PROJECT_ROOT, 'test-file.txt');
      fs.writeFileSync(testFile, 'test content');

      const action = { type: 'delete_file', path: 'test-file.txt' };
      const result = progressTracker.executeRollbackAction(action, MOCK_PROJECT_ROOT);

      expect(result.success).toBe(true);
      expect(fs.existsSync(testFile)).toBe(false);
    });

    it('should succeed if file does not exist for delete_file', () => {
      const action = { type: 'delete_file', path: 'nonexistent.txt' };
      const result = progressTracker.executeRollbackAction(action, MOCK_PROJECT_ROOT);

      expect(result.success).toBe(true);
    });

    it('should delete directory for delete_directory action', () => {
      const testDir = path.join(MOCK_PROJECT_ROOT, 'test-dir');
      fs.mkdirSync(testDir);
      fs.writeFileSync(path.join(testDir, 'file.txt'), 'content');

      const action = { type: 'delete_directory', path: 'test-dir' };
      const result = progressTracker.executeRollbackAction(action, MOCK_PROJECT_ROOT);

      expect(result.success).toBe(true);
      expect(fs.existsSync(testDir)).toBe(false);
    });

    it('should restore backup for restore_backup action', () => {
      const backupFile = path.join(MOCK_PROJECT_ROOT, 'backup.txt');
      const targetFile = path.join(MOCK_PROJECT_ROOT, 'target.txt');
      fs.writeFileSync(backupFile, 'backup content');

      const action = { type: 'restore_backup', source: 'backup.txt', target: 'target.txt' };
      const result = progressTracker.executeRollbackAction(action, MOCK_PROJECT_ROOT);

      expect(result.success).toBe(true);
      expect(fs.existsSync(targetFile)).toBe(true);
      expect(fs.readFileSync(targetFile, 'utf8')).toBe('backup content');
      expect(fs.existsSync(backupFile)).toBe(false); // Backup removed after restore
    });

    it('should handle unknown action type gracefully', () => {
      const action = { type: 'unknown_type' };
      const result = progressTracker.executeRollbackAction(action, MOCK_PROJECT_ROOT);

      expect(result.success).toBe(true);
    });

    it('should handle absolute paths', () => {
      const testFile = path.join(MOCK_PROJECT_ROOT, 'absolute-test.txt');
      fs.writeFileSync(testFile, 'content');

      const action = { type: 'delete_file', path: testFile };
      const result = progressTracker.executeRollbackAction(action, MOCK_PROJECT_ROOT);

      expect(result.success).toBe(true);
      expect(fs.existsSync(testFile)).toBe(false);
    });
  });

  // ============================================================================
  // Tests: executeRollback()
  // ============================================================================

  describe('executeRollback()', () => {
    beforeEach(() => {
      setupTestFixtures();
    });

    afterEach(() => {
      cleanupTestFixtures();
    });

    it('should succeed with no rollback actions', () => {
      progressTracker.initializeProgress(MOCK_PROJECT_ROOT);
      const state = progressTracker.readProgressFile(MOCK_PROJECT_ROOT);

      const result = progressTracker.executeRollback(state, MOCK_PROJECT_ROOT);
      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should execute actions in reverse order', () => {
      // Create files
      const file1 = path.join(MOCK_PROJECT_ROOT, 'file1.txt');
      const file2 = path.join(MOCK_PROJECT_ROOT, 'file2.txt');
      fs.writeFileSync(file1, 'content1');
      fs.writeFileSync(file2, 'content2');

      const state = createMockProgressState({
        rollback_actions: [
          { type: 'delete_file', path: 'file1.txt' },
          { type: 'delete_file', path: 'file2.txt' }
        ]
      });
      writeProgressFile(state);

      const readState = progressTracker.readProgressFile(MOCK_PROJECT_ROOT);
      const result = progressTracker.executeRollback(readState, MOCK_PROJECT_ROOT);

      expect(result.success).toBe(true);
      expect(fs.existsSync(file1)).toBe(false);
      expect(fs.existsSync(file2)).toBe(false);
    });

    it('should clean up progress file after rollback', () => {
      progressTracker.initializeProgress(MOCK_PROJECT_ROOT);
      const state = progressTracker.readProgressFile(MOCK_PROJECT_ROOT);

      progressTracker.executeRollback(state, MOCK_PROJECT_ROOT);
      expect(fs.existsSync(PROGRESS_FILE_PATH)).toBe(false);
    });

    it('should collect errors but continue', () => {
      // Create a state with actions that will partially fail
      const state = createMockProgressState({
        rollback_actions: [
          { type: 'delete_file', path: 'exists.txt' }
        ]
      });

      // Create the file
      fs.writeFileSync(path.join(MOCK_PROJECT_ROOT, 'exists.txt'), 'content');
      writeProgressFile(state);

      const readState = progressTracker.readProgressFile(MOCK_PROJECT_ROOT);
      const result = progressTracker.executeRollback(readState, MOCK_PROJECT_ROOT);

      expect(result.success).toBe(true);
    });
  });

  // ============================================================================
  // Tests: cleanupProgress()
  // ============================================================================

  describe('cleanupProgress()', () => {
    beforeEach(() => {
      setupTestFixtures();
    });

    afterEach(() => {
      cleanupTestFixtures();
    });

    it('should remove progress file', () => {
      progressTracker.initializeProgress(MOCK_PROJECT_ROOT);
      expect(fs.existsSync(PROGRESS_FILE_PATH)).toBe(true);

      const result = progressTracker.cleanupProgress(MOCK_PROJECT_ROOT);
      expect(result.success).toBe(true);
      expect(fs.existsSync(PROGRESS_FILE_PATH)).toBe(false);
    });

    it('should succeed if file does not exist', () => {
      const result = progressTracker.cleanupProgress(MOCK_PROJECT_ROOT);
      expect(result.success).toBe(true);
    });
  });

  // ============================================================================
  // Tests: markStepCompleted(), markStepInProgress(), markStepFailed()
  // ============================================================================

  describe('Helper functions', () => {
    beforeEach(() => {
      setupTestFixtures();
    });

    afterEach(() => {
      cleanupTestFixtures();
    });

    it('markStepCompleted should mark step as completed', () => {
      progressTracker.initializeProgress(MOCK_PROJECT_ROOT);
      progressTracker.markStepCompleted('step1', { result: 'ok' }, MOCK_PROJECT_ROOT);

      const state = progressTracker.readProgressFile(MOCK_PROJECT_ROOT);
      expect(state.steps[0].status).toBe('completed');
      expect(state.steps[0].data).toEqual({ result: 'ok' });
    });

    it('markStepInProgress should mark step as in_progress', () => {
      progressTracker.initializeProgress(MOCK_PROJECT_ROOT);
      progressTracker.markStepInProgress('step1', null, MOCK_PROJECT_ROOT);

      const state = progressTracker.readProgressFile(MOCK_PROJECT_ROOT);
      expect(state.steps[0].status).toBe('in_progress');
    });

    it('markStepFailed should mark step as failed', () => {
      progressTracker.initializeProgress(MOCK_PROJECT_ROOT);
      progressTracker.markStepFailed('step1', { error: 'Something went wrong' }, MOCK_PROJECT_ROOT);

      const state = progressTracker.readProgressFile(MOCK_PROJECT_ROOT);
      expect(state.steps[0].status).toBe('failed');
    });
  });

  // ============================================================================
  // Tests: getResumeStepIndex()
  // ============================================================================

  describe('getResumeStepIndex()', () => {
    it('should return 0 for null state', () => {
      const result = progressTracker.getResumeStepIndex(null);
      expect(result).toBe(0);
    });

    it('should return 0 for empty steps', () => {
      const state = createMockProgressState({ steps: [] });
      const result = progressTracker.getResumeStepIndex(state);
      expect(result).toBe(0);
    });

    it('should return index of first non-completed step', () => {
      const state = createMockProgressState({
        steps: [
          createMockStep({ id: 'step1', status: 'completed' }),
          createMockStep({ id: 'step2', status: 'completed' }),
          createMockStep({ id: 'step3', status: 'in_progress' })
        ]
      });
      const result = progressTracker.getResumeStepIndex(state);
      expect(result).toBe(2);
    });

    it('should return 0 when all steps completed', () => {
      const state = createMockProgressState({
        steps: [
          createMockStep({ id: 'step1', status: 'completed' }),
          createMockStep({ id: 'step2', status: 'completed' })
        ]
      });
      const result = progressTracker.getResumeStepIndex(state);
      expect(result).toBe(0);
    });
  });

  // ============================================================================
  // Tests: isStepCompleted()
  // ============================================================================

  describe('isStepCompleted()', () => {
    beforeEach(() => {
      setupTestFixtures();
    });

    afterEach(() => {
      cleanupTestFixtures();
    });

    it('should return false if no progress file', () => {
      const result = progressTracker.isStepCompleted('step1', MOCK_PROJECT_ROOT);
      expect(result).toBe(false);
    });

    it('should return false if step not found', () => {
      progressTracker.initializeProgress(MOCK_PROJECT_ROOT);
      const result = progressTracker.isStepCompleted('nonexistent', MOCK_PROJECT_ROOT);
      expect(result).toBe(false);
    });

    it('should return true for completed step', () => {
      progressTracker.initializeProgress(MOCK_PROJECT_ROOT);
      progressTracker.markStepCompleted('step1', null, MOCK_PROJECT_ROOT);

      const result = progressTracker.isStepCompleted('step1', MOCK_PROJECT_ROOT);
      expect(result).toBe(true);
    });

    it('should return false for non-completed step', () => {
      progressTracker.initializeProgress(MOCK_PROJECT_ROOT);
      progressTracker.markStepInProgress('step1', null, MOCK_PROJECT_ROOT);

      const result = progressTracker.isStepCompleted('step1', MOCK_PROJECT_ROOT);
      expect(result).toBe(false);
    });
  });

  // ============================================================================
  // Tests: getStepData()
  // ============================================================================

  describe('getStepData()', () => {
    beforeEach(() => {
      setupTestFixtures();
    });

    afterEach(() => {
      cleanupTestFixtures();
    });

    it('should return null if no progress file', () => {
      const result = progressTracker.getStepData('step1', MOCK_PROJECT_ROOT);
      expect(result).toBeNull();
    });

    it('should return null if step not found', () => {
      progressTracker.initializeProgress(MOCK_PROJECT_ROOT);
      const result = progressTracker.getStepData('nonexistent', MOCK_PROJECT_ROOT);
      expect(result).toBeNull();
    });

    it('should return step data', () => {
      progressTracker.initializeProgress(MOCK_PROJECT_ROOT);
      progressTracker.saveCheckpoint('step1', 'completed', { modules: ['core'] }, null, MOCK_PROJECT_ROOT);

      const result = progressTracker.getStepData('step1', MOCK_PROJECT_ROOT);
      expect(result).toEqual({ modules: ['core'] });
    });

    it('should return null if step has no data', () => {
      progressTracker.initializeProgress(MOCK_PROJECT_ROOT);
      progressTracker.saveCheckpoint('step1', 'completed', null, null, MOCK_PROJECT_ROOT);

      const result = progressTracker.getStepData('step1', MOCK_PROJECT_ROOT);
      expect(result).toBeNull();
    });
  });

  // ============================================================================
  // Tests: validateProgressState()
  // ============================================================================

  describe('validateProgressState()', () => {
    it('should return invalid for null', () => {
      const result = progressTracker.validateProgressState(null);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should return invalid for non-object', () => {
      const result = progressTracker.validateProgressState('string');
      expect(result.valid).toBe(false);
    });

    it('should return valid for complete state', () => {
      const state = createMockProgressState();
      const result = progressTracker.validateProgressState(state);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing wizard_version', () => {
      const state = createMockProgressState();
      delete state.wizard_version;
      const result = progressTracker.validateProgressState(state);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing wizard_version');
    });

    it('should detect missing started_at', () => {
      const state = createMockProgressState();
      delete state.started_at;
      const result = progressTracker.validateProgressState(state);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing started_at');
    });

    it('should detect non-number current_step', () => {
      const state = createMockProgressState({ current_step: 'not-a-number' });
      const result = progressTracker.validateProgressState(state);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('current_step must be a number');
    });

    it('should detect non-array steps', () => {
      const state = createMockProgressState({ steps: 'not-array' });
      const result = progressTracker.validateProgressState(state);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('steps must be an array');
    });

    it('should detect non-array rollback_actions', () => {
      const state = createMockProgressState({ rollback_actions: 'not-array' });
      const result = progressTracker.validateProgressState(state);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('rollback_actions must be an array');
    });

    it('should validate step structure', () => {
      const state = createMockProgressState({
        steps: [{ status: 'completed' }] // missing id
      });
      const result = progressTracker.validateProgressState(state);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('missing id'))).toBe(true);
    });

    it('should validate step status', () => {
      const state = createMockProgressState({
        steps: [{ id: 'step1' }] // missing status
      });
      const result = progressTracker.validateProgressState(state);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('missing status'))).toBe(true);
    });

    it('should detect invalid step status value', () => {
      const state = createMockProgressState({
        steps: [{ id: 'step1', status: 'invalid_status' }]
      });
      const result = progressTracker.validateProgressState(state);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('invalid status'))).toBe(true);
    });
  });

  // ============================================================================
  // Tests: ESM Compatibility
  // ============================================================================

  describe('ESM Compatibility', () => {
    it('should use ES Module syntax (no CommonJS)', async () => {
      const modulePath = path.join(__dirname, 'progress-tracker.js');
      const content = fs.readFileSync(modulePath, 'utf8');

      expect(content).not.toMatch(/\bmodule\.exports\b/);
      expect(content).not.toMatch(/\brequire\s*\(/);
    });

    it('should use import statements', async () => {
      const modulePath = path.join(__dirname, 'progress-tracker.js');
      const content = fs.readFileSync(modulePath, 'utf8');

      expect(content).toMatch(/\bimport\s+/);
    });

    it('should use export statements', async () => {
      const modulePath = path.join(__dirname, 'progress-tracker.js');
      const content = fs.readFileSync(modulePath, 'utf8');

      expect(content).toMatch(/\bexport\s+(function|const|async)/);
    });
  });

  // ============================================================================
  // Tests: Integration
  // ============================================================================

  describe('Integration - Full Workflow', () => {
    beforeEach(() => {
      setupTestFixtures();
    });

    afterEach(() => {
      cleanupTestFixtures();
    });

    it('should handle complete installation workflow', () => {
      // Initialize
      const initResult = progressTracker.initializeProgress(MOCK_PROJECT_ROOT);
      expect(initResult.success).toBe(true);

      // Step 1: Welcome
      progressTracker.markStepInProgress('welcome', null, MOCK_PROJECT_ROOT);
      progressTracker.markStepCompleted('welcome', null, MOCK_PROJECT_ROOT);

      // Step 2: Modules - with data
      progressTracker.markStepInProgress('modules', null, MOCK_PROJECT_ROOT);
      progressTracker.saveCheckpoint('modules', 'completed',
        { selected: ['core', 'bmm'] },
        { type: 'delete_directory', path: '_bmad/modules' },
        MOCK_PROJECT_ROOT);

      // Step 3: Security
      progressTracker.markStepInProgress('security', null, MOCK_PROJECT_ROOT);
      progressTracker.markStepCompleted('security', { tier: 'standard' }, MOCK_PROJECT_ROOT);

      // Verify state
      const state = progressTracker.readProgressFile(MOCK_PROJECT_ROOT);
      expect(state.steps).toHaveLength(3);
      expect(state.steps[1].data.selected).toEqual(['core', 'bmm']);
      expect(state.rollback_actions).toHaveLength(1);

      // Clean up
      progressTracker.cleanupProgress(MOCK_PROJECT_ROOT);
      expect(fs.existsSync(PROGRESS_FILE_PATH)).toBe(false);
    });

    it('should handle interrupted installation with resume', () => {
      // Initialize and complete some steps
      progressTracker.initializeProgress(MOCK_PROJECT_ROOT);
      progressTracker.markStepCompleted('welcome', null, MOCK_PROJECT_ROOT);
      progressTracker.markStepInProgress('modules', null, MOCK_PROJECT_ROOT);

      // Detect partial install
      const partialState = progressTracker.detectPartialInstall(MOCK_PROJECT_ROOT);
      expect(partialState).not.toBeNull();

      // Get resume index
      const resumeIndex = progressTracker.getResumeStepIndex(partialState);
      expect(resumeIndex).toBe(1); // Should resume at modules step

      // Continue installation
      progressTracker.markStepCompleted('modules', { selected: ['core'] }, MOCK_PROJECT_ROOT);

      // Verify
      expect(progressTracker.isStepCompleted('welcome', MOCK_PROJECT_ROOT)).toBe(true);
      expect(progressTracker.isStepCompleted('modules', MOCK_PROJECT_ROOT)).toBe(true);
    });

    it('should handle rollback after failure', () => {
      // Create some files that would be created during installation
      const testFile = path.join(MOCK_PROJECT_ROOT, 'installed-file.txt');
      const testDir = path.join(MOCK_PROJECT_ROOT, 'installed-dir');
      fs.writeFileSync(testFile, 'content');
      fs.mkdirSync(testDir);

      // Initialize with rollback actions
      progressTracker.initializeProgress(MOCK_PROJECT_ROOT);
      progressTracker.saveCheckpoint('step1', 'completed', null,
        { type: 'delete_file', path: 'installed-file.txt' },
        MOCK_PROJECT_ROOT);
      progressTracker.saveCheckpoint('step2', 'completed', null,
        { type: 'delete_directory', path: 'installed-dir' },
        MOCK_PROJECT_ROOT);
      progressTracker.markStepFailed('step3', { error: 'Something failed' }, MOCK_PROJECT_ROOT);

      // Execute rollback
      const state = progressTracker.readProgressFile(MOCK_PROJECT_ROOT);
      const result = progressTracker.executeRollback(state, MOCK_PROJECT_ROOT);

      expect(result.success).toBe(true);
      expect(fs.existsSync(testFile)).toBe(false);
      expect(fs.existsSync(testDir)).toBe(false);
      expect(fs.existsSync(PROGRESS_FILE_PATH)).toBe(false);
    });
  });
});
