"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Server,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  RefreshCw,
  Zap,
  MonitorPlay,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import FloatingSubtitleOverlay from "@/components/subtitles/FloatingSubtitleOverlay";

interface StreamPlayerProps {
  tmdbId: number;
  mediaType: "movie" | "tv";
  season?: number;
  episode?: number;
  title: string;
}

export default function StreamPlayer({
  tmdbId,
  mediaType,
  season = 1,
  episode = 1,
  title,
}: StreamPlayerProps) {
  const { preferredServer, setPreferredServer, saveContinueWatching } = useAppStore();

  const [currentServer, setCurrentServer] = useState<number>(preferredServer || 1);
  const [copied, setCopied] = useState<boolean>(false);
  const [isTheater, setIsTheater] = useState<boolean>(false);
  const [key, setKey] = useState<number>(0); // reload key
  const containerRef = useRef<HTMLDivElement>(null);

  // Save progress / continue watching on mount or episode change
  useEffect(() => {
    saveContinueWatching({
      id: tmdbId,
      title,
      poster_path: null,
      backdrop_path: null,
      media_type: mediaType,
      season: mediaType === "tv" ? season : undefined,
      episode: mediaType === "tv" ? episode : undefined,
      progressPercent: 5,
    });
  }, [tmdbId, mediaType, season, episode, title, saveContinueWatching]);

  // Construct URLs for each server (with autoplay disabled)
  const servers = [
    {
      id: 1,
      name: "VidSrc Pro",
      tag: "Fastest • 1080p",
      url:
        mediaType === "movie"
          ? `https://vidsrc.pro/embed/movie/${tmdbId}?autoPlay=false`
          : `https://vidsrc.pro/embed/tv/${tmdbId}/${season}/${episode}?autoPlay=false`,
    },
    {
      id: 2,
      name: "VidSrc.cc",
      tag: "Ultra HD • 1080p",
      url:
        mediaType === "movie"
          ? `https://vidsrc.cc/v2/embed/movie/${tmdbId}?autoPlay=false`
          : `https://vidsrc.cc/v2/embed/tv/${tmdbId}/${season}/${episode}?autoPlay=false`,
    },
    {
      id: 3,
      name: "SmashyStream",
      tag: "HD Mirror • Multi-HQ",
      url:
        mediaType === "movie"
          ? `https://embed.smashystream.com/playere.php?tmdb=${tmdbId}&autoPlay=false`
          : `https://embed.smashystream.com/playere.php?tmdb=${tmdbId}&season=${season}&episode=${episode}&autoPlay=false`,
    },
    {
      id: 4,
      name: "VidSrc XYZ",
      tag: "Ultra HD • Multi-Lang",
      url:
        mediaType === "movie"
          ? `https://vidsrc.xyz/embed/movie?tmdb=${tmdbId}&autoPlay=false`
          : `https://vidsrc.xyz/embed/tv?tmdb=${tmdbId}&season=${season}&episode=${episode}&autoPlay=false`,
    },
    {
      id: 5,
      name: "SuperEmbed",
      tag: "Reliable • Low Buffering",
      url:
        mediaType === "movie"
          ? `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1&autoplay=0`
          : `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1&s=${season}&e=${episode}&autoplay=0`,
    },
    {
      id: 6,
      name: "AutoEmbed",
      tag: "No Ads • Clean Stream",
      url:
        mediaType === "movie"
          ? `https://player.autoembed.cc/embed/movie/${tmdbId}?autoplay=0`
          : `https://player.autoembed.cc/embed/tv/${tmdbId}/${season}/${episode}?autoplay=0`,
    },
    {
      id: 7,
      name: "2Embed",
      tag: "Backup • Global",
      url:
        mediaType === "movie"
          ? `https://www.2embed.cc/embed/${tmdbId}?autoplay=0`
          : `https://www.2embed.cc/embedtv/${tmdbId}&s=${season}&e=${episode}&autoplay=0`,
    },
  ];

  const activeServer = servers.find((s) => s.id === currentServer) || servers[0];

  const handleServerChange = (id: number) => {
    setCurrentServer(id);
    setPreferredServer(id);
    setKey((prev) => prev + 1);
  };

  const handleCopyStream = () => {
    navigator.clipboard.writeText(activeServer.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error("Fullscreen error:", err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div
      className={`w-full transition-all duration-300 ${
        isTheater ? "max-w-none px-0" : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      }`}
    >
      {/* 1. Main Video Container with Ambient Glow and Floating Subtitles */}
      <div
        ref={containerRef}
        className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-border-glass shadow-2xl group"
      >
        {/* Dynamic Ambient Background Glow */}
        <div className="absolute -inset-4 bg-gradient-to-r from-accent-primary/10 via-accent-secondary/15 to-transparent blur-3xl -z-10 pointer-events-none" />

        {/* Embedded Video Iframe - Autoplay disabled */}
        <iframe
          key={`${activeServer.id}-${key}-${season}-${episode}`}
          src={activeServer.url}
          className="w-full h-full border-0 relative z-10"
          allowFullScreen
          allow="encrypted-media; picture-in-picture; fullscreen"
          title={`${title} - ${activeServer.name}`}
        />

        {/* Floating Transparent Sinhala Subtitle Overlay */}
        <FloatingSubtitleOverlay containerRef={containerRef} />
      </div>

      {/* 2. Player Controls & Multi-Server Switcher Bar */}
      <div className="mt-4 p-4 rounded-2xl bg-surface-glass border border-border-glass backdrop-blur-xl shadow-xl flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        {/* Server Selector Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-text-muted mr-1">
            <Server className="w-3.5 h-3.5 text-accent-secondary" />
            <span className="font-semibold text-white">Stream Node:</span>
          </div>

          {servers.map((srv) => {
            const isSelected = srv.id === currentServer;
            return (
              <button
                key={srv.id}
                onClick={() => handleServerChange(srv.id)}
                className={`relative px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-accent-primary text-white shadow-lg shadow-accent-primary/30"
                    : "bg-surface-glass hover:bg-white/10 text-text-muted hover:text-white border border-border-glass"
                }`}
              >
                <span>{srv.name}</span>
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded-md ${
                    isSelected ? "bg-black/30 text-white" : "bg-white/10 text-text-muted"
                  }`}
                >
                  {srv.tag.split("•")[0].trim()}
                </span>
              </button>
            );
          })}

          <button
            onClick={() => setKey((prev) => prev + 1)}
            title="Reload Video Stream"
            className="p-2 rounded-xl bg-surface-glass hover:bg-white/10 text-text-muted hover:text-white border border-border-glass transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* External Player Handshakes & Quick Actions */}
        <div className="flex items-center flex-wrap gap-2 text-xs">
          {/* PotPlayer 1-Click Launcher */}
          <a
            href={`potplayer://${activeServer.url}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-glass hover:bg-white/10 border border-border-glass text-text-secondary hover:text-white transition-all font-medium"
            title="Open in PotPlayer desktop application"
          >
            <MonitorPlay className="w-3.5 h-3.5 text-amber-400" />
            <span>PotPlayer</span>
          </a>

          {/* VLC 1-Click Launcher */}
          <a
            href={`vlc://${activeServer.url}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-glass hover:bg-white/10 border border-border-glass text-text-secondary hover:text-white transition-all font-medium"
            title="Open in VLC desktop application"
          >
            <Zap className="w-3.5 h-3.5 text-orange-400" />
            <span>VLC Player</span>
          </a>

          {/* Copy URL */}
          <button
            onClick={handleCopyStream}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-glass hover:bg-white/10 border border-border-glass text-text-secondary hover:text-white transition-all font-medium"
            title="Copy Direct Embed Stream Link"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy URL</span>
              </>
            )}
          </button>

          {/* Theater Mode Toggle */}
          <button
            onClick={() => setIsTheater(!isTheater)}
            className={`p-2 rounded-xl border transition-colors ${
              isTheater
                ? "bg-accent-secondary text-white border-accent-secondary"
                : "bg-surface-glass hover:bg-white/10 text-text-muted hover:text-white border-border-glass"
            }`}
            title="Toggle Theater Mode"
          >
            {isTheater ? (
              <Minimize2 className="w-3.5 h-3.5" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Native Fullscreen */}
          <button
            onClick={handleFullscreen}
            className="p-2 rounded-xl bg-surface-glass hover:bg-white/10 text-text-muted hover:text-white border border-border-glass transition-colors"
            title="Fullscreen Player"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
