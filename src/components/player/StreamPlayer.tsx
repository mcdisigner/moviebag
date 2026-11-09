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
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  SlidersHorizontal,
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
  const [adShield, setAdShield] = useState<boolean>(true); // Blocks 99% popups & redirects
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

  // Construct URLs for each server (Prioritizing clean, high-bitrate WEB-DL/Blu-Ray providers)
  const servers = [
    {
      id: 1,
      name: "VidLink Pro",
      tag: "⭐ 4K/1080p/720p Quality • No Ads (Best for SL)",
      badge: "Quality ⚙️",
      url:
        mediaType === "movie"
          ? `https://vidlink.pro/movie/${tmdbId}?primaryColor=6366f1&autoplay=false`
          : `https://vidlink.pro/tv/${tmdbId}/${season}/${episode}?primaryColor=6366f1&autoplay=false`,
    },
    {
      id: 2,
      name: "AutoEmbed HD",
      tag: "Clean WEB-DL • Fast Buffering",
      badge: "1080p Pure",
      url:
        mediaType === "movie"
          ? `https://player.autoembed.cc/embed/movie/${tmdbId}?autoplay=0`
          : `https://player.autoembed.cc/embed/tv/${tmdbId}/${season}/${episode}?autoplay=0`,
    },
    {
      id: 3,
      name: "Embed.su",
      tag: "Ultra HD • 4K HDR Multi-Source",
      badge: "4K HDR",
      url:
        mediaType === "movie"
          ? `https://embed.su/embed/movie/${tmdbId}`
          : `https://embed.su/embed/tv/${tmdbId}/${season}/${episode}`,
    },
    {
      id: 4,
      name: "SmashyStream",
      tag: "Multi-HQ Mirror • Multi-Audio",
      badge: "Multi-Audio",
      url:
        mediaType === "movie"
          ? `https://embed.smashystream.com/playere.php?tmdb=${tmdbId}&autoPlay=false`
          : `https://embed.smashystream.com/playere.php?tmdb=${tmdbId}&season=${season}&episode=${episode}&autoPlay=false`,
    },
    {
      id: 5,
      name: "VidSrc Pro",
      tag: "High-Speed Mirror • 1080p",
      badge: "1080p",
      url:
        mediaType === "movie"
          ? `https://vidsrc.pro/embed/movie/${tmdbId}?autoPlay=false`
          : `https://vidsrc.pro/embed/tv/${tmdbId}/${season}/${episode}?autoPlay=false`,
    },
    {
      id: 6,
      name: "SuperEmbed",
      tag: "Reliable Multi-Host • Low Data",
      badge: "Reliable",
      url:
        mediaType === "movie"
          ? `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1&autoplay=0`
          : `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1&s=${season}&e=${episode}&autoplay=0`,
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

        {/* Embedded Video Iframe - Autoplay disabled & Ad-Shield Protection */}
        <iframe
          key={`${activeServer.id}-${key}-${season}-${episode}-${adShield ? "shield" : "open"}`}
          src={activeServer.url}
          className="w-full h-full border-0 relative z-10"
          allowFullScreen
          allow="encrypted-media; picture-in-picture; fullscreen"
          sandbox={
            adShield
              ? "allow-scripts allow-same-origin allow-forms allow-presentation"
              : undefined
          }
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
                  {srv.badge}
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

          {/* Ad-Shield Popup & Redirect Blocker Toggle */}
          <button
            onClick={() => setAdShield((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
              adShield
                ? "bg-emerald-950/80 text-emerald-400 border-emerald-500/40 shadow-lg shadow-emerald-950/40"
                : "bg-surface-glass text-text-muted hover:text-white border-border-glass"
            }`}
            title={
              adShield
                ? "Ad-Shield සක්‍රියයි: අනවශ්‍ය Popups සහ Redirects සම්පූර්ණයෙන් Block කර ඇත"
                : "Ad-Shield අක්‍රියයි: Click to enable Popup blocking"
            }
          >
            {adShield ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Ad-Shield: ON</span>
              </>
            ) : (
              <>
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                <span>Ad-Shield: OFF</span>
              </>
            )}
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

      {/* 3. Sri Lanka High-Speed Quality Tip Banner */}
      <div className="mt-3 px-4 py-2.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/20 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 text-xs text-indigo-200">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-accent-secondary flex-shrink-0" />
          <span className="font-sinhala leading-relaxed">
            <strong className="text-white font-sans">Quality පාලනය:</strong> Server 1 (VidLink Pro) තෝරා Player එක ඇතුළේ ඇති <strong>Settings (⚙️)</strong> icon එකෙන් <strong>4K, 1080p, 720p, 480p</strong> පහසුවෙන්ම තෝරාගත හැක (කැම් කොපි නැති Original WEB-DL).
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-emerald-300 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>SLT Fiber • Dialog • Mobitel Ultra-Fast CDN</span>
        </div>
      </div>
    </div>
  );
}
