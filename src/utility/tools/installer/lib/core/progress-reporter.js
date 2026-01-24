/**
 * Progress Reporter
 * Epic 3, Story 3.1 - Core Installation System
 *
 * Provides real-time progress reporting for installation operations.
 * Tracks phases, substeps, and overall completion percentage.
 *
 * Author: Amelia (Developer)
 * Version: 1.0.0
 */

const EventEmitter = require('events');

/**
 * Progress Reporting System
 * Tracks and reports installation progress across multiple phases
 */
class ProgressReporter extends EventEmitter {
  constructor(options = {}) {
    super();

    this.options = {
      enableConsoleOutput: options.enableConsoleOutput !== false,
      enableEvents: options.enableEvents !== false,
      updateInterval: options.updateInterval || 100, // ms
      progressBarWidth: options.progressBarWidth || 40,
      showPhaseNames: options.showPhaseNames !== false,
      showTimeEstimates: options.showTimeEstimates !== false,
      ...options
    };

    // Progress tracking state
    this.totalPhases = 0;
    this.currentPhase = 0;
    this.currentPhaseName = '';
    this.currentPhaseSteps = 0;
    this.currentPhaseProgress = 0;
    this.overallProgress = 0;
    this.startTime = null;
    this.phaseStartTime = null;
    this.phases = [];
    this.isActive = false;
    this.lastUpdateTime = 0;
  }

  /**
   * Initialize progress tracking for installation
   * @param {number} totalPhases - Total number of installation phases
   * @param {Array} phaseNames - Optional array of phase names
   */
  initializeProgress(totalPhases, phaseNames = []) {
    this.totalPhases = totalPhases;
    this.currentPhase = 0;
    this.currentPhaseName = '';
    this.currentPhaseSteps = 0;
    this.currentPhaseProgress = 0;
    this.overallProgress = 0;
    this.startTime = Date.now();
    this.phaseStartTime = null;
    this.isActive = true;
    this.phases = phaseNames.map((name, index) => ({
      number: index + 1,
      name: name,
      started: false,
      completed: false,
      startTime: null,
      endTime: null,
      progress: 0,
      steps: 0
    }));

    this.emitProgress('initialized', {
      totalPhases: this.totalPhases,
      phaseNames: phaseNames
    });

    if (this.options.enableConsoleOutput) {
      console.log(`\n🚀 Installation Progress: 0 of ${totalPhases} phases`);
      if (phaseNames.length > 0) {
        console.log(`📋 Phases: ${phaseNames.join(' → ')}`);
      }
      console.log(''.padEnd(60, '─'));
    }
  }

  /**
   * Start a new installation phase
   * @param {string} phaseName - Name of the phase
   * @param {number} totalSteps - Total steps in this phase
   */
  startPhase(phaseName, totalSteps = 1) {
    this.currentPhase++;
    this.currentPhaseName = phaseName;
    this.currentPhaseSteps = totalSteps;
    this.currentPhaseProgress = 0;
    this.phaseStartTime = Date.now();

    // Update phase tracking
    const phaseIndex = this.currentPhase - 1;
    if (this.phases[phaseIndex]) {
      this.phases[phaseIndex].started = true;
      this.phases[phaseIndex].startTime = this.phaseStartTime;
      this.phases[phaseIndex].steps = totalSteps;
    }

    this.updateOverallProgress();

    this.emitProgress('phase_started', {
      phase: this.currentPhase,
      phaseName: phaseName,
      totalSteps: totalSteps
    });

    if (this.options.enableConsoleOutput) {
      const phaseInfo = this.options.showPhaseNames ? ` - ${phaseName}` : '';
      console.log(`\n📍 Phase ${this.currentPhase}/${this.totalPhases}${phaseInfo}`);
    }
  }

  /**
   * Update progress within current phase
   * @param {string} stepDescription - Description of current step
   * @param {number} percentage - Progress percentage (0-100) for current phase
   */
  updateProgress(stepDescription, percentage) {
    this.currentPhaseProgress = Math.min(100, Math.max(0, percentage));

    // Update phase tracking
    const phaseIndex = this.currentPhase - 1;
    if (this.phases[phaseIndex]) {
      this.phases[phaseIndex].progress = this.currentPhaseProgress;
    }

    this.updateOverallProgress();

    // Throttle updates
    const now = Date.now();
    if (now - this.lastUpdateTime >= this.options.updateInterval) {
      this.lastUpdateTime = now;

      this.emitProgress('progress_updated', {
        phase: this.currentPhase,
        phaseName: this.currentPhaseName,
        stepDescription: stepDescription,
        phaseProgress: this.currentPhaseProgress,
        overallProgress: this.overallProgress
      });

      if (this.options.enableConsoleOutput) {
        this.displayProgress(stepDescription);
      }
    }
  }

  /**
   * Complete current phase
   * @param {string} completionMessage - Phase completion message
   */
  completePhase(completionMessage = 'Phase completed') {
    this.currentPhaseProgress = 100;

    // Update phase tracking
    const phaseIndex = this.currentPhase - 1;
    if (this.phases[phaseIndex]) {
      this.phases[phaseIndex].completed = true;
      this.phases[phaseIndex].endTime = Date.now();
      this.phases[phaseIndex].progress = 100;
    }

    this.updateOverallProgress();

    const phaseDuration = this.phaseStartTime ? Date.now() - this.phaseStartTime : 0;

    this.emitProgress('phase_completed', {
      phase: this.currentPhase,
      phaseName: this.currentPhaseName,
      completionMessage: completionMessage,
      duration: phaseDuration,
      overallProgress: this.overallProgress
    });

    if (this.options.enableConsoleOutput) {
      const durationText = this.formatDuration(phaseDuration);
      console.log(`✅ ${completionMessage} (${durationText})`);

      // Show completion bar
      console.log(this.generateProgressBar(100, '✓'));
    }

    // Check if all phases are complete
    if (this.currentPhase >= this.totalPhases) {
      this.completeInstallation();
    }
  }

  /**
   * Mark phase as failed
   * @param {string} errorMessage - Error message
   */
  failPhase(errorMessage) {
    // Update phase tracking
    const phaseIndex = this.currentPhase - 1;
    if (this.phases[phaseIndex]) {
      this.phases[phaseIndex].endTime = Date.now();
      this.phases[phaseIndex].failed = true;
      this.phases[phaseIndex].error = errorMessage;
    }

    const phaseDuration = this.phaseStartTime ? Date.now() - this.phaseStartTime : 0;

    this.emitProgress('phase_failed', {
      phase: this.currentPhase,
      phaseName: this.currentPhaseName,
      errorMessage: errorMessage,
      duration: phaseDuration,
      overallProgress: this.overallProgress
    });

    if (this.options.enableConsoleOutput) {
      const durationText = this.formatDuration(phaseDuration);
      console.log(`❌ ${errorMessage} (${durationText})`);
      console.log(this.generateProgressBar(this.currentPhaseProgress, '✗'));
    }

    this.isActive = false;
  }

  /**
   * Complete entire installation
   */
  completeInstallation() {
    const totalDuration = this.startTime ? Date.now() - this.startTime : 0;
    this.isActive = false;

    this.emitProgress('installation_completed', {
      totalPhases: this.totalPhases,
      totalDuration: totalDuration,
      overallProgress: 100,
      phases: this.phases
    });

    if (this.options.enableConsoleOutput) {
      const durationText = this.formatDuration(totalDuration);
      console.log('\n'.padEnd(60, '─'));
      console.log(`🎉 Installation completed successfully in ${durationText}`);
      console.log(`📊 Completed ${this.totalPhases} phases`);
      this.displayPhasesSummary();
    }
  }

  /**
   * Update overall progress calculation
   */
  updateOverallProgress() {
    if (this.totalPhases === 0) {
      this.overallProgress = 0;
      return;
    }

    // Calculate progress based on completed phases + current phase progress
    const completedPhases = Math.max(0, this.currentPhase - 1);
    const currentPhaseContribution = this.currentPhaseProgress / 100;

    this.overallProgress = Math.round(
      ((completedPhases + currentPhaseContribution) / this.totalPhases) * 100
    );
  }

  /**
   * Display current progress in console
   */
  displayProgress(stepDescription) {
    if (!this.options.enableConsoleOutput) return;

    const progressBar = this.generateProgressBar(this.currentPhaseProgress);
    const overallBar = this.generateProgressBar(this.overallProgress, '█', '░');

    // Calculate time estimates
    let timeEstimate = '';
    if (this.options.showTimeEstimates && this.phaseStartTime) {
      const elapsed = Date.now() - this.phaseStartTime;
      const estimated = this.currentPhaseProgress > 0
        ? (elapsed / this.currentPhaseProgress) * (100 - this.currentPhaseProgress)
        : 0;
      timeEstimate = estimated > 1000 ? ` (${this.formatDuration(estimated)} remaining)` : '';
    }

    // Clear previous lines and display new progress
    process.stdout.write('\x1b[2K\r'); // Clear line
    if (this.currentPhase > 1) {
      process.stdout.write('\x1b[1A\x1b[2K\r'); // Move up and clear
    }

    console.log(`Phase: ${progressBar} ${this.currentPhaseProgress}%${timeEstimate}`);
    console.log(`Overall: ${overallBar} ${this.overallProgress}% | ${stepDescription}`);
  }

  /**
   * Generate ASCII progress bar
   */
  generateProgressBar(percentage, filledChar = '█', emptyChar = '░', customWidth = null) {
    const width = customWidth || this.options.progressBarWidth;
    const filled = Math.round((percentage / 100) * width);
    const empty = width - filled;

    return filledChar.repeat(filled) + emptyChar.repeat(empty);
  }

  /**
   * Display phases summary
   */
  displayPhasesSummary() {
    if (!this.options.enableConsoleOutput || this.phases.length === 0) return;

    console.log('\n📋 Phases Summary:');
    for (const phase of this.phases) {
      const duration = phase.endTime && phase.startTime
        ? this.formatDuration(phase.endTime - phase.startTime)
        : 'Unknown';

      const status = phase.failed ? '❌ Failed' : phase.completed ? '✅ Completed' : '⏸️ Incomplete';
      const phaseName = phase.name || `Phase ${phase.number}`;

      console.log(`  ${phase.number}. ${phaseName} - ${status} (${duration})`);

      if (phase.failed && phase.error) {
        console.log(`     Error: ${phase.error}`);
      }
    }
  }

  /**
   * Format duration in human-readable format
   */
  formatDuration(milliseconds) {
    if (milliseconds < 1000) return `${milliseconds}ms`;
    if (milliseconds < 60000) return `${(milliseconds / 1000).toFixed(1)}s`;
    if (milliseconds < 3600000) return `${(milliseconds / 60000).toFixed(1)}m`;
    return `${(milliseconds / 3600000).toFixed(1)}h`;
  }

  /**
   * Emit progress events
   */
  emitProgress(eventType, data) {
    if (this.options.enableEvents) {
      this.emit('progress', {
        type: eventType,
        timestamp: new Date(),
        ...data
      });

      // Also emit specific event type
      this.emit(eventType, data);
    }
  }

  /**
   * Get current progress state
   * @returns {Object} Current progress information
   */
  getProgressState() {
    return {
      isActive: this.isActive,
      totalPhases: this.totalPhases,
      currentPhase: this.currentPhase,
      currentPhaseName: this.currentPhaseName,
      currentPhaseSteps: this.currentPhaseSteps,
      currentPhaseProgress: this.currentPhaseProgress,
      overallProgress: this.overallProgress,
      startTime: this.startTime,
      phases: this.phases.map(phase => ({ ...phase })) // Deep copy
    };
  }

  /**
   * Reset progress reporter
   */
  reset() {
    this.totalPhases = 0;
    this.currentPhase = 0;
    this.currentPhaseName = '';
    this.currentPhaseSteps = 0;
    this.currentPhaseProgress = 0;
    this.overallProgress = 0;
    this.startTime = null;
    this.phaseStartTime = null;
    this.phases = [];
    this.isActive = false;
    this.lastUpdateTime = 0;

    this.emitProgress('reset');
  }

  /**
   * Create a child progress reporter for nested operations
   * @param {number} parentPhaseAllocation - Percentage of parent phase this child represents
   * @returns {ProgressReporter} Child progress reporter
   */
  createChildReporter(parentPhaseAllocation = 100) {
    const childReporter = new ProgressReporter({
      ...this.options,
      enableConsoleOutput: false // Child reporters don't write to console
    });

    // Forward child events to parent with adjusted progress
    childReporter.on('progress', (data) => {
      if (data.type === 'progress_updated') {
        const adjustedProgress = (data.overallProgress / 100) * parentPhaseAllocation;
        this.updateProgress(data.stepDescription, adjustedProgress);
      }
    });

    return childReporter;
  }

  /**
   * Log a message with timestamp
   * @param {string} level - Log level (info, warn, error)
   * @param {string} message - Message to log
   */
  log(level, message) {
    const timestamp = new Date().toISOString();
    const logData = {
      timestamp,
      level,
      message,
      phase: this.currentPhase,
      phaseName: this.currentPhaseName
    };

    this.emit('log', logData);

    if (this.options.enableConsoleOutput) {
      const prefix = level === 'error' ? '❌' : level === 'warn' ? '⚠️' : 'ℹ️';
      console.log(`${prefix} [${timestamp}] ${message}`);
    }
  }
}

module.exports = ProgressReporter;