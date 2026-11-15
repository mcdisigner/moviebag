"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  Upload,
  Link as LinkIcon,
  RotateCcw,
  Sliders,
  Check,
  AlertCircle,
  HelpCircle,
  Headphones,
  Sparkles,
  Server,
  Layers,
} from "lucide-react";

interface AudioDubbingManagerProps {
  currentServer: number;
  onServerChange: (id: number) => void;
}

export default function AudioDubbingManager({
  currentServer,
  onServerChange,
}: AudioDubbingManagerProps) {
  const [activeTab, setActiveTab] = useState<"preset" | "custom">("preset");

  // Custom Audio State
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [audioName, setAudioName] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [offsetSec, setOffsetSec] = useState<number>(0); // Sync offset (-5s to +5s)
  const [inputUrl, setInputUrl] = useState<string>("");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // File upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (audioSrc && audioSrc.startsWith("blob:")) {
      URL.revokeObjectURL(audioSrc);
    }

    const objectUrl = URL.createObjectURL(file);
    setAudioSrc(objectUrl);
    setAudioName(file.name);
    setIsPlaying(false);
  };

  const handleApplyUrl = () => {
    if (!inputUrl.trim()) return;
    setAudioSrc(inputUrl.trim());
    setAudioName(inputUrl.trim().split("/").pop() || "Online Dub Track");
    setIsPlaying(false);
  };

  const togglePlay = () => {
    if (!audioRef.current || !audioSrc) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
    }
  };

  const handleResetAudio = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(0, offsetSec);
    if (!isPlaying) {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
    }
  };

  const handleAdjustOffset = (delta: number) => {
    setOffsetSec((prev) => {
      const next = Math.round((prev + delta) * 10) / 10;
      if (audioRef.current) {
        audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime + delta);
      }
      return next;
    });
  };

  // Keyboard shortcut to toggle audio play/pause (Alt + A)
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.altKey && e.code === "KeyA") {
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isPlaying, audioSrc]);

  return (
    <div className="w-full rounded-2xl bg-[#0c1020]/90 border border-white/10 backdrop-blur-xl p-4 shadow-xl space-y-4">
      {/* Tab Switcher */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Headphones className="w-4 h-4 text-accent-secondary" />
          <h3 className="text-sm font-bold text-white font-sans">
            Audio & Dubbing Hub (හඬකැවීම් කළමනාකරණය)
          </h3>
        </div>

        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab("preset")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              activeTab === "preset"
                ? "bg-accent-primary text-white shadow-md font-semibold"
                : "text-text-secondary hover:text-white"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Multi-Audio Servers</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("custom")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              activeTab === "custom"
                ? "bg-accent-primary text-white shadow-md font-semibold"
                : "text-text-secondary hover:text-white"
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Custom Audio (Add Dub)</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Built-in Multi-Audio Server Guide */}
      {activeTab === "preset" && (
        <div className="space-y-3 animate-fade-in text-xs">
          <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-200 flex items-start gap-2.5 leading-relaxed">
            <Sparkles className="w-4 h-4 text-accent-secondary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-white mb-0.5">
                චිත්‍රපටයේ ඇති වෙනත් භාෂාවල නිල Dubbing (Hindi, Tamil, Spanish ආදී) නැරඹීමට:
              </p>
              <p className="text-text-secondary">
                පහත Multi-Audio සහාය දක්වන Server එකක් තෝරා, Player එකේ දකුණු පස පහළ ඇති{" "}
                <span className="text-yellow-300 font-semibold font-mono">Settings (⚙️) ➔ Audio Track</span> වෙතින් කැමති භාෂාව තෝරාගන්න.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={() => onServerChange(1)}
              className={`p-3 rounded-xl border text-left transition-all ${
                currentServer === 1
                  ? "bg-accent-primary/20 border-accent-primary text-white shadow-md"
                  : "bg-surface-glass border-border-glass text-text-secondary hover:text-white hover:bg-white/5"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-white text-xs">VidLink Pro</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                  Dual Audio
                </span>
              </div>
              <p className="text-[11px] text-text-muted">
                English + Multi-Audio tracks. In-player audio settings ඇත.
              </p>
            </button>

            <button
              type="button"
              onClick={() => onServerChange(3)}
              className={`p-3 rounded-xl border text-left transition-all ${
                currentServer === 3
                  ? "bg-accent-primary/20 border-accent-primary text-white shadow-md"
                  : "bg-surface-glass border-border-glass text-text-secondary hover:text-white hover:bg-white/5"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-white text-xs">Embed.su</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                  4K Dubs
                </span>
              </div>
              <p className="text-[11px] text-text-muted">
                Ultra HD Multi-Source. Hindi & Global language audio tracks.
              </p>
            </button>

            <button
              type="button"
              onClick={() => onServerChange(4)}
              className={`p-3 rounded-xl border text-left transition-all ${
                currentServer === 4
                  ? "bg-accent-primary/20 border-accent-primary text-white shadow-md"
                  : "bg-surface-glass border-border-glass text-text-secondary hover:text-white hover:bg-white/5"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-white text-xs">AutoEmbed HD</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-slate-300">
                  1080p Pure
                </span>
              </div>
              <p className="text-[11px] text-text-muted">
                වේගවත් බෆරින්ග් සහිත Clean Multi-Channel audio stream.
              </p>
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Add Custom Dub Audio Track (Sinhala Dub mp3, local audio, or URL) */}
      {activeTab === "custom" && (
        <div className="space-y-4 animate-fade-in text-xs">
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 flex items-start gap-2.5">
            <HelpCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-white mb-0.5">
                බාහිර හඬපටයක් (Custom Dub Audio Track) Sync කර Play කිරීම:
              </p>
              <p className="text-text-secondary text-[11px]">
                ඔබ සතු Sinhala Dubbing හෝ වෙනත් Audio file (.mp3, .m4a, .aac) එක මෙතැනට load කරන්න. ඉන්පසු පහත Sync Controls මඟින් වීඩියෝව සමඟ නිවැරදිව සමමුහුර්ත කරගත හැක (Tip: Player එකේ original audio එක Mute කරන්න).
              </p>
            </div>
          </div>

          {/* Upload or URL input */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* File Upload Box */}
            <label className="flex flex-col items-center justify-center p-4 border border-dashed border-white/20 hover:border-accent-secondary/60 rounded-2xl cursor-pointer bg-white/5 hover:bg-white/10 transition-all text-center">
              <Upload className="w-5 h-5 text-accent-secondary mb-1.5" />
              <span className="font-semibold text-white text-xs">
                {audioName ? `තෝරාගත් හඬපටය: ${audioName}` : "Audio File (.mp3, .m4a, .aac) තෝරන්න"}
              </span>
              <span className="text-[10px] text-text-muted mt-0.5">
                Click to browse your device
              </span>
              <input
                type="file"
                accept="audio/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            {/* URL Input Box */}
            <div className="flex flex-col justify-between p-3.5 border border-white/10 rounded-2xl bg-white/5 space-y-2">
              <span className="text-text-secondary text-[11px] font-semibold flex items-center gap-1">
                <LinkIcon className="w-3.5 h-3.5 text-accent-primary" />
                නැතහොත් Audio Direct Link එකක් ඇතුළත් කරන්න:
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  placeholder="https://example.com/audio.mp3"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  className="flex-1 bg-black/50 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-text-muted focus:outline-none focus:border-accent-primary"
                />
                <button
                  type="button"
                  onClick={handleApplyUrl}
                  className="px-3 py-1.5 bg-accent-primary hover:bg-accent-primary-hover text-white font-semibold rounded-xl text-xs transition-all"
                >
                  Load
                </button>
              </div>
            </div>
          </div>

          {/* Synchronized Audio Controller */}
          {audioSrc && (
            <div className="p-4 rounded-2xl bg-[#080b14] border border-accent-secondary/30 space-y-3 shadow-inner">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                  <span className="text-white font-semibold truncate text-xs">
                    {audioName || "Custom Dub Track"}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-accent-secondary bg-accent-secondary/10 px-2 py-0.5 rounded">
                  Offset: {offsetSec > 0 ? `+${offsetSec}` : offsetSec}s
                </span>
              </div>

              {/* Playback & Sync Controls */}
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={togglePlay}
                    className="p-2.5 rounded-xl bg-accent-primary hover:bg-accent-primary-hover text-white shadow-md transition-all flex items-center gap-1.5"
                    title="Play/Pause Custom Audio (Alt+A)"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span className="font-semibold text-xs">{isPlaying ? "Pause" : "Play Dub"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResetAudio}
                    className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all"
                    title="Restart Audio from 00:00"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>

                {/* Lip Sync Offset Adjustment (-0.5s / +0.5s) */}
                <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-xl border border-white/10">
                  <span className="text-[11px] text-text-muted px-1">Lip-Sync:</span>
                  <button
                    type="button"
                    onClick={() => handleAdjustOffset(-0.5)}
                    className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-text-secondary hover:text-white text-xs font-mono"
                  >
                    -0.5s
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAdjustOffset(-0.1)}
                    className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-text-secondary hover:text-white text-xs font-mono"
                  >
                    -0.1s
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAdjustOffset(0.1)}
                    className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-text-secondary hover:text-white text-xs font-mono"
                  >
                    +0.1s
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAdjustOffset(0.5)}
                    className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-text-secondary hover:text-white text-xs font-mono"
                  >
                    +0.5s
                  </button>
                </div>

                {/* Volume slider */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMuted(!isMuted);
                      if (audioRef.current) audioRef.current.muted = !isMuted;
                    }}
                    className="text-text-muted hover:text-white"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setVolume(val);
                      setIsMuted(false);
                      if (audioRef.current) {
                        audioRef.current.volume = val;
                        audioRef.current.muted = false;
                      }
                    }}
                    className="w-16 accent-accent-primary cursor-pointer"
                  />
                </div>
              </div>

              {/* Native HTML5 Audio element */}
              <audio
                ref={audioRef}
                src={audioSrc}
                onEnded={() => setIsPlaying(false)}
                onPause={() => setIsPlaying(false)}
                onPlay={() => setIsPlaying(true)}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
