/**
 * Minting & Contract Testing Suite
 * Tests Compressed NFT minting with Metaplex Bubblegum
 */

import 'dotenv/config';
import { registerContentAsset, type MintAssetParams } from '../mint';
import { getTreeConfig } from '../init-tree';
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
export async function runMintTests(): Promise<void> {
  console.log('\n========================================');
  console.log('MINTING & CONTRACT TESTS (cNFT)');
  console.log('========================================\n');

  // Check environment setup
  const treeAddress = process.env.SOLANA_TREE_ADDRESS;
  const payerKey = process.env.SOLANA_PAYER_PRIVATE_KEY;
  const rpcUrl = process.env.SOLANA_RPC_URL;

  console.log('Environment Check:');
  console.log(`  RPC URL: ${rpcUrl || 'NOT SET'}`);
  console.log(`  Tree Address: ${treeAddress ? '✓ SET' : '✗ NOT SET'}`);
  console.log(`  Payer Key: ${payerKey ? '✓ SET' : '✗ NOT SET'}\n`);

  if (!treeAddress) {
    console.log('SKIPPING MINT TESTS: SOLANA_TREE_ADDRESS not configured');
    console.log('   Run: npm run init-tree to create a tree first\n');
    return;
  }

  if (!payerKey) {
    console.log('SKIPPING MINT TESTS: SOLANA_PAYER_PRIVATE_KEY not configured');
    console.log('   Set your Solana wallet private key in .env\n');
    return;
  }

  // Test 1: Tree Configuration Validation
  await runTest('Validate tree configuration', async () => {
    const config = getTreeConfig();
    
    if (config.maxDepth !== 14) {
      throw new Error(`Expected maxDepth 14, got ${config.maxDepth}`);
    }
    
    if (config.maxBufferSize !== 64) {
      throw new Error(`Expected maxBufferSize 64, got ${config.maxBufferSize}`);
    }
    
    if (config.estimatedCapacity !== 16384) {
      throw new Error(`Expected capacity 16384, got ${config.estimatedCapacity}`);
    }
  });

  // Test 2: Validate Mint Parameters
  await runTest('Reject invalid wallet address', async () => {
    const params: MintAssetParams = {
      userWalletAddress: 'invalid-address-format',
      metadataUri: 'https://arweave.net/test123',
      imageHash: 'sha256:abc123'
    };
    
    const result = await registerContentAsset(params);
    
    if (result.success !== false) {
      throw new Error('Expected failure for invalid wallet address');
    }
    
    if (!result.error || !result.error.includes('Invalid')) {
      throw new Error('Expected "Invalid" in error message');
    }
  });

  // Test 3: Validate Missing Required Fields
  await runTest('Reject missing required parameters', async () => {
    const params: any = {
      userWalletAddress: generateTestWallet(),
      // Missing metadataUri and imageHash
    };
    
    const result = await registerContentAsset(params);
    
    if (result.success !== false) {
      throw new Error('Expected failure for missing parameters');
    }
    
    if (!result.error || !result.error.includes('Missing')) {
      throw new Error('Expected "Missing" in error message');
    }
  });

  // Test 4: Mint cNFT (Integration Test)
  await runTest('Mint cNFT to test wallet', async () => {
    const testWallet = generateTestWallet();
    const timestamp = Date.now();
    
    const params: MintAssetParams = {
      userWalletAddress: testWallet,
      metadataUri: `https://arweave.net/test-metadata-${timestamp}`,
      imageHash: `sha256:test-hash-${timestamp}`,
      licenseName: 'CC-BY-NC-4.0',
      contentName: 'Test Content'
    };
    
    console.log(`\n  Minting to wallet: ${testWallet.substring(0, 8)}...`);
    console.log(`  Metadata URI: ${params.metadataUri}`);
    console.log(`  Image Hash: ${params.imageHash}\n`);
    
    const result = await registerContentAsset(params);
    
    if (!result.success) {
      throw new Error(`Minting failed: ${result.error}`);
    }
    
    if (!result.signature) {
      throw new Error('Expected transaction signature in result');
    }
    
    if (!result.transactionUrl) {
      throw new Error('Expected transaction URL in result');
    }
    
    console.log(`  Transaction: ${result.signature}`);
    console.log(`  Explorer: ${result.transactionUrl}\n`);
  });

  // Test 5: Mint with Default License
  await runTest('Mint cNFT with default license', async () => {
    const testWallet = generateTestWallet();
    
    const params: MintAssetParams = {
      userWalletAddress: testWallet,
      metadataUri: `https://arweave.net/test-default-${Date.now()}`,
      imageHash: `sha256:default-${Date.now()}`
      // licenseName not provided (should use default)
    };
    
    const result = await registerContentAsset(params);
    
    if (!result.success) {
      throw new Error(`Minting failed: ${result.error}`);
    }
  });

  // Test 6: Mint with Custom Content Name
  await runTest('Mint cNFT with custom content name', async () => {
    const testWallet = generateTestWallet();
    
    const params: MintAssetParams = {
      userWalletAddress: testWallet,
      metadataUri: `https://arweave.net/test-custom-${Date.now()}`,
      imageHash: `sha256:custom-${Date.now()}`,
      contentName: 'My Unique Artwork'
    };
    
    const result = await registerContentAsset(params);
    
    if (!result.success) {
      throw new Error(`Minting failed: ${result.error}`);
    }
  });

  // Test 7: Validate Tree Address Format
  await runTest('Tree address is valid Solana address', async () => {
    if (!treeAddress) {
      throw new Error('Tree address not set');
    }
    
    try {
      const decoded = bs58.decode(treeAddress);
      if (decoded.length !== 32) {
        throw new Error('Invalid tree address length');
      }
    } catch (error) {
      throw new Error('Tree address is not valid Base58');
    }
  });

  // Print summary
  console.log('\n========================================');
  console.log('MINTING TEST SUMMARY');
  console.log('========================================');
  
  const passed = testResults.filter(r => r.passed).length;
  const failed = testResults.filter(r => !r.passed).length;
  const totalTime = testResults.reduce((sum, r) => sum + r.duration, 0);
  
  console.log(`Total: ${testResults.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total Time: ${totalTime}ms\n`);
  
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
  runMintTests()
    .then(() => {
      const failed = testResults.filter(r => !r.passed).length;
      process.exit(failed > 0 ? 1 : 0);
    })
    .catch((error) => {
      console.error('Test suite failed:', error);
      process.exit(1);
    });
}

