import React, { useState } from "react";
import { StreamingAccount, StreamingService } from "../types";
import { STYLED_SERVICES } from "../mockData";
import { Shield, Sparkles, RefreshCw, LogIn, LogOut, CheckCircle2, User, Key, Eye, EyeOff } from "lucide-react";

interface AccountConnectorProps {
  accounts: StreamingAccount[];
  onToggleConnect: (service: StreamingService, profileName: string, email: string) => void;
  onSyncAll: () => void;
  isSyncing: boolean;
}

export default function AccountConnector({
  accounts,
  onToggleConnect,
  onSyncAll,
  isSyncing,
}: AccountConnectorProps) {
  const [selectedService, setSelectedService] = useState<StreamingService | null>(null);
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [profileInput, setProfileInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleOpenLogin = (service: StreamingService) => {
    const existing = accounts.find((a) => a.service === service);
    if (existing?.connected) {
      // Disconnect directly
      onToggleConnect(service, "", "");
    } else {
      setSelectedService(service);
      setEmailInput("");
      setPasswordInput("••••••••••••");
      setProfileInput(
        service === "netflix"
          ? "Annamarie"
          : service === "crunchyroll"
          ? "AnimeFan99"
          : "My Profile"
      );
    }
  };

  const handleMockLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedService) {
      onToggleConnect(selectedService, profileInput || "Main User", emailInput || `${selectedService}@stream.com`);
      setSelectedService(null);
    }
  };

  return (
    <div className="space-y-8" id="account-connector">
      {/* Top Banner */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 backdrop-blur-md">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-semibold text-white">Streaming Services Hub</h2>
          </div>
          <p className="text-sm text-slate-400 max-w-xl">
            Securely link your premium profiles. OmniStream synthesizes metadata from connected accounts to power your unified watchlist, TV Guide, and personalized AI Recommendations.
          </p>
        </div>
        <button
          onClick={onSyncAll}
          disabled={isSyncing}
          className="w-full md:w-auto px-5 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium rounded-xl flex items-center justify-center gap-2.5 shadow-lg shadow-indigo-500/10 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
          {isSyncing ? "Syncing Metadata..." : "Synchronize All Profiles"}
        </button>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {accounts.map((acc) => {
          const styling = STYLED_SERVICES[acc.service];
          return (
            <div
              key={acc.service}
              id={`card-${acc.service}`}
              className={`p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden flex flex-col justify-between h-48 backdrop-blur-sm ${
                acc.connected
                  ? "bg-slate-950/70 border-slate-700/60 shadow-lg shadow-indigo-950/5"
                  : "bg-slate-950/20 border-slate-800/40 opacity-75 hover:opacity-100"
              }`}
            >
              {/* Service Accent Line */}
              <div
                className="absolute top-0 left-0 right-0 h-1.5"
                style={{ backgroundColor: styling.brandColor }}
              />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`text-lg font-bold tracking-tight ${styling.textClass}`}>
                    {styling.name}
                  </span>
                  {acc.connected ? (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" />
                      Connected
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold text-slate-500 bg-slate-800/20 px-2.5 py-1 rounded-full border border-slate-800/30">
                      Disconnected
                    </span>
                  )}
                </div>

                {acc.connected ? (
                  <div className="space-y-1 text-slate-300">
                    <p className="text-sm font-medium flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      {acc.profileName}
                    </p>
                    <p className="text-xs text-slate-400 truncate">{acc.email}</p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">
                    Log in to unlock movies and synchronize watch progress.
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-900">
                <span className="text-[10px] text-slate-500 tracking-wide font-mono uppercase">
                  {acc.lastSync}
                </span>
                <button
                  onClick={() => handleOpenLogin(acc.service)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    acc.connected
                      ? "bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20"
                      : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-600/10"
                  }`}
                >
                  {acc.connected ? (
                    <>
                      <LogOut className="w-3 h-3" />
                      Disconnect
                    </>
                  ) : (
                    <>
                      <LogIn className="w-3 h-3" />
                      Connect
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Connection Guarantee Banner */}
      <div className="bg-indigo-950/20 border border-indigo-900/30 rounded-xl p-4 flex items-start gap-3.5">
        <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5 animate-pulse" />
        <p className="text-xs text-slate-400 leading-relaxed">
          <span className="font-semibold text-slate-300">Smart Link Mode Enabled:</span> OmniStream uses standard OAuth visual wrappers and dynamic API scraping indicators to simulate authentic account linkages. Disconnecting any service immediately removes its related recommendations and scheduled programming from your live feed.
        </p>
      </div>

      {/* Modal Connection Simulator */}
      {selectedService && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#121214] border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative">
            {/* Service Theme Header Accent */}
            <div
              className="h-2 w-full"
              style={{ backgroundColor: STYLED_SERVICES[selectedService].brandColor }}
            />

            <div className="p-6 space-y-6">
              <div className="text-center space-y-1">
                <div
                  className="text-2xl font-black uppercase tracking-wider"
                  style={{ color: STYLED_SERVICES[selectedService].brandColor }}
                >
                  {STYLED_SERVICES[selectedService].name}
                </div>
                <p className="text-xs text-slate-400">
                  Authenticate securely to sync with OmniStream
                </p>
              </div>

              <form onSubmit={handleMockLoginSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder={STYLED_SERVICES[selectedService].placeholder}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 px-3.5 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Account Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 px-3.5 pr-10 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Preferred Profile Name
                  </label>
                  <input
                    type="text"
                    required
                    value={profileInput}
                    onChange={(e) => setProfileInput(e.target.value)}
                    placeholder="e.g. Living Room, Anna C."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 px-3.5 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-900">
                  <button
                    type="button"
                    onClick={() => setSelectedService(null)}
                    className="px-4 py-2 bg-transparent hover:bg-slate-900 text-slate-400 hover:text-white rounded-xl text-xs font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/10"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Verify & Connect
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
