/**
 * C2PA API Integration Example
 * 
 * This file shows how to integrate the C2PA signing module into your API routes.
 * You can use this as a reference for implementing C2PA in your Next.js API handlers.
 */

import { signImage, verifyImage, type C2PASigningMetadata } from './index';
import type { NextRequest } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

/**
 * Example: API Route Handler for Signing Images
 * 
 * Usage in your API route (e.g., app/api/c2pa/sign/route.ts):
 * 
 * ```typescript
 * import { signImageHandler } from '@/lib/c2pa/api-example';
 * export async function POST(request: NextRequest) {
 *   return signImageHandler(request);
 * }
 * ```
 */
export async function signImageHandler(request: NextRequest) {
  try {
    // Parse the incoming form data
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;
    const author = formData.get('author') as string;
    const txId = formData.get('txId') as string;

    // Validate inputs
    if (!imageFile || !author || !txId) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields: image, author, txId' 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create temporary directory for processing
    const tempDir = join(process.cwd(), 'temp');
    if (!existsSync(tempDir)) {
      await mkdir(tempDir, { recursive: true });
    }

    // Save uploaded file temporarily
    const timestamp = Date.now();
    const inputPath = join(tempDir, `input_${timestamp}_${imageFile.name}`);
    const outputPath = join(tempDir, `signed_${timestamp}_${imageFile.name}`);

    const imageBuffer = Buffer.from(await imageFile.arrayBuffer());
    await writeFile(inputPath, imageBuffer);

    // Sign the image with C2PA
    const metadata: C2PASigningMetadata = {
      author,
      txId,
      additionalMetadata: {
        uploadedAt: new Date().toISOString(),
        originalFilename: imageFile.name,
      },
    };

    const result = await signImage(inputPath, outputPath, metadata);

    // Read the signed image to send back
    const signedImageBuffer = await import('fs/promises').then(fs => 
      fs.readFile(outputPath)
    );

    // Clean up temporary input file (keep output for potential later retrieval)
    await import('fs/promises').then(fs => fs.unlink(inputPath));

    // Return the signed image
    return new Response(signedImageBuffer, {
      status: 200,
      headers: {
        'Content-Type': imageFile.type,
        'Content-Disposition': `attachment; filename="signed_${imageFile.name}"`,
        'X-C2PA-Signed': 'true',
        'X-C2PA-Author': author,
        'X-C2PA-TxId': txId,
      },
    });
  } catch (error) {
    console.error('C2PA signing error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to sign image',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Example: API Route Handler for Verifying Images
 * 
 * Usage in your API route (e.g., app/api/c2pa/verify/route.ts):
 * 
 * ```typescript
 * import { verifyImageHandler } from '@/lib/c2pa/api-example';
 * export async function POST(request: NextRequest) {
 *   return verifyImageHandler(request);
 * }
 * ```
 */
export async function verifyImageHandler(request: NextRequest) {
  try {
    // Parse the incoming form data
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;

    // Validate input
    if (!imageFile) {
      return new Response(
        JSON.stringify({ error: 'Missing image file' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create temporary directory for processing
    const tempDir = join(process.cwd(), 'temp');
    if (!existsSync(tempDir)) {
      await mkdir(tempDir, { recursive: true });
    }

    // Save uploaded file temporarily
    const timestamp = Date.now();
    const imagePath = join(tempDir, `verify_${timestamp}_${imageFile.name}`);

    const imageBuffer = Buffer.from(await imageFile.arrayBuffer());
    await writeFile(imagePath, imageBuffer);

    // Verify the image
    const manifest = await verifyImage(imagePath);

    // Clean up temporary file
    await import('fs/promises').then(fs => fs.unlink(imagePath));

    // Return verification results
    return new Response(
      JSON.stringify({
        success: true,
        manifest: {
          author: manifest.author,
          txId: manifest.txId,
          timestamp: manifest.timestamp,
          isValid: manifest.isValid,
          validationStatus: manifest.validationStatus,
          claimGenerator: manifest.claimGenerator,
          additionalMetadata: manifest.additionalMetadata,
          validationErrors: manifest.validationErrors,
        },
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('C2PA verification error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to verify image',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Example: Integrate with your existing Solana minting flow
 * 
 * This shows how to sign an image after minting to Solana
 */
export async function signAfterMint(
  imagePath: string,
  author: string,
  solanaSignature: string
): Promise<string> {
  const outputPath = imagePath.replace(/(\.\w+)$/, '_signed$1');
  
  await signImage(imagePath, outputPath, {
    author,
    txId: solanaSignature,
    additionalMetadata: {
      blockchain: 'solana',
      network: process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet',
      mintedAt: new Date().toISOString(),
    },
  });

  return outputPath;
}

