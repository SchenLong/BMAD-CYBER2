/**
 * Unit Tests for Progress Display - INST-031
 * Epic 4 - Installation Progress Visualization
 *
 * @module installer/lib/progress-display.test
 * @author BMAD Installation Wizard Team
 * @version 1.0.0
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  PHASES,
  DEFAULT_BAR_WIDTH,
  DEFAULT_FILLED_CHAR,
  DEFAULT_EMPTY_CHAR,
  getPhaseById,
  createProgressBar,
  createColoredProgressBar,
  displayPhaseStart,
  displaySubStep,
  displayPhaseComplete,
  displayPhaseError,
  displayOverallProgress,
  startSpinner,
  stopSpinner,
  formatDuration,
  estimateTimeRemaining,
  displaySummary,
  displayWelcomeBanner,
  displaySectionHeader,
  displayInfo,
  displayWarning,
  displayError,
  displaySuccess,
  clearConsole,
  displayList
} from './progress-display.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Progress Display - INST-031', () => {
  let consoleSpy;
  let stdoutSpy;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    stdoutSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('PHASES constant', () => {
    it('should have 7 phases', () => {
      expect(PHASES).toHaveLength(7);
    });

    it('should have welcome phase', () => {
      const phase = PHASES.find(p => p.id === 'welcome');
      expect(phase).toBeDefined();
      expect(phase.name).toBe('User Profile');
    });

    it('should have modules phase', () => {
      const phase = PHASES.find(p => p.id === 'modules');
      expect(phase).toBeDefined();
      expect(phase.name).toBe('Module Selection');
    });

    it('should have security phase', () => {
      const phase = PHASES.find(p => p.id === 'security');
      expect(phase).toBeDefined();
      expect(phase.name).toBe('Security Configuration');
    });

    it('should have llm phase', () => {
      const phase = PHASES.find(p => p.id === 'llm');
      expect(phase).toBeDefined();
      expect(phase.name).toBe('LLM Setup');
    });

    it('should have token phase', () => {
      const phase = PHASES.find(p => p.id === 'token');
      expect(phase).toBeDefined();
      expect(phase.name).toBe('Token Generation');
    });

    it('should have pgp phase', () => {
      const phase = PHASES.find(p => p.id === 'pgp');
      expect(phase).toBeDefined();
      expect(phase.name).toContain('PGP');
    });

    it('should have health phase', () => {
      const phase = PHASES.find(p => p.id === 'health');
      expect(phase).toBeDefined();
      expect(phase.name).toBe('Health Check');
    });

    it('should have icons for all phases', () => {
      for (const phase of PHASES) {
        expect(phase.icon).toBeDefined();
        expect(phase.icon.length).toBeGreaterThan(0);
      }
    });
  });

  describe('DEFAULT constants', () => {
    it('should have DEFAULT_BAR_WIDTH of 20', () => {
      expect(DEFAULT_BAR_WIDTH).toBe(20);
    });

    it('should have DEFAULT_FILLED_CHAR as block character', () => {
      expect(DEFAULT_FILLED_CHAR).toBe('\u2588');
    });

    it('should have DEFAULT_EMPTY_CHAR as light shade', () => {
      expect(DEFAULT_EMPTY_CHAR).toBe('\u2591');
    });
  });

  describe('getPhaseById', () => {
    it('should return phase for valid id', () => {
      const phase = getPhaseById('modules');
      expect(phase).toBeDefined();
      expect(phase.name).toBe('Module Selection');
    });

    it('should return undefined for invalid id', () => {
      const phase = getPhaseById('invalid-phase');
      expect(phase).toBeUndefined();
    });

    it('should return correct phase for each id', () => {
      for (const expectedPhase of PHASES) {
        const phase = getPhaseById(expectedPhase.id);
        expect(phase).toBe(expectedPhase);
      }
    });
  });

  describe('createProgressBar', () => {
    it('should create bar at 0%', () => {
      const bar = createProgressBar(0);
      expect(bar).toContain('[');
      expect(bar).toContain(']');
      expect(bar).toContain('0%');
    });

    it('should create bar at 50%', () => {
      const bar = createProgressBar(50);
      expect(bar).toContain('50%');
    });

    it('should create bar at 100%', () => {
      const bar = createProgressBar(100);
      expect(bar).toContain('100%');
    });

    it('should clamp percentage above 100', () => {
      const bar = createProgressBar(150);
      expect(bar).toContain('100%');
    });

    it('should clamp percentage below 0', () => {
      const bar = createProgressBar(-50);
      expect(bar).toContain('0%');
    });

    it('should respect custom width', () => {
      const bar = createProgressBar(50, { width: 10 });
      // Bar should be 12 chars: [ + 10 chars + ]
      expect(bar).toMatch(/\[.{10}\]/);
    });

    it('should hide percentage when showPercentage is false', () => {
      const bar = createProgressBar(50, { showPercentage: false });
      expect(bar).not.toContain('%');
    });

    it('should use custom filled character', () => {
      const bar = createProgressBar(50, { filledChar: '#', width: 10 });
      expect(bar).toContain('#');
    });

    it('should use custom empty character', () => {
      const bar = createProgressBar(50, { emptyChar: '-', width: 10 });
      expect(bar).toContain('-');
    });
  });

  describe('createColoredProgressBar', () => {
    it('should create colored bar at 0%', () => {
      const bar = createColoredProgressBar(0);
      expect(bar).toContain('[');
      expect(bar).toContain(']');
    });

    it('should create colored bar at 100%', () => {
      const bar = createColoredProgressBar(100);
      expect(bar).toContain('100%');
    });

    it('should clamp percentage values', () => {
      const barHigh = createColoredProgressBar(150);
      const barLow = createColoredProgressBar(-50);
      expect(barHigh).toContain('100%');
      expect(barLow).toContain('0%');
    });

    it('should respect custom width', () => {
      const bar = createColoredProgressBar(50, { width: 10, showPercentage: false });
      expect(bar).toMatch(/\[.+\]/);
    });
  });

  describe('displayPhaseStart', () => {
    it('should display phase with number and name', () => {
      const result = displayPhaseStart('modules', 2, 7);
      expect(result).toContain('Phase 2/7');
      expect(result).toContain('Module Selection');
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should handle unknown phase', () => {
      const result = displayPhaseStart('unknown-phase', 1, 5);
      expect(result).toContain('Unknown phase');
      expect(result).toContain('unknown-phase');
    });

    it('should include phase icon', () => {
      const result = displayPhaseStart('security', 3, 6);
      const phase = getPhaseById('security');
      expect(result).toContain(phase.icon);
    });
  });

  describe('displaySubStep', () => {
    it('should display indented sub-step', () => {
      const result = displaySubStep('Installing intel-team...');
      expect(result).toContain('Installing intel-team...');
      expect(result).toMatch(/^\s+/); // Should have leading whitespace
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should include arrow character', () => {
      const result = displaySubStep('Test step');
      expect(result).toContain('\u2192'); // Right arrow
    });
  });

  describe('displayPhaseComplete', () => {
    it('should display completion with checkmark', () => {
      const result = displayPhaseComplete('modules');
      expect(result).toContain('\u2713'); // Checkmark
      expect(result).toContain('Module Selection');
      expect(result).toContain('complete');
    });

    it('should handle unknown phase', () => {
      const result = displayPhaseComplete('unknown');
      expect(result).toContain('unknown');
      expect(result).toContain('complete');
    });
  });

  describe('displayPhaseError', () => {
    it('should display error with X mark', () => {
      const result = displayPhaseError('security', 'Permission denied');
      expect(result).toContain('\u2717'); // X mark
      expect(result).toContain('Security Configuration');
      expect(result).toContain('failed');
      expect(result).toContain('Permission denied');
    });

    it('should handle unknown phase', () => {
      const result = displayPhaseError('unknown', 'Some error');
      expect(result).toContain('unknown');
      expect(result).toContain('failed');
    });
  });

  describe('displayOverallProgress', () => {
    it('should display progress bar with phase count', () => {
      const result = displayOverallProgress(3, 7);
      expect(result).toContain('Phase 3/7');
      expect(result).toContain('%');
    });

    it('should handle zero total phases', () => {
      const result = displayOverallProgress(0, 0);
      expect(result).toContain('0%');
    });

    it('should use colored bar by default', () => {
      const result = displayOverallProgress(5, 10);
      expect(result).toBeDefined();
    });

    it('should use non-colored bar when specified', () => {
      const result = displayOverallProgress(5, 10, { colored: false });
      expect(result).toContain('Phase 5/10');
    });
  });

  describe('startSpinner', () => {
    it('should create spinner with text', () => {
      const spinner = startSpinner('Loading...');
      expect(spinner).toBeDefined();
      expect(spinner.stop).toBeDefined();
      expect(spinner.succeed).toBeDefined();
      expect(spinner.fail).toBeDefined();
      spinner.stop();
    });

    it('should auto-start spinner', () => {
      const spinner = startSpinner('Testing...');
      expect(stdoutSpy).toHaveBeenCalled();
      spinner.stop();
    });

    it('should have text method', () => {
      const spinner = startSpinner('Initial');
      expect(spinner.text).toBeDefined();
      spinner.text('Updated');
      spinner.stop();
    });

    it('should have warn method', () => {
      const spinner = startSpinner('Test');
      expect(spinner.warn).toBeDefined();
      spinner.warn('Warning message');
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('stopSpinner', () => {
    it('should call succeed on success', () => {
      const spinner = {
        succeed: vi.fn(),
        fail: vi.fn()
      };
      stopSpinner(spinner, true, 'Done');
      expect(spinner.succeed).toHaveBeenCalledWith('Done');
    });

    it('should call fail on failure', () => {
      const spinner = {
        succeed: vi.fn(),
        fail: vi.fn()
      };
      stopSpinner(spinner, false, 'Error');
      expect(spinner.fail).toHaveBeenCalledWith('Error');
    });

    it('should handle null spinner', () => {
      expect(() => stopSpinner(null, true, 'Test')).not.toThrow();
    });
  });

  describe('formatDuration', () => {
    it('should format milliseconds', () => {
      expect(formatDuration(500)).toBe('500ms');
    });

    it('should format seconds', () => {
      expect(formatDuration(2500)).toBe('2.5s');
    });

    it('should format minutes', () => {
      expect(formatDuration(150000)).toBe('2.5m');
    });

    it('should format hours', () => {
      expect(formatDuration(5400000)).toBe('1.5h');
    });

    it('should handle boundary at 1000ms', () => {
      expect(formatDuration(999)).toBe('999ms');
      expect(formatDuration(1000)).toBe('1.0s');
    });
  });

  describe('estimateTimeRemaining', () => {
    it('should return null for zero completed', () => {
      expect(estimateTimeRemaining(1000, 0, 5)).toBeNull();
    });

    it('should return null for zero total', () => {
      expect(estimateTimeRemaining(1000, 2, 0)).toBeNull();
    });

    it('should return 0s when complete', () => {
      expect(estimateTimeRemaining(5000, 5, 5)).toBe('0s');
    });

    it('should estimate remaining time', () => {
      // 2 phases completed in 4000ms = 2000ms per phase
      // 3 phases remaining = 6000ms estimated
      const result = estimateTimeRemaining(4000, 2, 5);
      expect(result).toBe('6.0s');
    });
  });

  describe('displaySummary', () => {
    it('should display summary for all successful', () => {
      const results = [
        { id: 'welcome', success: true, duration: 1000 },
        { id: 'modules', success: true, duration: 2000 }
      ];
      const summary = displaySummary(results);
      expect(summary).toContain('Installation Summary');
      expect(summary).toContain('completed successfully');
    });

    it('should display summary with failures', () => {
      const results = [
        { id: 'welcome', success: true },
        { id: 'security', success: false, error: 'Permission denied' }
      ];
      const summary = displaySummary(results);
      expect(summary).toContain('Failed');
      expect(summary).toContain('Permission denied');
    });

    it('should include total duration when provided', () => {
      const results = [{ id: 'welcome', success: true }];
      const summary = displaySummary(results, { totalDuration: 5000 });
      expect(summary).toContain('Total time');
      expect(summary).toContain('5.0s');
    });

    it('should handle unknown phase ids', () => {
      const results = [{ id: 'unknown', success: true }];
      const summary = displaySummary(results);
      expect(summary).toContain('unknown');
    });
  });

  describe('displayWelcomeBanner', () => {
    it('should display default title', () => {
      const banner = displayWelcomeBanner();
      expect(banner).toContain('BMAD Installation Wizard');
    });

    it('should display custom title', () => {
      const banner = displayWelcomeBanner('Custom Title');
      expect(banner).toContain('Custom Title');
    });

    it('should include dividers', () => {
      const banner = displayWelcomeBanner();
      expect(banner).toContain('\u2550'); // Double horizontal line
    });
  });

  describe('displaySectionHeader', () => {
    it('should display section title', () => {
      const result = displaySectionHeader('Test Section');
      expect(result).toBe('Test Section');
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('displayInfo', () => {
    it('should display info message with i prefix', () => {
      const result = displayInfo('Information message');
      expect(result).toContain('i');
      expect(result).toContain('Information message');
    });
  });

  describe('displayWarning', () => {
    it('should display warning with ! prefix', () => {
      const result = displayWarning('Warning message');
      expect(result).toContain('!');
      expect(result).toContain('Warning message');
    });
  });

  describe('displayError', () => {
    it('should display error with X prefix', () => {
      const result = displayError('Error message');
      expect(result).toContain('\u2717');
      expect(result).toContain('Error message');
    });
  });

  describe('displaySuccess', () => {
    it('should display success with checkmark', () => {
      const result = displaySuccess('Success message');
      expect(result).toContain('\u2713');
      expect(result).toContain('Success message');
    });
  });

  describe('clearConsole', () => {
    it('should write escape sequence to stdout', () => {
      clearConsole();
      expect(stdoutSpy).toHaveBeenCalledWith('\x1B[2J\x1B[0f');
    });
  });

  describe('displayList', () => {
    it('should display list with bullets', () => {
      const items = ['Item 1', 'Item 2', 'Item 3'];
      const result = displayList(items);
      expect(result).toContain('Item 1');
      expect(result).toContain('Item 2');
      expect(result).toContain('Item 3');
    });

    it('should use custom bullet', () => {
      const result = displayList(['Test'], { bullet: '-' });
      expect(result).toContain('-');
    });

    it('should use custom indentation', () => {
      const result = displayList(['Test'], { indent: 4 });
      expect(result).toMatch(/^\s{4}/);
    });
  });

  describe('ESM Compatibility', () => {
    it('should use ES Module syntax', async () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'progress-display.js'),
        'utf8'
      );

      expect(moduleContent).not.toMatch(/\bmodule\.exports\b/);
      expect(moduleContent).not.toMatch(/\brequire\s*\(/);
    });

    it('should use export statements', async () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'progress-display.js'),
        'utf8'
      );

      expect(moduleContent).toMatch(/\bexport\s+(const|function)/);
    });

    it('should import chalk', async () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'progress-display.js'),
        'utf8'
      );

      expect(moduleContent).toMatch(/import\s+chalk\s+from\s+['"]chalk['"]/);
    });
  });
});
