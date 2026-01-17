# Testing Guide

## Quick Setup

1. **Create `.env` file:**
   ```bash
   cp env.template .env
   ```

2. **Fill in your values in `.env`:**
   - Get a Solana keypair: `solana-keygen new`
   - Add your private key to `SOLANA_PAYER_PRIVATE_KEY`
   - Generate JWT secret: `openssl rand -base64 32`

3. **Initialize the tree (one time only):**
   ```bash
   npm run init-tree
   ```
   Copy the `SOLANA_TREE_ADDRESS` output to your `.env` file.

## Run Tests

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:auth    # Authentication tests only
npm run test:mint    # Minting tests only
```

## What's Tested

- ✓ Wallet signature authentication (SIWS)
- ✓ Replay attack prevention
- ✓ JWT token generation/verification
- ✓ cNFT minting with Metaplex Bubblegum
- ✓ Parameter validation
- ✓ Tree configuration

**Note:** Authentication tests work without setup. Minting tests require `.env` configuration.

