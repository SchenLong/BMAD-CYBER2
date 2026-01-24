/**
 * Installation Logger
 * Epic 3, Story 3.1 - Core Installation System
 *
 * Provides comprehensive logging for installation operations with
 * multiple output formats and detailed error tracking.
 *
 * Author: Amelia (Developer)
 * Version: 1.0.0
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

/**
 * Installation Logging System
 * Handles detailed logging with multiple outputs and formats
 */
class InstallationLogger {
  constructor(options = {}) {
    this.options = {
      verbose: options.verbose || false,
      enableFileLogging: options.enableFileLogging !== false,
      enableConsoleLogging: options.enableConsoleLogging !== false,
      logDirectory: options.logDirectory || '.bmad-logs',
      logLevel: options.logLevel || 'info',
      maxLogFiles: options.maxLogFiles || 50,
      maxLogSize: options.maxLogSize || 10 * 1024 * 1024, // 10MB
      timestampFormat: options.timestampFormat || 'iso',
      ...options
    };

    // Log levels (higher number = more verbose)
    this.logLevels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3,
      trace: 4
    };

    this.currentLogLevel = this.logLevels[this.options.logLevel] || this.logLevels.info;

    // Current session info
    this.sessionId = this.generateSessionId();
    this.sessionStartTime = Date.now();
    this.logEntries = [];
    this.errorCount = 0;
    this.warningCount = 0;
    this.logFilePath = null;

    // Initialize logging
    this.initializeLogging();
  }

  /**
   * Initialize logging system
   */
  async initializeLogging() {
    try {
      if (this.options.enableFileLogging) {
        await this.setupFileLogging();
      }

      this.info('Installation Logger', `Logging session started: ${this.sessionId}`);
      this.debug('Configuration', `Log level: ${this.options.logLevel}, Verbose: ${this.options.verbose}`);

    } catch (error) {
      this.warn('Logger Setup', `Failed to initialize file logging: ${error.message}`);
    }
  }

  /**
   * Log error message
   * @param {string} category - Log category
   * @param {string} message - Error message
   * @param {Object} metadata - Additional metadata
   */
  error(category, message, metadata = {}) {
    this.errorCount++;
    this.log('error', category, message, {
      ...metadata,
      errorCount: this.errorCount
    });
  }

  /**
   * Log warning message
   * @param {string} category - Log category
   * @param {string} message - Warning message
   * @param {Object} metadata - Additional metadata
   */
  warn(category, message, metadata = {}) {
    this.warningCount++;
    this.log('warn', category, message, {
      ...metadata,
      warningCount: this.warningCount
    });
  }

  /**
   * Log info message
   * @param {string} category - Log category
   * @param {string} message - Info message
   * @param {Object} metadata - Additional metadata
   */
  info(category, message, metadata = {}) {
    this.log('info', category, message, metadata);
  }

  /**
   * Log debug message
   * @param {string} category - Log category
   * @param {string} message - Debug message
   * @param {Object} metadata - Additional metadata
   */
  debug(category, message, metadata = {}) {
    this.log('debug', category, message, metadata);
  }

  /**
   * Log trace message
   * @param {string} category - Log category
   * @param {string} message - Trace message
   * @param {Object} metadata - Additional metadata
   */
  trace(category, message, metadata = {}) {
    this.log('trace', category, message, metadata);
  }

  /**
   * Core logging method
   * @param {string} level - Log level
   * @param {string} category - Log category
   * @param {string} message - Log message
   * @param {Object} metadata - Additional metadata
   */
  log(level, category, message, metadata = {}) {
    // Check if this log level should be processed
    if (this.logLevels[level] > this.currentLogLevel) {
      return;
    }

    const timestamp = this.generateTimestamp();
    const logEntry = {
      sessionId: this.sessionId,
      timestamp: timestamp,
      level: level.toUpperCase(),
      category: category,
      message: message,
      metadata: metadata,
      sequenceNumber: this.logEntries.length + 1
    };

    // Store in memory
    this.logEntries.push(logEntry);

    // Output to console
    if (this.options.enableConsoleLogging) {
      this.logToConsole(logEntry);
    }

    // Output to file
    if (this.options.enableFileLogging && this.logFilePath) {
      this.logToFile(logEntry);
    }

    // Trim log entries if getting too large
    if (this.logEntries.length > 10000) {
      this.logEntries = this.logEntries.slice(-5000);
    }
  }

  /**
   * Log operation start
   * @param {string} operation - Operation name
   * @param {Object} context - Operation context
   * @returns {string} Operation ID for tracking
   */
  logOperationStart(operation, context = {}) {
    const operationId = this.generateOperationId();

    this.info('Operation Start', `Starting operation: ${operation}`, {
      operationId: operationId,
      operation: operation,
      context: context,
      operationType: 'start'
    });

    return operationId;
  }

  /**
   * Log operation completion
   * @param {string} operationId - Operation ID
   * @param {string} operation - Operation name
   * @param {Object} result - Operation result
   */
  logOperationComplete(operationId, operation, result = {}) {
    this.info('Operation Complete', `Completed operation: ${operation}`, {
      operationId: operationId,
      operation: operation,
      result: result,
      operationType: 'complete'
    });
  }

  /**
   * Log operation failure
   * @param {string} operationId - Operation ID
   * @param {string} operation - Operation name
   * @param {Error|string} error - Error information
   */
  logOperationFailure(operationId, operation, error) {
    const errorInfo = error instanceof Error
      ? { message: error.message, stack: error.stack, name: error.name }
      : { message: error };

    this.error('Operation Failed', `Failed operation: ${operation}`, {
      operationId: operationId,
      operation: operation,
      error: errorInfo,
      operationType: 'failure'
    });
  }

  /**
   * Log installation phase
   * @param {string} phase - Phase name
   * @param {string} action - Phase action (start, progress, complete, fail)
   * @param {Object} data - Phase data
   */
  logInstallationPhase(phase, action, data = {}) {
    const level = action === 'fail' ? 'error' : 'info';
    const message = `Installation phase ${action}: ${phase}`;

    this.log(level, 'Installation Phase', message, {
      phase: phase,
      action: action,
      phaseData: data,
      logType: 'installation_phase'
    });
  }

  /**
   * Log module operation
   * @param {string} moduleName - Module name
   * @param {string} operation - Operation type
   * @param {string} result - Operation result
   * @param {Object} details - Additional details
   */
  logModuleOperation(moduleName, operation, result, details = {}) {
    const level = result === 'success' ? 'info' : result === 'failure' ? 'error' : 'warn';
    const message = `Module ${operation}: ${moduleName} - ${result}`;

    this.log(level, 'Module Operation', message, {
      moduleName: moduleName,
      operation: operation,
      result: result,
      details: details,
      logType: 'module_operation'
    });
  }

  /**
   * Log dependency resolution
   * @param {string} type - Resolution type
   * @param {Object} resolution - Resolution details
   */
  logDependencyResolution(type, resolution) {
    this.info('Dependency Resolution', `${type} resolution applied`, {
      resolutionType: type,
      resolution: resolution,
      logType: 'dependency_resolution'
    });
  }

  /**
   * Log conflict detection
   * @param {string} conflictType - Type of conflict
   * @param {Object} conflict - Conflict details
   * @param {string} resolution - How it was resolved
   */
  logConflictDetection(conflictType, conflict, resolution = null) {
    const level = conflict.severity === 'critical' ? 'error' : 'warn';
    const message = `${conflictType} conflict detected: ${conflict.message}`;

    this.log(level, 'Conflict Detection', message, {
      conflictType: conflictType,
      conflict: conflict,
      resolution: resolution,
      logType: 'conflict_detection'
    });
  }

  /**
   * Log file operation
   * @param {string} operation - File operation
   * @param {string} filePath - File path
   * @param {string} result - Operation result
   * @param {Object} metadata - Additional metadata
   */
  logFileOperation(operation, filePath, result, metadata = {}) {
    const level = result === 'success' ? 'debug' : 'error';
    const message = `File ${operation}: ${filePath} - ${result}`;

    this.log(level, 'File Operation', message, {
      operation: operation,
      filePath: filePath,
      result: result,
      metadata: metadata,
      logType: 'file_operation'
    });
  }

  /**
   * Log performance metrics
   * @param {string} operation - Operation name
   * @param {number} duration - Duration in milliseconds
   * @param {Object} metrics - Additional metrics
   */
  logPerformance(operation, duration, metrics = {}) {
    this.debug('Performance', `${operation} completed in ${duration}ms`, {
      operation: operation,
      duration: duration,
      metrics: metrics,
      logType: 'performance'
    });
  }

  /**
   * Log to console
   */
  logToConsole(logEntry) {
    if (!this.options.enableConsoleLogging) return;

    const timestamp = this.formatTimestamp(logEntry.timestamp);
    const level = logEntry.level.padEnd(5);
    const category = logEntry.category.padEnd(15);

    let colorCode = '';
    let resetCode = '\x1b[0m';

    // Color coding for different log levels
    switch (logEntry.level) {
      case 'ERROR': colorCode = '\x1b[31m'; break; // Red
      case 'WARN':  colorCode = '\x1b[33m'; break; // Yellow
      case 'INFO':  colorCode = '\x1b[36m'; break; // Cyan
      case 'DEBUG': colorCode = '\x1b[90m'; break; // Gray
      case 'TRACE': colorCode = '\x1b[90m'; break; // Gray
    }

    const baseMessage = `${colorCode}[${timestamp}] ${level} ${category}: ${logEntry.message}${resetCode}`;

    // Add metadata if verbose or debug level
    if ((this.options.verbose || logEntry.level === 'DEBUG' || logEntry.level === 'TRACE')
        && Object.keys(logEntry.metadata).length > 0) {
      console.log(baseMessage);
      console.log(`${colorCode}  Metadata: ${JSON.stringify(logEntry.metadata, null, 2)}${resetCode}`);
    } else {
      console.log(baseMessage);
    }
  }

  /**
   * Log to file
   */
  async logToFile(logEntry) {
    if (!this.logFilePath) return;

    try {
      const logLine = this.formatLogEntry(logEntry);
      await fs.appendFile(this.logFilePath, logLine + '\n');

      // Check file size and rotate if necessary
      const stats = await fs.stat(this.logFilePath);
      if (stats.size > this.options.maxLogSize) {
        await this.rotateLogFile();
      }

    } catch (error) {
      // Fallback to console if file logging fails
      console.error(`Failed to write to log file: ${error.message}`);
    }
  }

  /**
   * Format log entry for file output
   */
  formatLogEntry(logEntry) {
    const timestamp = this.formatTimestamp(logEntry.timestamp);
    const base = `[${timestamp}] ${logEntry.level} [${logEntry.category}] ${logEntry.message}`;

    if (Object.keys(logEntry.metadata).length > 0) {
      return `${base} | ${JSON.stringify(logEntry.metadata)}`;
    }

    return base;
  }

  /**
   * Setup file logging
   */
  async setupFileLogging() {
    // Create log directory
    await fs.mkdir(this.options.logDirectory, { recursive: true });

    // Generate log file name
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const logFileName = `bmad-install-${timestamp}-${this.sessionId}.log`;
    this.logFilePath = path.join(this.options.logDirectory, logFileName);

    // Write initial log entry
    const initialEntry = {
      sessionId: this.sessionId,
      timestamp: Date.now(),
      level: 'INFO',
      category: 'Logger',
      message: 'Log file created',
      metadata: {
        logFile: this.logFilePath,
        sessionId: this.sessionId,
        startTime: this.sessionStartTime,
        options: this.options
      }
    };

    await this.logToFile(initialEntry);

    // Clean old log files
    await this.cleanOldLogFiles();
  }

  /**
   * Rotate log file when it gets too large
   */
  async rotateLogFile() {
    if (!this.logFilePath) return;

    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const rotatedPath = this.logFilePath.replace('.log', `-rotated-${timestamp}.log`);

      await fs.rename(this.logFilePath, rotatedPath);

      // Start new log file
      await this.setupFileLogging();

      this.info('Logger', `Log file rotated to: ${rotatedPath}`);

    } catch (error) {
      this.error('Logger', `Failed to rotate log file: ${error.message}`);
    }
  }

  /**
   * Clean old log files
   */
  async cleanOldLogFiles() {
    try {
      const files = await fs.readdir(this.options.logDirectory);
      const logFiles = files
        .filter(file => file.startsWith('bmad-install-') && file.endsWith('.log'))
        .map(file => ({
          name: file,
          path: path.join(this.options.logDirectory, file)
        }));

      if (logFiles.length <= this.options.maxLogFiles) {
        return;
      }

      // Get file stats and sort by creation time
      const fileStats = await Promise.all(
        logFiles.map(async (file) => {
          const stats = await fs.stat(file.path);
          return {
            ...file,
            created: stats.birthtime
          };
        })
      );

      // Sort by creation time (oldest first)
      fileStats.sort((a, b) => a.created - b.created);

      // Remove oldest files
      const filesToRemove = fileStats.slice(0, fileStats.length - this.options.maxLogFiles);
      for (const file of filesToRemove) {
        await fs.unlink(file.path);
        this.debug('Logger', `Removed old log file: ${file.name}`);
      }

    } catch (error) {
      this.debug('Logger', `Failed to clean old log files: ${error.message}`);
    }
  }

  /**
   * Generate session ID
   */
  generateSessionId() {
    const timestamp = Date.now().toString(36);
    const random = crypto.randomBytes(4).toString('hex');
    return `${timestamp}_${random}`;
  }

  /**
   * Generate operation ID
   */
  generateOperationId() {
    const timestamp = Date.now().toString(36);
    const random = crypto.randomBytes(2).toString('hex');
    return `op_${timestamp}_${random}`;
  }

  /**
   * Generate timestamp
   */
  generateTimestamp() {
    return Date.now();
  }

  /**
   * Format timestamp for display
   */
  formatTimestamp(timestamp) {
    const date = new Date(timestamp);

    switch (this.options.timestampFormat) {
      case 'iso':
        return date.toISOString();
      case 'local':
        return date.toLocaleString();
      case 'time':
        return date.toLocaleTimeString();
      default:
        return date.toISOString();
    }
  }

  /**
   * Get logging statistics
   * @returns {Object} Logging statistics
   */
  getStatistics() {
    const levelCounts = {};
    for (const level in this.logLevels) {
      levelCounts[level] = this.logEntries.filter(entry =>
        entry.level === level.toUpperCase()
      ).length;
    }

    return {
      sessionId: this.sessionId,
      sessionStartTime: this.sessionStartTime,
      sessionDuration: Date.now() - this.sessionStartTime,
      totalEntries: this.logEntries.length,
      errorCount: this.errorCount,
      warningCount: this.warningCount,
      levelCounts: levelCounts,
      logFilePath: this.logFilePath
    };
  }

  /**
   * Export logs to different formats
   * @param {string} format - Export format (json, csv, text)
   * @param {string} outputPath - Output file path
   * @returns {Promise<void>}
   */
  async exportLogs(format, outputPath) {
    try {
      let content = '';

      switch (format.toLowerCase()) {
        case 'json':
          content = JSON.stringify(this.logEntries, null, 2);
          break;

        case 'csv':
          content = this.convertLogsToCsv();
          break;

        case 'text':
          content = this.logEntries
            .map(entry => this.formatLogEntry(entry))
            .join('\n');
          break;

        default:
          throw new Error(`Unsupported export format: ${format}`);
      }

      await fs.writeFile(outputPath, content);
      this.info('Logger', `Logs exported to: ${outputPath}`);

    } catch (error) {
      this.error('Logger', `Failed to export logs: ${error.message}`);
      throw error;
    }
  }

  /**
   * Convert logs to CSV format
   */
  convertLogsToCsv() {
    const headers = ['Timestamp', 'Level', 'Category', 'Message', 'Metadata'];
    const rows = [headers.join(',')];

    for (const entry of this.logEntries) {
      const row = [
        `"${this.formatTimestamp(entry.timestamp)}"`,
        `"${entry.level}"`,
        `"${entry.category}"`,
        `"${entry.message.replace(/"/g, '""')}"`,
        `"${JSON.stringify(entry.metadata).replace(/"/g, '""')}"`
      ];
      rows.push(row.join(','));
    }

    return rows.join('\n');
  }

  /**
   * Flush all pending log operations
   */
  async flush() {
    // In this implementation, logs are written immediately
    // This method is here for compatibility and future enhancement
    this.debug('Logger', 'Log flush requested');
  }

  /**
   * Close logger and perform cleanup
   */
  async close() {
    this.info('Logger', `Logging session ended. Total entries: ${this.logEntries.length}`);

    // Final statistics
    const stats = this.getStatistics();
    this.info('Statistics', 'Session statistics', stats);

    await this.flush();
  }
}

module.exports = InstallationLogger;