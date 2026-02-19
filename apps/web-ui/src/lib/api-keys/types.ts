/**
 * API Key Types
 * Story 8.2: API Key Management
 *
 * Type definitions for the new API v1 endpoints
 */

import { UserRole } from '@prisma/client';

/**
 * API key response for listing
 * Never includes the actual key or key hash
 */
export interface APIKeyListItem {
  id: string;
  name: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
  expiresAt: Date | null;
  lastUsedAt: Date | null;
  usageCount: number;
}

/**
 * Create API key request
 */
export interface CreateAPIKeyRequest {
  name: string;
  role?: UserRole;
  expiresIn?: number | null; // Duration in hours, null = never expires
}

/**
 * Create API key response (includes full key - shown ONLY once)
 */
export interface CreateAPIKeyResponse {
  id: string;
  key: string; // Full key - only shown once at creation
  name: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
  expiresAt: Date | null;
}

/**
 * Update API key request
 */
export interface UpdateAPIKeyRequest {
  name?: string;
  isActive?: boolean;
}

/**
 * API key details response
 */
export interface APIKeyDetails {
  id: string;
  name: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
  expiresAt: Date | null;
  lastUsedAt: Date | null;
  usageCount: number;
}

/**
 * API key validation result
 */
export interface APIKeyValidationResult {
  isValid: boolean;
  apiKeyId?: string;
  userId?: string;
  role?: UserRole;
}
