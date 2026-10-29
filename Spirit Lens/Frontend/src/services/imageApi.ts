/**
 * Centralized API client for Tsukuyomi Watch master backend.
 */

import type {
  BackendHealth,
  ImageUploadMetadata,
  RestorationSettings,
  DetectionSettings,
  JobStatus,
  JobResults,
} from "../types/astronomy";

const RAW_API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";
const API_BASE_URL = RAW_API_BASE_URL.trim().replace(/\/+$/, "");

class ImageApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Internal wrapper for resilient fetch requests with descriptive network error diagnostics.
   */
  private async request(path: string, options: RequestInit = {}): Promise<Response> {
    const url = `${this.baseUrl}${path}`;
    let res: Response;

    try {
      res = await fetch(url, options);
    } catch (err: unknown) {
      console.error(`[ImageApiClient] Network request failed for ${options.method || "GET"} ${url}:`, err);

      const isNetworkOrConnectionError =
        err instanceof TypeError &&
        (err.message.toLowerCase().includes("fetch") ||
          err.message.toLowerCase().includes("network") ||
          err.message.toLowerCase().includes("failed"));

      if (isNetworkOrConnectionError) {
        throw new Error(
          `Cannot connect to master backend at ${this.baseUrl || window.location.origin}. ` +
          `Please ensure the FastAPI server is running (python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000).`
        );
      }
      throw err;
    }

    if (!res.ok) {
      let detailMsg = `HTTP ${res.status}: ${res.statusText || "Server Error"}`;
      try {
        const errJson = await res.json();
        if (errJson && typeof errJson.detail === "string") {
          detailMsg = errJson.detail;
        } else if (errJson && typeof errJson.message === "string") {
          detailMsg = errJson.message;
        }
      } catch {
        // Response wasn't JSON, use status text
      }
      throw new Error(detailMsg);
    }

    return res;
  }

  /**
   * Health check to confirm server-side processing connectivity.
   */
  async checkHealth(): Promise<BackendHealth> {
    const res = await this.request("/api/v1/health");
    return res.json();
  }

  /**
   * Upload astronomical image using multipart/form-data.
   * Note: The browser automatically generates the multipart boundary; do not set Content-Type manually.
   */
  async uploadImage(file: File): Promise<ImageUploadMetadata> {
    const formData = new FormData();
    formData.append("file", file, file.name);

    const res = await this.request("/api/v1/images/upload", {
      method: "POST",
      body: formData,
    });

    return res.json();
  }

  /**
   * Submit restoration job.
   */
  async submitRestoration(
    imageId: string,
    settings: RestorationSettings
  ): Promise<{ job_id: string; status: string }> {
    const res = await this.request(`/api/v1/images/${imageId}/restore`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });

    return res.json();
  }

  /**
   * Submit celestial source detection job.
   */
  async submitDetection(
    imageId: string,
    settings: DetectionSettings
  ): Promise<{ job_id: string; status: string }> {
    const res = await this.request(`/api/v1/images/${imageId}/detect`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });

    return res.json();
  }

  /**
   * Submit combined restoration and detection job.
   */
  async submitCombinedProcess(
    imageId: string,
    restorationSettings: RestorationSettings,
    detectionSettings: DetectionSettings
  ): Promise<{ job_id: string; status: string }> {
    const res = await this.request(`/api/v1/images/${imageId}/process`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        restoration: restorationSettings,
        detection: detectionSettings,
      }),
    });

    return res.json();
  }

  /**
   * Poll job status by job ID.
   */
  async getJobStatus(jobId: string): Promise<JobStatus> {
    const res = await this.request(`/api/v1/jobs/${jobId}`);
    return res.json();
  }

  /**
   * Retrieve full result payload for completed job.
   */
  async getJobResults(jobId: string): Promise<JobResults> {
    const res = await this.request(`/api/v1/jobs/${jobId}/results`);
    return res.json();
  }

  /**
   * Resolve full URL for original image.
   */
  getOriginalImageUrl(imageId: string): string {
    return `${this.baseUrl}/api/v1/images/${imageId}/original?preview=true`;
  }

  /**
   * Resolve full URL for restored output image.
   */
  getRestoredImageUrl(jobId: string): string {
    return `${this.baseUrl}/api/v1/jobs/${jobId}/restored`;
  }

  /**
   * Resolve full URL for CSV catalog export.
   */
  getCsvCatalogUrl(jobId: string): string {
    return `${this.baseUrl}/api/v1/jobs/${jobId}/catalog.csv`;
  }

  /**
   * Resolve full URL for JSON catalog export.
   */
  getJsonCatalogUrl(jobId: string): string {
    return `${this.baseUrl}/api/v1/jobs/${jobId}/catalog.json`;
  }

  /**
   * Poll job with backoff until completed or failed, with abort support.
   */
  async pollJobUntilComplete(
    jobId: string,
    onProgress?: (status: JobStatus) => void,
    signal?: AbortSignal
  ): Promise<JobResults> {
    let delay = 600;
    const maxRetries = 120; // up to ~120s
    let attempts = 0;

    while (attempts < maxRetries) {
      if (signal?.aborted) {
        throw new Error("Job polling cancelled.");
      }

      const st = await this.getJobStatus(jobId);
      if (onProgress) {
        onProgress(st);
      }

      if (st.status === "completed") {
        return this.getJobResults(jobId);
      } else if (st.status === "failed") {
        throw new Error(st.error || "Astronomical processing failed on server worker.");
      }

      await new Promise((resolve) => setTimeout(resolve, delay));
      attempts++;
      // Moderate backoff up to 1.5s
      delay = Math.min(delay + 100, 1500);
    }

    throw new Error("Processing job timed out waiting for server completion.");
  }
}

export const imageApi = new ImageApiClient();
