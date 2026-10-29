import React from "react";
import { Moon, Eye, Shield, Compass, Scroll, Server, AlertCircle } from "lucide-react";
import type { BackendHealth } from "../../types/astronomy";

interface NavbarProps {
  health: BackendHealth | null;
  healthError: string | null;
}

export const Navbar: React.FC<NavbarProps> = ({ health, healthError }) => {
  return (
    <header className="border-b border-[rgba(212,175,55,0.18)] bg-[#07090e]/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Wordmark */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full border border-[rgba(212,175,55,0.4)] flex items-center justify-center bg-[#0d121c] shadow-[0_0_15px_rgba(212,175,55,0.15)]">
            <Moon className="w-5 h-5 text-[#d4af37]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-serif tracking-widest text-base sm:text-lg font-bold text-[#f5f6f8]">
                TSUKUYOMI WATCH
              </span>
              <span className="text-[10px] text-[#9b8032] border border-[rgba(212,175,55,0.3)] px-1.5 py-0.5 rounded tracking-widest uppercase">
                月読
              </span>
            </div>
            <p className="text-[10px] tracking-wider text-[#9ea8b6]">
              ASTRONOMICAL OBSERVATION PLATFORM
            </p>
          </div>
        </div>

        {/* Navigation Modules */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2 text-xs font-medium tracking-wide">
          <button
            type="button"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-[rgba(212,175,55,0.12)] text-[#f3cf65] border border-[rgba(212,175,55,0.35)] shadow-[0_0_10px_rgba(212,175,55,0.1)]"
            title="Active Astronomical Restoration & Detection Module"
          >
            <Eye className="w-3.5 h-3.5 text-[#d4af37]" />
            <span>Spirit Lens</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37] animate-pulse ml-1" />
          </button>

          <span
            className="flex items-center space-x-1 px-3 py-1.5 text-[#606877] cursor-not-allowed hover:text-[#788294]"
            title="Standby Module (Future Milestone)"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Dashboard</span>
            <span className="text-[9px] uppercase tracking-wider text-[#495163] ml-1">Standby</span>
          </span>

          <span
            className="flex items-center space-x-1 px-3 py-1.5 text-[#606877] cursor-not-allowed hover:text-[#788294]"
            title="Standby Module (Future Milestone)"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Watchtower</span>
            <span className="text-[9px] uppercase tracking-wider text-[#495163] ml-1">Standby</span>
          </span>

          <span
            className="flex items-center space-x-1 px-3 py-1.5 text-[#606877] cursor-not-allowed hover:text-[#788294]"
            title="Standby Module (Future Milestone)"
          >
            <Scroll className="w-3.5 h-3.5" />
            <span>Celestial Scroll</span>
            <span className="text-[9px] uppercase tracking-wider text-[#495163] ml-1">Standby</span>
          </span>
        </nav>

        {/* Backend Server Status Indicator */}
        <div className="flex items-center space-x-2">
          {health ? (
            <div
              className="flex items-center space-x-1.5 px-2.5 py-1 rounded border border-emerald-500/30 bg-emerald-950/20 text-emerald-400 text-xs"
              title={`FastAPI Master Backend v${health.version} connected. Server-side processing active.`}
            >
              <Server className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Server-side Processing</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
          ) : (
            <div
              className="flex items-center space-x-1.5 px-2.5 py-1 rounded border border-amber-500/30 bg-amber-950/20 text-amber-400 text-xs"
              title={healthError || "Connecting to master backend at http://localhost:8000..."}
            >
              <AlertCircle className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span className="hidden sm:inline">Connecting Backend...</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
