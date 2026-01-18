"use client";

import Link from "next/link";
import { ShieldCheck, Sparkles, BadgeCheck, FileCheck2, AlertTriangle } from "lucide-react";

interface C2PAInfo {
  found: boolean;
  valid?: boolean;
  author?: string;
  timestamp?: string;
  validationStatus?: string;
}

interface VerificationResultProps {
  verified: boolean;
  creator?: string;
  creatorDisplayName?: string;
  timestamp?: string;
  tampered?: boolean;
  sourceType?: "authentic" | "ai";
  message: string;
  c2pa?: C2PAInfo;
}

export function VerificationResult({
  verified,
  creator,
  creatorDisplayName,
  timestamp,
  tampered,
  sourceType,
  message,
  c2pa,
}: VerificationResultProps) {
  // Use display name if available, otherwise show shortened wallet address
  const displayCreator = creatorDisplayName || (creator && creator.length > 20
    ? `${creator.slice(0, 6)}...${creator.slice(-4)}`
    : creator);
  if (verified && !tampered) {
    const isAI = sourceType === "ai";

    return (
      <div
        className="rounded-2xl p-8 space-y-5"
        style={{
          background: isAI ? 'rgba(168, 85, 247, 0.08)' : 'rgba(16, 185, 129, 0.08)',
          border: isAI ? '1px solid rgba(168, 85, 247, 0.25)' : '1px solid rgba(16, 185, 129, 0.25)',
          boxShadow: isAI ? '0 8px 32px rgba(168, 85, 247, 0.1)' : '0 8px 32px rgba(16, 185, 129, 0.1)'
        }}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              background: isAI
                ? 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)'
                : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              boxShadow: isAI
                ? '0 8px 24px rgba(168, 85, 247, 0.3)'
                : '0 8px 24px rgba(16, 185, 129, 0.3)'
            }}
          >
            {isAI ? (
              <Sparkles className="w-7 h-7 text-white" />
            ) : (
              <svg
                className="w-7 h-7 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
          </div>
          <div>
            <h3 className={`text-2xl font-bold mb-1 ${isAI ? 'text-purple-400' : 'text-emerald-400'}`}>
              {isAI ? 'AI-Generated Content' : 'Verified Authentic'}
            </h3>
            <p className="text-[#94A3B8]">{message}</p>
          </div>
        </div>

        {/* Source Type Badge */}
        <div className="flex flex-wrap gap-3">
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl ${
              isAI
                ? 'bg-purple-500/15 border border-purple-500/30'
                : 'bg-emerald-500/15 border border-emerald-500/30'
            }`}
          >
            {isAI ? (
              <>
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="text-purple-400 font-medium text-sm">
                  AI-Generated Content
                </span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 font-medium text-sm">
                  Human-Created Content
                </span>
              </>
            )}
          </div>

          {/* C2PA Badge */}
          {c2pa?.found && (
            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl ${
                c2pa.valid
                  ? 'bg-blue-500/15 border border-blue-500/30'
                  : 'bg-amber-500/15 border border-amber-500/30'
              }`}
            >
              <FileCheck2 className={`w-4 h-4 ${c2pa.valid ? 'text-blue-400' : 'text-amber-400'}`} />
              <span className={`font-medium text-sm ${c2pa.valid ? 'text-blue-400' : 'text-amber-400'}`}>
                {c2pa.valid ? 'C2PA Verified' : 'C2PA Present'}
              </span>
            </div>
          )}

          {/* C2PA Missing Warning */}
          {c2pa && !c2pa.found && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500/15 border border-orange-500/30">
              <AlertTriangle className="w-4 h-4 text-orange-400" />
              <span className="font-medium text-sm text-orange-400">
                C2PA Not Found
              </span>
            </div>
          )}
        </div>

        <div className={`space-y-3 pt-3 border-t ${isAI ? 'border-purple-500/20' : 'border-emerald-500/20'}`}>
          <div className="flex justify-between items-center">
            <span className="text-[#6B7280] text-sm font-medium">Creator</span>
            <Link
              href={`/creator/${encodeURIComponent(creator || "")}`}
              className="text-[#4F7CFF] hover:text-[#5B8DEF] transition-colors font-semibold"
            >
              {displayCreator}
            </Link>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#6B7280] text-sm font-medium">Content Type</span>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
              isAI
                ? 'bg-purple-500/20 text-purple-400'
                : 'bg-emerald-500/20 text-emerald-400'
            }`}>
              {isAI ? (
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
          {timestamp && (
            <div className="flex justify-between items-center">
              <span className="text-[#6B7280] text-sm font-medium">Signed</span>
              <span className="text-white font-medium">
                {new Date(timestamp).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          )}
          {c2pa?.found && (
            <div className="flex justify-between items-center">
              <span className="text-[#6B7280] text-sm font-medium">C2PA Status</span>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                c2pa.valid
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'bg-amber-500/20 text-amber-400'
              }`}>
                <FileCheck2 className="w-3 h-3" />
                {c2pa.valid ? 'Cryptographically Verified' : 'Manifest Found'}
              </span>
            </div>
          )}
          {c2pa && !c2pa.found && (
            <div className="flex justify-between items-center">
              <span className="text-[#6B7280] text-sm font-medium">C2PA Status</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-500/20 text-orange-400">
                <AlertTriangle className="w-3 h-3" />
                Metadata Stripped (Re-encoded?)
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (tampered) {
    return (
      <div
        className="rounded-2xl p-8 space-y-5"
        style={{
          background: 'rgba(245, 158, 11, 0.08)',
          border: '1px solid rgba(245, 158, 11, 0.25)',
          boxShadow: '0 8px 32px rgba(245, 158, 11, 0.1)'
        }}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              boxShadow: '0 8px 24px rgba(245, 158, 11, 0.3)'
            }}
          >
            <svg
              className="w-7 h-7 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-amber-400 mb-1">
              Modified from Original
            </h3>
            <p className="text-[#94A3B8]">
              This image has been altered after signing
            </p>
          </div>
        </div>

        {creator && (
          <div className="space-y-3 pt-3 border-t border-amber-500/20">
            <div className="flex justify-between items-center">
              <span className="text-[#6B7280] text-sm font-medium">Original Creator</span>
              <Link
                href={`/creator/${encodeURIComponent(creator)}`}
                className="text-[#4F7CFF] hover:text-[#5B8DEF] transition-colors font-semibold"
              >
                {displayCreator}
              </Link>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl p-8"
      style={{
        background: 'rgba(239, 68, 68, 0.08)',
        border: '1px solid rgba(239, 68, 68, 0.25)',
        boxShadow: '0 8px 32px rgba(239, 68, 68, 0.1)'
      }}
    >
      <div className="flex items-center gap-4">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            boxShadow: '0 8px 24px rgba(239, 68, 68, 0.3)'
          }}
        >
          <svg
            className="w-7 h-7 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
        <div>
          <h3 className="text-2xl font-bold text-red-400 mb-1">
            No Signature Found
          </h3>
          <p className="text-[#94A3B8]">
            Origin unknown - this image has not been signed with Reclaim
          </p>
        </div>
      </div>
    </div>
  );
}
