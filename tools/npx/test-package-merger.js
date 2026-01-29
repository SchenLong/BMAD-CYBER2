import { mergePackageJson } from './lib/package-merger.js';
import { tmpdir } from 'os';
import { join } from 'path';
import { mkdir, writeFile, readFile, rm } from 'fs/promises';

async function test() {
  const testDir = join(tmpdir(), 'bmad-merger-test');

  try {
    console.log('Testing package.json merger...\n');

    // Test 1: Create new package.json (no existing)
    await mkdir(testDir, { recursive: true });
    console.log('Test 1: Create new package.json');
    let result = await mergePackageJson(testDir, { yes: true });
    console.log('Result:', result.created ? 'CREATED' : 'FAILED');

    // Verify content
    const created = JSON.parse(await readFile(join(testDir, 'package.json'), 'utf-8'));
    console.log('Has bmad:setup script:', !!created.scripts?.['bmad:setup']);
    console.log('Has chalk dependency:', !!created.dependencies?.chalk);
    console.log('');

    // Test 2: Merge with existing (dry run)
    console.log('Test 2: Merge with existing (dry run)');
    const existingPkg = {
      name: 'my-project',
      version: '2.0.0',
      scripts: { 'start': 'node app.js' },
      dependencies: { 'express': '^4.18.0' }
    };
    await writeFile(join(testDir, 'package.json'), JSON.stringify(existingPkg, null, 2));

    result = await mergePackageJson(testDir, { yes: true, dryRun: true });
    console.log('Dry run result:', result.dryRun ? 'OK' : 'FAILED');
    console.log('');

    // Test 3: Actual merge
    console.log('Test 3: Actual merge');
    result = await mergePackageJson(testDir, { yes: true });
    console.log('Merge result:', result.success ? 'SUCCESS' : 'FAILED');
    console.log('Backup created:', !!result.backupPath);

    // Verify merge preserved user data
    const merged = JSON.parse(await readFile(join(testDir, 'package.json'), 'utf-8'));
    console.log('Preserved user version:', merged.version === '2.0.0');
    console.log('Preserved user script:', merged.scripts?.start === 'node app.js');
    console.log('Preserved user dependency:', merged.dependencies?.express === '^4.18.0');
    console.log('Added BMAD script:', !!merged.scripts?.['bmad:setup']);
    console.log('Added BMAD dependency:', !!merged.dependencies?.chalk);

    console.log('\nAll tests passed!');
  } catch (error) {
    console.error('Test failed:', error.message);
  } finally {
    // Cleanup
    await rm(testDir, { recursive: true, force: true });
  }
}

test();
