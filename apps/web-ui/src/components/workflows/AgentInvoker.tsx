/**
 * AgentInvoker Component
 * Story 2.5: Progressive Disclosure - Layer 4 (Power User)
 * Task 2: Implement Direct Agent Invocation
 *
 * Direct agent invocation with autocomplete and fuzzy search
 */

'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { Search, Send, Loader2 } from 'lucide-react';
import { useAllAgents, useInvokeAgent } from '@/hooks/use-agent-invocation';
import { Agent } from '@/lib/types/agents';
import { getAgentById } from '@/lib/data/agents-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface AgentInvokerProps {
  onInvoke?: (agentId: string) => void;
}

export function AgentInvoker({ onInvoke }: AgentInvokerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [message, setMessage] = useState('');
  const [popoverOpen, setPopoverOpen] = useState(false);

  const { data: agents = [] } = useAllAgents(searchQuery);
  const invokeMutation = useInvokeAgent();

  // Get selected agent details
  const selectedAgent = useMemo(() => {
    if (!selectedAgentId) return null;
    return getAgentById(selectedAgentId);
  }, [selectedAgentId]);

  // Filter agents based on search query
  const filteredAgents = useMemo(() => {
    if (!searchQuery) return agents.slice(0, 10); // Show first 10 by default
    const query = searchQuery.toLowerCase();
    return agents.filter(agent =>
      agent.id.toLowerCase().includes(query) ||
      agent.name.toLowerCase().includes(query) ||
      agent.displayName.toLowerCase().includes(query) ||
      agent.title.toLowerCase().includes(query) ||
      agent.expertise.some(exp => exp.toLowerCase().includes(query))
    ).slice(0, 10);
  }, [agents, searchQuery]);

  const handleInvoke = async () => {
    if (!selectedAgentId || !message.trim()) return;

    try {
      await invokeMutation.mutateAsync({
        agentId: selectedAgentId,
        message: message.trim(),
      });
      onInvoke?.(selectedAgentId);
      setMessage('');
    } catch (error) {
      console.error('Failed to invoke agent:', error);
    }
  };

  const handleAgentSelect = (agentId: string) => {
    setSelectedAgentId(agentId);
    setPopoverOpen(false);
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Cmd+K / Ctrl+K shortcut for quick agent invocation
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      setPopoverOpen(prev => !prev);
    }
  }, []);

  // handleKeyDown is wrapped in useCallback, so it's stable and safe as a dependency
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Invoke Agent</span>
            <Badge variant="outline" className="text-xs">
              Cmd+K
            </Badge>
          </CardTitle>
          <CardDescription>
            Directly invoke any agent by name or ID
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Agent Selection with Autocomplete */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Agent</label>
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  {selectedAgent ? (
                    <div className="flex items-center gap-2">
                      <AgentIcon agent={selectedAgent} />
                      <span>{selectedAgent.displayName}</span>
                      <Badge variant="secondary" className="ml-auto text-xs">
                        {selectedAgent.team}
                      </Badge>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Select an agent...</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0 w-80" align="start">
                <Command>
                  <CommandInput
                    placeholder="Search agents..."
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                  />
                  <CommandList>
                    {filteredAgents.length === 0 ? (
                      <CommandEmpty>No agents found.</CommandEmpty>
                    ) : (
                      <CommandGroup>
                        {filteredAgents.map(agent => (
                          <CommandItem
                            key={agent.id}
                            value={agent.id}
                            onSelect={() => handleAgentSelect(agent.id)}
                          >
                            <AgentIcon agent={agent} />
                            <div className="flex-1">
                              <div className="text-sm font-medium">{agent.displayName}</div>
                              <div className="text-xs text-muted-foreground">{agent.title}</div>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {agent.team}
                            </Badge>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Message Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Message</label>
            <div className="relative">
              <textarea
                className="w-full min-h-24 px-3 py-2 border rounded-md resize-y focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter your message to the agent..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  // Send with Cmd/Ctrl+Enter
                  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                    e.preventDefault();
                    handleInvoke();
                  }
                }}
                maxLength={10000}
              />
              <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
                Cmd+Enter to send
              </div>
            </div>
          </div>

          {/* Agent Preview */}
          {selectedAgent && (
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AgentIcon agent={selectedAgent} />
                <div>
                  <div className="text-sm font-medium">{selectedAgent.displayName}</div>
                  <div className="text-xs text-muted-foreground">{selectedAgent.title}</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {selectedAgent.expertise.slice(0, 4).map(exp => (
                  <Badge key={exp} variant="secondary" className="text-xs">
                    {exp}
                  </Badge>
                ))}
                {selectedAgent.expertise.length > 4 && (
                  <Badge variant="secondary" className="text-xs">
                    +{selectedAgent.expertise.length - 4}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Invoke Button */}
          <Button
            className="w-full"
            onClick={handleInvoke}
            disabled={!selectedAgentId || !message.trim() || invokeMutation.isPending}
          >
            {invokeMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Invoking...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Invoke Agent
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-2">
        <TooltipProvider>
          {agents.slice(0, 6).map(agent => (
            <Tooltip key={agent.id}>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-start"
                  onClick={() => {
                    setSelectedAgentId(agent.id);
                    setPopoverOpen(false);
                  }}
                >
                  <AgentIcon agent={agent} />
                  <span className="truncate">{agent.displayName}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-sm">
                  <div className="font-medium">{agent.displayName}</div>
                  <div className="text-muted-foreground">{agent.title}</div>
                </div>
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </div>
    </div>
  );
}

interface AgentIconProps {
  agent: Agent;
}

function AgentIcon({ agent }: AgentIconProps) {
  // Simple avatar based on agent name
  const initial = agent.displayName.charAt(0).toUpperCase();

  return (
    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
      <span className="text-xs font-medium text-primary">{initial}</span>
    </div>
  );
}
