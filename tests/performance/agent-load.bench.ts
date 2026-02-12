/**
 * BMAD CYBERCOMMAND - Agent Loading Benchmarks
 * ============================================
 *
 * Benchmarks for agent loading performance using vitest bench mode.
 * Target: Single agent load <200ms
 */

import { describe, bench, beforeAll, afterAll } from 'vitest';
import * as path from 'path';
import * as fs from 'fs';

// Performance thresholds
const SINGLE_AGENT_LOAD_TARGET_MS = 200;
const BATCH_AGENT_LOAD_TARGET_MS = 2000;

// Helper to get project root
const PROJECT_ROOT = path.resolve(__dirname, '../..');

// Agent team directories
const AGENT_TEAMS = {
  intel: '_bmad/intel-team/agents',
  legal: '_bmad/legal-team/agents',
  strategy: '_bmad/strategy-team/agents',
  cybersec: '_bmad/cybersec-team/agents',
  core: '_bmad/core/agents',
  bmm: 'src/bmm/agents',
  bmb: 'src/bmb/agents',
  bmgd: 'src/bmgd/agents',
  cis: 'src/cis/agents',
};

// Agent file cache for tests
let agentFileCache: Map<string, string[]> = new Map();
let allAgentFiles: string[] = [];

// Helper to get agent files for a team
function getAgentFilesForTeam(teamDir: string): string[] {
  const fullPath = path.join(PROJECT_ROOT, teamDir);
  if (!fs.existsSync(fullPath)) {
    return [];
  }

  return fs.readdirSync(fullPath)
    .filter((f) => f.endsWith('.md'))
    .map((f) => path.join(fullPath, f));
}

// Helper to load a single agent
function loadAgent(filePath: string): { name: string; content: string; size: number } {
  const content = fs.readFileSync(filePath, 'utf-8');
  return {
    name: path.basename(filePath, '.md'),
    content,
    size: Buffer.byteLength(content, 'utf-8'),
  };
}

// Helper to parse agent metadata
function parseAgentMetadata(content: string): Record<string, string> {
  const metadata: Record<string, string> = {};
  const lines = content.split('\n');

  // Simple frontmatter parser
  let inFrontmatter = false;
  for (const line of lines) {
    if (line.trim() === '---') {
      if (inFrontmatter) break;
      inFrontmatter = true;
      continue;
    }

    if (inFrontmatter) {
      const match = line.match(/^(\w+):\s*(.*)$/);
      if (match) {
        metadata[match[1]] = match[2];
      }
    }
  }

  return metadata;
}

// Setup before benchmarks
beforeAll(() => {
  console.log('\n=== Loading Agent Files for Benchmarks ===');

  // Pre-cache all agent files
  for (const [team, dir] of Object.entries(AGENT_TEAMS)) {
    const files = getAgentFilesForTeam(dir);
    agentFileCache.set(team, files);
    allAgentFiles.push(...files);
    console.log(`  ${team}: ${files.length} agents`);
  }

  console.log(`  Total: ${allAgentFiles.length} agents`);
  console.log('==========================================\n');
});

afterAll(() => {
  agentFileCache.clear();
  allAgentFiles = [];
});

describe('Single Agent Load Benchmarks', () => {
  bench('load single agent file (first available)', () => {
    if (allAgentFiles.length > 0) {
      loadAgent(allAgentFiles[0]);
    }
  }, {
    iterations: 100,
    time: 5000,
  });

  bench('load and parse single agent metadata', () => {
    if (allAgentFiles.length > 0) {
      const agent = loadAgent(allAgentFiles[0]);
      parseAgentMetadata(agent.content);
    }
  }, {
    iterations: 100,
    time: 5000,
  });

  bench('load random agent from pool', () => {
    if (allAgentFiles.length > 0) {
      const randomIndex = Math.floor(Math.random() * allAgentFiles.length);
      loadAgent(allAgentFiles[randomIndex]);
    }
  }, {
    iterations: 100,
    time: 5000,
  });
});

describe('Team Agent Load Benchmarks', () => {
  bench('load all intel team agents', () => {
    const files = agentFileCache.get('intel') || [];
    files.forEach((file) => loadAgent(file));
  }, {
    iterations: 20,
    time: 10000,
  });

  bench('load all cybersec team agents', () => {
    const files = agentFileCache.get('cybersec') || [];
    files.forEach((file) => loadAgent(file));
  }, {
    iterations: 20,
    time: 10000,
  });

  bench('load all legal team agents', () => {
    const files = agentFileCache.get('legal') || [];
    files.forEach((file) => loadAgent(file));
  }, {
    iterations: 20,
    time: 10000,
  });

  bench('load all strategy team agents', () => {
    const files = agentFileCache.get('strategy') || [];
    files.forEach((file) => loadAgent(file));
  }, {
    iterations: 20,
    time: 10000,
  });

  bench('load all core agents', () => {
    const files = agentFileCache.get('core') || [];
    files.forEach((file) => loadAgent(file));
  }, {
    iterations: 20,
    time: 10000,
  });
});

describe('Batch Agent Load Benchmarks', () => {
  bench('load all agents sequentially', () => {
    for (const file of allAgentFiles) {
      loadAgent(file);
    }
  }, {
    iterations: 10,
    time: 30000,
  });

  bench('load all agents with metadata parsing', () => {
    for (const file of allAgentFiles) {
      const agent = loadAgent(file);
      parseAgentMetadata(agent.content);
    }
  }, {
    iterations: 10,
    time: 30000,
  });

  bench('load and index all agents', () => {
    const index = new Map<string, { name: string; content: string; size: number }>();

    for (const file of allAgentFiles) {
      const agent = loadAgent(file);
      index.set(agent.name, agent);
    }

    // Verify index
    if (index.size !== allAgentFiles.length) {
      throw new Error('Index size mismatch');
    }
  }, {
    iterations: 10,
    time: 30000,
  });
});

describe('Agent Processing Benchmarks', () => {
  bench('parse agent sections', () => {
    if (allAgentFiles.length > 0) {
      const agent = loadAgent(allAgentFiles[0]);
      const sections = agent.content.split(/^##\s+/m);

      // Process each section
      sections.forEach((section) => {
        const lines = section.split('\n');
        const title = lines[0]?.trim() || 'Untitled';
        const body = lines.slice(1).join('\n').trim();
        return { title, body };
      });
    }
  }, {
    iterations: 100,
    time: 5000,
  });

  bench('extract agent capabilities', () => {
    if (allAgentFiles.length > 0) {
      const agent = loadAgent(allAgentFiles[0]);

      // Look for capability patterns
      const capabilities: string[] = [];
      const lines = agent.content.split('\n');

      for (const line of lines) {
        if (line.match(/^[-*]\s+.+/)) {
          capabilities.push(line.replace(/^[-*]\s+/, '').trim());
        }
      }

      // Use capabilities to prevent optimization
      if (capabilities.length < 0) console.log('impossible');
    }
  }, {
    iterations: 100,
    time: 5000,
  });

  bench('build agent dependency graph', () => {
    const graph = new Map<string, string[]>();

    for (const file of allAgentFiles.slice(0, 10)) {
      const agent = loadAgent(file);
      const dependencies: string[] = [];

      // Look for references to other agents
      const matches = agent.content.match(/@\w+/g);
      if (matches) {
        dependencies.push(...matches.map((m) => m.slice(1)));
      }

      graph.set(agent.name, dependencies);
    }

    // Use graph to prevent optimization
    if (graph.size < 0) console.log('impossible');
  }, {
    iterations: 50,
    time: 10000,
  });
});

describe('Concurrent Load Benchmarks', () => {
  bench('load agents with Promise.all', async () => {
    const subset = allAgentFiles.slice(0, 10);

    await Promise.all(
      subset.map(async (file) => {
        // Simulate async file read
        return new Promise<{ name: string; content: string }>((resolve) => {
          const content = fs.readFileSync(file, 'utf-8');
          resolve({
            name: path.basename(file, '.md'),
            content,
          });
        });
      })
    );
  }, {
    iterations: 50,
    time: 10000,
  });

  bench('load agents in batches', async () => {
    const batchSize = 5;
    const batches: string[][] = [];

    for (let i = 0; i < allAgentFiles.length; i += batchSize) {
      batches.push(allAgentFiles.slice(i, i + batchSize));
    }

    for (const batch of batches.slice(0, 4)) {
      await Promise.all(
        batch.map(async (file) => {
          return new Promise<{ name: string; content: string }>((resolve) => {
            const content = fs.readFileSync(file, 'utf-8');
            resolve({
              name: path.basename(file, '.md'),
              content,
            });
          });
        })
      );
    }
  }, {
    iterations: 30,
    time: 10000,
  });
});

describe('Agent Search Benchmarks', () => {
  let loadedAgents: Array<{ name: string; content: string; size: number }> = [];

  beforeAll(() => {
    // Pre-load agents for search benchmarks
    loadedAgents = allAgentFiles.map((file) => loadAgent(file));
  });

  bench('search agents by name', () => {
    const query = 'security';
    loadedAgents.filter((agent) =>
      agent.name.toLowerCase().includes(query.toLowerCase())
    );
  }, {
    iterations: 1000,
    time: 5000,
  });

  bench('search agents by content', () => {
    const query = 'security';
    loadedAgents.filter((agent) =>
      agent.content.toLowerCase().includes(query.toLowerCase())
    );
  }, {
    iterations: 100,
    time: 5000,
  });

  bench('search agents with regex', () => {
    const pattern = /security|threat|vulnerability/gi;
    loadedAgents.filter((agent) => pattern.test(agent.content));
  }, {
    iterations: 100,
    time: 5000,
  });

  bench('rank agents by relevance', () => {
    const query = 'security threat analysis';
    const terms = query.toLowerCase().split(' ');

    loadedAgents
      .map((agent) => {
        const lowerContent = agent.content.toLowerCase();
        const score = terms.reduce((sum, term) => {
          const matches = lowerContent.split(term).length - 1;
          return sum + matches;
        }, 0);
        return { agent, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }, {
    iterations: 50,
    time: 5000,
  });
});

describe('Agent Serialization Benchmarks', () => {
  bench('serialize agent to JSON', () => {
    if (allAgentFiles.length > 0) {
      const agent = loadAgent(allAgentFiles[0]);
      JSON.stringify({
        name: agent.name,
        content: agent.content,
        size: agent.size,
        loadedAt: Date.now(),
      });
    }
  }, {
    iterations: 1000,
    time: 5000,
  });

  bench('serialize all agents to JSON', () => {
    const agents = allAgentFiles.slice(0, 10).map((file) => loadAgent(file));
    JSON.stringify(agents);
  }, {
    iterations: 100,
    time: 5000,
  });

  bench('deserialize agent from JSON', () => {
    const serialized = JSON.stringify({
      name: 'test-agent',
      content: '# Test Agent\n\nThis is a test agent with some content.',
      size: 100,
      loadedAt: Date.now(),
    });

    JSON.parse(serialized);
  }, {
    iterations: 1000,
    time: 5000,
  });
});
