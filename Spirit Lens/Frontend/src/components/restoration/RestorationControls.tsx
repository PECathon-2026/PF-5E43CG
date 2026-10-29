import React from "react";
import { Sliders, RotateCcw, Wand2, ShieldCheck, Sun, Contrast, Waves, Crosshair } from "lucide-react";
import type { RestorationSettings } from "../../types/astronomy";

interface RestorationControlsProps {
  settings: RestorationSettings;
  setSettings: React.Dispatch<React.SetStateAction<RestorationSettings>>;
  onRestore: () => void;
  isProcessing: boolean;
  disabled: boolean;
}

const DEFAULT_SETTINGS: RestorationSettings = {
  denoise_strength: 15.0,
  contrast: 15.0,
  brightness: 0.0,
  sharpening: 10.0,
  background_leveling: false,
};

export const RestorationControls: React.FC<RestorationControlsProps> = ({
  settings,
  setSettings,
  onRestore,
  isProcessing,
  disabled,
}) => {
  const handleChange = (key: keyof RestorationSettings, val: number | boolean) => {
    setSettings((prev) => ({ ...prev, [key]: val }));
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  return (
    <div className="instrument-card p-5 h-full flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-[rgba(212,175,55,0.12)]">
          <div className="flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-[#d4af37]" />
            <h3 className="text-sm font-semibold tracking-wider text-[#d4af37] uppercase">
              Restoration Parameters
            </h3>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-[#9ea8b6] bg-[#090d14] px-2 py-0.5 rounded border border-[rgba(212,175,55,0.15)]">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>Classical Pipeline</span>
          </div>
        </div>

        {/* Sliders */}
        <div className="space-y-4 text-xs">
          {/* Denoise Strength */}
          <div>
            <div className="flex justify-between text-[#9ea8b6] mb-1">
              <span className="flex items-center gap-1.5">
                <Waves className="w-3.5 h-3.5 text-[#d4af37]" />
                Poisson / Read Denoising
              </span>
              <span className="font-mono text-[#f5f6f8]">{settings.denoise_strength.toFixed(0)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={settings.denoise_strength}
              onChange={(e) => handleChange("denoise_strength", parseFloat(e.target.value))}
              disabled={disabled || isProcessing}
              className="w-full h-1 bg-[#161c2a] rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#606877] mt-0.5">
              <span>Off (0)</span>
              <span>Subtle (15)</span>
              <span>Aggressive (100)</span>
            </div>
          </div>

          {/* Adaptive Contrast (CLAHE) */}
          <div>
            <div className="flex justify-between text-[#9ea8b6] mb-1">
              <span className="flex items-center gap-1.5">
                <Contrast className="w-3.5 h-3.5 text-[#d4af37]" />
                Nebular Contrast (CLAHE)
              </span>
              <span className="font-mono text-[#f5f6f8]">+{settings.contrast.toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="-20"
              max="80"
              step="1"
              value={settings.contrast}
              onChange={(e) => handleChange("contrast", parseFloat(e.target.value))}
              disabled={disabled || isProcessing}
              className="w-full h-1 bg-[#161c2a] rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#606877] mt-0.5">
              <span>Flat (-20)</span>
              <span>Balanced (15)</span>
              <span>High Dynamic (80)</span>
            </div>
          </div>

          {/* Brightness Shift */}
          <div>
            <div className="flex justify-between text-[#9ea8b6] mb-1">
              <span className="flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-[#d4af37]" />
                Brightness Shift
              </span>
              <span className="font-mono text-[#f5f6f8]">
                {settings.brightness > 0 ? `+${settings.brightness.toFixed(0)}` : settings.brightness.toFixed(0)}
              </span>
            </div>
            <input
              type="range"
              min="-50"
              max="50"
              step="1"
              value={settings.brightness}
              onChange={(e) => handleChange("brightness", parseFloat(e.target.value))}
              disabled={disabled || isProcessing}
              className="w-full h-1 bg-[#161c2a] rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Sharpening */}
          <div>
            <div className="flex justify-between text-[#9ea8b6] mb-1">
              <span className="flex items-center gap-1.5">
                <Crosshair className="w-3.5 h-3.5 text-[#d4af37]" />
                Stellar Profile Sharpening
              </span>
              <span className="font-mono text-[#f5f6f8]">{settings.sharpening.toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={settings.sharpening}
              onChange={(e) => handleChange("sharpening", parseFloat(e.target.value))}
              disabled={disabled || isProcessing}
              className="w-full h-1 bg-[#161c2a] rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Background Leveling Toggle */}
          <div className="pt-1 flex items-center justify-between border-t border-[rgba(212,175,55,0.08)]">
            <span className="text-xs text-[#9ea8b6]">Background Skyglow Leveling</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.background_leveling}
                onChange={(e) => handleChange("background_leveling", e.target.checked)}
                disabled={disabled || isProcessing}
                className="sr-only peer"
              />
              <div className="w-8 h-4 bg-[#161c2a] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#d4af37] after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#792518]" />
            </label>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-4 mt-4 border-t border-[rgba(212,175,55,0.12)] flex gap-2">
        <button
          type="button"
          onClick={onRestore}
          disabled={disabled || isProcessing}
          className="btn-gold flex-1 py-2 px-3 rounded text-xs flex items-center justify-center gap-1.5"
        >
          {isProcessing ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-[#07090e] border-t-transparent rounded-full animate-spin" />
              <span>Restoring on Server...</span>
            </>
          ) : (
            <>
              <Wand2 className="w-3.5 h-3.5" />
              <span>Restore Image</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleReset}
          disabled={disabled || isProcessing}
          className="btn-outline-gold p-2 rounded text-xs flex items-center justify-center"
          title="Reset to default astronomical parameters"
        >
          <RotateCcw className="w-3.5 h-3.5 text-[#9ea8b6]" />
        </button>
      </div>
    </div>
  );
};
