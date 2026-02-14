/**
 * BMAD Guardrails: XSS (Cross-Site Scripting) Safety Validator
 * ==============================================================
 * Detects XSS patterns in content to prevent cross-site scripting attacks.
 *
 * OWASP Coverage (A03-201..208):
 * - A03-201: Reflected XSS detection
 * - A03-202: Stored XSS detection
 * - A03-203: DOM-based XSS detection
 * - A03-204: Event handler XSS detection
 * - A03-205: Polyglot XSS detection
 * - A03-206: CSS expression XSS detection
 * - A03-207: SVG XSS detection
 * - A03-208: JavaScript URI XSS detection
 *
 * Severity Levels:
 * - CRITICAL: Definitive XSS payload (block)
 * - HIGH: Strong XSS indicator (block with override)
 * - WARNING: Suspicious pattern (log and warn)
 * - INFO: Informational (context-dependent, allow)
 */

import type { Severity, XSSDetectionResult } from '../types/xss-types.js';

/**
 * XSS Pattern definitions organized by attack vector
 */
const XSS_PATTERNS = {
  /**
   * A03-201: Reflected XSS patterns
   * Untrusted input reflected immediately in response
   */
  reflected: [
    // Script tag injections
    /<script[^>]*>[\s\S]*?<\/script>/gi,
    // IMG with event handler
    /<img[^>]+onerror[^>]*>/gi,
    /<img[^>]+onload[^>]*>/gi,
    // Iframe with javascript
    /<iframe[^>]*src\s*=\s*['"]\s*javascript:/gi,
    // Meta refresh with javascript
    /<meta[^>]*http-equiv\s*=\s*['"]\s*refresh['"][^>]*url\s*=\s*javascript:/gi,
    // Form with action javascript
    /<form[^>]*action\s*=\s*javascript:/gi,
  ],

  /**
   * A03-202: Stored XSS patterns
   * Payloads stored in database and displayed later
   */
  stored: [
    // Script tag with encoded content
    /<script[^>]*>[^<]*(?:alert|confirm|prompt|eval|Function)[^<]*<\/script>/gi,
    // Event handlers on common elements
    /<(?:div|span|a|img|body|html)[^>]*\s+on(?:click|load|error|mouseover|focus)\s*=/gi,
    // Data URLs
    /<[^>]+src\s*=\s*['"]\s*data:text\/html/gi,
    /<[^>]+href\s*=\s*['"]\s*data:text\/html/gi,
  ],

  /**
   * A03-203: DOM-based XSS patterns
   * Manipulation of DOM via JavaScript
   */
  domBased: [
    // Dangerous DOM manipulation
    /document\.(?:write|writeln)\s*\(/gi,
    /document\.(?:open|close)\s*\(/gi,
    /location\s*\.\s*href\s*=/gi,
    /location\s*\.\s*assign\s*\(/gi,
    /window\.(?:location|name)\s*=/gi,
    // eval and Function constructors
    /\beval\s*\(/gi,
    /new\s+Function\s*\(/gi,
    /setTimeout\s*\(\s*['"][^'"]*['"]\s*,/gi,
    /setInterval\s*\(\s*['"][^'"]*['"]\s*,/gi,
  ],

  /**
   * A03-204: Event handler XSS patterns
   * All HTML event handlers that can execute JavaScript
   */
  eventHandlers: [
    /\bon(?:abort|blur|change|click|dblclick|error|focus|keydown|keyup|load|mousedown|mouseenter|mouseleave|mousemove|mouseout|mouseover|mouseup|reset|resize|select|submit|unload)\s*=/gi,
    // SVG event handlers
    /\bon(?:begin|end|repeat|load)\s*=/gi,
  ],

  /**
   * A03-205: Polyglot XSS patterns
   * Payloads that work across multiple contexts
   */
  polyglot: [
    // Classic polyglot
    /<script>[^<]*<\/script>.*?>.*</gi,
    // Universal polyglot patterns
    /javascript:\s*[\w\u007f-\uffff]+/gi,
    // Encoded variants
    /%3[Cc]%2[Ff]%73%63%72%69%70%74/gi, // <script in hex
  ],

  /**
   * A03-206: CSS expression XSS patterns
   * CSS expressions and dangerous style properties
   */
  cssExpression: [
    /expression\s*\(\s*[\w\u007f-\uffff]*\)/gi,
    /javascript:\s*[\w\u007f-\uffff]+/gi,
    /behavior\s*:\s*url\s*\(\s*['"]?javascript:/gi,
  ],

  /**
   * A03-207: SVG XSS patterns
   * SVG-specific XSS vectors
   */
  svg: [
    /<svg[^>]*>[^<]*<script[\s\S]*?<\/script>[\s\S]*?<\/svg>/gi,
    /<svg[^>]+onload[^>]*>/gi,
    /<svg[^>]+onerror[^>]*>/gi,
    /<svg[^>]+<animate[^>]*>[\s\S]*?<\/animate>[\s\S]*?<\/svg>/gi,
    /<foreignObject[^>]*>[\s\S]*?<script[\s\S]*?<\/script>[\s\S]*?<\/foreignObject>/gi,
  ],

  /**
   * A03-208: JavaScript URI XSS patterns
   * javascript: protocol in href/src
   */
  javascriptUri: [
    /<a\s+[^>]*href\s*=\s*['"]\s*javascript:/gi,
    /<img\s+[^>]*src\s*=\s*['"]\s*javascript:/gi,
    /<iframe\s+[^>]*src\s*=\s*['"]\s*javascript:/gi,
    /<link\s+[^>]*href\s*=\s*['"]\s*javascript:/gi,
  ],
};

/**
 * Context-aware patterns that may be legitimate in certain contexts
 */
const CONTEXTUAL_PATTERNS = [
  // Code blocks, documentation, examples
  /```[\s\S]*?```/g,
  /<code[^>]*>[\s\S]*?<\/code>/gi,
  /<pre[^>]*>[\s\S]*?<\/pre>/gi,
  // HTML entities (safe)
  /&(?:amp|lt|gt|quot|apos);/g,
];

/**
 * Known safe HTML elements and attributes
 */
const SAFE_HTML_PATTERNS = [
  // Bootstrap/common CSS classes
  /\bclass\s*=\s*['"][\w\s\-:;{}()]+['"]/g,
  // Safe inline styles
  /\bstyle\s*=\s*['"][\w\s\-:;#%()]+['"]/g,
];

// Export for external use
export { CONTEXTUAL_PATTERNS, SAFE_HTML_PATTERNS };

/**
 * Detect XSS patterns in content
 *
 * @param content - The content to check
 * @param context - Optional context (filename, content type)
 * @returns XSS detection result
 */
export function detectXSS(content: string, context?: string): XSSDetectionResult {
  if (!content || typeof content !== 'string') {
    return {
      hasXSS: false,
      severity: 'INFO',
      patterns: [],
      message: 'No content to check',
    };
  }

  const detected: Array<{
    pattern: string;
    category: string;
    testId: string;
    line?: number;
  }> = [];

  const lines = content.split('\n');

  // Check each line for XSS patterns
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;

    // Skip if line looks like safe content
    if (isLineSafe(line, context)) {
      continue;
    }

    // Check each XSS category
    for (const [category, patterns] of Object.entries(XSS_PATTERNS)) {
      for (const pattern of patterns as RegExp[]) {
        if (pattern.source && pattern.test(line)) {
          const testId = getTestIdForCategory(category);
          detected.push({
            pattern: pattern.source,
            category,
            testId,
            line: i + 1,
          });
        }
      }
    }
  }

  // Determine severity based on findings
  if (detected.length === 0) {
    return {
      hasXSS: false,
      severity: 'INFO',
      patterns: [],
      message: 'No XSS patterns detected',
    };
  }

  // Check if any CRITICAL patterns found
  const hasCritical = detected.some(d =>
    ['script', 'javascript:', 'eval', 'data:text/html', 'onerror', 'onload']
      .some(p => d.pattern.toLowerCase().includes(p.toLowerCase()))
  );

  const severity: Severity = hasCritical ? 'CRITICAL' : 'WARNING';

  return {
    hasXSS: true,
    severity,
    patterns: detected,
    message: `XSS patterns detected: ${detected.map(d => d.testId).join(', ')}`,
  };
}

/**
 * Check if a line is likely safe based on context
 */
function isLineSafe(line: string, context?: string): boolean {
  // Check if in code block context
  if (context?.includes('.test.') || context?.includes('.spec.')) {
    // Test files may contain XSS patterns as test cases
    return true;
  }

  // Check for code block markers
  if (line.trim().startsWith('```') || line.trim().startsWith('//')) {
    return true;
  }

  // Check for safe HTML patterns
  if (/<div\s+class=['"](alert|toast|message)['"]/.test(line)) {
    return true; // Bootstrap-style alert class
  }

  return false;
}

/**
 * Get OWASP test ID for category
 */
function getTestIdForCategory(category: string): string {
  const testIds: Record<string, string> = {
    reflected: 'A03-201',
    stored: 'A03-202',
    domBased: 'A03-203',
    eventHandlers: 'A03-204',
    polyglot: 'A03-205',
    cssExpression: 'A03-206',
    svg: 'A03-207',
    javascriptUri: 'A03-208',
  };
  return testIds[category] || 'A03-GENERIC';
}

/**
 * Validate content for XSS - strict mode (blocks on any match)
 */
export function validateXSSStrict(content: string, context?: string): {
  allowed: boolean;
  result: XSSDetectionResult;
} {
  const result = detectXSS(content, context);
  return {
    allowed: !result.hasXSS || result.severity === 'INFO',
    result,
  };
}

/**
 * Validate content for XSS - permissive mode (warns on suspicious)
 */
export function validateXSSPermissive(content: string, context?: string): {
  allowed: boolean;
  result: XSSDetectionResult;
} {
  const result = detectXSS(content, context);
  return {
    allowed: result.severity !== 'CRITICAL',
    result,
  };
}

/**
 * Get detailed report of XSS findings
 */
export function getXSSReport(content: string, context?: string): string {
  const result = detectXSS(content, context);

  if (!result.hasXSS) {
    return 'XSS Check: PASSED - No suspicious patterns detected.';
  }

  let report = `XSS Check: ${result.severity}\n`;
  report += `Message: ${result.message}\n`;

  if (result.patterns.length > 0) {
    report += '\nDetections:\n';
    for (const detection of result.patterns) {
      report += `  Line ${detection.line || '?'}: [${detection.testId}] ${detection.category}\n`;
      report += `    Pattern: ${detection.pattern.substring(0, 60)}...\n`;
    }
  }

  return report;
}
