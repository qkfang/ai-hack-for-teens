"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface GalleryEntry {
  userId: string;
  userName: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  entrypoint: string;
  code: string;
}

export default function GalleryPage() {
  const [entries, setEntries] = useState<GalleryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/gallery")
      .then((res) => res.json())
      .then((data) => setEntries(data.gallery || []))
      .catch((err) => console.error("Failed to load gallery:", err))
      .finally(() => setIsLoading(false));
  }, []);

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
            <h1 className="text-sm font-semibold text-gray-900 dark:text-white">Design Gallery</h1>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {entries.map((entry) => (
              <Link
                key={entry.userId}
                href={`/gallery/${entry.userId}`}
                className="group block bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow"
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
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
