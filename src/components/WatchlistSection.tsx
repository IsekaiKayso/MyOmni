import React, { useState } from "react";
import { MediaItem, StreamingService } from "../types";
import { STYLED_SERVICES } from "../mockData";
import { Heart, Trash2, ArrowUpRight, Tv, Bookmark, Filter, Check, Star, Play } from "lucide-react";

interface WatchlistSectionProps {
  watchlist: MediaItem[];
  favorites: MediaItem[];
  onRemoveFromWatchlist: (itemId: string) => void;
  onToggleFavorite: (item: MediaItem) => void;
  onNavigateToTab: (tab: string) => void;
}

export default function WatchlistSection({
  watchlist,
  favorites,
  onRemoveFromWatchlist,
  onToggleFavorite,
  onNavigateToTab,
}: WatchlistSectionProps) {
  const [activeFilter, setActiveFilter] = useState<"all" | "favorites">("all");
  const [selectedServiceFilter, setSelectedServiceFilter] = useState<string>("all");

  const displayedList = watchlist.filter((item) => {
    const matchesFav = activeFilter === "all" || favorites.some((f) => f.id === item.id);
    const matchesService = selectedServiceFilter === "all" || item.service === selectedServiceFilter;
    return matchesFav && matchesService;
  });

  const isFavorited = (item: MediaItem) => favorites.some((f) => f.id === item.id);

  return (
    <div className="space-y-8" id="watchlist-section">
      {/* Top Controls Bar */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 backdrop-blur-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-semibold text-white">Cross-Platform Watchlist</h2>
          </div>
          <p className="text-sm text-slate-400 max-w-xl">
            Review, organize, and filter all saved shows and movies across connected streaming services.
          </p>
        </div>

        {/* Create Your Own Channel Quick Action */}
        <button
          onClick={() => onNavigateToTab("channels")}
          className="w-full md:w-auto px-5 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2.5 shadow-lg shadow-indigo-600/15 transition-all text-sm"
        >
          <Tv className="w-4.5 h-4.5" />
          Create Your Own Channel
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-900 pb-4">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveFilter("all")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
              activeFilter === "all"
                ? "bg-slate-200 text-slate-950 border-white"
                : "bg-slate-950/40 text-slate-400 border-slate-800/40 hover:text-slate-200"
            }`}
          >
            All Saved ({watchlist.length})
          </button>
          <button
            onClick={() => setActiveFilter("favorites")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
              activeFilter === "favorites"
                ? "bg-rose-600/20 text-rose-300 border-rose-500/40"
                : "bg-slate-950/40 text-slate-400 border-slate-800/40 hover:text-slate-200"
            }`}
          >
            <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-500/10" />
            My Favorites ({favorites.length})
          </button>
        </div>

        {/* Network Filtering */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <select
            value={selectedServiceFilter}
            onChange={(e) => setSelectedServiceFilter(e.target.value)}
            className="w-full sm:w-auto bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">Filter by Network</option>
            {Array.from(new Set(watchlist.map((w) => w.service))).map((service) => (
              <option key={service} value={service}>
                {STYLED_SERVICES[service]?.name || service}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Saved Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {displayedList.map((item) => {
          const serviceStyling = STYLED_SERVICES[item.service];
          const favorited = isFavorited(item);

          return (
            <div
              key={item.id}
              className="group bg-slate-950 border border-slate-900 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-slate-800 transition-all duration-300 shadow-xl"
            >
              {/* Back backdrop image */}
              <div className="relative h-40 overflow-hidden bg-slate-900">
                <img
                  src={item.backdropUrl}
                  alt={item.title}
                  className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent" />

                {/* Left corner network tag */}
                <div className="absolute top-3.5 left-3.5">
                  <span
                    className="text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider"
                    style={{
                      backgroundColor: `${serviceStyling?.brandColor}20`,
                      borderColor: `${serviceStyling?.brandColor}40`,
                      color: serviceStyling?.brandColor,
                    }}
                  >
                    {serviceStyling?.name}
                  </span>
                </div>

                {/* Actions overlay */}
                <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5">
                  <button
                    onClick={() => onToggleFavorite(item)}
                    className={`p-1.5 rounded-lg border transition-all ${
                      favorited
                        ? "bg-rose-500/20 text-rose-400 border-rose-500/30"
                        : "bg-slate-950/60 text-slate-400 border-slate-850 hover:text-rose-400"
                    }`}
                    title="Mark Favorite"
                  >
                    <Heart className={`w-3.5 h-3.5 ${favorited ? "fill-rose-400" : ""}`} />
                  </button>
                  <button
                    onClick={() => onRemoveFromWatchlist(item.id)}
                    className="p-1.5 rounded-lg border bg-slate-950/60 text-slate-400 border-slate-850 hover:text-red-400 hover:border-red-500/30 transition-all"
                    title="Remove from Watchlist"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Title overlay */}
                <div className="absolute bottom-3.5 left-3.5 right-3.5 flex items-end justify-between">
                  <h3 className="font-bold text-white text-base leading-tight truncate mr-2">
                    {item.title}
                  </h3>
                  <span className="shrink-0 text-[10px] font-mono text-slate-300 bg-slate-900/80 px-1.5 py-0.5 rounded">
                    {item.releaseYear} • {item.rating}
                  </span>
                </div>
              </div>

              {/* Information body */}
              <div className="p-4 space-y-3.5 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {item.genres.map((g) => (
                      <span
                        key={g}
                        className="text-[9px] bg-slate-900 text-slate-500 px-2 py-0.5 rounded border border-slate-850"
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-900 flex items-center justify-between text-[11px] font-mono text-slate-500">
                  <span>{item.duration}</span>
                  <div className="flex items-center gap-1 font-semibold text-amber-400">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    {item.ratingScore.toFixed(1)}/10
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {displayedList.length === 0 && (
          <div className="col-span-full py-24 text-center bg-slate-950/10 border border-dashed border-slate-800 rounded-2xl">
            <Bookmark className="w-10 h-10 text-slate-600 mx-auto mb-2.5" />
            <p className="text-sm font-semibold text-slate-300">Watchlist Queue is Empty</p>
            <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1 leading-relaxed">
              {activeFilter === "favorites"
                ? "You haven't marked any of your watchlist entries as favorites yet. Click the heart icon on any program card!"
                : "No saved shows or movies matching your filter. Browse the 'Dashboard' feed and click add to populate your queue."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
