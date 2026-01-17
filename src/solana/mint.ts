/**
 * Compressed NFT Minting Service
 * Handles minting of content provenance cNFTs to user wallets
 */

import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import {
  mplBubblegum,
  mintV1
} from '@metaplex-foundation/mpl-bubblegum';
import {
  keypairIdentity,
  publicKey,
  Umi
} from '@metaplex-foundation/umi';
import bs58 from 'bs58';
import { loadPayerKeypair, isValidSolanaAddress } from './utils';

// Environment Configuration
const RPC_ENDPOINT = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
const TREE_ADDRESS = process.env.SOLANA_TREE_ADDRESS;
const COLLECTION_ADDRESS = process.env.SOLANA_COLLECTION_ADDRESS; // Optional

// Interfaces
interface MintAssetParams {
  userWalletAddress: string;  // Base58 encoded user's wallet
  metadataUri: string;        // Link to JSON metadata (Arweave/IPFS)
  imageHash: string;          // Visual hash of the image for verification
  licenseName?: string;       // Optional: License type (default: CC-BY-NC-4.0)
  contentName?: string;       // Optional: Name for the NFT (default: Copyright Claim)
}

interface MintResult {
  success: boolean;
  signature?: string;
  transactionUrl?: string;
  error?: string;
}

/**
 * Singleton Umi instance for reuse across requests
 */
let umiInstance: Umi | null = null;

/**
 * Initialize and cache the Umi instance
 */
function getUmi(): Umi {
  if (umiInstance) {
    return umiInstance;
  }

  if (!TREE_ADDRESS) {
    throw new Error(
      'Missing SOLANA_TREE_ADDRESS in environment variables.\n' +
      'Run: npx ts-node src/solana/init-tree.ts to create a tree first.'
    );
  }

  if (!PAYER_PRIVATE_KEY) {
    throw new Error(
      'Missing SOLANA_PAYER_PRIVATE_KEY in environment variables.\n' +
      'This wallet pays gas fees and must be the tree authority.'
    );
  }

  // Initialize Umi with Bubblegum plugin
  const umi = createUmi(RPC_ENDPOINT).use(mplBubblegum());

  // Load the backend payer keypair
  const payerKeyBytes = loadPayerKeypair();
  const payerKeypair = umi.eddsa.createKeypairFromSecretKey(payerKeyBytes);
  umi.use(keypairIdentity(payerKeypair));

  umiInstance = umi;
  return umi;
}


/**
 * Register a content asset as a Compressed NFT
 * This mints a cNFT to the user's wallet with embedded provenance data
 * 
 * @param params - Minting parameters
 * @returns MintResult with transaction signature
 */
export async function registerContentAsset(
  params: MintAssetParams
): Promise<MintResult> {
  const {
    userWalletAddress,
    metadataUri,
    imageHash,
    licenseName = 'CC-BY-NC-4.0',
    contentName = 'Copyright Claim'
  } = params;

  try {
    // Input validation
    if (!userWalletAddress || !metadataUri || !imageHash) {
      return {
        success: false,
        error: 'Missing required parameters: userWalletAddress, metadataUri, or imageHash'
      };
    }

    if (!isValidSolanaAddress(userWalletAddress)) {
      return {
        success: false,
        error: 'Invalid Solana wallet address format'
      };
    }

    // Initialize Umi
    const umi = getUmi();
    const leafOwner = publicKey(userWalletAddress);
    const merkleTree = publicKey(TREE_ADDRESS!);

    console.log(`[Mint Service] Minting cNFT for wallet: ${userWalletAddress}`);
    console.log(`[Mint Service] Visual Hash: ${imageHash}`);

    // Build metadata with optional collection
    const metadata: any = {
      name: contentName,
      uri: metadataUri,
      sellerFeeBasisPoints: 0,
      collection: COLLECTION_ADDRESS 
        ? { key: publicKey(COLLECTION_ADDRESS), verified: false }
        : { __option: 'None' },
      creators: [
        {
          address: leafOwner,
          verified: false,
          share: 100
        }
      ]
    };

    // Execute the mint transaction
    const mintBuilder = await mintV1(umi, {
      leafOwner,
      merkleTree,
      metadata
    });

    // Send and confirm the transaction
    const result = await mintBuilder.sendAndConfirm(umi, {
      send: { skipPreflight: false },
      confirm: { commitment: 'confirmed' }
    });

    const signatureBytes = result.signature;
    const signatureBase58 = bs58.encode(signatureBytes);
    const explorerUrl = `https://explorer.solana.com/tx/${signatureBase58}?cluster=devnet`;

    console.log(`[Mint Service] Successfully minted cNFT`);
    console.log(`[Mint Service] Signature: ${signatureBase58}`);

    return {
      success: true,
      signature: signatureBase58,
      transactionUrl: explorerUrl
    };

  } catch (error) {
    console.error('[Mint Service] Minting failed:', error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Unknown minting error';

    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Express route handler wrapper for minting
 * Use this in your Express controller
 * 
 * Example:
 * app.post('/api/content/register', mintContentHandler);
 */
export async function mintContentHandler(req: any, res: any): Promise<any> {
  try {
    const { userWalletAddress, metadataUri, imageHash, licenseName, contentName } = req.body;

    const result = await registerContentAsset({
      userWalletAddress,
      metadataUri,
      imageHash,
      licenseName,
      contentName
    });

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: 'Content successfully registered on Solana',
        signature: result.signature,
        explorerUrl: result.transactionUrl,
        data: {
          owner: userWalletAddress,
          visualHash: imageHash,
          metadataUri
        }
      });
    } else {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('[API] Content registration error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error during content registration'
    });
  }
}

/**
 * Batch mint multiple assets in a single call
 * Useful for bulk uploads
 */
export async function batchRegisterAssets(
  assets: MintAssetParams[]
): Promise<MintResult[]> {
  const results: MintResult[] = [];

  for (const asset of assets) {
    const result = await registerContentAsset(asset);
    results.push(result);
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  return results;
}

// Export types
export type { MintAssetParams, MintResult };

