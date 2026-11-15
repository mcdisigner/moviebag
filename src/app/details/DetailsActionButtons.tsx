"use client";

import React from "react";
import Link from "next/link";
import { Play, DownloadCloud } from "lucide-react";
import { useAppStore } from "@/lib/store";

interface DetailsActionButtonsProps {
  mediaId: number;
  mediaType: "movie" | "tv";
  title: string;
  imdbId?: string;
  totalSeasons?: number;
}

export default function DetailsActionButtons({
  mediaId,
  mediaType,
  title,
  imdbId,
  totalSeasons = 1,
}: DetailsActionButtonsProps) {
  const setSeasonPackModalData = useAppStore((state) => state.setSeasonPackModalData);

  const handleOpenPacks = () => {
    setSeasonPackModalData({
      imdbId: imdbId || "",
      tmdbId: mediaId,
      title: mediaType === "tv" ? `${title} (Season 1)` : title,
      season: 1,
      totalSeasons,
      mediaType,
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-3 pt-4">
      <Link
        href={`/watch?type=${mediaType}&id=${mediaId}`}
        className="flex items-center gap-2 bg-accent-primary hover:bg-accent-primary-hover text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-accent-primary/30 transition-transform active:scale-95 text-sm"
      >
        <Play className="w-4 h-4 fill-white" />
        <span>Watch Now (Stream)</span>
      </Link>

      <button
        type="button"
        onClick={handleOpenPacks}
        className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white font-semibold px-5 py-3 rounded-xl border border-white/10 hover:border-white/20 transition-all active:scale-95 text-sm"
      >
        <DownloadCloud className="w-4 h-4 text-accent-secondary" />
        <span>{mediaType === "tv" ? "Season Packs (Torrents)" : "Download Torrents"}</span>
      </button>
    </div>
  );
}
