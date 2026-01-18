import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { embedPayload, SteganographyPayload } from "@/lib/steganography";
import { getShortHash } from "@/lib/hash";
import { recordSignedImage, getCreatorById } from "@/lib/db";
import { signImageBuffer, isC2PAAvailable } from "@/lib/c2pa";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.warn("OPENAI_API_KEY is not set - generate endpoint will not work");
}

export async function POST(request: NextRequest) {
  try {
    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        { success: false, error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { prompt, creator_id } = body;

    // Validate inputs
    if (!prompt || typeof prompt !== "string" || prompt.trim() === "") {
      return NextResponse.json(
        { success: false, error: "Prompt is required" },
        { status: 400 }
      );
    }

    if (!creator_id || typeof creator_id !== "string" || creator_id.trim() === "") {
      return NextResponse.json(
        { success: false, error: "Creator ID is required" },
        { status: 400 }
      );
    }

    // Limit prompt length
    const trimmedPrompt = prompt.trim().slice(0, 1000);

    // Initialize OpenAI
    const openai = new OpenAI({
      apiKey: OPENAI_API_KEY,
    });

    // Generate the image using DALL-E 3
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: trimmedPrompt,
      n: 1,
      size: "1024x1024",
      response_format: "b64_json",
    });

    const imageData = response.data[0]?.b64_json;

    if (!imageData) {
      return NextResponse.json(
        { success: false, error: "Failed to generate image - no image data returned" },
        { status: 500 }
      );
    }

    // Get the image buffer from base64
    const imageBuffer = Buffer.from(imageData, "base64");

    // Get short hash of the generated image
    const originalHash = await getShortHash(imageBuffer);

    // Create payload with AI source type
    const timestamp = Math.floor(Date.now() / 1000);
    const payload: SteganographyPayload = {
      v: 1,
      c: creator_id.trim(),
      t: timestamp,
      h: originalHash,
      s: "ai",
    };

    // Embed LSB payload into image
    const lsbSignedBuffer = await embedPayload(imageBuffer, payload);

    // Record in database with AI source type and prompt
    await recordSignedImage(creator_id.trim(), originalHash, "ai", trimmedPrompt);

    // Get creator display name for C2PA metadata
    const creator = await getCreatorById(creator_id.trim());
    const authorName = creator?.display_name || creator_id.trim();

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
              sourceType: "ai",
              platform: "Reclaim",
              aiModel: "dall-e-3",
              prompt: trimmedPrompt,
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
      metadata: {
        creatorId: payload.c,
        timestamp: new Date(payload.t * 1000).toISOString(),
        originalHash: payload.h,
        version: payload.v,
        sourceType: "ai",
        prompt: trimmedPrompt,
        c2paApplied,
      },
    });
  } catch (error) {
    console.error("Generate error:", error);

    // Handle specific OpenAI errors
    if (error instanceof OpenAI.APIError) {
      if (error.status === 400 && error.message.includes("safety")) {
        return NextResponse.json(
          { success: false, error: "The prompt was blocked due to safety filters. Please try a different prompt." },
          { status: 400 }
        );
      }
      if (error.status === 429) {
        return NextResponse.json(
          { success: false, error: "API rate limit reached. Please try again later." },
          { status: 429 }
        );
      }
      if (error.status === 401) {
        return NextResponse.json(
          { success: false, error: "Invalid API key. Please check your OpenAI API key." },
          { status: 401 }
        );
      }
    }

    const message = error instanceof Error ? error.message : "Failed to generate image";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
