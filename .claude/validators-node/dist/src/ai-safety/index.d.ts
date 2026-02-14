/**
 * BMAD Validators - AI Safety Module
 * ===================================
 * Guards against AI manipulation attempts including prompt injection and jailbreak.
 */
export { detectPatterns as detectInjectionPatterns, detectHiddenUnicode, detectBase64Payloads, detectHtmlCommentInjection, analyzeContent as analyzeInjectionContent, validatePromptInjection, main as promptInjectionMain, } from './prompt-injection.js';
export type { PatternFinding, UnicodeFinding, Base64Finding, HtmlCommentFinding, AnalysisResult as InjectionAnalysisResult, } from './prompt-injection.js';
export { normalizeText, detectPatterns as detectJailbreakPatterns, fuzzyMatchKeywords, detectHeuristicPatterns, detectMultiTurnPatterns, analyzeContent as analyzeJailbreakContent, validateJailbreak, main as jailbreakMain, } from './jailbreak.js';
export type { JailbreakFinding, FuzzyFinding, HeuristicFinding, MultiTurnFinding, JailbreakAnalysisResult, } from './jailbreak.js';
export { detectPatterns as detectEnginePatterns, CRITICAL_PATTERNS, ALL_PATTERN_CATEGORIES, } from './pattern-engine.js';
export type { PatternDefinition, } from './pattern-engine.js';
export { detectCodeFormatInjection, detectCharacterLevelEncoding, detectContextOverload, detectMathLogicEncoding, } from './reformulation-detector.js';
export type { ReformulationFinding, } from './reformulation-detector.js';
export { updateFragmentBuffer, updateInstructionCount, detectSlowDrip, } from './session-tracker.js';
export type { SlowDripResult, } from './session-tracker.js';
export { detectBoundaryManipulation, } from './boundary-detector.js';
export type { BoundaryFinding, } from './boundary-detector.js';
export { detectMultilingualInjection, getLanguageCount, getPatternCountByLanguage, } from './multilingual-patterns.js';
export type { MultilingualFinding, } from './multilingual-patterns.js';
export { detectUnusualWhitespace, } from './text-normalizer.js';
