# SOLANA INTEGRATION DOCUMENTATION & STEPS

## Phase 1: Infrastructure Setup
You need a specific RPC provider because standard Solana nodes cannot index compressed data.

RPC Provider: Use Helius or Triton.

Action: Get an API Key with "DAS" (Digital Asset Standard) support enabled.

Dependencies:

Backend (Node.js/TypeScript):

Bash

```
npm install @metaplex-foundation/umi \
@metaplex-foundation/umi-bundle-defaults \
@metaplex-foundation/mpl-bubblegum \
@solana/web3.js
```



## Phase 2: Authentication (The Account)
Since you are "bringing your own wallet," there is no registration form. You use Sign-In with Solana (SIWS).

The Workflow:

Frontend: User connects wallet (e.g., Phantom).

Action: User signs a message: "Login to [YourApp] at [Timestamp]".

Backend: Verify the signature using nacl.

If Valid: Create a JWT session linked to that Public Key.

Result: You now have a verified userWalletAddress.



## Phase 3: The "Contract" (Minting Logic)
We use Metaplex Bubblegum to mint Compressed NFTs. This costs ~$0.000005 per image (vs ~$0.20 for standard NFTs).

### A. One-Time Setup (The Tree) You must create a Merkle Tree once. This tree can hold millions of images.

Max Depth 14: Holds ~16k assets.

Max Depth 20: Holds ~1M assets.

Action: Run this script once to get your TREE_ADDRESS.

### B. Minting Script (The Registration) This function runs when the user posts an image.

TypeScript
```
// register_content.ts
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { mplBubblegum, mintToCollectionV1 } from '@metaplex-foundation/mpl-bubblegum';
import { keypairIdentity, none } from '@metaplex-foundation/umi';

// 1. Setup Umi
const umi = createUmi('https://mainnet.helius-rpc.com/?api-key=YOUR_KEY').use(mplBubblegum());

// 2. Load Your Backend Wallet (The Payer/Authority)
// This wallet pays the tiny gas fee, but the "Owner" will be the User.
const backendKeypair = // ... load secure keypair
umi.use(keypairIdentity(backendKeypair));

// 3. The Mint Function
async function registerAsset(userWalletAddr, metadataUri, imageHash) {
    const { signature } = await mintToCollectionV1(umi, {
        leafOwner: userWalletAddr, // The Creator owns the NFT
        merkleTree: TREE_ADDRESS,  // Your pre-made tree
        collectionMint: COLLECTION_ADDRESS, // Optional: Groups all app images
        metadata: {
            name: "Copyright Claim",
            uri: metadataUri, // JSON link (contains C2PA manifest link + License Terms)
            sellerFeeBasisPoints: 0, 
            collection: none(),
            creators: [
                { address: userWalletAddr, verified: false, share: 100 }
            ],
            // Store the visual hash on-chain for verification
            attributes: [
                 { trait_type: "VisualHash", value: imageHash },
                 { trait_type: "License", value: "CC-BY-NC-4.0" } 
            ]
        }
    }).sendAndConfirm(umi);
    
    return signature;
}
```

## Phase 4: Verification (The Detective)
When a user drops a suspicious image, you do not query the blockchain by "File Name." You query by Hash or Owner using the DAS API.

Scenario A: "Is this specific user the creator?"

TypeScript
```
// verify_owner.ts
async function checkOwnership(userWallet, imageHash) {
    const rpcAssetList = await umi.rpc.getAssetsByOwner({ 
        owner: userWallet 
    });

    // Filter local results to find the visual hash
    const match = rpcAssetList.items.find(asset => 
        asset.content.metadata.attributes.find(
            attr => attr.trait_type === "VisualHash" && attr.value === imageHash
        )
    );

    return !!match; // True if they own the "Contract" for this hash
}
```
Scenario B: "Who owns this?" (Reverse Lookup)

Note: You typically cache Hash -> Owner in a local SQL database for instant search, then use the blockchain only to verify the claim when the user clicks "See Contract."


## Phase 5: C2PA Integration (The Handshake)
This step happens before Phase 3. You must cryptographically link the off-chain file to the on-chain wallet.

The Problem: C2PA uses X.509 certificates. Solana uses Ed25519 keys. The Solution: Your Backend acts as the Certificate Authority (CA).

Generate Certificate: When the user authenticates (Phase 2), generate a temporary X.509 certificate.

Subject Field: Set CN = [User_Solana_Wallet_Address].

Sign Manifest: Use c2pa-node or c2pa-rs to sign the image.

JavaScript
```
// c2pa_signing_logic.js
const manifest = {
    assertions: [
        {
            label: "org.yourapp.identity",
            data: {
                wallet: "8x...abc", // Explicitly list the wallet
                license: "Standard-Commercial"
            }
        }
    ]
};
// Sign with the cert generated in Step 1
```
Upload & Link:

Upload the signed image to Arweave.

Take the Arweave Link + Visual Hash -> Send to Phase 3 (Minting).

Final Flow:

Drag & Drop (User) -> Extract C2PA (Backend).

Read Wallet ID from C2PA Manifest.

Verify on Solana: "Does Wallet 8x... own the NFT with this Hash?"

Result: If YES -> Show Original Profile. If NO -> Show Fake/Warning.