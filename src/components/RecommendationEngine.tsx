import React, { useState } from "react";
import { MediaItem, StreamingService } from "../types";
import { STYLED_SERVICES } from "../mockData";
import { Sparkles, Heart, BookmarkPlus, Compass, ArrowRight, Loader, HelpCircle, Check, AlertCircle } from "lucide-react";

interface RecommendationEngineProps {
  connectedServices: StreamingService[];
  watchlist: MediaItem[];
  favorites: MediaItem[];
  onAddToWatchlist: (item: MediaItem) => void;
  onToggleFavorite: (item: MediaItem) => void;
}

const GENRES = [
  "Action",
  "Sci-Fi",
  "Comedy",
  "Drama",
  "Mystery",
  "Horror",
  "Thriller",
  "Anime",
  "Adventure",
  "Documentary",
  "Romance",
  "Fantasy",
];

const LOADING_MESSAGES = [
  "Analyzing your connected accounts catalogs...",
  "Cross-referencing your watchlist and favorite vibes...",
  "Consulting the streaming oracle for matches...",
  "Synthesizing ratings and double-checking availability...",
  "Structuring recommendations with high-fidelity detail...",
];

export default function RecommendationEngine({
  connectedServices,
  watchlist,
  favorites,
  onAddToWatchlist,
  onToggleFavorite,
}: RecommendationEngineProps) {
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [customPrompt, setCustomPrompt] = useState("");
  const [recommendations, setRecommendations] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadMsgIdx, setLoadMsgIdx] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const toggleGenre = (genre: string) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter((g) => g !== genre));
    } else {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  const generateRecommendations = async () => {
    if (connectedServices.length === 0) {
      setErrorMsg("Please connect at least one streaming service first in the 'Accounts' tab.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setRecommendations([]);

    // Rotate loading messages for UX
    setLoadMsgIdx(0);
    const interval = setInterval(() => {
      setLoadMsgIdx((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 1800);

    try {
      const response = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          connectedServices,
          favorites: favorites.map((f) => ({ title: f.title, type: f.type, genres: f.genres })),
          genres: selectedGenres,
          promptOverride: customPrompt.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to reach recommendation engine. Check server.");
      }

      const data = await response.json();
      if (data.recommendations) {
        setRecommendations(data.recommendations);
      } else {
        throw new Error("No recommendations returned.");
      }
    } catch (error: any) {
      console.error(error);
      setErrorMsg(error.message || "An error occurred while generating recommendations.");
    } finally {
      clearInterval(interval);
      setIsLoading(false);
    }
  };

  const isFavorited = (item: MediaItem) => favorites.some((f) => f.title.toLowerCase() === item.title.toLowerCase());
  const isWatchlisted = (item: MediaItem) => watchlist.some((w) => w.title.toLowerCase() === item.title.toLowerCase());

  return (
    <div className="space-y-8" id="recommendation-engine">
      {/* Intro Panel */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-950/40 via-purple-950/10 to-slate-950 border border-indigo-900/40 rounded-2xl p-6 md:p-8">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl -z-10" />

        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 rounded-full border border-indigo-500/20 text-xs font-semibold text-indigo-300">
            <Sparkles className="w-3.5 h-3.5" />
            AI-POWERED RECOMMENDATIONS
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight leading-tight">
            Cross-Service Entertainment intelligence
          </h2>
          <p className="text-sm md:text-base text-slate-300 leading-relaxed">
            Our AI scanner reads across all 8 supported catalogs (including premium subscribers like Netflix, Prime, Shudder, and free accounts like Tubi & YouTube). It suggests movies and shows catering to your custom mood or favorite genre pairings.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Controls Panel */}
        <div className="lg:col-span-1 bg-slate-950/40 border border-slate-800 rounded-2xl p-5 space-y-6 backdrop-blur-md">
          <h3 className="text-base font-semibold text-white border-b border-slate-900 pb-3 flex items-center gap-2">
            <Compass className="w-4 h-4 text-violet-400" />
            Vibe Tuning
          </h3>

          {/* Connected Services Alert */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400">Target Services ({connectedServices.length})</span>
            <div className="flex flex-wrap gap-1.5">
              {connectedServices.map((service) => (
                <span
                  key={service}
                  className="text-[10px] font-bold px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700/50"
                >
                  {STYLED_SERVICES[service]?.name}
                </span>
              ))}
              {connectedServices.length === 0 && (
                <span className="text-xs text-amber-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> No services connected!
                </span>
              )}
            </div>
          </div>

          {/* Genres selection */}
          <div className="space-y-2.5">
            <span className="text-xs font-semibold text-slate-400">Preferred Genre Pairings</span>
            <div className="grid grid-cols-2 gap-1.5">
              {GENRES.map((genre) => {
                const active = selectedGenres.includes(genre);
                return (
                  <button
                    key={genre}
                    onClick={() => toggleGenre(genre)}
                    className={`text-left text-xs px-2.5 py-1.5 rounded-xl border transition-all ${
                      active
                        ? "bg-indigo-600/20 text-indigo-300 border-indigo-500/40 font-medium"
                        : "bg-slate-900/40 text-slate-400 border-slate-800/40 hover:text-slate-200"
                    }`}
                  >
                    {genre}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom prompt override */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
              Custom Prompt
              <span className="text-[10px] text-slate-600">(Optional)</span>
            </span>
            <textarea
              rows={3}
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="e.g. Gritty 80s cyber-thrillers, or family comedy to watch on rainy sunday..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
            />
          </div>

          <button
            onClick={generateRecommendations}
            disabled={isLoading || connectedServices.length === 0}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-medium rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/10 transition-all"
          >
            {isLoading ? (
              <>
                <Loader className="w-4.5 h-4.5 animate-spin" />
                Synthesizing suggestions...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-violet-300" />
                Generate AI Picks
              </>
            )}
          </button>
        </div>

        {/* Results Area */}
        <div className="lg:col-span-2 space-y-4 min-h-[350px] flex flex-col justify-start">
          {isLoading && (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-4 bg-slate-950/20 border border-slate-800/50 rounded-2xl backdrop-blur-sm">
              <div className="relative flex items-center justify-center">
                <div className="absolute w-12 h-12 rounded-full border-4 border-indigo-500/10 border-t-indigo-500 animate-spin" />
                <Sparkles className="w-6 h-6 text-indigo-400 animate-pulse" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-white">Generating Personalized AI Suggestion Grid</p>
                <p className="text-xs text-indigo-400 font-mono tracking-wide animate-pulse">
                  {LOADING_MESSAGES[loadMsgIdx]}
                </p>
              </div>
            </div>
          )}

          {!isLoading && recommendations.length === 0 && !errorMsg && (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-4 bg-slate-950/10 border border-dashed border-slate-800/60 rounded-2xl">
              <Compass className="w-10 h-10 text-slate-600" />
              <div className="space-y-1 max-w-sm">
                <p className="text-sm font-semibold text-slate-300">Discover Queue is Empty</p>
                <p className="text-xs text-slate-500">
                  Select your active services, choose genres, or add customized prompts, then click "Generate AI Picks" to fetch recommendations.
                </p>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-3 bg-red-950/10 border border-red-900/30 rounded-2xl text-red-400">
              <AlertCircle className="w-8 h-8" />
              <p className="text-sm font-semibold">Discovery Service Error</p>
              <p className="text-xs max-w-sm text-slate-400 leading-relaxed">{errorMsg}</p>
            </div>
          )}

          {!isLoading && recommendations.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-semibold text-slate-400">Generated AI Recommendations</span>
                <span className="text-[10px] text-slate-500">Powered by Gemini 3.5 Flash</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendations.map((item) => {
                  const serviceStyling = STYLED_SERVICES[item.service];
                  const favorited = isFavorited(item);
                  const watchlisted = isWatchlisted(item);

                  return (
                    <div
                      key={item.id}
                      className="group bg-slate-950 border border-slate-800/80 rounded-xl overflow-hidden flex flex-col justify-between hover:border-slate-700/80 transition-all duration-300 shadow-xl"
                    >
                      {/* Image header with overlay */}
                      <div className="relative h-40 overflow-hidden bg-slate-900">
                        <img
                          src={item.backdropUrl}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-60"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                        {/* Top corner actions */}
                        <div className="absolute top-3 left-3">
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded border tracking-wider"
                            style={{
                              backgroundColor: `${serviceStyling?.brandColor}20`,
                              borderColor: `${serviceStyling?.brandColor}40`,
                              color: serviceStyling?.brandColor,
                            }}
                          >
                            {serviceStyling?.name}
                          </span>
                        </div>

                        <div className="absolute top-3 right-3 flex items-center gap-1.5">
                          <button
                            onClick={() => onToggleFavorite(item)}
                            className={`p-1.5 rounded-lg border transition-all ${
                              favorited
                                ? "bg-rose-500/20 text-rose-400 border-rose-500/30"
                                : "bg-slate-950/60 text-slate-400 border-slate-800 hover:text-rose-400"
                            }`}
                            title="Favorite Item"
                          >
                            <Heart className={`w-3.5 h-3.5 ${favorited ? "fill-rose-400" : ""}`} />
                          </button>
                          <button
                            onClick={() => onAddToWatchlist(item)}
                            className={`p-1.5 rounded-lg border transition-all ${
                              watchlisted
                                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                : "bg-slate-950/60 text-slate-400 border-slate-800 hover:text-emerald-400"
                            }`}
                            title="Add to Watchlist"
                          >
                            {watchlisted ? <Check className="w-3.5 h-3.5" /> : <BookmarkPlus className="w-3.5 h-3.5" />}
                          </button>
                        </div>

                        {/* Year & Rating info */}
                        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                          <h4 className="font-bold text-white text-base leading-tight truncate mr-2">
                            {item.title}
                          </h4>
                          <span className="shrink-0 text-[10px] font-mono text-slate-300 bg-slate-900/80 px-1.5 py-0.5 rounded">
                            {item.releaseYear} • {item.rating}
                          </span>
                        </div>
                      </div>

                      {/* Info body */}
                      <div className="p-4 space-y-3.5 flex-1 flex flex-col justify-between">
                        <div className="space-y-2">
                          <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                            {item.description}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {item.genres.map((g) => (
                              <span
                                key={g}
                                className="text-[9px] font-medium bg-slate-900 text-slate-400 px-2 py-0.5 rounded border border-slate-800/60"
                              >
                                {g}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-900 flex items-center justify-between text-[11px] font-mono text-slate-500">
                          <span>{item.duration}</span>
                          <span className="text-amber-400 font-semibold">★ {item.ratingScore.toFixed(1)}/10</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
