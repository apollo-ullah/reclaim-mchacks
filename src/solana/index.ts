/**
 * Solana Integration Module
 * Exports all Solana-related functionality
 */

// Authentication
export {
  authenticateWithSolana,
  verifyJWT,
  generateChallengeMessage
} from './auth';

// Minting Service
export {
  registerContentAsset,
  mintContentHandler,
  batchRegisterAssets,
  type MintAssetParams,
  type MintResult
} from './mint';

// Verification Service
export {
  verifyImageOwnership,
  findOwnerByHash,
  getAssetsByWallet,
  verifyWithDetails
} from './verify';

// Tree Initialization (for setup scripts only)
export {
  initializeMerkleTree,
  getTreeConfig
} from './init-tree';

