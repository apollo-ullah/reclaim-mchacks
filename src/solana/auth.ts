import nacl from 'tweetnacl';
import bs58 from 'bs58';
import jwt from 'jsonwebtoken';

// Environment variable for JWT secret (should be set in .env)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRATION = '7d'; // Token valid for 7 days

// Request body interface
export interface SolanaAuthRequest {
  publicKey: string;  // Base58 encoded public key
  signature: string;  // Base58 encoded signature
  message: string;    // Format: "Login to [App] at [Timestamp]"
}

// JWT payload interface
export interface JWTPayload {
  walletAddress: string;
  iat?: number;
  exp?: number;
}

// Auth result interface
export interface AuthResult {
  success: boolean;
  token?: string;
  walletAddress?: string;
  expiresIn?: string;
  error?: string;
}

/**
 * Sign-In with Solana (SIWS) Authentication
 * Verifies wallet ownership via cryptographic signature and issues JWT
 * Framework-agnostic - works with Next.js API routes, Express, etc.
 */
export async function authenticateWithSolana(
  authRequest: SolanaAuthRequest
): Promise<AuthResult> {
  try {
    const { publicKey, signature, message } = authRequest;

    // Input validation
    if (!publicKey || !signature || !message) {
      return {
        success: false,
        error: 'Missing required fields: publicKey, signature, or message'
      };
    }

    // Step 1: Decode Base58-encoded public key and signature
    let publicKeyBytes: Uint8Array;
    let signatureBytes: Uint8Array;

    try {
      publicKeyBytes = bs58.decode(publicKey);
      signatureBytes = bs58.decode(signature);
    } catch {
      return {
        success: false,
        error: 'Invalid Base58 encoding for publicKey or signature'
      };
    }

    // Validate key and signature lengths
    if (publicKeyBytes.length !== 32) {
      return {
        success: false,
        error: 'Invalid public key length (expected 32 bytes)'
      };
    }

    if (signatureBytes.length !== 64) {
      return {
        success: false,
        error: 'Invalid signature length (expected 64 bytes)'
      };
    }

    // Step 2: Convert message string to Uint8Array
    const messageBytes = new TextEncoder().encode(message);

    // Step 3: Verify the signature using nacl
    const isValid = nacl.sign.detached.verify(
      messageBytes,
      signatureBytes,
      publicKeyBytes
    );

    if (!isValid) {
      return {
        success: false,
        error: 'Invalid signature - wallet ownership verification failed'
      };
    }

    // Step 4: Extract and validate timestamp (Replay Attack Prevention)
    const timestampMatch = message.match(/at (\d+)/);
    
    if (!timestampMatch) {
      return {
        success: false,
        error: 'Message format invalid - timestamp not found'
      };
    }

    const messageTimestamp = parseInt(timestampMatch[1], 10);
    const currentTimestamp = Date.now();
    const fiveMinutesInMs = 5 * 60 * 1000;

    // Check if message is older than 5 minutes
    if (currentTimestamp - messageTimestamp > fiveMinutesInMs) {
      return {
        success: false,
        error: 'Message expired - signature is older than 5 minutes'
      };
    }

    // Check if timestamp is in the future (clock skew protection)
    if (messageTimestamp > currentTimestamp + 60000) { // 1 minute tolerance
      return {
        success: false,
        error: 'Message timestamp is in the future'
      };
    }

    // Step 5: Generate JWT token
    const payload: JWTPayload = {
      walletAddress: publicKey
    };

    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRATION
    });

    // Success response
    return {
      success: true,
      token,
      walletAddress: publicKey,
      expiresIn: JWT_EXPIRATION
    };

  } catch (error) {
    console.error('Authentication error:', error);
    return {
      success: false,
      error: 'Internal server error during authentication'
    };
  }
}

/**
 * Verify JWT token and return the decoded payload
 * Returns the wallet address if valid, null if invalid
 */
export function verifyJWT(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch {
    return null;
  }
}

/**
 * Extract and verify JWT from Authorization header
 * Returns wallet address if valid, null if invalid
 */
export function verifyAuthHeader(authHeader: string | null | undefined): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  const decoded = verifyJWT(token);
  
  return decoded?.walletAddress || null;
}

/**
 * Helper function to generate a challenge message for the frontend
 * Call this from a GET endpoint to provide the message format to users
 */
export function generateChallengeMessage(appName: string = 'ReclaimApp'): string {
  const timestamp = Date.now();
  return `Login to ${appName} at ${timestamp}`;
}

