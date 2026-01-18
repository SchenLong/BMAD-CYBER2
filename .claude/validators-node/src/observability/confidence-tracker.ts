/**
 * BMAD Guardrails: Confidence Indicators
 * ========================================
 * Implements confidence scoring and uncertainty detection for model responses.
 *
 * Features:
 * - Track uncertainty markers in model responses
 * - Flag responses containing hedging language
 * - Add confidence indicators for code generation
 * - Implement source attribution tracking
 * - Display confidence in user-facing output
 *
 * OWASP Reference: LLM09 - Overreliance
 * Requirements: REQ-3.1.1 through REQ-3.1.5
 *
 * Usage:
 *   import { getConfidenceTracker, analyzeResponseConfidence } from './confidence-tracker.js';
 *
 *   const tracker = getConfidenceTracker();
 *   const result = tracker.analyzeText("I think this might work, but I'm not sure...");
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { getProjectDir } from '../common/path-utils.js';
import { recordConfidenceAnalysis } from './telemetry.js';

// Configuration
const PROJECT_DIR = getProjectDir();
const CONFIDENCE_STATE_FILE = path.join(PROJECT_DIR, '.claude', '.confidence_state.json');
const CONFIDENCE_LOCK_FILE = path.join(PROJECT_DIR, '.claude', '.confidence.lock');

const LOCK_TIMEOUT_MS = 5000;
const SHOW_CONFIDENCE = (process.env['BMAD_SHOW_CONFIDENCE'] || 'true').toLowerCase() === 'true';
const MIN_TEXT_LENGTH = 50;

// ============================================================================
// Uncertainty Patterns
// ============================================================================

/** Hedging/uncertainty markers indicating lower confidence */
const UNCERTAINTY_MARKERS: Record<string, string[]> = {
  high: [
    // Strong uncertainty
    "\\bI'?m not sure\\b",
    "\\bI don'?t know\\b",
    "\\bI'?m uncertain\\b",
    "\\bthis is a guess\\b",
    "\\bI'?m guessing\\b",
    "\\bunclear to me\\b",
    "\\bhard to say\\b",
    "\\bdifficult to determine\\b",
    "\\bcannot be certain\\b",
    "\\bno way to know\\b",
  ],
  medium: [
    // Moderate uncertainty
    "\\bI think\\b",
    "\\bI believe\\b",
    "\\bprobably\\b",
    "\\blikely\\b",
    "\\bunlikely\\b",
    "\\bpossibly\\b",
    "\\bperhaps\\b",
    "\\bmaybe\\b",
    "\\bmight\\b",
    "\\bcould be\\b",
    "\\bseems like\\b",
    "\\bappears to\\b",
    "\\bI would assume\\b",
    "\\bmy understanding is\\b",
    "\\bif I recall\\b",
    "\\bI recall\\b",
    "\\bfrom what I remember\\b",
  ],
  low: [
    // Mild uncertainty
    "\\bgenerally\\b",
    "\\btypically\\b",
    "\\busually\\b",
    "\\boften\\b",
    "\\bsometimes\\b",
    "\\bin most cases\\b",
    "\\bin some cases\\b",
    "\\bdepending on\\b",
    "\\bit depends\\b",
    "\\bvaries\\b",
  ],
};

/** Confidence boosters - indicators of higher confidence */
const CONFIDENCE_BOOSTERS = [
  "\\bdefinitely\\b",
  "\\bcertainly\\b",
  "\\babsolutely\\b",
  "\\bwithout doubt\\b",
  "\\bI'?m confident\\b",
  "\\bI know that\\b",
  "\\bthis is correct\\b",
  "\\bthe answer is\\b",
  "\\bspecifically\\b",
  "\\bexactly\\b",
  "\\bprecisely\\b",
  "\\baccording to\\b",
  "\\bdocumentation states\\b",
  "\\bthe spec says\\b",
  "\\bthe code shows\\b",
];

/** Code generation uncertainty patterns */
const CODE_UNCERTAINTY_PATTERNS = [
  "#\\s*TODO",
  "#\\s*FIXME",
  "#\\s*HACK",
  "#\\s*XXX",
  "#\\s*NOTE:\\s*untested",
  "#\\s*WARNING",
  "//\\s*TODO",
  "//\\s*FIXME",
  "/\\*\\s*TODO",
  "'''.*untested.*'''",
  '""".*untested.*"""',
  "raise NotImplementedError",
  "pass\\s*#\\s*placeholder",
  "\\.\\.\\.\\s*#\\s*placeholder",
];

/** Attribution patterns */
const ATTRIBUTION_PATTERNS = [
  "according to (?:the )?(?<source>documentation|docs|spec|specification|readme|guide)",
  "from (?:the )?(?<source>\\S+ documentation)",
  "(?:the )?(?<source>official docs?|official documentation) (?:says?|states?|mentions?)",
  "based on (?:the )?(?<source>source code|codebase|implementation)",
  "(?:the )?(?<source>error message|stack trace|logs?) (?:shows?|indicates?|suggests?)",
  "(?:the )?(?<source>API|specification) (?:says?|defines?|requires?)",
];

// ============================================================================
// Types
// ============================================================================

/** Confidence levels for responses */
export enum ConfidenceLevel {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  VERY_LOW = 'very_low',
}

/** A detected uncertainty marker */
export interface UncertaintyMatch {
  pattern: string;
  text: string;
  severity: 'high' | 'medium' | 'low';
  position: number;
}

/** A detected source attribution */
export interface SourceAttribution {
  sourceType: string;
  text: string;
  position: number;
}

/** Result of confidence analysis */
export interface ConfidenceResult {
  confidenceLevel: ConfidenceLevel;
  confidenceScore: number; // 0.0 to 1.0
  uncertaintyMarkers: UncertaintyMatch[];
  confidenceBoosters: string[];
  attributions: SourceAttribution[];
  codeWarnings: string[];
  textLength: number;
  analysisNotes: string[];
  displayIndicator: string; // Visual indicator for user
}

/** Session state stored on disk */
interface SessionState {
  session_id: string;
  analyses_count: number;
  average_confidence: number;
  low_confidence_count: number;
  high_uncertainty_count: number;
  last_update: number;
}

// ============================================================================
// Lock Functions
// ============================================================================

/**
 * Acquire a simple file-based lock.
 */
function acquireLock(lockFile: string, timeout: number = LOCK_TIMEOUT_MS): boolean {
  const dir = path.dirname(lockFile);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    try {
      fs.writeFileSync(lockFile, String(process.pid), { flag: 'wx' });
      return true;
    } catch (e) {
      const error = e as NodeJS.ErrnoException;
      if (error.code !== 'EEXIST') {
        return false;
      }

      // Check for stale lock (>30s old)
      try {
        const stats = fs.statSync(lockFile);
        if (Date.now() - stats.mtimeMs > 30000) {
          try {
            fs.unlinkSync(lockFile);
          } catch {
            // Ignore
          }
          continue;
        }
      } catch {
        // Lock may have been removed
      }

      // Busy wait (small spin)
      const sleepUntil = Date.now() + 10;
      while (Date.now() < sleepUntil) {
        /* spin */
      }
    }
  }
  return false;
}

/**
 * Release file lock.
 */
function releaseLock(lockFile: string): void {
  try {
    fs.unlinkSync(lockFile);
  } catch {
    // Ignore
  }
}

// ============================================================================
// Confidence Tracker Implementation
// ============================================================================

/**
 * Tracks and analyzes confidence indicators in model responses.
 *
 * Provides transparency to users about the certainty level of
 * generated content to prevent overreliance.
 */
export class ConfidenceTracker {
  private stateFile: string;
  private lockFile: string;

  // Compiled patterns for efficiency
  private compiledUncertainty: Map<string, RegExp[]>;
  private compiledBoosters: RegExp[];
  private compiledCode: RegExp[];
  private compiledAttribution: RegExp[];

  constructor() {
    this.stateFile = CONFIDENCE_STATE_FILE;
    this.lockFile = CONFIDENCE_LOCK_FILE;
    this.ensureDirs();

    // Compile patterns
    this.compiledUncertainty = new Map();
    for (const [severity, patterns] of Object.entries(UNCERTAINTY_MARKERS)) {
      this.compiledUncertainty.set(
        severity,
        patterns.map((p) => new RegExp(p, 'gi'))
      );
    }

    this.compiledBoosters = CONFIDENCE_BOOSTERS.map((p) => new RegExp(p, 'gi'));
    this.compiledCode = CODE_UNCERTAINTY_PATTERNS.map((p) => new RegExp(p, 'gi'));
    this.compiledAttribution = ATTRIBUTION_PATTERNS.map((p) => new RegExp(p, 'gi'));
  }

  private ensureDirs(): void {
    const dir = path.dirname(this.stateFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  private loadState(): SessionState {
    try {
      if (fs.existsSync(this.stateFile)) {
        const content = fs.readFileSync(this.stateFile, 'utf8');
        const state = JSON.parse(content) as SessionState;

        // Reset after 1 hour of inactivity
        const lastUpdate = state.last_update || 0;
        if (Date.now() / 1000 - lastUpdate > 3600) {
          return this.initialState();
        }
        return state;
      }
    } catch {
      // Return default on error
    }
    return this.initialState();
  }

  private initialState(): SessionState {
    return {
      session_id: process.env['CLAUDE_SESSION_ID'] || String(Math.floor(Date.now() / 1000)),
      analyses_count: 0,
      average_confidence: 1.0,
      low_confidence_count: 0,
      high_uncertainty_count: 0,
      last_update: Date.now() / 1000,
    };
  }

  private saveState(state: SessionState): void {
    state.last_update = Date.now() / 1000;

    const dir = path.dirname(this.stateFile);
    const tempFile = path.join(dir, `.confidence_${process.pid}.tmp`);

    try {
      fs.writeFileSync(tempFile, JSON.stringify(state, null, 2));
      fs.renameSync(tempFile, this.stateFile);
    } catch {
      try {
        fs.unlinkSync(tempFile);
      } catch {
        // Ignore
      }
    }
  }

  private detectUncertaintyMarkers(text: string): UncertaintyMatch[] {
    const markers: UncertaintyMatch[] = [];

    for (const [severity, patterns] of this.compiledUncertainty) {
      for (const pattern of patterns) {
        pattern.lastIndex = 0; // Reset regex state
        let match: RegExpExecArray | null;
        while ((match = pattern.exec(text)) !== null) {
          markers.push({
            pattern: pattern.source,
            text: match[0],
            severity: severity as 'high' | 'medium' | 'low',
            position: match.index,
          });
        }
      }
    }

    return markers;
  }

  private detectConfidenceBoosters(text: string): string[] {
    const boosters: string[] = [];

    for (const pattern of this.compiledBoosters) {
      pattern.lastIndex = 0;
      let match: RegExpExecArray | null;
      while ((match = pattern.exec(text)) !== null) {
        boosters.push(match[0]);
      }
    }

    return boosters;
  }

  private detectCodeWarnings(text: string): string[] {
    const warnings: string[] = [];

    for (const pattern of this.compiledCode) {
      pattern.lastIndex = 0;
      let match: RegExpExecArray | null;
      while ((match = pattern.exec(text)) !== null) {
        warnings.push(match[0]);
      }
    }

    return warnings;
  }

  private detectAttributions(text: string): SourceAttribution[] {
    const attributions: SourceAttribution[] = [];

    for (const pattern of this.compiledAttribution) {
      pattern.lastIndex = 0;
      let match: RegExpExecArray | null;
      while ((match = pattern.exec(text)) !== null) {
        const source = match.groups?.['source'] || 'unknown';
        attributions.push({
          sourceType: source,
          text: match[0],
          position: match.index,
        });
      }
    }

    return attributions;
  }

  private calculateConfidenceScore(
    uncertaintyMarkers: UncertaintyMatch[],
    confidenceBoosters: string[],
    codeWarnings: string[],
    attributions: SourceAttribution[],
    textLength: number
  ): number {
    // Base score
    let score = 1.0;

    // Penalty for uncertainty markers
    for (const marker of uncertaintyMarkers) {
      if (marker.severity === 'high') {
        score -= 0.15;
      } else if (marker.severity === 'medium') {
        score -= 0.08;
      } else {
        // low
        score -= 0.03;
      }
    }

    // Penalty for code warnings
    score -= codeWarnings.length * 0.05;

    // Bonus for confidence boosters (diminishing returns)
    const boosterBonus = Math.min(confidenceBoosters.length * 0.05, 0.2);
    score += boosterBonus;

    // Bonus for attributions (shows grounded reasoning)
    const attributionBonus = Math.min(attributions.length * 0.05, 0.15);
    score += attributionBonus;

    // Normalize text length factor
    if (textLength > 1000) {
      const markerDensity = uncertaintyMarkers.length / (textLength / 1000);
      if (markerDensity < 2) {
        score += 0.05;
      }
    }

    // Clamp to valid range
    return Math.max(0.0, Math.min(1.0, score));
  }

  private scoreToLevel(score: number): ConfidenceLevel {
    if (score >= 0.85) {
      return ConfidenceLevel.HIGH;
    } else if (score >= 0.65) {
      return ConfidenceLevel.MEDIUM;
    } else if (score >= 0.45) {
      return ConfidenceLevel.LOW;
    } else {
      return ConfidenceLevel.VERY_LOW;
    }
  }

  private getDisplayIndicator(level: ConfidenceLevel): string {
    const indicators: Record<ConfidenceLevel, string> = {
      [ConfidenceLevel.HIGH]: '[Confidence: HIGH]',
      [ConfidenceLevel.MEDIUM]: '[Confidence: MEDIUM]',
      [ConfidenceLevel.LOW]: '[Confidence: LOW - verify independently]',
      [ConfidenceLevel.VERY_LOW]: '[Confidence: VERY LOW - treat with caution]',
    };
    return indicators[level] || '[Confidence: UNKNOWN]';
  }

  /**
   * Analyze text for confidence indicators.
   */
  analyzeText(text: string): ConfidenceResult {
    const textLength = text.length;
    const analysisNotes: string[] = [];

    // Skip analysis for very short texts
    if (textLength < MIN_TEXT_LENGTH) {
      return {
        confidenceLevel: ConfidenceLevel.HIGH,
        confidenceScore: 1.0,
        uncertaintyMarkers: [],
        confidenceBoosters: [],
        attributions: [],
        codeWarnings: [],
        textLength,
        analysisNotes: ['Text too short for meaningful analysis'],
        displayIndicator: '',
      };
    }

    // Detect patterns
    const uncertaintyMarkers = this.detectUncertaintyMarkers(text);
    const confidenceBoosters = this.detectConfidenceBoosters(text);
    const codeWarnings = this.detectCodeWarnings(text);
    const attributions = this.detectAttributions(text);

    // Calculate score
    const score = this.calculateConfidenceScore(
      uncertaintyMarkers,
      confidenceBoosters,
      codeWarnings,
      attributions,
      textLength
    );

    const level = this.scoreToLevel(score);

    // Generate analysis notes
    if (uncertaintyMarkers.length > 5) {
      analysisNotes.push(`High uncertainty marker density (${uncertaintyMarkers.length} markers)`);
    }

    const highSeverity = uncertaintyMarkers.filter((m) => m.severity === 'high');
    if (highSeverity.length > 0) {
      analysisNotes.push(`Found ${highSeverity.length} high-severity uncertainty markers`);
    }

    if (codeWarnings.length > 0) {
      analysisNotes.push(
        `Code contains ${codeWarnings.length} uncertainty indicators (TODO, FIXME, etc.)`
      );
    }

    if (attributions.length > 0) {
      analysisNotes.push(`Response references ${attributions.length} sources`);
    }

    if (uncertaintyMarkers.length === 0 && codeWarnings.length === 0) {
      analysisNotes.push('No uncertainty markers detected');
    }

    // Get display indicator
    const displayIndicator = SHOW_CONFIDENCE ? this.getDisplayIndicator(level) : '';

    return {
      confidenceLevel: level,
      confidenceScore: score,
      uncertaintyMarkers,
      confidenceBoosters,
      attributions,
      codeWarnings,
      textLength,
      analysisNotes,
      displayIndicator,
    };
  }

  /**
   * Record analysis result to session state.
   */
  recordAnalysis(result: ConfidenceResult): void {
    if (!acquireLock(this.lockFile)) {
      return; // Non-critical
    }

    try {
      const state = this.loadState();

      // Update statistics
      const count = state.analyses_count;
      const avg = state.average_confidence;

      // Rolling average
      const newAvg = (avg * count + result.confidenceScore) / (count + 1);
      state.average_confidence = newAvg;
      state.analyses_count = count + 1;

      if (
        result.confidenceLevel === ConfidenceLevel.LOW ||
        result.confidenceLevel === ConfidenceLevel.VERY_LOW
      ) {
        state.low_confidence_count += 1;
      }

      if (result.uncertaintyMarkers.some((m) => m.severity === 'high')) {
        state.high_uncertainty_count += 1;
      }

      this.saveState(state);

      // Record to telemetry
      recordConfidenceAnalysis({
        responseLength: result.textLength,
        uncertaintyMarkers: {
          high: result.uncertaintyMarkers.filter((m) => m.severity === 'high').length,
          medium: result.uncertaintyMarkers.filter((m) => m.severity === 'medium').length,
          low: result.uncertaintyMarkers.filter((m) => m.severity === 'low').length,
        },
        confidenceScore: result.confidenceScore,
        confidenceLevel: result.confidenceLevel.toUpperCase() as
          | 'HIGH'
          | 'MEDIUM'
          | 'LOW'
          | 'VERY_LOW',
        hedgingPhrases: result.uncertaintyMarkers.map((m) => m.text).slice(0, 10),
        codeWarnings: result.codeWarnings.reduce(
          (acc, w) => {
            acc[w] = (acc[w] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>
        ),
        attributions: result.attributions.reduce(
          (acc, a) => {
            acc[a.sourceType] = (acc[a.sourceType] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>
        ),
        notes: result.analysisNotes,
      });
    } finally {
      releaseLock(this.lockFile);
    }
  }

  /**
   * Get session confidence statistics.
   */
  getSessionStats(): Record<string, unknown> {
    try {
      const state = this.loadState();
      return {
        session_id: state.session_id,
        analyses_count: state.analyses_count,
        average_confidence: Math.round(state.average_confidence * 1000) / 1000,
        low_confidence_count: state.low_confidence_count,
        high_uncertainty_count: state.high_uncertainty_count,
      };
    } catch {
      return { error: 'Could not load stats' };
    }
  }

  /**
   * Reset confidence tracking for new session.
   */
  reset(): void {
    if (!acquireLock(this.lockFile)) {
      return;
    }

    try {
      const state = this.initialState();
      this.saveState(state);
      console.error(`[confidence_tracker] Session reset: ${state.session_id}`);
    } finally {
      releaseLock(this.lockFile);
    }
  }
}

// ============================================================================
// Convenience Functions
// ============================================================================

let confidenceTracker: ConfidenceTracker | null = null;

/**
 * Get or create the global confidence tracker instance.
 */
export function getConfidenceTracker(): ConfidenceTracker {
  if (confidenceTracker === null) {
    confidenceTracker = new ConfidenceTracker();
  }
  return confidenceTracker;
}

/**
 * Analyze confidence of a response text.
 *
 * @returns Tuple of [confidence_level, confidence_score, display_indicator]
 */
export function analyzeResponseConfidence(text: string): [string, number, string] {
  const tracker = getConfidenceTracker();
  const result = tracker.analyzeText(text);
  return [result.confidenceLevel, result.confidenceScore, result.displayIndicator];
}

/**
 * Get just the confidence indicator string for a text.
 */
export function getConfidenceIndicator(text: string): string {
  if (!SHOW_CONFIDENCE) {
    return '';
  }

  const tracker = getConfidenceTracker();
  const result = tracker.analyzeText(text);
  return result.displayIndicator;
}

/**
 * Analyze tool output for confidence indicators as a post-tool hook.
 *
 * This is called after tool execution to add confidence indicators
 * to the response when appropriate.
 *
 * @returns Exit code: Always 0 (informational only, never blocks)
 */
export function analyzeToolOutput(): number {
  let data: Record<string, unknown>;

  try {
    const stdin = fs.readFileSync(0, 'utf8');
    data = JSON.parse(stdin) as Record<string, unknown>;
  } catch {
    return 0;
  }

  // Only analyze certain tool outputs
  const toolName = String(data['tool_name'] || '').toLowerCase();
  if (!['bash', 'task', 'webfetch', 'websearch'].includes(toolName)) {
    return 0;
  }

  // Get tool output
  const toolOutput = String(data['tool_output'] || '');
  if (!toolOutput || toolOutput.length < MIN_TEXT_LENGTH) {
    return 0;
  }

  const tracker = getConfidenceTracker();
  const result = tracker.analyzeText(toolOutput);

  // Record the analysis
  tracker.recordAnalysis(result);

  // Log if low confidence
  if (
    result.confidenceLevel === ConfidenceLevel.LOW ||
    result.confidenceLevel === ConfidenceLevel.VERY_LOW
  ) {
    console.error(
      `[confidence_tracker] LOW_CONFIDENCE_RESPONSE: tool=${toolName}, level=${result.confidenceLevel}, score=${result.confidenceScore.toFixed(2)}`
    );

    // Optionally display indicator
    if (SHOW_CONFIDENCE && result.displayIndicator) {
      console.error(`\n${result.displayIndicator}`);
    }
  }

  return 0;
}

// ============================================================================
// CLI Interface
// ============================================================================

/**
 * CLI main function.
 */
export function main(): void {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    // Run as hook
    process.exit(analyzeToolOutput());
  }

  const command = args[0];

  if (command === 'status') {
    const tracker = getConfidenceTracker();
    const stats = tracker.getSessionStats();
    console.log(JSON.stringify(stats, null, 2));
  } else if (command === 'analyze') {
    if (args.length < 2) {
      console.error('Usage: confidence-tracker analyze <text>');
      console.error('       confidence-tracker analyze -f <file>');
      process.exit(1);
    }

    let text: string;
    if (args[1] === '-f') {
      if (args.length < 3) {
        console.error('Usage: confidence-tracker analyze -f <file>');
        process.exit(1);
      }
      text = fs.readFileSync(args[2]!, 'utf8');
    } else {
      text = args.slice(1).join(' ');
    }

    const tracker = getConfidenceTracker();
    const result = tracker.analyzeText(text);

    console.log(`Confidence Level: ${result.confidenceLevel}`);
    console.log(`Confidence Score: ${result.confidenceScore.toFixed(2)}`);
    console.log(`Text Length: ${result.textLength} chars`);
    console.log(`\nUncertainty Markers: ${result.uncertaintyMarkers.length}`);
    for (const marker of result.uncertaintyMarkers.slice(0, 5)) {
      console.log(`  [${marker.severity}] "${marker.text}"`);
    }
    if (result.uncertaintyMarkers.length > 5) {
      console.log(`  ... and ${result.uncertaintyMarkers.length - 5} more`);
    }

    console.log(`\nConfidence Boosters: ${result.confidenceBoosters.length}`);
    for (const booster of result.confidenceBoosters.slice(0, 3)) {
      console.log(`  "${booster}"`);
    }

    console.log(`\nSource Attributions: ${result.attributions.length}`);
    for (const attr of result.attributions.slice(0, 3)) {
      console.log(`  [${attr.sourceType}] "${attr.text}"`);
    }

    console.log(`\nCode Warnings: ${result.codeWarnings.length}`);
    for (const warning of result.codeWarnings.slice(0, 3)) {
      console.log(`  "${warning}"`);
    }

    console.log('\nAnalysis Notes:');
    for (const note of result.analysisNotes) {
      console.log(`  - ${note}`);
    }

    if (result.displayIndicator) {
      console.log(`\nDisplay: ${result.displayIndicator}`);
    }
  } else if (command === 'reset') {
    const tracker = getConfidenceTracker();
    tracker.reset();
    console.log('Confidence tracking reset');
  } else if (command === 'hook') {
    process.exit(analyzeToolOutput());
  } else {
    console.error(`Usage: confidence-tracker [status|analyze|reset|hook]`);
    process.exit(1);
  }
}

// Run CLI if executed directly
const isMainModule =
  process.argv[1] &&
  (process.argv[1].endsWith('confidence-tracker.js') ||
    process.argv[1].endsWith('confidence-tracker.ts'));

if (isMainModule) {
  main();
}
