import { ArchivalConfigManager } from './dist/observability/archival-config.js';

async function test() {
  // Test without bucket
  delete process.env.BMAD_S3_ARCHIVE_BUCKET;
  
  const configManager1 = new ArchivalConfigManager();
  const result1 = await configManager1.loadConfiguration();
  console.log('Test 1 (no bucket):');
  console.log('  isValid:', result1.isValid);
  console.log('  errors:', result1.errors);
  console.log('  config:', result1.config);
  
  // Test with bucket
  process.env.BMAD_S3_ARCHIVE_BUCKET = 'test-bucket';
  
  const configManager2 = new ArchivalConfigManager();
  const result2 = await configManager2.loadConfiguration();
  console.log('\nTest 2 (with bucket):');
  console.log('  isValid:', result2.isValid);
  console.log('  errors:', result2.errors);
  console.log('  warnings:', result2.warnings);
  console.log('  config:', result2.config);
  console.log('  config.bucket:', result2.config?.bucket);
}

test().catch(console.error);
