/**
 * Advanced Dashboard Page
 * Story 2.5: Progressive Disclosure - Layer 4 (Power User)
 * Task 6: Create Layer 4 Dashboard Layout
 *
 * Main power user interface with tabbed navigation
 */

'use client';

import { useState, useEffect } from 'react';
import { Zap, Workflow, Bot, Terminal, Key, ArrowLeft, Home } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { WorkflowPicker } from '@/components/workflows/WorkflowPicker';
import { AgentInvoker } from '@/components/workflows/AgentInvoker';
import { TerminalEmulator, useTerminalCommands } from '@/components/cli/TerminalEmulator';
import { APIKeyManager } from '@/components/settings/APIKeyManager';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

type AdvancedTab = 'workflows' | 'agents' | 'terminal' | 'api-keys';

interface TabConfig {
  id: AdvancedTab;
  label: string;
  icon: React.ElementType;
  description: string;
}

const TABS: TabConfig[] = [
  {
    id: 'workflows',
    label: 'Workflows',
    icon: Workflow,
    description: 'Direct workflow execution with search and filtering',
  },
  {
    id: 'agents',
    label: 'Agents',
    icon: Bot,
    description: 'Direct agent invocation by name/ID',
  },
  {
    id: 'terminal',
    icon: Terminal,
    label: 'CLI',
    description: 'CLI command equivalents for web operations',
  },
  {
    id: 'api-keys',
    icon: Key,
    label: 'API Keys',
    description: 'Generate and manage API keys',
  },
];

export default function AdvancedPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AdvancedTab>('workflows');
  const { commands, addCommand } = useTerminalCommands();

  // Check if user has advanced mode enabled (placeholder - would check from user preferences)
  const [advancedModeEnabled, setAdvancedModeEnabled] = useState(true);

  useEffect(() => {
    // TODO: Check from user preferences if advanced mode is enabled
    // For now, we'll assume it is
  }, []);

  const handleWorkflowExecute = (workflowId: string) => {
    // Track CLI command for workflow execution
    addCommand('workflow:execute', { workflow: workflowId });
  };

  const handleAgentInvoke = (agentId: string) => {
    // Track CLI command for agent invocation
    addCommand('agent:invoke', { agentId });
  };

  if (!advancedModeEnabled) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Advanced Mode Required
            </CardTitle>
            <CardDescription>
              You need to enable Advanced Mode to access this page
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Advanced Mode provides direct access to workflows, agents, CLI commands,
              and API keys for technical users.
            </p>
            <div className="flex gap-2">
              <Button asChild>
                <Link href="/dashboard/settings">Enable Advanced Mode</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Zap className="h-5 w-5 text-yellow-500" />
            <h1 className="text-2xl font-bold">Advanced Mode</h1>
            <Badge variant="default" className="bg-yellow-500">
              Power User
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Direct access to all BMAD capabilities
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard">
              <Home className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>

      {/* Tabbed Interface */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as AdvancedTab)}>
        <TabsList className="grid w-full grid-cols-4">
          {TABS.map(tab => {
            const IconComponent = tab.icon;
            return (
              <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                <IconComponent className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* Workflows Tab */}
        <TabsContent value="workflows" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Picker</CardTitle>
              <CardDescription>
                {TABS[0].description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WorkflowPicker onExecute={handleWorkflowExecute} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Agents Tab */}
        <TabsContent value="agents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Agent Invoker</CardTitle>
              <CardDescription>
                {TABS[1].description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AgentInvoker onInvoke={handleAgentInvoke} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Terminal Tab */}
        <TabsContent value="terminal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>CLI Terminal</CardTitle>
              <CardDescription>
                {TABS[2].description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TerminalEmulator commands={commands} readOnly />
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Keys Tab */}
        <TabsContent value="api-keys" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Key Management</CardTitle>
              <CardDescription>
                {TABS[3].description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <APIKeyManager />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions Footer */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div>
              Press <kbd className="px-1 py-0.5 bg-muted rounded">Cmd</kbd> + <kbd className="px-1 py-0.5 bg-muted rounded">K</kbd> for quick agent invocation
            </div>
            <div>
              Advanced Mode is active • {new Date().toLocaleDateString()}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
