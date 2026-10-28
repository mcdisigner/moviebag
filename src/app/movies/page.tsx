import React from "react";
import Link from "next/link";
import MediaCard from "@/components/home/MediaCard";
import SeasonPackModal from "@/components/season/SeasonPackModal";
import {
  getTrendingMovies,
  getTopRatedMovies,
  getActionAndSciFi,
  getMoviesByGenre,
} from "@/lib/tmdb";
import { Film, Tag, X } from "lucide-react";

export const revalidate = 3600;

interface MoviesPageProps {
  searchParams: {
    genre?: string;
    name?: string;
  };
}

export default async function MoviesPage({ searchParams }: MoviesPageProps) {
  const selectedGenre = searchParams.genre;
  const genreName = searchParams.name;

  let allMovies = [];

  if (selectedGenre) {
    allMovies = await getMoviesByGenre(selectedGenre).catch(() => []);
  } else {
    const [trending, topRated, action] = await Promise.all([
      getTrendingMovies().catch(() => []),
      getTopRatedMovies().catch(() => []),
      getActionAndSciFi().catch(() => []),
    ]);

    allMovies = [...trending, ...topRated, ...action].filter(
      (item, index, self) => index === self.findIndex((m) => m.id === item.id)
    );
  }

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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {allMovies.map((movie) => (
            <MediaCard key={movie.id} item={{ ...movie, media_type: "movie" }} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center text-text-muted space-y-3">
          <Film className="w-12 h-12 mx-auto text-text-subtle opacity-40" />
          <p className="text-sm">No movies found for this category.</p>
          <Link
            href="/movies"
            className="inline-block px-4 py-2 rounded-xl bg-accent-primary text-white text-xs font-semibold shadow-md"
          >
            Browse All Movies
          </Link>
        </div>
      )}

      <SeasonPackModal />
    </div>
  );
}
