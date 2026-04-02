import { NextResponse } from "next/server";
import { storage } from "@/app/lib/storage";

export async function GET() {
  const [users, allVotes] = await Promise.all([
    storage.listUsers(),
    storage.getAllVotes(),
  ]);

  const entries = await Promise.all(
    users.map(async (user) => {
      const bundle = await storage.getCodeBundle(user.id);
      if (!bundle || Object.keys(bundle.files).length === 0) return null;

      const entrypointCode = bundle.files[bundle.entrypoint] || "";
      return {
        userId: user.id,
        userName: user.name,
        createdAt: user.createdAt,
        updatedAt: bundle.updatedAt,
        version: bundle.version,
        entrypoint: bundle.entrypoint,
        code: entrypointCode,
        votes: (allVotes[user.id] || []).length,
        voters: allVotes[user.id] || [],
      };
    })
  );

  const gallery = entries.filter(Boolean);
  return NextResponse.json({ gallery });
}
