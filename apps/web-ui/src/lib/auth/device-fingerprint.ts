/**
 * Device Fingerprinting Utilities
 * Story 1.6: Session Management - Security Enhancements
 *
 * Generates device fingerprints for session tracking and security validation.
 * Note: This is a basic implementation. For production, consider using a dedicated
 * fingerprinting library like fingerprintjs or clientjs.
 */

export interface FingerprintData {
  /** Screen dimensions */
  screenWidth: number;
  screenHeight: number;
  /** Color depth */
  colorDepth: number;
  /** User agent */
  userAgent: string;
  /** Language */
  language: string;
  /** Platform */
  platform: string;
  /** Timezone offset */
  timezoneOffset: number;
  /** Touch support */
  touchSupport: boolean;
  /** Canvas fingerprint (simplified) */
  canvasFingerprint: string;
}

/**
 * Generate a device fingerprint from browser characteristics
 * This runs on the client side
 */
export function generateDeviceFingerprint(): string {
  if (typeof window === 'undefined') {
    return 'server';
  }

  const data: FingerprintData = {
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    colorDepth: window.screen.colorDepth,
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    timezoneOffset: new Date().getTimezoneOffset(),
    touchSupport: 'ontouchstart' in window,
    canvasFingerprint: getCanvasFingerprint(),
  };

  // Create a hash from the data
  const str = JSON.stringify(data);
  return simpleHash(str);
}

/**
 * Generate a simple hash from a string
 */
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
}

/**
 * Get a canvas fingerprint
 * This is a simplified version - real implementations are more complex
 */
function getCanvasFingerprint(): string {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return 'no-canvas';

    // Draw some text
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('BMAD Fingerprint', 2, 15);

    // Get the data URL and hash it
    const dataUrl = canvas.toDataURL();
    return simpleHash(dataUrl);
  } catch {
    return 'canvas-error';
  }
}

/**
 * Compare two fingerprints for similarity
 * Returns true if they match exactly
 */
export function compareFingerprints(fp1: string, fp2: string): boolean {
  return fp1 === fp2;
}

/**
 * Validate a fingerprint against expected characteristics
 * This can detect suspicious changes in a session
 */
/* eslint-disable @typescript-eslint/no-unused-vars */
export function validateFingerprintChange(
  currentFingerprint: string,
  storedFingerprint: string,
  _ipAddress?: string
): {
  isValid: boolean;
  riskLevel: 'low' | 'medium' | 'high';
  reason?: string;
} {
  // Exact match - low risk
  if (currentFingerprint === storedFingerprint) {
    return { isValid: true, riskLevel: 'low' };
  }

  // Different fingerprint - could be:
  // - Browser update (low risk)
  // - Screen resize (low/medium risk)
  // - Different device (high risk)

  // For now, we'll consider any mismatch as potentially suspicious
  // In production, you'd want more sophisticated logic
  return {
    isValid: false,
    riskLevel: 'medium',
    reason: 'Device characteristics have changed since last session',
  };
}
/* eslint-enable @typescript-eslint/no-unused-vars */
