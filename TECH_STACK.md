# Reclaim Tech Stack Architecture

```mermaid
graph TB
    subgraph Client["🖥️ Client Layer"]
        UI["Next.js 14 App Router<br/>React 18 + TypeScript"]
        Wallet["Solana Wallet Adapters<br/>(Phantom, Solflare)"]
        Style["TailwindCSS + Lucide Icons"]
    end

    subgraph API["⚡ API Layer (Next.js Routes)"]
        Auth["/api/auth - JWT Auth"]
        Sign["/api/sign - Image Signing"]
        Verify["/api/verify - C2PA Verification"]
        Generate["/api/generate - AI Generation"]
        Creator["/api/creator - Profile"]
    end

    subgraph Core["🔧 Core Services"]
        C2PA["C2PA Content Auth<br/>(@contentauth/c2pa-node)"]
        Steg["Steganography<br/>(Jimp + Custom LSB)"]
        Hash["Crypto Utils<br/>(SHA-256, TweetNaCl)"]
        AI["AI Services<br/>(Gemini AI, OpenAI)"]
    end

    subgraph Data["💾 Data Layer"]
        Mongo["MongoDB + Mongoose<br/>(Creators, SignedImages)"]
        Files["SQLite Fallback<br/>(better-sqlite3)"]
    end

    subgraph Blockchain["⛓️ Blockchain Layer"]
        Solana["Solana Web3.js"]
        Metaplex["Metaplex Bubblegum<br/>(Compressed NFTs)"]
        Tree["Merkle Tree<br/>(Content Registry)"]
    end

    subgraph Deploy["🚀 Deployment"]
        Vercel["Vercel Platform<br/>(+ Analytics)"]
    end

    UI --> API
    Wallet --> Auth
    Style --> UI
    
    Auth --> Hash
    Sign --> C2PA
    Sign --> Steg
    Verify --> C2PA
    Generate --> AI
    
    API --> Core
    Core --> Data
    
    Auth --> Solana
    Sign --> Metaplex
    Metaplex --> Tree
    Solana --> Blockchain
    
    API --> Mongo
    Mongo -.-> Files
    
    API --> Deploy

    classDef frontend fill:#3b82f6,stroke:#1e40af,color:#fff
    classDef backend fill:#10b981,stroke:#059669,color:#fff
    classDef data fill:#f59e0b,stroke:#d97706,color:#fff
    classDef blockchain fill:#8b5cf6,stroke:#7c3aed,color:#fff
    classDef deploy fill:#ef4444,stroke:#dc2626,color:#fff
    
    class UI,Wallet,Style frontend
    class API,Auth,Sign,Verify,Generate,Creator,Core,C2PA,Steg,Hash,AI backend
    class Data,Mongo,Files data
    class Blockchain,Solana,Metaplex,Tree blockchain
    class Deploy,Vercel deploy
```

## 📦 Technology Summary

### Frontend Stack
- **Framework:** Next.js 14 (App Router) + React 18
- **Styling:** TailwindCSS 4.0
- **Icons:** Lucide React
- **Wallet:** @solana/wallet-adapter-react

### Backend Stack
- **Runtime:** Next.js API Routes (Serverless)
- **Language:** TypeScript 5.9
- **Image Processing:** Jimp 1.1
- **Content Auth:** @contentauth/c2pa-node 0.5

### Database Stack
- **Primary:** MongoDB + Mongoose 9.1
- **Fallback:** better-sqlite3 11.0

### Blockchain Stack
- **Network:** Solana (Devnet/Mainnet)
- **Library:** @solana/web3.js 1.98
- **NFTs:** @metaplex-foundation/mpl-bubblegum 5.0
- **Type:** Compressed NFTs (cNFTs)

### AI Stack
- **Google:** @google/generative-ai (Gemini)
- **OpenAI:** openai 6.16

### Security & Auth
- **JWT:** jsonwebtoken 9.0
- **Crypto:** tweetnacl 1.0, bs58 6.0
- **Hashing:** Native SHA-256

### Deployment
- **Platform:** Vercel
- **Analytics:** @vercel/analytics 1.6

## 🔄 Data Flow

1. **User authenticates** via Solana wallet → JWT issued
2. **Content upload** → Image processed with C2PA + LSB steganography
3. **Sign & embed** → Watermark + content provenance data
4. **Mint cNFT** → Register on Solana via Merkle Tree
5. **Store metadata** → MongoDB records hash + creator ID
6. **Verification** → Extract watermark, validate C2PA, check blockchain

## 💡 Key Features
- **Dual Watermarking:** LSB steganography + C2PA standard
- **Blockchain Registry:** Compressed NFTs (cost-efficient)
- **Wallet-based Auth:** No passwords, crypto signatures
- **AI Integration:** Generate AI content with provenance

