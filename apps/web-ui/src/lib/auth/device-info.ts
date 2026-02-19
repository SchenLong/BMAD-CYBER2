/**
 * Device Information Utilities
 * Story 1.6: Session Management - Device/Browser Detection
 *
 * Parses user agent strings to extract device and browser information.
 */

import type { DeviceInfo } from './types';

/**
 * Parse user agent string to extract device information
 */
export function parseDeviceInfo(userAgent: string | null): DeviceInfo {
  if (!userAgent) {
    return {
      browser: 'Unknown',
      browserVersion: '',
      os: 'Unknown',
      osVersion: '',
      deviceType: 'unknown',
      display: 'Unknown Device',
    };
  }

  const ua = userAgent.toLowerCase();

  // Detect browser
  let browser = 'Unknown';
  let browserVersion = '';

  if (ua.includes('edg/')) {
    browser = 'Edge';
    const match = ua.match(/edg\/([\d.]+)/);
    browserVersion = match ? match[1] : '';
  } else if (ua.includes('chrome/') && !ua.includes('edg')) {
    browser = 'Chrome';
    const match = ua.match(/chrome\/([\d.]+)/);
    browserVersion = match ? match[1] : '';
  } else if (ua.includes('firefox/')) {
    browser = 'Firefox';
    const match = ua.match(/firefox\/([\d.]+)/);
    browserVersion = match ? match[1] : '';
  } else if (ua.includes('safari/') && !ua.includes('chrome')) {
    browser = 'Safari';
    const match = ua.match(/version\/([\d.]+)/);
    browserVersion = match ? match[1] : '';
  } else if (ua.includes('opr/') || ua.includes('opera/')) {
    browser = 'Opera';
    const match = ua.match(/(?:opr|opera)\/([\d.]+)/);
    browserVersion = match ? match[1] : '';
  }

  // Detect OS
  let os = 'Unknown';
  let osVersion = '';

  if (ua.includes('windows')) {
    os = 'Windows';
    if (ua.includes('windows nt 10.0')) osVersion = '10/11';
    else if (ua.includes('windows nt 6.3')) osVersion = '8.1';
    else if (ua.includes('windows nt 6.2')) osVersion = '8';
    else if (ua.includes('windows nt 6.1')) osVersion = '7';
  } else if (ua.includes('mac os x')) {
    os = 'macOS';
    const match = ua.match(/mac os x ([\d_]+)/);
    if (match) {
      osVersion = match[1].replace(/_/g, '.');
    }
  } else if (ua.includes('android')) {
    os = 'Android';
    const match = ua.match(/android ([\d.]+)/);
    osVersion = match ? match[1] : '';
  } else if (ua.includes('iphone') || ua.includes('ipad')) {
    os = 'iOS';
    const match = ua.match(/os ([\d_]+) like mac os x/);
    if (match) {
      osVersion = match[1].replace(/_/g, '.');
    }
  } else if (ua.includes('linux')) {
    os = 'Linux';
  }

  // Detect device type
  let deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown' = 'unknown';

  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
    deviceType = 'mobile';
  } else if (ua.includes('ipad') || ua.includes('tablet')) {
    deviceType = 'tablet';
  } else if (ua.includes('windows') || ua.includes('macintosh') || ua.includes('linux')) {
    deviceType = 'desktop';
  }

  // Build display string
  const display = `${os} ${osVersion ? osVersion : ''} - ${browser} ${browserVersion}`.trim();

  return {
    browser,
    browserVersion,
    os,
    osVersion,
    deviceType,
    display,
  };
}

/**
 * Format IP address for display (mask part of it for privacy)
 */
export function formatIpAddress(ip: string | null): string {
  if (!ip) return 'Unknown';

  // For IPv4, mask the last octet
  if (ip.includes('.')) {
    const parts = ip.split('.');
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.${parts[2]}.***`;
    }
  }

  // For IPv6, mask the last segment
  if (ip.includes(':')) {
    const parts = ip.split(':');
    if (parts.length > 4) {
      return `${parts.slice(0, 4).join(':')}:...`;
    }
  }

  return ip.substring(0, Math.max(0, ip.length - 3)) + '***';
}

/**
 * Format date relative to now
 */
export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;

  return then.toLocaleDateString();
}

/**
 * Get device icon name based on device type
 */
export function getDeviceIcon(deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown'): string {
  switch (deviceType) {
    case 'desktop':
      return 'Monitor';
    case 'mobile':
      return 'Smartphone';
    case 'tablet':
      return 'Tablet';
    default:
      return 'Laptop';
  }
}
