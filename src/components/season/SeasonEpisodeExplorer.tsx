"use client";

import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  Circle,
  Play,
  Calendar,
  Clock,
  Star,
  DownloadCloud,
  ChevronDown,
  Layers,
} from "lucide-react";
import { Season } from "@/types/tmdb";
import { getImageUrl } from "@/lib/tmdb";
import { useAppStore } from "@/lib/store";

interface SeasonEpisodeExplorerProps {
  tvId: number;
  totalSeasons: number;
  currentSeason: number;
  currentEpisode: number;
  onSelectEpisode: (season: number, episode: number) => void;
  onSeasonChange?: (season: number) => void;
  imdbId?: string;
  seriesTitle: string;
}

export default function SeasonEpisodeExplorer({
  tvId,
  totalSeasons,
  currentSeason,
  currentEpisode,
  onSelectEpisode,
  onSeasonChange,
  imdbId,
  seriesTitle,
}: SeasonEpisodeExplorerProps) {
  const [selectedSeason, setSelectedSeason] = useState<number>(currentSeason || 1);
  const [seasonData, setSeasonData] = useState<Season | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const { isEpisodeWatched, toggleEpisodeWatched, setSeasonPackModalData } = useAppStore();

  // Keep selectedSeason in sync if currentSeason changes
  useEffect(() => {
    if (currentSeason) {
      setSelectedSeason(currentSeason);
    }
  }, [currentSeason]);

  // Fetch season episodes from TMDB
  useEffect(() => {
    let active = true;
    setLoading(true);

    async function loadSeason() {
      try {
        const apiKey =
          process.env.NEXT_PUBLIC_TMDB_API_KEY || "930ad4a1965f9d84446cdb78e49c310d";
        const res = await fetch(
          `https://api.themoviedb.org/3/tv/${tvId}/season/${selectedSeason}?api_key=${apiKey}&language=en-US`
        );
        if (res.ok && active) {
          const data = await res.json();
          setSeasonData(data);
        }
      } catch (err) {
        console.error("Failed to load season details:", err);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadSeason();
    return () => {
      active = false;
    };
  }, [tvId, selectedSeason]);

  const episodes = seasonData?.episodes || [];

  // Calculate watched stats
  const watchedCount = episodes.filter((ep) =>
    isEpisodeWatched(tvId, selectedSeason, ep.episode_number)
  ).length;
  const progressPercent =
    episodes.length > 0 ? Math.round((watchedCount / episodes.length) * 100) : 0;

  const handleSeasonSelect = (newSeason: number) => {
    setSelectedSeason(newSeason);
    onSeasonChange?.(newSeason);
  };

  const handleDownloadCompleteSeason = () => {
    setSeasonPackModalData({
      imdbId: imdbId || "",
      title: `${seriesTitle} (Season ${selectedSeason})`,
      season: selectedSeason,
      totalSeasons,
      mediaType: "tv",
    });
  };

  const handleOpenEpisodeDownload = (epNum: number) => {
    setSeasonPackModalData({
      imdbId: imdbId || "",
      title: `${seriesTitle} S${selectedSeason.toString().padStart(2, "0")}E${epNum
        .toString()
        .padStart(2, "0")}`,
      season: selectedSeason,
      totalSeasons,
      mediaType: "tv",
    });
  };

  return (
    <div className="w-full bg-[#0a0c16]/80 rounded-2xl border border-border-glass p-4 sm:p-6 backdrop-blur-xl shadow-xl space-y-6">
      {/* Header with Season Selector, Watched Tracker Progress & Complete Season Download */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-glass">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-secondary/15 border border-accent-secondary/30 flex items-center justify-center text-accent-secondary">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Season & Episode Explorer</span>
              <span className="text-xs font-normal text-text-muted">
                ({episodes.length} Episodes)
              </span>
            </h3>
            <p className="text-xs text-text-muted font-sinhala">
              සියලු කථාංග පිළිවෙළින් නරඹන්න සහ Watched ලකුණු කරන්න
            </p>
          </div>
        </div>

        {/* Season Dropdown Selector & Download Complete Season Button */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Watched Progress Badge */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs">
            <span className="text-text-muted">Watched:</span>
            <span className="font-semibold text-emerald-400">
              {watchedCount}/{episodes.length}
            </span>
            <div className="w-14 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-400 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-[10px] text-text-subtle">{progressPercent}%</span>
          </div>

          {/* Season Selector */}
          <div className="relative">
            <select
              value={selectedSeason}
              onChange={(e) => handleSeasonSelect(parseInt(e.target.value, 10))}
              className="appearance-none bg-surface-glass hover:bg-surface-glass-hover text-white text-xs font-semibold px-4 py-2.5 pr-8 rounded-xl border border-border-glass focus:outline-none focus:border-accent-secondary cursor-pointer shadow-md"
            >
              {Array.from({ length: totalSeasons || 1 }, (_, i) => i + 1).map((s) => (
                <option key={s} value={s} className="bg-[#0e101a] text-white">
                  Season {s}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-text-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Download Complete Season Pack Button */}
          <button
            onClick={handleDownloadCompleteSeason}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-accent-primary hover:bg-accent-primary-hover text-white text-xs font-semibold shadow-md shadow-accent-primary/25 transition-all active:scale-95 flex-shrink-0"
            title={`Download Complete Season ${selectedSeason} Pack Magnets`}
          >
            <DownloadCloud className="w-3.5 h-3.5" />
            <span>Download Season {selectedSeason}</span>
          </button>
        </div>
      </div>

      {/* Episode List */}
      {loading ? (
        <div className="py-16 text-center text-text-muted">
          <div className="w-8 h-8 border-2 border-accent-secondary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs">Loading Season {selectedSeason} episodes...</p>
        </div>
      ) : episodes.length > 0 ? (
        <div className="space-y-3">
          {episodes.map((ep) => {
            const isCurrentPlaying =
              selectedSeason === currentSeason && ep.episode_number === currentEpisode;
            const watched = isEpisodeWatched(tvId, selectedSeason, ep.episode_number);
            const stillUrl = getImageUrl(ep.still_path, "w500");

            return (
              <div
                key={ep.id}
                className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-3.5 rounded-xl border transition-all ${
                  isCurrentPlaying
                    ? "bg-accent-primary/10 border-accent-primary/50 shadow-lg shadow-accent-primary/10"
                    : "bg-surface-glass/60 hover:bg-surface-glass border-border-glass"
                }`}
              >
                {/* Thumbnail & Title Info */}
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  {/* Thumbnail Still */}
                  <div
                    onClick={() => onSelectEpisode(selectedSeason, ep.episode_number)}
                    className="relative w-28 sm:w-36 aspect-video rounded-lg overflow-hidden bg-black/60 flex-shrink-0 cursor-pointer group"
                  >
                    <img
                      src={stillUrl}
                      alt={ep.name}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                      <div className="w-7 h-7 rounded-full bg-accent-primary/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
                        <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                      </div>
                    </div>
                    <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-mono text-white">
                      E{ep.episode_number}
                    </span>
                  </div>

                  {/* Title & Metadata */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-accent-secondary">
                        S{selectedSeason.toString().padStart(2, "0")}E
                        {ep.episode_number.toString().padStart(2, "0")}
                      </span>
                      <h4
                        onClick={() => onSelectEpisode(selectedSeason, ep.episode_number)}
                        className={`text-sm font-semibold truncate cursor-pointer transition-colors ${
                          isCurrentPlaying
                            ? "text-accent-primary"
                            : "text-white hover:text-accent-primary"
                        }`}
                      >
                        {ep.name || `Episode ${ep.episode_number}`}
                      </h4>
                    </div>

                    <div className="flex items-center gap-3 mt-1 text-[11px] text-text-muted">
                      {ep.air_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-text-subtle" />
                          {ep.air_date}
                        </span>
                      )}
                      {ep.runtime && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-text-subtle" />
                          {ep.runtime} min
                        </span>
                      )}
                      {ep.vote_average ? (
                        <span className="flex items-center gap-1 text-accent-gold">
                          <Star className="w-3 h-3 fill-accent-gold" />
                          {ep.vote_average.toFixed(1)}
                        </span>
                      ) : null}
                    </div>

                    {ep.overview && (
                      <p className="text-[11px] text-text-muted line-clamp-1 mt-1">
                        {ep.overview}
                      </p>
                    )}
                  </div>
                </div>

                {/* Episode Actions */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-white/5">
                  {/* Watched Toggle Badge */}
                  <button
                    onClick={() =>
                      toggleEpisodeWatched(tvId, selectedSeason, ep.episode_number)
                    }
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      watched
                        ? "bg-emerald-950/60 text-emerald-400 border border-emerald-500/30"
                        : "bg-white/5 text-text-muted hover:text-white border border-transparent"
                    }`}
                    title={watched ? "Mark as Unwatched" : "Mark as Watched"}
                  >
                    {watched ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Watched</span>
                      </>
                    ) : (
                      <>
                        <Circle className="w-3.5 h-3.5 text-text-subtle" />
                        <span>Mark Watched</span>
                      </>
                    )}
                  </button>

                  {/* Play Stream Button */}
                  <button
                    onClick={() => onSelectEpisode(selectedSeason, ep.episode_number)}
                    className={`p-2 rounded-lg transition-all ${
                      isCurrentPlaying
                        ? "bg-accent-primary text-white shadow-md shadow-accent-primary/30"
                        : "bg-white/5 hover:bg-white/15 text-text-secondary hover:text-white"
                    }`}
                    title="Play Episode Stream"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </button>

                  {/* Magnet Download Button */}
                  <button
                    onClick={() => handleOpenEpisodeDownload(ep.episode_number)}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/15 text-text-secondary hover:text-white transition-colors"
                    title="Episode Magnet Links"
                  >
                    <DownloadCloud className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-12 text-center text-text-muted">
          <p className="text-xs">No episodes found for Season {selectedSeason}.</p>
        </div>
      )}
    </div>
  );
}
