"use client";

import React from "react";
import Link from "next/link";
import { History, Play, Trash2, ArrowRight } from "lucide-react";
import { useAppStore } from "@/lib/store";
import SeasonPackModal from "@/components/season/SeasonPackModal";

export default function ContinueWatchingPage() {
  const { continueWatching, removeContinueWatching } = useAppStore();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-border-glass">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-accent-secondary text-xs font-semibold uppercase tracking-wider">
            <History className="w-4 h-4" />
            <span>Streaming History</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Continue Watching
          </h1>
          <p className="text-xs text-text-muted font-sinhala">
            ඔබ නැරඹූ අවසන් තැනින් නැවත ආරම්භ කරන්න
          </p>
        </div>

        <span className="text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-text-muted">
          {continueWatching.length} In Progress
        </span>
      </div>

      {/* Grid or Empty State */}
      {continueWatching.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {continueWatching.map((item) => {
            const watchUrl =
              item.media_type === "tv"
                ? `/watch?type=tv&id=${item.id}&season=${item.season || 1}&episode=${
                    item.episode || 1
                  }`
                : `/watch?type=movie&id=${item.id}`;

            return (
              <div
                key={`${item.media_type}-${item.id}`}
                className="group relative flex flex-col bg-surface-glass border border-border-glass rounded-2xl p-4 hover:border-accent-secondary/50 transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <span className="text-[10px] uppercase font-bold text-accent-secondary bg-indigo-950/60 border border-indigo-500/20 px-2 py-0.5 rounded">
                      {item.media_type === "tv"
                        ? `Season ${item.season} • Episode ${item.episode}`
                        : "Movie"}
                    </span>
                    <h3 className="text-sm font-semibold text-white truncate pt-1">
                      {item.title}
                    </h3>
                  </div>

                  <button
                    onClick={() => removeContinueWatching(item.id)}
                    className="p-1.5 rounded-lg text-text-muted hover:text-red-400 hover:bg-red-950/30 transition-colors flex-shrink-0"
                    title="Remove from history"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-accent-primary h-full transition-all duration-300"
                    style={{ width: `${item.progressPercent || 30}%` }}
                  />
                </div>

                {/* Resume Stream Button */}
                <Link
                  href={watchUrl}
                  className="flex items-center justify-center gap-2 w-full bg-white/5 hover:bg-accent-primary text-white text-xs font-semibold py-2.5 rounded-xl border border-white/10 hover:border-transparent transition-all shadow-md group-hover:scale-[1.01]"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Resume Playing</span>
                </Link>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-24 text-center text-text-muted space-y-3">
          <History className="w-12 h-12 mx-auto text-text-subtle opacity-30" />
          <h3 className="text-base font-semibold text-white">No stream history yet</h3>
          <p className="text-xs text-text-muted max-w-sm mx-auto font-sinhala">
            ඔබ නරඹන ඕනෑම චිත්‍රපටයක් හෝ කථාංගයක් ස්වයංක්‍රීයව මෙහි සුරැකෙනු ඇත.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-accent-primary hover:bg-accent-primary-hover text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-md"
          >
            <span>Explore Catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      <SeasonPackModal />
    </div>
  );
}
