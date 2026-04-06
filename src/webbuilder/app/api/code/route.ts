import { NextRequest, NextResponse } from "next/server";
import { storage, CodeBundle, BlobStorageProvider } from "@/app/lib/storage";

async function saveToBlobIfConfigured(storageKey: string, bundle: CodeBundle): Promise<void> {
  const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
  if (!accountName || accountName.trim().length === 0) return;
  const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || "webbuilder";
  const blobProvider = new BlobStorageProvider(accountName, containerName);
  await blobProvider.saveCodeBundle(storageKey, bundle);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId") || "default";
  const ideaId = searchParams.get("ideaId") || "default";
  const storageKey = `${userId}_${ideaId}`;
  const requestedFile = searchParams.get("file");
  const returnAll = searchParams.get("all") === "true";

  let bundle: CodeBundle;
  let isDefault = false;

  const userBundle = await storage.getCodeBundle(storageKey);
  if (userBundle && Object.keys(userBundle.files).length > 0) {
    bundle = userBundle;
  } else {
    bundle = await storage.getDefaultTemplate();
    isDefault = true;
    await storage.saveCodeBundle(storageKey, bundle);
  }

  if (returnAll) {
    return NextResponse.json({
      files: bundle.files,
      entrypoint: bundle.entrypoint,
      version: bundle.version,
      updatedAt: bundle.updatedAt,
      isDefault,
    });
  }

  const filename = requestedFile || bundle.entrypoint;
  const code = bundle.files[filename];

  if (!code) {
    return NextResponse.json({ error: `File "${filename}" not found` }, { status: 404 });
  }

  return NextResponse.json({
    code,
    filename,
    files: Object.keys(bundle.files),
    entrypoint: bundle.entrypoint,
    version: bundle.version,
    updatedAt: bundle.updatedAt,
    isDefault,
  });
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || "default";
    const ideaId = searchParams.get("ideaId") || "default";
    const storageKey = `${userId}_${ideaId}`;
    const body = await request.json();

    let bundle = await storage.getCodeBundle(storageKey);
    if (!bundle || Object.keys(bundle.files).length === 0) {
      const defaultTemplate = await storage.getDefaultTemplate();
      bundle = { ...defaultTemplate, files: { ...defaultTemplate.files }, version: 0 };
    }

    if (body.files && typeof body.files === "object") {
      for (const [filename, content] of Object.entries(body.files)) {
        if (typeof content === "string") bundle.files[filename] = content;
      }
      if (body.entrypoint) bundle.entrypoint = body.entrypoint;
    } else if (body.code && typeof body.code === "string") {
      const filename = body.file || bundle.entrypoint;
      bundle.files[filename] = body.code;
    } else {
      return NextResponse.json({ error: "Either 'code' or 'files' is required" }, { status: 400 });
    }

    bundle.version += 1;
    bundle.updatedAt = new Date().toISOString();
    await storage.saveCodeBundle(storageKey, bundle);
    saveToBlobIfConfigured(storageKey, bundle).catch((err) =>
      console.error("Blob mirror save failed:", err)
    );

    return NextResponse.json({
      success: true,
      version: bundle.version,
      updatedAt: bundle.updatedAt,
      files: Object.keys(bundle.files),
    });
  } catch (error) {
    console.error("Failed to save code:", error);
    return NextResponse.json({ error: "Failed to save code" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId") || "default";
  const ideaId = searchParams.get("ideaId");
  const storageKey = `${userId}_${ideaId}`;
  const fileToDelete = searchParams.get("file");

  if (fileToDelete) {
    const bundle = await storage.getCodeBundle(storageKey);
    if (bundle && bundle.files[fileToDelete]) {
      delete bundle.files[fileToDelete];
      bundle.version += 1;
      bundle.updatedAt = new Date().toISOString();
      await storage.saveCodeBundle(storageKey, bundle);
      return NextResponse.json({ success: true, message: `File "${fileToDelete}" deleted`, version: bundle.version });
    }
    return NextResponse.json({ error: `File "${fileToDelete}" not found` }, { status: 404 });
  }

  await storage.deleteCodeBundle(storageKey);
  return NextResponse.json({ success: true, message: "Code reset to default" });
}

