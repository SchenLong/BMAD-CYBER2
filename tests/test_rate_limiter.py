#!/usr/bin/env python3
"""
BMAD Security Tests: Rate Limiter
==================================
Tests for the rate limiting implementation (OWASP LLM04 - Model DoS).

Test Categories:
1. Sliding window algorithm
2. Per-operation type limits
3. Exponential backoff
4. Whitelist bypass
5. State persistence
6. Performance benchmarks

Run with: python3 -m pytest tests/test_rate_limiter.py -v
Or: python3 tests/test_rate_limiter.py
"""

import sys
import os
import time
import json
import unittest
import tempfile
import shutil

# Add validators directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '.claude', 'validators'))

try:
    from rate_limiter import (
        RateLimiter,
        check_rate_limit,
        record_operation,
        get_rate_status,
        RATE_LIMITS,
        WHITELIST_OPERATIONS,
        BACKOFF_BASE_SECONDS,
        BACKOFF_MULTIPLIER,
        BACKOFF_MAX_SECONDS,
    )
    IMPORT_SUCCESS = True
except ImportError as e:
    print(f"Warning: Could not import rate_limiter: {e}")
    IMPORT_SUCCESS = False


class TestRateLimiterSetup(unittest.TestCase):
    """Test setup and initialization."""

    def setUp(self):
        """Create a temporary directory for state files."""
        self.temp_dir = tempfile.mkdtemp()
        self.original_state_file = None
        self.original_lock_file = None

        if IMPORT_SUCCESS:
            import rate_limiter
            self.original_state_file = rate_limiter.RATE_STATE_FILE
            self.original_lock_file = rate_limiter.RATE_LOCK_FILE
            rate_limiter.RATE_STATE_FILE = os.path.join(self.temp_dir, '.rate_limit_state.json')
            rate_limiter.RATE_LOCK_FILE = os.path.join(self.temp_dir, '.rate_limit.lock')
            # Reset global instance
            rate_limiter._rate_limiter = None

    def tearDown(self):
        """Clean up temporary directory."""
        if IMPORT_SUCCESS and self.original_state_file:
            import rate_limiter
            rate_limiter.RATE_STATE_FILE = self.original_state_file
            rate_limiter.RATE_LOCK_FILE = self.original_lock_file
            rate_limiter._rate_limiter = None
        shutil.rmtree(self.temp_dir, ignore_errors=True)


class TestSlidingWindow(TestRateLimiterSetup):
    """Test the sliding window rate limiting algorithm."""

    @unittest.skipUnless(IMPORT_SUCCESS, "rate_limiter not available")
    def test_requests_within_limit_allowed(self):
        """Test that requests within limit are allowed."""
        limiter = RateLimiter()

        # First request should always be allowed
        allowed, message = limiter.check_limit('bash', 'echo hello')
        self.assertTrue(allowed)
        self.assertIsNone(message)

    @unittest.skipUnless(IMPORT_SUCCESS, "rate_limiter not available")
    def test_requests_exceeding_limit_blocked(self):
        """Test that requests exceeding limit are blocked."""
        import rate_limiter
        # Set a very low limit for testing
        original_limits = rate_limiter.RATE_LIMITS.copy()
        rate_limiter.RATE_LIMITS['test_op'] = {'requests': 3, 'window_seconds': 60}

        try:
            limiter = RateLimiter()

            # Record 3 requests (at limit)
            for i in range(3):
                limiter.record_request('test_op', f'target_{i}')

            # 4th request should be blocked
            allowed, message = limiter.check_limit('test_op', 'target_4')
            self.assertFalse(allowed)
            self.assertIn('Rate limit exceeded', message)
        finally:
            rate_limiter.RATE_LIMITS = original_limits

    @unittest.skipUnless(IMPORT_SUCCESS, "rate_limiter not available")
    def test_global_limit_applied(self):
        """Test that global limit applies across all operations."""
        import rate_limiter
        # Set low global limit
        original_global = rate_limiter.RATE_LIMITS['global'].copy()
        rate_limiter.RATE_LIMITS['global'] = {'requests': 5, 'window_seconds': 60}

        try:
            limiter = RateLimiter()

            # Record requests across different operations
            limiter.record_request('bash', 'cmd1')
            limiter.record_request('write', 'file1')
            limiter.record_request('read', 'file2')
            limiter.record_request('edit', 'file3')
            limiter.record_request('glob', 'pattern')

            # 6th request should hit global limit
            allowed, message = limiter.check_limit('bash', 'cmd2')
            self.assertFalse(allowed)
            self.assertIn('Global rate limit', message)
        finally:
            rate_limiter.RATE_LIMITS['global'] = original_global

    @unittest.skipUnless(IMPORT_SUCCESS, "rate_limiter not available")
    def test_window_expiration(self):
        """Test that old requests expire outside the window."""
        import rate_limiter

        limiter = RateLimiter()

        # Manually inject old request into state
        old_time = time.time() - 120  # 2 minutes ago (outside 60s window)

        lock_fd = limiter._acquire_lock()
        try:
            state = limiter._load_state()
            state['requests'] = {
                'bash': [
                    {'timestamp': old_time, 'target': 'old_cmd'},
                ]
            }
            limiter._save_state(state)
        finally:
            limiter._release_lock(lock_fd)

        # Check should pass because old request is outside window
        allowed, _ = limiter.check_limit('bash', 'new_cmd')
        self.assertTrue(allowed)


class TestOperationTypeLimits(TestRateLimiterSetup):
    """Test per-operation type limits."""

    @unittest.skipUnless(IMPORT_SUCCESS, "rate_limiter not available")
    def test_different_limits_per_operation(self):
        """Test that different operations have different limits."""
        # Verify configuration exists
        self.assertIn('bash', RATE_LIMITS)
        self.assertIn('write', RATE_LIMITS)
        self.assertIn('read', RATE_LIMITS)

        # Bash limit should be lower than read
        self.assertLess(RATE_LIMITS['bash']['requests'], RATE_LIMITS['read']['requests'])

    @unittest.skipUnless(IMPORT_SUCCESS, "rate_limiter not available")
    def test_operation_specific_blocking(self):
        """Test that blocking is operation-specific."""
        import rate_limiter
        # Set low limit for bash only
        original_bash = rate_limiter.RATE_LIMITS['bash'].copy()
        rate_limiter.RATE_LIMITS['bash'] = {'requests': 2, 'window_seconds': 60}

        try:
            limiter = RateLimiter()

            # Exhaust bash limit
            limiter.record_request('bash', 'cmd1')
            limiter.record_request('bash', 'cmd2')

            # Bash should be blocked
            allowed, message = limiter.check_limit('bash', 'cmd3')
            self.assertFalse(allowed)

            # But read should still work
            allowed, _ = limiter.check_limit('read', 'file')
            self.assertTrue(allowed)
        finally:
            rate_limiter.RATE_LIMITS['bash'] = original_bash


class TestExponentialBackoff(TestRateLimiterSetup):
    """Test exponential backoff on violations."""

    @unittest.skipUnless(IMPORT_SUCCESS, "rate_limiter not available")
    def test_backoff_activates_on_violation(self):
        """Test that backoff activates when limit is exceeded."""
        import rate_limiter
        rate_limiter.RATE_LIMITS['test_backoff'] = {'requests': 1, 'window_seconds': 60}

        try:
            limiter = RateLimiter()

            # First request allowed and recorded
            limiter.record_request('test_backoff', 'cmd1')

            # Second request triggers violation and backoff
            allowed, message = limiter.check_limit('test_backoff', 'cmd2')
            self.assertFalse(allowed)

            # Third request should be in backoff
            allowed, message = limiter.check_limit('test_backoff', 'cmd3')
            self.assertFalse(allowed)
            self.assertIn('backoff', message.lower())
        finally:
            del rate_limiter.RATE_LIMITS['test_backoff']

    @unittest.skipUnless(IMPORT_SUCCESS, "rate_limiter not available")
    def test_backoff_calculation(self):
        """Test exponential backoff calculation."""
        limiter = RateLimiter()

        # Backoff should increase exponentially
        backoff_1 = limiter._calculate_backoff(1)
        backoff_2 = limiter._calculate_backoff(2)
        backoff_3 = limiter._calculate_backoff(3)

        self.assertLess(backoff_1, backoff_2)
        self.assertLess(backoff_2, backoff_3)
        self.assertEqual(backoff_2, backoff_1 * BACKOFF_MULTIPLIER)

    @unittest.skipUnless(IMPORT_SUCCESS, "rate_limiter not available")
    def test_backoff_max_cap(self):
        """Test that backoff doesn't exceed maximum."""
        limiter = RateLimiter()

        # Even with many violations, backoff should be capped
        backoff_high = limiter._calculate_backoff(100)
        self.assertLessEqual(backoff_high, BACKOFF_MAX_SECONDS)


class TestWhitelistBypass(TestRateLimiterSetup):
    """Test whitelist bypass functionality."""

    @unittest.skipUnless(IMPORT_SUCCESS, "rate_limiter not available")
    def test_whitelisted_operations_bypass_limit(self):
        """Test that whitelisted operations bypass rate limit."""
        import rate_limiter
        rate_limiter.RATE_LIMITS['read'] = {'requests': 1, 'window_seconds': 60}

        try:
            limiter = RateLimiter()

            # Record a normal read
            limiter.record_request('read', '/some/file.txt')

            # Normal read should be blocked
            allowed, _ = limiter.check_limit('read', '/another/file.txt')
            self.assertFalse(allowed)

            # But reading CLAUDE.md (whitelisted) should always work
            allowed, _ = limiter.check_limit('read', 'CLAUDE.md')
            self.assertTrue(allowed)
        finally:
            rate_limiter.RATE_LIMITS['read'] = {'requests': 200, 'window_seconds': 60}

    @unittest.skipUnless(IMPORT_SUCCESS, "rate_limiter not available")
    def test_whitelist_patterns(self):
        """Test whitelist pattern matching."""
        limiter = RateLimiter()

        # Test various whitelisted patterns
        test_cases = [
            ('read', '.claude/settings.json', True),
            ('read', '.claude/validators/test.py', True),
            ('read', 'CLAUDE.md', True),
            ('bash', 'git status', True),
            ('bash', 'git log --oneline', True),
            ('read', '/etc/passwd', False),
            ('bash', 'rm -rf /', False),
        ]

        for operation, target, should_whitelist in test_cases:
            result = limiter._is_whitelisted(operation, target)
            self.assertEqual(result, should_whitelist,
                           f"{operation} '{target}' whitelist={result}, expected={should_whitelist}")


class TestStatePersistence(TestRateLimiterSetup):
    """Test state persistence across instances."""

    @unittest.skipUnless(IMPORT_SUCCESS, "rate_limiter not available")
    def test_state_persists_across_instances(self):
        """Test that rate limit state persists."""
        import rate_limiter
        rate_limiter.RATE_LIMITS['persist_test'] = {'requests': 5, 'window_seconds': 60}

        try:
            # First instance records requests
            limiter1 = RateLimiter()
            limiter1.record_request('persist_test', 'cmd1')
            limiter1.record_request('persist_test', 'cmd2')

            # New instance should see the same state
            limiter2 = RateLimiter()
            lock_fd = limiter2._acquire_lock()
            try:
                state = limiter2._load_state()
                requests = state.get('requests', {}).get('persist_test', [])
                self.assertEqual(len(requests), 2)
            finally:
                limiter2._release_lock(lock_fd)
        finally:
            del rate_limiter.RATE_LIMITS['persist_test']

    @unittest.skipUnless(IMPORT_SUCCESS, "rate_limiter not available")
    def test_reset_clears_state(self):
        """Test that reset clears state."""
        limiter = RateLimiter()

        # Record some requests
        limiter.record_request('bash', 'cmd1')
        limiter.record_request('write', 'file1')

        # Reset all
        limiter.reset()

        # State should be empty
        status = limiter.get_status()
        self.assertEqual(status['bash']['current'], 0)
        self.assertEqual(status['write']['current'], 0)

    @unittest.skipUnless(IMPORT_SUCCESS, "rate_limiter not available")
    def test_reset_specific_operation(self):
        """Test resetting a specific operation."""
        limiter = RateLimiter()

        limiter.record_request('bash', 'cmd1')
        limiter.record_request('write', 'file1')

        # Reset only bash
        limiter.reset('bash')

        status = limiter.get_status()
        self.assertEqual(status['bash']['current'], 0)
        self.assertEqual(status['write']['current'], 1)


class TestStatusMonitoring(TestRateLimiterSetup):
    """Test status monitoring functionality."""

    @unittest.skipUnless(IMPORT_SUCCESS, "rate_limiter not available")
    def test_get_status_returns_all_operations(self):
        """Test that status includes all configured operations."""
        limiter = RateLimiter()
        status = limiter.get_status()

        # Check standard operations (not test operations that may be added/removed)
        standard_ops = ['global', 'bash', 'write', 'edit', 'read', 'glob', 'grep', 'task']
        for operation in standard_ops:
            self.assertIn(operation, status)
            self.assertIn('current', status[operation])
            self.assertIn('limit', status[operation])
            self.assertIn('percentage', status[operation])

    @unittest.skipUnless(IMPORT_SUCCESS, "rate_limiter not available")
    def test_status_reflects_actual_usage(self):
        """Test that status accurately reflects usage."""
        limiter = RateLimiter()

        # Record some requests
        limiter.record_request('bash', 'cmd1')
        limiter.record_request('bash', 'cmd2')
        limiter.record_request('bash', 'cmd3')

        status = limiter.get_status()
        self.assertEqual(status['bash']['current'], 3)


class TestRetryAfter(TestRateLimiterSetup):
    """Test retry-after calculation."""

    @unittest.skipUnless(IMPORT_SUCCESS, "rate_limiter not available")
    def test_retry_after_zero_when_available(self):
        """Test that retry_after is 0 when limit not exceeded."""
        limiter = RateLimiter()
        retry = limiter.get_retry_after('bash')
        self.assertEqual(retry, 0)

    @unittest.skipUnless(IMPORT_SUCCESS, "rate_limiter not available")
    def test_retry_after_positive_in_backoff(self):
        """Test that retry_after is positive during backoff."""
        import rate_limiter
        rate_limiter.RATE_LIMITS['retry_test'] = {'requests': 1, 'window_seconds': 60}

        try:
            limiter = RateLimiter()

            # Trigger violation
            limiter.record_request('retry_test', 'cmd1')
            limiter.check_limit('retry_test', 'cmd2')  # Triggers backoff

            retry = limiter.get_retry_after('retry_test')
            self.assertGreater(retry, 0)
        finally:
            del rate_limiter.RATE_LIMITS['retry_test']


class TestConvenienceFunctions(TestRateLimiterSetup):
    """Test convenience functions."""

    @unittest.skipUnless(IMPORT_SUCCESS, "rate_limiter not available")
    def test_check_rate_limit_function(self):
        """Test the check_rate_limit convenience function."""
        allowed, message = check_rate_limit('bash', 'echo hello')
        self.assertTrue(allowed)

    @unittest.skipUnless(IMPORT_SUCCESS, "rate_limiter not available")
    def test_record_operation_function(self):
        """Test the record_operation convenience function."""
        # Should not raise
        record_operation('bash', 'echo hello')

        status = get_rate_status()
        self.assertGreater(status['bash']['current'], 0)

    @unittest.skipUnless(IMPORT_SUCCESS, "rate_limiter not available")
    def test_get_rate_status_function(self):
        """Test the get_rate_status convenience function."""
        status = get_rate_status()
        self.assertIsInstance(status, dict)
        self.assertIn('bash', status)


class TestPerformance(TestRateLimiterSetup):
    """Test performance characteristics."""

    @unittest.skipUnless(IMPORT_SUCCESS, "rate_limiter not available")
    def test_check_limit_performance(self):
        """Test that check_limit completes within acceptable time."""
        limiter = RateLimiter()

        start = time.time()
        for _ in range(100):
            limiter.check_limit('bash', 'echo test')
        elapsed = time.time() - start

        avg_ms = (elapsed / 100) * 1000
        self.assertLess(avg_ms, 10, f"Average check time {avg_ms:.1f}ms exceeds 10ms target")

    @unittest.skipUnless(IMPORT_SUCCESS, "rate_limiter not available")
    def test_record_performance(self):
        """Test that record_request is fast."""
        limiter = RateLimiter()

        start = time.time()
        for i in range(50):
            limiter.record_request('bash', f'cmd_{i}')
        elapsed = time.time() - start

        avg_ms = (elapsed / 50) * 1000
        self.assertLess(avg_ms, 20, f"Average record time {avg_ms:.1f}ms exceeds 20ms target")


class TestEdgeCases(TestRateLimiterSetup):
    """Test edge cases and error handling."""

    @unittest.skipUnless(IMPORT_SUCCESS, "rate_limiter not available")
    def test_empty_operation_name(self):
        """Test handling of empty operation name."""
        limiter = RateLimiter()
        allowed, _ = limiter.check_limit('', 'target')
        self.assertTrue(allowed)  # Unknown operations should be allowed

    @unittest.skipUnless(IMPORT_SUCCESS, "rate_limiter not available")
    def test_unknown_operation_allowed(self):
        """Test that unknown operations are allowed."""
        limiter = RateLimiter()
        allowed, _ = limiter.check_limit('unknown_operation_xyz', 'target')
        self.assertTrue(allowed)

    @unittest.skipUnless(IMPORT_SUCCESS, "rate_limiter not available")
    def test_very_long_target_truncated(self):
        """Test that very long targets are handled."""
        limiter = RateLimiter()
        long_target = 'x' * 10000

        # Should not raise
        limiter.record_request('bash', long_target)

        lock_fd = limiter._acquire_lock()
        try:
            state = limiter._load_state()
            recorded_target = state['requests']['bash'][0]['target']
            self.assertLess(len(recorded_target), 1000)  # Should be truncated
        finally:
            limiter._release_lock(lock_fd)

    @unittest.skipUnless(IMPORT_SUCCESS, "rate_limiter not available")
    def test_case_insensitive_operation(self):
        """Test that operation names are case-insensitive."""
        limiter = RateLimiter()

        limiter.record_request('BASH', 'cmd1')
        limiter.record_request('Bash', 'cmd2')
        limiter.record_request('bash', 'cmd3')

        status = limiter.get_status()
        self.assertEqual(status['bash']['current'], 3)


def run_tests():
    """Run all tests and print summary."""
    print("=" * 70)
    print("BMAD Rate Limiter Tests (OWASP LLM04)")
    print("=" * 70)

    loader = unittest.TestLoader()
    suite = unittest.TestSuite()

    # Add all test classes
    suite.addTests(loader.loadTestsFromTestCase(TestSlidingWindow))
    suite.addTests(loader.loadTestsFromTestCase(TestOperationTypeLimits))
    suite.addTests(loader.loadTestsFromTestCase(TestExponentialBackoff))
    suite.addTests(loader.loadTestsFromTestCase(TestWhitelistBypass))
    suite.addTests(loader.loadTestsFromTestCase(TestStatePersistence))
    suite.addTests(loader.loadTestsFromTestCase(TestStatusMonitoring))
    suite.addTests(loader.loadTestsFromTestCase(TestRetryAfter))
    suite.addTests(loader.loadTestsFromTestCase(TestConvenienceFunctions))
    suite.addTests(loader.loadTestsFromTestCase(TestPerformance))
    suite.addTests(loader.loadTestsFromTestCase(TestEdgeCases))

    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)

    print("\n" + "=" * 70)
    print("SUMMARY")
    print("=" * 70)
    print(f"Tests run: {result.testsRun}")
    print(f"Failures: {len(result.failures)}")
    print(f"Errors: {len(result.errors)}")
    print(f"Skipped: {len(result.skipped)}")

    if result.failures:
        print("\nFailed tests:")
        for test, _ in result.failures:
            print(f"  - {test}")

    if result.errors:
        print("\nError tests:")
        for test, _ in result.errors:
            print(f"  - {test}")

    success = len(result.failures) == 0 and len(result.errors) == 0
    print(f"\nOverall: {'PASS' if success else 'FAIL'}")
    print("=" * 70)

    return 0 if success else 1


if __name__ == '__main__':
    sys.exit(run_tests())
