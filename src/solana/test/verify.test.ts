/**
 * Verification Testing Suite (Phase 4)
 * Tests DAS API queries for asset ownership verification
 */

import 'dotenv/config';
import { 
  verifyImageOwnership, 
  findOwnerByHash,
  getAssetsByWallet,
  verifyWithDetails
} from '../verify';
import { registerContentAsset } from '../mint';
import bs58 from 'bs58';
import nacl from 'tweetnacl';

// Test results tracking
interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  duration: number;
}

const testResults: TestResult[] = [];

// Helper: Generate a test wallet address
function generateTestWallet(): string {
  const keyPair = nacl.sign.keyPair();
  return bs58.encode(keyPair.publicKey);
}

// Helper: Run a test
async function runTest(
  name: string,
  testFn: () => Promise<void>
): Promise<void> {
  const startTime = Date.now();
  try {
    await testFn();
    const duration = Date.now() - startTime;
    testResults.push({ name, passed: true, duration });
    console.log(`✓ ${name} (${duration}ms)`);
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);
    testResults.push({ name, passed: false, error: errorMessage, duration });
    console.log(`✗ ${name} (${duration}ms)`);
    console.log(`  Error: ${errorMessage}`);
  }
}

// Test Suite
export async function runVerifyTests(): Promise<void> {
  console.log('\n========================================');
  console.log('VERIFICATION TESTS (DAS API)');
  console.log('========================================\n');

  // Check environment setup
  const treeAddress = process.env.SOLANA_TREE_ADDRESS;
  const payerKey = process.env.SOLANA_PAYER_PRIVATE_KEY;
  const rpcUrl = process.env.SOLANA_RPC_URL;

  console.log('Environment Check:');
  console.log(`  RPC URL: ${rpcUrl || 'NOT SET'}`);
  console.log(`  Tree Address: ${treeAddress ? '✓ SET' : '✗ NOT SET'}`);
  console.log(`  Payer Key: ${payerKey ? '✓ SET' : '✗ NOT SET'}\n`);

  if (!treeAddress || !payerKey) {
    console.log('⚠️  SKIPPING VERIFICATION TESTS: Environment not configured');
    console.log('   Set up .env and run: npm run init-tree\n');
    return;
  }

  // Generate test data
  const testWallet = generateTestWallet();
  const timestamp = Date.now();
  const realHash = `sha256:verify-test-${timestamp}`;
  const fakeHash = `sha256:fake-hash-${timestamp}`;

  let mintedSuccessfully = false;
  let mintSignature = '';

  // Test 1: Mint an asset for verification testing
  await runTest('Mint test asset for verification', async () => {
    console.log(`\n  Test Wallet: ${testWallet.substring(0, 12)}...`);
    console.log(`  Visual Hash: ${realHash}\n`);

    const result = await registerContentAsset({
      userWalletAddress: testWallet,
      metadataUri: `https://arweave.net/verify-test-${timestamp}`,
      imageHash: realHash,
      licenseName: 'Test-License',
      contentName: 'Verification Test Asset'
    });

    if (!result.success) {
      throw new Error(`Minting failed: ${result.error}`);
    }

    mintedSuccessfully = true;
    mintSignature = result.signature || '';
    
    console.log(`  Minted! Signature: ${mintSignature}`);
    console.log(`  Explorer: ${result.transactionUrl}\n`);
    
    // Wait for blockchain confirmation
    console.log('  Waiting 5 seconds for blockchain confirmation...\n');
    await new Promise(resolve => setTimeout(resolve, 5000));
  });

  // Only run verification tests if minting succeeded
  if (!mintedSuccessfully) {
    console.log('\n⚠️  Skipping remaining tests: Minting failed\n');
    return;
  }

  // Test 2: Verify with correct hash (should return true)
  await runTest('Verify ownership with CORRECT hash', async () => {
    const isOwner = await verifyImageOwnership(testWallet, realHash);
    
    if (!isOwner) {
      throw new Error('Expected true (wallet should own this hash), got false');
    }
    
    console.log('  PASS: Correctly identified wallet as owner');
  });

  // Test 3: Verify with wrong hash (should return false)
  await runTest('Verify ownership with WRONG hash', async () => {
    const isOwner = await verifyImageOwnership(testWallet, fakeHash);
    
    if (isOwner) {
      throw new Error('Expected false (wallet should NOT own this hash), got true');
    }
    
    console.log('  PASS: Correctly rejected fake hash');
  });

  // Test 4: Verify wrong wallet (should return false)
  await runTest('Verify with WRONG wallet address', async () => {
    const differentWallet = generateTestWallet();
    const isOwner = await verifyImageOwnership(differentWallet, realHash);
    
    if (isOwner) {
      throw new Error('Expected false (different wallet should not own asset), got true');
    }
    
    console.log('  PASS: Correctly rejected different wallet');
  });

  // Test 5: Get all assets for wallet
  await runTest('Fetch all assets for test wallet', async () => {
    const assets = await getAssetsByWallet(testWallet);
    
    if (assets.length === 0) {
      throw new Error('Expected at least 1 asset, got 0');
    }
    
    console.log(`  Found ${assets.length} asset(s) for test wallet`);
    
    // Verify our minted asset is in the list
    const hasOurAsset = assets.some(asset => {
      const content = asset.content as any;
      const attributes = content?.metadata?.attributes;
      if (!Array.isArray(attributes)) return false;
      
      return attributes.some((attr: any) => 
        attr?.trait_type === 'VisualHash' && attr?.value === realHash
      );
    });
    
    if (!hasOurAsset) {
      throw new Error('Our minted asset not found in wallet assets');
    }
    
    console.log('  PASS: Our minted asset found in results');
  });

  // Test 6: Verify with details
  await runTest('Verify with detailed asset information', async () => {
    const asset = await verifyWithDetails(testWallet, realHash);
    
    if (!asset) {
      throw new Error('Expected asset details, got null');
    }
    
    console.log(`  Asset ID: ${asset.id}`);
    console.log(`  Asset found with full details`);
  });

  // Test 7: Find owner by hash
  await runTest('Find owner by hash (reverse lookup)', async () => {
    const walletsToCheck = [
      generateTestWallet(), // Random wallet (won't match)
      testWallet,           // Our test wallet (should match)
      generateTestWallet()  // Another random wallet
    ];
    
    const owner = await findOwnerByHash(realHash, walletsToCheck);
    
    if (owner !== testWallet) {
      throw new Error(`Expected ${testWallet}, got ${owner}`);
    }
    
    console.log(`  PASS: Correctly identified owner: ${owner.substring(0, 12)}...`);
  });

  // Test 8: Invalid wallet address handling
  await runTest('Handle invalid wallet address gracefully', async () => {
    try {
      await verifyImageOwnership('invalid-wallet-format', realHash);
      throw new Error('Should have thrown error for invalid wallet');
    } catch (error) {
      if (error instanceof Error && error.message.includes('Should have thrown')) {
        throw error;
      }
      // Expected error - test passes
      console.log('  PASS: Invalid wallet rejected properly');
    }
  });

  // Print summary
  console.log('\n========================================');
  console.log('VERIFICATION TEST SUMMARY');
  console.log('========================================');
  
  const passed = testResults.filter(r => r.passed).length;
  const failed = testResults.filter(r => !r.passed).length;
  const totalTime = testResults.reduce((sum, r) => sum + r.duration, 0);
  
  console.log(`Total: ${testResults.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total Time: ${totalTime}ms`);
  
  if (mintedSuccessfully) {
    console.log(`\nTest Asset Details:`);
    console.log(`  Wallet: ${testWallet}`);
    console.log(`  Hash: ${realHash}`);
    console.log(`  Signature: ${mintSignature}`);
  }
  
  console.log('');
  
  if (failed > 0) {
    console.log('Failed Tests:');
    testResults.filter(r => !r.passed).forEach(r => {
      console.log(`  - ${r.name}: ${r.error}`);
    });
    console.log('');
  }
  
  return;
}

// Run tests if executed directly
if (require.main === module) {
  runVerifyTests()
    .then(() => {
      const failed = testResults.filter(r => !r.passed).length;
      process.exit(failed > 0 ? 1 : 0);
    })
    .catch((error) => {
      console.error('Test suite failed:', error);
      process.exit(1);
    });
}

