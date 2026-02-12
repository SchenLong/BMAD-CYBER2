/**
 * URL Validator for Git Repository URLs
 *
 * Security module to prevent command injection via malicious repository URLs.
 * Only allows HTTPS URLs from trusted Git hosting providers.
 *
 * @module url-validator
 */

// Trusted domains for git repositories
const TRUSTED_DOMAINS = [
  'github.com',
  'gitlab.com',
  'bitbucket.org'
];

// Shell metacharacters that could enable command injection
const DANGEROUS_CHARS = /[$`|;&(){}<>\n\r\\]/;

/**
 * Validates a git repository URL for security
 *
 * @param {string} repoUrl - The repository URL to validate
 * @returns {{ valid: boolean, error?: string }} Validation result
 *
 * @example
 * const result = validateRepoUrl('https://github.com/user/repo.git');
 * if (!result.valid) {
 *   throw new Error(result.error);
 * }
 */
export function validateRepoUrl(repoUrl) {
  // Must be a non-empty string
  if (!repoUrl || typeof repoUrl !== 'string') {
    return {
      valid: false,
      error: 'Repository URL must be a non-empty string'
    };
  }

  // Check for shell metacharacters BEFORE any other processing
  if (DANGEROUS_CHARS.test(repoUrl)) {
    return {
      valid: false,
      error: 'Repository URL contains invalid characters. URLs must not contain shell metacharacters.'
    };
  }

  // Parse the URL to validate format
  let url;
  try {
    url = new URL(repoUrl);
  } catch {
    return {
      valid: false,
      error: 'Invalid URL format. Please provide a valid HTTPS URL.'
    };
  }

  // Only allow HTTPS protocol
  if (url.protocol !== 'https:') {
    return {
      valid: false,
      error: `Only HTTPS URLs are allowed. Received protocol: ${url.protocol}`
    };
  }

  // Check if hostname is in trusted domains
  const hostname = url.hostname.toLowerCase();
  const isTrusted = TRUSTED_DOMAINS.some(domain => hostname === domain);

  if (!isTrusted) {
    return {
      valid: false,
      error: `Repository URL must be from a trusted domain: ${TRUSTED_DOMAINS.join(', ')}`
    };
  }

  // Additional path validation - must look like a valid repo path
  // e.g., /owner/repo or /owner/repo.git
  const pathPattern = /^\/[\w.-]+\/[\w.-]+(\.git)?$/;
  if (!pathPattern.test(url.pathname)) {
    return {
      valid: false,
      error: 'Invalid repository path format. Expected format: https://github.com/owner/repo'
    };
  }

  return { valid: true };
}

/**
 * Validates a git repository URL and throws if invalid
 *
 * @param {string} repoUrl - The repository URL to validate
 * @throws {Error} If the URL is invalid or from an untrusted source
 *
 * @example
 * assertValidRepoUrl('https://github.com/user/repo.git'); // OK
 * assertValidRepoUrl('$(malicious)'); // throws Error
 */
export function assertValidRepoUrl(repoUrl) {
  const result = validateRepoUrl(repoUrl);
  if (!result.valid) {
    throw new Error(result.error);
  }
}
