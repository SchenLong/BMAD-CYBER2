import { defineWorkspace } from 'vitest';

export default defineWorkspace([
  'tests',
  'tests/security',
  'tests/owasp',
  'tests/scripts',
  'tests/regression',
  'tests/uat',
  'tests/unit',
  'team/scripts/test'
]);
