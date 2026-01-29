/**
 * BMAD Validators - Stdin Parser
 * ===============================
 * Parses tool input from stdin in JSON format from Claude Code.
 */
import * as fs from 'node:fs';
import { getProjectDir } from './path-utils.js';
/**
 * Read and parse tool input from stdin.
 *
 * Claude Code passes tool inputs as JSON via stdin with the structure:
 * {
 *   "tool_name": "Bash",
 *   "tool_input": { "command": "ls -la" },
 *   "cwd": "/path/to/project"
 * }
 *
 * @returns Parsed tool input with defaults for missing fields
 */
export async function getToolInputFromStdin() {
    const projectDir = getProjectDir();
    try {
        const chunks = [];
        // Read all data from stdin
        for await (const chunk of process.stdin) {
            chunks.push(Buffer.from(chunk));
        }
        const input = Buffer.concat(chunks).toString('utf8');
        if (!input.trim()) {
            return {
                tool_name: '',
                tool_input: {},
                cwd: projectDir,
                raw: {},
            };
        }
        const data = JSON.parse(input);
        return {
            tool_name: data['tool_name'] || '',
            tool_input: data['tool_input'] || {},
            cwd: data['cwd'] || projectDir,
            raw: data,
        };
    }
    catch {
        return {
            tool_name: '',
            tool_input: {},
            cwd: projectDir,
            raw: {},
        };
    }
}
/**
 * Synchronous version of getToolInputFromStdin for simpler validators.
 *
 * Note: This reads stdin synchronously which may block. Use the async
 * version when possible.
 *
 * @returns Parsed tool input with defaults for missing fields
 */
export function getToolInputFromStdinSync() {
    const projectDir = getProjectDir();
    try {
        // Read from stdin file descriptor synchronously
        const input = fs.readFileSync(0, 'utf8');
        if (!input.trim()) {
            return {
                tool_name: '',
                tool_input: {},
                cwd: projectDir,
                raw: {},
            };
        }
        const data = JSON.parse(input);
        return {
            tool_name: data['tool_name'] || '',
            tool_input: data['tool_input'] || {},
            cwd: data['cwd'] || projectDir,
            raw: data,
        };
    }
    catch {
        return {
            tool_name: '',
            tool_input: {},
            cwd: projectDir,
            raw: {},
        };
    }
}
//# sourceMappingURL=stdin-parser.js.map