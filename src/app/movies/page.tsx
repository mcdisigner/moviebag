import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import MediaCard from "@/components/home/MediaCard";
import SeasonPackModal from "@/components/season/SeasonPackModal";
import {
  getTrendingMovies,
  getMoviesByGenre,
} from "@/lib/tmdb";
import { Film, Tag, X, ChevronLeft, ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

interface MoviesPageProps {
  searchParams: {
    genre?: string;
    name?: string;
    page?: string;
  };
}

export function generateMetadata({ searchParams }: MoviesPageProps): Metadata {
  const genreName = searchParams.name;
  return {
    title: genreName
      ? `${genreName} Movies - සිංහල උපසිරැසි සහිත චිත්‍රපට | MovieBag`
      : "Explore Movies with Sinhala Subtitles - MovieBag CineLanka",
    description: "Browse trending and top rated movies with Sinhala subtitles and high-speed season packs.",
  };
}

export default async function MoviesPage({ searchParams }: MoviesPageProps) {
  const selectedGenre = searchParams.genre;
  const genreName = searchParams.name;
  const currentPage = Math.max(1, parseInt(searchParams.page || "1", 10));

  let allMovies = [];

  if (selectedGenre) {
    allMovies = await getMoviesByGenre(selectedGenre, currentPage).catch(() => []);
  } else {
    allMovies = await getTrendingMovies(currentPage).catch(() => []);
  }

  const buildPageUrl = (pageNumber: number) => {
    const params = new URLSearchParams();
    if (selectedGenre) params.set("genre", selectedGenre);
    if (genreName) params.set("name", genreName);
    params.set("page", String(pageNumber));
    return `/movies?${params.toString()}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 min-h-screen">
      {/* Header */}
      <div className="mb-8 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 text-accent-primary text-xs font-semibold uppercase tracking-wider">
            <Film className="w-4 h-4" />
            <span>Movies Collection</span>
          </div>

          {genreName && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-primary/20 text-accent-primary border border-accent-primary/30 text-xs font-semibold">
              <Tag className="w-3 h-3" />
              <span>Category: {genreName}</span>
              <Link
                href="/movies"
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
            ? `${genreName} Movies with Sinhala Subtitles`
            : "Explore Movies with Sinhala Subtitles"}
        </h1>
        <p className="text-xs sm:text-sm text-text-muted font-sinhala">
          {genreName
            ? `තෝරාගත් ${genreName} කාණ්ඩයේ චිත්‍රපට සහ සිංහල උපසිරැසි එකතුව`
            : "නවතම සිනමාපට, සම්භාව්‍ය චිත්‍රපට සහ සිංහල උපසිරැසි සහිත බ්ලොක්බස්ටර් චිත්‍රපට එකතුව"}
        </p>
      </div>

      {/* Grid of Movie Cards */}
      {allMovies.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {allMovies.map((movie) => (
              <MediaCard key={movie.id} item={{ ...movie, media_type: "movie" }} />
            ))}
          </div>

          {/* Pagination Bar */}
          <div className="mt-12 flex items-center justify-center gap-4">
            {currentPage > 1 ? (
              <Link
                href={buildPageUrl(currentPage - 1)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-surface-glass border border-border-glass text-white text-xs font-semibold hover:bg-white/10 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </Link>
            ) : (
              <span className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/5 border border-white/5 text-text-muted text-xs font-semibold opacity-40 cursor-not-allowed">
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </span>
            )}

            <span className="text-xs text-text-muted font-mono px-3 py-1 rounded-lg bg-white/5 border border-white/10">
              Page {currentPage}
            </span>

            <Link
              href={buildPageUrl(currentPage + 1)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-surface-glass border border-border-glass text-white text-xs font-semibold hover:bg-white/10 transition-all"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </>
      ) : (
        <div className="py-20 text-center text-text-muted space-y-3">
          <Film className="w-12 h-12 mx-auto text-text-subtle opacity-40" />
          <p className="text-sm">No movies found for this page.</p>
          <Link
            href="/movies"
            className="inline-block px-4 py-2 rounded-xl bg-accent-primary text-white text-xs font-semibold shadow-md"
          >
            Back to Page 1
          </Link>
        </div>
      )}

      <SeasonPackModal />
    </div>
  );
}
