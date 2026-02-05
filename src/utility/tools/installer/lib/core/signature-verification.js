/**
 * Signature Verification Module
 * INST-001: GPG and Sigstore Signature Verification
 *
 * Provides cryptographic signature verification for package integrity.
 * Supports:
 * - GPG/PGP signatures (.sig, .asc files)
 * - Sigstore/cosign signatures (.bundle files)
 *
 * @author BlackUnicorn.Tech
 * @version 1.0.0
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const { exec, spawn } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

/**
 * Default signature verification configuration
 */
const SIGNATURE_CONFIG = {
  // GPG settings
  gpgPath: process.env.GPG_PATH || 'gpg',
  gpgHomedir: process.env.GNUPGHOME || null,
  allowUntrustedKeys: false,
  requiredTrustLevel: 'marginal', // 'unknown', 'never', 'marginal', 'full', 'ultimate'

  // Sigstore settings
  cosignPath: process.env.COSIGN_PATH || 'cosign',
  sigstorePublicGood: true, // Use Sigstore public good instance
  sigstoreRekorUrl: 'https://rekor.sigstore.dev',
  sigstoreFulcioUrl: 'https://fulcio.sigstore.dev',

  // General settings
  verificationRequired: true,
  allowedSignatureTypes: ['gpg', 'sigstore'],
  checksumAlgorithm: 'sha256'
};

/**
 * GPG trust levels in order of increasing trust
 */
const GPG_TRUST_LEVELS = ['unknown', 'never', 'marginal', 'full', 'ultimate'];

/**
 * Signature Verification Manager
 * Handles GPG and Sigstore signature verification
 */
class SignatureVerification {
  constructor(options = {}) {
    this.config = {
      ...SIGNATURE_CONFIG,
      ...options
    };

    // Track verification results
    this.verificationResults = new Map();
  }

  /**
   * Verify package signature using appropriate method
   * Auto-detects signature type based on file extension
   *
   * @param {string} packagePath - Path to the package file
   * @param {string} signaturePath - Path to the signature file (optional, auto-detected)
   * @returns {Promise<VerificationResult>} Verification result
   */
  async verifyPackage(packagePath, signaturePath = null) {
    try {
      // Validate package exists
      await fs.access(packagePath);

      // Auto-detect signature file if not provided
      if (!signaturePath) {
        signaturePath = await this.findSignatureFile(packagePath);
      }

      if (!signaturePath) {
        if (this.config.verificationRequired) {
          return this.createResult(false, 'No signature file found', {
            packagePath,
            error: 'SIGNATURE_NOT_FOUND'
          });
        }
        return this.createResult(true, 'Signature verification skipped (not required)', {
          packagePath,
          skipped: true
        });
      }

      // Determine signature type
      const signatureType = this.detectSignatureType(signaturePath);

      // Verify based on type
      switch (signatureType) {
        case 'gpg':
          return await this.verifyGpgSignature(packagePath, signaturePath);
        case 'sigstore':
          return await this.verifySigstoreSignature(packagePath, signaturePath);
        default:
          return this.createResult(false, `Unknown signature type: ${signatureType}`, {
            packagePath,
            signaturePath,
            error: 'UNKNOWN_SIGNATURE_TYPE'
          });
      }

    } catch (error) {
      return this.createResult(false, `Verification failed: ${error.message}`, {
        packagePath,
        error: error.code || 'VERIFICATION_ERROR'
      });
    }
  }

  /**
   * Verify GPG/PGP signature
   *
   * @param {string} packagePath - Path to the package file
   * @param {string} signaturePath - Path to the .sig or .asc file
   * @returns {Promise<VerificationResult>} Verification result
   */
  async verifyGpgSignature(packagePath, signaturePath) {
    try {
      // Check if GPG is available
      await this.checkGpgAvailable();

      // Build GPG command
      const gpgArgs = ['--verify'];

      // Add homedir if specified
      if (this.config.gpgHomedir) {
        gpgArgs.push('--homedir', this.config.gpgHomedir);
      }

      // Add status-fd for machine-readable output
      gpgArgs.push('--status-fd', '1');

      // Add signature and package paths
      gpgArgs.push(signaturePath, packagePath);

      // Execute GPG verification
      const result = await this.executeGpg(gpgArgs);

      // Parse GPG output
      const parsedResult = this.parseGpgOutput(result.stdout, result.stderr);

      // Validate trust level
      if (parsedResult.valid && !this.config.allowUntrustedKeys) {
        const trustValid = this.validateTrustLevel(parsedResult.trustLevel);
        if (!trustValid) {
          return this.createResult(false, 'Signer key not trusted', {
            packagePath,
            signaturePath,
            keyId: parsedResult.keyId,
            trustLevel: parsedResult.trustLevel,
            requiredTrust: this.config.requiredTrustLevel,
            error: 'INSUFFICIENT_TRUST'
          });
        }
      }

      if (parsedResult.valid) {
        return this.createResult(true, 'GPG signature verified successfully', {
          packagePath,
          signaturePath,
          signatureType: 'gpg',
          keyId: parsedResult.keyId,
          keyFingerprint: parsedResult.fingerprint,
          signer: parsedResult.signer,
          trustLevel: parsedResult.trustLevel,
          signedAt: parsedResult.timestamp
        });
      } else {
        return this.createResult(false, parsedResult.error || 'Invalid GPG signature', {
          packagePath,
          signaturePath,
          signatureType: 'gpg',
          error: parsedResult.errorCode || 'INVALID_SIGNATURE'
        });
      }

    } catch (error) {
      return this.createResult(false, `GPG verification failed: ${error.message}`, {
        packagePath,
        signaturePath,
        error: error.code || 'GPG_ERROR'
      });
    }
  }

  /**
   * Verify Sigstore/cosign signature
   *
   * @param {string} packagePath - Path to the package file
   * @param {string} bundlePath - Path to the .bundle file
   * @returns {Promise<VerificationResult>} Verification result
   */
  async verifySigstoreSignature(packagePath, bundlePath) {
    try {
      // Check if cosign is available
      await this.checkCosignAvailable();

      // Build cosign command for bundle verification
      const cosignArgs = [
        'verify-blob',
        '--bundle', bundlePath
      ];

      // Use public good instance if configured
      if (this.config.sigstorePublicGood) {
        cosignArgs.push('--certificate-oidc-issuer-regexp', '.*');
        cosignArgs.push('--certificate-identity-regexp', '.*');
      }

      // Add the file to verify
      cosignArgs.push(packagePath);

      // Execute cosign verification
      const result = await this.executeCosign(cosignArgs);

      // Parse cosign output
      const parsedResult = this.parseCosignOutput(result.stdout, result.stderr);

      if (parsedResult.valid) {
        return this.createResult(true, 'Sigstore signature verified successfully', {
          packagePath,
          bundlePath,
          signatureType: 'sigstore',
          issuer: parsedResult.issuer,
          subject: parsedResult.subject,
          rekorLogIndex: parsedResult.logIndex,
          signedAt: parsedResult.timestamp
        });
      } else {
        return this.createResult(false, parsedResult.error || 'Invalid Sigstore signature', {
          packagePath,
          bundlePath,
          signatureType: 'sigstore',
          error: parsedResult.errorCode || 'INVALID_SIGNATURE'
        });
      }

    } catch (error) {
      return this.createResult(false, `Sigstore verification failed: ${error.message}`, {
        packagePath,
        bundlePath,
        error: error.code || 'SIGSTORE_ERROR'
      });
    }
  }

  /**
   * Find signature file for a package
   * Looks for .sig, .asc, or .bundle files
   *
   * @param {string} packagePath - Path to the package
   * @returns {Promise<string|null>} Path to signature file or null
   */
  async findSignatureFile(packagePath) {
    const signatureExtensions = ['.sig', '.asc', '.bundle'];

    for (const ext of signatureExtensions) {
      const signaturePath = packagePath + ext;
      try {
        await fs.access(signaturePath);
        return signaturePath;
      } catch {
        // Try without the original extension
        const baseWithoutExt = packagePath.replace(/\.(tgz|tar\.gz|zip)$/, '');
        const altSignaturePath = baseWithoutExt + ext;
        try {
          await fs.access(altSignaturePath);
          return altSignaturePath;
        } catch {
          // Continue to next extension
        }
      }
    }

    return null;
  }

  /**
   * Detect signature type from file extension
   *
   * @param {string} signaturePath - Path to signature file
   * @returns {string} Signature type ('gpg' or 'sigstore')
   */
  detectSignatureType(signaturePath) {
    const ext = path.extname(signaturePath).toLowerCase();

    if (ext === '.sig' || ext === '.asc') {
      return 'gpg';
    } else if (ext === '.bundle') {
      return 'sigstore';
    }

    return 'unknown';
  }

  /**
   * Check if GPG is available on the system
   */
  async checkGpgAvailable() {
    try {
      await execAsync(`${this.config.gpgPath} --version`);
    } catch (error) {
      const err = new Error('GPG is not installed or not in PATH');
      err.code = 'GPG_NOT_FOUND';
      throw err;
    }
  }

  /**
   * Check if cosign is available on the system
   */
  async checkCosignAvailable() {
    try {
      await execAsync(`${this.config.cosignPath} version`);
    } catch (error) {
      const err = new Error('cosign is not installed or not in PATH');
      err.code = 'COSIGN_NOT_FOUND';
      throw err;
    }
  }

  /**
   * Execute GPG command
   *
   * @param {Array} args - GPG arguments
   * @returns {Promise<{stdout: string, stderr: string, exitCode: number}>}
   */
  executeGpg(args) {
    return new Promise((resolve, reject) => {
      const gpg = spawn(this.config.gpgPath, args);

      let stdout = '';
      let stderr = '';

      gpg.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      gpg.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      gpg.on('close', (exitCode) => {
        resolve({ stdout, stderr, exitCode });
      });

      gpg.on('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * Execute cosign command
   *
   * @param {Array} args - cosign arguments
   * @returns {Promise<{stdout: string, stderr: string, exitCode: number}>}
   */
  executeCosign(args) {
    return new Promise((resolve, reject) => {
      const cosign = spawn(this.config.cosignPath, args);

      let stdout = '';
      let stderr = '';

      cosign.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      cosign.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      cosign.on('close', (exitCode) => {
        resolve({ stdout, stderr, exitCode });
      });

      cosign.on('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * Parse GPG verification output
   *
   * @param {string} stdout - GPG stdout
   * @param {string} stderr - GPG stderr
   * @returns {Object} Parsed result
   */
  parseGpgOutput(stdout, stderr) {
    const result = {
      valid: false,
      keyId: null,
      fingerprint: null,
      signer: null,
      trustLevel: 'unknown',
      timestamp: null,
      error: null,
      errorCode: null
    };

    // Check for GOODSIG status
    const goodsigMatch = stdout.match(/\[GNUPG:\] GOODSIG ([A-F0-9]+) (.+)/);
    if (goodsigMatch) {
      result.keyId = goodsigMatch[1];
      result.signer = goodsigMatch[2].trim();
    }

    // Check for VALIDSIG status (more detailed)
    const validsigMatch = stdout.match(/\[GNUPG:\] VALIDSIG ([A-F0-9]+) (\d{4}-\d{2}-\d{2}) (\d+)/);
    if (validsigMatch) {
      result.fingerprint = validsigMatch[1];
      result.timestamp = new Date(parseInt(validsigMatch[3]) * 1000).toISOString();
      result.valid = true;
    }

    // Check for trust level
    const trustMatch = stdout.match(/\[GNUPG:\] TRUST_(\w+)/);
    if (trustMatch) {
      result.trustLevel = trustMatch[1].toLowerCase();
    }

    // Check for errors
    const badsigMatch = stdout.match(/\[GNUPG:\] BADSIG/);
    if (badsigMatch) {
      result.valid = false;
      result.error = 'Bad signature - package may have been tampered with';
      result.errorCode = 'BAD_SIGNATURE';
    }

    const expkeysigMatch = stdout.match(/\[GNUPG:\] EXPKEYSIG/);
    if (expkeysigMatch) {
      result.valid = false;
      result.error = 'Signing key has expired';
      result.errorCode = 'EXPIRED_KEY';
    }

    const noDataMatch = stdout.match(/\[GNUPG:\] NODATA/);
    if (noDataMatch) {
      result.valid = false;
      result.error = 'Invalid signature file format';
      result.errorCode = 'INVALID_FORMAT';
    }

    const noPubkeyMatch = stdout.match(/\[GNUPG:\] NO_PUBKEY ([A-F0-9]+)/);
    if (noPubkeyMatch) {
      result.valid = false;
      result.error = `Public key ${noPubkeyMatch[1]} not found`;
      result.errorCode = 'KEY_NOT_FOUND';
      result.keyId = noPubkeyMatch[1];
    }

    // Fallback: check stderr for error messages
    if (!result.valid && !result.error) {
      if (stderr.includes('BAD signature')) {
        result.error = 'Bad signature';
        result.errorCode = 'BAD_SIGNATURE';
      } else if (stderr.includes('Can\'t check signature: No public key')) {
        result.error = 'Signing key not in keyring';
        result.errorCode = 'KEY_NOT_FOUND';
      } else if (stderr.includes('Good signature')) {
        // Sometimes GPG outputs to stderr
        result.valid = true;
      }
    }

    return result;
  }

  /**
   * Parse cosign verification output
   *
   * @param {string} stdout - cosign stdout
   * @param {string} stderr - cosign stderr
   * @returns {Object} Parsed result
   */
  parseCosignOutput(stdout, stderr) {
    const result = {
      valid: false,
      issuer: null,
      subject: null,
      logIndex: null,
      timestamp: null,
      error: null,
      errorCode: null
    };

    // Check for successful verification
    if (stdout.includes('Verified OK') || stderr.includes('Verified OK')) {
      result.valid = true;
    }

    // Extract certificate details
    const issuerMatch = (stdout + stderr).match(/Issuer: (.+)/);
    if (issuerMatch) {
      result.issuer = issuerMatch[1].trim();
    }

    const subjectMatch = (stdout + stderr).match(/Subject: (.+)/);
    if (subjectMatch) {
      result.subject = subjectMatch[1].trim();
    }

    // Extract Rekor log index
    const logIndexMatch = (stdout + stderr).match(/logIndex: (\d+)/);
    if (logIndexMatch) {
      result.logIndex = parseInt(logIndexMatch[1]);
    }

    // Check for errors
    if (stderr.includes('error verifying bundle')) {
      result.error = 'Invalid signature bundle';
      result.errorCode = 'INVALID_BUNDLE';
    } else if (stderr.includes('certificate has expired')) {
      result.error = 'Certificate has expired';
      result.errorCode = 'EXPIRED_CERTIFICATE';
    } else if (stderr.includes('no matching certificates')) {
      result.error = 'No matching certificates found';
      result.errorCode = 'NO_MATCHING_CERT';
    }

    return result;
  }

  /**
   * Validate GPG trust level meets requirements
   *
   * @param {string} trustLevel - Actual trust level
   * @returns {boolean} Whether trust level is sufficient
   */
  validateTrustLevel(trustLevel) {
    const actualIndex = GPG_TRUST_LEVELS.indexOf(trustLevel);
    const requiredIndex = GPG_TRUST_LEVELS.indexOf(this.config.requiredTrustLevel);

    // If we can't find the trust level, be conservative
    if (actualIndex === -1) {
      return false;
    }

    return actualIndex >= requiredIndex;
  }

  /**
   * Create a verification result object
   *
   * @param {boolean} valid - Whether verification succeeded
   * @param {string} message - Human-readable message
   * @param {Object} details - Additional details
   * @returns {VerificationResult}
   */
  createResult(valid, message, details = {}) {
    const result = {
      valid,
      message,
      timestamp: new Date().toISOString(),
      ...details
    };

    // Cache result
    if (details.packagePath) {
      this.verificationResults.set(details.packagePath, result);
    }

    return result;
  }

  /**
   * Calculate SHA256 checksum of a file
   *
   * @param {string} filePath - Path to file
   * @returns {Promise<string>} Hex-encoded checksum
   */
  async calculateChecksum(filePath) {
    const content = await fs.readFile(filePath);
    return crypto
      .createHash(this.config.checksumAlgorithm)
      .update(content)
      .digest('hex');
  }

  /**
   * Verify checksum in addition to signature
   *
   * @param {string} packagePath - Path to package
   * @param {string} expectedChecksum - Expected checksum
   * @returns {Promise<VerificationResult>}
   */
  async verifyChecksum(packagePath, expectedChecksum) {
    try {
      const actualChecksum = await this.calculateChecksum(packagePath);

      if (actualChecksum === expectedChecksum) {
        return this.createResult(true, 'Checksum verified', {
          packagePath,
          algorithm: this.config.checksumAlgorithm,
          checksum: actualChecksum
        });
      } else {
        return this.createResult(false, 'Checksum mismatch', {
          packagePath,
          algorithm: this.config.checksumAlgorithm,
          expected: expectedChecksum,
          actual: actualChecksum,
          error: 'CHECKSUM_MISMATCH'
        });
      }
    } catch (error) {
      return this.createResult(false, `Checksum verification failed: ${error.message}`, {
        packagePath,
        error: 'CHECKSUM_ERROR'
      });
    }
  }

  /**
   * Get verification status summary
   *
   * @returns {Object} Status summary
   */
  getStatus() {
    return {
      config: {
        verificationRequired: this.config.verificationRequired,
        allowedTypes: this.config.allowedSignatureTypes,
        gpgPath: this.config.gpgPath,
        cosignPath: this.config.cosignPath,
        requiredTrustLevel: this.config.requiredTrustLevel
      },
      cachedResults: this.verificationResults.size
    };
  }
}

/**
 * Create signature verification instance
 *
 * @param {Object} options - Configuration options
 * @returns {SignatureVerification}
 */
const createSignatureVerification = (options = {}) => {
  return new SignatureVerification(options);
};

module.exports = {
  SignatureVerification,
  createSignatureVerification,
  SIGNATURE_CONFIG,
  GPG_TRUST_LEVELS
};
