"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Play, DownloadCloud, Bookmark, BookmarkCheck, Star, Tv, Film } from "lucide-react";
import { MediaItem } from "@/types/tmdb";
import { getImageUrl } from "@/lib/tmdb";
import { useAppStore } from "@/lib/store";

interface MediaCardProps {
  item: MediaItem;
}

export default function MediaCard({ item }: MediaCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { watchlist, addToWatchlist, removeFromWatchlist, setSeasonPackModalData } =
    useAppStore();

  const isSaved = watchlist.some((w) => w.id === item.id);
  const mediaType = item.media_type || (item.first_air_date ? "tv" : "movie");
  const title = item.title || item.name || "Untitled";
  const releaseYear = (item.release_date || item.first_air_date || "").slice(0, 4);
  const rating = item.vote_average ? item.vote_average.toFixed(1) : "NR";
  const posterUrl = getImageUrl(item.poster_path, "w500");

  const handleWatchlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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

  const handleSeasonPack = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const imdbId = item.external_ids?.imdb_id || item.imdb_id || "";
    setSeasonPackModalData({
      imdbId,
      title,
      season: 1,
      totalSeasons: item.number_of_seasons || 1,
      mediaType,
    });
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex-shrink-0 w-44 sm:w-52 select-none transition-all duration-300 transform-gpu hover:-translate-y-2"
    >
      <Link href={`/watch?type=${mediaType}&id=${item.id}`} className="block">
        {/* Card Poster Container */}
        <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden bg-[#11131f] border border-border-glass group-hover:border-accent-primary/50 group-hover:shadow-card-hover transition-all duration-300">
          <img
            src={posterUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />

          {/* Rating Badge top-right */}
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10 text-xs font-semibold text-accent-gold shadow-md">
            <Star className="w-3 h-3 fill-accent-gold" />
            <span>{rating}</span>
          </div>

          {/* Media Type pill top-left */}
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10 text-[10px] font-bold text-text-secondary uppercase">
            {mediaType === "tv" ? (
              <>
                <Tv className="w-2.5 h-2.5 text-accent-secondary" /> TV
              </>
            ) : (
              <>
                <Film className="w-2.5 h-2.5 text-accent-primary" /> Movie
              </>
            )}
          </div>

          {/* Sinhala Subtitle Indicator ribbon bottom */}
          <div className="absolute bottom-2 left-2 right-2 bg-[#090b14]/85 backdrop-blur-md border border-indigo-500/25 rounded-lg py-1 px-2 flex items-center justify-between text-[10px] text-indigo-300">
            <span className="font-sinhala font-medium truncate">සිංහල උපසිරැසි</span>
            <span className="text-[9px] bg-indigo-500/30 text-white px-1 rounded font-bold">
              SubDL
            </span>
          </div>

          {/* Hover Overlay with Quick Actions */}
          <div
            className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 flex flex-col justify-end transition-opacity duration-300 ${
              isHovered ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <div className="flex items-center justify-center gap-2 mb-8">
              {/* Play Button */}
              <div
                className="w-12 h-12 rounded-full bg-accent-primary hover:bg-accent-primary-hover flex items-center justify-center text-white shadow-lg shadow-accent-primary/40 transform hover:scale-110 active:scale-95 transition-transform"
                title="Watch Now"
              >
                <Play className="w-5 h-5 fill-white ml-0.5" />
              </div>
            </div>

            <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-white/10">
              {/* Season Pack Button */}
              <button
                onClick={handleSeasonPack}
                title={mediaType === "tv" ? "Season Pack Magnets" : "Magnet Downloads"}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-text-secondary hover:text-white transition-colors"
              >
                <DownloadCloud className="w-4 h-4" />
              </button>

              {/* Watchlist toggle */}
              <button
                onClick={handleWatchlist}
                title={isSaved ? "Remove from Watchlist" : "Save to Watchlist"}
                className={`p-2 rounded-lg transition-colors ${
                  isSaved
                    ? "bg-accent-gold/20 text-accent-gold"
                    : "bg-white/10 hover:bg-white/20 text-text-secondary hover:text-white"
                }`}
              >
                {isSaved ? (
                  <BookmarkCheck className="w-4 h-4 fill-accent-gold" />
                ) : (
                  <Bookmark className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Title and metadata underneath */}
        <div className="mt-2.5 space-y-0.5">
          <h3 className="text-sm font-semibold text-white truncate group-hover:text-accent-primary transition-colors">
            {title}
          </h3>
          <div className="flex items-center justify-between text-xs text-text-muted">
            <span>{releaseYear || "Recent"}</span>
            <span className="text-[10px] text-text-subtle font-mono uppercase">
              1080p Cloud
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
