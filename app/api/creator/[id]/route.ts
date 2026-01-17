import { NextRequest, NextResponse } from "next/server";
import { getCreatorById, getImagesByCreator, getCreatorStats } from "@/lib/db";

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

    const creator = getCreatorById(id);

    if (!creator) {
      return NextResponse.json(
        { error: "Creator not found" },
        { status: 404 }
      );
    }

    const images = getImagesByCreator(id);
    const stats = getCreatorStats(id);

    return NextResponse.json({
      creator_id: creator.id,
      display_name: creator.display_name,
      created_at: creator.created_at,
      images: images.map((img) => ({
        id: img.id,
        hash: img.original_hash,
        signed_at: img.signed_at,
      })),
      totalSigned: stats.totalSigned,
    });
  } catch (error) {
    console.error("Creator API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch creator data" },
      { status: 500 }
    );
  }
}
