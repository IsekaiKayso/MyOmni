import React, { useState } from "react";
import { MediaItem, StreamingService, StreamingAccount } from "../types";
import { STYLED_SERVICES } from "../mockData";
import { Play, Sparkles, Plus, Clock, Search, Heart, Check, Compass, BookmarkPlus, Layers, Calendar } from "lucide-react";

interface DashboardProps {
  watchlist: MediaItem[];
  favorites: MediaItem[];
  accounts: StreamingAccount[];
  catalog: MediaItem[];
  onAddToWatchlist: (item: MediaItem) => void;
  onToggleFavorite: (item: MediaItem) => void;
  onUpdateProgress: (itemId: string, percentage: number) => void;
  onNextEpisode: (itemId: string) => void;
  onNavigateToTab: (tab: string) => void;
}

export default function Dashboard({
  watchlist,
  favorites,
  accounts,
  catalog,
  onAddToWatchlist,
  onToggleFavorite,
  onUpdateProgress,
  onNextEpisode,
  onNavigateToTab,
}: DashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNetworkFilter, setSelectedNetworkFilter] = useState<string>("all");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>("all");

  const connectedServices = accounts.filter((a) => a.connected).map((a) => a.service);

  // Filter entire catalog to only show items from connected services
  const connectedCatalog = catalog.filter(
    (item) => connectedServices.includes(item.service)
  );

  const continueWatchingItems = connectedCatalog.filter((item) => item.currentProgress);

  const filteredDiscover = connectedCatalog.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.genres.some((g) => g.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesNetwork = selectedNetworkFilter === "all" || item.service === selectedNetworkFilter;
    const matchesType = selectedTypeFilter === "all" || item.type === selectedTypeFilter;

    return matchesSearch && matchesNetwork && matchesType;
  });

  const isFavorited = (item: MediaItem) => favorites.some((f) => f.id === item.id);
  const isWatchlisted = (item: MediaItem) => watchlist.some((w) => w.id === item.id);

  return (
    <div className="space-y-8" id="unified-dashboard">
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            Unified Feed Control
          </h2>
          <p className="text-sm text-slate-400">
            Monitoring active feeds across {connectedServices.length} linked networks.
          </p>
        </div>

        {connectedServices.length === 0 && (
          <div className="bg-amber-500/10 border border-amber-500/20 px-4 py-2.5 rounded-xl flex items-center gap-3 text-xs text-amber-400">
            <span>No services active. Connect accounts to populate feed.</span>
            <button
              onClick={() => onNavigateToTab("accounts")}
              className="font-bold underline hover:text-amber-300"
            >
              Connect Now
            </button>
          </div>
        )}
      </div>

      {/* CONTINUE WATCHING TRACKER */}
      {connectedServices.length > 0 && continueWatchingItems.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            Continue Watching ({continueWatchingItems.length})
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {continueWatchingItems.map((item) => {
              const prog = item.currentProgress!;
              const serviceStyling = STYLED_SERVICES[item.service];

              return (
                <div
                  key={item.id}
                  className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex flex-col justify-between group hover:border-slate-700 transition-all shadow-md"
                >
                  <div className="relative h-28 overflow-hidden bg-slate-900">
                    <img
                      src={item.backdropUrl}
                      alt={item.title}
                      className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent" />

                    <div className="absolute top-2.5 left-2.5">
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

                    <div className="absolute bottom-2.5 left-2.5 right-2.5">
                      <h4 className="font-bold text-sm text-white truncate">{item.title}</h4>
                      <p className="text-[10px] text-slate-400 font-medium truncate">
                        S{prog.season} E{prog.episode}: {prog.episodeTitle}
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 space-y-3 bg-slate-950">
                    {/* Progress Slider */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                        <span>{prog.timeCode}</span>
                        <span>{prog.percentage}% Watched</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={prog.percentage}
                        onChange={(e) => onUpdateProgress(item.id, parseInt(e.target.value))}
                        className="w-full accent-indigo-500 h-1 bg-slate-800 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span>Watched {prog.lastWatched}</span>
                      <button
                        onClick={() => onNextEpisode(item.id)}
                        className="px-2.5 py-1 bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white text-[10px] font-semibold rounded-lg border border-indigo-500/20 transition-all flex items-center gap-1"
                      >
                        <Play className="w-2.5 h-2.5 fill-current" />
                        Play Next Ep
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CATALOG EXPLORATION & DISCOVER */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-900 pb-4">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Compass className="w-3.5 h-3.5 text-indigo-400" />
            Active Catalogs Explorer
          </h3>

          <div className="w-full md:w-auto flex flex-col sm:flex-row items-center gap-3">
            {/* Search */}
            <div className="relative w-full sm:w-60">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search movies, shows, genres..."
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            {/* Network filter */}
            <select
              value={selectedNetworkFilter}
              onChange={(e) => setSelectedNetworkFilter(e.target.value)}
              className="w-full sm:w-auto bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Networks</option>
              {connectedServices.map((service) => (
                <option key={service} value={service}>
                  {STYLED_SERVICES[service]?.name}
                </option>
              ))}
            </select>

            {/* Type filter */}
            <select
              value={selectedTypeFilter}
              onChange={(e) => setSelectedTypeFilter(e.target.value)}
              className="w-full sm:w-auto bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Formats</option>
              <option value="movie">Movies</option>
              <option value="show">TV Shows</option>
            </select>
          </div>
        </div>

        {/* Content display Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredDiscover.map((item) => {
            const serviceStyling = STYLED_SERVICES[item.service];
            const favorited = isFavorited(item);
            const watchlisted = isWatchlisted(item);

            return (
              <div
                key={item.id}
                className="group bg-slate-950/40 border border-slate-850 rounded-xl overflow-hidden flex flex-col justify-between hover:border-slate-700/80 transition-all duration-300"
              >
                {/* Poster/Backdrop view */}
                <div className="relative h-44 overflow-hidden bg-slate-900">
                  <img
                    src={item.backdropUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-70"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                  {/* Network badge */}
                  <div className="absolute top-2.5 left-2.5">
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

                  {/* Rating / Year badge */}
                  <div className="absolute bottom-2.5 right-2.5">
                    <span className="text-[9px] font-mono font-bold bg-slate-900/90 text-slate-300 px-1.5 py-0.5 rounded border border-slate-800/80">
                      {item.releaseYear} • {item.rating}
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <h4 className="font-bold text-sm text-white group-hover:text-indigo-400 transition-colors truncate">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {item.genres.map((g) => (
                        <span
                          key={g}
                          className="text-[9px] bg-slate-900 text-slate-500 px-1.5 py-0.5 rounded border border-slate-850"
                        >
                          {g}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-900/60 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-500">{item.duration}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onToggleFavorite(item)}
                        className={`p-1.5 rounded-lg border transition-all ${
                          favorited
                            ? "bg-rose-500/20 text-rose-400 border-rose-500/30"
                            : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-rose-400"
                        }`}
                        title="Favorite"
                      >
                        <Heart className={`w-3 h-3 ${favorited ? "fill-rose-400" : ""}`} />
                      </button>
                      <button
                        onClick={() => onAddToWatchlist(item)}
                        className={`p-1.5 rounded-lg border transition-all ${
                          watchlisted
                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                            : "bg-indigo-600 hover:bg-indigo-500 text-white border-transparent"
                        }`}
                        title="Add to Watchlist"
                      >
                        {watchlisted ? <Check className="w-3 h-3" /> : <BookmarkPlus className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredDiscover.length === 0 && (
            <div className="col-span-full py-20 text-center bg-slate-950/10 border border-dashed border-slate-850 rounded-2xl">
              <Search className="w-10 h-10 text-slate-700 mx-auto mb-2.5" />
              <p className="text-sm font-semibold text-slate-300">No Content Matches Your Filters</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
                Try connecting more services, clearing your search query, or resetting filters to populate this dashboard view.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
