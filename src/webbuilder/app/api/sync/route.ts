import { NextRequest, NextResponse } from "next/server";
import { BlobStorageProvider, FileSystemStorageProvider } from "@/app/lib/storage";

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const ideaId = searchParams.get("ideaId");

  if (!userId || !ideaId) {
    return NextResponse.json({ error: "userId and ideaId are required" }, { status: 400 });
  }

  const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
  if (!accountName || accountName.trim().length === 0) {
    return NextResponse.json({ synced: false, reason: "no-blob-storage" });
  }

  const storageKey = `${userId}_${ideaId}`;
  const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || "webbuilder";
  const blobProvider = new BlobStorageProvider(accountName, containerName);
  const bundle = await blobProvider.getCodeBundle(storageKey);

  if (!bundle || Object.keys(bundle.files).length === 0) {
    return NextResponse.json({ synced: false, reason: "not-found" });
  }

  const localProvider = new FileSystemStorageProvider();
  await localProvider.saveCodeBundle(storageKey, bundle);

  return NextResponse.json({ synced: true, storageKey });
}
