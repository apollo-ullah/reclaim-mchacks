/**
 * Test Runner - Executes all test suites
 * 
 * Usage: npm run test
 */

import 'dotenv/config';
import { runAuthTests } from './auth.test';
import { runMintTests } from './mint.test';
import { runVerifyTests } from './verify.test';

async function runAllTests(): Promise<void> {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║                                                        ║');
  console.log('║     RECLAIM CONTENT PROVENANCE TEST SUITE             ║');
  console.log('║     Testing Auth, Minting & Verification              ║');
  console.log('║                                                        ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  const startTime = Date.now();
  let allPassed = true;

  try {
    // Run authentication tests
    console.log('Running Authentication Tests...\n');
    await runAuthTests();
    
    // Run minting tests
    console.log('\nRunning Minting & Contract Tests...\n');
    await runMintTests();
    
    // Run verification tests
    console.log('\nRunning Verification Tests...\n');
    await runVerifyTests();
    
  } catch (error) {
    console.error('\nTest execution failed:', error);
    allPassed = false;
  }

  const totalTime = Date.now() - startTime;

  // Final summary
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║                    FINAL RESULTS                       ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');
  
  console.log(`Total Execution Time: ${totalTime}ms`);
  
  if (allPassed) {
    console.log('\n✓ All test suites completed\n');
  } else {
    console.log('\n✗ Some tests failed\n');
  }

  process.exit(allPassed ? 0 : 1);
}

// Execute all tests
runAllTests().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

