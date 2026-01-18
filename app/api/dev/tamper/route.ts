import { NextRequest, NextResponse } from "next/server";
import { Jimp } from "jimp";

/**
 * Development-only API for demonstrating tamper detection.
 * This endpoint intentionally corrupts images to show that our
 * tamper detection actually works.
 *
 * Two modes:
 * 1. "byte" - Modifies raw bytes to invalidate C2PA hash (detected!)
 * 2. "pixel" - Re-encodes through Jimp which strips C2PA metadata
 */

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("image") as File | null;
    const mode = formData.get("mode") as string | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No image file provided" },
        { status: 400 }
      );
    }

    if (!mode || !["byte", "pixel"].includes(mode)) {
      return NextResponse.json(
        { success: false, error: "Invalid mode. Use 'byte' or 'pixel'" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let tamperedBuffer: Buffer;
    let description: string;

    if (mode === "byte") {
      // Byte-level tampering: Modify bytes in the PNG IDAT chunk
      // This will invalidate the C2PA hash while keeping the manifest readable
      tamperedBuffer = bytesTamper(buffer);
      description = "Modified raw bytes in image data (C2PA hash will mismatch)";
    } else {
      // Pixel-level tampering: Re-encode through Jimp
      // This strips all metadata including C2PA but preserves LSB watermark
      tamperedBuffer = await pixelTamper(buffer);
      description = "Re-encoded image through library (C2PA metadata stripped)";
    }

    const tamperedBase64 = tamperedBuffer.toString("base64");

    return NextResponse.json({
      success: true,
      tamperedImageBase64: tamperedBase64,
      mode,
      description,
      originalSize: buffer.length,
      tamperedSize: tamperedBuffer.length,
    });
  } catch (error) {
    console.error("Tamper error:", error);
    const message = error instanceof Error ? error.message : "Failed to tamper image";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

/**
 * Byte-level tampering - modifies raw PNG bytes
 * This keeps the C2PA manifest intact but changes the image data,
 * causing a hash mismatch that C2PA will detect as tampering.
 */
function bytesTamper(buffer: Buffer): Buffer {
  const result = Buffer.from(buffer);

  // Find IDAT chunk (contains compressed image data)
  const idatMarker = Buffer.from("IDAT");
  let idatIndex = result.indexOf(idatMarker);

  if (idatIndex === -1) {
    // Fallback: just modify some bytes in the middle of the file
    idatIndex = Math.floor(buffer.length / 2);
  }

  // Modify several bytes after the IDAT marker to ensure corruption
  // We modify bytes at multiple offsets to increase chance of detection
  const offsets = [50, 100, 150, 200, 250];
  for (const offset of offsets) {
    const pos = idatIndex + offset;
    if (pos < result.length) {
      // Flip the byte value
      result[pos] = result[pos] === 0 ? 1 : result[pos] - 1;
    }
  }

  return result;
}

/**
 * Pixel-level tampering - re-encodes through image library
 * This reads the image and writes it back, which:
 * 1. Strips all metadata (including C2PA manifest)
 * 2. Preserves pixel data (including LSB watermark in most cases)
 * 3. Also slightly modifies pixels to be visible
 */
async function pixelTamper(buffer: Buffer): Promise<Buffer> {
  const image = await Jimp.read(buffer);

  // Add a subtle but visible modification - a small red dot
  // This makes it clear the image was modified
  for (let x = 45; x < 55; x++) {
    for (let y = 45; y < 55; y++) {
      if (x < image.width && y < image.height) {
        image.setPixelColor(0xFF0000FF, x, y); // Red pixel
      }
    }
  }

  // Re-encode as PNG (strips all non-pixel metadata)
  return await image.getBuffer("image/png");
}
