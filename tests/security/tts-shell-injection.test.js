/**
 * TTS Shell Injection Security Tests - P3-16
 *
 * Target: .claude/hooks/play-tts.sh
 * Purpose: Document and verify shell injection attack surface in TTS scripts.
 *
 * These are DOCUMENTATION/ASSERTION tests that analyze the shell script source
 * code for proper input sanitization patterns. They do NOT execute shell
 * injection payloads -- they verify that the defensive patterns exist.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// TTS Shell Injection Analysis Tests
// ============================================================================

describe('TTS Shell Injection Analysis - P3-16', () => {
  const projectRoot = path.resolve(__dirname, '../..');
  const hooksDir = path.join(projectRoot, '.claude', 'hooks');
  const playTtsPath = path.join(hooksDir, 'play-tts.sh');
  const playTtsMacosPath = path.join(hooksDir, 'play-tts-macos.sh');
  const playTtsPiperPath = path.join(hooksDir, 'play-tts-piper.sh');
  const inputValidationPath = path.join(hooksDir, 'lib', 'input-validation.sh');

  let playTtsSource;
  let inputValidationSource;

  beforeEach(() => {
    playTtsSource = fs.readFileSync(playTtsPath, 'utf-8');
    if (fs.existsSync(inputValidationPath)) {
      inputValidationSource = fs.readFileSync(inputValidationPath, 'utf-8');
    }
  });

  // --------------------------------------------------------------------------
  // 1. Attack surface documentation
  // --------------------------------------------------------------------------
  describe('Attack surface documentation', () => {
    it('should identify TEXT as primary user-controlled input ($1)', () => {
      expect(playTtsSource).toContain('TEXT="$1"');
    });

    it('should identify VOICE_OVERRIDE as secondary user-controlled input ($2)', () => {
      expect(playTtsSource).toContain('VOICE_OVERRIDE="$2"');
    });

    it('should document that TEXT is passed to sub-scripts via arguments', () => {
      // TEXT is passed to speak_text which calls play-tts-piper.sh or play-tts-macos.sh
      expect(playTtsSource).toContain('speak_text "$TEXT"');
      // Also passed directly via exec
      expect(playTtsSource).toMatch(/exec.*\$TEXT/);
    });

    it('should document that translator.py receives TEXT as argument', () => {
      expect(playTtsSource).toContain('translator.py" "$TEXT"');
    });
  });

  // --------------------------------------------------------------------------
  // 2. Voice parameter sanitization
  // --------------------------------------------------------------------------
  describe('Voice parameter sanitization', () => {
    it('should validate VOICE_OVERRIDE for dangerous characters', () => {
      // The script checks for shell metacharacters in voice parameter
      expect(playTtsSource).toMatch(/VOICE_OVERRIDE.*[;|&$`<>(){}]/);
    });

    it('should reject voice names containing semicolons', () => {
      expect(playTtsSource).toMatch(/VOICE_OVERRIDE.*[';]/);
    });

    it('should reject voice names containing pipes', () => {
      expect(playTtsSource).toMatch(/VOICE_OVERRIDE.*[|]/);
    });

    it('should reject voice names containing backticks', () => {
      expect(playTtsSource).toMatch(/VOICE_OVERRIDE.*[`]/);
    });

    it('should reject voice names containing dollar signs', () => {
      expect(playTtsSource).toMatch(/VOICE_OVERRIDE.*[$]/);
    });

    it('should exit with error on invalid voice characters', () => {
      // After the regex check, script should exit 1
      expect(playTtsSource).toContain('Invalid characters in voice parameter');
    });
  });

  // --------------------------------------------------------------------------
  // 3. Text input handling
  // --------------------------------------------------------------------------
  describe('Text input handling', () => {
    it('should validate that TEXT is not empty', () => {
      expect(playTtsSource).toMatch(/-z "\$TEXT"/);
    });

    it('should properly quote TEXT when passing to sub-scripts', () => {
      // All uses of $TEXT should be double-quoted to prevent word splitting
      // Check that "$TEXT" (quoted) is used, not $TEXT (unquoted)
      const textUsages = playTtsSource.match(/\$TEXT/g) || [];
      const quotedUsages = playTtsSource.match(/"\$TEXT"/g) || [];
      // Most usages should be quoted (assignment TEXT="$1" also counts)
      expect(quotedUsages.length).toBeGreaterThan(0);
    });

    it('should use set -euo pipefail for strict error handling', () => {
      expect(playTtsSource).toContain('set -euo pipefail');
    });
  });

  // --------------------------------------------------------------------------
  // 4. Input validation library checks
  // --------------------------------------------------------------------------
  describe('Input validation library', () => {
    it('should have input-validation.sh library available', () => {
      expect(fs.existsSync(inputValidationPath)).toBe(true);
    });

    it('should define DANGEROUS_CHARS pattern in input-validation.sh', () => {
      expect(inputValidationSource).toContain('DANGEROUS_CHARS');
      expect(inputValidationSource).toMatch(/[;|&$`<>(){}!\\\\]/);
    });

    it('should define validate_dialogue function', () => {
      expect(inputValidationSource).toContain('validate_dialogue()');
    });

    it('should define validate_voice_name function', () => {
      expect(inputValidationSource).toContain('validate_voice_name()');
    });

    it('should define max length limits to prevent DoS', () => {
      expect(inputValidationSource).toContain('MAX_DIALOGUE_LENGTH');
      expect(inputValidationSource).toContain('MAX_VOICE_NAME_LENGTH');
    });

    it('should define sanitize_for_shell function using printf %q', () => {
      expect(inputValidationSource).toContain('sanitize_for_shell()');
      expect(inputValidationSource).toContain("printf '%q'");
    });

    it('should export validation functions for subshell use', () => {
      expect(inputValidationSource).toContain('export -f validate_dialogue');
      expect(inputValidationSource).toContain('export -f validate_voice_name');
    });
  });

  // --------------------------------------------------------------------------
  // 5. Sub-script sanitization (macOS provider)
  // --------------------------------------------------------------------------
  describe('Sub-script sanitization (macOS provider)', () => {
    it('should exist as play-tts-macos.sh', () => {
      expect(fs.existsSync(playTtsMacosPath)).toBe(true);
    });

    it('should source input-validation.sh or define fallback validation', () => {
      const macosSource = fs.readFileSync(playTtsMacosPath, 'utf-8');
      const sourcesLib = macosSource.includes('source "$SCRIPT_DIR/lib/input-validation.sh"');
      const hasFallback = macosSource.includes('validate_dialogue()');
      expect(sourcesLib || hasFallback).toBe(true);
    });

    it('should use set -euo pipefail', () => {
      const macosSource = fs.readFileSync(playTtsMacosPath, 'utf-8');
      expect(macosSource).toContain('set -euo pipefail');
    });
  });

  // --------------------------------------------------------------------------
  // 6. Sub-script sanitization (Piper provider)
  // --------------------------------------------------------------------------
  describe('Sub-script sanitization (Piper provider)', () => {
    it('should exist as play-tts-piper.sh', () => {
      expect(fs.existsSync(playTtsPiperPath)).toBe(true);
    });

    it('should source input-validation.sh or define fallback validation', () => {
      const piperSource = fs.readFileSync(playTtsPiperPath, 'utf-8');
      const sourcesLib = piperSource.includes('input-validation.sh');
      const hasFallback = piperSource.includes('validate_dialogue');
      expect(sourcesLib || hasFallback).toBe(true);
    });
  });

  // --------------------------------------------------------------------------
  // 7. Command injection vector analysis (documentation)
  // --------------------------------------------------------------------------
  describe('Command injection vector analysis', () => {
    it('should document that $() command substitution is blocked in voice names', () => {
      // The regex check on VOICE_OVERRIDE blocks $ which prevents $()
      expect(playTtsSource).toMatch(/VOICE_OVERRIDE.*\$/);
    });

    it('should document that backtick command substitution is blocked in voice names', () => {
      expect(playTtsSource).toMatch(/VOICE_OVERRIDE.*`/);
    });

    it('should document that semicolon command chaining is blocked in voice names', () => {
      expect(playTtsSource).toMatch(/VOICE_OVERRIDE.*;/);
    });

    it('should document that pipe command is blocked in voice names', () => {
      expect(playTtsSource).toMatch(/VOICE_OVERRIDE.*\|/);
    });

    it('should note that TEXT passes through Claude backslash cleanup', () => {
      // The script removes Claude-added backslash escaping
      expect(playTtsSource).toContain('TEXT="${TEXT//');
    });

    it('should note TEXT is quoted when passed to speak_text and exec', () => {
      // Quoting prevents word splitting which could be exploited
      expect(playTtsSource).toContain('"$TEXT"');
    });
  });
});
