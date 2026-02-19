/**
 * APIKeyManager Component
 * Story 2.5: Progressive Disclosure - Layer 4 (Power User)
 * Task 4: Implement API Key Generation
 *
 * API key CRUD operations with secure display and management
 */

'use client';

import { useState, useMemo } from 'react';
import { Plus, Trash2, Eye, EyeOff, Copy, Check, AlertTriangle } from 'lucide-react';
import { useAPIKeys, useCreateAPIKey, useRevokeAPIKey } from '@/hooks/use-api-keys';
import { APIKey, APIKeyPermission, CreateAPIKeyRequest } from '@/lib/types/api-keys';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

const PERMISSIONS: { value: APIKeyPermission; label: string; description: string }[] = [
  { value: 'read', label: 'Read', description: 'Read-only access to data' },
  { value: 'write', label: 'Write', description: 'Create and modify resources' },
  { value: 'execute', label: 'Execute', description: 'Run workflows and invoke agents' },
  { value: 'admin', label: 'Admin', description: 'Full administrative access' },
  { value: 'projects:read', label: 'Projects: Read', description: 'Read project data' },
  { value: 'projects:write', label: 'Projects: Write', description: 'Create and modify projects' },
  { value: 'agents:invoke', label: 'Agents: Invoke', description: 'Invoke agents directly' },
  { value: 'workflows:execute', label: 'Workflows: Execute', description: 'Execute workflows' },
  { value: 'cli:execute', label: 'CLI: Execute', description: 'Execute CLI commands' },
];

const EXPIRATION_OPTIONS = [
  { value: 24, label: '24 hours' },
  { value: 168, label: '7 days' },
  { value: 720, label: '30 days' },
  { value: 8760, label: '1 year' },
  { value: 0, label: 'Never' },
];

export function APIKeyManager() {
  const { data: apiKeys = [], isLoading } = useAPIKeys();
  const createMutation = useCreateAPIKey();
  const revokeMutation = useRevokeAPIKey();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newKeyDescription, setNewKeyDescription] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<APIKeyPermission[]>(['read']);
  const [selectedExpiration, setSelectedExpiration] = useState(168); // Default 7 days
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  const activeKeys = useMemo(() => apiKeys.filter(k => k.isActive), [apiKeys]);
  const revokedKeys = useMemo(() => apiKeys.filter(k => !k.isActive), [apiKeys]);

  const handleCreateKey = async () => {
    if (!newKeyDescription.trim()) return;

    try {
      const request: CreateAPIKeyRequest = {
        description: newKeyDescription,
        permissions: selectedPermissions,
        expiresIn: selectedExpiration > 0 ? selectedExpiration : undefined,
      };

      const result = await createMutation.mutateAsync(request);
      setCreatedKey(result.key);
      setShowCreateDialog(false);
      setNewKeyDescription('');
      setSelectedPermissions(['read']);
      setSelectedExpiration(168);
    } catch (error) {
      console.error('Failed to create API key:', error);
    }
  };

  const handleRevokeKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
      return;
    }

    try {
      await revokeMutation.mutateAsync(keyId);
    } catch (error) {
      console.error('Failed to revoke API key:', error);
    }
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const togglePermission = (permission: APIKeyPermission) => {
    setSelectedPermissions(prev =>
      prev.includes(permission)
        ? prev.filter(p => p !== permission)
        : [...prev, permission]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">API Keys</h2>
          <p className="text-muted-foreground">
            Manage your API keys for programmatic access
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Generate Key
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Generate API Key</DialogTitle>
              <DialogDescription>
                Create a new API key for programmatic access to BMAD
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="e.g., Production app key"
                  value={newKeyDescription}
                  onChange={(e) => setNewKeyDescription(e.target.value)}
                />
              </div>

              {/* Permissions */}
              <div className="space-y-2">
                <Label>Permissions</Label>
                <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto p-2 border rounded-md">
                  {PERMISSIONS.map(perm => (
                    <div key={perm.value} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="text-sm font-medium">{perm.label}</div>
                        <div className="text-xs text-muted-foreground">{perm.description}</div>
                      </div>
                      <Switch
                        checked={selectedPermissions.includes(perm.value)}
                        onCheckedChange={() => togglePermission(perm.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Expiration */}
              <div className="space-y-2">
                <Label>Expiration</Label>
                <div className="flex flex-wrap gap-2">
                  {EXPIRATION_OPTIONS.map(option => (
                    <Button
                      key={option.value}
                      variant={selectedExpiration === option.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedExpiration(option.value)}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateKey}
                  disabled={!newKeyDescription.trim() || selectedPermissions.length === 0 || createMutation.isPending}
                >
                  {createMutation.isPending ? 'Generating...' : 'Generate Key'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* New Key Display */}
      {createdKey && (
        <Card className="border-green-500 bg-green-50 dark:bg-green-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
              <AlertTriangle className="h-5 w-5" />
              Save Your API Key
            </CardTitle>
            <CardDescription>
              This key will only be shown once. Copy it now and store it securely.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Input
                value={createdKey}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                variant={copiedKey ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleCopyKey(createdKey)}
              >
                {copiedKey ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Keys */}
      <Card>
        <CardHeader>
          <CardTitle>Active Keys ({activeKeys.length})</CardTitle>
          <CardDescription>
            These keys can be used to authenticate API requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading API keys...</div>
          ) : activeKeys.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No active API keys. Generate a key to get started.
            </div>
          ) : (
            <div className="space-y-3">
              {activeKeys.map(key => (
                <APIKeyCard
                  key={key.id}
                  apiKey={key}
                  onRevoke={() => handleRevokeKey(key.id)}
                  isRevoking={revokeMutation.isPending}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Revoked Keys */}
      {revokedKeys.length > 0 && (
        <>
          <Separator />
          <Card>
            <CardHeader>
              <CardTitle className="text-muted-foreground">Revoked Keys ({revokedKeys.length})</CardTitle>
              <CardDescription>
                These keys have been revoked and can no longer be used
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {revokedKeys.map(key => (
                  <div key={key.id} className="p-3 border rounded-lg opacity-60">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">{key.description}</div>
                        <div className="text-xs text-muted-foreground">
                          Ends with ••••{key.keyPreview}
                        </div>
                      </div>
                      <Badge variant="secondary">Revoked</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

interface APIKeyCardProps {
  apiKey: APIKey;
  onRevoke: () => void;
  isRevoking: boolean;
}

function APIKeyCard({ apiKey, onRevoke, isRevoking }: APIKeyCardProps) {
  const [showKey, setShowKey] = useState(false);

  const isExpiringSoon = apiKey.expiresAt && new Date(apiKey.expiresAt) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const isExpired = apiKey.expiresAt && new Date(apiKey.expiresAt) < new Date();

  return (
    <div className={`p-4 border rounded-lg ${isExpired ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-medium">{apiKey.description}</h4>
            {isExpired && <Badge variant="destructive">Expired</Badge>}
            {isExpiringSoon && !isExpired && <Badge variant="outline">Expiring soon</Badge>}
            {!apiKey.expiresAt && <Badge variant="secondary">No expiration</Badge>}
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {showKey ? (
              <code className="font-mono bg-muted px-2 py-0.5 rounded">
                bmad.{apiKey.keyPreview}
              </code>
            ) : (
              <span>••••••••••••••••{apiKey.keyPreview}</span>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => setShowKey(!showKey)}
            >
              {showKey ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            </Button>
          </div>

          <div className="flex flex-wrap gap-1 mt-2">
            {apiKey.permissions.map(perm => (
              <Badge key={perm} variant="outline" className="text-xs">
                {perm}
              </Badge>
            ))}
          </div>

          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            <span>Created {new Date(apiKey.createdAt).toLocaleDateString()}</span>
            {apiKey.lastUsed && <span>Last used {new Date(apiKey.lastUsed).toLocaleDateString()}</span>}
            {apiKey.usageCount > 0 && <span>{apiKey.usageCount} uses</span>}
          </div>
        </div>

        <Button
          variant="destructive"
          size="sm"
          onClick={onRevoke}
          disabled={isRevoking}
        >
          {isRevoking ? (
            'Revoking...'
          ) : (
            <>
              <Trash2 className="h-4 w-4 mr-1" />
              Revoke
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
