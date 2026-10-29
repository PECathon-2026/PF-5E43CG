import React from "react";
import { Download, FileSpreadsheet, FileJson, CheckCircle2, Clock, Activity, Disc, Layers } from "lucide-react";
import type { JobResults } from "../../types/astronomy";
import { imageApi } from "../../services/imageApi";

interface ResultsSummaryProps {
  results: JobResults;
}

export const ResultsSummary: React.FC<ResultsSummaryProps> = ({ results }) => {
  const hasRestored = Boolean(results.urls.restored_image);
  const hasCatalog = Boolean(results.urls.catalog_csv);

  const handleDownloadRestored = () => {
    if (results.job_id) {
      window.open(imageApi.getRestoredImageUrl(results.job_id), "_blank");
    }
  };

  const handleDownloadCsv = () => {
    if (results.job_id) {
      window.open(imageApi.getCsvCatalogUrl(results.job_id), "_blank");
    }
  };

  const handleDownloadJson = () => {
    if (results.job_id) {
      window.open(imageApi.getJsonCatalogUrl(results.job_id), "_blank");
    }
  };

  return (
    <div className="instrument-card p-5 sm:p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-[rgba(212,175,55,0.12)] gap-2">
        <div>
          <h2 className="text-sm font-semibold tracking-wider text-[#d4af37] uppercase flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Astronomical Processing Results & Data Export
          </h2>
          <p className="text-xs text-[#9ea8b6]">
            Server-side computational outputs, telemetry, and verified astronomical measurements
          </p>
        </div>

        {/* Action Downloads */}
        <div className="flex flex-wrap items-center gap-2">
          {hasRestored && (
            <button
              type="button"
              onClick={handleDownloadRestored}
              className="btn-gold text-xs px-3 py-1.5 rounded flex items-center gap-1.5 shadow"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Restored PNG</span>
            </button>
          )}

          {hasCatalog && (
            <>
              <button
                type="button"
                onClick={handleDownloadCsv}
                className="btn-outline-gold text-xs px-3 py-1.5 rounded flex items-center gap-1.5"
                title="Download standard astronomical CSV catalog"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span>Export CSV Catalog</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadJson}
                className="btn-outline-gold text-xs px-3 py-1.5 rounded flex items-center gap-1.5"
                title="Download full JSON measurements"
              >
                <FileJson className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>Export JSON Catalog</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Real Scientific Telemetry Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
        <div className="bg-[#090d15] p-3 rounded border border-[rgba(212,175,55,0.12)]">
          <span className="text-[#606877] block text-[10px] uppercase flex items-center gap-1">
            <Clock className="w-3 h-3 text-[#d4af37]" />
            Duration
          </span>
          <span className="font-mono text-sm text-[#f5f6f8] font-semibold">
            {results.duration_seconds.toFixed(2)}s
          </span>
        </div>

        <div className="bg-[#090d15] p-3 rounded border border-[rgba(212,175,55,0.12)]">
          <span className="text-[#606877] block text-[10px] uppercase flex items-center gap-1">
            <Disc className="w-3 h-3 text-[#d4af37]" />
            Detected Sources
          </span>
          <span className="font-mono text-sm text-[#d4af37] font-semibold">
            {results.source_count !== undefined ? results.source_count : "N/A"}
          </span>
        </div>

        <div className="bg-[#090d15] p-3 rounded border border-[rgba(212,175,55,0.12)]">
          <span className="text-[#606877] block text-[10px] uppercase">Point Candidates</span>
          <span className="font-mono text-sm text-emerald-400 font-semibold">
            {results.point_candidate_count !== undefined ? results.point_candidate_count : "—"}
          </span>
        </div>

        <div className="bg-[#090d15] p-3 rounded border border-[rgba(212,175,55,0.12)]">
          <span className="text-[#606877] block text-[10px] uppercase">Extended Objects</span>
          <span className="font-mono text-sm text-amber-400 font-semibold">
            {results.extended_candidate_count !== undefined ? results.extended_candidate_count : "—"}
          </span>
        </div>

        <div className="bg-[#090d15] p-3 rounded border border-[rgba(212,175,55,0.12)]">
          <span className="text-[#606877] block text-[10px] uppercase flex items-center gap-1">
            <Activity className="w-3 h-3 text-[#d4af37]" />
            Background RMS (σ)
          </span>
          <span className="font-mono text-sm text-[#9ea8b6]">
            {results.background_rms !== undefined && results.background_rms !== null
              ? results.background_rms.toFixed(2)
              : "N/A"}
          </span>
        </div>

        <div className="bg-[#090d15] p-3 rounded border border-[rgba(212,175,55,0.12)]">
          <span className="text-[#606877] block text-[10px] uppercase flex items-center gap-1">
            <Layers className="w-3 h-3 text-[#d4af37]" />
            Method Applied
          </span>
          <span className="font-mono text-[11px] text-[#f5f6f8] truncate" title={results.method}>
            {results.method === "classical_astronomical_pipeline" ? "Classical CLAHE/NLM" : results.method}
          </span>
        </div>
      </div>
    </div>
  );
};
