/**
 * Auth Selector Component
 * Story 8.5: API Explorer
 * Task 3: Request Builder
 *
 * Allows switching between session and API key authentication
 */

"use client"

import { useApiExplorerStore } from '@/stores/api-explorer-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Key, User } from 'lucide-react';

export function AuthSelector() {
  const { authMethod, apiKey, setAuthMethod, setApiKey } = useApiExplorerStore();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Authentication</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs
          value={authMethod === 'api_key' ? 'apiKey' : 'session'}
          onValueChange={(value) => setAuthMethod(value === 'apiKey' ? 'api_key' : 'session')}
        >
          <TabsList className="w-full">
            <TabsTrigger value="session" className="flex-1">
              <User className="w-4 h-4 mr-2" />
              Session
            </TabsTrigger>
            <TabsTrigger value="apiKey" className="flex-1">
              <Key className="w-4 h-4 mr-2" />
              API Key
            </TabsTrigger>
          </TabsList>

          <TabsContent value="session" className="mt-4">
            <p className="text-sm text-muted-foreground">
              Using your current session token for authentication.
            </p>
          </TabsContent>

          <TabsContent value="apiKey" className="mt-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="bmad_sk_..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Enter your API key. Create one in Settings &gt; API Keys.
              </p>
              <p className="text-xs text-muted-foreground">
                <em>Key is stored in session memory only and cleared on browser close.</em>
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
