"use client";

import { useState, useCallback } from "react";
import { ImageUpload } from "@/components/ImageUpload";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";

interface SignResult {
  success: boolean;
  signedImageBase64?: string;
  metadata?: {
    creatorId: string;
    timestamp: string;
    originalHash: string;
    version: number;
  };
  error?: string;
}

export default function SignPage() {
  const { creator, isAuthenticated, isLoading: authLoading } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SignResult | null>(null);

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

  const handleSign = async () => {
    if (!selectedFile || !creator) return;

    setIsLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("image", selectedFile);
      formData.append("creator_id", creator.id);

      const response = await fetch("/api/sign", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setResult(data);
    } catch {
      setResult({
        success: false,
        error: "Failed to sign image. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!result?.signedImageBase64) return;

    const link = document.createElement("a");
    link.href = `data:image/png;base64,${result.signedImageBase64}`;
    link.download = `reclaim-signed-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreview(null);
    setResult(null);
  };

  // Show auth required message if not authenticated
  if (authLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-zinc-700 border-t-zinc-400 rounded-full animate-spin mx-auto" />
          <p className="text-zinc-400 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-zinc-100 mb-2">Sign an Image</h1>
          <p className="text-zinc-400">
            Embed your invisible watermark to claim ownership
          </p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-zinc-100 mb-2">Creator Account Required</h2>
          <p className="text-zinc-400 mb-6">
            Create a creator account to start signing your images with your unique identity.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all"
            >
              Create Account
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-zinc-800 text-zinc-100 rounded-lg font-medium hover:bg-zinc-700 transition-all border border-zinc-700"
            >
              Log In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-zinc-100 mb-2">Sign an Image</h1>
        <p className="text-zinc-400">
          Embed your invisible watermark to claim ownership
        </p>
      </div>

      {!result?.success ? (
        <div className="space-y-6">
          {/* Creator Info */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                {creator?.display_name?.[0]?.toUpperCase() || "?"}
              </div>
              <div>
                <p className="text-sm text-zinc-400">Signing as</p>
                <p className="font-medium text-zinc-100">{creator?.display_name}</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-xs text-zinc-500">Wallet</p>
                <p className="text-xs font-mono text-zinc-400">
                  {creator?.id.slice(0, 6)}...{creator?.id.slice(-4)}
                </p>
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <label className="block text-sm font-medium text-zinc-300 mb-3">
              Image
            </label>
            <ImageUpload
              onImageSelect={handleImageSelect}
              preview={preview}
              disabled={isLoading}
            />
          </div>

          {/* Error Message */}
          {result?.error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <p className="text-red-400 text-sm">{result.error}</p>
            </div>
          )}

          {/* Sign Button */}
          <button
            onClick={handleSign}
            disabled={!selectedFile || !creator || isLoading}
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
                Signing...
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
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
                Sign Image
              </>
            )}
          </button>

          {/* Format Warning */}
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-amber-400 mt-0.5"
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
                <p className="text-sm text-amber-200 font-medium">
                  Output Format
                </p>
                <p className="text-xs text-amber-200/70 mt-1">
                  Signed images are always saved as PNG to preserve the
                  watermark. JPEG compression can destroy the hidden data.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Success Result */}
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-emerald-400">
                  Image Signed Successfully
                </h3>
                <p className="text-sm text-zinc-400">
                  Your watermark has been embedded
                </p>
              </div>
            </div>

            {/* Signed Image Preview */}
            <div className="bg-zinc-900 rounded-lg p-4 mb-4">
              <img
                src={`data:image/png;base64,${result.signedImageBase64}`}
                alt="Signed image"
                className="max-h-64 mx-auto rounded-lg"
              />
            </div>

            {/* Metadata */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-500">Creator</span>
                <span className="text-zinc-300">{result.metadata?.creatorId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Signed At</span>
                <span className="text-zinc-300">
                  {result.metadata?.timestamp &&
                    new Date(result.metadata.timestamp).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Image Hash</span>
                <span className="font-mono text-zinc-300">
                  {result.metadata?.originalHash}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleDownload}
              className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
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
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Download Signed Image
            </button>
            <button
              onClick={handleReset}
              className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-medium rounded-lg border border-zinc-700 transition-colors"
            >
              Sign Another Image
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
