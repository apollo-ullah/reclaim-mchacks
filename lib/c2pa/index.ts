/**
 * C2PA Module for Reclaim Project
 * 
 * Complete implementation of C2PA (Coalition for Content Provenance and Authenticity)
 * signing and verification for digital images.
 * 
 * This module provides:
 * - Image signing with embedded provenance data
 * - Verification of signed images
 * - Extraction of metadata (author, blockchain tx, timestamp)
 * - Cryptographic validation of content authenticity
 * 
 * @example
 * ```typescript
 * import { signImage, verifyImage } from './lib/c2pa';
 * 
 * // Sign an image
 * await signImage(
 *   'input.jpg',
 *   'output_signed.jpg',
 *   { author: 'Noah', txId: 'solana_hash_123' }
 * );
 * 
 * // Verify a signed image
 * const manifest = await verifyImage('output_signed.jpg');
 * console.log(manifest.author, manifest.txId, manifest.isValid);
 * ```
 */

// Export signing functionality
export { signImage, signImageBatch } from './signer';

// Export verification functionality
export { verifyImage, hasC2PAManifest, verifyImageBatch } from './verifier';

// Export configuration
export { getConfig, validateConfig, DEFAULT_CONFIG } from './config';

// Export types
export type {
  C2PASigningMetadata,
  C2PASigningResult,
  C2PAManifest,
  C2PAConfig,
  C2PAAction,
  C2PAActionAssertion,
  ReclaimMetadataAssertion,
} from './types';

export { C2PAError } from './types';

// Export utilities
export {
  isSupportedImageFormat,
  getImageMimeType,
  formatFileSize,
} from './utils';

// Export buffer-based functions for API routes
export {
  signImageBuffer,
  verifyImageBuffer,
  hasC2PAManifestBuffer,
  isC2PAAvailable,
} from './buffer-signer';

