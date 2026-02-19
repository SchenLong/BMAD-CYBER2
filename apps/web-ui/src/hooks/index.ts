/**
 * Hooks Index
 *
 * Central export point for all custom React hooks.
 */

// Agent hooks
export { useAgentStream, useAgentProgress, formatDuration } from './use-agent-stream'

// CLI hooks
export {
  useCliStream,
  type UseCliStreamOptions,
  type UseCliStreamResult,
  type CliStreamEvent,
} from './use-cli-stream'

// Other hooks
export { useAgents } from './use-agents'
export { useConversation } from './use-conversation'
export { useWorkflows } from './use-workflows'
export { useNavigation } from './use-navigation'
export { useUserRole } from './use-user-role'
export { useRecentProjects } from './use-recent-projects'
export { useLayerTransition } from './use-layer-transition'
export { useInvokeAgent, useAgentAutocomplete, useAgentStatus, useAllAgents } from './use-agent-invocation'
export { useAPIKeys } from './use-api-keys'
