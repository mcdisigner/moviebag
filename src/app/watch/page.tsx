import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMovieDetails, getTvDetails, getExternalIds, getImageUrl } from "@/lib/tmdb";
import { MediaItem } from "@/types/tmdb";
import WatchClient from "./WatchClient";

interface WatchPageProps {
  searchParams: {
    type?: "movie" | "tv";
    id?: string;
    season?: string;
    episode?: string;
  };
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ searchParams }: WatchPageProps): Promise<Metadata> {
  const mediaType = searchParams.type === "tv" ? "tv" : "movie";
  const id = searchParams.id || "1399";
  const season = searchParams.season || "1";
  const episode = searchParams.episode || "1";

  try {
    const media = mediaType === "tv" ? await getTvDetails(id) : await getMovieDetails(id);
    const title = media.title || media.name || "Watch";
    const releaseYear = (media.release_date || media.first_air_date || "").slice(0, 4);
    const posterUrl = getImageUrl(media.backdrop_path || media.poster_path, "w1280");
    const epSuffix = mediaType === "tv" ? ` - S${season} E${episode}` : "";

    return {
      title: `${title}${epSuffix} (${releaseYear}) - සිංහල උපසිරැසි සමඟ Stream | MovieBag`,
      description: media.overview || `Watch ${title} in 1080p/4K with Sinhala subtitles on MovieBag.`,
      openGraph: {
        title: `${title}${epSuffix} - MovieBag CineLanka`,
        description: media.overview || "",
        images: posterUrl ? [{ url: posterUrl }] : [],
      },
    };
  } catch {
    return {
      title: "Watch Movie / TV Series - MovieBag CineLanka",
    };
  }
}

export default async function WatchPage({ searchParams }: WatchPageProps) {
  const mediaType = searchParams.type === "tv" ? "tv" : "movie";
  const id = searchParams.id || "1399";
  const season = parseInt(searchParams.season || "1", 10);
  const episode = parseInt(searchParams.episode || "1", 10);

  try {
    const [media, externalIds] = await Promise.all([
      mediaType === "tv" ? getTvDetails(id) : getMovieDetails(id),
      getExternalIds(id, mediaType),
    ]);

    if (!media || !media.id) {
      notFound();
    }

    const imdbId =
      media.imdb_id ||
      media.external_ids?.imdb_id ||
      externalIds.imdb_id ||
      undefined;

    return (
      <WatchClient
        media={media}
        mediaType={mediaType}
        initialSeason={season}
        initialEpisode={episode}
        imdbId={imdbId}
      />
    );
  } catch (err) {
    console.error("WatchPage error:", err);
    const fallbackMedia: MediaItem = {
      id: parseInt(id, 10) || 1399,
      title: mediaType === "tv" ? "TV Series Stream" : "Movie Stream",
      name: mediaType === "tv" ? "TV Series Stream" : "Movie Stream",
      overview: "Stream in high definition with Sinhala subtitle overlay and complete season packs.",
      poster_path: null,
      backdrop_path: null,
      media_type: mediaType as "movie" | "tv",
      vote_average: 8.0,
      number_of_seasons: 1,
    };

    return (
      <WatchClient
        media={fallbackMedia}
        mediaType={mediaType}
        initialSeason={season}
        initialEpisode={episode}
        imdbId={undefined}
      />
    );
  }
}
