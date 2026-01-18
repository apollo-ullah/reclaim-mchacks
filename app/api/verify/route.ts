import { NextRequest, NextResponse } from "next/server";
import { extractPayload } from "@/lib/steganography";
import { getCreatorById } from "@/lib/db";
import { verifyImageBuffer, type C2PAManifest } from "@/lib/c2pa";
import { extractFirstFrame, isFFmpegAvailable, getVideoMetadata } from "@/lib/video";

const IMAGE_TYPES = ["image/png", "image/jpeg", "image/jpg"];
const VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/webm"];

export interface VerifyResponse {
  verified: boolean;
  creator?: string;
  creatorDisplayName?: string;
  timestamp?: string;
  tampered?: boolean;
  sourceType?: "authentic" | "ai";
  message: string;
  mediaType?: "image" | "video";
  duration?: number;
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
        { verified: false, message: "No file provided" },
        { status: 400 }
      );
    }

    // Check file type
    const isImage = IMAGE_TYPES.includes(file.type);
    const isVideo = VIDEO_TYPES.includes(file.type);

    if (!isImage && !isVideo) {
      return NextResponse.json(
        {
          verified: false,
          message: "Invalid file type. Supported: PNG, JPEG, MP4, MOV, WebM.",
        },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    // Handle video verification
    if (isVideo) {
      return await handleVideoVerify(fileBuffer);
    }

    // Handle image verification
    return await handleImageVerify(fileBuffer, file.type);
  } catch (error) {
    console.error("Verify error:", error);
    return NextResponse.json(
      { verified: false, message: "Failed to verify file" },
      { status: 500 }
    );
  }
}

async function handleImageVerify(imageBuffer: Buffer, fileType: string) {
  // Determine image format from file type
  const format = fileType === "image/png" ? "png" : "jpeg";

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
  const hasLSB = payload !== null;
  const hasC2PA = c2paManifest !== null;
  const c2paValid = c2paManifest?.isValid === true;
  const c2paInvalid = c2paManifest?.validationStatus === "invalid";

  // Case 1: No signatures at all
  if (!hasLSB && !hasC2PA) {
    return NextResponse.json({
      verified: false,
      tampered: false,
      message: "No signature found - origin unknown",
      mediaType: "image",
      c2pa: c2paResponse,
    } as VerifyResponse);
  }

  // Case 2: C2PA found but cryptographically INVALID = TAMPERED
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
      mediaType: "image",
      c2pa: c2paResponse,
    } as VerifyResponse);
  }

  // Case 3: Only C2PA (LSB destroyed - image was re-encoded/screenshot)
  if (!hasLSB && hasC2PA) {
    return NextResponse.json({
      verified: true,
      tampered: false,
      creator: c2paManifest!.author || "Unknown",
      creatorDisplayName: c2paManifest!.author || "Unknown",
      timestamp: c2paManifest!.timestamp || undefined,
      message: c2paValid
        ? `C2PA verified - signed by ${c2paManifest!.author || "Unknown"} (image was re-encoded, LSB watermark lost)`
        : `C2PA found - signed by ${c2paManifest!.author || "Unknown"} (signature status: ${c2paManifest!.validationStatus})`,
      mediaType: "image",
      c2pa: c2paResponse,
    } as VerifyResponse);
  }

  // Case 4: LSB found (with or without C2PA)
  const creatorData = await getCreatorById(payload!.c);
  const displayName = creatorData?.display_name || payload!.c;
  const sourceType = payload!.s || "authentic";
  const sourceLabel = sourceType === "ai" ? "AI-Generated" : "Authentic";
  const tampered = false;

  let message = `Verified - ${sourceLabel} content signed by ${displayName}`;
  if (c2paValid) {
    message += " (C2PA cryptographically verified)";
  } else if (hasC2PA && c2paManifest?.validationStatus === "unknown") {
    message += " (C2PA present, self-signed certificate)";
  }

  return NextResponse.json({
    verified: true,
    creator: payload!.c,
    creatorDisplayName: displayName,
    timestamp: new Date(payload!.t * 1000).toISOString(),
    tampered,
    sourceType,
    message,
    mediaType: "image",
    c2pa: c2paResponse,
  } as VerifyResponse);
}

async function handleVideoVerify(videoBuffer: Buffer) {
  // Check if ffmpeg is available
  const ffmpegAvailable = await isFFmpegAvailable();
  if (!ffmpegAvailable) {
    return NextResponse.json(
      { verified: false, message: "Video processing is not available on this server (ffmpeg required)" },
      { status: 500 }
    );
  }

  // Get video metadata
  let duration = 0;
  try {
    const metadata = await getVideoMetadata(videoBuffer);
    duration = metadata.duration;
  } catch {
    // Continue without duration info
  }

  // Extract first frame for LSB verification
  let firstFrame: Buffer;
  try {
    firstFrame = await extractFirstFrame(videoBuffer);
  } catch (error) {
    return NextResponse.json({
      verified: false,
      tampered: false,
      message: "Failed to extract first frame from video",
      mediaType: "video",
      duration,
      c2pa: { found: false },
    } as VerifyResponse);
  }

  // Extract LSB payload from first frame
  const payload = await extractPayload(firstFrame);

  // C2PA for video - not yet implemented
  const c2paResponse = { found: false };

  // No watermark found
  if (!payload) {
    return NextResponse.json({
      verified: false,
      tampered: false,
      message: "No signature found in video - origin unknown",
      mediaType: "video",
      duration,
      c2pa: c2paResponse,
    } as VerifyResponse);
  }

  // Watermark found - get creator info
  const creatorData = await getCreatorById(payload.c);
  const displayName = creatorData?.display_name || payload.c;
  const sourceType = payload.s || "authentic";
  const sourceLabel = sourceType === "ai" ? "AI-Generated" : "Authentic";

  return NextResponse.json({
    verified: true,
    creator: payload.c,
    creatorDisplayName: displayName,
    timestamp: new Date(payload.t * 1000).toISOString(),
    tampered: false,
    sourceType,
    message: `Verified - ${sourceLabel} video signed by ${displayName} (first frame watermark)`,
    mediaType: "video",
    duration,
    c2pa: c2paResponse,
  } as VerifyResponse);
}
