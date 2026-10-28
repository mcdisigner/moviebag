"use client";

import React, { useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Flame,
  Tv,
  Trophy,
  Rocket,
  Sparkles,
  Film,
} from "lucide-react";
import { MediaItem } from "@/types/tmdb";
import MediaCard from "./MediaCard";

interface MediaRowProps {
  title: string;
  sinhalaTitle?: string;
  icon?: "flame" | "tv" | "trophy" | "rocket" | "sparkles" | "film" | string;
  items: MediaItem[];
}

export default function MediaRow({
  title,
  sinhalaTitle,
  icon,
  items,
}: MediaRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollAmount = clientWidth * 0.75;
      rowRef.current.scrollTo({
        left: direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const renderIcon = () => {
    switch (icon) {
      case "flame":
        return <Flame className="w-4 h-4" />;
      case "tv":
        return <Tv className="w-4 h-4" />;
      case "trophy":
        return <Trophy className="w-4 h-4" />;
      case "rocket":
        return <Rocket className="w-4 h-4" />;
      case "sparkles":
        return <Sparkles className="w-4 h-4" />;
      case "film":
      default:
        return <Film className="w-4 h-4" />;
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <section className="relative py-4 my-2 group/row">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Row Header */}
        <div className="flex items-end justify-between mb-4">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="w-8 h-8 rounded-lg bg-surface-glass border border-border-glass flex items-center justify-center text-accent-primary">
                {renderIcon()}
              </div>
            )}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                {title}
              </h2>
              {sinhalaTitle && (
                <p className="text-xs text-text-muted font-sinhala">{sinhalaTitle}</p>
              )}
            </div>
          </div>

          {/* Navigation Scroll Arrows */}
          <div className="flex items-center gap-2 opacity-90 sm:opacity-0 group-hover/row:opacity-100 transition-opacity">
            <button
              onClick={() => scroll("left")}
              aria-label="Scroll left"
              className="p-2 rounded-full bg-surface-glass hover:bg-surface-glass-hover border border-border-glass text-text-muted hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll("right")}
              aria-label="Scroll right"
              className="p-2 rounded-full bg-surface-glass hover:bg-surface-glass-hover border border-border-glass text-text-muted hover:text-white transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Horizontal Carousel */}
        <div
          ref={rowRef}
          className="flex items-start gap-4 sm:gap-6 overflow-x-auto no-scrollbar scroll-smooth py-2 px-1"
        >
          {items.map((item) => (
            <MediaCard key={`${item.media_type || "m"}-${item.id}`} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
