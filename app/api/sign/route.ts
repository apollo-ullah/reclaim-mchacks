import { NextRequest, NextResponse } from "next/server";
import { embedPayload, SteganographyPayload, SourceType } from "@/lib/steganography";
import { getShortHash } from "@/lib/hash";
import { recordSignedImage, getCreatorById } from "@/lib/db";
import { signImageBuffer, isC2PAAvailable } from "@/lib/c2pa";
import {
  extractFirstFrame,
  embedWatermarkedFrame,
  validateVideoDuration,
  isFFmpegAvailable,
} from "@/lib/video";

const IMAGE_TYPES = ["image/png", "image/jpeg", "image/jpg"];
const VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/webm"];
const MAX_VIDEO_DURATION = 10; // seconds

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("image") as File | null;
    const creatorId = formData.get("creator_id") as string | null;
    const sourceTypeParam = formData.get("source_type") as string | null;

    // Validate source_type
    const sourceType: SourceType = sourceTypeParam === "ai" ? "ai" : "authentic";

    // Validate inputs
    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    if (!creatorId || creatorId.trim() === "") {
      return NextResponse.json(
        { success: false, error: "Creator ID is required" },
        { status: 400 }
      );
    }

    // Check file type
    const isImage = IMAGE_TYPES.includes(file.type);
    const isVideo = VIDEO_TYPES.includes(file.type);

    if (!isImage && !isVideo) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid file type. Supported: PNG, JPEG, MP4, MOV, WebM.",
        },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    // Handle video signing
    if (isVideo) {
      return await handleVideoSign(fileBuffer, creatorId.trim(), sourceType);
    }

    // Handle image signing (existing logic)
    return await handleImageSign(fileBuffer, creatorId.trim(), sourceType);
  } catch (error) {
    console.error("Sign error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to sign file";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

async function handleImageSign(
  imageBuffer: Buffer,
  creatorId: string,
  sourceType: SourceType
) {
  // Get short hash of original image
  const originalHash = await getShortHash(imageBuffer);

  // Create payload
  const timestamp = Math.floor(Date.now() / 1000);
  const payload: SteganographyPayload = {
    v: 1,
    c: creatorId,
    t: timestamp,
    h: originalHash,
    s: sourceType,
  };

  // Embed LSB payload into image
  const lsbSignedBuffer = await embedPayload(imageBuffer, payload);

  // Record in database
  await recordSignedImage(creatorId, originalHash, sourceType);

  // Get creator display name for C2PA metadata
  const creator = await getCreatorById(creatorId);
  const authorName = creator?.display_name || creatorId;

  // Apply C2PA signing on top of LSB watermark
  let finalBuffer = lsbSignedBuffer;
  let c2paApplied = false;

  if (isC2PAAvailable()) {
    try {
      const c2paBuffer = await signImageBuffer(
        lsbSignedBuffer,
        {
          author: authorName,
          txId: originalHash,
          additionalMetadata: {
            sourceType: sourceType,
            platform: "Reclaim",
          },
        },
        "png"
      );

      if (c2paBuffer) {
        finalBuffer = c2paBuffer;
        c2paApplied = true;
      }
    } catch (c2paError) {
      console.error("C2PA signing failed, falling back to LSB only:", c2paError);
    }
  }

  // Convert to base64 for response
  const signedImageBase64 = finalBuffer.toString("base64");

  return NextResponse.json({
    success: true,
    signedImageBase64,
    mediaType: "image",
    metadata: {
      creatorId: payload.c,
      timestamp: new Date(payload.t * 1000).toISOString(),
      originalHash: payload.h,
      version: payload.v,
      sourceType: payload.s,
      c2paApplied,
    },
  });
}

async function handleVideoSign(
  videoBuffer: Buffer,
  creatorId: string,
  sourceType: SourceType
) {
  // Check if ffmpeg is available
  const ffmpegAvailable = await isFFmpegAvailable();
  if (!ffmpegAvailable) {
    return NextResponse.json(
      { success: false, error: "Video processing is not available on this server (ffmpeg required)" },
      { status: 500 }
    );
  }

  // Validate video duration
  const validation = await validateVideoDuration(videoBuffer, MAX_VIDEO_DURATION);
  if (!validation.valid) {
    return NextResponse.json(
      { success: false, error: validation.message },
      { status: 400 }
    );
  }

  // Get short hash of original video
  const originalHash = await getShortHash(videoBuffer);

  // Create payload
  const timestamp = Math.floor(Date.now() / 1000);
  const payload: SteganographyPayload = {
    v: 1,
    c: creatorId,
    t: timestamp,
    h: originalHash,
    s: sourceType,
  };

  // Extract first frame
  const firstFrame = await extractFirstFrame(videoBuffer);

  // Embed LSB payload into first frame
  const watermarkedFrame = await embedPayload(firstFrame, payload);

  // Embed watermarked frame back into video
  let signedVideo = await embedWatermarkedFrame(videoBuffer, watermarkedFrame);

  // Record in database
  await recordSignedImage(creatorId, originalHash, sourceType);

  // Get creator display name for C2PA metadata
  const creator = await getCreatorById(creatorId);
  const authorName = creator?.display_name || creatorId;

  // Apply C2PA signing to video
  let c2paApplied = false;
  // Note: C2PA for video would require additional implementation
  // For now, we'll mark it as not applied for videos
  // In future: Use c2patool or similar for video C2PA support

  // Convert to base64 for response
  const signedVideoBase64 = signedVideo.toString("base64");

  return NextResponse.json({
    success: true,
    signedVideoBase64,
    mediaType: "video",
    metadata: {
      creatorId: payload.c,
      timestamp: new Date(payload.t * 1000).toISOString(),
      originalHash: payload.h,
      version: payload.v,
      sourceType: payload.s,
      duration: validation.duration,
      c2paApplied,
      note: "LSB watermark embedded in first frame. C2PA for video coming in future update.",
    },
  });
}
