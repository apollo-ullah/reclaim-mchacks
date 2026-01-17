import { NextRequest, NextResponse } from "next/server";
import { embedPayload, SteganographyPayload } from "@/lib/steganography";
import { getShortHash } from "@/lib/hash";
import { recordSignedImage } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("image") as File | null;
    const creatorId = formData.get("creator_id") as string | null;

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
    };

    // Embed payload into image
    const signedImageBuffer = await embedPayload(imageBuffer, payload);

    // Record in database
    recordSignedImage(creatorId.trim(), originalHash);

    // Convert to base64 for response
    const signedImageBase64 = signedImageBuffer.toString("base64");

    return NextResponse.json({
      success: true,
      signedImageBase64,
      metadata: {
        creatorId: payload.c,
        timestamp: new Date(payload.t * 1000).toISOString(),
        originalHash: payload.h,
        version: payload.v,
      },
    });
  } catch (error) {
    console.error("Sign error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to sign image";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
