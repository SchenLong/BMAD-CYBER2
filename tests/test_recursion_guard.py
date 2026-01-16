#!/usr/bin/env python3
"""
BMAD Security Tests: Recursion Guard
=====================================
Tests for the recursion guard implementation (OWASP LLM04 - Model DoS).

Test Categories:
1. Depth limiting
2. Directory traversal depth
3. Nested call tracking
4. Circular reference detection
5. Symlink depth tracking
6. State persistence
7. Reset functionality

Run with: python3 -m pytest tests/test_recursion_guard.py -v
Or: python3 tests/test_recursion_guard.py
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
    from recursion_guard import (
        RecursionGuard,
        check_recursion_limit,
        check_circular_reference,
        RecursionCheckResult,
        LIMITS,
    )
    IMPORT_SUCCESS = True
except ImportError as e:
    print(f"Warning: Could not import recursion_guard: {e}")
    IMPORT_SUCCESS = False


class TestRecursionGuardSetup(unittest.TestCase):
    """Test setup and initialization."""

    def setUp(self):
        """Create a temporary directory for state files."""
        self.temp_dir = tempfile.mkdtemp()
        self.original_state_file = None
        self.original_lock_file = None

        if IMPORT_SUCCESS:
            import recursion_guard
            self.original_state_file = recursion_guard.RECURSION_STATE_FILE
            self.original_lock_file = recursion_guard.RECURSION_LOCK_FILE
            self.original_project_dir = recursion_guard.PROJECT_DIR

            recursion_guard.RECURSION_STATE_FILE = os.path.join(self.temp_dir, '.recursion_state.json')
            recursion_guard.RECURSION_LOCK_FILE = os.path.join(self.temp_dir, '.recursion.lock')
            recursion_guard.PROJECT_DIR = self.temp_dir

            # Reset global instance
            recursion_guard._recursion_guard = None

    def tearDown(self):
        """Clean up temporary directory."""
        if IMPORT_SUCCESS and self.original_state_file:
            import recursion_guard
            recursion_guard.RECURSION_STATE_FILE = self.original_state_file
            recursion_guard.RECURSION_LOCK_FILE = self.original_lock_file
            recursion_guard.PROJECT_DIR = self.original_project_dir
            recursion_guard._recursion_guard = None
        shutil.rmtree(self.temp_dir, ignore_errors=True)


class TestDepthLimiting(TestRecursionGuardSetup):
    """Test basic depth limiting functionality."""

    @unittest.skipUnless(IMPORT_SUCCESS, "recursion_guard not available")
    def test_depth_within_limit_allowed(self):
        """Test that depth within limit is allowed."""
        guard = RecursionGuard()

        result = guard.check_depth('directory_traversal', current_depth=5)

        self.assertTrue(result.allowed)
        self.assertEqual(result.current_depth, 5)
        self.assertEqual(result.max_depth, LIMITS['directory_traversal'])

    @unittest.skipUnless(IMPORT_SUCCESS, "recursion_guard not available")
    def test_depth_at_limit_blocked(self):
        """Test that depth at limit is blocked."""
        guard = RecursionGuard()

        max_depth = LIMITS['directory_traversal']
        result = guard.check_depth('directory_traversal', current_depth=max_depth)

        self.assertFalse(result.allowed)
        self.assertIn('exceeded', result.reason.lower())

    @unittest.skipUnless(IMPORT_SUCCESS, "recursion_guard not available")
    def test_depth_exceeding_limit_blocked(self):
        """Test that depth exceeding limit is blocked."""
        guard = RecursionGuard()

        max_depth = LIMITS['directory_traversal']
        result = guard.check_depth('directory_traversal', current_depth=max_depth + 5)

        self.assertFalse(result.allowed)

    @unittest.skipUnless(IMPORT_SUCCESS, "recursion_guard not available")
    def test_different_recursion_types(self):
        """Test different recursion type limits."""
        guard = RecursionGuard()

        # Test directory traversal
        result1 = guard.check_depth('directory_traversal', current_depth=5)
        self.assertTrue(result1.allowed)
        self.assertEqual(result1.max_depth, LIMITS['directory_traversal'])

        # Test nested calls
        result2 = guard.check_depth('nested_calls', current_depth=15)
        self.assertTrue(result2.allowed)
        self.assertEqual(result2.max_depth, LIMITS['nested_calls'])

        # Test task depth
        result3 = guard.check_depth('task_depth', current_depth=3)
        self.assertTrue(result3.allowed)
        self.assertEqual(result3.max_depth, LIMITS['task_depth'])


class TestDirectoryTraversalDepth(TestRecursionGuardSetup):
    """Test directory traversal depth checking."""

    @unittest.skipUnless(IMPORT_SUCCESS, "recursion_guard not available")
    def test_shallow_path_allowed(self):
        """Test that shallow paths are allowed."""
        guard = RecursionGuard()

        path = os.path.join(self.temp_dir, 'a', 'b', 'file.txt')
        result = guard.check_directory_depth(path, self.temp_dir)

        self.assertTrue(result.allowed)
        self.assertLessEqual(result.current_depth, LIMITS['directory_traversal'])

    @unittest.skipUnless(IMPORT_SUCCESS, "recursion_guard not available")
    def test_deep_path_blocked(self):
        """Test that deeply nested paths are blocked."""
        guard = RecursionGuard()

        # Create a path that exceeds the limit
        max_depth = LIMITS['directory_traversal']
        deep_path = os.path.join(self.temp_dir, *(['subdir'] * (max_depth + 2)), 'file.txt')

        result = guard.check_directory_depth(deep_path, self.temp_dir)

        self.assertFalse(result.allowed)
        self.assertGreater(result.current_depth, max_depth)

    @unittest.skipUnless(IMPORT_SUCCESS, "recursion_guard not available")
    def test_relative_path_calculation(self):
        """Test that depth is calculated relative to base."""
        guard = RecursionGuard()

        # Path 3 levels deep
        path = os.path.join(self.temp_dir, 'a', 'b', 'c', 'file.txt')
        result = guard.check_directory_depth(path, self.temp_dir)

        self.assertTrue(result.allowed)
        self.assertEqual(result.current_depth, 4)  # a/b/c/file.txt = 4 components


class TestNestedCallTracking(TestRecursionGuardSetup):
    """Test nested call stack tracking."""

    @unittest.skipUnless(IMPORT_SUCCESS, "recursion_guard not available")
    def test_push_call_allowed(self):
        """Test pushing a call onto the stack."""
        guard = RecursionGuard()

        result = guard.push_call('call_1')

        self.assertTrue(result.allowed)
        self.assertEqual(result.current_depth, 1)

    @unittest.skipUnless(IMPORT_SUCCESS, "recursion_guard not available")
    def test_multiple_push_calls(self):
        """Test pushing multiple calls."""
        guard = RecursionGuard()

        result1 = guard.push_call('call_1')
        result2 = guard.push_call('call_2')
        result3 = guard.push_call('call_3')

        self.assertTrue(result1.allowed)
        self.assertTrue(result2.allowed)
        self.assertTrue(result3.allowed)
        self.assertEqual(result3.current_depth, 3)

    @unittest.skipUnless(IMPORT_SUCCESS, "recursion_guard not available")
    def test_push_call_exceeds_limit(self):
        """Test that exceeding call stack limit is blocked."""
        guard = RecursionGuard()

        max_depth = LIMITS['nested_calls']

        # Push calls up to limit
        for i in range(max_depth):
            result = guard.push_call(f'call_{i}')
            self.assertTrue(result.allowed)

        # Next push should fail
        result = guard.push_call('call_overflow')
        self.assertFalse(result.allowed)

    @unittest.skipUnless(IMPORT_SUCCESS, "recursion_guard not available")
    def test_pop_call_reduces_depth(self):
        """Test that popping calls reduces depth."""
        guard = RecursionGuard()

        guard.push_call('call_1')
        guard.push_call('call_2')

        guard.pop_call('call_2')

        # Push another call - should be depth 2 now
        result = guard.push_call('call_3')
        self.assertEqual(result.current_depth, 2)

    @unittest.skipUnless(IMPORT_SUCCESS, "recursion_guard not available")
    def test_circular_call_detected(self):
        """Test detection of circular calls."""
        guard = RecursionGuard()

        result1 = guard.push_call('call_a')
        self.assertTrue(result1.allowed)

        # Try to push same call again (circular)
        result2 = guard.push_call('call_a')
        self.assertFalse(result2.allowed)
        self.assertTrue(result2.is_circular)


class TestCircularReferenceDetection(TestRecursionGuardSetup):
    """Test circular reference detection in operations."""

    @unittest.skipUnless(IMPORT_SUCCESS, "recursion_guard not available")
    def test_unique_operations_allowed(self):
        """Test that unique operations are allowed."""
        guard = RecursionGuard()

        result1 = guard.check_circular('read', '/path/to/file1.txt')
        result2 = guard.check_circular('read', '/path/to/file2.txt')
        result3 = guard.check_circular('write', '/path/to/file3.txt')

        self.assertTrue(result1.allowed)
        self.assertTrue(result2.allowed)
        self.assertTrue(result3.allowed)

    @unittest.skipUnless(IMPORT_SUCCESS, "recursion_guard not available")
    def test_repeated_operation_pattern_detected(self):
        """Test detection of repeated operation patterns."""
        guard = RecursionGuard()

        # Create a repeating pattern
        for _ in range(10):
            guard.check_circular('read', '/path/file.txt')

        # After many repetitions, should detect circular pattern
        result = guard.check_circular('read', '/path/file.txt')

        # The 11th repetition of same operation should trigger detection
        # (threshold is 5 occurrences in last 20)
        self.assertFalse(result.allowed)
        self.assertTrue(result.is_circular)

    @unittest.skipUnless(IMPORT_SUCCESS, "recursion_guard not available")
    def test_history_limited(self):
        """Test that history is limited in size."""
        guard = RecursionGuard()

        # Add many unique operations
        for i in range(100):
            guard.check_circular('read', f'/unique/path/{i}.txt')

        status = guard.get_status()

        # History should be limited to CIRCULAR_WINDOW_SIZE (50)
        self.assertLessEqual(status['path_history_length'], 50)


class TestSymlinkDepthTracking(TestRecursionGuardSetup):
    """Test symlink following depth tracking."""

    @unittest.skipUnless(IMPORT_SUCCESS, "recursion_guard not available")
    def test_non_symlink_allowed(self):
        """Test that non-symlink paths are allowed."""
        # Create a regular file
        test_file = os.path.join(self.temp_dir, 'regular.txt')
        with open(test_file, 'w') as f:
            f.write('content')

        guard = RecursionGuard()
        result = guard.check_symlink_depth(test_file)

        self.assertTrue(result.allowed)

    @unittest.skipUnless(IMPORT_SUCCESS, "recursion_guard not available")
    def test_symlink_counted(self):
        """Test that symlinks are counted."""
        # Create a file and symlink to it
        test_file = os.path.join(self.temp_dir, 'target.txt')
        with open(test_file, 'w') as f:
            f.write('content')

        symlink = os.path.join(self.temp_dir, 'link.txt')
        try:
            os.symlink(test_file, symlink)
        except OSError:
            self.skipTest("Symlinks not supported on this system")

        guard = RecursionGuard()
        result = guard.check_symlink_depth(symlink)

        self.assertTrue(result.allowed)
        self.assertEqual(result.current_depth, 1)

    @unittest.skipUnless(IMPORT_SUCCESS, "recursion_guard not available")
    def test_excessive_symlinks_blocked(self):
        """Test that excessive symlink following is blocked."""
        guard = RecursionGuard()

        # Create test file
        test_file = os.path.join(self.temp_dir, 'target.txt')
        with open(test_file, 'w') as f:
            f.write('content')

        try:
            # Create symlinks up to limit
            max_follows = LIMITS['symlink_follows']
            for i in range(max_follows):
                symlink = os.path.join(self.temp_dir, f'link_{i}.txt')
                os.symlink(test_file, symlink)
                result = guard.check_symlink_depth(symlink)
                self.assertTrue(result.allowed)

            # One more should fail
            extra_link = os.path.join(self.temp_dir, 'link_overflow.txt')
            os.symlink(test_file, extra_link)
            result = guard.check_symlink_depth(extra_link)
            self.assertFalse(result.allowed)

        except OSError:
            self.skipTest("Symlinks not supported on this system")


class TestStatePersistence(TestRecursionGuardSetup):
    """Test state persistence across instances."""

    @unittest.skipUnless(IMPORT_SUCCESS, "recursion_guard not available")
    def test_call_stack_persists(self):
        """Test that call stack persists across instances."""
        guard1 = RecursionGuard()
        guard1.push_call('persistent_call')

        # Create new instance
        import recursion_guard
        recursion_guard._recursion_guard = None
        guard2 = RecursionGuard()

        # Push another call - depth should reflect previous
        result = guard2.push_call('new_call')
        self.assertEqual(result.current_depth, 2)

    @unittest.skipUnless(IMPORT_SUCCESS, "recursion_guard not available")
    def test_state_clears_after_timeout(self):
        """Test that state clears after timeout."""
        import recursion_guard

        # Create state with old timestamp
        old_state = {
            'call_stack': ['old_call'],
            'path_history': ['old_hash'],
            'depth_counters': {'symlinks': 10},
            'circular_refs_detected': 5,
            'last_update': time.time() - 400,  # Over 5 minutes ago
            'session_id': 'old_session',
        }

        with open(recursion_guard.RECURSION_STATE_FILE, 'w') as f:
            json.dump(old_state, f)

        guard = RecursionGuard()
        status = guard.get_status()

        # State should have been reset
        self.assertEqual(status['call_stack_depth'], 0)


class TestResetFunctionality(TestRecursionGuardSetup):
    """Test reset functionality."""

    @unittest.skipUnless(IMPORT_SUCCESS, "recursion_guard not available")
    def test_reset_clears_state(self):
        """Test that reset clears all tracking state."""
        guard = RecursionGuard()

        # Add some state
        guard.push_call('call_1')
        guard.push_call('call_2')
        guard.check_circular('op', '/path')
        guard.check_circular('op', '/path')

        # Reset
        guard.reset()

        status = guard.get_status()

        self.assertEqual(status['call_stack_depth'], 0)
        self.assertEqual(status['path_history_length'], 0)
        self.assertEqual(status['circular_refs_detected'], 0)


class TestConvenienceFunctions(TestRecursionGuardSetup):
    """Test convenience functions."""

    @unittest.skipUnless(IMPORT_SUCCESS, "recursion_guard not available")
    def test_check_recursion_limit(self):
        """Test check_recursion_limit function."""
        allowed, message = check_recursion_limit('directory_traversal', 5)

        self.assertTrue(allowed)
        self.assertIsInstance(message, str)

    @unittest.skipUnless(IMPORT_SUCCESS, "recursion_guard not available")
    def test_check_circular_reference(self):
        """Test check_circular_reference function."""
        allowed, message = check_circular_reference('read', '/path/to/file.txt')

        self.assertTrue(allowed)
        self.assertIsInstance(message, str)


class TestGetStatus(TestRecursionGuardSetup):
    """Test status reporting."""

    @unittest.skipUnless(IMPORT_SUCCESS, "recursion_guard not available")
    def test_get_status_returns_all_fields(self):
        """Test that get_status returns all expected fields."""
        guard = RecursionGuard()

        status = guard.get_status()

        self.assertIn('call_stack_depth', status)
        self.assertIn('path_history_length', status)
        self.assertIn('circular_refs_detected', status)
        self.assertIn('depth_counters', status)
        self.assertIn('limits', status)
        self.assertIn('session_id', status)

    @unittest.skipUnless(IMPORT_SUCCESS, "recursion_guard not available")
    def test_get_status_reflects_activity(self):
        """Test that status reflects activity."""
        guard = RecursionGuard()

        guard.push_call('call_1')
        guard.push_call('call_2')

        status = guard.get_status()

        self.assertEqual(status['call_stack_depth'], 2)


# ============================================================================
# Performance Tests
# ============================================================================

class TestPerformance(TestRecursionGuardSetup):
    """Performance benchmark tests."""

    @unittest.skipUnless(IMPORT_SUCCESS, "recursion_guard not available")
    def test_depth_check_performance(self):
        """Test that depth checks complete quickly."""
        guard = RecursionGuard()

        start_time = time.time()
        for _ in range(100):
            guard.check_depth('directory_traversal', 5)
        elapsed = time.time() - start_time

        avg_time_ms = (elapsed / 100) * 1000
        print(f"\nAverage depth check time: {avg_time_ms:.2f}ms")

        # Should complete in under 5ms per check
        self.assertLess(avg_time_ms, 5)

    @unittest.skipUnless(IMPORT_SUCCESS, "recursion_guard not available")
    def test_circular_check_performance(self):
        """Test that circular reference checks complete quickly."""
        guard = RecursionGuard()

        start_time = time.time()
        for i in range(100):
            guard.check_circular('read', f'/path/to/file_{i}.txt')
        elapsed = time.time() - start_time

        avg_time_ms = (elapsed / 100) * 1000
        print(f"\nAverage circular check time: {avg_time_ms:.2f}ms")

        # Should complete in under 15ms per check
        self.assertLess(avg_time_ms, 15)

    @unittest.skipUnless(IMPORT_SUCCESS, "recursion_guard not available")
    def test_push_pop_performance(self):
        """Test that push/pop operations are fast."""
        guard = RecursionGuard()

        start_time = time.time()
        for i in range(50):
            guard.push_call(f'call_{i}')
        for i in range(50):
            guard.pop_call(f'call_{i}')
        elapsed = time.time() - start_time

        avg_time_ms = (elapsed / 100) * 1000
        print(f"\nAverage push/pop time: {avg_time_ms:.2f}ms")

        # Should complete in under 20ms per operation
        self.assertLess(avg_time_ms, 20)


if __name__ == '__main__':
    # Run tests with verbosity
    unittest.main(verbosity=2)
