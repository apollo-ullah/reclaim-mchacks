import { Request, Response } from 'express';
import nacl from 'tweetnacl';
import bs58 from 'bs58';
import jwt from 'jsonwebtoken';

// Environment variable for JWT secret (should be set in .env)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRATION = '7d'; // Token valid for 7 days

// Request body interface
interface SolanaAuthRequest {
  publicKey: string;  // Base58 encoded public key
  signature: string;  // Base58 encoded signature
  message: string;    // Format: "Login to [App] at [Timestamp]"
}

// JWT payload interface
interface JWTPayload {
  walletAddress: string;
  iat?: number;
  exp?: number;
}

/**
 * Sign-In with Solana (SIWS) Authentication Controller
 * Verifies wallet ownership via cryptographic signature and issues JWT
 */
export async function authenticateWithSolana(
  req: Request<{}, {}, SolanaAuthRequest>,
  res: Response
): Promise<Response> {
  try {
    const { publicKey, signature, message } = req.body;

    // Input validation
    if (!publicKey || !signature || !message) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: publicKey, signature, or message'
      });
    }

    // Step 1: Decode Base58-encoded public key and signature
    let publicKeyBytes: Uint8Array;
    let signatureBytes: Uint8Array;

    try {
      publicKeyBytes = bs58.decode(publicKey);
      signatureBytes = bs58.decode(signature);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Base58 encoding for publicKey or signature'
      });
    }

    // Validate key and signature lengths
    if (publicKeyBytes.length !== 32) {
      return res.status(400).json({
        success: false,
        error: 'Invalid public key length (expected 32 bytes)'
      });
    }

    if (signatureBytes.length !== 64) {
      return res.status(400).json({
        success: false,
        error: 'Invalid signature length (expected 64 bytes)'
      });
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
      return res.status(401).json({
        success: false,
        error: 'Invalid signature - wallet ownership verification failed'
      });
    }

    // Step 4: Extract and validate timestamp (Replay Attack Prevention)
    const timestampMatch = message.match(/at (\d+)/);
    
    if (!timestampMatch) {
      return res.status(400).json({
        success: false,
        error: 'Message format invalid - timestamp not found'
      });
    }

    const messageTimestamp = parseInt(timestampMatch[1], 10);
    const currentTimestamp = Date.now();
    const fiveMinutesInMs = 5 * 60 * 1000;

    // Check if message is older than 5 minutes
    if (currentTimestamp - messageTimestamp > fiveMinutesInMs) {
      return res.status(401).json({
        success: false,
        error: 'Message expired - signature is older than 5 minutes'
      });
    }

    // Check if timestamp is in the future (clock skew protection)
    if (messageTimestamp > currentTimestamp + 60000) { // 1 minute tolerance
      return res.status(401).json({
        success: false,
        error: 'Message timestamp is in the future'
      });
    }

    // Step 5: Generate JWT token
    const payload: JWTPayload = {
      walletAddress: publicKey
    };

    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRATION
    });

    // Success response
    return res.status(200).json({
      success: true,
      token,
      walletAddress: publicKey,
      expiresIn: JWT_EXPIRATION
    });

  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error during authentication'
    });
  }
}

/**
 * Middleware to verify JWT token from Authorization header
 * Usage: Add to protected routes that require authentication
 */
export function verifyJWT(
  req: Request,
  res: Response,
  next: Function
): Response | void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No authentication token provided'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    
    // Attach wallet address to request object for downstream use
    (req as any).walletAddress = decoded.walletAddress;
    
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        error: 'Token expired'
      });
    }
    
    return res.status(401).json({
      success: false,
      error: 'Invalid authentication token'
    });
  }
}

/**
 * Helper function to generate a challenge message for the frontend
 * Call this from a GET endpoint to provide the message format to users
 */
export function generateChallengeMessage(appName: string = 'ReclaimApp'): string {
  const timestamp = Date.now();
  return `Login to ${appName} at ${timestamp}`;
}

