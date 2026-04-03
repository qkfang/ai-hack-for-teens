"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface DesignData {
  userName: string;
  code: string;
  version: number;
  updatedAt: string;
}

export default function GalleryViewerPage() {
  const params = useParams<{ userId: string }>();
  const [design, setDesign] = useState<DesignData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const userId = params.userId;
    if (!userId) return;

    Promise.all([
      fetch(`/api/user?userId=${encodeURIComponent(userId)}`).then((r) => r.json()),
      fetch(`/api/code?userId=${encodeURIComponent(userId)}&all=true`).then((r) => r.json()),
    ])
      .then(([userData, codeData]) => {
        if (!userData.user) { setError("User not found"); return; }
        const entrypoint = codeData.entrypoint || "index.html";
        const code = codeData.files?.[entrypoint] || "";
        if (!code) { setError("No design found for this user"); return; }
        setDesign({
          userName: userData.user.name,
          code,
          version: codeData.version || 0,
          updatedAt: codeData.updatedAt || "",
        });
      })
      .catch(() => setError("Failed to load design"))
      .finally(() => setIsLoading(false));
  }, [params.userId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
          <span className="text-gray-600 dark:text-gray-400">Loading design...</span>
        </div>
      </div>
    );
  }

  if (error || !design) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 gap-4">
        <p className="text-gray-500 dark:text-gray-400 text-lg">{error || "Design not found"}</p>
        <Link href="/gallery" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Back to Gallery
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-semibold text-gray-900 dark:text-white">
                {design.userName}&apos;s Design
              </h1>
              <span className="px-1.5 py-0.5 text-[10px] font-medium bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300 rounded-full">
                Read Only
              </span>
              <span className="text-[10px] text-gray-400 dark:text-gray-500">v{design.version}</span>
            </div>
            {/* <Link
              href="/gallery"
              className="px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            >
              &larr; Gallery
            </Link> */}
          </div>
        </div>
      </header>
      <main className="flex-1">
        <iframe
          srcDoc={design.code}
          sandbox="allow-scripts allow-forms allow-modals"
          className="w-full border-0"
          style={{ height: "calc(100vh - 36px)" }}
          title={`${design.userName}'s design`}
        />
      </main>
    </div>
  );
}
