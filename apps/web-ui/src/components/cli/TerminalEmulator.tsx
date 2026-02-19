/**
 * TerminalEmulator Component
 * Story 2.5: Progressive Disclosure - Layer 4 (Power User)
 * Task 3: Create Terminal Emulator Component
 *
 * CLI command display component showing CLI equivalents of web actions
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { Terminal, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ACTION_TO_CLI } from '@/lib/data/workflows-data';

export interface TerminalCommand {
  id: string;
  command: string;
  output?: string;
  timestamp: Date;
  equivalentAction: string;
}

interface TerminalEmulatorProps {
  commands?: TerminalCommand[];
  currentCommand?: string;
  onCopy?: (command: string) => void;
  readOnly?: boolean;
  className?: string;
}

export function TerminalEmulator({
  commands = [],
  currentCommand,
  onCopy,
  readOnly = true,
  className,
}: TerminalEmulatorProps) {
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const terminalRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new commands are added
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [commands, currentCommand]);

  const handleCopy = (command: string) => {
    navigator.clipboard.writeText(command);
    setCopiedCommand(command);
    onCopy?.(command);

    // Reset copied state after 2 seconds
    setTimeout(() => setCopiedCommand(null), 2000);
  };

  // Generate CLI command for web actions
  const getCLICommand = (action: string, params: Record<string, string>): string => {
    let cli = ACTION_TO_CLI[action];
    if (!cli) {
      return `bmad ${action.replace(':', '--')}`;
    }
    // Replace placeholders with actual values
    Object.entries(params).forEach(([key, value]) => {
      cli = cli?.replace(`{${key}}`, value);
    });
    return cli || 'bmad <command>';
  };

  return (
    <Card className={className}>
      <CardHeader className="cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="h-5 w-5 text-muted-foreground" />
            <CardTitle>CLI Access</CardTitle>
            {readOnly && <Badge variant="outline">Read-only</Badge>}
          </div>
          <Button variant="ghost" size="sm">
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
        <CardDescription>
          CLI command equivalents for web operations
        </CardDescription>
      </CardHeader>

      {isExpanded && (
        <CardContent>
          {/* Terminal Window */}
          <div
            ref={terminalRef}
            className="bg-slate-950 text-slate-50 rounded-lg p-4 font-mono text-sm h-80 overflow-y-auto"
          >
            {/* Terminal Header */}
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <div className="flex-1 text-center text-xs text-slate-500">
                bmad-cli — {readOnly ? 'read-only' : 'interactive'} — 80x24
              </div>
            </div>

            {/* Commands Display */}
            <div className="space-y-3">
              {commands.length === 0 && !currentCommand ? (
                <div className="text-slate-500">
                  <p>Welcome to BMAD CLI Terminal</p>
                  <p className="mt-1">Web actions will display their CLI equivalents here.</p>
                  <p className="mt-1 text-slate-600">
                    Type <span className="text-green-400">help</span> for available commands.
                  </p>
                </div>
              ) : (
                <>
                  {commands.map(cmd => (
                    <TerminalCommandRow
                      key={cmd.id}
                      command={cmd.command}
                      output={cmd.output}
                      timestamp={cmd.timestamp}
                      isCopied={copiedCommand === cmd.command}
                      onCopy={() => handleCopy(cmd.command)}
                    />
                  ))}

                  {currentCommand && (
                    <div className="flex items-start gap-2">
                      <span className="text-green-400 shrink-0">$</span>
                      <div className="flex-1">
                        <span className="text-yellow-300">{currentCommand}</span>
                        <span className="inline-block w-2 h-4 bg-slate-400 ml-1 animate-pulse" />
                      </div>
                    </div>
                  )}

                  {/* Empty prompt line */}
                  {!currentCommand && (
                    <div className="flex items-center gap-2 mt-4">
                      <span className="text-green-400">$</span>
                      <span className="text-slate-600">Ready for next command...</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Terminal Footer */}
          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <div>
              Press <kbd className="px-1 py-0.5 bg-muted rounded">Cmd</kbd> + <kbd className="px-1 py-0.5 bg-muted rounded">K</kbd> for command palette
            </div>
            {commands.length > 0 && (
              <span>{commands.length} command{commands.length !== 1 ? 's' : ''} logged</span>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

interface TerminalCommandRowProps {
  command: string;
  output?: string;
  timestamp: Date;
  isCopied: boolean;
  onCopy: () => void;
}

function TerminalCommandRow({ command, output, timestamp, isCopied, onCopy }: TerminalCommandRowProps) {
  // Parse command to highlight different parts
  const parts = command.split(' ');
  const cmd = parts[0];
  const args = parts.slice(1);

  return (
    <div className="space-y-1">
      <div className="flex items-start gap-2 group">
        <span className="text-green-400 shrink-0">$</span>
        <div className="flex-1 flex items-center justify-between gap-2">
          <div className="flex-1 overflow-x-auto">
            <span className="text-cyan-400">{cmd}</span>
            {args.map((arg, i) => (
              <span
                key={i}
                className={
                  arg.startsWith('--')
                    ? 'text-yellow-300'
                    : arg.startsWith('-')
                    ? 'text-orange-300'
                    : 'text-slate-300'
                }
              >
                {' '}
                {arg}
              </span>
            ))}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 shrink-0"
            onClick={onCopy}
          >
            {isCopied ? (
              <Check className="h-3 w-3 text-green-500" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Button>
        </div>
      </div>
      {output && (
        <div className="ml-4 text-slate-400 text-xs whitespace-pre-wrap">{output}</div>
      )}
      <div className="ml-4 text-xs text-slate-600">
        {timestamp.toLocaleTimeString()}
      </div>
    </div>
  );
}

/**
 * Hook to track CLI commands from web actions
 */
export function useTerminalCommands() {
  const [commands, setCommands] = useState<TerminalCommand[]>([]);

  const addCommand = (action: string, params: Record<string, string> = {}, output?: string) => {
    const cliCommand = getCLICommandForAction(action, params);
    const newCommand: TerminalCommand = {
      id: `${Date.now()}-${Math.random()}`,
      command: cliCommand,
      output,
      timestamp: new Date(),
      equivalentAction: action,
    };
    setCommands(prev => [...prev, newCommand]);
  };

  const clearCommands = () => setCommands([]);

  return {
    commands,
    addCommand,
    clearCommands,
  };
}

/**
 * Helper function to convert web actions to CLI commands
 */
function getCLICommandForAction(action: string, params: Record<string, string>): string {
  const actionMap: Record<string, (params: Record<string, string>) => string> = {
    'workflow:execute': (p) => `bmad invoke ${p.team || 'bmm'} ${p.workflow || ''} ${p.options || ''}`,
    'agent:invoke': (p) => `bmad agent ${p.agentId || ''} --message "${p.message || ''}"`,
    'project:create': (p) => `bmad project create --name "${p.name || ''}"`,
    'report:generate': (p) => `bmad report generate --template ${p.template || ''}`,
  };

  const commandGenerator = actionMap[action];
  if (commandGenerator) {
    return commandGenerator(params);
  }

  return `bmad ${action.replace(':', '--')}`;
}
