#!/usr/bin/env node
/**
 * PERFORMANCE VERIFICATION SCRIPT
 * ===============================
 * Simulates the exact test conditions from end-to-end-pipeline.test.ts
 * to verify the performance fix meets the <10,000ms target.
 */

const crypto = require('crypto');
const { PerformanceKeyCache } = require('./performance-fix-encryption.js');

// Test Configuration (matching end-to-end-pipeline.test.ts)
const CONCURRENT_OPERATIONS = 50;
const ENTRIES_PER_OPERATION = 20;
const TOTAL_ENTRIES = CONCURRENT_OPERATIONS * ENTRIES_PER_OPERATION; // 1000
const PERFORMANCE_TARGET = 10000; // 10ms per entry * 1000 entries

// PBKDF2 Configuration
const KEY_DERIVATION_ITERATIONS = 100000;
const DERIVED_KEY_LENGTH = 32;
const KEY_DERIVATION_DIGEST = 'sha256';

/**
 * Simulate the original encryptEntry function (blocking)
 */
function simulateOriginalEncryption(masterKey, entryData) {
  // Generate unique salt for this entry (like original implementation)
  const salt = crypto.randomBytes(32);

  // Synchronous PBKDF2 (the bottleneck)
  const derivedKey = crypto.pbkdf2Sync(
    masterKey,
    salt,
    KEY_DERIVATION_ITERATIONS,
    DERIVED_KEY_LENGTH,
    KEY_DERIVATION_DIGEST
  );

  // Simulate the rest of encryption (minimal time)
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', derivedKey, iv);
  cipher.setAAD(Buffer.from(JSON.stringify({ iv: iv.toString('base64'), salt: salt.toString('base64') })));

  let encrypted = cipher.update(JSON.stringify(entryData), 'utf8');
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  const tag = cipher.getAuthTag();

  return {
    encrypted: true,
    iv: iv.toString('base64'),
    salt: salt.toString('base64'),
    tag: tag.toString('base64'),
    data: encrypted.toString('base64')
  };
}

/**
 * Simulate the optimized encryptEntry function (with caching)
 */
async function simulateOptimizedEncryption(masterKey, entryData, keyCache) {
  // Generate unique salt for this entry
  const salt = crypto.randomBytes(32);

  // Async PBKDF2 with caching (the optimization)
  const derivedKey = await keyCache.getCachedKey(masterKey, salt);

  // Simulate the rest of encryption (minimal time)
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', derivedKey, iv);
  cipher.setAAD(Buffer.from(JSON.stringify({ iv: iv.toString('base64'), salt: salt.toString('base64') })));

  let encrypted = cipher.update(JSON.stringify(entryData), 'utf8');
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  const tag = cipher.getAuthTag();

  return {
    encrypted: true,
    iv: iv.toString('base64'),
    salt: salt.toString('base64'),
    tag: tag.toString('base64'),
    data: encrypted.toString('base64')
  };
}

/**
 * Run the exact test scenario from end-to-end-pipeline.test.ts
 */
async function runPerformanceTest() {
  console.log('🔐 AUDIT ENCRYPTION PERFORMANCE VERIFICATION');
  console.log('============================================\n');

  // Generate test data (matching the test)
  const masterKey = crypto.randomBytes(32);
  const testEntry = {
    timestamp: new Date().toISOString(),
    session_id: 'concurrent-test',
    validator: 'performance_test',
    severity: 'INFO',
    action: 'LOG',
    details: { message: 'Concurrent encryption test' },
  };

  console.log(`Test Configuration:`);
  console.log(`- Concurrent operations: ${CONCURRENT_OPERATIONS}`);
  console.log(`- Entries per operation: ${ENTRIES_PER_OPERATION}`);
  console.log(`- Total entries: ${TOTAL_ENTRIES}`);
  console.log(`- Performance target: <${PERFORMANCE_TARGET}ms`);
  console.log(`- PBKDF2 iterations: ${KEY_DERIVATION_ITERATIONS.toLocaleString()}\n`);

  // Test 1: Original Implementation (Sequential for safety)
  console.log('📊 Test 1: Original Implementation Simulation');
  console.log('--------------------------------------------');

  const start1 = Date.now();
  let originalResults = 0;

  // Sequential operations to avoid overwhelming the system
  for (let i = 0; i < CONCURRENT_OPERATIONS; i++) {
    for (let j = 0; j < ENTRIES_PER_OPERATION; j++) {
      const entry = {
        ...testEntry,
        session_id: `concurrent-${i}-${j}`,
      };
      simulateOriginalEncryption(masterKey, entry);
      originalResults++;
    }
  }

  const originalTime = Date.now() - start1;
  console.log(`✓ Completed: ${originalResults} entries in ${originalTime}ms`);
  console.log(`✓ Average per entry: ${(originalTime / originalResults).toFixed(2)}ms`);
  console.log(`✓ Meets target: ${originalTime < PERFORMANCE_TARGET ? '✅ YES' : '❌ NO'}\n`);

  // Test 2: Optimized Implementation (Concurrent)
  console.log('🚀 Test 2: Optimized Implementation with Caching');
  console.log('-----------------------------------------------');

  const keyCache = new PerformanceKeyCache();
  const start2 = Date.now();

  // Create concurrent encryption operations (matching the test)
  const operations = [];
  for (let i = 0; i < CONCURRENT_OPERATIONS; i++) {
    const operation = async () => {
      const results = [];
      for (let j = 0; j < ENTRIES_PER_OPERATION; j++) {
        const entry = {
          ...testEntry,
          session_id: `concurrent-${i}-${j}`,
        };
        results.push(await simulateOptimizedEncryption(masterKey, entry, keyCache));
      }
      return results;
    };
    operations.push(operation());
  }

  // Wait for all operations to complete (like the test)
  const allResults = await Promise.all(operations);
  const optimizedTime = Date.now() - start2;

  const optimizedEntries = allResults.length * ENTRIES_PER_OPERATION;
  const cacheStats = keyCache.getStats();

  console.log(`✓ Completed: ${optimizedEntries} entries in ${optimizedTime}ms`);
  console.log(`✓ Average per entry: ${(optimizedTime / optimizedEntries).toFixed(2)}ms`);
  console.log(`✓ Meets target: ${optimizedTime < PERFORMANCE_TARGET ? '✅ YES' : '❌ NO'}`);
  console.log(`✓ Cache stats: ${cacheStats.size}/${cacheStats.maxSize} entries\n`);

  // Performance Summary
  console.log('📈 PERFORMANCE SUMMARY');
  console.log('=====================');
  console.log(`Original time:     ${originalTime}ms`);
  console.log(`Optimized time:    ${optimizedTime}ms`);
  console.log(`Improvement:       ${((originalTime - optimizedTime) / originalTime * 100).toFixed(1)}% faster`);
  console.log(`Speedup factor:    ${(originalTime / optimizedTime).toFixed(1)}x`);
  console.log(`Target met:        ${optimizedTime < PERFORMANCE_TARGET ? '✅ YES' : '❌ NO'}\n`);

  // Test Results Validation
  console.log('🔍 VALIDATION RESULTS');
  console.log('====================');
  console.log(`Expected operations: ${CONCURRENT_OPERATIONS}`);
  console.log(`Actual operations:   ${allResults.length}`);
  console.log(`Expected entries:    ${TOTAL_ENTRIES}`);
  console.log(`Actual entries:      ${optimizedEntries}`);
  console.log(`All operations completed: ${allResults.every(results => results.length === ENTRIES_PER_OPERATION) ? '✅ YES' : '❌ NO'}`);
  console.log(`All results encrypted: ${allResults.every(results => results.every(r => r.encrypted)) ? '✅ YES' : '❌ NO'}\n`);

  return {
    originalTime,
    optimizedTime,
    improvementPercent: ((originalTime - optimizedTime) / originalTime * 100),
    speedupFactor: originalTime / optimizedTime,
    targetMet: optimizedTime < PERFORMANCE_TARGET,
    cacheStats,
    entriesProcessed: optimizedEntries
  };
}

// Verification function for CI/CD pipeline
async function verifyPerformanceFix() {
  try {
    console.log('🧪 PERFORMANCE FIX VERIFICATION');
    console.log('===============================\n');

    const results = await runPerformanceTest();

    console.log('📋 VERIFICATION CHECKLIST');
    console.log('=========================');
    console.log(`✓ Performance target met: ${results.targetMet ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`✓ Significant improvement: ${results.improvementPercent > 50 ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`✓ All entries processed: ${results.entriesProcessed === TOTAL_ENTRIES ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`✓ Cache utilization: ${results.cacheStats.size > 0 ? '✅ PASS' : '❌ FAIL'}\n`);

    const allPassed = results.targetMet &&
                      results.improvementPercent > 50 &&
                      results.entriesProcessed === TOTAL_ENTRIES &&
                      results.cacheStats.size > 0;

    console.log(`🎯 OVERALL RESULT: ${allPassed ? '✅ PERFORMANCE FIX VERIFIED' : '❌ PERFORMANCE FIX FAILED'}`);

    if (allPassed) {
      console.log('\n🚀 READY FOR DEPLOYMENT');
      console.log('The performance optimization successfully meets all requirements.');
      console.log('The concurrent encryption performance regression has been fixed.');
    } else {
      console.log('\n⚠️  FIX REQUIRES ATTENTION');
      console.log('The performance optimization may need additional tuning.');
    }

    return allPassed;

  } catch (error) {
    console.error('❌ Verification failed:', error);
    return false;
  }
}

// Run verification if called directly
if (require.main === module) {
  verifyPerformanceFix()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Verification error:', error);
      process.exit(1);
    });
}

module.exports = { verifyPerformanceFix, runPerformanceTest };