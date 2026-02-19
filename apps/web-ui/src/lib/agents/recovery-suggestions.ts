/**
 * Error Recovery Suggestions
 *
 * Provides user-friendly error messages and recovery suggestions
 * for common error types encountered during agent execution.
 */

import type { ErrorCategory, ErrorRecoveryEntry } from '@/types/events';

/**
 * Error recovery mapping for common error types.
 */
const ERROR_RECOVERY_MAP: Record<string, ErrorRecoveryEntry> = {
  // Network errors
  ECONNREFUSED: {
    errorType: 'ECONNREFUSED',
    category: 'connection',
    recovery: 'Check if the target service is running and accessible.',
    userMessage: 'Connection refused. The target is not accepting connections.',
  },
  ETIMEDOUT: {
    errorType: 'ETIMEDOUT',
    category: 'timeout',
    recovery: 'The target may be unreachable or blocking connections. Try again later.',
    userMessage: 'Connection timed out. The request took too long to complete.',
  },
  ENOTFOUND: {
    errorType: 'ENOTFOUND',
    category: 'connection',
    recovery: 'Verify the target hostname or IP address is correct.',
    userMessage: 'Host not found. Check the target address and try again.',
  },
  ECONNRESET: {
    errorType: 'ECONNRESET',
    category: 'connection',
    recovery: 'The connection was reset. Check network stability and try again.',
    userMessage: 'Connection was reset by the target.',
  },
  EHOSTUNREACH: {
    errorType: 'EHOSTUNREACH',
    category: 'connection',
    recovery: 'The target host is unreachable. Check network routing.',
    userMessage: 'No route to the target host.',
  },

  // CLI errors
  CommandTimeout: {
    errorType: 'CommandTimeout',
    category: 'timeout',
    recovery: 'The command took too long to complete. Try with a smaller scope or adjust timeout settings.',
    userMessage: 'The command timed out. Consider reducing the scope of the operation.',
  },
  CommandNotFound: {
    errorType: 'CommandNotFound',
    category: 'execution',
    recovery: 'Required CLI tool not found. Ensure BMAD CLI is properly installed and in PATH.',
    userMessage: 'Required command not found. Please verify BMAD installation.',
  },
  CommandExecutionError: {
    errorType: 'CommandExecutionError',
    category: 'execution',
    recovery: 'The command failed to execute. Check the command syntax and parameters.',
    userMessage: 'Command execution failed. Review the command and try again.',
  },

  // Agent errors
  AgentInitializationError: {
    errorType: 'AgentInitializationError',
    category: 'execution',
    recovery: 'Failed to initialize agent. Check agent configuration and try again.',
    userMessage: 'Agent failed to start. Please check the agent configuration.',
  },
  AgentExecutionError: {
    errorType: 'AgentExecutionError',
    category: 'execution',
    recovery: 'Agent execution failed. Review agent logs for details and retry.',
    userMessage: 'The agent encountered an error during execution.',
  },
  AgentTimeoutError: {
    errorType: 'AgentTimeoutError',
    category: 'timeout',
    recovery: 'The agent took too long to respond. Try with a simpler request.',
    userMessage: 'Agent operation timed out. Try with a smaller task.',
  },

  // Validation errors
  ValidationError: {
    errorType: 'ValidationError',
    category: 'validation',
    recovery: 'Input validation failed. Check your parameters and ensure all required fields are provided.',
    userMessage: 'Invalid input provided. Please check your parameters.',
  },
  SchemaError: {
    errorType: 'SchemaError',
    category: 'validation',
    recovery: 'Data structure error. This may indicate a bug. Please report this issue.',
    userMessage: 'Invalid data structure. Please report this issue to the development team.',
  },
  ParameterError: {
    errorType: 'ParameterError',
    category: 'validation',
    recovery: 'One or more parameters are invalid. Review the input and try again.',
    userMessage: 'Invalid parameters provided. Please check your input.',
  },

  // Authorization errors
  UnauthorizedError: {
    errorType: 'UnauthorizedError',
    category: 'authorization',
    recovery: 'You are not authorized to perform this action. Check your permissions.',
    userMessage: 'Access denied. You do not have permission for this action.',
  },
  AuthenticationError: {
    errorType: 'AuthenticationError',
    category: 'authorization',
    recovery: 'Authentication failed. Please log in again.',
    userMessage: 'Authentication failed. Please log in and try again.',
  },
  ForbiddenError: {
    errorType: 'ForbiddenError',
    category: 'authorization',
    recovery: 'This action is not allowed for your account type.',
    userMessage: 'This action is forbidden. Contact an administrator if needed.',
  },

  // Not found errors
  NotFoundError: {
    errorType: 'NotFoundError',
    category: 'notfound',
    recovery: 'The requested resource was not found. Verify the resource exists.',
    userMessage: 'Resource not found. Please check the resource identifier.',
  },
  AgentNotFoundError: {
    errorType: 'AgentNotFoundError',
    category: 'notfound',
    recovery: 'The specified agent was not found. Check the agent ID and try again.',
    userMessage: 'Agent not found. Please verify the agent identifier.',
  },
  WorkflowNotFoundError: {
    errorType: 'WorkflowNotFoundError',
    category: 'notfound',
    recovery: 'The specified workflow was not found. Check the workflow ID.',
    userMessage: 'Workflow not found. Please verify the workflow identifier.',
  },

  // Rate limiting
  RateLimitError: {
    errorType: 'RateLimitError',
    category: 'execution',
    recovery: 'Too many requests. Please wait a moment and try again.',
    userMessage: 'Rate limit exceeded. Please wait before trying again.',
  },

  // Resource errors
  OutOfMemoryError: {
    errorType: 'OutOfMemoryError',
    category: 'execution',
    recovery: 'System ran out of memory. Try with a smaller task or increase available memory.',
    userMessage: 'System resources exhausted. Try with a smaller task.',
  },
  DiskSpaceError: {
    errorType: 'DiskSpaceError',
    category: 'execution',
    recovery: 'Insufficient disk space. Free up space and try again.',
    userMessage: 'Not enough disk space. Please free up storage.',
  },
};

/**
 * Default recovery suggestion for unknown errors.
 */
const DEFAULT_RECOVERY: ErrorRecoveryEntry = {
  errorType: 'Unknown',
  category: 'unknown',
  recovery: 'An unexpected error occurred. Please try again. If the problem persists, contact support.',
  userMessage: 'An unexpected error occurred. Please try again.',
};

/**
 * Get recovery suggestion for an error.
 *
 * @param errorType - The error type (e.g., error constructor name)
 * @param errorMessage - Optional error message for context
 * @returns Error recovery entry with suggestion
 */
export function getRecoverySuggestion(
  errorType: string,
  errorMessage?: string
): ErrorRecoveryEntry {
  // Direct match
  if (ERROR_RECOVERY_MAP[errorType]) {
    return ERROR_RECOVERY_MAP[errorType];
  }

  // Partial match (some errors include additional context in the name)
  // Check if errorType contains any known error key (e.g., CustomTimeoutError contains Timeout)
  const partialMatch = Object.keys(ERROR_RECOVERY_MAP).find((key) =>
    errorType.toLowerCase().includes(key.toLowerCase())
  );
  if (partialMatch) {
    return ERROR_RECOVERY_MAP[partialMatch];
  }

  // Check error message for clues
  if (errorMessage) {
    const lowerMessage = errorMessage.toLowerCase();

    if (lowerMessage.includes('timeout') || lowerMessage.includes('timed out')) {
      return {
        errorType: 'Timeout',
        category: 'timeout',
        recovery: 'The operation timed out. Try with a smaller scope.',
        userMessage: 'Operation timed out. Please try again.',
      };
    }

    if (lowerMessage.includes('connection') || lowerMessage.includes('connect')) {
      return {
        errorType: 'Connection',
        category: 'connection',
        recovery: 'Connection failed. Check network connectivity.',
        userMessage: 'Connection failed. Please check your network.',
      };
    }

    if (lowerMessage.includes('not found') || lowerMessage.includes("doesn't exist")) {
      return {
        errorType: 'NotFound',
        category: 'notfound',
        recovery: 'The requested resource was not found.',
        userMessage: 'Resource not found. Please check the identifier.',
      };
    }

    if (lowerMessage.includes('unauthorized') || lowerMessage.includes('forbidden')) {
      return {
        errorType: 'Unauthorized',
        category: 'authorization',
        recovery: 'You are not authorized for this action.',
        userMessage: 'Access denied. Check your permissions.',
      };
    }
  }

  return DEFAULT_RECOVERY;
}

/**
 * Get recovery suggestions by category.
 *
 * @param category - The error category
 * @returns Array of error recovery entries for the category
 */
export function getRecoveriesByCategory(category: ErrorCategory): ErrorRecoveryEntry[] {
  return Object.values(ERROR_RECOVERY_MAP).filter((entry) => entry.category === category);
}

/**
 * Get all error categories that have defined recovery suggestions.
 *
 * @returns Array of unique error categories
 */
export function getErrorCategories(): ErrorCategory[] {
  const categories = new Set<ErrorCategory>();
  Object.values(ERROR_RECOVERY_MAP).forEach((entry) => {
    categories.add(entry.category);
  });
  return Array.from(categories);
}

/**
 * Sanitize error message for production use (remove sensitive data).
 *
 * @param errorMessage - The original error message
 * @returns Sanitized error message safe for display to users
 */
export function sanitizeErrorMessage(errorMessage: string): string {
  // Remove potential file paths (Windows and Unix)
  let sanitized = errorMessage.replace(/\/[a-zA-Z0-9_\-\.\/]+/g, '[path]');
  sanitized = sanitized.replace(/[a-zA-Z]:\\[a-zA-Z0-9_\-\.\\]+/g, '[path]');

  // Remove potential tokens/keys (hex strings longer than 16 chars)
  sanitized = sanitized.replace(/\b[0-9a-f]{16,}\b/gi, '[token]');

  // Remove potential email addresses
  sanitized = sanitized.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[email]');

  // Remove potential IP addresses
  sanitized = sanitized.replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, '[ip]');

  return sanitized;
}
