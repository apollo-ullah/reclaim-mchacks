# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Reclaim is a steganography-based image authentication platform that embeds invisible watermarks into images to prove creator provenance. It combines LSB (Least Significant Bit) watermarking with Solana blockchain integration for immutable provenance records via compressed NFTs.

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
```

## Architecture

### Core Flow
1. **Sign**: User uploads image → LSB watermark embedded → PNG returned with provenance data
2. **Verify**: User uploads image → LSB watermark extracted → Creator/timestamp validated
3. **Mint (optional)**: Signed image registered as compressed NFT on Solana

### Directory Structure

- `app/` - Next.js App Router pages and API routes
  - `api/sign/` - Watermark embedding endpoint
  - `api/verify/` - Watermark extraction/verification endpoint
  - `api/auth/` - Creator signup and wallet verification
  - `api/creator/[id]/` - Creator profile data
- `lib/` - Core utilities
  - `steganography.ts` - LSB watermark embed/extract (2 bits/pixel in blue/green channels)
  - `db.ts` - MongoDB operations (mongoose with connection caching for serverless)
  - `auth-context.tsx` - React context for wallet auth state
- `src/solana/` - Blockchain integration
  - `auth.ts` - Sign-In with Solana (SIWS) + JWT auth
  - `mint.ts` - Compressed NFT minting via Metaplex Bubblegum
  - `init-tree.ts` - Merkle tree initialization script
- `components/` - React components including WalletProvider for Solana wallet adapter

### Watermark Payload Structure
```json
{
  "v": 1,              // Version
  "c": "creator_id",   // Creator wallet address
  "t": 1737072000,     // Unix timestamp
  "h": "a1b2c3d4"      // First 8 chars of image SHA-256
}
```
Magic header: `RECLAIM_V1:`

### Database Schema (MongoDB Atlas)
- `creators`: _id (wallet address), display_name, created_at
- `signedimages`: creator_id, original_hash, signed_at, cnft_address (optional - links to Solana cNFT)

## Environment Variables

Required in `.env`:
```
MONGODB_URI=            # MongoDB Atlas connection string
SOLANA_RPC_URL=         # Helius RPC with DAS API support
SOLANA_PAYER_PRIVATE_KEY=  # Backend wallet (pays gas)
SOLANA_TREE_ADDRESS=    # From init-tree script output
JWT_SECRET=             # Generate: openssl rand -base64 32
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
