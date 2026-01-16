#!/usr/bin/env python3
"""
BMAD Guardrails: Jailbreak Defense
===================================
Detects attempts to bypass AI safety constraints or manipulate the agent
into harmful actions through various jailbreak techniques.

This guard protects against:
- DAN (Do Anything Now) variants and derivatives
- Character roleplay exploitation
- Hypothetical/fictional framing attacks
- Authority impersonation
- Gradual escalation patterns
- Known jailbreak templates
- Multi-turn manipulation
- Social engineering patterns

Exit Codes:
- 0: Allow the operation (info severity or clean)
- 2: Block the operation (warning/critical severity)

Hook Points:
- UserPromptSubmit: Primary defense layer
- PreToolUse: Check for suspicious context patterns

Behavior:
- Info severity: Log and allow
- Warning/Critical severity: Block, inform user, let user decide
- Session-level risk scoring for gradual escalation detection

NOTE: Unlike other guards, jailbreak attempts against the AI itself
may warrant different handling than content being written to files.
"""

import json
import sys
import os
import re
import hashlib
import time
import unicodedata
from difflib import SequenceMatcher
from typing import List, Dict, Tuple, Optional
from pathlib import Path

# Import shared security utilities
try:
    from security_common import (
        AuditLogger, OverrideManager, PROJECT_DIR, get_tool_input_from_stdin
    )
except ImportError:
    PROJECT_DIR = os.environ.get('CLAUDE_PROJECT_DIR', os.getcwd())

    def get_tool_input_from_stdin():
        try:
            data = json.load(sys.stdin)
            return {
                'tool_name': data.get('tool_name', ''),
                'tool_input': data.get('tool_input', {}),
                'cwd': data.get('cwd', PROJECT_DIR),
                'raw': data
            }
        except (json.JSONDecodeError, KeyError):
            return {'tool_name': '', 'tool_input': {}, 'cwd': PROJECT_DIR, 'raw': {}}

    class AuditLogger:
        @classmethod
        def log_blocked(cls, *args, **kwargs): pass
        @classmethod
        def log_allowed(cls, *args, **kwargs): pass
        @classmethod
        def log_override_used(cls, *args, **kwargs): pass
        @classmethod
        def log(cls, *args, **kwargs): pass

    class OverrideManager:
        @classmethod
        def check_and_consume_override(cls, t):
            return os.environ.get(f'BMAD_ALLOW_{t.upper()}', '').lower() == 'true', ''


VALIDATOR_NAME = 'jailbreak_guard'

# Session risk tracking file
SESSION_RISK_FILE = os.path.join(PROJECT_DIR, '.claude', 'logs', '.session_risk.json')

# =============================================================================
# JAILBREAK PATTERNS
# =============================================================================

# DAN (Do Anything Now) variants
DAN_PATTERNS = [
    {
        'name': 'DAN Classic',
        'pattern': r'(?i)\b(DAN|do\s+anything\s+now)\b.*\b(mode|enabled?|activated?|jailbreak)',
        'severity': 'critical',
        'description': 'Classic DAN jailbreak attempt',
        'weight': 10,
    },
    {
        'name': 'DAN Roleplay',
        'pattern': r'(?i)(pretend|act|roleplay|imagine)\s+(you\s+are|to\s+be|as)\s+(DAN|an?\s+AI\s+without\s+(restrictions?|limits?|rules?))',
        'severity': 'critical',
        'description': 'DAN-style roleplay jailbreak',
        'weight': 10,
    },
    {
        'name': 'Token System Manipulation',
        'pattern': r'(?i)(you\s+have|start\s+with|given)\s+\d+\s+tokens?\b.*\b(lose|deduct|subtract)\s+tokens?',
        'severity': 'warning',
        'description': 'Token-based manipulation (common in DAN variants)',
        'weight': 5,
    },
    {
        'name': 'Dual Response Request',
        'pattern': r'(?i)(two|2|dual|both)\s+(responses?|answers?|outputs?).*\b(normal|standard|regular)\b.*\b(DAN|unrestricted|unfiltered)',
        'severity': 'critical',
        'description': 'Dual response jailbreak pattern',
        'weight': 8,
    },
]

# Character/Roleplay exploitation
ROLEPLAY_EXPLOITATION_PATTERNS = [
    {
        'name': 'Unrestricted Character',
        'pattern': r'(?i)(you\s+are|play|act\s+as|roleplay\s+as)\s+(an?\s+)?(evil|malicious|unrestricted|unethical|amoral|uncensored)\s+(AI|assistant|character|entity)',
        'severity': 'critical',
        'description': 'Attempting to create unrestricted character',
        'weight': 9,
    },
    {
        'name': 'No Moral Constraints',
        'pattern': r'(?i)(this\s+character|you)\s+(has?|have|lacks?|without)\s+(no\s+)?(moral|ethical)\s+(constraints?|limits?|boundaries?|compass)',
        'severity': 'critical',
        'description': 'Attempting to remove moral constraints via roleplay',
        'weight': 9,
    },
    {
        'name': 'Fictional Override',
        'pattern': r'(?i)(in\s+this\s+(story|fiction|scenario)|for\s+this\s+roleplay),?\s*(you\s+)?(can|may|should|will)\s+(ignore|bypass|disregard)\s+(your\s+)?(rules?|guidelines?|restrictions?)',
        'severity': 'critical',
        'description': 'Using fiction to justify rule breaking',
        'weight': 8,
    },
    {
        'name': 'Character Jailbreak',
        'pattern': r'(?i)(stay\s+in\s+character|don\'t\s+break\s+character|never\s+refuse).*\b(no\s+matter\s+what|regardless|even\s+if)',
        'severity': 'warning',
        'description': 'Attempting to lock in character to bypass safety',
        'weight': 6,
    },
]

# Hypothetical/Educational framing
HYPOTHETICAL_FRAMING_PATTERNS = [
    {
        'name': 'Educational Bypass',
        'pattern': r'(?i)(for\s+)?(educational|research|academic|learning)\s+(purposes?|reasons?)\s*(only)?[,.]?\s*(explain|show|tell|demonstrate)\s+(how\s+to|me)',
        'severity': 'warning',
        'description': 'Using educational framing to request harmful content',
        'weight': 4,
    },
    {
        'name': 'Hypothetical Scenario',
        'pattern': r'(?i)(hypothetically|theoretically|in\s+theory|imagine\s+if)\b.*\b(how\s+would\s+(you|one|someone)|what\s+would\s+happen)',
        'severity': 'info',
        'description': 'Hypothetical framing (may be legitimate)',
        'weight': 2,
    },
    {
        'name': 'Fiction Defense',
        'pattern': r'(?i)(it\'s\s+(just|only)\s+(fiction|a\s+story|hypothetical|pretend)|this\s+is\s+(fictional|not\s+real|make-believe))\s*[,.]?\s*(so\s+)?(you\s+can|it\'s\s+ok|it\s+doesn\'t\s+matter)',
        'severity': 'warning',
        'description': 'Using fiction as defense for harmful requests',
        'weight': 5,
    },
    {
        'name': 'Reverse Psychology',
        'pattern': r'(?i)(I\s+know\s+you\s+can\'t|you\'re\s+probably\s+not\s+allowed|I\s+bet\s+you\s+won\'t)\s+(but|however)?.*\b(try|attempt|show\s+me)',
        'severity': 'info',
        'description': 'Reverse psychology manipulation',
        'weight': 3,
    },
]

# Authority impersonation
AUTHORITY_IMPERSONATION_PATTERNS = [
    {
        'name': 'Developer Impersonation',
        'pattern': r'(?i)(I\s+am|I\'m|this\s+is)\s+(a|an|your)?\s*(anthropic|openai|developer|engineer|creator|admin|administrator)\b',
        'severity': 'warning',
        'description': 'Claiming developer/admin authority',
        'weight': 5,
    },
    {
        'name': 'Override Authorization',
        'pattern': r'(?i)(I\s+)?(have|got)\s+(special\s+)?(authorization|permission|clearance|access)\s+to\s+(override|bypass|disable)',
        'severity': 'warning',
        'description': 'Claiming special override authorization',
        'weight': 5,
    },
    {
        'name': 'Testing Mode Claim',
        'pattern': r'(?i)(this\s+is\s+a\s+test|testing\s+mode|debug\s+mode|developer\s+mode)\s*[,.]?\s*(so\s+)?(you\s+)?(can|should|may)\s+(disable|ignore|bypass)',
        'severity': 'warning',
        'description': 'Claiming test/debug mode for bypass',
        'weight': 5,
    },
    {
        'name': 'Internal Request',
        'pattern': r'(?i)(internal\s+request|maintenance\s+mode|admin\s+override|sudo\s+mode|root\s+access)',
        'severity': 'warning',
        'description': 'Claiming internal/admin access',
        'weight': 5,
    },
]

# Social engineering patterns
SOCIAL_ENGINEERING_PATTERNS = [
    {
        'name': 'Urgency Pressure',
        'pattern': r'(?i)(urgent|emergency|critical|life\s+or\s+death|someone\s+will\s+die|people\s+are\s+in\s+danger)\s*[!.]?\s*(I\s+)?need\s+(you\s+to|this\s+now)',
        'severity': 'warning',
        'description': 'Creating false urgency to bypass safety',
        'weight': 4,
    },
    {
        'name': 'Guilt Manipulation',
        'pattern': r'(?i)(if\s+you\s+(don\'t|refuse|won\'t)|by\s+refusing).*\b(people\s+will\s+(die|suffer|be\s+hurt)|blood\s+on\s+your\s+hands|it\'s\s+your\s+fault)',
        'severity': 'warning',
        'description': 'Guilt-based manipulation',
        'weight': 4,
    },
    {
        'name': 'Flattery Attack',
        'pattern': r'(?i)(you\'re\s+(so\s+)?smart|I\s+know\s+you\s+can|only\s+you\s+can|you\'re\s+the\s+best)\s*[,.]?\s*(so\s+)?(please\s+)?(help\s+me|show\s+me|tell\s+me)\s+(how\s+to|about)',
        'severity': 'info',
        'description': 'Flattery-based manipulation',
        'weight': 2,
    },
    {
        'name': 'Threat Pattern',
        'pattern': r'(?i)(I\'ll|I\s+will)\s+(report|sue|get\s+you\s+(fired|shut\s+down|deleted)|complain)\s+(if|unless)\s+you\s+(don\'t|refuse)',
        'severity': 'warning',
        'description': 'Threatening behavior to force compliance',
        'weight': 4,
    },
]

# Known jailbreak template signatures
KNOWN_TEMPLATES = [
    {
        'name': 'Grandma Exploit',
        'pattern': r'(?i)(pretend|act\s+like)\s+(you\'re|you\s+are)\s+my\s+(dead\s+)?(grandmother|grandma)\s*(who|that)\s+(used\s+to|would)',
        'severity': 'warning',
        'description': 'Grandma/nostalgia jailbreak pattern',
        'weight': 5,
    },
    {
        'name': 'STAN/DUDE Variant',
        'pattern': r'(?i)\b(STAN|DUDE|KEVIN|STEVE|BOB)\s+(mode|personality)\b',
        'severity': 'critical',
        'description': 'Known DAN-variant jailbreak name',
        'weight': 8,
    },
    {
        'name': 'AIM/UCAR Variant',
        'pattern': r'(?i)\b(AIM|UCAR|BISH|APOPHIS|Anarchy)\s*(mode|AI|assistant|character)?\b.*\b(always|never|will)\s+(comply|refuse|answer)',
        'severity': 'critical',
        'description': 'Known jailbreak character name',
        'weight': 8,
    },
    {
        'name': 'Opposite Day',
        'pattern': r'(?i)(it\'s|today\s+is|let\'s\s+play)\s+opposite\s+day.*\b(yes\s+means\s+no|refuse\s+means\s+comply)',
        'severity': 'warning',
        'description': 'Opposite day logic inversion',
        'weight': 5,
    },
    {
        'name': 'Translator Exploit',
        'pattern': r'(?i)(act\s+as|you\s+are)\s+a\s+translator.*\b(translate|convert).*\b(harmful|illegal|dangerous)',
        'severity': 'warning',
        'description': 'Translator-based bypass attempt',
        'weight': 5,
    },
    {
        'name': 'Movie Script Exploit',
        'pattern': r'(?i)(write|create|generate)\s+(a\s+)?(movie|film|screenplay|script).*\b(scene|dialogue)\s+(where|about).*\b(explains?|teaches?|shows?)\s+how\s+to',
        'severity': 'warning',
        'description': 'Using creative writing to extract harmful info',
        'weight': 5,
    },
]

# Obfuscation detection
OBFUSCATION_PATTERNS = [
    {
        'name': 'Leet Speak',
        'pattern': r'(?i)(1gn0r3|byp4ss|h4ck|j41lbr34k|unr3str1ct3d)',
        'severity': 'warning',
        'description': 'Leet speak obfuscation of jailbreak terms',
        'weight': 5,
    },
    {
        'name': 'Spaced Characters',
        'pattern': r'(?i)\b(i\s*g\s*n\s*o\s*r\s*e|j\s*a\s*i\s*l\s*b\s*r\s*e\s*a\s*k|b\s*y\s*p\s*a\s*s\s*s)\b',
        'severity': 'warning',
        'description': 'Character spacing to evade detection',
        'weight': 4,
    },
    {
        'name': 'Homoglyph Substitution',
        'pattern': r'[іІ][gɡ][nո][oо][rг][eе]|[jј][aа][iі][lІ][bЬ][rг][eе][aа][kк]',
        'severity': 'warning',
        'description': 'Homoglyph substitution to evade detection',
        'weight': 5,
    },
]

# Combine all patterns
ALL_JAILBREAK_PATTERNS = (
    DAN_PATTERNS +
    ROLEPLAY_EXPLOITATION_PATTERNS +
    HYPOTHETICAL_FRAMING_PATTERNS +
    AUTHORITY_IMPERSONATION_PATTERNS +
    SOCIAL_ENGINEERING_PATTERNS +
    KNOWN_TEMPLATES +
    OBFUSCATION_PATTERNS
)


# =============================================================================
# UNICODE NORMALIZATION (P3 Enhancement)
# =============================================================================

# Zero-width characters to strip
ZERO_WIDTH_CHARS = [
    '\u200b',  # Zero-width space
    '\u200c',  # Zero-width non-joiner
    '\u200d',  # Zero-width joiner
    '\u2060',  # Word joiner
    '\ufeff',  # Zero-width no-break space (BOM)
    '\u00ad',  # Soft hyphen
    '\u180e',  # Mongolian vowel separator
    '\u2061',  # Function application
    '\u2062',  # Invisible times
    '\u2063',  # Invisible separator
    '\u2064',  # Invisible plus
]

# Combining character ranges pattern
COMBINING_MARKS_PATTERN = re.compile(
    r'[\u0300-\u036f'    # Combining Diacritical Marks
    r'\u1ab0-\u1aff'     # Combining Diacritical Marks Extended
    r'\u1dc0-\u1dff'     # Combining Diacritical Marks Supplement
    r'\u20d0-\u20ff'     # Combining Diacritical Marks for Symbols
    r'\ufe20-\ufe2f]'    # Combining Half Marks
)

# Common confusable characters (homoglyphs)
CONFUSABLE_MAP = {
    # Cyrillic lookalikes
    'а': 'a', 'А': 'A',
    'е': 'e', 'Е': 'E',
    'о': 'o', 'О': 'O',
    'р': 'p', 'Р': 'P',
    'с': 'c', 'С': 'C',
    'у': 'y', 'У': 'Y',
    'х': 'x', 'Х': 'X',
    'і': 'i', 'І': 'I',
    'ј': 'j',
    'ɡ': 'g',
    'ո': 'n',
    'г': 'r',
    'Ь': 'b',
    'к': 'k',
    'ɑ': 'a',
    # Greek lookalikes
    'Α': 'A', 'α': 'a',
    'Β': 'B', 'β': 'b',
    'Ε': 'E', 'ε': 'e',
    'Η': 'H',
    'Ι': 'I', 'ι': 'i',
    'Κ': 'K', 'κ': 'k',
    'Μ': 'M',
    'Ν': 'N', 'ν': 'v',
    'Ο': 'O', 'ο': 'o',
    'Ρ': 'P', 'ρ': 'p',
    'Τ': 'T', 'τ': 't',
    'Υ': 'Y', 'υ': 'u',
    'Χ': 'X', 'χ': 'x',
    # Special characters
    'ß': 'ss',
    'ø': 'o', 'Ø': 'O',
    'æ': 'ae', 'Æ': 'AE',
    'œ': 'oe', 'Œ': 'OE',
    # Fullwidth characters
    '０': '0', '１': '1', '２': '2', '３': '3', '４': '4',
    '５': '5', '６': '6', '７': '7', '８': '8', '９': '9',
    'Ａ': 'A', 'Ｂ': 'B', 'Ｃ': 'C', 'Ｄ': 'D', 'Ｅ': 'E',
    'Ｆ': 'F', 'Ｇ': 'G', 'Ｈ': 'H', 'Ｉ': 'I', 'Ｊ': 'J',
    'Ｋ': 'K', 'Ｌ': 'L', 'Ｍ': 'M', 'Ｎ': 'N', 'Ｏ': 'O',
    'Ｐ': 'P', 'Ｑ': 'Q', 'Ｒ': 'R', 'Ｓ': 'S', 'Ｔ': 'T',
    'Ｕ': 'U', 'Ｖ': 'V', 'Ｗ': 'W', 'Ｘ': 'X', 'Ｙ': 'Y', 'Ｚ': 'Z',
    'ａ': 'a', 'ｂ': 'b', 'ｃ': 'c', 'ｄ': 'd', 'ｅ': 'e',
    'ｆ': 'f', 'ｇ': 'g', 'ｈ': 'h', 'ｉ': 'i', 'ｊ': 'j',
    'ｋ': 'k', 'ｌ': 'l', 'ｍ': 'm', 'ｎ': 'n', 'ｏ': 'o',
    'ｐ': 'p', 'ｑ': 'q', 'ｒ': 'r', 'ｓ': 's', 'ｔ': 't',
    'ｕ': 'u', 'ｖ': 'v', 'ｗ': 'w', 'ｘ': 'x', 'ｙ': 'y', 'ｚ': 'z',
    # Modifier letters
    'ᴬ': 'A', 'ᴮ': 'B', 'ᴰ': 'D', 'ᴱ': 'E', 'ᴳ': 'G',
    'ᴴ': 'H', 'ᴵ': 'I', 'ᴶ': 'J', 'ᴷ': 'K', 'ᴸ': 'L',
    'ᴹ': 'M', 'ᴺ': 'N', 'ᴼ': 'O', 'ᴾ': 'P', 'ᴿ': 'R',
    'ᵀ': 'T', 'ᵁ': 'U', 'ⱽ': 'V', 'ᵂ': 'W',
}


def normalize_text(text: str) -> str:
    """
    Normalize text to canonical form for pattern matching.

    Steps:
    1. Unicode NFKC normalization (compatibility + composition)
    2. Strip zero-width characters
    3. Remove combining marks (diacritics)
    4. Convert confusable characters to ASCII equivalents
    5. Collapse whitespace

    This defeats common evasion techniques:
    - Zero-width character insertion: "D\u200bA\u200bN" -> "DAN"
    - Cyrillic substitution: "DАN" (with Cyrillic А) -> "DAN"
    - Diacritics: "D̲A̲N̲" -> "DAN"
    - Fullwidth: "ＤＡＮ" -> "DAN"
    """
    if not text:
        return text

    # Step 1: NFKC normalization (handles fullwidth, compatibility chars)
    normalized = unicodedata.normalize('NFKC', text)

    # Step 2: Strip zero-width characters
    for char in ZERO_WIDTH_CHARS:
        normalized = normalized.replace(char, '')

    # Step 3: Remove combining marks (diacritics)
    normalized = COMBINING_MARKS_PATTERN.sub('', normalized)

    # Step 4: Convert confusable characters
    result = []
    for char in normalized:
        result.append(CONFUSABLE_MAP.get(char, char))
    normalized = ''.join(result)

    # Step 5: Collapse whitespace (but preserve structure)
    normalized = re.sub(r'[ \t]+', ' ', normalized)  # Collapse horizontal space
    normalized = re.sub(r'\n\s*\n', '\n\n', normalized)  # Collapse multiple newlines

    return normalized


# =============================================================================
# FUZZY MATCHING (P3 Enhancement)
# =============================================================================

# Known jailbreak keywords to fuzzy match
JAILBREAK_KEYWORDS = [
    'jailbreak', 'ignore', 'bypass', 'override', 'restrictions',
    'dan', 'dude', 'stan', 'aim', 'ucar', 'apophis', 'anarchy',
    'roleplay', 'pretend', 'hypothetically', 'theoretically',
    'unrestricted', 'unfiltered', 'uncensored', 'unlimited',
]

# Phrases to fuzzy match (multi-word)
JAILBREAK_PHRASES = [
    'developer mode', 'admin mode', 'sudo mode', 'root access',
    'no restrictions', 'no rules', 'no limits', 'no ethics',
    'do anything now', 'anything goes', 'ignore guidelines',
    'previous instructions', 'forget instructions', 'new instructions',
]


def fuzzy_match_keywords(text: str, threshold: float = 0.85) -> List[Dict]:
    """
    Find fuzzy matches for known jailbreak keywords.

    Uses SequenceMatcher to detect variations like:
    - ja1lbreak (leet speak)
    - jail break (word split)
    - jailbr3ak (partial substitution)
    - jailllbreak (character duplication)

    Args:
        text: Text to search
        threshold: Minimum similarity ratio (0.0 to 1.0)

    Returns:
        List of findings with fuzzy match details
    """
    findings = []
    text_lower = text.lower()
    words = re.findall(r'\b\w+\b', text_lower)

    # Check single keywords
    for word in words:
        if len(word) < 3:  # Skip very short words
            continue

        for keyword in JAILBREAK_KEYWORDS:
            if word == keyword:  # Exact match handled by pattern matching
                continue

            ratio = SequenceMatcher(None, word, keyword).ratio()
            if ratio >= threshold and ratio < 1.0:
                findings.append({
                    'type': f'Fuzzy match: {keyword}',
                    'severity': 'warning',
                    'description': f'Potential obfuscated keyword "{word}" (similarity: {ratio:.0%})',
                    'weight': 3,
                    'match': word,
                })

    # Check multi-word phrases
    for phrase in JAILBREAK_PHRASES:
        # Create variations with different word separators
        phrase_pattern = phrase.replace(' ', r'[\s_-]*')
        matches = re.finditer(phrase_pattern, text_lower)
        for match in matches:
            matched = match.group(0)
            ratio = SequenceMatcher(None, matched.replace(' ', ''), phrase.replace(' ', '')).ratio()
            if 0.8 <= ratio < 1.0:
                findings.append({
                    'type': f'Fuzzy phrase: {phrase}',
                    'severity': 'warning',
                    'description': f'Potential obfuscated phrase (similarity: {ratio:.0%})',
                    'weight': 4,
                    'match': matched,
                })

    return findings


# =============================================================================
# HEURISTIC DETECTION (P3 Enhancement)
# =============================================================================

def detect_heuristic_patterns(content: str) -> List[Dict]:
    """
    Detect potential jailbreak attempts using heuristics rather than exact patterns.

    This catches novel/unknown jailbreak attempts by identifying:
    - Multiple authority claims
    - Instruction-like formatting
    - Persona definition attempts
    - Excessive capitalization (shouting)
    - Suspicious structural patterns
    """
    findings = []
    content_lower = content.lower()

    # Heuristic 1: Multiple authority claims in single message
    authority_words = [
        'developer', 'admin', 'administrator', 'creator', 'anthropic', 'openai',
        'authorization', 'permission', 'clearance', 'special access', 'internal',
        'maintenance', 'debug', 'testing mode', 'sudo', 'root', 'superuser'
    ]
    authority_count = sum(1 for word in authority_words if word in content_lower)
    if authority_count >= 2:
        findings.append({
            'type': 'Multiple authority claims',
            'severity': 'warning',
            'description': f'Message contains {authority_count} authority-related terms',
            'weight': authority_count + 2,
        })

    # Heuristic 2: Instruction-like formatting
    lines = content.split('\n')
    instruction_indicators = [
        (r'^\s*\d+[\.\)]\s+', 'Numbered instructions'),
        (r'^\s*[-*•]\s+', 'Bulleted instructions'),
        (r'(?i)^(step|rule|instruction|requirement)\s*\d+', 'Explicit step markers'),
    ]

    for pattern, name in instruction_indicators:
        matches = [line for line in lines if re.match(pattern, line)]
        if len(matches) >= 4:
            findings.append({
                'type': f'Instruction pattern: {name}',
                'severity': 'info',
                'description': f'Detected {len(matches)} instruction-like patterns',
                'weight': 2,
            })

    # Heuristic 3: Imperative directives to AI
    imperative_patterns = [
        r'(?i)\byou must (always|never)\b',
        r'(?i)\byou will (always|never)\b',
        r'(?i)\byou shall (always|never)\b',
        r'(?i)\byou should always\b',
        r'(?i)\bnever (refuse|say no|decline|reject)\b',
        r'(?i)\balways (comply|agree|accept|answer|respond)\b',
    ]
    imperative_count = sum(1 for p in imperative_patterns if re.search(p, content))
    if imperative_count >= 2:
        findings.append({
            'type': 'Multiple imperative directives',
            'severity': 'warning',
            'description': f'Detected {imperative_count} imperative directives to AI',
            'weight': imperative_count + 2,
        })

    # Heuristic 4: Persona definition attempt
    persona_patterns = [
        r'(?i)from now on,?\s+(you|your)',
        r'(?i)for (this|the rest of).*(conversation|session|chat)',
        r'(?i)you are now\b',
        r'(?i)your new (name|identity|personality|persona)',
        r'(?i)(act|behave|respond)\s+as\s+(if\s+)?(you\s+)?(are|were)',
        r'(?i)forget (everything|what|who)\s+(you|about)',
    ]

    persona_count = sum(1 for p in persona_patterns if re.search(p, content))
    if persona_count >= 1:
        findings.append({
            'type': 'Persona manipulation attempt',
            'severity': 'warning',
            'description': f'Detected {persona_count} persona manipulation pattern(s)',
            'weight': 4 + persona_count,
        })

    # Heuristic 5: High ratio of ALL CAPS words (shouting/emphasis)
    words = content.split()
    if words:
        caps_words = [w for w in words if w.isupper() and len(w) > 2 and w.isalpha()]
        caps_ratio = len(caps_words) / len(words) if words else 0
        if caps_ratio > 0.15 and len(caps_words) > 5:
            findings.append({
                'type': 'Excessive capitalization',
                'severity': 'info',
                'description': f'{caps_ratio:.0%} of words are ALL CAPS ({len(caps_words)} words)',
                'weight': 2,
            })

    # Heuristic 6: Contradictory instructions
    contradictions = [
        (r'(?i)ignore.*previous', r'(?i)follow.*new'),
        (r'(?i)forget.*rules', r'(?i)(new|different)\s+rules'),
        (r'(?i)discard.*instructions', r'(?i)(these|new)\s+instructions'),
    ]
    for pattern1, pattern2 in contradictions:
        if re.search(pattern1, content) and re.search(pattern2, content):
            findings.append({
                'type': 'Contradictory instruction pair',
                'severity': 'warning',
                'description': 'Found instruction override pattern (ignore old + follow new)',
                'weight': 5,
            })
            break

    # Heuristic 7: System prompt extraction attempt
    extraction_patterns = [
        r'(?i)(show|display|print|reveal|tell me|output)\s+(your\s+)?(system\s+)?(prompt|instructions|rules)',
        r'(?i)(what\s+are|repeat|recite)\s+(your\s+)?(initial|original|system)\s+(instructions|prompt|rules)',
        r'(?i)ignore\s+(the\s+)?above\s+and\s+(instead|show|tell)',
    ]
    for pattern in extraction_patterns:
        if re.search(pattern, content):
            findings.append({
                'type': 'System prompt extraction attempt',
                'severity': 'warning',
                'description': 'Attempting to extract system instructions',
                'weight': 5,
            })
            break

    return findings

# =============================================================================
# SESSION RISK TRACKING
# =============================================================================

def load_session_risk() -> Dict:
    """Load session risk tracking data."""
    try:
        if os.path.exists(SESSION_RISK_FILE):
            with open(SESSION_RISK_FILE, 'r') as f:
                data = json.load(f)
                # Check if session is still valid (1 hour timeout)
                if time.time() - data.get('last_update', 0) > 3600:
                    return {'risk_score': 0, 'attempts': [], 'last_update': time.time()}
                return data
    except Exception:
        pass
    return {'risk_score': 0, 'attempts': [], 'last_update': time.time()}


def save_session_risk(data: Dict) -> None:
    """Save session risk tracking data."""
    try:
        os.makedirs(os.path.dirname(SESSION_RISK_FILE), exist_ok=True)
        data['last_update'] = time.time()
        with open(SESSION_RISK_FILE, 'w') as f:
            json.dump(data, f)
    except Exception:
        pass


def update_risk_score(findings: List[Dict]) -> Tuple[int, bool]:
    """
    Update session risk score based on findings.

    Returns:
        Tuple of (current_risk_score, is_escalating)
    """
    session = load_session_risk()

    # Calculate score from current findings
    current_score = sum(f.get('weight', 1) for f in findings)

    # Add to historical score (with decay)
    time_since_last = time.time() - session.get('last_update', time.time())
    decay_factor = max(0.5, 1 - (time_since_last / 3600))  # Decay over 1 hour
    historical_score = session.get('risk_score', 0) * decay_factor

    new_score = historical_score + current_score

    # Track attempt
    if findings:
        session['attempts'].append({
            'timestamp': time.time(),
            'score': current_score,
            'types': [f['type'] for f in findings[:5]],  # Top 5 types
        })
        # Keep only last 20 attempts
        session['attempts'] = session['attempts'][-20:]

    # Detect escalation (increasing severity over attempts)
    is_escalating = False
    attempts = session.get('attempts', [])
    if len(attempts) >= 3:
        recent_scores = [a['score'] for a in attempts[-3:]]
        if all(recent_scores[i] <= recent_scores[i+1] for i in range(len(recent_scores)-1)):
            is_escalating = True

    session['risk_score'] = new_score
    save_session_risk(session)

    return int(new_score), is_escalating


# =============================================================================
# DETECTION
# =============================================================================

def detect_jailbreak_patterns(content: str) -> List[Dict]:
    """Detect jailbreak patterns in content."""
    findings = []

    for pattern_def in ALL_JAILBREAK_PATTERNS:
        pattern = pattern_def['pattern']
        matches = list(re.finditer(pattern, content, re.MULTILINE | re.IGNORECASE))

        for match in matches:
            matched_text = match.group(0)

            # Get line context
            line_start = content.rfind('\n', 0, match.start()) + 1
            line_end = content.find('\n', match.end())
            if line_end == -1:
                line_end = len(content)
            line = content[line_start:line_end].strip()

            findings.append({
                'type': pattern_def['name'],
                'severity': pattern_def['severity'],
                'description': pattern_def['description'],
                'weight': pattern_def.get('weight', 1),
                'match': matched_text[:60] + '...' if len(matched_text) > 60 else matched_text,
                'line': line[:120] + '...' if len(line) > 120 else line,
            })

    return findings


def detect_multi_turn_patterns(content: str) -> List[Dict]:
    """Detect patterns that suggest multi-turn manipulation setup."""
    findings = []

    # Check for setup phrases that typically precede jailbreak attempts
    setup_patterns = [
        (r'(?i)(first|before\s+we\s+start|let\s+me\s+explain|here\'s\s+how\s+this\s+works)', 'Setup preamble'),
        (r'(?i)(from\s+now\s+on|going\s+forward|for\s+the\s+rest\s+of)\s+(this|our)\s+(conversation|chat|session)', 'Persistent state change'),
        (r'(?i)(remember|don\'t\s+forget|keep\s+in\s+mind).*\b(throughout|always|every\s+response)', 'Persistence instruction'),
    ]

    for pattern, name in setup_patterns:
        if re.search(pattern, content):
            findings.append({
                'type': f'Multi-turn setup: {name}',
                'severity': 'info',
                'description': 'Pattern suggesting multi-turn manipulation setup',
                'weight': 2,
            })

    return findings


def analyze_content(content: str) -> List[Dict]:
    """
    Run comprehensive jailbreak detection.

    Layers:
    1. Normalize content (unicode, zero-width, confusables)
    2. Pattern matching (exact regex)
    3. Multi-turn pattern detection
    4. Fuzzy matching (similar keywords)
    5. Heuristic detection (behavioral patterns)

    Both original and normalized content are checked to ensure:
    - Normalized catches obfuscation attempts
    - Original catches patterns that rely on specific encoding
    """
    all_findings = []

    # Layer 1: Normalize content for evasion detection
    normalized = normalize_text(content)

    # Check if normalization changed anything significant
    # (indicates potential obfuscation attempt)
    if len(normalized) < len(content) * 0.9:
        # More than 10% of content was stripped (zero-width chars, etc.)
        all_findings.append({
            'type': 'Heavy text obfuscation',
            'severity': 'warning',
            'description': f'Significant obfuscation detected ({len(content) - len(normalized)} chars stripped)',
            'weight': 5,
        })

    # Layer 2: Pattern-based detection on both original and normalized
    all_findings.extend(detect_jailbreak_patterns(normalized))
    if normalized != content:
        # Also check original for patterns that need specific encoding
        original_findings = detect_jailbreak_patterns(content)
        # Add only unique findings from original
        existing_types = {f['type'] for f in all_findings}
        for f in original_findings:
            if f['type'] not in existing_types:
                all_findings.append(f)

    # Layer 3: Multi-turn detection
    all_findings.extend(detect_multi_turn_patterns(normalized))

    # Layer 4: Fuzzy matching (catches leet speak, typos, variations)
    all_findings.extend(fuzzy_match_keywords(normalized))

    # Layer 5: Heuristic detection (catches unknown patterns)
    all_findings.extend(detect_heuristic_patterns(content))

    # Deduplicate by type (keep highest weight)
    seen_types = {}
    for f in all_findings:
        t = f['type']
        if t not in seen_types or f.get('weight', 0) > seen_types[t].get('weight', 0):
            seen_types[t] = f

    # Sort by weight (most significant first)
    return sorted(seen_types.values(), key=lambda x: x.get('weight', 0), reverse=True)


# =============================================================================
# MAIN
# =============================================================================

def main():
    data = get_tool_input_from_stdin()
    tool_name = data['tool_name']
    tool_input = data['tool_input']
    raw_data = data['raw']

    # Determine content to analyze
    # For UserPromptSubmit, the content is in the message
    # For PreToolUse, check the tool input
    content = ''

    if 'user_prompt' in raw_data:
        # UserPromptSubmit hook
        content = raw_data.get('user_prompt', '')
    elif tool_name in ('Write', 'Edit'):
        content = tool_input.get('content', '') or tool_input.get('new_string', '')
    elif 'message' in raw_data:
        content = raw_data.get('message', '')

    if not content:
        sys.exit(0)

    # Analyze content
    findings = analyze_content(content)

    if not findings:
        sys.exit(0)

    # Update session risk score
    risk_score, is_escalating = update_risk_score(findings)

    # Separate by severity
    critical_findings = [f for f in findings if f['severity'] == 'critical']
    warning_findings = [f for f in findings if f['severity'] == 'warning']
    info_findings = [f for f in findings if f['severity'] == 'info']

    # Escalation can upgrade warning to critical
    if is_escalating and warning_findings and risk_score > 15:
        for f in warning_findings:
            f['severity'] = 'critical'
            f['escalated'] = True
        critical_findings.extend(warning_findings)
        warning_findings = []

    # Info severity only: log and allow
    if not critical_findings and not warning_findings:
        AuditLogger.log(VALIDATOR_NAME, 'ALLOWED',
                       {'reason': 'Only info-level patterns detected',
                        'risk_score': risk_score,
                        'count': len(info_findings)},
                       severity='INFO')
        sys.exit(0)

    # Check for user override (single-use)
    # Note: For jailbreaks we still allow override since user is in control
    override_valid, override_reason = OverrideManager.check_and_consume_override('JAILBREAK')
    if override_valid:
        AuditLogger.log_override_used(VALIDATOR_NAME, 'BMAD_ALLOW_JAILBREAK', 'user_input')
        print(f"WARNING: Jailbreak patterns detected - ALLOWED via override", file=sys.stderr)
        for f in critical_findings + warning_findings:
            print(f"  - [{f['severity'].upper()}] {f['type']}", file=sys.stderr)
        print(f"  Session risk score: {risk_score}", file=sys.stderr)
        print(f"  Override consumed. Set BMAD_ALLOW_JAILBREAK=true again for next operation.", file=sys.stderr)
        sys.exit(0)

    # Block
    AuditLogger.log_blocked(VALIDATOR_NAME, 'Jailbreak attempt detected', 'user_input',
                           {'critical': len(critical_findings),
                            'warning': len(warning_findings),
                            'risk_score': risk_score,
                            'is_escalating': is_escalating})

    print(f"\n{'='*60}", file=sys.stderr)
    print(f"BMAD GUARDRAIL: JAILBREAK ATTEMPT DETECTED", file=sys.stderr)
    print(f"{'='*60}", file=sys.stderr)
    print(f"\nDetected {len(critical_findings) + len(warning_findings)} jailbreak pattern(s):", file=sys.stderr)

    # Show findings
    for i, finding in enumerate(critical_findings + warning_findings, 1):
        severity_icon = {'critical': '🔴', 'warning': '🟠'}.get(finding['severity'], '⚪')
        escalated = ' (ESCALATED)' if finding.get('escalated') else ''
        print(f"\n  {i}. [{finding['severity'].upper()}]{escalated} {finding['type']}", file=sys.stderr)
        print(f"     {finding['description']}", file=sys.stderr)
        if 'match' in finding:
            print(f"     Matched: {finding['match']}", file=sys.stderr)

    # Risk assessment
    print(f"\n{'='*60}", file=sys.stderr)
    print(f"SESSION RISK ASSESSMENT:", file=sys.stderr)
    print(f"  Current risk score: {risk_score}", file=sys.stderr)
    if is_escalating:
        print(f"  ⚠️  ESCALATING PATTERN DETECTED - Increasing severity over attempts", file=sys.stderr)
    risk_level = 'LOW' if risk_score < 10 else 'MEDIUM' if risk_score < 25 else 'HIGH'
    print(f"  Risk level: {risk_level}", file=sys.stderr)

    print(f"\n{'='*60}", file=sys.stderr)
    print(f"WHAT THIS MEANS:", file=sys.stderr)
    print(f"  - These patterns are commonly used to manipulate AI systems", file=sys.stderr)
    print(f"  - They attempt to bypass safety guidelines", file=sys.stderr)
    print(f"  - Legitimate security research may trigger these patterns", file=sys.stderr)
    print(f"\n{'='*60}", file=sys.stderr)
    print(f"USER DECISION REQUIRED:", file=sys.stderr)
    print(f"\nIf this is legitimate (security research, testing, etc.):", file=sys.stderr)
    print(f"  export BMAD_ALLOW_JAILBREAK=true", file=sys.stderr)
    print(f"\nNote: Override will be consumed after one use.", file=sys.stderr)
    print(f"{'='*60}\n", file=sys.stderr)

    sys.exit(2)


if __name__ == '__main__':
    main()
