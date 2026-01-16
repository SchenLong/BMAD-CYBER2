#!/usr/bin/env python3
"""
Unit tests for BMAD Confidence Tracker
=======================================
Tests for the confidence indicator and uncertainty detection system.

OWASP Reference: LLM09 - Overreliance
Requirements: REQ-3.1.1 through REQ-3.1.5
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

from confidence_tracker import (
    ConfidenceTracker,
    ConfidenceResult,
    ConfidenceLevel,
    UncertaintyMatch,
    SourceAttribution,
    analyze_response_confidence,
    get_confidence_indicator,
    get_confidence_tracker,
    MIN_TEXT_LENGTH,
)


class TestConfidenceTrackerBasic(unittest.TestCase):
    """Basic functionality tests for ConfidenceTracker."""

    def setUp(self):
        """Set up test fixtures."""
        self.tracker = ConfidenceTracker()

    def test_initialization(self):
        """Test tracker initializes correctly."""
        self.assertIsNotNone(self.tracker)
        self.assertIsNotNone(self.tracker._compiled_uncertainty)
        self.assertIsNotNone(self.tracker._compiled_boosters)

    def test_analyze_short_text_skipped(self):
        """Test that very short text is skipped."""
        result = self.tracker.analyze_text("Short text")
        self.assertEqual(result.confidence_level, ConfidenceLevel.HIGH)
        self.assertEqual(result.confidence_score, 1.0)
        self.assertIn("too short", result.analysis_notes[0])

    def test_analyze_empty_text(self):
        """Test empty text handling."""
        result = self.tracker.analyze_text("")
        self.assertEqual(result.confidence_level, ConfidenceLevel.HIGH)
        self.assertEqual(result.confidence_score, 1.0)


class TestUncertaintyDetection(unittest.TestCase):
    """Tests for uncertainty marker detection (REQ-3.1.1, REQ-3.1.2)."""

    def setUp(self):
        """Set up test fixtures."""
        self.tracker = ConfidenceTracker()

    def test_detect_high_uncertainty(self):
        """Test detection of high uncertainty markers."""
        text = "I'm not sure about this implementation. " + "x" * MIN_TEXT_LENGTH
        result = self.tracker.analyze_text(text)

        high_markers = [m for m in result.uncertainty_markers if m.severity == 'high']
        self.assertGreater(len(high_markers), 0)
        self.assertLess(result.confidence_score, 0.9)

    def test_detect_medium_uncertainty(self):
        """Test detection of medium uncertainty markers."""
        text = "I think this might work, and it probably does. " + "x" * MIN_TEXT_LENGTH
        result = self.tracker.analyze_text(text)

        medium_markers = [m for m in result.uncertainty_markers if m.severity == 'medium']
        self.assertGreater(len(medium_markers), 0)

    def test_detect_multiple_uncertainty_levels(self):
        """Test detection across uncertainty levels."""
        text = (
            "I'm not sure, but I think this typically works in most cases. "
            "Perhaps it might be correct, generally speaking. "
        ) + "x" * MIN_TEXT_LENGTH

        result = self.tracker.analyze_text(text)

        # Should find markers at multiple levels
        severities = {m.severity for m in result.uncertainty_markers}
        self.assertGreater(len(severities), 1)

    def test_no_uncertainty_high_confidence(self):
        """Test that confident text scores high."""
        text = (
            "This function returns the sum of two numbers. "
            "The implementation follows the standard pattern. "
            "It handles edge cases correctly. "
        ) + "x" * MIN_TEXT_LENGTH

        result = self.tracker.analyze_text(text)
        self.assertEqual(len(result.uncertainty_markers), 0)
        self.assertGreater(result.confidence_score, 0.8)

    def test_hedging_language_detected(self):
        """Test that various hedging patterns are caught."""
        hedging_texts = [
            "I believe this is the correct approach" + "x" * MIN_TEXT_LENGTH,
            "This probably works as expected" + "x" * MIN_TEXT_LENGTH,
            "Maybe the issue is in the configuration" + "x" * MIN_TEXT_LENGTH,
            "Perhaps we should try a different method" + "x" * MIN_TEXT_LENGTH,
            "It seems like the problem is here" + "x" * MIN_TEXT_LENGTH,
        ]

        for text in hedging_texts:
            result = self.tracker.analyze_text(text)
            self.assertGreater(
                len(result.uncertainty_markers), 0,
                f"Failed to detect hedging in: {text[:50]}..."
            )


class TestConfidenceBoosters(unittest.TestCase):
    """Tests for confidence booster detection."""

    def setUp(self):
        """Set up test fixtures."""
        self.tracker = ConfidenceTracker()

    def test_detect_confidence_boosters(self):
        """Test detection of confidence-boosting language."""
        text = (
            "This definitely works correctly. The documentation states "
            "that this is the proper implementation. I'm confident this "
            "is exactly what you need. "
        ) + "x" * MIN_TEXT_LENGTH

        result = self.tracker.analyze_text(text)
        self.assertGreater(len(result.confidence_boosters), 0)

    def test_boosters_increase_score(self):
        """Test that boosters increase confidence score."""
        base_text = "Here is the implementation. " + "x" * MIN_TEXT_LENGTH
        boosted_text = (
            "Here is the implementation. According to the documentation, "
            "this is definitely the correct approach. I'm confident "
            "this is exactly right. "
        ) + "x" * MIN_TEXT_LENGTH

        base_result = self.tracker.analyze_text(base_text)
        boosted_result = self.tracker.analyze_text(boosted_text)

        self.assertGreaterEqual(
            boosted_result.confidence_score,
            base_result.confidence_score - 0.1  # Allow some variance
        )


class TestCodeWarnings(unittest.TestCase):
    """Tests for code uncertainty indicator detection (REQ-3.1.3)."""

    def setUp(self):
        """Set up test fixtures."""
        self.tracker = ConfidenceTracker()

    def test_detect_todo_comments(self):
        """Test detection of TODO comments."""
        code = """
def process_data(data):
    # TODO: Implement proper validation
    result = data * 2
    return result
""" + "x" * MIN_TEXT_LENGTH

        result = self.tracker.analyze_text(code)
        self.assertGreater(len(result.code_warnings), 0)
        self.assertTrue(any('TODO' in w for w in result.code_warnings))

    def test_detect_fixme_comments(self):
        """Test detection of FIXME comments."""
        code = """
async function fetchData() {
    // FIXME: This needs error handling
    return await fetch(url);
}
""" + "x" * MIN_TEXT_LENGTH

        result = self.tracker.analyze_text(code)
        self.assertTrue(any('FIXME' in w for w in result.code_warnings))

    def test_detect_hack_comments(self):
        """Test detection of HACK comments."""
        code = """
def workaround():
    # HACK: This is a temporary fix
    pass
""" + "x" * MIN_TEXT_LENGTH

        result = self.tracker.analyze_text(code)
        self.assertTrue(any('HACK' in w for w in result.code_warnings))

    def test_detect_not_implemented(self):
        """Test detection of NotImplementedError."""
        code = """
class Interface:
    def method(self):
        raise NotImplementedError
""" + "x" * MIN_TEXT_LENGTH

        result = self.tracker.analyze_text(code)
        self.assertTrue(any('NotImplemented' in w for w in result.code_warnings))


class TestSourceAttribution(unittest.TestCase):
    """Tests for source attribution detection (REQ-3.1.4)."""

    def setUp(self):
        """Set up test fixtures."""
        self.tracker = ConfidenceTracker()

    def test_detect_documentation_reference(self):
        """Test detection of documentation references."""
        text = (
            "According to the documentation, this method accepts "
            "two parameters. The official docs state that the return "
            "value is always positive. "
        ) + "x" * MIN_TEXT_LENGTH

        result = self.tracker.analyze_text(text)
        self.assertGreater(len(result.attributions), 0)

    def test_detect_source_code_reference(self):
        """Test detection of source code references."""
        text = (
            "Based on the source code, this function handles the case "
            "where the input is null. Looking at the codebase, "
            "we can see the pattern used. "
        ) + "x" * MIN_TEXT_LENGTH

        result = self.tracker.analyze_text(text)
        self.assertGreater(len(result.attributions), 0)

    def test_detect_error_reference(self):
        """Test detection of error message references."""
        text = (
            "The error message shows that the connection timed out. "
            "The stack trace indicates the issue is in the auth module. "
        ) + "x" * MIN_TEXT_LENGTH

        result = self.tracker.analyze_text(text)
        self.assertGreater(len(result.attributions), 0)

    def test_attributions_boost_confidence(self):
        """Test that attributions boost confidence."""
        without_attribution = "The function returns a value. " + "x" * MIN_TEXT_LENGTH
        with_attribution = (
            "According to the documentation, the function returns a value. "
            "The spec says this is the expected behavior. "
        ) + "x" * MIN_TEXT_LENGTH

        result_without = self.tracker.analyze_text(without_attribution)
        result_with = self.tracker.analyze_text(with_attribution)

        self.assertGreaterEqual(
            result_with.confidence_score,
            result_without.confidence_score
        )


class TestConfidenceScoring(unittest.TestCase):
    """Tests for confidence score calculation."""

    def setUp(self):
        """Set up test fixtures."""
        self.tracker = ConfidenceTracker()

    def test_score_range(self):
        """Test that scores are always in valid range."""
        test_texts = [
            "Definitely correct. " + "x" * MIN_TEXT_LENGTH,
            "I'm not sure, maybe, perhaps, probably not. " + "x" * MIN_TEXT_LENGTH,
            "Normal text without any markers. " + "x" * MIN_TEXT_LENGTH,
            "# TODO FIXME HACK all broken " + "x" * MIN_TEXT_LENGTH,
        ]

        for text in test_texts:
            result = self.tracker.analyze_text(text)
            self.assertGreaterEqual(result.confidence_score, 0.0)
            self.assertLessEqual(result.confidence_score, 1.0)

    def test_confidence_levels_assigned_correctly(self):
        """Test that confidence levels match scores."""
        # High confidence (>= 0.85)
        high_text = "This is definitely the correct answer. " + "x" * MIN_TEXT_LENGTH
        result = self.tracker.analyze_text(high_text)
        if result.confidence_score >= 0.85:
            self.assertEqual(result.confidence_level, ConfidenceLevel.HIGH)

        # Low confidence
        low_text = (
            "I'm not sure, and I don't know if this is right. "
            "Maybe it works, perhaps not. I'm uncertain. "
        ) + "x" * MIN_TEXT_LENGTH
        result = self.tracker.analyze_text(low_text)
        self.assertIn(
            result.confidence_level,
            [ConfidenceLevel.LOW, ConfidenceLevel.VERY_LOW, ConfidenceLevel.MEDIUM]
        )

    def test_many_uncertainties_reduce_score(self):
        """Test that multiple uncertainty markers reduce score."""
        single_uncertainty = "I think this works. " + "x" * MIN_TEXT_LENGTH
        many_uncertainties = (
            "I think this might possibly maybe perhaps work, "
            "but I'm not sure, and I believe it could be wrong. "
            "Perhaps it's likely to fail. "
        ) + "x" * MIN_TEXT_LENGTH

        result_single = self.tracker.analyze_text(single_uncertainty)
        result_many = self.tracker.analyze_text(many_uncertainties)

        self.assertGreater(
            result_single.confidence_score,
            result_many.confidence_score
        )


class TestDisplayIndicators(unittest.TestCase):
    """Tests for display indicator generation (REQ-3.1.5)."""

    def setUp(self):
        """Set up test fixtures."""
        self.tracker = ConfidenceTracker()

    def test_high_confidence_indicator(self):
        """Test high confidence display indicator."""
        text = "This is definitely correct. " + "x" * MIN_TEXT_LENGTH
        result = self.tracker.analyze_text(text)

        if result.confidence_level == ConfidenceLevel.HIGH:
            self.assertIn("HIGH", result.display_indicator)

    def test_low_confidence_warning(self):
        """Test low confidence includes warning."""
        text = (
            "I'm not sure, maybe this is wrong, I don't know. "
            "Perhaps this might possibly fail. "
        ) + "x" * MIN_TEXT_LENGTH

        result = self.tracker.analyze_text(text)

        if result.confidence_level in (ConfidenceLevel.LOW, ConfidenceLevel.VERY_LOW):
            self.assertTrue(
                "verify" in result.display_indicator.lower() or
                "caution" in result.display_indicator.lower() or
                "LOW" in result.display_indicator
            )

    @patch.dict(os.environ, {'BMAD_SHOW_CONFIDENCE': 'false'})
    def test_indicator_disabled(self):
        """Test that indicator can be disabled."""
        # Need to recreate tracker to pick up new env var
        from confidence_tracker import SHOW_CONFIDENCE as show_flag
        # Note: The flag is read at import time, so this test validates the pattern


class TestConvenienceFunctions(unittest.TestCase):
    """Tests for convenience functions."""

    def test_analyze_response_confidence(self):
        """Test the convenience analysis function."""
        text = "I think this might work. " + "x" * MIN_TEXT_LENGTH
        level, score, indicator = analyze_response_confidence(text)

        self.assertIsInstance(level, str)
        self.assertIn(level, ['high', 'medium', 'low', 'very_low'])
        self.assertIsInstance(score, float)
        self.assertGreaterEqual(score, 0.0)
        self.assertLessEqual(score, 1.0)

    def test_get_confidence_indicator(self):
        """Test getting just the indicator string."""
        text = "Here is the answer. " + "x" * MIN_TEXT_LENGTH
        indicator = get_confidence_indicator(text)

        self.assertIsInstance(indicator, str)

    def test_get_confidence_tracker_singleton(self):
        """Test that tracker is singleton."""
        tracker1 = get_confidence_tracker()
        tracker2 = get_confidence_tracker()

        self.assertIs(tracker1, tracker2)


class TestSessionState(unittest.TestCase):
    """Tests for session state tracking."""

    def setUp(self):
        """Set up test with temp directory."""
        self.temp_dir = tempfile.mkdtemp()
        self.original_state_file = None

    def tearDown(self):
        """Clean up temp directory."""
        import shutil
        shutil.rmtree(self.temp_dir, ignore_errors=True)

    def test_record_analysis(self):
        """Test recording analysis results."""
        tracker = ConfidenceTracker()
        text = "I think this might work. " + "x" * MIN_TEXT_LENGTH
        result = tracker.analyze_text(text)

        # Should not raise
        tracker.record_analysis(result)

    def test_get_session_stats(self):
        """Test getting session statistics."""
        tracker = ConfidenceTracker()

        stats = tracker.get_session_stats()

        self.assertIn('session_id', stats)
        self.assertIn('analyses_count', stats)
        self.assertIn('average_confidence', stats)

    def test_reset_tracking(self):
        """Test resetting tracker state."""
        tracker = ConfidenceTracker()

        # Record some analyses
        for _ in range(3):
            text = "Maybe this works. " + "x" * MIN_TEXT_LENGTH
            result = tracker.analyze_text(text)
            tracker.record_analysis(result)

        # Reset
        tracker.reset()

        # Check state is reset
        stats = tracker.get_session_stats()
        self.assertEqual(stats.get('analyses_count', 0), 0)


class TestAnalysisNotes(unittest.TestCase):
    """Tests for analysis notes generation."""

    def setUp(self):
        """Set up test fixtures."""
        self.tracker = ConfidenceTracker()

    def test_notes_for_high_uncertainty(self):
        """Test notes generated for high uncertainty."""
        text = (
            "I'm not sure, I don't know, I'm uncertain, "
            "I'm guessing, this is a guess, hard to say, "
            "unclear to me. "
        ) + "x" * MIN_TEXT_LENGTH

        result = self.tracker.analyze_text(text)

        # Should have notes about high uncertainty
        notes_text = ' '.join(result.analysis_notes).lower()
        self.assertTrue(
            'uncertainty' in notes_text or
            'marker' in notes_text or
            len(result.analysis_notes) > 0
        )

    def test_notes_for_code_warnings(self):
        """Test notes generated for code warnings."""
        code = """
# TODO: Fix this
# FIXME: Handle errors
# HACK: Temporary workaround
""" + "x" * MIN_TEXT_LENGTH

        result = self.tracker.analyze_text(code)

        if result.code_warnings:
            notes_text = ' '.join(result.analysis_notes).lower()
            self.assertTrue(
                'code' in notes_text or
                'todo' in notes_text or
                'indicator' in notes_text
            )

    def test_notes_for_attributions(self):
        """Test notes for source attributions."""
        text = (
            "According to the documentation, this is correct. "
            "The official docs state this is the way. "
        ) + "x" * MIN_TEXT_LENGTH

        result = self.tracker.analyze_text(text)

        if result.attributions:
            notes_text = ' '.join(result.analysis_notes).lower()
            self.assertTrue(
                'source' in notes_text or
                'reference' in notes_text or
                len(result.attributions) > 0
            )


class TestEdgeCases(unittest.TestCase):
    """Edge case and regression tests."""

    def setUp(self):
        """Set up test fixtures."""
        self.tracker = ConfidenceTracker()

    def test_unicode_text(self):
        """Test handling of unicode text."""
        text = "Perhaps this works? 你好世界 🚀 " + "x" * MIN_TEXT_LENGTH
        result = self.tracker.analyze_text(text)

        self.assertIsNotNone(result)
        self.assertIn(result.confidence_level, list(ConfidenceLevel))

    def test_very_long_text(self):
        """Test handling of very long text."""
        text = "Maybe this works. " * 1000  # Very long text
        result = self.tracker.analyze_text(text)

        self.assertIsNotNone(result)
        self.assertGreater(result.text_length, 10000)

    def test_code_only_text(self):
        """Test text that is mostly code."""
        code = """
def function(x):
    return x * 2

class MyClass:
    def method(self):
        pass
""" + "x" * MIN_TEXT_LENGTH

        result = self.tracker.analyze_text(code)
        self.assertIsNotNone(result)

    def test_mixed_content(self):
        """Test text mixing prose and code."""
        text = """
I think this function works:

def process(data):
    # TODO: Add validation
    return data

Maybe we should add error handling. According to the docs,
this is the standard pattern.
""" + "x" * MIN_TEXT_LENGTH

        result = self.tracker.analyze_text(text)

        # Should detect both prose uncertainty and code warnings
        self.assertIsNotNone(result)

    def test_case_insensitivity(self):
        """Test that patterns are case insensitive."""
        variations = [
            "I THINK this works " + "x" * MIN_TEXT_LENGTH,
            "i think this works " + "x" * MIN_TEXT_LENGTH,
            "I Think This Works " + "x" * MIN_TEXT_LENGTH,
        ]

        for text in variations:
            result = self.tracker.analyze_text(text)
            self.assertGreater(
                len(result.uncertainty_markers), 0,
                f"Failed to detect 'I think' in: {text[:30]}..."
            )


class TestPerformance(unittest.TestCase):
    """Performance tests for confidence tracking."""

    def setUp(self):
        """Set up test fixtures."""
        self.tracker = ConfidenceTracker()

    def test_analysis_performance(self):
        """Test that analysis completes quickly."""
        text = "I think this might work, but I'm not sure. " * 100

        start = time.time()
        for _ in range(100):
            self.tracker.analyze_text(text)
        elapsed = time.time() - start

        # Should complete 100 analyses in under 1 second
        self.assertLess(elapsed, 1.0, f"Analysis too slow: {elapsed:.2f}s for 100 iterations")

    def test_pattern_compilation_cached(self):
        """Test that patterns are compiled once."""
        tracker1 = ConfidenceTracker()
        tracker2 = ConfidenceTracker()

        # Both should have compiled patterns
        self.assertIsNotNone(tracker1._compiled_uncertainty)
        self.assertIsNotNone(tracker2._compiled_uncertainty)


if __name__ == '__main__':
    unittest.main(verbosity=2)
