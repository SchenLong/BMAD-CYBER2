import chalk from 'chalk';

/**
 * Logging utility with colored output
 * @description Provides standardized logging methods with color-coded prefixes
 * for different message types. Debug messages only appear when DEBUG env var is set.
 * @type {Object}
 * @property {Function} info - Logs an info message with blue prefix
 * @property {Function} success - Logs a success message with green prefix
 * @property {Function} warn - Logs a warning message with yellow prefix
 * @property {Function} error - Logs an error message with red prefix
 * @property {Function} debug - Logs a debug message (only when DEBUG env var is set)
 * @example
 * import { logger } from './logger.js';
 *
 * logger.info('Starting installation...');
 * logger.success('Installation complete!');
 * logger.warn('No checksum file found');
 * logger.error('Download failed');
 *
 * // Debug logging (requires DEBUG=1 or DEBUG=true)
 * logger.debug('Detailed debug information');
 */
export const logger = {
  info: (msg) => console.log(chalk.blue('i'), msg),
  success: (msg) => console.log(chalk.green('v'), msg),
  warn: (msg) => console.log(chalk.yellow('!'), msg),
  error: (msg) => console.log(chalk.red('x'), msg),
  debug: (msg) => {
    if (process.env.DEBUG) {
      console.log(chalk.gray('[DEBUG]'), msg);
    }
  }
};
