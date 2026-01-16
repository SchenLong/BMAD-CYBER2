#!/usr/bin/env python3
"""
BMAD Guardrails: Token Validator Unit Tests
============================================
Tests for the token validation implementation (P1 Security Fix).

These tests verify:
1. Token enforcement can be disabled
2. Missing token returns failure
3. Session caching works correctly
4. RBAC validation works

Run with: python3 -m pytest tests/test_token_validator.py -v
"""

import os
import sys
import time
import tempfile
import unittest
from pathlib import Path

# Set up test environment before importing
TEST_DIR = tempfile.mkdtemp(prefix='bmad_token_test_')
os.environ['CLAUDE_PROJECT_DIR'] = TEST_DIR
os.makedirs(os.path.join(TEST_DIR, '.claude'), exist_ok=True)
os.makedirs(os.path.join(TEST_DIR, '_bmad', 'core', 'security'), exist_ok=True)

# Add validators directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '.claude', 'validators'))


class TestTokenValidatorEnforcement(unittest.TestCase):
    """Test token enforcement settings."""

    def setUp(self):
        """Clean up environment before each test."""
        # Clear relevant env vars
        for key in ['BMAD_TOKEN_REQUIRED', 'BMAD_AUTH_TOKEN']:
            if key in os.environ:
                del os.environ[key]

        # Clean up session files
        session_files = [
            os.path.join(TEST_DIR, '.claude', '.session_validated'),
            os.path.join(TEST_DIR, '.claude', '.session_claims.json'),
        ]
        for f in session_files:
            try:
                os.unlink(f)
            except FileNotFoundError:
                pass

    def test_enforcement_disabled(self):
        """Test that token enforcement can be disabled."""
        os.environ['BMAD_TOKEN_REQUIRED'] = 'false'

        from token_validator import validate_token
        is_valid, error, claims = validate_token()

        self.assertTrue(is_valid)
        self.assertIsNone(error)
        self.assertTrue(claims.get('enforcement_disabled'))

    def test_missing_token_fails(self):
        """Test that missing token returns failure when enforcement enabled."""
        os.environ['BMAD_TOKEN_REQUIRED'] = 'true'
        # Make sure no token file exists
        token_file = os.path.join(TEST_DIR, '.bmad-token')
        try:
            os.unlink(token_file)
        except FileNotFoundError:
            pass

        from token_validator import validate_token
        is_valid, error, claims = validate_token()

        self.assertFalse(is_valid)
        self.assertIn('No token found', error)


class TestSessionCaching(unittest.TestCase):
    """Test session validation caching."""

    def setUp(self):
        """Clean up before each test."""
        session_files = [
            os.path.join(TEST_DIR, '.claude', '.session_validated'),
            os.path.join(TEST_DIR, '.claude', '.session_claims.json'),
        ]
        for f in session_files:
            try:
                os.unlink(f)
            except FileNotFoundError:
                pass

    def test_session_not_validated_initially(self):
        """Test that session is not validated initially."""
        from token_validator import is_session_recently_validated
        self.assertFalse(is_session_recently_validated())

    def test_mark_session_validated(self):
        """Test marking session as validated."""
        from token_validator import mark_session_validated, is_session_recently_validated

        mark_session_validated()
        self.assertTrue(is_session_recently_validated())

    def test_session_claims_persistence(self):
        """Test that session claims are saved and loaded correctly."""
        from token_validator import save_session_claims, get_cached_claims

        test_claims = {
            'name': 'TestUser',
            'roles': ['developer', 'admin'],
            'sub': 'test-uuid'
        }

        save_session_claims(test_claims)
        loaded = get_cached_claims()

        self.assertEqual(loaded['name'], 'TestUser')
        self.assertEqual(loaded['roles'], ['developer', 'admin'])


class TestRBACValidation(unittest.TestCase):
    """Test RBAC validation."""

    def test_admin_always_authorized(self):
        """Test that admin role is always authorized."""
        from token_validator import validate_rbac

        claims = {'roles': ['admin']}
        is_ok, error = validate_rbac(claims, 'any_role')

        self.assertTrue(is_ok)
        self.assertIsNone(error)

    def test_missing_role_fails(self):
        """Test that missing required role fails."""
        from token_validator import validate_rbac

        claims = {'roles': ['developer']}
        is_ok, error = validate_rbac(claims, 'admin')

        self.assertFalse(is_ok)
        self.assertIn('required', error)

    def test_matching_role_succeeds(self):
        """Test that matching role succeeds."""
        from token_validator import validate_rbac

        claims = {'roles': ['developer', 'analyst']}
        is_ok, error = validate_rbac(claims, 'developer')

        self.assertTrue(is_ok)
        self.assertIsNone(error)

    def test_no_required_role_always_succeeds(self):
        """Test that no required role means always authorized."""
        from token_validator import validate_rbac

        claims = {'roles': []}
        is_ok, error = validate_rbac(claims, None)

        self.assertTrue(is_ok)

    def test_security_lead_elevated_access(self):
        """Test that security_lead has elevated access."""
        from token_validator import validate_rbac

        claims = {'roles': ['security_lead']}

        # Should be authorized for these roles
        for role in ['security_analyst', 'intel_analyst', 'developer']:
            is_ok, _ = validate_rbac(claims, role)
            self.assertTrue(is_ok, f"security_lead should have access to {role}")


class TestFilePermissions(unittest.TestCase):
    """Test file permission checking."""

    def test_secure_permissions(self):
        """Test that secure (600) permissions pass."""
        from token_validator import check_file_permissions

        test_file = os.path.join(TEST_DIR, 'secure_test')
        with open(test_file, 'w') as f:
            f.write('test')
        os.chmod(test_file, 0o600)

        is_ok, msg = check_file_permissions(test_file)
        self.assertTrue(is_ok)
        os.unlink(test_file)

    def test_insecure_permissions(self):
        """Test that insecure permissions are flagged."""
        from token_validator import check_file_permissions

        test_file = os.path.join(TEST_DIR, 'insecure_test')
        with open(test_file, 'w') as f:
            f.write('test')
        os.chmod(test_file, 0o644)  # World readable

        is_ok, msg = check_file_permissions(test_file)
        self.assertFalse(is_ok)
        self.assertIn('Insecure', msg)
        os.unlink(test_file)

    def test_missing_file(self):
        """Test that missing file returns error."""
        from token_validator import check_file_permissions

        is_ok, msg = check_file_permissions('/nonexistent/path')
        self.assertFalse(is_ok)
        self.assertIn('not found', msg)


if __name__ == '__main__':
    unittest.main(verbosity=2)
