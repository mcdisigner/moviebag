import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Play, Star, Users } from "lucide-react";
import { getMovieDetails, getTvDetails, getImageUrl, getExternalIds } from "@/lib/tmdb";
import SeasonPackModal from "@/components/season/SeasonPackModal";

interface DetailsPageProps {
  searchParams: {
    type?: "movie" | "tv";
    id?: string;
  };
}

export const dynamic = "force-dynamic";

export default async function DetailsPage({ searchParams }: DetailsPageProps) {
  const mediaType = searchParams.type === "tv" ? "tv" : "movie";
  const id = searchParams.id || "1399";

  const [media, externalIds] = await Promise.all([
    mediaType === "tv" ? getTvDetails(id) : getMovieDetails(id),
    getExternalIds(id, mediaType),
  ]);

  if (!media) notFound();

  const title = media.title || media.name || "Untitled";
  const releaseYear = (media.release_date || media.first_air_date || "").slice(0, 4);
  const backdropUrl = getImageUrl(media.backdrop_path || media.poster_path, "original");
  const posterUrl = getImageUrl(media.poster_path, "w500");
  const imdbId = media.imdb_id || media.external_ids?.imdb_id || externalIds.imdb_id;

  return (
    <div className="w-full min-h-screen pb-16">
      {/* Backdrop Header */}
      <div className="relative w-full h-[55vh] min-h-[420px] overflow-hidden">
        <img
          src={backdropUrl}
          alt={title}
          className="w-full h-full object-cover object-top opacity-40 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-[#050508]/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050508] via-[#050508]/60 to-transparent w-full md:w-2/3" />
      </div>

      {/* Content Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-48 relative z-10">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Poster Card */}
          <div className="w-48 sm:w-64 rounded-2xl overflow-hidden bg-surface-glass border border-border-glass shadow-2xl flex-shrink-0">
            <img src={posterUrl} alt={title} className="w-full h-auto object-cover" />
          </div>

          {/* Metadata details */}
          <div className="flex-1 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="uppercase text-[11px] font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-accent-primary text-white">
                {mediaType === "tv" ? "TV Series" : "Movie"}
              </span>
              <span className="font-sinhala text-xs px-3 py-0.5 rounded-full bg-indigo-950/60 border border-indigo-500/30 text-indigo-300">
                සිංහල උපසිරැසි සහාය (SubDL & Baiscope)
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              {title}
            </h1>

            {media.tagline && (
              <p className="text-sm italic text-text-muted">{media.tagline}</p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-text-muted">
              <div className="flex items-center gap-1.5 text-accent-gold font-bold">
                <Star className="w-4 h-4 fill-accent-gold" />
                <span>{media.vote_average ? media.vote_average.toFixed(1) : "8.2"}</span>
                <span className="text-[10px] text-text-subtle font-normal">/10</span>
              </div>

              {releaseYear && <span>{releaseYear}</span>}
              <span className="w-1 h-1 rounded-full bg-text-muted" />

              {media.number_of_seasons ? (
                <span>{media.number_of_seasons} Seasons</span>
              ) : media.runtime ? (
                <span>
                  {Math.floor(media.runtime / 60)}h {media.runtime % 60}m
                </span>
              ) : null}

              {imdbId && (
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-white/5 border border-white/10 text-text-secondary">
                  IMDb: {imdbId}
                </span>
              )}
            </div>

            {media.genres && (
              <div className="flex flex-wrap gap-2 pt-1">
                {media.genres.map((g) => (
                  <span
                    key={g.id}
                    className="text-xs px-2.5 py-1 rounded-lg bg-surface-glass border border-border-glass text-text-secondary"
                  >
                    {g.name}
                  </span>
                ))}
              </div>
            )}

            <p className="text-sm sm:text-base text-text-secondary leading-relaxed pt-2">
              {media.overview}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-4">
              <Link
                href={`/watch?type=${mediaType}&id=${media.id}`}
                className="flex items-center gap-2 bg-accent-primary hover:bg-accent-primary-hover text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-accent-primary/30 transition-transform active:scale-95"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Watch Now (Stream)</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Cast List */}
        {media.credits?.cast && media.credits.cast.length > 0 && (
          <div className="mt-12 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-accent-secondary" />
              <span>Top Cast</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
              {media.credits.cast.slice(0, 6).map((actor) => (
                <div
                  key={actor.id}
                  className="p-2.5 rounded-xl bg-surface-glass border border-border-glass text-center space-y-2"
                >
                  <div className="w-16 h-16 rounded-full overflow-hidden mx-auto bg-black/40">
                    <img
                      src={getImageUrl(actor.profile_path, "w300")}
                      alt={actor.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white truncate">
                      {actor.name}
                    </h4>
                    <p className="text-[10px] text-text-muted truncate">
                      {actor.character}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <SeasonPackModal />
    </div>
  );
}
