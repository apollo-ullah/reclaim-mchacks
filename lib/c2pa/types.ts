/**
 * C2PA Type Definitions for Reclaim Project
 * 
 * These types define the structure of C2PA manifests, assertions, and related data
 * used throughout the content authenticity system.
 */

/**
 * Represents the core metadata for signing an image with C2PA
 */
export interface C2PASigningMetadata {
  /** The creator/author of the content */
  author: string;
  
  /** Blockchain transaction ID for timestamping */
  txId: string;
  
  /** Optional: Additional custom metadata */
  additionalMetadata?: Record<string, unknown>;
}

/**
 * Result of a C2PA signing operation
 */
export interface C2PASigningResult {
  /** Path to the signed image file */
  outputPath: string;
  
  /** Size of the output file in bytes */
  fileSize: number;
  
  /** Timestamp when the signature was created */
  signedAt: Date;
  
  /** Success indicator */
  success: boolean;
  
  /** Optional error message if signing failed */
  error?: string;
}

/**
 * Extracted manifest data from a signed image
 */
export interface C2PAManifest {
  /** Author name from the custom assertion */
  author: string;
  
  /** Blockchain transaction ID from the custom assertion */
  txId: string;
  
  /** ISO 8601 timestamp from c2pa.actions assertion */
  timestamp: string;
  
  /** Whether the signature and manifest are cryptographically valid */
  isValid: boolean;
  
  /** Validation status from C2PA (e.g., "valid", "invalid", "unknown") */
  validationStatus: string;
  
  /** The claim generator that created this manifest */
  claimGenerator?: string;
  
  /** Additional custom metadata if present */
  additionalMetadata?: Record<string, unknown>;
  
  /** Any validation errors or warnings */
  validationErrors?: string[];
}

/**
 * Configuration for C2PA signing
 */
export interface C2PAConfig {
  /** Path to the private key file (PEM format) */
  privateKeyPath: string;
  
  /** Path to the certificate file (PEM format) */
  certificatePath: string;
  
  /** Optional: URL to a Time Stamp Authority for trusted timestamps */
  tsaUrl?: string;
  
  /** Optional: Custom claim generator identifier */
  claimGenerator?: string;
}

/**
 * C2PA Action types as defined in the specification
 */
export type C2PAAction = 
  | 'c2pa.created'
  | 'c2pa.edited'
  | 'c2pa.published'
  | 'c2pa.placed'
  | 'c2pa.transcoded'
  | 'c2pa.unknown';

/**
 * Structure of a C2PA action assertion
 */
export interface C2PAActionAssertion {
  actions: Array<{
    action: C2PAAction;
    when?: string;
    softwareAgent?: string;
    parameters?: Record<string, unknown>;
  }>;
}

/**
 * Custom assertion for Reclaim blockchain metadata
 */
export interface ReclaimMetadataAssertion {
  '@context': string;
  author: string;
  tx_id: string;
  blockchain: 'solana';
  version: string;
  [key: string]: unknown;
}

/**
 * Error thrown when C2PA operations fail
 */
export class C2PAError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'C2PAError';
  }
}

