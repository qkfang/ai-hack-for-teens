import { NextRequest, NextResponse } from "next/server";
import { BlobStorageProvider, FileSystemStorageProvider } from "@/app/lib/storage";

function getStorageKey(userId: string, ideaId: string | null): string {
  return ideaId ? `${userId}_${ideaId}` : userId;
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const ideaId = searchParams.get("ideaId");

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  if (!connectionString || connectionString.trim().length === 0) {
    return NextResponse.json({ synced: false, reason: "no-blob-storage" });
  }

  const storageKey = getStorageKey(userId, ideaId);
  const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || "webbuilder";
  const blobProvider = new BlobStorageProvider(connectionString, containerName);
  const bundle = await blobProvider.getCodeBundle(storageKey);

  if (!bundle || Object.keys(bundle.files).length === 0) {
    return NextResponse.json({ synced: false, reason: "not-found" });
  }

  const localProvider = new FileSystemStorageProvider();
  await localProvider.saveCodeBundle(storageKey, bundle);

  return NextResponse.json({ synced: true, storageKey });
}
