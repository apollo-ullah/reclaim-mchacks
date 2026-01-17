"use client";

import { useCallback, useState } from "react";

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  preview?: string | null;
  disabled?: boolean;
}

export function ImageUpload({
  onImageSelect,
  preview,
  disabled = false,
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

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
        if (file.type.startsWith("image/")) {
          onImageSelect(file);
        }
      }
    },
    [onImageSelect, disabled]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        onImageSelect(files[0]);
      }
    },
    [onImageSelect]
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
        accept="image/png,image/jpeg,image/jpg"
        onChange={handleFileChange}
        disabled={disabled}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
      />

      {preview ? (
        <div className="space-y-4">
          <img
            src={preview}
            alt="Preview"
            className="max-h-64 mx-auto rounded-lg shadow-lg"
          />
          <p className="text-sm text-zinc-400">
            Click or drag to replace image
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="w-16 h-16 mx-auto bg-zinc-800 rounded-xl flex items-center justify-center">
            <svg
              className="w-8 h-8 text-zinc-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div>
            <p className="text-zinc-300 font-medium">
              Drop your image here, or click to browse
            </p>
            <p className="text-sm text-zinc-500 mt-1">
              Supports PNG and JPEG files
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
