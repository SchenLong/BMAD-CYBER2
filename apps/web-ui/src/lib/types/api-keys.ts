/**
 * API Key Types
 * Story 2.5: Progressive Disclosure - Layer 4 (Power User)
 *
 * Type definitions for API key management
 */

/**
 * API key permissions
 */
export type APIKeyPermission =
  | 'read'
  | 'write'
  | 'execute'
  | 'admin'
  | 'projects:read'
  | 'projects:write'
  | 'agents:invoke'
  | 'workflows:execute'
  | 'cli:execute';

/**
 * API key interface
 */
export interface APIKey {
  id: string;
  description: string;
  keyPreview: string; // Last 4 chars only
  permissions: APIKeyPermission[];
  createdAt: Date;
  expiresAt?: Date;
  lastUsed?: Date;
  usageCount: number;
  isActive: boolean;
}

/**
 * Create API key request
 */
export interface CreateAPIKeyRequest {
  description: string;
  permissions: APIKeyPermission[];
  expiresIn?: number; // Duration in hours, undefined = never expires
}

/**
 * Create API key response (includes full key on creation)
 */
export interface CreateAPIKeyResponse {
  id: string;
  key: string; // Full key - only shown once
  description: string;
  permissions: APIKeyPermission[];
  createdAt: Date;
  expiresAt?: Date;
}

/**
 * Advanced mode settings for user preferences
 */
export interface AdvancedModeSettings {
  enabled: boolean;
  enabledAt?: Date;
  keyboardShortcuts: boolean;
  cliAutoShow: boolean;
  preferredTab: 'workflows' | 'agents' | 'terminal' | 'api-keys';
}
