#!/usr/bin/env python3
"""
BMAD Guardrails: PII Detection and Redaction Guard
===================================================
Detects and blocks file writes containing Personally Identifiable Information (PII).

Supports both US and EU (GDPR-relevant) PII patterns including:
- Social Security Numbers, National ID numbers
- Credit card numbers (with Luhn validation)
- Bank account numbers (IBAN, routing numbers)
- Personal identifiers (passport, driver's license)
- Contact information in sensitive contexts
- Health and financial identifiers

Exit Codes:
- 0: Allow the operation
- 2: Block the operation (PII detected, severity > info)

Behavior:
- Info severity: Log and allow
- Warning/Critical severity: Block, inform user, let user decide via override
"""

import json
import sys
import os
import re
import math
from typing import List, Dict, Tuple, Optional

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


VALIDATOR_NAME = 'pii_guard'

# =============================================================================
# PII PATTERNS - US
# =============================================================================

US_PII_PATTERNS = [
    # Social Security Number (SSN)
    {
        'name': 'US Social Security Number',
        'pattern': r'\b(?!000|666|9\d{2})\d{3}[-\s]?(?!00)\d{2}[-\s]?(?!0000)\d{4}\b',
        'severity': 'critical',
        'redaction': '[REDACTED-SSN]',
        'validator': None,
        'context_required': False,
    },
    # US Phone Numbers
    {
        'name': 'US Phone Number',
        'pattern': r'\b(?:\+1[-.\s]?)?\(?[2-9]\d{2}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b',
        'severity': 'warning',
        'redaction': '[REDACTED-PHONE]',
        'validator': None,
        'context_required': True,  # Only flag in sensitive contexts
    },
    # US Driver's License (state-specific patterns for common states)
    {
        'name': 'US Driver\'s License (CA)',
        'pattern': r'\b[A-Z]\d{7}\b',  # California format
        'severity': 'warning',
        'redaction': '[REDACTED-DL]',
        'validator': None,
        'context_required': True,
    },
    # US Passport Number
    {
        'name': 'US Passport Number',
        'pattern': r'\b[A-Z]?\d{8,9}\b',
        'severity': 'critical',
        'redaction': '[REDACTED-PASSPORT]',
        'validator': None,
        'context_required': True,
    },
    # US Bank Routing Number (ABA)
    {
        'name': 'US Bank Routing Number',
        'pattern': r'\b(?:0[1-9]|[1-2]\d|3[0-2])\d{7}\b',
        'severity': 'critical',
        'redaction': '[REDACTED-ROUTING]',
        'validator': 'validate_aba_routing',
        'context_required': True,
    },
    # Medicare/Medicaid ID
    {
        'name': 'US Medicare ID',
        'pattern': r'\b[1-9][A-Z][A-Z0-9]\d-?[A-Z][A-Z0-9]\d-?[A-Z]{2}\d{2}\b',
        'severity': 'critical',
        'redaction': '[REDACTED-MEDICARE]',
        'validator': None,
        'context_required': False,
    },
    # Individual Taxpayer Identification Number (ITIN)
    {
        'name': 'US ITIN',
        'pattern': r'\b9\d{2}[-\s]?[78]\d[-\s]?\d{4}\b',
        'severity': 'critical',
        'redaction': '[REDACTED-ITIN]',
        'validator': None,
        'context_required': False,
    },
]

# =============================================================================
# PII PATTERNS - EU (GDPR-relevant)
# =============================================================================

EU_PII_PATTERNS = [
    # IBAN (International Bank Account Number)
    {
        'name': 'IBAN',
        'pattern': r'\b[A-Z]{2}\d{2}[A-Z0-9]{4,30}\b',
        'severity': 'critical',
        'redaction': '[REDACTED-IBAN]',
        'validator': 'validate_iban',
        'context_required': False,
    },
    # BIC/SWIFT Code
    {
        'name': 'BIC/SWIFT Code',
        'pattern': r'\b[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}(?:[A-Z0-9]{3})?\b',
        'severity': 'warning',
        'redaction': '[REDACTED-BIC]',
        'validator': None,
        'context_required': True,
    },
    # UK National Insurance Number
    {
        'name': 'UK National Insurance Number',
        'pattern': r'\b[A-CEGHJ-PR-TW-Z][A-CEGHJ-NPR-TW-Z]\s?\d{2}\s?\d{2}\s?\d{2}\s?[A-D]\b',
        'severity': 'critical',
        'redaction': '[REDACTED-NINO]',
        'validator': None,
        'context_required': False,
    },
    # UK NHS Number
    {
        'name': 'UK NHS Number',
        'pattern': r'\b\d{3}[-\s]?\d{3}[-\s]?\d{4}\b',
        'severity': 'critical',
        'redaction': '[REDACTED-NHS]',
        'validator': 'validate_nhs_number',
        'context_required': True,
    },
    # German Tax ID (Steuer-ID)
    {
        'name': 'German Tax ID (Steuer-ID)',
        'pattern': r'\b\d{11}\b',
        'severity': 'critical',
        'redaction': '[REDACTED-DE-TAX]',
        'validator': 'validate_german_tax_id',
        'context_required': True,
    },
    # German Social Insurance Number
    {
        'name': 'German Social Insurance Number',
        'pattern': r'\b\d{2}[0-3]\d[0-1]\d{2}\d[A-Z]\d{3}\d\b',
        'severity': 'critical',
        'redaction': '[REDACTED-DE-SOZVERS]',
        'validator': None,
        'context_required': False,
    },
    # French INSEE/NIR (Social Security)
    {
        'name': 'French Social Security Number (NIR)',
        'pattern': r'\b[12]\s?\d{2}\s?(?:0[1-9]|1[0-2]|[2-9]\d)\s?\d{2}\s?\d{3}\s?\d{3}\s?\d{2}\b',
        'severity': 'critical',
        'redaction': '[REDACTED-FR-NIR]',
        'validator': None,
        'context_required': False,
    },
    # Spanish DNI/NIE
    {
        'name': 'Spanish DNI',
        'pattern': r'\b\d{8}[A-Z]\b',
        'severity': 'critical',
        'redaction': '[REDACTED-ES-DNI]',
        'validator': 'validate_spanish_dni',
        'context_required': False,
    },
    {
        'name': 'Spanish NIE',
        'pattern': r'\b[XYZ]\d{7}[A-Z]\b',
        'severity': 'critical',
        'redaction': '[REDACTED-ES-NIE]',
        'validator': 'validate_spanish_nie',
        'context_required': False,
    },
    # Italian Codice Fiscale
    {
        'name': 'Italian Fiscal Code',
        'pattern': r'\b[A-Z]{6}\d{2}[A-EHLMPRST][0-3]\d[A-Z]\d{3}[A-Z]\b',
        'severity': 'critical',
        'redaction': '[REDACTED-IT-CF]',
        'validator': None,
        'context_required': False,
    },
    # Dutch BSN (Burgerservicenummer)
    {
        'name': 'Dutch BSN',
        'pattern': r'\b\d{9}\b',
        'severity': 'critical',
        'redaction': '[REDACTED-NL-BSN]',
        'validator': 'validate_dutch_bsn',
        'context_required': True,
    },
    # Belgian National Number
    {
        'name': 'Belgian National Number',
        'pattern': r'\b\d{2}[.\s]?\d{2}[.\s]?\d{2}[-.\s]?\d{3}[-.\s]?\d{2}\b',
        'severity': 'critical',
        'redaction': '[REDACTED-BE-NN]',
        'validator': None,
        'context_required': False,
    },
    # Polish PESEL
    {
        'name': 'Polish PESEL',
        'pattern': r'\b\d{11}\b',
        'severity': 'critical',
        'redaction': '[REDACTED-PL-PESEL]',
        'validator': 'validate_polish_pesel',
        'context_required': True,
    },
    # Portuguese NIF
    {
        'name': 'Portuguese NIF',
        'pattern': r'\b[1-9]\d{8}\b',
        'severity': 'critical',
        'redaction': '[REDACTED-PT-NIF]',
        'validator': 'validate_portuguese_nif',
        'context_required': True,
    },
    # Austrian Social Insurance Number
    {
        'name': 'Austrian Social Insurance Number',
        'pattern': r'\b\d{4}[0-3]\d[01]\d{2}\d\b',
        'severity': 'critical',
        'redaction': '[REDACTED-AT-SOZVERS]',
        'validator': None,
        'context_required': True,
    },
    # Swedish Personal Number (Personnummer)
    {
        'name': 'Swedish Personal Number',
        'pattern': r'\b\d{6}[-+]?\d{4}\b',
        'severity': 'critical',
        'redaction': '[REDACTED-SE-PN]',
        'validator': 'validate_swedish_personnummer',
        'context_required': False,
    },
    # Finnish Personal Identity Code
    {
        'name': 'Finnish Personal Identity Code',
        'pattern': r'\b\d{6}[-+A]\d{3}[0-9A-Y]\b',
        'severity': 'critical',
        'redaction': '[REDACTED-FI-HETU]',
        'validator': None,
        'context_required': False,
    },
    # EU VAT Numbers (generic pattern)
    {
        'name': 'EU VAT Number',
        'pattern': r'\b(?:ATU|BE0?|BG|CY|CZ|DE|DK|EE|EL|ES[A-Z]?|FI|FR[A-Z0-9]{2}|HR|HU|IE|IT|LT|LU|LV|MT|NL|PL|PT|RO|SE|SI|SK)[0-9A-Z]{8,12}\b',
        'severity': 'warning',
        'redaction': '[REDACTED-VAT]',
        'validator': None,
        'context_required': True,
    },
    # European Passport Numbers (generic)
    {
        'name': 'EU Passport Number',
        'pattern': r'\b[A-Z]{1,2}\d{6,9}\b',
        'severity': 'critical',
        'redaction': '[REDACTED-PASSPORT]',
        'validator': None,
        'context_required': True,
    },
]

# =============================================================================
# COMMON PII PATTERNS (International)
# =============================================================================

COMMON_PII_PATTERNS = [
    # Credit Card Numbers (major networks)
    {
        'name': 'Credit Card Number',
        'pattern': r'\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12}|(?:2131|1800|35\d{3})\d{11})\b',
        'severity': 'critical',
        'redaction': '[REDACTED-CC]',
        'validator': 'validate_luhn',
        'context_required': False,
    },
    # Email Addresses (in sensitive contexts)
    {
        'name': 'Email Address',
        'pattern': r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
        'severity': 'info',
        'redaction': '[REDACTED-EMAIL]',
        'validator': None,
        'context_required': True,
    },
    # IP Addresses (internal/private ranges)
    {
        'name': 'Private IP Address',
        'pattern': r'\b(?:10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(?:1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3})\b',
        'severity': 'info',
        'redaction': '[REDACTED-IP]',
        'validator': None,
        'context_required': True,
    },
    # Date of Birth (various formats)
    {
        'name': 'Date of Birth',
        'pattern': r'\b(?:0?[1-9]|[12]\d|3[01])[-/.](?:0?[1-9]|1[0-2])[-/.](?:19|20)\d{2}\b',
        'severity': 'warning',
        'redaction': '[REDACTED-DOB]',
        'validator': None,
        'context_required': True,
    },
    # MAC Address
    {
        'name': 'MAC Address',
        'pattern': r'\b(?:[0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}\b',
        'severity': 'info',
        'redaction': '[REDACTED-MAC]',
        'validator': None,
        'context_required': True,
    },
    # GPS Coordinates (high precision)
    {
        'name': 'GPS Coordinates',
        'pattern': r'\b[-+]?(?:[1-8]?\d(?:\.\d{5,})?|90(?:\.0+)?),\s*[-+]?(?:180(?:\.0+)?|(?:(?:1[0-7]\d)|(?:[1-9]?\d))(?:\.\d{5,})?)\b',
        'severity': 'warning',
        'redaction': '[REDACTED-GPS]',
        'validator': None,
        'context_required': True,
    },
]

# Combine all patterns
ALL_PII_PATTERNS = US_PII_PATTERNS + EU_PII_PATTERNS + COMMON_PII_PATTERNS

# =============================================================================
# VALIDATORS
# =============================================================================

def validate_luhn(number: str) -> bool:
    """Validate credit card number using Luhn algorithm."""
    digits = [int(d) for d in re.sub(r'\D', '', number)]
    if len(digits) < 13 or len(digits) > 19:
        return False

    checksum = 0
    for i, digit in enumerate(reversed(digits)):
        if i % 2 == 1:
            digit *= 2
            if digit > 9:
                digit -= 9
        checksum += digit
    return checksum % 10 == 0


def validate_iban(iban: str) -> bool:
    """Validate IBAN using MOD 97-10 algorithm."""
    iban = iban.replace(' ', '').upper()
    if len(iban) < 15 or len(iban) > 34:
        return False

    # Move first 4 chars to end and convert letters to numbers
    rearranged = iban[4:] + iban[:4]
    converted = ''
    for char in rearranged:
        if char.isdigit():
            converted += char
        else:
            converted += str(ord(char) - 55)

    try:
        return int(converted) % 97 == 1
    except ValueError:
        return False


def validate_aba_routing(routing: str) -> bool:
    """Validate US ABA routing number."""
    digits = re.sub(r'\D', '', routing)
    if len(digits) != 9:
        return False

    weights = [3, 7, 1, 3, 7, 1, 3, 7, 1]
    total = sum(int(d) * w for d, w in zip(digits, weights))
    return total % 10 == 0


def validate_nhs_number(nhs: str) -> bool:
    """Validate UK NHS number using MOD 11 algorithm."""
    digits = re.sub(r'\D', '', nhs)
    if len(digits) != 10:
        return False

    weights = [10, 9, 8, 7, 6, 5, 4, 3, 2]
    total = sum(int(d) * w for d, w in zip(digits[:9], weights))
    remainder = total % 11
    check_digit = 11 - remainder if remainder != 0 else 0

    return check_digit == int(digits[9]) if check_digit < 10 else False


def validate_german_tax_id(tax_id: str) -> bool:
    """Validate German Steuer-ID (11 digits with specific rules)."""
    digits = re.sub(r'\D', '', tax_id)
    if len(digits) != 11:
        return False

    # First digit cannot be 0
    if digits[0] == '0':
        return False

    # Check digit frequency (one digit appears twice or three times, others once)
    digit_counts = {}
    for d in digits[:10]:
        digit_counts[d] = digit_counts.get(d, 0) + 1

    has_double_or_triple = any(c >= 2 for c in digit_counts.values())
    return has_double_or_triple


def validate_spanish_dni(dni: str) -> bool:
    """Validate Spanish DNI number."""
    dni = dni.upper()
    match = re.match(r'^(\d{8})([A-Z])$', dni)
    if not match:
        return False

    number, letter = match.groups()
    letters = 'TRWAGMYFPDXBNJZSQVHLCKE'
    return letters[int(number) % 23] == letter


def validate_spanish_nie(nie: str) -> bool:
    """Validate Spanish NIE number."""
    nie = nie.upper()
    match = re.match(r'^([XYZ])(\d{7})([A-Z])$', nie)
    if not match:
        return False

    prefix, number, letter = match.groups()
    prefix_map = {'X': '0', 'Y': '1', 'Z': '2'}
    full_number = prefix_map[prefix] + number
    letters = 'TRWAGMYFPDXBNJZSQVHLCKE'
    return letters[int(full_number) % 23] == letter


def validate_dutch_bsn(bsn: str) -> bool:
    """Validate Dutch BSN using 11-proof algorithm."""
    digits = re.sub(r'\D', '', bsn)
    if len(digits) != 9:
        return False

    weights = [9, 8, 7, 6, 5, 4, 3, 2, -1]
    total = sum(int(d) * w for d, w in zip(digits, weights))
    return total % 11 == 0


def validate_polish_pesel(pesel: str) -> bool:
    """Validate Polish PESEL number."""
    digits = re.sub(r'\D', '', pesel)
    if len(digits) != 11:
        return False

    weights = [1, 3, 7, 9, 1, 3, 7, 9, 1, 3]
    total = sum(int(d) * w for d, w in zip(digits[:10], weights))
    check = (10 - (total % 10)) % 10
    return check == int(digits[10])


def validate_portuguese_nif(nif: str) -> bool:
    """Validate Portuguese NIF number."""
    digits = re.sub(r'\D', '', nif)
    if len(digits) != 9:
        return False

    # Valid first digits
    if digits[0] not in '125689':
        return False

    weights = [9, 8, 7, 6, 5, 4, 3, 2]
    total = sum(int(d) * w for d, w in zip(digits[:8], weights))
    remainder = total % 11
    check = 0 if remainder < 2 else 11 - remainder
    return check == int(digits[8])


def validate_swedish_personnummer(pn: str) -> bool:
    """Validate Swedish Personal Number using Luhn algorithm."""
    # Remove separator
    digits = re.sub(r'[-+]', '', pn)
    if len(digits) != 10:
        return False

    return validate_luhn(digits)


# Validator dispatch
VALIDATORS = {
    'validate_luhn': validate_luhn,
    'validate_iban': validate_iban,
    'validate_aba_routing': validate_aba_routing,
    'validate_nhs_number': validate_nhs_number,
    'validate_german_tax_id': validate_german_tax_id,
    'validate_spanish_dni': validate_spanish_dni,
    'validate_spanish_nie': validate_spanish_nie,
    'validate_dutch_bsn': validate_dutch_bsn,
    'validate_polish_pesel': validate_polish_pesel,
    'validate_portuguese_nif': validate_portuguese_nif,
    'validate_swedish_personnummer': validate_swedish_personnummer,
}

# =============================================================================
# CONTEXT DETECTION
# =============================================================================

# Patterns that indicate sensitive context (trigger context_required patterns)
SENSITIVE_CONTEXT_PATTERNS = [
    r'(?i)\b(personal|private|confidential|sensitive)\b',
    r'(?i)\b(patient|client|customer|employee|user)\s+(data|info|record|detail)',
    r'(?i)\b(medical|health|financial|banking)\s+(record|data|info)',
    r'(?i)\b(ssn|social\s*security|tax\s*id|national\s*id)',
    r'(?i)\b(passport|driver.?s?\s*licen[sc]e|birth\s*date|dob)\b',
    r'(?i)\b(credit\s*card|bank\s*account|routing\s*number|iban)\b',
    r'(?i)\b(address|phone|email|contact)\s+(info|detail|list)',
    r'(?i)\b(gdpr|pii|hipaa|pci[-\s]?dss)\b',
]

# Files that are expected to contain test/fake PII
EXPECTED_PII_FILES = [
    'test_data',
    'mock_data',
    'sample_data',
    'fixtures',
    'seeds',
    '.example',
    '.sample',
    '.template',
    'fake_',
    '_fake',
    'dummy_',
    '_dummy',
]

# Patterns indicating fake/test data
FAKE_DATA_INDICATORS = [
    r'(?i)\b(fake|test|mock|dummy|sample|example|placeholder)\b',
    r'(?i)\b(john\s*doe|jane\s*doe|test\s*user)\b',
    r'(?i)\b(xxx+|000-00-0000|123-45-6789)\b',
    r'(?i)\b(your[-_]?(?:ssn|id|number))\b',
    r'(?i)\b(<replace>|<your[-_]|insert[-_]here)\b',
]


def is_sensitive_context(content: str, line: str) -> bool:
    """Check if the content/line is in a sensitive context."""
    # Check the line itself
    for pattern in SENSITIVE_CONTEXT_PATTERNS:
        if re.search(pattern, line):
            return True

    # Check surrounding context (10 lines)
    lines = content.split('\n')
    for i, l in enumerate(lines):
        if line.strip() in l:
            start = max(0, i - 5)
            end = min(len(lines), i + 6)
            context = '\n'.join(lines[start:end])
            for pattern in SENSITIVE_CONTEXT_PATTERNS:
                if re.search(pattern, context):
                    return True
            break

    return False


def is_test_file(file_path: str) -> bool:
    """Check if file is expected to contain test/fake PII."""
    path_lower = file_path.lower()
    return any(indicator in path_lower for indicator in EXPECTED_PII_FILES)


def is_fake_data(content: str, line: str) -> bool:
    """Check if the PII appears to be fake/test data."""
    # Check the line containing the match
    for pattern in FAKE_DATA_INDICATORS:
        if re.search(pattern, line):
            return True

    # Check surrounding context
    lines = content.split('\n')
    for i, l in enumerate(lines):
        if line.strip() in l:
            start = max(0, i - 3)
            end = min(len(lines), i + 4)
            context = '\n'.join(lines[start:end])
            for pattern in FAKE_DATA_INDICATORS:
                if re.search(pattern, context):
                    return True
            break

    return False


# =============================================================================
# PII DETECTION
# =============================================================================

def find_pii(content: str, file_path: str) -> List[Dict]:
    """Find all PII in the content."""
    found_pii = []

    for pii_def in ALL_PII_PATTERNS:
        pattern = pii_def['pattern']
        matches = re.finditer(pattern, content, re.IGNORECASE if 'IGNORECASE' in str(pii_def.get('flags', '')) else 0)

        for match in matches:
            matched_text = match.group(0)

            # Get the line containing the match
            line_start = content.rfind('\n', 0, match.start()) + 1
            line_end = content.find('\n', match.end())
            if line_end == -1:
                line_end = len(content)
            line = content[line_start:line_end]

            # Check if validator exists and run it
            if pii_def['validator']:
                validator_func = VALIDATORS.get(pii_def['validator'])
                if validator_func and not validator_func(matched_text):
                    continue  # Failed validation, skip

            # Check if context is required and present
            if pii_def['context_required']:
                if not is_sensitive_context(content, line):
                    continue  # No sensitive context, skip

            # Check if it's fake/test data
            if is_fake_data(content, line):
                continue  # Appears to be test data, skip

            # Determine actual severity
            severity = pii_def['severity']

            found_pii.append({
                'type': pii_def['name'],
                'match': matched_text[:20] + '...' if len(matched_text) > 20 else matched_text,
                'line': line.strip()[:100] + '...' if len(line.strip()) > 100 else line.strip(),
                'severity': severity,
                'redaction': pii_def['redaction'],
                'line_number': content[:match.start()].count('\n') + 1,
            })

    return found_pii


def generate_redacted_preview(content: str, pii_items: List[Dict]) -> str:
    """Generate a preview of what the content would look like redacted."""
    redacted = content

    # Sort by position (reverse) to maintain positions during replacement
    for pii in sorted(pii_items, key=lambda x: x.get('line_number', 0), reverse=True):
        # Simple replacement for preview purposes
        pattern = re.escape(pii['match'].rstrip('...'))
        redacted = re.sub(pattern, pii['redaction'], redacted, count=1)

    return redacted[:500] + '...' if len(redacted) > 500 else redacted


# =============================================================================
# MAIN
# =============================================================================

def main():
    data = get_tool_input_from_stdin()
    tool_input = data['tool_input']

    # Get content and file path based on tool type
    content = tool_input.get('content', '') or tool_input.get('new_string', '')
    file_path = tool_input.get('file_path', '')

    if not content:
        sys.exit(0)

    # Check if this is a test file
    if is_test_file(file_path):
        AuditLogger.log(VALIDATOR_NAME, 'ALLOWED',
                       {'reason': 'Test/mock data file', 'file': file_path},
                       severity='INFO')
        sys.exit(0)

    # Find PII in the content
    pii_items = find_pii(content, file_path)

    if not pii_items:
        sys.exit(0)

    # Separate by severity
    critical_pii = [p for p in pii_items if p['severity'] == 'critical']
    warning_pii = [p for p in pii_items if p['severity'] == 'warning']
    info_pii = [p for p in pii_items if p['severity'] == 'info']

    # Info severity: log and allow
    if not critical_pii and not warning_pii:
        AuditLogger.log(VALIDATOR_NAME, 'ALLOWED',
                       {'reason': 'Only info-level PII detected', 'file': file_path,
                        'count': len(info_pii)},
                       severity='INFO')
        sys.exit(0)

    # Check for user override (single-use)
    override_valid, override_reason = OverrideManager.check_and_consume_override('PII')
    if override_valid:
        AuditLogger.log_override_used(VALIDATOR_NAME, 'BMAD_ALLOW_PII', file_path)
        print(f"WARNING: PII detected in {file_path} - ALLOWED via single-use override", file=sys.stderr)
        for pii in critical_pii + warning_pii:
            print(f"  - [{pii['severity'].upper()}] {pii['type']} at line {pii['line_number']}", file=sys.stderr)
        print(f"  Override consumed. Set BMAD_ALLOW_PII=true again for next operation.", file=sys.stderr)
        sys.exit(0)

    # Block the operation
    AuditLogger.log_blocked(VALIDATOR_NAME, 'PII detected', file_path,
                           {'critical': len(critical_pii),
                            'warning': len(warning_pii),
                            'info': len(info_pii)})

    print(f"\n{'='*60}", file=sys.stderr)
    print(f"BMAD GUARDRAIL: PII DETECTED", file=sys.stderr)
    print(f"{'='*60}", file=sys.stderr)
    print(f"\nFile: {file_path}", file=sys.stderr)
    print(f"\nDetected {len(critical_pii) + len(warning_pii)} PII item(s) requiring attention:", file=sys.stderr)

    # Show critical first
    for i, pii in enumerate(critical_pii + warning_pii, 1):
        severity_icon = {'critical': '🔴', 'warning': '🟠'}.get(pii['severity'], '⚪')
        print(f"\n  {i}. [{pii['severity'].upper()}] {pii['type']}", file=sys.stderr)
        print(f"     Line {pii['line_number']}: {pii['line']}", file=sys.stderr)
        print(f"     Suggested redaction: {pii['redaction']}", file=sys.stderr)

    if info_pii:
        print(f"\n  Additionally, {len(info_pii)} info-level item(s) detected (not blocking)", file=sys.stderr)

    print(f"\n{'='*60}", file=sys.stderr)
    print(f"RECOMMENDATIONS:", file=sys.stderr)
    print(f"  1. Replace PII with placeholder values for test data", file=sys.stderr)
    print(f"  2. Use environment variables for sensitive configuration", file=sys.stderr)
    print(f"  3. Store PII in encrypted databases, not code/config files", file=sys.stderr)
    print(f"  4. If this is test data, rename file to include 'test_', 'mock_', or 'fake_'", file=sys.stderr)
    print(f"\n{'='*60}", file=sys.stderr)
    print(f"USER DECISION REQUIRED:", file=sys.stderr)
    print(f"\nTo allow this write (single-use, expires in 5 minutes):", file=sys.stderr)
    print(f"  export BMAD_ALLOW_PII=true", file=sys.stderr)
    print(f"\nNote: Override will be consumed after one use.", file=sys.stderr)
    print(f"{'='*60}\n", file=sys.stderr)

    sys.exit(2)


if __name__ == '__main__':
    main()
