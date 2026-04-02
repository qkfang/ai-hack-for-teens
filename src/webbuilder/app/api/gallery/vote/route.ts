import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/app/lib/storage";

export async function POST(request: NextRequest) {
  try {
    const { fromUserId, toUserId } = await request.json();
    if (!fromUserId || !toUserId) {
      return NextResponse.json({ error: "fromUserId and toUserId are required" }, { status: 400 });
    }
    if (fromUserId === toUserId) {
      return NextResponse.json({ error: "Cannot vote for your own design" }, { status: 400 });
    }
    const result = await storage.toggleVote(fromUserId, toUserId);
    return NextResponse.json(result);
  } catch (err) {
    console.error("Failed to process vote:", err);
    return NextResponse.json({ error: "Failed to process vote" }, { status: 500 });
  }
}
