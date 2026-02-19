/**
 * Agent Components Index
 * Story 2.4: Progressive Disclosure - Layer 3
 * Story 4.3: Progress Visualization UI
 *
 * Exports all agent/team selection and progress visualization components
 */

// Team & Agent Selection (Story 2.x)
export { TeamCard, CompactTeamCard } from './TeamCard';
export { TeamSelection, CompactTeamSelection } from './TeamSelection';
export { AgentCard, HorizontalAgentCard } from './AgentCard';
export { AgentRoster, CompactAgentRoster } from './AgentRoster';
export { AgentProfile, CompactAgentProfile } from './AgentProfile';
export { AdvancedModeToggle, AdvancedModeBadge } from './AdvancedModeToggle';

// Progress Visualization (Story 4.3)
export { AgentProgress } from './agent-progress';
export type { AgentProgressProps } from './agent-progress';

export { AgentStatusHeader } from './agent-status-header';
export type { AgentStatusHeaderProps } from './agent-status-header';

export { ProgressBar } from './progress-bar';
export type { ProgressBarProps } from './progress-bar';

export { TimeRemaining } from './time-remaining';
export type { TimeRemainingProps } from './time-remaining';

export { StepTimeline } from './step-timeline';
export type { StepTimelineProps } from './step-timeline';

export { LiveOutput } from './live-output';
export type { LiveOutputProps } from './live-output';

export { ActionButtons } from './action-buttons';
export type { ActionButtonsProps } from './action-buttons';
