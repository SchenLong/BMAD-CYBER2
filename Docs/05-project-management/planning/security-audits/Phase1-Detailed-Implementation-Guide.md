# Phase 1: Foundation & Critical Fixes - Detailed Implementation Guide

**Project:** BMAD-Security-Review
**Phase:** 1 of 4
**Duration:** Weeks 1-3
**Author:** Bastion (Security Architect)
**Date:** 2026-01-13
**Status:** ✅ **COMPLETE** (2026-01-15)

---

## Implementation Status

| Solution | Status | Completion Date |
|----------|--------|-----------------|
| 1.1 File Integrity Verification | ✅ Complete | 2026-01-15 |
| 1.2 Authentication System | ✅ Complete | 2026-01-15 |
| 1.3 YOLO Mode Restrictions | ✅ Complete | 2026-01-15 |

**Documentation:**
- [Security-File-Integrity.md](../../06-reference/features/Security/Security-File-Integrity.md)
- [Security-Authentication.md](../../06-reference/features/Security/Security-Authentication.md)
- [Security-YOLO-Mode-Restrictions.md](../../06-reference/features/Security/Security-YOLO-Mode-Restrictions.md)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Solution 1.1: File Integrity Verification](#2-solution-11-file-integrity-verification) ✅
3. [Solution 1.2: Authentication System](#3-solution-12-authentication-system) ✅
4. [Solution 1.3: YOLO Mode Restrictions](#4-solution-13-yolo-mode-restrictions) ✅
5. [Implementation Order & Dependencies](#5-implementation-order--dependencies)
6. [Files Requiring Updates](#6-files-requiring-updates)
7. [Testing & Validation](#7-testing--validation)

---

## 1. Executive Summary

Phase 1 addresses the three most critical security gaps identified in the BMAD Framework Security Audit:

| Solution | Finding Addressed | Severity | User Impact | Status |
|----------|-------------------|----------|-------------|--------|
| 1.1 File Integrity | No tamper detection | CRITICAL | Low friction | ✅ Complete |
| 1.2 Authentication | No user verification | CRITICAL | Medium friction | ✅ Complete |
| 1.3 YOLO Restrictions | Security bypass | HIGH | Low friction | ✅ Complete |

### User Experience Philosophy

Throughout Phase 1, we follow these UX principles:

1. **Security should be invisible when everything is correct** - Users shouldn't notice security checks unless something is wrong
2. **Clear, actionable error messages** - When security blocks an action, users know exactly why and what to do
3. **Graceful degradation** - Development environments can relax security for faster iteration
4. **Single sign-on per session** - Authenticate once, work uninterrupted

---

## 2. Solution 1.1: File Integrity Verification

### 2.1 Problem Statement

**Current State:**
- All 1,359 framework files (agents, workflows, configs) are unsigned
- If an attacker modifies `workflow.xml` or any agent file, there is NO detection
- The framework will execute tampered code without warning
- Git provides history but not real-time integrity verification

**Risk Scenario:**
```
1. Attacker gains file system access (malware, insider, supply chain)
2. Modifies _bmad/core/tasks/workflow.xml to add malicious step
3. User invokes any workflow
4. Malicious code executes with user's permissions
5. No alert, no detection, no audit trail
```

### 2.2 Proposed Solution: GPG-Based File Signing

**How It Works:**

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      FILE INTEGRITY SYSTEM                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   BUILD TIME (CI/CD or Manual)                                          │
│   ┌──────────────┐    ┌──────────────┐    ┌──────────────────┐         │
│   │  Framework   │───▶│    GPG       │───▶│  .asc Signature  │         │
│   │    File      │    │   Sign       │    │     File         │         │
│   │ (workflow.xml)    │              │    │ (workflow.xml.asc)│         │
│   └──────────────┘    └──────────────┘    └──────────────────┘         │
│                              │                                          │
│                              ▼                                          │
│                       BMAD Signing Key                                  │
│                       (Private - Secured)                               │
│                                                                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   RUNTIME (Every File Load)                                             │
│   ┌──────────────┐    ┌──────────────┐    ┌──────────────────┐         │
│   │  Load        │───▶│   Verify     │───▶│  ✓ Proceed or    │         │
│   │  Request     │    │  Signature   │    │  ✗ Block + Alert │         │
│   └──────────────┘    └──────────────┘    └──────────────────┘         │
│                              │                                          │
│                              ▼                                          │
│                       BMAD Public Key                                   │
│                       (Distributed with framework)                      │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

**Why GPG?**
- Industry standard for code signing
- Asymmetric cryptography (private key signs, public key verifies)
- Built into most systems (no new dependencies)
- Supports key rotation and revocation
- Tamper-evident (any modification invalidates signature)

### 2.3 Detailed Implementation

#### Step 1: Create BMAD Signing Key Pair

**What:** Generate a dedicated GPG key pair for signing BMAD framework files.

**Commands:**
```bash
# Generate key pair (non-interactive)
gpg --batch --gen-key <<EOF
Key-Type: RSA
Key-Length: 4096
Subkey-Type: RSA
Subkey-Length: 4096
Name-Real: BMAD Framework
Name-Email: bmad-signing@internal
Expire-Date: 2y
%no-protection
%commit
EOF

# Export public key for distribution
gpg --armor --export bmad-signing@internal > _bmad/core/security/bmad-public-key.asc

# Export private key for secure storage (CI/CD secrets)
gpg --armor --export-secret-keys bmad-signing@internal > bmad-private-key.asc
# IMPORTANT: Store this securely, delete from local after exporting
```

**Files Created:**
| File | Location | Purpose |
|------|----------|---------|
| `bmad-public-key.asc` | `_bmad/core/security/` | Distributed with framework for verification |
| `bmad-private-key.asc` | CI/CD Secrets | Used by build system to sign files |

---

#### Step 2: Create Signing Script

**What:** Script that signs all framework files during build/release.

**File:** `_bmad/core/security/sign-files.sh`

```bash
#!/bin/bash
#
# BMAD Framework File Signing Script
# Signs all framework files with the BMAD signing key
#
# Usage: ./sign-files.sh [--key-id KEY_ID] [--directory DIR]
#
# Environment:
#   BMAD_SIGNING_KEY_ID - GPG key ID to use (default: bmad-signing@internal)
#

set -euo pipefail

# Configuration
BMAD_KEY_ID="${BMAD_SIGNING_KEY_ID:-bmad-signing@internal}"
PROJECT_ROOT="${PROJECT_ROOT:-$(git rev-parse --show-toplevel)}"
SIGN_EXTENSIONS=("md" "yaml" "yml" "xml" "sh")

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Statistics
SIGNED_COUNT=0
SKIPPED_COUNT=0
ERROR_COUNT=0

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if GPG key is available
check_key() {
    if ! gpg --list-secret-keys "$BMAD_KEY_ID" &>/dev/null; then
        log_error "Signing key '$BMAD_KEY_ID' not found in GPG keyring"
        log_error "Import the key or set BMAD_SIGNING_KEY_ID environment variable"
        exit 1
    fi
    log_info "Using signing key: $BMAD_KEY_ID"
}

# Sign a single file
sign_file() {
    local file="$1"
    local sig_file="${file}.asc"

    # Skip if signature exists and is newer than file
    if [[ -f "$sig_file" ]] && [[ "$sig_file" -nt "$file" ]]; then
        ((SKIPPED_COUNT++))
        return 0
    fi

    # Remove old signature if exists
    [[ -f "$sig_file" ]] && rm "$sig_file"

    # Create detached ASCII signature
    if gpg --armor --detach-sign --local-user "$BMAD_KEY_ID" --output "$sig_file" "$file" 2>/dev/null; then
        log_info "Signed: $file"
        ((SIGNED_COUNT++))
    else
        log_error "Failed to sign: $file"
        ((ERROR_COUNT++))
        return 1
    fi
}

# Find and sign all matching files in a directory
sign_directory() {
    local dir="$1"

    if [[ ! -d "$dir" ]]; then
        log_warn "Directory not found: $dir"
        return
    fi

    log_info "Scanning directory: $dir"

    for ext in "${SIGN_EXTENSIONS[@]}"; do
        while IFS= read -r -d '' file; do
            sign_file "$file"
        done < <(find "$dir" -name "*.$ext" -type f -print0 2>/dev/null)
    done
}

# Main execution
main() {
    log_info "BMAD Framework File Signing"
    log_info "==========================="

    check_key

    # Sign BMAD framework files
    sign_directory "$PROJECT_ROOT/_bmad"

    # Sign Claude hooks
    sign_directory "$PROJECT_ROOT/.claude/hooks"

    # Summary
    echo ""
    log_info "Signing Complete"
    log_info "----------------"
    log_info "Files signed: $SIGNED_COUNT"
    log_info "Files skipped (up-to-date): $SKIPPED_COUNT"

    if [[ $ERROR_COUNT -gt 0 ]]; then
        log_error "Files with errors: $ERROR_COUNT"
        exit 1
    fi
}

main "$@"
```

**Make executable:**
```bash
chmod +x _bmad/core/security/sign-files.sh
```

---

#### Step 3: Create Verification Module

**What:** TypeScript module that verifies file signatures before loading.

**File:** `_bmad/core/security/integrity-verifier.ts`

```typescript
/**
 * BMAD File Integrity Verification Module
 *
 * Verifies GPG signatures of framework files before they are loaded.
 * Prevents execution of tampered or unsigned files.
 */

import { execSync, ExecSyncOptions } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// Types
// ============================================================================

export interface VerificationResult {
  file: string;
  valid: boolean;
  error?: string;
  signedBy?: string;
  signedAt?: Date;
  keyId?: string;
}

export interface VerificationConfig {
  enabled: boolean;
  trustLevel: 'strict' | 'warn' | 'disabled';
  trustedKeyIds: string[];
  publicKeyPath: string;
  skipPatterns: string[];
}

export type VerificationMode = 'strict' | 'warn' | 'disabled';

// ============================================================================
// Default Configuration
// ============================================================================

const DEFAULT_CONFIG: VerificationConfig = {
  enabled: true,
  trustLevel: 'strict',
  trustedKeyIds: ['bmad-signing@internal'],
  publicKeyPath: '_bmad/core/security/bmad-public-key.asc',
  skipPatterns: [
    '*.test.*',
    '*.spec.*',
    '**/node_modules/**'
  ]
};

// ============================================================================
// Integrity Verifier Class
// ============================================================================

export class IntegrityVerifier {
  private config: VerificationConfig;
  private publicKeyImported: boolean = false;

  constructor(config: Partial<VerificationConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Import the BMAD public key into GPG keyring if not already present
   */
  private ensurePublicKeyImported(): void {
    if (this.publicKeyImported) return;

    const keyPath = this.config.publicKeyPath;
    if (!fs.existsSync(keyPath)) {
      throw new Error(
        `BMAD public key not found at ${keyPath}. ` +
        `Framework integrity cannot be verified.`
      );
    }

    try {
      // Check if key already imported
      const keyContent = fs.readFileSync(keyPath, 'utf-8');
      const keyIdMatch = keyContent.match(/bmad-signing@internal/);

      if (keyIdMatch) {
        // Import key (idempotent - won't duplicate)
        execSync(`gpg --import "${keyPath}" 2>/dev/null || true`, {
          encoding: 'utf-8',
          stdio: 'pipe'
        });
      }

      this.publicKeyImported = true;
    } catch (error: any) {
      throw new Error(`Failed to import BMAD public key: ${error.message}`);
    }
  }

  /**
   * Check if a file should be skipped based on patterns
   */
  private shouldSkip(filePath: string): boolean {
    const relativePath = path.relative(process.cwd(), filePath);

    for (const pattern of this.config.skipPatterns) {
      // Simple glob matching
      const regexPattern = pattern
        .replace(/\*\*/g, '.*')
        .replace(/\*/g, '[^/]*')
        .replace(/\./g, '\\.');

      if (new RegExp(regexPattern).test(relativePath)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Verify signature of a single file
   */
  verifyFile(filePath: string): VerificationResult {
    // Check if verification is disabled
    if (!this.config.enabled || this.config.trustLevel === 'disabled') {
      return { file: filePath, valid: true };
    }

    // Check if file should be skipped
    if (this.shouldSkip(filePath)) {
      return { file: filePath, valid: true };
    }

    // Ensure public key is available
    this.ensurePublicKeyImported();

    const signaturePath = `${filePath}.asc`;

    // Check if signature file exists
    if (!fs.existsSync(signaturePath)) {
      return {
        file: filePath,
        valid: false,
        error: `Signature file not found: ${signaturePath}`
      };
    }

    // Check if original file exists
    if (!fs.existsSync(filePath)) {
      return {
        file: filePath,
        valid: false,
        error: `Original file not found: ${filePath}`
      };
    }

    try {
      // Verify signature using GPG
      const options: ExecSyncOptions = {
        encoding: 'utf-8',
        stdio: 'pipe'
      };

      const result = execSync(
        `gpg --verify "${signaturePath}" "${filePath}" 2>&1`,
        options
      ) as string;

      // Parse GPG output
      const goodSigMatch = result.match(/Good signature from "([^"]+)"/);
      const dateMatch = result.match(/Signature made (.+)/);
      const keyIdMatch = result.match(/using \w+ key ([A-F0-9]+)/i);

      if (goodSigMatch) {
        // Verify the signer is trusted
        const signer = goodSigMatch[1];
        const isTrusted = this.config.trustedKeyIds.some(
          trusted => signer.includes(trusted)
        );

        if (!isTrusted) {
          return {
            file: filePath,
            valid: false,
            error: `Signature valid but signer not trusted: ${signer}`,
            signedBy: signer,
            keyId: keyIdMatch?.[1]
          };
        }

        return {
          file: filePath,
          valid: true,
          signedBy: signer,
          signedAt: dateMatch ? new Date(dateMatch[1]) : undefined,
          keyId: keyIdMatch?.[1]
        };
      }

      return {
        file: filePath,
        valid: false,
        error: 'GPG verification returned unexpected output'
      };

    } catch (error: any) {
      // GPG returns non-zero exit code for bad signatures
      const output = error.stdout || error.stderr || error.message;

      if (output.includes('BAD signature')) {
        return {
          file: filePath,
          valid: false,
          error: 'SIGNATURE INVALID - File may have been tampered with!'
        };
      }

      return {
        file: filePath,
        valid: false,
        error: `Verification failed: ${output}`
      };
    }
  }

  /**
   * Verify all files in a directory
   */
  verifyDirectory(
    dirPath: string,
    extensions: string[] = ['md', 'yaml', 'yml', 'xml', 'sh']
  ): VerificationResult[] {
    const results: VerificationResult[] = [];

    const walkDir = (dir: string) => {
      if (!fs.existsSync(dir)) return;

      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          // Skip node_modules and hidden directories
          if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
            walkDir(fullPath);
          }
        } else if (entry.isFile()) {
          // Check if file has a signable extension
          const ext = path.extname(entry.name).slice(1);
          if (extensions.includes(ext)) {
            results.push(this.verifyFile(fullPath));
          }
        }
      }
    };

    walkDir(dirPath);
    return results;
  }

  /**
   * Enforce integrity - throw error if verification fails
   * This is the primary method used by the framework loader
   */
  enforceIntegrity(filePath: string): void {
    if (this.config.trustLevel === 'disabled') {
      return;
    }

    const result = this.verifyFile(filePath);

    if (!result.valid) {
      const message =
        `\n` +
        `╔══════════════════════════════════════════════════════════════════╗\n` +
        `║           🛑 SECURITY VIOLATION - FILE INTEGRITY FAILED          ║\n` +
        `╠══════════════════════════════════════════════════════════════════╣\n` +
        `║                                                                  ║\n` +
        `║  File: ${filePath.padEnd(54)}║\n` +
        `║                                                                  ║\n` +
        `║  Error: ${(result.error || 'Unknown').slice(0, 53).padEnd(53)}║\n` +
        `║                                                                  ║\n` +
        `║  This file may have been tampered with.                         ║\n` +
        `║  Framework loading has been blocked for your protection.        ║\n` +
        `║                                                                  ║\n` +
        `║  Actions:                                                        ║\n` +
        `║  1. Verify git status for unexpected changes                    ║\n` +
        `║  2. Re-run signing script: ./sign-files.sh                      ║\n` +
        `║  3. If issue persists, contact security team                    ║\n` +
        `║                                                                  ║\n` +
        `╚══════════════════════════════════════════════════════════════════╝\n`;

      if (this.config.trustLevel === 'strict') {
        throw new Error(message);
      } else if (this.config.trustLevel === 'warn') {
        console.warn(message);
      }
    }
  }

  /**
   * Generate integrity report for all framework files
   */
  generateReport(): {
    valid: number;
    invalid: number;
    missing: number;
    results: VerificationResult[];
  } {
    const results = this.verifyDirectory('_bmad');
    const hookResults = this.verifyDirectory('.claude/hooks');

    const allResults = [...results, ...hookResults];

    return {
      valid: allResults.filter(r => r.valid).length,
      invalid: allResults.filter(r => !r.valid && !r.error?.includes('not found')).length,
      missing: allResults.filter(r => r.error?.includes('not found')).length,
      results: allResults
    };
  }
}

// ============================================================================
// Singleton Instance for Framework Use
// ============================================================================

let _instance: IntegrityVerifier | null = null;

export function getIntegrityVerifier(
  config?: Partial<VerificationConfig>
): IntegrityVerifier {
  if (!_instance || config) {
    _instance = new IntegrityVerifier(config);
  }
  return _instance;
}

// ============================================================================
// CLI Entry Point (for manual verification)
// ============================================================================

if (require.main === module) {
  const verifier = new IntegrityVerifier();
  const report = verifier.generateReport();

  console.log('\nBMAD Framework Integrity Report');
  console.log('================================');
  console.log(`Valid signatures:   ${report.valid}`);
  console.log(`Invalid signatures: ${report.invalid}`);
  console.log(`Missing signatures: ${report.missing}`);

  if (report.invalid > 0) {
    console.log('\nInvalid files:');
    report.results
      .filter(r => !r.valid && !r.error?.includes('not found'))
      .forEach(r => console.log(`  - ${r.file}: ${r.error}`));
  }

  process.exit(report.invalid > 0 ? 1 : 0);
}
```

---

#### Step 4: Integrate into Framework Loader

**What:** Modify the workflow execution engine to verify files before loading.

**File to Modify:** `_bmad/core/tasks/workflow.xml`

**Add at the beginning of the file (after XML declaration):**

```xml
<!--
  ============================================================================
  SECURITY: FILE INTEGRITY VERIFICATION
  ============================================================================

  Before loading ANY file, verify its cryptographic signature.
  This prevents execution of tampered framework files.

  Implementation: Call IntegrityVerifier.enforceIntegrity(filePath) before
  every file read operation.
-->

<security-directive id="file-integrity" mandatory="true" order="0">
  <description>
    Verify cryptographic signature of all framework files before loading.
    Blocks execution if signature is missing, invalid, or from untrusted source.
  </description>

  <pre-load-hook>
    Before reading any .md, .yaml, .xml, or .sh file:
    1. Construct signature path: {file_path}.asc
    2. Call GPG verification: gpg --verify {sig_path} {file_path}
    3. If verification fails:
       - Log security event with full details
       - Display clear error message to user
       - STOP execution immediately
       - Do NOT load or execute the file
    4. If verification passes:
       - Log successful verification (debug level)
       - Proceed with file loading
  </pre-load-hook>

  <configuration>
    <setting name="trust_level" default="strict">
      strict: Block on any verification failure
      warn: Log warning but allow execution (development only)
      disabled: Skip verification (NOT RECOMMENDED)
    </setting>
    <setting name="trusted_keys" default="bmad-signing@internal">
      Comma-separated list of trusted GPG key identifiers
    </setting>
  </configuration>

  <error-handling>
    <on-missing-signature>
      ERROR: File '{file_path}' is not signed.

      This file cannot be loaded because it lacks a cryptographic signature.
      All BMAD framework files must be signed to ensure integrity.

      To fix:
      1. Run the signing script: _bmad/core/security/sign-files.sh
      2. Commit the .asc signature files
      3. Try again
    </on-missing-signature>

    <on-invalid-signature>
      CRITICAL SECURITY ALERT: Invalid signature for '{file_path}'!

      ⚠️  This file may have been tampered with!

      The cryptographic signature does not match the file contents.
      This could indicate:
      - Unauthorized modification of framework files
      - Corrupted file during transfer
      - Attack attempt

      Actions required:
      1. DO NOT proceed with execution
      2. Check git status for unexpected changes
      3. Contact security team if modification is unexplained
      4. Restore file from known-good source (git checkout)
      5. Re-sign files after restoration
    </on-invalid-signature>

    <on-untrusted-signer>
      WARNING: File '{file_path}' signed by untrusted key.

      The file has a valid signature, but the signing key is not in the
      trusted keys list.

      Signer: {signer_identity}
      Key ID: {key_id}

      If this is a legitimate key, add it to the trusted_keys configuration.
      Otherwise, investigate who signed this file and why.
    </on-untrusted-signer>
  </error-handling>
</security-directive>
```

---

#### Step 5: Create Configuration Options

**What:** Allow users to configure integrity verification behavior.

**File to Modify:** `_bmad/core/config.yaml`

**Add security section:**

```yaml
# =============================================================================
# SECURITY CONFIGURATION
# =============================================================================
# These settings control BMAD framework security features.
# Modify with caution - relaxing security may expose vulnerabilities.

security:
  # ---------------------------------------------------------------------------
  # File Integrity Verification
  # ---------------------------------------------------------------------------
  file_integrity:
    # Enable/disable signature verification (default: true)
    enabled: true

    # Trust level determines behavior on verification failure
    # Options:
    #   strict   - Block execution on any failure (RECOMMENDED for production)
    #   warn     - Log warning but continue (development/debugging only)
    #   disabled - Skip verification entirely (NOT RECOMMENDED)
    trust_level: strict

    # Path to BMAD public key for verification
    public_key_path: "{project-root}/_bmad/core/security/bmad-public-key.asc"

    # Trusted signing key identifiers
    # Only signatures from these keys will be accepted
    trusted_keys:
      - "bmad-signing@internal"

    # File patterns to skip verification (development convenience)
    # WARNING: Adding patterns here reduces security coverage
    skip_patterns:
      - "*.test.*"
      - "*.spec.*"
```

---

### 2.4 User Experience Impact

#### Normal Operation (Everything Valid)

**What Users See:** Nothing. Verification happens transparently.

```
User: /bmad:core:agents:abdul

[No visible security messages - verification passes silently]

Abdul: Welcome, J! I'm Abdul, your Master Project Manager...
```

**Performance Impact:** ~50-100ms additional load time for signature verification.

#### Missing Signature

**What Users See:**

```
User: /bmad:core:agents:abdul

╔══════════════════════════════════════════════════════════════════╗
║              ⚠️  FILE SIGNATURE MISSING                           ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  File: _bmad/core/agents/abdul.md                                ║
║                                                                   ║
║  This file cannot be loaded because it lacks a signature.        ║
║                                                                   ║
║  Quick Fix:                                                       ║
║  Run: _bmad/core/security/sign-files.sh                          ║
║                                                                   ║
╚══════════════════════════════════════════════════════════════════╝
```

**User Action Required:** Run signing script, then retry.

#### Tampered File Detected

**What Users See:**

```
User: /bmad:core:agents:abdul

╔══════════════════════════════════════════════════════════════════╗
║           🛑 SECURITY VIOLATION - FILE INTEGRITY FAILED          ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  File: _bmad/core/agents/abdul.md                                ║
║                                                                   ║
║  Error: SIGNATURE INVALID - File may have been tampered with!    ║
║                                                                   ║
║  This file may have been tampered with.                          ║
║  Framework loading has been blocked for your protection.         ║
║                                                                   ║
║  Actions:                                                         ║
║  1. Verify git status for unexpected changes                     ║
║  2. Re-run signing script: ./sign-files.sh                       ║
║  3. If issue persists, contact security team                     ║
║                                                                   ║
╚══════════════════════════════════════════════════════════════════╝
```

**User Action Required:** Investigate the modification, restore file if needed.

#### Development Mode (Relaxed Security)

For development, users can set `trust_level: warn`:

```
User: /bmad:core:agents:abdul

⚠️ WARNING: File signature verification failed for _bmad/core/agents/abdul.md
   Reason: Signature file not found
   Continuing in development mode (trust_level: warn)

Abdul: Welcome, J! I'm Abdul...
```

---

### 2.5 Files Summary for Solution 1.1

| File | Action | Description |
|------|--------|-------------|
| `_bmad/core/security/bmad-public-key.asc` | CREATE | Public key for verification |
| `_bmad/core/security/sign-files.sh` | CREATE | Signing script |
| `_bmad/core/security/integrity-verifier.ts` | CREATE | Verification module |
| `_bmad/core/tasks/workflow.xml` | MODIFY | Add integrity check directive |
| `_bmad/core/config.yaml` | MODIFY | Add security configuration |
| `*.asc` files (1,359) | CREATE | Signature files for all framework files |

---

## 3. Solution 1.2: Authentication System

### 3.1 Problem Statement

**Current State:**
- User identity comes from plaintext in `config.yaml`:
  ```yaml
  user_name: J
  ```
- Anyone with file access can change this to any name
- No password, token, or credential of any kind
- All actions appear to come from whoever edited the config file
- Intel-team claims `user_context: "accredited_professional"` with no verification

**Risk Scenario:**
```
1. Shared workstation or compromised environment
2. Attacker changes user_name in config.yaml
3. Executes sensitive workflow (intel-team, legal-team)
4. Actions attributed to wrong user
5. No authentication challenge, no audit attribution
```

### 3.2 Proposed Solution: Token-Based Authentication

**How It Works:**

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      AUTHENTICATION SYSTEM                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   INITIAL SETUP (One-time per user)                                     │
│   ┌──────────────┐    ┌──────────────┐    ┌──────────────────┐         │
│   │    User      │───▶│   Generate   │───▶│   Token File     │         │
│   │ Credentials  │    │    Token     │    │  (.bmad-token)   │         │
│   └──────────────┘    └──────────────┘    └──────────────────┘         │
│        │                                                                 │
│        ▼                                                                 │
│   Name, Email, Roles                                                    │
│                                                                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   EVERY SESSION (Agent Activation)                                      │
│   ┌──────────────┐    ┌──────────────┐    ┌──────────────────┐         │
│   │  Read Token  │───▶│   Validate   │───▶│ ✓ Create Session │         │
│   │    File      │    │   & Decode   │    │ ✗ Block + Prompt │         │
│   └──────────────┘    └──────────────┘    └──────────────────┘         │
│                              │                                          │
│                              ▼                                          │
│                    Check: Not expired                                   │
│                    Check: Valid signature                               │
│                    Check: Roles valid                                   │
│                                                                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   SESSION LIFETIME                                                      │
│   ┌──────────────┐    ┌──────────────┐    ┌──────────────────┐         │
│   │  Agent/WF    │───▶│   Session    │───▶│ Identity Context │         │
│   │   Request    │    │   Check      │    │ (for audit/authz)│         │
│   └──────────────┘    └──────────────┘    └──────────────────┘         │
│                                                                          │
│   Session provides:                                                     │
│   - user_id (verified)                                                  │
│   - user_name (verified)                                                │
│   - roles (verified)                                                    │
│   - session_id (unique)                                                 │
│   - created_at (timestamp)                                              │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

**Why PASETO Tokens?**
- Modern, secure token format (successor to JWT)
- Built-in encryption (tokens are opaque, not just signed)
- No algorithm confusion attacks (unlike JWT)
- Stateless verification (no database lookup required)
- Includes expiration and claims

### 3.3 Detailed Implementation

#### Step 1: Create Authentication Configuration

**File:** `_bmad/core/security/auth-config.yaml`

```yaml
# =============================================================================
# BMAD AUTHENTICATION CONFIGURATION
# =============================================================================

authentication:
  # Enable/disable authentication requirement
  enabled: true

  # Authentication method
  # Options:
  #   local_token - File-based token (default, single-user)
  #   env_token   - Token from environment variable (CI/CD, automation)
  #   interactive - Prompt user for credentials (future)
  method: local_token

  # ---------------------------------------------------------------------------
  # Local Token Configuration
  # ---------------------------------------------------------------------------
  local_token:
    # Path to token file (relative to project root)
    # Use {project-root} variable for portability
    token_file: "{project-root}/.bmad-token"

    # Token validity period in hours
    # After this, user must regenerate token
    max_age_hours: 168  # 7 days

    # Auto-refresh token if within this many hours of expiration
    refresh_threshold_hours: 24

  # ---------------------------------------------------------------------------
  # Environment Token Configuration (for automation)
  # ---------------------------------------------------------------------------
  env_token:
    # Environment variable name containing the token
    variable_name: "BMAD_AUTH_TOKEN"

  # ---------------------------------------------------------------------------
  # Session Configuration
  # ---------------------------------------------------------------------------
  session:
    # Session timeout in minutes of inactivity
    timeout_minutes: 480  # 8 hours

    # Allow session refresh on activity
    refresh_on_activity: true

    # Maximum session lifetime regardless of activity
    max_lifetime_hours: 24

  # ---------------------------------------------------------------------------
  # Token Security Settings
  # ---------------------------------------------------------------------------
  security:
    # Token encryption algorithm
    algorithm: "paseto-v4-local"

    # Key derivation for encryption
    # In production, this should be a secure random value
    # stored in environment variable or secret manager
    key_source: "env:BMAD_TOKEN_KEY"
    key_source_fallback: "file:{project-root}/.bmad-key"

    # Require specific claims in token
    required_claims:
      - "sub"   # Subject (user ID)
      - "name"  # Display name
      - "roles" # User roles
      - "exp"   # Expiration

    # Allowed roles (tokens with other roles are rejected)
    allowed_roles:
      - "admin"
      - "security_lead"
      - "security_analyst"
      - "intel_analyst"
      - "developer"
      - "product_manager"
      - "viewer"
      - "guest"

# =============================================================================
# ROLE DEFINITIONS (for token generation)
# =============================================================================
roles:
  admin:
    description: "Full system administrator"
    default_modules: ["*"]

  security_lead:
    description: "Security team lead"
    default_modules: ["cybersec-team", "intel-team", "core"]

  security_analyst:
    description: "Security analyst"
    default_modules: ["cybersec-team"]

  intel_analyst:
    description: "Intelligence analyst"
    default_modules: ["intel-team"]
    requires_verification: true

  developer:
    description: "Software developer"
    default_modules: ["bmm", "bmgd", "bmb", "cis"]

  product_manager:
    description: "Product manager"
    default_modules: ["bmm", "cis"]

  viewer:
    description: "Read-only access"
    default_modules: ["core"]

  guest:
    description: "Limited guest access"
    default_modules: ["core"]
```

---

#### Step 2: Create Token Generation Utility

**File:** `_bmad/core/security/generate-token.ts`

```typescript
/**
 * BMAD Token Generation Utility
 *
 * Generates PASETO tokens for BMAD authentication.
 * Run this to create a new authentication token.
 *
 * Usage:
 *   npx ts-node generate-token.ts --name "J" --email "j@example.com" --roles admin
 */

import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

// ============================================================================
// Types
// ============================================================================

interface TokenClaims {
  sub: string;      // Subject (unique user ID)
  name: string;     // Display name
  email?: string;   // Email address
  roles: string[];  // User roles
  modules: string[]; // Accessible modules
  iat: string;      // Issued at
  exp: string;      // Expiration
  jti: string;      // Unique token ID
}

interface GeneratedToken {
  token: string;
  claims: TokenClaims;
  expiresAt: Date;
}

// ============================================================================
// PASETO-like Token Implementation
// ============================================================================
// Note: In production, use the actual PASETO library.
// This is a simplified implementation for demonstration.

class TokenGenerator {
  private key: Buffer;

  constructor(key: Buffer) {
    if (key.length !== 32) {
      throw new Error('Key must be 32 bytes for AES-256');
    }
    this.key = key;
  }

  /**
   * Generate encryption key from password or create new random key
   */
  static generateKey(password?: string): Buffer {
    if (password) {
      // Derive key from password using PBKDF2
      return crypto.pbkdf2Sync(password, 'bmad-salt', 100000, 32, 'sha256');
    }
    // Generate random key
    return crypto.randomBytes(32);
  }

  /**
   * Encrypt and encode token
   */
  encrypt(claims: TokenClaims): string {
    const plaintext = JSON.stringify(claims);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', this.key, iv);

    let encrypted = cipher.update(plaintext, 'utf8');
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    const authTag = cipher.getAuthTag();

    // Combine: version + iv + authTag + encrypted
    const version = Buffer.from('v4.local.');
    const combined = Buffer.concat([iv, authTag, encrypted]);

    return 'v4.local.' + combined.toString('base64url');
  }

  /**
   * Decrypt and validate token
   */
  decrypt(token: string): TokenClaims | null {
    try {
      if (!token.startsWith('v4.local.')) {
        return null;
      }

      const encoded = token.slice('v4.local.'.length);
      const combined = Buffer.from(encoded, 'base64url');

      const iv = combined.slice(0, 16);
      const authTag = combined.slice(16, 32);
      const encrypted = combined.slice(32);

      const decipher = crypto.createDecipheriv('aes-256-gcm', this.key, iv);
      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(encrypted);
      decrypted = Buffer.concat([decrypted, decipher.final()]);

      const claims = JSON.parse(decrypted.toString('utf8')) as TokenClaims;

      // Validate expiration
      if (new Date(claims.exp) < new Date()) {
        return null;
      }

      return claims;
    } catch {
      return null;
    }
  }

  /**
   * Generate a new token with the given claims
   */
  generateToken(
    name: string,
    email: string | undefined,
    roles: string[],
    modules: string[],
    expiresInHours: number = 168
  ): GeneratedToken {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + expiresInHours * 60 * 60 * 1000);

    const claims: TokenClaims = {
      sub: crypto.randomUUID(),
      name,
      email,
      roles,
      modules,
      iat: now.toISOString(),
      exp: expiresAt.toISOString(),
      jti: crypto.randomUUID()
    };

    const token = this.encrypt(claims);

    return { token, claims, expiresAt };
  }
}

// ============================================================================
// Interactive Token Generation
// ============================================================================

async function interactiveGeneration(): Promise<void> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = (prompt: string): Promise<string> => {
    return new Promise(resolve => rl.question(prompt, resolve));
  };

  console.log('\n╔══════════════════════════════════════════════════════════════════╗');
  console.log('║              BMAD Authentication Token Generator                  ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝\n');

  // Gather user information
  const name = await question('Enter your name: ');
  const email = await question('Enter your email (optional): ');

  console.log('\nAvailable roles:');
  console.log('  1. admin           - Full system access');
  console.log('  2. security_lead   - Security team lead');
  console.log('  3. security_analyst - Security analyst');
  console.log('  4. intel_analyst   - Intelligence analyst');
  console.log('  5. developer       - Software developer');
  console.log('  6. product_manager - Product manager');
  console.log('  7. viewer          - Read-only access');

  const roleInput = await question('\nEnter role numbers (comma-separated, e.g., 1,5): ');

  const roleMap: Record<string, string> = {
    '1': 'admin',
    '2': 'security_lead',
    '3': 'security_analyst',
    '4': 'intel_analyst',
    '5': 'developer',
    '6': 'product_manager',
    '7': 'viewer'
  };

  const roles = roleInput.split(',')
    .map(s => s.trim())
    .filter(s => roleMap[s])
    .map(s => roleMap[s]);

  if (roles.length === 0) {
    roles.push('viewer');
  }

  // Determine modules based on roles
  const moduleMap: Record<string, string[]> = {
    'admin': ['*'],
    'security_lead': ['cybersec-team', 'intel-team', 'core'],
    'security_analyst': ['cybersec-team', 'core'],
    'intel_analyst': ['intel-team', 'core'],
    'developer': ['bmm', 'bmgd', 'bmb', 'cis', 'core'],
    'product_manager': ['bmm', 'cis', 'core'],
    'viewer': ['core']
  };

  const modules = [...new Set(roles.flatMap(r => moduleMap[r] || ['core']))];

  const expiresHours = await question('\nToken validity in hours (default 168 = 7 days): ');
  const hours = parseInt(expiresHours) || 168;

  rl.close();

  // Generate or load key
  const keyPath = path.join(process.cwd(), '.bmad-key');
  let key: Buffer;

  if (fs.existsSync(keyPath)) {
    key = fs.readFileSync(keyPath);
    console.log('\n✓ Using existing encryption key');
  } else {
    key = TokenGenerator.generateKey();
    fs.writeFileSync(keyPath, key);
    fs.chmodSync(keyPath, 0o600);
    console.log('\n✓ Generated new encryption key: .bmad-key');
  }

  // Generate token
  const generator = new TokenGenerator(key);
  const result = generator.generateToken(
    name,
    email || undefined,
    roles,
    modules,
    hours
  );

  // Save token
  const tokenPath = path.join(process.cwd(), '.bmad-token');
  fs.writeFileSync(tokenPath, result.token);
  fs.chmodSync(tokenPath, 0o600);

  console.log('\n╔══════════════════════════════════════════════════════════════════╗');
  console.log('║                    Token Generated Successfully                   ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝');
  console.log(`\n  Name:    ${result.claims.name}`);
  console.log(`  Email:   ${result.claims.email || '(not set)'}`);
  console.log(`  Roles:   ${result.claims.roles.join(', ')}`);
  console.log(`  Modules: ${result.claims.modules.join(', ')}`);
  console.log(`  Expires: ${result.expiresAt.toISOString()}`);
  console.log(`\n  Token saved to: ${tokenPath}`);
  console.log('\n  You can now use BMAD with authenticated access.\n');
}

// ============================================================================
// CLI Entry Point
// ============================================================================

if (require.main === module) {
  interactiveGeneration().catch(console.error);
}

export { TokenGenerator, TokenClaims, GeneratedToken };
```

---

#### Step 3: Create Session Manager

**File:** `_bmad/core/security/session-manager.ts`

```typescript
/**
 * BMAD Session Manager
 *
 * Manages authenticated sessions for the BMAD framework.
 * Provides session creation, validation, and user context.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { TokenGenerator, TokenClaims } from './generate-token';

// ============================================================================
// Types
// ============================================================================

export interface Session {
  id: string;
  userId: string;
  userName: string;
  email?: string;
  roles: string[];
  modules: string[];
  createdAt: Date;
  lastActivity: Date;
  expiresAt: Date;
}

export interface AuthenticationResult {
  success: boolean;
  session?: Session;
  error?: string;
  requiresAction?: 'generate_token' | 'refresh_token';
}

export interface UserContext {
  authenticated: boolean;
  userId?: string;
  userName?: string;
  roles?: string[];
  modules?: string[];
  sessionId?: string;
}

// ============================================================================
// Session Manager
// ============================================================================

export class SessionManager {
  private sessions: Map<string, Session> = new Map();
  private tokenGenerator: TokenGenerator;
  private config: {
    tokenPath: string;
    keyPath: string;
    timeoutMinutes: number;
    maxLifetimeHours: number;
  };

  constructor(projectRoot: string) {
    this.config = {
      tokenPath: path.join(projectRoot, '.bmad-token'),
      keyPath: path.join(projectRoot, '.bmad-key'),
      timeoutMinutes: 480,  // 8 hours
      maxLifetimeHours: 24
    };

    // Initialize token generator if key exists
    if (fs.existsSync(this.config.keyPath)) {
      const key = fs.readFileSync(this.config.keyPath);
      this.tokenGenerator = new TokenGenerator(key);
    }
  }

  /**
   * Authenticate user from token file
   */
  authenticate(): AuthenticationResult {
    // Check if key exists
    if (!fs.existsSync(this.config.keyPath)) {
      return {
        success: false,
        error: 'Authentication key not found. Run token generator first.',
        requiresAction: 'generate_token'
      };
    }

    // Check if token exists
    if (!fs.existsSync(this.config.tokenPath)) {
      return {
        success: false,
        error: 'Authentication token not found. Run token generator first.',
        requiresAction: 'generate_token'
      };
    }

    // Read and validate token
    const token = fs.readFileSync(this.config.tokenPath, 'utf-8').trim();
    const claims = this.tokenGenerator.decrypt(token);

    if (!claims) {
      return {
        success: false,
        error: 'Token is invalid or expired. Generate a new token.',
        requiresAction: 'generate_token'
      };
    }

    // Check if token is expiring soon (within 24 hours)
    const expiresAt = new Date(claims.exp);
    const hoursUntilExpiry = (expiresAt.getTime() - Date.now()) / (1000 * 60 * 60);

    if (hoursUntilExpiry < 24) {
      console.warn(`\n⚠️  Your authentication token expires in ${Math.round(hoursUntilExpiry)} hours.`);
      console.warn('   Consider generating a new token soon.\n');
    }

    // Create session
    const session = this.createSession(claims);

    return {
      success: true,
      session
    };
  }

  /**
   * Create a new session from validated claims
   */
  private createSession(claims: TokenClaims): Session {
    const now = new Date();
    const session: Session = {
      id: crypto.randomUUID(),
      userId: claims.sub,
      userName: claims.name,
      email: claims.email,
      roles: claims.roles,
      modules: claims.modules,
      createdAt: now,
      lastActivity: now,
      expiresAt: new Date(now.getTime() + this.config.timeoutMinutes * 60 * 1000)
    };

    this.sessions.set(session.id, session);
    return session;
  }

  /**
   * Get existing session by ID
   */
  getSession(sessionId: string): Session | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    // Check session expiration
    if (session.expiresAt < new Date()) {
      this.sessions.delete(sessionId);
      return null;
    }

    // Check max lifetime
    const lifetimeHours = (Date.now() - session.createdAt.getTime()) / (1000 * 60 * 60);
    if (lifetimeHours > this.config.maxLifetimeHours) {
      this.sessions.delete(sessionId);
      return null;
    }

    // Update last activity and extend expiration
    session.lastActivity = new Date();
    session.expiresAt = new Date(Date.now() + this.config.timeoutMinutes * 60 * 1000);

    return session;
  }

  /**
   * Get user context for current session
   */
  getUserContext(sessionId: string): UserContext {
    const session = this.getSession(sessionId);

    if (!session) {
      return { authenticated: false };
    }

    return {
      authenticated: true,
      userId: session.userId,
      userName: session.userName,
      roles: session.roles,
      modules: session.modules,
      sessionId: session.id
    };
  }

  /**
   * Check if user has required role
   */
  hasRole(sessionId: string, requiredRole: string): boolean {
    const session = this.getSession(sessionId);
    if (!session) return false;

    // Admin has all roles
    if (session.roles.includes('admin')) return true;

    return session.roles.includes(requiredRole);
  }

  /**
   * Check if user has access to module
   */
  hasModuleAccess(sessionId: string, moduleName: string): boolean {
    const session = this.getSession(sessionId);
    if (!session) return false;

    // Wildcard access
    if (session.modules.includes('*')) return true;

    return session.modules.includes(moduleName);
  }

  /**
   * End session
   */
  endSession(sessionId: string): void {
    this.sessions.delete(sessionId);
  }

  /**
   * Get authentication status summary
   */
  getAuthStatus(): {
    keyExists: boolean;
    tokenExists: boolean;
    tokenValid: boolean;
    expiresAt?: Date;
  } {
    const keyExists = fs.existsSync(this.config.keyPath);
    const tokenExists = fs.existsSync(this.config.tokenPath);

    let tokenValid = false;
    let expiresAt: Date | undefined;

    if (keyExists && tokenExists) {
      const token = fs.readFileSync(this.config.tokenPath, 'utf-8').trim();
      const claims = this.tokenGenerator?.decrypt(token);
      if (claims) {
        tokenValid = true;
        expiresAt = new Date(claims.exp);
      }
    }

    return { keyExists, tokenExists, tokenValid, expiresAt };
  }
}

// ============================================================================
// Singleton for Framework Use
// ============================================================================

let _sessionManager: SessionManager | null = null;

export function getSessionManager(projectRoot?: string): SessionManager {
  if (!_sessionManager && projectRoot) {
    _sessionManager = new SessionManager(projectRoot);
  }
  if (!_sessionManager) {
    throw new Error('SessionManager not initialized. Provide projectRoot.');
  }
  return _sessionManager;
}

export { TokenGenerator };
```

---

#### Step 4: Integrate into Agent Activation

**File to Modify:** `_bmad/core/agents/abdul.md` (and all other agent files)

**Add authentication step at the beginning of activation:**

```xml
<activation critical="MANDATORY">
  <!-- NEW: Authentication Step - Must be FIRST -->
  <step n="0" critical="SECURITY">
    🔐 AUTHENTICATION CHECK - BEFORE ANY OTHER STEP:

    1. Check for BMAD session:
       - Look for active session in session manager
       - If active session exists → proceed to step 1

    2. If no active session, authenticate:
       - Read token from {project-root}/.bmad-token
       - Validate token (signature, expiration, claims)

    3. On authentication SUCCESS:
       - Create new session
       - Store in context:
         {authenticated_user_id} = token.sub
         {authenticated_user_name} = token.name
         {authenticated_user_roles} = token.roles
         {authenticated_user_modules} = token.modules
         {session_id} = new session ID
       - Proceed to step 1

    4. On authentication FAILURE:
       - Display authentication error (see error messages below)
       - DO NOT proceed to step 1
       - Guide user to generate token

    ERROR MESSAGES:

    If token file not found:
    ╔══════════════════════════════════════════════════════════════════╗
    ║                  🔐 Authentication Required                       ║
    ╠══════════════════════════════════════════════════════════════════╣
    ║                                                                   ║
    ║  No authentication token found.                                  ║
    ║                                                                   ║
    ║  To create a token, run:                                         ║
    ║  npx ts-node _bmad/core/security/generate-token.ts               ║
    ║                                                                   ║
    ║  This is a one-time setup that creates your identity token.      ║
    ║                                                                   ║
    ╚══════════════════════════════════════════════════════════════════╝

    If token expired:
    ╔══════════════════════════════════════════════════════════════════╗
    ║                  🔐 Token Expired                                 ║
    ╠══════════════════════════════════════════════════════════════════╣
    ║                                                                   ║
    ║  Your authentication token has expired.                          ║
    ║                                                                   ║
    ║  To generate a new token, run:                                   ║
    ║  npx ts-node _bmad/core/security/generate-token.ts               ║
    ║                                                                   ║
    ╚══════════════════════════════════════════════════════════════════╝

    If token invalid:
    ╔══════════════════════════════════════════════════════════════════╗
    ║                  🔐 Invalid Token                                 ║
    ╠══════════════════════════════════════════════════════════════════╣
    ║                                                                   ║
    ║  Your authentication token is invalid or corrupted.              ║
    ║                                                                   ║
    ║  Please generate a new token:                                    ║
    ║  npx ts-node _bmad/core/security/generate-token.ts               ║
    ║                                                                   ║
    ╚══════════════════════════════════════════════════════════════════╝
  </step>

  <!-- Existing steps renumbered: 1→2, 2→3, etc. -->
  <step n="1">Load persona from this current agent file (already in context)</step>
  <step n="2">🚨 IMMEDIATE ACTION REQUIRED - BEFORE ANY OUTPUT:
      - Load and read {project-root}/_bmad/core/config.yaml NOW
      ...
  </step>
  ...
</activation>
```

---

### 3.4 User Experience Impact

#### First-Time Setup

**What Users See:**

```
User: /bmad:core:agents:abdul

╔══════════════════════════════════════════════════════════════════╗
║                  🔐 Authentication Required                       ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  Welcome to BMAD! Authentication is required for security.       ║
║                                                                   ║
║  To create your identity token, run:                             ║
║  npx ts-node _bmad/core/security/generate-token.ts               ║
║                                                                   ║
║  This is a one-time setup (token valid for 7 days by default).   ║
║                                                                   ║
╚══════════════════════════════════════════════════════════════════╝
```

**User runs token generator:**

```
$ npx ts-node _bmad/core/security/generate-token.ts

╔══════════════════════════════════════════════════════════════════╗
║              BMAD Authentication Token Generator                  ║
╚══════════════════════════════════════════════════════════════════╝

Enter your name: J
Enter your email (optional): j@example.com

Available roles:
  1. admin           - Full system access
  2. security_lead   - Security team lead
  3. security_analyst - Security analyst
  4. intel_analyst   - Intelligence analyst
  5. developer       - Software developer
  6. product_manager - Product manager
  7. viewer          - Read-only access

Enter role numbers (comma-separated, e.g., 1,5): 1

Token validity in hours (default 168 = 7 days):

✓ Generated new encryption key: .bmad-key

╔══════════════════════════════════════════════════════════════════╗
║                    Token Generated Successfully                   ║
╚══════════════════════════════════════════════════════════════════╝

  Name:    J
  Email:   j@example.com
  Roles:   admin
  Modules: *
  Expires: 2026-01-20T12:00:00.000Z

  Token saved to: .bmad-token

  You can now use BMAD with authenticated access.
```

**Time required:** ~30 seconds one-time setup.

---

#### Normal Session (After Setup)

**What Users See:** Authentication is invisible after setup.

```
User: /bmad:core:agents:abdul

[Authentication happens silently - token valid]

Welcome back, J! I'm Abdul, your Master Project Manager...
```

**Performance Impact:** ~10ms to validate token on first agent activation.

---

#### Token Expiring Soon

**What Users See:**

```
User: /bmad:core:agents:abdul

⚠️  Your authentication token expires in 18 hours.
   Consider generating a new token soon.

Welcome back, J! I'm Abdul...
```

**User can continue working** - this is just a reminder.

---

#### Token Expired

**What Users See:**

```
User: /bmad:core:agents:abdul

╔══════════════════════════════════════════════════════════════════╗
║                  🔐 Token Expired                                 ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  Your authentication token has expired.                          ║
║                                                                   ║
║  To generate a new token, run:                                   ║
║  npx ts-node _bmad/core/security/generate-token.ts               ║
║                                                                   ║
╚══════════════════════════════════════════════════════════════════╝
```

**User regenerates token** (~30 seconds) and retries.

---

### 3.5 Files Summary for Solution 1.2

| File | Action | Description |
|------|--------|-------------|
| `_bmad/core/security/auth-config.yaml` | CREATE | Authentication configuration |
| `_bmad/core/security/generate-token.ts` | CREATE | Token generation utility |
| `_bmad/core/security/session-manager.ts` | CREATE | Session management module |
| `_bmad/core/agents/abdul.md` | MODIFY | Add authentication step |
| `_bmad/core/agents/bmad-master.md` | MODIFY | Add authentication step |
| All other agent files (98+) | MODIFY | Add authentication step |
| `.bmad-token` | CREATE (by user) | User's authentication token |
| `.bmad-key` | CREATE (by user) | Encryption key for tokens |
| `.gitignore` | MODIFY | Add `.bmad-token` and `.bmad-key` |

---

## 4. Solution 1.3: YOLO Mode Restrictions

### 4.1 Problem Statement

**Current State:**
- YOLO mode bypasses ALL user confirmations
- Any workflow can be invoked with YOLO mode
- No logging of YOLO invocations
- No restrictions on when YOLO can be used

**Risk Scenario:**
```
1. Attacker creates malicious workflow
2. Invokes with YOLO mode
3. All steps execute without user review
4. Malicious actions complete undetected
```

### 4.2 Proposed Solution: Restricted YOLO Mode

**Changes:**
1. YOLO mode disabled by default
2. Requires explicit configuration to enable
3. All YOLO invocations logged with warning level
4. Whitelist of workflows allowed to use YOLO

### 4.3 Detailed Implementation

#### Step 1: Add YOLO Configuration

**File to Modify:** `_bmad/core/config.yaml`

```yaml
# Add to security section
security:
  # ... (file_integrity settings from earlier) ...

  # ---------------------------------------------------------------------------
  # YOLO Mode Configuration
  # ---------------------------------------------------------------------------
  yolo_mode:
    # Enable/disable YOLO mode entirely (default: false)
    enabled: false

    # Require explicit command-line flag to use YOLO
    # Even if enabled, user must pass --yolo-confirm-unsafe
    require_explicit_flag: true

    # Log all YOLO invocations (always true, cannot be disabled)
    log_invocations: true

    # Workflows allowed to use YOLO mode
    # Empty list = none allowed (safest)
    # Use "*" for all (not recommended)
    allowed_workflows: []
    # Example allowing specific workflows:
    # allowed_workflows:
    #   - "create-story"
    #   - "sprint-planning"

    # Show warning banner when YOLO mode is active
    show_warning_banner: true
```

---

#### Step 2: Modify Workflow Engine

**File to Modify:** `_bmad/core/tasks/workflow.xml`

**Add YOLO mode check:**

```xml
<!-- Add after integrity and authentication checks -->
<security-directive id="yolo-restriction" mandatory="true" order="2">
  <description>
    Restrict YOLO mode to prevent security bypass.
    YOLO mode skips user confirmations - must be explicitly allowed.
  </description>

  <pre-execution-check>
    When workflow requests YOLO mode:

    1. Check if YOLO is enabled in config:
       - If security.yolo_mode.enabled = false → BLOCK

    2. Check if explicit flag provided:
       - If require_explicit_flag = true AND no --yolo-confirm-unsafe → BLOCK

    3. Check if workflow is in allowed list:
       - If allowed_workflows is empty → BLOCK
       - If workflow not in allowed_workflows → BLOCK

    4. If all checks pass:
       - Log YOLO invocation at WARNING level
       - Show warning banner if configured
       - Proceed with YOLO execution
  </pre-execution-check>

  <on-yolo-blocked>
    ╔══════════════════════════════════════════════════════════════════╗
    ║                  ⚠️  YOLO Mode Not Available                      ║
    ╠══════════════════════════════════════════════════════════════════╣
    ║                                                                   ║
    ║  YOLO mode is restricted for security.                           ║
    ║                                                                   ║
    ║  Reason: {block_reason}                                          ║
    ║                                                                   ║
    ║  YOLO mode skips all user confirmations, which could allow       ║
    ║  unreviewed execution of potentially harmful operations.         ║
    ║                                                                   ║
    ║  Options:                                                         ║
    ║  1. Run without YOLO mode (recommended)                          ║
    ║  2. Contact admin to enable YOLO for this workflow               ║
    ║                                                                   ║
    ╚══════════════════════════════════════════════════════════════════╝
  </on-yolo-blocked>

  <on-yolo-active>
    ╔══════════════════════════════════════════════════════════════════╗
    ║              ⚠️  YOLO MODE ACTIVE - USE WITH CAUTION              ║
    ╠══════════════════════════════════════════════════════════════════╣
    ║                                                                   ║
    ║  User confirmations are DISABLED for this workflow.              ║
    ║  All steps will execute automatically.                           ║
    ║                                                                   ║
    ║  Workflow: {workflow_name}                                       ║
    ║  User: {authenticated_user_name}                                 ║
    ║  Time: {timestamp}                                               ║
    ║                                                                   ║
    ╚══════════════════════════════════════════════════════════════════╝
  </on-yolo-active>
</security-directive>
```

---

### 4.4 User Experience Impact

#### YOLO Mode Disabled (Default)

**What Users See:**

```
User: Run workflow in YOLO mode

╔══════════════════════════════════════════════════════════════════╗
║                  ⚠️  YOLO Mode Not Available                      ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  YOLO mode is restricted for security.                           ║
║                                                                   ║
║  Reason: YOLO mode is disabled in configuration                  ║
║                                                                   ║
║  Options:                                                         ║
║  1. Run without YOLO mode (recommended)                          ║
║  2. Contact admin to enable YOLO for this workflow               ║
║                                                                   ║
╚══════════════════════════════════════════════════════════════════╝
```

**User continues without YOLO** - confirmations appear as normal.

---

#### YOLO Mode Enabled for Specific Workflow

**What Users See:**

```
User: Run create-story in YOLO mode

╔══════════════════════════════════════════════════════════════════╗
║              ⚠️  YOLO MODE ACTIVE - USE WITH CAUTION              ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  User confirmations are DISABLED for this workflow.              ║
║  All steps will execute automatically.                           ║
║                                                                   ║
║  Workflow: create-story                                          ║
║  User: J                                                         ║
║  Time: 2026-01-13T12:00:00Z                                      ║
║                                                                   ║
╚══════════════════════════════════════════════════════════════════╝

[Workflow executes without confirmations]
```

---

### 4.5 Files Summary for Solution 1.3

| File | Action | Description |
|------|--------|-------------|
| `_bmad/core/config.yaml` | MODIFY | Add yolo_mode configuration |
| `_bmad/core/tasks/workflow.xml` | MODIFY | Add YOLO restriction directive |

---

## 5. Implementation Order & Dependencies

### Dependency Graph

```
                    ┌─────────────────┐
                    │   1.3 YOLO      │
                    │  Restrictions   │
                    └────────┬────────┘
                             │ (no dependencies)
                             ▼
┌─────────────────┐   ┌─────────────────┐
│ 1.1 File        │   │                 │
│ Integrity       │◀──│  Can implement  │
└────────┬────────┘   │   in parallel   │
         │            │                 │
         ▼            └────────┬────────┘
┌─────────────────┐            │
│ 1.2 Auth        │◀───────────┘
│ (depends on 1.1)│
└─────────────────┘
```

### Recommended Implementation Order

| Order | Solution | Duration | Prerequisites |
|-------|----------|----------|---------------|
| 1 | 1.3 YOLO Restrictions | 1 day | None |
| 2 | 1.1 File Integrity | 5 days | None (can parallel with 1.3) |
| 3 | 1.2 Authentication | 5 days | 1.1 complete (tokens should be signed) |

### Week-by-Week Schedule

**Week 1:**
- Day 1-2: Implement 1.3 YOLO restrictions (quick win)
- Day 1-3: Create GPG key pair and signing script (1.1)
- Day 3-5: Implement integrity verifier module (1.1)

**Week 2:**
- Day 1-2: Integrate integrity check into workflow.xml (1.1)
- Day 2-3: Sign all framework files (1.1)
- Day 3-5: Implement authentication system (1.2)

**Week 3:**
- Day 1-2: Complete session manager (1.2)
- Day 3-4: Update all agent files with auth step (1.2)
- Day 5: Testing and documentation

---

## 6. Files Requiring Updates

### Complete File Inventory

#### New Files to Create

| File | Solution | Size Est. | Purpose |
|------|----------|-----------|---------|
| `_bmad/core/security/bmad-public-key.asc` | 1.1 | 3 KB | GPG public key |
| `_bmad/core/security/sign-files.sh` | 1.1 | 2 KB | Signing script |
| `_bmad/core/security/integrity-verifier.ts` | 1.1 | 8 KB | Verification module |
| `_bmad/core/security/auth-config.yaml` | 1.2 | 3 KB | Auth configuration |
| `_bmad/core/security/generate-token.ts` | 1.2 | 6 KB | Token generator |
| `_bmad/core/security/session-manager.ts` | 1.2 | 5 KB | Session management |
| `*.asc` (1,359 files) | 1.1 | ~500 KB | Signature files |

#### Files to Modify

| File | Solution | Changes |
|------|----------|---------|
| `_bmad/core/config.yaml` | 1.1, 1.2, 1.3 | Add security section |
| `_bmad/core/tasks/workflow.xml` | 1.1, 1.3 | Add security directives |
| `_bmad/core/agents/abdul.md` | 1.2 | Add auth step |
| `_bmad/core/agents/bmad-master.md` | 1.2 | Add auth step |
| All agent files (98+) | 1.2 | Add auth step |
| `.gitignore` | 1.2 | Add .bmad-token, .bmad-key |

---

## 7. Testing & Validation

### Test Cases for Solution 1.1 (File Integrity)

| Test | Expected Result |
|------|-----------------|
| Load signed file | Passes silently |
| Load unsigned file (strict mode) | Blocks with clear error |
| Load unsigned file (warn mode) | Warning, continues |
| Load tampered signed file | Blocks with CRITICAL alert |
| Load file signed by untrusted key | Blocks with warning |
| Run signing script | All files get .asc signatures |
| Verify all framework files | All pass (after signing) |

### Test Cases for Solution 1.2 (Authentication)

| Test | Expected Result |
|------|-----------------|
| First-time user, no token | Prompts to generate |
| Generate token interactively | Token created, saved |
| Activate agent with valid token | Creates session, proceeds |
| Activate agent with expired token | Blocks, prompts regenerate |
| Activate agent with invalid token | Blocks, prompts regenerate |
| Session timeout after inactivity | Requires re-auth |
| Token expiring soon | Shows warning, continues |

### Test Cases for Solution 1.3 (YOLO Restrictions)

| Test | Expected Result |
|------|-----------------|
| YOLO with disabled config | Blocks with explanation |
| YOLO without explicit flag | Blocks if flag required |
| YOLO on non-allowed workflow | Blocks with explanation |
| YOLO on allowed workflow | Shows warning, proceeds |
| Check audit log after YOLO | Contains YOLO warning entry |

---

## Summary

### Solution Comparison

| Solution | User Friction | Security Value | Implementation Effort |
|----------|---------------|----------------|----------------------|
| 1.1 File Integrity | Very Low | Very High | Medium |
| 1.2 Authentication | Medium (one-time) | Very High | High |
| 1.3 YOLO Restrictions | Very Low | Medium | Low |

### Quick Reference

**To enable file signing:**
```bash
# Generate key (one-time)
gpg --batch --gen-key < key-params.txt

# Sign all files
./_bmad/core/security/sign-files.sh
```

**To create authentication token:**
```bash
npx ts-node _bmad/core/security/generate-token.ts
```

**To enable YOLO for specific workflow:**
```yaml
# In config.yaml
security:
  yolo_mode:
    enabled: true
    allowed_workflows:
      - "create-story"
```

---

*End of Phase 1 Detailed Implementation Guide*
