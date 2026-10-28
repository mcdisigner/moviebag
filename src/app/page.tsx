import React from "react";
import HeroBanner from "@/components/home/HeroBanner";
import MediaRow from "@/components/home/MediaRow";
import ZipDropzone from "@/components/subtitles/ZipDropzone";
import SeasonPackModal from "@/components/season/SeasonPackModal";
import {
  getTrendingAll,
  getNowPlayingMovies,
  getTopRatedTv,
  getActionAndAdventure,
  getSciFiAndFantasy,
  getAnimation,
  getPopularTv,
} from "@/lib/tmdb";
import { Languages } from "lucide-react";
import { MediaItem } from "@/types/tmdb";

// Dynamic Cache: Next.js refetches new data every hour (3600s)
export const revalidate = 3600;

export default async function HomePage() {
  const [
    trending,
    nowPlaying,
    topRatedTv,
    actionAdventure,
    sciFiFantasy,
    animation,
    popularTv,
  ] = await Promise.all([
    getTrendingAll().catch(() => []),
    getNowPlayingMovies().catch(() => []),
    getTopRatedTv().catch(() => []),
    getActionAndAdventure().catch(() => []),
    getSciFiAndFantasy().catch(() => []),
    getAnimation().catch(() => []),
    getPopularTv().catch(() => []),
  ]);

  // Dynamic Hero Banner: Pool from Trending Day + Now Playing, randomly select one item
  const heroCandidates = [...trending, ...nowPlaying].filter(
    (item) => item.backdrop_path && (item.title || item.name)
  );
  const heroPool = heroCandidates.length > 0 ? heroCandidates : trending;

  const fallbackHero: MediaItem = {
    id: 1399,
    title: "Game of Thrones",
    overview:
      "Nine noble families fight for control over the lands of Westeros, while an ancient enemy returns after being dormant for millennia.",
    poster_path: "/7WUHnWGx5OO145IRxPDUkQSh4C7.jpg",
    backdrop_path: "/2OMB0ynKlyIenMJWI2Dy9IWT4c.jpg",
    media_type: "tv",
    vote_average: 8.4,
  };

  const heroItem =
    heroPool.length > 0
      ? heroPool[Math.floor(Math.random() * heroPool.length)]
      : fallbackHero;

  return (
    <div className="w-full min-h-screen pb-16">
      {/* 1. Dynamic Hero Banner with Ambient Glow, Badges & Spotlight Shuffle */}
      <HeroBanner item={heroItem} pool={heroPool} />

      {/* 2. Expanded Categorized Rows */}
      <div className="space-y-4 -mt-8 relative z-20">
        {/* Row 1: Trending Today */}
        <MediaRow
          title="Trending Today"
          sinhalaTitle="අද දින වැඩිම පිරිසක් නරඹන චිත්‍රපට සහ කතාමාලා"
          icon="flame"
          items={trending}
        />

        {/* Row 2: Latest Releases (TMDB Now Playing) */}
        <MediaRow
          title="Latest Releases"
          sinhalaTitle="නවතම සිනමාශාලා සහ ඩිජිටල් රිලීස්"
          icon="film"
          items={nowPlaying}
        />

        {/* Row 3: Top Rated TV Shows */}
        <MediaRow
          title="Top Rated TV Shows"
          sinhalaTitle="ඉහළම IMDb සහ ප්‍රේක්ෂක ඇගයීම් ලැබූ ටෙලි කතාමාලා"
          icon="trophy"
          items={topRatedTv}
        />

        {/* Sinhala Subtitle In-Browser Dropzone Feature Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 my-4">
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#0c0e1a] via-[#101326] to-[#0c0e1a] border border-indigo-500/20 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-accent-secondary/15 rounded-full blur-[100px] pointer-events-none" />
            <div className="max-w-2xl mb-5 space-y-1">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
                <Languages className="w-4 h-4 text-accent-secondary" />
                <span>Sinhala Subtitle Extraction Engine</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Drop Any Sinhala Subtitle .ZIP or .SRT
              </h3>
              <p className="text-xs sm:text-sm text-text-muted font-sinhala leading-relaxed">
                Baiscope, Cineru හෝ Sinhalasub වෙතින් බාගත කළ සම්පූර්ණ Season Subtitle ZIP ගොනුව ක්ෂණිකව RAM මත Extract කර ඔබේ ඕනෑම වීඩියෝවක් සමගින් නරඹන්න.
              </p>
            </div>
            <ZipDropzone compact={true} />
          </div>
        </section>

        {/* Row 4: Action & Adventure (TMDB with_genres=28,12) */}
        <MediaRow
          title="Action & Adventure"
          sinhalaTitle="ක්‍රියාදාම සහ ත්‍රාසජනක බ්ලොක්බස්ටර්ස්"
          icon="rocket"
          items={actionAdventure}
        />

        {/* Row 5: Sci-Fi & Fantasy (TMDB with_genres=878,14) */}
        <MediaRow
          title="Sci-Fi & Fantasy"
          sinhalaTitle="විද්‍යා ප්‍රබන්ධ සහ මනඃකල්පිත ෆැන්ටසි ලෝක"
          icon="sparkles"
          items={sciFiFantasy}
        />

        {/* Row 6: Animation (TMDB with_genres=16) */}
        <MediaRow
          title="Animation"
          sinhalaTitle="ළමා සහ වැඩිහිටි සජීවීකරණ සිනමාපට"
          icon="sparkles"
          items={animation}
        />

        {/* Row 7: Popular TV Series */}
        <MediaRow
          title="Popular TV Series"
          sinhalaTitle="ජනප්‍රියම ටෙලි නාට්‍ය සහ සම්පූර්ණ Season Packs"
          icon="tv"
          items={popularTv}
        />
      </div>

      {/* Season Pack Modal (Triggered globally from store) */}
      <SeasonPackModal />
    </div>
  );
}
