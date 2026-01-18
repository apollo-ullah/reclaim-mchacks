"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Download, Sparkles, RotateCcw, Loader2, Wand2 } from "lucide-react";

interface GenerateResult {
  success: boolean;
  signedImageBase64?: string;
  metadata?: {
    creatorId: string;
    timestamp: string;
    originalHash: string;
    version: number;
    sourceType: "ai";
    prompt: string;
  };
  error?: string;
}

export default function GeneratePage() {
  const { creator } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GenerateResult | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim() || !creator) return;

    setIsGenerating(true);
    setResult(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          creator_id: creator.id,
        }),
      });

      const data = await response.json();
      setResult(data);
    } catch {
      setResult({
        success: false,
        error: "Failed to generate image. Please try again.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!result?.signedImageBase64) return;

    const link = document.createElement("a");
    link.href = `data:image/png;base64,${result.signedImageBase64}`;
    link.download = `reclaim-ai-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    setPrompt("");
    setResult(null);
  };

  return (
    <DashboardLayout
      title="Generate AI Image"
      description="Create AI-generated images with automatic provenance watermark"
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
                    background: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
                    boxShadow: '0 4px 16px rgba(168, 85, 247, 0.3)'
                  }}
                >
                  {creator?.display_name?.[0]?.toUpperCase() || "?"}
                </div>
                <div>
                  <p className="text-sm text-[#6B7280]">Generating as</p>
                  <p className="font-semibold text-white">{creator?.display_name}</p>
                </div>
                <div className="ml-auto">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30">
                    <Sparkles className="w-3 h-3" />
                    AI-Generated
                  </span>
                </div>
              </div>
            </div>

            {/* Prompt Input */}
            <div
              className="rounded-2xl border border-[#1E293B] p-6"
              style={{
                background: 'rgba(13, 17, 23, 0.6)',
                backdropFilter: 'blur(12px)'
              }}
            >
              <label className="block text-sm font-medium text-[#94A3B8] mb-3">
                Describe your image
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A serene mountain landscape at sunset with a crystal clear lake reflecting the orange and pink sky..."
                rows={4}
                maxLength={1000}
                disabled={isGenerating}
                className="w-full px-4 py-3 rounded-xl bg-[#0B0F1A] border border-[#1E293B] text-white placeholder-[#6B7280] focus:outline-none focus:border-purple-500/50 transition-colors resize-none disabled:opacity-50"
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-[#6B7280]">Be descriptive for better results</p>
                <p className="text-xs text-[#6B7280]">{prompt.length}/1000</p>
              </div>
            </div>

            {/* Error Message */}
            {result?.error && (
              <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
                <p className="text-red-400 text-sm">{result.error}</p>
              </div>
            )}

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={!prompt.trim() || !creator || isGenerating}
              className="w-full inline-flex items-center justify-center gap-2.5 px-8 py-4 text-white rounded-[14px] font-medium transition-all relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: 'rgba(168, 85, 247, 0.15)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(168, 85, 247, 0.3)',
                boxShadow: '0 8px 32px rgba(168, 85, 247, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              }}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin relative z-10" />
                  <span className="relative z-10">Generating...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5 relative z-10" />
                  <span className="relative z-10">Generate & Sign</span>
                </>
              )}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>

            {/* Info Card */}
            <div
              className="rounded-2xl p-5"
              style={{
                background: 'rgba(168, 85, 247, 0.08)',
                border: '1px solid rgba(168, 85, 247, 0.25)'
              }}
            >
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-purple-400 mt-0.5" />
                <div>
                  <p className="text-sm text-purple-400 font-medium">AI Watermark</p>
                  <p className="text-xs text-[#94A3B8] mt-1">
                    Generated images are automatically signed with an AI watermark. When verified, anyone can see this image was created using AI.
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
                background: 'rgba(168, 85, 247, 0.08)',
                border: '1px solid rgba(168, 85, 247, 0.25)',
                boxShadow: '0 8px 32px rgba(168, 85, 247, 0.1)'
              }}
            >
              <div className="flex items-center gap-4 mb-6">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
                    boxShadow: '0 8px 24px rgba(168, 85, 247, 0.3)'
                  }}
                >
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-purple-400 text-lg">Image Generated & Signed</h3>
                  <p className="text-sm text-[#94A3B8]">AI watermark has been embedded</p>
                </div>
              </div>

              {/* Generated Image Preview */}
              <div className="bg-[#0B0F1A] rounded-xl p-4 mb-6">
                <img
                  src={`data:image/png;base64,${result.signedImageBase64}`}
                  alt="Generated image"
                  className="max-h-80 mx-auto rounded-lg"
                  style={{ boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)' }}
                />
              </div>

              {/* Prompt Used */}
              <div className="bg-[#0B0F1A] rounded-xl p-4 mb-6">
                <p className="text-xs text-[#6B7280] mb-1">Prompt</p>
                <p className="text-sm text-[#94A3B8] italic">&ldquo;{result.metadata?.prompt}&rdquo;</p>
              </div>

              {/* Metadata */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-[#6B7280]">Creator</span>
                  <span className="text-white font-medium">{result.metadata?.creatorId}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#6B7280]">Content Type</span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400">
                    <Sparkles className="w-3 h-3" />
                    AI-Generated
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#6B7280]">Generated At</span>
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
                  background: 'rgba(168, 85, 247, 0.15)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(168, 85, 247, 0.3)',
                  boxShadow: '0 8px 32px rgba(168, 85, 247, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                }}
              >
                <Download className="w-5 h-5 relative z-10" />
                <span className="relative z-10">Download Image</span>
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              <button
                onClick={handleReset}
                className="flex-1 inline-flex items-center justify-center gap-2 py-4 border border-[#1E293B] bg-[#0B0F1A] text-[#94A3B8] rounded-[14px] font-medium hover:bg-[#1E293B]/50 hover:text-white transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                Generate Another
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
