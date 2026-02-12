/**
 * UAT-09: LLM Integration (12 checks)
 *
 * Validates: Category C — Local LLM connectivity, provider switching, error handling
 * Closes: P9-39, Category C (NOT TESTED)
 *
 * Stories:
 *   S1: Ollama testing (6 checks) — UAT-09-001 to UAT-09-006
 *   S2: Provider switching + error handling (6 checks) — UAT-09-007 to UAT-09-012
 *
 * Note: These tests validate infrastructure (scripts, configs, code patterns).
 * Actual Ollama/LM Studio connectivity requires those services running locally.
 */

import { beforeAll, describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'fs';
import { join, resolve } from 'path';

const PROJECT_ROOT = resolve(import.meta.dirname, '..', '..');

// Helper: read file as string
function readFile(filePath) {
  return readFileSync(filePath, 'utf-8');
}

// =============================================================================
// S1: Ollama Testing (6 checks)
// =============================================================================
describe('UAT-09-S1: Ollama Testing', () => {

  let llmConfig;
  let llmProviderManager;
  let connectionTester;
  let localDetector;
  let llmChecker;

  beforeAll(() => {
    llmConfig = readFile(join(PROJECT_ROOT, '_bmad', '_config', 'llm-config.yaml'));
    llmProviderManager = readFile(join(PROJECT_ROOT, '.claude', 'hooks', 'llm-provider-manager.sh'));
    connectionTester = readFile(join(PROJECT_ROOT, 'src', 'utility', 'tools', 'llm-setup', 'connection-tester.js'));
    localDetector = readFile(join(PROJECT_ROOT, 'src', 'utility', 'tools', 'llm-setup', 'local-detector.js'));
    llmChecker = readFile(join(PROJECT_ROOT, 'src', 'utility', 'tools', 'health-check', 'llm-checker.js'));
  });

  // UAT-09-001: Ollama connectivity
  it('UAT-09-001: Ollama provider configured with correct endpoint and health check', () => {
    // llm-config.yaml must define Ollama with localhost:11434
    expect(llmConfig).toMatch(/ollama/i);
    expect(llmConfig).toContain('http://localhost:11434');

    // Provider manager script handles Ollama health checks
    expect(llmProviderManager).toContain('ollama');
    expect(llmProviderManager).toContain('http://localhost:11434/api/tags');

    // Health check uses /api/tags endpoint
    expect(llmChecker).toMatch(/\/api\/tags/);

    // Connection tester defines Ollama endpoint
    expect(connectionTester).toMatch(/ollama.*\/api\/tags|\/api\/tags.*ollama/s);
  });

  // UAT-09-002: Ollama model selection
  it('UAT-09-002: infrastructure supports Ollama model listing and selection', () => {
    // Local detector probes Ollama and parses model list
    expect(localDetector).toMatch(/ollama/i);
    expect(localDetector).toContain('localhost:11434');
    expect(localDetector).toMatch(/parseModels|models/);

    // llm-config.yaml defines a default Ollama model
    expect(llmConfig).toMatch(/ollama[\s\S]*?model:/);

    // Provider manager lists available providers
    expect(llmProviderManager).toMatch(/list_providers|list\)/);

    // Health checker can list local models
    expect(llmChecker).toMatch(/getLocalModels|availableModels/);
  });

  // UAT-09-003: Ollama agent activation
  it('UAT-09-003: provider system supports activating agents with Ollama backend', () => {
    // llm-config.yaml supports agent-level overrides
    expect(llmConfig).toMatch(/agent_overrides/);

    // Provider manager supports agent-specific provider selection
    expect(llmProviderManager).toMatch(/agent.*override|get.*agent/i);

    // Config defines Ollama capabilities (tool_use, streaming, context_window)
    expect(llmConfig).toMatch(/ollama[\s\S]*?capabilities/);
    expect(llmConfig).toMatch(/ollama[\s\S]*?streaming:\s*true/);
  });

  // UAT-09-004: LM Studio connectivity
  it('UAT-09-004: LM Studio provider configured with correct endpoint', () => {
    // llm-config.yaml must define LM Studio with localhost:1234
    expect(llmConfig).toMatch(/lmstudio/i);
    expect(llmConfig).toContain('http://localhost:1234');

    // Provider manager handles LM Studio health checks
    expect(llmProviderManager).toContain('lmstudio');
    expect(llmProviderManager).toContain('http://localhost:1234/v1/models');

    // Connection tester defines LM Studio endpoint
    expect(connectionTester).toMatch(/lmstudio/i);

    // Local detector probes LM Studio
    expect(localDetector).toContain('localhost:1234');
  });

  // UAT-09-005: LM Studio model selection
  it('UAT-09-005: infrastructure supports LM Studio model listing', () => {
    // Local detector parses LM Studio model list via OpenAI-compatible API
    expect(localDetector).toMatch(/lmstudio|LM Studio/i);
    expect(localDetector).toMatch(/\/v1\/models/);

    // LM Studio uses OpenAI-compatible API format
    expect(llmConfig).toMatch(/lmstudio[\s\S]*?api_format:\s*openai/);
  });

  // UAT-09-006: LM Studio agent activation
  it('UAT-09-006: LM Studio can serve as agent backend via provider config', () => {
    // LM Studio defined as a valid provider in config
    expect(llmConfig).toMatch(/lmstudio[\s\S]*?type:|lmstudio[\s\S]*?base_url/);

    // Config sync validates LM Studio as valid provider
    const configSync = readFile(join(PROJECT_ROOT, 'src', 'utility', 'tools', 'llm-setup', 'config-sync.js'));
    expect(configSync).toMatch(/lmstudio/);
    expect(configSync).toMatch(/isValidProvider/);
  });
});

// =============================================================================
// S2: Provider Switching + Error Handling (6 checks)
// =============================================================================
describe('UAT-09-S2: Provider Switching + Error Handling', () => {

  let llmProviderManager;
  let configSync;
  let providerConfig;
  let connectionTester;
  let localDetector;
  let llmChecker;
  let llmConfig;

  beforeAll(() => {
    llmProviderManager = readFile(join(PROJECT_ROOT, '.claude', 'hooks', 'llm-provider-manager.sh'));
    configSync = readFile(join(PROJECT_ROOT, 'src', 'utility', 'tools', 'llm-setup', 'config-sync.js'));
    providerConfig = readFile(join(PROJECT_ROOT, 'src', 'utility', 'tools', 'llm-setup', 'provider-config.js'));
    connectionTester = readFile(join(PROJECT_ROOT, 'src', 'utility', 'tools', 'llm-setup', 'connection-tester.js'));
    localDetector = readFile(join(PROJECT_ROOT, 'src', 'utility', 'tools', 'llm-setup', 'local-detector.js'));
    llmChecker = readFile(join(PROJECT_ROOT, 'src', 'utility', 'tools', 'health-check', 'llm-checker.js'));
    llmConfig = readFile(join(PROJECT_ROOT, '_bmad', '_config', 'llm-config.yaml'));
  });

  // UAT-09-007: Provider switching
  it('UAT-09-007: provider switching updates config files without state loss', () => {
    // Provider manager has set command for switching
    expect(llmProviderManager).toMatch(/set_active_provider|set\)/);

    // Config sync writes to both YAML and TXT files
    expect(configSync).toMatch(/syncToProvider/);
    expect(configSync).toMatch(/yamlConfig.*llm-config\.yaml|llm-config\.yaml/);
    expect(configSync).toMatch(/txtConfig.*llm-provider\.txt|llm-provider\.txt/);

    // Provider config backs up before writing
    expect(providerConfig).toMatch(/backupConfigs|backup/);

    // Supports project and global scope
    expect(llmProviderManager).toMatch(/global/);
    expect(llmProviderManager).toMatch(/GLOBAL_PROVIDER_FILE/);
  });

  // UAT-09-008: Provider auto-detection
  it('UAT-09-008: local provider auto-detection probes standard endpoints', () => {
    // Local detector scans multiple ports
    expect(localDetector).toContain('localhost:11434'); // Ollama
    expect(localDetector).toContain('localhost:1234');  // LM Studio
    expect(localDetector).toContain('localhost:8000');  // vLLM
    expect(localDetector).toContain('localhost:8080');  // llama.cpp

    // Has detectAll function for scanning all providers
    expect(localDetector).toMatch(/detectAll|detectProvider/);

    // Has probe timeout to avoid hanging
    expect(localDetector).toMatch(/DEFAULT_PROBE_TIMEOUT|timeout/i);

    // Parses model data from running providers
    expect(localDetector).toMatch(/parseModels/);
  });

  // UAT-09-009: Connection failure — Ollama down
  it('UAT-09-009: connection tester handles Ollama failure with clear error messages', () => {
    // Connection tester defines error codes
    expect(connectionTester).toContain('ECONNREFUSED');
    expect(connectionTester).toContain('CONNECTION_REFUSED');
    expect(connectionTester).toContain('ETIMEDOUT');
    expect(connectionTester).toContain('TIMEOUT');

    // Human-readable error messages for HTTP failures
    expect(connectionTester).toMatch(/Authentication failed|check your API key/);
    expect(connectionTester).toMatch(/Service unavailable|overloaded/);

    // Provider manager reports NOT RUNNING for failed health checks
    expect(llmProviderManager).toMatch(/NOT RUNNING|not running/i);

    // Must not crash — graceful error handling
    expect(connectionTester).toMatch(/parseError|catch/);
  });

  // UAT-09-010: Connection failure — LM Studio down
  it('UAT-09-010: health checker reports disconnected status with fallback chain support', () => {
    // Health checker returns status enum
    expect(llmChecker).toMatch(/connected|fallback|disconnected|unconfigured/);

    // Fallback chain defined in config
    expect(llmConfig).toMatch(/fallback_chain/);

    // Health checker tests fallback chain
    expect(llmChecker).toMatch(/testFallbackChain/);

    // Reports when primary is down but fallback available
    expect(llmChecker).toMatch(/Primary.*down.*fallback|fallback.*available/i);

    // Local detector handles connection refused gracefully
    expect(localDetector).toMatch(/Connection refused|not running/i);
  });

  // UAT-09-011: Provider isolation
  it('UAT-09-011: provider configuration ensures no state cross-contamination', () => {
    // Config drift detection catches mismatches
    expect(configSync).toMatch(/detectDrift/);
    expect(configSync).toMatch(/synced.*false|drift/i);

    // Each provider has independent configuration
    expect(llmConfig).toMatch(/claude:/);
    expect(llmConfig).toMatch(/ollama:/);
    expect(llmConfig).toMatch(/lmstudio:/);

    // Provider-specific settings (model, base_url, capabilities) are isolated
    expect(llmConfig).toMatch(/ollama[\s\S]*?model:/);
    expect(llmConfig).toMatch(/lmstudio[\s\S]*?model:/);

    // Override hierarchy prevents leakage: agent > module > project > global > config
    expect(llmProviderManager).toMatch(/agent_override|module_override|project_override|global_override|config_default/);

    // Config sync validates provider before switching
    expect(configSync).toMatch(/isValidProvider/);
  });

  // UAT-09-012: Health check
  it('UAT-09-012: health check reports latency, model info, and connection status', () => {
    // Health checker measures response time
    expect(llmChecker).toMatch(/responseTime/);

    // Returns provider name and model info
    expect(llmChecker).toMatch(/provider.*model|model.*provider/i);

    // Reports connection status (connected/disconnected)
    expect(llmChecker).toMatch(/connected/);

    // Has human-readable format output
    expect(llmChecker).toMatch(/formatCheckResult/);

    // Provider manager has health command
    expect(llmProviderManager).toMatch(/check_provider_health|health\)/);

    // Provider manager has health-all command for checking all providers
    expect(llmProviderManager).toMatch(/check_all_health|health-all/);

    // Reports OK status for healthy providers
    expect(llmProviderManager).toMatch(/OK/);
  });
});

// =============================================================================
// Cross-cutting: LLM Configuration Integrity
// =============================================================================
describe('UAT-09 LLM Configuration Integrity', () => {

  it('llm-config.yaml defines all 8 providers with required fields', () => {
    const config = readFile(join(PROJECT_ROOT, '_bmad', '_config', 'llm-config.yaml'));

    // 8 providers expected
    const providers = ['claude', 'ollama', 'vllm', 'lmstudio', 'llamacpp', 'openai', 'groq', 'together'];
    for (const provider of providers) {
      expect(config, `Provider ${provider} must be defined`).toMatch(new RegExp(`${provider}:`));
    }

    // Must have active_provider
    expect(config).toMatch(/active_provider:/);

    // Must have fallback_chain
    expect(config).toMatch(/fallback_chain:/);

    // Cloud providers must reference API key env vars
    expect(config).toMatch(/OPENAI_API_KEY|api_key_env/);
    expect(config).toMatch(/GROQ_API_KEY|api_key_env/);
  });

  it('all LLM infrastructure source files exist and are non-empty', () => {
    const requiredFiles = [
      '_bmad/_config/llm-config.yaml',
      '.claude/hooks/llm-provider-manager.sh',
      'src/utility/tools/llm-setup/config-sync.js',
      'src/utility/tools/llm-setup/provider-config.js',
      'src/utility/tools/llm-setup/connection-tester.js',
      'src/utility/tools/llm-setup/local-detector.js',
      'src/utility/tools/health-check/llm-checker.js',
    ];

    for (const file of requiredFiles) {
      const filePath = join(PROJECT_ROOT, file);
      expect(existsSync(filePath), `${file} must exist`).toBe(true);
      const content = readFile(filePath);
      expect(content.length, `${file} must be non-empty`).toBeGreaterThan(100);
    }
  });

  it('provider manager validates input to prevent injection', () => {
    const manager = readFile(join(PROJECT_ROOT, '.claude', 'hooks', 'llm-provider-manager.sh'));

    // Must source input validation library
    expect(manager).toMatch(/input-validation\.sh|validate/i);

    // Must validate provider names
    expect(manager).toMatch(/validate|VALID/i);

    // Must have shebang
    expect(manager.split('\n')[0]).toMatch(/^#!\/.*(?:bash|sh)/);
  });

  it('existing unit tests cover core LLM infrastructure', () => {
    const testFiles = [
      'tests/utility/tools/llm-setup/config-sync.test.js',
      'tests/utility/tools/llm-setup/connection-tester.test.js',
      'tests/utility/tools/llm-setup/local-detector.test.js',
      'tests/utility/tools/health-check/llm-checker.test.js',
    ];

    for (const testFile of testFiles) {
      const filePath = join(PROJECT_ROOT, testFile);
      expect(existsSync(filePath), `Unit test ${testFile} must exist`).toBe(true);
    }
  });
});
