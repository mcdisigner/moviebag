"use client";

import React, { useState, useEffect } from "react";
import {
  DownloadCloud,
  X,
  Copy,
  Check,
  FolderArchive,
  Film,
  Users,
  HardDrive,
  ClipboardList,
  ChevronDown,
  Sparkles,
  Zap,
  Globe,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { TorrentStream, SeasonPackResponse } from "@/types/seasonPacks";

export default function SeasonPackModal() {
  const modalData = useAppStore((state) => state.seasonPackModalData);
  const setModalData = useAppStore((state) => state.setSeasonPackModalData);

  // Dynamic season selection state inside modal
  const [selectedSeason, setSelectedSeason] = useState<number>(modalData?.season || 1);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"packs" | "episodes">("packs");
  const [qualityFilter, setQualityFilter] = useState<string>("all"); // "all", "4k", "1080p", "720p", "480p"
  const [seasonPacks, setSeasonPacks] = useState<TorrentStream[]>([]);
  const [episodeStreams, setEpisodeStreams] = useState<TorrentStream[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [batchCopied, setBatchCopied] = useState<boolean>(false);

  // Keep selectedSeason in sync whenever modalData is updated
  useEffect(() => {
    if (modalData?.season) {
      setSelectedSeason(modalData.season);
    }
  }, [modalData?.season, modalData?.imdbId]);

  // Fetch season packs dynamically using selectedSeason
  useEffect(() => {
    if (!modalData?.imdbId) {
      setSeasonPacks([]);
      setEpisodeStreams([]);
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);

    async function fetchPacks() {
      try {
        const type = modalData?.mediaType === "movie" ? "movie" : "series";
        const seasonNumber = modalData?.mediaType === "tv" ? selectedSeason : 1;
        const res = await fetch(
          `/api/season-packs?imdb_id=${modalData?.imdbId}&type=${type}&season_number=${seasonNumber}&season=${seasonNumber}&episode=1`
        );
        if (res.ok && active) {
          const data: SeasonPackResponse = await res.json();
          setSeasonPacks(data.seasonPacks || []);
          setEpisodeStreams(data.episodeStreams || []);

          if (data.seasonPacks.length === 0 && data.episodeStreams.length > 0) {
            setActiveTab("episodes");
          } else {
            setActiveTab("packs");
          }
        }
      } catch (err) {
        console.error("Failed to load season packs:", err);
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchPacks();
    return () => {
      active = false;
    };
  }, [modalData?.imdbId, modalData?.mediaType, selectedSeason]);

  if (!modalData) return null;

  const handleCopy = (magnet: string, index: number) => {
    navigator.clipboard.writeText(magnet);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleBatchCopyJDownloader = () => {
    const allLinks = (activeTab === "packs" ? seasonPacks : episodeStreams)
      .map((s) => s.magnetUri)
      .filter(Boolean)
      .join("\n\n");

    if (allLinks) {
      navigator.clipboard.writeText(allLinks);
      setBatchCopied(true);
      setTimeout(() => setBatchCopied(false), 2500);
    }
  };

  const baseTitle = modalData.title.replace(/\s*\(Season\s*\d+\)$/i, "");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="absolute inset-0" onClick={() => setModalData(null)} />

      <div className="relative w-full max-w-3xl bg-[#0d0f1c] border border-border-glass rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-border-glass bg-surface-glass flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-accent-primary/15 border border-accent-primary/30 flex items-center justify-center text-accent-primary flex-shrink-0">
              <DownloadCloud className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2 truncate">
                <span className="truncate">{baseTitle}</span>
                <span className="text-xs font-normal text-text-muted flex-shrink-0">
                  ({modalData.mediaType === "movie" ? "Movie" : `Season ${selectedSeason}`})
                </span>
              </h3>
              <p className="text-xs text-text-muted font-sinhala truncate">
                High-Speed Public Magnet Swarm • qBittorrent & JDownloader 2 සහාය
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            {/* TV Season Switcher Dropdown */}
            {modalData.mediaType === "tv" && (modalData.totalSeasons || 1) > 1 && (
              <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-xl px-2.5 py-1">
                <span className="text-[11px] font-semibold text-text-muted">Season:</span>
                <div className="relative">
                  <select
                    value={selectedSeason}
                    onChange={(e) => setSelectedSeason(parseInt(e.target.value, 10))}
                    className="appearance-none bg-transparent hover:bg-white/10 text-white text-xs font-bold pl-1 pr-6 py-0.5 rounded cursor-pointer focus:outline-none"
                  >
                    {Array.from({ length: modalData.totalSeasons || 1 }, (_, i) => i + 1).map((s) => (
                      <option key={s} value={s} className="bg-[#0e101a] text-white">
                        Season {s}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-text-muted absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            )}

            <button
              onClick={() => setModalData(null)}
              className="p-1.5 rounded-lg text-text-muted hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Bar with Tabs & Batch Copy */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 sm:px-5 py-3 border-b border-border-glass/60 bg-[#090b14] text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setActiveTab("packs")}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === "packs"
                  ? "bg-accent-primary text-white shadow-md shadow-accent-primary/30"
                  : "bg-surface-glass text-text-muted hover:text-white border border-border-glass"
              }`}
            >
              <FolderArchive className="w-3.5 h-3.5" />
              <span>
                {modalData.mediaType === "tv"
                  ? `Season ${selectedSeason} Packs (${seasonPacks.length})`
                  : `Complete Movie Packs (${seasonPacks.length})`}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("episodes")}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === "episodes"
                  ? "bg-accent-primary text-white shadow-md shadow-accent-primary/30"
                  : "bg-surface-glass text-text-muted hover:text-white border border-border-glass"
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>
                {modalData.mediaType === "tv"
                  ? `Season ${selectedSeason} Episodes (${episodeStreams.length})`
                  : `Alternative Streams (${episodeStreams.length})`}
              </span>
            </button>
          </div>

          {/* Batch Copy for JDownloader 2 */}
          <button
            onClick={handleBatchCopyJDownloader}
            className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition-all ${
              batchCopied
                ? "bg-emerald-600 text-white"
                : "bg-surface-glass hover:bg-white/10 text-indigo-300 border border-indigo-500/30"
            }`}
            title="Copy all magnet links at once for JDownloader 2 linkgrabber"
          >
            {batchCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span>All Links Copied!</span>
              </>
            ) : (
              <>
                <ClipboardList className="w-3.5 h-3.5 text-indigo-400" />
                <span>Copy All for JDownloader 2</span>
              </>
            )}
          </button>
        </div>

        {/* Quality Filter Selector Bar */}
        <div className="px-4 sm:px-5 py-2.5 bg-[#0b0d18] border-b border-border-glass/40 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-semibold text-text-muted flex items-center gap-1 mr-1">
              <SlidersHorizontal className="w-3 h-3 text-accent-secondary" />
              <span>Quality Filter:</span>
            </span>

            {[
              { id: "all", label: "All Qualities (සියල්ල)" },
              { id: "4k", label: "✨ 4K UHD" },
              { id: "1080p", label: "⭐ 1080p FHD (BluRay / WEB-DL)" },
              { id: "720p", label: "720p HD (Low Data)" },
              { id: "480p", label: "480p SD" },
            ].map((q) => {
              const isSelected = qualityFilter === q.id;
              return (
                <button
                  key={q.id}
                  onClick={() => setQualityFilter(q.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                    isSelected
                      ? "bg-accent-secondary text-white font-semibold shadow-sm shadow-accent-secondary/30"
                      : "bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white border border-white/5"
                  }`}
                >
                  {q.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sri Lanka Recommended Data Tip Banner */}
        <div className="mx-4 sm:mx-5 mt-3 px-3.5 py-2.5 rounded-xl bg-indigo-950/40 border border-indigo-500/20 text-xs text-indigo-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent-secondary flex-shrink-0" />
            <span className="font-sinhala leading-relaxed text-[11px] sm:text-xs">
              <strong>🇱🇰 ශ්‍රී ලංකාවේ අයට උපදෙස්:</strong> Dialog, Mobitel, SLT ඩේටා ඉතිරි කරගැනීමට <strong>1080p x265 (HEVC) (~1.2 GB)</strong> හෝ <strong>720p (~800 MB)</strong> බාගන්න. Fiber Unlimited අයට <strong>4K UHD</strong> සහ <strong>1080p BluRay</strong> සුදුසුයි.
            </span>
          </div>
        </div>

        {/* Torrent Streams List */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1">
          {loading ? (
            <div className="py-16 text-center text-text-muted">
              <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs">
                Connecting to decentralized tracker swarm for{" "}
                {modalData.mediaType === "tv" ? `Season ${selectedSeason}` : "Movie"}...
              </p>
            </div>
          ) : (() => {
            const activeList = activeTab === "packs" ? seasonPacks : episodeStreams;
            const filteredStreams = activeList.filter((item) => {
              if (qualityFilter === "all") return true;
              if (qualityFilter === "4k") return item.quality?.includes("4K");
              if (qualityFilter === "1080p") return item.quality?.includes("1080p");
              if (qualityFilter === "720p") return item.quality?.includes("720p");
              if (qualityFilter === "480p") return item.quality?.includes("480p");
              return true;
            });

            if (filteredStreams.length === 0) {
              return (
                <div className="py-16 text-center text-text-muted space-y-2">
                  <DownloadCloud className="w-10 h-10 mx-auto text-text-subtle opacity-40" />
                  <p className="text-sm">
                    {qualityFilter !== "all"
                      ? `No ${qualityFilter.toUpperCase()} releases found for this title.`
                      : `No streams found for ${modalData.mediaType === "tv" ? `Season ${selectedSeason}` : "this title"}.`}
                  </p>
                  {qualityFilter !== "all" && (
                    <button
                      onClick={() => setQualityFilter("all")}
                      className="px-3 py-1.5 rounded-xl bg-accent-primary text-white text-xs font-semibold"
                    >
                      Show All Qualities
                    </button>
                  )}
                </div>
              );
            }

            return filteredStreams.map((item, idx) => {
              const isCam = item.source === "CAM-Rip";
              const isBluRay = item.source === "BluRay";
              const isWebDl = item.source === "WEB-DL" || item.source === "WEBRip";

              return (
                <div
                  key={item.infoHash}
                  className={`p-3.5 rounded-xl bg-surface-glass/80 hover:bg-surface-glass border transition-all space-y-2.5 ${
                    isCam
                      ? "border-amber-500/30 bg-amber-950/10"
                      : isBluRay
                      ? "border-blue-500/40 hover:border-blue-400"
                      : "border-border-glass hover:border-accent-primary/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5 min-w-0">
                      {/* Quality & Source Badges */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Source Tag */}
                        {isBluRay ? (
                          <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[10px] font-bold uppercase flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-blue-300" />
                            <span>BluRay Pure</span>
                          </span>
                        ) : isWebDl ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold uppercase flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-300" />
                            <span>WEB-DL Pure</span>
                          </span>
                        ) : isCam ? (
                          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold uppercase">
                            ⚠️ CAM-Rip (Theatre Copy)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-white/10 text-text-secondary text-[10px] font-semibold">
                            {item.source || "Rip"}
                          </span>
                        )}

                        {/* Resolution Tag */}
                        <span className="px-2 py-0.5 rounded bg-white/10 text-white text-[10px] font-bold">
                          {item.quality}
                        </span>

                        {/* Codec Tag */}
                        <span className="px-2 py-0.5 rounded bg-white/5 text-text-muted text-[10px] font-mono">
                          {item.codec}
                        </span>

                        {activeTab === "packs" && (
                          <span className="px-2 py-0.5 rounded bg-accent-primary/20 text-accent-primary text-[10px] font-bold uppercase">
                            Full Pack
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-semibold text-white break-all leading-snug">
                        {item.title}
                      </h4>

                      <div className="flex items-center gap-4 text-xs text-text-muted pt-0.5">
                        <span className="flex items-center gap-1">
                          <HardDrive className="w-3.5 h-3.5 text-text-subtle" />
                          <span className="font-mono text-white font-medium">{item.size}</span>
                        </span>
                        <span className="flex items-center gap-1 text-emerald-400 font-medium">
                          <Users className="w-3.5 h-3.5" />
                          <span>{item.seeders} Seeders</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons: 1-Click Fast Web Download + Magnet Download + Copy */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5 flex-wrap">
                    {/* Copy Magnet Link */}
                    <button
                      onClick={() => handleCopy(item.magnetUri || "", idx)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-text-secondary hover:text-white text-xs transition-colors"
                      title="Copy Magnet link to clipboard"
                    >
                      {copiedIndex === idx ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400 font-medium">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Magnet</span>
                        </>
                      )}
                    </button>

                    {/* 1-Click Fast Web Browser Download (No Torrent App Needed) */}
                    <a
                      href={`https://webtor.io/#/show?magnet=${encodeURIComponent(item.magnetUri || "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600/80 hover:bg-emerald-600 text-white text-xs font-semibold shadow-md shadow-emerald-950/40 transition-all hover:scale-105 active:scale-95"
                      title="Download or Stream directly in Browser via WebTorrent Cloud (Torrent app එකක් අවශ්‍ය නැත)"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-300" />
                      <span>⚡ 1-Click Browser Download</span>
                    </a>

                    {/* Native Torrent Client Download */}
                    <a
                      href={item.magnetUri}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-accent-primary hover:bg-accent-primary-hover text-white text-xs font-semibold shadow-md shadow-accent-primary/20 transition-all hover:scale-105 active:scale-95"
                      title="Open in uTorrent, BitTorrent, qBittorrent, 1DM, Flud"
                    >
                      <DownloadCloud className="w-3.5 h-3.5" />
                      <span>Download Magnet</span>
                    </a>
                  </div>
                </div>
              );
            });
          })()}
        </div>
      </div>
    </div>
  );
}
