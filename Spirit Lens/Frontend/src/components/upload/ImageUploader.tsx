import React, { useState, useRef } from "react";
import type { DragEvent, ChangeEvent } from "react";
import { Upload, FileUp, Sparkles, X, CheckCircle2, AlertTriangle, Image as ImageIcon } from "lucide-react";
import type { ImageUploadMetadata } from "../../types/astronomy";
import { imageApi } from "../../services/imageApi";

interface ImageUploaderProps {
  onImageUploaded: (metadata: ImageUploadMetadata, localPreviewUrl: string) => void;
  isUploading: boolean;
  setIsUploading: (val: boolean) => void;
  error: string | null;
  setError: (err: string | null) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageUploaded,
  isUploading,
  setIsUploading,
  error,
  setError,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelection = (file: File) => {
    setError(null);
    setSelectedFile(file);

    // Create object URL for immediate browser preview if visual format
    if (file.name.match(/\.(png|jpe?g|webp|gif)$/i)) {
      const url = URL.createObjectURL(file);
      setLocalPreview(url);
    } else {
      // FITS / TIFF scientific raw data
      setLocalPreview(null);
    }
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const onDragLeave = () => {
    setIsDragOver(false);
  };

  const onFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleClear = () => {
    if (localPreview) {
      URL.revokeObjectURL(localPreview);
    }
    setSelectedFile(null);
    setLocalPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile) return;

    try {
      setIsUploading(true);
      setError(null);
      const meta = await imageApi.uploadImage(selectedFile);
      const previewUrl = localPreview || imageApi.getOriginalImageUrl(meta.image_id);
      onImageUploaded(meta, previewUrl);
    } catch (err: unknown) {
      console.error("[ImageUploader] Upload error:", err);
      const msg = err instanceof Error ? err.message : "Upload failed";
      setError(msg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleLoadSample = async () => {
    try {
      setIsUploading(true);
      setError(null);
      // Fetch the bundled deep-sky sample safely using Vite BASE_URL
      const sampleUrl = `${import.meta.env.BASE_URL}images/sample_nebula.png`.replace(/\/{2,}/g, "/");
      const res = await fetch(sampleUrl);
      if (!res.ok) {
        throw new Error(`Sample astronomical dataset not found (HTTP ${res.status}).`);
      }
      const blob = await res.blob();
      const file = new File([blob], "nebula_cluster_sample.png", { type: "image/png" });
      handleFileSelection(file);
    } catch (err: unknown) {
      console.error("[ImageUploader] Failed to load sample:", err);
      const msg = err instanceof Error ? err.message : "Failed to load sample";
      setError(msg);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="instrument-card p-5 sm:p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-[rgba(212,175,55,0.12)] gap-2">
        <div>
          <h2 className="text-sm font-semibold tracking-wider text-[#d4af37] uppercase flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Astronomical Image Upload & Ingestion
          </h2>
          <p className="text-xs text-[#9ea8b6]">
            Select or drop high-resolution scientific observations (PNG, JPEG, TIFF, FITS)
          </p>
        </div>
        <button
          type="button"
          onClick={handleLoadSample}
          disabled={isUploading}
          className="btn-outline-gold text-xs px-3 py-1.5 rounded flex items-center justify-center gap-1.5 self-start sm:self-auto"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
          <span>Load Astronomical Sample</span>
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".png,.jpg,.jpeg,.tif,.tiff,.fits,.fit,.fts,.webp"
        onChange={onFileInputChange}
        className="hidden"
      />

      {!selectedFile ? (
        <div
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-8 sm:p-12 text-center cursor-pointer transition-all ${
            isDragOver
              ? "border-[#d4af37] bg-[rgba(212,175,55,0.06)]"
              : "border-[rgba(212,175,55,0.2)] hover:border-[rgba(212,175,55,0.45)] bg-[#090d14]/60"
          }`}
        >
          <div className="w-12 h-12 rounded-full border border-[rgba(212,175,55,0.3)] bg-[#0e1420] mx-auto flex items-center justify-center text-[#d4af37] mb-3 shadow-[0_0_15px_rgba(212,175,55,0.1)]">
            <FileUp className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-[#f5f6f8] mb-1">
            Drag and drop observation files here, or <span className="text-[#d4af37] underline">browse files</span>
          </p>
          <p className="text-xs text-[#606877]">
            Supports PNG, JPEG, TIFF, and scientific FITS datasets up to 50 MB
          </p>
        </div>
      ) : (
        <div className="bg-[#090d15] border border-[rgba(212,175,55,0.2)] rounded-lg p-4 flex flex-col md:flex-row items-center gap-5">
          {/* Image Preview Thumbnail */}
          <div className="w-32 h-32 rounded bg-[#05070a] border border-[rgba(212,175,55,0.15)] flex items-center justify-center overflow-hidden shrink-0">
            {localPreview ? (
              <img
                src={localPreview}
                alt="Selected astronomical observation"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center p-2 text-[#9ea8b6]">
                <ImageIcon className="w-8 h-8 mx-auto mb-1 text-[#d4af37]" />
                <span className="text-[10px] uppercase font-mono tracking-wider">FITS / Scientific</span>
              </div>
            )}
          </div>

          {/* Metadata Card */}
          <div className="flex-1 min-w-0 w-full space-y-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[#f5f6f8] truncate text-sm" title={selectedFile.name}>
                {selectedFile.name}
              </span>
              <button
                type="button"
                onClick={handleClear}
                disabled={isUploading}
                className="text-[#9ea8b6] hover:text-[#c83e2b] p-1 transition-colors"
                title="Remove selection"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 py-2 text-[#9ea8b6]">
              <div>
                <span className="text-[#606877] block text-[10px] uppercase">File Size</span>
                <span className="font-mono text-[#f5f6f8]">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </span>
              </div>
              <div>
                <span className="text-[#606877] block text-[10px] uppercase">Format</span>
                <span className="font-mono text-[#d4af37] uppercase">
                  {selectedFile.name.split(".").pop() || "Unknown"}
                </span>
              </div>
              <div>
                <span className="text-[#606877] block text-[10px] uppercase">Status</span>
                <span className="text-amber-400 flex items-center gap-1">
                  Ready for Server Ingestion
                </span>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleUploadSubmit}
                disabled={isUploading}
                className="btn-gold text-xs px-4 py-2 rounded flex items-center gap-1.5 shadow"
              >
                {isUploading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-[#07090e] border-t-transparent rounded-full animate-spin" />
                    <span>Uploading & Validating...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Upload & Ingest to Server</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="btn-outline-gold text-xs px-3 py-2 rounded"
              >
                Choose Different File
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 rounded bg-red-950/30 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
