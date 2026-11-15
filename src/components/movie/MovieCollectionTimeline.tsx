"use client";

import React from "react";
import Link from "next/link";
import { Layers, ArrowRight, Play, Star, Calendar, Sparkles, CheckCircle2 } from "lucide-react";
import { MovieCollection } from "@/types/tmdb";
import { getImageUrl } from "@/lib/tmdb";

interface MovieCollectionTimelineProps {
  collection: MovieCollection;
  currentMovieId: number;
}

export default function MovieCollectionTimeline({
  collection,
  currentMovieId,
}: MovieCollectionTimelineProps) {
  if (!collection || !collection.parts || collection.parts.length <= 1) {
    return null;
  }

  const parts = collection.parts;
  const currentIndex = parts.findIndex((p) => p.id === currentMovieId);
  const currentPartNumber = currentIndex !== -1 ? currentIndex + 1 : null;
  const nextMovie = currentIndex !== -1 && currentIndex + 1 < parts.length ? parts[currentIndex + 1] : null;
  const previousMovie = currentIndex !== -1 && currentIndex > 0 ? parts[currentIndex - 1] : null;

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-surface-glass border border-border-glass backdrop-blur-xl space-y-6 shadow-2xl relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-accent-primary/15 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-accent-secondary text-xs font-semibold uppercase tracking-wider">
            <Layers className="w-4 h-4" />
            <span>Franchise & Storyline Watch Order</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5 flex-wrap">
            <span>{collection.name}</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-accent-primary/20 text-accent-primary border border-accent-primary/30">
              {parts.length} Parts Timeline
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-text-muted font-sinhala leading-relaxed">
            {currentPartNumber ? (
              <span>
                ඔබ දැනට නරඹමින් සිටින්නේ මෙම කතා මාලාවේ{" "}
                <strong className="text-white font-sans">
                  Part {currentPartNumber} of {parts.length}
                </strong>{" "}
                වන චිත්‍රපටයයි. පහතින් කතාවේ නිවැරදි අනුපිළිවෙළ (Watch Order) නරඹන්න.
              </span>
            ) : (
              "මෙම කතා මාලාවේ සියලුම චිත්‍රපට නිවැරදි අනුපිළිවෙළට පහතින් තෝරාගත හැක."
            )}
          </p>
        </div>

        {/* Next Movie Quick Action Hero Card */}
        {nextMovie && (
          <Link
            href={`/watch?type=movie&id=${nextMovie.id}`}
            className="flex items-center gap-3.5 p-3 rounded-2xl bg-gradient-to-r from-accent-primary/25 via-indigo-950/60 to-purple-950/40 border border-accent-primary/40 hover:border-accent-primary transition-all group shrink-0 shadow-lg shadow-accent-primary/10 hover:scale-[1.02] active:scale-95"
          >
            <div className="w-12 h-16 rounded-xl overflow-hidden bg-black/40 border border-white/10 shrink-0">
              <img
                src={getImageUrl(nextMovie.poster_path, "w300")}
                alt={nextMovie.title || "Next movie"}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-accent-secondary uppercase tracking-wider">
                <Sparkles className="w-3 h-3 text-accent-gold" />
                <span>මීළඟ කතාව (Next in Story)</span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-white group-hover:text-accent-primary transition-colors line-clamp-1 max-w-[200px]">
                {nextMovie.title}
              </p>
              <p className="text-[10px] text-text-muted">
                {(nextMovie.release_date || "").slice(0, 4)} • Part {currentIndex + 2}
              </p>
            </div>
            <div className="p-2 rounded-xl bg-accent-primary text-white ml-1 group-hover:translate-x-1 transition-transform">
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
        )}
      </div>

      {/* Timeline Sequence Track */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-text-muted px-1">
          <span className="font-sinhala font-medium">නැරඹිය යුතු අනුපිළිවෙළ (Chronological Order):</span>
          <span className="text-[11px] font-mono text-text-subtle">{parts.length} Connected Films</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 sm:gap-4">
          {parts.map((part, index) => {
            const partNum = index + 1;
            const isCurrent = part.id === currentMovieId;
            const isNext = currentIndex !== -1 && index === currentIndex + 1;
            const isPast = currentIndex !== -1 && index < currentIndex;
            const year = (part.release_date || "").slice(0, 4);

            return (
              <Link
                key={part.id}
                href={`/watch?type=movie&id=${part.id}`}
                className={`group relative rounded-2xl overflow-hidden border transition-all duration-300 flex flex-col ${
                  isCurrent
                    ? "bg-accent-primary/15 border-accent-primary shadow-xl shadow-accent-primary/20 scale-[1.02] ring-2 ring-accent-primary/50"
                    : isNext
                    ? "bg-surface-glass hover:bg-surface-glass-hover border-indigo-500/50 hover:border-indigo-400 shadow-md"
                    : "bg-surface-glass hover:bg-surface-glass-hover border-border-glass hover:border-white/20"
                }`}
              >
                {/* Poster Container */}
                <div className="relative aspect-[2/3] w-full bg-[#0d0f1b] overflow-hidden">
                  <img
                    src={getImageUrl(part.poster_path, "w500")}
                    alt={part.title || "Film part"}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />

                  {/* Part Number Badge Top-Left */}
                  <div className="absolute top-2 left-2 z-10 flex items-center gap-1">
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-black/75 text-white backdrop-blur-md border border-white/10 shadow">
                      Part {partNum}
                    </span>
                  </div>

                  {/* Status Overlay Badge Top-Right */}
                  <div className="absolute top-2 right-2 z-10">
                    {isCurrent ? (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-accent-primary text-white shadow-lg animate-pulse flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                        Now
                      </span>
                    ) : isNext ? (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-indigo-600 text-white shadow-md flex items-center gap-0.5">
                        <span>Next</span>
                        <ArrowRight className="w-2.5 h-2.5" />
                      </span>
                    ) : isPast ? (
                      <span className="p-1 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                        <CheckCircle2 className="w-3 h-3" />
                      </span>
                    ) : null}
                  </div>

                  {/* Hover Play Button Overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                    <div className="w-10 h-10 rounded-full bg-accent-primary text-white flex items-center justify-center shadow-lg transform scale-75 group-hover:scale-100 transition-transform">
                      <Play className="w-4 h-4 fill-white ml-0.5" />
                    </div>
                  </div>
                </div>

                {/* Card Info */}
                <div className="p-2.5 space-y-1 flex-1 flex flex-col justify-between bg-black/30">
                  <div>
                    <p
                      className={`text-xs font-bold line-clamp-2 leading-tight transition-colors ${
                        isCurrent ? "text-accent-primary" : "text-white group-hover:text-accent-primary"
                      }`}
                      title={part.title}
                    >
                      {part.title}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-text-muted pt-1">
                    <span>{year || "TBA"}</span>
                    {part.vote_average ? (
                      <span className="flex items-center gap-0.5 text-accent-gold font-semibold">
                        <Star className="w-2.5 h-2.5 fill-accent-gold" />
                        {part.vote_average.toFixed(1)}
                      </span>
                    ) : null}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
