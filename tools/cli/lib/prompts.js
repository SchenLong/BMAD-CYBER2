/**
 * CLI Prompts — Re-exports from the canonical prompts abstraction layer
 * @module tools/cli/lib/prompts
 * @see src/utility/cli/prompts.js for the full implementation
 */
export {
  select,
  multiselect,
  confirm,
  text,
  password,
  createSpinner,
  log,
  setSilent,
  autocompleteMultiselect,
  renderInstallSummary,
  prompt,
  group,
  handleCancel,
  isCancel,
  intro,
  outro,
  note,
  cancel,
} from '../../../src/utility/cli/prompts.js';
