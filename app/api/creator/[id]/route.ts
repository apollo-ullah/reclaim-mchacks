import { NextRequest, NextResponse } from "next/server";
import { getCreatorById, getImagesByCreator, getCreatorStats, updateCreatorProfile } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Creator ID is required" },
        { status: 400 }
      );
    }

    const creator = await getCreatorById(id);

    if (!creator) {
      return NextResponse.json(
        { error: "Creator not found" },
        { status: 404 }
      );
    }

    const images = await getImagesByCreator(id);
    const stats = await getCreatorStats(id);

    // Calculate additional stats
    const firstSigned = images.length > 0 ? images[images.length - 1].signed_at : null;
    const lastSigned = images.length > 0 ? images[0].signed_at : null;

    return NextResponse.json({
      creator_id: creator.id,
      display_name: creator.display_name,
      bio: creator.bio,
      twitter: creator.twitter,
      website: creator.website,
      avatar_url: creator.avatar_url,
      created_at: creator.created_at,
      images: images.map((img) => ({
        id: img.id,
        hash: img.original_hash,
        signed_at: img.signed_at,
        cnft_address: img.cnft_address,
      })),
      totalSigned: stats.totalSigned,
      firstSigned,
      lastSigned,
    });
  } catch (error) {
    console.error("Creator API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch creator data" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Creator ID is required" },
        { status: 400 }
      );
    }

    // Validate fields
    const { display_name, bio, twitter, website } = body;

    if (display_name !== undefined && (typeof display_name !== "string" || display_name.length > 50)) {
      return NextResponse.json(
        { error: "Display name must be a string with max 50 characters" },
        { status: 400 }
      );
    }

    if (bio !== undefined && bio !== null && (typeof bio !== "string" || bio.length > 280)) {
      return NextResponse.json(
        { error: "Bio must be a string with max 280 characters" },
        { status: 400 }
      );
    }

    if (twitter !== undefined && twitter !== null && typeof twitter !== "string") {
      return NextResponse.json(
        { error: "Twitter handle must be a string" },
        { status: 400 }
      );
    }

    if (website !== undefined && website !== null && typeof website !== "string") {
      return NextResponse.json(
        { error: "Website must be a string" },
        { status: 400 }
      );
    }

    const updatedCreator = await updateCreatorProfile(id, {
      display_name,
      bio,
      twitter,
      website,
    });

    if (!updatedCreator) {
      return NextResponse.json(
        { error: "Creator not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      creator: updatedCreator,
    });
  } catch (error) {
    console.error("Creator update error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
