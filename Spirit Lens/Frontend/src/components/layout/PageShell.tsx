import React from "react";
import { Navbar } from "./Navbar";
import type { BackendHealth } from "../../types/astronomy";

interface PageShellProps {
  children: React.ReactNode;
  health: BackendHealth | null;
  healthError: string | null;
}

export const PageShell: React.FC<PageShellProps> = ({ children, health, healthError }) => {
  return (
    <div className="min-h-screen flex flex-col cosmic-canvas text-[#f5f6f8] selection:bg-[#d4af37]/30 selection:text-[#f3cf65]">
      <Navbar health={health} healthError={healthError} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8 sm:pb-12">
        {children}
      </main>

      <footer className="border-t border-[rgba(212,175,55,0.12)] bg-[#05070a]/80 py-6 text-center text-xs text-[#606877]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="text-[#9b8032] font-serif font-semibold tracking-wider">TSUKUYOMI WATCH</span>
            <span>—</span>
            <span>SPIRIT LENS ASTRONOMICAL SUITE</span>
          </div>
          <div className="flex items-center space-x-4 text-[11px]">
            <span>PECathon 2026 | PS-002</span>
            <span>•</span>
            <span>FastAPI & Photutils Server Engine</span>
            <span>•</span>
            <span className="text-[#d4af37]">Scientific Integrity Verified</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
