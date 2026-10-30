import React, { useState, useEffect } from "react";
import { Server, AlertCircle } from "lucide-react";
import type { BackendHealth } from "../../types/astronomy";

interface NavbarProps {
  health: BackendHealth | null;
  healthError: string | null;
}

interface NavItem {
  label: string;
  key: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", key: "dashboard", icon: "🏯" },
  { label: "Moon Observatory", key: "moon", icon: "🌙" },
  { label: "Celestial Calendar", key: "calendar", icon: "📜" },
  { label: "Watchtower", key: "watchtower", icon: "⛰️" },
  { label: "Spirit Lens", key: "spirit-lens", icon: "🔭" },
  { label: "About", key: "about", icon: "⚔️" },
];

export const Navbar: React.FC<NavbarProps> = ({ health, healthError }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  const getTargetUrl = (key: string): string => {
    const path = window.location.pathname.replace(/\\/g, "/");
    const isDist = path.includes("/dist/");
    const prefix = isDist ? "../../../" : "../../";

    switch (key) {
      case "dashboard":
        return prefix + "Dashboard Calender/dist/index.html";
      case "moon":
        return prefix + "Dashboard Calender/dist/index.html?route=/moon#moon";
      case "calendar":
        return prefix + "Dashboard Calender/dist/index.html?route=/celestial-events#celestial-events";
      case "watchtower":
        return prefix + "tsukuyomi-watch/index.html";
      case "spirit-lens":
        return "#";
      case "about":
        return prefix + "Dashboard Calender/dist/index.html?route=/about#about";
      default:
        return "#";
    }
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 bg-[#050707]/95 backdrop-blur-md transition-colors"
      style={{ borderBottom: "1px solid rgba(197, 160, 89, 0.22)" }}
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 min-w-0">
          {/* Brand Section (Left Side) */}
          <a
            href={getTargetUrl("dashboard")}
            onClick={() => setIsMenuOpen(false)}
            className="flex items-center gap-2.5 sm:gap-3 group flex-shrink-0 cursor-pointer min-w-0 pr-2"
            aria-label="Tsukuyomi Watch — Dashboard"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-[#c93a2b] via-[#c5a059] to-[#080c0d] p-0.5 flex items-center justify-center shadow-md shadow-[#c93a2b]/25 group-hover:scale-105 transition-transform flex-shrink-0">
              <div className="w-full h-full bg-[#050707] rounded-[10px] flex items-center justify-center">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="text-[#c5a059]"
                  aria-hidden="true"
                >
                  <path
                    d="M2 5C8 4 16 4 22 5"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M4 8H20"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M6 5V20"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M18 5V20"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[#f7f4ec] font-bold text-xs sm:text-sm tracking-widest font-serif uppercase leading-tight group-hover:text-[#c5a059] transition-colors truncate">
                Tsukuyomi Watch
              </span>
              <span className="text-[#c5a059] text-[9px] sm:text-[10px] tracking-[0.2em] uppercase font-sans font-medium truncate">
                The Samurai's Celestial Guide
              </span>
            </div>
          </a>

          {/* Desktop Navigation Section (Right Side) */}
          <div className="hidden lg:flex items-center gap-1 xl:gap-2 flex-shrink-0" role="list">
            {NAV_ITEMS.map((item) => {
              const isActive = item.key === "spirit-lens";
              return (
                <a
                  key={item.key}
                  href={getTargetUrl(item.key)}
                  role="listitem"
                  aria-current={isActive ? "page" : undefined}
                  onClick={(e) => {
                    if (isActive) {
                      e.preventDefault();
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }
                  }}
                  className={`relative px-2.5 xl:px-3 py-1.5 rounded-lg text-[11px] xl:text-xs font-sans font-medium tracking-wider uppercase whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "text-[#c5a059] bg-[#c5a059]/12"
                      : "text-[#f7f4ec]/80 hover:text-[#c5a059] hover:bg-white/5"
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span
                      className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full bg-[#c5a059]"
                      aria-hidden="true"
                    />
                  )}
                </a>
              );
            })}

            {/* Preserved Backend Health Status Indicator */}
            <div className="ml-2 pl-2 border-l border-[#c5a059]/20 flex items-center">
              {health ? (
                <div
                  className="flex items-center space-x-1.5 px-2 py-1 rounded border border-emerald-500/30 bg-emerald-950/20 text-emerald-400 text-[10px]"
                  title={`FastAPI Master Backend v${health.version} connected. Server-side processing active.`}
                >
                  <Server className="w-3 h-3 text-emerald-400" />
                  <span className="hidden xl:inline">Engine Active</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </div>
              ) : (
                <div
                  className="flex items-center space-x-1.5 px-2 py-1 rounded border border-amber-500/30 bg-amber-950/20 text-amber-400 text-[10px]"
                  title={healthError || "Connecting to master backend at http://localhost:8000..."}
                >
                  <AlertCircle className="w-3 h-3 text-amber-400 animate-pulse" />
                  <span className="hidden xl:inline">Local Ready</span>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            className="lg:hidden text-[#f7f4ec] hover:text-[#c5a059] p-2 rounded-lg bg-white/5 border border-[#c5a059]/30 transition-colors cursor-pointer flex-shrink-0"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation"
            aria-label="Toggle navigation menu"
          >
            <div className="w-5 h-4 flex flex-col justify-between" aria-hidden="true">
              <span
                className={`block h-0.5 bg-current transition-all duration-200 ${
                  isMenuOpen ? "rotate-45 translate-y-1.5" : ""
                }`}
              />
              <span
                className={`block h-0.5 bg-current transition-all duration-200 ${
                  isMenuOpen ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`block h-0.5 bg-current transition-all duration-200 ${
                  isMenuOpen ? "-rotate-45 -translate-y-2" : ""
                }`}
              />
            </div>
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMenuOpen && (
          <div
            id="mobile-navigation"
            className="lg:hidden py-4 border-t border-[#c5a059]/20 flex flex-col gap-1.5 max-h-[calc(100vh-4rem)] overflow-y-auto"
          >
            {NAV_ITEMS.map((item) => {
              const isActive = item.key === "spirit-lens";
              return (
                <a
                  key={item.key}
                  href={getTargetUrl(item.key)}
                  onClick={(e) => {
                    setIsMenuOpen(false);
                    if (isActive) {
                      e.preventDefault();
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }
                  }}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs sm:text-sm font-sans tracking-wider uppercase transition-all ${
                    isActive
                      ? "bg-[#c93a2b] text-[#f7f4ec] font-semibold shadow-md shadow-[#c93a2b]/30 border border-[#c93a2b]/70"
                      : "text-[#f7f4ec]/85 hover:text-[#c5a059] hover:bg-white/5"
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span>{item.label}</span>
                </a>
              );
            })}

            {/* Preserved Health Status in Mobile Menu */}
            <div className="mt-2 pt-2 border-t border-[#c5a059]/10 px-4 py-2">
              {health ? (
                <div className="flex items-center space-x-2 text-xs text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>FastAPI Master Backend v{health.version} Connected</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-xs text-amber-400">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Backend Standby / Local Ingestion Ready</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
