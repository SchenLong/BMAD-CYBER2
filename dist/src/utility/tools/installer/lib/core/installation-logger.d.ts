export = InstallationLogger;
/**
 * Installation Logging System
 * Handles detailed logging with multiple outputs and formats
 */
declare class InstallationLogger {
    constructor(options?: {});
    options: {
        verbose: any;
        enableFileLogging: boolean;
        enableConsoleLogging: boolean;
        logDirectory: any;
        logLevel: any;
        maxLogFiles: any;
        maxLogSize: any;
        timestampFormat: any;
    };
    logLevels: {
        error: number;
        warn: number;
        info: number;
        debug: number;
        trace: number;
    };
    currentLogLevel: any;
    sessionId: string;
    sessionStartTime: number;
    logEntries: any[];
    errorCount: number;
    warningCount: number;
    logFilePath: string | null;
    /**
     * Initialize logging system
     */
    initializeLogging(): Promise<void>;
    /**
     * Log error message
     * @param {string} category - Log category
     * @param {string} message - Error message
     * @param {Object} metadata - Additional metadata
     */
    error(category: string, message: string, metadata?: Object): void;
    /**
     * Log warning message
     * @param {string} category - Log category
     * @param {string} message - Warning message
     * @param {Object} metadata - Additional metadata
     */
    warn(category: string, message: string, metadata?: Object): void;
    /**
     * Log info message
     * @param {string} category - Log category
     * @param {string} message - Info message
     * @param {Object} metadata - Additional metadata
     */
    info(category: string, message: string, metadata?: Object): void;
    /**
     * Log debug message
     * @param {string} category - Log category
     * @param {string} message - Debug message
     * @param {Object} metadata - Additional metadata
     */
    debug(category: string, message: string, metadata?: Object): void;
    /**
     * Log trace message
     * @param {string} category - Log category
     * @param {string} message - Trace message
     * @param {Object} metadata - Additional metadata
     */
    trace(category: string, message: string, metadata?: Object): void;
    /**
     * Core logging method
     * @param {string} level - Log level
     * @param {string} category - Log category
     * @param {string} message - Log message
     * @param {Object} metadata - Additional metadata
     */
    log(level: string, category: string, message: string, metadata?: Object): void;
    /**
     * Log operation start
     * @param {string} operation - Operation name
     * @param {Object} context - Operation context
     * @returns {string} Operation ID for tracking
     */
    logOperationStart(operation: string, context?: Object): string;
    /**
     * Log operation completion
     * @param {string} operationId - Operation ID
     * @param {string} operation - Operation name
     * @param {Object} result - Operation result
     */
    logOperationComplete(operationId: string, operation: string, result?: Object): void;
    /**
     * Log operation failure
     * @param {string} operationId - Operation ID
     * @param {string} operation - Operation name
     * @param {Error|string} error - Error information
     */
    logOperationFailure(operationId: string, operation: string, error: Error | string): void;
    /**
     * Log installation phase
     * @param {string} phase - Phase name
     * @param {string} action - Phase action (start, progress, complete, fail)
     * @param {Object} data - Phase data
     */
    logInstallationPhase(phase: string, action: string, data?: Object): void;
    /**
     * Log module operation
     * @param {string} moduleName - Module name
     * @param {string} operation - Operation type
     * @param {string} result - Operation result
     * @param {Object} details - Additional details
     */
    logModuleOperation(moduleName: string, operation: string, result: string, details?: Object): void;
    /**
     * Log dependency resolution
     * @param {string} type - Resolution type
     * @param {Object} resolution - Resolution details
     */
    logDependencyResolution(type: string, resolution: Object): void;
    /**
     * Log conflict detection
     * @param {string} conflictType - Type of conflict
     * @param {Object} conflict - Conflict details
     * @param {string} resolution - How it was resolved
     */
    logConflictDetection(conflictType: string, conflict: Object, resolution?: string): void;
    /**
     * Log file operation
     * @param {string} operation - File operation
     * @param {string} filePath - File path
     * @param {string} result - Operation result
     * @param {Object} metadata - Additional metadata
     */
    logFileOperation(operation: string, filePath: string, result: string, metadata?: Object): void;
    /**
     * Log performance metrics
     * @param {string} operation - Operation name
     * @param {number} duration - Duration in milliseconds
     * @param {Object} metrics - Additional metrics
     */
    logPerformance(operation: string, duration: number, metrics?: Object): void;
    /**
     * Log to console
     */
    logToConsole(logEntry: any): void;
    /**
     * Log to file
     */
    logToFile(logEntry: any): Promise<void>;
    /**
     * Format log entry for file output
     */
    formatLogEntry(logEntry: any): string;
    /**
     * Setup file logging
     */
    setupFileLogging(): Promise<void>;
    /**
     * Rotate log file when it gets too large
     */
    rotateLogFile(): Promise<void>;
    /**
     * Clean old log files
     */
    cleanOldLogFiles(): Promise<void>;
    /**
     * Generate session ID
     */
    generateSessionId(): string;
    /**
     * Generate operation ID
     */
    generateOperationId(): string;
    /**
     * Generate timestamp
     */
    generateTimestamp(): number;
    /**
     * Format timestamp for display
     */
    formatTimestamp(timestamp: any): string;
    /**
     * Get logging statistics
     * @returns {Object} Logging statistics
     */
    getStatistics(): Object;
    /**
     * Export logs to different formats
     * @param {string} format - Export format (json, csv, text)
     * @param {string} outputPath - Output file path
     * @returns {Promise<void>}
     */
    exportLogs(format: string, outputPath: string): Promise<void>;
    /**
     * Convert logs to CSV format
     */
    convertLogsToCsv(): string;
    /**
     * Flush all pending log operations
     */
    flush(): Promise<void>;
    /**
     * Close logger and perform cleanup
     */
    close(): Promise<void>;
}
//# sourceMappingURL=installation-logger.d.ts.map