/**
 * BMAD Progress Reporter Module
 * Epic 5: Story 5.5 - Progress Reporting System
 *
 * Provides comprehensive progress reporting capabilities for BMAD installation
 * and build processes including visual progress bars, ETA estimation, milestone
 * tracking, and multi-format output support.
 *
 * @author BlackUnicorn.Tech
 * @version 2.0.0
 * @module progress-reporter
 */

const { EventEmitter } = require("events");

/**
 * Progress status enumeration
 */
const ProgressStatus = {
    PENDING: "pending",
    RUNNING: "running",
    PAUSED: "paused",
    COMPLETED: "completed",
    FAILED: "failed",
    CANCELLED: "cancelled"
};

/**
 * Output format enumeration
 */
const OutputFormat = {
    CONSOLE: "console",
    JSON: "json",
    MINIMAL: "minimal",
    VERBOSE: "verbose",
    CI: "ci"
};

/**
 * Progress Reporter Class
 * Manages visual progress reporting with advanced features
 */
class ProgressReporter extends EventEmitter {
    /**
     * Create a new ProgressReporter instance
     * @param {Object} config - Configuration options
     */
    constructor(config = {}) {
        super();

        this.config = {
            outputFormat: config.outputFormat || OutputFormat.CONSOLE,
            showSpinner: config.showSpinner !== false,
            showPercentage: config.showPercentage !== false,
            showETA: config.showETA !== false,
            showElapsedTime: config.showElapsedTime !== false,
            progressBarWidth: config.progressBarWidth || 40,
            updateInterval: config.updateInterval || 100,
            useColors: config.useColors !== false,
            clearOnComplete: config.clearOnComplete !== false,
            indentLevel: config.indentLevel || 0,
            prefix: config.prefix || "",
            ...config
        };

        this.tasks = new Map();
        this.milestones = [];
        this.globalProgress = {
            current: 0,
            total: 0,
            startTime: null,
            endTime: null,
            status: ProgressStatus.PENDING
        };

        this.spinnerFrames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
        this.spinnerIndex = 0;
        this.spinnerInterval = null;
        this.lastRenderTime = 0;
        this.renderBuffer = "";
        this.isInteractive = process.stdout.isTTY && this.config.outputFormat === OutputFormat.CONSOLE;
    }

    /**
     * Start a new progress task
     * @param {string} taskId - Unique task identifier
     * @param {Object} options - Task options
     */
    startTask(taskId, options = {}) {
        const task = {
            id: taskId,
            name: options.name || taskId,
            total: options.total || 100,
            current: 0,
            status: ProgressStatus.RUNNING,
            startTime: Date.now(),
            endTime: null,
            message: options.message || "",
            metadata: options.metadata || {},
            parent: options.parent || null,
            children: [],
            samples: [],
            estimatedCompletion: null
        };

        this.tasks.set(taskId, task);

        // Link to parent if exists
        if (task.parent && this.tasks.has(task.parent)) {
            this.tasks.get(task.parent).children.push(taskId);
        }

        // Update global progress
        this._updateGlobalProgress();

        // Start spinner if first task
        if (this.tasks.size === 1 && this.config.showSpinner && this.isInteractive) {
            this._startSpinner();
        }

        this.emit("taskStart", task);
        this._render();

        return this;
    }

    /**
     * Update task progress
     * @param {string} taskId - Task identifier
     * @param {number} current - Current progress value
     * @param {Object} options - Update options
     */
    updateTask(taskId, current, options = {}) {
        const task = this.tasks.get(taskId);
        if (!task) return this;

        task.current = Math.min(current, task.total);
        task.message = options.message || task.message;

        // Record sample for ETA calculation
        task.samples.push({
            time: Date.now(),
            value: task.current
        });

        // Keep only last 10 samples
        if (task.samples.length > 10) {
            task.samples.shift();
        }

        // Calculate estimated completion time
        task.estimatedCompletion = this._calculateETA(task);

        // Update global progress
        this._updateGlobalProgress();

        this.emit("taskUpdate", task);
        this._render();

        return this;
    }

    /**
     * Increment task progress by a value
     * @param {string} taskId - Task identifier
     * @param {number} increment - Value to increment by
     * @param {Object} options - Update options
     */
    incrementTask(taskId, increment = 1, options = {}) {
        const task = this.tasks.get(taskId);
        if (!task) return this;

        return this.updateTask(taskId, task.current + increment, options);
    }

    /**
     * Complete a task
     * @param {string} taskId - Task identifier
     * @param {Object} options - Completion options
     */
    completeTask(taskId, options = {}) {
        const task = this.tasks.get(taskId);
        if (!task) return this;

        task.current = task.total;
        task.status = options.status || ProgressStatus.COMPLETED;
        task.endTime = Date.now();
        task.message = options.message || "Completed";

        // Update global progress
        this._updateGlobalProgress();

        this.emit("taskComplete", task);
        this._render();

        // Check if all tasks are complete
        if (this._allTasksComplete()) {
            this._onAllComplete();
        }

        return this;
    }

    /**
     * Fail a task
     * @param {string} taskId - Task identifier
     * @param {string|Error} error - Error information
     */
    failTask(taskId, error) {
        const task = this.tasks.get(taskId);
        if (!task) return this;

        task.status = ProgressStatus.FAILED;
        task.endTime = Date.now();
        task.error = error instanceof Error ? error.message : error;
        task.message = "Failed: " + task.error;

        // Update global progress
        this.globalProgress.status = ProgressStatus.FAILED;

        this.emit("taskFail", task);
        this._render();

        return this;
    }

    /**
     * Add a milestone
     * @param {string} name - Milestone name
     * @param {Object} options - Milestone options
     */
    addMilestone(name, options = {}) {
        const milestone = {
            name,
            timestamp: Date.now(),
            metadata: options.metadata || {},
            taskId: options.taskId || null
        };

        this.milestones.push(milestone);
        this.emit("milestone", milestone);

        if (this.config.outputFormat === OutputFormat.CONSOLE) {
            this._renderMilestone(milestone);
        }

        return this;
    }

    /**
     * Get progress summary
     */
    getSummary() {
        const tasksArray = Array.from(this.tasks.values());
        const completedTasks = tasksArray.filter(t => t.status === ProgressStatus.COMPLETED);
        const failedTasks = tasksArray.filter(t => t.status === ProgressStatus.FAILED);
        const runningTasks = tasksArray.filter(t => t.status === ProgressStatus.RUNNING);

        const totalDuration = this.globalProgress.endTime
            ? this.globalProgress.endTime - this.globalProgress.startTime
            : Date.now() - (this.globalProgress.startTime || Date.now());

        return {
            globalProgress: {
                current: this.globalProgress.current,
                total: this.globalProgress.total,
                percentage: this._calculatePercentage(this.globalProgress.current, this.globalProgress.total),
                status: this.globalProgress.status
            },
            tasks: {
                total: tasksArray.length,
                completed: completedTasks.length,
                failed: failedTasks.length,
                running: runningTasks.length
            },
            milestones: this.milestones,
            timing: {
                startTime: this.globalProgress.startTime,
                endTime: this.globalProgress.endTime,
                duration: totalDuration,
                formattedDuration: this._formatDuration(totalDuration)
            },
            taskDetails: tasksArray.map(t => ({
                id: t.id,
                name: t.name,
                progress: this._calculatePercentage(t.current, t.total),
                status: t.status,
                duration: t.endTime ? t.endTime - t.startTime : Date.now() - t.startTime
            }))
        };
    }

    /**
     * Export progress report
     * @param {string} format - Export format (json, text, markdown)
     */
    exportReport(format = "json") {
        const summary = this.getSummary();

        switch (format.toLowerCase()) {
            case "json":
                return JSON.stringify(summary, null, 2);

            case "text":
                return this._generateTextReport(summary);

            case "markdown":
                return this._generateMarkdownReport(summary);

            default:
                return JSON.stringify(summary, null, 2);
        }
    }

    /**
     * Reset all progress
     */
    reset() {
        this._stopSpinner();
        this.tasks.clear();
        this.milestones = [];
        this.globalProgress = {
            current: 0,
            total: 0,
            startTime: null,
            endTime: null,
            status: ProgressStatus.PENDING
        };
        this.emit("reset");
        return this;
    }

    /**
     * Destroy the reporter
     */
    destroy() {
        this._stopSpinner();
        this.removeAllListeners();
        this.tasks.clear();
        this.milestones = [];
    }

    // ==================== PRIVATE METHODS ====================

    /**
     * Update global progress based on all tasks
     * @private
     */
    _updateGlobalProgress() {
        const tasks = Array.from(this.tasks.values());

        if (tasks.length === 0) {
            this.globalProgress.current = 0;
            this.globalProgress.total = 0;
            return;
        }

        // Initialize start time on first update
        if (!this.globalProgress.startTime) {
            this.globalProgress.startTime = Date.now();
            this.globalProgress.status = ProgressStatus.RUNNING;
        }

        // Calculate weighted average progress
        let totalProgress = 0;
        let totalWeight = 0;

        for (const task of tasks) {
            const weight = task.total;
            totalProgress += (task.current / task.total) * weight;
            totalWeight += weight;
        }

        this.globalProgress.current = totalProgress;
        this.globalProgress.total = totalWeight;
    }

    /**
     * Calculate ETA based on progress samples
     * @private
     */
    _calculateETA(task) {
        if (task.samples.length < 2) return null;

        const firstSample = task.samples[0];
        const lastSample = task.samples[task.samples.length - 1];

        const timeDiff = lastSample.time - firstSample.time;
        const valueDiff = lastSample.value - firstSample.value;

        if (valueDiff <= 0 || timeDiff <= 0) return null;

        const rate = valueDiff / timeDiff;
        const remaining = task.total - task.current;
        const msRemaining = remaining / rate;

        return Date.now() + msRemaining;
    }

    /**
     * Calculate percentage
     * @private
     */
    _calculatePercentage(current, total) {
        if (total === 0) return 0;
        return Math.round((current / total) * 100);
    }

    /**
     * Format duration for display
     * @private
     */
    _formatDuration(ms) {
        if (ms < 1000) return ms + "ms";
        if (ms < 60000) return (ms / 1000).toFixed(1) + "s";
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        return minutes + "m " + seconds + "s";
    }

    /**
     * Format ETA for display
     * @private
     */
    _formatETA(timestamp) {
        if (!timestamp) return "calculating...";
        const remaining = timestamp - Date.now();
        if (remaining < 0) return "any moment...";
        return this._formatDuration(remaining);
    }

    /**
     * Check if all tasks are complete
     * @private
     */
    _allTasksComplete() {
        for (const task of this.tasks.values()) {
            if (task.status === ProgressStatus.RUNNING || task.status === ProgressStatus.PENDING) {
                return false;
            }
        }
        return true;
    }

    /**
     * Handle all tasks complete
     * @private
     */
    _onAllComplete() {
        this._stopSpinner();
        this.globalProgress.endTime = Date.now();

        const hasFailures = Array.from(this.tasks.values()).some(t => t.status === ProgressStatus.FAILED);
        this.globalProgress.status = hasFailures ? ProgressStatus.FAILED : ProgressStatus.COMPLETED;

        if (this.config.clearOnComplete && this.isInteractive) {
            this._clearLine();
        }

        this.emit("complete", this.getSummary());
    }

    /**
     * Start spinner animation
     * @private
     */
    _startSpinner() {
        if (this.spinnerInterval) return;

        this.spinnerInterval = setInterval(() => {
            this.spinnerIndex = (this.spinnerIndex + 1) % this.spinnerFrames.length;
            this._render();
        }, 80);
    }

    /**
     * Stop spinner animation
     * @private
     */
    _stopSpinner() {
        if (this.spinnerInterval) {
            clearInterval(this.spinnerInterval);
            this.spinnerInterval = null;
        }
    }

    /**
     * Render progress to output
     * @private
     */
    _render() {
        const now = Date.now();
        if (now - this.lastRenderTime < this.config.updateInterval) return;
        this.lastRenderTime = now;

        switch (this.config.outputFormat) {
            case OutputFormat.CONSOLE:
                this._renderConsole();
                break;
            case OutputFormat.JSON:
                this._renderJSON();
                break;
            case OutputFormat.MINIMAL:
                this._renderMinimal();
                break;
            case OutputFormat.VERBOSE:
                this._renderVerbose();
                break;
            case OutputFormat.CI:
                this._renderCI();
                break;
        }
    }

    /**
     * Render console output with progress bar
     * @private
     */
    _renderConsole() {
        if (!this.isInteractive) {
            this._renderMinimal();
            return;
        }

        const lines = [];
        const indent = "  ".repeat(this.config.indentLevel);

        for (const task of this.tasks.values()) {
            if (task.status !== ProgressStatus.RUNNING) continue;

            const percentage = this._calculatePercentage(task.current, task.total);
            const progressBar = this._createProgressBar(percentage);
            const spinner = this.config.showSpinner ? this.spinnerFrames[this.spinnerIndex] + " " : "";
            const percentStr = this.config.showPercentage ? " " + percentage + "%" : "";
            const etaStr = this.config.showETA && task.estimatedCompletion ? " ETA: " + this._formatETA(task.estimatedCompletion) : "";

            const line = indent + spinner + task.name + " " + progressBar + percentStr + etaStr;
            lines.push(this._colorize(line, task.status));
        }

        if (lines.length > 0) {
            this._clearLine();
            process.stdout.write(lines.join("\n"));
        }
    }

    /**
     * Create a visual progress bar
     * @private
     */
    _createProgressBar(percentage) {
        const width = this.config.progressBarWidth;
        const filled = Math.round((percentage / 100) * width);
        const empty = width - filled;

        const filledChar = this.config.useColors ? "\x1b[42m \x1b[0m" : "=";
        const emptyChar = this.config.useColors ? "\x1b[47m \x1b[0m" : "-";

        return "[" + filledChar.repeat(filled) + emptyChar.repeat(empty) + "]";
    }

    /**
     * Render JSON output
     * @private
     */
    _renderJSON() {
        const summary = this.getSummary();
        console.log(JSON.stringify(summary));
    }

    /**
     * Render minimal output
     * @private
     */
    _renderMinimal() {
        const percentage = this._calculatePercentage(this.globalProgress.current, this.globalProgress.total);
        console.log("Progress: " + percentage + "%");
    }

    /**
     * Render verbose output
     * @private
     */
    _renderVerbose() {
        for (const task of this.tasks.values()) {
            const percentage = this._calculatePercentage(task.current, task.total);
            const duration = this._formatDuration(Date.now() - task.startTime);
            console.log("[" + task.status.toUpperCase() + "] " + task.name + ": " + percentage + "% (" + duration + ")");
        }
    }

    /**
     * Render CI-friendly output
     * @private
     */
    _renderCI() {
        for (const task of this.tasks.values()) {
            if (task.status === ProgressStatus.COMPLETED) {
                console.log("::notice::" + task.name + " completed");
            } else if (task.status === ProgressStatus.FAILED) {
                console.log("::error::" + task.name + " failed: " + task.error);
            }
        }
    }

    /**
     * Render milestone
     * @private
     */
    _renderMilestone(milestone) {
        const prefix = this.config.useColors ? "\x1b[36m" : "";
        const suffix = this.config.useColors ? "\x1b[0m" : "";
        console.log(prefix + ">> Milestone: " + milestone.name + suffix);
    }

    /**
     * Clear current line
     * @private
     */
    _clearLine() {
        if (this.isInteractive) {
            process.stdout.write("\r\x1b[K");
        }
    }

    /**
     * Colorize text based on status
     * @private
     */
    _colorize(text, status) {
        if (!this.config.useColors) return text;

        const colors = {
            [ProgressStatus.RUNNING]: "\x1b[33m",
            [ProgressStatus.COMPLETED]: "\x1b[32m",
            [ProgressStatus.FAILED]: "\x1b[31m",
            [ProgressStatus.PAUSED]: "\x1b[36m"
        };

        const color = colors[status] || "";
        return color + text + "\x1b[0m";
    }

    /**
     * Generate text report
     * @private
     */
    _generateTextReport(summary) {
        let report = "=== Progress Report ===\n\n";
        report += "Overall Progress: " + summary.globalProgress.percentage + "%\n";
        report += "Status: " + summary.globalProgress.status + "\n";
        report += "Duration: " + summary.timing.formattedDuration + "\n\n";
        report += "Tasks:\n";

        for (const task of summary.taskDetails) {
            report += "  - " + task.name + ": " + task.progress + "% [" + task.status + "]\n";
        }

        if (summary.milestones.length > 0) {
            report += "\nMilestones:\n";
            for (const milestone of summary.milestones) {
                report += "  - " + milestone.name + "\n";
            }
        }

        return report;
    }

    /**
     * Generate markdown report
     * @private
     */
    _generateMarkdownReport(summary) {
        let report = "# Progress Report\n\n";
        report += "## Summary\n\n";
        report += "| Metric | Value |\n";
        report += "|--------|-------|\n";
        report += "| Progress | " + summary.globalProgress.percentage + "% |\n";
        report += "| Status | " + summary.globalProgress.status + " |\n";
        report += "| Duration | " + summary.timing.formattedDuration + " |\n";
        report += "| Tasks | " + summary.tasks.total + " |\n";
        report += "| Completed | " + summary.tasks.completed + " |\n";
        report += "| Failed | " + summary.tasks.failed + " |\n\n";

        report += "## Task Details\n\n";
        report += "| Task | Progress | Status |\n";
        report += "|------|----------|--------|\n";

        for (const task of summary.taskDetails) {
            report += "| " + task.name + " | " + task.progress + "% | " + task.status + " |\n";
        }

        if (summary.milestones.length > 0) {
            report += "\n## Milestones\n\n";
            for (const milestone of summary.milestones) {
                report += "- **" + milestone.name + "**\n";
            }
        }

        return report;
    }
}

/**
 * Create a simple progress bar function for quick use
 * @param {number} current - Current value
 * @param {number} total - Total value
 * @param {Object} options - Options
 */
function createProgressBar(current, total, options = {}) {
    const width = options.width || 40;
    const percentage = total === 0 ? 0 : Math.round((current / total) * 100);
    const filled = Math.round((percentage / 100) * width);
    const empty = width - filled;

    return "[" + "=".repeat(filled) + "-".repeat(empty) + "] " + percentage + "%";
}

module.exports = {
    ProgressReporter,
    ProgressStatus,
    OutputFormat,
    createProgressBar
};
