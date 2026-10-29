import React, { useState, useRef, useCallback, useEffect } from "react";
import type { MouseEvent, TouchEvent } from "react";
import { ZoomIn, ZoomOut, RotateCcw, SplitSquareVertical, Eye, Layers } from "lucide-react";
import { DetectionOverlay } from "../detection/DetectionOverlay";
import type { CelestialSource } from "../../types/astronomy";

interface ImageComparisonProps {
  originalUrl: string | null;
  restoredUrl: string | null;
  sources: CelestialSource[];
  selectedSource: CelestialSource | null;
  onSelectSource: (source: CelestialSource | null) => void;
  showMarkers: boolean;
  showLabels: boolean;
  showExtended: boolean;
  imageDimensions: { width: number; height: number };
}

export const ImageComparison: React.FC<ImageComparisonProps> = ({
  originalUrl,
  restoredUrl,
  sources,
  selectedSource,
  onSelectSource,
  showMarkers,
  showLabels,
  showExtended,
  imageDimensions,
}) => {
  // Divider position percentage (0 to 100)
  const [sliderPos, setSliderPos] = useState<number>(50);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Zoom & Pan
  const [zoom, setZoom] = useState<number>(1.0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);

  // Divider dragging handlers
  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pos = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(pos);
  }, []);

  const onMouseDownDivider = (e: MouseEvent) => {
    e.stopPropagation();
    setIsDragging(true);
  };

  const onTouchStartDivider = (e: TouchEvent) => {
    e.stopPropagation();
    setIsDragging(true);
  };

  useEffect(() => {
    const handleGlobalMouseMove = (e: globalThis.MouseEvent) => {
      if (isDragging) {
        handleMove(e.clientX);
      }
    };
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    const handleGlobalTouchMove = (e: globalThis.TouchEvent) => {
      if (isDragging && e.touches.length > 0) {
        handleMove(e.touches[0].clientX);
      }
    };
    const handleGlobalTouchEnd = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleGlobalMouseMove);
      window.addEventListener("mouseup", handleGlobalMouseUp);
      window.addEventListener("touchmove", handleGlobalTouchMove);
      window.addEventListener("touchmove", handleGlobalTouchMove);
      window.addEventListener("touchend", handleGlobalTouchEnd);
    }

    return () => {
      window.removeEventListener("mousemove", handleGlobalMouseMove);
      window.removeEventListener("mouseup", handleGlobalMouseUp);
      window.removeEventListener("touchmove", handleGlobalTouchMove);
      window.removeEventListener("touchend", handleGlobalTouchEnd);
    };
  }, [isDragging, handleMove]);

  // Pan handlers
  const onMouseDownContainer = (e: MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0 || isDragging) return;
    setIsPanning(true);
    panStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const onMouseMoveContainer = (e: MouseEvent<HTMLDivElement>) => {
    if (!isPanning) return;
    setPan({
      x: e.clientX - panStartRef.current.x,
      y: e.clientY - panStartRef.current.y,
    });
  };

  const onMouseUpContainer = () => {
    setIsPanning(false);
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 4.0));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const handleResetZoom = () => {
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
    setSliderPos(50);
  };

  const hasRestored = Boolean(restoredUrl);

  return (
    <div className="instrument-card p-4 sm:p-5 flex flex-col h-full">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between pb-3 mb-3 border-b border-[rgba(212,175,55,0.12)] gap-2 text-xs">
        <div className="flex items-center space-x-2">
          <SplitSquareVertical className="w-4 h-4 text-[#d4af37]" />
          <h3 className="text-sm font-semibold tracking-wider text-[#d4af37] uppercase">
            Astronomical Inspection Chamber
          </h3>
        </div>

        {/* View & Zoom Controls */}
        <div className="flex items-center space-x-2 bg-[#090d14] px-2 py-1 rounded border border-[rgba(212,175,55,0.15)]">
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-1 text-[#9ea8b6] hover:text-[#f5f6f8] transition-colors"
            title="Zoom Out (-)"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="font-mono text-[11px] text-[#d4af37] w-12 text-center select-none">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={handleZoomIn}
            className="p-1 text-[#9ea8b6] hover:text-[#f5f6f8] transition-colors"
            title="Zoom In (+)"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <div className="w-[1px] h-3.5 bg-[rgba(212,175,55,0.2)] mx-1" />
          <button
            type="button"
            onClick={handleResetZoom}
            className="p-1 text-[#9ea8b6] hover:text-[#f5f6f8] transition-colors"
            title="Reset Zoom & Pan"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Visual Chamber */}
      <div
        ref={containerRef}
        onMouseDown={onMouseDownContainer}
        onMouseMove={onMouseMoveContainer}
        onMouseUp={onMouseUpContainer}
        onMouseLeave={onMouseUpContainer}
        className="relative flex-1 min-h-[420px] sm:min-h-[520px] w-full bg-[#030407] rounded border border-[rgba(212,175,55,0.2)] overflow-hidden flex items-center justify-center select-none"
        style={{ cursor: isPanning ? "grabbing" : "grab" }}
      >
        {!originalUrl ? (
          <div className="text-center p-8 text-[#606877]">
            <Eye className="w-10 h-10 mx-auto mb-3 text-[#9b8032] opacity-40 animate-pulse" />
            <p className="text-sm font-medium text-[#9ea8b6] mb-1">Observation Chamber Inactive</p>
            <p className="text-xs">Upload an astronomical observation to begin inspection and analysis.</p>
          </div>
        ) : (
          <div
            className="relative w-full h-full flex items-center justify-center transition-transform duration-75 ease-out"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: "center center",
            }}
          >
            {/* Layer 1: Restored Output (Underneath) or Original if no restored */}
            <div className="relative max-w-full max-h-full flex items-center justify-center">
              <img
                src={hasRestored ? restoredUrl! : originalUrl}
                alt="Astronomical observation"
                className="max-w-full max-h-[500px] object-contain block pointer-events-none"
              />

              {/* Layer 2: Split Curtain for Original Image if restored is available */}
              {hasRestored && (
                <div
                  className="absolute inset-0 overflow-hidden pointer-events-none"
                  style={{
                    clipPath: `polygon(0% 0%, ${sliderPos}% 0%, ${sliderPos}% 100%, 0% 100%)`,
                  }}
                >
                  <img
                    src={originalUrl}
                    alt="Original observation"
                    className="w-full h-full object-contain block"
                  />
                </div>
              )}

              {/* Layer 3: Celestial Detection Overlays (SVG) */}
              <DetectionOverlay
                sources={sources}
                selectedSource={selectedSource}
                onSelectSource={onSelectSource}
                imageDimensions={imageDimensions}
                showMarkers={showMarkers}
                showLabels={showLabels}
                showExtended={showExtended}
              />
            </div>
          </div>
        )}

        {/* Draggable Divider Line (Curtain Handle) */}
        {hasRestored && originalUrl && (
          <div
            className="absolute top-0 bottom-0 z-20 pointer-events-auto"
            style={{ left: `${sliderPos}%` }}
          >
            {/* Vertical Line */}
            <div className="w-[2px] h-full bg-[#f3cf65] shadow-[0_0_10px_rgba(212,175,55,0.8)] -translate-x-1/2" />
            {/* Grabber Handle Pip */}
            <div
              onMouseDown={onMouseDownDivider}
              onTouchStart={onTouchStartDivider}
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-[#0d121c] border-2 border-[#f3cf65] shadow-[0_0_15px_rgba(212,175,55,0.6)] flex items-center justify-center cursor-ew-resize hover:scale-110 active:scale-95 transition-transform"
            >
              <div className="flex gap-0.5">
                <div className="w-0.5 h-3 bg-[#d4af37]" />
                <div className="w-0.5 h-3 bg-[#d4af37]" />
              </div>
            </div>
          </div>
        )}

        {/* Labels: Original (Left) vs Restored (Right) */}
        {hasRestored && (
          <>
            <div className="absolute top-3 left-3 bg-[#07090e]/85 backdrop-blur border border-[rgba(212,175,55,0.2)] px-2.5 py-1 rounded text-[10px] uppercase font-mono tracking-wider text-[#9ea8b6] z-10">
              Original Observation
            </div>
            <div className="absolute top-3 right-3 bg-[#07090e]/85 backdrop-blur border border-[#d4af37]/40 px-2.5 py-1 rounded text-[10px] uppercase font-mono tracking-wider text-[#f3cf65] z-10 flex items-center gap-1 shadow-[0_0_10px_rgba(212,175,55,0.15)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37] animate-pulse" />
              Restored Output
            </div>
          </>
        )}
      </div>

      {/* Chamber Status Bar */}
      <div className="pt-3 mt-2 flex flex-wrap items-center justify-between text-[11px] text-[#606877] border-t border-[rgba(212,175,55,0.08)] gap-2">
        <div className="flex items-center space-x-3">
          <span>Dimensions: <strong className="font-mono text-[#9ea8b6]">{imageDimensions.width} × {imageDimensions.height} px</strong></span>
          {sources.length > 0 && (
            <span>Sources: <strong className="font-mono text-[#d4af37]">{sources.length}</strong></span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasRestored ? (
            <span className="text-[#d4af37] flex items-center gap-1">
              <Layers className="w-3 h-3" />
              Interactive Split Comparison Active
            </span>
          ) : (
            <span>Raw observation preview</span>
          )}
        </div>
      </div>
    </div>
  );
};
