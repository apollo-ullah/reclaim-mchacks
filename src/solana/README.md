# Solana Compressed NFT Integration

This module handles minting of Compressed NFTs (cNFTs) for content provenance using Metaplex Bubblegum.

## 📁 Folder Structure

```
src/solana/
├── init-tree.ts    # One-time script to create Merkle Tree
├── mint.ts         # Minting service for registering content
├── index.ts        # Module exports
└── README.md       # This file
```

## 🚀 Setup Instructions

### 1. Install Dependencies

Already installed in your project:
- `@metaplex-foundation/umi`
- `@metaplex-foundation/umi-bundle-defaults`
- `@metaplex-foundation/mpl-bubblegum`
- `@solana/web3.js`
- `bs58`

### 2. Generate a Solana Wallet (Backend Payer)

This wallet will:
- Pay gas fees for minting (~$0.000005 per cNFT)
- Act as the tree authority

```bash
# Generate new keypair
solana-keygen new --outfile ~/.config/solana/devnet.json

# Get your address
solana-keygen pubkey ~/.config/solana/devnet.json

# Request devnet SOL (for testing)
solana airdrop 2 YOUR_ADDRESS --url devnet
```

### 3. Configure Environment Variables

Create a `.env` file in your project root:

```bash
# Solana RPC (use Helius or Triton for production with DAS support)
SOLANA_RPC_URL=https://api.devnet.solana.com

# Backend payer private key (Base58 format)
# Get from: solana-keygen export ~/.config/solana/devnet.json
SOLANA_PAYER_PRIVATE_KEY=your_base58_private_key_here

# Tree address (generated after running init-tree.ts)
SOLANA_TREE_ADDRESS=

# Optional: Collection NFT address (for grouping all app cNFTs)
SOLANA_COLLECTION_ADDRESS=
```

### 4. Initialize the Merkle Tree (ONE TIME ONLY)

```bash
npx ts-node src/solana/init-tree.ts
```

**Expected Output:**
```
🌳 Initializing Compressed NFT Merkle Tree...

Tree Configuration:
  Max Depth: 14
  Max Buffer Size: 64
  Estimated Capacity: 16,384 assets
  Estimated Cost: ~0.1 SOL

✅ Tree created successfully!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 SAVE THESE VALUES TO YOUR .env FILE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SOLANA_TREE_ADDRESS=AbC123...xyz789
SOLANA_RPC_URL=https://api.devnet.solana.com
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**⚠️ IMPORTANT:** Copy the `SOLANA_TREE_ADDRESS` to your `.env` file!

## 💻 Usage

### Option A: Use in Express Routes

```typescript
import express from 'express';
import { mintContentHandler } from './src/solana/mint';

const app = express();
app.use(express.json());

// Register content endpoint
app.post('/api/content/register', mintContentHandler);

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

### Option B: Use as a Service Function

```typescript
import { registerContentAsset } from './src/solana';

async function registerUserContent() {
  const result = await registerContentAsset({
    userWalletAddress: '8xYz...abc',  // User's Phantom wallet
    metadataUri: 'https://arweave.net/abc123',  // JSON metadata
    imageHash: 'sha256:abc123...',     // Visual hash
    licenseName: 'CC-BY-NC-4.0',       // Optional
    contentName: 'My Artwork'          // Optional
  });

  if (result.success) {
    console.log('✅ Minted!', result.signature);
    console.log('View on Explorer:', result.transactionUrl);
  } else {
    console.error('❌ Failed:', result.error);
  }
}
```

### Option C: Batch Minting

```typescript
import { batchRegisterAssets } from './src/solana';

const assets = [
  {
    userWalletAddress: '8xYz...abc',
    metadataUri: 'https://arweave.net/image1',
    imageHash: 'hash1'
  },
  {
    userWalletAddress: '9xYz...def',
    metadataUri: 'https://arweave.net/image2',
    imageHash: 'hash2'
  }
];

const results = await batchRegisterAssets(assets);
console.log(`Minted ${results.filter(r => r.success).length}/${results.length} assets`);
```

## 🔌 Full Integration Example

```typescript
// Example: Content Upload Flow
import { Request, Response } from 'express';
import { registerContentAsset } from './src/solana';
import { authenticateWithSolana } from './auth';

// Step 1: User authenticates with Phantom wallet
app.post('/api/auth/login', authenticateWithSolana);

// Step 2: User uploads content
app.post('/api/content/upload', verifyJWT, async (req: Request, res: Response) => {
  const walletAddress = (req as any).walletAddress; // From JWT
  const { imageFile, metadataUri, imageHash } = req.body;

  // TODO: Upload to Arweave/IPFS, embed C2PA, etc.

  // Step 3: Mint cNFT to register ownership
  const result = await registerContentAsset({
    userWalletAddress: walletAddress,
    metadataUri,
    imageHash,
    licenseName: 'Standard-Commercial',
    contentName: 'User Content'
  });

  if (result.success) {
    return res.json({
      success: true,
      message: 'Content registered on blockchain',
      signature: result.signature,
      explorerUrl: result.transactionUrl
    });
  } else {
    return res.status(500).json({
      success: false,
      error: result.error
    });
  }
});
```

## 📊 Metadata Format

The `metadataUri` should point to a JSON file with this structure:

```json
{
  "name": "Copyright Claim",
  "description": "Content provenance certificate",
  "image": "https://arweave.net/image_hash",
  "attributes": [
    {
      "trait_type": "VisualHash",
      "value": "sha256:abc123..."
    },
    {
      "trait_type": "License",
      "value": "CC-BY-NC-4.0"
    },
    {
      "trait_type": "C2PAManifest",
      "value": "https://arweave.net/manifest_hash"
    },
    {
      "trait_type": "UploadTimestamp",
      "value": "2026-01-17T12:00:00Z"
    }
  ],
  "properties": {
    "files": [
      {
        "uri": "https://arweave.net/image_hash",
        "type": "image/png"
      }
    ],
    "category": "image"
  }
}
```

## 🔍 Verification (Phase 4)

See `integration_info.md` for verification logic using DAS API.

## 💰 Cost Breakdown

| Item | Devnet | Mainnet |
|------|--------|---------|
| Create Tree (one-time) | ~0.1 SOL | ~0.1 SOL |
| Mint cNFT (per asset) | ~0.00001 SOL | ~$0.000005 |
| 10,000 mints | ~0.1 SOL | ~$0.05 |

**Comparison:** Standard NFTs cost ~$0.20 each = $2,000 for 10k mints!

## 🛡️ Security Notes

1. **Never commit private keys** - Use `.env` and add to `.gitignore`
2. **Mainnet Setup** - Use Helius/Triton RPC (DAS support required for Phase 4)
3. **Rate Limiting** - Add API rate limits on minting endpoints
4. **Validation** - Always validate user wallet signatures before minting

## 🐛 Troubleshooting

**Error: "Tree not found"**
- Run `npx ts-node src/solana/init-tree.ts` first
- Verify `SOLANA_TREE_ADDRESS` is in `.env`

**Error: "Insufficient funds"**
- Request more devnet SOL: `solana airdrop 2 YOUR_ADDRESS --url devnet`

**Error: "Account does not exist"**
- Your RPC might be slow - try using Helius or QuickNode

## 📚 References

- [Metaplex Bubblegum Docs](https://developers.metaplex.com/bubblegum)
- [Compressed NFTs Guide](https://solana.com/developers/guides/javascript/compressed-nfts)

