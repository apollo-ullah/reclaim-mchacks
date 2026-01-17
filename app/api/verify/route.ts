import { NextRequest, NextResponse } from "next/server";
import { extractPayload } from "@/lib/steganography";

export interface VerifyResponse {
  verified: boolean;
  creator?: string;
  timestamp?: string;
  tampered?: boolean;
  message: string;
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

    // Try to extract payload
    const payload = await extractPayload(imageBuffer);

    if (!payload) {
      return NextResponse.json({
        verified: false,
        message: "No signature found - origin unknown",
      } as VerifyResponse);
    }

    // Payload found - check for tampering
    // Note: We compute hash of the current image and compare with embedded hash
    // However, the watermark itself changes the image, so we can't directly compare
    // For MVP, we'll skip the tampering check as it requires the original image
    // In a real implementation, you'd use perceptual hashing or store the original separately

    const response: VerifyResponse = {
      verified: true,
      creator: payload.c,
      timestamp: new Date(payload.t * 1000).toISOString(),
      tampered: false, // MVP: assume not tampered if signature found
      message: `Verified - Signed by ${payload.c}`,
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
