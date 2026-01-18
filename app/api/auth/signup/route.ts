import { NextRequest, NextResponse } from "next/server";
import { createCreator, getCreatorById, creatorExists } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { wallet_address, display_name } = body;

    if (!wallet_address) {
      return NextResponse.json(
        { error: "Wallet address required" },
        { status: 400 }
      );
    }

    if (!display_name || display_name.trim().length === 0) {
      return NextResponse.json(
        { error: "Display name required" },
        { status: 400 }
      );
    }

    if (display_name.length > 50) {
      return NextResponse.json(
        { error: "Display name must be 50 characters or less" },
        { status: 400 }
      );
    }

    // Check if creator already exists
    if (await creatorExists(wallet_address)) {
      return NextResponse.json(
        { error: "Account already exists for this wallet" },
        { status: 409 }
      );
    }

    // Create the creator
    await createCreator(wallet_address, display_name.trim());

    // Fetch and return the created creator
    const creator = await getCreatorById(wallet_address);

    return NextResponse.json({
      success: true,
      creator: {
        id: creator!.id,
        display_name: creator!.display_name,
        created_at: creator!.created_at,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }
}
