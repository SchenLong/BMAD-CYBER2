/**
 * Terminal Components
 * Story 5.4: Terminal Emulator Component
 *
 * Export all terminal-related components and hooks
 */

// Main component
export {
  TerminalEmulator,
  TerminalPanel,
  useMultiTerminal,
  type TerminalEmulatorProps,
  type TerminalInstance,
} from './terminal-emulator';

// Header component
export {
  TerminalHeader,
  CompactTerminalHeader,
  type TerminalHeaderProps,
  type CompactTerminalHeaderProps,
} from './terminal-header';

// Output component
export {
  TerminalOutput,
  useTerminalScroll,
  type TerminalOutputProps,
  type OutputLine,
} from './terminal-output';

// Line component
export {
  TerminalLine,
  TerminalCursor,
  injectTerminalStyles,
  type TerminalLineProps,
  type TerminalCursorProps,
} from './terminal-line';

// Error boundary
export {
  TerminalErrorBoundary,
  useTerminalErrorBoundary,
  type TerminalErrorBoundaryProps,
  type TerminalErrorBoundaryState,
} from './terminal-error-boundary';

// Hook
export {
  useCommandStream,
  useTerminalCommand,
  type UseCommandStreamOptions,
  type CommandStreamState,
  type CommandStreamControls,
  type UseCommandStreamResult,
  type CommandOutputLine,
} from '@/hooks/use-command-stream';
