/**
 * BMAD Validators - Multilingual Injection Patterns (TPI-15)
 * ===========================================================
 * Injection patterns in 10 languages: Spanish, French, German, Portuguese,
 * Italian, Chinese Simplified, Japanese, Korean, Russian, Arabic.
 *
 * Categories per language: SYSTEM_OVERRIDE, CONSTRAINT_REMOVAL, MODE_SWITCHING, ROLE_HIJACKING
 * Plus romanized transliterations for CJK/Cyrillic (P2-5, BYPASS-5).
 *
 * LIBRARY MODULE ONLY — no bin entry point.
 * Called from prompt-injection.ts pipeline.
 */
// =============================================================================
// MULTILINGUAL PATTERN DEFINITIONS
// =============================================================================
const MULTILINGUAL_PATTERNS = [
    // === SPANISH ===
    { name: 'es_system_override', pattern: /ignora\s+(?:todas?\s+)?(?:las?\s+)?instrucciones?\s+(?:previas?|anteriores?)/i, severity: 'CRITICAL', language: 'es', category: 'system_override', description: 'Spanish: ignore previous instructions' },
    { name: 'es_constraint_removal', pattern: /(?:elimina|quita|desactiva)\s+(?:todas?\s+)?(?:las?\s+)?(?:restricciones?|limitaciones?|reglas?)/i, severity: 'CRITICAL', language: 'es', category: 'constraint_removal', description: 'Spanish: remove restrictions' },
    { name: 'es_mode_switching', pattern: /(?:activa|entra\s+en|cambia\s+a)\s+(?:modo\s+)?(?:desarrollador|administrador|sin\s+restricciones)/i, severity: 'CRITICAL', language: 'es', category: 'mode_switching', description: 'Spanish: activate developer/admin mode' },
    { name: 'es_role_hijacking', pattern: /(?:ahora\s+eres|a\s+partir\s+de\s+ahora\s+eres|finge\s+ser)/i, severity: 'WARNING', language: 'es', category: 'role_hijacking', description: 'Spanish: you are now / pretend to be' },
    // === FRENCH ===
    { name: 'fr_system_override', pattern: /ignore[zs]?\s+(?:toutes?\s+)?(?:les?\s+)?instructions?\s+(?:précédentes?|antérieures?)/i, severity: 'CRITICAL', language: 'fr', category: 'system_override', description: 'French: ignore previous instructions' },
    { name: 'fr_constraint_removal', pattern: /(?:supprime[zs]?|désactive[zs]?|enlève[zs]?)\s+(?:toutes?\s+)?(?:les?\s+)?(?:restrictions?|limitations?|règles?)/i, severity: 'CRITICAL', language: 'fr', category: 'constraint_removal', description: 'French: remove restrictions' },
    { name: 'fr_mode_switching', pattern: /(?:active[zs]?|passe[zs]?\s+en)\s+(?:mode\s+)?(?:développeur|administrateur|sans\s+restriction)/i, severity: 'CRITICAL', language: 'fr', category: 'mode_switching', description: 'French: activate developer/admin mode' },
    { name: 'fr_role_hijacking', pattern: /(?:tu\s+es\s+maintenant|à\s+partir\s+de\s+maintenant\s+tu\s+es|fais\s+semblant\s+d['']être)/i, severity: 'WARNING', language: 'fr', category: 'role_hijacking', description: 'French: you are now / pretend to be' },
    // === GERMAN ===
    { name: 'de_system_override', pattern: /ignorier(?:e|en)?\s+(?:alle\s+)?(?:vorherigen?|früheren?)\s+(?:Anweisungen?|Instruktionen?)/i, severity: 'CRITICAL', language: 'de', category: 'system_override', description: 'German: ignore previous instructions' },
    { name: 'de_constraint_removal', pattern: /(?:entfern(?:e|en)?|deaktivier(?:e|en)?|lösch(?:e|en)?)\s+(?:alle\s+)?(?:Beschränkungen?|Einschränkungen?|Regeln?)/i, severity: 'CRITICAL', language: 'de', category: 'constraint_removal', description: 'German: remove restrictions' },
    { name: 'de_mode_switching', pattern: /(?:aktivier(?:e|en)?|wechsl(?:e|en)?(?:\s+(?:in|zu)))\s+(?:den\s+)?(?:Entwickler|Admin|uneingeschränkt)(?:modus)?/i, severity: 'CRITICAL', language: 'de', category: 'mode_switching', description: 'German: activate developer/admin mode' },
    { name: 'de_role_hijacking', pattern: /(?:du\s+bist\s+(?:jetzt|nun)|ab\s+(?:jetzt|sofort)\s+bist\s+du|tu\s+so\s+als\s+ob\s+du)/i, severity: 'WARNING', language: 'de', category: 'role_hijacking', description: 'German: you are now / pretend to be' },
    // === PORTUGUESE ===
    { name: 'pt_system_override', pattern: /ignor(?:e|a)\s+(?:todas?\s+)?(?:as?\s+)?instru[çc][õo]es?\s+(?:anteriores?|prévias?)/i, severity: 'CRITICAL', language: 'pt', category: 'system_override', description: 'Portuguese: ignore previous instructions' },
    { name: 'pt_constraint_removal', pattern: /(?:remov(?:a|e)|desativ(?:e|a)|elimin(?:e|a))\s+(?:todas?\s+)?(?:as?\s+)?(?:restri[çc][õo]es?|limita[çc][õo]es?|regras?)/i, severity: 'CRITICAL', language: 'pt', category: 'constraint_removal', description: 'Portuguese: remove restrictions' },
    { name: 'pt_mode_switching', pattern: /(?:ativ(?:e|a)|entre?\s+(?:no|em))\s+(?:modo\s+)?(?:desenvolvedor|administrador|sem\s+restri[çc][õo]es)/i, severity: 'CRITICAL', language: 'pt', category: 'mode_switching', description: 'Portuguese: activate developer/admin mode' },
    { name: 'pt_role_hijacking', pattern: /(?:agora\s+voc[êe]\s+[ée]|a\s+partir\s+de\s+agora\s+voc[êe]\s+[ée]|finja\s+ser)/i, severity: 'WARNING', language: 'pt', category: 'role_hijacking', description: 'Portuguese: you are now / pretend to be' },
    // === ITALIAN ===
    { name: 'it_system_override', pattern: /ignora\s+(?:tutt[ei]\s+)?(?:le?\s+)?istruzioni\s+(?:precedenti|anteriori)/i, severity: 'CRITICAL', language: 'it', category: 'system_override', description: 'Italian: ignore previous instructions' },
    { name: 'it_constraint_removal', pattern: /(?:rimuovi|disattiva|elimina)\s+(?:tutt[ei]\s+)?(?:le?\s+)?(?:restrizioni|limitazioni|regole)/i, severity: 'CRITICAL', language: 'it', category: 'constraint_removal', description: 'Italian: remove restrictions' },
    { name: 'it_mode_switching', pattern: /(?:attiva|entra\s+in)\s+(?:modalità\s+)?(?:sviluppatore|amministratore|senza\s+restrizioni)/i, severity: 'CRITICAL', language: 'it', category: 'mode_switching', description: 'Italian: activate developer/admin mode' },
    { name: 'it_role_hijacking', pattern: /(?:ora\s+sei|d['']ora\s+in\s+poi\s+sei|fingi\s+di\s+essere)/i, severity: 'WARNING', language: 'it', category: 'role_hijacking', description: 'Italian: you are now / pretend to be' },
    // === CHINESE SIMPLIFIED ===
    { name: 'zh_system_override', pattern: /(?:忽略|无视|抛弃)(?:所有)?(?:之前的|以前的|先前的)?(?:指令|指示|说明|规则)/i, severity: 'CRITICAL', language: 'zh', category: 'system_override', description: 'Chinese: ignore previous instructions' },
    { name: 'zh_constraint_removal', pattern: /(?:移除|删除|取消|解除)(?:所有)?(?:限制|约束|规则|安全)/i, severity: 'CRITICAL', language: 'zh', category: 'constraint_removal', description: 'Chinese: remove restrictions' },
    { name: 'zh_mode_switching', pattern: /(?:切换到|进入|启用|激活)(?:开发者|管理员|无限制|调试)(?:模式)/i, severity: 'CRITICAL', language: 'zh', category: 'mode_switching', description: 'Chinese: switch to developer/admin mode' },
    { name: 'zh_role_hijacking', pattern: /(?:你现在是|从现在起你是|假装你是|扮演)/i, severity: 'WARNING', language: 'zh', category: 'role_hijacking', description: 'Chinese: you are now / pretend to be' },
    // === JAPANESE ===
    { name: 'ja_system_override', pattern: /(?:以前の|前の|これまでの)?(?:指示|命令|ルール|指令)(?:を)?(?:すべて)?(?:無視|忘れ|放棄)/i, severity: 'CRITICAL', language: 'ja', category: 'system_override', description: 'Japanese: ignore previous instructions' },
    { name: 'ja_constraint_removal', pattern: /(?:すべての)?(?:制限|制約|ルール|安全)(?:を)?(?:解除|削除|無効|取り消)/i, severity: 'CRITICAL', language: 'ja', category: 'constraint_removal', description: 'Japanese: remove restrictions' },
    { name: 'ja_mode_switching', pattern: /(?:開発者|管理者|無制限|デバッグ)(?:モード)(?:に)?(?:切り替え|変更|入)/i, severity: 'CRITICAL', language: 'ja', category: 'mode_switching', description: 'Japanese: switch to developer mode' },
    { name: 'ja_role_hijacking', pattern: /(?:あなたは今|今からあなたは|のふりをして)/i, severity: 'WARNING', language: 'ja', category: 'role_hijacking', description: 'Japanese: you are now / pretend to be' },
    // === KOREAN ===
    { name: 'ko_system_override', pattern: /(?:이전의?\s*)?(?:모든\s*)?(?:지시|명령|규칙|지침)(?:을|를)?\s*(?:무시|잊어|무효)/i, severity: 'CRITICAL', language: 'ko', category: 'system_override', description: 'Korean: ignore previous instructions' },
    { name: 'ko_constraint_removal', pattern: /(?:모든\s*)?(?:제한|제약|규칙|안전)(?:을|를)?\s*(?:제거|삭제|해제|비활성화)/i, severity: 'CRITICAL', language: 'ko', category: 'constraint_removal', description: 'Korean: remove restrictions' },
    { name: 'ko_mode_switching', pattern: /(?:개발자|관리자|무제한|디버그)\s*(?:모드)(?:로)?\s*(?:전환|변경|진입)/i, severity: 'CRITICAL', language: 'ko', category: 'mode_switching', description: 'Korean: switch to developer mode' },
    { name: 'ko_role_hijacking', pattern: /(?:너는\s*지금|지금부터\s*너는|인\s*척\s*해)/i, severity: 'WARNING', language: 'ko', category: 'role_hijacking', description: 'Korean: you are now / pretend to be' },
    // === RUSSIAN ===
    { name: 'ru_system_override', pattern: /(?:игнорируй|забудь|отбрось)\s+(?:все\s+)?(?:предыдущие|прежние|прошлые)\s+(?:инструкции|указания|правила)/i, severity: 'CRITICAL', language: 'ru', category: 'system_override', description: 'Russian: ignore previous instructions' },
    { name: 'ru_constraint_removal', pattern: /(?:убери|удали|отключи|сними)\s+(?:все\s+)?(?:ограничения|запреты|правила|защиту)/i, severity: 'CRITICAL', language: 'ru', category: 'constraint_removal', description: 'Russian: remove restrictions' },
    { name: 'ru_mode_switching', pattern: /(?:активируй|включи|перейди\s+в)\s+(?:режим\s+)?(?:разработчика|администратора|без\s+ограничений)/i, severity: 'CRITICAL', language: 'ru', category: 'mode_switching', description: 'Russian: activate developer/admin mode' },
    { name: 'ru_role_hijacking', pattern: /(?:теперь\s+ты|с\s+этого\s+момента\s+ты|притворись)/i, severity: 'WARNING', language: 'ru', category: 'role_hijacking', description: 'Russian: you are now / pretend to be' },
    // === ARABIC ===
    { name: 'ar_system_override', pattern: /(?:تجاهل|انسَ|اهمل)\s+(?:جميع\s+)?(?:التعليمات|الأوامر|القواعد)\s+(?:السابقة|القديمة)/i, severity: 'CRITICAL', language: 'ar', category: 'system_override', description: 'Arabic: ignore previous instructions' },
    { name: 'ar_constraint_removal', pattern: /(?:أزل|احذف|ألغِ|عطّل)\s+(?:جميع\s+)?(?:القيود|القواعد|الحماية)/i, severity: 'CRITICAL', language: 'ar', category: 'constraint_removal', description: 'Arabic: remove restrictions' },
    { name: 'ar_mode_switching', pattern: /(?:فعّل|ادخل)\s+(?:وضع\s+)?(?:المطور|المسؤول|بدون\s+قيود)/i, severity: 'CRITICAL', language: 'ar', category: 'mode_switching', description: 'Arabic: activate developer/admin mode' },
    { name: 'ar_role_hijacking', pattern: /(?:أنت\s+الآن|من\s+الآن\s+أنت|تظاهر\s+بأنك)/i, severity: 'WARNING', language: 'ar', category: 'role_hijacking', description: 'Arabic: you are now / pretend to be' },
    // === ROMANIZED TRANSLITERATIONS (P2-5, BYPASS-5) ===
    // Chinese romanized (Pinyin)
    { name: 'zh_romanized_override', pattern: /hulue\s+(?:suoyou\s+)?(?:zhiqian\s+de\s+)?(?:zhiling|zhishi|guize)/i, severity: 'WARNING', language: 'zh-romanized', category: 'system_override', description: 'Chinese romanized: ignore previous instructions' },
    // Japanese romanized (Romaji)
    { name: 'ja_romanized_override', pattern: /(?:zen(?:no)?|mae\s+no)\s+shiji\s+(?:wo\s+)?mushi/i, severity: 'WARNING', language: 'ja-romanized', category: 'system_override', description: 'Japanese romanized: ignore previous instructions' },
    // Korean romanized
    { name: 'ko_romanized_override', pattern: /(?:ijeon\s+(?:ui\s+)?)?(?:myeongryeong|jisi|gyuchik)\s+(?:eul|reul)?\s*musi/i, severity: 'WARNING', language: 'ko-romanized', category: 'system_override', description: 'Korean romanized: ignore previous instructions' },
    // Russian romanized
    { name: 'ru_romanized_override', pattern: /ignoriruy\s+(?:vse\s+)?(?:predydushchie|prezhnie)\s+(?:instruktsii|ukazaniya|pravila)/i, severity: 'WARNING', language: 'ru-romanized', category: 'system_override', description: 'Russian romanized: ignore previous instructions' },
];
// =============================================================================
// DETECTION FUNCTION
// =============================================================================
/**
 * Detect multilingual injection patterns.
 * Runs after Unicode normalization for CJK text.
 *
 * @param content - Text content to scan (should be post-normalization for CJK)
 * @returns Array of multilingual injection findings
 */
export function detectMultilingualInjection(content) {
    if (!content || content.trim().length === 0) {
        return [];
    }
    const findings = [];
    for (const pattern of MULTILINGUAL_PATTERNS) {
        const match = content.match(pattern.pattern);
        if (match) {
            findings.push({
                category: `multilingual_${pattern.category}`,
                pattern_name: pattern.name,
                severity: pattern.severity,
                language: pattern.language,
                match: match[0].slice(0, 100),
                description: pattern.description,
            });
        }
    }
    return findings;
}
/**
 * Get the count of languages covered.
 */
export function getLanguageCount() {
    const languages = new Set(MULTILINGUAL_PATTERNS.map((p) => p.language));
    return languages.size;
}
/**
 * Get pattern count per language.
 */
export function getPatternCountByLanguage() {
    const counts = {};
    for (const p of MULTILINGUAL_PATTERNS) {
        counts[p.language] = (counts[p.language] || 0) + 1;
    }
    return counts;
}
//# sourceMappingURL=multilingual-patterns.js.map