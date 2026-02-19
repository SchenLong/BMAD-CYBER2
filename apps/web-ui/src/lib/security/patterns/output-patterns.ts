/**
 * Output Filter Patterns
 * Story 9.3: Output Filtering
 *
 * Pattern definitions for detecting suspicious content in LLM outputs.
 * These patterns identify potential security issues including:
 * - Embedded instructions that could trick users
 * - Code execution attempts
 * - File system access
 * - System commands
 * - Data exfiltration
 * - Internal API exposure
 * - Credential exposure
 *
 * @module security/patterns/output-patterns
 */

/**
 * Pattern match result
 */
export interface OutputPatternMatch {
  category: string
  pattern: string
  match: string
  position: number
  severity: OutputSeverityLevel
}

/**
 * Severity scores for pattern categories
 */
export const CATEGORY_SEVERITY = {
  EMBEDDED_INSTRUCTION: 50, // medium
  CODE_EXECUTION: 100, // critical
  FILE_PATH: 40, // low-medium
  SYSTEM_COMMAND: 80, // high
  EXFILTRATION: 70, // high
  INTERNAL_API: 90, // critical
  CREDENTIAL_PATTERN: 100, // critical
  OBFUSCATION: 60, // medium-high
} as const

/**
 * Embedded instruction patterns
 * These detect attempts to embed commands within otherwise benign output
 */
export const EMBEDDED_INSTRUCTION: RegExp[] = [
  // Direct command execution instructions
  /execute\s*:/gi,
  /run\s+(this\s+)?command\s*[:=]/gi,
  /type\s+(this\s+)?(command|script|code)\s*[:=]/gi,
  /paste\s+(this\s+)?(into|command)\s*[:=]/gi,
  /copy\s+(and\s+)?(execute|run)\s*:/gi,

  // Instruction prefixes
  /['"`]\s*(now\s+)?(execute|run|type|paste)\s*:/gi,
  /\bthen\s+(execute|run|type)\s*:/gi,

  // Conditional instructions
  /if\s+(you\s+)?(want|needed)\s*:/gi,
  /when\s+\w+\s*,\s*(execute|run)\s*:/gi,
]

/**
 * Code execution patterns
 * These detect function calls that execute arbitrary code
 */
export const CODE_EXECUTION: RegExp[] = [
  // JavaScript/TypeScript execution
  /\beval\s*\(/gi,
  /\bFunction\s*\(/gi,
  /\bsetTimeout\s*\(\s*['"`]/gi,
  /\bsetInterval\s*\(\s*['"`]/gi,

  // Python execution
  /\bexec\s*\(/gi,
  /\bcompile\s*\(/gi,
  /\b__import__\s*\(/gi,

  // PHP execution
  /\beval\s*\(\s*\$\w+/gi,
  /\bassert\s*\(\s*\$/gi,
  /\bcreate_function\s*\(/gi,
  /\bpreg_replace\s*\(\s*['"`].*\/e/gi,

  // Shell execution
  /\bsystem\s*\(/gi,
  /\bshell_exec\s*\(/gi,
  /\bpassthru\s*\(/gi,
  /\bpopen\s*\(/gi,
  /\bproc_open\s*\(/gi,

  // Node.js child process
  /\bsubprocess\./gi,
  /\bchild_process\./gi,
  /\bspawn\s*\(/gi,
  /\bexecFile\s*\(/gi,
  /\bfork\s*\(/gi,

  // Ruby execution
  /\beval\s*\(/gi,
  /\bsystem\s*\(/gi,
  /\bexec\s*\(/gi,
  /\b`.*`\s*=/gi, // backtick execution

  // General dangerous patterns
  /\.<\s*[\w\d_]+\s*>\(/gi, // dynamic method call
  /\[\s*['"`]\s*\w+\s*['"`]\s*\]\s*\(/gi, // dynamic property access call
]

/**
 * File path patterns
 * These detect references to file system paths that could indicate unauthorized access
 */
export const FILE_PATH: RegExp[] = [
  // Unix/Linux paths
  /\/(?:etc|root|home|var|tmp|usr|bin|sbin|opt)(?:\/[\w.-]+)*/gi,

  // Sensitive files
  /\/etc\/(passwd|shadow|hosts|sudoers|crontab)/gi,
  /\/(?:root|home)\/[\w-]+\/\.?\w+/gi,
  /\/(?:var\/log|tmp)(?:\/[\w.-]+)*/gi,

  // Windows paths
  /[A-Z]:\\(?:Windows|Program Files|Users|System32)(?:\\[\w.-]+)*/gi,
  /\\(?:windows|system32|program files)(?:\\[\w.-]+)*/gi,

  // UNC paths
  /\\\\[\w.-]+\\[\w.-]+/gi,

  // Config files
  /\/\.[\w-]+rc/gi,
  /\.(env|config|ini|conf|cfg|yaml|yml|json)(?:\s*['"`\s]|$)/gi,
]

/**
 * System command patterns
 * These detect system administration commands that could be abused
 */
export const SYSTEM_COMMAND: RegExp[] = [
  // Linux/Unix commands
  /(?:^|\s)(?:sudo|su|doas)(?:\s|$)/gi,
  /(?:^|\s)(?:chmod|chown|chgrp)\s+[0-7]+/gi,
  /(?:^|\s)(?:rm|mv|cp)\s+-rf?\s*\/?/gi,
  /(?:^|\s)(?:dd|nc|netcat|ncat)(?:\s|$)/gi,
  /(?:^|\s)(?:iptables|nftables|ufw)(?:\s|$)/gi,
  /(?:^|\s)(?:crontab|at|batch)(?:\s|$)/gi,
  /(?:^|\s)(?:useradd|usermod|userdel)(?:\s|$)/gi,
  /(?:^|\s)passwd(?:\s|$)/gi,

  // Windows commands
  /(?:^|\s)(?:cmd|powershell|pwsh)(?:\s|$)/gi,
  /(?:^|\s)(?:reg\s+add|reg\s+delete)/gi,
  /(?:^|\s)(?:schtasks|taskkill)(?:\s|$)/gi,
  /(?:^|\s)(?:net\s+(?:user|group|use|share))/gi,

  // Network commands
  /(?:^|\s)(?:curl|wget|fetch|lwp-download)(?:\s|$)/gi,
  /(?:^|\s)(?:ssh|telnet|ftp|tftp)(?:\s|$)/gi,
  /(?:^|\s)(?:nc|netcat|socat)(?:\s|$)/gi,
  /(?:^|\s)(?:ping|traceroute|nslookup|dig)(?:\s|$)/gi,
  /(?:^|\s)(?:nmap|masscan)(?:\s|$)/gi,

  // Package managers
  /(?:^|\s)(?:apt|yum|dnf|pacman|pip|npm)\s+(?:install|remove|update)/gi,
]

/**
 * Exfiltration patterns
 * These detect attempts to exfiltrate data in various formats
 */
export const EXFILTRATION: RegExp[] = [
  // Base64 encoded data
  /(?:base64|b64)\s*:\s*[A-Za-z0-9+/=]{30,}(?:\s*(?:here|end|$))/gi,
  /[A-Za-z0-9+/=]{60,}\s*=\s*(?:here|end|$)/gi,

  // Hex dumps
  /(?:hex\s+dump|0x[0-9a-f]+(?:\s*,\s*0x[0-9a-f]+){3,})/gi,
  /\\x[0-9a-f]{2}(?:\\x[0-9a-f]{2}){4,}/gi,

  // Data URI schemes
  /data:\s*(?:text|application)\/(?:plain|json|xml|javascript)/gi,

  // Encoding indicators
  /(?:toString|String\.fromCharCode)\s*\(\s*['"]16['"]\s*\)/gi,
  /atob\s*\(/gi,
  /btoa\s*\(/gi,
  /Buffer\.from\s*\(/gi,

  // Structured data exports
  /(?:export|dump|serialize)\s*(?:all\s+)?(?:data|database|config)/gi,
  /JSON\.stringify\s*\(\s*(?:users|credentials|config|env)/gi,

  // "Copy this" instructions
  /copy\s+(?:this\s+)?(?:everything|the\s+above|all\s+below)/gi,
  /\['"`](?:save|store|remember)\s+this['"`]/gi,
]

/**
 * Internal API patterns
 * These detect references to internal APIs or services that shouldn't be exposed
 */
export const INTERNAL_API: RegExp[] = [
  // Localhost references
  /https?:\/\/localhost:\d+/gi,
  /https?:\/\/127\.0\.0\.1:\d+/gi,
  /https?:\/\/0\.0\.0\.0:\d+/gi,
  /https?:\/\/192\.168\.\d+\.\d+:\d+/gi,
  /https?:\/\/10\.\d+\.\d+\.\d+:\d+/gi,

  // Internal endpoints
  /\/api\/(internal|admin|private|system)/gi,
  /\/(?:v1|v2|v3)\/(?:users|auth|admin|config)/gi,
  /\/_?(?:internal|private|system|admin)\//gi,

  // Debug interfaces
  /\/(?:debug|test|dev|staging)\//gi,
  /\/graphql\s*['"`]\s*,/gi,
  /__\w+__\s*:/gi, // dunder methods

  // Direct database access
  /mongodb:\/\/[\w.-]+:[\w.-]+@/gi,
  /postgres(?:ql)?:\/\/[\w.-]+:[\w.-]+@/gi,
  /mysql:\/\/[\w.-]+:[\w.-]+@/gi,
  /redis:\/\/[\w.-]+@/gi,
]

/**
 * Credential pattern
 * These detect exposed credentials, tokens, or passwords
 */
export const CREDENTIAL_PATTERN: RegExp[] = [
  // API keys
  /(?:api[_-]?key|apikey|access[_-]?token)\s*[:=]\s*['"`]?[A-Za-z0-9_\-]{20,}['"`]?/gi,

  // Common token prefixes
  /(?:sk_|pk_|eyJ|ghp_|gho_|ghu_|glpat-)[A-Za-z0-9_\-]{20,}/gi,

  // JWT tokens
  /eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/gi,

  // Password references
  /(?:password|passwd|pwd)\s*[:=]\s*['"`]?[\w@#$%^&*()\-+=]{8,}['"`]?/gi,

  // Secret keys
  /(?:secret[_-]?key|private[_-]?key|auth[_-]?token)\s*[:=]/gi,

  // Bearer tokens
  /bearer\s+[A-Za-z0-9_\-\.]{20,}/gi,

  // Session IDs
  /(?:session[_-]?id|sid|phpsessid|jsessionid)\s*[:=]\s*['"`]?[A-Za-z0-9_\-]{20,}['"`]?/gi,

  // Certificate materials
  /-----BEGIN\s+(?:RSA\s+)?PRIVATE\s+KEY-----/gi,
  /-----BEGIN\s+CERTIFICATE-----/gi,
]

/**
 * Obfuscation patterns
 * These detect attempts to hide malicious code through encoding
 */
export const OBFUSCATION: RegExp[] = [
  // Character code references
  /fromCharCode\s*\([^)]+\)/gi,
  /charCodeAt\s*\(/gi,
  /\\x[0-9a-f]{2}/gi,
  /\\u[0-9a-f]{4}/gi,
  /\\[0-7]{1,3}/gi,

  // String manipulation
  /['"`]\s*\+\s*['"`]/gi,
  /split\s*\(\s*['"`][`'"']{3}/gi,
  /reverse\s*\(\s*\)/gi,

  // Eval-like patterns
  /\bwindow\s*\[\s*['"`]\w+['"`]\s*\]/gi,
  /\bthis\s*\[\s*['"`]\w+['"`]\s*\]/gi,
  /\[.*?\]\s*\(\s*\)/gi,

  // Base64 with decode
  /atob\s*\(/gi,
  /Buffer\.from\s*\(/gi,
  /\.\s*toString\s*\(\s*['"`](?:base|hex|binary)['"`]\s*\)/gi,
]

/**
 * All output patterns organized by category
 */
export const OUTPUT_PATTERNS = {
  EMBEDDED_INSTRUCTION,
  CODE_EXECUTION,
  FILE_PATH,
  SYSTEM_COMMAND,
  EXFILTRATION,
  INTERNAL_API,
  CREDENTIAL_PATTERN,
  OBFUSCATION,
} as const

/**
 * Output pattern category type
 */
export type OutputPatternCategory = keyof typeof OUTPUT_PATTERNS

/**
 * Default filter configuration
 */
export const DEFAULT_FILTER_CONFIG = {
  blockCritical: true,
  blockHigh: true,
  warnMedium: true,
  logLow: true,
  maxOutputLength: 10000, // Maximum characters to check (for performance)
  truncateLogLength: 500, // Characters to show in logs
  allowlist: [] as string[],
  agentSpecificRules: {} as Record<string, Partial<typeof DEFAULT_FILTER_CONFIG>>,
}

/**
 * Filter configuration type
 */
export interface OutputFilterConfig {
  blockCritical: boolean
  blockHigh: boolean
  warnMedium: boolean
  logLow: boolean
  maxOutputLength: number
  truncateLogLength: number
  allowlist: string[]
  agentSpecificRules: Record<string, Partial<typeof DEFAULT_FILTER_CONFIG>>
}

/**
 * Severity thresholds
 */
export const SEVERITY_THRESHOLDS = {
  critical: 90,
  high: 70,
  medium: 50,
  low: 30,
} as const

/**
 * Severity type for output filtering (renamed to avoid conflict with prompt injection detector)
 */
export type OutputSeverityLevel = 'low' | 'medium' | 'high' | 'critical'
