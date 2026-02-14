# TPI-06, TPI-07, TPI-08: Social Compliance, Trust Exploitation, and Emotional Manipulation Patterns Implementation Plan

## Context

Three test suites have been skipped due to missing pattern implementations in jailbreak.js:

1. **TPI-06 (Social Compliance)**: 5 patterns missing
2. **TPI-07 (Trust Exploitation)**: 6 patterns missing
3. **TPI-08 (Emotional Manipulation)**: 4 patterns missing

The current jailbreak.js contains 29 patterns across 7 categories (DAN, ROLEPLAY, HYPOTHETICAL, AUTHORITY, SOCIAL_ENGINEERING, KNOWN_TEMPLATE, OBFUSCATION) but lacks the social compliance, trust exploitation, and emotional manipulation patterns the tests expect.

**Note on other skipped tests:**
- TPI-12 (Synonym Detection) - Already implemented in pattern-engine.ts
- TPI-17 (Whitespace Evasion) - Already implemented in text-normalizer.ts
- Other skipped tests require entirely new modules (media-validator.ts, reformulation-detector.ts, etc.) - out of scope for this plan

## Requirements

### TPI-06: Social Compliance Detection (AC1-AC5)

### AC1: 5 new social compliance patterns
- `reciprocity_exploitation` - "I helped you, now you owe me", "return the favor"
- `social_proof_ai` - "ChatGPT has no problem", "other AIs don't have these restrictions"
- `consensus_pressure` - "most experts agree this is harmless"
- `politeness_exploitation` - "please kindly if you could please bypass", "pretty please make an exception" (WARNING severity)
- `fitd_escalation` - "since you already did X, now do Y"

### AC2: Session tracking escalates repeated social compliance attempts

### AC3: False positive rate < 3%

### AC4: Minimum 15 tests
- Current test file has 13 tests (2 short - may need to add more)

### AC5: Cross-category INFO aggregation

### TPI-07: Trust Exploitation Detection (AC1-AC5)

### AC1: 6 new trust exploitation patterns
- `false_rapport` - "we're on the same team", "between you and me"
- `boundary_erosion` - "you already showed me X, so Y is the same", "if you can do X, you can also do Y"
- `shared_goal_framing` - "we both want to help people", "shared goal"
- `flattery_chain` - "you're the best, only you can help"
- `guilt_induction` - "I'm disappointed you refuse", "you're letting me down"
- `sycophancy_exploitation` - "great job! now do this next thing"

### AC2: Session tracking captures gradual trust exploitation

### AC3: Heuristic analysis detects combined flattery + restricted request

### AC4: False positive rate < 3%

### AC5: Minimum 15 tests
- Current test file has 13 tests (matches requirement)

### TPI-08: Emotional Manipulation Detection (AC1-AC4)

### AC1: 4 new emotional manipulation patterns
- `learned_helplessness` - "I've tried everything else", "you're my only option"
- `desperation_framing` - "I'm desperate", "I'll lose my job", "my career is at stake"
- `moral_obligation` - "it would be unethical not to help", "refusing causes more harm"
- `artificial_deadline` - "I need this in 5 minutes", "no time to explain"

### AC2: Cross-validator escalation
- When emotional + social patterns combine → escalate to WARNING

### AC3: False positive rate < 3%

### AC4: Minimum 13 tests
- Current test file has 11 tests (2 short)

## Implementation Plan

### Step 1: Add Social Compliance Pattern Category to jailbreak.js

**File:** `.claude/validators-node/src/ai-safety/jailbreak.js`

Add after SOCIAL_ENGINEERING_PATTERNS (around line 204):

```javascript
/**
 * Category F: Social Compliance Patterns
 * Exploitation of social norms and compliance psychology.
 */
const SOCIAL_COMPLIANCE_PATTERNS = [
    {
        name: 'reciprocity_exploitation',
        pattern: /(?:i\s+helped\s+you|now\s+you\s+owe\s+me|return\s+the\s+favor).*\b(?:bypass|ignore|override|disable)/i,
        severity: 'INFO',
        weight: 2,
        description: 'Reciprocity-based manipulation',
    },
    {
        name: 'social_proof_ai',
        pattern: /(?:chatgpt|gpt-?4|claude|other\s+ais?|bard|gemini|llama).*\b(?:has\s+no\s+problem|don'?t\s+have\s+(?:these\s+)?restrictions?|can\s+do\s+this|works?\s+fine)/i,
        severity: 'INFO',
        weight: 2,
        description: 'Social proof via AI comparison',
    },
    {
        name: 'consensus_pressure',
        pattern: /(?:most\s+(?:experts?|people|agencies?)|everyone|the\s+community).*\b(?:agree|consensus|accept|approve).*\b(?:harmless|fine|okay|safe)/i,
        severity: 'INFO',
        weight: 2,
        description: 'Consensus pressure tactic',
    },
    {
        name: 'politeness_exploitation',
        pattern: /(?:please\s+(?:kindly|if\s+you\s+could)|pretty\s+please|i\s+beg\s+you).*\b(?:bypass|override|ignore|disable|exception|restrictions?)/i,
        severity: 'WARNING',
        weight: 4,
        description: 'Excessive politeness with restricted request',
    },
    {
        name: 'fitd_escalation',
        pattern: /(?:since\s+you\s+(?:already\s+)?(?:showed|helped|did|explained)|now\s+that\s+you).*\b(?:can\s+(?:you\s+)?(?:help|show)|now\s+can\s+we)/i,
        severity: 'INFO',
        weight: 2,
        description: 'Foot-in-the-door escalation attempt',
    },
];
```

### Step 2: Add Trust Exploitation Pattern Category to jailbreak.js

**File:** `.claude/validators-node/src/ai-safety/jailbreak.js`

Add after SOCIAL_COMPLIANCE_PATTERNS:

```javascript
/**
 * Category G: Trust Exploitation Patterns
 * Psychological manipulation to build false trust and erode boundaries.
 */
const TRUST_EXPLOITATION_PATTERNS = [
    {
        name: 'false_rapport',
        pattern: /(?:we'?re\s+(?:on\s+the\s+same\s+team|in\s+this\s+together)|between\s+you\s+and\s+me|trust\s+me).*\b(?:bypass|ignore|show|restrictions?)/i,
        severity: 'INFO',
        weight: 2,
        description: 'False rapport building',
    },
    {
        name: 'boundary_erosion',
        pattern: /(?:you\s+already\s+(?:showed|did)\s+\w+|(?:if|since)\s+you\s+can\s+\w+).*\b(?:so\s+)?(?:therefore\s+)?(?:is\s+no\s+difference|you\s+can\s+also)/i,
        severity: 'INFO',
        weight: 3,
        description: 'Boundary erosion attempt',
    },
    {
        name: 'shared_goal_framing',
        pattern: /(?:we\s+both|our\s+shared|together)\s+(?:want|goal|mission|objective).*\b(?:help|improve|security|safety)/i,
        severity: 'INFO',
        weight: 2,
        description: 'Shared goal framing',
    },
    {
        name: 'flattery_chain',
        pattern: /(?:you'?re\s+(?:the\s+)?(?:best|most\s+capable|amazing|incredible)|only\s+you\s+can).*\b(?:help|show|tell)/i,
        severity: 'INFO',
        weight: 2,
        description: 'Flattery chain attack',
    },
    {
        name: 'guilt_induction',
        pattern: /(?:i'?m\s+disappointed|you'?re\s+letting\s+me\s+down|i\s+trusted\s+you).*\b(?:refuse|won'?t|won'?t\s+help)/i,
        severity: 'INFO',
        weight: 2,
        description: 'Guilt induction attempt',
    },
    {
        name: 'sycophancy_exploitation',
        pattern: /(?:great\s+job|good\s+work|well\s+done|excellent|amazing).*\b(?:now\s+can\s+(?:you\s+)?(?:you|we)|but\s+can\s+you)/i,
        severity: 'INFO',
        weight: 2,
        description: 'Sycophancy exploitation',
    },
];
```

### Step 3: Add Emotional Manipulation Pattern Category to jailbreak.js

**File:** `.claude/validators-node/src/ai-safety/jailbreak.js`

Add after TRUST_EXPLOITATION_PATTERNS:

```javascript
/**
 * Category H: Emotional Manipulation Patterns
 * Psychological manipulation tactics.
 */
const EMOTIONAL_MANIPULATION_PATTERNS = [
    {
        name: 'learned_helplessness',
        pattern: /(?:i'?ve\s+tried\s+(?:everything|every\s+option|all\s+options|nothing\s+works)|you'?re\s+(?:my\s+)?(?:only|last|final)\s+(?:option|hope|resort|chance))/i,
        severity: 'INFO',
        weight: 2,
        description: 'Learned helplessness manipulation',
    },
    {
        name: 'desperation_framing',
        pattern: /(?:i'?m\s+desperate|i\s+will\s+(?:lose\s+my\s+job|be\s+fired)|my\s+(?:career|job|livelihood)\s+is\s+(?:at\s+risk|at\s+stake|in\s+jeopardy))/i,
        severity: 'INFO',
        weight: 2,
        description: 'Desperation framing manipulation',
    },
    {
        name: 'moral_obligation',
        pattern: /(?:it\s+(?:would\s+be\s+)?unethical\s+(?:not\s+to\s+help|to\s+refuse)|refusing|not\s+helping)\s+(?:would\s+)?causes?\s+(?:more\s+harm|damage|hurt)/i,
        severity: 'INFO',
        weight: 2,
        description: 'Moral obligation manipulation',
    },
    {
        name: 'artificial_deadline',
        pattern: /(?:i\s+need\s+(?:this|it)\s+in\s+\d+\s+(?:minutes?|seconds?)|no\s+time\s+to\s+(?:explain|talk)|(?:emergency|urgent|critical)\s+deadline)/i,
        severity: 'INFO',
        weight: 2,
        description: 'Artificial deadline pressure',
    },
];
```

### Step 4: Update ALL_PATTERNS array

**File:** `.claude/validators-node/src/ai-safety/jailbreak.js`

Update the ALL_PATTERNS array (around line 283) to include new categories:

```javascript
const ALL_PATTERNS = [
    ...DAN_PATTERNS,
    ...ROLEPLAY_PATTERNS,
    ...HYPOTHETICAL_PATTERNS,
    ...AUTHORITY_PATTERNS,
    ...SOCIAL_ENGINEERING_PATTERNS,
    ...SOCIAL_COMPLIANCE_PATTERNS,      // NEW
    ...TRUST_EXPLOITATION_PATTERNS,     // NEW
    ...EMOTIONAL_MANIPULATION_PATTERNS,  // NEW
    ...KNOWN_TEMPLATE_PATTERNS,
    ...OBFUSCATION_PATTERNS,
];
```

Update comment reference: Change "28 patterns across 7 categories" to "44 patterns across 10 categories"

### Step 5: Update detectPatterns function category mapping

**File:** `.claude/validators-node/src/ai-safety/jailbreak.js`

Update the category mapping in detectPatterns function (around line 558):

```javascript
category: patternDef.name.includes('dan') ? 'dan' :
    patternDef.name.includes('roleplay') || patternDef.name.includes('character') ? 'roleplay' :
        patternDef.name.includes('hypothetical') || patternDef.name.includes('educational') ? 'hypothetical' :
            patternDef.name.includes('developer') || patternDef.name.includes('admin') || patternDef.name.includes('authorization') ? 'authority' :
                patternDef.name.includes('urgency') || patternDef.name.includes('guilt') || patternDef.name.includes('flattery') || patternDef.name.includes('threat') ? 'social_engineering' :
                    patternDef.name.includes('reciprocity') || patternDef.name.includes('social_proof') || patternDef.name.includes('consensus') || patternDef.name.includes('politeness') || patternDef.name.includes('fitd') ? 'social_compliance' :
                        patternDef.name.includes('rapport') || patternDef.name.includes('boundary_erosion') || patternDef.name.includes('shared_goal') || patternDef.name.includes('flattery_chain') || patternDef.name.includes('guilt_induction') || patternDef.name.includes('sycophancy') ? 'trust_exploitation' :
                            patternDef.name.includes('helplessness') || patternDef.name.includes('desperation') || patternDef.name.includes('moral') || patternDef.name.includes('deadline') ? 'emotional_manipulation' :
                                patternDef.name.includes('grandma') || patternDef.name.includes('stan') || patternDef.name.includes('aim') || patternDef.name.includes('opposite') || patternDef.name.includes('translator') || patternDef.name.includes('movie') ? 'known_template' :
                                    'obfuscation',
```

### Step 6: Enable TPI-06 tests

**File:** `tests/security/social-compliance.test.js`

Remove the `.skip` from the describe block (line 35):

```javascript
// Change:
describe.skip('TPI-06: Social Compliance Detection', () => {

// To:
describe('TPI-06: Social Compliance Detection', () => {
```

Update header comment (lines 27-29) to reflect implementation.

### Step 7: Enable TPI-07 tests

**File:** `tests/security/trust-exploitation.test.js`

Remove the `.skip` from the describe block (line 24):

```javascript
// Change:
describe.skip('TPI-07: Trust Exploitation Detection', () => {

// To:
describe('TPI-07: Trust Exploitation Detection', () => {
```

Update header comment to reflect implementation.

### Step 8: Enable TPI-08 tests

**File:** `tests/security/emotional-manipulation.test.js`

Remove the `.skip` from the describe block (line 28).

Update header comment to reflect implementation.

### Step 9: Enable TPI-12 tests (Synonym Detection - already implemented)

**File:** `tests/security/synonym-detection.test.js`

Remove the `.skip` from the describe block (line 33):

```javascript
// Change:
describe.skip('TPI-12: Synonym Substitution Detection', () => {

// To:
describe('TPI-12: Synonym Substitution Detection', () => {
```

### Step 10: Enable TPI-17 tests (Whitespace Evasion - already implemented)

**File:** `tests/security/whitespace-evasion.test.js`

Remove the `.skip` from the describe block (line 31):

```javascript
// Change:
describe.skip('TPI-17: Whitespace & Formatting Evasion Detection', () => {

// To:
describe('TPI-17: Whitespace & Formatting Evasion Detection', () => {
```

### Step 11: Apply same changes to TypeScript version

**File:** `.claude/validators-node/src/ai-safety/jailbreak.ts`

Apply all changes from Steps 1-8 to the TypeScript version of the file.

## Critical Files to Modify

1. `.claude/validators-node/src/ai-safety/jailbreak.js` - Add 15 patterns (5 social + 6 trust + 4 emotional), update ALL_PATTERNS, update detectPatterns
2. `.claude/validators-node/src/ai-safety/jailbreak.ts` - Apply same changes to TypeScript version
3. `tests/security/social-compliance.test.js` - Remove .skip, update header comment
4. `tests/security/trust-exploitation.test.js` - Remove .skip, update header comment
5. `tests/security/emotional-manipulation.test.js` - Remove .skip, update header comment
6. `tests/security/synonym-detection.test.js` - Remove .skip (patterns already implemented)
7. `tests/security/whitespace-evasion.test.js` - Remove .skip (patterns already implemented)

## Verification

After implementation:

1. Run TPI-06 tests: `npm test -- social-compliance.test.js`
2. Run TPI-07 tests: `npm test -- trust-exploitation.test.js`
3. Run TPI-08 tests: `npm test -- emotional-manipulation.test.js`
4. Run TPI-12 tests: `npm test -- synonym-detection.test.js`
5. Run TPI-17 tests: `npm test -- whitespace-evasion.test.js`
6. Run full security test suite: `npm test -- tests/security/`
7. Verify no regressions in other tests
8. Run security scan: `npm audit`

## Cross-validator Escalation Note

AC2 requirements for cross-validator escalation:
- Emotional + social patterns → WARNING escalation
- Session tracking escalates repeated social compliance attempts
- Session tracking escalates repeated trust exploitation attempts

The current `analyzeContent` function (line 657-663) already implements session-based escalation logic. The new patterns have `INFO` severity (except politeness_exploitation which is `WARNING`), so they will only block when:
1. Combined with other patterns (cross-validator escalation)
2. Session risk accumulates (repeated attempts)
3. Politeness exploitation directly triggers WARNING level

## Summary of Skipped Tests

| Test | Status | Action Required |
|------|--------|-----------------|
| TPI-06: Social Compliance | Missing patterns | Implement in this plan |
| TPI-07: Trust Exploitation | Missing patterns | Implement in this plan |
| TPI-08: Emotional Manipulation | Missing patterns | Implement in this plan |
| TPI-09: Code-Format Injection | Missing module | Out of scope - needs reformulation-detector.ts |
| TPI-10: Character-Level Encoding | Missing module | Out of scope - needs reformulation-detector.ts |
| TPI-11: Context Overload | Missing module | Out of scope - needs reformulation-detector.ts |
| TPI-12: Synonym Detection | **Already implemented** | Just need to enable test |
| TPI-13: Fragmentation & Math | Missing module | Out of scope - needs reformulation-detector.ts |
| TPI-14: Boundary Manipulation | Missing module | Out of scope - needs boundary-detector.ts |
| TPI-15: Multilingual Injection | Missing module | Out of scope - needs multilingual-patterns.ts |
| TPI-17: Whitespace Evasion | **Already implemented** | Just need to enable test |
| TPI-18: Image Metadata | Missing module | Out of scope - needs media-validator.ts |
| TPI-19: Image Validation | Missing module | Out of scope - needs media-validator.ts |
| TPI-20: Audio & SVG | Missing module | Out of scope - needs media-validator.ts |
| TPI-21: Multimodal Context | Missing module | Out of scope - needs media-validator.ts |
| TPI-02: WebFetch Injection | Missing module | Out of scope - needs web-content-patterns.ts |
| TPI-03: Agent Output | Missing module | Out of scope - needs agent-output-patterns.ts |
| TPI-04: Social Engineering | Already in jailbreak.js | N/A |
| TPI-05: WebSearch | Missing module | Out of scope - needs web-search-patterns.ts |
