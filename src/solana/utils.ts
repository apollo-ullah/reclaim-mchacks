/**
 * Shared Solana Utilities
 * Common functions used across Solana modules
 */

import bs58 from 'bs58';

/**
 * Load the backend payer keypair from environment variable
 * Supports both Base58 string and JSON array format
 */
export function loadPayerKeypair(): Uint8Array {
  const PAYER_PRIVATE_KEY = process.env.SOLANA_PAYER_PRIVATE_KEY;

  if (!PAYER_PRIVATE_KEY) {
    throw new Error(
      'Missing SOLANA_PAYER_PRIVATE_KEY in environment variables.\n' +
      'Generate a keypair: solana-keygen new --outfile ~/.config/solana/devnet.json\n' +
      'Then export: export SOLANA_PAYER_PRIVATE_KEY="[your base58 private key]"'
    );
  }

  try {
    // Support both base58 string and JSON array format
    if (PAYER_PRIVATE_KEY.startsWith('[')) {
      const keyArray = JSON.parse(PAYER_PRIVATE_KEY);
      return new Uint8Array(keyArray);
    } else {
      // Base58 string format
      return bs58.decode(PAYER_PRIVATE_KEY);
    }
  } catch (error) {
    throw new Error(
      `Failed to parse SOLANA_PAYER_PRIVATE_KEY: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Validate Solana address format
 */
export function isValidSolanaAddress(address: string): boolean {
  try {
    const decoded = bs58.decode(address);
    return decoded.length === 32;
  } catch {
    return false;
  }
}
