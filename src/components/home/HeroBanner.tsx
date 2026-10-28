"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Play,
  DownloadCloud,
  Bookmark,
  BookmarkCheck,
  Star,
  Info,
  Sparkles,
  Shuffle,
} from "lucide-react";
import { MediaItem } from "@/types/tmdb";
import { getImageUrl } from "@/lib/tmdb";
import { useAppStore } from "@/lib/store";

interface HeroBannerProps {
  item: MediaItem;
  pool?: MediaItem[];
}

export default function HeroBanner({ item: initialItem, pool }: HeroBannerProps) {
  const [item, setItem] = useState<MediaItem>(initialItem);

  const { watchlist, addToWatchlist, removeFromWatchlist, setSeasonPackModalData } =
    useAppStore();

  useEffect(() => {
    setItem(initialItem);
  }, [initialItem]);

  const isSaved = watchlist.some((w) => w.id === item.id);
  const mediaType = item.media_type || (item.first_air_date ? "tv" : "movie");
  const title = item.title || item.name || "Featured Title";
  const releaseYear = (item.release_date || item.first_air_date || "").slice(0, 4);
  const backdropUrl = getImageUrl(item.backdrop_path || item.poster_path, "original");
  const rating = item.vote_average ? item.vote_average.toFixed(1) : "8.2";

  const handleWatchlistToggle = () => {
    if (isSaved) {
      removeFromWatchlist(item.id);
    } else {
      addToWatchlist({
        id: item.id,
        title,
        poster_path: item.poster_path,
        backdrop_path: item.backdrop_path,
        media_type: mediaType,
        vote_average: item.vote_average,
        release_date: item.release_date || item.first_air_date,
      });
    }
  };

  const handleOpenSeasonPacks = () => {
    const imdbId = item.external_ids?.imdb_id || item.imdb_id || "";
    setSeasonPackModalData({
      imdbId,
      title,
      season: 1,
      totalSeasons: item.number_of_seasons || 1,
      mediaType,
    });
  };

  const handleShuffle = () => {
    if (!pool || pool.length === 0) return;
    const remaining = pool.filter((p) => p.id !== item.id);
    const nextItem =
      remaining.length > 0
        ? remaining[Math.floor(Math.random() * remaining.length)]
        : pool[0];
    setItem(nextItem);
  };

  return (
    <div className="relative w-full h-[75vh] min-h-[550px] max-h-[820px] overflow-hidden">
      {/* Background Backdrop Image */}
      <div className="absolute inset-0 z-0">
        <img
          key={item.id}
          src={backdropUrl}
          alt={title}
          className="w-full h-full object-cover object-top opacity-60 scale-105 animate-ambient-shift transition-transform duration-1000"
        />
        {/* Apple TV+ Spatial Ambient Glow */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-accent-primary/25 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-accent-secondary/20 rounded-full blur-[160px] pointer-events-none" />

        {/* Gradient overlays to merge smoothly into dark background */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-[#050508]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050508] via-[#050508]/70 to-transparent w-full md:w-3/4" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-16 md:pb-24">
        <div className="max-w-2xl space-y-4">
          {/* Sinhala Subtitle & Category Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 bg-gradient-to-r from-accent-primary to-rose-700 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-md shadow-accent-primary/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Trending Worldwide</span>
            </span>

            <span className="font-sinhala text-xs px-3 py-1 rounded-full bg-surface-glass border border-indigo-500/30 text-indigo-200 backdrop-blur-md flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
              සිංහල උපසිරැසි පවතී (SubDL & Baiscope)
            </span>

            <span className="uppercase text-[11px] font-bold tracking-wider px-2 py-0.5 rounded bg-white/10 text-white">
              {mediaType === "tv" ? "TV Series" : "Movie"}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-[1.1] drop-shadow-xl">
            {title}
          </h1>

          {/* Meta details: Year, Rating, Runtime/Seasons */}
          <div className="flex items-center gap-3.5 text-xs sm:text-sm text-text-secondary font-medium flex-wrap">
            <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-md text-accent-gold">
              <Star className="w-4 h-4 fill-accent-gold" />
              <span className="font-bold">{rating}</span>
              <span className="text-[10px] text-text-muted">/10</span>
            </div>

            {releaseYear && <span>{releaseYear}</span>}
            <span className="w-1 h-1 rounded-full bg-text-muted" />

            {item.number_of_seasons ? (
              <span>{item.number_of_seasons} Seasons</span>
            ) : item.runtime ? (
              <span>
                {Math.floor(item.runtime / 60)}h {item.runtime % 60}m
              </span>
            ) : (
              <span>4K Ultra HD</span>
            )}

            <span className="w-1 h-1 rounded-full bg-text-muted" />
            <span className="px-1.5 py-0.5 rounded border border-white/20 text-[10px] text-text-secondary">
              1080p Cloud
            </span>
          </div>

          {/* Overview summary */}
          <p className="text-text-secondary text-sm sm:text-base leading-relaxed line-clamp-3 max-w-xl drop-shadow-md">
            {item.overview}
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-3">
            {/* Watch Now Button */}
            <Link
              href={`/watch?type=${mediaType}&id=${item.id}`}
              className="flex items-center gap-2.5 bg-accent-primary hover:bg-accent-primary-hover text-white font-bold px-6 py-3.5 rounded-xl shadow-lg shadow-accent-primary/35 hover:scale-105 active:scale-95 transition-all text-sm"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Watch Now</span>
            </Link>

            {/* Season Packs / Downloads Button */}
            <button
              onClick={handleOpenSeasonPacks}
              className="flex items-center gap-2 bg-surface-glass hover:bg-surface-glass-hover text-white border border-border-glass hover:border-white/20 font-semibold px-5 py-3.5 rounded-xl backdrop-blur-md hover:scale-105 active:scale-95 transition-all text-sm shadow-md"
            >
              <DownloadCloud className="w-4 h-4 text-accent-secondary" />
              <span>
                {mediaType === "tv" ? "Season Packs & Downloads" : "Download Magnets"}
              </span>
            </button>

            {/* Add to Watchlist */}
            <button
              onClick={handleWatchlistToggle}
              title={isSaved ? "Remove from Watchlist" : "Add to Watchlist"}
              className={`p-3.5 rounded-xl border backdrop-blur-md transition-all ${
                isSaved
                  ? "bg-accent-gold/20 border-accent-gold text-accent-gold"
                  : "bg-surface-glass border-border-glass text-text-muted hover:text-white hover:bg-surface-glass-hover"
              }`}
            >
              {isSaved ? (
                <BookmarkCheck className="w-4 h-4 fill-accent-gold" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
            </button>

            {/* View Details */}
            <Link
              href={`/details?type=${mediaType}&id=${item.id}`}
              className="p-3.5 rounded-xl bg-surface-glass border border-border-glass text-text-muted hover:text-white hover:bg-surface-glass-hover backdrop-blur-md transition-all"
              title="More Details & Cast"
            >
              <Info className="w-4 h-4" />
            </Link>

            {/* Random Spotlight Shuffle */}
            {pool && pool.length > 1 && (
              <button
                onClick={handleShuffle}
                className="p-3.5 rounded-xl bg-surface-glass border border-border-glass text-text-muted hover:text-white hover:bg-surface-glass-hover backdrop-blur-md transition-all"
                title="Random Spotlight • Shuffle Featured Title"
              >
                <Shuffle className="w-4 h-4 text-accent-secondary" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
