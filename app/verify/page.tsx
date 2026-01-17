"use client";

import { useState, useCallback } from "react";
import { ImageUpload } from "@/components/ImageUpload";
import { VerificationResult } from "@/components/VerificationResult";

interface VerifyResult {
  verified: boolean;
  creator?: string;
  timestamp?: string;
  tampered?: boolean;
  message: string;
}

export default function VerifyPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<VerifyResult | null>(null);

  const handleImageSelect = useCallback((file: File) => {
    setSelectedFile(file);
    setResult(null);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleVerify = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("image", selectedFile);

      const response = await fetch("/api/verify", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setResult(data);
    } catch {
      setResult({
        verified: false,
        message: "Failed to verify image. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreview(null);
    setResult(null);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-zinc-100 mb-2">
          Verify an Image
        </h1>
        <p className="text-zinc-400">
          Check if an image has been signed with Reclaim
        </p>
      </div>

      <div className="space-y-6">
        {/* Image Upload */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <label className="block text-sm font-medium text-zinc-300 mb-3">
            Image to Verify
          </label>
          <ImageUpload
            onImageSelect={handleImageSelect}
            preview={preview}
            disabled={isLoading}
          />
        </div>

        {/* Verify Button */}
        {!result && (
          <button
            onClick={handleVerify}
            disabled={!selectedFile || isLoading}
            className="w-full py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Verifying...
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                Verify Image
              </>
            )}
          </button>
        )}

        {/* Verification Result */}
        {result && (
          <>
            <VerificationResult
              verified={result.verified}
              creator={result.creator}
              timestamp={result.timestamp}
              tampered={result.tampered}
              message={result.message}
            />

            <button
              onClick={handleReset}
              className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-medium rounded-lg border border-zinc-700 transition-colors"
            >
              Verify Another Image
            </button>
          </>
        )}

        {/* Info Box */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-zinc-400 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <p className="text-sm text-zinc-300 font-medium">
                How verification works
              </p>
              <p className="text-xs text-zinc-500 mt-1">
                We analyze the image for hidden steganographic data. If found,
                we extract the creator ID, timestamp, and signature to verify
                authenticity.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
