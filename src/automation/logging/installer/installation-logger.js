/**
 * BMAD Installation Logger Module
 * Epic 5: Story 5.5 - Installation Logging System
 * @author BlackUnicorn.Tech
 * @version 2.0.0
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { EventEmitter } = require("events");

const LogLevel = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3, CRITICAL: 4 };
const LogLevelNames = { 0: "DEBUG", 1: "INFO", 2: "WARN", 3: "ERROR", 4: "CRITICAL" };

class InstallationLogger extends EventEmitter {
    constructor(config = {}) {
        super();
        this.config = {
            logLevel: config.logLevel ?? LogLevel.INFO,
            logDirectory: config.logDirectory || "./logs/installation",
            maxLogSize: config.maxLogSize || 50 * 1024 * 1024,
            maxLogFiles: config.maxLogFiles || 10,
            enableConsole: config.enableConsole !== false,
            enableFile: config.enableFile !== false,
            enableAudit: config.enableAudit !== false,
            timestampFormat: config.timestampFormat || "ISO",
            colorOutput: config.colorOutput !== false,
            structuredLogs: config.structuredLogs !== false,
            sessionId: config.sessionId || this._generateSessionId(),
            correlationId: config.correlationId || null,
            ...config
        };
        this.logs = [];
        this.auditTrail = [];
        this.progressTrackers = new Map();
        this.metrics = { totalLogs: 0, logsByLevel: { DEBUG: 0, INFO: 0, WARN: 0, ERROR: 0, CRITICAL: 0 }, startTime: Date.now(), errors: [], warnings: [] };
        this.currentLogFile = null;
        this.logFileStream = null;
        this.auditFileStream = null;
        this.initialized = false;
        this._inheritedContext = {};
    }

    async initialize() {
        if (this.initialized) return this;
        try {
            if (this.config.enableFile) { await this._ensureLogDirectory(); await this._initializeLogFile(); }
            if (this.config.enableAudit) { await this._initializeAuditFile(); }
            this.initialized = true;
            this.info("Installation logger initialized", { sessionId: this.config.sessionId, logLevel: LogLevelNames[this.config.logLevel] });
            return this;
        } catch (error) { console.error("[InstallationLogger] Failed to initialize:", error); throw error; }
    }

    debug(message, context = {}) { return this._log(LogLevel.DEBUG, message, context); }
    info(message, context = {}) { return this._log(LogLevel.INFO, message, context); }
    warn(message, context = {}) { return this._log(LogLevel.WARN, message, context); }
    error(message, context = {}) {
        if (context instanceof Error) { context = { errorName: context.name, errorMessage: context.message, stackTrace: context.stack }; }
        return this._log(LogLevel.ERROR, message, context);
    }
    critical(message, context = {}) { return this._log(LogLevel.CRITICAL, message, context); }

    createProgressTracker(trackerId, options = {}) {
        const tracker = new ProgressTracker(trackerId, { logger: this, totalSteps: options.totalSteps || 100, description: options.description || trackerId, ...options });
        this.progressTrackers.set(trackerId, tracker);
        this.audit("PROGRESS_TRACKER_CREATED", { trackerId, description: options.description, totalSteps: options.totalSteps });
        return tracker;
    }

    getProgressTracker(trackerId) { return this.progressTrackers.get(trackerId); }

    audit(action, details = {}) {
        if (!this.config.enableAudit) return;
        const auditEntry = { timestamp: new Date().toISOString(), sessionId: this.config.sessionId, correlationId: this.config.correlationId, action, details, checksum: null };
        auditEntry.checksum = this._generateChecksum(auditEntry);
        this.auditTrail.push(auditEntry);
        this._writeAuditEntry(auditEntry);
        this.emit("audit", auditEntry);
        return auditEntry;
    }

    startOperation(operationId, metadata = {}) {
        const operation = { id: operationId, startTime: Date.now(), metadata, status: "running" };
        this.info("Operation started: " + operationId, metadata);
        this.audit("OPERATION_STARTED", { operationId, metadata });
        return { end: (result = {}) => this._endOperation(operation, result), fail: (error) => this._failOperation(operation, error) };
    }

    child(context = {}) {
        const childLogger = new InstallationLogger({ ...this.config, parentSessionId: this.config.sessionId, sessionId: this._generateSessionId(), correlationId: this.config.correlationId || this.config.sessionId });
        childLogger._inheritedContext = context;
        childLogger.initialized = true;
        childLogger.logFileStream = this.logFileStream;
        childLogger.auditFileStream = this.auditFileStream;
        return childLogger;
    }

    getSummary() {
        const duration = Date.now() - this.metrics.startTime;
        return {
            sessionId: this.config.sessionId,
            duration: { ms: duration, formatted: this._formatDuration(duration) },
            metrics: { totalLogs: this.metrics.totalLogs, byLevel: { ...this.metrics.logsByLevel }, errorCount: this.metrics.errors.length, warningCount: this.metrics.warnings.length },
            progressTrackers: Array.from(this.progressTrackers.entries()).map(([id, tracker]) => ({ id, progress: tracker.getProgress(), status: tracker.status })),
            auditTrail: { totalEntries: this.auditTrail.length, actions: [...new Set(this.auditTrail.map(a => a.action))] }
        };
    }

    exportLogs(format = "json") {
        switch (format.toLowerCase()) {
            case "json": return JSON.stringify(this.logs, null, 2);
            case "csv": return this._exportToCSV();
            case "text": return this._exportToText();
            default: throw new Error("Unsupported export format: " + format);
        }
    }

    exportAuditTrail() { return { sessionId: this.config.sessionId, exportedAt: new Date().toISOString(), entries: this.auditTrail, integrityVerified: this._verifyAuditIntegrity() }; }

    async shutdown() {
        this.info("Installation logger shutting down", { summary: this.getSummary() });
        this.audit("LOGGER_SHUTDOWN", { summary: this.getSummary() });
        if (this.logFileStream) { await new Promise((resolve) => { this.logFileStream.end(resolve); }); }
        if (this.auditFileStream) { await new Promise((resolve) => { this.auditFileStream.end(resolve); }); }
        for (const tracker of this.progressTrackers.values()) { tracker.complete(); }
        this.progressTrackers.clear();
        this.emit("shutdown");
        this.removeAllListeners();
    }

    _log(level, message, context = {}) {
        if (level < this.config.logLevel) return null;
        const logEntry = { timestamp: this._getTimestamp(), level: LogLevelNames[level], levelValue: level, sessionId: this.config.sessionId, correlationId: this.config.correlationId, message, context: { ...this._inheritedContext, ...context } };
        this.metrics.totalLogs++;
        this.metrics.logsByLevel[logEntry.level]++;
        if (level >= LogLevel.ERROR) { this.metrics.errors.push({ timestamp: logEntry.timestamp, message, context }); }
        else if (level === LogLevel.WARN) { this.metrics.warnings.push({ timestamp: logEntry.timestamp, message, context }); }
        this.logs.push(logEntry);
        if (this.config.enableConsole) { this._writeToConsole(logEntry); }
        if (this.config.enableFile && this.logFileStream) { this._writeToFile(logEntry); }
        this.emit("log", logEntry);
        return logEntry;
    }

    _writeToConsole(entry) {
        const colors = { DEBUG: "\x1b[36m", INFO: "\x1b[32m", WARN: "\x1b[33m", ERROR: "\x1b[31m", CRITICAL: "\x1b[35m" };
        const reset = "\x1b[0m";
        const color = this.config.colorOutput ? colors[entry.level] : "";
        const resetCode = this.config.colorOutput ? reset : "";
        const prefix = "[" + entry.timestamp + "] " + color + "[" + entry.level + "]" + resetCode;
        const contextStr = Object.keys(entry.context).length > 0 ? " " + JSON.stringify(entry.context) : "";
        console.log(prefix + " " + entry.message + contextStr);
    }

    _writeToFile(entry) {
        if (!this.logFileStream) return;
        const line = this.config.structuredLogs ? JSON.stringify(entry) + "\n" : "[" + entry.timestamp + "] [" + entry.level + "] " + entry.message + " " + JSON.stringify(entry.context) + "\n";
        this.logFileStream.write(line);
        this._checkLogRotation();
    }

    _writeAuditEntry(entry) { if (!this.auditFileStream) return; this.auditFileStream.write(JSON.stringify(entry) + "\n"); }
    _generateSessionId() { return "install-" + Date.now() + "-" + crypto.randomBytes(4).toString("hex"); }
    _getTimestamp() { const now = new Date(); return this.config.timestampFormat === "ISO" ? now.toISOString() : now.toLocaleString(); }
    async _ensureLogDirectory() { const dir = this.config.logDirectory; if (!fs.existsSync(dir)) { fs.mkdirSync(dir, { recursive: true }); } }

    async _initializeLogFile() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        this.currentLogFile = path.join(this.config.logDirectory, "installation-" + timestamp + ".log");
        this.logFileStream = fs.createWriteStream(this.currentLogFile, { flags: "a", encoding: "utf8" });
    }

    async _initializeAuditFile() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const auditFile = path.join(this.config.logDirectory, "audit-" + timestamp + ".log");
        this.auditFileStream = fs.createWriteStream(auditFile, { flags: "a", encoding: "utf8" });
    }

    _checkLogRotation() {
        if (!this.currentLogFile) return;
        try { const stats = fs.statSync(this.currentLogFile); if (stats.size >= this.config.maxLogSize) { this._rotateLogFile(); } } catch (error) { /* File may not exist yet */ }
    }

    _rotateLogFile() {
        if (this.logFileStream) { this.logFileStream.end(); }
        const rotatedFile = this.currentLogFile + "." + Date.now();
        fs.renameSync(this.currentLogFile, rotatedFile);
        this._cleanupOldLogs();
        this.logFileStream = fs.createWriteStream(this.currentLogFile, { flags: "a", encoding: "utf8" });
    }

    _cleanupOldLogs() {
        const files = fs.readdirSync(this.config.logDirectory).filter(f => f.startsWith("installation-")).map(f => ({ name: f, path: path.join(this.config.logDirectory, f), mtime: fs.statSync(path.join(this.config.logDirectory, f)).mtime })).sort((a, b) => b.mtime - a.mtime);
        while (files.length > this.config.maxLogFiles) { const oldest = files.pop(); fs.unlinkSync(oldest.path); }
    }

    _generateChecksum(entry) { const data = JSON.stringify({ timestamp: entry.timestamp, sessionId: entry.sessionId, action: entry.action, details: entry.details }); return crypto.createHash("sha256").update(data).digest("hex").slice(0, 16); }

    _verifyAuditIntegrity() {
        return this.auditTrail.every(entry => {
            const checksum = entry.checksum;
            const entryWithoutChecksum = { timestamp: entry.timestamp, sessionId: entry.sessionId, correlationId: entry.correlationId, action: entry.action, details: entry.details, checksum: null };
            const expectedChecksum = this._generateChecksum(entryWithoutChecksum);
            return checksum === expectedChecksum;
        });
    }

    _endOperation(operation, result) {
        const duration = Date.now() - operation.startTime;
        operation.status = "completed"; operation.duration = duration; operation.result = result;
        this.info("Operation completed: " + operation.id, { duration: duration + "ms", ...result });
        this.audit("OPERATION_COMPLETED", { operationId: operation.id, duration, result });
        return operation;
    }

    _failOperation(operation, error) {
        const duration = Date.now() - operation.startTime;
        operation.status = "failed"; operation.duration = duration; operation.error = error;
        this.error("Operation failed: " + operation.id, { duration: duration + "ms", error: error.message || error });
        this.audit("OPERATION_FAILED", { operationId: operation.id, duration, error: error.message || error });
        return operation;
    }

    _formatDuration(ms) { if (ms < 1000) return ms + "ms"; if (ms < 60000) return (ms / 1000).toFixed(2) + "s"; const minutes = Math.floor(ms / 60000); const seconds = ((ms % 60000) / 1000).toFixed(0); return minutes + "m " + seconds + "s"; }

    _exportToCSV() {
        const headers = "timestamp,level,sessionId,message,context\n";
        const rows = this.logs.map(log => { const msg = log.message.replace(/"/g, '""'); const ctx = JSON.stringify(log.context).replace(/"/g, '""'); return '"' + log.timestamp + '","' + log.level + '","' + log.sessionId + '","' + msg + '","' + ctx + '"'; }).join("\n");
        return headers + rows;
    }

    _exportToText() { return this.logs.map(log => "[" + log.timestamp + "] [" + log.level + "] " + log.message).join("\n"); }
}

class ProgressTracker {
    constructor(id, options = {}) {
        this.id = id; this.logger = options.logger; this.totalSteps = options.totalSteps || 100; this.description = options.description || id;
        this.currentStep = 0; this.status = "pending"; this.startTime = null; this.endTime = null; this.steps = []; this.metadata = {};
    }

    start() { this.status = "running"; this.startTime = Date.now(); if (this.logger) { this.logger.info("Progress started: " + this.description, { trackerId: this.id, totalSteps: this.totalSteps }); } return this; }

    update(step, message = "") {
        this.currentStep = step;
        const percentComplete = Math.round((step / this.totalSteps) * 100);
        this.steps.push({ step, message, timestamp: Date.now(), percentComplete });
        if (this.logger) { this.logger.debug("Progress: " + this.description, { trackerId: this.id, step, total: this.totalSteps, percentComplete: percentComplete + "%", message }); }
        return this;
    }

    increment(message = "") { return this.update(this.currentStep + 1, message); }

    complete(metadata = {}) {
        this.status = "completed"; this.currentStep = this.totalSteps; this.endTime = Date.now(); this.metadata = { ...this.metadata, ...metadata };
        if (this.logger) { this.logger.info("Progress completed: " + this.description, { trackerId: this.id, duration: this.getDuration(), totalSteps: this.totalSteps }); }
        return this;
    }

    fail(error) {
        this.status = "failed"; this.endTime = Date.now(); this.metadata.error = error;
        if (this.logger) { this.logger.error("Progress failed: " + this.description, { trackerId: this.id, error: error.message || error, lastStep: this.currentStep }); }
        return this;
    }

    getProgress() { return { current: this.currentStep, total: this.totalSteps, percentage: Math.round((this.currentStep / this.totalSteps) * 100), status: this.status }; }
    getDuration() { if (!this.startTime) return 0; const end = this.endTime || Date.now(); return end - this.startTime; }
}

module.exports = { InstallationLogger, ProgressTracker, LogLevel, LogLevelNames };
