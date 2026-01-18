# C2PA Content Authenticity Module

Complete implementation of **C2PA (Coalition for Content Provenance and Authenticity)** for the Reclaim project. This module enables cryptographic signing and verification of digital images with embedded provenance data.

## 🎯 What is C2PA?

C2PA is an industry standard for content authenticity and provenance. It allows creators to:
- **Sign** digital content with cryptographic proof of authorship
- **Embed** tamper-evident metadata (who, when, where, why)
- **Verify** content hasn't been altered since signing
- **Track** the complete history of content modifications

### Key Concepts

#### 🔐 Claim
The overall statement of provenance for a piece of content. Think of it as a "certificate of authenticity" that includes:
- The manifest (structured data)
- Digital signature
- Binding to the asset (image)

#### 📝 Assertion
Individual pieces of provenance information within a claim. Examples:
- `c2pa.actions` - What was done (created, edited, etc.)
- `com.reclaim.metadata` - Custom data (author, blockchain tx ID)

#### ✍️ Signature
Cryptographic signature ensuring the claim hasn't been tampered with. Created using a private key and verified using the corresponding certificate.

---

## 🚀 Quick Start

### 1. Generate Certificates

First, create development certificates (ES256/P-256):

```bash
# Make the script executable
chmod +x scripts/generate-c2pa-certs.sh

# Run it
./scripts/generate-c2pa-certs.sh
```

This creates:
- `certs/private.key` - Your signing key (keep secure!)
- `certs/certificate.pem` - Your public certificate

### 2. Sign an Image

```typescript
import { signImage } from '@/lib/c2pa';

const result = await signImage(
  'input.jpg',
  'output_signed.jpg',
  {
    author: 'Noah',
    txId: 'solana_hash_123abc',
  }
);

console.log(`Signed! Size: ${result.fileSize} bytes`);
```

### 3. Verify a Signed Image

```typescript
import { verifyImage } from '@/lib/c2pa';

const manifest = await verifyImage('output_signed.jpg');

if (manifest.isValid) {
  console.log(`Author: ${manifest.author}`);
  console.log(`Blockchain TX: ${manifest.txId}`);
  console.log(`Timestamp: ${manifest.timestamp}`);
} else {
  console.log('Invalid or tampered image!');
}
```

---

## 📚 API Reference

### Signing Functions

#### `signImage(inputPath, outputPath, metadata, config?)`

Signs an image with C2PA manifest.

**Parameters:**
- `inputPath` (string) - Path to input image (JPEG/PNG/WebP)
- `outputPath` (string) - Where to save signed image
- `metadata` (C2PASigningMetadata):
  - `author` (string) - Creator name
  - `txId` (string) - Blockchain transaction ID
  - `additionalMetadata?` (object) - Optional extra data
- `config?` (Partial<C2PAConfig>) - Optional custom config

**Returns:** `Promise<C2PASigningResult>`

**Example:**
```typescript
const result = await signImage(
  'photo.jpg',
  'photo_signed.jpg',
  {
    author: 'Alice',
    txId: '5KJF...9DRx',
    additionalMetadata: {
      location: 'San Francisco',
      camera: 'Canon EOS R5',
    },
  }
);
```

#### `signImageBatch(images, metadata, config?)`

Signs multiple images with the same metadata.

**Parameters:**
- `images` (Array<{inputPath, outputPath}>) - Array of image paths
- `metadata` (C2PASigningMetadata) - Same metadata for all
- `config?` (Partial<C2PAConfig>) - Optional custom config

**Returns:** `Promise<C2PASigningResult[]>`

---

### Verification Functions

#### `verifyImage(imagePath)`

Verifies a C2PA-signed image and extracts manifest.

**Parameters:**
- `imagePath` (string) - Path to signed image

**Returns:** `Promise<C2PAManifest>`

**Example:**
```typescript
const manifest = await verifyImage('signed.jpg');

console.log({
  valid: manifest.isValid,
  author: manifest.author,
  txId: manifest.txId,
  timestamp: manifest.timestamp,
  status: manifest.validationStatus,
});
```

#### `hasC2PAManifest(imagePath)`

Quickly checks if an image has a C2PA manifest.

**Parameters:**
- `imagePath` (string) - Path to image

**Returns:** `Promise<boolean>`

#### `verifyImageBatch(imagePaths)`

Verifies multiple images in parallel.

**Parameters:**
- `imagePaths` (string[]) - Array of image paths

**Returns:** `Promise<Array<C2PAManifest & { imagePath: string }>>`

---

### Configuration

#### `getConfig(customConfig?)`

Gets or creates C2PA configuration.

**Default Configuration:**
```typescript
{
  privateKeyPath: './certs/private.key',
  certificatePath: './certs/certificate.pem',
  claimGenerator: 'Reclaim/1.0.0',
  tsaUrl: undefined, // Optional timestamp authority
}
```

#### `validateConfig(config)`

Validates that certificate files exist. Throws error if missing.

---

## 🔧 TypeScript Types

### `C2PASigningMetadata`

```typescript
interface C2PASigningMetadata {
  author: string;
  txId: string;
  additionalMetadata?: Record<string, unknown>;
}
```

### `C2PAManifest`

```typescript
interface C2PAManifest {
  author: string;
  txId: string;
  timestamp: string;
  isValid: boolean;
  validationStatus: string;
  claimGenerator?: string;
  additionalMetadata?: Record<string, unknown>;
  validationErrors?: string[];
}
```

### `C2PASigningResult`

```typescript
interface C2PASigningResult {
  outputPath: string;
  fileSize: number;
  signedAt: Date;
  success: boolean;
  error?: string;
}
```

---

## 🌐 API Integration

### Next.js API Route Example

Create `app/api/c2pa/sign/route.ts`:

```typescript
import { signImageHandler } from '@/lib/c2pa/api-example';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  return signImageHandler(request);
}
```

### Client-Side Usage

```typescript
const formData = new FormData();
formData.append('image', imageFile);
formData.append('author', 'Noah');
formData.append('txId', solanaSignature);

const response = await fetch('/api/c2pa/sign', {
  method: 'POST',
  body: formData,
});

const signedBlob = await response.blob();
// Download or display the signed image
```

---

## 🔗 Integration with Solana

### Sign After Minting

```typescript
import { signAfterMint } from '@/lib/c2pa/api-example';
import { mintContentHandler } from '@/src/solana';

// 1. Mint to Solana
const mintResult = await mintContentHandler({
  imageUri: 'https://...',
  creatorAddress: '...',
  metadata: { name: 'My Art', description: '...' },
});

// 2. Sign the image with Solana transaction ID
const signedImagePath = await signAfterMint(
  localImagePath,
  'Noah',
  mintResult.signature
);

console.log(`Image minted to Solana and signed with C2PA!`);
```

---

## 🧪 Testing

### Run the Test Example

```bash
# 1. Generate certificates (if not done already)
./scripts/generate-c2pa-certs.sh

# 2. Place a test image
cp /path/to/some/image.jpg test.jpg

# 3. Run the test
npx ts-node lib/c2pa/test-example.ts
```

Expected output:
```
═══════════════════════════════════════════════════════
  C2PA Signing & Verification Test
═══════════════════════════════════════════════════════

🔐 Signing image...
✅ Image signed successfully!
   Output: /path/to/test_signed.jpg
   Size: 2.45 MB
   Signed at: 2026-01-17T...

🔍 Verifying signed image...

═══════════════════════════════════════════════════════
  Verification Results
═══════════════════════════════════════════════════════

Validation Status: ✅ VALID
  👤 Author: Noah
  🔗 Transaction ID: solana_hash_123abc456def
  📅 Timestamp: 2026-01-17T...
  
🎉 SUCCESS! Image is authentically signed and verified!
```

---

## 📦 Supported Formats

- ✅ JPEG (.jpg, .jpeg)
- ✅ PNG (.png)
- ✅ WebP (.webp)

---

## ⚠️ Important Notes

### Development vs. Production

**Development:**
- Self-signed certificates (generated by script)
- Not trusted by external validators
- Perfect for local testing

**Production:**
- Need certificates from a trusted CA (Certificate Authority)
- Consider services like DigiCert, Let's Encrypt, or Sectigo
- C2PA certificates need specific Extended Key Usage (EKU) fields

### Security Best Practices

1. **Never commit** `certs/private.key` to version control
2. Add to `.gitignore`:
   ```
   certs/
   temp/
   ```
3. In production, use environment variables or secure vaults for keys
4. Rotate certificates before expiration

### Certificate Requirements

C2PA certificates must have:
- **Key Usage:** digitalSignature
- **Extended Key Usage:** 
  - emailProtection (OID: 1.3.6.1.5.5.7.3.4)
  - documentSigning (OID: 1.3.6.1.4.1.311.10.3.12)
- **Algorithm:** ES256 (ECDSA P-256) recommended, RSA-2048 also supported

---

## 🛠️ Troubleshooting

### Error: "Private key not found"

**Solution:** Run the certificate generation script:
```bash
./scripts/generate-c2pa-certs.sh
```

### Error: "Failed to sign image"

**Check:**
1. Image file exists and is readable
2. Output directory exists or is writable
3. Image format is supported (JPEG/PNG/WebP)

### Error: "Verification failed"

**Possible causes:**
1. Image doesn't have a C2PA manifest (not signed)
2. Manifest was tampered with
3. Certificate not trusted (normal for self-signed in dev)

### Validation Status: "unknown"

This is normal for self-signed development certificates. The signature is cryptographically valid, but the certificate isn't in the system's trust store.

---

## 📖 Further Reading

- [C2PA Specification](https://c2pa.org/specifications/)
- [ContentAuth Documentation](https://opensource.contentauthenticity.org/)
- [C2PA-Node Library](https://github.com/contentauth/c2pa-node)

---

## 📄 License

This C2PA module is part of the Reclaim project. See the main project LICENSE for details.

---

## 🤝 Contributing

Found a bug or want to improve the C2PA module? Contributions welcome!

---

**Built with ❤️ for the Reclaim hackathon project**

