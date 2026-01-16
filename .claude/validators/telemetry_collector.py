#!/usr/bin/env python3
"""
BMAD Security Telemetry Collector
=================================
Centralized telemetry collection for security validators.
Writes JSONL telemetry data for external analysis.

Telemetry Types:
- Security events (all validator actions)
- Rate limit metrics
- Permission audit trail
- Resource usage snapshots
- Supply chain verification results
- Confidence analysis (optional)

Output Location:
    docs/TestingLogs/security/AuditLogs/telemetry/

Configuration:
    BMAD_TELEMETRY_ENABLED=true|false (default: true)
    BMAD_TELEMETRY_DIR=<path> (default: docs/TestingLogs/security/AuditLogs/telemetry)
    BMAD_TELEMETRY_ROTATE_MB=<size> (default: 50)
"""

import json
import os
import sys
import time
import fcntl
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, Optional, List

# Configuration
PROJECT_DIR = os.environ.get('CLAUDE_PROJECT_DIR', os.getcwd())
DEFAULT_TELEMETRY_DIR = os.path.join(PROJECT_DIR, 'docs', 'TestingLogs', 'security', 'AuditLogs', 'telemetry')
TELEMETRY_DIR = os.environ.get('BMAD_TELEMETRY_DIR', DEFAULT_TELEMETRY_DIR)
TELEMETRY_ENABLED = os.environ.get('BMAD_TELEMETRY_ENABLED', 'true').lower() == 'true'
ROTATE_SIZE_MB = int(os.environ.get('BMAD_TELEMETRY_ROTATE_MB', '50'))
ROTATE_SIZE_BYTES = ROTATE_SIZE_MB * 1024 * 1024

# Telemetry file names
SECURITY_EVENTS_FILE = 'security_events.jsonl'
RATE_LIMIT_FILE = 'rate_limit_metrics.jsonl'
PERMISSION_AUDIT_FILE = 'permission_audit.jsonl'
RESOURCE_USAGE_FILE = 'resource_usage.jsonl'
SUPPLY_CHAIN_FILE = 'supply_chain_verification.jsonl'
CONFIDENCE_FILE = 'confidence_analysis.jsonl'
ANOMALY_FILE = 'anomaly_signals.jsonl'


class TelemetryCollector:
    """
    Centralized telemetry writer for BMAD security validators.

    Writes JSONL format for easy parsing and streaming.
    Supports file rotation and atomic writes.
    """

    def __init__(self, telemetry_dir: str = TELEMETRY_DIR):
        self.telemetry_dir = telemetry_dir
        self.enabled = TELEMETRY_ENABLED
        self._ensure_dir()

    def _ensure_dir(self) -> None:
        """Ensure telemetry directory exists."""
        if self.enabled:
            os.makedirs(self.telemetry_dir, exist_ok=True)

    def _get_file_path(self, filename: str) -> str:
        """Get full path for telemetry file."""
        return os.path.join(self.telemetry_dir, filename)

    def _rotate_if_needed(self, filepath: str) -> None:
        """Rotate file if it exceeds size limit."""
        try:
            if os.path.exists(filepath) and os.path.getsize(filepath) > ROTATE_SIZE_BYTES:
                timestamp = datetime.now().strftime('%Y-%m-%dT%H-%M-%S')
                base, ext = os.path.splitext(filepath)
                rotated = f"{base}.{timestamp}{ext}"
                os.rename(filepath, rotated)
        except Exception:
            pass  # Don't fail telemetry due to rotation issues

    def _write_entry(self, filename: str, entry: Dict[str, Any]) -> bool:
        """
        Write a single telemetry entry to file.
        Uses file locking for concurrent access safety.

        Returns True if write succeeded.
        """
        if not self.enabled:
            return False

        filepath = self._get_file_path(filename)
        self._rotate_if_needed(filepath)

        try:
            with open(filepath, 'a') as f:
                fcntl.flock(f.fileno(), fcntl.LOCK_EX)
                try:
                    f.write(json.dumps(entry, default=str) + '\n')
                finally:
                    fcntl.flock(f.fileno(), fcntl.LOCK_UN)
            return True
        except Exception as e:
            # Silent failure - telemetry should not impact validator operation
            return False

    def _base_entry(self) -> Dict[str, Any]:
        """Create base entry with common fields."""
        return {
            'timestamp': datetime.now().isoformat(),
            'session_id': os.environ.get('CLAUDE_SESSION_ID', 'unknown'),
        }

    # =========================================================================
    # Security Events (Core)
    # =========================================================================

    def record_security_event(
        self,
        validator: str,
        action: str,
        severity: str,
        target: str,
        reason: str,
        latency_ms: Optional[float] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> bool:
        """
        Record a security event from any validator.

        Args:
            validator: Validator name (e.g., 'rate_limiter', 'bash_safety')
            action: Action taken ('ALLOWED', 'BLOCKED', 'WARNING', 'OVERRIDE_USED')
            severity: Severity level ('INFO', 'WARNING', 'BLOCKED', 'CRITICAL')
            target: Command, file, or operation being validated
            reason: Human-readable explanation
            latency_ms: Optional validation processing time
            metadata: Optional validator-specific data
        """
        entry = self._base_entry()
        entry.update({
            'validator': validator,
            'action': action,
            'severity': severity,
            'target': target[:500] if target else '',  # Truncate long targets
            'reason': reason,
        })
        if latency_ms is not None:
            entry['latency_ms'] = round(latency_ms, 3)
        if metadata:
            entry['metadata'] = metadata

        return self._write_entry(SECURITY_EVENTS_FILE, entry)

    # =========================================================================
    # Rate Limit Metrics
    # =========================================================================

    def record_rate_limit_metrics(
        self,
        operation_type: str,
        requests_count: int,
        limit: int,
        window_seconds: int,
        window_remaining_s: int,
        backoff_active: bool = False,
        backoff_remaining_s: int = 0,
        backoff_multiplier: int = 1
    ) -> bool:
        """
        Record rate limiter state snapshot.

        Args:
            operation_type: Type of operation (global, bash, write, etc.)
            requests_count: Requests in current window
            limit: Configured limit
            window_seconds: Window duration
            window_remaining_s: Seconds until window reset
            backoff_active: Whether backoff is in effect
            backoff_remaining_s: Seconds until backoff expires
            backoff_multiplier: Current backoff multiplier
        """
        entry = self._base_entry()
        entry.update({
            'operation_type': operation_type,
            'requests_count': requests_count,
            'limit': limit,
            'window_seconds': window_seconds,
            'window_remaining_s': window_remaining_s,
            'utilization_pct': round((requests_count / limit) * 100, 2) if limit > 0 else 0,
            'backoff_active': backoff_active,
            'backoff_remaining_s': backoff_remaining_s,
            'backoff_multiplier': backoff_multiplier,
        })

        return self._write_entry(RATE_LIMIT_FILE, entry)

    # =========================================================================
    # Permission Audit
    # =========================================================================

    def record_permission_check(
        self,
        plugin_name: str,
        capability: str,
        requested_resource: str,
        decision: str,
        reason: str,
        manifest_version: Optional[str] = None,
        rbac_role: Optional[str] = None,
        matched_pattern: Optional[str] = None
    ) -> bool:
        """
        Record a plugin permission check.

        Args:
            plugin_name: Plugin being checked
            capability: Capability requested (filesystem.read, shell, etc.)
            requested_resource: Path, command, or URL
            decision: 'GRANTED' or 'DENIED'
            reason: Explanation for decision
            manifest_version: Version from plugin manifest
            rbac_role: User's RBAC role
            matched_pattern: Glob pattern that matched (if granted)
        """
        entry = self._base_entry()
        entry.update({
            'plugin_name': plugin_name,
            'capability': capability,
            'requested_resource': requested_resource[:500] if requested_resource else '',
            'decision': decision,
            'reason': reason,
        })
        if manifest_version:
            entry['manifest_version'] = manifest_version
        if rbac_role:
            entry['rbac_role'] = rbac_role
        if matched_pattern:
            entry['matched_pattern'] = matched_pattern

        return self._write_entry(PERMISSION_AUDIT_FILE, entry)

    # =========================================================================
    # Resource Usage
    # =========================================================================

    def record_resource_usage(
        self,
        context_tokens_used: int,
        context_tokens_max: int,
        context_status: str,
        memory_mb: Optional[float] = None,
        memory_limit_mb: Optional[float] = None,
        recursion_depth: Optional[int] = None,
        recursion_limit: Optional[int] = None,
        symlink_follows: Optional[int] = None,
        symlink_limit: Optional[int] = None,
        child_processes: Optional[int] = None,
        child_process_limit: Optional[int] = None
    ) -> bool:
        """
        Record resource usage snapshot.

        Args:
            context_tokens_used: Estimated tokens consumed
            context_tokens_max: Maximum context window
            context_status: 'ok', 'warning', 'critical', 'blocked'
            memory_mb: Current memory usage in MB
            memory_limit_mb: Configured memory limit
            recursion_depth: Current call stack depth
            recursion_limit: Configured recursion limit
            symlink_follows: Symlinks traversed
            symlink_limit: Maximum symlink follows
            child_processes: Active child processes
            child_process_limit: Maximum child processes
        """
        entry = self._base_entry()
        context_pct = (context_tokens_used / context_tokens_max * 100) if context_tokens_max > 0 else 0

        entry.update({
            'context_tokens_used': context_tokens_used,
            'context_tokens_max': context_tokens_max,
            'context_pct': round(context_pct, 2),
            'context_status': context_status,
        })

        if memory_mb is not None:
            entry['memory_mb'] = round(memory_mb, 2)
        if memory_limit_mb is not None:
            entry['memory_limit_mb'] = memory_limit_mb
            if memory_mb is not None:
                entry['memory_pct'] = round((memory_mb / memory_limit_mb) * 100, 2)
        if recursion_depth is not None:
            entry['recursion_depth'] = recursion_depth
        if recursion_limit is not None:
            entry['recursion_limit'] = recursion_limit
        if symlink_follows is not None:
            entry['symlink_follows'] = symlink_follows
        if symlink_limit is not None:
            entry['symlink_limit'] = symlink_limit
        if child_processes is not None:
            entry['child_processes'] = child_processes
        if child_process_limit is not None:
            entry['child_process_limit'] = child_process_limit

        return self._write_entry(RESOURCE_USAGE_FILE, entry)

    # =========================================================================
    # Supply Chain Verification
    # =========================================================================

    def record_supply_chain_verification(
        self,
        verification_type: str,
        file_path: str,
        verification_result: str,
        verification_mode: str,
        hash_match: bool,
        skill_name: Optional[str] = None,
        expected_hash: Optional[str] = None,
        actual_hash: Optional[str] = None,
        gpg_signature_checked: bool = False,
        gpg_signature_valid: Optional[bool] = None,
        gpg_key_id: Optional[str] = None,
        cached: bool = False,
        latency_ms: Optional[float] = None
    ) -> bool:
        """
        Record supply chain verification result.

        Args:
            verification_type: 'file', 'skill', 'plugin', 'manifest'
            file_path: Path to verified file
            verification_result: 'VALID', 'MISMATCH', 'MISSING', 'UNTRACKED', 'ERROR'
            verification_mode: 'strict', 'warn', 'disabled'
            hash_match: Whether hashes matched
            skill_name: Full skill identifier if applicable
            expected_hash: SHA256 from manifest
            actual_hash: Computed SHA256
            gpg_signature_checked: Whether GPG was checked
            gpg_signature_valid: GPG validity
            gpg_key_id: GPG key ID used
            cached: Whether result was from cache
            latency_ms: Verification time
        """
        entry = self._base_entry()
        entry.update({
            'verification_type': verification_type,
            'file_path': file_path,
            'verification_result': verification_result,
            'verification_mode': verification_mode,
            'hash_match': hash_match,
        })

        if skill_name:
            entry['skill_name'] = skill_name
        if expected_hash:
            entry['expected_hash'] = expected_hash
        if actual_hash:
            entry['actual_hash'] = actual_hash
        if gpg_signature_checked:
            entry['gpg_signature_checked'] = gpg_signature_checked
            if gpg_signature_valid is not None:
                entry['gpg_signature_valid'] = gpg_signature_valid
            if gpg_key_id:
                entry['gpg_key_id'] = gpg_key_id
        entry['cached'] = cached
        if latency_ms is not None:
            entry['latency_ms'] = round(latency_ms, 3)

        return self._write_entry(SUPPLY_CHAIN_FILE, entry)

    # =========================================================================
    # Confidence Analysis
    # =========================================================================

    def record_confidence_analysis(
        self,
        response_length: int,
        uncertainty_markers: Dict[str, int],
        confidence_score: float,
        confidence_level: str,
        hedging_phrases: Optional[List[str]] = None,
        code_warnings: Optional[Dict[str, int]] = None,
        attributions: Optional[Dict[str, int]] = None,
        notes: Optional[List[str]] = None
    ) -> bool:
        """
        Record confidence analysis result.

        Args:
            response_length: Characters in response
            uncertainty_markers: Count by severity {high, medium, low}
            confidence_score: 0.0 to 1.0
            confidence_level: 'HIGH', 'MEDIUM', 'LOW', 'VERY_LOW'
            hedging_phrases: Detected hedging phrases
            code_warnings: Counts of TODO/FIXME/HACK
            attributions: Source attribution counts
            notes: Human-readable notes
        """
        entry = self._base_entry()
        entry.update({
            'response_length': response_length,
            'uncertainty_markers': uncertainty_markers,
            'confidence_score': round(confidence_score, 3),
            'confidence_level': confidence_level,
        })

        if hedging_phrases:
            entry['hedging_phrases'] = hedging_phrases[:10]  # Limit array size
        if code_warnings:
            entry['code_warnings'] = code_warnings
        if attributions:
            entry['attributions'] = attributions
        if notes:
            entry['notes'] = notes[:5]  # Limit array size

        return self._write_entry(CONFIDENCE_FILE, entry)

    # =========================================================================
    # Anomaly Signals (Future - Phase 4.3)
    # =========================================================================

    def record_anomaly_signal(
        self,
        anomaly_type: str,
        metric_name: str,
        baseline_value: float,
        observed_value: float,
        deviation_std: float,
        anomaly_score: float,
        alert_triggered: bool = False,
        alert_severity: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None
    ) -> bool:
        """
        Record detected anomaly signal.

        Args:
            anomaly_type: 'volume_spike', 'unusual_operation', 'time_anomaly'
            metric_name: Name of metric being monitored
            baseline_value: Expected normal value
            observed_value: Actual observed value
            deviation_std: Standard deviations from normal
            anomaly_score: 0.0 to 1.0 confidence in anomaly
            alert_triggered: Whether alert was sent
            alert_severity: 'INFO', 'WARNING', 'CRITICAL'
            context: Additional context data
        """
        entry = self._base_entry()
        entry.update({
            'anomaly_type': anomaly_type,
            'metric_name': metric_name,
            'baseline_value': round(baseline_value, 3),
            'observed_value': round(observed_value, 3),
            'deviation_std': round(deviation_std, 2),
            'anomaly_score': round(anomaly_score, 3),
            'alert_triggered': alert_triggered,
        })

        if alert_severity:
            entry['alert_severity'] = alert_severity
        if context:
            entry['context'] = context

        return self._write_entry(ANOMALY_FILE, entry)


# Global singleton instance
_telemetry_collector: Optional[TelemetryCollector] = None


def get_telemetry_collector() -> TelemetryCollector:
    """Get or create the global telemetry collector instance."""
    global _telemetry_collector
    if _telemetry_collector is None:
        _telemetry_collector = TelemetryCollector()
    return _telemetry_collector


# Convenience functions for direct import
def record_security_event(*args, **kwargs) -> bool:
    """Record a security event. See TelemetryCollector.record_security_event."""
    return get_telemetry_collector().record_security_event(*args, **kwargs)


def record_rate_limit_metrics(*args, **kwargs) -> bool:
    """Record rate limit metrics. See TelemetryCollector.record_rate_limit_metrics."""
    return get_telemetry_collector().record_rate_limit_metrics(*args, **kwargs)


def record_permission_check(*args, **kwargs) -> bool:
    """Record permission check. See TelemetryCollector.record_permission_check."""
    return get_telemetry_collector().record_permission_check(*args, **kwargs)


def record_resource_usage(*args, **kwargs) -> bool:
    """Record resource usage. See TelemetryCollector.record_resource_usage."""
    return get_telemetry_collector().record_resource_usage(*args, **kwargs)


def record_supply_chain_verification(*args, **kwargs) -> bool:
    """Record supply chain verification. See TelemetryCollector.record_supply_chain_verification."""
    return get_telemetry_collector().record_supply_chain_verification(*args, **kwargs)


def record_confidence_analysis(*args, **kwargs) -> bool:
    """Record confidence analysis. See TelemetryCollector.record_confidence_analysis."""
    return get_telemetry_collector().record_confidence_analysis(*args, **kwargs)


def record_anomaly_signal(*args, **kwargs) -> bool:
    """Record anomaly signal. See TelemetryCollector.record_anomaly_signal."""
    return get_telemetry_collector().record_anomaly_signal(*args, **kwargs)


# CLI interface for testing
if __name__ == '__main__':
    import argparse

    parser = argparse.ArgumentParser(description='BMAD Security Telemetry Collector')
    parser.add_argument('command', choices=['status', 'test', 'export'],
                        help='Command to run')
    parser.add_argument('--type', '-t', choices=[
        'security', 'rate_limit', 'permission', 'resource', 'supply_chain', 'confidence', 'anomaly'
    ], help='Telemetry type for export')
    parser.add_argument('--lines', '-n', type=int, default=10,
                        help='Number of lines to show')

    args = parser.parse_args()
    collector = get_telemetry_collector()

    if args.command == 'status':
        print(f"Telemetry Status")
        print(f"================")
        print(f"Enabled: {collector.enabled}")
        print(f"Directory: {collector.telemetry_dir}")
        print(f"Rotate Size: {ROTATE_SIZE_MB} MB")
        print()

        files = [
            SECURITY_EVENTS_FILE,
            RATE_LIMIT_FILE,
            PERMISSION_AUDIT_FILE,
            RESOURCE_USAGE_FILE,
            SUPPLY_CHAIN_FILE,
            CONFIDENCE_FILE,
            ANOMALY_FILE,
        ]

        print("Telemetry Files:")
        for f in files:
            path = collector._get_file_path(f)
            if os.path.exists(path):
                size = os.path.getsize(path) / 1024  # KB
                lines = sum(1 for _ in open(path))
                print(f"  {f}: {lines} entries, {size:.1f} KB")
            else:
                print(f"  {f}: (not created)")

    elif args.command == 'test':
        print("Writing test telemetry entries...")

        # Test security event
        collector.record_security_event(
            validator='telemetry_test',
            action='ALLOWED',
            severity='INFO',
            target='/test/command',
            reason='Test entry',
            latency_ms=1.5,
            metadata={'test': True}
        )
        print("  - Security event: OK")

        # Test rate limit
        collector.record_rate_limit_metrics(
            operation_type='test',
            requests_count=5,
            limit=100,
            window_seconds=60,
            window_remaining_s=45,
            backoff_active=False
        )
        print("  - Rate limit metrics: OK")

        # Test permission
        collector.record_permission_check(
            plugin_name='test-plugin',
            capability='filesystem.read',
            requested_resource='/test/path',
            decision='GRANTED',
            reason='Test entry'
        )
        print("  - Permission audit: OK")

        # Test resource usage
        collector.record_resource_usage(
            context_tokens_used=10000,
            context_tokens_max=200000,
            context_status='ok',
            memory_mb=256.5,
            memory_limit_mb=1024
        )
        print("  - Resource usage: OK")

        # Test supply chain
        collector.record_supply_chain_verification(
            verification_type='file',
            file_path='/test/file.py',
            verification_result='VALID',
            verification_mode='strict',
            hash_match=True,
            latency_ms=5.2
        )
        print("  - Supply chain: OK")

        # Test confidence
        collector.record_confidence_analysis(
            response_length=500,
            uncertainty_markers={'high': 0, 'medium': 1, 'low': 2},
            confidence_score=0.75,
            confidence_level='MEDIUM',
            notes=['Test analysis']
        )
        print("  - Confidence analysis: OK")

        print("\nAll test entries written successfully!")

    elif args.command == 'export':
        file_map = {
            'security': SECURITY_EVENTS_FILE,
            'rate_limit': RATE_LIMIT_FILE,
            'permission': PERMISSION_AUDIT_FILE,
            'resource': RESOURCE_USAGE_FILE,
            'supply_chain': SUPPLY_CHAIN_FILE,
            'confidence': CONFIDENCE_FILE,
            'anomaly': ANOMALY_FILE,
        }

        if not args.type:
            print("Error: --type required for export")
            sys.exit(1)

        filepath = collector._get_file_path(file_map[args.type])
        if not os.path.exists(filepath):
            print(f"No data for {args.type}")
            sys.exit(0)

        with open(filepath, 'r') as f:
            lines = f.readlines()
            for line in lines[-args.lines:]:
                print(line.strip())
