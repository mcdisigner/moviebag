export interface SubtitleCue {
  id: number;
  start: number; // in seconds
  end: number;   // in seconds
  text: string;
}

export interface SubDLSubtitleItem {
  release_name: string;
  name: string;
  language: string;
  author?: string;
  url: string;
  hi?: boolean;
  full_url?: string;
  season?: number;
  episode?: number;
}

export interface SubtitleTrack {
  id: string;
  label: string;
  language: "si" | "en" | string;
  cues: SubtitleCue[];
  source: "subdl" | "file" | "zip";
}
