import { NextRequest, NextResponse } from "next/server";
import { storage, BlobStorageProvider } from "@/app/lib/storage";

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const ideaId = searchParams.get("ideaId");

  if (!userId || !ideaId) {
    return NextResponse.json({ error: "userId and ideaId are required" }, { status: 400 });
  }

  const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
  if (!accountName || accountName.trim().length === 0) {
    return NextResponse.json({ error: "Azure Storage not configured" }, { status: 503 });
  }

  const storageKey = `${userId}_${ideaId}`;
  const bundle = await storage.getCodeBundle(storageKey);

  if (!bundle || Object.keys(bundle.files).length === 0) {
    return NextResponse.json({ error: "No data to save" }, { status: 404 });
  }

  const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || "webbuilder";
  const blobProvider = new BlobStorageProvider(accountName, containerName);
  await blobProvider.saveCodeBundle(storageKey, bundle);

  return NextResponse.json({ success: true, storageKey });
}
