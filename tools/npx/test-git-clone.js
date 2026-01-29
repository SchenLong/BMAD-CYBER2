import { cloneRepository, copyRelevantFiles, cleanupClone } from './lib/git-clone.js';
import { tmpdir } from 'os';
import { join } from 'path';
import { mkdir } from 'fs/promises';

async function test() {
  try {
    console.log('Testing git clone fallback...');

    // Test git availability check
    const tempDir = await cloneRepository({
      branch: 'BMAD-CYBEROPS-RP',
      depth: 1
    });
    console.log('Cloned to:', tempDir);

    // Test copy (to a test directory)
    const testTarget = join(tmpdir(), 'bmad-copy-test');
    await mkdir(testTarget, { recursive: true });

    const fileCount = await copyRelevantFiles(tempDir, testTarget, {
      withDocs: false,
      withDev: false
    });
    console.log('Files copied:', fileCount);

    // Cleanup
    await cleanupClone(tempDir);
    await cleanupClone(testTarget);
    console.log('Cleanup complete');

    console.log('All tests passed!');
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

test();
