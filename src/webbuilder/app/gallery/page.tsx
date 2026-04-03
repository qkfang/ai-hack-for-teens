"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface GalleryEntry {
  userId: string;
  userName: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  entrypoint: string;
  code: string;
}

interface DesignData {
  code: string;
  version: number;
  updatedAt: string;
}

function GalleryViewer() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");
  const userName = searchParams.get("userName") || userId;
  const ideaId = searchParams.get("ideaId");
  const ideaTitle = searchParams.get("ideaTitle") || "";

  const [design, setDesign] = useState<DesignData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId || !ideaId) { setError("Missing userId or ideaId"); setIsLoading(false); return; }

    fetch(`/api/code?userId=${encodeURIComponent(userId)}&ideaId=${encodeURIComponent(ideaId)}&all=true`)
      .then((r) => r.json())
      .then((data) => {
        const entrypoint = data.entrypoint || "index.html";
        const code = data.files?.[entrypoint] || "";
        if (!code) { setError("No design found"); return; }
        setDesign({ code, version: data.version || 0, updatedAt: data.updatedAt || "" });
      })
      .catch(() => setError("Failed to load design"))
      .finally(() => setIsLoading(false));
  }, [userId, ideaId]);

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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-1.5">
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-semibold text-gray-900 dark:text-white">
              {userName}&apos;s Design{ideaTitle ? ` — ${ideaTitle}` : ""}
            </h1>
            <span className="px-1.5 py-0.5 text-[10px] font-medium bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300 rounded-full">
              Read Only
            </span>
            <span className="text-[10px] text-gray-400 dark:text-gray-500">v{design.version}</span>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <iframe
          srcDoc={design.code}
          sandbox="allow-scripts allow-forms allow-modals"
          className="w-full border-0"
          style={{ height: "calc(100vh - 36px)" }}
          title={`${userName}'s design`}
        />
      </main>
    </div>
  );
}

function GalleryList() {
  const [entries, setEntries] = useState<GalleryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [previewEntry, setPreviewEntry] = useState<GalleryEntry | null>(null);

  useEffect(() => {
    fetch("/api/gallery")
      .then((res) => res.json())
      .then((data) => setEntries(data.gallery || []))
      .catch((err) => console.error("Failed to load gallery:", err))
      .finally(() => setIsLoading(false));
  }, []);

  const sorted = [...entries].sort((a, b) =>
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
          <span className="text-gray-600 dark:text-gray-400">Loading gallery...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-1.5">
          <div className="flex items-center justify-between">
            <h1 className="text-sm font-semibold text-gray-900 dark:text-white">Idea Spark - Web Builder Gallery</h1>
            <Link
              href="/"
              className="px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            >
              &larr; Back
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {entries.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 dark:text-gray-400 text-lg">No designs yet. Be the first to create one!</p>
            <Link
              href="/"
              className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start Building
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sorted.map((entry) => {
                return (
                  <div
                    key={entry.userId}
                    className="relative group block bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                    onClick={() => setPreviewEntry(entry)}
                  >
                    <div className="relative w-full h-48 bg-white overflow-hidden">
                      <iframe
                        srcDoc={entry.code}
                        sandbox=""
                        className="w-[200%] h-[200%] border-0 origin-top-left pointer-events-none"
                        style={{ transform: "scale(0.5)" }}
                        title={`Preview of ${entry.userName}'s design`}
                      />
                      <div className="absolute inset-0 bg-transparent group-hover:bg-black/5 transition-colors" />
                    </div>
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">{entry.userName}</h3>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">v{entry.version}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(entry.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>

      {previewEntry && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setPreviewEntry(null)}
        >
          <div
            className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl flex flex-col overflow-hidden"
            style={{ width: "90vw", height: "90vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{previewEntry.userName}&apos;s Design</span>
                <span className="px-1.5 py-0.5 text-[10px] font-medium bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300 rounded-full">Read Only</span>
                <span className="text-[10px] text-gray-400">v{previewEntry.version}</span>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/gallery/?userId=${encodeURIComponent(previewEntry.userId)}&userName=${encodeURIComponent(previewEntry.userName)}`}
                  target="_blank"
                  className="px-2 py-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  Open full page ↗
                </Link>
                <button
                  onClick={() => setPreviewEntry(null)}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <iframe
              srcDoc={previewEntry.code}
              sandbox="allow-scripts allow-forms allow-modals"
              className="flex-1 w-full border-0"
              title={`${previewEntry.userName}'s design`}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function GalleryRouter() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");
  const ideaId = searchParams.get("ideaId");

  if (userId && ideaId) {
    return <GalleryViewer />;
  }
  return <GalleryList />;
}

export default function GalleryPage() {
  return (
    <Suspense>
      <GalleryRouter />
    </Suspense>
  );
}
