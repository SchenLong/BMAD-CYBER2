#!/usr/bin/env python3
"""
BMAD Guardrails: Security Regression Tests
==========================================
Security-focused tests for P1 fixes ensuring no vulnerabilities remain.

These tests are adversarial - they attempt to bypass security controls.

Run with: python3 tests/test_security_regression.py
"""

import os
import sys
import time
import json
import tempfile
import unittest
import subprocess
import multiprocessing
from pathlib import Path

# Set up test environment
TEST_DIR = tempfile.mkdtemp(prefix='bmad_security_test_')
os.environ['CLAUDE_PROJECT_DIR'] = TEST_DIR
os.makedirs(os.path.join(TEST_DIR, '.claude'), exist_ok=True)

# Add validators to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '.claude', 'validators'))


def consume_override_worker(override_type, result_queue, shared_project_dir):
    """Worker function for multiprocessing race test."""
    # Critical: Set shared project dir BEFORE importing security_common
    os.environ['CLAUDE_PROJECT_DIR'] = shared_project_dir
    os.makedirs(os.path.join(shared_project_dir, '.claude'), exist_ok=True)

    # Re-import in subprocess with the shared directory
    sys.path.insert(0, os.path.join(shared_project_dir, '.claude', 'validators'))

    # Import fresh with correct PROJECT_DIR
    import importlib
    import security_common
    importlib.reload(security_common)

    from security_common import OverrideManager
    result, reason = OverrideManager.check_and_consume_override(override_type)
    result_queue.put(result)


class TestTOCTOURaceCondition(unittest.TestCase):
    """Adversarial tests for TOCTOU race condition fix."""

    def setUp(self):
        """Clean state before each test."""
        from security_common import OVERRIDE_FILE, OVERRIDE_LOCK_FILE
        for f in [OVERRIDE_FILE, OVERRIDE_LOCK_FILE]:
            try:
                os.unlink(f)
            except FileNotFoundError:
                pass

        # Clear env vars
        for key in list(os.environ.keys()):
            if key.startswith('BMAD_ALLOW_TEST'):
                del os.environ[key]

    def test_multiprocess_race_condition(self):
        """
        CRITICAL SECURITY TEST: Verify only ONE process can consume override.

        This test uses actual multiprocessing (not threading) to simulate
        real-world conditions where multiple Claude sessions might race.
        """
        # Use the ACTUAL project directory so all processes share the same lock file
        actual_project_dir = os.path.join(os.path.dirname(__file__), '..')
        actual_project_dir = os.path.abspath(actual_project_dir)

        # Clean up any existing state for this test
        test_override_file = os.path.join(actual_project_dir, '.claude', '.override_state.json')
        test_lock_file = os.path.join(actual_project_dir, '.claude', '.override.lock')
        for f in [test_override_file, test_lock_file]:
            try:
                os.unlink(f)
            except FileNotFoundError:
                pass

        os.environ['BMAD_ALLOW_TEST_MULTIPROC'] = 'true'

        num_processes = 10
        result_queue = multiprocessing.Queue()
        processes = []

        # Start all processes as close together as possible
        for _ in range(num_processes):
            p = multiprocessing.Process(
                target=consume_override_worker,
                args=('TEST_MULTIPROC', result_queue, actual_project_dir)
            )
            processes.append(p)

        # Start all at once
        for p in processes:
            p.start()

        # Wait for completion
        for p in processes:
            p.join(timeout=10)

        # Collect results
        results = []
        while not result_queue.empty():
            results.append(result_queue.get())

        successful = sum(1 for r in results if r is True)

        self.assertEqual(successful, 1,
            f"SECURITY FAILURE: {successful} processes consumed the same override! "
            f"Expected exactly 1. Race condition may still exist.")

    def test_lock_file_deletion_recovery(self):
        """Test that deleting lock file mid-operation doesn't corrupt state."""
        from security_common import OverrideManager, OVERRIDE_LOCK_FILE

        os.environ['BMAD_ALLOW_TEST_LOCKDEL'] = 'true'

        # First operation should succeed
        result1, _ = OverrideManager.check_and_consume_override('TEST_LOCKDEL')
        self.assertTrue(result1)

        # Delete lock file (simulating filesystem issue)
        try:
            os.unlink(OVERRIDE_LOCK_FILE)
        except FileNotFoundError:
            pass

        # Next operation should still work (recreates lock file)
        os.environ['BMAD_ALLOW_TEST_LOCKDEL2'] = 'true'
        result2, reason = OverrideManager.check_and_consume_override('TEST_LOCKDEL2')
        self.assertTrue(result2, f"Should recover from deleted lock file: {reason}")

    def test_state_file_corruption_recovery(self):
        """Test that corrupted state file doesn't crash the system."""
        from security_common import OverrideManager, OVERRIDE_FILE

        # Write corrupted JSON
        os.makedirs(os.path.dirname(OVERRIDE_FILE), exist_ok=True)
        with open(OVERRIDE_FILE, 'w') as f:
            f.write("{ invalid json }")

        os.environ['BMAD_ALLOW_TEST_CORRUPT'] = 'true'

        # Should not crash, should create new valid state
        result, reason = OverrideManager.check_and_consume_override('TEST_CORRUPT')
        self.assertTrue(result, f"Should recover from corrupted state: {reason}")

        # Verify state file is now valid JSON
        with open(OVERRIDE_FILE, 'r') as f:
            try:
                state = json.load(f)
                self.assertIn('overrides', state)
            except json.JSONDecodeError:
                self.fail("State file should be valid JSON after recovery")

    def test_rapid_sequential_overrides(self):
        """Test rapid override consumption doesn't cause issues."""
        from security_common import OverrideManager

        successes = 0
        failures = 0

        for i in range(20):
            env_var = f'BMAD_ALLOW_TEST_RAPID_{i}'
            os.environ[env_var] = 'true'

            result, _ = OverrideManager.check_and_consume_override(f'TEST_RAPID_{i}')
            if result:
                successes += 1
            else:
                failures += 1

        # All should succeed since they're different override types
        self.assertEqual(successes, 20, f"All rapid overrides should succeed: {successes}/20")


class TestTokenValidationSecurity(unittest.TestCase):
    """Security tests for token validation."""

    def setUp(self):
        """Clean up before each test."""
        for key in ['BMAD_TOKEN_REQUIRED', 'BMAD_AUTH_TOKEN']:
            if key in os.environ:
                del os.environ[key]

        session_files = [
            os.path.join(TEST_DIR, '.claude', '.session_validated'),
            os.path.join(TEST_DIR, '.claude', '.session_claims.json'),
        ]
        for f in session_files:
            try:
                os.unlink(f)
            except FileNotFoundError:
                pass

    def test_cannot_bypass_with_empty_token(self):
        """Test that empty token string doesn't bypass validation."""
        os.environ['BMAD_TOKEN_REQUIRED'] = 'true'
        os.environ['BMAD_AUTH_TOKEN'] = ''

        from token_validator import validate_token
        is_valid, error, _ = validate_token()

        self.assertFalse(is_valid, "Empty token should not validate")

    def test_cannot_bypass_with_whitespace_token(self):
        """Test that whitespace-only token doesn't bypass validation."""
        os.environ['BMAD_TOKEN_REQUIRED'] = 'true'
        os.environ['BMAD_AUTH_TOKEN'] = '   \n\t  '

        from token_validator import validate_token
        is_valid, error, _ = validate_token()

        self.assertFalse(is_valid, "Whitespace token should not validate")

    def test_rbac_cannot_escalate_to_admin(self):
        """Test that non-admin cannot access admin-only operations."""
        from token_validator import validate_rbac

        # Developer trying to access admin operation
        claims = {'roles': ['developer', 'analyst']}
        is_ok, error = validate_rbac(claims, 'admin')

        self.assertFalse(is_ok, "Developer should not have admin access")
        self.assertIn('required', error.lower())

    def test_session_cache_respects_expiration(self):
        """Test that session cache doesn't persist forever."""
        from token_validator import (
            mark_session_validated,
            is_session_recently_validated,
            SESSION_VALIDITY_SECONDS
        )
        import token_validator

        # Temporarily reduce validity for testing
        original = token_validator.SESSION_VALIDITY_SECONDS
        token_validator.SESSION_VALIDITY_SECONDS = 1

        try:
            mark_session_validated()
            self.assertTrue(is_session_recently_validated())

            # Wait for expiration
            time.sleep(1.5)

            self.assertFalse(is_session_recently_validated(),
                "Session cache should expire")
        finally:
            token_validator.SESSION_VALIDITY_SECONDS = original

    def test_claims_file_permissions(self):
        """Test that claims file is created with secure permissions."""
        from token_validator import save_session_claims, SESSION_CLAIMS_FILE

        test_claims = {'name': 'Test', 'roles': ['developer']}
        save_session_claims(test_claims)

        if os.path.exists(SESSION_CLAIMS_FILE):
            mode = os.stat(SESSION_CLAIMS_FILE).st_mode & 0o777
            self.assertEqual(mode, 0o600,
                f"Claims file should have 600 permissions, got {oct(mode)}")


class TestIntegrationSecurity(unittest.TestCase):
    """Integration security tests."""

    def test_validators_exist_and_executable(self):
        """Verify all security validators exist."""
        project_dir = os.path.join(os.path.dirname(__file__), '..')
        validators_dir = os.path.join(project_dir, '.claude', 'validators')

        required = [
            'security_common.py',
            'token_validator.py',
            'bash_safety.py',
            'secret_guard.py',
            'env_protection.py',
            'production_guard.py',
            'outside_repo_guard.py',
            'pii_guard.py',
            'prompt_injection_guard.py',
            'jailbreak_guard.py',
        ]

        for validator in required:
            path = os.path.join(validators_dir, validator)
            self.assertTrue(os.path.exists(path),
                f"Missing required validator: {validator}")

    def test_settings_json_valid(self):
        """Verify settings.json is valid and has required hooks."""
        project_dir = os.path.join(os.path.dirname(__file__), '..')
        settings_path = os.path.join(project_dir, '.claude', 'settings.json')

        with open(settings_path, 'r') as f:
            settings = json.load(f)

        # Verify SessionStart hooks exist
        self.assertIn('hooks', settings)
        self.assertIn('SessionStart', settings['hooks'])

        # Verify token_validator is in SessionStart
        session_hooks = settings['hooks']['SessionStart']
        hook_commands = []
        for hook_group in session_hooks:
            for hook in hook_group.get('hooks', []):
                hook_commands.append(hook.get('command', ''))

        token_validator_present = any('token_validator.py' in cmd for cmd in hook_commands)
        self.assertTrue(token_validator_present,
            "token_validator.py should be in SessionStart hooks")


if __name__ == '__main__':
    print("=" * 70)
    print("  BMAD Security Regression Tests")
    print("  Testing P1 Fixes: TOCTOU + Token Validation")
    print("=" * 70)
    print()

    # Run with verbosity
    unittest.main(verbosity=2)
