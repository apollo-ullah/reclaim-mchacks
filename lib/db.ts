import Database from "better-sqlite3";
import path from "path";

// Database file path
const DB_PATH = path.join(process.cwd(), "reclaim.db");

// Create or open database
const db = new Database(DB_PATH);

// Enable WAL mode for better performance
db.pragma("journal_mode = WAL");

// Initialize database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS creators (
    id TEXT PRIMARY KEY,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS signed_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    creator_id TEXT NOT NULL,
    original_hash TEXT NOT NULL,
    signed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (creator_id) REFERENCES creators(id)
  );

  CREATE INDEX IF NOT EXISTS idx_signed_images_creator_id ON signed_images(creator_id);
  CREATE INDEX IF NOT EXISTS idx_signed_images_hash ON signed_images(original_hash);
`);

// Prepared statements
const insertCreator = db.prepare(
  "INSERT OR IGNORE INTO creators (id) VALUES (?)"
);

const insertSignedImage = db.prepare(
  "INSERT INTO signed_images (creator_id, original_hash) VALUES (?, ?)"
);

const getCreator = db.prepare("SELECT * FROM creators WHERE id = ?");

const getCreatorImages = db.prepare(
  "SELECT * FROM signed_images WHERE creator_id = ? ORDER BY signed_at DESC"
);

const getImageByHash = db.prepare(
  "SELECT si.*, c.created_at as creator_created_at FROM signed_images si JOIN creators c ON si.creator_id = c.id WHERE si.original_hash = ?"
);

const getCreatorImageCount = db.prepare(
  "SELECT COUNT(*) as count FROM signed_images WHERE creator_id = ?"
);

// Export functions
export interface Creator {
  id: string;
  created_at: string;
}

export interface SignedImage {
  id: number;
  creator_id: string;
  original_hash: string;
  signed_at: string;
}

export function createCreator(creatorId: string): void {
  insertCreator.run(creatorId);
}

export function recordSignedImage(
  creatorId: string,
  originalHash: string
): number {
  // Ensure creator exists
  createCreator(creatorId);

  // Insert the signed image record
  const result = insertSignedImage.run(creatorId, originalHash);
  return Number(result.lastInsertRowid);
}

export function getCreatorById(creatorId: string): Creator | undefined {
  return getCreator.get(creatorId) as Creator | undefined;
}

export function getImagesByCreator(creatorId: string): SignedImage[] {
  return getCreatorImages.all(creatorId) as SignedImage[];
}

export function findImageByHash(
  hash: string
): (SignedImage & { creator_created_at: string }) | undefined {
  return getImageByHash.get(hash) as
    | (SignedImage & { creator_created_at: string })
    | undefined;
}

export function getCreatorStats(creatorId: string): { totalSigned: number } {
  const result = getCreatorImageCount.get(creatorId) as { count: number };
  return { totalSigned: result?.count ?? 0 };
}

export { db };
