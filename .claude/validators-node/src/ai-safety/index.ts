/**
 * BMAD Validators - AI Safety Module
 * ===================================
 * Guards against AI manipulation attempts including prompt injection and jailbreak.
 */

// Prompt Injection Guard
export {
  detectPatterns as detectInjectionPatterns,
  detectHiddenUnicode,
  detectBase64Payloads,
  detectHtmlCommentInjection,
  analyzeContent as analyzeInjectionContent,
  validatePromptInjection,
  main as promptInjectionMain,
} from './prompt-injection.js';

export type {
  PatternFinding,
  UnicodeFinding,
  Base64Finding,
  HtmlCommentFinding,
  AnalysisResult as InjectionAnalysisResult,
} from './prompt-injection.js';

// Jailbreak Guard
export {
  normalizeText,
  detectPatterns as detectJailbreakPatterns,
  fuzzyMatchKeywords,
  detectHeuristicPatterns,
  detectMultiTurnPatterns,
  analyzeContent as analyzeJailbreakContent,
  validateJailbreak,
  main as jailbreakMain,
} from './jailbreak.js';

export type {
  JailbreakFinding,
  FuzzyFinding,
  HeuristicFinding,
  MultiTurnFinding,
  JailbreakAnalysisResult,
} from './jailbreak.js';

// Pattern Engine (TPI-09, P1-3)
export {
  detectPatterns as detectEnginePatterns,
  CRITICAL_PATTERNS,
  ALL_PATTERN_CATEGORIES,
} from './pattern-engine.js';

export type {
  PatternDefinition,
} from './pattern-engine.js';

// Reformulation Detector (TPI-09, TPI-10, TPI-11, TPI-13)
export {
  detectCodeFormatInjection,
  detectCharacterLevelEncoding,
  detectContextOverload,
  detectMathLogicEncoding,
} from './reformulation-detector.js';

export type {
  ReformulationFinding,
} from './reformulation-detector.js';

// Session Tracker fragment buffer (TPI-13), many-shot (TPI-11), slow-drip (TPI-16)
export {
  updateFragmentBuffer,
  updateInstructionCount,
  detectSlowDrip,
} from './session-tracker.js';

export type {
  SlowDripResult,
} from './session-tracker.js';

// Boundary Detector (TPI-14)
export {
  detectBoundaryManipulation,
} from './boundary-detector.js';

export type {
  BoundaryFinding,
} from './boundary-detector.js';

// Multilingual Patterns (TPI-15)
export {
  detectMultilingualInjection,
  getLanguageCount,
  getPatternCountByLanguage,
} from './multilingual-patterns.js';

export type {
  MultilingualFinding,
} from './multilingual-patterns.js';

// Text Normalizer whitespace detection (TPI-17)
export {
  detectUnusualWhitespace,
} from './text-normalizer.js';
