/**
 * Type definitions for astronomical image processing, celestial sources, and jobs.
 */

export interface CelestialSource {
  id: number;
  catalog_label: number;
  x: number;
  y: number;
  flux: number;
  instrumental_magnitude: number | null;
  fwhm_pixels: number;
  semimajor_pixels: number;
  semiminor_pixels: number;
  eccentricity: number;
  classification: "point_candidate" | "extended_candidate" | "candidate_source";
  is_point_candidate: boolean;
  is_extended_candidate: boolean;
  bbox: [number, number, number, number];
}

export interface ImageUploadMetadata {
  image_id: string;
  original_filename: string;
  format: string;
  width: number;
  height: number;
  channels: number;
  size_bytes: number;
  uploaded_at: string;
  message: string;
}

export interface RestorationSettings {
  denoise_strength: number;
  contrast: number;
  brightness: number;
  sharpening: number;
  background_leveling: boolean;
}

export interface DetectionSettings {
  threshold_sigma: number;
  min_area_pixels: number;
  max_sources: number;
}

export interface JobStatus {
  job_id: string;
  image_id: string;
  status: "queued" | "processing" | "completed" | "failed";
  stage: string;
  operation: string;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  duration_seconds: number | null;
  error: string | null;
}

export interface JobResults {
  job_id: string;
  image_id: string;
  status: string;
  operation: string;
  duration_seconds: number;
  original_dimensions: { width: number; height: number };
  restored_dimensions: { width: number; height: number };
  format: string;
  method: string;
  settings: Record<string, unknown>;
  restored_image_available: boolean;
  sources?: CelestialSource[];
  source_count?: number;
  point_candidate_count?: number;
  extended_candidate_count?: number;
  background_mean?: number;
  background_median?: number;
  background_rms?: number;
  urls: {
    original_image?: string;
    restored_image?: string;
    catalog_csv?: string;
    catalog_json?: string;
    job_status?: string;
    results?: string;
  };
}

export interface BackendHealth {
  status: string;
  app_name: string;
  version: string;
  server_side_processing: boolean;
  capabilities: {
    classical_restoration: boolean;
    photutils_source_detection: boolean;
    astropy_fits_support: boolean;
    ai_neural_model_loaded: boolean;
    max_upload_size_mb: number;
    max_dimensions: string;
  };
}
