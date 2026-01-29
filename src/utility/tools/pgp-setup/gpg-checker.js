/**
 * GPG Availability Checker - INST-025
 * Epic 4, Story - GPG Availability Detection
 *
 * Checks if GPG is installed on the system, detects version,
 * lists existing keys, and provides installation instructions.
 *
 * @module pgp-setup/gpg-checker
 * @author BlackUnicorn.Tech
 * @version 1.0.0
 */

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

/**
 * Supported operating systems for install instructions
 * @type {Object}
 */
export const INSTALL_INSTRUCTIONS = {
  darwin: {
    name: 'macOS',
    command: 'brew install gnupg',
    note: 'Requires Homebrew. Install from https://brew.sh if not available.'
  },
  linux: {
    name: 'Linux (Debian/Ubuntu)',
    command: 'sudo apt install gnupg',
    note: 'For other distributions: yum install gnupg2 (RHEL/CentOS), pacman -S gnupg (Arch)'
  },
  win32: {
    name: 'Windows',
    command: 'choco install gpg4win',
    note: 'Requires Chocolatey. Alternative: Download from https://gpg4win.org/'
  }
};

/**
 * Default command timeout in milliseconds
 */
export const DEFAULT_COMMAND_TIMEOUT = 5000;

/**
 * Checks if GPG is installed on the system
 *
 * @param {Object} [options] - Options for the check
 * @param {number} [options.timeout=DEFAULT_COMMAND_TIMEOUT] - Command timeout in ms
 * @returns {{installed: boolean, path: string|null, error?: string}} Installation status
 */
export function checkGpgInstalled(options = {}) {
  const { timeout = DEFAULT_COMMAND_TIMEOUT } = options;
  const isWindows = process.platform === 'win32';
  const command = isWindows ? 'where gpg' : 'which gpg';

  try {
    const result = execSync(command, {
      timeout,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    });

    // Parse the path from the output
    const gpgPath = result.trim().split('\n')[0].trim();

    return {
      installed: true,
      path: gpgPath || null
    };
  } catch (error) {
    // Command not found or GPG not in PATH
    if (error.status === 1 || error.code === 'ENOENT') {
      return {
        installed: false,
        path: null,
        error: 'GPG not found in system PATH'
      };
    }

    // Timeout or other error
    return {
      installed: false,
      path: null,
      error: error.message || 'Failed to check GPG installation'
    };
  }
}

/**
 * Gets the GPG version information
 *
 * @param {Object} [options] - Options for the check
 * @param {number} [options.timeout=DEFAULT_COMMAND_TIMEOUT] - Command timeout in ms
 * @returns {{version: string|null, major: number|null, minor: number|null, patch: number|null, error?: string}} Version info
 */
export function getGpgVersion(options = {}) {
  const { timeout = DEFAULT_COMMAND_TIMEOUT } = options;

  try {
    const result = execSync('gpg --version', {
      timeout,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    });

    // Parse version from output like "gpg (GnuPG) 2.4.3"
    const versionMatch = result.match(/gpg\s+\([^)]+\)\s+(\d+)\.(\d+)(?:\.(\d+))?/i);

    if (!versionMatch) {
      return {
        version: null,
        major: null,
        minor: null,
        patch: null,
        error: 'Could not parse GPG version from output'
      };
    }

    const major = parseInt(versionMatch[1], 10);
    const minor = parseInt(versionMatch[2], 10);
    const patch = versionMatch[3] ? parseInt(versionMatch[3], 10) : 0;
    const version = major + '.' + minor + '.' + patch;

    return {
      version,
      major,
      minor,
      patch
    };
  } catch (error) {
    return {
      version: null,
      major: null,
      minor: null,
      patch: null,
      error: error.message || 'Failed to get GPG version'
    };
  }
}

/**
 * Gets OS-specific GPG installation instructions
 *
 * @param {string} [platform=process.platform] - The platform to get instructions for
 * @returns {{platform: string, name: string, command: string, note: string}} Installation instructions
 */
export function getInstallInstructions(platform = process.platform) {
  const instructions = INSTALL_INSTRUCTIONS[platform];

  if (!instructions) {
    return {
      platform,
      name: 'Unknown OS',
      command: 'Please visit https://gnupg.org/download/ for installation instructions',
      note: 'GPG packages are available for most operating systems.'
    };
  }

  return {
    platform,
    ...instructions
  };
}

/**
 * Parses GPG key listing output into structured data
 *
 * @param {string} output - Raw output from gpg --list-keys
 * @returns {Array<{keyId: string, uid: string, email: string|null, created: string|null, expires: string|null}>} Parsed keys
 */
export function parseKeyListing(output) {
  if (!output || typeof output !== 'string') {
    return [];
  }

  const keys = [];
  const lines = output.split('\n');

  let currentKey = null;

  for (const line of lines) {
    // Match pub line: "pub   rsa4096 2024-01-15 [SC] [expires: 2025-01-15]"
    // or older format: "pub   4096R/ABCD1234 2024-01-15"
    const pubMatch = line.match(/^pub\s+(?:rsa)?(\d+)[A-Z]?(?:\/([A-F0-9]+))?\s+(\d{4}-\d{2}-\d{2})/i);
    if (pubMatch) {
      if (currentKey && currentKey.keyId) {
        keys.push(currentKey);
      }
      currentKey = {
        keyId: pubMatch[2] || null,
        uid: '',
        email: null,
        created: pubMatch[3] || null,
        expires: null
      };

      // Check for expiration
      const expiresMatch = line.match(/\[expires:\s*(\d{4}-\d{2}-\d{2})\]/i);
      if (expiresMatch) {
        currentKey.expires = expiresMatch[1];
      }
      continue;
    }

    // Match key ID line (long format): "      ABCDEF1234567890ABCDEF1234567890ABCDEF12"
    const keyIdMatch = line.match(/^\s+([A-F0-9]{16,40})$/i);
    if (keyIdMatch && currentKey && !currentKey.keyId) {
      currentKey.keyId = keyIdMatch[1];
      continue;
    }

    // Match uid line: "uid           [ultimate] John Doe <john@example.com>"
    const uidMatch = line.match(/^uid\s+(?:\[[\w\s]+\]\s+)?(.+)$/i);
    if (uidMatch && currentKey) {
      currentKey.uid = uidMatch[1].trim();

      // Extract email from uid
      const emailMatch = currentKey.uid.match(/<([^>]+@[^>]+)>/);
      if (emailMatch) {
        currentKey.email = emailMatch[1];
      }
    }
  }

  // Don't forget the last key
  if (currentKey && currentKey.keyId) {
    keys.push(currentKey);
  }

  return keys;
}

/**
 * Lists existing GPG keys in the default keyring
 *
 * @param {Object} [options] - Options for the command
 * @param {number} [options.timeout=DEFAULT_COMMAND_TIMEOUT] - Command timeout in ms
 * @returns {{keys: Array, count: number, error?: string}} List of existing keys
 */
export function listExistingKeys(options = {}) {
  const { timeout = DEFAULT_COMMAND_TIMEOUT } = options;

  try {
    const result = execSync('gpg --list-keys --keyid-format long', {
      timeout,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    });

    const keys = parseKeyListing(result);

    return {
      keys,
      count: keys.length
    };
  } catch (error) {
    // GPG may return error if no keys exist
    if (error.status === 2 || error.stderr?.includes('No public key')) {
      return {
        keys: [],
        count: 0
      };
    }

    // Handle case where gpg is not installed
    if (error.code === 'ENOENT' || error.message?.includes('not found')) {
      return {
        keys: [],
        count: 0,
        error: 'GPG command not available'
      };
    }

    return {
      keys: [],
      count: 0,
      error: error.message || 'Failed to list GPG keys'
    };
  }
}

/**
 * Checks GPG secret keys (private keys) in the keyring
 *
 * @param {Object} [options] - Options for the command
 * @param {number} [options.timeout=DEFAULT_COMMAND_TIMEOUT] - Command timeout in ms
 * @returns {{keys: Array, count: number, error?: string}} List of secret keys
 */
export function listSecretKeys(options = {}) {
  const { timeout = DEFAULT_COMMAND_TIMEOUT } = options;

  try {
    const result = execSync('gpg --list-secret-keys --keyid-format long', {
      timeout,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    });

    const keys = parseKeyListing(result);

    return {
      keys,
      count: keys.length
    };
  } catch (error) {
    // GPG may return error if no keys exist
    if (error.status === 2 || error.stderr?.includes('No secret key')) {
      return {
        keys: [],
        count: 0
      };
    }

    // Handle case where gpg is not installed
    if (error.code === 'ENOENT' || error.message?.includes('not found')) {
      return {
        keys: [],
        count: 0,
        error: 'GPG command not available'
      };
    }

    return {
      keys: [],
      count: 0,
      error: error.message || 'Failed to list GPG secret keys'
    };
  }
}

/**
 * Main function to check full GPG capability
 * This is the primary export for wizard integration
 *
 * @param {Object} [options] - Options for the check
 * @param {number} [options.timeout=DEFAULT_COMMAND_TIMEOUT] - Command timeout in ms
 * @returns {Promise<{available: boolean, version: string|null, major: number|null, existingKeys: Array, secretKeys: Array, installInstructions?: Object}>} GPG capability status
 */
export async function checkGpgCapability(options = {}) {
  // Check if GPG is installed
  const installCheck = checkGpgInstalled(options);

  if (!installCheck.installed) {
    return {
      available: false,
      version: null,
      major: null,
      existingKeys: [],
      secretKeys: [],
      gpgPath: null,
      installInstructions: getInstallInstructions()
    };
  }

  // Get version info
  const versionInfo = getGpgVersion(options);

  // List existing public keys
  const publicKeys = listExistingKeys(options);

  // List secret keys
  const secretKeysResult = listSecretKeys(options);

  return {
    available: true,
    version: versionInfo.version,
    major: versionInfo.major,
    existingKeys: publicKeys.keys,
    secretKeys: secretKeysResult.keys,
    gpgPath: installCheck.path
  };
}

/**
 * Formats GPG capability status for display
 *
 * @param {Object} capability - Result from checkGpgCapability
 * @returns {string} Formatted string for display
 */
export function formatGpgCapability(capability) {
  const lines = ['GPG Status:'];

  if (!capability.available) {
    lines.push('');
    lines.push('  [NOT INSTALLED] GPG is not available on this system');
    lines.push('');

    if (capability.installInstructions) {
      lines.push('  Installation Instructions:');
      lines.push('    Platform: ' + capability.installInstructions.name);
      lines.push('    Command:  ' + capability.installInstructions.command);
      if (capability.installInstructions.note) {
        lines.push('    Note:     ' + capability.installInstructions.note);
      }
    }

    return lines.join('\n');
  }

  lines.push('');
  lines.push('  [INSTALLED] GPG version ' + capability.version);
  lines.push('  Path: ' + capability.gpgPath);
  lines.push('  Version Type: GPG ' + capability.major + '.x');

  lines.push('');
  if (capability.existingKeys.length > 0) {
    lines.push('  Public Keys (' + capability.existingKeys.length + '):');
    for (const key of capability.existingKeys.slice(0, 5)) {
      const keyInfo = key.email || key.uid || key.keyId;
      lines.push('    - ' + keyInfo);
    }
    if (capability.existingKeys.length > 5) {
      lines.push('    ... and ' + (capability.existingKeys.length - 5) + ' more');
    }
  } else {
    lines.push('  Public Keys: None');
  }

  lines.push('');
  if (capability.secretKeys.length > 0) {
    lines.push('  Secret Keys (' + capability.secretKeys.length + '):');
    for (const key of capability.secretKeys.slice(0, 5)) {
      const keyInfo = key.email || key.uid || key.keyId;
      lines.push('    - ' + keyInfo);
    }
    if (capability.secretKeys.length > 5) {
      lines.push('    ... and ' + (capability.secretKeys.length - 5) + ' more');
    }
  } else {
    lines.push('  Secret Keys: None (you can generate a new key pair)');
  }

  return lines.join('\n');
}

// ESM Entry point detection for testing
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log('GPG Availability Checker - Standalone Test\n');
  checkGpgCapability()
    .then(capability => console.log(formatGpgCapability(capability)))
    .catch(error => console.error('Check failed:', error.message));
}
