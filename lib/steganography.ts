import { Jimp } from "jimp";
import { intToRGBA, rgbaToInt } from "./image-utils";

// Magic header to identify our watermarked images
const MAGIC_HEADER = "RECLAIM_V1:";

// End marker to know where the message ends
const END_MARKER = ":END_RECLAIM";

export type SourceType = "authentic" | "ai";

export interface SteganographyPayload {
  v: number; // version
  c: string; // creator_id
  t: number; // timestamp
  h: string; // first 8 chars of SHA-256 of original image
  s: SourceType; // source type: "authentic" for human-created, "ai" for AI-generated
}

/**
 * Convert a string to binary representation
 */
function stringToBinary(str: string): string {
  return str
    .split("")
    .map((char) => char.charCodeAt(0).toString(2).padStart(8, "0"))
    .join("");
}

/**
 * Convert binary representation back to string
 */
function binaryToString(binary: string): string {
  const bytes = binary.match(/.{8}/g);
  if (!bytes) return "";
  return bytes.map((byte) => String.fromCharCode(parseInt(byte, 2))).join("");
}

/**
 * Calculate the maximum message length that can be embedded in an image
 * We use 2 bits per pixel (from the blue and green channels) for better capacity
 */
function getMaxMessageLength(width: number, height: number): number {
  // Each pixel can hold 2 bits (blue and green LSB)
  // 8 bits per character
  const totalBits = width * height * 2;
  return Math.floor(totalBits / 8);
}

/**
 * Embed a payload into an image using LSB steganography
 * @param imageBuffer - The original image buffer
 * @param payload - The payload to embed
 * @returns The watermarked image as a PNG buffer
 */
export async function embedPayload(
  imageBuffer: Buffer,
  payload: SteganographyPayload
): Promise<Buffer> {
  const image = await Jimp.read(imageBuffer);
  const width = image.width;
  const height = image.height;

  // Create the full message with magic header and end marker
  const payloadJson = JSON.stringify(payload);
  const fullMessage = MAGIC_HEADER + payloadJson + END_MARKER;

  // Check if the message fits
  const maxLength = getMaxMessageLength(width, height);
  if (fullMessage.length > maxLength) {
    throw new Error(
      `Message too long for image. Max: ${maxLength} chars, Message: ${fullMessage.length} chars`
    );
  }

  // Convert message to binary
  const binaryMessage = stringToBinary(fullMessage);

  // Embed the binary message into the image
  let bitIndex = 0;

  for (let y = 0; y < height && bitIndex < binaryMessage.length; y++) {
    for (let x = 0; x < width && bitIndex < binaryMessage.length; x++) {
      const pixelColor = image.getPixelColor(x, y);
      const rgba = intToRGBA(pixelColor);

      // Embed in blue channel LSB
      if (bitIndex < binaryMessage.length) {
        const bit = parseInt(binaryMessage[bitIndex], 10);
        rgba.b = (rgba.b & 0xfe) | bit;
        bitIndex++;
      }

      // Embed in green channel LSB
      if (bitIndex < binaryMessage.length) {
        const bit = parseInt(binaryMessage[bitIndex], 10);
        rgba.g = (rgba.g & 0xfe) | bit;
        bitIndex++;
      }

      // Set the modified pixel
      const newColor = rgbaToInt(rgba.r, rgba.g, rgba.b, rgba.a);
      image.setPixelColor(newColor, x, y);
    }
  }

  // Return as PNG buffer (PNG is lossless, important for LSB)
  return await image.getBuffer("image/png");
}

/**
 * Extract a payload from an image
 * @param imageBuffer - The image buffer to extract from
 * @returns The extracted payload, or null if not found
 */
export async function extractPayload(
  imageBuffer: Buffer
): Promise<SteganographyPayload | null> {
  const image = await Jimp.read(imageBuffer);
  const width = image.width;
  const height = image.height;

  // Extract bits from the image
  let binaryString = "";
  const maxBits = width * height * 2;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pixelColor = image.getPixelColor(x, y);
      const rgba = intToRGBA(pixelColor);

      // Extract from blue channel LSB
      binaryString += (rgba.b & 1).toString();

      // Extract from green channel LSB
      binaryString += (rgba.g & 1).toString();

      // Check periodically for the end marker to avoid processing entire image
      if (binaryString.length % 800 === 0 && binaryString.length > 0) {
        const partialMessage = binaryToString(binaryString);
        if (partialMessage.includes(END_MARKER)) {
          break;
        }
      }

      // Safety limit
      if (binaryString.length > maxBits) break;
    }

    // Check if we've found the end marker
    const partialMessage = binaryToString(binaryString);
    if (partialMessage.includes(END_MARKER)) {
      break;
    }
  }

  // Convert binary to string
  const extractedMessage = binaryToString(binaryString);

  // Check for magic header
  if (!extractedMessage.startsWith(MAGIC_HEADER)) {
    return null;
  }

  // Find the end marker
  const endIndex = extractedMessage.indexOf(END_MARKER);
  if (endIndex === -1) {
    return null;
  }

  // Extract the JSON payload
  const jsonStart = MAGIC_HEADER.length;
  const jsonString = extractedMessage.substring(jsonStart, endIndex);

  try {
    const payload = JSON.parse(jsonString) as SteganographyPayload;
    return payload;
  } catch {
    return null;
  }
}

/**
 * Check if an image has our watermark (quick check)
 */
export async function hasWatermark(imageBuffer: Buffer): Promise<boolean> {
  const payload = await extractPayload(imageBuffer);
  return payload !== null;
}

/**
 * Get the minimum image dimensions required for a payload
 */
export function getMinimumDimensions(payloadLength: number): number {
  // Each pixel holds 2 bits, 8 bits per character
  const bitsNeeded = payloadLength * 8;
  const pixelsNeeded = Math.ceil(bitsNeeded / 2);
  // Return minimum square dimension
  return Math.ceil(Math.sqrt(pixelsNeeded));
}
