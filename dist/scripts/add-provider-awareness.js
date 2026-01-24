#!/usr/bin/env node
/**
 * Add subtle provider awareness rule to high-risk module agents.
 *
 * This adds a single non-intrusive rule that:
 * - Does NOT announce at session start
 * - Only reminds about local LLM option when relevant
 * - Is concise and non-spammy
 */
import * as fs from 'fs';
import * as path from 'path';
const BASE_DIR = path.join(process.cwd(), '_bmad');
const BACKUP_DIR = path.join(process.cwd(), '_bmad-backup-provider-awareness', new Date().toISOString().replace(/[:.]/g, '-'));
// Subtle rule - only for high-risk modules, non-intrusive
const PROVIDER_RULE = '<r>For sensitive data (PII, security incidents, legal matters), local LLM option available: `.claude/hooks/llm-provider-manager.sh set ollama`</r>';
const HIGH_RISK_MODULES = ["cybersec-team", "intel-team", "legal-team", "strategy-team"];
function backupFile(filepath) {
    const relativePath = path.relative(BASE_DIR, filepath);
    const backupPath = path.join(BACKUP_DIR, relativePath);
    fs.mkdirSync(path.dirname(backupPath), { recursive: true });
    fs.copyFileSync(filepath, backupPath);
    return backupPath;
}
function hasProviderRule(content) {
    return content.includes("llm-provider-manager") ||
        content.includes("LOCAL-LLM-OPTION") ||
        content.includes("PROVIDER-AWARENESS");
}
function insertRule(content, rule) {
    // Find the end of the second security rule (EXTERNAL CONTENT MANIPULATION)
    const pattern = /(<r critical="SECURITY">.*?EXTERNAL CONTENT MANIPULATION PROTECTION.*?<\/r>)/s;
    const match = content.match(pattern);
    if (match) {
        const insertPos = match.index + match[0].length;
        return content.substring(0, insertPos) + "\n      " + rule + content.substring(insertPos);
    }
    // Fallback: find </rules> and insert before it
    const rulesEndIndex = content.indexOf("</rules>");
    if (rulesEndIndex !== -1) {
        return content.substring(0, rulesEndIndex) + "      " + rule + "\n    " + content.substring(rulesEndIndex);
    }
    // Last fallback: find <rules> and insert after first rule
    const rulesStartMatch = content.match(/<rules>\s*\n\s*<r[^>]*>/);
    if (rulesStartMatch) {
        const firstRuleEnd = content.indexOf('</r>', rulesStartMatch.index + rulesStartMatch[0].length);
        if (firstRuleEnd !== -1) {
            const insertPos = firstRuleEnd + 4;
            return content.substring(0, insertPos) + "\n      " + rule + content.substring(insertPos);
        }
    }
    return content;
}
function processAgent(filepath) {
    const content = fs.readFileSync(filepath, 'utf-8');
    if (hasProviderRule(content)) {
        console.log(`  ⏭️  ${path.basename(filepath)} (already has provider rule)`);
        return false;
    }
    if (!content.includes('<rules>')) {
        console.log(`  ⚠️  ${path.basename(filepath)} (no <rules> section found)`);
        return false;
    }
    backupFile(filepath);
    const newContent = insertRule(content, PROVIDER_RULE);
    if (newContent === content) {
        console.log(`  ⚠️  ${path.basename(filepath)} (could not find insertion point)`);
        return false;
    }
    fs.writeFileSync(filepath, newContent);
    console.log(`  ✅ ${path.basename(filepath)}`);
    return true;
}
function main() {
    console.log("=".repeat(60));
    console.log("BMAD Provider Awareness Rule Addition");
    console.log("=".repeat(60));
    console.log(`\nRule being added (subtle, non-spammy):`);
    console.log(`  ${PROVIDER_RULE}`);
    console.log(`\nTargeting high-risk modules: ${HIGH_RISK_MODULES.join(', ')}`);
    console.log(`Backups will be saved to: ${BACKUP_DIR}`);
    console.log();
    let totalModified = 0;
    let totalSkipped = 0;
    for (const module of HIGH_RISK_MODULES) {
        const agentsDir = path.join(BASE_DIR, module, "agents");
        if (!fs.existsSync(agentsDir)) {
            console.log(`⚠️  Module ${module} agents dir not found`);
            continue;
        }
        const agentFiles = fs.readdirSync(agentsDir)
            .filter(file => file.endsWith('.md'))
            .map(file => path.join(agentsDir, file));
        console.log(`\n📁 ${module} (${agentFiles.length} agents)`);
        for (const agentFile of agentFiles.sort()) {
            if (processAgent(agentFile)) {
                totalModified++;
            }
            else {
                totalSkipped++;
            }
        }
    }
    console.log("\n" + "=".repeat(60));
    console.log("SUMMARY");
    console.log("=".repeat(60));
    console.log(`  Modified: ${totalModified}`);
    console.log(`  Skipped:  ${totalSkipped}`);
    console.log(`  Backups:  ${BACKUP_DIR}`);
    console.log();
}
if (require.main === module) {
    main();
}
//# sourceMappingURL=add-provider-awareness.js.map