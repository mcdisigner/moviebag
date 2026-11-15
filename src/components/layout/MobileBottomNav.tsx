"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Film, Tv, Bookmark, History, Search } from "lucide-react";
import { useAppStore } from "@/lib/store";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const watchlist = useAppStore((state) => state.watchlist);
  const continueWatching = useAppStore((state) => state.continueWatching);
  const setSearchModalOpen = useAppStore((state) => state.setSearchModalOpen);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems = [
    { label: "Home", href: "/", icon: Compass },
    { label: "Movies", href: "/movies", icon: Film },
    { label: "TV", href: "/tv", icon: Tv },
    {
      label: "Saved",
      href: "/watchlist",
      icon: Bookmark,
      badge: mounted && watchlist.length > 0 ? watchlist.length : null,
    },
    {
      label: "History",
      href: "/continue-watching",
      icon: History,
      badge: mounted && continueWatching.length > 0 ? continueWatching.length : null,
    },
  ];

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 bg-[#070913]/95 backdrop-blur-2xl border-t border-white/10 px-2 py-1.5 md:hidden shadow-2xl safe-area-pb">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
                isActive
                  ? "text-accent-primary font-bold"
                  : "text-text-muted hover:text-white"
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : "stroke-[1.75]"}`} />
                {item.badge && (
                  <span className="absolute -top-1.5 -right-2 bg-accent-primary text-white text-[9px] font-bold px-1 rounded-full min-w-3.5 h-3.5 flex items-center justify-center">
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
            </Link>
          );
        })}

        {/* Search trigger */}
        <button
          type="button"
          onClick={() => setSearchModalOpen(true)}
          className="flex flex-col items-center justify-center py-1 px-2.5 text-text-muted hover:text-white rounded-xl transition-all"
          aria-label="Search"
        >
          <Search className="w-5 h-5 stroke-[1.75]" />
          <span className="text-[10px] mt-0.5 tracking-tight">Search</span>
        </button>
      </div>
    </div>
  );
}
