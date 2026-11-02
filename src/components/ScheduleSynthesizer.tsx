import React, { useState } from "react";
import { MediaItem, TvGuideSlot, WatchSchedule } from "../types";
import { STYLED_SERVICES, MOCK_MEDIA_ITEMS } from "../mockData";
import { ListMusic, Check, Sparkles, Film, Play, HelpCircle, Plus, Info, Calendar, Shuffle, CheckCircle } from "lucide-react";

interface ScheduleSynthesizerProps {
  watchlist: MediaItem[];
  schedules: WatchSchedule[];
  onSaveSchedule: (name: string, slots: TvGuideSlot[], originalShowsCount: number, originalMoviesCount: number) => void;
  onDeleteSchedule: (id: string) => void;
}

export default function ScheduleSynthesizer({
  watchlist,
  schedules,
  onSaveSchedule,
  onDeleteSchedule,
}: ScheduleSynthesizerProps) {
  const [selectedShows, setSelectedShows] = useState<string[]>([]);
  const [selectedMovies, setSelectedMovies] = useState<string[]>([]);
  const [customScheduleName, setCustomScheduleName] = useState("");
  const [activeScheduleId, setActiveScheduleId] = useState<string | null>(null);

  // Available database items for depth
  const allMedia = Array.from(
    new Map(
      [...MOCK_MEDIA_ITEMS, ...watchlist].map((item) => [item.id, item])
    ).values()
  );

  const availableShows = allMedia.filter((item) => item.type === "show");
  const availableMovies = allMedia.filter((item) => item.type === "movie");

  const toggleShow = (id: string) => {
    if (selectedShows.includes(id)) {
      setSelectedShows(selectedShows.filter((sId) => sId !== id));
    } else {
      if (selectedShows.length >= 5) return; // limit to 5
      setSelectedShows([...selectedShows, id]);
    }
  };

  const toggleMovie = (id: string) => {
    if (selectedMovies.includes(id)) {
      setSelectedMovies(selectedMovies.filter((mId) => mId !== id));
    } else {
      if (selectedMovies.length >= 4) return; // limit to 4
      setSelectedMovies([...selectedMovies, id]);
    }
  };

  const handleSynthesize = () => {
    // Requirements: 3-5 shows, 3-4 movies
    if (selectedShows.length < 3 || selectedShows.length > 5) {
      alert("Please select between 3 and 5 shows first.");
      return;
    }
    if (selectedMovies.length < 3 || selectedMovies.length > 4) {
      alert("Please select between 3 and 4 movies first.");
      return;
    }

    const name = customScheduleName.trim() || `Marathon TV - ${new Date().toLocaleDateString()}`;

    // Algorithm to mix shows and movies beautifully
    const showsList = allMedia.filter((item) => selectedShows.includes(item.id));
    const moviesList = allMedia.filter((item) => selectedMovies.includes(item.id));

    const slots: TvGuideSlot[] = [];
    let currentHour = 19; // Start at 7:00 PM (Prime Time)
    let currentMinute = 0;

    const BUMPERS = [
      { title: "Retro Cinematic Bumper", duration: "5m", desc: "Signature neon retro logo roll and cinema theme song." },
      { title: "Trivia Segment: Star Interviews", duration: "10m", desc: "Fascinating trivia facts about tonight's directors." },
      { title: "Next Up Network Teaser", duration: "5m", desc: "Sneak peak into the premium episodes scheduled tonight." },
    ];

    // Interleave pattern: Show 1 -> Bumper -> Movie 1 -> Bumper -> Show 2 -> Bumper -> Movie 2 -> ...
    const maxLoops = Math.max(showsList.length, moviesList.length);
    let bumperIdx = 0;

    for (let i = 0; i < maxLoops; i++) {
      // Add show if available
      if (showsList[i]) {
        const show = showsList[i];
        const ampm = currentHour >= 12 ? "PM" : "AM";
        const displayHour = currentHour % 12 === 0 ? 12 : currentHour % 12;
        const displayMinute = currentMinute.toString().padStart(2, "0");

        slots.push({
          id: `synth-show-${i}`,
          time: `${displayHour}:${displayMinute} ${ampm}`,
          title: show.title,
          type: "show",
          duration: "45m",
          service: show.service,
          description: show.description,
          subtitle: "S1: Episode 1 Broadcast",
        });

        currentMinute += 45;
        currentHour += Math.floor(currentMinute / 60);
        currentMinute %= 60;
        currentHour %= 24;

        // Add Bumper
        const bampm = currentHour >= 12 ? "PM" : "AM";
        const bdisplayHour = currentHour % 12 === 0 ? 12 : currentHour % 12;
        const bdisplayMinute = currentMinute.toString().padStart(2, "0");
        const bumper = BUMPERS[bumperIdx % BUMPERS.length];
        bumperIdx++;

        slots.push({
          id: `synth-bumper-${i}-1`,
          time: `${bdisplayHour}:${bdisplayMinute} ${bampm}`,
          title: bumper.title,
          type: "bumper",
          duration: "5m",
          service: "omnistream",
          description: bumper.desc,
        });

        currentMinute += 5;
        currentHour += Math.floor(currentMinute / 60);
        currentMinute %= 60;
        currentHour %= 24;
      }

      // Add movie if available
      if (moviesList[i]) {
        const movie = moviesList[i];
        const ampm = currentHour >= 12 ? "PM" : "AM";
        const displayHour = currentHour % 12 === 0 ? 12 : currentHour % 12;
        const displayMinute = currentMinute.toString().padStart(2, "0");

        slots.push({
          id: `synth-movie-${i}`,
          time: `${displayHour}:${displayMinute} ${ampm}`,
          title: movie.title,
          type: "movie",
          duration: "2h 00m",
          service: movie.service,
          description: movie.description,
          subtitle: "Blockbuster Presentation",
        });

        currentMinute += 120;
        currentHour += Math.floor(currentMinute / 60);
        currentMinute %= 60;
        currentHour %= 24;

        // Add Trivia/Bumper
        const bampm = currentHour >= 12 ? "PM" : "AM";
        const bdisplayHour = currentHour % 12 === 0 ? 12 : currentHour % 12;
        const bdisplayMinute = currentMinute.toString().padStart(2, "0");
        const bumper = BUMPERS[bumperIdx % BUMPERS.length];
        bumperIdx++;

        slots.push({
          id: `synth-bumper-${i}-2`,
          time: `${bdisplayHour}:${bdisplayMinute} ${bampm}`,
          title: bumper.title,
          type: "trivia",
          duration: "10m",
          service: "omnistream",
          description: bumper.desc,
        });

        currentMinute += 10;
        currentHour += Math.floor(currentMinute / 60);
        currentMinute %= 60;
        currentHour %= 24;
      }
    }

    onSaveSchedule(name, slots, selectedShows.length, selectedMovies.length);

    // Reset fields
    setSelectedShows([]);
    setSelectedMovies([]);
    setCustomScheduleName("");
  };

  const handleQuickSelect = () => {
    // Randomly select 3 shows and 3 movies for convenience
    const showsSample = [...availableShows].sort(() => 0.5 - Math.random()).slice(0, 3).map(s => s.id);
    const moviesSample = [...availableMovies].sort(() => 0.5 - Math.random()).slice(0, 3).map(m => m.id);

    setSelectedShows(showsSample);
    setSelectedMovies(moviesSample);
    setCustomScheduleName("Ultimate Mega Marathon");
  };

  return (
    <div className="space-y-8" id="schedule-synthesizer">
      {/* Informational banner */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 backdrop-blur-md">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <ListMusic className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-semibold text-white">OmniSchedule Synthesizer</h2>
          </div>
          <p className="text-sm text-slate-400 max-w-xl">
            Mix and match multiple shows and movies across Netflix, Hulu, YouTube, etc., to synthesize a unified traditional TV broadcast marathon guide.
          </p>
        </div>
        <button
          onClick={handleQuickSelect}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold border border-slate-800 flex items-center gap-2"
        >
          <Shuffle className="w-3.5 h-3.5" />
          Quick Random Combo
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Step-by-Step Programming Deck */}
        <div className="lg:col-span-7 bg-slate-950/40 border border-slate-800 rounded-2xl p-6 space-y-6 backdrop-blur-md">
          <h3 className="text-base font-semibold text-white flex items-center gap-2 border-b border-slate-900 pb-3">
            <Sparkles className="w-4.5 h-4.5 text-indigo-400" />
            Selection Checklist
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Show selector */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">1. Select Shows ({selectedShows.length}/5)</span>
                <span className="text-[10px] text-indigo-400 font-mono">Requires 3 to 5</span>
              </div>

              <div className="bg-slate-900/60 border border-slate-850 rounded-xl p-3 h-64 overflow-y-auto space-y-1.5 scrollbar-thin">
                {availableShows.map((show) => {
                  const isChecked = selectedShows.includes(show.id);
                  const serviceStyling = STYLED_SERVICES[show.service];

                  return (
                    <div
                      key={show.id}
                      onClick={() => toggleShow(show.id)}
                      className={`p-2.5 rounded-lg border cursor-pointer flex items-center justify-between gap-3 transition-all ${
                        isChecked
                          ? "bg-indigo-600/10 border-indigo-500/40 text-white"
                          : "bg-slate-950/20 border-transparent hover:bg-slate-900 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <div className="min-w-0 flex items-center gap-2">
                        <div className="w-4 h-4 flex items-center justify-center rounded border border-slate-700/50">
                          {isChecked && <Check className="w-3 h-3 text-indigo-400" />}
                        </div>
                        <span className="text-xs font-medium truncate">{show.title}</span>
                      </div>
                      <span
                        className="text-[8px] font-bold px-1.5 py-0.5 rounded border uppercase shrink-0"
                        style={{
                          color: serviceStyling?.brandColor,
                          borderColor: `${serviceStyling?.brandColor}30`,
                          backgroundColor: `${serviceStyling?.brandColor}08`,
                        }}
                      >
                        {serviceStyling?.name.split(" ")[0]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Movie selector */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">2. Select Movies ({selectedMovies.length}/4)</span>
                <span className="text-[10px] text-indigo-400 font-mono">Requires 3 to 4</span>
              </div>

              <div className="bg-slate-900/60 border border-slate-850 rounded-xl p-3 h-64 overflow-y-auto space-y-1.5 scrollbar-thin">
                {availableMovies.map((movie) => {
                  const isChecked = selectedMovies.includes(movie.id);
                  const serviceStyling = STYLED_SERVICES[movie.service];

                  return (
                    <div
                      key={movie.id}
                      onClick={() => toggleMovie(movie.id)}
                      className={`p-2.5 rounded-lg border cursor-pointer flex items-center justify-between gap-3 transition-all ${
                        isChecked
                          ? "bg-indigo-600/10 border-indigo-500/40 text-white"
                          : "bg-slate-950/20 border-transparent hover:bg-slate-900 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <div className="min-w-0 flex items-center gap-2">
                        <div className="w-4 h-4 flex items-center justify-center rounded border border-slate-700/50">
                          {isChecked && <Check className="w-3 h-3 text-indigo-400" />}
                        </div>
                        <span className="text-xs font-medium truncate">{movie.title}</span>
                      </div>
                      <span
                        className="text-[8px] font-bold px-1.5 py-0.5 rounded border uppercase shrink-0"
                        style={{
                          color: serviceStyling?.brandColor,
                          borderColor: `${serviceStyling?.brandColor}30`,
                          backgroundColor: `${serviceStyling?.brandColor}08`,
                        }}
                      >
                        {serviceStyling?.name.split(" ")[0]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between gap-4">
            <input
              type="text"
              value={customScheduleName}
              onChange={(e) => setCustomScheduleName(e.target.value)}
              placeholder="Give this Marathon a Name (Optional)..."
              className="w-full md:flex-1 bg-slate-900 border border-slate-800 rounded-xl py-2.5 px-3.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <button
              onClick={handleSynthesize}
              disabled={
                selectedShows.length < 3 ||
                selectedShows.length > 5 ||
                selectedMovies.length < 3 ||
                selectedMovies.length > 4
              }
              className="w-full md:w-auto px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Shuffle className="w-4 h-4" />
              Synthesize Traditional TV Schedule
            </button>
          </div>
        </div>

        {/* Display Curated TV Schedules */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
            Synthesized Schedules ({schedules.length})
          </h3>

          {schedules.map((schedule) => {
            const active = activeScheduleId === schedule.id;
            return (
              <div
                key={schedule.id}
                onClick={() => setActiveScheduleId(active ? null : schedule.id)}
                className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                  active
                    ? "bg-slate-950 border-indigo-500/60 shadow-lg"
                    : "bg-slate-950/20 border-slate-800/60 hover:bg-slate-950/50 hover:border-slate-700/60"
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white">{schedule.name}</h4>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSchedule(schedule.id);
                        if (activeScheduleId === schedule.id) {
                          setActiveScheduleId(null);
                        }
                      }}
                      className="text-slate-500 hover:text-red-400 text-xs font-semibold"
                    >
                      Delete
                    </button>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium">
                    <span className="flex items-center gap-1">
                      <Film className="w-3.5 h-3.5 text-indigo-400" />
                      {schedule.originalShowsCount} Shows • {schedule.originalMoviesCount} Movies
                    </span>
                    <span>•</span>
                    <span>{schedule.createdDate}</span>
                  </div>
                </div>

                {active && (
                  <div className="mt-4 pt-4 border-t border-slate-900 space-y-3 max-h-72 overflow-y-auto scrollbar-thin">
                    <div className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider pb-1 flex items-center gap-1 border-b border-slate-900">
                      <Calendar className="w-3.5 h-3.5" />
                      Timeline Block Guide
                    </div>

                    {schedule.slots.map((slot, index) => {
                      const isOmnistream = slot.service === "omnistream";
                      const styling = isOmnistream ? null : STYLED_SERVICES[slot.service as any];

                      return (
                        <div
                          key={index}
                          className={`flex items-start justify-between gap-3 p-2.5 rounded-lg border ${
                            slot.type === "bumper" || slot.type === "trivia"
                              ? "bg-slate-900/10 border-slate-900/50"
                              : "bg-slate-950/80 border-slate-850"
                          }`}
                        >
                          <div className="min-w-0">
                            <p className="text-[10px] font-mono font-bold text-indigo-400">{slot.time}</p>
                            <p className="text-xs font-bold text-white leading-tight mt-0.5 truncate">{slot.title}</p>
                            {slot.subtitle && <p className="text-[9px] text-slate-500">{slot.subtitle}</p>}
                          </div>

                          <div className="shrink-0 flex items-center gap-1.5 mt-0.5">
                            <span className="text-[9px] font-mono text-slate-500">{slot.duration}</span>
                            {isOmnistream ? (
                              <span className="text-[8px] bg-slate-800/40 text-slate-400 px-1.5 py-0.5 rounded">Bumper</span>
                            ) : (
                              <span
                                className="text-[8px] font-bold px-1.5 py-0.5 rounded border"
                                style={{
                                  color: styling?.brandColor,
                                  borderColor: `${styling?.brandColor}20`,
                                  backgroundColor: `${styling?.brandColor}08`,
                                }}
                              >
                                {styling?.name.split(" ")[0]}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {schedules.length === 0 && (
            <div className="text-center py-20 bg-slate-950/10 border border-dashed border-slate-800/60 rounded-2xl">
              <Shuffle className="w-8 h-8 text-slate-700 mx-auto mb-2 animate-pulse" />
              <p className="text-xs font-semibold text-slate-400">No Custom Lineup Active</p>
              <p className="text-[10px] text-slate-500 max-w-xs mx-auto mt-1 leading-relaxed">
                Choose your specific show and movie counts on the left, name your block, and click Synthesize to create the linear broadcast.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
