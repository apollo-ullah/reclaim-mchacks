/**
 * C2PA Signing Module for Reclaim
 * 
 * This module handles the creation and signing of C2PA manifests for images.
 * It embeds provenance information including:
 * - Author/creator information
 * - Blockchain transaction ID (Solana)
 * - Timestamp of creation
 * - Digital signature to prevent tampering
 * 
 * C2PA Concepts Explained:
 * 
 * - CLAIM: The overall statement of provenance for a piece of content. It includes
 *   the manifest, signature, and binds them to the asset (image). Think of it as
 *   the "certificate of authenticity" for digital content.
 * 
 * - ASSERTION: Individual pieces of provenance information within a claim. Each
 *   assertion has a specific type (label) and contains structured data. Examples:
 *   * c2pa.actions - records what was done (created, edited, etc.)
 *   * com.reclaim.metadata - our custom assertion with author and blockchain info
 * 
 * - SIGNATURE: The cryptographic signature that ensures the claim and its assertions
 *   haven't been tampered with. Created using a private key; verified using the
 *   corresponding certificate embedded in the manifest.
 */

import { readFile, stat } from 'fs/promises';
import { resolve } from 'path';
import { Builder } from '@contentauth/c2pa-node';
import { createLocalSigner } from './utils';
import { getConfig } from './config';
import type { 
  C2PASigningMetadata, 
  C2PASigningResult, 
  C2PAConfig,
  C2PAActionAssertion,
  ReclaimMetadataAssertion
} from './types';
import { C2PAError } from './types';

/**
 * Signs an image with C2PA manifest containing provenance information
 * 
 * This function:
 * 1. Loads the signing certificate and private key
 * 2. Creates a C2PA manifest with two assertions:
 *    a) c2pa.actions - standard C2PA assertion indicating content was created
 *    b) com.reclaim.metadata - custom assertion with author and blockchain tx ID
 * 3. Cryptographically signs the manifest
 * 4. Embeds the signed manifest into the image file
 * 
 * @param inputPath - Path to the input image (JPEG or PNG)
 * @param outputPath - Path where the signed image will be saved
 * @param metadata - Signing metadata (author, txId, etc.)
 * @param config - Optional custom configuration (certificates, keys)
 * @returns Promise resolving to signing result
 * 
 * @example
 * ```typescript
 * const result = await signImage(
 *   'photo.jpg',
 *   'photo_signed.jpg',
 *   { author: 'Noah', txId: 'solana_hash_123' }
 * );
 * console.log(`Signed image created at: ${result.outputPath}`);
 * ```
 */
export async function signImage(
  inputPath: string,
  outputPath: string,
  metadata: C2PASigningMetadata,
  config?: Partial<C2PAConfig>
): Promise<C2PASigningResult> {
  try {
    // Get and validate configuration
    const c2paConfig = getConfig(config);
    
    // Load certificate and private key
    const [certificate, privateKey] = await Promise.all([
      readFile(c2paConfig.certificatePath),
      readFile(c2paConfig.privateKeyPath),
    ]);

    // Create a local signer using ES256 (ECDSA with P-256 curve and SHA-256)
    // This is the recommended algorithm for C2PA as it provides good security
    // with smaller signature sizes compared to RSA
    const signer = createLocalSigner(
      certificate,
      privateKey,
      c2paConfig.tsaUrl
    );

    // Resolve paths to absolute
    const absoluteInputPath = resolve(inputPath);
    const absoluteOutputPath = resolve(outputPath);

    // Create a new manifest builder
    const builder = Builder.new();

    // === ASSERTION 1: c2pa.actions ===
    // This is a standard C2PA assertion that records what action was performed.
    // In this case, we're marking it as "created" since this is the original
    // signed version of the content. The timestamp is automatically added.
    const actionsAssertion: C2PAActionAssertion = {
      actions: [
        {
          action: 'c2pa.created',
          when: new Date().toISOString(),
          softwareAgent: c2paConfig.claimGenerator || 'Reclaim/1.0.0',
        },
      ],
    };
    builder.addAssertion('c2pa.actions', actionsAssertion);

    // === ASSERTION 2: stds.schema-org.CreativeWork ===
    // Using a standard schema.org assertion type for better compatibility
    // This stores our custom metadata in a C2PA-compatible format
    const creativeWorkAssertion = {
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      author: {
        '@type': 'Person',
        name: metadata.author,
      },
      identifier: metadata.txId,
      additionalProperty: {
        '@type': 'PropertyValue',
        name: 'blockchain',
        value: 'solana',
      },
      ...metadata.additionalMetadata,
    };
    builder.addAssertion('stds.schema-org.CreativeWork', creativeWorkAssertion);

    // Define the manifest metadata
    // The claim_generator identifies the software that created this claim
    const manifestDefinition = {
      claim_generator: c2paConfig.claimGenerator || 'Reclaim/1.0.0',
      title: `Signed by ${metadata.author}`,
      format: inputPath.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg',
    };

    // === SIGNING PROCESS ===
    // The Builder.sign() method does several things:
    // 1. Creates a CLAIM that bundles all assertions together
    // 2. Generates a cryptographic hash of the claim + asset
    // 3. Signs the hash using the private key (creating the SIGNATURE)
    // 4. Embeds the claim, signature, and certificate into the image
    // 5. Writes the signed image to the output path
    await builder.sign(
      signer,
      { path: absoluteInputPath },
      { path: absoluteOutputPath }
    );

    // Get file statistics for the result
    const stats = await stat(absoluteOutputPath);

    return {
      outputPath: absoluteOutputPath,
      fileSize: stats.size,
      signedAt: new Date(),
      success: true,
    };
  } catch (error) {
    // Convert any errors to our custom C2PAError type
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new C2PAError(
      `Failed to sign image: ${errorMessage}`,
      'SIGNING_FAILED',
      error
    );
  }
}

/**
 * Signs multiple images in batch with the same metadata
 * Useful for signing a series of images from the same creator
 * 
 * @param images - Array of {input, output} path pairs
 * @param metadata - Signing metadata to apply to all images
 * @param config - Optional custom configuration
 * @returns Promise resolving to array of results
 */
export async function signImageBatch(
  images: Array<{ inputPath: string; outputPath: string }>,
  metadata: C2PASigningMetadata,
  config?: Partial<C2PAConfig>
): Promise<C2PASigningResult[]> {
  const results: C2PASigningResult[] = [];
  
  for (const { inputPath, outputPath } of images) {
    try {
      const result = await signImage(inputPath, outputPath, metadata, config);
      results.push(result);
    } catch (error) {
      // Push failed result but continue processing other images
      results.push({
        outputPath,
        fileSize: 0,
        signedAt: new Date(),
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
  
  return results;
}

