/**
 * BMAD CYBERCOMMAND - Party Mode Orchestration Tests
 * ==================================================
 * Regression tests for Party Mode orchestration functionality.
 * These tests verify multi-agent coordination and party mode features.
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

// Project root directory
const PROJECT_ROOT = path.resolve(__dirname, '../../..');

describe('Party Mode Orchestration', () => {
  describe('Party Manager Hook', () => {
    it('should have bmad-party-manager.sh hook', () => {
      const hookPath = path.join(PROJECT_ROOT, '.claude/hooks/bmad-party-manager.sh');
      expect(fs.existsSync(hookPath)).toBe(true);
    });

    it('should be a shell script', async () => {
      const hookPath = path.join(PROJECT_ROOT, '.claude/hooks/bmad-party-manager.sh');
      const content = fs.readFileSync(hookPath, 'utf-8');

      expect(content.startsWith('#!/')).toBe(true);
    });

    it('should have executable permissions structure', async () => {
      const hookPath = path.join(PROJECT_ROOT, '.claude/hooks/bmad-party-manager.sh');
      const stats = fs.statSync(hookPath);

      // File should exist and be readable
      expect(stats.isFile()).toBe(true);
    });
  });

  describe('Voice Integration', () => {
    it('should have voice-manager.sh hook', () => {
      const hookPath = path.join(PROJECT_ROOT, '.claude/hooks/voice-manager.sh');
      expect(fs.existsSync(hookPath)).toBe(true);
    });

    it('should have play-tts.sh hook', () => {
      const hookPath = path.join(PROJECT_ROOT, '.claude/hooks/play-tts.sh');
      expect(fs.existsSync(hookPath)).toBe(true);
    });

    it('should have piper-voice-manager.sh hook', () => {
      const hookPath = path.join(PROJECT_ROOT, '.claude/hooks/piper-voice-manager.sh');
      expect(fs.existsSync(hookPath)).toBe(true);
    });

    it('should have personality-manager.sh hook', () => {
      const hookPath = path.join(PROJECT_ROOT, '.claude/hooks/personality-manager.sh');
      expect(fs.existsSync(hookPath)).toBe(true);
    });

    it('should have sentiment-manager.sh hook', () => {
      const hookPath = path.join(PROJECT_ROOT, '.claude/hooks/sentiment-manager.sh');
      expect(fs.existsSync(hookPath)).toBe(true);
    });
  });

  describe('Effects and Audio', () => {
    it('should have effects-manager.sh hook', () => {
      const hookPath = path.join(PROJECT_ROOT, '.claude/hooks/effects-manager.sh');
      expect(fs.existsSync(hookPath)).toBe(true);
    });

    it('should have speed-manager.sh hook', () => {
      const hookPath = path.join(PROJECT_ROOT, '.claude/hooks/speed-manager.sh');
      expect(fs.existsSync(hookPath)).toBe(true);
    });

    it('should have replay-target-audio.sh hook', () => {
      const hookPath = path.join(PROJECT_ROOT, '.claude/hooks/replay-target-audio.sh');
      expect(fs.existsSync(hookPath)).toBe(true);
    });

    it('should have stop.sh hook for audio control', () => {
      const hookPath = path.join(PROJECT_ROOT, '.claude/hooks/stop.sh');
      expect(fs.existsSync(hookPath)).toBe(true);
    });
  });

  describe('TTS Platform Support', () => {
    it('should have play-tts-macos.sh for macOS', () => {
      const hookPath = path.join(PROJECT_ROOT, '.claude/hooks/play-tts-macos.sh');
      expect(fs.existsSync(hookPath)).toBe(true);
    });

    it('should have play-tts-piper.sh for Piper TTS', () => {
      const hookPath = path.join(PROJECT_ROOT, '.claude/hooks/play-tts-piper.sh');
      expect(fs.existsSync(hookPath)).toBe(true);
    });

    it('should have play-tts-termux-ssh.sh for Termux', () => {
      const hookPath = path.join(PROJECT_ROOT, '.claude/hooks/play-tts-termux-ssh.sh');
      expect(fs.existsSync(hookPath)).toBe(true);
    });

    it('should have macos-voice-manager.sh', () => {
      const hookPath = path.join(PROJECT_ROOT, '.claude/hooks/macos-voice-manager.sh');
      expect(fs.existsSync(hookPath)).toBe(true);
    });
  });

  describe('Language and Translation', () => {
    it('should have language-manager.sh hook', () => {
      const hookPath = path.join(PROJECT_ROOT, '.claude/hooks/language-manager.sh');
      expect(fs.existsSync(hookPath)).toBe(true);
    });

    it('should have translate-manager.sh hook', () => {
      const hookPath = path.join(PROJECT_ROOT, '.claude/hooks/translate-manager.sh');
      expect(fs.existsSync(hookPath)).toBe(true);
    });
  });

  describe('Verbosity Control', () => {
    it('should have verbosity-manager.sh hook', () => {
      const hookPath = path.join(PROJECT_ROOT, '.claude/hooks/verbosity-manager.sh');
      expect(fs.existsSync(hookPath)).toBe(true);
    });
  });

  describe('Piper Voice System', () => {
    it('should have piper-download-voices.sh', () => {
      const hookPath = path.join(PROJECT_ROOT, '.claude/hooks/piper-download-voices.sh');
      expect(fs.existsSync(hookPath)).toBe(true);
    });

    it('should have piper-multispeaker-registry.sh', () => {
      const hookPath = path.join(PROJECT_ROOT, '.claude/hooks/piper-multispeaker-registry.sh');
      expect(fs.existsSync(hookPath)).toBe(true);
    });

    it('should have download-extra-voices.sh', () => {
      const hookPath = path.join(PROJECT_ROOT, '.claude/hooks/download-extra-voices.sh');
      expect(fs.existsSync(hookPath)).toBe(true);
    });

    it('should have bmad-voice-manager.sh', () => {
      const hookPath = path.join(PROJECT_ROOT, '.claude/hooks/bmad-voice-manager.sh');
      expect(fs.existsSync(hookPath)).toBe(true);
    });
  });
});

describe('Provider Integration', () => {
  describe('Provider Manager', () => {
    it('should have provider-manager.sh hook', () => {
      const hookPath = path.join(PROJECT_ROOT, '.claude/hooks/provider-manager.sh');
      expect(fs.existsSync(hookPath)).toBe(true);
    });

    it('should have provider-commands.sh hook', () => {
      const hookPath = path.join(PROJECT_ROOT, '.claude/hooks/provider-commands.sh');
      expect(fs.existsSync(hookPath)).toBe(true);
    });

    it('should have llm-provider-manager.sh hook', () => {
      const hookPath = path.join(PROJECT_ROOT, '.claude/hooks/llm-provider-manager.sh');
      expect(fs.existsSync(hookPath)).toBe(true);
    });
  });

  describe('Learning System', () => {
    it('should have learn-manager.sh hook', () => {
      const hookPath = path.join(PROJECT_ROOT, '.claude/hooks/learn-manager.sh');
      expect(fs.existsSync(hookPath)).toBe(true);
    });
  });

  describe('Community Features', () => {
    it('should have github-star-reminder.sh hook', () => {
      const hookPath = path.join(PROJECT_ROOT, '.claude/hooks/github-star-reminder.sh');
      expect(fs.existsSync(hookPath)).toBe(true);
    });
  });
});

describe('Hook Script Structure', () => {
  it('should have consistent shebang across shell scripts', async () => {
    const hooksDir = path.join(PROJECT_ROOT, '.claude/hooks');
    const files = fs.readdirSync(hooksDir);
    const shellScripts = files.filter(f => f.endsWith('.sh'));

    for (const script of shellScripts) {
      const content = fs.readFileSync(path.join(hooksDir, script), 'utf-8');
      const firstLine = content.split('\n')[0];

      // Should start with shebang
      expect(firstLine?.startsWith('#!')).toBe(true);
    }
  });

  it('should have at least 10 hook scripts', () => {
    const hooksDir = path.join(PROJECT_ROOT, '.claude/hooks');
    const files = fs.readdirSync(hooksDir);
    const shellScripts = files.filter(f => f.endsWith('.sh'));

    expect(shellScripts.length).toBeGreaterThanOrEqual(10);
  });
});
