/**
 * BMAD Validators - Stdin Parser
 * ===============================
 * Parses tool input from stdin in JSON format from Claude Code.
 */

import * as fs from 'node:fs';
import type { ToolInput } from '../types/index.js';
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
export async function getToolInputFromStdin(): Promise<ToolInput> {
  const projectDir = getProjectDir();

  try {
    const chunks: Buffer[] = [];

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

    const data = JSON.parse(input) as Record<string, unknown>;

    return {
      tool_name: (data['tool_name'] as string) || '',
      tool_input: (data['tool_input'] as Record<string, unknown>) || {},
      cwd: (data['cwd'] as string) || projectDir,
      raw: data,
    };
  } catch {
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
export function getToolInputFromStdinSync(): ToolInput {
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

    const data = JSON.parse(input) as Record<string, unknown>;

    return {
      tool_name: (data['tool_name'] as string) || '',
      tool_input: (data['tool_input'] as Record<string, unknown>) || {},
      cwd: (data['cwd'] as string) || projectDir,
      raw: data,
    };
  } catch {
    return {
      tool_name: '',
      tool_input: {},
      cwd: projectDir,
      raw: {},
    };
  }
}
