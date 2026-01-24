export = ProgressReporter;
/**
 * Progress Reporting System
 * Tracks and reports installation progress across multiple phases
 */
declare class ProgressReporter extends EventEmitter<[never]> {
    constructor(options?: {});
    options: {
        enableConsoleOutput: boolean;
        enableEvents: boolean;
        updateInterval: any;
        progressBarWidth: any;
        showPhaseNames: boolean;
        showTimeEstimates: boolean;
    };
    totalPhases: number;
    currentPhase: number;
    currentPhaseName: string;
    currentPhaseSteps: number;
    currentPhaseProgress: number;
    overallProgress: number;
    startTime: number | null;
    phaseStartTime: number | null;
    phases: any[];
    isActive: boolean;
    lastUpdateTime: number;
    /**
     * Initialize progress tracking for installation
     * @param {number} totalPhases - Total number of installation phases
     * @param {Array} phaseNames - Optional array of phase names
     */
    initializeProgress(totalPhases: number, phaseNames?: any[]): void;
    /**
     * Start a new installation phase
     * @param {string} phaseName - Name of the phase
     * @param {number} totalSteps - Total steps in this phase
     */
    startPhase(phaseName: string, totalSteps?: number): void;
    /**
     * Update progress within current phase
     * @param {string} stepDescription - Description of current step
     * @param {number} percentage - Progress percentage (0-100) for current phase
     */
    updateProgress(stepDescription: string, percentage: number): void;
    /**
     * Complete current phase
     * @param {string} completionMessage - Phase completion message
     */
    completePhase(completionMessage?: string): void;
    /**
     * Mark phase as failed
     * @param {string} errorMessage - Error message
     */
    failPhase(errorMessage: string): void;
    /**
     * Complete entire installation
     */
    completeInstallation(): void;
    /**
     * Update overall progress calculation
     */
    updateOverallProgress(): void;
    /**
     * Display current progress in console
     */
    displayProgress(stepDescription: any): void;
    /**
     * Generate ASCII progress bar
     */
    generateProgressBar(percentage: any, filledChar?: string, emptyChar?: string, customWidth?: null): string;
    /**
     * Display phases summary
     */
    displayPhasesSummary(): void;
    /**
     * Format duration in human-readable format
     */
    formatDuration(milliseconds: any): string;
    /**
     * Emit progress events
     */
    emitProgress(eventType: any, data: any): void;
    /**
     * Get current progress state
     * @returns {Object} Current progress information
     */
    getProgressState(): Object;
    /**
     * Reset progress reporter
     */
    reset(): void;
    /**
     * Create a child progress reporter for nested operations
     * @param {number} parentPhaseAllocation - Percentage of parent phase this child represents
     * @returns {ProgressReporter} Child progress reporter
     */
    createChildReporter(parentPhaseAllocation?: number): ProgressReporter;
    /**
     * Log a message with timestamp
     * @param {string} level - Log level (info, warn, error)
     * @param {string} message - Message to log
     */
    log(level: string, message: string): void;
}
import EventEmitter = require("events");
//# sourceMappingURL=progress-reporter.d.ts.map