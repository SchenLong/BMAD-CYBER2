#!/usr/bin/env python3
"""
BMAD Guardrails: Override Manager Unit Tests
=============================================
Tests for the TOCTOU-safe OverrideManager implementation.

These tests verify:
1. Concurrent override consumption (only ONE should succeed)
2. Lock timeout handling
3. Override expiration
4. Atomic state updates

Run with: python3 -m pytest tests/test_override_manager.py -v
"""

import os
import sys
import time
import tempfile
import unittest
from concurrent.futures import ThreadPoolExecutor, as_completed

# Add validators directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '.claude', 'validators'))

# Set up test environment before importing
TEST_DIR = tempfile.mkdtemp(prefix='bmad_test_')
os.environ['CLAUDE_PROJECT_DIR'] = TEST_DIR
os.makedirs(os.path.join(TEST_DIR, '.claude'), exist_ok=True)

# Now import after setting up environment
from security_common import OverrideManager, OVERRIDE_FILE, OVERRIDE_LOCK_FILE


class TestOverrideManagerRaceCondition(unittest.TestCase):
    """Test that TOCTOU vulnerability is fixed."""

    def setUp(self):
        """Clean up state before each test."""
        # Remove any existing state files
        for f in [OVERRIDE_FILE, OVERRIDE_LOCK_FILE]:
            try:
                os.unlink(f)
            except FileNotFoundError:
                pass

    def tearDown(self):
        """Clean up after each test."""
        # Clear any test environment variables
        for key in list(os.environ.keys()):
            if key.startswith('BMAD_ALLOW_TEST'):
                del os.environ[key]

    def test_concurrent_override_consumption(self):
        """
        Test that only ONE thread can successfully consume an override
        when multiple threads attempt simultaneously.

        This is the key TOCTOU test - previously, a race condition could
        allow multiple processes to consume the same override.
        """
        # Set up the override
        os.environ['BMAD_ALLOW_TEST_RACE'] = 'true'

        results = []
        num_threads = 10

        def try_consume():
            result, reason = OverrideManager.check_and_consume_override('TEST_RACE')
            return result, reason

        # Launch multiple threads simultaneously
        with ThreadPoolExecutor(max_workers=num_threads) as executor:
            futures = [executor.submit(try_consume) for _ in range(num_threads)]
            for future in as_completed(futures):
                result, reason = future.result()
                results.append(result)

        # Exactly ONE should succeed
        successful = sum(1 for r in results if r is True)
        self.assertEqual(successful, 1,
                        f"Expected exactly 1 success, got {successful}. "
                        f"TOCTOU vulnerability may still exist!")

    def test_override_expiration(self):
        """Test that overrides expire after timeout."""
        # We'll use a short timeout for testing
        import security_common
        original_timeout = security_common.OVERRIDE_TIMEOUT_SECONDS
        security_common.OVERRIDE_TIMEOUT_SECONDS = 1  # 1 second for testing

        try:
            os.environ['BMAD_ALLOW_TEST_EXPIRE'] = 'true'

            # First consume should succeed
            result1, _ = OverrideManager.check_and_consume_override('TEST_EXPIRE')
            self.assertTrue(result1, "First consume should succeed")

            # Reset the override
            os.environ['BMAD_ALLOW_TEST_EXPIRE'] = 'true'
            OverrideManager.register_override('TEST_EXPIRE')

            # Wait for expiration
            time.sleep(1.5)

            # After expiration, a new override should be needed
            result2, reason = OverrideManager.check_and_consume_override('TEST_EXPIRE')
            # Should succeed because env var is still set and old one expired
            self.assertTrue(result2, f"Should succeed after expiration: {reason}")

        finally:
            security_common.OVERRIDE_TIMEOUT_SECONDS = original_timeout

    def test_double_consume_fails(self):
        """Test that consuming same override twice fails."""
        os.environ['BMAD_ALLOW_TEST_DOUBLE'] = 'true'

        # First consume
        result1, reason1 = OverrideManager.check_and_consume_override('TEST_DOUBLE')
        self.assertTrue(result1, f"First consume should succeed: {reason1}")

        # Second consume should fail
        result2, reason2 = OverrideManager.check_and_consume_override('TEST_DOUBLE')
        self.assertFalse(result2, "Second consume should fail")
        self.assertIn('already consumed', reason2.lower())

    def test_override_not_set(self):
        """Test that missing env var returns false."""
        # Make sure env var is not set
        if 'BMAD_ALLOW_TEST_MISSING' in os.environ:
            del os.environ['BMAD_ALLOW_TEST_MISSING']

        result, reason = OverrideManager.check_and_consume_override('TEST_MISSING')
        self.assertFalse(result)
        self.assertIn('not set', reason.lower())

    def test_get_override_status(self):
        """Test status reporting."""
        os.environ['BMAD_ALLOW_TEST_STATUS'] = 'true'

        # Consume to create state
        OverrideManager.check_and_consume_override('TEST_STATUS')

        # Check status
        status = OverrideManager.get_override_status()
        self.assertIn('TEST_STATUS', status)
        self.assertFalse(status['TEST_STATUS']['available'])

    def test_atomic_write_integrity(self):
        """Test that state file is never corrupted."""
        import json

        os.environ['BMAD_ALLOW_TEST_ATOMIC'] = 'true'

        # Perform multiple operations
        for i in range(5):
            os.environ['BMAD_ALLOW_TEST_ATOMIC'] = 'true'
            OverrideManager.check_and_consume_override('TEST_ATOMIC')
            OverrideManager.register_override(f'TEST_ATOMIC_{i}')

        # Verify state file is valid JSON
        with open(OVERRIDE_FILE, 'r') as f:
            try:
                state = json.load(f)
                self.assertIn('overrides', state)
                self.assertIn('created_at', state)
            except json.JSONDecodeError as e:
                self.fail(f"State file corrupted: {e}")


class TestOverrideManagerLocking(unittest.TestCase):
    """Test locking behavior."""

    def setUp(self):
        """Clean up state before each test."""
        for f in [OVERRIDE_FILE, OVERRIDE_LOCK_FILE]:
            try:
                os.unlink(f)
            except FileNotFoundError:
                pass

    def test_lock_released_on_success(self):
        """Test that lock is released after successful operation."""
        os.environ['BMAD_ALLOW_TEST_LOCK1'] = 'true'

        # This should acquire and release lock
        OverrideManager.check_and_consume_override('TEST_LOCK1')

        # This should also work (lock was released)
        os.environ['BMAD_ALLOW_TEST_LOCK2'] = 'true'
        result, _ = OverrideManager.check_and_consume_override('TEST_LOCK2')
        self.assertTrue(result, "Second operation should succeed after lock release")

    def test_lock_released_on_failure(self):
        """Test that lock is released even when operation fails."""
        # Don't set env var - operation will fail
        result, _ = OverrideManager.check_and_consume_override('TEST_LOCK_FAIL')
        self.assertFalse(result)

        # Subsequent operation should still work
        os.environ['BMAD_ALLOW_TEST_LOCK_AFTER'] = 'true'
        result2, _ = OverrideManager.check_and_consume_override('TEST_LOCK_AFTER')
        self.assertTrue(result2, "Operation after failed one should succeed")


if __name__ == '__main__':
    # Run tests with verbosity
    unittest.main(verbosity=2)
