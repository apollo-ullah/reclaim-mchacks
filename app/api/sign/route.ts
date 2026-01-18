import { NextRequest, NextResponse } from "next/server";
import { embedPayload, SteganographyPayload, SourceType } from "@/lib/steganography";
import { getShortHash } from "@/lib/hash";
import { recordSignedImage, getCreatorById } from "@/lib/db";
import { signImageBuffer, isC2PAAvailable } from "@/lib/c2pa";

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
        { success: false, error: "No image file provided" },
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
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid file type. Only PNG and JPEG are supported.",
        },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer);

    // Get short hash of original image
    const originalHash = await getShortHash(imageBuffer);

    // Create payload
    const timestamp = Math.floor(Date.now() / 1000);
    const payload: SteganographyPayload = {
      v: 1,
      c: creatorId.trim(),
      t: timestamp,
      h: originalHash,
      s: sourceType,
    };

    // Embed LSB payload into image
    const lsbSignedBuffer = await embedPayload(imageBuffer, payload);

    // Record in database
    await recordSignedImage(creatorId.trim(), originalHash, sourceType);

    // Get creator display name for C2PA metadata
    const creator = await getCreatorById(creatorId.trim());
    const authorName = creator?.display_name || creatorId.trim();

    // Apply C2PA signing on top of LSB watermark
    let finalBuffer = lsbSignedBuffer;
    let c2paApplied = false;

    if (isC2PAAvailable()) {
      try {
        const c2paBuffer = await signImageBuffer(
          lsbSignedBuffer,
          {
            author: authorName,
            txId: originalHash, // Use image hash as identifier
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
        // Continue with LSB-only buffer
      }
    }

    // Convert to base64 for response
    const signedImageBase64 = finalBuffer.toString("base64");

    return NextResponse.json({
      success: true,
      signedImageBase64,
      metadata: {
        creatorId: payload.c,
        timestamp: new Date(payload.t * 1000).toISOString(),
        originalHash: payload.h,
        version: payload.v,
        sourceType: payload.s,
        c2paApplied,
      },
    });
  } catch (error) {
    console.error("Sign error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to sign image";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
