/**
 * C2PA Utility Functions
 * 
 * Helper functions for C2PA operations
 */

import { LocalSigner, type SigningAlg } from '@contentauth/c2pa-node';

/**
 * Creates a local signer instance for C2PA operations
 * 
 * The LocalSigner is responsible for:
 * - Loading the certificate and private key
 * - Performing the actual cryptographic signing
 * - Optionally adding timestamps from a TSA (Time Stamp Authority)
 * 
 * @param certificate - Certificate buffer (PEM format)
 * @param privateKey - Private key buffer (PEM format)
 * @param tsaUrl - Optional Time Stamp Authority URL for trusted timestamps
 * @returns LocalSigner instance
 */
export function createLocalSigner(
  certificate: Buffer,
  privateKey: Buffer,
  tsaUrl?: string
): LocalSigner {
  // ES256 = ECDSA with P-256 curve and SHA-256 hash
  // This is the recommended algorithm for C2PA:
  // - Good security (256-bit strength)
  // - Smaller signatures than RSA
  // - Fast signing and verification
  // - Wide compatibility
  return LocalSigner.newSigner(
    certificate,
    privateKey,
    'es256',
    tsaUrl
  );
}
/**
 * Gets the MIME type for an image based on its file extension
 * 
 * @param filePath - Path to the image file
 * @returns MIME type string
 */
export function getImageMimeType(filePath: string): string {
  const ext = filePath.toLowerCase().slice(filePath.lastIndexOf('.'));
  
  switch (ext) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.webp':
      return 'image/webp';
    default:
      return 'image/jpeg'; // default fallback
  }
}

/**
 * Formats a file size in bytes to a human-readable string
 * 
 * @param bytes - File size in bytes
 * @returns Formatted string (e.g., "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Validates that a file path points to a supported image format
 * 
 * @param filePath - Path to check
 * @returns true if the file extension is supported
 */
export function isSupportedImageFormat(filePath: string): boolean {
  const supportedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
  const ext = filePath.toLowerCase().slice(filePath.lastIndexOf('.'));
  return supportedExtensions.includes(ext);
}
