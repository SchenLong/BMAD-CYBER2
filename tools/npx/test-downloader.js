import { downloadRelease, cleanup } from './lib/downloader.js';

async function test() {
  try {
    console.log('Testing GitHub release downloader...');

    // This will fail if no releases exist, but tests the API call
    const tarballPath = await downloadRelease({ version: 'latest' });
    console.log('Downloaded to:', tarballPath);

    await cleanup();
    console.log('Cleanup complete');
  } catch (error) {
    console.log('Test result:', error.message);
    // Expected: "Release latest not found" if no releases exist yet
  }
}

test();
