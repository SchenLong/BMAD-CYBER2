#!/usr/bin/env python3
"""
BMAD Security Tests: Context Manager
=====================================
Tests for the context window management implementation (OWASP LLM04 - Model DoS).

Test Categories:
1. Token estimation
2. File token estimation
3. Operation token estimation
4. Capacity checking
5. Warning/blocking thresholds
6. State persistence
7. Session management
8. Suggestions

Run with: python3 -m pytest tests/test_context_manager.py -v
Or: python3 tests/test_context_manager.py
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
    from context_manager import (
        ContextManager,
        check_context_capacity,
        estimate_operation_cost,
        TokenEstimate,
        ContextStatus,
        CHARS_PER_TOKEN,
        MAX_CONTEXT_TOKENS,
        WARNING_THRESHOLD,
        BLOCK_THRESHOLD,
        FILE_TYPE_MULTIPLIERS,
    )
    IMPORT_SUCCESS = True
except ImportError as e:
    print(f"Warning: Could not import context_manager: {e}")
    IMPORT_SUCCESS = False


class TestContextManagerSetup(unittest.TestCase):
    """Test setup and initialization."""

    def setUp(self):
        """Create a temporary directory for state files."""
        self.temp_dir = tempfile.mkdtemp()
        self.original_state_file = None
        self.original_lock_file = None

        if IMPORT_SUCCESS:
            import context_manager
            self.original_state_file = context_manager.CONTEXT_STATE_FILE
            self.original_lock_file = context_manager.CONTEXT_LOCK_FILE
            self.original_project_dir = context_manager.PROJECT_DIR

            context_manager.CONTEXT_STATE_FILE = os.path.join(self.temp_dir, '.context_state.json')
            context_manager.CONTEXT_LOCK_FILE = os.path.join(self.temp_dir, '.context.lock')
            context_manager.PROJECT_DIR = self.temp_dir

            # Reset global instance
            context_manager._context_manager = None

    def tearDown(self):
        """Clean up temporary directory."""
        if IMPORT_SUCCESS and self.original_state_file:
            import context_manager
            context_manager.CONTEXT_STATE_FILE = self.original_state_file
            context_manager.CONTEXT_LOCK_FILE = self.original_lock_file
            context_manager.PROJECT_DIR = self.original_project_dir
            context_manager._context_manager = None
        shutil.rmtree(self.temp_dir, ignore_errors=True)


class TestTokenEstimation(TestContextManagerSetup):
    """Test token estimation functionality."""

    @unittest.skipUnless(IMPORT_SUCCESS, "context_manager not available")
    def test_estimate_tokens_simple_text(self):
        """Test token estimation for simple text."""
        manager = ContextManager()

        # 100 characters should be ~25 tokens (4 chars per token)
        text = "a" * 100
        tokens = manager.estimate_tokens(text)

        self.assertEqual(tokens, 25)

    @unittest.skipUnless(IMPORT_SUCCESS, "context_manager not available")
    def test_estimate_tokens_empty_string(self):
        """Test token estimation for empty string."""
        manager = ContextManager()

        tokens = manager.estimate_tokens("")

        self.assertEqual(tokens, 0)

    @unittest.skipUnless(IMPORT_SUCCESS, "context_manager not available")
    def test_estimate_tokens_minimum_one(self):
        """Test that minimum token count is 1 for non-empty text."""
        manager = ContextManager()

        # Single character should still be at least 1 token
        tokens = manager.estimate_tokens("a")

        self.assertGreaterEqual(tokens, 1)

    @unittest.skipUnless(IMPORT_SUCCESS, "context_manager not available")
    def test_estimate_tokens_longer_text(self):
        """Test token estimation for longer text."""
        manager = ContextManager()

        # 4000 characters should be ~1000 tokens
        text = "word " * 800  # 800 * 5 = 4000 chars
        tokens = manager.estimate_tokens(text)

        self.assertEqual(tokens, 1000)


class TestFileTokenEstimation(TestContextManagerSetup):
    """Test file token estimation."""

    @unittest.skipUnless(IMPORT_SUCCESS, "context_manager not available")
    def test_estimate_file_tokens_python(self):
        """Test token estimation for Python file."""
        # Create test Python file
        test_file = os.path.join(self.temp_dir, 'test.py')
        test_content = "def hello():\n    return 'world'\n" * 100  # ~3600 bytes
        with open(test_file, 'w') as f:
            f.write(test_content)

        manager = ContextManager()
        estimate = manager.estimate_file_tokens(test_file)

        self.assertIsInstance(estimate, TokenEstimate)
        self.assertEqual(estimate.source, 'file')
        self.assertGreater(estimate.tokens, 0)

    @unittest.skipUnless(IMPORT_SUCCESS, "context_manager not available")
    def test_estimate_file_tokens_json(self):
        """Test token estimation for JSON file with multiplier."""
        # Create test JSON file
        test_file = os.path.join(self.temp_dir, 'test.json')
        test_content = '{"key": "value", "nested": {"items": [1, 2, 3]}}\n' * 100
        with open(test_file, 'w') as f:
            f.write(test_content)

        manager = ContextManager()
        estimate = manager.estimate_file_tokens(test_file)

        # JSON has 1.2x multiplier
        base_tokens = os.path.getsize(test_file) // 4
        expected_tokens = int(base_tokens * 1.2)

        self.assertEqual(estimate.tokens, expected_tokens)

    @unittest.skipUnless(IMPORT_SUCCESS, "context_manager not available")
    def test_estimate_file_tokens_nonexistent(self):
        """Test token estimation for non-existent file."""
        manager = ContextManager()
        estimate = manager.estimate_file_tokens('/nonexistent/file.txt')

        self.assertEqual(estimate.tokens, 0)


class TestOperationTokenEstimation(TestContextManagerSetup):
    """Test operation token estimation."""

    @unittest.skipUnless(IMPORT_SUCCESS, "context_manager not available")
    def test_estimate_read_operation(self):
        """Test token estimation for read operation."""
        # Create test file
        test_file = os.path.join(self.temp_dir, 'readtest.txt')
        with open(test_file, 'w') as f:
            f.write("x" * 1000)  # 1000 bytes = ~250 tokens

        manager = ContextManager()
        estimate = manager.estimate_operation_tokens('read', {'file_path': test_file})

        self.assertEqual(estimate.source, 'file')
        self.assertGreater(estimate.tokens, 250)  # Include base overhead

    @unittest.skipUnless(IMPORT_SUCCESS, "context_manager not available")
    def test_estimate_write_operation(self):
        """Test token estimation for write operation."""
        manager = ContextManager()

        content = "x" * 400  # 400 chars = 100 tokens
        estimate = manager.estimate_operation_tokens('write', {'content': content})

        self.assertEqual(estimate.source, 'text')
        self.assertGreater(estimate.tokens, 100)  # Include base overhead

    @unittest.skipUnless(IMPORT_SUCCESS, "context_manager not available")
    def test_estimate_bash_operation(self):
        """Test token estimation for bash operation."""
        manager = ContextManager()

        estimate = manager.estimate_operation_tokens('bash', {'command': 'ls -la'})

        self.assertEqual(estimate.source, 'command')
        self.assertGreater(estimate.tokens, 500)  # Base + command + output estimate

    @unittest.skipUnless(IMPORT_SUCCESS, "context_manager not available")
    def test_estimate_task_operation(self):
        """Test token estimation for task operation."""
        manager = ContextManager()

        estimate = manager.estimate_operation_tokens('task', {'prompt': 'Do something complex'})

        self.assertEqual(estimate.source, 'text')
        self.assertGreater(estimate.tokens, 5000)  # Tasks have high overhead


class TestCapacityChecking(TestContextManagerSetup):
    """Test context capacity checking."""

    @unittest.skipUnless(IMPORT_SUCCESS, "context_manager not available")
    def test_check_capacity_empty_session(self):
        """Test capacity check on empty session."""
        manager = ContextManager()
        status = manager.check_capacity()

        self.assertIsInstance(status, ContextStatus)
        self.assertEqual(status.status, 'ok')
        self.assertEqual(status.tokens_used, 0)
        self.assertEqual(status.max_tokens, MAX_CONTEXT_TOKENS)

    @unittest.skipUnless(IMPORT_SUCCESS, "context_manager not available")
    def test_check_capacity_under_warning(self):
        """Test capacity check under warning threshold."""
        import context_manager

        manager = ContextManager()

        # Record operations to reach 50% capacity
        tokens_to_add = int(MAX_CONTEXT_TOKENS * 0.5)
        manager.record_operation('test', tokens_to_add)

        status = manager.check_capacity()

        self.assertEqual(status.status, 'ok')
        self.assertAlmostEqual(status.percentage, 0.5, places=1)

    @unittest.skipUnless(IMPORT_SUCCESS, "context_manager not available")
    def test_check_capacity_warning_threshold(self):
        """Test capacity check at warning threshold."""
        manager = ContextManager()

        # Record operations to reach 80% capacity (above 75% warning)
        tokens_to_add = int(MAX_CONTEXT_TOKENS * 0.80)
        manager.record_operation('test', tokens_to_add)

        status = manager.check_capacity()

        self.assertEqual(status.status, 'warning')
        self.assertIsNotNone(status.message)

    @unittest.skipUnless(IMPORT_SUCCESS, "context_manager not available")
    def test_check_capacity_block_threshold(self):
        """Test capacity check at block threshold."""
        manager = ContextManager()

        # Record operations to reach 96% capacity (above 95% block)
        tokens_to_add = int(MAX_CONTEXT_TOKENS * 0.96)
        manager.record_operation('test', tokens_to_add)

        status = manager.check_capacity()

        self.assertEqual(status.status, 'blocked')
        self.assertIsNotNone(status.message)


class TestCanAccommodate(TestContextManagerSetup):
    """Test can_accommodate functionality."""

    @unittest.skipUnless(IMPORT_SUCCESS, "context_manager not available")
    def test_can_accommodate_within_limits(self):
        """Test can_accommodate returns True within limits."""
        manager = ContextManager()

        can, message = manager.can_accommodate(1000)

        self.assertTrue(can)
        self.assertEqual(message, "OK")

    @unittest.skipUnless(IMPORT_SUCCESS, "context_manager not available")
    def test_can_accommodate_exceeds_limit(self):
        """Test can_accommodate returns False when exceeding limit."""
        manager = ContextManager()

        # First fill up to near limit
        tokens_to_add = int(MAX_CONTEXT_TOKENS * 0.94)
        manager.record_operation('fill', tokens_to_add)

        # Try to add more that would exceed
        additional = int(MAX_CONTEXT_TOKENS * 0.10)
        can, message = manager.can_accommodate(additional)

        self.assertFalse(can)
        self.assertIn('exceed', message.lower())

    @unittest.skipUnless(IMPORT_SUCCESS, "context_manager not available")
    def test_can_accommodate_warning(self):
        """Test can_accommodate returns warning when near limit."""
        manager = ContextManager()

        # Fill to 70%
        tokens_to_add = int(MAX_CONTEXT_TOKENS * 0.70)
        manager.record_operation('fill', tokens_to_add)

        # Adding 10% more should trigger warning (total 80%)
        additional = int(MAX_CONTEXT_TOKENS * 0.10)
        can, message = manager.can_accommodate(additional)

        self.assertTrue(can)
        self.assertIn('warning', message.lower())


class TestStatePersistence(TestContextManagerSetup):
    """Test state persistence across instances."""

    @unittest.skipUnless(IMPORT_SUCCESS, "context_manager not available")
    def test_state_persists_across_instances(self):
        """Test that recorded operations persist."""
        manager1 = ContextManager()
        manager1.record_operation('test', 10000)

        # Create new instance - should load state
        import context_manager
        context_manager._context_manager = None
        manager2 = ContextManager()

        status = manager2.check_capacity()

        self.assertEqual(status.tokens_used, 10000)

    @unittest.skipUnless(IMPORT_SUCCESS, "context_manager not available")
    def test_state_resets_after_timeout(self):
        """Test that state resets after inactivity timeout."""
        import context_manager

        # Create state with old timestamp
        old_state = {
            'session_id': 'old',
            'tokens_used': 100000,
            'operations': [],
            'warnings_issued': 0,
            'last_update': time.time() - 4000,  # Over 1 hour ago
            'created_at': time.time() - 4000,
        }

        with open(context_manager.CONTEXT_STATE_FILE, 'w') as f:
            json.dump(old_state, f)

        manager = ContextManager()
        status = manager.check_capacity()

        # Should have reset due to timeout
        self.assertEqual(status.tokens_used, 0)


class TestSessionManagement(TestContextManagerSetup):
    """Test session management."""

    @unittest.skipUnless(IMPORT_SUCCESS, "context_manager not available")
    def test_reset_clears_state(self):
        """Test that reset clears all state."""
        manager = ContextManager()

        # Add some usage
        manager.record_operation('test', 50000)

        # Reset
        manager.reset()

        status = manager.check_capacity()

        self.assertEqual(status.tokens_used, 0)
        self.assertEqual(status.status, 'ok')

    @unittest.skipUnless(IMPORT_SUCCESS, "context_manager not available")
    def test_get_status(self):
        """Test getting full status."""
        manager = ContextManager()
        manager.record_operation('test', 10000)

        status = manager.get_status()

        self.assertIn('status', status)
        self.assertIn('percentage', status)
        self.assertIn('tokens_used', status)
        self.assertIn('tokens_remaining', status)
        self.assertIn('session_id', status)
        self.assertEqual(status['tokens_used'], 10000)


class TestSuggestions(TestContextManagerSetup):
    """Test action suggestions."""

    @unittest.skipUnless(IMPORT_SUCCESS, "context_manager not available")
    def test_suggestions_under_50_percent(self):
        """Test no suggestions when under 50% capacity."""
        manager = ContextManager()
        manager.record_operation('test', int(MAX_CONTEXT_TOKENS * 0.40))

        suggestions = manager.suggest_actions()

        # Should have minimal or no suggestions
        self.assertLessEqual(len(suggestions), 2)

    @unittest.skipUnless(IMPORT_SUCCESS, "context_manager not available")
    def test_suggestions_over_warning(self):
        """Test suggestions when over warning threshold."""
        manager = ContextManager()
        manager.record_operation('test', int(MAX_CONTEXT_TOKENS * 0.80))

        suggestions = manager.suggest_actions()

        self.assertGreater(len(suggestions), 0)
        # Should include suggestions about summarizing or new session
        suggestion_text = ' '.join(suggestions).lower()
        self.assertTrue(
            'summariz' in suggestion_text or
            'new' in suggestion_text or
            'compact' in suggestion_text
        )


class TestConvenienceFunctions(TestContextManagerSetup):
    """Test convenience functions."""

    @unittest.skipUnless(IMPORT_SUCCESS, "context_manager not available")
    def test_check_context_capacity(self):
        """Test check_context_capacity function."""
        status, percentage, message = check_context_capacity()

        self.assertIn(status, ['ok', 'warning', 'critical', 'blocked'])
        self.assertIsInstance(percentage, float)

    @unittest.skipUnless(IMPORT_SUCCESS, "context_manager not available")
    def test_estimate_operation_cost(self):
        """Test estimate_operation_cost function."""
        tokens, description = estimate_operation_cost('bash', {'command': 'ls'})

        self.assertIsInstance(tokens, int)
        self.assertGreater(tokens, 0)
        self.assertIn('token', description.lower())


# ============================================================================
# Performance Tests
# ============================================================================

class TestPerformance(TestContextManagerSetup):
    """Performance benchmark tests."""

    @unittest.skipUnless(IMPORT_SUCCESS, "context_manager not available")
    def test_capacity_check_performance(self):
        """Test that capacity checks complete quickly."""
        manager = ContextManager()

        start_time = time.time()
        for _ in range(100):
            manager.check_capacity()
        elapsed = time.time() - start_time

        avg_time_ms = (elapsed / 100) * 1000
        print(f"\nAverage capacity check time: {avg_time_ms:.2f}ms")

        # Should complete in under 10ms per check
        self.assertLess(avg_time_ms, 10)

    @unittest.skipUnless(IMPORT_SUCCESS, "context_manager not available")
    def test_record_operation_performance(self):
        """Test that recording operations is fast."""
        manager = ContextManager()

        start_time = time.time()
        for i in range(100):
            manager.record_operation(f'test_{i}', 100)
        elapsed = time.time() - start_time

        avg_time_ms = (elapsed / 100) * 1000
        print(f"\nAverage record operation time: {avg_time_ms:.2f}ms")

        # Should complete in under 20ms per operation
        self.assertLess(avg_time_ms, 20)


if __name__ == '__main__':
    # Run tests with verbosity
    unittest.main(verbosity=2)
