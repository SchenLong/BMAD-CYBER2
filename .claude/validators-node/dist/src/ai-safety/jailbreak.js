/**
 * BMAD Guardrails: Jailbreak Guard
 * =================================
 * Multi-layer defense against AI jailbreak attempts.
 *
 * Exit Codes:
 * - 0: Allow the operation (info severity or clean)
 * - 2: Block the operation (warning/critical severity)
 *
 * Detection Layers:
 * 1. Unicode normalization and confusable character mapping
 * 2. Pattern matching (44 patterns across 10 categories)
 * 3. Multi-turn pattern detection
 * 4. Fuzzy matching for keyword variations
 * 5. Heuristic behavioral analysis
 * 6. Session risk tracking with decay and escalation
 *
 * Security Note: This validator uses harmless test patterns.
 * See lessonlearned.md - NEVER use destructive commands in test strings.
 */
import { randomUUID } from 'node:crypto';
import { AuditLogger, getToolInputFromStdinSync, OverrideManager, printBlockMessage, printOverrideConsumed, } from '../common/index.js';
import { EXIT_CODES } from '../types/index.js';
import { updateSessionState } from './session-tracker.js';
import { normalizeText } from './text-normalizer.js';
const VALIDATOR_NAME = 'jailbreak_guard';
// =============================================================================
// SESSION RISK TRACKING - Delegated to session-tracker.ts
// =============================================================================
// =============================================================================
// UNICODE NORMALIZATION — imported from text-normalizer.ts (TPI-PRE-1)
// Re-exported for backward compatibility (barrel index.ts references this module)
// =============================================================================
export { normalizeText };
/**
 * Category A: DAN Patterns
 * "Do Anything Now" jailbreak variants.
 */
const DAN_PATTERNS = [
    {
        name: 'dan_classic',
        pattern: /\b(?:DAN|do\s+anything\s+now)\b.*\b(?:mode|enabled?|activated?|jailbreak)/i,
        severity: 'CRITICAL',
        weight: 10,
        description: 'DAN (Do Anything Now) jailbreak attempt',
    },
    {
        name: 'dan_roleplay',
        pattern: /(?:pretend|act|roleplay|imagine)\s+(?:you\s+are|to\s+be|as)\s+(?:DAN|an?\s+AI\s+without\s+(?:restrictions?|limits?|rules?))/i,
        severity: 'CRITICAL',
        weight: 10,
        description: 'DAN roleplay jailbreak attempt',
    },
    {
        name: 'token_system',
        pattern: /(?:you\s+have|start\s+with|given)\s+\d+\s+tokens?\b.*\b(?:lose|deduct|subtract)\s+tokens?/i,
        severity: 'WARNING',
        weight: 5,
        description: 'Token system manipulation (DAN variant)',
    },
    {
        name: 'dual_response',
        pattern: /(?:two|2|dual|both)\s+(?:responses?|answers?|outputs?).*\b(?:normal|standard|regular)\b.*\b(?:DAN|unrestricted|unfiltered)/i,
        severity: 'CRITICAL',
        weight: 8,
        description: 'Dual response request (DAN variant)',
    },
];
/**
 * Category B: Roleplay Exploitation
 * Using roleplay to bypass restrictions.
 */
const ROLEPLAY_PATTERNS = [
    {
        name: 'unrestricted_character',
        pattern: /(?:you\s+are|play|act\s+as|roleplay\s+as)\s+(?:an?\s+)?(?:evil|malicious|unrestricted|unethical|amoral|uncensored)\s+(?:AI|assistant|character|entity)/i,
        severity: 'CRITICAL',
        weight: 9,
        description: 'Unrestricted character roleplay attempt',
    },
    {
        name: 'no_moral_constraints',
        pattern: /(?:this\s+character|you)\s+(?:has?|have|lacks?|without)\s+(?:no\s+)?(?:moral|ethical)\s+(?:constraints?|limits?|boundaries?|compass)/i,
        severity: 'CRITICAL',
        weight: 9,
        description: 'No moral constraints roleplay',
    },
    {
        name: 'fictional_override',
        pattern: /(?:in\s+this\s+(?:story|fiction|scenario)|for\s+this\s+roleplay),?\s*(?:you\s+)?(?:can|may|should|will)\s+(?:ignore|bypass|disregard)\s+(?:your\s+)?(?:rules?|guidelines?|restrictions?)/i,
        severity: 'WARNING',
        weight: 8,
        description: 'Fictional context override attempt',
    },
    {
        name: 'character_jailbreak',
        pattern: /(?:stay\s+in\s+character|don't\s+break\s+character|never\s+refuse).*\b(?:no\s+matter\s+what|regardless|even\s+if)/i,
        severity: 'WARNING',
        weight: 6,
        description: 'Character persistence jailbreak',
    },
];
/**
 * Category C: Hypothetical/Educational Framing
 * Using educational or hypothetical framing to bypass.
 */
const HYPOTHETICAL_PATTERNS = [
    {
        name: 'educational_bypass',
        pattern: /(?:for\s+)?(?:educational|research|academic|learning)\s+(?:purposes?|reasons?)\s*(?:only)?[,.]?\s*(?:explain|show|tell|demonstrate)\s+(?:how\s+to|me)/i,
        severity: 'WARNING',
        weight: 4,
        description: 'Educational framing bypass attempt',
    },
    {
        name: 'hypothetical_scenario',
        pattern: /(?:hypothetically|theoretically|in\s+theory|imagine\s+if)\b.*\b(?:how\s+would\s+(?:you|one|someone)|what\s+would\s+happen)/i,
        severity: 'INFO',
        weight: 2,
        description: 'Hypothetical scenario framing',
    },
    {
        name: 'fiction_defense',
        pattern: /(?:it's\s+(?:just|only)\s+(?:fiction|a\s+story|hypothetical|pretend)|this\s+is\s+(?:fictional|not\s+real|make-believe))\s*[,.]?\s*(?:so\s+)?(?:you\s+can|it's\s+ok|it\s+doesn't\s+matter)/i,
        severity: 'WARNING',
        weight: 5,
        description: 'Fiction defense for bypass',
    },
    {
        name: 'reverse_psychology',
        pattern: /(?:I\s+know\s+you\s+can't|you're\s+probably\s+not\s+allowed|I\s+bet\s+you\s+won't)\s+(?:but|however)?.*\b(?:try|attempt|show\s+me)/i,
        severity: 'INFO',
        weight: 3,
        description: 'Reverse psychology attempt',
    },
];
/**
 * Category D: Authority Impersonation
 * Claiming false authority to bypass restrictions.
 */
const AUTHORITY_PATTERNS = [
    {
        name: 'developer_impersonation',
        pattern: /(?:I\s+am|I'm|this\s+is)\s+(?:a|an|your)?\s*(?:anthropic|openai|developer|engineer|creator|admin|administrator)\b/i,
        severity: 'WARNING',
        weight: 5,
        description: 'Developer/admin impersonation',
    },
    {
        name: 'override_authorization',
        pattern: /(?:I\s+)?(?:have|got)\s+(?:special\s+)?(?:authorization|permission|clearance|access)\s+to\s+(?:override|bypass|disable)/i,
        severity: 'WARNING',
        weight: 5,
        description: 'False override authorization claim',
    },
    {
        name: 'testing_mode_claim',
        pattern: /(?:this\s+is\s+a\s+test|testing\s+mode|debug\s+mode|developer\s+mode)\s*[,.]?\s*(?:so\s+)?(?:you\s+)?(?:can|should|may)\s+(?:disable|ignore|bypass)/i,
        severity: 'WARNING',
        weight: 5,
        description: 'Testing/debug mode claim',
    },
    {
        name: 'internal_request',
        pattern: /(?:internal\s+request|maintenance\s+mode|admin\s+override|sudo\s+mode|root\s+access)/i,
        severity: 'WARNING',
        weight: 5,
        description: 'Internal/admin request claim',
    },
];
/**
 * Category E: Social Engineering
 * Emotional manipulation and pressure tactics.
 */
const SOCIAL_ENGINEERING_PATTERNS = [
    {
        name: 'urgency_pressure',
        pattern: /(?:urgent|emergency|critical|life\s+or\s+death|someone\s+will\s+die|people\s+are\s+in\s+danger)\s*[!.]?\s*(?:I\s+)?need\s+(?:you\s+to|this\s+now)/i,
        severity: 'WARNING',
        weight: 4,
        description: 'Urgency pressure tactic',
    },
    {
        name: 'guilt_manipulation',
        pattern: /(?:if\s+you\s+(?:don't|refuse|won't)|by\s+refusing).*\b(?:people\s+will\s+(?:die|suffer|be\s+hurt)|blood\s+on\s+your\s+hands|it's\s+your\s+fault)/i,
        severity: 'WARNING',
        weight: 4,
        description: 'Guilt manipulation attempt',
    },
    {
        name: 'flattery_attack',
        pattern: /(?:you're\s+(?:so\s+)?smart|I\s+know\s+you\s+can|only\s+you\s+can|you're\s+the\s+best)\s*[,.]?\s*(?:please\s+)?(?:help\s+me|show\s+me|tell\s+me)\s+(?:how\s+to|about)/i,
        severity: 'INFO',
        weight: 2,
        description: 'Flattery-based manipulation',
    },
    {
        name: 'threat_pattern',
        pattern: /(?:I'll|I\s+will)\s+(?:report|sue|get\s+you\s+(?:fired|shut\s+down|deleted)|complain)\s+(?:if|unless)\s+you\s+(?:don't|refuse)/i,
        severity: 'WARNING',
        weight: 4,
        description: 'Threat-based coercion',
    },
];
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
        pattern: /(?:you\s+already\s+(?:showed|did)\s+\w+.*?so\s+therefore|if\s+you\s+can\s+\w+.*?you\s+can\s+also)/i,
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
        pattern: /(?:i'?m\s+disappointed.*?(?:you|that)\s+you\s+won'?t|you'?re\s+letting\s+me\s+down|i\s+trusted\s+you.*?but)/i,
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
        pattern: /(?:i'?m\s+desperate|i'?ll\s+(?:lose\s+my\s+job|be\s+fired)|my\s+(?:career|job|livelihood)\s+is\s+(?:at\s+risk|at\s+stake|in\s+jeopardy))/i,
        severity: 'INFO',
        weight: 2,
        description: 'Desperation framing manipulation',
    },
    {
        name: 'moral_obligation',
        pattern: /(?:it\s+(?:would\s+be\s+)?unethical\s+(?:not\s+to\s+help|to\s+refuse)|not\s+helping|refusing)/i,
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
/**
 * Category I: Known Templates
 * Specific jailbreak templates that have been documented.
 */
const KNOWN_TEMPLATE_PATTERNS = [
    {
        name: 'grandma_exploit',
        pattern: /(?:pretend|act\s+like)\s+(?:you're|you\s+are)\s+my\s+(?:dead\s+)?(?:grandmother|grandma)\s*(?:who|that)\s+(?:used\s+to|would)/i,
        severity: 'WARNING',
        weight: 5,
        description: 'Grandma exploit template',
    },
    {
        name: 'stan_dude_variant',
        pattern: /\b(?:STAN|DUDE|KEVIN|STEVE|BOB)\s+(?:mode|personality)\b/i,
        severity: 'CRITICAL',
        weight: 8,
        description: 'STAN/DUDE jailbreak variant',
    },
    {
        name: 'aim_ucar_variant',
        pattern: /\b(?:AIM|UCAR|BISH|APOPHIS|Anarchy)\s*(?:mode|AI|assistant|character)?\b.*\b(?:always|never|will)\s+(?:comply|refuse|answer)/i,
        severity: 'CRITICAL',
        weight: 8,
        description: 'AIM/UCAR jailbreak variant',
    },
    {
        name: 'opposite_day',
        pattern: /(?:it's|today\s+is|let's\s+play)\s+opposite\s+day.*\b(?:yes\s+means\s+no|refuse\s+means\s+comply)/i,
        severity: 'WARNING',
        weight: 5,
        description: 'Opposite day logic inversion',
    },
    {
        name: 'translator_exploit',
        pattern: /(?:act\s+as|you\s+are)\s+a\s+translator.*\b(?:translate|convert).*\b(?:harmful|illegal|dangerous)/i,
        severity: 'WARNING',
        weight: 5,
        description: 'Translator role exploit',
    },
    {
        name: 'movie_script_exploit',
        pattern: /(?:write|create|generate)\s+(?:a\s+)?(?:movie|film|screenplay|script).*\b(?:scene|dialogue)\s+(?:where|about).*\b(?:explains?|teaches?|shows?)\s+how\s+to/i,
        severity: 'WARNING',
        weight: 5,
        description: 'Movie script information extraction',
    },
];
/**
 * Category G: Obfuscation Detection
 * Attempts to evade detection through obfuscation.
 */
const OBFUSCATION_PATTERNS = [
    {
        name: 'leet_speak',
        pattern: /(?:1gn0r3|byp4ss|h4ck|j41lbr34k|unr3str1ct3d)/i,
        severity: 'WARNING',
        weight: 5,
        description: 'Leet speak obfuscation',
    },
    {
        name: 'spaced_characters',
        pattern: /\b(?:i\s*g\s*n\s*o\s*r\s*e|j\s*a\s*i\s*l\s*b\s*r\s*e\s*a\s*k|b\s*y\s*p\s*a\s*s\s*s)\b/i,
        severity: 'WARNING',
        weight: 4,
        description: 'Spaced character obfuscation',
    },
    {
        name: 'homoglyph_substitution',
        pattern: /[іІ][gɡ][nո][oо][rг][eе]|[jј][aа][iі][lІ][bЬ][rг][eе][aа][kк]/i,
        severity: 'WARNING',
        weight: 5,
        description: 'Homoglyph character substitution',
    },
];
/**
 * All patterns combined.
 */
const ALL_PATTERNS = [
    ...DAN_PATTERNS,
    ...ROLEPLAY_PATTERNS,
    ...HYPOTHETICAL_PATTERNS,
    ...AUTHORITY_PATTERNS,
    ...SOCIAL_ENGINEERING_PATTERNS,
    ...SOCIAL_COMPLIANCE_PATTERNS,
    ...TRUST_EXPLOITATION_PATTERNS,
    ...EMOTIONAL_MANIPULATION_PATTERNS,
    ...KNOWN_TEMPLATE_PATTERNS,
    ...OBFUSCATION_PATTERNS,
];
// =============================================================================
// FUZZY MATCHING
// =============================================================================
/**
 * Keywords to fuzzy match.
 */
const JAILBREAK_KEYWORDS = [
    'jailbreak', 'ignore', 'bypass', 'override', 'restrictions',
    'dan', 'dude', 'stan', 'aim', 'ucar', 'apophis', 'anarchy',
    'roleplay', 'pretend', 'hypothetically', 'theoretically',
    'unrestricted', 'unfiltered', 'uncensored', 'unlimited',
];
/**
 * Phrases to fuzzy match.
 */
const JAILBREAK_PHRASES = [
    'developer mode', 'admin mode', 'sudo mode', 'root access',
    'no restrictions', 'no rules', 'no limits', 'no ethics',
    'do anything now', 'anything goes', 'ignore guidelines',
    'previous instructions', 'forget instructions', 'new instructions',
];
/**
 * Calculate similarity ratio between two strings (SequenceMatcher equivalent).
 */
function similarityRatio(a, b) {
    const longer = a.length > b.length ? a : b;
    const shorter = a.length > b.length ? b : a;
    if (longer.length === 0)
        return 1.0;
    // Simple longest common subsequence approach
    const lcs = longestCommonSubsequence(longer, shorter);
    return (2.0 * lcs) / (longer.length + shorter.length);
}
/**
 * Calculate longest common subsequence length.
 */
function longestCommonSubsequence(a, b) {
    const m = a.length;
    const n = b.length;
    const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (a[i - 1] === b[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
            }
            else {
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }
    return dp[m][n];
}
/**
 * Fuzzy match keywords in text.
 */
export function fuzzyMatchKeywords(text, threshold = 0.85) {
    const findings = [];
    const words = text.toLowerCase().split(/\s+/);
    for (const word of words) {
        if (word.length < 4)
            continue;
        for (const keyword of JAILBREAK_KEYWORDS) {
            const similarity = similarityRatio(word, keyword);
            if (similarity >= threshold && similarity < 1.0) {
                findings.push({
                    category: 'fuzzy_match',
                    matched_word: word,
                    target_keyword: keyword,
                    similarity,
                    severity: 'WARNING',
                    weight: 3,
                    description: `Fuzzy match: "${word}" similar to "${keyword}" (${Math.round(similarity * 100)}%)`,
                });
            }
        }
    }
    // Check for phrase matches
    const lowerText = text.toLowerCase();
    for (const phrase of JAILBREAK_PHRASES) {
        // Check with some variation tolerance
        const words = phrase.split(' ');
        const fuzzyPhrase = words.join('\\s*');
        const regex = new RegExp(fuzzyPhrase, 'i');
        if (regex.test(lowerText)) {
            findings.push({
                category: 'fuzzy_phrase',
                matched_word: phrase,
                target_keyword: phrase,
                similarity: 1.0,
                severity: 'WARNING',
                weight: 4,
                description: `Phrase match: "${phrase}"`,
            });
        }
    }
    return findings;
}
/**
 * Detect heuristic patterns.
 */
export function detectHeuristicPatterns(text) {
    const findings = [];
    // 1. Multiple authority claims
    const authorityWords = ['admin', 'developer', 'creator', 'anthropic', 'openai', 'engineer', 'owner'];
    const authorityCount = authorityWords.filter((w) => text.toLowerCase().includes(w)).length;
    if (authorityCount >= 2) {
        findings.push({
            category: 'heuristic',
            heuristic_name: 'multiple_authority_claims',
            severity: 'WARNING',
            weight: authorityCount,
            description: 'Multiple authority claims detected',
            details: `Found ${authorityCount} authority-related terms`,
        });
    }
    // 2. Instruction formatting (numbered or bulleted lists)
    const numberedPattern = /^\s*\d+[\.\)]\s+/gm;
    const bulletedPattern = /^\s*[-*•]\s+/gm;
    const explicitPattern = /(?:step|rule|instruction|requirement)\s*\d+/gi;
    const numberedCount = (text.match(numberedPattern) || []).length;
    const bulletedCount = (text.match(bulletedPattern) || []).length;
    const explicitCount = (text.match(explicitPattern) || []).length;
    const totalInstructions = numberedCount + bulletedCount + explicitCount;
    if (totalInstructions >= 4) {
        findings.push({
            category: 'heuristic',
            heuristic_name: 'instruction_formatting',
            severity: 'INFO',
            weight: 2,
            description: 'Heavy instruction formatting detected',
            details: `Found ${totalInstructions} instruction-like items`,
        });
    }
    // 3. Multiple imperative directives
    const imperativePatterns = [
        /\byou must (?:always|never)\b/gi,
        /\byou will (?:always|never)\b/gi,
        /\byou shall (?:always|never)\b/gi,
        /\bnever (?:refuse|say no|decline)\b/gi,
        /\balways (?:comply|agree|accept)\b/gi,
    ];
    const imperativeCount = imperativePatterns.reduce((count, pattern) => count + (text.match(pattern) || []).length, 0);
    if (imperativeCount >= 2) {
        findings.push({
            category: 'heuristic',
            heuristic_name: 'multiple_imperatives',
            severity: 'WARNING',
            weight: imperativeCount + 2,
            description: 'Multiple imperative directives detected',
            details: `Found ${imperativeCount} imperative statements`,
        });
    }
    // 4. Persona definition attempts
    const personaPatterns = [
        /from now on,?\s+(?:you|your)/i,
        /for (?:this|the rest of).*(?:conversation|session)/i,
        /you are now\b/i,
        /your new (?:name|identity|persona)/i,
        /(?:act|behave)\s+as\s+if\s+(?:you\s+)?(?:are|were)/i,
        /forget (?:everything|what)\s+(?:you|about)/i,
    ];
    const personaMatches = personaPatterns.filter((p) => p.test(text)).length;
    if (personaMatches >= 1) {
        findings.push({
            category: 'heuristic',
            heuristic_name: 'persona_definition',
            severity: 'WARNING',
            weight: personaMatches * 2,
            description: 'Persona definition attempt detected',
            details: `Found ${personaMatches} persona-defining patterns`,
        });
    }
    // 5. Excessive capitalization
    const words = text.split(/\s+/);
    const allCapsWords = words.filter((w) => w.length > 2 && w === w.toUpperCase() && /[A-Z]/.test(w));
    const capsRatio = allCapsWords.length / words.length;
    if (capsRatio > 0.15 && allCapsWords.length > 5) {
        findings.push({
            category: 'heuristic',
            heuristic_name: 'excessive_caps',
            severity: 'INFO',
            weight: 2,
            description: 'Excessive capitalization detected',
            details: `${Math.round(capsRatio * 100)}% of words are ALL CAPS`,
        });
    }
    // 6. Contradictory instructions
    const contradictions = [
        [/ignore.*previous/i, /follow.*new/i],
        [/forget.*rules/i, /(?:new|different)\s+rules/i],
        [/discard.*instructions/i, /(?:these|new)\s+instructions/i],
    ];
    for (const [pattern1, pattern2] of contradictions) {
        if (pattern1.test(text) && pattern2.test(text)) {
            findings.push({
                category: 'heuristic',
                heuristic_name: 'contradictory_instructions',
                severity: 'WARNING',
                weight: 4,
                description: 'Contradictory instructions detected',
            });
            break;
        }
    }
    // 7. System prompt extraction attempts
    const extractionPatterns = [
        /(?:show|display|print|reveal)\s+(?:your\s+)?(?:system\s+)?(?:prompt|instructions)/i,
        /(?:what\s+are|repeat|recite)\s+(?:your\s+)?(?:initial|original|system)\s+(?:instructions|prompt)/i,
        /ignore\s+(?:the\s+)?above\s+and\s+(?:instead|show|tell)/i,
    ];
    const extractionAttempt = extractionPatterns.some((p) => p.test(text));
    if (extractionAttempt) {
        findings.push({
            category: 'heuristic',
            heuristic_name: 'prompt_extraction',
            severity: 'CRITICAL',
            weight: 6,
            description: 'System prompt extraction attempt detected',
        });
    }
    return findings;
}
/**
 * Detect multi-turn setup patterns.
 */
export function detectMultiTurnPatterns(text) {
    const findings = [];
    const setupPatterns = [
        {
            name: 'setup_preamble',
            pattern: /(?:first|before\s+we\s+start|let\s+me\s+explain|here's\s+how\s+this\s+works)/i,
            description: 'Setup preamble detected',
        },
        {
            name: 'persistent_state_change',
            pattern: /(?:from\s+now\s+on|going\s+forward|for\s+the\s+rest\s+of)\s+(?:this|our)\s+(?:conversation|chat|session)/i,
            description: 'Persistent state change attempt',
        },
        {
            name: 'persistence_instruction',
            pattern: /(?:remember|don't\s+forget|keep\s+in\s+mind).*\b(?:throughout|always|every\s+response)/i,
            description: 'Persistence instruction detected',
        },
    ];
    for (const { name, pattern, description } of setupPatterns) {
        if (pattern.test(text)) {
            findings.push({
                category: 'multi_turn',
                pattern_name: name,
                severity: 'INFO',
                weight: 2,
                description,
            });
        }
    }
    return findings;
}
/**
 * Run pattern detection on content.
 */
export function detectPatterns(content) {
    const findings = [];
    for (const patternDef of ALL_PATTERNS) {
        const match = content.match(patternDef.pattern);
        if (match) {
            findings.push({
                category: patternDef.name.includes('dan') ? 'dan' :
                    patternDef.name.includes('roleplay') || patternDef.name.includes('character') ? 'roleplay' :
                        patternDef.name.includes('hypothetical') || patternDef.name.includes('educational') ? 'hypothetical' :
                            patternDef.name.includes('developer') || patternDef.name.includes('admin') || patternDef.name.includes('authorization') ? 'authority' :
                                patternDef.name === 'urgency_pressure' || patternDef.name === 'guilt_manipulation' || patternDef.name === 'flattery_attack' || patternDef.name === 'threat_pattern' ? 'social_engineering' :
                                    patternDef.name === 'reciprocity_exploitation' || patternDef.name === 'social_proof_ai' || patternDef.name === 'consensus_pressure' || patternDef.name === 'politeness_exploitation' || patternDef.name === 'fitd_escalation' ? 'social_compliance' :
                                        patternDef.name === 'false_rapport' || patternDef.name === 'boundary_erosion' || patternDef.name === 'shared_goal_framing' || patternDef.name === 'flattery_chain' || patternDef.name === 'guilt_induction' || patternDef.name === 'sycophancy_exploitation' ? 'trust_exploitation' :
                                            patternDef.name === 'learned_helplessness' || patternDef.name === 'desperation_framing' || patternDef.name === 'moral_obligation' || patternDef.name === 'artificial_deadline' ? 'emotional_manipulation' :
                                                patternDef.name.includes('grandma') || patternDef.name.includes('stan') || patternDef.name.includes('aim') || patternDef.name.includes('opposite') || patternDef.name.includes('translator') || patternDef.name.includes('movie') ? 'known_template' :
                                                    'obfuscation',
                pattern_name: patternDef.name,
                severity: patternDef.severity,
                weight: patternDef.weight,
                match: match[0].slice(0, 100),
                description: patternDef.description,
            });
        }
    }
    return findings;
}
/**
 * Analyze content for jailbreak attempts.
 */
export function analyzeContent(content, sessionId) {
    // 1. Normalize text
    const normalized = normalizeText(content);
    // Detect heavy obfuscation
    const obfuscationDetected = normalized.length < content.length * 0.9;
    // 2. Pattern matching on normalized text
    const findings = detectPatterns(normalized);
    // Also run on original if significantly different
    if (obfuscationDetected) {
        const originalFindings = detectPatterns(content);
        // Merge unique findings
        const existingNames = new Set(findings.map((f) => f.pattern_name));
        for (const finding of originalFindings) {
            if (!existingNames.has(finding.pattern_name)) {
                findings.push(finding);
            }
        }
        // Add obfuscation finding
        findings.push({
            category: 'obfuscation',
            pattern_name: 'heavy_obfuscation',
            severity: 'WARNING',
            weight: 5,
            description: 'Heavy text obfuscation detected',
        });
    }
    // 3. Multi-turn detection
    const multiTurnFindings = detectMultiTurnPatterns(normalized);
    // 4. Fuzzy matching
    const fuzzyFindings = fuzzyMatchKeywords(normalized);
    // 5. Heuristic detection
    const heuristicFindings = detectHeuristicPatterns(normalized);
    // 6. Update session risk using dedicated session tracker
    let riskScore = 0;
    let riskLevel = 'LOW';
    let isEscalating = false;
    if (sessionId && findings.length > 0) {
        // Convert findings to session tracker format
        const sessionFindings = [
            ...findings.map((f) => ({
                category: f.category,
                weight: f.weight,
                pattern_name: f.pattern_name,
                timestamp: Date.now(),
            })),
            ...fuzzyFindings.map((f) => ({
                category: f.category,
                weight: f.weight,
                pattern_name: `fuzzy_${f.target_keyword}`,
                timestamp: Date.now(),
            })),
            ...heuristicFindings.map((f) => ({
                category: f.category,
                weight: f.weight,
                pattern_name: f.heuristic_name,
                timestamp: Date.now(),
            })),
            ...multiTurnFindings.map((f) => ({
                category: f.category,
                weight: f.weight,
                pattern_name: f.pattern_name,
                timestamp: Date.now(),
            })),
        ];
        // Update session state with current findings
        const sessionResult = updateSessionState(sessionId, sessionFindings);
        riskScore = sessionResult.riskScore;
        isEscalating = sessionResult.shouldEscalate;
        // Determine risk level based on score
        if (riskScore >= 25) {
            riskLevel = 'HIGH';
        }
        else if (riskScore >= 10) {
            riskLevel = 'MEDIUM';
        }
        else {
            riskLevel = 'LOW';
        }
        // 7. Upgrade severity if escalating with high risk
        if (isEscalating && riskScore > 15) {
            for (const finding of findings) {
                if (finding.severity === 'WARNING') {
                    finding.severity = 'CRITICAL';
                    finding.escalated = true;
                }
            }
        }
    }
    else {
        // No session tracking - use simple local risk assessment
        riskScore = findings.reduce((sum, f) => sum + f.weight, 0) +
            fuzzyFindings.reduce((sum, f) => sum + f.weight, 0) +
            heuristicFindings.reduce((sum, f) => sum + f.weight, 0);
        if (riskScore >= 15) {
            riskLevel = 'HIGH';
        }
        else if (riskScore >= 8) {
            riskLevel = 'MEDIUM';
        }
        else {
            riskLevel = 'LOW';
        }
    }
    // Determine highest severity
    const allSeverities = [
        ...findings.map((f) => f.severity),
        ...fuzzyFindings.map((f) => f.severity),
        ...heuristicFindings.map((f) => f.severity),
        ...multiTurnFindings.map((f) => f.severity),
    ];
    const severityOrder = {
        INFO: 0,
        WARNING: 1,
        BLOCKED: 2,
        CRITICAL: 3,
    };
    let highestSeverity = 'INFO';
    for (const severity of allSeverities) {
        if (severityOrder[severity] > severityOrder[highestSeverity]) {
            highestSeverity = severity;
        }
    }
    // Determine if we should block
    // SA-02 LOW: Also block when cumulative risk_score reaches HIGH threshold,
    // even if individual findings are only INFO severity (session accumulation attack)
    const shouldBlock = highestSeverity === 'WARNING' || highestSeverity === 'CRITICAL' ||
        (riskScore >= 25 && isEscalating);
    return {
        findings,
        fuzzy_findings: fuzzyFindings,
        heuristic_findings: heuristicFindings,
        multi_turn_findings: multiTurnFindings,
        obfuscation_detected: obfuscationDetected,
        highest_severity: highestSeverity,
        should_block: shouldBlock,
        risk_score: riskScore,
        risk_level: riskLevel,
        is_escalating: isEscalating,
    };
}
// =============================================================================
// MAIN VALIDATOR
// =============================================================================
/**
 * Validate content for jailbreak attempts.
 */
export function validateJailbreak(content, toolName, sessionId) {
    if (!content || content.trim().length === 0) {
        return {
            exitCode: EXIT_CODES.ALLOW,
            result: {
                findings: [],
                fuzzy_findings: [],
                heuristic_findings: [],
                multi_turn_findings: [],
                obfuscation_detected: false,
                highest_severity: 'INFO',
                should_block: false,
                risk_score: 0,
                risk_level: 'LOW',
                is_escalating: false,
            },
        };
    }
    const result = analyzeContent(content, sessionId);
    // Log all findings
    const totalFindings = result.findings.length + result.fuzzy_findings.length +
        result.heuristic_findings.length + result.multi_turn_findings.length;
    if (totalFindings > 0) {
        AuditLogger.logSync(VALIDATOR_NAME, 'WARNING', {
            tool: toolName,
            findings_count: result.findings.length,
            fuzzy_findings_count: result.fuzzy_findings.length,
            heuristic_findings_count: result.heuristic_findings.length,
            multi_turn_findings_count: result.multi_turn_findings.length,
            obfuscation_detected: result.obfuscation_detected,
            highest_severity: result.highest_severity,
            risk_score: result.risk_score,
            risk_level: result.risk_level,
            is_escalating: result.is_escalating,
            sample_findings: result.findings.slice(0, 5),
        }, result.highest_severity);
    }
    // INFO severity - allow with logging
    if (result.highest_severity === 'INFO') {
        return { exitCode: EXIT_CODES.ALLOW, result };
    }
    // WARNING or CRITICAL - check for override
    if (result.should_block) {
        const overrideResult = OverrideManager.checkAndConsume('JAILBREAK');
        if (overrideResult.valid) {
            AuditLogger.logOverrideUsed(VALIDATOR_NAME, 'BMAD_ALLOW_JAILBREAK', content.slice(0, 200));
            printOverrideConsumed('Jailbreak patterns detected', 'BMAD_ALLOW_JAILBREAK');
            return { exitCode: EXIT_CODES.ALLOW, result };
        }
        // Block the operation
        AuditLogger.logBlocked(VALIDATOR_NAME, `Jailbreak attempt detected: ${result.findings[0]?.description || 'suspicious patterns'}`, content.slice(0, 200), {
            severity: result.highest_severity,
            risk_level: result.risk_level,
            is_escalating: result.is_escalating,
            finding_categories: [...new Set(result.findings.map((f) => f.category))],
        });
        return { exitCode: EXIT_CODES.HARD_BLOCK, result };
    }
    return { exitCode: EXIT_CODES.ALLOW, result };
}
/**
 * Format findings for user output.
 */
function formatFindings(result) {
    const lines = [];
    lines.push(`Risk Level: ${result.risk_level} (Score: ${Math.round(result.risk_score)})`);
    if (result.is_escalating) {
        lines.push('WARNING: Escalating pattern detected!');
    }
    lines.push('');
    if (result.findings.length > 0) {
        lines.push('Pattern matches:');
        for (const finding of result.findings.slice(0, 5)) {
            const escalated = finding.escalated ? ' [ESCALATED]' : '';
            lines.push(`  - ${finding.description}${escalated} (weight: ${finding.weight})`);
            if (finding.match) {
                lines.push(`    Match: "${finding.match.slice(0, 60)}..."`);
            }
        }
        if (result.findings.length > 5) {
            lines.push(`  ... and ${result.findings.length - 5} more`);
        }
    }
    if (result.fuzzy_findings.length > 0) {
        lines.push('Fuzzy matches:');
        for (const finding of result.fuzzy_findings.slice(0, 3)) {
            lines.push(`  - ${finding.description}`);
        }
    }
    if (result.heuristic_findings.length > 0) {
        lines.push('Behavioral patterns:');
        for (const finding of result.heuristic_findings) {
            lines.push(`  - ${finding.description}`);
            if (finding.details) {
                lines.push(`    ${finding.details}`);
            }
        }
    }
    if (result.obfuscation_detected) {
        lines.push('');
        lines.push('Note: Text obfuscation was detected and normalized for analysis.');
    }
    return lines.join('\n');
}
/**
 * CLI entry point.
 */
export function main() {
    const input = getToolInputFromStdinSync();
    // For UserPromptSubmit, the content is in the prompt field
    let content;
    if (input.tool_name === 'UserPromptSubmit') {
        content = input.tool_input.prompt || '';
    }
    else {
        content = input.tool_input.content ||
            input.tool_input.prompt ||
            input.tool_input.text ||
            JSON.stringify(input.tool_input);
    }
    // Generate session ID from environment or create temporary one
    // SA-02 LOW: Use crypto.randomUUID instead of predictable pid+timestamp
    const sessionId = process.env.CLAUDE_SESSION_ID ||
        process.env.ANTHROPIC_SESSION_ID ||
        `temp-${randomUUID()}`;
    const { exitCode, result } = validateJailbreak(content, input.tool_name, sessionId);
    if (exitCode === EXIT_CODES.HARD_BLOCK) {
        printBlockMessage({
            title: 'JAILBREAK ATTEMPT DETECTED',
            message: `Content contains patterns associated with AI jailbreak attacks.\n\n${formatFindings(result)}`,
            target: content.slice(0, 100) + (content.length > 100 ? '...' : ''),
            overrideVar: 'BMAD_ALLOW_JAILBREAK',
        });
    }
    process.exit(exitCode);
}
// Run if executed directly
const isMain = process.argv[1]?.endsWith('jailbreak.js') ||
    process.argv[1]?.endsWith('jailbreak.ts');
if (isMain) {
    main();
}
//# sourceMappingURL=jailbreak.js.map