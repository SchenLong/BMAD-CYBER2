/**
 * Tests for outside-repo guard
 */

import { describe, it, expect } from 'vitest';
import {
  extractPathsFromCommand,
  detectUnsafeSubstitutions,
  checkBashCommand,
  checkFilePath,
} from '../../.claude/validators-node/src/guards/outside-repo.js';

describe('extractPathsFromCommand', () => {
  describe('file read operations', () => {
    it('should extract paths from cat command', () => {
      const paths = extractPathsFromCommand('cat /etc/passwd');
      expect(paths).toContainEqual({ path: '/etc/passwd', operation: 'read' });
    });

    it('should extract paths from head command without options', () => {
      const paths = extractPathsFromCommand('head /var/log/syslog');
      expect(paths).toContainEqual({ path: '/var/log/syslog', operation: 'read' });
    });

    it('should extract paths from tail command without options', () => {
      const paths = extractPathsFromCommand('tail /var/log/messages');
      expect(paths).toContainEqual({ path: '/var/log/messages', operation: 'read' });
    });
  });

  describe('file modification operations', () => {
    it('should extract paths from rm command', () => {
      const paths = extractPathsFromCommand('rm -rf /tmp/test');
      expect(paths).toContainEqual({ path: '/tmp/test', operation: 'delete' });
    });

    it('should extract both paths from cp command', () => {
      const paths = extractPathsFromCommand('cp /source/file /dest/file');
      expect(paths).toContainEqual({ path: '/source/file', operation: 'copy' });
      expect(paths).toContainEqual({ path: '/dest/file', operation: 'copy' });
    });

    it('should extract both paths from mv command', () => {
      const paths = extractPathsFromCommand('mv /old/path /new/path');
      expect(paths).toContainEqual({ path: '/old/path', operation: 'move' });
      expect(paths).toContainEqual({ path: '/new/path', operation: 'move' });
    });

    it('should extract paths from mkdir and touch', () => {
      const paths1 = extractPathsFromCommand('mkdir -p /new/directory');
      expect(paths1).toContainEqual({ path: '/new/directory', operation: 'create' });

      const paths2 = extractPathsFromCommand('touch /new/file.txt');
      expect(paths2).toContainEqual({ path: '/new/file.txt', operation: 'create' });
    });
  });

  describe('directory navigation', () => {
    it('should extract paths from cd command', () => {
      const paths = extractPathsFromCommand('cd /etc');
      expect(paths).toContainEqual({ path: '/etc', operation: 'navigate' });
    });
  });

  describe('editor operations', () => {
    it('should extract paths from vim command', () => {
      const paths = extractPathsFromCommand('vim /etc/hosts');
      expect(paths).toContainEqual({ path: '/etc/hosts', operation: 'edit' });
    });

    it('should extract paths from nano command', () => {
      const paths = extractPathsFromCommand('nano /etc/config');
      expect(paths).toContainEqual({ path: '/etc/config', operation: 'edit' });
    });
  });

  describe('I/O redirection', () => {
    it('should extract paths from output redirection', () => {
      const paths = extractPathsFromCommand('echo "test" > /tmp/output.txt');
      expect(paths).toContainEqual({ path: '/tmp/output.txt', operation: 'write' });
    });

    it('should extract paths from append redirection', () => {
      const paths = extractPathsFromCommand('echo "test" >> /var/log/app.log');
      expect(paths).toContainEqual({ path: '/var/log/app.log', operation: 'append' });
    });
  });

  describe('edge cases', () => {
    it('should skip flags', () => {
      const paths = extractPathsFromCommand('rm -rf --force /tmp/test');
      expect(paths.map(p => p.path)).not.toContain('-rf');
      expect(paths.map(p => p.path)).not.toContain('--force');
    });

    it('should skip command substitutions', () => {
      const paths = extractPathsFromCommand('cat $(find .)');
      expect(paths.map(p => p.path)).not.toContain('$(find');
    });

    it('should skip variable references', () => {
      const paths = extractPathsFromCommand('cat $HOME/file');
      expect(paths.map(p => p.path)).not.toContain('$HOME/file');
    });
  });
});

describe('detectUnsafeSubstitutions', () => {
  it('should detect $() command substitution', () => {
    const subs = detectUnsafeSubstitutions('cat $(find /etc -name "*.conf")');
    expect(subs).toContain('$(find /etc -name "*.conf")');
  });

  it('should detect backtick substitution', () => {
    const subs = detectUnsafeSubstitutions('cat `ls /etc`');
    expect(subs).toContain('`ls /etc`');
  });

  it('should allow safe substitutions', () => {
    expect(detectUnsafeSubstitutions('echo $(date)')).toEqual([]);
    expect(detectUnsafeSubstitutions('echo $(pwd)')).toEqual([]);
    expect(detectUnsafeSubstitutions('echo $(whoami)')).toEqual([]);
    expect(detectUnsafeSubstitutions('echo $(hostname)')).toEqual([]);
  });

  it('should allow safe variable references', () => {
    expect(detectUnsafeSubstitutions('echo $HOME')).toEqual([]);
    expect(detectUnsafeSubstitutions('echo $PWD')).toEqual([]);
    expect(detectUnsafeSubstitutions('echo ${USER}')).toEqual([]);
  });
});

describe('checkBashCommand', () => {
  const projectDir = process.cwd();

  it('should allow commands within repo', () => {
    const result = checkBashCommand('cat ./src/index.ts', projectDir);
    expect(result.isViolation).toBe(false);
  });

  it('should block commands outside repo', () => {
    const result = checkBashCommand('cat /etc/passwd', projectDir);
    expect(result.isViolation).toBe(true);
    expect(result.isAbsolute).toBe(false);
  });

  it('should absolute block rm outside repo', () => {
    const result = checkBashCommand('rm -rf /tmp/dangerous', projectDir);
    expect(result.isViolation).toBe(true);
    expect(result.isAbsolute).toBe(true);
  });

  it('should block unsafe substitutions', () => {
    const result = checkBashCommand('cat $(find /etc)', projectDir);
    expect(result.isViolation).toBe(true);
    expect(result.substitutions.length).toBeGreaterThan(0);
  });
});

describe('checkFilePath', () => {
  const projectDir = process.cwd();

  it('should allow paths within repo', () => {
    const result = checkFilePath('./src/index.ts', projectDir);
    expect(result.isViolation).toBe(false);
  });

  it('should block paths outside repo', () => {
    const result = checkFilePath('/etc/passwd', projectDir);
    expect(result.isViolation).toBe(true);
  });

  it('should handle empty path', () => {
    const result = checkFilePath('', projectDir);
    expect(result.isViolation).toBe(false);
  });
});
