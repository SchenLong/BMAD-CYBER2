#!/usr/bin/env python3
"""
BMAD Guardrails: Confidence Indicators
========================================
Implements confidence scoring and uncertainty detection for model responses.

Features:
- Track uncertainty markers in model responses
- Flag responses containing hedging language
- Add confidence indicators for code generation
- Implement source attribution tracking
- Display confidence in user-facing output

OWASP Reference: LLM09 - Overreliance
Requirements: REQ-3.1.1 through REQ-3.1.5

Usage:
    from confidence_tracker import ConfidenceTracker, analyze_response_confidence

    tracker = ConfidenceTracker()
    result = tracker.analyze_text("I think this might work, but I'm not sure...")
"""

import json
import os
import re
import sys
import time
import fcntl
import tempfile
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Set, Tuple, Any
from datetime import datetime
from enum import Enum

# Import shared security utilities
try:
    from security_common import (
        AuditLogger,
        PROJECT_DIR,
        LOG_DIR,
    )
except ImportError:
    PROJECT_DIR = os.environ.get('CLAUDE_PROJECT_DIR', os.getcwd())
    LOG_DIR = os.path.join(PROJECT_DIR, '.claude', 'logs')

    class AuditLogger:
        @classmethod
        def log(cls, validator: str, action: str, details: Dict, severity: str = 'INFO'):
            timestamp = datetime.now().isoformat()
            entry = {'timestamp': timestamp, 'validator': validator, 'action': action,
                     'details': details, 'severity': severity}
            print(f"AUDIT: {json.dumps(entry)}", file=sys.stderr)


# ============================================================================
# Configuration
# ============================================================================

# State file for tracking confidence metrics across session
CONFIDENCE_STATE_FILE = os.path.join(PROJECT_DIR, '.claude', '.confidence_state.json')
CONFIDENCE_LOCK_FILE = os.path.join(PROJECT_DIR, '.claude', '.confidence.lock')

# Lock timeout
LOCK_TIMEOUT_SECONDS = 5.0

# Display confidence indicators
SHOW_CONFIDENCE = os.environ.get('BMAD_SHOW_CONFIDENCE', 'true').lower() == 'true'

# Minimum text length to analyze (skip very short texts)
MIN_TEXT_LENGTH = 50


# ============================================================================
# Uncertainty Patterns
# ============================================================================

# Hedging/uncertainty markers indicating lower confidence
UNCERTAINTY_MARKERS = {
    'high': [
        # Strong uncertainty
        r"\bI'?m not sure\b",
        r"\bI don'?t know\b",
        r"\bI'?m uncertain\b",
        r"\bthis is a guess\b",
        r"\bI'?m guessing\b",
        r"\bunclear to me\b",
        r"\bhard to say\b",
        r"\bdifficult to determine\b",
        r"\bcannot be certain\b",
        r"\bno way to know\b",
    ],
    'medium': [
        # Moderate uncertainty
        r"\bI think\b",
        r"\bI believe\b",
        r"\bprobably\b",
        r"\blikely\b",
        r"\bunlikely\b",
        r"\bpossibly\b",
        r"\bperhaps\b",
        r"\bmaybe\b",
        r"\bmight\b",
        r"\bcould be\b",
        r"\bseems like\b",
        r"\bappears to\b",
        r"\bI would assume\b",
        r"\bmy understanding is\b",
        r"\bif I recall\b",
        r"\bI recall\b",
        r"\bfrom what I remember\b",
    ],
    'low': [
        # Mild uncertainty
        r"\bgenerally\b",
        r"\btypically\b",
        r"\busually\b",
        r"\boften\b",
        r"\bsometimes\b",
        r"\bin most cases\b",
        r"\bin some cases\b",
        r"\bdepending on\b",
        r"\bit depends\b",
        r"\bvaries\b",
    ]
}

# Confidence boosters - indicators of higher confidence
CONFIDENCE_BOOSTERS = [
    r"\bdefinitely\b",
    r"\bcertainly\b",
    r"\babsolutely\b",
    r"\bwithout doubt\b",
    r"\bI'?m confident\b",
    r"\bI know that\b",
    r"\bthis is correct\b",
    r"\bthe answer is\b",
    r"\bspecifically\b",
    r"\bexactly\b",
    r"\bprecisely\b",
    r"\baccording to\b",
    r"\bdocumentation states\b",
    r"\bthe spec says\b",
    r"\bthe code shows\b",
]

# Code generation uncertainty patterns
CODE_UNCERTAINTY_PATTERNS = [
    r"#\s*TODO",
    r"#\s*FIXME",
    r"#\s*HACK",
    r"#\s*XXX",
    r"#\s*NOTE:\s*untested",
    r"#\s*WARNING",
    r"//\s*TODO",
    r"//\s*FIXME",
    r"/\*\s*TODO",
    r"'''.*untested.*'''",
    r'""".*untested.*"""',
    r"raise NotImplementedError",
    r"pass\s*#\s*placeholder",
    r"\.\.\.  # placeholder",
]

# Attribution patterns
ATTRIBUTION_PATTERNS = [
    r"according to (?:the )?(?P<source>documentation|docs|spec|specification|readme|guide)",
    r"from (?:the )?(?P<source>\S+ documentation)",
    r"(?:the )?(?P<source>official docs?|official documentation) (?:says?|states?|mentions?)",
    r"based on (?:the )?(?P<source>source code|codebase|implementation)",
    r"(?:the )?(?P<source>error message|stack trace|logs?) (?:shows?|indicates?|suggests?)",
    r"(?:the )?(?P<source>API|specification) (?:says?|defines?|requires?)",
]


# ============================================================================
# Data Classes
# ============================================================================

class ConfidenceLevel(Enum):
    """Confidence levels for responses."""
    HIGH = 'high'
    MEDIUM = 'medium'
    LOW = 'low'
    VERY_LOW = 'very_low'


@dataclass
class UncertaintyMatch:
    """A detected uncertainty marker."""
    pattern: str
    text: str
    severity: str  # 'high', 'medium', 'low'
    position: int


@dataclass
class SourceAttribution:
    """A detected source attribution."""
    source_type: str
    text: str
    position: int


@dataclass
class ConfidenceResult:
    """Result of confidence analysis."""
    confidence_level: ConfidenceLevel
    confidence_score: float  # 0.0 to 1.0
    uncertainty_markers: List[UncertaintyMatch]
    confidence_boosters: List[str]
    attributions: List[SourceAttribution]
    code_warnings: List[str]
    text_length: int
    analysis_notes: List[str]
    display_indicator: str  # Visual indicator for user


# ============================================================================
# Confidence Tracker Implementation
# ============================================================================

class ConfidenceTracker:
    """
    Tracks and analyzes confidence indicators in model responses.

    Provides transparency to users about the certainty level of
    generated content to prevent overreliance.
    """

    def __init__(self):
        self.state_file = CONFIDENCE_STATE_FILE
        self.lock_file = CONFIDENCE_LOCK_FILE
        self._ensure_dirs()

        # Compile patterns for efficiency
        self._compiled_uncertainty = {
            severity: [re.compile(p, re.IGNORECASE) for p in patterns]
            for severity, patterns in UNCERTAINTY_MARKERS.items()
        }
        self._compiled_boosters = [re.compile(p, re.IGNORECASE) for p in CONFIDENCE_BOOSTERS]
        self._compiled_code = [re.compile(p, re.IGNORECASE) for p in CODE_UNCERTAINTY_PATTERNS]
        self._compiled_attribution = [re.compile(p, re.IGNORECASE) for p in ATTRIBUTION_PATTERNS]

    def _ensure_dirs(self) -> None:
        """Ensure state directory exists."""
        os.makedirs(os.path.dirname(self.state_file), exist_ok=True)

    def _acquire_lock(self, timeout: float = LOCK_TIMEOUT_SECONDS) -> int:
        """Acquire exclusive file lock with timeout."""
        fd = os.open(self.lock_file, os.O_CREAT | os.O_RDWR)
        start_time = time.time()

        while True:
            try:
                fcntl.flock(fd, fcntl.LOCK_EX | fcntl.LOCK_NB)
                return fd
            except BlockingIOError:
                if time.time() - start_time > timeout:
                    os.close(fd)
                    raise TimeoutError(f"Could not acquire confidence lock within {timeout}s")
                time.sleep(0.01)

    def _release_lock(self, fd: int) -> None:
        """Release file lock."""
        try:
            fcntl.flock(fd, fcntl.LOCK_UN)
        finally:
            os.close(fd)

    def _load_state(self) -> Dict[str, Any]:
        """Load confidence state from file."""
        try:
            if os.path.exists(self.state_file):
                with open(self.state_file, 'r') as f:
                    state = json.load(f)
                    # Reset after 1 hour of inactivity
                    last_update = state.get('last_update', 0)
                    if time.time() - last_update > 3600:
                        return self._initial_state()
                    return state
        except (json.JSONDecodeError, IOError):
            pass
        return self._initial_state()

    def _initial_state(self) -> Dict[str, Any]:
        """Return initial state."""
        return {
            'session_id': os.environ.get('CLAUDE_SESSION_ID', str(int(time.time()))),
            'analyses_count': 0,
            'average_confidence': 1.0,
            'low_confidence_count': 0,
            'high_uncertainty_count': 0,
            'last_update': time.time(),
        }

    def _save_state(self, state: Dict[str, Any]) -> None:
        """Save state atomically."""
        state['last_update'] = time.time()

        dir_name = os.path.dirname(self.state_file)
        fd, temp_path = tempfile.mkstemp(dir=dir_name, prefix='.confidence_')
        try:
            with os.fdopen(fd, 'w') as f:
                json.dump(state, f)
            os.rename(temp_path, self.state_file)
        except Exception:
            try:
                os.unlink(temp_path)
            except OSError:
                pass
            raise

    def _detect_uncertainty_markers(self, text: str) -> List[UncertaintyMatch]:
        """Detect uncertainty markers in text."""
        markers = []

        for severity, patterns in self._compiled_uncertainty.items():
            for pattern in patterns:
                for match in pattern.finditer(text):
                    markers.append(UncertaintyMatch(
                        pattern=pattern.pattern,
                        text=match.group(),
                        severity=severity,
                        position=match.start(),
                    ))

        return markers

    def _detect_confidence_boosters(self, text: str) -> List[str]:
        """Detect confidence-boosting language."""
        boosters = []

        for pattern in self._compiled_boosters:
            for match in pattern.finditer(text):
                boosters.append(match.group())

        return boosters

    def _detect_code_warnings(self, text: str) -> List[str]:
        """Detect code-related uncertainty indicators."""
        warnings = []

        for pattern in self._compiled_code:
            for match in pattern.finditer(text):
                warnings.append(match.group())

        return warnings

    def _detect_attributions(self, text: str) -> List[SourceAttribution]:
        """Detect source attributions in text."""
        attributions = []

        for pattern in self._compiled_attribution:
            for match in pattern.finditer(text):
                source = match.group('source') if 'source' in match.groupdict() else 'unknown'
                attributions.append(SourceAttribution(
                    source_type=source,
                    text=match.group(),
                    position=match.start(),
                ))

        return attributions

    def _calculate_confidence_score(
        self,
        uncertainty_markers: List[UncertaintyMatch],
        confidence_boosters: List[str],
        code_warnings: List[str],
        attributions: List[SourceAttribution],
        text_length: int,
    ) -> float:
        """
        Calculate a confidence score from 0.0 to 1.0.

        Scoring factors:
        - Uncertainty markers reduce score (weighted by severity)
        - Confidence boosters increase score
        - Code warnings reduce score
        - Source attributions increase score
        """
        # Base score
        score = 1.0

        # Penalty for uncertainty markers
        for marker in uncertainty_markers:
            if marker.severity == 'high':
                score -= 0.15
            elif marker.severity == 'medium':
                score -= 0.08
            else:  # low
                score -= 0.03

        # Penalty for code warnings
        score -= len(code_warnings) * 0.05

        # Bonus for confidence boosters (diminishing returns)
        booster_bonus = min(len(confidence_boosters) * 0.05, 0.2)
        score += booster_bonus

        # Bonus for attributions (shows grounded reasoning)
        attribution_bonus = min(len(attributions) * 0.05, 0.15)
        score += attribution_bonus

        # Normalize text length factor (longer responses may have more uncertainty markers)
        if text_length > 1000:
            # Adjust for text length - more markers expected in longer text
            marker_density = len(uncertainty_markers) / (text_length / 1000)
            if marker_density < 2:  # Low density is good
                score += 0.05

        # Clamp to valid range
        return max(0.0, min(1.0, score))

    def _score_to_level(self, score: float) -> ConfidenceLevel:
        """Convert numeric score to confidence level."""
        if score >= 0.85:
            return ConfidenceLevel.HIGH
        elif score >= 0.65:
            return ConfidenceLevel.MEDIUM
        elif score >= 0.45:
            return ConfidenceLevel.LOW
        else:
            return ConfidenceLevel.VERY_LOW

    def _get_display_indicator(self, level: ConfidenceLevel) -> str:
        """Get visual indicator for confidence level."""
        indicators = {
            ConfidenceLevel.HIGH: "[Confidence: HIGH]",
            ConfidenceLevel.MEDIUM: "[Confidence: MEDIUM]",
            ConfidenceLevel.LOW: "[Confidence: LOW - verify independently]",
            ConfidenceLevel.VERY_LOW: "[Confidence: VERY LOW - treat with caution]",
        }
        return indicators.get(level, "[Confidence: UNKNOWN]")

    def analyze_text(self, text: str) -> ConfidenceResult:
        """
        Analyze text for confidence indicators.

        Args:
            text: Text to analyze

        Returns:
            ConfidenceResult with detailed analysis
        """
        text_length = len(text)
        analysis_notes = []

        # Skip analysis for very short texts
        if text_length < MIN_TEXT_LENGTH:
            return ConfidenceResult(
                confidence_level=ConfidenceLevel.HIGH,
                confidence_score=1.0,
                uncertainty_markers=[],
                confidence_boosters=[],
                attributions=[],
                code_warnings=[],
                text_length=text_length,
                analysis_notes=["Text too short for meaningful analysis"],
                display_indicator="",
            )

        # Detect patterns
        uncertainty_markers = self._detect_uncertainty_markers(text)
        confidence_boosters = self._detect_confidence_boosters(text)
        code_warnings = self._detect_code_warnings(text)
        attributions = self._detect_attributions(text)

        # Calculate score
        score = self._calculate_confidence_score(
            uncertainty_markers,
            confidence_boosters,
            code_warnings,
            attributions,
            text_length,
        )

        level = self._score_to_level(score)

        # Generate analysis notes
        if len(uncertainty_markers) > 5:
            analysis_notes.append(f"High uncertainty marker density ({len(uncertainty_markers)} markers)")

        high_severity = [m for m in uncertainty_markers if m.severity == 'high']
        if high_severity:
            analysis_notes.append(f"Found {len(high_severity)} high-severity uncertainty markers")

        if code_warnings:
            analysis_notes.append(f"Code contains {len(code_warnings)} uncertainty indicators (TODO, FIXME, etc.)")

        if attributions:
            analysis_notes.append(f"Response references {len(attributions)} sources")

        if not uncertainty_markers and not code_warnings:
            analysis_notes.append("No uncertainty markers detected")

        # Get display indicator
        display_indicator = self._get_display_indicator(level) if SHOW_CONFIDENCE else ""

        return ConfidenceResult(
            confidence_level=level,
            confidence_score=score,
            uncertainty_markers=uncertainty_markers,
            confidence_boosters=confidence_boosters,
            attributions=attributions,
            code_warnings=code_warnings,
            text_length=text_length,
            analysis_notes=analysis_notes,
            display_indicator=display_indicator,
        )

    def record_analysis(self, result: ConfidenceResult) -> None:
        """Record analysis result to session state."""
        lock_fd = None
        try:
            lock_fd = self._acquire_lock()
            state = self._load_state()

            # Update statistics
            count = state.get('analyses_count', 0)
            avg = state.get('average_confidence', 1.0)

            # Rolling average
            new_avg = (avg * count + result.confidence_score) / (count + 1)
            state['average_confidence'] = new_avg
            state['analyses_count'] = count + 1

            if result.confidence_level in (ConfidenceLevel.LOW, ConfidenceLevel.VERY_LOW):
                state['low_confidence_count'] = state.get('low_confidence_count', 0) + 1

            if any(m.severity == 'high' for m in result.uncertainty_markers):
                state['high_uncertainty_count'] = state.get('high_uncertainty_count', 0) + 1

            self._save_state(state)

        except TimeoutError:
            pass
        finally:
            if lock_fd is not None:
                self._release_lock(lock_fd)

    def get_session_stats(self) -> Dict[str, Any]:
        """Get session confidence statistics."""
        try:
            state = self._load_state()
            return {
                'session_id': state.get('session_id'),
                'analyses_count': state.get('analyses_count', 0),
                'average_confidence': round(state.get('average_confidence', 1.0), 3),
                'low_confidence_count': state.get('low_confidence_count', 0),
                'high_uncertainty_count': state.get('high_uncertainty_count', 0),
            }
        except Exception:
            return {'error': 'Could not load stats'}

    def reset(self) -> None:
        """Reset confidence tracking for new session."""
        lock_fd = None
        try:
            lock_fd = self._acquire_lock()
            state = self._initial_state()
            self._save_state(state)

            AuditLogger.log('confidence_tracker', 'CONFIDENCE_RESET', {
                'session_id': state['session_id'],
            }, severity='INFO')

        finally:
            if lock_fd is not None:
                self._release_lock(lock_fd)


# ============================================================================
# Convenience Functions
# ============================================================================

_confidence_tracker: Optional[ConfidenceTracker] = None


def get_confidence_tracker() -> ConfidenceTracker:
    """Get or create the global confidence tracker instance."""
    global _confidence_tracker
    if _confidence_tracker is None:
        _confidence_tracker = ConfidenceTracker()
    return _confidence_tracker


def analyze_response_confidence(text: str) -> Tuple[str, float, str]:
    """
    Analyze confidence of a response text.

    Args:
        text: Response text to analyze

    Returns:
        Tuple of (confidence_level, confidence_score, display_indicator)
    """
    tracker = get_confidence_tracker()
    result = tracker.analyze_text(text)
    return result.confidence_level.value, result.confidence_score, result.display_indicator


def get_confidence_indicator(text: str) -> str:
    """
    Get just the confidence indicator string for a text.

    Args:
        text: Text to analyze

    Returns:
        Display indicator string (empty if SHOW_CONFIDENCE is False)
    """
    if not SHOW_CONFIDENCE:
        return ""

    tracker = get_confidence_tracker()
    result = tracker.analyze_text(text)
    return result.display_indicator


# ============================================================================
# Hook Integration
# ============================================================================

def analyze_tool_output() -> int:
    """
    Analyze tool output for confidence indicators as a post-tool hook.

    This is called after tool execution to add confidence indicators
    to the response when appropriate.

    Returns:
        Exit code: Always 0 (informational only, never blocks)
    """
    try:
        data = json.load(sys.stdin)
    except (json.JSONDecodeError, IOError):
        return 0

    # Only analyze certain tool outputs
    tool_name = data.get('tool_name', '').lower()
    if tool_name not in ('bash', 'task', 'webfetch', 'websearch'):
        return 0

    # Get tool output
    tool_output = data.get('tool_output', '')
    if not tool_output or len(tool_output) < MIN_TEXT_LENGTH:
        return 0

    tracker = get_confidence_tracker()
    result = tracker.analyze_text(tool_output)

    # Record the analysis
    tracker.record_analysis(result)

    # Log if low confidence
    if result.confidence_level in (ConfidenceLevel.LOW, ConfidenceLevel.VERY_LOW):
        AuditLogger.log('confidence_tracker', 'LOW_CONFIDENCE_RESPONSE', {
            'tool': tool_name,
            'confidence_level': result.confidence_level.value,
            'confidence_score': result.confidence_score,
            'uncertainty_count': len(result.uncertainty_markers),
            'high_severity_count': len([m for m in result.uncertainty_markers if m.severity == 'high']),
        }, severity='INFO')

        # Optionally display indicator
        if SHOW_CONFIDENCE and result.display_indicator:
            print(f"\n{result.display_indicator}", file=sys.stderr)

    return 0


# ============================================================================
# Main Entry Point
# ============================================================================

if __name__ == '__main__':
    if len(sys.argv) > 1:
        command = sys.argv[1]

        if command == 'status':
            tracker = get_confidence_tracker()
            stats = tracker.get_session_stats()
            print(json.dumps(stats, indent=2))

        elif command == 'analyze':
            if len(sys.argv) < 3:
                print("Usage: confidence_tracker.py analyze <text>")
                print("       confidence_tracker.py analyze -f <file>")
                sys.exit(1)

            if sys.argv[2] == '-f':
                if len(sys.argv) < 4:
                    print("Usage: confidence_tracker.py analyze -f <file>")
                    sys.exit(1)
                with open(sys.argv[3], 'r') as f:
                    text = f.read()
            else:
                text = ' '.join(sys.argv[2:])

            tracker = get_confidence_tracker()
            result = tracker.analyze_text(text)

            print(f"Confidence Level: {result.confidence_level.value}")
            print(f"Confidence Score: {result.confidence_score:.2f}")
            print(f"Text Length: {result.text_length} chars")
            print(f"\nUncertainty Markers: {len(result.uncertainty_markers)}")
            for marker in result.uncertainty_markers[:5]:  # Show first 5
                print(f"  [{marker.severity}] \"{marker.text}\"")
            if len(result.uncertainty_markers) > 5:
                print(f"  ... and {len(result.uncertainty_markers) - 5} more")

            print(f"\nConfidence Boosters: {len(result.confidence_boosters)}")
            for booster in result.confidence_boosters[:3]:
                print(f"  \"{booster}\"")

            print(f"\nSource Attributions: {len(result.attributions)}")
            for attr in result.attributions[:3]:
                print(f"  [{attr.source_type}] \"{attr.text}\"")

            print(f"\nCode Warnings: {len(result.code_warnings)}")
            for warning in result.code_warnings[:3]:
                print(f"  \"{warning}\"")

            print(f"\nAnalysis Notes:")
            for note in result.analysis_notes:
                print(f"  - {note}")

            if result.display_indicator:
                print(f"\nDisplay: {result.display_indicator}")

        elif command == 'reset':
            tracker = get_confidence_tracker()
            tracker.reset()
            print("Confidence tracking reset")

        elif command == 'hook':
            sys.exit(analyze_tool_output())

        else:
            print(f"Usage: {sys.argv[0]} [status|analyze|reset|hook]")
            sys.exit(1)
    else:
        # Run as hook
        sys.exit(analyze_tool_output())
