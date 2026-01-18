"use client";

import { useCallback, useState } from "react";
import { Film, Image as ImageIcon } from "lucide-react";

interface MediaUploadProps {
  onFileSelect: (file: File) => void;
  preview?: string | null;
  mediaType?: "image" | "video" | null;
  disabled?: boolean;
  acceptVideo?: boolean;
}

const IMAGE_TYPES = ["image/png", "image/jpeg", "image/jpg"];
const VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/webm"];

export function MediaUpload({
  onFileSelect,
  preview,
  mediaType,
  disabled = false,
  acceptVideo = true,
}: MediaUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  const acceptTypes = acceptVideo
    ? [...IMAGE_TYPES, ...VIDEO_TYPES]
    : IMAGE_TYPES;

  const acceptString = acceptTypes.join(",");

  const isValidFile = (file: File) => {
    return acceptTypes.includes(file.type);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled) return;

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        const file = files[0];
        if (isValidFile(file)) {
          onFileSelect(file);
        }
      }
    },
    [onFileSelect, disabled, acceptVideo]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        onFileSelect(files[0]);
      }
    },
    [onFileSelect]
  );

  return (
    <div
      className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
        isDragging
          ? "border-blue-500 bg-blue-500/10"
          : "border-zinc-700 hover:border-zinc-500"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept={acceptString}
        onChange={handleFileChange}
        disabled={disabled}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
      />

      {preview ? (
        <div className="space-y-4">
          {mediaType === "video" ? (
            <video
              src={preview}
              className="max-h-64 mx-auto rounded-lg shadow-lg"
              controls
              muted
              playsInline
            />
          ) : (
            <img
              src={preview}
              alt="Preview"
              className="max-h-64 mx-auto rounded-lg shadow-lg"
            />
          )}
          <p className="text-sm text-zinc-400">
            Click or drag to replace {mediaType || "file"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="w-16 h-16 mx-auto bg-zinc-800 rounded-xl flex items-center justify-center gap-2">
            <ImageIcon className="w-6 h-6 text-zinc-400" />
            {acceptVideo && <Film className="w-6 h-6 text-zinc-400" />}
          </div>
          <div>
            <p className="text-zinc-300 font-medium">
              Drop your {acceptVideo ? "image or video" : "image"} here, or click to browse
            </p>
            <p className="text-sm text-zinc-500 mt-1">
              {acceptVideo
                ? "Supports PNG, JPEG, MP4, MOV, WebM (videos max 10s)"
                : "Supports PNG and JPEG files"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
