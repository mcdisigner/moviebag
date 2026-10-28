import React from "react";
import { notFound } from "next/navigation";
import { getMovieDetails, getTvDetails, getExternalIds } from "@/lib/tmdb";
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
      (mediaType === "tv" ? "tt0944947" : "tt1375666"); // Safe fallback

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
    // Fallback default view so page never crashes
    const fallbackMedia: MediaItem = {
      id: parseInt(id, 10) || 1399,
      title: mediaType === "tv" ? "Game of Thrones" : "Inception",
      name: mediaType === "tv" ? "Game of Thrones" : "Inception",
      overview: "Stream in high definition with Sinhala subtitle overlay and complete season packs.",
      poster_path: "/7WUHnWGx5OO145IRxPDUkQSh4C7.jpg",
      backdrop_path: "/2OMB0ynKlyIenMJWI2Dy9IWT4c.jpg",
      media_type: mediaType as "movie" | "tv",
      vote_average: 8.5,
      number_of_seasons: 8,
    };

    return (
      <WatchClient
        media={fallbackMedia}
        mediaType={mediaType}
        initialSeason={season}
        initialEpisode={episode}
        imdbId="tt0944947"
      />
    );
  }
}
