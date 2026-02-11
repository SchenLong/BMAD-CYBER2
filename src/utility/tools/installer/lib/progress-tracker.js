/**
 * Progress Tracker - INST-039
 * Epic 1, Story 39 - Installation Recovery Mode
 *
 * Provides installation recovery capabilities by tracking wizard progress,
 * detecting partial installations, and enabling resume/rollback functionality.
 *
 * @module progress-tracker
 * @author BlackUnicorn.Tech
 * @version 1.0.0
 */

import fs from 'fs';
import path from 'path';
import { select } from '../../../cli/prompts.js';
import chalk from 'chalk';

/**
 * Progress file name constant
 * @type {string}
 */
export const PROGRESS_FILE = '.bmad-wizard-progress';

/**
 * Current wizard version
 * @type {string}
 */
export const WIZARD_VERSION = '1.0.0';

/**
 * Step status enum
 * @type {Object}
 */
export const StepStatus = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  FAILED: 'failed'
};

/**
 * Recovery action types
 * @type {Object}
 */
export const RecoveryAction = {
  RESUME: 'resume',
  RESTART: 'restart',
  ROLLBACK: 'rollback'
};

/**
 * Rollback action types
 * @type {Object}
 */
export const RollbackType = {
  DELETE_FILE: 'delete_file',
  DELETE_DIRECTORY: 'delete_directory',
  RESTORE_BACKUP: 'restore_backup'
};

/**
 * Creates the initial progress state structure
 * @returns {Object} Initial progress state
 */
export function createInitialState() {
  return {
    wizard_version: WIZARD_VERSION,
    started_at: new Date().toISOString(),
    current_step: 0,
    steps: [],
    rollback_actions: []
  };
}

/**
 * Gets the full path to the progress file
 * @param {string} projectRoot - Root directory of the project
 * @returns {string} Full path to progress file
 */
export function getProgressFilePath(projectRoot) {
  return path.join(projectRoot, PROGRESS_FILE);
}

/**
 * Reads and parses the progress file
 * @param {string} projectRoot - Root directory of the project
 * @returns {Object|null} Parsed progress state or null if not found/corrupted
 */
export function readProgressFile(projectRoot) {
  const filePath = getProgressFilePath(projectRoot);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');

    // Handle empty file
    if (!content || content.trim() === '') {
      return null;
    }

    const state = JSON.parse(content);

    // Validate basic structure
    if (!state || typeof state !== 'object') {
      console.warn(chalk.yellow('Warning: Progress file contains invalid data'));
      return null;
    }

    // Validate required fields
    if (!state.wizard_version || !state.started_at || !Array.isArray(state.steps)) {
      console.warn(chalk.yellow('Warning: Progress file is missing required fields'));
      return null;
    }

    return state;
  } catch (error) {
    // Handle corrupted JSON or other errors
    if (error instanceof SyntaxError) {
      console.warn(chalk.yellow('Warning: Progress file is corrupted (invalid JSON)'));
    } else {
      console.warn(chalk.yellow(`Warning: Could not read progress file: ${  error.message}`));
    }
    return null;
  }
}

/**
 * Writes the progress state to file atomically
 * Uses temp file + rename pattern for safety
 * @param {Object} state - Progress state to write
 * @param {string} projectRoot - Root directory of the project
 * @returns {{ success: boolean, error?: string }} Write result
 */
export function writeProgressFile(state, projectRoot) {
  const filePath = getProgressFilePath(projectRoot);
  const tempPath = `${filePath  }.tmp`;

  try {
    // Validate state before writing
    if (!state || typeof state !== 'object') {
      return { success: false, error: 'Invalid state object' };
    }

    // Ensure parent directory exists
    const parentDir = path.dirname(filePath);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }

    // Serialize state with pretty formatting
    const content = JSON.stringify(state, null, 2);

    // Write to temp file first
    fs.writeFileSync(tempPath, content, 'utf8');

    // Atomic rename (this ensures the file is either fully written or not at all)
    fs.renameSync(tempPath, filePath);

    return { success: true };
  } catch (error) {
    // Clean up temp file if it exists
    try {
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }
    } catch (cleanupError) {
      // Ignore cleanup errors
    }

    return { success: false, error: error.message };
  }
}

/**
 * Detects if there's a partial installation in progress
 * @param {string} projectRoot - Root directory of the project
 * @returns {Object|null} Progress state if partial install detected, null otherwise
 */
export function detectPartialInstall(projectRoot) {
  const state = readProgressFile(projectRoot);

  if (!state) {
    return null;
  }

  // Check if there are any steps recorded
  if (!state.steps || state.steps.length === 0) {
    return null;
  }

  // Check if installation is incomplete (has in_progress or not all completed)
  const hasIncompleteSteps = state.steps.some(
    step => step.status === StepStatus.IN_PROGRESS || step.status === StepStatus.PENDING
  );

  const hasFailedSteps = state.steps.some(step => step.status === StepStatus.FAILED);

  // If all steps are completed successfully, there's no partial install
  const allCompleted = state.steps.every(step => step.status === StepStatus.COMPLETED);
  if (allCompleted && !hasFailedSteps) {
    return null;
  }

  return state;
}

/**
 * Formats a date for display
 * @param {string} isoString - ISO date string
 * @returns {string} Formatted date string
 */
export function formatDate(isoString) {
  try {
    const date = new Date(isoString);
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return isoString;
    }
    return date.toLocaleString();
  } catch {
    return isoString;
  }
}

/**
 * Gets the last completed step from the progress state
 * @param {Object} state - Progress state
 * @returns {Object|null} Last completed step or null
 */
export function getLastCompletedStep(state) {
  if (!state || !state.steps || state.steps.length === 0) {
    return null;
  }

  const completedSteps = state.steps.filter(step => step.status === StepStatus.COMPLETED);
  return completedSteps.length > 0 ? completedSteps[completedSteps.length - 1] : null;
}

/**
 * Gets the current in-progress step from the progress state
 * @param {Object} state - Progress state
 * @returns {Object|null} Current in-progress step or null
 */
export function getCurrentStep(state) {
  if (!state || !state.steps || state.steps.length === 0) {
    return null;
  }

  return state.steps.find(step => step.status === StepStatus.IN_PROGRESS) || null;
}

/**
 * Prompts user for recovery action when partial installation is detected
 * @param {Object} state - Detected partial installation state
 * @returns {Promise<string>} Chosen action: 'resume' | 'restart' | 'rollback'
 */
export async function promptForRecovery(state) {
  const startedDate = formatDate(state.started_at);
  const lastStep = getLastCompletedStep(state);
  const currentStep = getCurrentStep(state);
  const completedCount = state.steps.filter(s => s.status === StepStatus.COMPLETED).length;
  const totalCount = state.steps.length;

  console.log('');
  console.log(chalk.yellow.bold('  Partial Installation Detected'));
  console.log(chalk.yellow('  ================================'));
  console.log('');
  console.log(`  ${  chalk.gray('Started:')  }     ${  startedDate}`);
  console.log(`  ${  chalk.gray('Version:')  }     ${  state.wizard_version}`);
  console.log(`  ${  chalk.gray('Progress:')  }    ${  completedCount  }/${  totalCount  } steps completed`);

  if (lastStep) {
    console.log(`  ${  chalk.gray('Last step:')  }   ${  chalk.green(lastStep.id)  } (completed)`);
  }

  if (currentStep) {
    console.log(`  ${  chalk.gray('Current:')  }     ${  chalk.cyan(currentStep.id)  } (in progress)`);
  }

  console.log('');

  const action = await select({
    message: 'How would you like to proceed?',
    choices: [
      {
        name: `${chalk.green('Resume')  } - Continue from where you left off`,
        value: RecoveryAction.RESUME,
        short: 'Resume'
      },
      {
        name: `${chalk.yellow('Restart')  } - Start fresh (clears progress)`,
        value: RecoveryAction.RESTART,
        short: 'Restart'
      },
      {
        name: `${chalk.red('Rollback')  } - Undo all changes and exit`,
        value: RecoveryAction.ROLLBACK,
        short: 'Rollback'
      }
    ]
  });

  return action;
}

/**
 * Initializes a new progress tracking session
 * @param {string} projectRoot - Root directory of the project
 * @returns {{ success: boolean, state?: Object, error?: string }} Initialization result
 */
export function initializeProgress(projectRoot) {
  const state = createInitialState();
  const writeResult = writeProgressFile(state, projectRoot);

  if (writeResult.success) {
    return { success: true, state };
  }

  return { success: false, error: writeResult.error };
}

/**
 * Saves a checkpoint for a step in the installation process
 * @param {string} stepId - Unique identifier for the step
 * @param {string} status - Step status (pending, in_progress, completed, failed)
 * @param {Object} [data=null] - Optional data associated with the step
 * @param {Object} [rollbackAction=null] - Optional rollback action for this step
 * @param {string} projectRoot - Root directory of the project
 * @returns {{ success: boolean, error?: string }} Save result
 */
export function saveCheckpoint(stepId, status, data = null, rollbackAction = null, projectRoot) {
  // Read current progress
  let state = readProgressFile(projectRoot);

  // Initialize if no state exists
  if (!state) {
    state = createInitialState();
  }

  // Find existing step or create new one
  const existingStepIndex = state.steps.findIndex(s => s.id === stepId);
  const timestamp = new Date().toISOString();

  const stepData = {
    id: stepId,
    status
  };

  if (status === StepStatus.COMPLETED) {
    stepData.completed_at = timestamp;
  }
  if (status === StepStatus.IN_PROGRESS) {
    stepData.started_at = timestamp;
  }
  if (status === StepStatus.FAILED) {
    stepData.failed_at = timestamp;
  }
  if (data) {
    stepData.data = data;
  }

  if (existingStepIndex >= 0) {
    // Update existing step
    state.steps[existingStepIndex] = {
      ...state.steps[existingStepIndex],
      ...stepData
    };
  } else {
    // Add new step
    state.steps.push(stepData);
  }

  // Update current_step index
  state.current_step = state.steps.length - 1;

  // Add rollback action if provided
  if (rollbackAction) {
    state.rollback_actions.push({
      ...rollbackAction,
      step_id: stepId,
      added_at: timestamp
    });
  }

  // Update last_updated timestamp
  state.last_updated = timestamp;

  // Write updated state
  return writeProgressFile(state, projectRoot);
}

/**
 * Adds a rollback action to the progress state
 * @param {Object} rollbackAction - Rollback action to add
 * @param {string} projectRoot - Root directory of the project
 * @returns {{ success: boolean, error?: string }} Add result
 */
export function addRollbackAction(rollbackAction, projectRoot) {
  const state = readProgressFile(projectRoot);

  if (!state) {
    return { success: false, error: 'No progress file found' };
  }

  if (!state.rollback_actions) {
    state.rollback_actions = [];
  }

  state.rollback_actions.push({
    ...rollbackAction,
    added_at: new Date().toISOString()
  });

  return writeProgressFile(state, projectRoot);
}

/**
 * Executes a single rollback action
 * @param {Object} action - Rollback action to execute
 * @param {string} projectRoot - Root directory of the project
 * @returns {{ success: boolean, error?: string }} Execution result
 */
export function executeRollbackAction(action, projectRoot) {
  try {
    switch (action.type) {
      case RollbackType.DELETE_FILE: {
        const filePath = path.isAbsolute(action.path)
          ? action.path
          : path.join(projectRoot, action.path);

        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(chalk.gray(`  Deleted file: ${  action.path}`));
        }
        return { success: true };
      }

      case RollbackType.DELETE_DIRECTORY: {
        const dirPath = path.isAbsolute(action.path)
          ? action.path
          : path.join(projectRoot, action.path);

        if (fs.existsSync(dirPath)) {
          fs.rmSync(dirPath, { recursive: true, force: true });
          console.log(chalk.gray(`  Deleted directory: ${  action.path}`));
        }
        return { success: true };
      }

      case RollbackType.RESTORE_BACKUP: {
        const sourcePath = path.isAbsolute(action.source)
          ? action.source
          : path.join(projectRoot, action.source);
        const targetPath = path.isAbsolute(action.target)
          ? action.target
          : path.join(projectRoot, action.target);

        if (fs.existsSync(sourcePath)) {
          // Ensure target directory exists
          const targetDir = path.dirname(targetPath);
          if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
          }

          // Copy backup to target
          fs.copyFileSync(sourcePath, targetPath);
          console.log(chalk.gray(`  Restored: ${  action.target}`));

          // Remove backup file
          fs.unlinkSync(sourcePath);
        }
        return { success: true };
      }

      default:
        console.warn(chalk.yellow(`  Unknown rollback action type: ${  action.type}`));
        return { success: true }; // Continue with other actions
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Executes all rollback actions in reverse order
 * @param {Object} progressState - Progress state with rollback actions
 * @param {string} projectRoot - Root directory of the project
 * @returns {{ success: boolean, errors: string[] }} Rollback result
 */
export function executeRollback(progressState, projectRoot) {
  const errors = [];

  if (!progressState || !progressState.rollback_actions || progressState.rollback_actions.length === 0) {
    console.log(chalk.yellow('  No rollback actions to execute'));
    // Clean up progress file even if no rollback actions
    cleanupProgress(projectRoot);
    return { success: true, errors };
  }

  console.log('');
  console.log(chalk.yellow.bold('  Executing Rollback'));
  console.log(chalk.yellow('  =================='));
  console.log('');
  console.log(`  ${  chalk.gray('Actions to reverse:')  } ${  progressState.rollback_actions.length}`);
  console.log('');

  // Execute rollback actions in reverse order (LIFO)
  const reversedActions = [...progressState.rollback_actions].reverse();

  for (const action of reversedActions) {
    const result = executeRollbackAction(action, projectRoot);
    if (!result.success) {
      errors.push(`${action.type  }: ${  result.error}`);
    }
  }

  // Clean up progress file after rollback
  cleanupProgress(projectRoot);

  if (errors.length > 0) {
    console.log('');
    console.log(chalk.yellow('  Rollback completed with errors:'));
    errors.forEach(err => console.log(chalk.red(`    - ${  err}`)));
  } else {
    console.log('');
    console.log(chalk.green('  Rollback completed successfully'));
  }

  return { success: errors.length === 0, errors };
}

/**
 * Cleans up the progress file (removes it)
 * Called on successful completion or explicit restart
 * @param {string} projectRoot - Root directory of the project
 * @returns {{ success: boolean, error?: string }} Cleanup result
 */
export function cleanupProgress(projectRoot) {
  const filePath = getProgressFilePath(projectRoot);

  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Marks a step as completed and optionally updates its data
 * @param {string} stepId - Step identifier
 * @param {Object} [data=null] - Optional step data
 * @param {string} projectRoot - Root directory of the project
 * @returns {{ success: boolean, error?: string }} Result
 */
export function markStepCompleted(stepId, data = null, projectRoot) {
  return saveCheckpoint(stepId, StepStatus.COMPLETED, data, null, projectRoot);
}

/**
 * Marks a step as in progress
 * @param {string} stepId - Step identifier
 * @param {Object} [data=null] - Optional step data
 * @param {string} projectRoot - Root directory of the project
 * @returns {{ success: boolean, error?: string }} Result
 */
export function markStepInProgress(stepId, data = null, projectRoot) {
  return saveCheckpoint(stepId, StepStatus.IN_PROGRESS, data, null, projectRoot);
}

/**
 * Marks a step as failed
 * @param {string} stepId - Step identifier
 * @param {Object} [errorData=null] - Optional error data
 * @param {string} projectRoot - Root directory of the project
 * @returns {{ success: boolean, error?: string }} Result
 */
export function markStepFailed(stepId, errorData = null, projectRoot) {
  return saveCheckpoint(stepId, StepStatus.FAILED, errorData, null, projectRoot);
}

/**
 * Gets the step to resume from based on progress state
 * @param {Object} state - Progress state
 * @returns {number} Index of step to resume from (0-based)
 */
export function getResumeStepIndex(state) {
  if (!state || !state.steps || state.steps.length === 0) {
    return 0;
  }

  // Find the first non-completed step
  const firstIncompleteIndex = state.steps.findIndex(
    step => step.status !== StepStatus.COMPLETED
  );

  if (firstIncompleteIndex === -1) {
    // All steps completed, start from beginning
    return 0;
  }

  return firstIncompleteIndex;
}

/**
 * Checks if a specific step has been completed
 * @param {string} stepId - Step identifier
 * @param {string} projectRoot - Root directory of the project
 * @returns {boolean} True if step is completed
 */
export function isStepCompleted(stepId, projectRoot) {
  const state = readProgressFile(projectRoot);

  if (!state || !state.steps) {
    return false;
  }

  const step = state.steps.find(s => s.id === stepId);
  return step ? step.status === StepStatus.COMPLETED : false;
}

/**
 * Gets data saved for a specific step
 * @param {string} stepId - Step identifier
 * @param {string} projectRoot - Root directory of the project
 * @returns {Object|null} Step data or null
 */
export function getStepData(stepId, projectRoot) {
  const state = readProgressFile(projectRoot);

  if (!state || !state.steps) {
    return null;
  }

  const step = state.steps.find(s => s.id === stepId);
  return step ? step.data || null : null;
}

/**
 * Validates a progress state object
 * @param {Object} state - State to validate
 * @returns {{ valid: boolean, errors: string[] }} Validation result
 */
export function validateProgressState(state) {
  const errors = [];

  if (!state || typeof state !== 'object') {
    return { valid: false, errors: ['State must be an object'] };
  }

  if (!state.wizard_version) {
    errors.push('Missing wizard_version');
  }

  if (!state.started_at) {
    errors.push('Missing started_at');
  }

  if (typeof state.current_step !== 'number') {
    errors.push('current_step must be a number');
  }

  if (!Array.isArray(state.steps)) {
    errors.push('steps must be an array');
  }

  if (!Array.isArray(state.rollback_actions)) {
    errors.push('rollback_actions must be an array');
  }

  // Validate each step
  if (Array.isArray(state.steps)) {
    state.steps.forEach((step, index) => {
      if (!step.id) {
        errors.push(`Step ${  index  }: missing id`);
      }
      if (!step.status) {
        errors.push(`Step ${  index  }: missing status`);
      }
      if (step.status && !Object.values(StepStatus).includes(step.status)) {
        errors.push(`Step ${  index  }: invalid status "${  step.status  }"`);
      }
    });
  }

  return { valid: errors.length === 0, errors };
}
