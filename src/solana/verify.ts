/**
 * Verification Module (Phase 4)
 * Queries Solana blockchain via DAS API to verify asset ownership
 */

import 'dotenv/config';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { mplBubblegum } from '@metaplex-foundation/mpl-bubblegum';
import { 
  publicKey, 
  Umi,
  PublicKey as UmiPublicKey
} from '@metaplex-foundation/umi';
import { 
  dasApi,
  DasApiAsset
} from '@metaplex-foundation/digital-asset-standard-api';

// Environment Configuration
const RPC_ENDPOINT = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';

/**
 * Singleton Umi instance for verification queries
 */
let verificationUmi: Umi | null = null;

/**
 * Initialize Umi instance for DAS queries (read-only, no identity needed)
 */
function getVerificationUmi(): Umi {
  if (verificationUmi) {
    return verificationUmi;
  }

  const umi = createUmi(RPC_ENDPOINT)
    .use(mplBubblegum())
    .use(dasApi());
  
  verificationUmi = umi;
  return umi;
}

/**
 * Metadata attribute interface
 */
interface AssetAttribute {
  trait_type?: string;
  value?: string;
}

/**
 * Verify if a specific wallet owns an asset with a specific visual hash
 * 
 * @param userWallet - Base58 encoded Solana public key
 * @param imageHash - Visual hash to search for (e.g., "sha256:abc123...")
 * @returns Promise<boolean> - true if wallet owns asset with this hash
 */
export async function verifyImageOwnership(
  userWallet: string,
  imageHash: string
): Promise<boolean> {
  try {
    const umi = getVerificationUmi();
    const ownerPublicKey = publicKey(userWallet);

    console.log(`[Verify] Checking ownership for wallet: ${userWallet.substring(0, 8)}...`);
    console.log(`[Verify] Looking for Visual Hash: ${imageHash}`);

    // Fetch assets owned by this wallet (with pagination)
    const assets = await fetchAllAssetsByOwner(umi, ownerPublicKey);
    
    console.log(`[Verify] Found ${assets.length} total assets for this wallet`);

    // Search through all assets for matching visual hash
    for (const asset of assets) {
      const hasMatchingHash = checkAssetForHash(asset, imageHash);
      
      if (hasMatchingHash) {
        console.log(`[Verify] ✓ Match found! Asset ID: ${asset.id}`);
        return true;
      }
    }

    console.log(`[Verify] ✗ No matching asset found`);
    return false;

  } catch (error) {
    console.error('[Verify] Error during verification:', error);
    throw new Error(
      `Verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Fetch all assets owned by a wallet (handles pagination)
 * DAS API returns paginated results, so we need to fetch all pages
 * 
 * @param umi - Umi instance
 * @param owner - Owner public key
 * @returns Promise<DasApiAsset[]> - All assets owned by this wallet
 */
async function fetchAllAssetsByOwner(
  umi: Umi,
  owner: UmiPublicKey
): Promise<DasApiAsset[]> {
  const allAssets: DasApiAsset[] = [];
  let page = 1;
  const limit = 1000; // Max items per page
  let hasMore = true;

  while (hasMore) {
    try {
      // Fetch one page of assets
      // Cast to any to work around TypeScript definition limitations
      const response = await (umi.rpc as any).getAssetsByOwner({
        owner,
        limit,
        page
      });

      const items = response.items || [];
      allAssets.push(...items);

      console.log(`[Verify] Fetched page ${page}: ${items.length} assets`);

      // Check if there are more pages
      // If we got fewer items than the limit, we've reached the end
      hasMore = items.length === limit;
      page++;

      // Safety: Don't fetch more than 10,000 assets (10 pages)
      if (page > 10) {
        console.warn('[Verify] Reached maximum page limit (10). Stopping pagination.');
        break;
      }

    } catch (error) {
      console.error(`[Verify] Error fetching page ${page}:`, error);
      // Stop pagination on error
      hasMore = false;
    }
  }

  return allAssets;
}

/**
 * Check if an asset has a matching visual hash in its attributes
 * 
 * @param asset - DAS API asset object
 * @param targetHash - Hash to search for
 * @returns boolean - true if asset has matching hash
 */
function checkAssetForHash(asset: DasApiAsset, targetHash: string): boolean {
  // Safety: Check if metadata structure exists
  if (!asset.content) {
    return false;
  }

  const content = asset.content as any;
  
  if (!content.metadata) {
    return false;
  }

  const attributes = content.metadata.attributes;
  
  if (!Array.isArray(attributes)) {
    return false;
  }

  // Search through attributes for VisualHash trait
  for (const attr of attributes) {
    if (
      attr &&
      typeof attr === 'object' &&
      'trait_type' in attr &&
      'value' in attr
    ) {
      const attribute = attr as AssetAttribute;
      
      if (
        attribute.trait_type === 'VisualHash' &&
        attribute.value === targetHash
      ) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Get detailed information about who owns a specific visual hash
 * Useful for reverse lookup: "Who owns this image?"
 * 
 * @param imageHash - Visual hash to search for
 * @param walletsToCheck - Array of wallet addresses to check
 * @returns Promise<string | null> - Wallet address of owner, or null if not found
 */
export async function findOwnerByHash(
  imageHash: string,
  walletsToCheck: string[]
): Promise<string | null> {
  console.log(`[Verify] Searching for owner of hash: ${imageHash}`);
  console.log(`[Verify] Checking ${walletsToCheck.length} wallets...`);

  for (const wallet of walletsToCheck) {
    try {
      const isOwner = await verifyImageOwnership(wallet, imageHash);
      
      if (isOwner) {
        console.log(`[Verify] ✓ Owner found: ${wallet}`);
        return wallet;
      }
    } catch (error) {
      console.error(`[Verify] Error checking wallet ${wallet}:`, error);
      // Continue checking other wallets
    }
  }

  console.log(`[Verify] ✗ No owner found among checked wallets`);
  return null;
}

/**
 * Get all assets owned by a wallet (exported for testing/debugging)
 * 
 * @param userWallet - Wallet address to query
 * @returns Promise<DasApiAsset[]> - All assets owned by this wallet
 */
export async function getAssetsByWallet(
  userWallet: string
): Promise<DasApiAsset[]> {
  const umi = getVerificationUmi();
  const ownerPublicKey = publicKey(userWallet);
  
  return await fetchAllAssetsByOwner(umi, ownerPublicKey);
}

/**
 * Verify ownership with detailed information
 * Returns the matching asset if found
 * 
 * @param userWallet - Wallet to check
 * @param imageHash - Hash to verify
 * @returns Promise<DasApiAsset | null> - The matching asset or null
 */
export async function verifyWithDetails(
  userWallet: string,
  imageHash: string
): Promise<DasApiAsset | null> {
  try {
    const umi = getVerificationUmi();
    const ownerPublicKey = publicKey(userWallet);

    const assets = await fetchAllAssetsByOwner(umi, ownerPublicKey);

    for (const asset of assets) {
      if (checkAssetForHash(asset, imageHash)) {
        return asset;
      }
    }

    return null;
  } catch (error) {
    console.error('[Verify] Error in verifyWithDetails:', error);
    return null;
  }
}

