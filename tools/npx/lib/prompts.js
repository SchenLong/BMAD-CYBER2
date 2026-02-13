/**
 * @clack/prompts wrapper for BMAD CLI (NPX package version)
 *
 * Minimal prompts interface for the bmad-cybersec npm package.
 * Extracted from src/utility/cli/prompts.js to keep the NPX package self-contained.
 *
 * @module prompts
 */

import * as p from '@clack/prompts';
import pc from 'picocolors';

// Silent mode flag — when true, suppresses all interactive output
let _silent = false;

/**
 * Enable or disable silent mode for automation/testing
 * @param {boolean} silent - Whether to suppress output
 */
export function setSilent(silent) {
  _silent = !!silent;
}

/**
 * Check if a value represents a cancellation
 * @param {any} value - The value to check
 * @returns {boolean} True if value is a cancel symbol
 */
export function isCancel(value) {
  return p.isCancel(value);
}

/**
 * Handle user cancellation gracefully
 * @param {any} value - The value to check
 * @param {string} [message='Operation cancelled'] - Message to display
 * @returns {boolean} True if cancelled
 */
export function handleCancel(value, message = 'Operation cancelled') {
  if (p.isCancel(value)) {
    p.cancel(message);
    process.exit(0);
  }
  return false;
}

/**
 * Display a spinner for async operations
 * Wraps @clack/prompts spinner with isSpinning state tracking
 * @returns {Object} Spinner controller with start, stop, message, isSpinning
 */
export function createSpinner() {
  const s = p.spinner();
  let spinning = false;

  return {
    /** @param {string} msg */
    start(msg) {
      if (_silent) return;
      if (spinning) {
        s.message(msg);
      } else {
        spinning = true;
        s.start(msg);
      }
    },
    /** @param {string} [msg] */
    stop(msg) {
      if (spinning) {
        spinning = false;
        s.stop(msg);
      }
    },
    /** @param {string} msg */
    message(msg) {
      if (_silent) return;
      if (spinning) s.message(msg);
    },
    get isSpinning() {
      return spinning;
    },
  };
}

/**
 * Single-select prompt (replaces Inquirer 'list' type)
 * @param {Object} options - Prompt options
 * @param {string} options.message - The question to ask
 * @param {Array} options.options - Array of clack-style options [{value, label, hint?}]
 * @param {Array} [options.choices] - Array of Inquirer-style choices [{name, value, hint?}]
 * @param {any} [options.initialValue] - Initial selected value
 * @param {any} [options.default] - Default selected value (Inquirer compat)
 * @returns {Promise<any>} Selected value
 */
export async function select(options) {
  // Support both clack-native (options.options) and Inquirer-style (options.choices)
  let clackOptions;
  if (options.options) {
    clackOptions = options.options;
  } else if (options.choices) {
    clackOptions = options.choices
      .filter((c) => c.type !== 'separator')
      .map((choice) => {
        if (typeof choice === 'string' || typeof choice === 'number') {
          return { value: choice, label: String(choice) };
        }
        return {
          value: choice.value === undefined ? choice.name : choice.value,
          label: choice.name || choice.label || String(choice.value),
          hint: choice.hint || choice.description,
        };
      });
  } else {
    clackOptions = [];
  }

  const initialValue = options.initialValue ?? options.default;

  const result = await p.select({
    message: options.message,
    options: clackOptions,
    initialValue,
  });

  handleCancel(result);
  return result;
}

/**
 * Confirm prompt (replaces Inquirer 'confirm' type)
 * @param {Object} options - Prompt options
 * @param {string} options.message - The question to ask
 * @param {boolean} [options.initialValue] - Default value
 * @param {boolean} [options.default] - Default value (Inquirer compat)
 * @returns {Promise<boolean>} User's answer
 */
export async function confirm(options) {
  const initialValue = options.initialValue ?? (options.default === undefined ? true : options.default);

  const result = await p.confirm({
    message: options.message,
    initialValue,
  });

  handleCancel(result);
  return result;
}

/**
 * Structured logging utilities (minimal version for NPX package)
 */
export const log = {
  /** @param {string} message */
  info(message) {
    if (_silent) return;
    p.log.info(message);
  },
  /** @param {string} message */
  success(message) {
    if (_silent) return;
    p.log.success(message);
  },
  /** @param {string} message */
  warn(message) {
    if (_silent) return;
    p.log.warn(message);
  },
  /** @param {string} message */
  error(message) {
    if (_silent) return;
    p.log.error(message);
  },
  /** @param {string} message */
  message(message) {
    if (_silent) return;
    p.log.message(message);
  },
  /** @param {string} message */
  step(message) {
    if (_silent) return;
    p.log.step(message);
  },
};
