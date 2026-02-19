/**
 * Per-Command Rate Limit Configuration
 * Story 5.5: CLI Bridge Security Middleware - Task 9
 *
 * Defines rate limits for expensive commands.
 * Limits are based on command cost, risk, and resource usage.
 */

import type { RateLimitConfig } from '@/types/cli-security';

/**
 * Default rate limit for commands
 * 20 requests per minute
 */
export const DEFAULT_RATE_LIMIT: RateLimitConfig = {
  limit: 20,
  windowMs: 60 * 1000, // 1 minute
};

/**
 * Per-command rate limits
 * Commands not listed here use the default limit
 */
export const COMMAND_RATE_LIMITS: Record<string, RateLimitConfig> = {
  // ============================================================
  // EXPENSIVE WORKFLOW COMMANDS
  // ============================================================

  'workflow.execute': {
    limit: 3,
    windowMs: 5 * 60 * 1000, // 3 per 5 minutes
    description: 'Workflow execution is resource-intensive',
  },

  'workflow.create': {
    limit: 10,
    windowMs: 60 * 1000, // 10 per minute
    description: 'Workflow creation has moderate cost',
  },

  // ============================================================
  // AGENT COMMANDS
  // ============================================================

  'agent.invoke': {
    limit: 10,
    windowMs: 60 * 1000, // 10 per minute
    description: 'Agent invocation uses LLM tokens',
  },

  'agent.configure': {
    limit: 5,
    windowMs: 60 * 1000, // 5 per minute
    description: 'Agent configuration changes are sensitive',
  },

  // ============================================================
  // INTELLIGENCE COMMANDS
  // ============================================================

  'intel.flash-assessment': {
    limit: 5,
    windowMs: 60 * 1000, // 5 per minute
    description: 'Flash assessments use quick scan resources',
  },

  'intel.campaign-planner': {
    limit: 2,
    windowMs: 10 * 60 * 1000, // 2 per 10 minutes
    description: 'Campaign planning is resource-intensive',
  },

  'intel.doppelganger-hunt': {
    limit: 2,
    windowMs: 10 * 60 * 1000, // 2 per 10 minutes
    description: 'Doppelganger hunting requires extensive analysis',
  },

  'intel.attribution-chain': {
    limit: 3,
    windowMs: 5 * 60 * 1000, // 3 per 5 minutes
    description: 'Attribution chains require multiple API calls',
  },

  'intel.breach-archaeology': {
    limit: 1,
    windowMs: 30 * 60 * 1000, // 1 per 30 minutes
    description: 'Breach archaeology is very expensive',
  },

  'intel.infrastructure-genealogy': {
    limit: 1,
    windowMs: 15 * 60 * 1000, // 1 per 15 minutes
    description: 'Infrastructure genealogy is expensive',
  },

  'intel.signal-landscape': {
    limit: 5,
    windowMs: 60 * 1000, // 5 per minute
    description: 'Signal landscape analysis is moderate cost',
  },

  'intel.tripwire': {
    limit: 20,
    windowMs: 60 * 1000, // 20 per minute
    description: 'Tripwire checks are lightweight',
  },

  // ============================================================
  // SECURITY COMMANDS
  // ============================================================

  'security.scan': {
    limit: 1,
    windowMs: 30 * 60 * 1000, // 1 per 30 minutes
    description: 'Security scans are very resource-intensive',
  },

  'security.vulnerability-assessment': {
    limit: 1,
    windowMs: 20 * 60 * 1000, // 1 per 20 minutes
    description: 'Vulnerability assessments are expensive',
  },

  'security.pen-test': {
    limit: 1,
    windowMs: 60 * 60 * 1000, // 1 per hour
    bypassRoles: ['SUPERADMIN'],
    description: 'Penetration tests are very expensive and restricted',
  },

  // ============================================================
  // PROJECT/MISSION COMMANDS
  // ============================================================

  'mission.create': {
    limit: 5,
    windowMs: 60 * 1000, // 5 per minute
    description: 'Mission creation has database cost',
  },

  'project.create': {
    limit: 5,
    windowMs: 60 * 1000, // 5 per minute
    description: 'Project creation has database cost',
  },

  // ============================================================
  // REPORTING COMMANDS
  // ============================================================

  'report.generate': {
    limit: 3,
    windowMs: 5 * 60 * 1000, // 3 per 5 minutes
    description: 'Report generation is CPU-intensive',
  },

  'report.export': {
    limit: 10,
    windowMs: 60 * 1000, // 10 per minute
    description: 'Report export is moderate cost',
  },

  // ============================================================
  // READ-ONLY COMMANDS (higher limits)
  // ============================================================

  'mission.list': {
    limit: 100,
    windowMs: 60 * 1000, // 100 per minute
    description: 'Listing missions is lightweight',
  },

  'agent.list': {
    limit: 100,
    windowMs: 60 * 1000, // 100 per minute
    description: 'Listing agents is lightweight',
  },

  'workflow.list': {
    limit: 100,
    windowMs: 60 * 1000, // 100 per minute
    description: 'Listing workflows is lightweight',
  },

  'mission.status': {
    limit: 50,
    windowMs: 60 * 1000, // 50 per minute
    description: 'Status checks are lightweight',
  },
} as const;

/**
 * Get rate limit config for a command
 *
 * @param commandId - Command ID
 * @returns Rate limit configuration
 */
export function getCommandRateLimit(commandId: string): RateLimitConfig {
  return COMMAND_RATE_LIMITS[commandId] || DEFAULT_RATE_LIMIT;
}

/**
 * Get all rate limit configurations
 *
 * @returns All command rate limits
 */
export function getAllCommandRateLimits(): Record<string, RateLimitConfig> {
  return { ...COMMAND_RATE_LIMITS };
}

/**
 * Get rate limits for a specific category
 *
 * @param category - Command category
 * @returns Rate limits for category
 */
export function getRateLimitsByCategory(category: string): Record<string, RateLimitConfig> {
  const limits: Record<string, RateLimitConfig> = {};

  for (const [commandId, config] of Object.entries(COMMAND_RATE_LIMITS)) {
    if (commandId.startsWith(category.split('.')[0])) {
      limits[commandId] = config;
    }
  }

  return limits;
}

/**
 * Check if command has custom rate limit
 *
 * @param commandId - Command ID
 * @returns true if command has custom limit
 */
export function hasCustomRateLimit(commandId: string): boolean {
  return commandId in COMMAND_RATE_LIMITS;
}

/**
 * Get commands with strict rate limits
 * Useful for UI warnings
 *
 * @returns Commands with low rate limits
 */
export function getStrictRateLimitCommands(threshold: number = 5): Array<{
  commandId: string;
  limit: number;
  windowMs: number;
}> {
  return Object.entries(COMMAND_RATE_LIMITS)
    .filter(([_, config]) => config.limit <= threshold)
    .map(([commandId, config]) => ({
      commandId,
      limit: config.limit,
      windowMs: config.windowMs,
    }))
    .sort((a, b) => a.limit - b.limit);
}

/**
 * Format rate limit for display
 *
 * @param config - Rate limit configuration
 * @returns Human-readable string
 */
export function formatRateLimit(config: RateLimitConfig): string {
  const windowMinutes = Math.round(config.windowMs / 60000);
  const windowHours = Math.round(config.windowMs / 3600000);

  let windowStr: string;
  if (windowHours >= 1) {
    windowStr = `${windowHours} hour${windowHours > 1 ? 's' : ''}`;
  } else {
    windowStr = `${windowMinutes} minute${windowMinutes > 1 ? 's' : ''}`;
  }

  return `${config.limit} per ${windowStr}`;
}

/**
 * Get rate limit description
 *
 * @param commandId - Command ID
 * @returns Description of rate limit
 */
export function getRateLimitDescription(commandId: string): string {
  const config = getCommandRateLimit(commandId);
  const formatted = formatRateLimit(config);
  const description = (config as { description?: string }).description;

  return description ? `${formatted} - ${description}` : formatted;
}

/**
 * Rate limit tier configuration
 * Useful for different user tiers
 */
export const RATE_LIMIT_TIERS = {
  free: {
    multiplier: 1, // 1x limits
  },
  pro: {
    multiplier: 2, // 2x limits
  },
  enterprise: {
    multiplier: 5, // 5x limits
  },
} as const;

/**
 * Get adjusted rate limit for user tier
 *
 * @param commandId - Command ID
 * @param tier - User tier
 * @returns Adjusted rate limit configuration
 */
export function getTierAdjustedRateLimit(
  commandId: string,
  tier: keyof typeof RATE_LIMIT_TIERS = 'free'
): RateLimitConfig {
  const baseConfig = getCommandRateLimit(commandId);
  const multiplier = RATE_LIMIT_TIERS[tier].multiplier;

  return {
    ...baseConfig,
    limit: baseConfig.limit * multiplier,
  };
}

/**
 * Export rate limit configuration for command definitions
 * Integrates with allowed-commands.ts
 */
export function getRateLimitForCommandDefinition(commandId: string): {
  rateLimit: {
    limit: number;
    windowMs: number;
  };
} | undefined {
  const config = COMMAND_RATE_LIMITS[commandId];
  if (!config) return undefined;

  return {
    rateLimit: {
      limit: config.limit,
      windowMs: config.windowMs,
    },
  };
}
