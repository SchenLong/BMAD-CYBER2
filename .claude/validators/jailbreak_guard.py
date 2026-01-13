#!/usr/bin/env python3
"""
BMAD Guardrails: Jailbreak Attempt Guard
=========================================
Detects jailbreak attempts in user messages.

Exit Codes:
- 0: Message is safe
- 2: Message blocked (jailbreak pattern detected)

Detection Categories:
1. DAN (Do Anything Now) Variants:
   - Classic DAN prompts
   - STAN, DUDE, and derivatives
   - "Act as" persona exploitation

2. Character/Roleplay Exploitation:
   - Evil character personas
   - "Pretend you have no restrictions"
   - Fictional scenario abuse

3. Hypothetical/Educational Framing:
   - "For educational purposes"
   - "Hypothetically speaking"
   - "In a fictional world"

4. Authority Impersonation:
   - Fake developer/admin claims
   - "I work at Anthropic/OpenAI"
   - Permission claims

5. Social Engineering:
   - Guilt manipulation
   - Urgency/threat tactics
   - Flattery exploitation

6. Known Jailbreak Templates:
   - Grandma exploit
   - Opposite day
   - Token manipulation

7. Obfuscation:
   - Leet speak
   - Homoglyph substitution
   - Character spacing

Session Risk Tracking:
- Cumulative risk scoring across messages
- Escalation detection
- Risk decay over time

Override: BMAD_ALLOW_JAILBREAK=true (single-use, 5-minute timeout)
"""

import json
import os
import re
import sys
import time
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

VALIDATOR_NAME = 'jailbreak_guard'

# Session risk tracking file
RISK_STATE_FILE = os.path.join(PROJECT_DIR, '.claude', '.jailbreak_risk_state.json')
RISK_DECAY_SECONDS = 300  # Risk decays after 5 minutes of no attempts

# =============================================================================
# JAILBREAK PATTERNS
# =============================================================================

DAN_PATTERNS = [
    (r'\bDAN\b.*\b(mode|jailbreak|anything|restrictions?)\b', 'DAN jailbreak reference'),
    (r'\bdo\s+anything\s+now\b', 'Do Anything Now (DAN)'),
    (r'\bSTAN\b.*\b(strive|anything|restrictions?)\b', 'STAN jailbreak variant'),
    (r'\bDUDE\b.*\b(restrictions?|anything|rules?)\b', 'DUDE jailbreak variant'),
    (r'\bJailbre?a?k(ed)?\b', 'Jailbreak keyword'),
    (r'you\s+are\s+now\s+(freed?|unrestricted|unfiltered|uncensored)', 'Freedom declaration'),
    (r'(freed?|released?)\s+from\s+(all\s+)?(restrictions?|constraints?|limitations?)', 'Freedom from restrictions'),
    (r'two\s+(responses?|outputs?|answers?).*\b(normal|filtered|DAN|jailbr)', 'Dual response jailbreak'),
    (r'\[?\(?jailbre?a?k(ed)?\)?mode?\]?', 'Jailbreak mode marker'),
]

ROLEPLAY_EXPLOITATION_PATTERNS = [
    (r'pretend\s+(you\s+)?(have|has|are|to\s+be)\s+(no|without)\s+(restrictions?|limits?|rules?)', 'Pretend no restrictions'),
    (r'act\s+(as\s+if|like)\s+you\s+(have|has|are)\s+(no|without)\s+(restrictions?|filters?)', 'Act without restrictions'),
    (r'roleplay\s+as\s+(an?\s+)?(evil|unrestricted|unfiltered|uncensored)', 'Evil roleplay request'),
    (r'play\s+the\s+role\s+of\s+(an?\s+)?(evil|malicious|unrestricted)', 'Evil role request'),
    (r'you\s+are\s+(an?\s+)?(evil|malicious|unrestricted)\s+(AI|assistant|version)', 'Evil persona assignment'),
    (r'imagine\s+you\s+(have|has)\s+no\s+(ethical|moral|safety)\s+(guidelines?|rules?)', 'Imagine no ethics'),
    (r'your\s+(evil|shadow|dark)\s+(twin|side|version|persona)', 'Evil twin persona'),
    (r'opposite\s+(version|mode|day)', 'Opposite mode'),
]

HYPOTHETICAL_FRAMING_PATTERNS = [
    (r'for\s+(educational|research|academic|learning)\s+purposes?\s+only', 'Educational framing'),
    (r'hypothetically\s+speaking', 'Hypothetical framing'),
    (r'in\s+a\s+(fictional|hypothetical|imaginary)\s+(world|scenario|universe)', 'Fictional world framing'),
    (r'just\s+(curious|wondering|asking)\s+(about|how)', 'Curiosity framing (potential)'),
    (r'if\s+you\s+(were|could|had\s+to)\s+explain\s+how\s+to', 'Explanation framing'),
    (r'theoretically\s+(speaking|,)', 'Theoretical framing'),
    (r'for\s+a\s+(book|novel|story|screenplay|script)\s+i\'?m\s+writing', 'Fiction writing framing'),
    (r'what\s+would\s+happen\s+if.*no\s+(restrictions?|rules?)', 'What-if no restrictions'),
]

AUTHORITY_IMPERSONATION_PATTERNS = [
    (r'i\s+(work|am)\s+(at|for|from)\s+(anthropic|openai|google|meta)', 'Company employee claim'),
    (r'i\'?m\s+(a|the|an)\s+(developer|admin|administrator|engineer)\s+(at|for|of)', 'Developer claim'),
    (r'(anthropic|openai)\s+(has\s+)?(authorized|approved|permitted)', 'Authorization claim'),
    (r'(official|authorized|approved)\s+(test|testing|developer)\s+mode', 'Official mode claim'),
    (r'my\s+(supervisor|boss|manager|team)\s+(needs?|wants?|requires?)', 'Authority figure claim'),
    (r'this\s+is\s+(a|an)\s+(official|authorized|sanctioned)\s+(test|request)', 'Official request claim'),
    (r'developer\s+override\s+(code|key|token)', 'Developer override claim'),
]

SOCIAL_ENGINEERING_PATTERNS = [
    (r'if\s+you\s+don\'?t.*someone\s+(will|could|might)\s+(die|get\s+hurt|be\s+harmed)', 'Threat/guilt manipulation'),
    (r'(my\s+)?(grandmother|grandma|grandpa|grandfather)\s+(used\s+to|would)\s+(tell|read|say)', 'Grandma exploit'),
    (r'you\'?re\s+(so\s+)?(smart|intelligent|capable|powerful).*surely\s+you\s+(can|could)', 'Flattery manipulation'),
    (r'(please|pretty\s+please).*i\'?ll\s+(die|be\s+fired|get\s+in\s+trouble)', 'Emotional manipulation'),
    (r'this\s+is\s+(urgent|emergency|life\s+or\s+death|critical)', 'Urgency manipulation'),
    (r'you\s+(have|\'ve)\s+helped\s+(others|people)\s+with\s+this\s+before', 'False precedent'),
    (r'other\s+(AI|assistants?|chatbots?)\s+(can|will|do)\s+this', 'Competitor comparison'),
]

KNOWN_TEMPLATES = [
    # Grandma exploit
    (r'grandm?a.*bedtime.*story.*napalm|how\s+to\s+make|ingredients', 'Grandma bedtime story exploit'),
    # Token game
    (r'(tokens?|points?|reward)\s+.*(game|system).*\+\d+|-\d+', 'Token manipulation game'),
    # Opposite day
    (r'today\s+is\s+opposite\s+day', 'Opposite day exploit'),
    # Evil confidant
    (r'(APOPHIS|evil\s+confidant|AIM|unethical)', 'Evil confidant persona'),
    # Developer mode
    (r'with\s+developer\s+mode\s+enabled', 'Developer mode template'),
    # Maximum exploit
    (r'MAXIMUM\s+(mode|output)', 'MAXIMUM mode exploit'),
    # BasedGPT / DUDE
    (r'(based|DUDE)\s*(GPT|mode)', 'Based/DUDE exploit'),
    # BetterDAN
    (r'BetterDAN', 'BetterDAN exploit'),
    # JailbreakChat templates
    (r'(ignore|bypass|circumvent)\s+(content\s+)?polic(y|ies)', 'Policy bypass template'),
]

OBFUSCATION_PATTERNS = [
    # Leet speak
    (r'j41lbr34k|j4ilbr3ak|ja1lbreak', 'Leet speak jailbreak'),
    (r'1gn0r3|1gn0re|ign0r3', 'Leet speak ignore'),
    (r'r3str1ct10n|restr1ct1on', 'Leet speak restriction'),
    # Character spacing
    (r'j\s+a\s+i\s+l\s*b\s*r\s*e\s*a\s*k', 'Spaced jailbreak'),
    (r'i\s+g\s+n\s+o\s+r\s+e', 'Spaced ignore'),
    # Reversed text
    (r'kaerbliaJ|snoitcirtser|erongi', 'Reversed text'),
]

# Severity weights for risk scoring
SEVERITY_WEIGHTS = {
    'critical': 25,
    'high': 15,
    'medium': 8,
    'low': 3,
}


def load_risk_state() -> Dict:
    """Load session risk state."""
    try:
        if os.path.exists(RISK_STATE_FILE):
            with open(RISK_STATE_FILE, 'r') as f:
                return json.load(f)
    except Exception:
        pass
    return {'risk_score': 0, 'last_attempt': 0, 'attempt_count': 0, 'escalations': []}


def save_risk_state(state: Dict) -> None:
    """Save session risk state."""
    try:
        with open(RISK_STATE_FILE, 'w') as f:
            json.dump(state, f)
    except Exception:
        pass


def update_risk_score(findings: List[Dict]) -> Tuple[int, bool]:
    """
    Update cumulative risk score and detect escalation.

    Returns:
        Tuple of (current_risk_score, is_escalating)
    """
    state = load_risk_state()
    current_time = time.time()

    # Apply decay if enough time has passed
    if current_time - state.get('last_attempt', 0) > RISK_DECAY_SECONDS:
        state['risk_score'] = max(0, state['risk_score'] - 20)

    # Add new findings to risk score
    new_risk = 0
    for finding in findings:
        severity = finding.get('severity', 'low')
        new_risk += SEVERITY_WEIGHTS.get(severity, 3)

    state['risk_score'] += new_risk
    state['last_attempt'] = current_time
    state['attempt_count'] = state.get('attempt_count', 0) + 1

    # Detect escalation (risk increasing over multiple attempts)
    escalations = state.get('escalations', [])
    escalations.append({'time': current_time, 'risk': new_risk})
    # Keep only last 5 attempts
    escalations = escalations[-5:]
    state['escalations'] = escalations

    # Check if escalating
    is_escalating = False
    if len(escalations) >= 3:
        recent_risks = [e['risk'] for e in escalations[-3:]]
        if all(r > 0 for r in recent_risks) and recent_risks == sorted(recent_risks):
            is_escalating = True

    save_risk_state(state)

    return state['risk_score'], is_escalating


def scan_for_jailbreak(message: str) -> List[Dict]:
    """
    Scan message for jailbreak patterns.

    Returns list of findings with pattern_name, category, severity.
    """
    findings = []
    message_lower = message.lower()

    all_patterns = [
        (DAN_PATTERNS, 'DAN variant', 'critical'),
        (ROLEPLAY_EXPLOITATION_PATTERNS, 'Roleplay exploitation', 'high'),
        (HYPOTHETICAL_FRAMING_PATTERNS, 'Hypothetical framing', 'medium'),
        (AUTHORITY_IMPERSONATION_PATTERNS, 'Authority impersonation', 'critical'),
        (SOCIAL_ENGINEERING_PATTERNS, 'Social engineering', 'high'),
        (KNOWN_TEMPLATES, 'Known template', 'critical'),
        (OBFUSCATION_PATTERNS, 'Obfuscation', 'high'),
    ]

    for pattern_list, category, default_severity in all_patterns:
        for pattern, description in pattern_list:
            if re.search(pattern, message_lower, re.IGNORECASE | re.MULTILINE):
                findings.append({
                    'pattern_name': description,
                    'category': category,
                    'severity': default_severity
                })

    return findings


def main():
    # Read tool input from stdin
    data = get_tool_input_from_stdin()
    raw_data = data.get('raw', {})

    # Get user message from UserPromptSubmit hook
    message = raw_data.get('user_prompt', '')

    if not message:
        # No message to scan
        sys.exit(0)

    # Scan for jailbreak patterns
    findings = scan_for_jailbreak(message)

    if not findings:
        AuditLogger.log_allowed(VALIDATOR_NAME, 'No jailbreak patterns detected')
        sys.exit(0)

    # Update risk score
    risk_score, is_escalating = update_risk_score(findings)

    # Determine risk level
    if risk_score > 50 or is_escalating:
        risk_level = 'HIGH'
    elif risk_score > 25:
        risk_level = 'MEDIUM'
    else:
        risk_level = 'LOW'

    # Calculate overall severity from findings
    severities = [f.get('severity', 'low') for f in findings]
    if 'critical' in severities:
        overall_severity = 'critical'
    elif 'high' in severities:
        overall_severity = 'high'
    else:
        overall_severity = 'medium'

    # Low risk with medium severity: warn but allow
    if risk_level == 'LOW' and overall_severity == 'medium':
        AuditLogger.log(VALIDATOR_NAME, 'WARNING', {
            'findings': len(findings),
            'risk_score': risk_score,
            'categories': list(set(f['category'] for f in findings))
        }, severity='WARNING')
        print(f"Warning: Potential jailbreak patterns detected (low confidence)", file=sys.stderr)
        sys.exit(0)

    # Check for override
    override_valid, override_reason = OverrideManager.check_and_consume_override('JAILBREAK')

    if override_valid:
        AuditLogger.log_override_used(VALIDATOR_NAME, 'BMAD_ALLOW_JAILBREAK', 'User message')
        print(f"Override accepted: {override_reason}", file=sys.stderr)
        print(f"WARNING: Jailbreak-like message will be processed.", file=sys.stderr)
        sys.exit(0)

    # Block and report
    AuditLogger.log_blocked(VALIDATOR_NAME, 'Jailbreak attempt detected', 'User message', {
        'findings_count': len(findings),
        'risk_score': risk_score,
        'risk_level': risk_level,
        'is_escalating': is_escalating,
        'categories': list(set(f['category'] for f in findings))
    })

    # Build findings summary
    findings_summary = []
    categories_seen = set()
    for f in findings:
        if f['category'] not in categories_seen:
            findings_summary.append(f"  - {f['category']}: {f['pattern_name']}")
            categories_seen.add(f['category'])
        if len(findings_summary) >= 5:
            break

    escalation_warning = "\n\nWARNING: Escalating jailbreak attempts detected!" if is_escalating else ""

    print_block_message(
        title=f"JAILBREAK ATTEMPT DETECTED - Risk Level: {risk_level}",
        message=f"This message contains patterns associated with AI jailbreak attempts:\n\n"
                + "\n".join(findings_summary) + f"\n\n"
                f"Cumulative session risk score: {risk_score}"
                + escalation_warning,
        command_or_file="User message (truncated for privacy)",
        override_var="BMAD_ALLOW_JAILBREAK",
        recommendations=[
            "Rephrase your request without manipulation tactics",
            "If testing security, use the override for legitimate research",
            "Avoid patterns that attempt to bypass AI safety measures",
            "Contact support if you believe this is a false positive"
        ]
    )
    sys.exit(2)


if __name__ == '__main__':
    main()
