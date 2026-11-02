import React, { useState, useEffect } from "react";
import { MediaItem, StreamingAccount, StreamingService, CustomChannel, TvGuideSlot, WatchSchedule } from "./types";
import { INITIAL_ACCOUNTS, MOCK_MEDIA_ITEMS } from "./mockData";
import AccountConnector from "./components/AccountConnector";
import RecommendationEngine from "./components/RecommendationEngine";
import ChannelBuilder from "./components/ChannelBuilder";
import ScheduleSynthesizer from "./components/ScheduleSynthesizer";
import Dashboard from "./components/Dashboard";
import WatchlistSection from "./components/WatchlistSection";
import { Layers, Tv, Bookmark, ListMusic, Shield, Sparkles, CheckCircle, RefreshCw, Menu, X, Info } from "lucide-react";

export default function App() {
  // Global State
  const [accounts, setAccounts] = useState<StreamingAccount[]>([]);
  const [watchlist, setWatchlist] = useState<MediaItem[]>([]);
  const [favorites, setFavorites] = useState<MediaItem[]>([]);
  const [customChannels, setCustomChannels] = useState<CustomChannel[]>([]);
  const [schedules, setSchedules] = useState<WatchSchedule[]>([]);
  const [catalog, setCatalog] = useState<MediaItem[]>([]);

  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [isSyncing, setIsSyncing] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [globalBanner, setGlobalBanner] = useState<{ text: string; type: "success" | "info" } | null>(null);

  // Initialize and Sync localStorage on Mount
  useEffect(() => {
    // 1. Accounts
    const localAccs = localStorage.getItem("omni_accounts");
    if (localAccs) {
      setAccounts(JSON.parse(localAccs));
    } else {
      setAccounts(INITIAL_ACCOUNTS);
      localStorage.setItem("omni_accounts", JSON.stringify(INITIAL_ACCOUNTS));
    }

    // 2. Catalog
    setCatalog(MOCK_MEDIA_ITEMS);

    // 3. Watchlist
    const localWatch = localStorage.getItem("omni_watchlist");
    if (localWatch) {
      setWatchlist(JSON.parse(localWatch));
    } else {
      // Pick a few high-quality default saved items to look spectacular right away
      const initialWatch = [MOCK_MEDIA_ITEMS[0], MOCK_MEDIA_ITEMS[3], MOCK_MEDIA_ITEMS[6]];
      setWatchlist(initialWatch);
      localStorage.setItem("omni_watchlist", JSON.stringify(initialWatch));
    }

    // 4. Favorites
    const localFavs = localStorage.getItem("omni_favorites");
    if (localFavs) {
      setFavorites(JSON.parse(localFavs));
    } else {
      const initialFavs = [MOCK_MEDIA_ITEMS[0]];
      setFavorites(initialFavs);
      localStorage.setItem("omni_favorites", JSON.stringify(initialFavs));
    }

    // 5. Custom Channels
    const localChans = localStorage.getItem("omni_channels");
    if (localChans) {
      setCustomChannels(JSON.parse(localChans));
    } else {
      // Create a nice default channel to showcase right away
      const defaultChannel: CustomChannel = {
        id: "default-chan-1",
        name: "Ultimate Sci-Fi & Drama Feed",
        description: "Curated premium dramas and epic space sci-fi blocks programmed continuously.",
        mediaIds: [MOCK_MEDIA_ITEMS[0].id, MOCK_MEDIA_ITEMS[3].id, MOCK_MEDIA_ITEMS[5].id],
        shareCode: "OMNI-X781",
        createdAt: new Date().toISOString(),
      };
      setCustomChannels([defaultChannel]);
      localStorage.setItem("omni_channels", JSON.stringify([defaultChannel]));
    }

    // 6. Synthesized Schedules
    const localScheds = localStorage.getItem("omni_schedules");
    if (localScheds) {
      setSchedules(JSON.parse(localScheds));
    } else {
      setSchedules([]);
    }
  }, []);

  // Sync to local storage helper on state changes
  const saveToLocalStorage = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  const showBanner = (text: string, type: "success" | "info" = "success") => {
    setGlobalBanner({ text, type });
    setTimeout(() => setGlobalBanner(null), 3500);
  };

  // State update handlers
  const handleToggleConnect = (service: StreamingService, profileName: string, email: string) => {
    const updated = accounts.map((acc) => {
      if (acc.service === service) {
        return {
          ...acc,
          connected: !acc.connected,
          profileName: !acc.connected ? profileName : "",
          email: !acc.connected ? email : "",
          lastSync: !acc.connected ? "Just synced" : "Never synchronized",
        };
      }
      return acc;
    });

    setAccounts(updated);
    saveToLocalStorage("omni_accounts", updated);

    const isConnected = updated.find((a) => a.service === service)?.connected;
    if (isConnected) {
      showBanner(`Successfully connected your ${service.toUpperCase()} profile!`);
    } else {
      showBanner(`Disconnected ${service.toUpperCase()} profile. Feed items removed.`, "info");
    }
  };

  const handleSyncAll = () => {
    setIsSyncing(true);
    setTimeout(() => {
      const updated = accounts.map((acc) => {
        if (acc.connected) {
          return {
            ...acc,
            lastSync: "Synced 1m ago",
          };
        }
        return acc;
      });
      setAccounts(updated);
      saveToLocalStorage("omni_accounts", updated);
      setIsSyncing(false);
      showBanner("Successfully synchronized profiles metadata & watch states!");
    }, 2000);
  };

  const handleAddToWatchlist = (item: MediaItem) => {
    if (watchlist.some((w) => w.id === item.id)) {
      showBanner(`"${item.title}" is already in your watchlist.`, "info");
      return;
    }
    const updated = [item, ...watchlist];
    setWatchlist(updated);
    saveToLocalStorage("omni_watchlist", updated);
    showBanner(`Added "${item.title}" to your Watchlist.`);
  };

  const handleRemoveFromWatchlist = (itemId: string) => {
    const removedItem = watchlist.find((w) => w.id === itemId);
    const updated = watchlist.filter((w) => w.id !== itemId);
    setWatchlist(updated);
    saveToLocalStorage("omni_watchlist", updated);

    // Also remove from favorites if it exists
    const updatedFavs = favorites.filter((f) => f.id !== itemId);
    setFavorites(updatedFavs);
    saveToLocalStorage("omni_favorites", updatedFavs);

    if (removedItem) {
      showBanner(`Removed "${removedItem.title}" from your Watchlist.`, "info");
    }
  };

  const handleToggleFavorite = (item: MediaItem) => {
    let updatedFavs;
    if (favorites.some((f) => f.id === item.id)) {
      updatedFavs = favorites.filter((f) => f.id !== item.id);
      showBanner(`Removed "${item.title}" from your Favorites.`, "info");
    } else {
      updatedFavs = [item, ...favorites];
      showBanner(`Added "${item.title}" to your Favorites!`);
      // Also ensure it is in the watchlist
      if (!watchlist.some((w) => w.id === item.id)) {
        const updatedWatch = [item, ...watchlist];
        setWatchlist(updatedWatch);
        saveToLocalStorage("omni_watchlist", updatedWatch);
      }
    }
    setFavorites(updatedFavs);
    saveToLocalStorage("omni_favorites", updatedFavs);
  };

  const handleUpdateProgress = (itemId: string, percentage: number) => {
    const updatedCatalog = catalog.map((item) => {
      if (item.id === itemId && item.currentProgress) {
        return {
          ...item,
          currentProgress: {
            ...item.currentProgress,
            percentage,
            timeCode: `${Math.floor((percentage / 100) * 45)}:00 / 45:00`, // mock update
          },
        };
      }
      return item;
    });
    setCatalog(updatedCatalog);
  };

  const handleNextEpisode = (itemId: string) => {
    const updatedCatalog = catalog.map((item) => {
      if (item.id === itemId && item.currentProgress) {
        const nextEp = item.currentProgress.episode + 1;
        return {
          ...item,
          currentProgress: {
            ...item.currentProgress,
            episode: nextEp,
            episodeTitle: `Chapter ${nextEp}: The Next Dimension`,
            percentage: 0,
            timeCode: "00:00 / 45:00",
            lastWatched: "Just now",
          },
        };
      }
      return item;
    });
    setCatalog(updatedCatalog);
    const item = updatedCatalog.find((i) => i.id === itemId);
    if (item) {
      showBanner(`Playing Next Episode for "${item.title}"!`);
    }
  };

  const handleCreateChannel = (name: string, description: string, mediaIds: string[]) => {
    const randomCode = `OMNI-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const newChan: CustomChannel = {
      id: `chan-${Date.now()}`,
      name,
      description,
      mediaIds,
      shareCode: randomCode,
      createdAt: new Date().toISOString(),
    };
    const updated = [newChan, ...customChannels];
    setCustomChannels(updated);
    saveToLocalStorage("omni_channels", updated);
    showBanner(`Successfully built Live Channel "${name}"!`);
  };

  const handleDeleteChannel = (id: string) => {
    const updated = customChannels.filter((c) => c.id !== id);
    setCustomChannels(updated);
    saveToLocalStorage("omni_channels", updated);
    showBanner("Channel deleted successfully.", "info");
  };

  const handleSaveSchedule = (
    name: string,
    slots: TvGuideSlot[],
    originalShowsCount: number,
    originalMoviesCount: number
  ) => {
    const newSched: WatchSchedule = {
      id: `sched-${Date.now()}`,
      name,
      slots,
      originalShowsCount,
      originalMoviesCount,
      createdDate: new Date().toLocaleDateString(),
    };
    const updated = [newSched, ...schedules];
    setSchedules(updated);
    saveToLocalStorage("omni_schedules", updated);
    showBanner(`Synthesized watch schedule "${name}" successfully!`);
  };

  const handleDeleteSchedule = (id: string) => {
    const updated = schedules.filter((s) => s.id !== id);
    setSchedules(updated);
    saveToLocalStorage("omni_schedules", updated);
    showBanner("Watch schedule deleted.", "info");
  };

  const connectedServices = accounts.filter((a) => a.connected).map((a) => a.service);

  return (
    <div className="min-h-screen bg-[#060608] text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-white">
      {/* GLOWING GRADIENTS BACKGROUND */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-indigo-950/15 via-purple-950/5 to-transparent pointer-events-none -z-20" />

      {/* TOP FLOATING NOTIFICATION BANNER */}
      {globalBanner && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <div className={`px-5 py-3 rounded-xl border shadow-2xl flex items-center gap-2.5 text-xs font-semibold backdrop-blur-md ${
            globalBanner.type === "success"
              ? "bg-emerald-950/80 border-emerald-500/30 text-emerald-300"
              : "bg-indigo-950/80 border-indigo-500/30 text-indigo-300"
          }`}>
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            {globalBanner.text}
          </div>
        </div>
      )}

      {/* NAVBAR */}
      <header className="border-b border-slate-900/80 bg-slate-950/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <Tv className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white bg-clip-text">
                OMNISTREAM
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                AI CORE v3.5
              </span>
            </div>
          </div>

          {/* Desktop Tab Selector */}
          <nav className="hidden lg:flex items-center gap-1">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "dashboard"
                  ? "bg-slate-900 text-indigo-400 font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Unified Feed
            </button>
            <button
              onClick={() => setActiveTab("recommendations")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === "recommendations"
                  ? "bg-slate-900 text-indigo-400 font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              AI Suggester
            </button>
            <button
              onClick={() => setActiveTab("watchlist")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "watchlist"
                  ? "bg-slate-900 text-indigo-400 font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              My Watchlist
            </button>
            <button
              onClick={() => setActiveTab("channels")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "channels"
                  ? "bg-slate-900 text-indigo-400 font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Curate Channels
            </button>
            <button
              onClick={() => setActiveTab("schedule")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "schedule"
                  ? "bg-slate-900 text-indigo-400 font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Schedule Block
            </button>
            <button
              onClick={() => setActiveTab("accounts")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === "accounts"
                  ? "bg-slate-900 text-indigo-400 font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              Accounts ({connectedServices.length})
            </button>
          </nav>

          {/* Mobile Drawer Trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-400 hover:text-white focus:outline-none"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* MOBILE NAV DRAWER */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-16 bg-slate-950/95 backdrop-blur-md z-30 lg:hidden flex flex-col p-4 space-y-2 border-t border-slate-900 animate-fadeIn">
          {[
            { id: "dashboard", label: "Unified Feed" },
            { id: "recommendations", label: "AI Suggester", icon: <Sparkles className="w-4 h-4" /> },
            { id: "watchlist", label: "My Watchlist" },
            { id: "channels", label: "Curate Channels" },
            { id: "schedule", label: "Schedule Block" },
            { id: "accounts", label: `Accounts (${connectedServices.length})`, icon: <Shield className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full p-3 rounded-xl text-left text-xs font-bold flex items-center gap-2 ${
                activeTab === tab.id ? "bg-indigo-600 text-white" : "text-slate-400 hover:bg-slate-900"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {activeTab === "dashboard" && (
          <Dashboard
            watchlist={watchlist}
            favorites={favorites}
            accounts={accounts}
            catalog={catalog}
            onAddToWatchlist={handleAddToWatchlist}
            onToggleFavorite={handleToggleFavorite}
            onUpdateProgress={handleUpdateProgress}
            onNextEpisode={handleNextEpisode}
            onNavigateToTab={setActiveTab}
          />
        )}

        {activeTab === "recommendations" && (
          <RecommendationEngine
            connectedServices={connectedServices}
            watchlist={watchlist}
            favorites={favorites}
            onAddToWatchlist={handleAddToWatchlist}
            onToggleFavorite={handleToggleFavorite}
          />
        )}

        {activeTab === "watchlist" && (
          <WatchlistSection
            watchlist={watchlist}
            favorites={favorites}
            onRemoveFromWatchlist={handleRemoveFromWatchlist}
            onToggleFavorite={handleToggleFavorite}
            onNavigateToTab={setActiveTab}
          />
        )}

        {activeTab === "channels" && (
          <ChannelBuilder
            watchlist={watchlist}
            customChannels={customChannels}
            onCreateChannel={handleCreateChannel}
            onDeleteChannel={handleDeleteChannel}
          />
        )}

        {activeTab === "schedule" && (
          <ScheduleSynthesizer
            watchlist={watchlist}
            schedules={schedules}
            onSaveSchedule={handleSaveSchedule}
            onDeleteSchedule={handleDeleteSchedule}
          />
        )}

        {activeTab === "accounts" && (
          <AccountConnector
            accounts={accounts}
            onToggleConnect={handleToggleConnect}
            onSyncAll={handleSyncAll}
            isSyncing={isSyncing}
          />
        )}
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-950 bg-slate-950/80 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-mono">
          <p>© 2026 OmniStream Core. Real-time broadcast sync enabled.</p>
          <div className="flex gap-4">
            <span>AES-256 Auth Wrapper</span>
            <span>•</span>
            <span>Gemini Text-MIME Protocol</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
