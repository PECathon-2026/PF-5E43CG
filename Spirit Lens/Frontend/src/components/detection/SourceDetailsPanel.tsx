import React from "react";
import { Star, X, Info, Activity, Compass, Disc, Sparkles, Maximize2 } from "lucide-react";
import type { CelestialSource } from "../../types/astronomy";

interface SourceDetailsPanelProps {
  selectedSource: CelestialSource | null;
  onClearSelection: () => void;
  sources: CelestialSource[];
  onSelectSource: (src: CelestialSource) => void;
}

export const SourceDetailsPanel: React.FC<SourceDetailsPanelProps> = ({
  selectedSource,
  onClearSelection,
  sources,
  onSelectSource,
}) => {
  return (
    <div className="instrument-card p-5 h-full flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-[rgba(212,175,55,0.12)]">
          <div className="flex items-center space-x-2">
            <Star className="w-4 h-4 text-[#d4af37]" />
            <h3 className="text-sm font-semibold tracking-wider text-[#d4af37] uppercase">
              Celestial Source Inspector
            </h3>
          </div>
          {selectedSource && (
            <button
              type="button"
              onClick={onClearSelection}
              className="text-xs text-[#9ea8b6] hover:text-[#c83e2b] flex items-center gap-1 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Deselect</span>
            </button>
          )}
        </div>

        {/* Selected Source Measurement Card */}
        {selectedSource ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-[#080c14] border border-[rgba(212,175,55,0.3)] rounded p-3">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#9b8032] block">
                  Catalog Identification
                </span>
                <span className="text-base font-bold text-[#f5f6f8] font-mono">
                  Source #{selectedSource.id}
                </span>
              </div>
              <span
                className={`text-[10px] px-2 py-0.5 rounded uppercase font-semibold border ${
                  selectedSource.is_extended_candidate
                    ? "bg-amber-950/40 text-amber-300 border-amber-500/40"
                    : "bg-emerald-950/40 text-emerald-300 border-emerald-500/40"
                }`}
              >
                {selectedSource.classification.replace("_", " ")}
              </span>
            </div>

            {/* Measurement Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-[#0c111a] p-2.5 rounded border border-[rgba(212,175,55,0.1)]">
                <span className="text-[#606877] block text-[10px] uppercase flex items-center gap-1">
                  <Compass className="w-3 h-3 text-[#d4af37]" />
                  Centroid (X, Y)
                </span>
                <span className="font-mono text-[#f5f6f8]">
                  {selectedSource.x.toFixed(2)}, {selectedSource.y.toFixed(2)} px
                </span>
              </div>

              <div className="bg-[#0c111a] p-2.5 rounded border border-[rgba(212,175,55,0.1)]">
                <span className="text-[#606877] block text-[10px] uppercase flex items-center gap-1">
                  <Activity className="w-3 h-3 text-[#d4af37]" />
                  Measured Brightness (Flux)
                </span>
                <span className="font-mono text-[#f5f6f8]">
                  {selectedSource.flux.toLocaleString()} counts
                </span>
              </div>

              <div className="bg-[#0c111a] p-2.5 rounded border border-[rgba(212,175,55,0.1)]">
                <span className="text-[#606877] block text-[10px] uppercase flex items-center gap-1">
                  <Disc className="w-3 h-3 text-[#d4af37]" />
                  FWHM (Pixels)
                </span>
                <span className="font-mono text-[#f5f6f8]">
                  {selectedSource.fwhm_pixels.toFixed(2)} px
                </span>
              </div>

              <div className="bg-[#0c111a] p-2.5 rounded border border-[rgba(212,175,55,0.1)]">
                <span className="text-[#606877] block text-[10px] uppercase flex items-center gap-1">
                  <Maximize2 className="w-3 h-3 text-[#d4af37]" />
                  Apparent Size (W × H)
                </span>
                <span className="font-mono text-[#f5f6f8]">
                  {selectedSource.bbox && selectedSource.bbox.length === 4
                    ? `${Math.max(1, selectedSource.bbox[3] - selectedSource.bbox[1])} × ${Math.max(1, selectedSource.bbox[2] - selectedSource.bbox[0])} px`
                    : `${(selectedSource.semimajor_pixels * 2).toFixed(0)} × ${(selectedSource.semiminor_pixels * 2).toFixed(0)} px`}
                </span>
              </div>

              <div className="bg-[#0c111a] p-2.5 rounded border border-[rgba(212,175,55,0.1)]">
                <span className="text-[#606877] block text-[10px] uppercase">
                  Semimajor / Minor
                </span>
                <span className="font-mono text-[#9ea8b6]">
                  {selectedSource.semimajor_pixels.toFixed(1)} / {selectedSource.semiminor_pixels.toFixed(1)} px
                </span>
              </div>

              <div className="bg-[#0c111a] p-2.5 rounded border border-[rgba(212,175,55,0.1)]">
                <span className="text-[#606877] block text-[10px] uppercase">
                  Eccentricity
                </span>
                <span className="font-mono text-[#9ea8b6]">
                  {selectedSource.eccentricity.toFixed(3)}
                </span>
              </div>
            </div>

            <p className="text-[10px] text-[#606877] italic bg-[#06080d] p-2 rounded border border-[rgba(212,175,55,0.08)]">
              Note: Brightness reflects background-subtracted integrated flux in detector counts. Apparent size reflects image-plane pixel extent without plate scale calibration.
            </p>
          </div>
        ) : (
          <div className="p-6 text-center text-[#9ea8b6] bg-[#070a10] rounded border border-dashed border-[rgba(212,175,55,0.15)] my-4">
            <Sparkles className="w-6 h-6 mx-auto mb-2 text-[#9b8032] opacity-70" />
            <p className="text-xs text-[#f5f6f8] mb-1 font-medium">No Celestial Source Selected</p>
            <p className="text-[11px] text-[#606877]">
              Click on any reticle on the astronomical image viewer to inspect its physical parameters and flux.
            </p>
          </div>
        )}

        {/* Catalog Table Mini Preview */}
        {sources.length > 0 && (
          <div className="mt-4 pt-3 border-t border-[rgba(212,175,55,0.08)]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-[#9b8032] uppercase tracking-wider">
                Detected Catalog ({sources.length})
              </span>
              <span className="text-[10px] text-[#606877]">Sorted by Flux</span>
            </div>
            <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
              {sources.slice(0, 25).map((src) => (
                <button
                  type="button"
                  key={src.id}
                  onClick={() => onSelectSource(src)}
                  className={`w-full text-left px-2 py-1.5 rounded flex items-center justify-between text-xs transition-colors cursor-pointer border ${
                    selectedSource?.id === src.id
                      ? "bg-[rgba(212,175,55,0.2)] text-[#f3cf65] font-semibold border-[rgba(212,175,55,0.4)]"
                      : "border-transparent hover:bg-[#121826] text-[#9ea8b6] hover:text-[#f5f6f8]"
                  }`}
                >
                  <span className="font-mono">#{src.id}</span>
                  <span className="font-mono text-[11px]">{src.flux.toFixed(0)} counts</span>
                  <span className="text-[10px] text-[#606877]">{src.is_extended_candidate ? "EXT" : "PT"}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-[rgba(212,175,55,0.08)] text-[11px] text-[#606877] flex items-center gap-1.5">
        <Info className="w-3.5 h-3.5 text-[#9b8032]" />
        <span>Pixel coordinates are registered to the original observation frame.</span>
      </div>
    </div>
  );
};
