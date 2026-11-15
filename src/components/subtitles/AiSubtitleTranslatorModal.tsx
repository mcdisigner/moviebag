"use client";

import React, { useState } from "react";
import {
  Sparkles,
  X,
  Languages,
  Check,
  Download,
  AlertCircle,
  Loader2,
  FileText,
} from "lucide-react";
import { SubDLSubtitleItem, SubtitleCue, SubtitleTrack } from "@/types/subtitles";
import { cuesToSRT } from "@/lib/subtitleParser";

interface AiSubtitleTranslatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableSubs: SubDLSubtitleItem[];
  currentActiveTrack: SubtitleTrack | null;
  onTranslatedTrackLoaded: (track: SubtitleTrack) => void;
  mediaTitle: string;
}

const SUPPORTED_LANGUAGES = [
  { code: "si", label: "සිංහල (Sinhala)", flag: "🇱🇰" },
  { code: "ta", label: "தமிழ் (Tamil)", flag: "🇮🇳" },
  { code: "hi", label: "हिन्दी (Hindi)", flag: "🇮🇳" },
  { code: "es", label: "Español (Spanish)", flag: "🇪🇸" },
  { code: "fr", label: "Français (French)", flag: "🇫🇷" },
  { code: "de", label: "Deutsch (German)", flag: "🇩🇪" },
  { code: "ar", label: "العربية (Arabic)", flag: "🇸🇦" },
  { code: "ru", label: "Русский (Russian)", flag: "🇷🇺" },
  { code: "ja", label: "日本語 (Japanese)", flag: "🇯🇵" },
  { code: "ko", label: "한국어 (Korean)", flag: "🇰🇷" },
  { code: "it", label: "Italiano (Italian)", flag: "🇮🇹" },
  { code: "pt", label: "Português (Portuguese)", flag: "🇵ᴛ" },
];

export default function AiSubtitleTranslatorModal({
  isOpen,
  onClose,
  availableSubs,
  currentActiveTrack,
  onTranslatedTrackLoaded,
  mediaTitle,
}: AiSubtitleTranslatorModalProps) {
  const [targetLang, setTargetLang] = useState<string>("si");
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [progressMsg, setProgressMsg] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [translatedTrack, setTranslatedTrack] = useState<SubtitleTrack | null>(null);

  if (!isOpen) return null;

  // Find candidate English subtitle if active track is not loaded
  const englishSubs = availableSubs.filter(
    (s) =>
      s.language?.toLowerCase().includes("en") ||
      !s.language?.toLowerCase().includes("si")
  );

  const handleStartTranslation = async () => {
    setIsTranslating(true);
    setErrorMsg("");
    setProgressMsg("සූදානම් වෙමින් පවතී (Preparing source subtitles)...");

    try {
      let sourceCues: SubtitleCue[] = [];
      let sourceLabel = "English Subtitle";

      // 1. Get Source Cues
      if (currentActiveTrack && currentActiveTrack.cues?.length > 0) {
        sourceCues = currentActiveTrack.cues;
        sourceLabel = currentActiveTrack.label;
      } else if (englishSubs.length > 0) {
        const bestSub = englishSubs[0];
        sourceLabel = bestSub.release_name || bestSub.name || "English Sub";
        setProgressMsg(`SubDL වෙතින් ${sourceLabel} බාගත කරමින්...`);

        const res = await fetch(
          `/api/subtitles?action=download_cues&url=${encodeURIComponent(bestSub.url)}`
        );
        if (!res.ok) throw new Error("Could not download base English subtitle from SubDL.");
        const data = await res.json();
        sourceCues = data.cues || [];
      } else {
        throw new Error(
          "පරිවර්තනය කිරීමට English උපසිරැසියක් හමුනොවීය. කරුණාකර Dropzone වෙත .srt හෝ .zip එකක් දමන්න."
        );
      }

      if (sourceCues.length === 0) {
        throw new Error("උපසිරැසියේ පේළි (Cues) හමුනොවීය.");
      }

      // 2. Call Translation API in batch
      setProgressMsg(
        `AI මඟින් පේළි ${sourceCues.length} ක් තෝරාගත් භාෂාවට පරිවර්තනය කරමින්...`
      );

      const transRes = await fetch("/api/subtitles/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cues: sourceCues,
          targetLang,
          sourceLang: "auto",
        }),
      });

      if (!transRes.ok) {
        const errJson = await transRes.json().catch(() => ({}));
        throw new Error(errJson.error || "Subtitle translation failed");
      }

      const transData = await transRes.json();
      const targetLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === targetLang);
      const newLabel = `AI ${targetLangObj?.label || targetLang} (${sourceLabel})`;

      const newTrack: SubtitleTrack = {
        id: `ai-trans-${targetLang}-${Date.now()}`,
        label: newLabel,
        language: targetLang,
        cues: transData.cues,
        source: "ai-translated",
      };

      setTranslatedTrack(newTrack);
      onTranslatedTrackLoaded(newTrack);
      setProgressMsg("සාර්ථකයි! උපසිරැසි දැන් Player එකට එක් කර ඇත.");
    } catch (err: any) {
      console.error("AI translation error:", err);
      setErrorMsg(err.message || "පරිවර්තනය කිරීමේදී දෝෂයක් සිදුවිය.");
    } finally {
      setIsTranslating(false);
    }
  };

  const handleDownloadSRT = () => {
    if (!translatedTrack) return;
    const srtText = cuesToSRT(translatedTrack.cues);
    const blob = new Blob([srtText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${mediaTitle.replace(/[^a-zA-Z0-9]/g, "_")}_${targetLang}_AI_Sub.srt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#0f1322] border border-indigo-500/30 p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-accent-primary to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                AI Auto-Translate Subtitles
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Instant
                </span>
              </h3>
              <p className="text-xs text-text-muted">
                English උපසිරැසි තත්පර කිහිපයකින් සිංහල හෝ වෙනත් භාෂාවකට පෙරලන්න
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-text-muted hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Source Subtitle Status */}
        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <FileText className="w-4 h-4 text-indigo-400 flex-shrink-0" />
            <div className="truncate">
              <span className="text-text-muted block text-[10px]">Source Subtitle:</span>
              <span className="text-white font-medium truncate">
                {currentActiveTrack?.label ||
                  (englishSubs[0]?.release_name ? englishSubs[0].release_name : "SubDL Base English")}
              </span>
            </div>
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono flex-shrink-0">
            Ready
          </span>
        </div>

        {/* Language Selection */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
            <Languages className="w-3.5 h-3.5 text-accent-secondary" />
            පරිවර්තනය කළ යුතු භාෂාව (Target Language):
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = targetLang === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setTargetLang(lang.code)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-left text-xs transition-all ${
                    isSelected
                      ? "bg-accent-primary/25 border-accent-primary text-white font-semibold shadow-md"
                      : "bg-surface-glass border-border-glass text-text-secondary hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span className="text-base">{lang.flag}</span>
                  <span className="truncate">{lang.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Progress or Success message */}
        {progressMsg && (
          <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center gap-2 text-xs text-indigo-200">
            {isTranslating ? (
              <Loader2 className="w-4 h-4 animate-spin text-accent-secondary flex-shrink-0" />
            ) : (
              <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            )}
            <span>{progressMsg}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          {!translatedTrack ? (
            <button
              onClick={handleStartTranslation}
              disabled={isTranslating}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-accent-primary to-indigo-600 hover:from-accent-primary-hover hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-accent-primary/25 transition-all disabled:opacity-50"
            >
              {isTranslating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>පරිවර්තනය වෙමින් පවතී...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Translate Subtitles with AI</span>
                </>
              )}
            </button>
          ) : (
            <>
              <button
                onClick={handleDownloadSRT}
                className="flex-1 py-3 px-4 rounded-xl bg-surface-glass hover:bg-white/10 border border-indigo-500/40 text-indigo-200 hover:text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all"
              >
                <Download className="w-4 h-4 text-accent-secondary" />
                <span>Download .SRT</span>
              </button>
              <button
                onClick={onClose}
                className="py-3 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/25 transition-all"
              >
                <Check className="w-4 h-4" />
                <span>Ready to Watch</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
