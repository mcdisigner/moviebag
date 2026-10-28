"use client";

import React from "react";
import Link from "next/link";
import { Bookmark, Trash2, Play, ArrowRight } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { getImageUrl } from "@/lib/tmdb";
import SeasonPackModal from "@/components/season/SeasonPackModal";

export default function WatchlistPage() {
  const { watchlist, removeFromWatchlist } = useAppStore();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-border-glass">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-accent-gold text-xs font-semibold uppercase tracking-wider">
            <Bookmark className="w-4 h-4 fill-accent-gold" />
            <span>Saved Library</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            My Watchlist
          </h1>
          <p className="text-xs text-text-muted font-sinhala">
            ඔබ පසුව නැරඹීමට සුරකින ලද චිත්‍රපට සහ කතාමාලා
          </p>
        </div>

        <span className="text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-text-muted">
          {watchlist.length} {watchlist.length === 1 ? "Item" : "Items"}
        </span>
      </div>

      {/* Grid or Empty State */}
      {watchlist.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {watchlist.map((item) => {
            const poster = getImageUrl(item.poster_path, "w500");
            const releaseYear = (item.release_date || "").slice(0, 4);

            return (
              <div
                key={item.id}
                className="group relative flex flex-col bg-surface-glass border border-border-glass rounded-2xl overflow-hidden hover:border-accent-primary/50 transition-all"
              >
                {/* Poster */}
                <div className="relative aspect-[2/3] w-full overflow-hidden bg-black/60">
                  <img
                    src={poster}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 text-[10px] font-bold uppercase text-white backdrop-blur-md">
                    {item.media_type === "tv" ? "TV Series" : "Movie"}
                  </div>
                </div>

                {/* Details */}
                <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    <h3 className="text-sm font-semibold text-white truncate">
                      {item.title}
                    </h3>
                    <p className="text-xs text-text-muted">{releaseYear || "Recent"}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <Link
                      href={`/watch?type=${item.media_type}&id=${item.id}`}
                      className="flex items-center gap-1.5 text-xs font-semibold text-accent-primary hover:underline"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Stream</span>
                    </Link>

                    <button
                      onClick={() => removeFromWatchlist(item.id)}
                      className="p-1.5 rounded-lg text-text-muted hover:text-red-400 hover:bg-red-950/30 transition-colors"
                      title="Remove from Watchlist"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-24 text-center text-text-muted space-y-3">
          <Bookmark className="w-12 h-12 mx-auto text-text-subtle opacity-30" />
          <h3 className="text-base font-semibold text-white">Your Watchlist is empty</h3>
          <p className="text-xs text-text-muted max-w-sm mx-auto font-sinhala">
            මුල් පිටුවේ හෝ සෙවුම් ප්‍රතිඵලවල ඇති Bookmark අයිකනය ක්ලික් කර ඕනෑම චිත්‍රපටයක් මෙතැනට එක් කරන්න.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-accent-primary hover:bg-accent-primary-hover text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-md"
          >
            <span>Browse Trending Titles</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      <SeasonPackModal />
    </div>
  );
}
