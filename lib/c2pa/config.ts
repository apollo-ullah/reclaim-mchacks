/**
 * C2PA Configuration Module
 * 
 * Manages paths to certificates and keys required for C2PA signing
 */

import { resolve } from 'path';
import { existsSync } from 'fs';
import type { C2PAConfig } from './types';

/**
 * Default paths for C2PA certificates and keys
 * These paths assume you've run the generate-c2pa-certs.sh script
 */
const CERTS_DIR = resolve(process.cwd(), 'certs');

export const DEFAULT_CONFIG: C2PAConfig = {
  privateKeyPath: resolve(CERTS_DIR, 'private.key'),
  certificatePath: resolve(CERTS_DIR, 'certificate.pem'),
  claimGenerator: 'Reclaim/1.0.0',
};

/**
 * Validates that the required certificate files exist
 * @param config - C2PA configuration to validate
 * @throws Error if required files are missing
 */
export function validateConfig(config: C2PAConfig): void {
  if (!existsSync(config.privateKeyPath)) {
    throw new Error(
      `Private key not found at: ${config.privateKeyPath}\n` +
      'Please run: npm run generate-certs'
    );
  }

  if (!existsSync(config.certificatePath)) {
    throw new Error(
      `Certificate not found at: ${config.certificatePath}\n` +
      'Please run: npm run generate-certs'
    );
  }
}

/**
 * Gets the C2PA configuration, optionally merged with custom settings
 * @param customConfig - Optional custom configuration to override defaults
 * @returns Complete C2PA configuration
 */
export function getConfig(customConfig?: Partial<C2PAConfig>): C2PAConfig {
  const config: C2PAConfig = {
    ...DEFAULT_CONFIG,
    ...customConfig,
  };

  validateConfig(config);
  return config;
}

