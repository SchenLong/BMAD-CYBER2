/**
 * Agents Module Index
 *
 * Exports all agent-related functionality for easy importing.
 */

// Event types
export * from '@/types/events';

// Event emitter
export {
  agentEventEmitter,
  AgentEventEmitter,
  executeAgentWithEvents,
} from './event-emitter';

// Step definitions
export {
  INTEL_AGENT_STEPS,
  SECURITY_AGENT_STEPS,
  IR_AGENT_STEPS,
  LEGAL_AGENT_STEPS,
  STRATEGY_AGENT_STEPS,
  BMM_AGENT_STEPS,
  BMGD_AGENT_STEPS,
  GENERIC_AGENT_STEPS,
  getStepsForAgentType,
  getStepById,
  getStepIndex,
} from './step-definitions';

// Progress calculation
export {
  TimeEstimator,
  calculateProgress,
  calculateStepProgress,
  formatDuration,
  createTimeEstimator,
} from './progress-calculator';

// Recovery suggestions
export {
  getRecoverySuggestion,
  getRecoveriesByCategory,
  getErrorCategories,
  sanitizeErrorMessage,
} from './recovery-suggestions';
