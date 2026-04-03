import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/app/lib/storage";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const listAll = searchParams.get("list") === "true";

  if (listAll) {
    const users = await storage.listUsers();
    return NextResponse.json({ users });
  }

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  const user = await storage.getUser(userId);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ user });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, userId, ideaId, ideaTitle } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const user = await storage.createUser(name.trim(), userId);
    if (ideaId || ideaTitle) {
      const updates: { ideaId?: string; ideaTitle?: string } = {};
      if (ideaId) updates.ideaId = String(ideaId);
      if (ideaTitle) updates.ideaTitle = String(ideaTitle);
      const updated = await storage.updateUser(user.id, updates);
      return NextResponse.json({ user: updated }, { status: 201 });
    }
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error("Failed to create user:", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, name, ideaId, ideaTitle } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const updates: { name?: string; ideaId?: string; ideaTitle?: string } = {};
    if (name && typeof name === "string") {
      updates.name = name.trim();
    }
    if (ideaId !== undefined) updates.ideaId = String(ideaId);
    if (ideaTitle !== undefined) updates.ideaTitle = String(ideaTitle);

    const user = await storage.updateUser(userId, updates);
    return NextResponse.json({ user });
  } catch (error) {
    console.error("Failed to update user:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  return NextResponse.json({ success: true, message: "User deletion not implemented yet" });
}
