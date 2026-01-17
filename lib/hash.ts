import { createHash } from "crypto";
import { Jimp } from "jimp";
import { intToRGBA } from "./image-utils";

/**
 * Compute SHA-256 hash of image pixel data
 * This hashes the actual pixel values, not the file format
 * @param imageBuffer - The image buffer
 * @returns The full SHA-256 hash as hex string
 */
export async function hashImagePixels(imageBuffer: Buffer): Promise<string> {
  const image = await Jimp.read(imageBuffer);
  const width = image.width;
  const height = image.height;

  // Create a buffer of all pixel values (RGBA)
  const pixelData = Buffer.alloc(width * height * 4);
  let offset = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pixelColor = image.getPixelColor(x, y);
      const rgba = intToRGBA(pixelColor);

      pixelData.writeUInt8(rgba.r, offset++);
      pixelData.writeUInt8(rgba.g, offset++);
      pixelData.writeUInt8(rgba.b, offset++);
      pixelData.writeUInt8(rgba.a, offset++);
    }
  }

  // Compute SHA-256 hash
  const hash = createHash("sha256");
  hash.update(pixelData);
  return hash.digest("hex");
}

/**
 * Get the first 8 characters of the SHA-256 hash
 * This is what we embed in the steganographic payload
 */
export async function getShortHash(imageBuffer: Buffer): Promise<string> {
  const fullHash = await hashImagePixels(imageBuffer);
  return fullHash.substring(0, 8);
}

/**
 * Compute SHA-256 hash of a string
 */
export function hashString(str: string): string {
  const hash = createHash("sha256");
  hash.update(str);
  return hash.digest("hex");
}

/**
 * Compare two image hashes to detect tampering
 * @param originalHash - The hash embedded in the image
 * @param currentHash - The hash of the current image (first 8 chars)
 * @returns true if hashes match, false if tampered
 */
export function compareHashes(
  originalHash: string,
  currentHash: string
): boolean {
  // Compare first 8 characters
  return (
    originalHash.substring(0, 8).toLowerCase() ===
    currentHash.substring(0, 8).toLowerCase()
  );
}
