/**
 * Buffer-based C2PA Signing and Verification
 *
 * This module wraps the file-based C2PA operations to work with buffers,
 * making it compatible with Next.js API routes that handle image data in memory.
 */

import { writeFile, readFile, unlink, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { tmpdir } from 'os';
import { signImage } from './signer';
import { verifyImage, hasC2PAManifest } from './verifier';
import { validateConfig, DEFAULT_CONFIG } from './config';
import type { C2PASigningMetadata, C2PAManifest } from './types';

// Temp directory for C2PA operations
const TEMP_DIR = join(tmpdir(), 'reclaim-c2pa');

/**
 * Ensures the temp directory exists
 */
async function ensureTempDir(): Promise<void> {
  if (!existsSync(TEMP_DIR)) {
    await mkdir(TEMP_DIR, { recursive: true });
  }
}

/**
 * Cleans up temp files
 */
async function cleanupTempFiles(...paths: string[]): Promise<void> {
  for (const path of paths) {
    try {
      await unlink(path);
    } catch {
      // Ignore cleanup errors
    }
  }
}

/**
 * Checks if C2PA signing is available (certificates exist)
 */
export function isC2PAAvailable(): boolean {
  try {
    validateConfig(DEFAULT_CONFIG);
    return true;
  } catch {
    return false;
  }
}

/**
 * Signs an image buffer with C2PA manifest
 *
 * @param imageBuffer - The image data as a buffer
 * @param metadata - Signing metadata (author, txId)
 * @param format - Image format ('png' or 'jpeg')
 * @returns The signed image buffer, or null if C2PA is not available
 */
export async function signImageBuffer(
  imageBuffer: Buffer,
  metadata: C2PASigningMetadata,
  format: 'png' | 'jpeg' = 'png'
): Promise<Buffer | null> {
  // Check if C2PA is available
  if (!isC2PAAvailable()) {
    console.warn('C2PA signing skipped: certificates not found. Run `npm run generate-certs` to enable.');
    return null;
  }

  await ensureTempDir();

  const extension = format === 'png' ? '.png' : '.jpg';
  const inputPath = join(TEMP_DIR, `input-${randomUUID()}${extension}`);
  const outputPath = join(TEMP_DIR, `output-${randomUUID()}${extension}`);

  try {
    // Write input buffer to temp file
    await writeFile(inputPath, imageBuffer);

    // Sign with C2PA
    await signImage(inputPath, outputPath, metadata);

    // Read the signed image back to buffer
    const signedBuffer = await readFile(outputPath);

    return signedBuffer;
  } finally {
    // Always clean up temp files
    await cleanupTempFiles(inputPath, outputPath);
  }
}

/**
 * Verifies a C2PA-signed image buffer
 *
 * @param imageBuffer - The image data as a buffer
 * @param format - Image format ('png' or 'jpeg')
 * @returns The C2PA manifest data, or null if no manifest found
 */
export async function verifyImageBuffer(
  imageBuffer: Buffer,
  format: 'png' | 'jpeg' = 'png'
): Promise<C2PAManifest | null> {
  await ensureTempDir();

  const extension = format === 'png' ? '.png' : '.jpg';
  const tempPath = join(TEMP_DIR, `verify-${randomUUID()}${extension}`);

  try {
    // Write buffer to temp file
    await writeFile(tempPath, imageBuffer);

    // Check if it has a C2PA manifest
    const hasManifest = await hasC2PAManifest(tempPath);
    if (!hasManifest) {
      return null;
    }

    // Verify and extract manifest
    const manifest = await verifyImage(tempPath);
    return manifest;
  } catch (error) {
    // If verification fails, return null (no valid manifest)
    console.error('C2PA verification error:', error);
    return null;
  } finally {
    // Always clean up temp file
    await cleanupTempFiles(tempPath);
  }
}

/**
 * Quick check if an image buffer has a C2PA manifest
 *
 * @param imageBuffer - The image data as a buffer
 * @param format - Image format ('png' or 'jpeg')
 * @returns True if the image has a C2PA manifest
 */
export async function hasC2PAManifestBuffer(
  imageBuffer: Buffer,
  format: 'png' | 'jpeg' = 'png'
): Promise<boolean> {
  await ensureTempDir();

  const extension = format === 'png' ? '.png' : '.jpg';
  const tempPath = join(TEMP_DIR, `check-${randomUUID()}${extension}`);

  try {
    await writeFile(tempPath, imageBuffer);
    return await hasC2PAManifest(tempPath);
  } catch {
    return false;
  } finally {
    await cleanupTempFiles(tempPath);
  }
}
