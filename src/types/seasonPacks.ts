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
  quality?: string; // "4K", "1080p", "720p"
  codec?: string;   // "x265", "x264", "HEVC"
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
