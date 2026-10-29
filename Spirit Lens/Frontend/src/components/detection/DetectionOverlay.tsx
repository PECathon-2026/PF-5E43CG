import React from "react";
import type { CelestialSource } from "../../types/astronomy";

interface DetectionOverlayProps {
  sources: CelestialSource[];
  selectedSource: CelestialSource | null;
  onSelectSource: (source: CelestialSource | null) => void;
  imageDimensions: { width: number; height: number };
  showMarkers: boolean;
  showLabels: boolean;
  showExtended: boolean;
  activeCurtainPercent?: number;
}

export const DetectionOverlay: React.FC<DetectionOverlayProps> = ({
  sources,
  selectedSource,
  onSelectSource,
  imageDimensions,
  showMarkers,
  showLabels,
  showExtended,
}) => {
  if (!showMarkers || sources.length === 0 || !imageDimensions.width || !imageDimensions.height) {
    return null;
  }

  const { width, height } = imageDimensions;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="absolute inset-0 w-full h-full pointer-events-auto"
      style={{ overflow: "visible" }}
    >
      <defs>
        {/* Glow filter for selected stars */}
        <filter id="gold-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="vermilion-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {sources.map((src) => {
        // If user hides extended sources and this is extended, skip
        if (!showExtended && src.is_extended_candidate) {
          return null;
        }

        const isSelected = selectedSource?.id === src.id;
        const radius = Math.max(5, Math.min(src.fwhm_pixels * 1.5, 30));
        const hitRadius = Math.max(radius + 6, 16);

        return (
          <g
            key={`src-${src.id}`}
            className="cursor-pointer group"
            style={{ cursor: "pointer" }}
            onMouseDown={(e) => {
              e.stopPropagation();
            }}
            onClick={(e) => {
              e.stopPropagation();
              onSelectSource(isSelected ? null : src);
            }}
          >
            {/* Stable invisible hit target to ensure smooth, gap-free cursor interaction */}
            <circle
              cx={src.x}
              cy={src.y}
              r={hitRadius}
              fill="transparent"
              style={{ pointerEvents: "all", cursor: "pointer" }}
            />

            {/* Extended Source Bounding Ellipse */}
            {src.is_extended_candidate ? (
              <ellipse
                cx={src.x}
                cy={src.y}
                rx={Math.max(8, src.semimajor_pixels * 1.8)}
                ry={Math.max(5, src.semiminor_pixels * 1.8)}
                fill={isSelected ? "rgba(200, 62, 43, 0.25)" : "rgba(212, 175, 55, 0.08)"}
                stroke={isSelected ? "#e0533c" : "rgba(212, 175, 55, 0.6)"}
                strokeWidth={isSelected ? 2 : 1}
                strokeDasharray={isSelected ? "none" : "3,2"}
                filter={isSelected ? "url(#vermilion-glow)" : undefined}
                className="transition-colors duration-150 group-hover:stroke-[#f3cf65] group-hover:fill-[rgba(212,175,55,0.18)]"
              />
            ) : (
              /* Point-like Candidate Source Reticle */
              <>
                {/* Outer Reticle Ring */}
                <circle
                  cx={src.x}
                  cy={src.y}
                  r={radius}
                  fill={isSelected ? "rgba(212, 175, 55, 0.35)" : "rgba(212, 175, 55, 0.05)"}
                  stroke={isSelected ? "#f3cf65" : "rgba(212, 175, 55, 0.75)"}
                  strokeWidth={isSelected ? 2 : 1}
                  filter={isSelected ? "url(#gold-glow)" : undefined}
                  className="transition-colors duration-150 group-hover:stroke-[#ffffff] group-hover:fill-[rgba(212,175,55,0.25)]"
                />
                {/* Crosshairs on selected */}
                {isSelected && (
                  <>
                    <line
                      x1={src.x - radius - 4}
                      y1={src.y}
                      x2={src.x + radius + 4}
                      y2={src.y}
                      stroke="#f3cf65"
                      strokeWidth={1}
                    />
                    <line
                      x1={src.x}
                      y1={src.y - radius - 4}
                      x2={src.x}
                      y2={src.y + radius + 4}
                      stroke="#f3cf65"
                      strokeWidth={1}
                    />
                  </>
                )}
              </>
            )}

            {/* Central Precision Centroid Pip */}
            <circle
              cx={src.x}
              cy={src.y}
              r={1.5}
              fill={isSelected ? "#ffffff" : "#d4af37"}
            />

            {/* Source Label */}
            {showLabels && (
              <text
                x={src.x + radius + 3}
                y={src.y + 3}
                fill={isSelected ? "#f3cf65" : "rgba(245, 246, 248, 0.85)"}
                fontSize={Math.max(9, Math.min(width * 0.015, 12))}
                fontFamily="ui-monospace, SFMono-Regular, monospace"
                fontWeight={isSelected ? "bold" : "normal"}
                className="select-none pointer-events-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]"
              >
                #{src.id}
                {src.is_extended_candidate ? " [EXT]" : ""}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
};
