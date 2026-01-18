# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Reclaim is a steganography-based image authentication platform that embeds invisible watermarks into images to prove creator provenance. It combines LSB (Least Significant Bit) watermarking, C2PA (Content Credentials) standards, and Solana blockchain integration for immutable provenance records via compressed NFTs.

## Commands

```bash
# Development
npm run dev              # Start dev server on port 3000
npm run build            # Production build
npm run lint             # Run ESLint

# Solana
npm run init-tree        # Initialize Merkle tree (required once before minting)
npm run test             # Run all Solana tests
npm run test:auth        # Test auth module only
npm run test:mint        # Test minting module only

# C2PA
npm run generate-certs   # Generate certificates in certs/ directory
npm run test:c2pa        # Test C2PA signing/verification
```

## Architecture

### Core Flow
1. **Sign**: User uploads image → Chooses authentic/AI → LSB watermark embedded → C2PA manifest added → PNG returned with dual provenance
2. **Generate**: User enters prompt → DALL-E generates image → Auto-signed as AI (LSB + C2PA) → PNG returned
3. **Verify**: User uploads image → LSB watermark extracted + C2PA manifest verified → Creator/timestamp/source type validated
4. **Mint (optional)**: Signed image registered as compressed NFT on Solana

### Directory Structure

- `app/` - Next.js App Router pages and API routes
  - `api/sign/` - Watermark embedding endpoint (accepts source_type: authentic/ai)
  - `api/verify/` - Watermark extraction/verification endpoint (returns source_type)
  - `api/generate/` - AI image generation via Gemini (auto-signs as AI)
  - `api/auth/` - Creator signup and wallet verification
  - `api/creator/[id]/` - Creator profile data
  - Core pages: `/sign`, `/verify`, `/generate`, `/signup`, `/login`, `/creator/[id]`, `/settings`
  - Marketing pages: `/why-us`, `/platform`, `/docs`, `/blog`, `/contact`
- `lib/` - Core utilities
  - `steganography.ts` - LSB watermark embed/extract (2 bits/pixel in blue/green channels)
  - `db.ts` - MongoDB operations (mongoose with connection caching for serverless)
  - `auth-context.tsx` - React context for wallet auth state
  - `utils.ts` - Tailwind CSS class merging utility (`cn` function)
  - `c2pa/` - C2PA (Content Credentials) implementation
    - `signer.ts` - Sign images with embedded provenance manifest (file-based)
    - `verifier.ts` - Verify and extract C2PA manifests (file-based)
    - `buffer-signer.ts` - Buffer-based C2PA operations for API routes
    - `config.ts` - Certificate paths and configuration
    - `types.ts` - TypeScript interfaces for C2PA data
    - `utils.ts` - C2PA utility functions
- `src/solana/` - Blockchain integration
  - `auth.ts` - Sign-In with Solana (SIWS) + JWT auth
  - `mint.ts` - Compressed NFT minting via Metaplex Bubblegum
  - `init-tree.ts` - Merkle tree initialization script
- `components/` - React components
  - `WalletProvider.tsx` - Solana wallet adapter context
  - `navbar.tsx`, `hero-section.tsx` - UI components with glassmorphism design
  - `video-upload.tsx` - Verification upload component
  - `VerificationResult.tsx` - Displays verified/tampered/unsigned states

### Watermark Payload Structure
```json
{
  "v": 1,              // Version
  "c": "creator_id",   // Creator wallet address
  "t": 1737072000,     // Unix timestamp
  "h": "a1b2c3d4",     // First 8 chars of image SHA-256
  "s": "authentic"     // Source type: "authentic" (human) or "ai" (AI-generated)
}
```
Magic header: `RECLAIM_V1:`

### Database Schema (MongoDB Atlas)
- `creators`: _id (wallet address), display_name, bio, twitter, website, avatar_url, created_at
- `signedimages`: creator_id, original_hash, source_type ("authentic"/"ai"), ai_prompt (optional), signed_at, cnft_address (optional)

## Environment Variables

Required in `.env`:
```
MONGODB_URI=            # MongoDB Atlas connection string
SOLANA_RPC_URL=         # Helius RPC with DAS API support
SOLANA_PAYER_PRIVATE_KEY=  # Backend wallet (pays gas)
SOLANA_TREE_ADDRESS=    # From init-tree script output
JWT_SECRET=             # Generate: openssl rand -base64 32
OPENAI_API_KEY=         # OpenAI API key for DALL-E image generation
```

## Technical Constraints

**LSB watermarks are fragile by design** - they do NOT survive:
- JPEG compression
- Screenshots
- Social media re-encoding
- Resizing/cropping

This is intentional "tamper evidence" - if the watermark is destroyed, the image was modified.

**Image output must always be PNG** (lossless) to preserve LSB data.

**Wallet connection** must be client-side only - use `useState`/`useEffect` pattern to prevent SSR errors.

**Solana minting** requires `init-tree` to be run first to create the Merkle tree address.

## C2PA (Content Credentials)

C2PA provides industry-standard content provenance that survives re-encoding (unlike LSB steganography). **C2PA is now integrated into the sign/generate/verify APIs.**

**Setup:** Run `npm run generate-certs` to generate certificates in `certs/` directory.

**Automatic Integration:**
- `/api/sign` - Applies both LSB watermark AND C2PA manifest (if certs available)
- `/api/generate` - Generated AI images get both LSB + C2PA signatures
- `/api/verify` - Checks both LSB and C2PA manifests, returns combined result

**Buffer-based API (for API routes):**
```typescript
import { signImageBuffer, verifyImageBuffer, isC2PAAvailable } from '@/lib/c2pa';

// Check if C2PA is available (certs exist)
if (isC2PAAvailable()) {
  // Sign a buffer with C2PA
  const signedBuffer = await signImageBuffer(imageBuffer, {
    author: 'Creator Name',
    txId: 'image_hash_or_tx_id',
    additionalMetadata: { sourceType: 'authentic' }
  }, 'png');

  // Verify a buffer
  const manifest = await verifyImageBuffer(signedBuffer, 'png');
  // { author, txId, timestamp, isValid, validationStatus }
}
```

**File-based API (for scripts):**
```typescript
import { signImage, verifyImage } from '@/lib/c2pa';

await signImage('input.jpg', 'output.jpg', { author: 'Name', txId: 'hash' });
const manifest = await verifyImage('output.jpg');
```

**C2PA vs LSB:**
- **C2PA**: Survives compression/re-encoding, industry standard, visible in CAI tools
- **LSB**: Fragile (destroyed if modified), provides tamper-evidence

## UI Design System

The frontend uses a dark glassmorphism aesthetic with Tailwind CSS:
- Background: `#0B0F1A`
- Primary blue: `#4F7CFF`, `#5B8DEF`
- Muted text: `#94A3B8`
- Border: `#1E293B`
- Glassmorphism: `backdrop-filter: blur(12px)` with semi-transparent backgrounds
- Border radius: `rounded-[14px]` for buttons, `rounded-2xl` for cards
- Icons: Lucide React

Use the `cn()` utility from `lib/utils.ts` for conditional class merging.
