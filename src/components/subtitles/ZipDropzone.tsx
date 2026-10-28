"use client";

import React, { useState, useRef } from "react";
import JSZip from "jszip";
import { FileText, CheckCircle2, AlertCircle, FileArchive, X } from "lucide-react";
import { parseSRT } from "@/lib/subtitleParser";
import { SubtitleTrack } from "@/types/subtitles";
import { useAppStore } from "@/lib/store";

interface ZipDropzoneProps {
  onLoadedTrack?: (track: SubtitleTrack) => void;
  compact?: boolean;
}

export default function ZipDropzone({ onLoadedTrack, compact = false }: ZipDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [extractedFiles, setExtractedFiles] = useState<{ name: string; content: string }[]>([]);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setActiveSubtitleTrack } = useAppStore();

  const handleProcessFile = async (file: File) => {
    setProcessing(true);
    setErrorMsg(null);
    setExtractedFiles([]);

    try {
      if (file.name.endsWith(".zip")) {
        // Read zip archive in memory with JSZip
        const zip = await JSZip.loadAsync(file);
        const srtList: { name: string; content: string }[] = [];

        for (const [relativePath, zipEntry] of Object.entries(zip.files)) {
          if (
            !zipEntry.dir &&
            (relativePath.toLowerCase().endsWith(".srt") ||
              relativePath.toLowerCase().endsWith(".vtt"))
          ) {
            const content = await zipEntry.async("text");
            srtList.push({
              name: relativePath,
              content,
            });
          }
        }

        if (srtList.length === 0) {
          setErrorMsg("No .srt or .vtt subtitle files found inside this .zip file.");
          setProcessing(false);
          return;
        }

        setExtractedFiles(srtList);
        // Automatically activate the first one
        selectSubtitleFile(srtList[0].name, srtList[0].content);
      } else if (
        file.name.toLowerCase().endsWith(".srt") ||
        file.name.toLowerCase().endsWith(".vtt")
      ) {
        // Direct SRT or VTT file
        const text = await file.text();
        selectSubtitleFile(file.name, text);
      } else {
        setErrorMsg("Please upload a .zip subtitle pack, or a .srt / .vtt file.");
      }
    } catch (err: any) {
      console.error("Failed to parse subtitle file:", err);
      setErrorMsg(err.message || "Failed to process subtitle file.");
    } finally {
      setProcessing(false);
    }
  };

  const selectSubtitleFile = (fileName: string, content: string) => {
    setSelectedFileName(fileName);
    const cues = parseSRT(content);
    const isSinhala = /[\u0D80-\u0DFF]/.test(content) || /sinhala|si/i.test(fileName);

    const track: SubtitleTrack = {
      id: `local-${Date.now()}`,
      label: fileName.split("/").pop() || fileName,
      language: isSinhala ? "si" : "en",
      cues,
      source: "zip",
    };

    setActiveSubtitleTrack(track);
    if (onLoadedTrack) onLoadedTrack(track);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="w-full space-y-3">
      {/* Drop Zone Box */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
          compact ? "p-4" : "p-6 sm:p-8"
        } text-center flex flex-col items-center justify-center gap-2.5 ${
          isDragging
            ? "border-accent-secondary bg-accent-secondary/15 scale-[1.01]"
            : "border-border-glass hover:border-accent-secondary/60 bg-surface-glass/60 hover:bg-surface-glass"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".zip,.srt,.vtt"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleProcessFile(e.target.files[0]);
            }
          }}
        />

        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
          {processing ? (
            <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <FileArchive className="w-6 h-6 text-accent-secondary" />
          )}
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white">
            Drag & Drop Sinhala Subtitle Pack (.zip or .srt)
          </h4>
          <p className="text-xs text-text-muted mt-0.5 font-sinhala">
            Baiscope / Cineru / Sinhalasub වෙතින් බාගත කළ ඕනෑම .zip ගොනුවක් මෙතැනට දමන්න
          </p>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-text-subtle">
          <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 font-mono">
            .ZIP
          </span>
          <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 font-mono">
            .SRT
          </span>
          <span>In-Memory RAM Unzip (Zero Disk Write)</span>
        </div>
      </div>

      {/* Error Message if any */}
      {errorMsg && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-xs text-red-300">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
          <span>{errorMsg}</span>
          <button
            onClick={() => setErrorMsg(null)}
            className="ml-auto text-red-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Extracted Files Picker (when a multi-file zip is unpacked) */}
      {extractedFiles.length > 0 && (
        <div className="p-3.5 rounded-xl bg-surface-glass border border-border-glass space-y-2">
          <div className="flex items-center justify-between text-xs text-text-muted">
            <span className="font-semibold text-white">
              Episodes inside .zip ({extractedFiles.length} files found):
            </span>
            <span className="text-[11px] text-indigo-300">Click to select episode</span>
          </div>

          <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
            {extractedFiles.map((file) => {
              const isSelected = selectedFileName === file.name;
              return (
                <button
                  key={file.name}
                  onClick={() => selectSubtitleFile(file.name, file.content)}
                  className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition-all ${
                    isSelected
                      ? "bg-accent-secondary/20 border border-accent-secondary text-white font-medium"
                      : "bg-white/5 hover:bg-white/10 text-text-secondary border border-transparent"
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    <FileText className="w-3.5 h-3.5 text-accent-secondary flex-shrink-0" />
                    <span className="truncate">{file.name}</span>
                  </span>
                  {isSelected && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 ml-2" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
