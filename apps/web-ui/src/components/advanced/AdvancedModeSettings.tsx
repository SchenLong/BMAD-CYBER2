/**
 * AdvancedModeSettings Component
 * Story 2.5: Progressive Disclosure - Layer 4 (Power User)
 * Task 5: Create Advanced Mode Settings
 *
 * Advanced mode toggle with confirmation dialog and preferences
 */

'use client';

import { useState } from 'react';
import { AlertTriangle, Zap, Settings, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AdvancedModeSettings as AdvancedModeSettingsType } from '@/lib/types/api-keys';

interface AdvancedModeSettingsProps {
  settings: AdvancedModeSettingsType;
  onUpdate: (settings: Partial<AdvancedModeSettingsType>) => void;
}

export function AdvancedModeSettings({ settings, onUpdate }: AdvancedModeSettingsProps) {
  const [showEnableDialog, setShowEnableDialog] = useState(false);
  const [showDisableDialog, setShowDisableDialog] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleEnableAdvancedMode = () => {
    onUpdate({
      enabled: true,
      enabledAt: new Date(),
    });
    setShowEnableDialog(false);
  };

  const handleDisableAdvancedMode = () => {
    onUpdate({
      enabled: false,
      preferredTab: 'workflows',
    });
    setShowDisableDialog(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Advanced Mode</h2>
        <p className="text-muted-foreground">
          Configure power user interface and direct access features
        </p>
      </div>

      {/* Advanced Mode Toggle */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Advanced Mode
              </CardTitle>
              <CardDescription>
                {settings.enabled
                  ? `Enabled since ${settings.enabledAt ? new Date(settings.enabledAt).toLocaleDateString() : 'recently'}`
                  : 'Direct access to workflows, agents, CLI commands, and API keys'}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {settings.enabled ? (
                <Badge variant="default">Active</Badge>
              ) : (
                <Badge variant="outline">Disabled</Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!settings.enabled ? (
            <>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Power User Interface</AlertTitle>
                <AlertDescription>
                  Advanced mode provides direct control over workflows, agents, CLI commands,
                  and API key management. This interface is designed for technical users who
                  want maximum control with minimal guidance.
                </AlertDescription>
              </Alert>

              <Dialog open={showEnableDialog} onOpenChange={setShowEnableDialog}>
                <DialogTrigger asChild>
                  <Button className="w-full">
                    <Zap className="h-4 w-4 mr-2" />
                    Enable Advanced Mode
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      Enable Advanced Mode?
                    </DialogTitle>
                    <DialogDescription>
                      Advanced mode provides direct access to workflows, agents, CLI commands,
                      and API keys. This interface is designed for technical users who want
                      maximum control with minimal guidance.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>What changes when Advanced Mode is enabled:</AlertTitle>
                      <AlertDescription>
                        <ul className="list-disc list-inside space-y-1 mt-2 text-sm">
                          <li>Direct workflow picker with search</li>
                          <li>Agent invocation by name/ID</li>
                          <li>CLI command display terminal</li>
                          <li>API key generation and management</li>
                          <li>Keyboard shortcuts (Cmd+K for quick actions)</li>
                        </ul>
                      </AlertDescription>
                    </Alert>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="dont-show"
                        checked={dontShowAgain}
                        onChange={(e) => setDontShowAgain(e.target.checked)}
                      />
                      <Label htmlFor="dont-show" className="text-sm">
                        Don't show this confirmation again
                      </Label>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowEnableDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleEnableAdvancedMode}>
                        Enable Advanced Mode
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </>
          ) : (
            <>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm">
                  Advanced mode is now active. You can access all power user features
                  from the <kbd className="px-1 py-0.5 bg-background rounded">/advanced</kbd> route
                  or through the navigation menu.
                </p>
              </div>

              <Dialog open={showDisableDialog} onOpenChange={setShowDisableDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset to Simple Mode
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Reset to Simple Mode?</DialogTitle>
                    <DialogDescription>
                      This will disable Advanced Mode and return you to the simplified
                      conversational interface. You can re-enable Advanced Mode at any time
                      from settings.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowDisableDialog(false)}>
                      Keep Advanced Mode
                    </Button>
                    <Button variant="destructive" onClick={handleDisableAdvancedMode}>
                      Reset to Simple Mode
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </>
          )}
        </CardContent>
      </Card>

      {/* Advanced Preferences (only shown when enabled) */}
      {settings.enabled && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Advanced Preferences
            </CardTitle>
            <CardDescription>
              Customize your Advanced Mode experience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Keyboard Shortcuts */}
            <div className="flex items-center justify-between">
              <div>
                <Label>Keyboard Shortcuts</Label>
                <p className="text-sm text-muted-foreground">
                  Enable power user keyboard shortcuts (Cmd+K)
                </p>
              </div>
              <Switch
                checked={settings.keyboardShortcuts}
                onCheckedChange={(checked) => onUpdate({ keyboardShortcuts: checked })}
              />
            </div>

            {/* CLI Auto Show */}
            <div className="flex items-center justify-between">
              <div>
                <Label>CLI Auto Show</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically show CLI commands for web actions
                </p>
              </div>
              <Switch
                checked={settings.cliAutoShow}
                onCheckedChange={(checked) => onUpdate({ cliAutoShow: checked })}
              />
            </div>

            {/* Preferred Tab */}
            <div className="space-y-2">
              <Label>Default Tab</Label>
              <p className="text-sm text-muted-foreground">
                Choose which tab to show by default when opening Advanced Mode
              </p>
              <div className="flex flex-wrap gap-2">
                {(['workflows', 'agents', 'terminal', 'api-keys'] as const).map(tab => (
                  <Button
                    key={tab}
                    variant={settings.preferredTab === tab ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onUpdate({ preferredTab: tab })}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ')}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
