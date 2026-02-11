/**
 * @clack/prompts wrapper for BMAD CLI
 *
 * Unified interface for CLI prompts using @clack/prompts.
 * Replaces Inquirer.js to fix Windows arrow key navigation issues (libuv #852).
 * Ported from v6 upstream tools/cli/lib/prompts.js, converted to ESM.
 *
 * @module prompts
 */

import * as p from '@clack/prompts';
import { TextPrompt } from '@clack/core';
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
 * Get current silent mode state
 * @returns {boolean}
 */
export function isSilent() {
  return _silent;
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
 * Check if a value represents a cancellation
 * @param {any} value - The value to check
 * @returns {boolean} True if the value is a cancel symbol
 */
export function isCancel(value) {
  return p.isCancel(value);
}

/**
 * Display intro message
 * @param {string} message - The intro message
 */
export function intro(message) {
  if (_silent) return;
  p.intro(message);
}

/**
 * Display outro message
 * @param {string} message - The outro message
 */
export function outro(message) {
  if (_silent) return;
  p.outro(message);
}

/**
 * Display a note/info box
 * @param {string} message - The note content
 * @param {string} [title] - Optional title
 */
export function note(message, title) {
  if (_silent) return;
  p.note(message, title);
}

/**
 * Display cancellation message
 * @param {string} [message='Operation cancelled'] - The cancellation message
 */
export function cancel(message = 'Operation cancelled') {
  if (_silent) return;
  p.cancel(message);
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
 * Multi-select prompt (replaces Inquirer 'checkbox' type)
 * @param {Object} options - Prompt options
 * @param {string} options.message - The question to ask
 * @param {Array} options.options - Array of clack-style options [{value, label, hint?}]
 * @param {Array} [options.choices] - Array of Inquirer-style choices [{name, value, checked?, hint?}]
 * @param {Array} [options.initialValues] - Pre-selected values
 * @param {boolean} [options.required=false] - Whether at least one must be selected
 * @returns {Promise<Array>} Array of selected values
 */
export async function multiselect(options) {
  let clackOptions;
  let initialValues;

  if (options.options) {
    clackOptions = options.options;
    initialValues = options.initialValues || [];
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
    initialValues = options.choices
      .filter((c) => c.checked && c.type !== 'separator')
      .map((c) => (c.value === undefined ? c.name : c.value));
  } else {
    clackOptions = [];
    initialValues = [];
  }

  const result = await p.multiselect({
    message: options.message,
    options: clackOptions,
    initialValues: initialValues.length > 0 ? initialValues : undefined,
    required: options.required || false,
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
 * Text input prompt with Tab-to-fill-placeholder support (replaces Inquirer 'input' type)
 *
 * Uses @clack/core's TextPrompt primitive with custom key handling to restore
 * Tab-to-fill-placeholder behavior removed in @clack/prompts v1.0.0.
 *
 * @param {Object} options - Prompt options
 * @param {string} options.message - The question to ask
 * @param {string} [options.defaultValue] - Default value
 * @param {string} [options.default] - Default value (Inquirer compat)
 * @param {string} [options.placeholder] - Placeholder text
 * @param {Function} [options.validate] - Validation function
 * @returns {Promise<string>} User's input
 */
export async function text(options) {
  const defaultValue = options.defaultValue ?? options.default;
  const placeholder = options.placeholder === undefined ? defaultValue : options.placeholder;

  const prompt = new TextPrompt({
    defaultValue,
    validate: options.validate,
    render() {
      const title = `${pc.gray('\u25C6')}  ${options.message}`;
      let valueDisplay;

      if (this.state === 'error') {
        valueDisplay = pc.yellow(this.userInputWithCursor);
      } else if (this.userInput) {
        valueDisplay = this.userInputWithCursor;
      } else if (placeholder) {
        valueDisplay = `${pc.inverse(pc.hidden('_'))}${pc.dim(placeholder)}`;
      } else {
        valueDisplay = pc.inverse(pc.hidden('_'));
      }

      const bar = pc.gray('\u2502');

      if (this.state === 'submit') {
        return `${pc.gray('\u25C7')}  ${options.message}\n${bar}  ${pc.dim(this.value || defaultValue || '')}`;
      }
      if (this.state === 'cancel') {
        return `${pc.gray('\u25C7')}  ${options.message}\n${bar}  ${pc.strikethrough(pc.dim(this.userInput || ''))}`;
      }
      if (this.state === 'error') {
        return `${pc.yellow('\u25B2')}  ${options.message}\n${bar}  ${valueDisplay}\n${pc.yellow('\u2502')}  ${pc.yellow(this.error)}`;
      }
      return `${title}\n${bar}  ${valueDisplay}\n${bar}`;
    },
  });

  // Tab key fills placeholder into input
  prompt.on('key', (char) => {
    if (char === '\t' && placeholder && !prompt.userInput) {
      prompt._setUserInput(placeholder, true);
    }
  });

  const result = await prompt.prompt();
  handleCancel(result);
  return result;
}

/**
 * Password input prompt (replaces Inquirer 'password' type)
 * @param {Object} options - Prompt options
 * @param {string} options.message - The question to ask
 * @param {Function} [options.validate] - Validation function
 * @returns {Promise<string>} User's input
 */
export async function password(options) {
  const result = await p.password({
    message: options.message,
    validate: options.validate,
  });

  handleCancel(result);
  return result;
}

/**
 * Default filter function for autocomplete — case-insensitive label matching
 * @param {string} search - Search string
 * @param {Object} option - Option object with label
 * @returns {boolean} Whether the option matches
 */
function defaultAutocompleteFilter(search, option) {
  const label = option.label ?? String(option.value ?? '');
  return label.toLowerCase().includes(search.toLowerCase());
}

/**
 * Autocomplete multi-select prompt with type-ahead filtering
 * @param {Object} options - Prompt options
 * @param {string} options.message - The question to ask
 * @param {Array} options.options - Array of choices [{label, value, hint?}]
 * @param {string} [options.placeholder] - Placeholder text for search input
 * @param {Array} [options.initialValues] - Array of initially selected values
 * @param {boolean} [options.required=false] - Whether at least one must be selected
 * @param {number} [options.maxItems=5] - Maximum visible items in scrollable list
 * @param {Function} [options.filter] - Custom filter function (search, option) => boolean
 * @param {Array} [options.lockedValues] - Values that are always selected and cannot be toggled off
 * @returns {Promise<Array>} Array of selected values
 */
 
export async function autocompleteMultiselect(options) {
  // Dynamic import to avoid loading @clack/core internals when not needed
  const { AutocompletePrompt } = await import('@clack/core');

  const filterFn = options.filter ?? defaultAutocompleteFilter;
  const lockedSet = new Set(options.lockedValues || []);

  const prompt = new AutocompletePrompt({
    options: options.options,
    multiple: true,
    filter: filterFn,
    validate: () => {
      if (options.required && prompt.selectedValues.length === 0) {
        return 'Please select at least one item';
      }
      return undefined;
    },
    initialValue: [...new Set([...(options.initialValues || []), ...(options.lockedValues || [])])],
     
    render() {
      const barColor = this.state === 'error' ? pc.yellow : pc.cyan;
      const bar = barColor(p.S_BAR);
      const barEnd = barColor(p.S_BAR_END);

      const title = `${pc.gray(p.S_BAR)}\n${p.symbol(this.state)}  ${options.message}\n`;
      const userInput = this.userInput;
      const placeholderText = options.placeholder || 'Type to search...';
      const hasPlaceholder = userInput === '' && placeholderText !== undefined;

      const searchDisplay =
        this.isNavigating || hasPlaceholder
          ? pc.dim(hasPlaceholder ? placeholderText : userInput)
          : this.userInputWithCursor;

      const allOptions = this.options;
      const matchCount =
        this.filteredOptions.length === allOptions.length
          ? ''
          : pc.dim(` (${this.filteredOptions.length} match${this.filteredOptions.length === 1 ? '' : 'es'})`);

      const renderOption = (opt, isHighlighted) => {
        const isSelected = this.selectedValues.includes(opt.value);
        const isLocked = lockedSet.has(opt.value);
        const label = String(opt.label ?? opt.value ?? '');
        const hintText = opt.hint && isHighlighted ? pc.dim(` (${String(opt.hint)})`) : '';

        let checkbox;
        if (isLocked) {
          checkbox = pc.green(p.S_CHECKBOX_SELECTED);
          const lockHint = pc.dim(' (always installed)');
          return isHighlighted ? `${checkbox} ${label}${lockHint}` : `${checkbox} ${pc.dim(label)}${lockHint}`;
        }
        checkbox = isSelected ? pc.green(p.S_CHECKBOX_SELECTED) : pc.dim(p.S_CHECKBOX_INACTIVE);
        return isHighlighted ? `${checkbox} ${label}${hintText}` : `${checkbox} ${pc.dim(label)}`;
      };

      switch (this.state) {
        case 'submit':
          return `${title}${pc.gray(p.S_BAR)}  ${pc.dim(`${this.selectedValues.length} items selected`)}`;
        case 'cancel':
          return `${title}${pc.gray(p.S_BAR)}  ${pc.strikethrough(pc.dim(userInput))}`;
        default: {
          const hints = [
            `${pc.dim('\u2191/\u2193')} to navigate`,
            `${pc.dim('TAB/SPACE:')} select`,
            `${pc.dim('ENTER:')} confirm`,
          ];

          const noMatchesLine =
            this.filteredOptions.length === 0 && userInput
              ? [`${bar}  ${pc.yellow('No matches found')}`]
              : [];
          const errorLine = this.state === 'error' ? [`${bar}  ${pc.yellow(this.error)}`] : [];

          const headerLines = [
            ...`${title}${bar}`.split('\n'),
            `${bar}  ${searchDisplay}${matchCount}`,
            ...noMatchesLine,
            ...errorLine,
          ];
          const footerLines = [`${bar}  ${pc.dim(hints.join(' \u2022 '))}`, `${barEnd}`];

          const optionLines = p.limitOptions({
            cursor: this.cursor,
            options: this.filteredOptions,
            style: renderOption,
            maxItems: options.maxItems || 5,
            output: options.output,
            rowPadding: headerLines.length + footerLines.length,
          });

          return [...headerLines, ...optionLines.map((line) => `${bar}  ${line}`), ...footerLines].join('\n');
        }
      }
    },
  });

  // Prevent locked values from being toggled off
  if (lockedSet.size > 0) {
    const originalToggle = prompt.toggleSelected.bind(prompt);
    prompt.toggleSelected = function (value) {
      if (lockedSet.has(value) && this.selectedValues.includes(value)) return;
      originalToggle(value);
    };
  }

  // Make SPACE always act as selection key (not search input)
  const originalIsActionKey = prompt._isActionKey.bind(prompt);
  prompt._isActionKey = function (char, key) {
    if (key && key.name === 'space') return true;
    return originalIsActionKey(char, key);
  };

  prompt.on('key', (char, key) => {
    if (key && key.name === 'space' && !prompt.isNavigating) {
      const focused = prompt.filteredOptions[prompt.cursor];
      if (focused) prompt.toggleSelected(focused.value);
    }
  });

  const result = await prompt.prompt();
  handleCancel(result);
  return result;
}

/**
 * Group multiple prompts together
 * @param {Object} prompts - Object of prompt functions
 * @param {Object} [options] - Group options
 * @returns {Promise<Object>} Object with all answers
 */
export async function group(prompts, options = {}) {
  const result = await p.group(prompts, {
    onCancel: () => {
      p.cancel('Operation cancelled');
       
      process.exit(0);
    },
    ...options,
  });
  return result;
}

/**
 * Structured logging utilities
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

/**
 * Render a formatted install summary table
 * @param {Array<{name: string, status: string, message?: string}>} results - Install results
 * @param {Object} [options] - Rendering options
 * @param {string} [options.title='Install Summary'] - Summary title
 */
export function renderInstallSummary(results, options = {}) {
  if (_silent) return;

  const title = options.title || 'Install Summary';
  const maxNameLen = Math.max(...results.map((r) => r.name.length), 4);

  const lines = results.map((r) => {
    const icon = r.status === 'success' ? pc.green('\u2713') : r.status === 'error' ? pc.red('\u2717') : pc.yellow('\u25CB');
    const name = r.name.padEnd(maxNameLen);
    const msg = r.message ? pc.dim(` ${r.message}`) : '';
    return `  ${icon} ${name}${msg}`;
  });

  const successCount = results.filter((r) => r.status === 'success').length;
  const errorCount = results.filter((r) => r.status === 'error').length;

  const footer = [];
  if (successCount > 0) footer.push(pc.green(`${successCount} succeeded`));
  if (errorCount > 0) footer.push(pc.red(`${errorCount} failed`));
  const skippedCount = results.length - successCount - errorCount;
  if (skippedCount > 0) footer.push(pc.yellow(`${skippedCount} skipped`));

  p.note(`${lines.join('\n')}\n\n${footer.join('  ')}`, title);
}

/**
 * Execute an array of Inquirer-style questions using @clack/prompts.
 * Provides compatibility with dynamic question arrays during migration.
 * @param {Array} questions - Array of Inquirer-style question objects
 * @returns {Promise<Object>} Object with answers keyed by question name
 */
 
export async function prompt(questions) {
  const answers = {};

  for (const question of questions) {
    const { type, name, message, choices, default: defaultValue, validate, when } = question;

    // Handle conditional questions via 'when' property
    if (when !== undefined) {
      const shouldAsk = typeof when === 'function' ? await when(answers) : when;
      if (!shouldAsk) continue;
    }

    let answer;

    switch (type) {
      case 'input': {
        answer = await text({
          message,
          default: typeof defaultValue === 'function' ? defaultValue(answers) : defaultValue,
          validate: validate
            ? (val) => {
                const result = validate(val, answers);
                if (result instanceof Promise) {
                  throw new TypeError('Async validation is not supported. Use synchronous validation.');
                }
                return result === true ? undefined : result;
              }
            : undefined,
        });
        break;
      }
      case 'confirm': {
        answer = await confirm({
          message,
          default: typeof defaultValue === 'function' ? defaultValue(answers) : defaultValue,
        });
        break;
      }
      case 'list': {
        answer = await select({
          message,
          choices: choices || [],
          default: typeof defaultValue === 'function' ? defaultValue(answers) : defaultValue,
        });
        break;
      }
      case 'checkbox': {
        answer = await multiselect({
          message,
          choices: choices || [],
          required: false,
        });
        break;
      }
      case 'password': {
        answer = await password({
          message,
          validate: validate
            ? (val) => {
                const result = validate(val, answers);
                if (result instanceof Promise) {
                  throw new TypeError('Async validation is not supported. Use synchronous validation.');
                }
                return result === true ? undefined : result;
              }
            : undefined,
        });
        break;
      }
      default: {
        answer = await text({
          message,
          default: typeof defaultValue === 'function' ? defaultValue(answers) : defaultValue,
        });
      }
    }

    answers[name] = answer;
  }

  return answers;
}
