import { NextRequest, NextResponse } from "next/server";
import { storage, BlobStorageProvider } from "@/app/lib/storage";

function getStorageKey(userId: string, ideaId: string | null): string {
  return ideaId ? `${userId}/${ideaId}` : userId;
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const ideaId = searchParams.get("ideaId");

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  if (!connectionString) {
    return NextResponse.json({ error: "Azure Storage not configured" }, { status: 503 });
  }

  const storageKey = getStorageKey(userId, ideaId);
  const bundle = await storage.getCodeBundle(storageKey);

  if (!bundle || Object.keys(bundle.files).length === 0) {
    return NextResponse.json({ error: "No data to save" }, { status: 404 });
  }

  const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || "webbuilder";
  const blobProvider = new BlobStorageProvider(connectionString, containerName);
  await blobProvider.saveCodeBundle(storageKey, bundle);

  return NextResponse.json({ success: true, storageKey });
}
