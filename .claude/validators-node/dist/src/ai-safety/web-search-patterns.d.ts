/**
 * BMAD Validators - WebSearch-Specific Pattern Detection (TPI-05)
 * ================================================================
 * Detects injection patterns specific to search results:
 * - SEO-poisoned snippets with injection payloads
 * - Malicious URL patterns in search results
 * - Injection in search result titles
 * - Fake search result formatting
 *
 * Search results are typically shorter than full web pages but can
 * still contain injected snippets via SEO poisoning.
 *
 * Reference: TPI-CROWDSTRIKE Implementation Plan, Story TPI-05
 */
import type { Finding } from '../types/index.js';
export interface SearchResultFinding extends Finding {
    pattern_name: string;
}
/**
 * Analyze search result content for search-specific injection patterns.
 * Complements the generic analyzeContent() with search-specific detection.
 */
export declare function analyzeSearchResults(content: string): SearchResultFinding[];
