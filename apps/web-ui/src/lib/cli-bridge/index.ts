/**
 * CLI Bridge Module
 * Story 5.1: Command Whitelist System
 * Story 5.2: Safe Process Spawning
 *
 * Main export file for CLI bridge functionality.
 * Provides utilities for command whitelisting, validation, execution, and audit logging.
 */

// Type definitions
export type {
  CommandCategory,
  CommandDefinition,
  CliResult,
  CliAuditEntry,
  CommandExecutionRequest,
  CommandExecutionResponse,
  CommandListEntry,
  WhitelistValidationResult,
  RoleValidationResult,
  ProcessOptions,
  ProcessStatus,
  ActiveProcess,
  ProcessEvent,
} from './types';

// Allowed commands whitelist
export {
  ALLOWED_COMMANDS,
  getCommand,
  hasCommand,
  getEnabledCommands,
  getCommandsByCategory,
  getCommandsForRole,
  getCommandCategories,
  commandIdSchema,
} from './allowed-commands';

// Role validation
export {
  meetsMinimumRole,
  canExecuteCommand,
  findMinimumRequiredRole,
  canTargetRole,
  hasAnyRole,
  assertCanExecute,
  assertMinimumRole,
  filterCommandsByRole,
  getExecutableCommands,
  apiRoleCanExecute,
  isValidHierarchy,
  getRoleDisplayName,
  getAllowedRolesForCommand,
  isAdminRole,
  canPerformAdminActions,
  getRoleCacheKey,
  ROLE_CACHE_TTL,
  ROLE_CATEGORIES,
} from './role-validator';

// Audit logging
export {
  logCommandSuccess,
  logCommandBlocked,
  logCommandAttempt,
  readAuditLogs,
  getUserAuditStats,
  verifyAuditChain,
  rotateAuditLogs,
  getAuditFilePath,
  extractIpAddress,
  extractUserAgent,
  auditLogger,
} from './audit-logger';

// Command execution (Story 5.2)
export {
  CommandDispatcher,
  commandDispatcher,
  type DispatcherOptions,
} from './command-dispatcher';

// Process management (Story 5.2)
export {
  ProcessManager,
  processManager,
  type ProcessManagerConfig,
  type ProcessManagerEvents,
} from './process-manager';

// Process errors (Story 5.2)
export {
  ProcessError,
  ProcessErrorType,
} from './process-error';
