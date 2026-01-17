/**
 * Authentication Testing Suite
 * Tests "Bring Your Own Wallet" - Sign-In with Solana (SIWS)
 */

import 'dotenv/config';
import nacl from 'tweetnacl';
import bs58 from 'bs58';
import { Request, Response } from 'express';
import { authenticateWithSolana, verifyJWT } from '../auth';

// Test results tracking
interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  duration: number;
}

const testResults: TestResult[] = [];

// Helper: Mock Express Response
function mockResponse(): Response {
  const res: any = {};
  res.statusCode = 200;
  res.status = (code: number) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data: any) => {
    res.jsonData = data;
    return res;
  };
  return res as Response;
}

// Helper: Generate valid authentication payload
function generateAuthPayload(offsetMinutes = 0) {
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
    const payload = generateAuthPayload(0);
    const req = { body: payload } as Request;
    const res = mockResponse();
    
    await authenticateWithSolana(req, res);
    
    if (res.statusCode !== 200) {
      throw new Error(`Expected 200, got ${res.statusCode}`);
    }
    
    const jsonData = (res as any).jsonData;
    if (!jsonData.success || !jsonData.token) {
      throw new Error('Expected success=true and token in response');
    }
    
    if (jsonData.walletAddress !== payload.publicKey) {
      throw new Error('Wallet address mismatch in response');
    }
  });

  // Test 2: Invalid Signature (Tampered Message)
  await runTest('Reject tampered message signature', async () => {
    const payload = generateAuthPayload(0);
    payload.message = `Login to ReclaimApp at ${Date.now()}`; // Change message AFTER signing
    
    const req = { body: payload } as Request;
    const res = mockResponse();
    
    await authenticateWithSolana(req, res);
    
    if (res.statusCode !== 401) {
      throw new Error(`Expected 401 (invalid signature), got ${res.statusCode}`);
    }
    
    const jsonData = (res as any).jsonData;
    if (jsonData.success !== false) {
      throw new Error('Expected success=false for invalid signature');
    }
  });

  // Test 3: Expired Timestamp (Replay Attack Prevention)
  await runTest('Reject expired timestamp (>5 minutes old)', async () => {
    const payload = generateAuthPayload(-10); // 10 minutes in the past
    
    const req = { body: payload } as Request;
    const res = mockResponse();
    
    await authenticateWithSolana(req, res);
    
    if (res.statusCode !== 401) {
      throw new Error(`Expected 401 (expired), got ${res.statusCode}`);
    }
    
    const jsonData = (res as any).jsonData;
    if (!jsonData.error || !jsonData.error.includes('expired')) {
      throw new Error('Expected "expired" error message');
    }
  });

  // Test 4: Future Timestamp (Clock Skew Protection)
  await runTest('Reject future timestamp (clock skew)', async () => {
    const payload = generateAuthPayload(5); // 5 minutes in the future
    
    const req = { body: payload } as Request;
    const res = mockResponse();
    
    await authenticateWithSolana(req, res);
    
    if (res.statusCode !== 401) {
      throw new Error(`Expected 401 (future timestamp), got ${res.statusCode}`);
    }
  });

  // Test 5: Missing Required Fields
  await runTest('Reject request with missing fields', async () => {
    const req = { body: { publicKey: 'abc123' } } as Request; // Missing signature and message
    const res = mockResponse();
    
    await authenticateWithSolana(req, res);
    
    if (res.statusCode !== 400) {
      throw new Error(`Expected 400 (bad request), got ${res.statusCode}`);
    }
  });

  // Test 6: Invalid Base58 Encoding
  await runTest('Reject invalid Base58 encoding', async () => {
    const payload = generateAuthPayload(0);
    payload.signature = 'not-valid-base58!!!'; // Invalid Base58
    
    const req = { body: payload } as Request;
    const res = mockResponse();
    
    await authenticateWithSolana(req, res);
    
    if (res.statusCode !== 400) {
      throw new Error(`Expected 400 (invalid encoding), got ${res.statusCode}`);
    }
  });

  // Test 7: JWT Token Verification
  await runTest('Verify JWT middleware accepts valid token', async () => {
    // First, get a valid token
    const payload = generateAuthPayload(0);
    const req1 = { body: payload } as Request;
    const res1 = mockResponse();
    
    await authenticateWithSolana(req1, res1);
    const token = (res1 as any).jsonData.token;
    
    // Now verify the token
    const req2 = {
      headers: { authorization: `Bearer ${token}` }
    } as any;
    const res2 = mockResponse();
    let nextCalled = false;
    const next = () => { nextCalled = true; };
    
    verifyJWT(req2, res2, next);
    
    if (!nextCalled) {
      throw new Error('Expected next() to be called for valid token');
    }
    
    if ((req2 as any).walletAddress !== payload.publicKey) {
      throw new Error('Wallet address not attached to request');
    }
  });

  // Test 8: JWT Middleware Rejects Missing Token
  await runTest('JWT middleware rejects missing token', async () => {
    const req = { headers: {} } as any;
    const res = mockResponse();
    const next = () => {};
    
    verifyJWT(req, res, next);
    
    if (res.statusCode !== 401) {
      throw new Error(`Expected 401 (no token), got ${res.statusCode}`);
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

