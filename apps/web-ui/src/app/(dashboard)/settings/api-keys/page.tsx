/**
 * API Keys Settings Page
 * Story 8.2: API Key Management
 * Task 8: UI Components for Key Management
 *
 * Allows users to manage their API keys for programmatic access
 */

'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { MoreVertical, Copy, Plus, Trash2, ExternalLink, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface APIKey {
  id: string;
  name: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  expiresAt: string | null;
  lastUsedAt: string | null;
  usageCount: number;
}

interface CreateAPIKeyResponse {
  id: string;
  key: string;
  name: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  expiresAt: string | null;
}

export default function ApiKeysSettingsPage() {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showRevokeDialog, setShowRevokeDialog] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [keyToRevoke, setKeyToRevoke] = useState<APIKey | null>(null);
  const [createdKey, setCreatedKey] = useState<CreateAPIKeyResponse | null>(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      const response = await fetch('/api/v1/api-keys');
      if (response.ok) {
        const data = await response.json();
        setApiKeys(data.data.keys);
      }
    } catch (err) {
      console.error('Failed to fetch API keys:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateKey = async () => {
    setError('');
    setIsCreating(true);

    try {
      const response = await fetch('/api/v1/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error?.message || 'Failed to create API key');
        setIsCreating(false);
        return;
      }

      setCreatedKey(data.data);
      setShowCreateDialog(false);
      setShowKeyModal(true);
      setNewKeyName('');
      setSuccessMessage('API key created successfully!');
      setTimeout(() => setSuccessMessage(''), 5000);
      fetchApiKeys();
    } catch {
      setError('An error occurred. Please try again.');
      setIsCreating(false);
    }
  };

  const handleRevokeKey = async () => {
    if (!keyToRevoke) return;

    try {
      const response = await fetch(`/api/v1/api-keys/${keyToRevoke.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        setError('Failed to revoke API key');
        return;
      }

      setShowRevokeDialog(false);
      setKeyToRevoke(null);
      setSuccessMessage('API key revoked successfully');
      setTimeout(() => setSuccessMessage(''), 5000);
      fetchApiKeys();
    } catch {
      setError('An error occurred. Please try again.');
    }
  };

  const copyKeyToClipboard = (key: string) => {
    navigator.clipboard.writeText(key);
    setSuccessMessage('API key copied to clipboard!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'DEVELOPER':
      case 'USER':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'READONLY':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      default:
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-48 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">API Keys</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage your API keys for programmatic access to BMAD
            </p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Generate API Key
          </Button>
        </div>

        {successMessage && (
          <div className="p-4 text-sm text-green-700 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="p-4 text-sm text-red-700 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            {error}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Your API Keys</CardTitle>
            <CardDescription>
              These keys allow you to authenticate API requests. Never share your keys with anyone.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {apiKeys.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  You don't have any API keys yet.
                </p>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create your first API key
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {apiKeys.map((key) => (
                  <div
                    key={key.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{key.name}</h3>
                        <Badge variant="outline" className={getRoleBadgeColor(key.role)}>
                          {key.role}
                        </Badge>
                        {!key.isActive && (
                          <Badge variant="outline" className="bg-gray-100 text-gray-600">
                            Revoked
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
                        <span>
                          Created {formatDistanceToNow(new Date(key.createdAt), { addSuffix: true })}
                        </span>
                        <span>•</span>
                        <span>
                          {key.lastUsedAt
                            ? `Last used ${formatDistanceToNow(new Date(key.lastUsedAt), { addSuffix: true })}`
                            : 'Never used'}
                        </span>
                        <span>•</span>
                        <span>{key.usageCount} uses</span>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => copyKeyToClipboard(key.id)}
                          disabled={!key.isActive}
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Copy Key ID
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setKeyToRevoke(key)}
                          className="text-red-600 focus:text-red-600"
                          disabled={!key.isActive}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Revoke Key
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How to use API keys</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <p className="font-semibold mb-1">Authentication</p>
              <p className="text-gray-600 dark:text-gray-400">
                Include your API key in the Authorization header:
              </p>
              <code className="block mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-x-auto">
                Authorization: Bearer bmad_sk_...
              </code>
            </div>
            <div>
              <p className="font-semibold mb-1">Security Best Practices</p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1">
                <li>Never share your API keys or commit them to version control</li>
                <li>Rotate your keys regularly</li>
                <li>Revoke keys that are no longer needed</li>
                <li>Use different keys for different applications</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create API Key Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate API Key</DialogTitle>
            <DialogDescription>
              Create a new API key for programmatic access. You will only see the full key once.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="key-name">Key Name</Label>
              <Input
                id="key-name"
                placeholder="e.g., Production App, Development Script"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                A descriptive name to help you identify this key
              </p>
            </div>
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateKey} disabled={isCreating || !newKeyName.trim()}>
              {isCreating ? 'Creating...' : 'Generate Key'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Key Display Modal (Show Once) */}
      <Dialog open={showKeyModal} onOpenChange={setShowKeyModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Your API Key
            </DialogTitle>
            <DialogDescription>
              Copy this key now. You won't be able to see it again!
            </DialogDescription>
          </DialogHeader>
          {createdKey && (
            <div className="space-y-4 py-4">
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  <strong>Important:</strong> Store this key securely. You won't be able to retrieve it again.
                </p>
              </div>
              <div className="space-y-2">
                <Label>API Key</Label>
                <div className="flex gap-2">
                  <code className="flex-1 p-3 bg-gray-100 dark:bg-gray-800 rounded text-xs break-all font-mono">
                    {createdKey.key}
                  </code>
                  <Button onClick={() => copyKeyToClipboard(createdKey.key)} size="sm">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p><strong>Name:</strong> {createdKey.name}</p>
                <p><strong>Role:</strong> {createdKey.role}</p>
                {createdKey.expiresAt && (
                  <p><strong>Expires:</strong> {new Date(createdKey.expiresAt).toLocaleDateString()}</p>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowKeyModal(false)}>
              I've saved my key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke Confirmation Dialog */}
      <AlertDialog open={showRevokeDialog} onOpenChange={setShowRevokeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke API Key?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to revoke the API key "{keyToRevoke?.name}"? This action cannot be undone.
              Any applications using this key will immediately lose access.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setKeyToRevoke(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRevokeKey} className="bg-red-600 hover:bg-red-700">
              Revoke Key
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
