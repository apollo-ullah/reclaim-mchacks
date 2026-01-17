/**
 * Authentication Testing Suite
 * Tests "Bring Your Own Wallet" - Sign-In with Solana (SIWS)
 */

import 'dotenv/config';
import nacl from 'tweetnacl';
import bs58 from 'bs58';
import { authenticateWithSolana, verifyJWT, verifyAuthHeader, SolanaAuthRequest } from '../auth';

// Test results tracking
interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  duration: number;
}

const testResults: TestResult[] = [];

// Helper: Generate valid authentication payload
function generateAuthPayload(offsetMinutes = 0): SolanaAuthRequest & { keyPair: nacl.SignKeyPair } {
  const keyPair = nacl.sign.keyPair();
  const publicKey = bs58.encode(keyPair.publicKey);
  
  const timestamp = Date.now() + (offsetMinutes * 60 * 1000);
  const message = `Login to ReclaimApp at ${timestamp}`;
  const messageBytes = new TextEncoder().encode(message);
  
  const signatureBytes = nacl.sign.detached(messageBytes, keyPair.secretKey);
  const signature = bs58.encode(signatureBytes);
  
  return { publicKey, signature, message, keyPair };
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
export async function runAuthTests(): Promise<void> {
  console.log('\n========================================');
  console.log('AUTHENTICATION TESTS (SIWS)');
  console.log('========================================\n');

  // Test 1: Valid Authentication
  await runTest('Valid wallet signature authentication', async () => {
    const { publicKey, signature, message } = generateAuthPayload(0);
    
    const result = await authenticateWithSolana({ publicKey, signature, message });
    
    if (!result.success) {
      throw new Error(`Expected success, got error: ${result.error}`);
    }
    
    if (!result.token) {
      throw new Error('Expected token in response');
    }
    
    if (result.walletAddress !== publicKey) {
      throw new Error('Wallet address mismatch in response');
    }
  });

  // Test 2: Invalid Signature (Tampered Message)
  await runTest('Reject tampered message signature', async () => {
    const { publicKey, signature } = generateAuthPayload(0);
    const tamperedMessage = `Login to ReclaimApp at ${Date.now()}`; // Different message than what was signed
    
    const result = await authenticateWithSolana({ publicKey, signature, message: tamperedMessage });
    
    if (result.success) {
      throw new Error('Expected failure for tampered message');
    }
    
    if (!result.error?.includes('Invalid signature')) {
      throw new Error('Expected "Invalid signature" error message');
    }
  });

  // Test 3: Expired Timestamp (Replay Attack Prevention)
  await runTest('Reject expired timestamp (>5 minutes old)', async () => {
    const { publicKey, signature, message } = generateAuthPayload(-10); // 10 minutes in the past
    
    const result = await authenticateWithSolana({ publicKey, signature, message });
    
    if (result.success) {
      throw new Error('Expected failure for expired timestamp');
    }
    
    if (!result.error?.includes('expired')) {
      throw new Error('Expected "expired" error message');
    }
  });

  // Test 4: Future Timestamp (Clock Skew Protection)
  await runTest('Reject future timestamp (clock skew)', async () => {
    const { publicKey, signature, message } = generateAuthPayload(5); // 5 minutes in the future
    
    const result = await authenticateWithSolana({ publicKey, signature, message });
    
    if (result.success) {
      throw new Error('Expected failure for future timestamp');
    }
  });

  // Test 5: Missing Required Fields
  await runTest('Reject request with missing fields', async () => {
    const result = await authenticateWithSolana({ 
      publicKey: 'abc123', 
      signature: '', 
      message: '' 
    });
    
    if (result.success) {
      throw new Error('Expected failure for missing fields');
    }
    
    if (!result.error?.includes('Missing required fields')) {
      throw new Error('Expected "Missing required fields" error');
    }
  });

  // Test 6: Invalid Base58 Encoding
  await runTest('Reject invalid Base58 encoding', async () => {
    const { publicKey, message } = generateAuthPayload(0);
    
    const result = await authenticateWithSolana({ 
      publicKey, 
      signature: 'not-valid-base58!!!', 
      message 
    });
    
    if (result.success) {
      throw new Error('Expected failure for invalid Base58');
    }
    
    if (!result.error?.includes('Invalid Base58')) {
      throw new Error('Expected "Invalid Base58" error');
    }
  });

  // Test 7: JWT Token Verification
  await runTest('Verify JWT token verification', async () => {
    // First, get a valid token
    const { publicKey, signature, message } = generateAuthPayload(0);
    
    const authResult = await authenticateWithSolana({ publicKey, signature, message });
    
    if (!authResult.success || !authResult.token) {
      throw new Error('Failed to get auth token');
    }
    
    // Now verify the token
    const decoded = verifyJWT(authResult.token);
    
    if (!decoded) {
      throw new Error('Token verification failed');
    }
    
    if (decoded.walletAddress !== publicKey) {
      throw new Error('Wallet address mismatch in decoded token');
    }
  });

  // Test 8: Verify Auth Header Function
  await runTest('verifyAuthHeader accepts valid Bearer token', async () => {
    const { publicKey, signature, message } = generateAuthPayload(0);
    
    const authResult = await authenticateWithSolana({ publicKey, signature, message });
    
    if (!authResult.success || !authResult.token) {
      throw new Error('Failed to get auth token');
    }
    
    const walletAddress = verifyAuthHeader(`Bearer ${authResult.token}`);
    
    if (walletAddress !== publicKey) {
      throw new Error('Wallet address mismatch from verifyAuthHeader');
    }
  });

  // Test 9: verifyAuthHeader rejects missing/invalid headers
  await runTest('verifyAuthHeader rejects invalid headers', async () => {
    if (verifyAuthHeader(null) !== null) {
      throw new Error('Expected null for null header');
    }
    
    if (verifyAuthHeader('') !== null) {
      throw new Error('Expected null for empty header');
    }
    
    if (verifyAuthHeader('NotBearer token') !== null) {
      throw new Error('Expected null for non-Bearer header');
    }
    
    if (verifyAuthHeader('Bearer invalid-token') !== null) {
      throw new Error('Expected null for invalid token');
    }
  });

  // Print summary
  console.log('\n========================================');
  console.log('AUTHENTICATION TEST SUMMARY');
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
  runAuthTests()
    .then(() => {
      const failed = testResults.filter(r => !r.passed).length;
      process.exit(failed > 0 ? 1 : 0);
    })
    .catch((error) => {
      console.error('Test suite failed:', error);
      process.exit(1);
    });
}
