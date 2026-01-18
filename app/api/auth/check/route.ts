import { NextRequest, NextResponse } from "next/server";
import { getCreatorById } from "@/lib/db";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const wallet = searchParams.get("wallet");

  if (!wallet) {
    return NextResponse.json(
      { error: "Wallet address required" },
      { status: 400 }
    );
  }

  const creator = await getCreatorById(wallet);

  if (creator) {
    return NextResponse.json({
      exists: true,
      creator: {
        id: creator.id,
        display_name: creator.display_name,
        created_at: creator.created_at,
      },
    });
  }

  return NextResponse.json({ exists: false });
}
