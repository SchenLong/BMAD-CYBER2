#!/usr/bin/env python3
"""
BMAD Guardrails: Security Anomaly Detection
============================================
Pattern detection for unusual security activity.

Detection Types:
- Volume anomalies: Unusual request rates (spikes or drops)
- Type anomalies: Unusual operation types for time/context
- Time anomalies: Activity at unusual times
- Sequence anomalies: Unusual patterns of operations

Baseline Computation:
- Rolling window baseline (configurable, default 24h)
- Per-operation-type statistics
- Per-hour-of-day statistics
- Automatic baseline updates

Configuration:
    BMAD_ANOMALY_DETECTION=true|false (default: true)
    BMAD_ANOMALY_THRESHOLD_STD=<float> (default: 3.0 standard deviations)
    BMAD_ANOMALY_BASELINE_HOURS=<int> (default: 24)
    BMAD_ANOMALY_ALERT_LEVEL=INFO|WARNING|CRITICAL (default: WARNING)
"""

import json
import math
import os
import sys
import time
import fcntl
from collections import defaultdict
from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional, Dict, Any, List, Tuple, NamedTuple

# Configuration
PROJECT_DIR = os.environ.get('CLAUDE_PROJECT_DIR', os.getcwd())
LOG_DIR = os.path.join(PROJECT_DIR, '.claude', 'logs')
BASELINE_FILE = os.path.join(LOG_DIR, '.anomaly_baseline.json')
BASELINE_LOCK_FILE = os.path.join(LOG_DIR, '.anomaly.lock')

ANOMALY_ENABLED = os.environ.get('BMAD_ANOMALY_DETECTION', 'true').lower() == 'true'
THRESHOLD_STD = float(os.environ.get('BMAD_ANOMALY_THRESHOLD_STD', '3.0'))
BASELINE_HOURS = int(os.environ.get('BMAD_ANOMALY_BASELINE_HOURS', '24'))
ALERT_LEVEL = os.environ.get('BMAD_ANOMALY_ALERT_LEVEL', 'WARNING')
MIN_SAMPLES_FOR_BASELINE = 10  # Minimum data points before anomaly detection activates
LOCK_TIMEOUT_SECONDS = 2.0

# Import telemetry collector for anomaly signals
try:
    from telemetry_collector import record_anomaly_signal, record_security_event
    TELEMETRY_AVAILABLE = True
except ImportError:
    TELEMETRY_AVAILABLE = False
    def record_anomaly_signal(*args, **kwargs):
        pass
    def record_security_event(*args, **kwargs):
        pass


class AnomalySignal(NamedTuple):
    """Represents a detected anomaly."""
    anomaly_type: str  # volume_spike, volume_drop, unusual_operation, time_anomaly
    metric_name: str
    baseline_value: float
    observed_value: float
    deviation_std: float
    anomaly_score: float  # 0.0 to 1.0
    alert_severity: str
    description: str


class StatisticsWindow:
    """Rolling window statistics calculator."""

    def __init__(self, window_size: int = 100):
        self.window_size = window_size
        self.values: List[float] = []

    def add(self, value: float) -> None:
        """Add a value to the window."""
        self.values.append(value)
        if len(self.values) > self.window_size:
            self.values.pop(0)

    def mean(self) -> float:
        """Calculate mean of values in window."""
        if not self.values:
            return 0.0
        return sum(self.values) / len(self.values)

    def std_dev(self) -> float:
        """Calculate standard deviation of values in window."""
        if len(self.values) < 2:
            return 0.0
        mean = self.mean()
        variance = sum((x - mean) ** 2 for x in self.values) / len(self.values)
        return math.sqrt(variance)

    def z_score(self, value: float) -> float:
        """Calculate z-score for a value."""
        std = self.std_dev()
        if std == 0:
            return 0.0
        return (value - self.mean()) / std

    def count(self) -> int:
        """Return number of samples."""
        return len(self.values)

    def to_dict(self) -> Dict[str, Any]:
        """Serialize to dictionary."""
        return {
            'values': self.values[-self.window_size:],
            'window_size': self.window_size,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'StatisticsWindow':
        """Deserialize from dictionary."""
        window = cls(data.get('window_size', 100))
        window.values = data.get('values', [])
        return window


class AnomalyDetector:
    """
    Detects anomalies in security event patterns.

    Uses rolling window statistics to establish baselines and detect
    deviations that may indicate security incidents.
    """

    def __init__(self, baseline_file: str = BASELINE_FILE):
        self.baseline_file = baseline_file
        self.enabled = ANOMALY_ENABLED
        self.threshold_std = THRESHOLD_STD

        # Statistics windows for different metrics
        self.operation_counts: Dict[str, StatisticsWindow] = defaultdict(StatisticsWindow)
        self.hourly_counts: Dict[int, StatisticsWindow] = defaultdict(StatisticsWindow)
        self.validator_counts: Dict[str, StatisticsWindow] = defaultdict(StatisticsWindow)
        self.blocked_ratio: StatisticsWindow = StatisticsWindow()

        # Current window tracking
        self.current_window_start: Optional[datetime] = None
        self.current_window_operations: Dict[str, int] = defaultdict(int)
        self.current_window_validators: Dict[str, int] = defaultdict(int)
        self.current_window_blocked: int = 0
        self.current_window_total: int = 0

        # Load existing baseline
        self._load_baseline()

    def _acquire_lock(self, timeout: float = LOCK_TIMEOUT_SECONDS) -> int:
        """Acquire exclusive lock for baseline updates."""
        os.makedirs(os.path.dirname(BASELINE_LOCK_FILE), exist_ok=True)
        fd = os.open(BASELINE_LOCK_FILE, os.O_CREAT | os.O_RDWR)

        start_time = time.time()
        while True:
            try:
                fcntl.flock(fd, fcntl.LOCK_EX | fcntl.LOCK_NB)
                return fd
            except BlockingIOError:
                if time.time() - start_time > timeout:
                    os.close(fd)
                    raise TimeoutError("Could not acquire anomaly lock")
                time.sleep(0.01)

    def _release_lock(self, fd: int) -> None:
        """Release exclusive lock."""
        try:
            fcntl.flock(fd, fcntl.LOCK_UN)
        finally:
            os.close(fd)

    def _load_baseline(self) -> None:
        """Load baseline statistics from file."""
        try:
            if os.path.exists(self.baseline_file):
                with open(self.baseline_file, 'r') as f:
                    data = json.load(f)

                # Restore operation counts
                for op, stats in data.get('operation_counts', {}).items():
                    self.operation_counts[op] = StatisticsWindow.from_dict(stats)

                # Restore hourly counts
                for hour_str, stats in data.get('hourly_counts', {}).items():
                    self.hourly_counts[int(hour_str)] = StatisticsWindow.from_dict(stats)

                # Restore validator counts
                for validator, stats in data.get('validator_counts', {}).items():
                    self.validator_counts[validator] = StatisticsWindow.from_dict(stats)

                # Restore blocked ratio
                if 'blocked_ratio' in data:
                    self.blocked_ratio = StatisticsWindow.from_dict(data['blocked_ratio'])

        except Exception:
            pass  # Start fresh if baseline corrupted

    def _save_baseline(self) -> None:
        """Save baseline statistics to file."""
        lock_fd = None
        try:
            lock_fd = self._acquire_lock()

            data = {
                'operation_counts': {
                    op: stats.to_dict() for op, stats in self.operation_counts.items()
                },
                'hourly_counts': {
                    str(hour): stats.to_dict() for hour, stats in self.hourly_counts.items()
                },
                'validator_counts': {
                    v: stats.to_dict() for v, stats in self.validator_counts.items()
                },
                'blocked_ratio': self.blocked_ratio.to_dict(),
                'updated_at': datetime.now().isoformat(),
            }

            os.makedirs(os.path.dirname(self.baseline_file), exist_ok=True)
            temp_file = self.baseline_file + '.tmp'
            with open(temp_file, 'w') as f:
                json.dump(data, f, indent=2)
            os.rename(temp_file, self.baseline_file)

        except TimeoutError:
            pass  # Non-critical, will retry later
        finally:
            if lock_fd is not None:
                self._release_lock(lock_fd)

    def _get_window_key(self) -> datetime:
        """Get the start of the current 5-minute window."""
        now = datetime.now()
        # Round down to nearest 5 minutes
        minutes = (now.minute // 5) * 5
        return now.replace(minute=minutes, second=0, microsecond=0)

    def _finalize_window(self) -> None:
        """Finalize the current window and update baselines."""
        if self.current_window_start is None:
            return

        # Update operation counts baseline
        for op, count in self.current_window_operations.items():
            self.operation_counts[op].add(count)

        # Update hourly counts baseline
        hour = self.current_window_start.hour
        total = sum(self.current_window_operations.values())
        self.hourly_counts[hour].add(total)

        # Update validator counts baseline
        for validator, count in self.current_window_validators.items():
            self.validator_counts[validator].add(count)

        # Update blocked ratio baseline
        if self.current_window_total > 0:
            ratio = self.current_window_blocked / self.current_window_total
            self.blocked_ratio.add(ratio)

        # Save baseline periodically
        self._save_baseline()

        # Reset current window
        self.current_window_operations.clear()
        self.current_window_validators.clear()
        self.current_window_blocked = 0
        self.current_window_total = 0

    def record_event(
        self,
        operation_type: str,
        validator: str,
        action: str,
        severity: str
    ) -> List[AnomalySignal]:
        """
        Record a security event and check for anomalies.

        Args:
            operation_type: Type of operation (bash, read, write, etc.)
            validator: Validator that processed the event
            action: Action taken (ALLOWED, BLOCKED, etc.)
            severity: Severity level

        Returns:
            List of detected anomaly signals (may be empty)
        """
        if not self.enabled:
            return []

        anomalies: List[AnomalySignal] = []
        now = datetime.now()
        window_key = self._get_window_key()

        # Check if we need to finalize the previous window
        if self.current_window_start is not None and window_key != self.current_window_start:
            self._finalize_window()
            anomalies.extend(self._check_anomalies())

        # Initialize new window if needed
        if self.current_window_start is None or window_key != self.current_window_start:
            self.current_window_start = window_key

        # Update current window counts
        self.current_window_operations[operation_type] += 1
        self.current_window_validators[validator] += 1
        self.current_window_total += 1

        if action == 'BLOCKED':
            self.current_window_blocked += 1

        return anomalies

    def _check_anomalies(self) -> List[AnomalySignal]:
        """Check for anomalies based on current window data."""
        anomalies: List[AnomalySignal] = []

        # Check volume anomalies per operation type
        for op, count in self.current_window_operations.items():
            stats = self.operation_counts.get(op)
            if stats and stats.count() >= MIN_SAMPLES_FOR_BASELINE:
                z = stats.z_score(count)
                if abs(z) > self.threshold_std:
                    anomaly_type = 'volume_spike' if z > 0 else 'volume_drop'
                    anomaly = self._create_anomaly(
                        anomaly_type=anomaly_type,
                        metric_name=f'operation_count.{op}',
                        baseline_value=stats.mean(),
                        observed_value=count,
                        deviation_std=abs(z),
                        description=f"Operation {op} count {count} is {abs(z):.1f} std devs from mean {stats.mean():.1f}"
                    )
                    anomalies.append(anomaly)
                    self._emit_anomaly(anomaly)

        # Check hourly volume anomaly
        hour = datetime.now().hour
        total_ops = sum(self.current_window_operations.values())
        hourly_stats = self.hourly_counts.get(hour)
        if hourly_stats and hourly_stats.count() >= MIN_SAMPLES_FOR_BASELINE:
            z = hourly_stats.z_score(total_ops)
            if abs(z) > self.threshold_std:
                anomaly_type = 'volume_spike' if z > 0 else 'volume_drop'
                anomaly = self._create_anomaly(
                    anomaly_type=anomaly_type,
                    metric_name=f'hourly_volume.hour_{hour}',
                    baseline_value=hourly_stats.mean(),
                    observed_value=total_ops,
                    deviation_std=abs(z),
                    description=f"Activity at hour {hour} ({total_ops} ops) is {abs(z):.1f} std devs from normal"
                )
                anomalies.append(anomaly)
                self._emit_anomaly(anomaly)

        # Check blocked ratio anomaly
        if self.current_window_total > 0 and self.blocked_ratio.count() >= MIN_SAMPLES_FOR_BASELINE:
            ratio = self.current_window_blocked / self.current_window_total
            z = self.blocked_ratio.z_score(ratio)
            if z > self.threshold_std:  # Only alert on high block rate
                anomaly = self._create_anomaly(
                    anomaly_type='unusual_operation',
                    metric_name='blocked_ratio',
                    baseline_value=self.blocked_ratio.mean(),
                    observed_value=ratio,
                    deviation_std=z,
                    description=f"Block rate {ratio:.1%} is {z:.1f} std devs above normal {self.blocked_ratio.mean():.1%}"
                )
                anomalies.append(anomaly)
                self._emit_anomaly(anomaly)

        # Check for unusual operation types (new or rarely seen)
        for op in self.current_window_operations.keys():
            stats = self.operation_counts.get(op)
            if stats is None or stats.count() < 3:
                # This is a rarely seen operation type
                anomaly = self._create_anomaly(
                    anomaly_type='unusual_operation',
                    metric_name=f'rare_operation.{op}',
                    baseline_value=0,
                    observed_value=self.current_window_operations[op],
                    deviation_std=0,  # Can't calculate std for new types
                    description=f"Rare or new operation type '{op}' detected ({self.current_window_operations[op]} times)"
                )
                # Lower score for rare ops (informational)
                anomaly = anomaly._replace(anomaly_score=0.3, alert_severity='INFO')
                anomalies.append(anomaly)

        return anomalies

    def _create_anomaly(
        self,
        anomaly_type: str,
        metric_name: str,
        baseline_value: float,
        observed_value: float,
        deviation_std: float,
        description: str
    ) -> AnomalySignal:
        """Create an AnomalySignal with calculated score."""
        # Calculate anomaly score (0.0 to 1.0) based on deviation
        # Use sigmoid-like function: score approaches 1.0 as std devs increase
        if deviation_std > 0:
            score = 1 - (1 / (1 + deviation_std / 3))
        else:
            score = 0.3  # Default score for anomalies without std calculation

        # Determine severity based on score
        if score > 0.8:
            severity = 'CRITICAL'
        elif score > 0.6:
            severity = 'WARNING'
        else:
            severity = 'INFO'

        return AnomalySignal(
            anomaly_type=anomaly_type,
            metric_name=metric_name,
            baseline_value=baseline_value,
            observed_value=observed_value,
            deviation_std=deviation_std,
            anomaly_score=score,
            alert_severity=severity,
            description=description
        )

    def _emit_anomaly(self, anomaly: AnomalySignal) -> None:
        """Emit anomaly to telemetry and stderr."""
        if TELEMETRY_AVAILABLE:
            record_anomaly_signal(
                anomaly_type=anomaly.anomaly_type,
                metric_name=anomaly.metric_name,
                baseline_value=anomaly.baseline_value,
                observed_value=anomaly.observed_value,
                deviation_std=anomaly.deviation_std,
                anomaly_score=anomaly.anomaly_score,
                alert_triggered=anomaly.anomaly_score > 0.5,
                alert_severity=anomaly.alert_severity,
                context={'description': anomaly.description}
            )

        # Also emit as security event
        if TELEMETRY_AVAILABLE and anomaly.anomaly_score > 0.5:
            record_security_event(
                validator='anomaly_detector',
                action='ANOMALY_DETECTED',
                severity=anomaly.alert_severity,
                target=anomaly.metric_name,
                reason=anomaly.description,
                metadata={
                    'anomaly_type': anomaly.anomaly_type,
                    'anomaly_score': anomaly.anomaly_score,
                    'deviation_std': anomaly.deviation_std,
                }
            )

        # Print alert for significant anomalies
        if anomaly.alert_severity in ('WARNING', 'CRITICAL'):
            print(
                f"[ANOMALY {anomaly.alert_severity}] {anomaly.description}",
                file=sys.stderr
            )

    def check_all_anomalies(self) -> List[AnomalySignal]:
        """Force check all anomaly types (useful for testing)."""
        return self._check_anomalies()

    def get_baseline_status(self) -> Dict[str, Any]:
        """Get current baseline statistics status."""
        return {
            'enabled': self.enabled,
            'threshold_std': self.threshold_std,
            'operation_types_tracked': len(self.operation_counts),
            'hours_tracked': len(self.hourly_counts),
            'validators_tracked': len(self.validator_counts),
            'blocked_ratio_samples': self.blocked_ratio.count(),
            'baseline_ready': any(
                stats.count() >= MIN_SAMPLES_FOR_BASELINE
                for stats in self.operation_counts.values()
            ),
            'statistics': {
                op: {
                    'mean': stats.mean(),
                    'std': stats.std_dev(),
                    'samples': stats.count()
                }
                for op, stats in self.operation_counts.items()
            }
        }

    def reset_baseline(self) -> None:
        """Reset all baseline statistics."""
        self.operation_counts.clear()
        self.hourly_counts.clear()
        self.validator_counts.clear()
        self.blocked_ratio = StatisticsWindow()
        self.current_window_start = None
        self.current_window_operations.clear()
        self.current_window_validators.clear()
        self.current_window_blocked = 0
        self.current_window_total = 0

        # Remove baseline file
        try:
            if os.path.exists(self.baseline_file):
                os.remove(self.baseline_file)
        except Exception:
            pass


# Global singleton instance
_detector: Optional[AnomalyDetector] = None


def get_anomaly_detector() -> AnomalyDetector:
    """Get or create the global anomaly detector instance."""
    global _detector
    if _detector is None:
        _detector = AnomalyDetector()
    return _detector


def record_security_event_for_anomaly(
    operation_type: str,
    validator: str,
    action: str,
    severity: str
) -> List[AnomalySignal]:
    """Record event and check for anomalies. See AnomalyDetector.record_event."""
    return get_anomaly_detector().record_event(operation_type, validator, action, severity)


def check_anomalies() -> List[AnomalySignal]:
    """Force check all anomaly types."""
    return get_anomaly_detector().check_all_anomalies()


def get_baseline_status() -> Dict[str, Any]:
    """Get baseline status."""
    return get_anomaly_detector().get_baseline_status()


def reset_baseline() -> None:
    """Reset baseline statistics."""
    return get_anomaly_detector().reset_baseline()


# CLI interface
if __name__ == '__main__':
    import argparse

    parser = argparse.ArgumentParser(description='BMAD Security Anomaly Detector')
    parser.add_argument('command', choices=['status', 'check', 'reset', 'simulate'],
                        help='Command to run')
    parser.add_argument('--json', '-j', action='store_true',
                        help='Output in JSON format')

    args = parser.parse_args()
    detector = get_anomaly_detector()

    if args.command == 'status':
        status = detector.get_baseline_status()
        if args.json:
            print(json.dumps(status, indent=2))
        else:
            print("Anomaly Detector Status")
            print("=======================")
            print(f"Enabled: {status['enabled']}")
            print(f"Threshold: {status['threshold_std']} std devs")
            print(f"Operation types tracked: {status['operation_types_tracked']}")
            print(f"Baseline ready: {status['baseline_ready']}")
            print()
            if status['statistics']:
                print("Operation Statistics:")
                for op, stats in status['statistics'].items():
                    print(f"  {op}: mean={stats['mean']:.1f}, std={stats['std']:.1f}, samples={stats['samples']}")

    elif args.command == 'check':
        anomalies = detector.check_all_anomalies()
        if args.json:
            print(json.dumps([a._asdict() for a in anomalies], indent=2))
        else:
            if anomalies:
                print(f"Detected {len(anomalies)} anomalies:")
                for a in anomalies:
                    print(f"  [{a.alert_severity}] {a.anomaly_type}: {a.description}")
            else:
                print("No anomalies detected")

    elif args.command == 'reset':
        detector.reset_baseline()
        print("Baseline reset complete")

    elif args.command == 'simulate':
        # Simulate some events for testing
        print("Simulating security events...")
        operations = ['bash', 'read', 'write', 'edit']
        validators = ['bash_safety', 'outside_repo_guard', 'secret_guard']
        actions = ['ALLOWED', 'ALLOWED', 'ALLOWED', 'BLOCKED']

        import random
        for i in range(50):
            op = random.choice(operations)
            validator = random.choice(validators)
            action = random.choice(actions)
            anomalies = detector.record_event(op, validator, action, 'INFO')
            if anomalies:
                for a in anomalies:
                    print(f"  Detected: [{a.alert_severity}] {a.description}")

        # Force window finalization
        detector._finalize_window()

        print(f"\nSimulation complete. Baseline now has data for {len(detector.operation_counts)} operation types.")
        print("Run 'status' to see baseline statistics.")
