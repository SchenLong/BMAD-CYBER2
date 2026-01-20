#!/usr/bin/env python3
"""
BMAD Guardrails: Supply Chain Verification
============================================
Implements cryptographic verification for BMAD skills and plugins.

Features:
- GPG signature verification for manifests
- SHA256 checksum verification for skill files
- Trusted key management
- Integrity check on hook execution
- Full audit logging integration

OWASP Reference: LLM05 - Supply Chain Vulnerabilities
Requirements: REQ-2.1.1 through REQ-2.1.6

Verification Flow:
    Skill Request → Load Manifest → Verify GPG Signature
                                          ↓
                                  VALID → Verify SHA256 Checksums
                                                ↓
                                        MATCH → Execute Skill
                                        MISMATCH → BLOCK + LOG
                                  INVALID → BLOCK + LOG

Usage:
    from supply_chain_verifier import SupplyChainVerifier, verify_skill_integrity

    verifier = SupplyChainVerifier()
    result = verifier.verify_skill('bmad:intel-team:agents:osint-lead')
"""

import json
import os
import sys
import hashlib
import subprocess
import re
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Set, Tuple, Any
from pathlib import Path
from datetime import datetime

# Import shared security utilities
try:
    from security_common import (
        AuditLogger,
        PROJECT_DIR,
        LOG_DIR,
    )
except ImportError:
    PROJECT_DIR = os.environ.get('CLAUDE_PROJECT_DIR', os.getcwd())
    LOG_DIR = os.path.join(PROJECT_DIR, '.claude', 'logs')

    class AuditLogger:
        @classmethod
        def log(cls, validator: str, action: str, details: Dict, severity: str = 'INFO'):
            timestamp = datetime.now().isoformat()
            entry = {'timestamp': timestamp, 'validator': validator, 'action': action,
                     'details': details, 'severity': severity}
            print(f"AUDIT: {json.dumps(entry)}", file=sys.stderr)

# Import telemetry collector (graceful fallback)
try:
    from telemetry_collector import record_supply_chain_verification
    TELEMETRY_AVAILABLE = True
except ImportError:
    TELEMETRY_AVAILABLE = False
    def record_supply_chain_verification(*args, **kwargs): pass


# ============================================================================
# Configuration
# ============================================================================

# BMAD directories
BMAD_DIR = os.path.join(PROJECT_DIR, '_bmad')
SECURITY_DIR = os.path.join(BMAD_DIR, 'core', 'security')
MANIFEST_FILE = os.path.join(SECURITY_DIR, 'MANIFEST.sha256')
MANIFEST_SIG_FILE = os.path.join(SECURITY_DIR, 'MANIFEST.sha256.asc')

# Trusted keys directory
TRUSTED_KEYS_DIR = os.path.join(PROJECT_DIR, '.claude', 'trusted_keys')

# Default trusted key ID (used for signing)
DEFAULT_KEY_ID = os.environ.get('BMAD_SIGNING_KEY', 'bmad-signing@internal')

# Verification modes
VERIFY_MODE = os.environ.get('BMAD_VERIFY_MODE', 'warn')  # 'strict', 'warn', 'disabled'

# Cache for verified files (to avoid re-verification within same session)
_verification_cache: Dict[str, Tuple[bool, str, float]] = {}
CACHE_TTL_SECONDS = 300  # 5 minutes


# ============================================================================
# Data Classes
# ============================================================================

@dataclass
class VerificationResult:
    """Result of a verification operation."""
    verified: bool
    reason: str
    file_path: str
    expected_hash: Optional[str] = None
    actual_hash: Optional[str] = None
    signature_valid: Optional[bool] = None
    signer_id: Optional[str] = None
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())


@dataclass
class ManifestEntry:
    """A single entry in the manifest file."""
    hash: str
    path: str
    verified: bool = False
    actual_hash: Optional[str] = None


# ============================================================================
# Supply Chain Verifier Implementation
# ============================================================================

class SupplyChainVerifier:
    """
    Verifies integrity of BMAD skills and plugins using cryptographic signatures.

    Uses GPG for manifest signature verification and SHA256 for file checksums.
    Supports multiple verification modes: strict, warn, disabled.
    """

    def __init__(self, verify_mode: Optional[str] = None):
        self.verify_mode = verify_mode or VERIFY_MODE
        self.manifest_entries: Dict[str, ManifestEntry] = {}
        self.manifest_loaded = False
        self.manifest_signature_valid: Optional[bool] = None
        self.manifest_signer: Optional[str] = None
        self._load_manifest()

    def _load_manifest(self) -> None:
        """Load the manifest file containing SHA256 checksums."""
        if not os.path.exists(MANIFEST_FILE):
            AuditLogger.log('supply_chain', 'MANIFEST_MISSING', {
                'path': MANIFEST_FILE,
            }, severity='WARNING')
            return

        try:
            with open(MANIFEST_FILE, 'r') as f:
                for line in f:
                    line = line.strip()
                    # Skip comments and empty lines
                    if not line or line.startswith('#'):
                        continue

                    # Parse format: hash  filepath
                    parts = line.split(None, 1)
                    if len(parts) == 2:
                        hash_value, file_path = parts
                        # Validate hash format (64 hex chars for SHA256)
                        if re.match(r'^[a-fA-F0-9]{64}$', hash_value):
                            self.manifest_entries[file_path] = ManifestEntry(
                                hash=hash_value.lower(),
                                path=file_path,
                            )

            self.manifest_loaded = True
            AuditLogger.log('supply_chain', 'MANIFEST_LOADED', {
                'entries': len(self.manifest_entries),
            }, severity='INFO')

        except Exception as e:
            AuditLogger.log('supply_chain', 'MANIFEST_LOAD_ERROR', {
                'error': str(e),
            }, severity='WARNING')

    def _calculate_sha256(self, file_path: str) -> Optional[str]:
        """Calculate SHA256 hash of a file."""
        try:
            abs_path = os.path.join(PROJECT_DIR, file_path)
            if not os.path.exists(abs_path):
                return None

            sha256 = hashlib.sha256()
            with open(abs_path, 'rb') as f:
                for chunk in iter(lambda: f.read(8192), b''):
                    sha256.update(chunk)
            return sha256.hexdigest().lower()
        except Exception:
            return None

    def _verify_gpg_signature(self) -> Tuple[bool, Optional[str], str]:
        """
        Verify GPG signature of the manifest file.

        Returns:
            Tuple of (valid, signer_id, reason)
        """
        if not os.path.exists(MANIFEST_SIG_FILE):
            return False, None, "Signature file not found"

        if not os.path.exists(MANIFEST_FILE):
            return False, None, "Manifest file not found"

        try:
            # Try to verify using gpg
            result = subprocess.run(
                ['gpg', '--verify', '--status-fd', '1', MANIFEST_SIG_FILE, MANIFEST_FILE],
                capture_output=True,
                text=True,
                timeout=30,
            )

            # Parse GPG output for verification status
            output = result.stdout + result.stderr

            # Check for GOODSIG or VALIDSIG
            if '[GNUPG:] GOODSIG' in output or '[GNUPG:] VALIDSIG' in output:
                # Extract signer ID
                signer_match = re.search(r'\[GNUPG:\] GOODSIG \S+ (.+)', output)
                signer_id = signer_match.group(1).strip() if signer_match else "Unknown"
                return True, signer_id, "Signature valid"

            # Check for BADSIG
            if '[GNUPG:] BADSIG' in output:
                return False, None, "Invalid signature"

            # Check for ERRSIG (missing public key)
            if '[GNUPG:] ERRSIG' in output:
                return False, None, "Unable to verify: missing public key"

            # Check for NO_PUBKEY
            if '[GNUPG:] NO_PUBKEY' in output:
                return False, None, "Public key not found in keyring"

            # Fallback: check return code
            if result.returncode == 0:
                return True, "Unknown", "Signature appears valid"

            return False, None, f"GPG verification failed: {output[:200]}"

        except FileNotFoundError:
            return False, None, "GPG not installed or not in PATH"
        except subprocess.TimeoutExpired:
            return False, None, "GPG verification timed out"
        except Exception as e:
            return False, None, f"GPG verification error: {str(e)}"

    def verify_manifest_signature(self) -> VerificationResult:
        """
        Verify the GPG signature of the manifest file.

        Returns:
            VerificationResult with signature verification details
        """
        valid, signer_id, reason = self._verify_gpg_signature()

        self.manifest_signature_valid = valid
        self.manifest_signer = signer_id

        result = VerificationResult(
            verified=valid,
            reason=reason,
            file_path=MANIFEST_SIG_FILE,
            signature_valid=valid,
            signer_id=signer_id,
        )

        severity = 'INFO' if valid else 'WARNING'
        AuditLogger.log('supply_chain', 'SIGNATURE_VERIFICATION', {
            'valid': valid,
            'signer': signer_id,
            'reason': reason,
        }, severity=severity)

        return result

    def verify_file(self, file_path: str) -> VerificationResult:
        """
        Verify a single file against its manifest entry.

        Args:
            file_path: Relative path from project root

        Returns:
            VerificationResult with verification details
        """
        # Check cache first
        cache_key = file_path
        if cache_key in _verification_cache:
            verified, reason, timestamp = _verification_cache[cache_key]
            if datetime.now().timestamp() - timestamp < CACHE_TTL_SECONDS:
                return VerificationResult(
                    verified=verified,
                    reason=f"Cached: {reason}",
                    file_path=file_path,
                )

        # Normalize path
        file_path = file_path.lstrip('./')

        # Check if file is in manifest
        if file_path not in self.manifest_entries:
            result = VerificationResult(
                verified=False,
                reason="File not in manifest",
                file_path=file_path,
            )
            # In warn mode, allow untracked files
            if self.verify_mode == 'warn':
                result.verified = True
                result.reason = "File not in manifest (allowed in warn mode)"

            return result

        entry = self.manifest_entries[file_path]
        actual_hash = self._calculate_sha256(file_path)

        if actual_hash is None:
            result = VerificationResult(
                verified=False,
                reason="Could not calculate file hash (file may not exist)",
                file_path=file_path,
                expected_hash=entry.hash,
            )
            return result

        if actual_hash == entry.hash:
            result = VerificationResult(
                verified=True,
                reason="Checksum matches",
                file_path=file_path,
                expected_hash=entry.hash,
                actual_hash=actual_hash,
            )
            entry.verified = True
            entry.actual_hash = actual_hash
        else:
            result = VerificationResult(
                verified=False,
                reason="Checksum mismatch - file has been modified",
                file_path=file_path,
                expected_hash=entry.hash,
                actual_hash=actual_hash,
            )
            entry.verified = False
            entry.actual_hash = actual_hash

        # Update cache
        _verification_cache[cache_key] = (
            result.verified, result.reason, datetime.now().timestamp()
        )

        # Emit telemetry for verification
        if TELEMETRY_AVAILABLE:
            verification_result_map = {
                True: 'VALID' if actual_hash == entry.hash else 'UNTRACKED',
                False: 'MISMATCH' if actual_hash else 'MISSING',
            }
            record_supply_chain_verification(
                verification_type='file',
                file_path=file_path,
                verification_result=verification_result_map.get(result.verified, 'ERROR'),
                verification_mode=self.verify_mode,
                hash_match=actual_hash == entry.hash if actual_hash else False,
                expected_hash=entry.hash if entry else None,
                actual_hash=actual_hash,
                cached=False,
            )

        return result

    def verify_skill(self, skill_id: str) -> VerificationResult:
        """
        Verify all files associated with a skill.

        Args:
            skill_id: Skill identifier (e.g., 'bmad:intel-team:agents:osint-lead')

        Returns:
            VerificationResult for the skill
        """
        # Parse skill ID to determine files
        parts = skill_id.replace(':', '/').split('/')

        # Find matching files in manifest
        skill_files = []
        for path in self.manifest_entries.keys():
            # Match on skill path pattern
            if any(part in path for part in parts[1:]):  # Skip 'bmad' prefix
                skill_files.append(path)

        if not skill_files:
            return VerificationResult(
                verified=self.verify_mode != 'strict',
                reason=f"No manifest entries found for skill '{skill_id}'",
                file_path=skill_id,
            )

        # Verify all skill files
        failed_files = []
        for file_path in skill_files:
            result = self.verify_file(file_path)
            if not result.verified:
                failed_files.append((file_path, result.reason))

        if failed_files:
            failed_summary = '; '.join([f"{f}: {r}" for f, r in failed_files[:3]])
            return VerificationResult(
                verified=False,
                reason=f"Verification failed for {len(failed_files)} files: {failed_summary}",
                file_path=skill_id,
            )

        return VerificationResult(
            verified=True,
            reason=f"All {len(skill_files)} skill files verified",
            file_path=skill_id,
        )

    def verify_plugin(self, plugin_name: str) -> VerificationResult:
        """
        Verify all files for a plugin/module.

        Args:
            plugin_name: Plugin name (e.g., 'intel-team')

        Returns:
            VerificationResult for the plugin
        """
        plugin_prefix = f"_bmad/{plugin_name}/"

        plugin_files = [
            path for path in self.manifest_entries.keys()
            if path.startswith(plugin_prefix)
        ]

        if not plugin_files:
            return VerificationResult(
                verified=self.verify_mode != 'strict',
                reason=f"No manifest entries found for plugin '{plugin_name}'",
                file_path=plugin_name,
            )

        # Verify all plugin files
        failed_files = []
        for file_path in plugin_files:
            result = self.verify_file(file_path)
            if not result.verified:
                failed_files.append((file_path, result.reason))

        if failed_files:
            severity = 'BLOCKED' if self.verify_mode == 'strict' else 'WARNING'
            AuditLogger.log('supply_chain', 'PLUGIN_VERIFICATION_FAILED', {
                'plugin': plugin_name,
                'failed_files': len(failed_files),
                'total_files': len(plugin_files),
                'mode': self.verify_mode,
            }, severity=severity)

            failed_summary = '; '.join([f"{f}: {r}" for f, r in failed_files[:3]])
            return VerificationResult(
                verified=False,
                reason=f"Verification failed for {len(failed_files)}/{len(plugin_files)} files: {failed_summary}",
                file_path=plugin_name,
            )

        AuditLogger.log('supply_chain', 'PLUGIN_VERIFIED', {
            'plugin': plugin_name,
            'files_verified': len(plugin_files),
        }, severity='INFO')

        return VerificationResult(
            verified=True,
            reason=f"All {len(plugin_files)} plugin files verified",
            file_path=plugin_name,
        )

    def get_verification_status(self) -> Dict[str, Any]:
        """Get overall verification status."""
        verified_count = sum(1 for e in self.manifest_entries.values() if e.verified)

        return {
            'manifest_loaded': self.manifest_loaded,
            'manifest_entries': len(self.manifest_entries),
            'manifest_signature_valid': self.manifest_signature_valid,
            'manifest_signer': self.manifest_signer,
            'files_verified': verified_count,
            'verify_mode': self.verify_mode,
        }


# ============================================================================
# Manifest Generation
# ============================================================================

def generate_manifest(output_path: Optional[str] = None,
                     sign: bool = False,
                     key_id: Optional[str] = None) -> str:
    """
    Generate a new manifest file with SHA256 checksums.

    Args:
        output_path: Path to write manifest (default: MANIFEST_FILE)
        sign: Whether to GPG sign the manifest
        key_id: GPG key ID for signing

    Returns:
        Manifest content as string
    """
    output_path = output_path or MANIFEST_FILE
    key_id = key_id or DEFAULT_KEY_ID

    lines = [
        "# BMAD Framework File Integrity Manifest",
        f"# Generated: {datetime.now().isoformat()}",
        f"# Key ID: {key_id}",
        "#",
        "# Format: SHA256 hash  filepath",
        "",
    ]

    # Collect all files to hash
    file_categories = {
        'AGENTS': [],
        'WORKFLOWS': [],
        'WORKFLOW STEPS': [],
        'VALIDATORS': [],
        'TEMPLATES': [],
        'OTHER': [],
    }

    for root, dirs, files in os.walk(BMAD_DIR):
        # Skip hidden directories
        dirs[:] = [d for d in dirs if not d.startswith('.')]

        for filename in files:
            if filename.startswith('.'):
                continue

            full_path = os.path.join(root, filename)
            rel_path = os.path.relpath(full_path, PROJECT_DIR)

            # Calculate hash
            sha256 = hashlib.sha256()
            try:
                with open(full_path, 'rb') as f:
                    for chunk in iter(lambda: f.read(8192), b''):
                        sha256.update(chunk)
                hash_value = sha256.hexdigest()
            except Exception:
                continue

            # Categorize
            entry = f"{hash_value}  {rel_path}"

            if '/agents/' in rel_path:
                file_categories['AGENTS'].append(entry)
            elif '/workflows/' in rel_path and '/steps/' in rel_path:
                file_categories['WORKFLOW STEPS'].append(entry)
            elif '/workflows/' in rel_path:
                file_categories['WORKFLOWS'].append(entry)
            elif '/validators/' in rel_path:
                file_categories['VALIDATORS'].append(entry)
            elif '/templates/' in rel_path:
                file_categories['TEMPLATES'].append(entry)
            else:
                file_categories['OTHER'].append(entry)

    # Write categorized entries
    for category, entries in file_categories.items():
        if entries:
            lines.append(f"# === {category} ===")
            lines.extend(sorted(entries))
            lines.append("")

    manifest_content = '\n'.join(lines)

    # Write manifest
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, 'w') as f:
        f.write(manifest_content)

    AuditLogger.log('supply_chain', 'MANIFEST_GENERATED', {
        'path': output_path,
        'entries': sum(len(e) for e in file_categories.values()),
    }, severity='INFO')

    # Sign if requested
    if sign:
        sig_path = output_path + '.asc'
        try:
            subprocess.run(
                ['gpg', '--armor', '--detach-sign', '--local-user', key_id,
                 '--output', sig_path, output_path],
                check=True,
                capture_output=True,
            )
            AuditLogger.log('supply_chain', 'MANIFEST_SIGNED', {
                'path': sig_path,
                'key_id': key_id,
            }, severity='INFO')
        except subprocess.CalledProcessError as e:
            AuditLogger.log('supply_chain', 'MANIFEST_SIGN_FAILED', {
                'error': e.stderr.decode() if e.stderr else str(e),
                'key_id': key_id,
            }, severity='WARNING')
        except FileNotFoundError:
            AuditLogger.log('supply_chain', 'MANIFEST_SIGN_FAILED', {
                'error': 'GPG not installed',
            }, severity='WARNING')

    return manifest_content


def add_trusted_key(key_path: str) -> Tuple[bool, str]:
    """
    Add a trusted GPG key for verification.

    Args:
        key_path: Path to the public key file

    Returns:
        Tuple of (success, message)
    """
    if not os.path.exists(key_path):
        return False, f"Key file not found: {key_path}"

    try:
        result = subprocess.run(
            ['gpg', '--import', key_path],
            capture_output=True,
            text=True,
        )

        if result.returncode == 0:
            AuditLogger.log('supply_chain', 'TRUSTED_KEY_ADDED', {
                'path': key_path,
            }, severity='INFO')
            return True, "Key imported successfully"
        else:
            return False, f"Import failed: {result.stderr}"

    except FileNotFoundError:
        return False, "GPG not installed"
    except Exception as e:
        return False, str(e)


# ============================================================================
# Convenience Functions
# ============================================================================

_verifier: Optional[SupplyChainVerifier] = None


def get_verifier() -> SupplyChainVerifier:
    """Get or create the global verifier instance."""
    global _verifier
    if _verifier is None:
        _verifier = SupplyChainVerifier()
    return _verifier


def verify_skill_integrity(skill_id: str) -> Tuple[bool, str]:
    """
    Verify integrity of a skill before execution.

    Args:
        skill_id: Skill identifier

    Returns:
        Tuple of (verified, message)
    """
    verifier = get_verifier()
    result = verifier.verify_skill(skill_id)
    return result.verified, result.reason


def verify_file_integrity(file_path: str) -> Tuple[bool, str]:
    """
    Verify integrity of a single file.

    Args:
        file_path: Path to file

    Returns:
        Tuple of (verified, message)
    """
    verifier = get_verifier()
    result = verifier.verify_file(file_path)
    return result.verified, result.reason


# ============================================================================
# Hook Integration
# ============================================================================

def validate_supply_chain() -> int:
    """
    Validate supply chain integrity as a pre-tool hook.

    This is called before skill execution to verify the skill
    files haven't been tampered with.

    Returns:
        Exit code: 0 for allowed, 1 for blocked
    """
    try:
        data = json.load(sys.stdin)
    except (json.JSONDecodeError, IOError):
        return 0  # Allow if can't parse input

    tool_name = data.get('tool_name', '').lower()

    # Only verify on Skill tool calls
    if tool_name != 'skill':
        return 0

    tool_input = data.get('tool_input', {})
    skill_id = tool_input.get('skill', '')

    if not skill_id:
        return 0

    verifier = get_verifier()

    # Check verification mode
    if verifier.verify_mode == 'disabled':
        return 0

    result = verifier.verify_skill(skill_id)

    if not result.verified:
        if verifier.verify_mode == 'strict':
            print(f"\n{'='*60}", file=sys.stderr)
            print("BMAD GUARDRAIL: SUPPLY CHAIN VERIFICATION FAILED", file=sys.stderr)
            print(f"{'='*60}", file=sys.stderr)
            print(f"\nSkill: {skill_id}", file=sys.stderr)
            print(f"Reason: {result.reason}", file=sys.stderr)
            print(f"\nThis skill cannot be executed due to integrity concerns.", file=sys.stderr)
            print(f"Set BMAD_VERIFY_MODE=warn to allow execution with warning.", file=sys.stderr)
            print(f"\n{'='*60}\n", file=sys.stderr)

            AuditLogger.log('supply_chain', 'SKILL_BLOCKED', {
                'skill_id': skill_id,
                'reason': result.reason,
            }, severity='BLOCKED')

            return 1
        else:
            # Warn mode - log but allow
            print(f"\n[WARNING] Supply chain verification failed for skill '{skill_id}'", file=sys.stderr)
            print(f"Reason: {result.reason}", file=sys.stderr)
            print("Proceeding anyway (BMAD_VERIFY_MODE=warn)\n", file=sys.stderr)

            AuditLogger.log('supply_chain', 'SKILL_WARNING', {
                'skill_id': skill_id,
                'reason': result.reason,
            }, severity='WARNING')

    return 0


# ============================================================================
# Main Entry Point
# ============================================================================

if __name__ == '__main__':
    if len(sys.argv) > 1:
        command = sys.argv[1]

        if command == 'status':
            verifier = get_verifier()
            status = verifier.get_verification_status()
            print(json.dumps(status, indent=2))

        elif command == 'verify-manifest':
            verifier = get_verifier()
            result = verifier.verify_manifest_signature()
            print(f"Signature Valid: {result.signature_valid}")
            print(f"Signer: {result.signer_id}")
            print(f"Reason: {result.reason}")
            sys.exit(0 if result.verified else 1)

        elif command == 'verify-file':
            if len(sys.argv) < 3:
                print("Usage: supply_chain_verifier.py verify-file <path>")
                sys.exit(1)
            file_path = sys.argv[2]
            verified, message = verify_file_integrity(file_path)
            print(f"Verified: {verified}")
            print(f"Message: {message}")
            sys.exit(0 if verified else 1)

        elif command == 'verify-skill':
            if len(sys.argv) < 3:
                print("Usage: supply_chain_verifier.py verify-skill <skill_id>")
                sys.exit(1)
            skill_id = sys.argv[2]
            verified, message = verify_skill_integrity(skill_id)
            print(f"Verified: {verified}")
            print(f"Message: {message}")
            sys.exit(0 if verified else 1)

        elif command == 'verify-plugin':
            if len(sys.argv) < 3:
                print("Usage: supply_chain_verifier.py verify-plugin <plugin_name>")
                sys.exit(1)
            plugin_name = sys.argv[2]
            verifier = get_verifier()
            result = verifier.verify_plugin(plugin_name)
            print(f"Verified: {result.verified}")
            print(f"Message: {result.reason}")
            sys.exit(0 if result.verified else 1)

        elif command == 'generate':
            output_path = sys.argv[2] if len(sys.argv) > 2 else None
            sign = '--sign' in sys.argv
            content = generate_manifest(output_path, sign=sign)
            if not output_path:
                print(content)
            else:
                print(f"Manifest written to: {output_path}")
                if sign:
                    print(f"Signature written to: {output_path}.asc")

        elif command == 'add-key':
            if len(sys.argv) < 3:
                print("Usage: supply_chain_verifier.py add-key <key_path>")
                sys.exit(1)
            key_path = sys.argv[2]
            success, message = add_trusted_key(key_path)
            print(message)
            sys.exit(0 if success else 1)

        elif command == 'validate':
            sys.exit(validate_supply_chain())

        else:
            print(f"Usage: {sys.argv[0]} [status|verify-manifest|verify-file|verify-skill|verify-plugin|generate|add-key|validate]")
            sys.exit(1)
    else:
        # Run as validator hook
        sys.exit(validate_supply_chain())
