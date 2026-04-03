import { NextResponse } from "next/server";
import { storage } from "@/app/lib/storage";

export async function GET() {
  const users = await storage.listUsers();

  const entries = await Promise.all(
    users.map(async (user) => {
      if (!user.ideaId) return null;
      const storageKey = `${user.id}_${user.ideaId}`;
      const bundle = await storage.getCodeBundle(storageKey);
      if (!bundle || Object.keys(bundle.files).length === 0) return null;

      const entrypointCode = bundle.files[bundle.entrypoint] || "";
      return {
        userId: user.id,
        userName: user.name,
        ideaId: user.ideaId,
        ideaTitle: user.ideaTitle || "",
        createdAt: user.createdAt,
        updatedAt: bundle.updatedAt,
        version: bundle.version,
        entrypoint: bundle.entrypoint,
        code: entrypointCode,
      };
    })
  );

  const gallery = entries.filter(Boolean);
  return NextResponse.json({ gallery });
}
