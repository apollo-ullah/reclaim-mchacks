# Reclaim: Creator-Owned Media Authenticity Platform

## Project Context

**Event:** McHacks 12 (McGill University Hackathon)
**Duration:** 24 hours
**Team Goal:** Build a working MVP and win

---

## The Problem

AI-generated media is now virtually indistinguishable from real media. This causes:

1. **Widespread distrust** - People can't tell what's real anymore
2. **Fraud and scams** - Deepfake phishing, impersonation, fake evidence
3. **Creator vulnerability** - Anyone can generate fake content "from" a creator
4. **Detection is failing** - Every detector we build, generators learn to beat

### Why Detection Doesn't Work

- Detection is a cat-and-mouse game that defenders are losing
- AI generators are trained to fool detectors
- No detector achieves reliable accuracy across all generators
- False positives erode trust in the tools themselves

---

## Our Insight

**Stop trying to prove what's fake. Start proving what's real.**

Instead of detecting AI content (reactive), we let creators cryptographically sign their authentic content (proactive). This flips the trust model:

- **Old model:** Assume real unless proven fake (impossible to prove)
- **New model:** Verify authentic if signed by creator (cryptographically provable)

---

## The Solution: Reclaim

A platform where creators watermark their authentic content with an invisible steganographic signature tied to their identity. Anyone can verify if content was signed by its claimed creator.

### How It Works

1. **Creator signs image** → Invisible watermark embedded containing creator ID + timestamp + hash
2. **Image distributed** → Watermark survives, travels with the image
3. **Anyone verifies** → Upload image, check if valid signature exists, see who signed it

### Key Value Propositions

- **For Creators:** Own your authenticity. Prove your content is real.
- **For Consumers:** Verify before trusting. Check any image's provenance.
- **For Society:** Shift the default from "trust everything" to "verify what matters"

---

## Competitive Landscape

### C2PA (Coalition for Content Provenance and Authenticity)
- Industry consortium (Adobe, Microsoft, Google, BBC)
- Hardware/software integration for content credentials
- **Our differentiation:** C2PA requires platform adoption. We work today, for individuals, with zero dependencies.

### SynthID (Google DeepMind)
- Watermarks AI-generated content from Google's models
- Detection only available via waitlist/Vertex AI
- **Our differentiation:** We're not detecting AI—we're authenticating human-created content.

### Our Position
> "C2PA is infrastructure for corporations. We're infrastructure for humans."

We are **complementary** to these efforts, not competitive. We support global ethics standards pushing for watermarking—but we don't wait for industry adoption.

---

## Technical Approach

### Steganography (LSB - Least Significant Bit)

We embed data into the least significant bits of image pixels. This is:
- Invisible to human eyes
- Extractable programmatically
- Survives as long as the image isn't re-encoded

**Known Limitation:** LSB watermarks are fragile. They don't survive:
- JPEG compression
- Screenshots
- Social media re-encoding
- Resizing/cropping

**How We Frame This:**
> "The watermark serves as tamper evidence. If it's destroyed, you know the image was modified. The original remains verifiable in our registry."

For MVP, this limitation is acceptable. Production would use frequency-domain methods (DCT-based) that are more robust.

### Payload Structure

```json
{
  "v": 1,
  "c": "creator_id",
  "t": 1737072000,
  "h": "a1b2c3d4"
}
```

- `v` - Version number for future compatibility
- `c` - Creator identifier
- `t` - Unix timestamp of signing
- `h` - First 8 characters of SHA-256 hash of original image

### Magic Header

All payloads are prefixed with `RECLAIM_V1:` to identify our watermarks vs random data.

### Hash Verification

On signing, we compute SHA-256 of image pixel data (not file bytes). On verification, if payload exists but hash doesn't match current image, we know the image was tampered with post-signing.

---

## MVP Scope (What We're Building)

### Core Flows

#### Flow 1: Sign an Image
```
User uploads image
    ↓
User enters Creator ID (simple text input for MVP)
    ↓
System embeds watermark payload
    ↓
User downloads signed image
    ↓
Record stored in database
```

#### Flow 2: Verify an Image
```
User uploads image
    ↓
System attempts watermark extraction
    ↓
If found + hash matches → "✓ Verified by [creator]"
If found + hash differs → "⚠ Modified from signed original"
If not found → "✗ No signature found"
```

#### Flow 3: Creator Profile
```
/creator/[id] shows:
- Creator ID
- All images they've signed
- Timestamps
```

### Tech Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Frontend | Next.js 14 + Tailwind | Fast to build, good DX |
| Backend | Next.js API Routes | Unified codebase |
| Database | SQLite (Prisma or better-sqlite3) | Zero setup, good enough for MVP |
| Steganography | Custom JS/TS implementation | No external dependencies |
| Image Processing | Jimp or Sharp | Node-native image manipulation |

### Database Schema

```sql
CREATE TABLE creators (
  id TEXT PRIMARY KEY,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE signed_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  creator_id TEXT NOT NULL,
  original_hash TEXT NOT NULL,
  signed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (creator_id) REFERENCES creators(id)
);
```

### API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/sign` | POST | Upload image + creator_id, return signed image |
| `/api/verify` | POST | Upload image, return verification result |
| `/api/creator/[id]` | GET | Get creator profile + their signed images |

### UI Pages

| Route | Purpose |
|-------|---------|
| `/` | Landing page with hero + CTAs |
| `/sign` | Image signing interface |
| `/verify` | Image verification interface |
| `/creator/[id]` | Creator profile page |

---

## Explicitly OUT OF SCOPE (Do Not Build)

- ❌ Wallet connection / Web3 authentication
- ❌ Solana or any blockchain integration
- ❌ User accounts / login system
- ❌ Cloud image storage (users download their signed images)
- ❌ Perceptual hash fallback matching
- ❌ Video support
- ❌ SynthID detection integration
- ❌ Robust frequency-domain steganography

These are all valid future features but will derail the MVP.

---

## Design Guidelines

### Visual Style
- Dark background (`#0a0a0a` or similar)
- Accent color: Electric blue (`#3b82f6`) or emerald (`#10b981`)
- Clean sans-serif typography (Inter or system fonts)
- Generous whitespace
- Minimal, focused UI—no clutter

### UX Principles
- One primary action per screen
- Clear feedback for all operations
- Verification results should be visually distinct and satisfying
- Error states should be helpful, not cryptic

### Tone
- Professional but not corporate
- Empowering ("Take control of your authenticity")
- Slightly urgent ("In a world of deepfakes...")

---

## Demo Script (For Judging)

1. **Hook:** "Which of these images is AI?" → Show 3-4 images → Reveal all are AI → "Detection is already losing."

2. **Flip:** "So we stopped trying to prove what's fake. We started proving what's real."

3. **Demo Sign Flow:** Upload a photo → Enter creator ID → Download signed version

4. **Demo Verify Flow:** Upload the signed image → Show "Verified by [creator] at [time]"

5. **Demo Negative Case:** Upload unsigned image → Show "No signature found"

6. **Creator Profile:** Show the profile page with all signed images

7. **Close:** "We're building the HTTPS lock icon for media."

---

## Success Criteria

The MVP is successful if we can demonstrate:

- [ ] Signing an image embeds an invisible, extractable watermark
- [ ] Verification correctly identifies signed images
- [ ] Verification correctly rejects unsigned images
- [ ] Creator profiles show all signed images
- [ ] UI is clean and demo-ready
- [ ] The whole flow works live without errors

---

## File Structure

```
reclaim/
├── app/
│   ├── page.tsx                 # Landing page
│   ├── sign/
│   │   └── page.tsx             # Sign interface
│   ├── verify/
│   │   └── page.tsx             # Verify interface
│   ├── creator/
│   │   └── [id]/
│   │       └── page.tsx         # Creator profile
│   └── api/
│       ├── sign/
│       │   └── route.ts
│       ├── verify/
│       │   └── route.ts
│       └── creator/
│           └── [id]/
│               └── route.ts
├── lib/
│   ├── steganography.ts         # Core embed/extract logic
│   ├── hash.ts                  # SHA-256 utilities
│   └── db.ts                    # Database operations
├── components/
│   ├── ImageUpload.tsx
│   ├── VerificationResult.tsx
│   └── CreatorCard.tsx
├── prisma/
│   └── schema.prisma            # If using Prisma
└── public/
    └── ...
```

---

## Implementation Priority

1. **First:** Steganography library (embed + extract) - this is the core
2. **Second:** `/api/sign` endpoint + `/sign` page
3. **Third:** `/api/verify` endpoint + `/verify` page
4. **Fourth:** Database integration
5. **Fifth:** Creator profiles
6. **Sixth:** Landing page polish
7. **Last:** UI polish, animations, error handling

---

## Common Pitfalls to Avoid

1. **Over-engineering the steganography** - LSB is fine for MVP. Don't rabbit-hole on robustness.

2. **Blockchain distraction** - Do not add any Web3 until core flow works perfectly.

3. **Image format hell** - Accept PNG/JPEG input, always output PNG. Don't try to preserve JPEG.

4. **Scope creep** - If it's not in the MVP scope above, don't build it.

5. **Demo bugs** - Test the full flow repeatedly. A broken demo kills everything.

---

## Key Technical Decisions (Already Made)

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Steganography method | LSB | Simple, implementable in hours |
| Output format | PNG only | LSB doesn't survive JPEG compression |
| Auth system | None (MVP) | Adds complexity, no demo value |
| Image storage | Client-side download | No cloud storage complexity |
| Database | SQLite | Zero config, portable |
| Blockchain | Deferred | Out of scope for MVP |

---

## Questions an Agent Might Have

**Q: Should I implement robust steganography?**
A: No. Basic LSB is sufficient. We acknowledge limitations in the pitch.

**Q: Should I add user authentication?**
A: No. Creator ID is just a text string for MVP.

**Q: What if the image is too small for the payload?**
A: Return an error asking for a larger image. Don't try to compress payload.

**Q: Should I handle video?**
A: Absolutely not. Images only.

**Q: What about JPEG output?**
A: Always output PNG. Warn users that JPEG will destroy the watermark.

**Q: Should I store the actual images?**
A: Only store metadata (creator_id, hash, timestamp). Users download their signed images.

---

## Contact / Help

This is a hackathon project. Ship fast, keep it simple, make it work.

When in doubt, choose the simpler option that gets to a working demo faster.