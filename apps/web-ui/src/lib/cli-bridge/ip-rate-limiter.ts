/**
 * IP-Based Rate Limiting Utilities
 * Story 5.5: CLI Bridge Security Middleware - Task 6
 *
 * Enhanced rate limiting with IP-based tracking and fallback.
 * Handles shared IPs (NAT, proxies) correctly.
 */

import type { AuthContext, RateLimitConfig } from '@/types/cli-security';

/**
 * Trusted IP configuration
 * Can be set via environment variable (comma-separated)
 */
const TRUSTED_IPS_CONFIG = {
  ips: new Set(
    (process.env.TRUSTED_IPS || '').split(',').filter(Boolean)
  ),
  // Whether to bypass rate limiting for trusted IPs
  bypass: process.env.TRUSTED_IPS_BYPASS === 'true',
};

/**
 * Role-based bypass configuration
 * Roles that bypass rate limiting
 */
const ROLE_BYPASS_CONFIG = {
  roles: new Set(
    (process.env.RATE_LIMIT_BYPASS_ROLES || '').split(',').filter(Boolean)
  ),
};

/**
 * Check if an IP address is trusted
 *
 * @param ipAddress - IP address to check
 * @returns true if IP is trusted
 */
export function isTrustedIP(ipAddress: string): boolean {
  // Exact match
  if (TRUSTED_IPS_CONFIG.ips.has(ipAddress)) {
    return true;
  }

  // Check for CIDR ranges (IPv4 only for now)
  // Format: "192.168.1.0/24"
  for (const trustedIP of TRUSTED_IPS_CONFIG.ips) {
    if (trustedIP.includes('/')) {
      if (isIPInCIDR(ipAddress, trustedIP)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Check if IP address is in CIDR range
 *
 * @param ip - IP address to check
 * @param cidr - CIDR range (e.g., "192.168.1.0/24")
 * @returns true if IP is in range
 */
function isIPInCIDR(ip: string, cidr: string): boolean {
  const [network, prefixLength] = cidr.split('/');
  const prefix = parseInt(prefixLength, 10);

  // Parse IP address
  const ipParts = ip.split('.').map(Number);
  const networkParts = network.split('.').map(Number);

  if (ipParts.length !== 4 || networkParts.length !== 4) {
    return false;
  }

  // Create bitmask
  const mask = (0xFFFFFFFF << (32 - prefix)) >>> 0;

  // Convert IPs to integers
  const ipInt = (ipParts[0] << 24) | (ipParts[1] << 16) | (ipParts[2] << 8) | ipParts[3];
  const networkInt = (networkParts[0] << 24) | (networkParts[1] << 16) | (networkParts[2] << 8) | networkParts[3];

  // Compare with mask
  return (ipInt & mask) === (networkInt & mask);
}

/**
 * Check if rate limiting should be bypassed
 * Based on trusted IPs and roles
 *
 * @param authContext - Authentication context
 * @returns true if bypass allowed
 */
export function shouldBypassRateLimit(authContext: AuthContext): boolean {
  // Check trusted IPs with bypass enabled
  if (TRUSTED_IPS_CONFIG.bypass && isTrustedIP(authContext.ip)) {
    return true;
  }

  // Check role-based bypass
  for (const role of authContext.roles) {
    if (ROLE_BYPASS_CONFIG.roles.has(role)) {
      return true;
    }
  }

  return false;
}

/**
 * Generate rate limit identifier
 * Uses userId if available, falls back to IP
 * Handles shared IP scenarios by including both userId and IP when available
 *
 * @param authContext - Authentication context
 * @param command - Command ID (optional)
 * @returns Unique identifier for rate limiting
 */
export function generateRateLimitIdentifier(
  authContext: AuthContext,
  command?: string
): string {
  const commandPart = command || 'default';

  // If we have a userId, use it (primary identifier)
  if (authContext.userId) {
    return `user:${authContext.userId}:${commandPart}`;
  }

  // Fall back to IP-based limiting
  // For shared IPs, we might want to include more context
  return `ip:${authContext.ip}:${commandPart}`;
}

/**
 * Generate composite identifier for shared IP scenarios
 * When users are behind NAT/proxy, include both IP and userId
 *
 * @param authContext - Authentication context
 * @param command - Command ID (optional)
 * @returns Composite identifier
 */
export function generateCompositeIdentifier(
  authContext: AuthContext,
  command?: string
): string {
  const commandPart = command || 'default';

  // If we have both userId and IP, create composite key
  if (authContext.userId && authContext.ip !== 'unknown') {
    // This helps detect abuse from single IP with multiple accounts
    return `composite:${authContext.ip}:${authContext.userId}:${commandPart}`;
  }

  return generateRateLimitIdentifier(authContext, command);
}

/**
 * Parse IP address from various headers
 * Handles proxy and load balancer scenarios
 *
 * @param headers - Request headers
 * @returns Parsed IP address
 */
export function parseIPFromHeaders(headers: Headers): string {
  // Check for forwarded headers (proxy/load balancer)
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs: "client, proxy1, proxy2"
    // The first one is the original client
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  const cfConnectingIp = headers.get('cf-connecting-ip');
  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  const flyClientIp = headers.get('fly-client-ip');
  if (flyClientIp) {
    return flyClientIp;
  }

  const forwarded = headers.get('forwarded');
  if (forwarded) {
    // Parse Forwarded header: "for=192.0.2.1;by=192.0.2.2"
    const forMatch = forwarded.match(/for=(?:"?\[?[^,";]\]+?\]?\]?)/);
    if (forMatch) {
      let ip = forMatch[1].replace(/^"|"$/g, '');
      // Remove IPv6 brackets if present
      ip = ip.replace(/^\[|\]$/g, '');
      return ip;
    }
  }

  return 'unknown';
}

/**
 * Detect if IP is from a known proxy/VPN
 * Basic detection based on common patterns
 *
 * @param ipAddress - IP address to check
 * @returns true if IP appears to be from a proxy
 */
export function isProxyIP(ipAddress: string): boolean {
  // Check against known proxy headers would happen at request time
  // This is a basic check for common proxy IP patterns

  // Cloudflare ranges (simplified)
  if (process.env.CF_TRUSTED_IPS?.includes(ipAddress)) {
    return true;
  }

  // TODO: Integrate with a real proxy detection service
  // like ipqualityscore.com, ipinfo.io, etc.

  return false;
}

/**
 * Get rate limit configuration based on IP trust level
 * Trusted IPs might get higher limits
 *
 * @param authContext - Authentication context
 * @param baseConfig - Base rate limit configuration
 * @returns Adjusted rate limit configuration
 */
export function getAdjustedRateLimitConfig(
  authContext: AuthContext,
  baseConfig: RateLimitConfig
): RateLimitConfig {
  // Trusted IPs get 2x limit
  if (isTrustedIP(authContext.ip)) {
    return {
      ...baseConfig,
      limit: baseConfig.limit * 2,
    };
  }

  // Proxies might get reduced limits
  if (isProxyIP(authContext.ip)) {
    return {
      ...baseConfig,
      limit: Math.max(1, Math.floor(baseConfig.limit / 2)),
    };
  }

  return baseConfig;
}

/**
 * Configuration functions for trusted IPs and bypass roles
 */
export const rateLimitConfig = {
  /**
   * Add a trusted IP
   */
  addTrustedIP(ip: string): void {
    TRUSTED_IPS_CONFIG.ips.add(ip);
  },

  /**
   * Remove a trusted IP
   */
  removeTrustedIP(ip: string): void {
    TRUSTED_IPS_CONFIG.ips.delete(ip);
  },

  /**
   * Get all trusted IPs
   */
  getTrustedIPs(): string[] {
    return Array.from(TRUSTED_IPS_CONFIG.ips);
  },

  /**
   * Set bypass for trusted IPs
   */
  setTrustedIPBypass(bypass: boolean): void {
    TRUSTED_IPS_CONFIG.bypass = bypass;
  },

  /**
   * Add a role that bypasses rate limiting
   */
  addBypassRole(role: string): void {
    ROLE_BYPASS_CONFIG.roles.add(role);
  },

  /**
   * Remove a bypass role
   */
  removeBypassRole(role: string): void {
    ROLE_BYPASS_CONFIG.roles.delete(role);
  },

  /**
   * Get all bypass roles
   */
  getBypassRoles(): string[] {
    return Array.from(ROLE_BYPASS_CONFIG.roles);
  },

  /**
   * Check if bypass is enabled for trusted IPs
   */
  isTrustedIPBypassEnabled(): boolean {
    return TRUSTED_IPS_CONFIG.bypass;
  },
};

/**
 * IP address validation
 */
export const ipUtils = {
  /**
   * Validate IPv4 address
   */
  isValidIPv4(ip: string): boolean {
    const parts = ip.split('.');
    if (parts.length !== 4) return false;

    return parts.every((part) => {
      const num = parseInt(part, 10);
      return !isNaN(num) && num >= 0 && num <= 255;
    });
  },

  /**
   * Validate IPv6 address (basic)
   */
  isValidIPv6(ip: string): boolean {
    // Basic check for IPv6 format
    return ip.includes(':') && !ip.includes('.');
  },

  /**
   * Validate IP address (v4 or v6)
   */
  isValidIP(ip: string): boolean {
    return this.isValidIPv4(ip) || this.isValidIPv6(ip);
  },

  /**
   * Normalize IP address
   */
  normalizeIP(ip: string): string {
    return ip.trim().toLowerCase();
  },
};
