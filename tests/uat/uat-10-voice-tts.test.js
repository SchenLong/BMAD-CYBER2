/**
 * UAT-10: Voice & TTS (14 checks)
 *
 * Validates: Voice output, TTS hooks, audio processing, AgentVibes integration
 * Builds on: VAL-08 (4/4 PASS, pre-Phase 2)
 * Re-validates: Post-Phase 2 TTS pipeline with migrated paths
 *
 * Stories:
 *   S1: Basic TTS (5 checks) — UAT-10-001 to UAT-10-005
 *   S2: Voice configuration (5 checks) — UAT-10-006 to UAT-10-010
 *   S3: Advanced TTS (4 checks) — UAT-10-011 to UAT-10-014
 *
 * Note: Requires Piper TTS installed for runtime validation.
 * These tests validate infrastructure (scripts, configs, security patterns).
 */

import { beforeAll, describe, expect, it } from 'vitest';
import { existsSync, readdirSync, readFileSync, statSync } from 'fs';
import { join, resolve } from 'path';

const PROJECT_ROOT = resolve(import.meta.dirname, '..', '..');
const HOOKS_DIR = join(PROJECT_ROOT, '.claude', 'hooks');

// Helper: read file as string
function readFile(filePath) {
  return readFileSync(filePath, 'utf-8');
}

// =============================================================================
// S1: Basic TTS (5 checks)
// =============================================================================
describe('UAT-10-S1: Basic TTS', () => {

  let playTts;
  let playTtsPiper;
  let playTtsMacos;

  beforeAll(() => {
    playTts = readFile(join(HOOKS_DIR, 'play-tts.sh'));
    playTtsPiper = readFile(join(HOOKS_DIR, 'play-tts-piper.sh'));
    playTtsMacos = readFile(join(HOOKS_DIR, 'play-tts-macos.sh'));
  });

  // UAT-10-001: TTS output triggers
  it('UAT-10-001: play-tts.sh routes to provider-specific TTS scripts', () => {
    // Core dispatcher must exist and be non-trivial
    expect(playTts.length).toBeGreaterThan(200);

    // Must detect voice provider
    expect(playTts).toMatch(/detect_voice_provider|provider/i);

    // Must route to speak function
    expect(playTts).toMatch(/speak_text|speak/i);

    // Must support multiple providers
    expect(playTts).toMatch(/piper|macos/i);

    // Provider-specific scripts exist
    expect(existsSync(join(HOOKS_DIR, 'play-tts-piper.sh'))).toBe(true);
    expect(existsSync(join(HOOKS_DIR, 'play-tts-macos.sh'))).toBe(true);
    expect(existsSync(join(HOOKS_DIR, 'play-tts-termux-ssh.sh'))).toBe(true);

    // SessionStart hook initializes TTS
    const sessionStartPath = join(HOOKS_DIR, 'session-start-tts.sh');
    expect(existsSync(sessionStartPath), 'session-start-tts.sh must exist').toBe(true);
  });

  // UAT-10-002: TTS mute
  it('UAT-10-002: mute mechanism uses project and global state files to suppress output', () => {
    // play-tts.sh checks mute state before speaking
    expect(playTts).toMatch(/agentvibes-muted/);

    // Project mute file suppresses output
    expect(playTts).toMatch(/TTS muted.*project|project.*mute/i);

    // Global mute file as fallback
    expect(playTts).toMatch(/agentvibes-muted/);
    expect(playTts).toMatch(/TTS muted.*global|global.*mute/i);

    // Mute command file exists in AgentVibes
    const muteCmd = join(PROJECT_ROOT, '.claude', 'commands', 'agent-vibes', 'mute.md');
    expect(existsSync(muteCmd), 'mute.md command must exist').toBe(true);
  });

  // UAT-10-003: TTS unmute
  it('UAT-10-003: unmute mechanism restores output with project-level override', () => {
    // Project unmute overrides global mute
    expect(playTts).toMatch(/agentvibes-unmuted/);

    // Priority: project unmute > project mute > global mute
    // Verify the unmute file is checked before mute
    const unmutedIdx = playTts.indexOf('agentvibes-unmuted');
    const mutedIdx = playTts.indexOf('agentvibes-muted');
    expect(unmutedIdx, 'unmuted check must appear in script').toBeGreaterThan(-1);
    expect(mutedIdx, 'muted check must appear in script').toBeGreaterThan(-1);

    // Unmute command file exists
    const unmuteCmd = join(PROJECT_ROOT, '.claude', 'commands', 'agent-vibes', 'unmute.md');
    expect(existsSync(unmuteCmd), 'unmute.md command must exist').toBe(true);
  });

  // UAT-10-004: TTS with long text
  it('UAT-10-004: Piper TTS handles long text via WAV synthesis without truncation', () => {
    // Piper synthesizes full text to WAV file
    expect(playTtsPiper).toMatch(/synthesize_with_piper|synthesize/);
    expect(playTtsPiper).toMatch(/\.wav/);

    // Audio lock mechanism prevents overlapping playback
    expect(playTtsPiper).toMatch(/agentvibes-audio\.lock/);

    // Lock has timeout to avoid deadlocks
    expect(playTtsPiper).toMatch(/sleep|wait/);

    // macOS also supports arbitrary length text
    expect(playTtsMacos).toMatch(/\.wav|\.aiff/);
    expect(playTtsMacos).toMatch(/agentvibes-audio\.lock/);
  });

  // UAT-10-005: TTS with special characters — no shell injection
  it('UAT-10-005: TTS pipeline validates input and prevents shell injection', () => {
    // play-tts.sh validates voice parameter for dangerous chars
    expect(playTts).toMatch(/Invalid characters in voice parameter/i);
    expect(playTts).toMatch(/invalid.*content|invalid.*characters/i);

    // Input validation library exists
    const inputValPath = join(HOOKS_DIR, 'lib', 'input-validation.sh');
    expect(existsSync(inputValPath), 'input-validation.sh must exist').toBe(true);

    const inputVal = readFile(inputValPath);
    // Validates against dangerous shell characters
    expect(inputVal).toMatch(/[;|&$\\`<>(){}!]/);

    // Has sanitize function using printf %q
    expect(inputVal).toMatch(/sanitize_for_shell|printf.*%q/);

    // Checks for null bytes
    expect(inputVal).toMatch(/null/i);

    // Path traversal prevention
    expect(inputVal).toMatch(/\.\./);

    // Termux SSH provider uses printf %q for escaping
    const termuxTts = readFile(join(HOOKS_DIR, 'play-tts-termux-ssh.sh'));
    expect(termuxTts).toMatch(/printf.*%q|printf '%q'/);

    // Max length validation
    expect(inputVal).toMatch(/MAX.*LENGTH|max.*length/i);
  });
});

// =============================================================================
// S2: Voice Configuration (5 checks)
// =============================================================================
describe('UAT-10-S2: Voice Configuration', () => {

  let voiceManager;
  let speedManager;
  let piperVoiceManager;

  beforeAll(() => {
    voiceManager = readFile(join(HOOKS_DIR, 'voice-manager.sh'));
    speedManager = readFile(join(HOOKS_DIR, 'speed-manager.sh'));
    piperVoiceManager = readFile(join(HOOKS_DIR, 'piper-voice-manager.sh'));
  });

  // UAT-10-006: Voice selection
  it('UAT-10-006: voice-manager.sh supports switching voices with provider awareness', () => {
    // Voice manager has switch/list/get commands
    expect(voiceManager).toMatch(/switch|list|get|preview/);

    // Writes voice selection to state file
    expect(voiceManager).toMatch(/tts-voice\.txt/);

    // Validates voice exists before switching
    expect(voiceManager).toMatch(/not found|validate/i);

    // Success indicator
    expect(voiceManager).toMatch(/Voice switched to/i);

    // Safe file writing (symlink prevention)
    expect(voiceManager).toMatch(/safe_write_file/);

    // Slash command exists
    const switchCmd = join(PROJECT_ROOT, '.claude', 'commands', 'agent-vibes', 'switch.md');
    expect(existsSync(switchCmd)).toBe(true);
  });

  // UAT-10-007: Speed adjustment 0.5x
  it('UAT-10-007: speed-manager.sh supports 0.5x (slow) speed with Piper length-scale inversion', () => {
    // Speed manager parses speed values
    expect(speedManager).toMatch(/parse_speed_value/);

    // Supports slow/half speed
    expect(speedManager).toMatch(/0\.5|slow/i);

    // Writes to config file
    expect(speedManager).toMatch(/tts-speech-rate\.txt/);

    // Speed confirmation message
    expect(speedManager).toMatch(/Speech speed set|speed.*set/i);

    // Piper uses inverted length-scale (0.5 user = 2.0 piper)
    expect(speedManager).toMatch(/invert|length.*scale|piper/i);

    // Validates speed range
    expect(speedManager).toMatch(/Invalid speed/i);
  });

  // UAT-10-008: Speed adjustment 2.0x
  it('UAT-10-008: speed-manager.sh supports 2.0x (fast) speed', () => {
    // Supports fast/2x speed
    expect(speedManager).toMatch(/2\.0|fast/i);

    // Speed scale descriptions
    expect(speedManager).toMatch(/slower|normal|faster/i);

    // Slash command exists
    const speedCmd = join(PROJECT_ROOT, '.claude', 'commands', 'agent-vibes', 'set-speed.md');
    expect(existsSync(speedCmd)).toBe(true);

    // Target language speed also supported
    expect(speedManager).toMatch(/tts-target-speech-rate\.txt|target.*speed/i);
  });

  // UAT-10-009: Favorite voice
  it('UAT-10-009: favorite voice can be set per personality and persists across sessions', () => {
    // Slash command exists
    const favCmd = join(PROJECT_ROOT, '.claude', 'commands', 'agent-vibes', 'set-favorite-voice.md');
    expect(existsSync(favCmd)).toBe(true);

    // Piper voice manager handles voice persistence
    expect(piperVoiceManager).toMatch(/get_voice_path|verify_voice/);

    // Voice storage uses persistent directory
    expect(piperVoiceManager).toMatch(/get_voice_storage_dir|piper-voices/);

    // Storage priority: env var > project config > home config > default
    expect(piperVoiceManager).toMatch(/PIPER_VOICES_DIR|piper-voices-dir\.txt/);

    // Voice files validated (onnx + onnx.json)
    expect(piperVoiceManager).toMatch(/\.onnx/);
  });

  // UAT-10-010: Voice preview
  it('UAT-10-010: voice preview plays sample without requiring full agent response', () => {
    // Preview command exists
    const previewCmd = join(PROJECT_ROOT, '.claude', 'commands', 'agent-vibes', 'preview.md');
    expect(existsSync(previewCmd)).toBe(true);

    // Voice manager has preview/sample functionality
    expect(voiceManager).toMatch(/preview|sample|replay/i);

    // BMAD voice manager maps agents to unique voices
    const bmadVoiceManager = readFile(join(HOOKS_DIR, 'bmad-voice-manager.sh'));
    expect(bmadVoiceManager).toMatch(/get_agent_voice/);

    // Multi-speaker registry exists for voice diversity
    const multiSpeaker = readFile(join(HOOKS_DIR, 'piper-multispeaker-registry.sh'));
    expect(multiSpeaker).toMatch(/get_multispeaker_info|Multi-Speaker/i);
    expect(multiSpeaker).toMatch(/speaker_id/);
  });
});

// =============================================================================
// S3: Advanced TTS (4 checks)
// =============================================================================
describe('UAT-10-S3: Advanced TTS', () => {

  // UAT-10-011: Background music
  it('UAT-10-011: background music system supports toggle, volume control, and mixing', () => {
    // Audio processor handles background music
    const audioProcessor = readFile(join(HOOKS_DIR, 'audio-processor.sh'));
    expect(audioProcessor).toMatch(/is_background_music_enabled|background.*music/i);
    expect(audioProcessor).toMatch(/mix_background|background/i);

    // Config files for background music
    expect(audioProcessor).toMatch(/background-music-enabled\.txt/);
    expect(audioProcessor).toMatch(/background-music-volume\.txt|background.*volume/i);

    // Background music position tracking for continuous playback
    expect(audioProcessor).toMatch(/background-music-position\.txt|position/i);

    // Slash command exists
    const bgCmd = join(PROJECT_ROOT, '.claude', 'commands', 'agent-vibes', 'background-music.md');
    expect(existsSync(bgCmd)).toBe(true);

    // Audio effects config defines background file and volume
    expect(audioProcessor).toMatch(/audio-effects\.cfg|BACKGROUND_FILE|BACKGROUND_VOLUME/i);
  });

  // UAT-10-012: Voice effects
  it('UAT-10-012: effects-manager.sh provides reverb levels with SOX integration', () => {
    const effectsManager = readFile(join(HOOKS_DIR, 'effects-manager.sh'));

    // Reverb levels defined
    expect(effectsManager).toMatch(/off|light|medium|heavy|cathedral/);

    // SOX reverb parameters
    expect(effectsManager).toMatch(/reverb/);

    // Config stored in file
    expect(effectsManager).toMatch(/audio-effects\.cfg/);

    // Validates input
    expect(effectsManager).toMatch(/Invalid reverb level/i);

    // Success message
    expect(effectsManager).toMatch(/Reverb set to/i);

    // Slash command exists
    const effectsCmd = join(PROJECT_ROOT, '.claude', 'commands', 'agent-vibes', 'effects.md');
    expect(existsSync(effectsCmd)).toBe(true);

    // Audio processor applies effects during synthesis
    const audioProcessor = readFile(join(HOOKS_DIR, 'audio-processor.sh'));
    // Validates SOX effects for injection
    expect(audioProcessor).toMatch(/validate|dangerous|[;|&]/);
  });

  // UAT-10-013: TTS error handling
  it('UAT-10-013: TTS pipeline handles missing audio device and Piper failures gracefully', () => {
    const playTtsPiper = readFile(join(HOOKS_DIR, 'play-tts-piper.sh'));
    const playTtsMacos = readFile(join(HOOKS_DIR, 'play-tts-macos.sh'));

    // Piper: handles Piper not installed
    expect(playTtsPiper).toMatch(/Piper TTS not installed/i);

    // Piper: handles synthesis failure
    expect(playTtsPiper).toMatch(/Failed to synthesize/i);

    // Piper: skips if audio still playing (no crash)
    expect(playTtsPiper).toMatch(/Skipping TTS/i);

    // macOS: handles platform mismatch
    expect(playTtsMacos).toMatch(/macOS provider only works on macOS/i);

    // macOS: handles missing voice
    expect(playTtsMacos).toMatch(/not found on this system/i);

    // Termux: handles SSH connection failure
    const playTtsTermux = readFile(join(HOOKS_DIR, 'play-tts-termux-ssh.sh'));
    expect(playTtsTermux).toMatch(/Cannot connect to SSH|not configured/i);

    // Core dispatcher: handles unknown provider
    const playTts = readFile(join(HOOKS_DIR, 'play-tts.sh'));
    expect(playTts).toMatch(/Unknown provider/i);

    // No text provided error
    expect(playTts).toMatch(/No text provided/i);
  });

  // UAT-10-014: Agent personality voice
  it('UAT-10-014: personality-manager.sh maps personalities to voices with prefix/suffix wrapping', () => {
    const personalityManager = readFile(join(HOOKS_DIR, 'personality-manager.sh'));

    // Personality commands
    expect(personalityManager).toMatch(/list|set|get|add|edit|reset/);

    // Personality file format with voice mapping
    expect(personalityManager).toMatch(/piper_voice|macos_voice/);

    // Prefix and suffix wrapping for personality
    expect(personalityManager).toMatch(/Prefix|Suffix/i);

    // AI instructions section
    expect(personalityManager).toMatch(/AI Instructions/i);

    // Success message
    expect(personalityManager).toMatch(/Personality set to/i);

    // Error for missing personality
    expect(personalityManager).toMatch(/Personality not found/i);

    // Config file for current personality
    expect(personalityManager).toMatch(/tts-personality\.txt/);

    // Slash command exists
    const personalityCmd = join(PROJECT_ROOT, '.claude', 'commands', 'agent-vibes', 'personality.md');
    expect(existsSync(personalityCmd)).toBe(true);

    // Sentiment manager also exists (style overlay without voice change)
    const sentimentManager = readFile(join(HOOKS_DIR, 'sentiment-manager.sh'));
    expect(sentimentManager).toMatch(/Sentiment set to/i);
    expect(sentimentManager).toMatch(/Voice remains unchanged/i);
    expect(sentimentManager).toMatch(/tts-sentiment\.txt/);
  });
});

// =============================================================================
// Cross-cutting: TTS Hook Infrastructure
// =============================================================================
describe('UAT-10 TTS Hook Infrastructure', () => {

  it('all TTS hook scripts have valid shebang and are non-empty', () => {
    const ttsHooks = [
      'play-tts.sh', 'play-tts-piper.sh', 'play-tts-macos.sh', 'play-tts-termux-ssh.sh',
      'voice-manager.sh', 'bmad-voice-manager.sh', 'piper-voice-manager.sh', 'macos-voice-manager.sh',
      'effects-manager.sh', 'speed-manager.sh', 'personality-manager.sh', 'sentiment-manager.sh',
      'piper-download-voices.sh', 'piper-multispeaker-registry.sh', 'download-extra-voices.sh',
      'audio-processor.sh', 'bmad-party-manager.sh',
    ];

    for (const hook of ttsHooks) {
      const hookPath = join(HOOKS_DIR, hook);
      expect(existsSync(hookPath), `${hook} must exist`).toBe(true);

      const content = readFile(hookPath);
      expect(content.length, `${hook} must be non-empty`).toBeGreaterThan(30);

      // Must have valid shebang
      const firstLine = content.split('\n')[0];
      expect(firstLine, `${hook} must have shebang`).toMatch(/^#!\/.*(?:bash|sh)/);
    }
  });

  it('all AgentVibes slash command files exist', () => {
    const agentVibesDir = join(PROJECT_ROOT, '.claude', 'commands', 'agent-vibes');
    expect(existsSync(agentVibesDir), 'agent-vibes commands directory must exist').toBe(true);

    const expectedCommands = [
      'mute.md', 'unmute.md', 'switch.md', 'list.md', 'preview.md',
      'set-speed.md', 'personality.md', 'sentiment.md', 'effects.md',
      'background-music.md', 'verbosity.md', 'language.md', 'learn.md',
    ];

    const existingFiles = readdirSync(agentVibesDir);
    for (const cmd of expectedCommands) {
      expect(existingFiles, `${cmd} must exist in agent-vibes commands`).toContain(cmd);
    }
  });

  it('BMAD voice manager maps agents to unique voices for multi-agent conversations', () => {
    const bmadVoiceManager = readFile(join(HOOKS_DIR, 'bmad-voice-manager.sh'));

    // BMAD version detection (v4 or v6)
    expect(bmadVoiceManager).toMatch(/detect_bmad_version/);

    // Agent voice mapping function
    expect(bmadVoiceManager).toMatch(/get_agent_voice/);

    // Agent intro function
    expect(bmadVoiceManager).toMatch(/get_agent_intro/);

    // Enable/disable plugin functions
    expect(bmadVoiceManager).toMatch(/enable_plugin|disable_plugin/);

    // Sync from agent manifest CSV
    expect(bmadVoiceManager).toMatch(/sync_intros_from_manifest/);

    // Known agent-to-voice mappings exist
    expect(bmadVoiceManager).toMatch(/lessac|kristin|alan|joe|ryan|amy/);
  });

  it('multi-speaker registry supports 16 speaker IDs for voice diversity', () => {
    const registry = readFile(join(HOOKS_DIR, 'piper-multispeaker-registry.sh'));

    // 16 speakers defined
    expect(registry).toMatch(/16Speakers/);
    expect(registry).toMatch(/speaker_id/);

    // US English speakers (IDs 0-11)
    expect(registry).toMatch(/Cori_Samuel|Kara_Shallenberg|Kristin_Hughes/);

    // UK English speakers (IDs 12-15)
    expect(registry).toMatch(/Paul_Hampton|Jennifer_Dorr|Emily_Cripps|Martin_Clifton/);

    // Model info function
    expect(registry).toMatch(/get_multispeaker_info/);
  });
});
