import React from "react";
import { Sparkles, Eye, Tag, Maximize2, Crosshair, HelpCircle } from "lucide-react";
import type { DetectionSettings } from "../../types/astronomy";

interface DetectionControlsProps {
  settings: DetectionSettings;
  setSettings: React.Dispatch<React.SetStateAction<DetectionSettings>>;
  showMarkers: boolean;
  setShowMarkers: (val: boolean) => void;
  showLabels: boolean;
  setShowLabels: (val: boolean) => void;
  showExtended: boolean;
  setShowExtended: (val: boolean) => void;
  onDetect: () => void;
  isProcessing: boolean;
  disabled: boolean;
}

export const DetectionControls: React.FC<DetectionControlsProps> = ({
  settings,
  setSettings,
  showMarkers,
  setShowMarkers,
  showLabels,
  setShowLabels,
  showExtended,
  setShowExtended,
  onDetect,
  isProcessing,
  disabled,
}) => {
  const handleChange = (key: keyof DetectionSettings, val: number) => {
    setSettings((prev) => ({ ...prev, [key]: val }));
  };

  return (
    <div className="instrument-card p-5 h-full flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-[rgba(212,175,55,0.12)]">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-[#d4af37]" />
            <h3 className="text-sm font-semibold tracking-wider text-[#d4af37] uppercase">
              Source Extraction (Photutils)
            </h3>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-[#9ea8b6] bg-[#090d14] px-2 py-0.5 rounded border border-[rgba(212,175,55,0.15)]">
            <Crosshair className="w-3 h-3 text-[#d4af37]" />
            <span>2D Background RMS</span>
          </div>
        </div>

        {/* Sliders */}
        <div className="space-y-4 text-xs">
          {/* Threshold Sigma */}
          <div>
            <div className="flex justify-between text-[#9ea8b6] mb-1">
              <span className="flex items-center gap-1.5" title="Significance threshold above local background RMS">
                Detection Threshold (σ)
                <HelpCircle className="w-3 h-3 text-[#606877]" />
              </span>
              <span className="font-mono text-[#f5f6f8]">{settings.threshold_sigma.toFixed(1)} σ</span>
            </div>
            <input
              type="range"
              min="1.5"
              max="15.0"
              step="0.5"
              value={settings.threshold_sigma}
              onChange={(e) => handleChange("threshold_sigma", parseFloat(e.target.value))}
              disabled={disabled || isProcessing}
              className="w-full h-1 bg-[#161c2a] rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#606877] mt-0.5">
              <span>Deep/Sensitive (1.5σ)</span>
              <span>Nominal (3.5σ)</span>
              <span>Bright Only (15σ)</span>
            </div>
          </div>

          {/* Min Area Pixels */}
          <div>
            <div className="flex justify-between text-[#9ea8b6] mb-1">
              <span>Minimum Source Footprint</span>
              <span className="font-mono text-[#f5f6f8]">{settings.min_area_pixels} px</span>
            </div>
            <input
              type="range"
              min="3"
              max="50"
              step="1"
              value={settings.min_area_pixels}
              onChange={(e) => handleChange("min_area_pixels", parseInt(e.target.value, 10))}
              disabled={disabled || isProcessing}
              className="w-full h-1 bg-[#161c2a] rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Max Sources */}
          <div>
            <div className="flex justify-between text-[#9ea8b6] mb-1">
              <span>Max Catalog Extract</span>
              <span className="font-mono text-[#f5f6f8]">{settings.max_sources}</span>
            </div>
            <input
              type="range"
              min="50"
              max="500"
              step="25"
              value={settings.max_sources}
              onChange={(e) => handleChange("max_sources", parseInt(e.target.value, 10))}
              disabled={disabled || isProcessing}
              className="w-full h-1 bg-[#161c2a] rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Overlay Visibility Toggles */}
          <div className="pt-3 border-t border-[rgba(212,175,55,0.08)] space-y-2">
            <span className="text-[11px] font-semibold tracking-wider text-[#9b8032] uppercase block">
              Overlay Layers
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <label className="flex items-center gap-2 cursor-pointer text-[#9ea8b6] hover:text-[#f5f6f8]">
                <input
                  type="checkbox"
                  checked={showMarkers}
                  onChange={(e) => setShowMarkers(e.target.checked)}
                  className="rounded border-[rgba(212,175,55,0.3)] bg-[#0d121c] text-[#d4af37]"
                />
                <Eye className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>Show Reticles</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-[#9ea8b6] hover:text-[#f5f6f8]">
                <input
                  type="checkbox"
                  checked={showLabels}
                  onChange={(e) => setShowLabels(e.target.checked)}
                  className="rounded border-[rgba(212,175,55,0.3)] bg-[#0d121c] text-[#d4af37]"
                />
                <Tag className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>Show Labels</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-[#9ea8b6] hover:text-[#f5f6f8]">
                <input
                  type="checkbox"
                  checked={showExtended}
                  onChange={(e) => setShowExtended(e.target.checked)}
                  className="rounded border-[rgba(212,175,55,0.3)] bg-[#0d121c] text-[#d4af37]"
                />
                <Maximize2 className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>Extended Objects</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="pt-4 mt-4 border-t border-[rgba(212,175,55,0.12)]">
        <button
          type="button"
          onClick={onDetect}
          disabled={disabled || isProcessing}
          className="btn-vermilion w-full py-2 px-3 rounded text-xs flex items-center justify-center gap-1.5 shadow"
        >
          {isProcessing ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Detecting on Server...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Detect Celestial Sources</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
