export interface TorrentStream {
  name: string;
  title: string;
  infoHash: string;
  fileIdx?: number;
  behaviorHints?: {
    bingeGroup?: string;
    filename?: string;
  };
  // Parsed / enriched attributes
  quality?: string; // "4K UHD", "1080p FHD", "720p HD", "480p SD"
  source?: string;  // "BluRay", "WEB-DL", "WEBRip", "HDRip", "CAM-Rip"
  codec?: string;   // "x265 HEVC", "x264", "AV1"
  size?: string;    // "12.4 GB"
  seeders?: number;
  isSeasonPack?: boolean;
  magnetUri?: string;
  seasonNumber?: number;
  episodeNumber?: number;
}

export interface SeasonPackResponse {
  seasonPacks: TorrentStream[];
  episodeStreams: TorrentStream[];
  totalPacks: number;
  totalEpisodes: number;
}
