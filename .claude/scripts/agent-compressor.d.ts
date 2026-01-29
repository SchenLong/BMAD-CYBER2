#!/usr/bin/env npx ts-node
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
interface AgentMetadata {
    agentId: string;
    name: string;
    title: string;
    icon: string;
    module: string;
    filePath: string;
}
interface PersonaElements {
    role: string;
    identity: string;
    communicationStyle: string;
    principles: string;
    inherentBiases?: string;
}
interface CompressedPersona {
    essential: {
        agent_id: string;
        name: string;
        title: string;
        icon: string;
        module: string;
        role: string;
        voice: string;
        core_principle: string;
    };
    extended?: {
        identity_full?: string;
        principles_full?: string;
        communication_style_full?: string;
        inherent_biases?: string;
    };
}
interface CompressionResult {
    agentId: string;
    module: string;
    originalChars: number;
    compressedChars: number;
    originalTokens: number;
    compressedTokens: number;
    compressionRatio: number;
    outputPath: string;
}
declare function parseAgentFile(filePath: string): {
    metadata: AgentMetadata;
    persona: PersonaElements;
    rawContent: string;
} | null;
/**
 * Generate compressed persona from parsed agent
 */
declare function compressAgent(metadata: AgentMetadata, persona: PersonaElements): CompressedPersona;
/**
 * Generate compressed agent markdown file
 */
declare function generateCompactMarkdown(compressed: CompressedPersona): string;
/**
 * Estimate token count
 */
declare function estimateTokens(text: string): number;
declare function discoverAgentFiles(): string[];
declare function processAgent(filePath: string, dryRun?: boolean): CompressionResult | null;
export { parseAgentFile, compressAgent, generateCompactMarkdown, processAgent, discoverAgentFiles, estimateTokens, };
//# sourceMappingURL=agent-compressor.d.ts.map