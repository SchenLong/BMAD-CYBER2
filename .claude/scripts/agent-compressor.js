/**
 * BMAD Agent Compressor
 *
 * Story: CONCURA-3.3 - Implement Compressed Agent Files
 *
 * This script generates compressed versions of BMAD agent files following the
 * persona compression specification (persona-compression-spec.md).
 *
 * Compression achieves ~70-85% token reduction by:
 * 1. Removing boilerplate activation blocks (handled by runtime)
 * 2. Condensing persona to essential elements (~200 tokens)
 * 3. Deferring menus, prompts, and extended content
 *
 * Usage:
 *   npx ts-node agent-compressor.ts [options]
 *
 * Options:
 *   --all         Compress all agents
 *   --module=X    Compress agents from specific module
 *   --agent=X     Compress specific agent by ID
 *   --dry-run     Show what would be compressed without writing
 *   --stats       Show compression statistics only
 */
import * as fs from 'fs';
import * as path from 'path';
// Configuration
const BMAD_ROOT = path.resolve(__dirname, '../../_bmad');
const OUTPUT_ROOT = path.resolve(__dirname, '../../_bmad/_compact/agents');
// Token estimation (rough approximation: ~4 chars per token)
const CHARS_PER_TOKEN = 4;
// ============================================================================
// PARSING FUNCTIONS
// ============================================================================
function parseAgentFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    // Extract module from path
    const pathParts = filePath.split(path.sep);
    const bmadIdx = pathParts.findIndex(p => p === '_bmad');
    const module = bmadIdx >= 0 ? pathParts[bmadIdx + 1] : 'unknown';
    // Parse XML agent tag
    const agentTagMatch = content.match(/<agent\s+id="([^"]+)"\s+name="([^"]+)"\s+title="([^"]+)"\s+icon="([^"]+)">/);
    if (!agentTagMatch || !agentTagMatch[1] || !agentTagMatch[2] || !agentTagMatch[3] || !agentTagMatch[4]) {
        console.warn(`Could not parse agent tag in ${filePath}`);
        return null;
    }
    const [, agentId, name, title, icon] = agentTagMatch;
    // Parse persona elements
    const roleMatch = content.match(/<role>([\s\S]*?)<\/role>/);
    const identityMatch = content.match(/<identity>([\s\S]*?)<\/identity>/);
    const styleMatch = content.match(/<communication_style>([\s\S]*?)<\/communication_style>/);
    const principlesMatch = content.match(/<principles>([\s\S]*?)<\/principles>/);
    const biasesMatch = content.match(/<inherent_biases[\s\S]*?>([\s\S]*?)<\/inherent_biases>/);
    const trimmedBiases = biasesMatch?.[1]?.trim();
    return {
        metadata: {
            agentId: agentId.replace('.agent.yaml', '').replace('.agent.md', ''),
            name,
            title,
            icon,
            module,
            filePath,
        },
        persona: {
            role: roleMatch?.[1]?.trim() || '',
            identity: identityMatch?.[1]?.trim() || '',
            communicationStyle: styleMatch?.[1]?.trim() || '',
            principles: principlesMatch?.[1]?.trim() || '',
            ...(trimmedBiases ? { inherentBiases: trimmedBiases } : {}),
        },
        rawContent: content,
    };
}
// ============================================================================
// COMPRESSION FUNCTIONS
// ============================================================================
/**
 * Compress identity to ~100 chars max
 * Rules:
 * - Keep years of experience (establishes authority)
 * - Keep certifications (credibility markers)
 * - List max 3 expertise areas
 * - Maximum 200 characters
 */
function compressIdentity(identity, role) {
    if (!identity)
        return role;
    // Extract key elements
    const yearsMatch = identity.match(/(\d+\+?\s*years?)/i);
    const certMatch = identity.match(/(CISSP|OSCP|OSCE|GXPN|SABSA|TOGAF|CISM|CEH|PMP|CFA|JD|LLM)/gi);
    // Get first 2 sentences for core description
    const sentences = identity.split(/\.\s+/);
    const coreSentence = sentences[0]?.trim() || '';
    // Build compressed version
    let compressed = coreSentence;
    // Add years if not in core
    if (yearsMatch && yearsMatch[1] && !compressed.includes(yearsMatch[1])) {
        compressed = compressed.replace(/with\s+/, `(${yearsMatch[1]}) `);
    }
    // Add certs if found
    if (certMatch && certMatch.length > 0) {
        const uniqueCerts = Array.from(new Set(certMatch.map(c => c.toUpperCase()))).slice(0, 3);
        const firstCert = uniqueCerts[0];
        if (firstCert && !compressed.toLowerCase().includes(firstCert.toLowerCase())) {
            compressed += ` ${uniqueCerts.join('/')} certified.`;
        }
    }
    // Truncate to ~200 chars
    if (compressed.length > 200) {
        compressed = `${compressed.substring(0, 197)  }...`;
    }
    return compressed;
}
/**
 * Compress communication style to ~150 chars
 * Rules:
 * - Keep 1-2 characteristic phrases in quotes
 * - Preserve core behavioral descriptor
 * - Remove action descriptions
 * - Maximum 150 characters
 */
function compressVoice(style) {
    if (!style)
        return '';
    // Extract quoted phrases
    const quotedPhrases = style.match(/"[^"]+"/g) || [];
    const keepPhrases = quotedPhrases.slice(0, 2);
    // Get first descriptive sentence
    const firstSentence = style.split(/\.\s+/)[0] || '';
    // Build compressed voice
    let voice = firstSentence.trim();
    // Add characteristic phrase if not too long
    if (keepPhrases.length > 0 && voice.length < 80) {
        voice += ` ${keepPhrases[0]}`;
    }
    // Remove action descriptions (e.g., "Draws mental diagrams while speaking")
    voice = voice.replace(/\s*(Draws|Speaks|Uses|Always|Never|Gets)\s+[^.]*\./gi, '.');
    // Clean up
    voice = voice.replace(/\s+/g, ' ').trim();
    // Truncate to 150 chars
    if (voice.length > 150) {
        voice = `${voice.substring(0, 147)  }...`;
    }
    return voice;
}
/**
 * Compress principles to single core principle (~75 chars)
 * Rules:
 * - Identify the ONE principle that best captures worldview
 * - Combine up to 3 related concepts if they form natural unity
 * - Remove explanatory clauses
 * - Maximum 75 characters
 */
function compressPrinciples(principles) {
    if (!principles)
        return '';
    // Split into individual principles
    const items = principles.split(/\n|(?<=\.)\s+-/g)
        .map(p => p.replace(/^-\s*/, '').trim())
        .filter(p => p.length > 0);
    if (items.length === 0)
        return '';
    // Take first 1-2 principles and condense
    let core = items[0] ?? '';
    // Remove explanatory clauses
    core = core.replace(/\s*[-–]\s+[^.]+$/, '');
    core = core.replace(/\s+because[^.]*\.?/gi, '.');
    core = core.replace(/\s+which[^.]*\.?/gi, '.');
    // If there are multiple short principles, try to combine
    if (items.length >= 3 && core.length < 30) {
        const keywords = items.slice(0, 3).map(p => {
            const firstPart = p.split(/[-–,]/)[0]?.trim() ?? '';
            return firstPart.length < 40 ? firstPart : '';
        }).filter(k => k.length > 0);
        if (keywords.length >= 2) {
            core = `${keywords.join('. ')  }.`;
        }
    }
    // Truncate to 75 chars
    if (core.length > 75) {
        core = `${core.substring(0, 72)  }...`;
    }
    return core;
}
/**
 * Generate compressed persona from parsed agent
 */
function compressAgent(metadata, persona) {
    const extended = {};
    if (persona.identity)
        extended.identity_full = persona.identity;
    if (persona.principles)
        extended.principles_full = persona.principles;
    if (persona.communicationStyle)
        extended.communication_style_full = persona.communicationStyle;
    if (persona.inherentBiases)
        extended.inherent_biases = persona.inherentBiases;
    return {
        essential: {
            agent_id: metadata.agentId,
            name: metadata.name,
            title: metadata.title,
            icon: metadata.icon,
            module: metadata.module,
            role: compressIdentity(persona.identity, persona.role),
            voice: compressVoice(persona.communicationStyle),
            core_principle: compressPrinciples(persona.principles),
        },
        ...(Object.keys(extended).length > 0 ? { extended } : {}),
    };
}
// ============================================================================
// OUTPUT FUNCTIONS
// ============================================================================
/**
 * Generate compressed agent markdown file
 */
function generateCompactMarkdown(compressed) {
    const { essential, extended } = compressed;
    let md = `---
# Compressed Agent File (BMAD-CONCURA)
# Target: ~200 tokens for essential persona
# Full agent: _bmad/${essential.module}/agents/${essential.agent_id}.md
agent_id: "${essential.agent_id}"
name: "${essential.name}"
title: "${essential.title}"
icon: "${essential.icon}"
module: "${essential.module}"
---

# ${essential.icon} ${essential.name}

**${essential.title}** | Module: ${essential.module}

## Essential Persona

**Role:**
${essential.role}

**Voice:**
${essential.voice}

**Core Principle:**
${essential.core_principle}

---

<!--
RUNTIME NOTE: This is a compressed agent file for minimal token activation.
- Activation protocol, menu handlers, and rules are handled by BMAD runtime
- Extended persona layers load on demand from original agent file
- Use this file for quick activation; load full agent for deep engagement
-->
`;
    // Add extended content reference if available
    if (extended && (extended.identity_full || extended.principles_full)) {
        md += `
## Extended Persona (Load on Demand)

Extended content available in original agent file:
- Full identity narrative
- Complete principles list
- Communication style details
${extended.inherent_biases ? '- Inherent biases and self-awareness' : ''}

Reference: \`_bmad/${essential.module}/agents/${essential.agent_id}.md\`
`;
    }
    return md;
}
/**
 * Estimate token count
 */
function estimateTokens(text) {
    return Math.ceil(text.length / CHARS_PER_TOKEN);
}
// ============================================================================
// FILE DISCOVERY
// ============================================================================
function discoverAgentFiles() {
    const modules = fs.readdirSync(BMAD_ROOT).filter(d => {
        const fullPath = path.join(BMAD_ROOT, d);
        return fs.statSync(fullPath).isDirectory() && d !== '_compact' && d !== '_config';
    });
    const agentFiles = [];
    for (const module of modules) {
        const agentsDir = path.join(BMAD_ROOT, module, 'agents');
        if (fs.existsSync(agentsDir)) {
            const files = fs.readdirSync(agentsDir).filter(f => f.endsWith('.md'));
            agentFiles.push(...files.map(f => path.join(agentsDir, f)));
        }
    }
    return agentFiles;
}
// ============================================================================
// MAIN EXECUTION
// ============================================================================
function processAgent(filePath, dryRun = false) {
    const parsed = parseAgentFile(filePath);
    if (!parsed)
        return null;
    const { metadata, persona, rawContent } = parsed;
    const compressed = compressAgent(metadata, persona);
    const compactMd = generateCompactMarkdown(compressed);
    // Calculate stats
    const originalChars = rawContent.length;
    const compressedChars = compactMd.length;
    const originalTokens = estimateTokens(rawContent);
    const compressedTokens = estimateTokens(compactMd);
    const compressionRatio = ((originalTokens - compressedTokens) / originalTokens) * 100;
    // Output path
    const outputDir = path.join(OUTPUT_ROOT, metadata.module);
    const outputPath = path.join(outputDir, `${metadata.agentId}.compact.md`);
    // Write file if not dry run
    if (!dryRun) {
        fs.mkdirSync(outputDir, { recursive: true });
        fs.writeFileSync(outputPath, compactMd);
    }
    return {
        agentId: metadata.agentId,
        module: metadata.module,
        originalChars,
        compressedChars,
        originalTokens,
        compressedTokens,
        compressionRatio,
        outputPath,
    };
}
function printStats(results) {
    console.log('\n=== COMPRESSION STATISTICS ===\n');
    // Group by module
    const byModule = {};
    for (const r of results) {
        if (!byModule[r.module])
            byModule[r.module] = [];
        const moduleResults = byModule[r.module];
        if (moduleResults) {
            moduleResults.push(r);
        }
    }
    // Print per-module stats
    console.log('By Module:');
    console.log('-'.repeat(80));
    console.log('Module'.padEnd(20) +
        'Agents'.padStart(8) +
        'Orig Tokens'.padStart(14) +
        'Comp Tokens'.padStart(14) +
        'Reduction'.padStart(12));
    console.log('-'.repeat(80));
    let totalOriginal = 0;
    let totalCompressed = 0;
    for (const [module, agents] of Object.entries(byModule).sort()) {
        const origTokens = agents.reduce((s, a) => s + a.originalTokens, 0);
        const compTokens = agents.reduce((s, a) => s + a.compressedTokens, 0);
        const reduction = ((origTokens - compTokens) / origTokens) * 100;
        totalOriginal += origTokens;
        totalCompressed += compTokens;
        console.log(module.padEnd(20) +
            agents.length.toString().padStart(8) +
            origTokens.toString().padStart(14) +
            compTokens.toString().padStart(14) +
            `${reduction.toFixed(1)}%`.padStart(12));
    }
    console.log('-'.repeat(80));
    const totalReduction = ((totalOriginal - totalCompressed) / totalOriginal) * 100;
    console.log('TOTAL'.padEnd(20) +
        results.length.toString().padStart(8) +
        totalOriginal.toString().padStart(14) +
        totalCompressed.toString().padStart(14) +
        `${totalReduction.toFixed(1)}%`.padStart(12));
    // Print individual agent stats
    console.log('\n\nPer-Agent Details:');
    console.log('-'.repeat(90));
    console.log('Agent ID'.padEnd(30) +
        'Module'.padEnd(18) +
        'Original'.padStart(10) +
        'Compressed'.padStart(12) +
        'Reduction'.padStart(12));
    console.log('-'.repeat(90));
    for (const r of results.sort((a, b) => b.compressionRatio - a.compressionRatio)) {
        console.log(r.agentId.padEnd(30) +
            r.module.padEnd(18) +
            `${r.originalTokens}`.padStart(10) +
            `${r.compressedTokens}`.padStart(12) +
            `${r.compressionRatio.toFixed(1)}%`.padStart(12));
    }
    console.log('\n');
}
// Main
function main() {
    const args = process.argv.slice(2);
    const dryRun = args.includes('--dry-run');
    const statsOnly = args.includes('--stats');
    const moduleArg = args.find(a => a.startsWith('--module='))?.split('=')[1];
    const agentArg = args.find(a => a.startsWith('--agent='))?.split('=')[1];
    console.log('BMAD Agent Compressor');
    console.log('='.repeat(50));
    console.log(`Mode: ${dryRun ? 'DRY RUN' : 'WRITE'}`);
    console.log(`Output: ${OUTPUT_ROOT}`);
    console.log('');
    // Discover agents
    let agentFiles = discoverAgentFiles();
    console.log(`Discovered ${agentFiles.length} agent files`);
    // Filter if needed
    if (moduleArg) {
        agentFiles = agentFiles.filter(f => f.includes(`/${moduleArg}/`));
        console.log(`Filtered to ${agentFiles.length} agents in module: ${moduleArg}`);
    }
    if (agentArg) {
        agentFiles = agentFiles.filter(f => path.basename(f, '.md') === agentArg);
        console.log(`Filtered to agent: ${agentArg}`);
    }
    // Process agents
    const results = [];
    for (const filePath of agentFiles) {
        try {
            const result = processAgent(filePath, dryRun || statsOnly);
            if (result) {
                results.push(result);
                if (!statsOnly) {
                    console.log(`${dryRun ? '[DRY] ' : ''}Compressed: ${result.agentId} (${result.compressionRatio.toFixed(1)}% reduction)`);
                }
            }
        }
        catch (err) {
            console.error(`Error processing ${filePath}:`, err);
        }
    }
    // Print stats
    printStats(results);
    // Summary
    const avgReduction = results.reduce((s, r) => s + r.compressionRatio, 0) / results.length;
    console.log(`Average compression: ${avgReduction.toFixed(1)}%`);
    console.log(`Target: 70%+ reduction`);
    console.log(`Status: ${avgReduction >= 70 ? 'PASS' : 'NEEDS IMPROVEMENT'}`);
}
// Run if called directly
if (require.main === module) {
    main();
}
export { parseAgentFile, compressAgent, generateCompactMarkdown, processAgent, discoverAgentFiles, estimateTokens, };
//# sourceMappingURL=agent-compressor.js.map