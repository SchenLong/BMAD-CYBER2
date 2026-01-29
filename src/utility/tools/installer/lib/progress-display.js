/**
 * Progress Display - INST-031
 * Epic 4 - Installation Progress Visualization
 *
 * Provides visual feedback during installation including progress bars,
 * phase indicators, sub-step displays, and spinners.
 *
 * @module installer/lib/progress-display
 * @author BlackUnicorn.Tech
 * @version 1.0.0
 */

import { fileURLToPath } from 'url';
import chalk from 'chalk';

/**
 * @typedef {Object} Phase
 * @property {string} id - Phase identifier
 * @property {string} name - Human-readable phase name
 * @property {string} icon - Emoji icon for the phase
 */

/**
 * @typedef {Object} PhaseResult
 * @property {string} id - Phase identifier
 * @property {boolean} success - Whether phase completed successfully
 * @property {string} [error] - Error message if failed
 * @property {number} [duration] - Duration in milliseconds
 */

/**
 * @typedef {Object} Spinner
 * @property {function(): Spinner} start - Start the spinner
 * @property {function(string): Spinner} text - Update spinner text
 * @property {function(): Spinner} stop - Stop the spinner
 * @property {function(string=): Spinner} succeed - Stop with success message
 * @property {function(string=): Spinner} fail - Stop with failure message
 * @property {function(string=): Spinner} warn - Stop with warning message
 */

/**
 * Installation phases configuration
 */
export const PHASES = [
  { id: 'welcome', name: 'User Profile', icon: '\u{1F464}' },
  { id: 'modules', name: 'Module Selection', icon: '\u{1F4E6}' },
  { id: 'security', name: 'Security Configuration', icon: '\u{1F512}' },
  { id: 'llm', name: 'LLM Setup', icon: '\u{1F916}' },
  { id: 'token', name: 'Token Generation', icon: '\u{1F511}' },
  { id: 'pgp', name: 'PGP Setup (optional)', icon: '\u{270D}\u{FE0F}' },
  { id: 'health', name: 'Health Check', icon: '\u{2764}\u{FE0F}' }
];

/**
 * Default progress bar configuration
 */
export const DEFAULT_BAR_WIDTH = 20;
export const DEFAULT_FILLED_CHAR = '\u2588';
export const DEFAULT_EMPTY_CHAR = '\u2591';

/**
 * Gets a phase by its ID
 *
 * @param {string} phaseId - Phase identifier
 * @returns {Phase|undefined} Phase object or undefined
 */
export function getPhaseById(phaseId) {
  return PHASES.find(phase => phase.id === phaseId);
}

/**
 * Creates an ASCII progress bar
 *
 * @param {number} percentage - Completion percentage (0-100)
 * @param {Object} [options] - Options
 * @param {number} [options.width=20] - Bar width in characters
 * @param {string} [options.filledChar='\u2588'] - Character for filled portion
 * @param {string} [options.emptyChar='\u2591'] - Character for empty portion
 * @param {boolean} [options.showPercentage=true] - Show percentage after bar
 * @returns {string} ASCII progress bar string
 */
export function createProgressBar(percentage, options = {}) {
  const {
    width = DEFAULT_BAR_WIDTH,
    filledChar = DEFAULT_FILLED_CHAR,
    emptyChar = DEFAULT_EMPTY_CHAR,
    showPercentage = true
  } = options;

  const clampedPercentage = Math.max(0, Math.min(100, percentage));

  const filledCount = Math.round((clampedPercentage / 100) * width);
  const emptyCount = width - filledCount;

  const filled = filledChar.repeat(filledCount);
  const empty = emptyChar.repeat(emptyCount);
  const bar = '[' + filled + empty + ']';

  if (showPercentage) {
    return bar + ' ' + Math.round(clampedPercentage) + '%';
  }

  return bar;
}

/**
 * Creates a colored progress bar based on completion
 *
 * @param {number} percentage - Completion percentage (0-100)
 * @param {Object} [options] - Options
 * @returns {string} Colored ASCII progress bar
 */
export function createColoredProgressBar(percentage, options = {}) {
  const {
    width = DEFAULT_BAR_WIDTH,
    filledChar = DEFAULT_FILLED_CHAR,
    emptyChar = DEFAULT_EMPTY_CHAR,
    showPercentage = true
  } = options;

  const clampedPercentage = Math.max(0, Math.min(100, percentage));
  const filledCount = Math.round((clampedPercentage / 100) * width);
  const emptyCount = width - filledCount;

  const filled = filledChar.repeat(filledCount);
  const empty = emptyChar.repeat(emptyCount);

  let coloredFilled;
  if (clampedPercentage >= 100) {
    coloredFilled = chalk.green(filled);
  } else if (clampedPercentage >= 66) {
    coloredFilled = chalk.cyan(filled);
  } else if (clampedPercentage >= 33) {
    coloredFilled = chalk.yellow(filled);
  } else {
    coloredFilled = chalk.red(filled);
  }

  const bar = '[' + coloredFilled + chalk.dim(empty) + ']';

  if (showPercentage) {
    const percentText = Math.round(clampedPercentage) + '%';
    return bar + ' ' + percentText;
  }

  return bar;
}

/**
 * Displays a phase header with phase number and name
 *
 * @param {string} phaseId - Phase identifier
 * @param {number} phaseNum - Current phase number (1-indexed)
 * @param {number} total - Total number of phases
 * @returns {string} Formatted phase header string
 */
export function displayPhaseStart(phaseId, phaseNum, total) {
  const phase = getPhaseById(phaseId);

  if (!phase) {
    const message = 'Phase ' + phaseNum + '/' + total + ': Unknown phase (' + phaseId + ')';
    console.log(chalk.blue(message));
    return message;
  }

  const message = 'Phase ' + phaseNum + '/' + total + ': ' + phase.icon + ' ' + phase.name;
  console.log(chalk.blue.bold(message));
  return message;
}

/**
 * Displays a sub-step indicator
 *
 * @param {string} message - Sub-step message
 * @returns {string} Formatted sub-step string
 */
export function displaySubStep(message) {
  const formatted = '  \u2192 ' + message;
  console.log(chalk.dim(formatted));
  return formatted;
}

/**
 * Displays phase completion with checkmark
 *
 * @param {string} phaseId - Phase identifier
 * @returns {string} Formatted completion message
 */
export function displayPhaseComplete(phaseId) {
  const phase = getPhaseById(phaseId);
  const name = phase ? phase.name : phaseId;
  const message = '\u2713 ' + name + ' complete';
  console.log(chalk.green(message));
  return message;
}

/**
 * Displays phase error with X mark
 *
 * @param {string} phaseId - Phase identifier
 * @param {string} error - Error message
 * @returns {string} Formatted error message
 */
export function displayPhaseError(phaseId, error) {
  const phase = getPhaseById(phaseId);
  const name = phase ? phase.name : phaseId;
  const message = '\u2717 ' + name + ' failed: ' + error;
  console.log(chalk.red(message));
  return message;
}

/**
 * Displays overall progress with bar and phase count
 *
 * @param {number} completedPhases - Number of completed phases
 * @param {number} totalPhases - Total number of phases
 * @param {Object} [options] - Options
 * @param {boolean} [options.colored=true] - Use colored progress bar
 * @returns {string} Formatted progress string
 */
export function displayOverallProgress(completedPhases, totalPhases, options = {}) {
  const { colored = true } = options;

  const percentage = totalPhases > 0
    ? Math.round((completedPhases / totalPhases) * 100)
    : 0;

  const bar = colored
    ? createColoredProgressBar(percentage, { showPercentage: false })
    : createProgressBar(percentage, { showPercentage: false });

  const message = bar + ' ' + percentage + '% | Phase ' + completedPhases + '/' + totalPhases;
  console.log(message);
  return message;
}

/**
 * Creates a spinner for long-running operations
 *
 * @param {string} text - Initial spinner text
 * @returns {Spinner} Spinner object with control methods
 */
export function startSpinner(text) {
  const frames = ['|', '/', '-', '\\'];
  let frameIndex = 0;
  let intervalId = null;
  let currentText = text;
  let isSpinning = false;

  const clearLine = () => {
    process.stdout.write('\r' + ' '.repeat(80) + '\r');
  };

  const spinner = {
    start() {
      if (isSpinning) return this;
      isSpinning = true;
      process.stdout.write(chalk.cyan(frames[0]) + ' ' + currentText);
      intervalId = setInterval(() => {
        frameIndex = (frameIndex + 1) % frames.length;
        process.stdout.write('\r' + chalk.cyan(frames[frameIndex]) + ' ' + currentText);
      }, 100);
      return this;
    },

    text(newText) {
      currentText = newText;
      return this;
    },

    stop() {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
      isSpinning = false;
      clearLine();
      return this;
    },

    succeed(message) {
      this.stop();
      console.log(chalk.green('\u2713') + ' ' + (message || currentText));
      return this;
    },

    fail(message) {
      this.stop();
      console.log(chalk.red('\u2717') + ' ' + (message || currentText));
      return this;
    },

    warn(message) {
      this.stop();
      console.log(chalk.yellow('!') + ' ' + (message || currentText));
      return this;
    },

    isSpinning() {
      return isSpinning;
    }
  };

  return spinner.start();
}

/**
 * Stops a spinner with success or failure
 *
 * @param {Spinner} spinner - Spinner to stop
 * @param {boolean} success - Whether operation succeeded
 * @param {string} [message] - Optional message to display
 */
export function stopSpinner(spinner, success, message) {
  if (!spinner) return;

  if (success) {
    spinner.succeed(message);
  } else {
    spinner.fail(message);
  }
}

/**
 * Formats a duration in milliseconds to human-readable string
 *
 * @param {number} ms - Duration in milliseconds
 * @returns {string} Formatted duration
 */
export function formatDuration(ms) {
  if (ms < 1000) return ms + 'ms';
  if (ms < 60000) return (ms / 1000).toFixed(1) + 's';
  if (ms < 3600000) return (ms / 60000).toFixed(1) + 'm';
  return (ms / 3600000).toFixed(1) + 'h';
}

/**
 * Estimates time remaining based on progress
 *
 * @param {number} elapsedMs - Elapsed time in milliseconds
 * @param {number} completedPhases - Number of completed phases
 * @param {number} totalPhases - Total phases
 * @returns {string|null} Estimated time remaining or null if cannot estimate
 */
export function estimateTimeRemaining(elapsedMs, completedPhases, totalPhases) {
  if (completedPhases === 0 || totalPhases === 0) return null;
  if (completedPhases >= totalPhases) return '0s';

  const avgTimePerPhase = elapsedMs / completedPhases;
  const remainingPhases = totalPhases - completedPhases;
  const estimatedMs = avgTimePerPhase * remainingPhases;

  return formatDuration(Math.round(estimatedMs));
}

/**
 * Displays an installation summary
 *
 * @param {PhaseResult[]} results - Array of phase results
 * @param {Object} [options] - Options
 * @param {number} [options.totalDuration] - Total duration in milliseconds
 * @returns {string} Formatted summary string
 */
export function displaySummary(results, options = {}) {
  const { totalDuration } = options;

  const lines = [];
  const divider = '\u2500'.repeat(50);

  lines.push(divider);
  lines.push('Installation Summary');
  lines.push(divider);

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  for (const result of results) {
    const phase = getPhaseById(result.id);
    const name = phase ? phase.icon + ' ' + phase.name : result.id;

    if (result.success) {
      const duration = result.duration ? ' (' + formatDuration(result.duration) + ')' : '';
      lines.push('  ' + chalk.green('\u2713') + ' ' + name + chalk.dim(duration));
    } else {
      lines.push('  ' + chalk.red('\u2717') + ' ' + name);
      if (result.error) {
        lines.push('      ' + chalk.red(result.error));
      }
    }
  }

  lines.push(divider);

  const successCount = successful.length;
  const failCount = failed.length;
  const totalCount = results.length;

  if (failCount === 0) {
    lines.push(chalk.green('\u2713 All ' + successCount + ' phases completed successfully'));
  } else {
    lines.push(chalk.yellow('Completed: ' + successCount + '/' + totalCount + ' phases'));
    lines.push(chalk.red('Failed: ' + failCount + ' phase' + (failCount > 1 ? 's' : '')));
  }

  if (totalDuration) {
    lines.push(chalk.dim('Total time: ' + formatDuration(totalDuration)));
  }

  lines.push(divider);

  const summary = lines.join('\n');
  console.log(summary);
  return summary;
}

/**
 * Displays a welcome banner
 *
 * @param {string} [title='BMAD Installation Wizard'] - Banner title
 * @returns {string} Formatted banner string
 */
export function displayWelcomeBanner(title = 'BMAD Installation Wizard') {
  const divider = '\u2550'.repeat(50);
  const lines = [
    '',
    chalk.cyan(divider),
    chalk.cyan.bold('  ' + title),
    chalk.cyan(divider),
    ''
  ];

  const banner = lines.join('\n');
  console.log(banner);
  return banner;
}

/**
 * Displays a section header
 *
 * @param {string} title - Section title
 * @returns {string} Formatted section header
 */
export function displaySectionHeader(title) {
  const message = chalk.blue.bold('\n' + title);
  console.log(message);
  console.log(chalk.dim('\u2500'.repeat(title.length)));
  return title;
}

/**
 * Displays an info message
 *
 * @param {string} message - Message to display
 * @returns {string} Formatted message
 */
export function displayInfo(message) {
  const formatted = chalk.blue('i') + ' ' + message;
  console.log(formatted);
  return formatted;
}

/**
 * Displays a warning message
 *
 * @param {string} message - Warning message
 * @returns {string} Formatted message
 */
export function displayWarning(message) {
  const formatted = chalk.yellow('!') + ' ' + message;
  console.log(formatted);
  return formatted;
}

/**
 * Displays an error message
 *
 * @param {string} message - Error message
 * @returns {string} Formatted message
 */
export function displayError(message) {
  const formatted = chalk.red('\u2717') + ' ' + message;
  console.log(formatted);
  return formatted;
}

/**
 * Displays a success message
 *
 * @param {string} message - Success message
 * @returns {string} Formatted message
 */
export function displaySuccess(message) {
  const formatted = chalk.green('\u2713') + ' ' + message;
  console.log(formatted);
  return formatted;
}

/**
 * Clears the console
 */
export function clearConsole() {
  process.stdout.write('\x1B[2J\x1B[0f');
}

/**
 * Displays a list of items with bullets
 *
 * @param {string[]} items - Items to display
 * @param {Object} [options] - Options
 * @param {string} [options.bullet='\u2022'] - Bullet character
 * @param {number} [options.indent=2] - Indentation spaces
 * @returns {string} Formatted list
 */
export function displayList(items, options = {}) {
  const { bullet = '\u2022', indent = 2 } = options;
  const padding = ' '.repeat(indent);

  const lines = items.map(item => padding + bullet + ' ' + item);
  const output = lines.join('\n');
  console.log(output);
  return output;
}

// ESM Entry point detection for testing
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log('Progress Display - Standalone Test\n');

  displayWelcomeBanner();

  console.log('\nProgress Bar Examples:');
  console.log('  0%:  ', createProgressBar(0));
  console.log(' 25%:  ', createProgressBar(25));
  console.log(' 50%:  ', createProgressBar(50));
  console.log(' 75%:  ', createProgressBar(75));
  console.log('100%:  ', createProgressBar(100));

  console.log('\nColored Progress Bar Examples:');
  console.log('  0%:  ', createColoredProgressBar(0));
  console.log(' 25%:  ', createColoredProgressBar(25));
  console.log(' 50%:  ', createColoredProgressBar(50));
  console.log(' 75%:  ', createColoredProgressBar(75));
  console.log('100%:  ', createColoredProgressBar(100));

  console.log('\nPhase Display Examples:');
  displayPhaseStart('modules', 2, 7);
  displaySubStep('Installing intel-team...');
  displaySubStep('Installing legal-team...');
  displayPhaseComplete('modules');

  console.log('\nError Display:');
  displayPhaseError('security', 'Permission denied');

  console.log('\nOverall Progress:');
  displayOverallProgress(3, 7);

  console.log('\nSummary Example:');
  displaySummary([
    { id: 'welcome', success: true, duration: 1500 },
    { id: 'modules', success: true, duration: 5000 },
    { id: 'security', success: false, error: 'Permission denied' }
  ], { totalDuration: 6500 });
}
