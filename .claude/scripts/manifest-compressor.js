/**
 * Micro-Manifest Generator
 *
 * Story: CONCURA-3.1 - Implement Micro-Manifest Generator
 * Author: BlackUnicorn.Tech
 *
 * Purpose: Generate compressed micro-manifests from full BMAD manifests
 * achieving 80%+ token reduction while preserving routing capability.
 *
 * Compression Rules (from micro-manifest-spec.md):
 * - Summaries: 10-15 words max, action-verb start
 * - Tags: max 5 comma-separated routing tags
 * - Dropped fields: displayName, title, icon, identity, communicationStyle, principles
 *
 * Usage: npx ts-node manifest-compressor.ts [--dry-run] [--verbose]
 */
import * as fs from 'fs';
import * as path from 'path';
// =============================================================================
// CONFIGURATION
// =============================================================================
const CONFIG = {
    // Input paths (relative to _bmad/_config/)
    agentManifestPath: '_bmad/_config/agent-manifest.csv',
    workflowManifestPath: '_bmad/_config/workflow-manifest.csv',
    // Output paths (same directory as inputs)
    microAgentManifestPath: '_bmad/_config/micro-agent-manifest.csv',
    microWorkflowManifestPath: '_bmad/_config/micro-workflow-manifest.csv',
    // Compression settings
    maxSummaryWords: 15,
    maxSummaryChars: 80,
    maxTags: 5,
    maxTagChars: 50,
};
// =============================================================================
// TAG TAXONOMY (from micro-manifest-spec.md Appendix A)
// =============================================================================
const TAG_TAXONOMY = {
    // Domain tags (derived from module)
    domain: {
        'cybersec-team': 'security',
        'legal-team': 'legal',
        'intel-team': 'intel',
        'bmgd': 'gamedev',
        'bmm': 'software',
        'bmb': 'software',
        'core': 'software',
        'strategy-team': 'strategy',
        'cis': 'creative',
    },
    // Function tags (derived from role keywords)
    function: [
        'architect', 'analyst', 'developer', 'tester', 'writer',
        'designer', 'manager', 'specialist'
    ],
    // Specialty tags (derived from identity/description keywords)
    specialty: [
        'web', 'mobile', 'cloud', 'blockchain', 'ai-ml', 'forensics',
        'compliance', 'contracts', 'corporate', 'osint', 'threat', 'pentest',
        'tdd', 'security'
    ],
};
// Keyword to tag mapping for specialty detection
const SPECIALTY_KEYWORDS = {
    'web app': 'web',
    'api': 'web',
    'owasp': 'web',
    'mobile': 'mobile',
    'ios': 'mobile',
    'android': 'mobile',
    'cloud': 'cloud',
    'aws': 'cloud',
    'azure': 'cloud',
    'gcp': 'cloud',
    'blockchain': 'blockchain',
    'smart contract': 'blockchain',
    'defi': 'blockchain',
    'web3': 'blockchain',
    'llm': 'ai-ml',
    'machine learning': 'ai-ml',
    'ai': 'ai-ml',
    'forensic': 'forensics',
    'evidence': 'forensics',
    'compliance': 'compliance',
    'audit': 'compliance',
    'gdpr': 'compliance',
    'hipaa': 'compliance',
    'pci': 'compliance',
    'sox': 'compliance',
    'nist': 'compliance',
    'contract': 'contracts',
    'corporate': 'corporate',
    'osint': 'osint',
    'threat': 'threat',
    'apt': 'threat',
    'penetration': 'pentest',
    'red team': 'pentest',
    'test-first': 'tdd',
    'tdd': 'tdd',
};
// Function keyword to tag mapping
const FUNCTION_KEYWORDS = {
    'architect': 'architect',
    'design': 'architect',
    'system': 'architect',
    'analyst': 'analyst',
    'analysis': 'analyst',
    'research': 'analyst',
    'developer': 'developer',
    'engineer': 'developer',
    'implement': 'developer',
    'code': 'developer',
    'tester': 'tester',
    'qa': 'tester',
    'test': 'tester',
    'quality': 'tester',
    'writer': 'writer',
    'documentation': 'writer',
    'technical writer': 'writer',
    'designer': 'designer',
    'ux': 'designer',
    'ui': 'designer',
    'creative': 'designer',
    'manager': 'manager',
    'lead': 'manager',
    'director': 'manager',
    'coordinator': 'manager',
    'scrum': 'manager',
    'specialist': 'specialist',
    'expert': 'specialist',
};
// =============================================================================
// CSV PARSING & WRITING
// =============================================================================
/**
 * Parse CSV with proper quote handling
 * Handles fields containing commas, quotes, and newlines
 */
function parseCSV(content) {
    const rows = [];
    let currentRow = [];
    let currentField = '';
    let inQuotes = false;
    for (let i = 0; i < content.length; i++) {
        const char = content[i];
        const nextChar = content[i + 1];
        if (inQuotes) {
            if (char === '"' && nextChar === '"') {
                // Escaped quote
                currentField += '"';
                i++; // Skip next quote
            }
            else if (char === '"') {
                // End of quoted field
                inQuotes = false;
            }
            else {
                currentField += char;
            }
        }
        else {
            if (char === '"') {
                inQuotes = true;
            }
            else if (char === ',') {
                currentRow.push(currentField);
                currentField = '';
            }
            else if (char === '\n' || (char === '\r' && nextChar === '\n')) {
                currentRow.push(currentField);
                if (currentRow.some(f => f.trim())) { // Skip empty rows
                    rows.push(currentRow);
                }
                currentRow = [];
                currentField = '';
                if (char === '\r')
                    i++; // Skip \n in \r\n
            }
            else if (char !== '\r') {
                currentField += char;
            }
        }
    }
    // Handle last field/row
    if (currentField || currentRow.length > 0) {
        currentRow.push(currentField);
        if (currentRow.some(f => f.trim())) {
            rows.push(currentRow);
        }
    }
    return rows;
}
/**
 * Escape a field for CSV output
 */
function escapeCSVField(field) {
    if (field.includes(',') || field.includes('"') || field.includes('\n')) {
        return `"${field.replace(/"/g, '""')}"`;
    }
    return field;
}
/**
 * Generate CSV content from rows
 */
function generateCSV(headers, rows) {
    const lines = [headers.join(',')];
    for (const row of rows) {
        lines.push(row.map(escapeCSVField).join(','));
    }
    return `${lines.join('\n')  }\n`;
}
// =============================================================================
// COMPRESSION LOGIC
// =============================================================================
/**
 * Extract domain tag from module name
 */
function getDomainTag(module) {
    return TAG_TAXONOMY.domain[module] || 'software';
}
/**
 * Extract function tags from text
 */
function extractFunctionTags(text) {
    const lowerText = text.toLowerCase();
    const tags = new Set();
    for (const [keyword, tag] of Object.entries(FUNCTION_KEYWORDS)) {
        if (lowerText.includes(keyword)) {
            tags.add(tag);
        }
    }
    return Array.from(tags);
}
/**
 * Extract specialty tags from text
 */
function extractSpecialtyTags(text) {
    const lowerText = text.toLowerCase();
    const tags = new Set();
    for (const [keyword, tag] of Object.entries(SPECIALTY_KEYWORDS)) {
        if (lowerText.includes(keyword)) {
            tags.add(tag);
        }
    }
    return Array.from(tags);
}
/**
 * Generate tags for an agent entry
 * Combines domain + function + specialty tags (max 5)
 */
function generateAgentTags(agent) {
    const tags = [];
    // 1. Domain tag from module (always first)
    tags.push(getDomainTag(agent.module));
    // 2. Function tags from role
    const functionTags = extractFunctionTags(`${agent.role  } ${  agent.title}`);
    tags.push(...functionTags.slice(0, 2)); // Max 2 function tags
    // 3. Specialty tags from identity
    const specialtyTags = extractSpecialtyTags(`${agent.identity  } ${  agent.role}`);
    for (const tag of specialtyTags) {
        if (tags.length >= CONFIG.maxTags)
            break;
        if (!tags.includes(tag)) {
            tags.push(tag);
        }
    }
    // Deduplicate and limit
    const uniqueTags = Array.from(new Set(tags)).slice(0, CONFIG.maxTags);
    const result = uniqueTags.join(' ');
    // Ensure we don't exceed max chars
    if (result.length > CONFIG.maxTagChars) {
        return uniqueTags.slice(0, 3).join(' ');
    }
    return result;
}
/**
 * Generate tags for a workflow entry
 */
function generateWorkflowTags(workflow) {
    const tags = [];
    // 1. Domain tag from module
    tags.push(getDomainTag(workflow.module));
    // 2. Function tags from description
    const functionTags = extractFunctionTags(workflow.description);
    tags.push(...functionTags.slice(0, 2));
    // 3. Specialty tags from description
    const specialtyTags = extractSpecialtyTags(workflow.description);
    for (const tag of specialtyTags) {
        if (tags.length >= CONFIG.maxTags)
            break;
        if (!tags.includes(tag)) {
            tags.push(tag);
        }
    }
    const uniqueTags = Array.from(new Set(tags)).slice(0, CONFIG.maxTags);
    const result = uniqueTags.join(' ');
    if (result.length > CONFIG.maxTagChars) {
        return uniqueTags.slice(0, 3).join(' ');
    }
    return result;
}
/**
 * Compress agent role/identity into a summary
 * Rules:
 * - Start with action verb
 * - Focus on primary capability
 * - Max 15 words / 80 chars
 */
function generateAgentSummary(agent) {
    // Start with role, which usually has the verb
    let summary = agent.role;
    // If role doesn't start with verb, try to extract from identity
    const firstWord = summary.split(' ')[0].toLowerCase();
    const actionVerbs = [
        'executes', 'designs', 'creates', 'builds', 'manages', 'leads',
        'analyzes', 'develops', 'implements', 'facilitates', 'guides',
        'coordinates', 'advises', 'handles', 'provides', 'routes',
        'tracks', 'maps', 'monitors', 'conducts', 'plans', 'navigates',
        'channels', 'prepares', 'tests', 'audits', 'secures', 'protects'
    ];
    // Check if we need to rewrite
    const hasActionVerb = actionVerbs.some(v => firstWord.includes(v) || summary.toLowerCase().startsWith(v));
    if (!hasActionVerb) {
        // Try to construct from identity
        const identity = agent.identity.toLowerCase();
        // Find a good action verb for this agent
        if (identity.includes('architect') || identity.includes('design')) {
            summary = `Designs ${  summary.toLowerCase().replace(/^(senior |lead |master |expert |principal )/i, '')}`;
        }
        else if (identity.includes('analyst') || identity.includes('analysis')) {
            summary = `Analyzes ${  summary.toLowerCase().replace(/^(senior |lead |master |expert )/i, '')}`;
        }
        else if (identity.includes('developer') || identity.includes('implement')) {
            summary = `Implements ${  summary.toLowerCase().replace(/^(senior |lead |master |expert )/i, '')}`;
        }
        else if (identity.includes('manager') || identity.includes('coordinator')) {
            summary = `Manages ${  summary.toLowerCase().replace(/^(senior |lead |master |expert )/i, '')}`;
        }
        else if (identity.includes('specialist') || identity.includes('expert')) {
            summary = `Provides ${  summary.toLowerCase().replace(/^(senior |lead |master |expert )/i, '')  } expertise`;
        }
    }
    // Truncate to word limit
    const words = summary.split(/\s+/);
    if (words.length > CONFIG.maxSummaryWords) {
        summary = words.slice(0, CONFIG.maxSummaryWords).join(' ');
    }
    // Truncate to char limit
    if (summary.length > CONFIG.maxSummaryChars) {
        summary = `${summary.slice(0, CONFIG.maxSummaryChars - 3)  }...`;
    }
    return summary;
}
/**
 * Compress workflow description into a summary
 */
function generateWorkflowSummary(workflow) {
    let summary = workflow.description;
    // Check for action verb start
    const firstWord = summary.split(' ')[0].toLowerCase();
    const actionVerbs = [
        'create', 'creates', 'build', 'builds', 'generate', 'generates',
        'analyze', 'analyzes', 'validate', 'validates', 'facilitate', 'facilitates',
        'guide', 'guides', 'coordinate', 'coordinates', 'prepare', 'prepares',
        'develop', 'develops', 'execute', 'executes', 'perform', 'performs',
        'assess', 'assesses', 'review', 'reviews', 'plan', 'plans',
        'initialize', 'initializes', 'configure', 'configures', 'map', 'maps',
        'trace', 'traces', 'recover', 'recovers', 'identify', 'identifies',
        'navigate', 'navigates', 'transform', 'transforms', 'provide', 'provides'
    ];
    const hasActionVerb = actionVerbs.some(v => firstWord === v);
    if (!hasActionVerb) {
        // Prepend appropriate verb based on description content
        const desc = summary.toLowerCase();
        if (desc.includes('creation') || desc.includes('creates')) {
            summary = `Creates ${  summary.toLowerCase()}`;
        }
        else if (desc.includes('analysis') || desc.includes('analyze')) {
            summary = `Analyzes ${  summary.toLowerCase()}`;
        }
        else if (desc.includes('validation') || desc.includes('validate')) {
            summary = `Validates ${  summary.toLowerCase()}`;
        }
        else if (desc.includes('preparation') || desc.includes('prepare')) {
            summary = `Prepares ${  summary.toLowerCase()}`;
        }
        else if (desc.includes('review')) {
            summary = `Reviews ${  summary.toLowerCase()}`;
        }
        else if (desc.includes('guide') || desc.includes('facilitat')) {
            summary = `Guides ${  summary.toLowerCase()}`;
        }
        else if (desc.includes('coordinate')) {
            summary = `Coordinates ${  summary.toLowerCase()}`;
        }
        else if (desc.includes('comprehensive') || desc.includes('complete')) {
            // Remove redundant words and add verb
            summary = `Provides ${  summary.toLowerCase()
                .replace(/comprehensive\s+/gi, '')
                .replace(/complete\s+/gi, '')}`;
        }
    }
    // Remove common redundant phrases
    summary = summary
        .replace(/that\s+/gi, '')
        .replace(/which\s+/gi, '')
        .replace(/the\s+/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    // Truncate to word limit
    const words = summary.split(/\s+/);
    if (words.length > CONFIG.maxSummaryWords) {
        summary = words.slice(0, CONFIG.maxSummaryWords).join(' ');
    }
    // Truncate to char limit
    if (summary.length > CONFIG.maxSummaryChars) {
        summary = `${summary.slice(0, CONFIG.maxSummaryChars - 3)  }...`;
    }
    // Capitalize first letter
    summary = summary.charAt(0).toUpperCase() + summary.slice(1);
    return summary;
}
/**
 * Compress agent manifest entry to micro format
 */
function compressAgent(agent) {
    return {
        name: agent.name,
        summary: generateAgentSummary(agent),
        tags: generateAgentTags(agent),
        module: agent.module,
        path: agent.path,
    };
}
/**
 * Compress workflow manifest entry to micro format
 */
function compressWorkflow(workflow) {
    return {
        name: workflow.name,
        summary: generateWorkflowSummary(workflow),
        tags: generateWorkflowTags(workflow),
        module: workflow.module,
        path: workflow.path,
    };
}
// =============================================================================
// FILE OPERATIONS
// =============================================================================
/**
 * Parse agent manifest CSV into typed entries
 */
function parseAgentManifest(content) {
    const rows = parseCSV(content);
    if (rows.length < 2)
        return [];
    const headers = rows[0];
    const entries = [];
    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row.length < 10)
            continue;
        entries.push({
            name: row[0] || '',
            displayName: row[1] || '',
            title: row[2] || '',
            icon: row[3] || '',
            role: row[4] || '',
            identity: row[5] || '',
            communicationStyle: row[6] || '',
            principles: row[7] || '',
            module: row[8] || '',
            path: row[9] || '',
        });
    }
    return entries;
}
/**
 * Parse workflow manifest CSV into typed entries
 */
function parseWorkflowManifest(content) {
    const rows = parseCSV(content);
    if (rows.length < 2)
        return [];
    const entries = [];
    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row.length < 4)
            continue;
        entries.push({
            name: row[0] || '',
            description: row[1] || '',
            module: row[2] || '',
            path: row[3] || '',
        });
    }
    return entries;
}
/**
 * Estimate token count (approximately 4 chars per token)
 */
function estimateTokens(text) {
    return Math.ceil(text.length / 4);
}
/**
 * Validate that micro-manifest represents all entries from full manifest
 * Note: Workflows may have the same name in different modules (e.g., code-review in bmm and bmgd)
 * So we validate based on name+module combination, not just name
 */
function validateCompleteness(fullEntries, microEntries) {
    const errors = [];
    const warnings = [];
    // Create unique keys combining name and module
    const makeKey = (e) => `${e.module}:${e.name}`;
    const fullSet = new Set(fullEntries.map(makeKey));
    const microSet = new Set(microEntries.map(makeKey));
    // Check for missing entries
    for (const entry of fullEntries) {
        const key = makeKey(entry);
        if (!microSet.has(key)) {
            errors.push(`Missing entry in micro-manifest: ${entry.name} (${entry.module})`);
        }
    }
    // Check for extra entries (shouldn't happen, but good to catch)
    for (const entry of microEntries) {
        const key = makeKey(entry);
        if (!fullSet.has(key)) {
            warnings.push(`Extra entry in micro-manifest not in full: ${entry.name} (${entry.module})`);
        }
    }
    // Check for true duplicates (same name AND module)
    if (microEntries.length !== microSet.size) {
        errors.push('True duplicate entries detected in micro-manifest (same name and module)');
    }
    return {
        valid: errors.length === 0,
        errors,
        warnings,
    };
}
/**
 * Validate micro entry format
 */
function validateMicroEntry(entry, index) {
    const errors = [];
    if (!entry.name || entry.name.trim() === '') {
        errors.push(`Entry ${index}: Missing name`);
    }
    if (!entry.summary || entry.summary.trim() === '') {
        errors.push(`Entry ${index} (${entry.name}): Missing summary`);
    }
    else if (entry.summary.length > CONFIG.maxSummaryChars) {
        errors.push(`Entry ${index} (${entry.name}): Summary exceeds ${CONFIG.maxSummaryChars} chars (${entry.summary.length})`);
    }
    if (!entry.tags || entry.tags.trim() === '') {
        errors.push(`Entry ${index} (${entry.name}): Missing tags`);
    }
    if (!entry.module || entry.module.trim() === '') {
        errors.push(`Entry ${index} (${entry.name}): Missing module`);
    }
    if (!entry.path || entry.path.trim() === '') {
        errors.push(`Entry ${index} (${entry.name}): Missing path`);
    }
    return errors;
}
async function main() {
    const args = process.argv.slice(2);
    const options = {
        dryRun: args.includes('--dry-run'),
        verbose: args.includes('--verbose'),
        basePath: args.find(a => a.startsWith('--base-path='))?.split('=')[1] || process.cwd(),
    };
    // Find project root (look for _bmad directory)
    let basePath = options.basePath;
    while (!fs.existsSync(path.join(basePath, '_bmad')) && basePath !== '/') {
        basePath = path.dirname(basePath);
    }
    if (!fs.existsSync(path.join(basePath, '_bmad'))) {
        console.error('Error: Could not find _bmad directory. Run from BMAD project root.');
        process.exit(1);
    }
    console.log('='.repeat(70));
    console.log('BMAD Micro-Manifest Generator');
    console.log('='.repeat(70));
    console.log(`Base path: ${basePath}`);
    console.log(`Mode: ${options.dryRun ? 'DRY RUN' : 'WRITE'}`);
    console.log('');
    // Read full manifests
    const agentManifestPath = path.join(basePath, CONFIG.agentManifestPath);
    const workflowManifestPath = path.join(basePath, CONFIG.workflowManifestPath);
    if (!fs.existsSync(agentManifestPath)) {
        console.error(`Error: Agent manifest not found at ${agentManifestPath}`);
        process.exit(1);
    }
    if (!fs.existsSync(workflowManifestPath)) {
        console.error(`Error: Workflow manifest not found at ${workflowManifestPath}`);
        process.exit(1);
    }
    const agentContent = fs.readFileSync(agentManifestPath, 'utf-8');
    const workflowContent = fs.readFileSync(workflowManifestPath, 'utf-8');
    // Parse full manifests
    const agents = parseAgentManifest(agentContent);
    const workflows = parseWorkflowManifest(workflowContent);
    console.log(`Loaded ${agents.length} agents from full manifest`);
    console.log(`Loaded ${workflows.length} workflows from full manifest`);
    console.log('');
    // Compress agents
    console.log('-'.repeat(70));
    console.log('COMPRESSING AGENTS');
    console.log('-'.repeat(70));
    const microAgents = [];
    const agentErrors = [];
    for (let i = 0; i < agents.length; i++) {
        const agent = agents[i];
        const micro = compressAgent(agent);
        microAgents.push(micro);
        const entryErrors = validateMicroEntry(micro, i);
        agentErrors.push(...entryErrors);
        if (options.verbose) {
            console.log(`  ${micro.name}: "${micro.summary}" [${micro.tags}]`);
        }
    }
    // Compress workflows
    console.log('-'.repeat(70));
    console.log('COMPRESSING WORKFLOWS');
    console.log('-'.repeat(70));
    const microWorkflows = [];
    const workflowErrors = [];
    for (let i = 0; i < workflows.length; i++) {
        const workflow = workflows[i];
        const micro = compressWorkflow(workflow);
        microWorkflows.push(micro);
        const entryErrors = validateMicroEntry(micro, i);
        workflowErrors.push(...entryErrors);
        if (options.verbose) {
            console.log(`  ${micro.name}: "${micro.summary}" [${micro.tags}]`);
        }
    }
    // Validate completeness
    console.log('');
    console.log('-'.repeat(70));
    console.log('VALIDATION');
    console.log('-'.repeat(70));
    const agentValidation = validateCompleteness(agents.map(a => ({ name: a.name, module: a.module })), microAgents.map(a => ({ name: a.name, module: a.module })));
    const workflowValidation = validateCompleteness(workflows.map(w => ({ name: w.name, module: w.module })), microWorkflows.map(w => ({ name: w.name, module: w.module })));
    const allErrors = [
        ...agentErrors,
        ...workflowErrors,
        ...agentValidation.errors,
        ...workflowValidation.errors,
    ];
    const allWarnings = [
        ...agentValidation.warnings,
        ...workflowValidation.warnings,
    ];
    if (allErrors.length > 0) {
        console.log('ERRORS:');
        allErrors.forEach(e => console.log(`  - ${e}`));
    }
    if (allWarnings.length > 0) {
        console.log('WARNINGS:');
        allWarnings.forEach(w => console.log(`  - ${w}`));
    }
    if (allErrors.length === 0 && allWarnings.length === 0) {
        console.log('All validations passed!');
    }
    // Generate output CSVs
    const microAgentHeaders = ['name', 'summary', 'tags', 'module', 'path'];
    const microAgentRows = microAgents.map(a => [a.name, a.summary, a.tags, a.module, a.path]);
    const microAgentCSV = generateCSV(microAgentHeaders, microAgentRows);
    const microWorkflowHeaders = ['name', 'summary', 'tags', 'module', 'path'];
    const microWorkflowRows = microWorkflows.map(w => [w.name, w.summary, w.tags, w.module, w.path]);
    const microWorkflowCSV = generateCSV(microWorkflowHeaders, microWorkflowRows);
    // Calculate statistics
    const agentStats = {
        inputEntries: agents.length,
        outputEntries: microAgents.length,
        inputBytes: agentContent.length,
        outputBytes: microAgentCSV.length,
        inputTokensEstimate: estimateTokens(agentContent),
        outputTokensEstimate: estimateTokens(microAgentCSV),
    };
    const workflowStats = {
        inputEntries: workflows.length,
        outputEntries: microWorkflows.length,
        inputBytes: workflowContent.length,
        outputBytes: microWorkflowCSV.length,
        inputTokensEstimate: estimateTokens(workflowContent),
        outputTokensEstimate: estimateTokens(microWorkflowCSV),
    };
    // Print statistics
    console.log('');
    console.log('-'.repeat(70));
    console.log('COMPRESSION STATISTICS');
    console.log('-'.repeat(70));
    console.log('');
    console.log('Agent Manifest:');
    console.log(`  Entries: ${agentStats.inputEntries} -> ${agentStats.outputEntries}`);
    console.log(`  Bytes: ${agentStats.inputBytes.toLocaleString()} -> ${agentStats.outputBytes.toLocaleString()} (${((1 - agentStats.outputBytes / agentStats.inputBytes) * 100).toFixed(1)}% reduction)`);
    console.log(`  Tokens (est): ${agentStats.inputTokensEstimate.toLocaleString()} -> ${agentStats.outputTokensEstimate.toLocaleString()} (${((1 - agentStats.outputTokensEstimate / agentStats.inputTokensEstimate) * 100).toFixed(1)}% reduction)`);
    console.log('');
    console.log('Workflow Manifest:');
    console.log(`  Entries: ${workflowStats.inputEntries} -> ${workflowStats.outputEntries}`);
    console.log(`  Bytes: ${workflowStats.inputBytes.toLocaleString()} -> ${workflowStats.outputBytes.toLocaleString()} (${((1 - workflowStats.outputBytes / workflowStats.inputBytes) * 100).toFixed(1)}% reduction)`);
    console.log(`  Tokens (est): ${workflowStats.inputTokensEstimate.toLocaleString()} -> ${workflowStats.outputTokensEstimate.toLocaleString()} (${((1 - workflowStats.outputTokensEstimate / workflowStats.inputTokensEstimate) * 100).toFixed(1)}% reduction)`);
    const totalInputTokens = agentStats.inputTokensEstimate + workflowStats.inputTokensEstimate;
    const totalOutputTokens = agentStats.outputTokensEstimate + workflowStats.outputTokensEstimate;
    console.log('');
    console.log('TOTAL:');
    console.log(`  Tokens (est): ${totalInputTokens.toLocaleString()} -> ${totalOutputTokens.toLocaleString()} (${((1 - totalOutputTokens / totalInputTokens) * 100).toFixed(1)}% reduction)`);
    console.log(`  Saved: ~${(totalInputTokens - totalOutputTokens).toLocaleString()} tokens`);
    // Write output files (unless dry run)
    if (!options.dryRun) {
        if (allErrors.length > 0) {
            console.log('');
            console.log('ERROR: Cannot write output due to validation errors.');
            process.exit(1);
        }
        const microAgentPath = path.join(basePath, CONFIG.microAgentManifestPath);
        const microWorkflowPath = path.join(basePath, CONFIG.microWorkflowManifestPath);
        fs.writeFileSync(microAgentPath, microAgentCSV, 'utf-8');
        fs.writeFileSync(microWorkflowPath, microWorkflowCSV, 'utf-8');
        console.log('');
        console.log('-'.repeat(70));
        console.log('OUTPUT FILES WRITTEN');
        console.log('-'.repeat(70));
        console.log(`  ${microAgentPath}`);
        console.log(`  ${microWorkflowPath}`);
    }
    else {
        console.log('');
        console.log('DRY RUN - No files written. Run without --dry-run to write output.');
    }
    console.log('');
    console.log('='.repeat(70));
    console.log('COMPLETE');
    console.log('='.repeat(70));
    process.exit(allErrors.length > 0 ? 1 : 0);
}
main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
//# sourceMappingURL=manifest-compressor.js.map