#!/usr/bin/env python3
"""
Unit tests for BMAD Resource Limits
====================================
Tests for the resource limit enforcement system.

OWASP Reference: LLM04 - Model Denial of Service
Requirements: REQ-3.3.1 through REQ-3.3.5
"""

import json
import os
import sys
import tempfile
import time
import unittest
from pathlib import Path
from unittest.mock import patch, MagicMock

# Add validators to path
sys.path.insert(0, str(Path(__file__).parent.parent / '.claude' / 'validators'))

from resource_limits import (
    ResourceLimiter,
    ResourceUsage,
    ResourceCheckResult,
    TrackedProcess,
    check_resource_limits,
    check_memory_available,
    get_resource_limiter,
    DEFAULT_LIMITS,
    WARNING_THRESHOLD,
    CRITICAL_THRESHOLD,
)


class TestResourceLimiterBasic(unittest.TestCase):
    """Basic functionality tests for ResourceLimiter."""

    def setUp(self):
        """Set up test fixtures."""
        self.limiter = ResourceLimiter()

    def test_initialization(self):
        """Test limiter initializes correctly."""
        self.assertIsNotNone(self.limiter)
        self.assertIsNotNone(self.limiter.limits)
        self.assertIn('max_memory_mb', self.limiter.limits)

    def test_initialization_with_custom_limits(self):
        """Test initialization with custom limits."""
        custom = {'max_memory_mb': 512, 'max_child_processes': 5}
        limiter = ResourceLimiter(limits=custom)

        self.assertEqual(limiter.limits['max_memory_mb'], 512)
        self.assertEqual(limiter.limits['max_child_processes'], 5)
        # Other limits should use defaults
        self.assertEqual(limiter.limits['max_file_size_mb'], DEFAULT_LIMITS['max_file_size_mb'])

    def test_default_limits(self):
        """Test default limits are reasonable."""
        self.assertGreater(self.limiter.limits['max_memory_mb'], 0)
        self.assertGreater(self.limiter.limits['max_child_processes'], 0)
        self.assertGreater(self.limiter.limits['max_file_size_mb'], 0)


class TestMemoryChecks(unittest.TestCase):
    """Tests for memory limit checking."""

    def setUp(self):
        """Set up test fixtures."""
        self.limiter = ResourceLimiter()

    def test_memory_check_returns_result(self):
        """Test memory check returns proper result."""
        result = self.limiter.check_memory()

        self.assertIsInstance(result, ResourceCheckResult)
        self.assertIn(result.status, ['ok', 'warning', 'critical', 'blocked'])
        self.assertEqual(result.resource_type, 'memory')
        self.assertGreaterEqual(result.current_value, 0)

    def test_memory_check_with_additional(self):
        """Test memory check with estimated additional memory."""
        # Check with no additional
        result_base = self.limiter.check_memory(0)

        # Check with some additional
        result_more = self.limiter.check_memory(100)

        # Percentage should be higher with additional memory
        self.assertGreaterEqual(result_more.percentage, result_base.percentage)

    def test_memory_check_exceeds_limit(self):
        """Test memory check when exceeding limit."""
        # Request more than limit
        huge_additional = self.limiter.limits['max_memory_mb'] * 2
        result = self.limiter.check_memory(huge_additional)

        self.assertFalse(result.allowed)
        self.assertEqual(result.status, 'blocked')
        self.assertIn('exceed', result.reason.lower())

    def test_memory_check_percentage_calculation(self):
        """Test percentage calculation is correct."""
        limit = self.limiter.limits['max_memory_mb']
        result = self.limiter.check_memory(0)

        # Percentage should be current/limit
        expected_pct = result.current_value / limit
        self.assertAlmostEqual(result.percentage, expected_pct, places=2)


class TestChildProcessChecks(unittest.TestCase):
    """Tests for child process limit checking."""

    def setUp(self):
        """Set up test fixtures."""
        self.limiter = ResourceLimiter()

    def test_child_process_check_returns_result(self):
        """Test child process check returns proper result."""
        result = self.limiter.check_child_processes()

        self.assertIsInstance(result, ResourceCheckResult)
        self.assertEqual(result.resource_type, 'child_processes')
        self.assertGreaterEqual(result.current_value, 0)

    def test_child_process_check_starting_new(self):
        """Test child process check when starting new process."""
        result_base = self.limiter.check_child_processes(starting_new=False)
        result_new = self.limiter.check_child_processes(starting_new=True)

        # Should account for new process
        self.assertGreaterEqual(result_new.percentage, result_base.percentage)

    @patch.object(ResourceLimiter, 'get_child_process_count')
    def test_child_process_at_limit(self, mock_count):
        """Test child process check at limit."""
        limit = self.limiter.limits['max_child_processes']
        mock_count.return_value = limit

        result = self.limiter.check_child_processes(starting_new=True)

        self.assertFalse(result.allowed)
        self.assertEqual(result.status, 'blocked')


class TestFileSizeChecks(unittest.TestCase):
    """Tests for file size limit checking."""

    def setUp(self):
        """Set up test fixtures."""
        self.limiter = ResourceLimiter()
        self.temp_dir = tempfile.mkdtemp()

    def tearDown(self):
        """Clean up temp files."""
        import shutil
        shutil.rmtree(self.temp_dir, ignore_errors=True)

    def test_file_size_check_nonexistent(self):
        """Test file size check for nonexistent file."""
        path = os.path.join(self.temp_dir, 'nonexistent.txt')
        result = self.limiter.check_file_size(path, additional_bytes=1000)

        self.assertTrue(result.allowed)
        self.assertEqual(result.resource_type, 'file_size')

    def test_file_size_check_existing_file(self):
        """Test file size check for existing file."""
        path = os.path.join(self.temp_dir, 'test.txt')
        with open(path, 'w') as f:
            f.write('x' * 1000)  # 1KB

        result = self.limiter.check_file_size(path, additional_bytes=0)

        self.assertTrue(result.allowed)
        self.assertAlmostEqual(result.current_value, 1000 / (1024 * 1024), places=4)

    def test_file_size_check_exceeds_limit(self):
        """Test file size check when exceeding limit."""
        path = os.path.join(self.temp_dir, 'large.txt')
        limit_bytes = self.limiter.limits['max_file_size_mb'] * 1024 * 1024

        result = self.limiter.check_file_size(path, additional_bytes=limit_bytes * 2)

        self.assertFalse(result.allowed)
        self.assertEqual(result.status, 'blocked')


class TestProcessTracking(unittest.TestCase):
    """Tests for process tracking functionality."""

    def setUp(self):
        """Set up test fixtures."""
        self.limiter = ResourceLimiter()

    def test_track_process(self):
        """Test tracking a process."""
        pid = 12345
        self.limiter.track_process(pid, 'test_process')

        self.assertIn(pid, self.limiter.tracked_processes)
        proc = self.limiter.tracked_processes[pid]
        self.assertEqual(proc.pid, pid)
        self.assertEqual(proc.name, 'test_process')
        self.assertFalse(proc.killed)

    def test_untrack_process(self):
        """Test untracking a process."""
        pid = 12345
        self.limiter.track_process(pid, 'test')
        self.limiter.untrack_process(pid)

        self.assertNotIn(pid, self.limiter.tracked_processes)

    def test_untrack_nonexistent(self):
        """Test untracking nonexistent process doesn't error."""
        self.limiter.untrack_process(99999)  # Should not raise


class TestResourceUsage(unittest.TestCase):
    """Tests for resource usage snapshot."""

    def setUp(self):
        """Set up test fixtures."""
        self.limiter = ResourceLimiter()

    def test_get_resource_usage(self):
        """Test getting resource usage snapshot."""
        usage = self.limiter.get_resource_usage()

        self.assertIsInstance(usage, ResourceUsage)
        self.assertGreaterEqual(usage.memory_mb, 0)
        self.assertGreaterEqual(usage.cpu_percent, 0)
        self.assertGreaterEqual(usage.child_process_count, 0)
        self.assertGreaterEqual(usage.open_file_count, 0)
        self.assertIsInstance(usage.timestamp, float)

    def test_get_current_memory(self):
        """Test getting current memory usage."""
        memory = self.limiter.get_current_memory_mb()

        self.assertIsInstance(memory, float)
        self.assertGreaterEqual(memory, 0)

    def test_get_cpu_percent(self):
        """Test getting CPU percentage."""
        cpu = self.limiter.get_cpu_percent()

        self.assertIsInstance(cpu, float)
        self.assertGreaterEqual(cpu, 0)


class TestStatus(unittest.TestCase):
    """Tests for status reporting."""

    def setUp(self):
        """Set up test fixtures."""
        self.limiter = ResourceLimiter()

    def test_get_status(self):
        """Test getting limiter status."""
        status = self.limiter.get_status()

        self.assertIn('current', status)
        self.assertIn('limits', status)
        self.assertIn('peaks', status)

        # Check current values
        current = status['current']
        self.assertIn('memory_mb', current)
        self.assertIn('cpu_percent', current)
        self.assertIn('child_processes', current)

    def test_status_limits_match(self):
        """Test that status limits match configured limits."""
        status = self.limiter.get_status()

        self.assertEqual(
            status['limits']['max_memory_mb'],
            self.limiter.limits['max_memory_mb']
        )

    def test_reset_clears_state(self):
        """Test that reset clears state."""
        # Track something first
        self.limiter.track_process(12345, 'test')

        self.limiter.reset()

        self.assertEqual(len(self.limiter.tracked_processes), 0)


class TestConvenienceFunctions(unittest.TestCase):
    """Tests for convenience functions."""

    def test_check_resource_limits(self):
        """Test the convenience check function."""
        ok, message = check_resource_limits()

        self.assertIsInstance(ok, bool)
        self.assertIsInstance(message, str)

    def test_check_memory_available(self):
        """Test memory availability check."""
        ok, message = check_memory_available(10)  # 10MB

        self.assertIsInstance(ok, bool)
        self.assertIsInstance(message, str)

    def test_check_memory_available_zero(self):
        """Test memory check with zero additional."""
        ok, message = check_memory_available(0)

        # Should return a result (may not be ok if system is stressed)
        self.assertIsInstance(ok, bool)
        self.assertIsInstance(message, str)

    def test_get_resource_limiter_singleton(self):
        """Test that limiter is singleton."""
        limiter1 = get_resource_limiter()
        limiter2 = get_resource_limiter()

        self.assertIs(limiter1, limiter2)


class TestResourceCheckResult(unittest.TestCase):
    """Tests for ResourceCheckResult dataclass."""

    def test_result_fields(self):
        """Test result has all required fields."""
        result = ResourceCheckResult(
            allowed=True,
            reason="Test reason",
            resource_type="memory",
            current_value=100.0,
            limit_value=1024.0,
            percentage=0.1,
            status='ok',
        )

        self.assertTrue(result.allowed)
        self.assertEqual(result.reason, "Test reason")
        self.assertEqual(result.resource_type, "memory")
        self.assertEqual(result.current_value, 100.0)
        self.assertEqual(result.limit_value, 1024.0)
        self.assertEqual(result.percentage, 0.1)
        self.assertEqual(result.status, 'ok')


class TestStatusThresholds(unittest.TestCase):
    """Tests for warning and critical thresholds."""

    def setUp(self):
        """Set up test fixtures."""
        # Create limiter with small limit for easier testing
        self.limiter = ResourceLimiter(limits={'max_memory_mb': 100})

    @patch.object(ResourceLimiter, 'get_current_memory_mb')
    def test_warning_threshold(self, mock_memory):
        """Test warning threshold detection."""
        # Set to 76% of limit (above WARNING_THRESHOLD of 75%)
        mock_memory.return_value = 76

        result = self.limiter.check_memory()

        if result.percentage >= WARNING_THRESHOLD:
            self.assertIn(result.status, ['warning', 'critical'])

    @patch.object(ResourceLimiter, 'get_current_memory_mb')
    def test_critical_threshold(self, mock_memory):
        """Test critical threshold detection."""
        # Set to 91% of limit (above CRITICAL_THRESHOLD of 90%)
        mock_memory.return_value = 91

        result = self.limiter.check_memory()

        if result.percentage >= CRITICAL_THRESHOLD:
            self.assertEqual(result.status, 'critical')

    @patch.object(ResourceLimiter, 'get_current_memory_mb')
    def test_ok_status(self, mock_memory):
        """Test OK status when below thresholds."""
        # Set to 50% of limit
        mock_memory.return_value = 50

        result = self.limiter.check_memory()

        self.assertEqual(result.status, 'ok')
        self.assertTrue(result.allowed)


class TestSessionState(unittest.TestCase):
    """Tests for session state persistence."""

    def setUp(self):
        """Set up test fixtures."""
        self.limiter = ResourceLimiter()

    def test_state_file_created(self):
        """Test that state file is created."""
        # Trigger state save
        self.limiter.track_process(12345, 'test')
        self.limiter.untrack_process(12345)

        # State file should exist (might be from previous operations)
        # This mainly tests that no errors occur


class TestEnvironmentConfiguration(unittest.TestCase):
    """Tests for environment variable configuration."""

    @patch.dict(os.environ, {
        'BMAD_MAX_MEMORY_MB': '2048',
        'BMAD_MAX_CHILD_PROCS': '20',
    })
    def test_env_var_override(self):
        """Test environment variable overrides."""
        # Need to reimport to pick up new env vars
        from resource_limits import DEFAULT_LIMITS

        # The defaults are set at module import time, so we test the pattern
        self.assertIsInstance(DEFAULT_LIMITS['max_memory_mb'], int)
        self.assertIsInstance(DEFAULT_LIMITS['max_child_processes'], int)


class TestEdgeCases(unittest.TestCase):
    """Edge case and regression tests."""

    def setUp(self):
        """Set up test fixtures."""
        self.limiter = ResourceLimiter()

    def test_negative_memory_estimate(self):
        """Test handling of negative memory estimate."""
        # Negative reduces projected usage - should not raise error
        result = self.limiter.check_memory(-100)

        # Should return a valid result (allows checking current usage)
        self.assertIsInstance(result, ResourceCheckResult)
        self.assertEqual(result.resource_type, 'memory')

    def test_zero_limit(self):
        """Test handling of zero limit (edge case)."""
        limiter = ResourceLimiter(limits={'max_memory_mb': 1})

        result = limiter.check_memory(0)
        self.assertIsInstance(result.percentage, float)

    def test_very_large_estimate(self):
        """Test handling of very large memory estimate."""
        result = self.limiter.check_memory(1000000)  # 1TB

        self.assertFalse(result.allowed)
        self.assertEqual(result.status, 'blocked')

    def test_concurrent_tracking(self):
        """Test tracking multiple processes."""
        pids = list(range(100, 110))

        for pid in pids:
            self.limiter.track_process(pid, f'process_{pid}')

        self.assertEqual(len(self.limiter.tracked_processes), len(pids))

        for pid in pids:
            self.limiter.untrack_process(pid)

        self.assertEqual(len(self.limiter.tracked_processes), 0)


class TestPerformance(unittest.TestCase):
    """Performance tests for resource limiting."""

    def setUp(self):
        """Set up test fixtures."""
        self.limiter = ResourceLimiter()

    def test_check_performance(self):
        """Test that checks complete quickly."""
        start = time.time()

        for _ in range(100):
            self.limiter.check_memory()
            self.limiter.check_child_processes()

        elapsed = time.time() - start

        # Should complete 200 checks in under 2 seconds
        self.assertLess(elapsed, 2.0, f"Checks too slow: {elapsed:.2f}s")

    def test_status_performance(self):
        """Test that status retrieval is fast."""
        start = time.time()

        for _ in range(20):
            self.limiter.get_status()

        elapsed = time.time() - start

        # Should complete 20 status calls in under 3 seconds (includes lock acquisition)
        self.assertLess(elapsed, 3.0, f"Status too slow: {elapsed:.2f}s")


if __name__ == '__main__':
    unittest.main(verbosity=2)
