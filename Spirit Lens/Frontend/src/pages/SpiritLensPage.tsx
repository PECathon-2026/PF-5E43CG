import React, { useState, useEffect, useRef } from "react";
import { Sparkles, Server, AlertCircle, Layers, Wand2 } from "lucide-react";
import { PageShell } from "../components/layout/PageShell";
import { ImageUploader } from "../components/upload/ImageUploader";
import { RestorationControls } from "../components/restoration/RestorationControls";
import { DetectionControls } from "../components/detection/DetectionControls";
import { ImageComparison } from "../components/restoration/ImageComparison";
import { SourceDetailsPanel } from "../components/detection/SourceDetailsPanel";
import { ResultsSummary } from "../components/results/ResultsSummary";
import { imageApi } from "../services/imageApi";
import type {
  BackendHealth,
  ImageUploadMetadata,
  RestorationSettings,
  DetectionSettings,
  JobStatus,
  JobResults,
  CelestialSource,
} from "../types/astronomy";

export const SpiritLensPage: React.FC = () => {
  // Backend health state
  const [health, setHealth] = useState<BackendHealth | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);

  // Active uploaded image state
  const [activeImage, setActiveImage] = useState<ImageUploadMetadata | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [restoredImageUrl, setRestoredImageUrl] = useState<string | null>(null);

  // Processing settings
  const [restorationSettings, setRestorationSettings] = useState<RestorationSettings>({
    denoise_strength: 15.0,
    contrast: 15.0,
    brightness: 0.0,
    sharpening: 10.0,
    background_leveling: false,
  });

  const [detectionSettings, setDetectionSettings] = useState<DetectionSettings>({
    threshold_sigma: 3.5,
    min_area_pixels: 5,
    max_sources: 300,
  });

  // Layer visibility toggles
  const [showMarkers, setShowMarkers] = useState<boolean>(true);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [showExtended, setShowExtended] = useState<boolean>(true);

  // Results & Sources state
  const [sources, setSources] = useState<CelestialSource[]>([]);
  const [selectedSource, setSelectedSource] = useState<CelestialSource | null>(null);
  const [latestResults, setLatestResults] = useState<JobResults | null>(null);

  // Job execution & polling state
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [currentStage, setCurrentStage] = useState<string | null>(null);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [processingError, setProcessingError] = useState<string | null>(null);

  // Upload state
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Polling abort controller ref
  const abortControllerRef = useRef<AbortController | null>(null);

  // Initial health check on mount
  useEffect(() => {
    let isMounted = true;
    const fetchHealth = async () => {
      try {
        const res = await imageApi.checkHealth();
        if (isMounted) {
          setHealth(res);
          setHealthError(null);
        }
      } catch (err: unknown) {
        if (isMounted) {
          setHealth(null);
          setHealthError(err instanceof Error ? err.message : "Backend unreachable");
        }
      }
    };

    fetchHealth();
    const interval = setInterval(fetchHealth, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Handle image upload completion
  const handleImageUploaded = (meta: ImageUploadMetadata, previewUrl: string) => {
    setActiveImage(meta);
    setOriginalImageUrl(previewUrl);
    setRestoredImageUrl(null);
    setSources([]);
    setSelectedSource(null);
    setLatestResults(null);
    setProcessingError(null);
  };

  // Submit restoration job
  const handleRestore = async () => {
    if (!activeImage) return;

    try {
      setIsProcessing(true);
      setProcessingError(null);
      setCurrentStage("Submitting restoration job to worker queue...");

      const abortCtrl = new AbortController();
      abortControllerRef.current = abortCtrl;

      const jobResp = await imageApi.submitRestoration(activeImage.image_id, restorationSettings);
      setActiveJobId(jobResp.job_id);

      const results = await imageApi.pollJobUntilComplete(
        jobResp.job_id,
        (st: JobStatus) => setCurrentStage(st.stage || "Processing..."),
        abortCtrl.signal
      );

      setLatestResults(results);
      if (results.urls.restored_image) {
        setRestoredImageUrl(imageApi.getRestoredImageUrl(results.job_id));
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Restoration failed";
      setProcessingError(msg);
    } finally {
      setIsProcessing(false);
      setCurrentStage(null);
      abortControllerRef.current = null;
    }
  };

  // Submit source detection job
  const handleDetect = async () => {
    if (!activeImage) return;

    try {
      setIsProcessing(true);
      setProcessingError(null);
      setCurrentStage("Submitting Photutils detection job to worker queue...");

      const abortCtrl = new AbortController();
      abortControllerRef.current = abortCtrl;

      const jobResp = await imageApi.submitDetection(activeImage.image_id, detectionSettings);
      setActiveJobId(jobResp.job_id);

      const results = await imageApi.pollJobUntilComplete(
        jobResp.job_id,
        (st: JobStatus) => setCurrentStage(st.stage || "Analyzing background noise & sources..."),
        abortCtrl.signal
      );

      setLatestResults(results);
      if (results.sources) {
        setSources(results.sources);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Detection failed";
      setProcessingError(msg);
    } finally {
      setIsProcessing(false);
      setCurrentStage(null);
      abortControllerRef.current = null;
    }
  };

  // Submit combined pipeline (Restore + Detect)
  const handleCombinedPipeline = async () => {
    if (!activeImage) return;

    try {
      setIsProcessing(true);
      setProcessingError(null);
      setCurrentStage("Enqueuing complete astronomical pipeline (Restoration & Source Extraction)...");

      const abortCtrl = new AbortController();
      abortControllerRef.current = abortCtrl;

      const jobResp = await imageApi.submitCombinedProcess(
        activeImage.image_id,
        restorationSettings,
        detectionSettings
      );
      setActiveJobId(jobResp.job_id);

      const results = await imageApi.pollJobUntilComplete(
        jobResp.job_id,
        (st: JobStatus) => setCurrentStage(st.stage || "Executing server-side processing..."),
        abortCtrl.signal
      );

      setLatestResults(results);
      if (results.urls.restored_image) {
        setRestoredImageUrl(imageApi.getRestoredImageUrl(results.job_id));
      }
      if (results.sources) {
        setSources(results.sources);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Pipeline execution failed";
      setProcessingError(msg);
    } finally {
      setIsProcessing(false);
      setCurrentStage(null);
      abortControllerRef.current = null;
    }
  };

  return (
    <PageShell health={health} healthError={healthError}>
      {/* Hero Section */}
      <div className="mb-8 border-b border-[rgba(212,175,55,0.15)] pb-6 relative">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded bg-[rgba(212,175,55,0.1)] border border-[rgba(212,175,55,0.3)] text-xs text-[#f3cf65] font-serif tracking-widest uppercase mb-3">
              <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>Tsukuyomi Watch • Module 02</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold tracking-wider text-[#f5f6f8] gold-glow">
              SPIRIT LENS
            </h1>
            <p className="mt-2 text-sm sm:text-base text-[#d4af37] font-serif italic max-w-2xl">
              "Unfurl the velvet tapestry of the cosmos, and let the quiet stars whisper their ancient, luminous secrets."
            </p>
            <p className="mt-1 text-xs sm:text-sm text-[#9ea8b6] max-w-2xl">
              Restore astronomical imagery, detect celestial sources, and explore the structure of the cosmos.
            </p>
          </div>

          {/* Server-side processing indicator */}
          <div className="shrink-0">
            {health?.server_side_processing ? (
              <div className="bg-[#090e17] border border-emerald-500/30 p-3 rounded-lg flex items-center space-x-3 shadow-[0_0_20px_rgba(16,185,129,0.08)]">
                <div className="w-8 h-8 rounded-full bg-emerald-950/60 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
                  <Server className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-[#9ea8b6] block">
                    Computational Engine
                  </span>
                  <span className="text-xs font-semibold text-emerald-400">
                    Server-side processing enabled
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-[#0e090a] border border-amber-500/30 p-3 rounded-lg flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-amber-400" />
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-[#9ea8b6] block">
                    Computational Engine
                  </span>
                  <span className="text-xs font-semibold text-amber-400">
                    Backend offline or initializing
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Uploader */}
      <ImageUploader
        onImageUploaded={handleImageUploaded}
        isUploading={isUploading}
        setIsUploading={setIsUploading}
        error={uploadError}
        setError={setUploadError}
      />

      {/* Processing Status Banner */}
      {isProcessing && (
        <div className="mb-6 p-4 rounded-lg bg-[#0e1422] border border-[#d4af37]/40 shadow-[0_0_20px_rgba(212,175,55,0.15)] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="w-4 h-4 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin" />
            <div>
              <span className="text-xs font-semibold text-[#f3cf65] block">
                Server-side Processing in Progress
              </span>
              <span className="text-[11px] text-[#9ea8b6] font-mono">
                {currentStage || "Executing astronomical algorithms..."}
              </span>
            </div>
          </div>
          {activeJobId && (
            <span className="text-[10px] font-mono text-[#606877] bg-[#07090e] px-2 py-1 rounded border border-[rgba(212,175,55,0.1)] hidden sm:inline">
              Job: {activeJobId.slice(0, 8)}...
            </span>
          )}
        </div>
      )}

      {/* Processing Error Banner */}
      {processingError && (
        <div className="mb-6 p-4 rounded-lg bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{processingError}</span>
          </div>
          <button
            type="button"
            onClick={() => setProcessingError(null)}
            className="text-xs text-red-400 hover:text-white underline ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Combined One-Click Action Banner if image is active */}
      {activeImage && (
        <div className="mb-6 p-3 bg-[#0a0f19] border border-[rgba(212,175,55,0.25)] rounded-lg flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-xs text-[#9ea8b6]">
            <Layers className="w-4 h-4 text-[#d4af37]" />
            <span>
              Active Observation: <strong className="text-[#f5f6f8]">{activeImage.original_filename}</strong> ({activeImage.width}×{activeImage.height}px)
            </span>
          </div>
          <button
            type="button"
            onClick={handleCombinedPipeline}
            disabled={isProcessing}
            className="btn-gold text-xs px-4 py-2 rounded flex items-center gap-1.5 shadow"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>Run Complete Pipeline (Restore & Detect)</span>
          </button>
        </div>
      )}

      {/* Main Analysis Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* Left Column: Restoration Controls */}
        <div className="lg:col-span-3">
          <RestorationControls
            settings={restorationSettings}
            setSettings={setRestorationSettings}
            onRestore={handleRestore}
            isProcessing={isProcessing}
            disabled={!activeImage}
          />
        </div>

        {/* Center Column: Interactive Astronomical Comparison Chamber */}
        <div className="lg:col-span-6">
          <ImageComparison
            originalUrl={originalImageUrl}
            restoredUrl={restoredImageUrl}
            sources={sources}
            selectedSource={selectedSource}
            onSelectSource={setSelectedSource}
            showMarkers={showMarkers}
            showLabels={showLabels}
            showExtended={showExtended}
            imageDimensions={
              activeImage
                ? { width: activeImage.width, height: activeImage.height }
                : { width: 512, height: 512 }
            }
          />
        </div>

        {/* Right Column: Source Detection Controls & Inspector */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <DetectionControls
            settings={detectionSettings}
            setSettings={setDetectionSettings}
            showMarkers={showMarkers}
            setShowMarkers={setShowMarkers}
            showLabels={showLabels}
            setShowLabels={setShowLabels}
            showExtended={showExtended}
            setShowExtended={setShowExtended}
            onDetect={handleDetect}
            isProcessing={isProcessing}
            disabled={!activeImage}
          />

          <SourceDetailsPanel
            selectedSource={selectedSource}
            onClearSelection={() => setSelectedSource(null)}
            sources={sources}
            onSelectSource={setSelectedSource}
          />
        </div>
      </div>

      {/* Results & Exports Summary */}
      {latestResults && <ResultsSummary results={latestResults} />}
    </PageShell>
  );
};
