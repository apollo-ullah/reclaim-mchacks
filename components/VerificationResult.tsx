"use client";

import Link from "next/link";

interface VerificationResultProps {
  verified: boolean;
  creator?: string;
  creatorDisplayName?: string;
  timestamp?: string;
  tampered?: boolean;
  message: string;
}

export function VerificationResult({
  verified,
  creator,
  creatorDisplayName,
  timestamp,
  tampered,
  message,
}: VerificationResultProps) {
  // Use display name if available, otherwise show shortened wallet address
  const displayCreator = creatorDisplayName || (creator && creator.length > 20
    ? `${creator.slice(0, 6)}...${creator.slice(-4)}`
    : creator);
  if (verified && !tampered) {
    return (
      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center">
            <svg
              className="w-6 h-6 text-white"
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
            <h3 className="text-xl font-semibold text-emerald-400">Verified</h3>
            <p className="text-zinc-400 text-sm">{message}</p>
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-emerald-500/20">
          <div className="flex justify-between items-center">
            <span className="text-zinc-500 text-sm">Creator</span>
            <Link
              href={`/creator/${encodeURIComponent(creator || "")}`}
              className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
            >
              {displayCreator}
            </Link>
          </div>
          {timestamp && (
            <div className="flex justify-between items-center">
              <span className="text-zinc-500 text-sm">Signed</span>
              <span className="text-zinc-300">
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
        </div>
      </div>
    );
  }

  if (tampered) {
    return (
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-amber-400">
              Modified from Original
            </h3>
            <p className="text-zinc-400 text-sm">
              This image has been altered after signing
            </p>
          </div>
        </div>

        {creator && (
          <div className="space-y-2 pt-2 border-t border-amber-500/20">
            <div className="flex justify-between items-center">
              <span className="text-zinc-500 text-sm">Original Creator</span>
              <Link
                href={`/creator/${encodeURIComponent(creator)}`}
                className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
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
    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
        <div>
          <h3 className="text-xl font-semibold text-red-400">
            No Signature Found
          </h3>
          <p className="text-zinc-400 text-sm">
            Origin unknown - this image has not been signed with Reclaim
          </p>
        </div>
      </div>
    </div>
  );
}
