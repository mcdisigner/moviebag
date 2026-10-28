"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Film, Tv, Star, Loader2, ArrowRight } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { MediaItem } from "@/types/tmdb";
import { getImageUrl } from "@/lib/tmdb";

export default function SearchModal() {
  const router = useRouter();
  const isOpen = useAppStore((state) => state.searchModalOpen);
  const setIsOpen = useAppStore((state) => state.setSearchModalOpen);

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "movie" | "tv">("all");
  const [results, setResults] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setResults([]);
    }
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, setIsOpen]);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const apiKey =
          process.env.NEXT_PUBLIC_TMDB_API_KEY || "930ad4a1965f9d84446cdb78e49c310d";
        const url = `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&query=${encodeURIComponent(
          query.trim()
        )}&language=en-US&page=1`;

        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          const items: MediaItem[] = (data.results || []).filter(
            (item: any) =>
              (item.media_type === "movie" || item.media_type === "tv") &&
              (item.poster_path || item.backdrop_path)
          );
          setResults(items);
        }
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const filteredResults = results.filter((item) => {
    if (filter === "all") return true;
    return item.media_type === filter;
  });

  const handleSelectItem = (item: MediaItem) => {
    setIsOpen(false);
    const type = item.media_type || (item.first_air_date ? "tv" : "movie");
    router.push(`/watch?type=${type}&id=${item.id}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/80 backdrop-blur-md animate-fade-in">
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={() => setIsOpen(false)} />

      {/* Modal Dialog Container */}
      <div className="relative w-full max-w-2xl bg-[#0e101a] border border-border-glass rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-border-glass gap-3 bg-surface-glass">
          <Search className="w-5 h-5 text-accent-primary flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search movies, TV series, Sinhala subtitle titles..."
            className="w-full bg-transparent text-white placeholder-text-muted focus:outline-none text-base font-medium"
          />
          {loading && <Loader2 className="w-4 h-4 text-accent-secondary animate-spin" />}
          {query && !loading && (
            <button
              onClick={() => setQuery("")}
              className="p-1 hover:bg-white/10 rounded-full text-text-muted hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setIsOpen(false)}
            className="text-xs bg-white/10 hover:bg-white/20 text-text-muted px-2 py-1 rounded-md transition-colors"
          >
            Esc
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border-glass/60 bg-[#0a0b12] text-xs">
          <span className="text-text-muted font-medium mr-1">Filter:</span>
          {(["all", "movie", "tv"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-3 py-1 rounded-full font-medium transition-colors capitalize ${
                filter === t
                  ? "bg-accent-primary text-white"
                  : "bg-surface-glass text-text-muted hover:text-white border border-border-glass"
              }`}
            >
              {t === "all" ? "All Results" : t === "movie" ? "Movies Only" : "TV Series"}
            </button>
          ))}
          <span className="ml-auto text-text-muted text-[11px]">
            {filteredResults.length} found
          </span>
        </div>

        {/* Search Results List */}
        <div className="overflow-y-auto p-3 space-y-2 flex-1">
          {filteredResults.length > 0 ? (
            filteredResults.map((item) => {
              const title = item.title || item.name || "Untitled";
              const releaseYear = (item.release_date || item.first_air_date || "").slice(0, 4);
              const poster = getImageUrl(item.poster_path, "w300");

              return (
                <div
                  key={`${item.media_type}-${item.id}`}
                  onClick={() => handleSelectItem(item)}
                  className="flex items-center gap-3.5 p-2.5 rounded-xl hover:bg-surface-glass-hover border border-transparent hover:border-border-glass cursor-pointer transition-all group"
                >
                  <div className="relative w-12 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-surface-glass border border-white/5">
                    <img
                      src={poster}
                      alt={title}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white group-hover:text-accent-primary transition-colors truncate">
                        {title}
                      </span>
                      {releaseYear && (
                        <span className="text-xs text-text-muted font-normal">
                          ({releaseYear})
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2.5 mt-1 text-xs text-text-muted">
                      <span className="flex items-center gap-1 text-accent-gold font-medium">
                        <Star className="w-3 h-3 fill-accent-gold" />
                        {item.vote_average ? item.vote_average.toFixed(1) : "NR"}
                      </span>
                      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/5 text-[10px] uppercase font-semibold text-text-secondary">
                        {item.media_type === "tv" ? (
                          <>
                            <Tv className="w-2.5 h-2.5 text-accent-secondary" /> TV
                          </>
                        ) : (
                          <>
                            <Film className="w-2.5 h-2.5 text-accent-primary" /> Movie
                          </>
                        )}
                      </span>
                      <span className="text-[10px] font-sinhala text-indigo-300/80 bg-indigo-950/40 px-1.5 py-0.5 rounded border border-indigo-500/20">
                        සිංහල උපසිරැසි
                      </span>
                    </div>

                    {item.overview && (
                      <p className="text-[11px] text-text-muted line-clamp-1 mt-1">
                        {item.overview}
                      </p>
                    )}
                  </div>

                  <ArrowRight className="w-4 h-4 text-text-muted opacity-0 group-hover:opacity-100 group-hover:text-accent-primary transition-all flex-shrink-0 -translate-x-1 group-hover:translate-x-0" />
                </div>
              );
            })
          ) : query && !loading ? (
            <div className="text-center py-12 text-text-muted">
              <Film className="w-10 h-10 mx-auto mb-2 text-text-subtle opacity-40" />
              <p className="text-sm">No titles found matching &ldquo;{query}&rdquo;</p>
              <p className="text-xs text-text-subtle mt-1 font-sinhala">
                වෙනත් නමකින් සොයා බලන්න
              </p>
            </div>
          ) : (
            <div className="text-center py-12 text-text-muted">
              <Search className="w-10 h-10 mx-auto mb-2 text-text-subtle opacity-40" />
              <p className="text-sm">Type any title to instantly search movies and TV series</p>
              <p className="text-xs text-text-subtle mt-1 font-sinhala">
                සිංහල උපසිරැසි සහිත චිත්‍රපට හෝ කතාමාලා සොයන්න
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
