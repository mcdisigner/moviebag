"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Star,
  DownloadCloud,
  Bookmark,
  BookmarkCheck,
  Languages,
  Subtitles,
  Sparkles,
} from "lucide-react";
import StreamPlayer from "@/components/player/StreamPlayer";
import SeasonEpisodeExplorer from "@/components/season/SeasonEpisodeExplorer";
import SeasonPackModal from "@/components/season/SeasonPackModal";
import ZipDropzone from "@/components/subtitles/ZipDropzone";
import MediaCard from "@/components/home/MediaCard";
import { MediaItem } from "@/types/tmdb";
import { SubDLSubtitleItem, SubtitleTrack } from "@/types/subtitles";
import { useAppStore } from "@/lib/store";

interface WatchClientProps {
  media: MediaItem;
  mediaType: "movie" | "tv";
  initialSeason: number;
  initialEpisode: number;
  imdbId?: string;
}

export default function WatchClient({
  media,
  mediaType,
  initialSeason,
  initialEpisode,
  imdbId,
}: WatchClientProps) {
  const router = useRouter();
  const [season, setSeason] = useState<number>(initialSeason);
  const [episode, setEpisode] = useState<number>(initialEpisode);
  const [availableSubs, setAvailableSubs] = useState<SubDLSubtitleItem[]>([]);
  const [subLoading, setSubLoading] = useState<boolean>(true);

  const {
    watchlist,
    addToWatchlist,
    removeFromWatchlist,
    setSeasonPackModalData,
    setActiveSubtitleTrack,
    setSecondarySubtitleTrack,
    activeSubtitleTrack,
  } = useAppStore();

  const isSaved = watchlist.some((w) => w.id === media.id);
  const title = media.title || media.name || "Untitled";
  const releaseYear = (media.release_date || media.first_air_date || "").slice(0, 4);

  // Auto-fetch SubDL Subtitles when media, season, or episode changes
  useEffect(() => {
    let active = true;
    if (!imdbId) {
      setSubLoading(false);
      return;
    }

    setSubLoading(true);

    async function fetchSubs() {
      try {
        const query = new URLSearchParams({
          imdb_id: imdbId || "",
          type: mediaType,
          languages: "si,en",
          action: "auto",
        });

        if (mediaType === "tv") {
          query.set("season_number", season.toString());
          query.set("episode_number", episode.toString());
        }

        const res = await fetch(`/api/subtitles?${query.toString()}`);
        if (res.ok && active) {
          const data = await res.json();
          setAvailableSubs(data.subtitles || []);

          // If auto Sinhala extracted, set as active
          if (data.autoSinhala) {
            const track: SubtitleTrack = {
              id: `subdl-si-${Date.now()}`,
              label: data.autoSinhala.name || "SubDL Sinhala",
              language: "si",
              cues: data.autoSinhala.cues,
              source: "subdl",
            };
            setActiveSubtitleTrack(track);
          }

          // If auto English extracted, set as secondary for Dual Subtitle mode
          if (data.autoEnglish) {
            const secTrack: SubtitleTrack = {
              id: `subdl-en-${Date.now()}`,
              label: data.autoEnglish.name || "SubDL English",
              language: "en",
              cues: data.autoEnglish.cues,
              source: "subdl",
            };
            setSecondarySubtitleTrack(secTrack);
          }
        }
      } catch (err) {
        console.error("Failed to auto-fetch subtitles:", err);
      } finally {
        if (active) setSubLoading(false);
      }
    }

    fetchSubs();
    return () => {
      active = false;
    };
  }, [
    imdbId,
    mediaType,
    season,
    episode,
    setActiveSubtitleTrack,
    setSecondarySubtitleTrack,
  ]);

  const handleSelectEpisode = (newSeason: number, newEpisode: number) => {
    setSeason(newSeason);
    setEpisode(newEpisode);
    router.push(`/watch?type=tv&id=${media.id}&season=${newSeason}&episode=${newEpisode}`);
  };

  const handleOpenSeasonPacks = () => {
    setSeasonPackModalData({
      imdbId: imdbId || "",
      title:
        mediaType === "tv"
          ? `${title} (Season ${season})`
          : title,
      season,
      totalSeasons: media.number_of_seasons || 1,
      mediaType,
    });
  };

  const handleWatchlistToggle = () => {
    if (isSaved) {
      removeFromWatchlist(media.id);
    } else {
      addToWatchlist({
        id: media.id,
        title,
        poster_path: media.poster_path,
        backdrop_path: media.backdrop_path,
        media_type: mediaType,
        vote_average: media.vote_average,
        release_date: media.release_date || media.first_air_date,
      });
    }
  };

  const handleSelectSubDLTrack = async (sub: SubDLSubtitleItem) => {
    setSubLoading(true);
    try {
      const res = await fetch(
        `/api/subtitles?action=download_cues&url=${encodeURIComponent(sub.url)}`
      );
      if (res.ok) {
        const data = await res.json();
        const isSinhala =
          sub.language?.toLowerCase().includes("si") ||
          sub.name?.toLowerCase().includes("sinhala");

        const track: SubtitleTrack = {
          id: `subdl-${Date.now()}`,
          label: sub.release_name || data.filename,
          language: isSinhala ? "si" : "en",
          cues: data.cues,
          source: "subdl",
        };

        setActiveSubtitleTrack(track);
      }
    } catch (err) {
      console.error("Failed to load selected SubDL subtitle:", err);
    } finally {
      setSubLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen pt-20 pb-16">
      {/* 1. Main Streaming Player Container */}
      <StreamPlayer
        tmdbId={media.id}
        mediaType={mediaType}
        season={season}
        episode={episode}
        title={title}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-8">
        {/* 2. Media Metadata & Primary Actions */}
        <div className="p-6 rounded-3xl bg-surface-glass border border-border-glass backdrop-blur-xl flex flex-col md:flex-row md:items-start justify-between gap-6 shadow-2xl">
          <div className="space-y-3 max-w-3xl">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="uppercase text-[11px] font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-accent-primary text-white">
                {mediaType === "tv"
                  ? `Season ${season} • Episode ${episode}`
                  : "Feature Film"}
              </span>

              {imdbId && (
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/10 text-text-secondary border border-white/10">
                  IMDb: {imdbId}
                </span>
              )}

              <a
                href="#subtitles-section"
                className={`font-sinhala text-xs px-2.5 py-0.5 rounded-full border transition-all flex items-center gap-1.5 ${
                  activeSubtitleTrack
                    ? "bg-indigo-950/60 border-indigo-500/40 text-indigo-200 hover:bg-indigo-900/60"
                    : "bg-amber-950/40 border-amber-500/30 text-amber-300 hover:bg-amber-900/40"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    activeSubtitleTrack ? "bg-emerald-400" : "bg-amber-400"
                  }`}
                />
                <span>
                  {activeSubtitleTrack
                    ? `උපසිරැසි: ${activeSubtitleTrack.label}`
                    : "සිංහල උපසිරැසි තෝරන්න (Select Sub)"}
                </span>
              </a>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              {title}
            </h1>

            {/* Metadata Info */}
            <div className="flex items-center gap-4 text-xs sm:text-sm text-text-muted flex-wrap">
              <div className="flex items-center gap-1.5 text-accent-gold font-bold">
                <Star className="w-4 h-4 fill-accent-gold" />
                <span>{media.vote_average ? media.vote_average.toFixed(1) : "8.1"}</span>
              </div>

              {releaseYear && <span>{releaseYear}</span>}
              <span className="w-1 h-1 rounded-full bg-text-muted" />

              {media.genres && media.genres.length > 0 && (
                <span>{media.genres.map((g) => g.name).join(" • ")}</span>
              )}
            </div>

            {/* Overview */}
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              {media.overview}
            </p>
          </div>

          {/* Action Buttons: Season Pack & Watchlist */}
          <div className="flex items-center md:flex-col gap-2.5 flex-shrink-0">
            <button
              onClick={handleOpenSeasonPacks}
              className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-accent-primary to-indigo-600 hover:from-accent-primary-hover hover:to-indigo-500 text-white font-semibold px-5 py-3 rounded-xl transition-all shadow-lg shadow-accent-primary/25 text-xs sm:text-sm"
            >
              <DownloadCloud className="w-4 h-4 text-white" />
              <span>
                {mediaType === "tv" ? `Season ${season} Packs (4K / 1080p)` : "Download (4K / 1080p / 720p)"}
              </span>
            </button>

            <button
              onClick={handleWatchlistToggle}
              className={`flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl border text-xs sm:text-sm font-semibold transition-all ${
                isSaved
                  ? "bg-accent-gold/20 border-accent-gold text-accent-gold"
                  : "bg-surface-glass border-border-glass text-text-secondary hover:text-white hover:bg-surface-glass-hover"
              }`}
            >
              {isSaved ? (
                <>
                  <BookmarkCheck className="w-4 h-4 fill-accent-gold" />
                  <span>In Watchlist</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-4 h-4" />
                  <span>Add Watchlist</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 3. Sinhala Subtitle Management Hub (SubDL Online + Local Dropzone) */}
        <div id="subtitles-section" className="grid grid-cols-1 lg:grid-cols-3 gap-6 scroll-mt-24">
          {/* SubDL Online Subtitles Picker */}
          <div className="lg:col-span-1 p-5 rounded-3xl bg-surface-glass border border-border-glass backdrop-blur-xl space-y-4">
            <div className="flex items-center gap-2 text-indigo-400">
              <Languages className="w-4 h-4 text-accent-secondary" />
              <h3 className="text-sm font-bold text-white">SubDL Auto Subtitles</h3>
            </div>
            <p className="text-xs text-text-muted font-sinhala">
              අන්තර්ජාලයෙන් ස්වයංක්‍රීයව සොයාගත් සිංහල සහ ඉංග්‍රීසි උපසිරැසි
            </p>

            {subLoading ? (
              <div className="py-8 text-center text-text-muted">
                <div className="w-6 h-6 border-2 border-accent-secondary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-xs">Searching SubDL API for Sinhala subs...</p>
              </div>
            ) : availableSubs.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {availableSubs.map((sub, i) => {
                  const isCurrent = activeSubtitleTrack?.label === sub.release_name;
                  const isSinhala =
                    sub.language?.toLowerCase().includes("si") ||
                    sub.name?.toLowerCase().includes("sinhala");

                  return (
                    <button
                      key={i}
                      onClick={() => handleSelectSubDLTrack(sub)}
                      className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-start justify-between gap-2 border ${
                        isCurrent
                          ? "bg-accent-secondary/25 border-accent-secondary text-white font-semibold"
                          : "bg-white/5 hover:bg-white/10 border-transparent text-text-secondary hover:text-white"
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                              isSinhala
                                ? "bg-indigo-500/30 text-indigo-200"
                                : "bg-white/10 text-text-muted"
                            }`}
                          >
                            {isSinhala ? "Sinhala" : sub.language || "EN"}
                          </span>
                          {sub.hi && (
                            <span className="text-[9px] px-1 bg-white/5 rounded text-text-subtle">
                              HI
                            </span>
                          )}
                        </div>
                        <p className="truncate text-xs">{sub.release_name}</p>
                      </div>
                      <span className="text-[10px] text-text-subtle flex-shrink-0">
                        Load
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="py-6 text-center text-text-muted text-xs">
                No SubDL results for this specific title. Use the dropzone on the right to load your .zip / .srt file!
              </div>
            )}
          </div>

          {/* Local Zip / SRT Dropzone */}
          <div className="lg:col-span-2 p-5 rounded-3xl bg-surface-glass border border-border-glass backdrop-blur-xl space-y-3">
            <div className="flex items-center gap-2 text-white">
              <Subtitles className="w-4 h-4 text-accent-gold" />
              <h3 className="text-sm font-bold">Custom Subtitle Dropzone</h3>
            </div>
            <p className="text-xs text-text-muted font-sinhala">
              Baiscope.lk හෝ වෙනත් වෙබ් අඩවියකින් බාගත කළ සිංහල උපසිරැසි .zip ගොනුව මෙතැනට drag & drop කරන්න.
            </p>
            <ZipDropzone compact={true} />
          </div>
        </div>

        {/* 4. Complete TV Series Season & Episode Explorer (If TV Series) */}
        {mediaType === "tv" && (
          <SeasonEpisodeExplorer
            tvId={media.id}
            totalSeasons={media.number_of_seasons || 1}
            currentSeason={season}
            currentEpisode={episode}
            onSelectEpisode={handleSelectEpisode}
            onSeasonChange={(newSeason) => setSeason(newSeason)}
            imdbId={imdbId}
            seriesTitle={title}
          />
        )}

        {/* 5. Similar Recommended Titles */}
        {media.similar?.results && media.similar.results.length > 0 && (
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent-primary" />
              <h3 className="text-xl font-bold text-white tracking-tight">
                More Like This
              </h3>
            </div>
            <div className="flex items-start gap-4 overflow-x-auto no-scrollbar scroll-smooth py-2">
              {media.similar.results.slice(0, 10).map((sim) => (
                <MediaCard
                  key={sim.id}
                  item={{ ...sim, media_type: mediaType }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Global Season Pack Modal */}
      <SeasonPackModal />
    </div>
  );
}
