import React, { useState, useEffect } from "react";
import { MediaItem, StreamingService, CustomChannel, TvGuideSlot } from "../types";
import { STYLED_SERVICES, MOCK_MEDIA_ITEMS } from "../mockData";
import { Tv, Radio, Plus, Share2, Calendar, Clock, Play, Trash2, ArrowRight, CheckCircle, Info } from "lucide-react";

interface ChannelBuilderProps {
  watchlist: MediaItem[];
  customChannels: CustomChannel[];
  onCreateChannel: (name: string, description: string, mediaIds: string[]) => void;
  onDeleteChannel: (id: string) => void;
}

export default function ChannelBuilder({
  watchlist,
  customChannels,
  onCreateChannel,
  onDeleteChannel,
}: ChannelBuilderProps) {
  const [showCreator, setShowCreator] = useState(false);
  const [channelName, setChannelName] = useState("");
  const [channelDescription, setChannelDescription] = useState("");
  const [selectedService, setSelectedService] = useState<StreamingService | "all">("all");
  const [selectedMediaIds, setSelectedMediaIds] = useState<string[]>([]);
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const [generatedGuide, setGeneratedGuide] = useState<TvGuideSlot[]>([]);
  const [copiedChannelId, setCopiedChannelId] = useState<string | null>(null);

  // Available candidate items from either Watchlist or the default mock catalog for depth
  const allMediaCandidates = Array.from(
    new Map(
      [...MOCK_MEDIA_ITEMS, ...watchlist].map((item) => [item.id, item])
    ).values()
  );

  // Filter media items based on selected service
  const filteredCandidates = allMediaCandidates.filter(
    (item) => selectedService === "all" || item.service === selectedService
  );

  // Auto-select active channel on mount or creation
  useEffect(() => {
    if (customChannels.length > 0 && !activeChannelId) {
      setActiveChannelId(customChannels[0].id);
    }
  }, [customChannels]);

  // Generate TV Guide slots when active channel changes
  useEffect(() => {
    if (activeChannelId) {
      const channel = customChannels.find((c) => c.id === activeChannelId);
      if (channel) {
        setGeneratedGuide(assembleTvGuide(channel.mediaIds));
      } else {
        setGeneratedGuide([]);
      }
    } else {
      setGeneratedGuide([]);
    }
  }, [activeChannelId, customChannels]);

  const handleToggleSelect = (id: string) => {
    if (selectedMediaIds.includes(id)) {
      setSelectedMediaIds(selectedMediaIds.filter((mId) => mId !== id));
    } else {
      setSelectedMediaIds([...selectedMediaIds, id]);
    }
  };

  const handleSelectAllFiltered = () => {
    const filterIds = filteredCandidates.map((c) => c.id);
    const allSelectedAlready = filterIds.every((id) => selectedMediaIds.includes(id));

    if (allSelectedAlready) {
      setSelectedMediaIds(selectedMediaIds.filter((id) => !filterIds.includes(id)));
    } else {
      setSelectedMediaIds(Array.from(new Set([...selectedMediaIds, ...filterIds])));
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!channelName.trim()) return;
    if (selectedMediaIds.length === 0) {
      alert("Please select at least 1 show or movie to program your channel.");
      return;
    }

    onCreateChannel(channelName, channelDescription, selectedMediaIds);
    setChannelName("");
    setChannelDescription("");
    setSelectedMediaIds([]);
    setShowCreator(false);
  };

  const copyShareCode = (channel: CustomChannel) => {
    const shareText = `Tune in to my custom OmniStream TV channel "${channel.name}" using Share Code: [ ${channel.shareCode} ]!`;
    navigator.clipboard.writeText(shareText);
    setCopiedChannelId(channel.id);
    setTimeout(() => setCopiedChannelId(null), 2000);
  };

  // Algorithm to structure a 24-hour linear TV guide starting from 8:00 AM
  const assembleTvGuide = (mediaIds: string[]): TvGuideSlot[] => {
    const items = allMediaCandidates.filter((i) => mediaIds.includes(i.id));
    if (items.length === 0) return [];

    const slots: TvGuideSlot[] = [];
    let currentHour = 8;
    let currentMinute = 0;

    const BUMPERS = [
      { title: "Retro Ads & Interstitial Break", duration: "5m", desc: "Classic 80s commercial reels and promo bumpers." },
      { title: "Streaming Trivia Break", duration: "10m", desc: "Test your entertainment knowledge before the next program begins." },
      { title: "OmniStream Logo Loop", duration: "5m", desc: "Enjoy our signature synthwave aesthetic break." },
    ];

    // Build schedules sequentially up to 24 hours (1440 minutes)
    let totalMinutesScheduled = 0;
    let itemIndex = 0;

    while (totalMinutesScheduled < 1440) {
      const item = items[itemIndex % items.length];
      itemIndex++;

      // Formulate timing string
      const ampm = currentHour >= 12 ? "PM" : "AM";
      const displayHour = currentHour % 12 === 0 ? 12 : currentHour % 12;
      const displayMinute = currentMinute.toString().padStart(2, "0");
      const timeStr = `${displayHour}:${displayMinute} ${ampm}`;

      // Show/Movie Duration
      let itemDurationInMinutes = 45; // Default for TV
      if (item.type === "movie") {
        itemDurationInMinutes = 120; // 2 hours
      }

      slots.push({
        id: `slot-${slots.length}`,
        time: timeStr,
        title: item.title,
        type: item.type,
        duration: item.duration,
        service: item.service,
        description: item.description,
        subtitle: item.type === "show" ? "S1: Episode Showcase" : "Feature Presentation",
        thumbnailUrl: item.posterUrl,
      });

      // Advance clock
      currentMinute += itemDurationInMinutes;
      currentHour += Math.floor(currentMinute / 60);
      currentMinute %= 60;
      currentHour %= 24;
      totalMinutesScheduled += itemDurationInMinutes;

      // Add a bumper / commercial slot if there is time left to break monotony
      if (totalMinutesScheduled < 1440) {
        const bampm = currentHour >= 12 ? "PM" : "AM";
        const bdisplayHour = currentHour % 12 === 0 ? 12 : currentHour % 12;
        const bdisplayMinute = currentMinute.toString().padStart(2, "0");
        const btimeStr = `${bdisplayHour}:${bdisplayMinute} ${bampm}`;

        const randomBumper = BUMPERS[slots.length % BUMPERS.length];
        const bumperDur = parseInt(randomBumper.duration);

        slots.push({
          id: `slot-bumper-${slots.length}`,
          time: btimeStr,
          title: randomBumper.title,
          type: "bumper",
          duration: randomBumper.duration,
          service: "omnistream",
          description: randomBumper.desc,
        });

        currentMinute += bumperDur;
        currentHour += Math.floor(currentMinute / 60);
        currentMinute %= 60;
        currentHour %= 24;
        totalMinutesScheduled += bumperDur;
      }
    }

    return slots;
  };

  const activeChannel = customChannels.find((c) => c.id === activeChannelId);

  return (
    <div className="space-y-8" id="channel-builder">
      {/* Header Info */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 backdrop-blur-md">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Tv className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-semibold text-white">Create Your Own Channel</h2>
          </div>
          <p className="text-sm text-slate-400 max-w-xl">
            Curate shows and movies from your watchlist or library into custom linear TV feeds. Assign a service, generate customized TV Guides, and export share codes.
          </p>
        </div>
        {!showCreator && (
          <button
            onClick={() => setShowCreator(true)}
            className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/15 transition-all"
          >
            <Plus className="w-4.5 h-4.5" />
            Synthesize New Channel
          </button>
        )}
      </div>

      {/* Dynamic Form Creator */}
      {showCreator && (
        <form onSubmit={handleCreateSubmit} className="bg-slate-950 border border-indigo-900/40 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-900 pb-3">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-indigo-400" />
              Channel Programming Console
            </h3>
            <button
              type="button"
              onClick={() => setShowCreator(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Channel Name</label>
                <input
                  type="text"
                  required
                  value={channelName}
                  onChange={(e) => setChannelName(e.target.value)}
                  placeholder="e.g., Saturday Morning Cartoons, Nightmare Alley TV"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 px-3.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Description</label>
                <textarea
                  rows={3}
                  required
                  value={channelDescription}
                  onChange={(e) => setChannelDescription(e.target.value)}
                  placeholder="What should viewers expect on this customized stream?"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 block">Filter Library by Network</label>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedService("all")}
                    className={`text-[11px] px-3 py-1.5 rounded-lg border transition-all ${
                      selectedService === "all"
                        ? "bg-slate-200 text-slate-950 border-white font-medium"
                        : "bg-slate-900 text-slate-400 border-slate-800"
                    }`}
                  >
                    All Services
                  </button>
                  {Object.keys(STYLED_SERVICES).map((service) => (
                    <button
                      key={service}
                      type="button"
                      onClick={() => setSelectedService(service as StreamingService)}
                      className={`text-[11px] px-3 py-1.5 rounded-lg border transition-all ${
                        selectedService === service
                          ? "bg-slate-200 text-slate-950 border-white font-medium"
                          : "bg-slate-900 text-slate-400 border-slate-800"
                      }`}
                    >
                      {STYLED_SERVICES[service].name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Selection Grid */}
            <div className="space-y-3 flex flex-col h-full">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">
                  Select Shows & Movies ({selectedMediaIds.length} chosen)
                </label>
                <button
                  type="button"
                  onClick={handleSelectAllFiltered}
                  className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold"
                >
                  Toggle All Service Candidates
                </button>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 h-52 overflow-y-auto space-y-1.5 scrollbar-thin">
                {filteredCandidates.map((item) => {
                  const isChecked = selectedMediaIds.includes(item.id);
                  const serviceStyling = STYLED_SERVICES[item.service];
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleToggleSelect(item.id)}
                      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${
                        isChecked
                          ? "bg-indigo-600/10 border border-indigo-500/30 text-white"
                          : "bg-slate-950/40 border border-transparent hover:bg-slate-900 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-5 h-5 flex items-center justify-center rounded border border-slate-700/50">
                          {isChecked && <div className="w-2.5 h-2.5 rounded-sm bg-indigo-500" />}
                        </div>
                        <div className="truncate">
                          <p className="text-xs font-medium truncate">{item.title}</p>
                          <p className="text-[10px] text-slate-500 capitalize">{item.type} • {serviceStyling.name}</p>
                        </div>
                      </div>
                      <span className="text-[9px] font-mono text-slate-500">{item.duration}</span>
                    </div>
                  );
                })}
                {filteredCandidates.length === 0 && (
                  <p className="text-center text-xs text-slate-500 pt-16 italic">
                    No matching items in your catalog list.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-900 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowCreator(false)}
              className="px-4 py-2 text-slate-400 hover:text-white text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/10"
            >
              <CheckCircle className="w-4 h-4" />
              Build Live Channel
            </button>
          </div>
        </form>
      )}

      {/* Main Channel Selector & Schedule Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Active Channels List */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
            My Curated Channels ({customChannels.length})
          </h3>

          <div className="space-y-2.5">
            {customChannels.map((channel) => {
              const active = channel.id === activeChannelId;
              return (
                <div
                  key={channel.id}
                  onClick={() => setActiveChannelId(channel.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    active
                      ? "bg-slate-950 border-indigo-500/50 shadow-md shadow-indigo-950/10"
                      : "bg-slate-950/30 border-slate-800/60 hover:bg-slate-950/60 hover:border-slate-700/60"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className={`text-sm font-semibold truncate ${active ? "text-indigo-400" : "text-white"}`}>
                        {channel.name}
                      </h4>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteChannel(channel.id);
                          if (activeChannelId === channel.id) {
                            setActiveChannelId(null);
                          }
                        }}
                        className="text-slate-500 hover:text-red-400 p-1"
                        title="Delete Channel"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2">{channel.description}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-900 mt-3 flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span>{channel.mediaIds.length} Programs</span>
                    <span>Code: {channel.shareCode}</span>
                  </div>
                </div>
              );
            })}

            {customChannels.length === 0 && (
              <div className="text-center py-10 bg-slate-950/10 border border-dashed border-slate-800/60 rounded-xl">
                <Info className="w-6 h-6 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-400 font-semibold">No custom channels</p>
                <p className="text-[10px] text-slate-500 mt-1 max-w-[160px] mx-auto leading-relaxed">
                  Synthesize your first custom channel in the console above!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* TV Guide Grid Display */}
        <div className="lg:col-span-3 space-y-4">
          {activeChannel ? (
            <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl overflow-hidden backdrop-blur-md">
              {/* Channel Guide Header */}
              <div className="p-5 border-b border-slate-900 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-950">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Tv className="w-4 h-4 text-indigo-400" />
                    <span className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                      LIVE FEED: {activeChannel.name}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{activeChannel.description}</p>
                </div>

                <button
                  onClick={() => copyShareCode(activeChannel)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    copiedChannelId === activeChannel.id
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800"
                  }`}
                >
                  <Share2 className="w-3.5 h-3.5" />
                  {copiedChannelId === activeChannel.id ? "Share Copied!" : "Share Channel Link"}
                </button>
              </div>

              {/* TV Guide Grid Slots */}
              <div className="p-5 space-y-3.5 max-h-[500px] overflow-y-auto scrollbar-thin">
                <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 pb-1 font-mono uppercase tracking-widest border-b border-slate-900">
                  <Calendar className="w-3.5 h-3.5" />
                  Today's Broadcast Lineup (24-Hour Loop)
                </div>

                {generatedGuide.map((slot) => {
                  const isOmnistream = slot.service === "omnistream";
                  const styling = isOmnistream ? null : STYLED_SERVICES[slot.service as StreamingService];

                  return (
                    <div
                      key={slot.id}
                      className={`flex flex-col sm:flex-row items-start gap-4 p-3.5 rounded-xl border transition-all ${
                        slot.type === "bumper"
                          ? "bg-slate-900/20 border-slate-800/40"
                          : "bg-slate-950 border-slate-900 hover:border-slate-800"
                      }`}
                    >
                      {/* Left Block: Timing */}
                      <div className="sm:w-28 flex items-center gap-2 shrink-0 font-mono text-xs text-slate-400 font-semibold mt-0.5">
                        <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        {slot.time}
                      </div>

                      {/* Middle Block: Info */}
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-white">{slot.title}</span>
                          {slot.subtitle && (
                            <span className="text-[10px] text-slate-500 font-medium">({slot.subtitle})</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{slot.description}</p>
                      </div>

                      {/* Right Block: Badges */}
                      <div className="shrink-0 flex items-center gap-2 self-start sm:self-center">
                        <span className="text-[10px] font-mono text-slate-500 bg-slate-900 px-2 py-0.5 rounded">
                          {slot.duration}
                        </span>

                        {isOmnistream ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded">
                            Omni-Break
                          </span>
                        ) : (
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded border"
                            style={{
                              backgroundColor: `${styling?.brandColor}15`,
                              borderColor: `${styling?.brandColor}30`,
                              color: styling?.brandColor,
                            }}
                          >
                            {styling?.name}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-24 bg-slate-950/20 border border-slate-800 rounded-2xl backdrop-blur-sm">
              <Tv className="w-12 h-12 text-slate-700 mx-auto mb-3 animate-pulse" />
              <p className="text-sm font-semibold text-slate-300">Live TV Feed Offline</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
                Connect your streaming profiles, curate programs, and choose a channel on the left to initialize the personal linear television guide simulation.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
