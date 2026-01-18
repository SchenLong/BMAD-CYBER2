#!/usr/bin/env python3
"""
BMAD Guardrails: Cryptographic Audit Log Integrity
===================================================
Implements hash chain verification for tamper detection in audit logs.

Hash Chain Design:
    Entry 1: hash1 = SHA256(timestamp + event + "genesis")
    Entry 2: hash2 = SHA256(timestamp + event + hash1)
    Entry 3: hash3 = SHA256(timestamp + event + hash2)
    ...
    Verification: Recompute chain, compare hashes

Features:
- Hash chain for sequential log entries
- Tamper detection on log read
- Integrity verification command
- Optional GPG signing of log files
- Alert on detected tampering

Configuration:
    BMAD_AUDIT_SIGNING=true|false (default: true)
    BMAD_AUDIT_GPG_KEY=<key_id> (optional, for file-level signing)
    BMAD_AUDIT_ALERT_TAMPERING=true|false (default: true)

Security Note:
    This module provides tamper-evidence, not tamper-prevention.
    An attacker with file access could regenerate the hash chain.
    For stronger guarantees, use external log aggregation with
    remote attestation or blockchain anchoring.
"""

import hashlib
import json
import os
import sys
import time
import fcntl
import subprocess
from datetime import datetime
from pathlib import Path
from typing import Optional, Dict, Any, Tuple, List, NamedTuple

# Configuration
PROJECT_DIR = os.environ.get('CLAUDE_PROJECT_DIR', os.getcwd())
LOG_DIR = os.path.join(PROJECT_DIR, '.claude', 'logs')
CHAIN_STATE_FILE = os.path.join(LOG_DIR, '.chain_state.json')
CHAIN_LOCK_FILE = os.path.join(LOG_DIR, '.chain.lock')
SIGNING_ENABLED = os.environ.get('BMAD_AUDIT_SIGNING', 'true').lower() == 'true'
GPG_KEY_ID = os.environ.get('BMAD_AUDIT_GPG_KEY', '')
ALERT_ON_TAMPERING = os.environ.get('BMAD_AUDIT_ALERT_TAMPERING', 'true').lower() == 'true'
LOCK_TIMEOUT_SECONDS = 5.0

# Genesis block identifier
GENESIS_HASH = 'genesis'
HASH_ALGORITHM = 'sha256'


class ChainEntry(NamedTuple):
    """Represents a single entry in the hash chain."""
    index: int
    timestamp: str
    content_hash: str
    previous_hash: str
    entry_hash: str


class VerificationResult(NamedTuple):
    """Result of chain verification."""
    valid: bool
    entries_checked: int
    first_invalid_index: Optional[int]
    error_message: Optional[str]
    tampering_detected: bool


class HashChainManager:
    """
    Manages cryptographic hash chain for audit log integrity.

    The hash chain provides tamper-evidence by linking each log entry
    to its predecessor through cryptographic hashes. Any modification
    to historical entries will break the chain.
    """

    def __init__(self, log_file: str, state_file: str = CHAIN_STATE_FILE):
        self.log_file = log_file
        self.state_file = state_file
        self._ensure_log_dir()

    def _ensure_log_dir(self) -> None:
        """Ensure log directory exists."""
        os.makedirs(os.path.dirname(self.log_file), exist_ok=True)

    def _acquire_lock(self, timeout: float = LOCK_TIMEOUT_SECONDS) -> int:
        """Acquire exclusive lock for chain operations."""
        os.makedirs(os.path.dirname(CHAIN_LOCK_FILE), exist_ok=True)
        fd = os.open(CHAIN_LOCK_FILE, os.O_CREAT | os.O_RDWR)

        start_time = time.time()
        while True:
            try:
                fcntl.flock(fd, fcntl.LOCK_EX | fcntl.LOCK_NB)
                return fd
            except BlockingIOError:
                if time.time() - start_time > timeout:
                    os.close(fd)
                    raise TimeoutError(f"Could not acquire chain lock within {timeout}s")
                time.sleep(0.01)

    def _release_lock(self, fd: int) -> None:
        """Release exclusive lock."""
        try:
            fcntl.flock(fd, fcntl.LOCK_UN)
        finally:
            os.close(fd)

    def _compute_hash(self, data: str) -> str:
        """Compute SHA256 hash of data."""
        return hashlib.sha256(data.encode('utf-8')).hexdigest()

    def _compute_content_hash(self, entry: Dict[str, Any]) -> str:
        """Compute hash of log entry content (excluding chain fields)."""
        # Remove chain-specific fields for content hash
        content = {k: v for k, v in entry.items()
                   if k not in ('_chain_index', '_previous_hash', '_entry_hash')}
        # Serialize deterministically
        content_str = json.dumps(content, sort_keys=True, separators=(',', ':'))
        return self._compute_hash(content_str)

    def _compute_entry_hash(self, timestamp: str, content_hash: str, previous_hash: str) -> str:
        """Compute the chain hash for an entry."""
        data = f"{timestamp}:{content_hash}:{previous_hash}"
        return self._compute_hash(data)

    def _load_chain_state(self) -> Dict[str, Any]:
        """Load current chain state from file."""
        try:
            if os.path.exists(self.state_file):
                with open(self.state_file, 'r') as f:
                    return json.load(f)
        except Exception:
            pass
        return {
            'last_hash': GENESIS_HASH,
            'entry_count': 0,
            'last_timestamp': None,
            'log_file': self.log_file,
        }

    def _save_chain_state(self, state: Dict[str, Any]) -> None:
        """Save chain state atomically."""
        state['updated_at'] = datetime.now().isoformat()

        # Atomic write via temp file
        temp_file = self.state_file + '.tmp'
        with open(temp_file, 'w') as f:
            json.dump(state, f, indent=2)
        os.rename(temp_file, self.state_file)

    def add_entry(self, log_entry: Dict[str, Any]) -> Dict[str, Any]:
        """
        Add a new entry to the hash chain.

        Args:
            log_entry: The log entry to add (will be modified in place)

        Returns:
            The log entry with chain fields added
        """
        if not SIGNING_ENABLED:
            return log_entry

        lock_fd = None
        try:
            lock_fd = self._acquire_lock()

            state = self._load_chain_state()

            # Compute hashes
            timestamp = log_entry.get('timestamp', datetime.now().isoformat())
            content_hash = self._compute_content_hash(log_entry)
            previous_hash = state['last_hash']
            entry_hash = self._compute_entry_hash(timestamp, content_hash, previous_hash)

            # Add chain fields to entry
            log_entry['_chain_index'] = state['entry_count']
            log_entry['_previous_hash'] = previous_hash
            log_entry['_entry_hash'] = entry_hash

            # Update state
            state['last_hash'] = entry_hash
            state['entry_count'] += 1
            state['last_timestamp'] = timestamp

            self._save_chain_state(state)

            return log_entry

        except TimeoutError:
            # If we can't get the lock, log without chain (degraded mode)
            log_entry['_chain_error'] = 'lock_timeout'
            return log_entry

        finally:
            if lock_fd is not None:
                self._release_lock(lock_fd)

    def verify_chain(self, max_entries: Optional[int] = None) -> VerificationResult:
        """
        Verify the integrity of the hash chain.

        Args:
            max_entries: Maximum entries to verify (None = all)

        Returns:
            VerificationResult with validation status
        """
        if not os.path.exists(self.log_file):
            return VerificationResult(
                valid=True,
                entries_checked=0,
                first_invalid_index=None,
                error_message=None,
                tampering_detected=False
            )

        entries_checked = 0
        expected_previous = GENESIS_HASH

        try:
            with open(self.log_file, 'r') as f:
                for line_num, line in enumerate(f):
                    if max_entries and entries_checked >= max_entries:
                        break

                    line = line.strip()
                    if not line:
                        continue

                    try:
                        entry = json.loads(line)
                    except json.JSONDecodeError:
                        return VerificationResult(
                            valid=False,
                            entries_checked=entries_checked,
                            first_invalid_index=line_num,
                            error_message=f"Invalid JSON at line {line_num + 1}",
                            tampering_detected=True
                        )

                    # Skip entries without chain data (pre-chain or degraded mode)
                    if '_entry_hash' not in entry:
                        continue

                    # Verify chain linkage
                    if entry.get('_previous_hash') != expected_previous:
                        self._handle_tampering_alert(line_num, 'previous_hash_mismatch')
                        return VerificationResult(
                            valid=False,
                            entries_checked=entries_checked,
                            first_invalid_index=line_num,
                            error_message=f"Chain broken at entry {line_num}: previous hash mismatch",
                            tampering_detected=True
                        )

                    # Verify content hash
                    content_hash = self._compute_content_hash(entry)
                    timestamp = entry.get('timestamp', '')
                    computed_hash = self._compute_entry_hash(
                        timestamp, content_hash, entry.get('_previous_hash', '')
                    )

                    if computed_hash != entry.get('_entry_hash'):
                        self._handle_tampering_alert(line_num, 'content_modified')
                        return VerificationResult(
                            valid=False,
                            entries_checked=entries_checked,
                            first_invalid_index=line_num,
                            error_message=f"Entry {line_num} content hash mismatch - content modified",
                            tampering_detected=True
                        )

                    expected_previous = entry['_entry_hash']
                    entries_checked += 1

            return VerificationResult(
                valid=True,
                entries_checked=entries_checked,
                first_invalid_index=None,
                error_message=None,
                tampering_detected=False
            )

        except Exception as e:
            return VerificationResult(
                valid=False,
                entries_checked=entries_checked,
                first_invalid_index=None,
                error_message=f"Verification error: {str(e)}",
                tampering_detected=False
            )

    def _handle_tampering_alert(self, entry_index: int, alert_type: str) -> None:
        """Handle detected tampering by generating alert."""
        if not ALERT_ON_TAMPERING:
            return

        alert_msg = (
            f"\n{'='*60}\n"
            f"SECURITY ALERT: AUDIT LOG TAMPERING DETECTED\n"
            f"{'='*60}\n"
            f"Log file: {self.log_file}\n"
            f"Entry index: {entry_index}\n"
            f"Alert type: {alert_type}\n"
            f"Time: {datetime.now().isoformat()}\n"
            f"{'='*60}\n"
        )
        print(alert_msg, file=sys.stderr)

        # Also write to separate alert log
        alert_log = os.path.join(LOG_DIR, 'tampering_alerts.log')
        try:
            with open(alert_log, 'a') as f:
                fcntl.flock(f.fileno(), fcntl.LOCK_EX)
                f.write(json.dumps({
                    'timestamp': datetime.now().isoformat(),
                    'log_file': self.log_file,
                    'entry_index': entry_index,
                    'alert_type': alert_type,
                }) + '\n')
                fcntl.flock(f.fileno(), fcntl.LOCK_UN)
        except Exception:
            pass

    def get_chain_status(self) -> Dict[str, Any]:
        """Get current chain status and statistics."""
        state = self._load_chain_state()
        verification = self.verify_chain(max_entries=100)  # Quick check

        return {
            'log_file': self.log_file,
            'entry_count': state.get('entry_count', 0),
            'last_timestamp': state.get('last_timestamp'),
            'last_hash': state.get('last_hash', GENESIS_HASH)[:16] + '...',
            'signing_enabled': SIGNING_ENABLED,
            'chain_valid': verification.valid,
            'entries_verified': verification.entries_checked,
            'tampering_detected': verification.tampering_detected,
        }

    def sign_log_file_gpg(self) -> Tuple[bool, str]:
        """
        Create detached GPG signature for the log file.

        Returns:
            Tuple of (success, message)
        """
        if not GPG_KEY_ID:
            return False, "No GPG key configured (set BMAD_AUDIT_GPG_KEY)"

        if not os.path.exists(self.log_file):
            return False, "Log file does not exist"

        sig_file = self.log_file + '.sig'

        try:
            result = subprocess.run(
                ['gpg', '--yes', '--detach-sign', '--armor',
                 '--default-key', GPG_KEY_ID,
                 '--output', sig_file, self.log_file],
                capture_output=True,
                text=True,
                timeout=30
            )

            if result.returncode == 0:
                return True, f"Signed: {sig_file}"
            else:
                return False, f"GPG error: {result.stderr}"

        except subprocess.TimeoutExpired:
            return False, "GPG signing timed out"
        except FileNotFoundError:
            return False, "GPG not installed"
        except Exception as e:
            return False, f"Signing error: {str(e)}"

    def verify_log_file_gpg(self) -> Tuple[bool, str]:
        """
        Verify GPG signature of log file.

        Returns:
            Tuple of (valid, message)
        """
        sig_file = self.log_file + '.sig'

        if not os.path.exists(sig_file):
            return False, "No signature file found"

        try:
            result = subprocess.run(
                ['gpg', '--verify', sig_file, self.log_file],
                capture_output=True,
                text=True,
                timeout=30
            )

            if result.returncode == 0:
                return True, "Signature valid"
            else:
                return False, f"Invalid signature: {result.stderr}"

        except subprocess.TimeoutExpired:
            return False, "GPG verification timed out"
        except FileNotFoundError:
            return False, "GPG not installed"
        except Exception as e:
            return False, f"Verification error: {str(e)}"


# Global instance for the main security log
_chain_manager: Optional[HashChainManager] = None


def get_chain_manager(log_file: Optional[str] = None) -> HashChainManager:
    """Get or create the hash chain manager for the security log."""
    global _chain_manager

    if log_file:
        return HashChainManager(log_file)

    if _chain_manager is None:
        default_log = os.path.join(LOG_DIR, 'security.log')
        _chain_manager = HashChainManager(default_log)

    return _chain_manager


def add_chain_fields(log_entry: Dict[str, Any]) -> Dict[str, Any]:
    """Add hash chain fields to a log entry."""
    return get_chain_manager().add_entry(log_entry)


def verify_security_log(max_entries: Optional[int] = None) -> VerificationResult:
    """Verify the integrity of the security log."""
    return get_chain_manager().verify_chain(max_entries)


def get_integrity_status() -> Dict[str, Any]:
    """Get integrity status of the security log."""
    return get_chain_manager().get_chain_status()


# CLI interface
if __name__ == '__main__':
    import argparse

    parser = argparse.ArgumentParser(description='BMAD Audit Log Integrity Verification')
    parser.add_argument('command', choices=['verify', 'status', 'sign', 'verify-gpg'],
                        help='Command to run')
    parser.add_argument('--log', '-l', type=str,
                        default=os.path.join(LOG_DIR, 'security.log'),
                        help='Log file to verify')
    parser.add_argument('--max-entries', '-n', type=int, default=None,
                        help='Maximum entries to verify')
    parser.add_argument('--json', '-j', action='store_true',
                        help='Output in JSON format')

    args = parser.parse_args()
    manager = HashChainManager(args.log)

    if args.command == 'verify':
        result = manager.verify_chain(args.max_entries)

        if args.json:
            print(json.dumps({
                'valid': result.valid,
                'entries_checked': result.entries_checked,
                'first_invalid_index': result.first_invalid_index,
                'error_message': result.error_message,
                'tampering_detected': result.tampering_detected,
            }, indent=2))
        else:
            print(f"Chain Verification Result")
            print(f"========================")
            print(f"Log file: {args.log}")
            print(f"Entries checked: {result.entries_checked}")
            print(f"Valid: {'YES' if result.valid else 'NO'}")
            print(f"Tampering detected: {'YES' if result.tampering_detected else 'NO'}")
            if result.error_message:
                print(f"Error: {result.error_message}")

        sys.exit(0 if result.valid else 1)

    elif args.command == 'status':
        status = manager.get_chain_status()

        if args.json:
            print(json.dumps(status, indent=2))
        else:
            print(f"Chain Status")
            print(f"============")
            for key, value in status.items():
                print(f"  {key}: {value}")

    elif args.command == 'sign':
        success, message = manager.sign_log_file_gpg()
        print(message)
        sys.exit(0 if success else 1)

    elif args.command == 'verify-gpg':
        valid, message = manager.verify_log_file_gpg()
        print(message)
        sys.exit(0 if valid else 1)
