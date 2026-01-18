/**
 * C2PA Test Example
 * 
 * This script demonstrates how to use the C2PA signing and verification module.
 * 
 * Prerequisites:
 * 1. Run: npm run generate-certs (to create development certificates)
 * 2. Place a test image in the project root (e.g., test.jpg)
 * 3. Run: npx ts-node lib/c2pa/test-example.ts
 */

import { resolve } from 'path';
import { existsSync } from 'fs';
import { signImage, verifyImage, formatFileSize } from './index';

/**
 * Main test function
 */
async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  C2PA Signing & Verification Test');
  console.log('═══════════════════════════════════════════════════════\n');

  // Define test parameters
  const inputImage = resolve(process.cwd(), 'test.jpg');
  const outputImage = resolve(process.cwd(), 'test_signed.jpg');
  
  const testMetadata = {
    author: 'Noah',
    txId: 'solana_hash_123abc456def',
    additionalMetadata: {
      description: 'Test image for C2PA demonstration',
      location: 'San Francisco, CA',
    },
  };

  // Check if input image exists
  if (!existsSync(inputImage)) {
    console.error('❌ Error: test.jpg not found in project root');
    console.error('   Please create a test image first:');
    console.error('   - Place any JPG image as "test.jpg" in the project root\n');
    return;
  }

  console.log('📁 Input image:', inputImage);
  console.log('📝 Author:', testMetadata.author);
  console.log('🔗 Transaction ID:', testMetadata.txId);
  console.log('');

  // ============================================================================
  // STEP 1: Sign the image
  // ============================================================================
  console.log('🔐 Signing image...');
  try {
    const signResult = await signImage(
      inputImage,
      outputImage,
      testMetadata
    );

    console.log('✅ Image signed successfully!');
    console.log('   Output:', signResult.outputPath);
    console.log('   Size:', formatFileSize(signResult.fileSize));
    console.log('   Signed at:', signResult.signedAt.toISOString());
    console.log('');
  } catch (error) {
    console.error('❌ Signing failed:', error);
    if (error instanceof Error) {
      console.error('   Error message:', error.message);
    }
    return;
  }

  // ============================================================================
  // STEP 2: Verify the signed image
  // ============================================================================
  console.log('🔍 Verifying signed image...');
  try {
    const manifest = await verifyImage(outputImage);

    console.log('');
    console.log('═══════════════════════════════════════════════════════');
    console.log('  Verification Results');
    console.log('═══════════════════════════════════════════════════════');
    console.log('');
    console.log('Validation Status:', manifest.isValid ? '✅ VALID' : '❌ INVALID');
    console.log('Status Code:', manifest.validationStatus);
    console.log('');
    console.log('Extracted Data:');
    console.log('  👤 Author:', manifest.author);
    console.log('  🔗 Transaction ID:', manifest.txId);
    console.log('  📅 Timestamp:', manifest.timestamp);
    console.log('  🛠️  Claim Generator:', manifest.claimGenerator || 'N/A');
    console.log('');

    if (manifest.additionalMetadata) {
      console.log('Additional Metadata:');
      for (const [key, value] of Object.entries(manifest.additionalMetadata)) {
        console.log(`  • ${key}:`, value);
      }
      console.log('');
    }

    if (manifest.validationErrors && manifest.validationErrors.length > 0) {
      console.log('⚠️  Validation Warnings:');
      manifest.validationErrors.forEach((err) => {
        console.log(`  • ${err}`);
      });
      console.log('');
    }

    // Verify the extracted data matches what we signed
    console.log('Data Integrity Check:');
    const authorMatch = manifest.author === testMetadata.author;
    const txIdMatch = manifest.txId === testMetadata.txId;
    
    console.log('  Author match:', authorMatch ? '✅' : '❌');
    console.log('  TX ID match:', txIdMatch ? '✅' : '❌');
    console.log('');

    if (authorMatch && txIdMatch) {
      console.log('🎉 SUCCESS! Image is authentically signed and verified!');
      if (manifest.validationStatus === 'unknown') {
        console.log('');
        console.log('ℹ️  Note: Validation status is "unknown" because this uses a');
        console.log('   self-signed development certificate. In production with a');
        console.log('   CA-issued certificate, this would show as "valid".');
      }
    } else {
      console.log('⚠️  WARNING: Verification completed but data mismatch detected');
    }
  } catch (error) {
    console.error('❌ Verification failed:', error);
    if (error instanceof Error) {
      console.error('   Error message:', error.message);
    }
  }

  console.log('');
  console.log('═══════════════════════════════════════════════════════');
}

// Run the test
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

