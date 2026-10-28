import React from "react";
import Link from "next/link";
import MediaCard from "@/components/home/MediaCard";
import SeasonPackModal from "@/components/season/SeasonPackModal";
import { getPopularTv, getAnime, getTvByGenre } from "@/lib/tmdb";
import { Tv, Tag, X } from "lucide-react";

export const revalidate = 3600;

interface TvSeriesPageProps {
  searchParams: {
    genre?: string;
    name?: string;
  };
}

export default async function TvSeriesPage({ searchParams }: TvSeriesPageProps) {
  const selectedGenre = searchParams.genre;
  const genreName = searchParams.name;

  let allSeries = [];

  if (selectedGenre) {
    allSeries = await getTvByGenre(selectedGenre).catch(() => []);
  } else {
    const [popularTv, anime] = await Promise.all([
      getPopularTv().catch(() => []),
      getAnime().catch(() => []),
    ]);

    allSeries = [...popularTv, ...anime].filter(
      (item, index, self) => index === self.findIndex((s) => s.id === item.id)
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 min-h-screen">
      {/* Header */}
      <div className="mb-8 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 text-accent-secondary text-xs font-semibold uppercase tracking-wider">
            <Tv className="w-4 h-4" />
            <span>TV Series & Complete Season Hub</span>
          </div>

          {genreName && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-secondary/20 text-accent-secondary border border-accent-secondary/30 text-xs font-semibold">
              <Tag className="w-3 h-3" />
              <span>Category: {genreName}</span>
              <Link
                href="/tv"
                className="hover:text-white p-0.5 ml-1 transition-colors"
                title="Clear filter"
              >
                <X className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          {genreName
            ? `${genreName} TV Series & Season Packs`
            : "TV Series & Complete Season Packs"}
        </h1>
        <p className="text-xs sm:text-sm text-text-muted font-sinhala">
          {genreName
            ? `තෝරාගත් ${genreName} කාණ්ඩයේ ටෙලි කතා මාලා සහ Season Packs`
            : "සම්පූර්ණ කථා සමයම එකවර (Complete Season Pack) බාගත කිරීමට හෝ බ්‍රවුසරයෙන්ම සිංහල උපසිරැසි සමගින් නරඹන්න"}
        </p>
      </div>

      {/* Grid of TV Series Cards */}
      {allSeries.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {allSeries.map((series) => (
            <MediaCard key={series.id} item={{ ...series, media_type: "tv" }} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center text-text-muted space-y-3">
          <Tv className="w-12 h-12 mx-auto text-text-subtle opacity-40" />
          <p className="text-sm">No TV Series found for this category.</p>
          <Link
            href="/tv"
            className="inline-block px-4 py-2 rounded-xl bg-accent-secondary text-white text-xs font-semibold shadow-md"
          >
            Browse All TV Series
          </Link>
        </div>
      )}

      <SeasonPackModal />
    </div>
  );
}
