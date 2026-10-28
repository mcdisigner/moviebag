import React from "react";
import Link from "next/link";
import { Film, ShieldCheck, HardDrive, DownloadCloud, Languages } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-[#030306] border-t border-border-glass pt-12 pb-8 mt-20 relative z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-accent-primary flex items-center justify-center">
                <Film className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                Movie<span className="text-accent-primary">Bag</span>
                <span className="text-xs text-indigo-400 ml-1 font-normal">CineLanka</span>
              </span>
            </Link>
            <p className="text-xs text-text-muted leading-relaxed font-sinhala">
              ලොව පුරා සිනමාපට සහ රූපවාහිනී කතා මාලා, සිංහල උපසිරැසි සහ One-Click Complete Season Packs සමගින් ඔබේ බ්‍රවුසරයෙන්ම නරඹන්න.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-text-muted">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Zero Local Disk Storage • 100% Serverless</span>
            </div>
          </div>

          {/* Key Capabilities */}
          <div>
            <h4 className="text-xs font-semibold text-white tracking-wider uppercase mb-3.5 flex items-center gap-1.5">
              <Languages className="w-3.5 h-3.5 text-accent-secondary" />
              Sinhala Sub Hub
            </h4>
            <ul className="space-y-2 text-xs text-text-muted">
              <li>Auto SubDL API Sync (SI + EN)</li>
              <li>RAM In-Memory .ZIP Extraction</li>
              <li>Dual Subtitle Overlay Mode</li>
              <li>Interactive Time Offset Tuning (±0.5s)</li>
              <li>Baiscope & Cineru Drag & Drop Zone</li>
            </ul>
          </div>

          {/* Zero Disk Streaming */}
          <div>
            <h4 className="text-xs font-semibold text-white tracking-wider uppercase mb-3.5 flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-accent-gold" />
              Zero-Disk Engine
            </h4>
            <ul className="space-y-2 text-xs text-text-muted">
              <li>Multi-Server Auto Fallback (7+ Nodes)</li>
              <li>VidSrc, SmashyStream & SuperEmbed</li>
              <li>PotPlayer & VLC 1-Click Handshake</li>
              <li>Instant 1080p / 4K Cloud Streaming</li>
              <li>Zero HDD / SSD Wear & Tear</li>
            </ul>
          </div>

          {/* Season Pack Hub */}
          <div>
            <h4 className="text-xs font-semibold text-white tracking-wider uppercase mb-3.5 flex items-center gap-1.5">
              <DownloadCloud className="w-3.5 h-3.5 text-accent-primary" />
              Season Pack Hub
            </h4>
            <ul className="space-y-2 text-xs text-text-muted">
              <li>Whole Season Batch Torrent Packs</li>
              <li>High-Speed Public Tracker Swarm</li>
              <li>qBittorrent & Flud 1-Click Launch</li>
              <li>JDownloader 2 Batch Link Exporter</li>
              <li>Episode Watched Tracker Sync</li>
            </ul>
          </div>
        </div>

        {/* Legal Disclaimer & TMDB attribution */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between text-[11px] text-text-subtle gap-4">
          <p className="flex items-center gap-1.5 text-center md:text-left">
            <ShieldCheck className="w-3.5 h-3.5 text-accent-emerald flex-shrink-0" />
            <span>
              MovieBag does not store or host any video files on our servers. All video metadata is sourced from TMDB API v3 and SubDL API.
            </span>
          </p>
          <p>© {new Date().getFullYear()} MovieBag CineLanka Hub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
