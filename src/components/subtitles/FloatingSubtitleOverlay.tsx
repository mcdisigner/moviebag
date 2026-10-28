"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Languages,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  ArrowDown,
  AlertCircle,
  Subtitles,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { formatSecondsToTime } from "@/lib/subtitleParser";
import { SubtitleCue } from "@/types/subtitles";

interface FloatingSubtitleOverlayProps {
  containerRef?: React.RefObject<HTMLDivElement>;
}

export default function FloatingSubtitleOverlay({
  containerRef: _containerRef,
}: FloatingSubtitleOverlayProps) {
  const {
    activeSubtitleTrack,
    secondarySubtitleTrack,
    subtitleOffset,
    setSubtitleOffset,
    adjustSubtitleOffset,
    subtitleFontSize,
    setSubtitleFontSize,
    dualSubtitleEnabled,
    setDualSubtitleEnabled,
  } = useAppStore();

  // 1. Initial State: Timer strictly paused at 00:00 by default (Autoplay disabled)
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(true);
  const [isOverlayVisible, setIsOverlayVisible] = useState<boolean>(true);
  const [activeCue, setActiveCue] = useState<SubtitleCue | null>(null);
  const [secondaryCue, setSecondaryCue] = useState<SubtitleCue | null>(null);

  // Check if a subtitle track with actual cues is loaded
  const hasSubtitles = Boolean(
    activeSubtitleTrack &&
      activeSubtitleTrack.cues &&
      activeSubtitleTrack.cues.length > 0
  );

  // Accurate duration based on the last subtitle cue end time (or 0 if no subs)
  const maxDuration = hasSubtitles
    ? Math.max(
        60,
        activeSubtitleTrack!.cues[activeSubtitleTrack!.cues.length - 1]?.end || 7200
      )
    : 0;

  // High-precision monotonic sync reference to avoid cumulative drift
  const lastSyncRef = useRef<{ realTime: number; mediaTime: number }>({
    realTime: 0,
    mediaTime: 0,
  });

  // When media / subtitle track changes, reset timer to 00:00 and keep paused
  useEffect(() => {
    setCurrentTime(0);
    setIsPlaying(false);
    lastSyncRef.current = { realTime: 0, mediaTime: 0 };
  }, [activeSubtitleTrack?.id]);

  // Monotonic, drift-free playback timer engine (only runs when explicitly playing)
  useEffect(() => {
    if (!isPlaying || !hasSubtitles) return;

    lastSyncRef.current = {
      realTime: performance.now(),
      mediaTime: currentTime,
    };

    const interval = setInterval(() => {
      const elapsedSeconds = (performance.now() - lastSyncRef.current.realTime) / 1000;
      const nextTime = lastSyncRef.current.mediaTime + elapsedSeconds;

      if (nextTime >= maxDuration) {
        setCurrentTime(maxDuration);
        setIsPlaying(false);
      } else {
        setCurrentTime(nextTime);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, hasSubtitles, maxDuration]);

  // Find active cues based on (currentTime + subtitleOffset)
  useEffect(() => {
    if (!hasSubtitles) {
      setActiveCue(null);
      setSecondaryCue(null);
      return;
    }

    const effectiveTime = currentTime + subtitleOffset;

    const match = activeSubtitleTrack!.cues.find(
      (cue) => effectiveTime >= cue.start && effectiveTime <= cue.end
    );
    setActiveCue(match || null);

    if (
      dualSubtitleEnabled &&
      secondarySubtitleTrack &&
      secondarySubtitleTrack.cues?.length > 0
    ) {
      const matchSec = secondarySubtitleTrack.cues.find(
        (cue) => effectiveTime >= cue.start && effectiveTime <= cue.end
      );
      setSecondaryCue(matchSec || null);
    } else {
      setSecondaryCue(null);
    }
  }, [
    currentTime,
    subtitleOffset,
    hasSubtitles,
    activeSubtitleTrack,
    secondarySubtitleTrack,
    dualSubtitleEnabled,
  ]);

  // Smooth scroll helper to navigate user directly to the subtitle selector hub
  const scrollToSubtitles = () => {
    const el = document.getElementById("subtitles-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Precise Seek & Reset handlers
  const handleSeek = (time: number) => {
    if (!hasSubtitles) return;
    const clamped = Math.max(0, Math.min(time, maxDuration));
    setCurrentTime(clamped);
    lastSyncRef.current = {
      realTime: performance.now(),
      mediaTime: clamped,
    };
  };

  const handleReset = () => {
    setCurrentTime(0);
    setIsPlaying(false);
    lastSyncRef.current = { realTime: performance.now(), mediaTime: 0 };
  };

  const handleTogglePlay = () => {
    if (!hasSubtitles) {
      scrollToSubtitles();
      return;
    }
    setIsPlaying((prev) => !prev);
  };

  // Spacebar hotkey to toggle Play/Pause subtitle sync
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      if (e.code === "Space") {
        e.preventDefault();
        handleTogglePlay();
      } else if (e.key === "[") {
        adjustSubtitleOffset(-0.5);
      } else if (e.key === "]") {
        adjustSubtitleOffset(0.5);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hasSubtitles, adjustSubtitleOffset]);

  const fontSizeClasses = {
    sm: "text-base sm:text-lg",
    md: "text-lg sm:text-2xl",
    lg: "text-xl sm:text-3xl",
    xl: "text-2xl sm:text-4xl",
  };

  if (!isOverlayVisible) {
    return (
      <button
        onClick={() => setIsOverlayVisible(true)}
        className="absolute bottom-4 right-4 z-40 bg-black/80 hover:bg-black text-indigo-300 border border-indigo-500/40 px-3 py-1.5 rounded-full text-xs flex items-center gap-1.5 backdrop-blur-md shadow-lg"
      >
        <Eye className="w-3.5 h-3.5 text-accent-secondary" />
        <span className="font-sinhala">උපසිරැසි පෙන්වන්න</span>
      </button>
    );
  }

  return (
    <div className="absolute inset-x-0 bottom-0 z-30 pointer-events-none flex flex-col justify-end p-2 sm:p-4 pb-4">
      {/* 1. Subtitle Display Text Box (Transparent, high legibility) */}
      <div className="w-full flex justify-center mb-3">
        {(activeCue || secondaryCue) && (
          <div className="max-w-4xl text-center px-6 py-2.5 rounded-2xl bg-black/85 backdrop-blur-md border border-white/10 shadow-2xl transition-all duration-150 animate-fade-in pointer-events-auto">
            {/* Primary (Sinhala) Subtitle text */}
            {activeCue && (
              <p
                className={`${fontSizeClasses[subtitleFontSize]} font-semibold text-yellow-300 font-sinhala sinhala-text tracking-wide leading-relaxed drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]`}
              >
                {activeCue.text}
              </p>
            )}

            {/* Secondary (English) Subtitle text when Dual Mode enabled */}
            {dualSubtitleEnabled && secondaryCue && (
              <p className="text-sm sm:text-lg text-slate-200 font-medium font-sans mt-1 opacity-90 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                {secondaryCue.text}
              </p>
            )}
          </div>
        )}
      </div>

      {/* 2. Interactive Glassmorphic Control Bar (Docked overlay over bottom of player) */}
      <div className="pointer-events-auto max-w-4xl mx-auto w-full bg-[#0a0c16]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-3 shadow-2xl transition-all duration-200 space-y-2.5">
        {/* Toggle Collapse Header */}
        <div className="flex items-center justify-between text-xs pb-2 border-b border-white/10">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className={`w-2 h-2 rounded-full flex-shrink-0 ${
                hasSubtitles
                  ? isPlaying
                    ? "bg-emerald-400 animate-pulse"
                    : "bg-indigo-400"
                  : "bg-amber-400"
              }`}
            />
            <span className="font-semibold text-white whitespace-nowrap">
              Sinhala Subtitle Sync Hub
            </span>

            {hasSubtitles ? (
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 text-[10px] font-mono border border-indigo-500/30 truncate max-w-[150px] sm:max-w-[220px]">
                  {activeSubtitleTrack?.label}
                </span>
                <span className="hidden sm:inline text-[10px] text-text-subtle">
                  ({activeSubtitleTrack?.cues?.length} cues)
                </span>
              </div>
            ) : (
              <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 text-[10px] font-medium border border-amber-500/30">
                No Subtitles Loaded
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Dual Subtitle Mode Toggle */}
            <button
              onClick={() => setDualSubtitleEnabled(!dualSubtitleEnabled)}
              className={`px-2 py-1 rounded-md text-[11px] font-medium flex items-center gap-1 transition-all ${
                dualSubtitleEnabled
                  ? "bg-indigo-600 text-white"
                  : "bg-white/5 text-text-muted hover:text-white"
              }`}
              title="Toggle Sinhala + English Dual Subtitles"
            >
              <Languages className="w-3 h-3" />
              <span className="hidden sm:inline">Dual Sub</span>
            </button>

            {/* Font Size Selector */}
            <div className="flex items-center bg-white/5 rounded-md p-0.5 border border-white/10">
              {(["sm", "md", "lg", "xl"] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => setSubtitleFontSize(size)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase transition-colors ${
                    subtitleFontSize === size
                      ? "bg-accent-primary text-white"
                      : "text-text-muted hover:text-white"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>

            {/* Collapse / Hide Toggle */}
            <button
              onClick={() => setShowControls(!showControls)}
              className="p-1 rounded text-text-muted hover:text-white"
              title={showControls ? "Collapse Controls" : "Expand Controls"}
            >
              {showControls ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronUp className="w-3.5 h-3.5" />
              )}
            </button>

            <button
              onClick={() => setIsOverlayVisible(false)}
              className="p-1 rounded text-text-muted hover:text-white"
              title="Hide Subtitle Overlay"
            >
              <EyeOff className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Informative Guidance Banner when NO subtitle is loaded */}
        {!hasSubtitles && showControls && (
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-200">
                  No Subtitle File Loaded
                </p>
                <p className="text-[11px] text-text-muted font-sinhala">
                  උපසිරැසි සමමුහුර්ත කිරීමට පහත ඇති SubDL ලැයිස්තුවෙන් හෝ Dropzone මඟින් සිංහල උපසිරැසි ගොනුවක් තෝරන්න.
                </p>
              </div>
            </div>
            <button
              onClick={scrollToSubtitles}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold text-xs transition-colors self-start sm:self-center flex-shrink-0 border border-amber-500/30"
            >
              <Subtitles className="w-3.5 h-3.5" />
              <span>Select Subtitles Below</span>
              <ArrowDown className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Ready to sync indicator when subtitles ARE loaded and timer is at 00:00 */}
        {hasSubtitles && currentTime === 0 && !isPlaying && showControls && (
          <div className="px-3 py-1.5 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-between text-xs text-indigo-200">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Subtitles Ready • Paused at 00:00 — Click Play or Press Space when video starts</span>
            </span>
            <span className="text-[11px] font-mono text-indigo-300 hidden sm:inline">
              Offset: {subtitleOffset >= 0 ? `+${subtitleOffset}s` : `${subtitleOffset}s`}
            </span>
          </div>
        )}

        {/* Expanded Controls (Timeline scrubbing & Offset adjustments) */}
        {showControls && (
          <div className="space-y-2">
            {/* Timeline Scrubbing Bar */}
            <div className="flex items-center gap-2.5">
              {/* Play / Pause sync button */}
              <button
                onClick={handleTogglePlay}
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-md flex-shrink-0 transition-all active:scale-95 ${
                  hasSubtitles
                    ? isPlaying
                      ? "bg-accent-primary hover:bg-accent-primary-hover shadow-accent-primary/40"
                      : "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/40 animate-pulse"
                    : "bg-white/10 hover:bg-white/20 text-amber-400 cursor-pointer"
                }`}
                title={
                  hasSubtitles
                    ? isPlaying
                      ? "Pause Subtitle Sync (Space)"
                      : "Play Subtitle Sync (Space)"
                    : "Load a subtitle file below first"
                }
              >
                {hasSubtitles ? (
                  isPlaying ? (
                    <Pause className="w-4 h-4 fill-white" />
                  ) : (
                    <Play className="w-4 h-4 fill-white ml-0.5" />
                  )
                ) : (
                  <Play className="w-4 h-4 fill-amber-400 ml-0.5 opacity-60" />
                )}
              </button>

              {/* Reset to 00:00 */}
              <button
                onClick={handleReset}
                disabled={!hasSubtitles || currentTime === 0}
                className={`p-1.5 rounded-lg border transition-colors flex-shrink-0 ${
                  hasSubtitles && currentTime > 0
                    ? "bg-white/5 hover:bg-white/15 text-text-muted hover:text-white border-white/10"
                    : "opacity-40 text-text-subtle border-transparent cursor-not-allowed"
                }`}
                title="Reset Subtitle Timer to 00:00"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              {/* Current Time Display */}
              <span className="text-[11px] font-mono text-text-muted w-14 flex-shrink-0 text-right">
                {formatSecondsToTime(currentTime)}
              </span>

              {/* Slider Scrub Input */}
              <input
                type="range"
                min={0}
                max={hasSubtitles ? maxDuration : 100}
                step={0.5}
                value={hasSubtitles ? currentTime : 0}
                disabled={!hasSubtitles}
                onChange={(e) => handleSeek(parseFloat(e.target.value))}
                className={`w-full accent-accent-primary h-1.5 bg-white/10 rounded-lg ${
                  hasSubtitles ? "cursor-pointer" : "cursor-not-allowed opacity-30"
                }`}
                title={hasSubtitles ? "Scrub subtitle position" : "Load subtitles first to scrub"}
              />

              {/* Max Duration Display */}
              <span className="text-[11px] font-mono text-text-muted w-14 flex-shrink-0">
                {hasSubtitles ? formatSecondsToTime(maxDuration) : "00:00"}
              </span>
            </div>

            {/* Time Offset Adjustment Bar */}
            <div className="flex flex-wrap items-center justify-between text-xs pt-1 border-t border-white/5 gap-2">
              <div className="flex items-center gap-2">
                <span className="text-text-muted text-[11px]">Sync Tuning (Offset):</span>
                <span
                  className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                    subtitleOffset === 0
                      ? "bg-white/10 text-text-secondary"
                      : subtitleOffset > 0
                      ? "bg-emerald-950/60 text-emerald-400 border border-emerald-500/30"
                      : "bg-rose-950/60 text-rose-400 border border-rose-500/30"
                  }`}
                >
                  {subtitleOffset > 0 ? `+${subtitleOffset}s` : `${subtitleOffset}s`}
                </span>
                {subtitleOffset !== 0 && (
                  <button
                    onClick={() => setSubtitleOffset(0)}
                    className="p-1 text-text-muted hover:text-white"
                    title="Reset Offset to 0s"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Quick Offset Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => adjustSubtitleOffset(-2.0)}
                  className="px-2 py-1 rounded bg-white/5 hover:bg-white/15 text-[11px] text-text-secondary font-mono transition-colors"
                  title="Shift Subtitle -2.0 seconds"
                >
                  -2s
                </button>
                <button
                  onClick={() => adjustSubtitleOffset(-0.5)}
                  className="px-2 py-1 rounded bg-white/5 hover:bg-white/15 text-[11px] text-text-secondary font-mono transition-colors"
                  title="Shift Subtitle -0.5 seconds ([)"
                >
                  -0.5s
                </button>
                <button
                  onClick={() => adjustSubtitleOffset(0.5)}
                  className="px-2 py-1 rounded bg-white/5 hover:bg-white/15 text-[11px] text-text-secondary font-mono transition-colors"
                  title="Shift Subtitle +0.5 seconds (])"
                >
                  +0.5s
                </button>
                <button
                  onClick={() => adjustSubtitleOffset(2.0)}
                  className="px-2 py-1 rounded bg-white/5 hover:bg-white/15 text-[11px] text-text-secondary font-mono transition-colors"
                  title="Shift Subtitle +2.0 seconds"
                >
                  +2s
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
