import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SubtitleTrack } from "@/types/subtitles";

export interface WatchlistItem {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  media_type: "movie" | "tv";
  vote_average: number;
  release_date?: string;
  addedAt: number;
}

export interface ContinueWatchingItem {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  media_type: "movie" | "tv";
  season?: number;
  episode?: number;
  progressPercent?: number;
  updatedAt: number;
}

interface AppState {
  // Watchlist & History
  watchlist: WatchlistItem[];
  addToWatchlist: (item: Omit<WatchlistItem, "addedAt">) => void;
  removeFromWatchlist: (id: number) => void;
  isInWatchlist: (id: number) => boolean;

  continueWatching: ContinueWatchingItem[];
  saveContinueWatching: (item: Omit<ContinueWatchingItem, "updatedAt">) => void;
  removeContinueWatching: (id: number) => void;

  // Watched episodes
  watchedEpisodes: Record<string, boolean>;
  toggleEpisodeWatched: (tvId: number, season: number, episode: number) => void;
  isEpisodeWatched: (tvId: number, season: number, episode: number) => boolean;

  // Subtitle Settings & Tracks
  subtitleOffset: number; // in seconds
  setSubtitleOffset: (offset: number) => void;
  adjustSubtitleOffset: (delta: number) => void;

  subtitleFontSize: "sm" | "md" | "lg" | "xl";
  setSubtitleFontSize: (size: "sm" | "md" | "lg" | "xl") => void;

  dualSubtitleEnabled: boolean;
  setDualSubtitleEnabled: (enabled: boolean) => void;

  activeSubtitleTrack: SubtitleTrack | null;
  setActiveSubtitleTrack: (track: SubtitleTrack | null) => void;

  secondarySubtitleTrack: SubtitleTrack | null;
  setSecondarySubtitleTrack: (track: SubtitleTrack | null) => void;

  // Player Settings
  preferredServer: number;
  setPreferredServer: (server: number) => void;

  // Modals
  searchModalOpen: boolean;
  setSearchModalOpen: (open: boolean) => void;

  seasonPackModalData: {
    imdbId: string;
    title: string;
    season: number;
    totalSeasons?: number;
    mediaType?: "movie" | "tv";
  } | null;
  setSeasonPackModalData: (
    data: {
      imdbId: string;
      title: string;
      season: number;
      totalSeasons?: number;
      mediaType?: "movie" | "tv";
    } | null
  ) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Watchlist
      watchlist: [],
      addToWatchlist: (item) => {
        const current = get().watchlist;
        if (!current.some((w) => w.id === item.id)) {
          set({
            watchlist: [{ ...item, addedAt: Date.now() }, ...current],
          });
        }
      },
      removeFromWatchlist: (id) => {
        set({
          watchlist: get().watchlist.filter((w) => w.id !== id),
        });
      },
      isInWatchlist: (id) => {
        return get().watchlist.some((w) => w.id === id);
      },

      // Continue watching
      continueWatching: [],
      saveContinueWatching: (item) => {
        const filtered = get().continueWatching.filter((c) => c.id !== item.id);
        set({
          continueWatching: [{ ...item, updatedAt: Date.now() }, ...filtered].slice(
            0,
            20
          ),
        });
      },
      removeContinueWatching: (id) => {
        set({
          continueWatching: get().continueWatching.filter((c) => c.id !== id),
        });
      },

      // Watched episodes
      watchedEpisodes: {},
      toggleEpisodeWatched: (tvId, season, episode) => {
        const key = `${tvId}_s${season}_e${episode}`;
        const current = get().watchedEpisodes;
        set({
          watchedEpisodes: {
            ...current,
            [key]: !current[key],
          },
        });
      },
      isEpisodeWatched: (tvId, season, episode) => {
        const key = `${tvId}_s${season}_e${episode}`;
        return !!get().watchedEpisodes[key];
      },

      // Subtitle settings
      subtitleOffset: 0,
      setSubtitleOffset: (offset) => set({ subtitleOffset: offset }),
      adjustSubtitleOffset: (delta) =>
        set((state) => ({
          subtitleOffset: Math.round((state.subtitleOffset + delta) * 10) / 10,
        })),

      subtitleFontSize: "lg",
      setSubtitleFontSize: (subtitleFontSize) => set({ subtitleFontSize }),

      dualSubtitleEnabled: false,
      setDualSubtitleEnabled: (dualSubtitleEnabled) =>
        set({ dualSubtitleEnabled }),

      activeSubtitleTrack: null,
      setActiveSubtitleTrack: (activeSubtitleTrack) =>
        set({ activeSubtitleTrack }),

      secondarySubtitleTrack: null,
      setSecondarySubtitleTrack: (secondarySubtitleTrack) =>
        set({ secondarySubtitleTrack }),

      // Player settings
      preferredServer: 1,
      setPreferredServer: (preferredServer) => set({ preferredServer }),

      // Modals
      searchModalOpen: false,
      setSearchModalOpen: (searchModalOpen) => set({ searchModalOpen }),

      seasonPackModalData: null,
      setSeasonPackModalData: (seasonPackModalData) =>
        set({ seasonPackModalData }),
    }),
    {
      name: "moviebag-storage",
      partialize: (state) => ({
        watchlist: state.watchlist,
        continueWatching: state.continueWatching,
        watchedEpisodes: state.watchedEpisodes,
        subtitleFontSize: state.subtitleFontSize,
        dualSubtitleEnabled: state.dualSubtitleEnabled,
        preferredServer: state.preferredServer,
        subtitleOffset: state.subtitleOffset,
      }),
    }
  )
);
