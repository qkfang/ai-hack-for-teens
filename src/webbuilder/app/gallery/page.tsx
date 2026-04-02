"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useUser } from "@/app/contexts/UserContext";

interface GalleryEntry {
  userId: string;
  userName: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  entrypoint: string;
  code: string;
  votes: number;
  voters: string[];
}

type FilterType = "latest" | "highest";

export default function GalleryPage() {
  const { user } = useUser();
  const [entries, setEntries] = useState<GalleryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("latest");
  const [votingId, setVotingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/gallery")
      .then((res) => res.json())
      .then((data) => setEntries(data.gallery || []))
      .catch((err) => console.error("Failed to load gallery:", err))
      .finally(() => setIsLoading(false));
  }, []);

  const handleVote = async (e: React.MouseEvent, targetUserId: string) => {
    e.preventDefault();
    if (!user || votingId) return;
    setVotingId(targetUserId);
    try {
      const res = await fetch("/api/gallery/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fromUserId: user.id, toUserId: targetUserId }),
      });
      const data = await res.json();
      if (res.ok) {
        setEntries((prev) =>
          prev.map((entry) => {
            if (entry.userId !== targetUserId) return entry;
            const newVoters = data.voted
              ? [...entry.voters, user.id]
              : entry.voters.filter((v) => v !== user.id);
            return { ...entry, voters: newVoters, votes: newVoters.length };
          })
        );
      }
    } catch (err) {
      console.error("Failed to vote:", err);
    } finally {
      setVotingId(null);
    }
  };

  const sorted = [...entries].sort((a, b) => {
    if (filter === "highest") return b.votes - a.votes;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

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
          <>
            <div className="flex items-center gap-2 mb-6">
              <button
                onClick={() => setFilter("latest")}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                  filter === "latest"
                    ? "bg-blue-600 text-white"
                    : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                Latest
              </button>
              <button
                onClick={() => setFilter("highest")}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                  filter === "highest"
                    ? "bg-blue-600 text-white"
                    : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                Highest Votes
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sorted.map((entry) => {
                const isOwn = user?.id === entry.userId;
                const hasVoted = user ? entry.voters.includes(user.id) : false;
                return (
                  <div key={entry.userId} className="relative group block bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                    <Link href={`/gallery/${entry.userId}`} className="block">
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
                    <div className="absolute top-2 right-2">
                      <button
                        onClick={(e) => handleVote(e, entry.userId)}
                        disabled={isOwn || votingId === entry.userId}
                        title={isOwn ? "Can't vote for your own design" : hasVoted ? "Remove vote" : "Vote for this design"}
                        className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium shadow transition-colors ${
                          isOwn
                            ? "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                            : hasVoted
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900"
                        }`}
                      >
                        ♥ {entry.votes}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
