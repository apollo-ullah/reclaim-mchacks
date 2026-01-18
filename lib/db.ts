import mongoose from "mongoose";

// MongoDB connection string from environment
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

// Connection cache for serverless environments
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI!).then((mongoose) => {
      return mongoose;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

// ============ SCHEMAS ============

const creatorSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true }, // wallet address as primary key
    display_name: { type: String, default: null },
    bio: { type: String, default: null, maxlength: 280 },
    twitter: { type: String, default: null },
    website: { type: String, default: null },
    avatar_url: { type: String, default: null },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

const signedImageSchema = new mongoose.Schema(
  {
    creator_id: { type: String, required: true, ref: "Creator", index: true },
    original_hash: { type: String, required: true, index: true },
    // Source type: "authentic" for human-created, "ai" for AI-generated
    source_type: { type: String, enum: ["authentic", "ai"], default: "authentic", index: true },
    // Optional: prompt used for AI-generated images
    ai_prompt: { type: String, default: null },
    // Optional: cNFT address if minted on Solana
    cnft_address: { type: String, default: null },
  },
  {
    timestamps: { createdAt: "signed_at", updatedAt: "updated_at" },
  }
);

// ============ MODELS ============

// Prevent model recompilation in hot-reload
const Creator =
  mongoose.models.Creator || mongoose.model("Creator", creatorSchema);
const SignedImage =
  mongoose.models.SignedImage ||
  mongoose.model("SignedImage", signedImageSchema);

// ============ INTERFACES ============

export interface Creator {
  id: string;
  display_name: string | null;
  bio: string | null;
  twitter: string | null;
  website: string | null;
  avatar_url: string | null;
  created_at: string;
}

export type SourceType = "authentic" | "ai";

export interface SignedImage {
  id: string;
  creator_id: string;
  original_hash: string;
  source_type: SourceType;
  ai_prompt?: string | null;
  signed_at: string;
  cnft_address?: string | null;
}

// ============ DATABASE FUNCTIONS ============

export async function createCreator(
  walletAddress: string,
  displayName?: string
): Promise<void> {
  await connectDB();
  await Creator.findOneAndUpdate(
    { _id: walletAddress },
    { _id: walletAddress, display_name: displayName || null },
    { upsert: true, new: true }
  );
}

export async function updateDisplayName(
  walletAddress: string,
  displayName: string
): Promise<void> {
  await connectDB();
  await Creator.findByIdAndUpdate(walletAddress, {
    display_name: displayName,
  });
}

export async function creatorExists(walletAddress: string): Promise<boolean> {
  await connectDB();
  const creator = await Creator.findById(walletAddress);
  return !!creator;
}

export async function recordSignedImage(
  creatorId: string,
  originalHash: string,
  sourceType: SourceType = "authentic",
  aiPrompt?: string,
  cnftAddress?: string
): Promise<string> {
  await connectDB();
  const signedImage = await SignedImage.create({
    creator_id: creatorId,
    original_hash: originalHash,
    source_type: sourceType,
    ai_prompt: aiPrompt || null,
    cnft_address: cnftAddress || null,
  });
  return signedImage._id.toString();
}

export async function getCreatorById(
  creatorId: string
): Promise<Creator | null> {
  await connectDB();
  const doc = await Creator.findById(creatorId);
  if (!doc) return null;
  return {
    id: doc._id,
    display_name: doc.display_name,
    bio: doc.bio || null,
    twitter: doc.twitter || null,
    website: doc.website || null,
    avatar_url: doc.avatar_url || null,
    created_at: doc.created_at?.toISOString() || new Date().toISOString(),
  };
}

export interface UpdateProfileData {
  display_name?: string;
  bio?: string | null;
  twitter?: string | null;
  website?: string | null;
  avatar_url?: string | null;
}

export async function updateCreatorProfile(
  walletAddress: string,
  data: UpdateProfileData
): Promise<Creator | null> {
  await connectDB();
  const updateData: Record<string, unknown> = {};

  if (data.display_name !== undefined) updateData.display_name = data.display_name;
  if (data.bio !== undefined) updateData.bio = data.bio;
  if (data.twitter !== undefined) updateData.twitter = data.twitter;
  if (data.website !== undefined) updateData.website = data.website;
  if (data.avatar_url !== undefined) updateData.avatar_url = data.avatar_url;

  const doc = await Creator.findByIdAndUpdate(
    walletAddress,
    updateData,
    { new: true }
  );

  if (!doc) return null;
  return {
    id: doc._id,
    display_name: doc.display_name,
    bio: doc.bio || null,
    twitter: doc.twitter || null,
    website: doc.website || null,
    avatar_url: doc.avatar_url || null,
    created_at: doc.created_at?.toISOString() || new Date().toISOString(),
  };
}

export async function getImagesByCreator(
  creatorId: string
): Promise<SignedImage[]> {
  await connectDB();
  const docs = await SignedImage.find({ creator_id: creatorId }).sort({
    signed_at: -1,
  });
  return docs.map((doc) => ({
    id: doc._id.toString(),
    creator_id: doc.creator_id,
    original_hash: doc.original_hash,
    source_type: doc.source_type || "authentic",
    ai_prompt: doc.ai_prompt,
    signed_at: doc.signed_at?.toISOString() || new Date().toISOString(),
    cnft_address: doc.cnft_address,
  }));
}

export async function findImageByHash(
  hash: string
): Promise<(SignedImage & { creator_created_at: string }) | null> {
  await connectDB();
  const doc = await SignedImage.findOne({ original_hash: hash });
  if (!doc) return null;

  const creator = await Creator.findById(doc.creator_id);
  return {
    id: doc._id.toString(),
    creator_id: doc.creator_id,
    original_hash: doc.original_hash,
    source_type: doc.source_type || "authentic",
    ai_prompt: doc.ai_prompt,
    signed_at: doc.signed_at?.toISOString() || new Date().toISOString(),
    cnft_address: doc.cnft_address,
    creator_created_at:
      creator?.created_at?.toISOString() || new Date().toISOString(),
  };
}

export async function getCreatorStats(
  creatorId: string
): Promise<{ totalSigned: number }> {
  await connectDB();
  const count = await SignedImage.countDocuments({ creator_id: creatorId });
  return { totalSigned: count };
}

// Update signed image with cNFT address after minting
export async function updateSignedImageWithCNFT(
  imageId: string,
  cnftAddress: string
): Promise<void> {
  await connectDB();
  await SignedImage.findByIdAndUpdate(imageId, { cnft_address: cnftAddress });
}

// Find signed image by hash to link with cNFT
export async function findSignedImageByHash(
  hash: string
): Promise<SignedImage | null> {
  await connectDB();
  const doc = await SignedImage.findOne({ original_hash: hash });
  if (!doc) return null;
  return {
    id: doc._id.toString(),
    creator_id: doc.creator_id,
    original_hash: doc.original_hash,
    source_type: doc.source_type || "authentic",
    ai_prompt: doc.ai_prompt,
    signed_at: doc.signed_at?.toISOString() || new Date().toISOString(),
    cnft_address: doc.cnft_address,
  };
}

export { connectDB };
