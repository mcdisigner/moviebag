"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  Film,
  Tv,
  Bookmark,
  History,
  Sparkles,
  Compass,
  Layers,
  ChevronDown,
  ChevronRight,
  X,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { MOVIE_GENRES, TV_GENRES } from "@/lib/tmdb";

export default function Navbar() {
  const pathname = usePathname();
  const setSearchModalOpen = useAppStore((state) => state.setSearchModalOpen);
  const watchlist = useAppStore((state) => state.watchlist);
  const continueWatching = useAppStore((state) => state.continueWatching);

  const [scrolled, setScrolled] = useState(false);
  const [genresOpen, setGenresOpen] = useState(false);
  const [genreTab, setGenreTab] = useState<"movie" | "tv">("movie");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Global Ctrl+K shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchModalOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setSearchModalOpen]);

  // Handle outside click & escape key to close Genres dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setGenresOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setGenresOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Auto-close dropdown when navigating
  useEffect(() => {
    setGenresOpen(false);
  }, [pathname]);

  const navLinks = [
    { label: "Home", href: "/", icon: Compass },
    { label: "Movies", href: "/movies", icon: Film },
    { label: "TV Series", href: "/tv", icon: Tv },
    {
      label: "Watchlist",
      href: "/watchlist",
      icon: Bookmark,
      badge: watchlist.length > 0 ? watchlist.length : null,
    },
    {
      label: "Continue",
      href: "/continue-watching",
      icon: History,
      badge: continueWatching.length > 0 ? continueWatching.length : null,
    },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#050508]/85 backdrop-blur-xl border-b border-border-glass py-3 shadow-2xl"
          : "bg-gradient-to-b from-[#050508]/90 via-[#050508]/40 to-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-accent-primary via-red-600 to-indigo-700 p-0.5 shadow-lg shadow-accent-primary/25 transition-transform group-hover:scale-105">
            <div className="w-full h-full bg-[#090B12] rounded-[10px] flex items-center justify-center">
              <Film className="w-5 h-5 text-accent-primary transition-transform group-hover:rotate-12" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
              Movie<span className="text-accent-primary">Bag</span>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gradient-to-r from-accent-primary/20 to-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                CineLanka
              </span>
            </span>
            <span className="text-[10px] text-text-muted font-sinhala tracking-wider">
              සිංහල උපසිරැසි Hub
            </span>
          </div>
        </Link>

        {/* Navigation Items (Desktop) */}
        <nav className="hidden md:flex items-center gap-1 bg-surface-glass border border-border-glass px-3 py-1.5 rounded-full backdrop-blur-lg">
          {navLinks.slice(0, 3).map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative px-4 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                  isActive
                    ? "bg-accent-primary text-white shadow-md shadow-accent-primary/30"
                    : "text-text-muted hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}

          {/* Genres Dropdown Container */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setGenresOpen((prev) => !prev)}
              aria-expanded={genresOpen}
              className={`relative px-3.5 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
                genresOpen || (typeof window !== "undefined" && window.location.search.includes("genre"))
                  ? "bg-accent-primary/20 text-white border border-accent-primary/40 shadow-sm"
                  : "text-text-muted hover:text-white hover:bg-white/5"
              }`}
            >
              <Layers className="w-4 h-4 text-accent-primary" />
              <span>Genres</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  genresOpen ? "rotate-180 text-accent-primary" : "text-text-muted"
                }`}
              />
            </button>

            {/* Dropdown Popover */}
            {genresOpen && (
              <div className="fixed inset-x-3 top-20 sm:inset-x-auto sm:top-full sm:mt-2.5 sm:left-1/2 sm:-translate-x-1/2 w-auto sm:w-[420px] bg-[#0c0f1e]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                {/* Switcher & Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                  <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
                    <button
                      type="button"
                      onClick={() => setGenreTab("movie")}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                        genreTab === "movie"
                          ? "bg-accent-primary text-white shadow-sm"
                          : "text-text-muted hover:text-white"
                      }`}
                    >
                      <Film className="w-3.5 h-3.5" />
                      <span>Movies ({MOVIE_GENRES.length})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setGenreTab("tv")}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                        genreTab === "tv"
                          ? "bg-accent-secondary text-white shadow-sm"
                          : "text-text-muted hover:text-white"
                      }`}
                    >
                      <Tv className="w-3.5 h-3.5" />
                      <span>TV Series ({TV_GENRES.length})</span>
                    </button>
                  </div>

                  <button
                    onClick={() => setGenresOpen(false)}
                    className="text-text-muted hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
                    aria-label="Close genres"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Genres Grid */}
                <div className="grid grid-cols-2 gap-1.5 max-h-[290px] overflow-y-auto pr-1">
                  {(genreTab === "movie" ? MOVIE_GENRES : TV_GENRES).map((genre) => (
                    <Link
                      key={genre.id}
                      href={`/${genreTab === "movie" ? "movies" : "tv"}?genre=${
                        genre.id
                      }&name=${encodeURIComponent(genre.name)}`}
                      onClick={() => setGenresOpen(false)}
                      className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/[0.03] hover:bg-accent-primary/15 hover:border-accent-primary/30 border border-transparent transition-all group"
                    >
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-semibold text-text-primary group-hover:text-white truncate">
                          {genre.name}
                        </span>
                        <span className="text-[10px] text-text-muted font-sinhala truncate group-hover:text-indigo-300">
                          {genre.sinhala}
                        </span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-text-muted group-hover:text-accent-primary transition-all shrink-0 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5" />
                    </Link>
                  ))}
                </div>

                {/* Bottom Footer Link */}
                <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px] text-text-muted px-1">
                  <span className="font-sinhala text-[10px] text-text-muted">කාණ්ඩ අනුව තෝරන්න</span>
                  <Link
                    href={genreTab === "movie" ? "/movies" : "/tv"}
                    onClick={() => setGenresOpen(false)}
                    className="text-accent-primary hover:underline font-semibold"
                  >
                    Browse All {genreTab === "movie" ? "Movies" : "TV"} &rarr;
                  </Link>
                </div>
              </div>
            )}
          </div>

          {navLinks.slice(3).map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative px-4 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                  isActive
                    ? "bg-accent-primary text-white shadow-md shadow-accent-primary/30"
                    : "text-text-muted hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive ? "bg-white text-accent-primary" : "bg-accent-primary text-white"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Action Controls & Search Modal Trigger */}
        <div className="flex items-center gap-2.5">
          {/* Mobile Genres Button */}
          <button
            onClick={() => setGenresOpen((prev) => !prev)}
            aria-label="Filter by category"
            className="md:hidden flex items-center gap-1.5 bg-surface-glass hover:bg-surface-glass-hover border border-border-glass text-text-muted hover:text-white px-3 py-2 rounded-full transition-all text-xs font-medium backdrop-blur-lg"
          >
            <Layers className="w-4 h-4 text-accent-primary" />
            <span>Genres</span>
          </button>

          <button
            onClick={() => setSearchModalOpen(true)}
            aria-label="Search movies and series"
            className="flex items-center gap-3 bg-surface-glass hover:bg-surface-glass-hover border border-border-glass hover:border-white/20 text-text-muted hover:text-white px-3.5 py-2 rounded-full transition-all backdrop-blur-lg group shadow-md"
          >
            <Search className="w-4 h-4 group-hover:text-accent-primary transition-colors" />
            <span className="text-xs text-text-muted group-hover:text-white hidden sm:inline">
              Search movies, series...
            </span>
            <span className="text-[10px] font-semibold bg-white/10 px-2 py-0.5 rounded-md border border-white/10 text-text-secondary">
              Ctrl K
            </span>
          </button>

          {/* Sinhala Subtitle Indicator Pill */}
          <div className="hidden lg:flex items-center gap-1.5 bg-gradient-to-r from-indigo-950/60 to-purple-950/60 border border-indigo-500/20 px-3 py-1.5 rounded-full text-xs text-indigo-200 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-accent-gold animate-pulse" />
            <span className="font-sinhala font-medium text-[11px]">SubDL & Baiscope සහාය</span>
          </div>
        </div>
      </div>
    </header>
  );
}
