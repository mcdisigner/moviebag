import { NextRequest, NextResponse } from "next/server";
import { TorrentStream, SeasonPackResponse } from "@/types/seasonPacks";

const PUBLIC_TRACKERS = [
  "udp://tracker.opentrackr.org:1337/announce",
  "udp://open.stealth.si:80/announce",
  "udp://tracker.torrent.eu.org:451/announce",
  "udp://tracker.bittor.pw:1337/announce",
  "udp://public.popcorn-tracker.org:6969/announce",
  "udp://tracker.dler.org:6969/announce",
  "udp://exodus.desync.com:6969/announce",
];

function buildMagnet(infoHash: string, title: string): string {
  const tr = PUBLIC_TRACKERS.map((t) => `&tr=${encodeURIComponent(t)}`).join("");
  return `magnet:?xt=urn:btih:${infoHash}&dn=${encodeURIComponent(
    title.replace(/[\n\r]/g, " ")
  )}${tr}`;
}

function parseStreamMetadata(rawTitle: string): {
  cleanTitle: string;
  quality: string;
  codec: string;
  size: string;
  seeders: number;
} {
  const lines = rawTitle.split("\n");
  const cleanTitle = lines[0] || rawTitle;

  // Extract quality
  let quality = "HD";
  if (/2160p|4k|uhd/i.test(rawTitle)) quality = "4K UHD";
  else if (/1080p|fhd/i.test(rawTitle)) quality = "1080p FHD";
  else if (/720p|hd/i.test(rawTitle)) quality = "720p HD";
  else if (/480p|sd/i.test(rawTitle)) quality = "480p SD";

  // Extract codec
  let codec = "x264";
  if (/x265|hevc|h\.265|10bit/i.test(rawTitle)) codec = "x265 HEVC";
  else if (/av1/i.test(rawTitle)) codec = "AV1";
  else if (/x264|h\.264|avc/i.test(rawTitle)) codec = "x264";

  // Extract size (e.g. 💾 14.2 GB or 1.2 GB)
  const sizeMatch = rawTitle.match(/(\d+(?:\.\d+)?\s*(?:GB|MB|TB))/i);
  const size = sizeMatch ? sizeMatch[1] : "Unknown";

  // Extract seeders (e.g. 👤 142 or ⚙️ 45)
  const seedersMatch = rawTitle.match(/[👤⚙️]\s*(\d+)/);
  const seeders = seedersMatch ? parseInt(seedersMatch[1], 10) : 0;

  return { cleanTitle, quality, codec, size, seeders };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const imdbIdRaw = searchParams.get("imdb_id") || "";
  const type = searchParams.get("type") || "series"; // "series" or "movie"

  // Dynamically accept both season_number and season parameters
  const seasonParam =
    searchParams.get("season_number") || searchParams.get("season") || "1";
  const episodeParam =
    searchParams.get("episode_number") || searchParams.get("episode") || "1";

  const seasonNum = parseInt(seasonParam, 10) || 1;
  const episodeNum = parseInt(episodeParam, 10) || 1;

  if (!imdbIdRaw) {
    return NextResponse.json(
      { error: "imdb_id parameter is required" },
      { status: 400 }
    );
  }

  const cleanImdbId = imdbIdRaw.startsWith("tt") ? imdbIdRaw : `tt${imdbIdRaw}`;

  try {
    let torrentioUrl = "";
    if (type === "movie") {
      torrentioUrl = `https://torrentio.strem.fun/stream/movie/${cleanImdbId}.json`;
    } else {
      // Fetch streams for the exact selected season and episode
      torrentioUrl = `https://torrentio.strem.fun/stream/series/${cleanImdbId}:${seasonNum}:${episodeNum}.json`;
    }

    const res = await fetch(torrentioUrl, {
      next: { revalidate: 1800 },
      headers: {
        "User-Agent": "MovieBag-CineLanka/1.0",
      },
    });

    if (!res.ok) {
      return NextResponse.json<SeasonPackResponse>({
        seasonPacks: [],
        episodeStreams: [],
        totalPacks: 0,
        totalEpisodes: 0,
      });
    }

    const data = await res.json();
    const rawStreams = data.streams || [];

    const seasonPacks: TorrentStream[] = [];
    const episodeStreams: TorrentStream[] = [];

    // Multi-season complete boxsets (e.g. Complete Series, Integrale, S01-S08)
    const completeSeriesPattern =
      /(complete\s*series|integrale|all\s*seasons|\bS0?1[\s._-]*[-–~to]+[\s._-]*S?0?\d+\b|Seasons?[\s._-]*1[\s._-]*[-–~to]+[\s._-]*\d+)/i;

    // Batch or multi-episode markers: e.g. Complete, Batch, Pack, Full, 1-10, E01-E10
    const multiEpisodeOrPackPattern =
      /(complete|pack|batch|full|all\s*episodes|\bE?0?\d+[\s._-]*[-–~to]+[\s._-]*E?0?\d+\b|\b\d+\s*[-–~]\s*\d+\b|\b\d+\s*из\s*\d+\b)/i;

    for (const s of rawStreams) {
      if (!s.infoHash) continue;

      const meta = parseStreamMetadata(s.title || s.name || "");
      const cleanTitle = meta.cleanTitle || "";

      // If movie type, everything is a stream for the movie
      if (type === "movie") {
        const magnetUri = buildMagnet(s.infoHash, cleanTitle);
        seasonPacks.push({
          name: s.name,
          title: cleanTitle,
          infoHash: s.infoHash,
          fileIdx: s.fileIdx,
          quality: meta.quality,
          codec: meta.codec,
          size: meta.size,
          seeders: meta.seeders,
          isSeasonPack: true,
          magnetUri,
          seasonNumber: 1,
          episodeNumber: 1,
        });
        continue;
      }

      const isCompleteSeries = completeSeriesPattern.test(cleanTitle);

      // Extract specific season number from clean title
      const seasonMatch =
        cleanTitle.match(/\bS(\d{1,2})\b/i) ||
        cleanTitle.match(/\bSeason\s*(\d{1,2})\b/i) ||
        cleanTitle.match(/Сезон:\s*(\d{1,2})/i);
      const foundSeasonNum = seasonMatch ? parseInt(seasonMatch[1], 10) : null;

      // Skip streams that strictly specify a different single season
      if (
        foundSeasonNum !== null &&
        foundSeasonNum !== seasonNum &&
        !isCompleteSeries
      ) {
        continue;
      }

      const isTargetSeason = foundSeasonNum === seasonNum;
      const hasEpisodeTag =
        /\bS\d{1,2}E\d{1,2}\b/i.test(cleanTitle) ||
        /\bE\d{1,2}\b/i.test(cleanTitle) ||
        /\bEpisode\s*\d{1,2}\b/i.test(cleanTitle);
      const hasMultiEp = multiEpisodeOrPackPattern.test(cleanTitle);

      // Classify as season pack if it is a complete series or target season pack
      const isPack =
        isCompleteSeries ||
        (isTargetSeason && (!hasEpisodeTag || hasMultiEp)) ||
        (hasMultiEp && !hasEpisodeTag);

      const magnetUri = buildMagnet(s.infoHash, cleanTitle);

      const parsedItem: TorrentStream = {
        name: s.name,
        title: cleanTitle,
        infoHash: s.infoHash,
        fileIdx: s.fileIdx,
        quality: meta.quality,
        codec: meta.codec,
        size: meta.size,
        seeders: meta.seeders,
        isSeasonPack: isPack,
        magnetUri,
        seasonNumber: seasonNum,
        episodeNumber: episodeNum,
      };

      if (isPack) {
        seasonPacks.push(parsedItem);
      } else {
        episodeStreams.push(parsedItem);
      }
    }

    // Sort by seeders descending
    seasonPacks.sort((a, b) => (b.seeders || 0) - (a.seeders || 0));
    episodeStreams.sort((a, b) => (b.seeders || 0) - (a.seeders || 0));

    return NextResponse.json<SeasonPackResponse>({
      seasonPacks,
      episodeStreams,
      totalPacks: seasonPacks.length,
      totalEpisodes: episodeStreams.length,
    });
  } catch (err: any) {
    console.error("Season packs API error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch torrent streams" },
      { status: 500 }
    );
  }
}
