/**
 * C2PA Verification Module for Reclaim
 * 
 * This module handles reading and verifying C2PA manifests from signed images.
 * It extracts provenance information and validates cryptographic signatures.
 * 
 * Verification Process:
 * 1. Extract the embedded C2PA manifest from the image
 * 2. Verify the cryptographic signature using the embedded certificate
 * 3. Check that the manifest hasn't been tampered with
 * 4. Extract and return the assertions (author, timestamp, blockchain tx)
 */

import { resolve } from 'path';
import { Reader } from '@contentauth/c2pa-node';
import type { C2PAManifest } from './types';
import { C2PAError } from './types';

/**
 * Verifies a C2PA-signed image and extracts its manifest data
 * 
 * This function:
 * 1. Opens the signed image file
 * 2. Reads the embedded C2PA manifest
 * 3. Validates the cryptographic signature
 * 4. Extracts assertions (author, blockchain tx ID, timestamp)
 * 5. Returns structured manifest data with validation status
 * 
 * @param imagePath - Path to the signed image file
 * @returns Promise resolving to the extracted manifest data
 * 
 * @example
 * ```typescript
 * const manifest = await verifyImage('photo_signed.jpg');
 * if (manifest.isValid) {
 *   console.log(`Created by: ${manifest.author}`);
 *   console.log(`Blockchain TX: ${manifest.txId}`);
 *   console.log(`Timestamp: ${manifest.timestamp}`);
 * } else {
 *   console.log('Invalid or tampered image!');
 * }
 * ```
 */
export async function verifyImage(imagePath: string): Promise<C2PAManifest> {
  try {
    const absolutePath = resolve(imagePath);

    // Create a Reader instance for the signed image
    // The Reader automatically:
    // - Extracts the C2PA manifest from the image
    // - Validates the signature against the embedded certificate
    // - Checks the integrity of the manifest and assertions
    const reader = await Reader.fromAsset({ path: absolutePath });

    // Get the active manifest (the most recent claim in the chain)
    // getActive() returns the manifest object directly
    const activeManifest = reader !== null ? reader.getActive() : null;

    // Initialize result variables
    let author = '';
    let txId = '';
    let timestamp = '';
    let claimGenerator: string | undefined;
    let additionalMetadata: Record<string, unknown> | undefined;
    const validationErrors: string[] = [];

    // Extract claim generator if present
    if (activeManifest?.claim_generator_info?.[0]?.name) {
      claimGenerator = activeManifest.claim_generator_info[0].name;
    }

    // === EXTRACTING ASSERTIONS ===
    // Assertions are discrete pieces of provenance information.
    // We need to iterate through them to find our specific data.
    if (activeManifest?.assertions) {
      for (const assertion of activeManifest.assertions) {
        
        // === ASSERTION: c2pa.actions (v1 or v2) ===
        // Standard C2PA assertion containing timestamp and action history
        if (assertion.label === 'c2pa.actions' || assertion.label === 'c2pa.actions.v2') {
          try {
            const actionsData = assertion.data as { actions?: Array<{ when?: string }> };
            if (actionsData?.actions && Array.isArray(actionsData.actions)) {
              // Get the timestamp from the first action (creation)
              const firstAction = actionsData.actions[0];
              if (firstAction?.when) {
                timestamp = firstAction.when;
              }
            }
          } catch (err) {
            validationErrors.push('Failed to parse c2pa.actions assertion');
          }
        }
        
        // === ASSERTION: stds.schema-org.CreativeWork ===
        // Standard schema.org assertion containing our custom metadata
        else if (assertion.label === 'stds.schema-org.CreativeWork') {
          try {
            const creativeWork = assertion.data as {
              author?: { name?: string };
              identifier?: string;
              [key: string]: unknown;
            };
            
            if (typeof creativeWork?.author?.name === 'string') {
              author = creativeWork.author.name;
            }
            if (typeof creativeWork?.identifier === 'string') {
              txId = creativeWork.identifier;
            }

            // Extract any additional metadata fields
            const { author: _, identifier: __, additionalProperty: ___, '@context': ____, '@type': _____, ...rest } = creativeWork;
            if (Object.keys(rest).length > 0) {
              additionalMetadata = rest;
            }
          } catch (err) {
            validationErrors.push('Failed to parse stds.schema-org.CreativeWork assertion');
          }
        }
      }
    }

    // === SIGNATURE VALIDATION ===
    // The validation_status tells us if the signature is cryptographically valid.
    // Possible values:
    // - "valid": Signature is good, manifest hasn't been tampered with
    // - "invalid": Signature check failed, content may be tampered
    // - "unknown": Unable to verify (e.g., certificate not trusted)
    const validationStatus = reader !== null ? (reader as any).validation_status || 'unknown' : 'unknown';
    const isValid = validationStatus === 'valid';

    // Add validation warnings if data is missing
    if (!author) {
      validationErrors.push('Author information not found in manifest');
    }
    if (!txId) {
      validationErrors.push('Blockchain transaction ID not found in manifest');
    }
    if (!timestamp) {
      validationErrors.push('Timestamp not found in manifest');
    }

    return {
      author,
      txId,
      timestamp,
      isValid,
      validationStatus,
      claimGenerator,
      additionalMetadata,
      validationErrors: validationErrors.length > 0 ? validationErrors : undefined,
    };
  } catch (error) {
    // If we can't read the manifest at all, it might not be a C2PA-signed image
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new C2PAError(
      `Failed to verify image: ${errorMessage}`,
      'VERIFICATION_FAILED',
      error
    );
  }
}

/**
 * Checks if an image has a C2PA manifest without full verification
 * Useful for quickly determining if an image is signed
 * 
 * @param imagePath - Path to the image file
 * @returns Promise resolving to true if manifest exists, false otherwise
 */
export async function hasC2PAManifest(imagePath: string): Promise<boolean> {
  try {
    const absolutePath = resolve(imagePath);
    const reader = await Reader.fromAsset({ path: absolutePath });
    return reader !== null && reader.getActive() !== null;
  } catch {
    return false;
  }
}

/**
 * Verifies multiple images in batch
 * 
 * @param imagePaths - Array of image paths to verify
 * @returns Promise resolving to array of manifest results
 */
export async function verifyImageBatch(
  imagePaths: string[]
): Promise<Array<C2PAManifest & { imagePath: string }>> {
  const results = await Promise.allSettled(
    imagePaths.map(async (imagePath) => {
      const manifest = await verifyImage(imagePath);
      return { ...manifest, imagePath };
    })
  );

  return results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      // Return a failed manifest for rejected promises
      return {
        imagePath: imagePaths[index],
        author: '',
        txId: '',
        timestamp: '',
        isValid: false,
        validationStatus: 'error',
        validationErrors: [result.reason?.message || 'Verification failed'],
      };
    }
  });
}

