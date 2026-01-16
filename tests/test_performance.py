#!/usr/bin/env python3
"""
BMAD Guardrails: Performance Tests
==================================
Performance validation for P1 security fixes.

Ensures security controls don't introduce unacceptable latency.

Run with: python3 tests/test_performance.py
"""

import os
import sys
import time
import tempfile
import statistics

# Set up test environment
TEST_DIR = tempfile.mkdtemp(prefix='bmad_perf_test_')
os.environ['CLAUDE_PROJECT_DIR'] = TEST_DIR
os.makedirs(os.path.join(TEST_DIR, '.claude'), exist_ok=True)

# Add validators to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '.claude', 'validators'))

from security_common import OverrideManager, OVERRIDE_FILE, OVERRIDE_LOCK_FILE


class PerformanceTest:
    """Performance testing framework."""

    def __init__(self):
        self.results = {}

    def time_operation(self, name, func, iterations=100, warmup=10):
        """Time an operation over multiple iterations."""
        # Warmup
        for _ in range(warmup):
            try:
                func()
            except Exception:
                pass

        # Actual timing
        times = []
        for _ in range(iterations):
            start = time.perf_counter()
            try:
                func()
            except Exception:
                pass
            end = time.perf_counter()
            times.append((end - start) * 1000)  # Convert to ms

        self.results[name] = {
            'min': min(times),
            'max': max(times),
            'mean': statistics.mean(times),
            'median': statistics.median(times),
            'stdev': statistics.stdev(times) if len(times) > 1 else 0,
            'p95': sorted(times)[int(len(times) * 0.95)],
            'p99': sorted(times)[int(len(times) * 0.99)],
        }

        return self.results[name]

    def print_results(self):
        """Print formatted results."""
        print("\n" + "=" * 70)
        print("  Performance Test Results")
        print("=" * 70)

        for name, stats in self.results.items():
            print(f"\n  {name}:")
            print(f"    Mean:   {stats['mean']:.3f} ms")
            print(f"    Median: {stats['median']:.3f} ms")
            print(f"    P95:    {stats['p95']:.3f} ms")
            print(f"    P99:    {stats['p99']:.3f} ms")
            print(f"    Min:    {stats['min']:.3f} ms")
            print(f"    Max:    {stats['max']:.3f} ms")


def cleanup_state():
    """Clean up state files between tests."""
    for f in [OVERRIDE_FILE, OVERRIDE_LOCK_FILE]:
        try:
            os.unlink(f)
        except FileNotFoundError:
            pass


def test_lock_acquisition():
    """Test lock acquisition performance."""
    cleanup_state()

    def acquire_release():
        fd = OverrideManager._acquire_lock(timeout=5.0)
        OverrideManager._release_lock(fd)

    return acquire_release


def test_override_check_not_set():
    """Test override check when not set (fast path)."""
    cleanup_state()
    # Make sure env var is NOT set
    if 'BMAD_ALLOW_PERF_TEST' in os.environ:
        del os.environ['BMAD_ALLOW_PERF_TEST']

    def check():
        OverrideManager.check_and_consume_override('PERF_TEST')

    return check


def test_override_check_and_consume():
    """Test full override check and consume."""
    counter = [0]

    def check_consume():
        counter[0] += 1
        env_var = f'BMAD_ALLOW_PERF_{counter[0]}'
        os.environ[env_var] = 'true'
        OverrideManager.check_and_consume_override(f'PERF_{counter[0]}')

    return check_consume


def test_token_validation_disabled():
    """Test token validation when enforcement disabled."""
    os.environ['BMAD_TOKEN_REQUIRED'] = 'false'
    from token_validator import validate_token

    return validate_token


def test_session_cache_hit():
    """Test session cache hit performance."""
    from token_validator import mark_session_validated, is_session_recently_validated

    # Ensure session is marked as validated
    mark_session_validated()

    return is_session_recently_validated


def test_rbac_validation():
    """Test RBAC validation performance."""
    from token_validator import validate_rbac

    claims = {'roles': ['developer', 'analyst', 'security_lead']}

    def validate():
        validate_rbac(claims, 'developer')

    return validate


def run_performance_tests():
    """Run all performance tests."""
    perf = PerformanceTest()

    print("Running performance tests...")
    print("(100 iterations each, 10 warmup)")

    # Test 1: Lock acquisition
    print("\n  Testing: Lock acquisition...")
    perf.time_operation("Lock Acquire/Release", test_lock_acquisition())

    # Test 2: Override check (not set - fast path)
    print("  Testing: Override check (not set)...")
    perf.time_operation("Override Check (not set)", test_override_check_not_set())

    # Test 3: Override check and consume
    print("  Testing: Override check and consume...")
    perf.time_operation("Override Check+Consume", test_override_check_and_consume(), iterations=50)

    # Test 4: Token validation (disabled)
    print("  Testing: Token validation (disabled)...")
    perf.time_operation("Token Validation (disabled)", test_token_validation_disabled())

    # Test 5: Session cache hit
    print("  Testing: Session cache hit...")
    perf.time_operation("Session Cache Hit", test_session_cache_hit())

    # Test 6: RBAC validation
    print("  Testing: RBAC validation...")
    perf.time_operation("RBAC Validation", test_rbac_validation())

    # Print results
    perf.print_results()

    # Check against targets
    print("\n" + "=" * 70)
    print("  Performance Targets Check")
    print("=" * 70)

    targets = {
        "Lock Acquire/Release": 100,      # < 100ms (actual lock, not timeout)
        "Override Check (not set)": 1,    # < 1ms for fast path
        "Override Check+Consume": 50,     # < 50ms including disk I/O
        "Token Validation (disabled)": 10, # < 10ms
        "Session Cache Hit": 5,           # < 5ms
        "RBAC Validation": 1,             # < 1ms
    }

    all_passed = True
    for name, target in targets.items():
        if name in perf.results:
            p95 = perf.results[name]['p95']
            passed = p95 < target
            status = "PASS" if passed else "FAIL"
            print(f"  [{status}] {name}: P95 {p95:.3f}ms (target: <{target}ms)")
            if not passed:
                all_passed = False

    print("\n" + "=" * 70)
    if all_passed:
        print("  All performance targets met!")
    else:
        print("  WARNING: Some performance targets missed!")
    print("=" * 70)

    return all_passed


if __name__ == '__main__':
    success = run_performance_tests()
    sys.exit(0 if success else 1)
