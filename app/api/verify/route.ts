import { NextRequest, NextResponse } from "next/server";
import { extractPayload } from "@/lib/steganography";
import { getCreatorById } from "@/lib/db";
import { verifyImageBuffer, type C2PAManifest } from "@/lib/c2pa";

export interface VerifyResponse {
  verified: boolean;
  creator?: string;
  creatorDisplayName?: string;
  timestamp?: string;
  tampered?: boolean;
  sourceType?: "authentic" | "ai";
  message: string;
  // C2PA fields
  c2pa?: {
    found: boolean;
    valid?: boolean;
    author?: string;
    timestamp?: string;
    validationStatus?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("image") as File | null;

    // Validate inputs
    if (!file) {
      return NextResponse.json(
        { verified: false, message: "No image file provided" },
        { status: 400 }
      );
    }

    // Check file type
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          verified: false,
          message: "Invalid file type. Only PNG and JPEG are supported.",
        },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer);

    // Determine image format from file type
    const format = file.type === "image/png" ? "png" : "jpeg";

    // Try to extract LSB payload and C2PA manifest in parallel
    const [payload, c2paManifest] = await Promise.all([
      extractPayload(imageBuffer),
      verifyImageBuffer(imageBuffer, format as "png" | "jpeg").catch(() => null),
    ]);

    // Build C2PA response section
    const c2paResponse = c2paManifest
      ? {
          found: true,
          valid: c2paManifest.isValid,
          author: c2paManifest.author || undefined,
          timestamp: c2paManifest.timestamp || undefined,
          validationStatus: c2paManifest.validationStatus,
        }
      : { found: false };

    // ========== TAMPER DETECTION LOGIC ==========
    // C2PA cryptographic validation is the primary tamper detection mechanism.
    // If C2PA signature is invalid, the image has been modified after signing.
    // LSB watermarks are fragile - if destroyed, the image was re-encoded (JPEG/screenshot).

    const hasLSB = payload !== null;
    const hasC2PA = c2paManifest !== null;
    const c2paValid = c2paManifest?.isValid === true;
    // Note: validationStatus can be "valid", "invalid", or "unknown" (self-signed certs)
    const c2paInvalid = c2paManifest?.validationStatus === "invalid";

    // Case 1: No signatures at all
    if (!hasLSB && !hasC2PA) {
      return NextResponse.json({
        verified: false,
        tampered: false,
        message: "No signature found - origin unknown",
        c2pa: c2paResponse,
      } as VerifyResponse);
    }

    // Case 2: C2PA found but cryptographically INVALID = TAMPERED
    // This means the image pixels were modified after C2PA signing
    if (hasC2PA && c2paInvalid) {
      const creatorData = hasLSB ? await getCreatorById(payload!.c) : null;
      const displayName = creatorData?.display_name || c2paManifest?.author || "Unknown";

      return NextResponse.json({
        verified: false,
        tampered: true,
        creator: payload?.c || c2paManifest?.author,
        creatorDisplayName: displayName,
        timestamp: payload ? new Date(payload.t * 1000).toISOString() : c2paManifest?.timestamp,
        sourceType: payload?.s || "authentic",
        message: `Image has been modified after signing by ${displayName}`,
        c2pa: c2paResponse,
      } as VerifyResponse);
    }

    // Case 3: Only C2PA (LSB destroyed - image was re-encoded/screenshot)
    if (!hasLSB && hasC2PA) {
      // C2PA survives re-encoding, so we can still verify authorship
      // But LSB watermark was destroyed, indicating format change
      return NextResponse.json({
        verified: true,
        tampered: false,
        creator: c2paManifest!.author || "Unknown",
        creatorDisplayName: c2paManifest!.author || "Unknown",
        timestamp: c2paManifest!.timestamp || undefined,
        message: c2paValid
          ? `C2PA verified - signed by ${c2paManifest!.author || "Unknown"} (image was re-encoded, LSB watermark lost)`
          : `C2PA found - signed by ${c2paManifest!.author || "Unknown"} (signature status: ${c2paManifest!.validationStatus})`,
        c2pa: c2paResponse,
      } as VerifyResponse);
    }

    // Case 4: LSB found (with or without C2PA)
    // Get creator info
    const creatorData = await getCreatorById(payload!.c);
    const displayName = creatorData?.display_name || payload!.c;
    const sourceType = payload!.s || "authentic";
    const sourceLabel = sourceType === "ai" ? "AI-Generated" : "Authentic";

    // Determine tamper status based on C2PA
    // If C2PA is valid, we're confident it's not tampered
    // If C2PA is missing or unknown status, we can't be 100% sure (legacy signatures)
    const tampered = false; // LSB presence + no invalid C2PA = not tampered

    // Build verification message
    let message = `Verified - ${sourceLabel} content signed by ${displayName}`;
    if (c2paValid) {
      message += " (C2PA cryptographically verified)";
    } else if (hasC2PA && c2paManifest?.validationStatus === "unknown") {
      message += " (C2PA present, self-signed certificate)";
    }

    const response: VerifyResponse = {
      verified: true,
      creator: payload!.c,
      creatorDisplayName: displayName,
      timestamp: new Date(payload!.t * 1000).toISOString(),
      tampered,
      sourceType,
      message,
      c2pa: c2paResponse,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Verify error:", error);
    return NextResponse.json(
      { verified: false, message: "Failed to verify image" },
      { status: 500 }
    );
  }
}
