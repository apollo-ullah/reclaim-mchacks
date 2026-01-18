"use client";

import { useState, useCallback } from "react";
import { ImageUpload } from "@/components/ImageUpload";
import { useAuth } from "@/lib/auth-context";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Download, PenTool, RotateCcw, Sparkles, ShieldCheck } from "lucide-react";

type SourceType = "authentic" | "ai";

interface SignResult {
  success: boolean;
  signedImageBase64?: string;
  metadata?: {
    creatorId: string;
    timestamp: string;
    originalHash: string;
    version: number;
    sourceType: SourceType;
  };
  error?: string;
}

export default function SignPage() {
  const { creator } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SignResult | null>(null);
  const [sourceType, setSourceType] = useState<SourceType>("authentic");

  const handleImageSelect = useCallback((file: File) => {
    setSelectedFile(file);
    setResult(null);

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
      formData.append("source_type", sourceType);

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
    setSourceType("authentic");
  };

  return (
    <DashboardLayout
      title="Sign Image"
      description="Embed your invisible watermark to prove ownership"
    >
      <div className="max-w-2xl">
        {!result?.success ? (
          <div className="space-y-6">
            {/* Creator Info Card */}
            <div
              className="rounded-2xl border border-[#1E293B] p-5"
              style={{
                background: 'rgba(13, 17, 23, 0.6)',
                backdropFilter: 'blur(12px)'
              }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg"
                  style={{
                    background: 'linear-gradient(135deg, #5B8DEF 0%, #4F7CFF 100%)',
                    boxShadow: '0 4px 16px rgba(79, 124, 255, 0.3)'
                  }}
                >
                  {creator?.display_name?.[0]?.toUpperCase() || "?"}
                </div>
                <div>
                  <p className="text-sm text-[#6B7280]">Signing as</p>
                  <p className="font-semibold text-white">{creator?.display_name}</p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-xs text-[#6B7280]">Wallet</p>
                  <p className="text-xs font-mono text-[#94A3B8]">
                    {creator?.id.slice(0, 6)}...{creator?.id.slice(-4)}
                  </p>
                </div>
              </div>
            </div>

            {/* Source Type Selector */}
            <div
              className="rounded-2xl border border-[#1E293B] p-5"
              style={{
                background: 'rgba(13, 17, 23, 0.6)',
                backdropFilter: 'blur(12px)'
              }}
            >
              <label className="block text-sm font-medium text-[#94A3B8] mb-3">
                Content Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSourceType("authentic")}
                  className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                    sourceType === "authentic"
                      ? "border-emerald-500/50 bg-emerald-500/10"
                      : "border-[#1E293B] bg-[#0B0F1A] hover:border-[#374151]"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      sourceType === "authentic"
                        ? "bg-emerald-500/20"
                        : "bg-[#1E293B]"
                    }`}
                  >
                    <ShieldCheck
                      className={`w-5 h-5 ${
                        sourceType === "authentic" ? "text-emerald-400" : "text-[#6B7280]"
                      }`}
                    />
                  </div>
                  <div className="text-left">
                    <p className={`font-medium ${sourceType === "authentic" ? "text-white" : "text-[#94A3B8]"}`}>
                      Authentic
                    </p>
                    <p className="text-xs text-[#6B7280]">Human-created content</p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setSourceType("ai")}
                  className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                    sourceType === "ai"
                      ? "border-purple-500/50 bg-purple-500/10"
                      : "border-[#1E293B] bg-[#0B0F1A] hover:border-[#374151]"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      sourceType === "ai"
                        ? "bg-purple-500/20"
                        : "bg-[#1E293B]"
                    }`}
                  >
                    <Sparkles
                      className={`w-5 h-5 ${
                        sourceType === "ai" ? "text-purple-400" : "text-[#6B7280]"
                      }`}
                    />
                  </div>
                  <div className="text-left">
                    <p className={`font-medium ${sourceType === "ai" ? "text-white" : "text-[#94A3B8]"}`}>
                      AI-Generated
                    </p>
                    <p className="text-xs text-[#6B7280]">Made with AI tools</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Image Upload */}
            <div
              className="rounded-2xl border border-[#1E293B] p-6"
              style={{
                background: 'rgba(13, 17, 23, 0.6)',
                backdropFilter: 'blur(12px)'
              }}
            >
              <label className="block text-sm font-medium text-[#94A3B8] mb-3">
                Select Image
              </label>
              <ImageUpload
                onImageSelect={handleImageSelect}
                preview={preview}
                disabled={isLoading}
              />
            </div>

            {/* Error Message */}
            {result?.error && (
              <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
                <p className="text-red-400 text-sm">{result.error}</p>
              </div>
            )}

            {/* Sign Button */}
            <button
              onClick={handleSign}
              disabled={!selectedFile || !creator || isLoading}
              className="w-full inline-flex items-center justify-center gap-2.5 px-8 py-4 text-white rounded-[14px] font-medium transition-all relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: 'rgba(79, 124, 255, 0.15)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(79, 124, 255, 0.3)',
                boxShadow: '0 8px 32px rgba(79, 124, 255, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              }}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 relative z-10" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span className="relative z-10">Signing...</span>
                </>
              ) : (
                <>
                  <PenTool className="w-5 h-5 relative z-10" />
                  <span className="relative z-10">Sign Image</span>
                </>
              )}
              <div className="absolute inset-0 bg-gradient-to-br from-[#4F7CFF]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>

            {/* Format Warning */}
            <div
              className="rounded-2xl p-5"
              style={{
                background: 'rgba(245, 158, 11, 0.08)',
                border: '1px solid rgba(245, 158, 11, 0.25)'
              }}
            >
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-amber-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm text-amber-400 font-medium">Output Format</p>
                  <p className="text-xs text-[#94A3B8] mt-1">
                    Signed images are always saved as PNG to preserve the watermark. JPEG compression can destroy the hidden data.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Success Result */}
            <div
              className="rounded-2xl p-6"
              style={{
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                boxShadow: '0 8px 32px rgba(16, 185, 129, 0.1)'
              }}
            >
              <div className="flex items-center gap-4 mb-6">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)'
                  }}
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-emerald-400 text-lg">Image Signed Successfully</h3>
                  <p className="text-sm text-[#94A3B8]">Your watermark has been embedded</p>
                </div>
              </div>

              {/* Signed Image Preview */}
              <div className="bg-[#0B0F1A] rounded-xl p-4 mb-6">
                <img
                  src={`data:image/png;base64,${result.signedImageBase64}`}
                  alt="Signed image"
                  className="max-h-64 mx-auto rounded-lg"
                  style={{ boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)' }}
                />
              </div>

              {/* Metadata */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-[#6B7280]">Creator</span>
                  <span className="text-white font-medium">{result.metadata?.creatorId}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#6B7280]">Content Type</span>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                    result.metadata?.sourceType === "ai"
                      ? "bg-purple-500/20 text-purple-400"
                      : "bg-emerald-500/20 text-emerald-400"
                  }`}>
                    {result.metadata?.sourceType === "ai" ? (
                      <>
                        <Sparkles className="w-3 h-3" />
                        AI-Generated
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-3 h-3" />
                        Authentic
                      </>
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#6B7280]">Signed At</span>
                  <span className="text-white font-medium">
                    {result.metadata?.timestamp && new Date(result.metadata.timestamp).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#6B7280]">Image Hash</span>
                  <span className="font-mono text-[#94A3B8]">{result.metadata?.originalHash}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleDownload}
                className="flex-1 inline-flex items-center justify-center gap-2.5 px-6 py-4 text-white rounded-[14px] font-medium transition-all relative overflow-hidden group"
                style={{
                  background: 'rgba(79, 124, 255, 0.15)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(79, 124, 255, 0.3)',
                  boxShadow: '0 8px 32px rgba(79, 124, 255, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                }}
              >
                <Download className="w-5 h-5 relative z-10" />
                <span className="relative z-10">Download Signed Image</span>
                <div className="absolute inset-0 bg-gradient-to-br from-[#4F7CFF]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              <button
                onClick={handleReset}
                className="flex-1 inline-flex items-center justify-center gap-2 py-4 border border-[#1E293B] bg-[#0B0F1A] text-[#94A3B8] rounded-[14px] font-medium hover:bg-[#1E293B]/50 hover:text-white transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                Sign Another
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
