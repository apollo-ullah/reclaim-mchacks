/**
 * Solana Integration Module
 * Exports all Solana-related functionality
 */

// Shared Utilities
export {
  loadPayerKeypair,
  isValidSolanaAddress
} from './utils';

// Authentication
export {
  authenticateWithSolana,
  verifyJWT,
  verifyAuthHeader,
  generateChallengeMessage,
  type SolanaAuthRequest,
  type JWTPayload,
  type AuthResult
} from './auth';

// Minting Service
export {
  registerContentAsset,
  mintContentHandler,
  batchRegisterAssets,
  type MintAssetParams,
  type MintResult
} from './mint';

// Tree Initialization (for setup scripts only)
export {
  initializeMerkleTree,
  getTreeConfig
} from './init-tree';

