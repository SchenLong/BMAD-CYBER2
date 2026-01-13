#!/usr/bin/env python3
"""
BMAD Guardrails: PII (Personally Identifiable Information) Guard
=================================================================
Detects and blocks PII in file content to prevent data exposure.

Exit Codes:
- 0: Content is safe (no PII detected)
- 2: Content blocked (PII detected)

Detection Categories:
1. US PII:
   - Social Security Numbers (SSN)
   - Credit Card Numbers (with Luhn validation)
   - Phone Numbers
   - Driver's License patterns

2. EU PII (GDPR-relevant):
   - IBAN (International Bank Account Numbers)
   - Spanish DNI/NIE
   - Dutch BSN (Burgerservicenummer)
   - German Personal ID
   - French INSEE (Social Security)
   - Italian Codice Fiscale
   - Polish PESEL
   - Belgian National Number
   - Portuguese NIF

3. Universal:
   - Email addresses in bulk
   - Passport numbers
   - IP addresses (when combined with other PII)

Override: BMAD_ALLOW_PII=true (single-use, 5-minute timeout)
"""

import os
import re
import sys
from typing import List, Dict, Tuple

# Add validators directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from security_common import (
    AuditLogger,
    OverrideManager,
    get_tool_input_from_stdin,
    print_block_message,
    PROJECT_DIR
)

VALIDATOR_NAME = 'pii_guard'

# =============================================================================
# VALIDATION FUNCTIONS
# =============================================================================

def validate_luhn(number: str) -> bool:
    """Validate a number using the Luhn algorithm (credit cards, etc.)."""
    digits = [int(d) for d in number if d.isdigit()]
    if len(digits) < 13:
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
    # Remove spaces and convert to uppercase
    iban = iban.replace(' ', '').upper()

    if len(iban) < 15 or len(iban) > 34:
        return False

    # Move first 4 chars to end
    rearranged = iban[4:] + iban[:4]

    # Convert letters to numbers (A=10, B=11, etc.)
    numeric = ''
    for char in rearranged:
        if char.isdigit():
            numeric += char
        else:
            numeric += str(ord(char) - 55)

    # Check MOD 97
    return int(numeric) % 97 == 1


def validate_spanish_dni(dni: str) -> bool:
    """Validate Spanish DNI number."""
    dni = dni.upper().replace(' ', '').replace('-', '')

    if len(dni) != 9:
        return False

    # DNI format: 8 digits + letter
    if not dni[:8].isdigit():
        return False

    letters = 'TRWAGMYFPDXBNJZSQVHLCKE'
    expected_letter = letters[int(dni[:8]) % 23]

    return dni[8] == expected_letter


def validate_spanish_nie(nie: str) -> bool:
    """Validate Spanish NIE (foreigner ID) number."""
    nie = nie.upper().replace(' ', '').replace('-', '')

    if len(nie) != 9:
        return False

    # NIE format: X/Y/Z + 7 digits + letter
    first_char = nie[0]
    if first_char not in 'XYZ':
        return False

    # Convert first letter to number for validation
    prefix_map = {'X': '0', 'Y': '1', 'Z': '2'}
    numeric = prefix_map[first_char] + nie[1:8]

    if not numeric.isdigit():
        return False

    letters = 'TRWAGMYFPDXBNJZSQVHLCKE'
    expected_letter = letters[int(numeric) % 23]

    return nie[8] == expected_letter


def validate_dutch_bsn(bsn: str) -> bool:
    """Validate Dutch BSN (Burgerservicenummer) using 11-check."""
    bsn = bsn.replace(' ', '').replace('-', '')

    if len(bsn) != 9 or not bsn.isdigit():
        return False

    # 11-check: 9*a + 8*b + 7*c + 6*d + 5*e + 4*f + 3*g + 2*h - 1*i = 0 (mod 11)
    weights = [9, 8, 7, 6, 5, 4, 3, 2, -1]
    total = sum(int(d) * w for d, w in zip(bsn, weights))

    return total % 11 == 0


def validate_polish_pesel(pesel: str) -> bool:
    """Validate Polish PESEL number."""
    pesel = pesel.replace(' ', '').replace('-', '')

    if len(pesel) != 11 or not pesel.isdigit():
        return False

    weights = [1, 3, 7, 9, 1, 3, 7, 9, 1, 3]
    total = sum(int(d) * w for d, w in zip(pesel[:10], weights))
    checksum = (10 - (total % 10)) % 10

    return int(pesel[10]) == checksum


def validate_belgian_nn(nn: str) -> bool:
    """Validate Belgian National Number."""
    nn = nn.replace(' ', '').replace('-', '').replace('.', '')

    if len(nn) != 11 or not nn.isdigit():
        return False

    # Check digit is MOD 97 of first 9 digits
    base = int(nn[:9])
    check = int(nn[9:11])

    # For people born after 2000, add 2000000000
    return (97 - (base % 97) == check) or (97 - ((2000000000 + base) % 97) == check)


def validate_italian_cf(cf: str) -> bool:
    """Validate Italian Codice Fiscale (basic format check)."""
    cf = cf.upper().replace(' ', '')

    if len(cf) != 16:
        return False

    # Format: 6 letters + 2 digits + 1 letter + 2 digits + 1 letter + 3 alphanumeric + 1 letter
    pattern = r'^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$'
    return bool(re.match(pattern, cf))


# =============================================================================
# PII PATTERNS
# =============================================================================

US_PII_PATTERNS = [
    # Social Security Numbers
    (r'\b\d{3}-\d{2}-\d{4}\b', 'US Social Security Number (SSN)', 'high', None),
    (r'\b\d{3}\s\d{2}\s\d{4}\b', 'US Social Security Number (SSN)', 'high', None),
    (r'\b(?<!\d)\d{9}(?!\d)\b', 'Potential SSN (9 consecutive digits)', 'medium', None),

    # Credit Card Numbers (with Luhn validation)
    (r'\b4\d{3}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b', 'Visa Card Number', 'high', validate_luhn),
    (r'\b5[1-5]\d{2}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b', 'MasterCard Number', 'high', validate_luhn),
    (r'\b3[47]\d{2}[\s-]?\d{6}[\s-]?\d{5}\b', 'American Express Card', 'high', validate_luhn),
    (r'\b6(?:011|5\d{2})[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b', 'Discover Card Number', 'high', validate_luhn),

    # US Phone Numbers
    (r'\b\(\d{3}\)\s?\d{3}[-.]?\d{4}\b', 'US Phone Number', 'medium', None),
    (r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b', 'US Phone Number', 'low', None),

    # Driver's License (state-specific patterns, generic)
    (r'\b[A-Z]\d{7,8}\b', 'Potential Driver\'s License', 'low', None),
]

EU_PII_PATTERNS = [
    # IBAN (International Bank Account Number)
    (r'\b[A-Z]{2}\d{2}[\s]?[A-Z0-9]{4}[\s]?[A-Z0-9]{4}[\s]?[A-Z0-9]{4}[\s]?[A-Z0-9]{0,14}\b',
     'IBAN (Bank Account)', 'high', validate_iban),

    # Spanish DNI (8 digits + letter)
    (r'\b\d{8}[A-Z]\b', 'Spanish DNI', 'high', validate_spanish_dni),
    (r'\b\d{8}-[A-Z]\b', 'Spanish DNI', 'high', validate_spanish_dni),

    # Spanish NIE (X/Y/Z + 7 digits + letter)
    (r'\b[XYZ]\d{7}[A-Z]\b', 'Spanish NIE', 'high', validate_spanish_nie),
    (r'\b[XYZ]-?\d{7}-?[A-Z]\b', 'Spanish NIE', 'high', validate_spanish_nie),

    # Dutch BSN (9 digits)
    (r'\b\d{9}\b', 'Potential Dutch BSN', 'medium', validate_dutch_bsn),

    # German Personal ID (10-11 alphanumeric)
    (r'\b[CFGHJKLMNPRTVWXYZ0-9]{10,11}\b', 'Potential German ID', 'low', None),

    # French INSEE (Social Security - 15 digits)
    (r'\b[12]\d{2}(0[1-9]|1[0-2]|[2-9]\d)\d{2}\d{3}\d{3}\d{2}\b', 'French INSEE Number', 'high', None),

    # Italian Codice Fiscale
    (r'\b[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]\b', 'Italian Codice Fiscale', 'high', validate_italian_cf),

    # Polish PESEL (11 digits)
    (r'\b\d{11}\b', 'Potential Polish PESEL', 'medium', validate_polish_pesel),

    # Belgian National Number (11 digits with dots)
    (r'\b\d{2}\.\d{2}\.\d{2}-\d{3}\.\d{2}\b', 'Belgian National Number', 'high', validate_belgian_nn),

    # Portuguese NIF (9 digits)
    (r'\b[123568]\d{8}\b', 'Potential Portuguese NIF', 'low', None),

    # UK National Insurance Number
    (r'\b[A-CEGHJ-PR-TW-Z]{2}\d{6}[A-D]\b', 'UK National Insurance Number', 'high', None),
]

UNIVERSAL_PII_PATTERNS = [
    # Passport Numbers (various formats)
    (r'\b[A-Z]{1,2}\d{6,9}\b', 'Potential Passport Number', 'low', None),

    # Email addresses (only flag if many in one file - bulk PII)
    (r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', 'Email Address', 'info', None),

    # IP addresses (only flag if combined with other PII)
    (r'\b(?:\d{1,3}\.){3}\d{1,3}\b', 'IP Address', 'info', None),
]

# Files to skip
SKIP_FILE_PATTERNS = [
    r'test.*\.(py|js|ts)$',
    r'.*_test\.(py|js|ts)$',
    r'.*\.test\.(js|ts)$',
    r'.*\.spec\.(js|ts)$',
    r'mock.*\.',
    r'fixture.*\.',
    r'\.example$',
    r'\.sample$',
]

# Content patterns indicating test/example data
TEST_DATA_INDICATORS = [
    'test',
    'example',
    'sample',
    'mock',
    'fake',
    'dummy',
    '000-00-0000',  # Placeholder SSN
    '4111111111111111',  # Test credit card
    '4242424242424242',  # Stripe test card
    '5555555555554444',  # Test MasterCard
]


def should_skip_file(file_path: str) -> bool:
    """Check if file should be skipped."""
    if not file_path:
        return False

    for pattern in SKIP_FILE_PATTERNS:
        if re.search(pattern, file_path, re.IGNORECASE):
            return True

    return False


def is_test_data(value: str, context: str = '') -> bool:
    """Check if a value appears to be test/example data."""
    value_lower = value.lower()
    context_lower = context.lower()

    for indicator in TEST_DATA_INDICATORS:
        if indicator in value_lower or indicator in context_lower:
            return True

    return False


def scan_content(content: str, file_path: str = '') -> List[Dict]:
    """
    Scan content for PII.

    Returns list of findings with:
    - pattern_name: Description of PII type
    - matched_text: Redacted match
    - line_number: Line where found
    - severity: high, medium, low, info
    - jurisdiction: US, EU, Universal
    """
    findings = []

    if should_skip_file(file_path):
        return findings

    lines = content.split('\n')

    all_patterns = [
        (US_PII_PATTERNS, 'US'),
        (EU_PII_PATTERNS, 'EU'),
        (UNIVERSAL_PII_PATTERNS, 'Universal'),
    ]

    email_count = 0
    ip_count = 0

    for line_num, line in enumerate(lines, 1):
        for pattern_list, jurisdiction in all_patterns:
            for pattern, name, severity, validator in pattern_list:
                matches = re.finditer(pattern, line, re.IGNORECASE)
                for match in matches:
                    matched_text = match.group(0)

                    # Skip if it looks like test data
                    if is_test_data(matched_text, line):
                        continue

                    # Run validator if provided
                    if validator:
                        # Clean the matched text for validation
                        cleaned = re.sub(r'[\s-]', '', matched_text)
                        if not validator(cleaned):
                            continue

                    # Special handling for emails and IPs (only flag if bulk)
                    if 'Email' in name:
                        email_count += 1
                        if email_count < 5:
                            continue
                    elif 'IP Address' in name:
                        ip_count += 1
                        if ip_count < 10:
                            continue

                    # Redact the matched text
                    if len(matched_text) > 8:
                        redacted = matched_text[:4] + '*' * (len(matched_text) - 8) + matched_text[-4:]
                    else:
                        redacted = '*' * len(matched_text)

                    findings.append({
                        'pattern_name': name,
                        'matched_text': redacted,
                        'line_number': line_num,
                        'severity': severity,
                        'jurisdiction': jurisdiction
                    })

    # Filter to only high/medium severity findings
    significant_findings = [f for f in findings if f['severity'] in ('high', 'medium')]

    return significant_findings


def main():
    # Read tool input from stdin
    data = get_tool_input_from_stdin()
    tool_input = data.get('tool_input', {})
    tool_name = data.get('tool_name', '')

    # Get content based on tool
    content = ''
    file_path = ''

    if tool_name == 'Write':
        content = tool_input.get('content', '')
        file_path = tool_input.get('file_path', '')
    elif tool_name == 'Edit':
        content = tool_input.get('new_string', '')
        file_path = tool_input.get('file_path', '')
    else:
        sys.exit(0)

    if not content:
        sys.exit(0)

    # Scan for PII
    findings = scan_content(content, file_path)

    if not findings:
        AuditLogger.log_allowed(VALIDATOR_NAME, 'No PII detected', {'file_path': file_path})
        sys.exit(0)

    # Check for override
    override_valid, override_reason = OverrideManager.check_and_consume_override('PII')

    if override_valid:
        AuditLogger.log_override_used(VALIDATOR_NAME, 'BMAD_ALLOW_PII', file_path)
        print(f"Override accepted: {override_reason}", file=sys.stderr)
        print(f"WARNING: {len(findings)} PII item(s) will be written.", file=sys.stderr)
        sys.exit(0)

    # Block and report
    AuditLogger.log_blocked(VALIDATOR_NAME, 'PII detected', file_path, {
        'findings_count': len(findings),
        'types': list(set(f['pattern_name'] for f in findings))
    })

    # Group findings by jurisdiction
    us_findings = [f for f in findings if f['jurisdiction'] == 'US']
    eu_findings = [f for f in findings if f['jurisdiction'] == 'EU']

    summary_parts = []
    if us_findings:
        summary_parts.append(f"US PII ({len(us_findings)} items):")
        for f in us_findings[:3]:
            summary_parts.append(f"  Line {f['line_number']}: {f['pattern_name']} - {f['matched_text']}")

    if eu_findings:
        summary_parts.append(f"EU PII ({len(eu_findings)} items):")
        for f in eu_findings[:3]:
            summary_parts.append(f"  Line {f['line_number']}: {f['pattern_name']} - {f['matched_text']}")

    if len(findings) > 6:
        summary_parts.append(f"  ... and {len(findings) - 6} more")

    findings_summary = "\n".join(summary_parts)

    print_block_message(
        title="PII DETECTION - Personal Information Found",
        message=f"Personally Identifiable Information detected:\n\n{findings_summary}\n\n"
                "Writing PII to files can create compliance and privacy risks.",
        command_or_file=file_path,
        override_var="BMAD_ALLOW_PII",
        recommendations=[
            "Remove or redact personal information",
            "Use anonymized/synthetic data for testing",
            "Store PII in secure, encrypted databases only",
            "Ensure GDPR/CCPA compliance if handling real PII",
            "If this is intentional test data, use the override"
        ]
    )
    sys.exit(2)


if __name__ == '__main__':
    main()
