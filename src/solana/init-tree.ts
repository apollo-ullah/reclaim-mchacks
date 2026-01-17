/**
 * Tree Initialization Script
 * Run this ONCE to create a Merkle Tree for storing Compressed NFTs
 * 
 * Usage: npx ts-node src/solana/init-tree.ts
 */

import 'dotenv/config';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { 
  mplBubblegum, 
  createTree 
} from '@metaplex-foundation/mpl-bubblegum';
import { 
  keypairIdentity, 
  generateSigner,
  percentAmount
} from '@metaplex-foundation/umi';
import { PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';

// Environment Configuration
const RPC_ENDPOINT = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
const PAYER_PRIVATE_KEY = process.env.SOLANA_PAYER_PRIVATE_KEY;

// Tree Configuration
const MAX_DEPTH = 14;        // Supports up to 2^14 = 16,384 assets
const MAX_BUFFER_SIZE = 64;  // Number of concurrent updates allowed

interface TreeConfig {
  maxDepth: number;
  maxBufferSize: number;
  estimatedCapacity: number;
  estimatedCostSOL: number;
}

/**
 * Calculate tree configuration details
 */
function getTreeConfig(): TreeConfig {
  const capacity = Math.pow(2, MAX_DEPTH);
  const estimatedCost = 0.1 * (MAX_DEPTH / 14);
  
  return {
    maxDepth: MAX_DEPTH,
    maxBufferSize: MAX_BUFFER_SIZE,
    estimatedCapacity: capacity,
    estimatedCostSOL: estimatedCost
  };
}

/**
 * Load the backend payer keypair from environment variable
 */
function loadPayerKeypair(): Uint8Array {
  if (!PAYER_PRIVATE_KEY) {
    throw new Error(
      'Missing SOLANA_PAYER_PRIVATE_KEY in environment variables.\n' +
      'Generate a keypair: solana-keygen new --outfile ~/.config/solana/devnet.json\n' +
      'Then export: export SOLANA_PAYER_PRIVATE_KEY="[your base58 private key]"'
    );
  }

  try {
    // Support both base58 string and JSON array format
    if (PAYER_PRIVATE_KEY.startsWith('[')) {
      const keyArray = JSON.parse(PAYER_PRIVATE_KEY);
      return new Uint8Array(keyArray);
    } else {
      // Base58 string format
      return bs58.decode(PAYER_PRIVATE_KEY);
    }
  } catch (error) {
    throw new Error(
      `Failed to parse SOLANA_PAYER_PRIVATE_KEY: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Initialize the Merkle Tree on Solana
 */
async function initializeMerkleTree(): Promise<void> {
  console.log('Initializing Compressed NFT Merkle Tree.\n');

  // Step 1: Show configuration
  const config = getTreeConfig();
  console.log('Tree Configuration:');
  console.log(`  Max Depth: ${config.maxDepth}`);
  console.log(`  Max Buffer Size: ${config.maxBufferSize}`);
  console.log(`  Estimated Capacity: ${config.estimatedCapacity.toLocaleString()} assets`);
  console.log(`  Estimated Cost: ~${config.estimatedCostSOL} SOL\n`);

  // Step 2: Setup Umi with Bubblegum
  console.log(`Connecting to: ${RPC_ENDPOINT}`);
  const umi = createUmi(RPC_ENDPOINT).use(mplBubblegum());

  // Step 3: Load payer keypair
  console.log('Loading payer keypair:');
  const payerKeyBytes = loadPayerKeypair();
  const payerKeypair = umi.eddsa.createKeypairFromSecretKey(payerKeyBytes);
  umi.use(keypairIdentity(payerKeypair));
  
  console.log(`   Payer Address: ${payerKeypair.publicKey}`);

  // Step 4: Generate tree address (deterministic)
  const merkleTree = generateSigner(umi);
  console.log(`\nGenerated Tree Address: ${merkleTree.publicKey}`);

  // Step 5: Create the tree on-chain
  console.log('\nCreating tree on Solana (this may take 30-60 seconds).');
  
  try {
    const builder = await createTree(umi, {
      merkleTree,
      maxDepth: MAX_DEPTH,
      maxBufferSize: MAX_BUFFER_SIZE,
      public: false, // Only the tree authority can add assets
    });

    const result = await builder.sendAndConfirm(umi, {
      confirm: { commitment: 'finalized' }
    });

    const signatureBytes = result.signature;
    const signatureBase58 = bs58.encode(signatureBytes);

    console.log('Tree created successfully!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('SAVE THESE VALUES TO YOUR .env FILE:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`SOLANA_TREE_ADDRESS=${merkleTree.publicKey}`);
    console.log(`SOLANA_RPC_URL=${RPC_ENDPOINT}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(`Transaction Signature: ${signatureBase58}`);
    console.log(`   View on Solana Explorer: https://explorer.solana.com/tx/${signatureBase58}?cluster=devnet\n`);

  } catch (error) {
    console.error('Failed to create tree:');
    if (error instanceof Error) {
      console.error(`   ${error.message}`);
      
      // Provide helpful error messages
      if (error.message.includes('insufficient funds')) {
        console.error('\nSolution: Your wallet needs more SOL.');
        console.error(`   Request devnet SOL: solana airdrop 2 ${payerKeypair.publicKey} --url devnet`);
      }
    } else {
      console.error(error);
    }
    process.exit(1);
  }
}

// Execute the script
if (require.main === module) {
  initializeMerkleTree()
    .then(() => {
      console.log('Setup complete! You can now mint cNFTs using this tree.\n');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Initialization failed:', error);
      process.exit(1);
    });
}

export { initializeMerkleTree, getTreeConfig };

