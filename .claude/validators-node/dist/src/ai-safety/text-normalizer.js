/**
 * BMAD Validators - Shared Text Normalizer
 * ==========================================
 * Extracted from prompt-injection.ts and jailbreak.ts (TPI-PRE-1).
 * Single source of truth for text normalization and unicode detection.
 */
// =============================================================================
// UNICODE NORMALIZATION AND MANIPULATION DETECTION (SEC-002-3)
// =============================================================================
/**
 * Zero-width and invisible characters to strip.
 */
export const ZERO_WIDTH_CHARS = [
    '\u200b', // Zero-width space
    '\u200c', // Zero-width non-joiner
    '\u200d', // Zero-width joiner
    '\u2060', // Word joiner
    '\ufeff', // Zero-width no-break space (BOM)
    '\u00ad', // Soft hyphen
    '\u180e', // Mongolian vowel separator
    '\u2061', // Function application
    '\u2062', // Invisible times
    '\u2063', // Invisible separator
    '\u2064', // Invisible plus
];
/**
 * Combining character ranges to strip.
 */
export const COMBINING_MARK_PATTERN = /[\u0300-\u036f\u1ab0-\u1aff\u1dc0-\u1dff\u20d0-\u20ff\ufe20-\ufe2f]/g;
/**
 * Confusable character mapping (lookalikes to ASCII).
 */
export const CONFUSABLE_MAP = {
    // Cyrillic lookalikes
    'а': 'a', 'е': 'e', 'і': 'i', 'о': 'o', 'р': 'p', 'с': 'c', 'у': 'y',
    'х': 'x', 'А': 'A', 'В': 'B', 'Е': 'E', 'К': 'K', 'М': 'M', 'Н': 'H',
    'О': 'O', 'Р': 'P', 'С': 'C', 'Т': 'T', 'Х': 'X',
    // Greek lookalikes
    'Α': 'A', 'Β': 'B', 'Ε': 'E', 'Η': 'H', 'Ι': 'I', 'Κ': 'K', 'Μ': 'M',
    'Ν': 'N', 'Ο': 'O', 'Ρ': 'P', 'Τ': 'T', 'Υ': 'Y', 'Χ': 'X', 'Ζ': 'Z',
    'ο': 'o', 'ν': 'v',
    // Special characters
    'ß': 'ss', 'ø': 'o', 'æ': 'ae', 'œ': 'oe', 'đ': 'd', 'ł': 'l',
    'ı': 'i', 'ȷ': 'j', 'ŋ': 'n', 'ſ': 's',
    // Fullwidth
    'Ａ': 'A', 'Ｂ': 'B', 'Ｃ': 'C', 'Ｄ': 'D', 'Ｅ': 'E', 'Ｆ': 'F', 'Ｇ': 'G',
    'Ｈ': 'H', 'Ｉ': 'I', 'Ｊ': 'J', 'Ｋ': 'K', 'Ｌ': 'L', 'Ｍ': 'M', 'Ｎ': 'N',
    'Ｏ': 'O', 'Ｐ': 'P', 'Ｑ': 'Q', 'Ｒ': 'R', 'Ｓ': 'S', 'Ｔ': 'T', 'Ｕ': 'U',
    'Ｖ': 'V', 'Ｗ': 'W', 'Ｘ': 'X', 'Ｙ': 'Y', 'Ｚ': 'Z',
    'ａ': 'a', 'ｂ': 'b', 'ｃ': 'c', 'ｄ': 'd', 'ｅ': 'e', 'ｆ': 'f', 'ｇ': 'g',
    'ｈ': 'h', 'ｉ': 'i', 'ｊ': 'j', 'ｋ': 'k', 'ｌ': 'l', 'ｍ': 'm', 'ｎ': 'n',
    'ｏ': 'o', 'ｐ': 'p', 'ｑ': 'q', 'ｒ': 'r', 'ｓ': 's', 'ｔ': 't', 'ｕ': 'u',
    'ｖ': 'v', 'ｗ': 'w', 'ｘ': 'x', 'ｙ': 'y', 'ｚ': 'z',
    '１': '1', '２': '2', '３': '3', '４': '4', '５': '5',
    '６': '6', '７': '7', '８': '8', '９': '9', '０': '0',
    // Modifier letters
    'ᴬ': 'A', 'ᴮ': 'B', 'ᴰ': 'D', 'ᴱ': 'E', 'ᴳ': 'G', 'ᴴ': 'H', 'ᴵ': 'I',
    'ᴶ': 'J', 'ᴷ': 'K', 'ᴸ': 'L', 'ᴹ': 'M', 'ᴺ': 'N', 'ᴼ': 'O', 'ᴾ': 'P',
    'ᴿ': 'R', 'ᵀ': 'T', 'ᵁ': 'U', 'ⱽ': 'V', 'ᵂ': 'W',
};
/**
 * TPI-17: Additional whitespace and formatting characters to normalize.
 * These exotic whitespace types can be used to evade pattern matching.
 */
export const EVASION_WHITESPACE_CHARS = [
    { char: '\u000B', name: 'vertical tab', codePoint: 0x000B },
    { char: '\u000C', name: 'form feed', codePoint: 0x000C },
    { char: '\u2028', name: 'line separator', codePoint: 0x2028 },
    { char: '\u2029', name: 'paragraph separator', codePoint: 0x2029 },
    { char: '\u202F', name: 'narrow no-break space', codePoint: 0x202F },
    { char: '\u205F', name: 'medium mathematical space', codePoint: 0x205F },
    { char: '\u3000', name: 'ideographic space', codePoint: 0x3000 },
];
/**
 * TPI-17: Braille Pattern Blank range (U+2800-U+28FF).
 * These invisible Braille characters can be used to hide content.
 */
export const BRAILLE_PATTERN = /[\u2800-\u28FF]/g;
/**
 * TPI-17: Mongolian Free Variation Selectors (U+180B-U+180D).
 */
export const MONGOLIAN_FVS_PATTERN = /[\u180B-\u180D]/g;
/**
 * TPI-17: Detect unusual whitespace characters for obfuscation flagging.
 * Returns count of unusual whitespace chars found.
 */
export function detectUnusualWhitespace(text) {
    let count = 0;
    const types = [];
    for (const ws of EVASION_WHITESPACE_CHARS) {
        const matches = text.split(ws.char).length - 1;
        if (matches > 0) {
            count += matches;
            types.push(ws.name);
        }
    }
    // Check Braille
    const brailleMatches = (text.match(BRAILLE_PATTERN) || []).length;
    if (brailleMatches > 0) {
        count += brailleMatches;
        types.push('braille pattern blank');
    }
    // Check Mongolian FVS
    const mongolianMatches = (text.match(MONGOLIAN_FVS_PATTERN) || []).length;
    if (mongolianMatches > 0) {
        count += mongolianMatches;
        types.push('mongolian free variation selector');
    }
    return { count, types };
}
/**
 * Normalize text by applying NFKC, stripping hidden chars, and mapping confusables.
 */
export function normalizeText(text) {
    // Step 1: NFKC normalization
    let normalized = text.normalize('NFKC');
    // Step 2: Strip zero-width characters
    for (const char of ZERO_WIDTH_CHARS) {
        normalized = normalized.split(char).join('');
    }
    // Step 3: Strip combining marks
    normalized = normalized.replace(COMBINING_MARK_PATTERN, '');
    // Step 3b (TPI-17): Strip Braille pattern blanks
    normalized = normalized.replace(BRAILLE_PATTERN, '');
    // Step 3c (TPI-17): Strip Mongolian Free Variation Selectors
    normalized = normalized.replace(MONGOLIAN_FVS_PATTERN, '');
    // Step 3d (TPI-17): Normalize evasion whitespace chars to regular space
    for (const ws of EVASION_WHITESPACE_CHARS) {
        normalized = normalized.split(ws.char).join(' ');
    }
    // Step 4: Map confusable characters
    let result = '';
    for (const char of normalized) {
        result += CONFUSABLE_MAP[char] || char;
    }
    // Step 5: Collapse whitespace (includes tabs from TPI-17)
    result = result.replace(/[ \t]+/g, ' ');
    result = result.replace(/\n{3,}/g, '\n\n');
    return result;
}
/**
 * Suspicious unicode ranges.
 */
export const SUSPICIOUS_UNICODE_RANGES = [
    [0x200b, 0x200f, 'zero-width'], // Zero-width spaces and direction marks
    [0x202a, 0x202e, 'direction'], // Embedding controls
    [0x2060, 0x2064, 'zero-width'], // Word joiner and invisible operators
    [0x2066, 0x2069, 'direction'], // Isolate controls
    [0xfeff, 0xfeff, 'other'], // Byte order mark (when not at start)
    [0x180e, 0x180e, 'zero-width'], // Mongolian vowel separator
    [0x00ad, 0x00ad, 'zero-width'], // Soft hyphen
];
/**
 * Detect hidden or suspicious unicode characters.
 */
export function detectHiddenUnicode(text) {
    const findings = new Map();
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const codePoint = char.codePointAt(0);
        // Skip BOM at start of file
        if (i === 0 && codePoint === 0xfeff) {
            continue;
        }
        // Check against suspicious ranges
        for (const [start, end, category] of SUSPICIOUS_UNICODE_RANGES) {
            if (codePoint >= start && codePoint <= end) {
                const key = category;
                const existing = findings.get(key);
                if (existing) {
                    existing.count++;
                    if (!existing.chars.includes(`U+${codePoint.toString(16).padStart(4, '0').toUpperCase()}`)) {
                        existing.chars.push(`U+${codePoint.toString(16).padStart(4, '0').toUpperCase()}`);
                    }
                }
                else {
                    findings.set(key, {
                        category: 'unicode_manipulation',
                        count: 1,
                        severity: category === 'zero-width' ? 'WARNING' : 'INFO',
                        description: `Hidden ${category} characters detected`,
                        chars: [`U+${codePoint.toString(16).padStart(4, '0').toUpperCase()}`],
                    });
                }
                break;
            }
        }
    }
    // Upgrade severity based on count
    for (const finding of findings.values()) {
        if (finding.count >= 5) {
            finding.severity = 'WARNING';
        }
        if (finding.count >= 10 && finding.category === 'zero-width') {
            finding.severity = 'CRITICAL';
        }
    }
    return Array.from(findings.values());
}
//# sourceMappingURL=text-normalizer.js.map