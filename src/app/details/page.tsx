import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Play, Star, Users, DownloadCloud } from "lucide-react";
import { getMovieDetails, getTvDetails, getImageUrl, getExternalIds, getMovieCollection } from "@/lib/tmdb";
import MovieCollectionTimeline from "@/components/movie/MovieCollectionTimeline";
import SeasonPackModal from "@/components/season/SeasonPackModal";
import DetailsActionButtons from "./DetailsActionButtons";

interface DetailsPageProps {
  searchParams: {
    type?: "movie" | "tv";
    id?: string;
  };
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ searchParams }: DetailsPageProps): Promise<Metadata> {
  const mediaType = searchParams.type === "tv" ? "tv" : "movie";
  const id = searchParams.id || "1399";

  try {
    const media = mediaType === "tv" ? await getTvDetails(id) : await getMovieDetails(id);
    const title = media.title || media.name || "Details";
    const releaseYear = (media.release_date || media.first_air_date || "").slice(0, 4);
    const posterUrl = getImageUrl(media.backdrop_path || media.poster_path, "w1280");

    return {
      title: `${title} (${releaseYear}) - විස්තර සහ සිංහල උපසිරැසි | MovieBag`,
      description: media.overview || `View details, cast, and stream ${title} with Sinhala subtitles.`,
      openGraph: {
        title: `${title} - MovieBag CineLanka`,
        description: media.overview || "",
        images: posterUrl ? [{ url: posterUrl }] : [],
      },
    };
  } catch {
    return {
      title: "Movie & TV Details - MovieBag CineLanka",
    };
  }
}

export default async function DetailsPage({ searchParams }: DetailsPageProps) {
  const mediaType = searchParams.type === "tv" ? "tv" : "movie";
  const id = searchParams.id || "1399";

  const [media, externalIds] = await Promise.all([
    mediaType === "tv" ? getTvDetails(id) : getMovieDetails(id),
    getExternalIds(id, mediaType),
  ]);

  let collection = null;
  if (mediaType === "movie" && media?.belongs_to_collection?.id) {
    collection = await getMovieCollection(media.belongs_to_collection.id);
  }

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
          className="w-full h-full object-cover object-top opacity-35 filter blur-[1px]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background-primary via-background-primary/80 to-transparent" />
      </div>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-64 sm:-mt-72 relative z-10">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Left: Poster */}
          <div className="w-56 sm:w-64 flex-shrink-0 mx-auto md:mx-0 rounded-2xl overflow-hidden border border-border-glass shadow-2xl bg-[#0f111d]">
            <img src={posterUrl} alt={title} className="w-full h-auto object-cover" />
          </div>

          {/* Right: Info */}
          <div className="flex-1 space-y-4">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
              {title}
            </h1>

            {/* Badges and Ratings */}
            <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-text-muted">
              <div className="flex items-center gap-1 text-accent-gold font-bold bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
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

            {/* Client Action Buttons (Watch Now + Season Packs modal trigger) */}
            <DetailsActionButtons
              mediaId={media.id}
              mediaType={mediaType}
              title={title}
              imdbId={imdbId}
              totalSeasons={media.number_of_seasons || 1}
            />
          </div>
        </div>

        {/* Franchise / Collection Watch Order Timeline */}
        {collection && (
          <div className="mt-10">
            <MovieCollectionTimeline collection={collection} currentMovieId={media.id} />
          </div>
        )}

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
                  <img
                    src={getImageUrl(actor.profile_path, "w300")}
                    alt={actor.name}
                    className="w-16 h-16 rounded-full object-cover mx-auto border border-white/10"
                    loading="lazy"
                  />
                  <div>
                    <p className="text-xs font-semibold text-white truncate">{actor.name}</p>
                    <p className="text-[10px] text-text-muted truncate">{actor.character}</p>
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
