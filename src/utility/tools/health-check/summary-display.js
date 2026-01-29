/**
 * BMAD Health Check Summary Display - INST-023
 * Epic 4 - Post-Install Health Check
 *
 * Displays comprehensive health check results with
 * ASCII banner, grouped sections, and recommendations.
 *
 * @module health-check/summary-display
 * @author BlackUnicorn.Tech
 * @version 1.0.0
 */

// ============================================================================
// Constants
// ============================================================================

export const STATUS_ICONS = {
  healthy: '✓',
  degraded: '⚠',
  unhealthy: '✗',
  valid: '✓',
  expired: '✗',
  invalid: '✗',
  missing: '✗'
};

export const COLORS = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

export const OVERALL_STATUS = {
  HEALTHY: 'HEALTHY',
  DEGRADED: 'DEGRADED',
  UNHEALTHY: 'UNHEALTHY'
};

// ============================================================================
// Color Utilities
// ============================================================================

/**
 * Apply color to text
 * @param {string} text - Text to colorize
 * @param {string} color - Color name from COLORS
 * @returns {string} Colored text
 */
export function colorize(text, color) {
  const colorCode = COLORS[color] || COLORS.reset;
  return `${colorCode}${text}${COLORS.reset}`;
}

/**
 * Get color for status
 * @param {string} status - Status string
 * @returns {string} Color name
 */
export function getStatusColor(status) {
  const lowerStatus = (status || '').toLowerCase();
  if (lowerStatus === 'healthy' || lowerStatus === 'valid') {
    return 'green';
  }
  if (lowerStatus === 'degraded') {
    return 'yellow';
  }
  return 'red';
}

/**
 * Get icon for status
 * @param {string} status - Status string
 * @returns {string} Status icon
 */
export function getStatusIcon(status) {
  const lowerStatus = (status || '').toLowerCase();
  return STATUS_ICONS[lowerStatus] || '?';
}

// ============================================================================
// Banner
// ============================================================================

/**
 * Generate ASCII banner header
 * @returns {string} Banner text
 */
export function generateBanner() {
  const banner = `
${colorize('═══════════════════════════════════════════════════', 'cyan')}
${colorize('  BMAD-CYBER Health Check', 'bold')}
${colorize('═══════════════════════════════════════════════════', 'cyan')}
`;
  return banner;
}

// ============================================================================
// Section Formatters
// ============================================================================

/**
 * Format Core Services section (modules)
 * @param {object} moduleResult - Result from module-checker
 * @returns {string} Formatted section
 */
export function formatCoreServicesSection(moduleResult) {
  const lines = [];
  const icon = getStatusIcon(moduleResult.status);
  const color = getStatusColor(moduleResult.status);

  lines.push(colorize('\nCore Services:', 'bold'));

  if (moduleResult.status === 'healthy') {
    lines.push(`  ${colorize(icon, color)} Framework loaded`);
    lines.push(`  ${colorize(icon, color)} ${moduleResult.totalModules} modules active (${moduleResult.modules.map(m => m.name || m.code).join(', ')})`);
    lines.push(`  ${colorize(icon, color)} ${moduleResult.totalAgents} agents registered`);
    lines.push(`  ${colorize(icon, color)} ${moduleResult.totalWorkflows} workflows available`);
  } else if (moduleResult.status === 'degraded') {
    lines.push(`  ${colorize('✓', 'green')} Framework loaded`);
    lines.push(`  ${colorize(icon, color)} ${moduleResult.totalModules} modules (some issues found)`);
    for (const mod of moduleResult.modules) {
      if (mod.status !== 'healthy') {
        lines.push(`    ${colorize('⚠', 'yellow')} ${mod.name}: ${mod.issues.join(', ')}`);
      }
    }
  } else {
    lines.push(`  ${colorize(icon, color)} ${moduleResult.error || 'Module loading failed'}`);
    if (moduleResult.issues && moduleResult.issues.length > 0) {
      for (const issue of moduleResult.issues) {
        lines.push(`    ${colorize('✗', 'red')} ${issue}`);
      }
    }
  }

  return lines.join('\n');
}

/**
 * Format Authentication section (token)
 * @param {object} tokenResult - Result from token-checker
 * @returns {string} Formatted section
 */
export function formatAuthenticationSection(tokenResult) {
  const lines = [];
  const icon = getStatusIcon(tokenResult.status);
  const color = getStatusColor(tokenResult.status);

  lines.push(colorize('\nAuthentication:', 'bold'));

  if (tokenResult.status === 'valid') {
    lines.push(`  ${colorize(icon, color)} Token valid`);
    if (tokenResult.expiresIn) {
      lines.push(`  ${colorize(icon, color)} Expires in ${tokenResult.expiresIn}`);
    }
    if (tokenResult.role) {
      lines.push(`  ${colorize(icon, color)} Role: ${tokenResult.role}`);
    }
    if (tokenResult.warnings && tokenResult.warnings.length > 0) {
      for (const warning of tokenResult.warnings) {
        lines.push(`  ${colorize('⚠', 'yellow')} ${warning}`);
      }
    }
  } else if (tokenResult.status === 'expired') {
    lines.push(`  ${colorize(icon, color)} Token expired`);
    if (tokenResult.role) {
      lines.push(`  ${colorize('⚠', 'yellow')} Role: ${tokenResult.role}`);
    }
    lines.push(`  ${colorize('!', 'yellow')} Run 'npm run token:generate' to create new token`);
  } else if (tokenResult.status === 'missing') {
    lines.push(`  ${colorize(icon, color)} Token not configured`);
    lines.push(`  ${colorize('!', 'yellow')} Run 'npm run setup' to configure authentication`);
  } else {
    lines.push(`  ${colorize(icon, color)} Token invalid: ${tokenResult.error || 'Unknown error'}`);
    lines.push(`  ${colorize('!', 'yellow')} Run 'npm run token:generate' to regenerate`);
  }

  return lines.join('\n');
}

/**
 * Format LLM Provider section
 * @param {object} llmResult - Result from llm-checker
 * @returns {string} Formatted section
 */
export function formatLLMProviderSection(llmResult) {
  const lines = [];
  const icon = getStatusIcon(llmResult.status);
  const color = getStatusColor(llmResult.status);

  lines.push(colorize('\nLLM Provider:', 'bold'));

  if (llmResult.status === 'healthy') {
    const primary = llmResult.providers.find(p => p.isPrimary);
    if (primary) {
      lines.push(`  ${colorize('✓', 'green')} ${primary.name} connected`);
      if (primary.model) {
        lines.push(`  ${colorize('✓', 'green')} Model: ${primary.model}`);
      }
    }

    // Check fallbacks
    const fallbacks = llmResult.providers.filter(p => !p.isPrimary);
    for (const fallback of fallbacks) {
      if (fallback.status === 'healthy') {
        lines.push(`  ${colorize('✓', 'green')} Fallback: ${fallback.name} available`);
      } else {
        lines.push(`  ${colorize('⚠', 'yellow')} Fallback (${fallback.name}) not running`);
      }
    }
  } else if (llmResult.status === 'degraded') {
    const working = llmResult.providers.filter(p => p.status === 'healthy');
    const failing = llmResult.providers.filter(p => p.status !== 'healthy');

    if (working.length > 0) {
      lines.push(`  ${colorize('✓', 'green')} ${working.map(p => p.name).join(', ')} connected`);
    }
    for (const provider of failing) {
      lines.push(`  ${colorize('⚠', 'yellow')} ${provider.name} not available: ${provider.error || 'connection failed'}`);
    }
  } else {
    lines.push(`  ${colorize(icon, color)} No LLM providers available`);
    if (llmResult.error) {
      lines.push(`  ${colorize('✗', 'red')} ${llmResult.error}`);
    }
    lines.push(`  ${colorize('!', 'yellow')} Run 'npm run llm:setup' to configure providers`);
  }

  return lines.join('\n');
}

/**
 * Format Security section
 * @param {object} securityResult - Result from security-checker
 * @returns {string} Formatted section
 */
export function formatSecuritySection(securityResult) {
  const lines = [];
  const icon = getStatusIcon(securityResult.status);
  const color = getStatusColor(securityResult.status);

  lines.push(colorize('\nSecurity:', 'bold'));

  if (securityResult.status === 'healthy') {
    if (securityResult.validatorsEnabled > 0) {
      lines.push(`  ${colorize('✓', 'green')} ${securityResult.validatorsEnabled} validators active`);
    }
    if (securityResult.auditLogging) {
      lines.push(`  ${colorize('✓', 'green')} Audit logging enabled`);
    }
    if (securityResult.guardsEnabled > 0) {
      lines.push(`  ${colorize('✓', 'green')} ${securityResult.guardsEnabled} guards configured`);
    }
  } else if (securityResult.status === 'degraded') {
    if (securityResult.validatorsEnabled > 0) {
      lines.push(`  ${colorize('✓', 'green')} ${securityResult.validatorsEnabled} validators active`);
    }
    if (securityResult.warnings && securityResult.warnings.length > 0) {
      for (const warning of securityResult.warnings) {
        lines.push(`  ${colorize('⚠', 'yellow')} ${warning}`);
      }
    }
  } else {
    lines.push(`  ${colorize(icon, color)} Security configuration not found`);
    if (securityResult.error) {
      lines.push(`  ${colorize('✗', 'red')} ${securityResult.error}`);
    }
    lines.push(`  ${colorize('!', 'yellow')} Run 'npm run security:setup' to configure`);
  }

  return lines.join('\n');
}

// ============================================================================
// Recommendations
// ============================================================================

/**
 * Generate recommendations based on results
 * @param {object} results - All health check results
 * @returns {string[]} Array of recommendations
 */
export function generateRecommendations(results) {
  const recommendations = [];

  // Module recommendations
  if (results.modules?.status === 'unhealthy') {
    recommendations.push('Fix module configuration by running `npm run modules:setup`');
  } else if (results.modules?.status === 'degraded') {
    recommendations.push('Some modules have issues - check module.yaml files');
  }

  // Token recommendations
  if (results.token?.status === 'missing') {
    recommendations.push('Configure authentication with `npm run setup`');
  } else if (results.token?.status === 'expired') {
    recommendations.push('Regenerate expired token with `npm run token:generate`');
  } else if (results.token?.status === 'invalid') {
    recommendations.push('Fix token by regenerating with `npm run token:generate`');
  } else if (results.token?.warnings && results.token.warnings.length > 0) {
    recommendations.push('Token expires soon - consider regenerating');
  }

  // LLM recommendations
  if (results.llm?.status === 'unhealthy') {
    recommendations.push('Configure LLM provider with `npm run llm:setup`');
  } else if (results.llm?.status === 'degraded') {
    const failing = results.llm.providers?.filter(p => p.status !== 'healthy') || [];
    if (failing.length > 0) {
      recommendations.push(`Check ${failing.map(p => p.name).join(', ')} configuration`);
    }
  }

  // Security recommendations
  if (results.security?.status === 'unhealthy') {
    recommendations.push('Configure security with `npm run security:setup`');
  } else if (results.security?.status === 'degraded') {
    if (!results.security.auditLogging) {
      recommendations.push('Consider enabling audit logging');
    }
  }

  return recommendations;
}

/**
 * Format recommendations section
 * @param {string[]} recommendations - Array of recommendations
 * @returns {string} Formatted section
 */
export function formatRecommendationsSection(recommendations) {
  if (recommendations.length === 0) {
    return '';
  }

  const lines = [];
  lines.push(colorize('\nRecommendations:', 'bold'));
  for (const rec of recommendations) {
    lines.push(`  ${colorize('→', 'cyan')} ${rec}`);
  }
  return lines.join('\n');
}

// ============================================================================
// Overall Status
// ============================================================================

/**
 * Calculate overall status from results
 * @param {object} results - All health check results
 * @returns {string} Overall status: HEALTHY, DEGRADED, or UNHEALTHY
 */
export function calculateOverallStatus(results) {
  const statuses = [
    results.modules?.status,
    results.token?.status,
    results.llm?.status,
    results.security?.status
  ];

  // Map token statuses to health statuses
  const normalizedStatuses = statuses.map(s => {
    if (s === 'valid') return 'healthy';
    if (s === 'expired' || s === 'missing' || s === 'invalid') return 'unhealthy';
    if (s === undefined || s === null) return 'unhealthy'; // Treat missing as unhealthy
    return s;
  });

  // If any critical component is unhealthy
  if (normalizedStatuses.includes('unhealthy')) {
    // Check if it's just token missing (could be new install)
    const criticalUnhealthy = [
      results.modules?.status === 'unhealthy' || !results.modules?.status,
      results.llm?.status === 'unhealthy' || !results.llm?.status
    ].some(Boolean);

    if (criticalUnhealthy) {
      return OVERALL_STATUS.UNHEALTHY;
    }

    // Token/security issues but other things work
    return OVERALL_STATUS.DEGRADED;
  }

  // Any degraded components
  if (normalizedStatuses.includes('degraded')) {
    return OVERALL_STATUS.DEGRADED;
  }

  return OVERALL_STATUS.HEALTHY;
}

/**
 * Format overall status line
 * @param {string} status - Overall status
 * @returns {string} Formatted status line
 */
export function formatOverallStatus(status) {
  let color;
  switch (status) {
    case OVERALL_STATUS.HEALTHY:
      color = 'green';
      break;
    case OVERALL_STATUS.DEGRADED:
      color = 'yellow';
      break;
    default:
      color = 'red';
  }

  return `\n${colorize('Overall Status:', 'bold')} ${colorize(status, color)}\n`;
}

/**
 * Calculate exit code from overall status
 * @param {string} status - Overall status
 * @returns {number} Exit code (0=healthy, 1=degraded, 2=unhealthy)
 */
export function calculateExitCode(status) {
  switch (status) {
    case OVERALL_STATUS.HEALTHY:
      return 0;
    case OVERALL_STATUS.DEGRADED:
      return 1;
    default:
      return 2;
  }
}

// ============================================================================
// Main Display Function
// ============================================================================

/**
 * Display full health check summary
 * @param {object} results - All health check results
 * @param {object} options - Display options
 * @returns {object} Result with exitCode and formattedOutput
 */
export function displaySummary(results, options = {}) {
  const { noColor = false } = options;

  // Disable colors if requested
  if (noColor) {
    for (const key of Object.keys(COLORS)) {
      COLORS[key] = '';
    }
  }

  const output = [];

  // Banner
  output.push(generateBanner());

  // Sections
  output.push(formatCoreServicesSection(results.modules || { status: 'unhealthy', error: 'Not checked' }));
  output.push(formatAuthenticationSection(results.token || { status: 'missing' }));
  output.push(formatLLMProviderSection(results.llm || { status: 'unhealthy', error: 'Not checked' }));
  output.push(formatSecuritySection(results.security || { status: 'unhealthy', error: 'Not checked' }));

  // Recommendations
  const recommendations = generateRecommendations(results);
  output.push(formatRecommendationsSection(recommendations));

  // Overall status
  const overallStatus = calculateOverallStatus(results);
  output.push(formatOverallStatus(overallStatus));

  const formattedOutput = output.join('');

  return {
    exitCode: calculateExitCode(overallStatus),
    overallStatus,
    recommendations,
    formattedOutput
  };
}

// ============================================================================
// JSON Output
// ============================================================================

/**
 * Format results as JSON
 * @param {object} results - All health check results
 * @returns {object} JSON-formatted results
 */
export function formatJsonOutput(results) {
  const overallStatus = calculateOverallStatus(results);
  const recommendations = generateRecommendations(results);

  return {
    timestamp: new Date().toISOString(),
    overallStatus,
    exitCode: calculateExitCode(overallStatus),
    checks: {
      modules: results.modules || null,
      token: results.token || null,
      llm: results.llm || null,
      security: results.security || null
    },
    recommendations
  };
}

export default displaySummary;
