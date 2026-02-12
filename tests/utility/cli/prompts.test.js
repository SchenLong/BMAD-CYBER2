/**
 * Tests for the prompts abstraction layer (src/utility/cli/prompts.js)
 *
 * Since @clack/prompts requires TTY interaction, we mock the underlying
 * @clack/prompts and @clack/core modules to test our abstraction logic.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock @clack/prompts before importing our module
const mockClack = {
  select: vi.fn(),
  multiselect: vi.fn(),
  confirm: vi.fn(),
  password: vi.fn(),
  spinner: vi.fn(),
  isCancel: vi.fn(),
  cancel: vi.fn(),
  intro: vi.fn(),
  outro: vi.fn(),
  note: vi.fn(),
  group: vi.fn(),
  log: {
    info: vi.fn(),
    success: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    message: vi.fn(),
    step: vi.fn(),
  },
  limitOptions: vi.fn(),
  S_BAR: '│',
  S_BAR_END: '└',
  S_CHECKBOX_SELECTED: '◼',
  S_CHECKBOX_INACTIVE: '◻',
  symbol: vi.fn(() => '◆'),
};

vi.mock('@clack/prompts', () => mockClack);

// Mock @clack/core
const mockTextPromptInstance = {
  on: vi.fn(),
  prompt: vi.fn(),
  userInput: '',
  value: 'test-input',
  state: 'submit',
  _setUserInput: vi.fn(),
};

const MockTextPrompt = vi.fn(() => mockTextPromptInstance);

vi.mock('@clack/core', () => ({
  TextPrompt: MockTextPrompt,
  AutocompletePrompt: vi.fn(),
}));

// Mock picocolors
vi.mock('picocolors', () => ({
  default: {
    gray: (s) => s,
    dim: (s) => s,
    green: (s) => s,
    red: (s) => s,
    yellow: (s) => s,
    cyan: (s) => s,
    inverse: (s) => s,
    hidden: (s) => s,
    strikethrough: (s) => s,
  },
}));

// Now import our module
const prompts = await import('../../../src/utility/cli/prompts.js');

describe('Prompts Abstraction Layer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockClack.isCancel.mockReturnValue(false);
    prompts.setSilent(false);

    // Reset TextPrompt mock
    mockTextPromptInstance.on.mockReset();
    mockTextPromptInstance.prompt.mockReset();
    mockTextPromptInstance.prompt.mockResolvedValue('test-input');
    MockTextPrompt.mockClear();
    MockTextPrompt.mockImplementation(() => mockTextPromptInstance);
  });

  afterEach(() => {
    prompts.setSilent(false);
  });

  // =====================================================
  // ESM Module Format Verification
  // =====================================================
  describe('ESM module format', () => {
    it('exports all required functions', () => {
      expect(typeof prompts.select).toBe('function');
      expect(typeof prompts.multiselect).toBe('function');
      expect(typeof prompts.confirm).toBe('function');
      expect(typeof prompts.text).toBe('function');
      expect(typeof prompts.password).toBe('function');
      expect(typeof prompts.createSpinner).toBe('function');
      expect(typeof prompts.setSilent).toBe('function');
      expect(typeof prompts.isSilent).toBe('function');
      expect(typeof prompts.handleCancel).toBe('function');
      expect(typeof prompts.isCancel).toBe('function');
      expect(typeof prompts.intro).toBe('function');
      expect(typeof prompts.outro).toBe('function');
      expect(typeof prompts.note).toBe('function');
      expect(typeof prompts.cancel).toBe('function');
      expect(typeof prompts.group).toBe('function');
      expect(typeof prompts.autocompleteMultiselect).toBe('function');
      expect(typeof prompts.renderInstallSummary).toBe('function');
      expect(typeof prompts.prompt).toBe('function');
    });

    it('exports log object with all methods', () => {
      expect(typeof prompts.log).toBe('object');
      expect(typeof prompts.log.info).toBe('function');
      expect(typeof prompts.log.success).toBe('function');
      expect(typeof prompts.log.warn).toBe('function');
      expect(typeof prompts.log.error).toBe('function');
      expect(typeof prompts.log.message).toBe('function');
      expect(typeof prompts.log.step).toBe('function');
    });
  });

  // =====================================================
  // select()
  // =====================================================
  describe('select()', () => {
    it('returns correct value for each option', async () => {
      mockClack.select.mockResolvedValue('option-b');

      const result = await prompts.select({
        message: 'Pick one:',
        options: [
          { value: 'option-a', label: 'Option A' },
          { value: 'option-b', label: 'Option B' },
        ],
      });

      expect(result).toBe('option-b');
      expect(mockClack.select).toHaveBeenCalledWith({
        message: 'Pick one:',
        options: [
          { value: 'option-a', label: 'Option A' },
          { value: 'option-b', label: 'Option B' },
        ],
        initialValue: undefined,
      });
    });

    it('handles cancellation (returns cancel symbol)', async () => {
      const cancelSymbol = Symbol('cancel');
      mockClack.select.mockResolvedValue(cancelSymbol);
      mockClack.isCancel.mockReturnValue(true);

      const mockExit = vi.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process.exit');
      });

      await expect(
        prompts.select({
          message: 'Pick one:',
          options: [{ value: 'a', label: 'A' }],
        }),
      ).rejects.toThrow('process.exit');

      expect(mockClack.cancel).toHaveBeenCalledWith('Operation cancelled');
      mockExit.mockRestore();
    });

    it('converts Inquirer-style choices to clack format', async () => {
      mockClack.select.mockResolvedValue('val-1');

      await prompts.select({
        message: 'Pick:',
        choices: [
          { name: 'Choice 1', value: 'val-1', hint: 'First' },
          { name: 'Choice 2', value: 'val-2' },
        ],
        default: 'val-1',
      });

      expect(mockClack.select).toHaveBeenCalledWith({
        message: 'Pick:',
        options: [
          { value: 'val-1', label: 'Choice 1', hint: 'First' },
          { value: 'val-2', label: 'Choice 2', hint: undefined },
        ],
        initialValue: 'val-1',
      });
    });

    it('handles string/number primitive choices', async () => {
      mockClack.select.mockResolvedValue('alpha');

      await prompts.select({
        message: 'Pick:',
        choices: ['alpha', 'beta', 'gamma'],
      });

      expect(mockClack.select).toHaveBeenCalledWith({
        message: 'Pick:',
        options: [
          { value: 'alpha', label: 'alpha' },
          { value: 'beta', label: 'beta' },
          { value: 'gamma', label: 'gamma' },
        ],
        initialValue: undefined,
      });
    });

    it('skips separator entries in choices', async () => {
      mockClack.select.mockResolvedValue('a');

      await prompts.select({
        message: 'Pick:',
        choices: [
          { name: 'A', value: 'a' },
          { type: 'separator' },
          { name: 'B', value: 'b' },
        ],
      });

      const call = mockClack.select.mock.calls[0][0];
      expect(call.options).toHaveLength(2);
    });
  });

  // =====================================================
  // multiselect()
  // =====================================================
  describe('multiselect()', () => {
    it('returns array of selected values', async () => {
      mockClack.multiselect.mockResolvedValue(['opt-a', 'opt-c']);

      const result = await prompts.multiselect({
        message: 'Select:',
        options: [
          { value: 'opt-a', label: 'A' },
          { value: 'opt-b', label: 'B' },
          { value: 'opt-c', label: 'C' },
        ],
      });

      expect(result).toEqual(['opt-a', 'opt-c']);
      expect(Array.isArray(result)).toBe(true);
    });

    it('handles cancellation', async () => {
      const cancelSymbol = Symbol('cancel');
      mockClack.multiselect.mockResolvedValue(cancelSymbol);
      mockClack.isCancel.mockReturnValue(true);

      const mockExit = vi.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process.exit');
      });

      await expect(
        prompts.multiselect({
          message: 'Select:',
          options: [{ value: 'a', label: 'A' }],
        }),
      ).rejects.toThrow('process.exit');

      mockExit.mockRestore();
    });

    it('converts Inquirer-style choices with pre-checked items', async () => {
      mockClack.multiselect.mockResolvedValue(['v1', 'v3']);

      await prompts.multiselect({
        message: 'Select:',
        choices: [
          { name: 'C1', value: 'v1', checked: true },
          { name: 'C2', value: 'v2' },
          { name: 'C3', value: 'v3', checked: true },
        ],
      });

      expect(mockClack.multiselect).toHaveBeenCalledWith({
        message: 'Select:',
        options: [
          { value: 'v1', label: 'C1', hint: undefined },
          { value: 'v2', label: 'C2', hint: undefined },
          { value: 'v3', label: 'C3', hint: undefined },
        ],
        initialValues: ['v1', 'v3'],
        required: false,
      });
    });
  });

  // =====================================================
  // confirm()
  // =====================================================
  describe('confirm()', () => {
    it('returns boolean true', async () => {
      mockClack.confirm.mockResolvedValue(true);

      const result = await prompts.confirm({ message: 'Continue?' });

      expect(result).toBe(true);
      expect(typeof result).toBe('boolean');
    });

    it('returns boolean false', async () => {
      mockClack.confirm.mockResolvedValue(false);

      const result = await prompts.confirm({ message: 'Continue?' });

      expect(result).toBe(false);
    });

    it('respects default value', async () => {
      mockClack.confirm.mockResolvedValue(false);

      await prompts.confirm({ message: 'Continue?', default: false });

      expect(mockClack.confirm).toHaveBeenCalledWith({
        message: 'Continue?',
        initialValue: false,
      });
    });

    it('defaults initialValue to true when not specified', async () => {
      mockClack.confirm.mockResolvedValue(true);

      await prompts.confirm({ message: 'Continue?' });

      expect(mockClack.confirm).toHaveBeenCalledWith({
        message: 'Continue?',
        initialValue: true,
      });
    });

    it('handles cancellation', async () => {
      const cancelSymbol = Symbol('cancel');
      mockClack.confirm.mockResolvedValue(cancelSymbol);
      mockClack.isCancel.mockReturnValue(true);

      const mockExit = vi.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process.exit');
      });

      await expect(prompts.confirm({ message: 'Continue?' })).rejects.toThrow('process.exit');
      mockExit.mockRestore();
    });
  });

  // =====================================================
  // text()
  // =====================================================
  describe('text()', () => {
    it('returns string input', async () => {
      const result = await prompts.text({ message: 'Enter name:' });

      expect(result).toBe('test-input');
      expect(typeof result).toBe('string');
    });

    it('respects placeholder/default', async () => {
      await prompts.text({
        message: 'Enter name:',
        default: 'John',
        placeholder: 'e.g. John',
      });

      expect(MockTextPrompt).toHaveBeenCalledWith(
        expect.objectContaining({
          defaultValue: 'John',
        }),
      );
    });

    it('uses default as placeholder when placeholder not provided', async () => {
      await prompts.text({
        message: 'Enter name:',
        default: 'John',
      });

      // The render function should use 'John' as placeholder
      expect(MockTextPrompt).toHaveBeenCalled();
    });

    it('registers Tab key handler for placeholder fill', async () => {
      await prompts.text({
        message: 'Enter name:',
        placeholder: 'John',
      });

      expect(mockTextPromptInstance.on).toHaveBeenCalledWith('key', expect.any(Function));
    });

    it('handles cancellation', async () => {
      mockTextPromptInstance.prompt.mockResolvedValue(Symbol('cancel'));
      mockClack.isCancel.mockReturnValue(true);

      const mockExit = vi.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process.exit');
      });

      await expect(prompts.text({ message: 'Enter:' })).rejects.toThrow('process.exit');
      mockExit.mockRestore();
    });
  });

  // =====================================================
  // password()
  // =====================================================
  describe('password()', () => {
    it('masks input and returns string', async () => {
      mockClack.password.mockResolvedValue('s3cret');

      const result = await prompts.password({ message: 'Enter passphrase:' });

      expect(result).toBe('s3cret');
      expect(mockClack.password).toHaveBeenCalledWith({
        message: 'Enter passphrase:',
        validate: undefined,
      });
    });

    it('passes validation function', async () => {
      const validateFn = (val) => (val.length < 8 ? 'Too short' : undefined);
      mockClack.password.mockResolvedValue('longpassword');

      await prompts.password({
        message: 'Enter:',
        validate: validateFn,
      });

      expect(mockClack.password).toHaveBeenCalledWith({
        message: 'Enter:',
        validate: validateFn,
      });
    });

    it('handles cancellation', async () => {
      mockClack.password.mockResolvedValue(Symbol('cancel'));
      mockClack.isCancel.mockReturnValue(true);

      const mockExit = vi.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process.exit');
      });

      await expect(prompts.password({ message: 'Enter:' })).rejects.toThrow('process.exit');
      mockExit.mockRestore();
    });
  });

  // =====================================================
  // createSpinner()
  // =====================================================
  describe('createSpinner()', () => {
    let mockSpinnerInstance;

    beforeEach(() => {
      mockSpinnerInstance = {
        start: vi.fn(),
        stop: vi.fn(),
        message: vi.fn(),
      };
      mockClack.spinner.mockReturnValue(mockSpinnerInstance);
    });

    it('start/message/stop lifecycle', () => {
      const s = prompts.createSpinner();

      expect(s.isSpinning).toBe(false);

      s.start('Loading...');
      expect(s.isSpinning).toBe(true);
      expect(mockSpinnerInstance.start).toHaveBeenCalledWith('Loading...');

      s.message('Still loading...');
      expect(mockSpinnerInstance.message).toHaveBeenCalledWith('Still loading...');

      s.stop('Done!');
      expect(s.isSpinning).toBe(false);
      expect(mockSpinnerInstance.stop).toHaveBeenCalledWith('Done!');
    });

    it('prevents start-while-spinning (updates message instead)', () => {
      const s = prompts.createSpinner();

      s.start('First');
      s.start('Second');

      expect(mockSpinnerInstance.start).toHaveBeenCalledTimes(1);
      expect(mockSpinnerInstance.message).toHaveBeenCalledWith('Second');
    });

    it('prevents stop-while-stopped', () => {
      const s = prompts.createSpinner();

      s.stop('Done');

      expect(mockSpinnerInstance.stop).not.toHaveBeenCalled();
      expect(s.isSpinning).toBe(false);
    });
  });

  // =====================================================
  // setSilent() / isSilent()
  // =====================================================
  describe('setSilent()', () => {
    it('setSilent(true) suppresses all output', () => {
      prompts.setSilent(true);
      expect(prompts.isSilent()).toBe(true);

      prompts.intro('Test');
      prompts.outro('Test');
      prompts.note('Test', 'Title');
      prompts.cancel('Test');
      prompts.log.info('Test');
      prompts.log.warn('Test');
      prompts.log.error('Test');

      expect(mockClack.intro).not.toHaveBeenCalled();
      expect(mockClack.outro).not.toHaveBeenCalled();
      expect(mockClack.note).not.toHaveBeenCalled();
      expect(mockClack.cancel).not.toHaveBeenCalled();
      expect(mockClack.log.info).not.toHaveBeenCalled();
      expect(mockClack.log.warn).not.toHaveBeenCalled();
      expect(mockClack.log.error).not.toHaveBeenCalled();
    });

    it('setSilent(false) restores output', () => {
      prompts.setSilent(true);
      prompts.setSilent(false);
      expect(prompts.isSilent()).toBe(false);

      prompts.log.info('Restored');
      expect(mockClack.log.info).toHaveBeenCalledWith('Restored');
    });

    it('setSilent(true) suppresses spinner start', () => {
      const mockSpinnerInst = { start: vi.fn(), stop: vi.fn(), message: vi.fn() };
      mockClack.spinner.mockReturnValue(mockSpinnerInst);

      prompts.setSilent(true);
      const s = prompts.createSpinner();
      s.start('Loading...');

      expect(mockSpinnerInst.start).not.toHaveBeenCalled();
    });

    it('setSilent(true) suppresses renderInstallSummary', () => {
      prompts.setSilent(true);
      prompts.renderInstallSummary([{ name: 'pkg', status: 'success' }]);

      expect(mockClack.note).not.toHaveBeenCalled();
    });
  });

  // =====================================================
  // log utilities
  // =====================================================
  describe('log.info/warn/error', () => {
    it('log.info produces correct output', () => {
      prompts.log.info('Info message');
      expect(mockClack.log.info).toHaveBeenCalledWith('Info message');
    });

    it('log.warn produces correct output', () => {
      prompts.log.warn('Warning message');
      expect(mockClack.log.warn).toHaveBeenCalledWith('Warning message');
    });

    it('log.error produces correct output', () => {
      prompts.log.error('Error message');
      expect(mockClack.log.error).toHaveBeenCalledWith('Error message');
    });

    it('log.success produces correct output', () => {
      prompts.log.success('Success message');
      expect(mockClack.log.success).toHaveBeenCalledWith('Success message');
    });

    it('log.message produces correct output', () => {
      prompts.log.message('Plain message');
      expect(mockClack.log.message).toHaveBeenCalledWith('Plain message');
    });

    it('log.step produces correct output', () => {
      prompts.log.step('Step message');
      expect(mockClack.log.step).toHaveBeenCalledWith('Step message');
    });
  });

  // =====================================================
  // renderInstallSummary()
  // =====================================================
  describe('renderInstallSummary()', () => {
    it('formats results table with success/error/skip counts', () => {
      prompts.renderInstallSummary([
        { name: 'package-a', status: 'success', message: 'installed v1.0' },
        { name: 'package-b', status: 'error', message: 'network timeout' },
        { name: 'package-c', status: 'skipped', message: 'already installed' },
      ]);

      expect(mockClack.note).toHaveBeenCalledTimes(1);
      const call = mockClack.note.mock.calls[0];
      const content = call[0];
      const title = call[1];

      expect(title).toBe('Install Summary');
      expect(content).toContain('package-a');
      expect(content).toContain('package-b');
      expect(content).toContain('package-c');
      expect(content).toContain('1 succeeded');
      expect(content).toContain('1 failed');
      expect(content).toContain('1 skipped');
    });

    it('uses custom title when provided', () => {
      prompts.renderInstallSummary([{ name: 'pkg', status: 'success' }], {
        title: 'Custom Title',
      });

      const call = mockClack.note.mock.calls[0];
      expect(call[1]).toBe('Custom Title');
    });
  });

  // =====================================================
  // prompt() - Inquirer compatibility
  // =====================================================
  describe('prompt() Inquirer compatibility', () => {
    it('handles input type questions', async () => {
      mockTextPromptInstance.prompt.mockResolvedValue('John');

      const answers = await prompts.prompt([{ type: 'input', name: 'name', message: 'Name?' }]);

      expect(answers.name).toBe('John');
    });

    it('handles confirm type questions', async () => {
      mockClack.confirm.mockResolvedValue(true);

      const answers = await prompts.prompt([{ type: 'confirm', name: 'agree', message: 'Agree?' }]);

      expect(answers.agree).toBe(true);
    });

    it('handles list type questions', async () => {
      mockClack.select.mockResolvedValue('opt-b');

      const answers = await prompts.prompt([
        {
          type: 'list',
          name: 'choice',
          message: 'Pick:',
          choices: [
            { name: 'A', value: 'opt-a' },
            { name: 'B', value: 'opt-b' },
          ],
        },
      ]);

      expect(answers.choice).toBe('opt-b');
    });

    it('handles checkbox type questions', async () => {
      mockClack.multiselect.mockResolvedValue(['a', 'c']);

      const answers = await prompts.prompt([
        {
          type: 'checkbox',
          name: 'items',
          message: 'Select:',
          choices: [
            { name: 'A', value: 'a' },
            { name: 'B', value: 'b' },
            { name: 'C', value: 'c' },
          ],
        },
      ]);

      expect(answers.items).toEqual(['a', 'c']);
    });

    it('handles password type questions', async () => {
      mockClack.password.mockResolvedValue('secret123');

      const answers = await prompts.prompt([{ type: 'password', name: 'pass', message: 'Password:' }]);

      expect(answers.pass).toBe('secret123');
    });

    it('handles when conditional (function)', async () => {
      mockClack.confirm.mockResolvedValue(true);
      mockTextPromptInstance.prompt.mockResolvedValue('detail');

      const answers = await prompts.prompt([
        { type: 'confirm', name: 'advanced', message: 'Advanced?' },
        { type: 'input', name: 'detail', message: 'Detail?', when: (ans) => ans.advanced },
      ]);

      expect(answers.advanced).toBe(true);
      expect(answers.detail).toBe('detail');
    });

    it('handles when conditional (boolean false)', async () => {
      const answers = await prompts.prompt([
        { type: 'input', name: 'skipped', message: 'Skipped?', when: false },
      ]);

      expect(answers.skipped).toBeUndefined();
    });

    it('handles default value functions', async () => {
      mockTextPromptInstance.prompt.mockResolvedValue('derived-value');
      mockClack.confirm.mockResolvedValue(true);

      await prompts.prompt([
        { type: 'confirm', name: 'first', message: 'First?' },
        { type: 'input', name: 'second', message: 'Second?', default: (ans) => `from-${ans.first}` },
      ]);

      // The default function should have been called
      expect(MockTextPrompt).toHaveBeenCalled();
    });
  });

  // =====================================================
  // isCancel()
  // =====================================================
  describe('isCancel()', () => {
    it('returns true for cancel symbol', () => {
      mockClack.isCancel.mockReturnValue(true);
      expect(prompts.isCancel(Symbol('cancel'))).toBe(true);
    });

    it('returns false for normal values', () => {
      mockClack.isCancel.mockReturnValue(false);
      expect(prompts.isCancel('normal-value')).toBe(false);
    });
  });

  // =====================================================
  // intro/outro/note/cancel
  // =====================================================
  describe('display functions', () => {
    it('intro delegates to clack', () => {
      prompts.intro('Welcome!');
      expect(mockClack.intro).toHaveBeenCalledWith('Welcome!');
    });

    it('outro delegates to clack', () => {
      prompts.outro('Goodbye!');
      expect(mockClack.outro).toHaveBeenCalledWith('Goodbye!');
    });

    it('note delegates to clack with title', () => {
      prompts.note('Content', 'Title');
      expect(mockClack.note).toHaveBeenCalledWith('Content', 'Title');
    });

    it('cancel delegates to clack', () => {
      prompts.cancel('Aborted');
      expect(mockClack.cancel).toHaveBeenCalledWith('Aborted');
    });
  });

  // =====================================================
  // group()
  // =====================================================
  describe('group()', () => {
    it('delegates to clack group with onCancel handler', async () => {
      const groupPrompts = { name: () => prompts.text({ message: 'Name?' }) };
      mockClack.group.mockResolvedValue({ name: 'Test' });

      const result = await prompts.group(groupPrompts);

      expect(result).toEqual({ name: 'Test' });
      expect(mockClack.group).toHaveBeenCalledWith(groupPrompts, expect.objectContaining({ onCancel: expect.any(Function) }));
    });
  });
});
