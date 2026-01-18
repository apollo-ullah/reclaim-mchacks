"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { useAuth } from "@/lib/auth-context";
import {
  ArrowLeft,
  Calendar,
  ExternalLink,
  Twitter,
  Globe,
  Copy,
  Check,
  PenTool,
  ShieldCheck,
  Clock
} from "lucide-react";

interface CreatorData {
  creator_id: string;
  display_name: string | null;
  bio: string | null;
  twitter: string | null;
  website: string | null;
  avatar_url: string | null;
  created_at: string;
  images: Array<{
    id: string;
    hash: string;
    signed_at: string;
    cnft_address?: string | null;
  }>;
  totalSigned: number;
  firstSigned: string | null;
  lastSigned: string | null;
}

export default function CreatorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { creator: currentUser } = useAuth();
  const [data, setData] = useState<CreatorData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const isOwnProfile = currentUser?.id === id;

  useEffect(() => {
    async function fetchCreator() {
      try {
        const response = await fetch(`/api/creator/${encodeURIComponent(id)}`);
        if (!response.ok) {
          if (response.status === 404) {
            setError("Creator not found");
          } else {
            setError("Failed to load creator data");
          }
          return;
        }
        const creatorData = await response.json();
        setData(creatorData);
      } catch {
        setError("Failed to load creator data");
      } finally {
        setIsLoading(false);
      }
    }

    fetchCreator();
  }, [id]);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#0B0F1A]">
        <Navbar />
        <div className="pt-28 px-6 pb-16">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center py-24">
              <div
                className="w-12 h-12 border-2 border-[#1E293B] rounded-full animate-spin"
                style={{ borderTopColor: '#4F7CFF' }}
              />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="min-h-screen bg-[#0B0F1A]">
        <Navbar />
        <div className="pt-28 px-6 pb-16">
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-24">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{
                  background: 'linear-gradient(135deg, rgba(91, 141, 239, 0.2) 0%, rgba(79, 124, 255, 0.2) 100%)',
                }}
              >
                <svg className="w-10 h-10 text-[#4F7CFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {error || "Creator not found"}
              </h2>
              <p className="text-[#94A3B8] mb-8">
                This creator profile doesn&apos;t exist or hasn&apos;t been set up yet.
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-[#4F7CFF] hover:text-[#5B8DEF] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to home
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const name = data.display_name || `${id.slice(0, 8)}...`;

  return (
    <main className="min-h-screen bg-[#0B0F1A]">
      <Navbar />
      <div className="pt-28 px-6 pb-16">
        <div className="max-w-4xl mx-auto">
          {/* Back Link */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-[#94A3B8] hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>

          {/* Profile Header */}
          <div
            className="rounded-2xl border border-[#1E293B] p-8 mb-8"
            style={{
              background: 'rgba(13, 17, 23, 0.6)',
              backdropFilter: 'blur(12px)'
            }}
          >
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar */}
              <div
                className="w-24 h-24 rounded-2xl flex items-center justify-center text-3xl font-bold text-white flex-shrink-0"
                style={{
                  background: 'linear-gradient(135deg, #5B8DEF 0%, #4F7CFF 100%)',
                  boxShadow: '0 8px 32px rgba(79, 124, 255, 0.3)'
                }}
              >
                {name.charAt(0).toUpperCase()}
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-1">{name}</h1>
                    <button
                      onClick={handleCopyAddress}
                      className="flex items-center gap-2 text-sm text-[#94A3B8] hover:text-white transition-colors font-mono"
                    >
                      {id.slice(0, 12)}...{id.slice(-8)}
                      {copied ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {isOwnProfile && (
                    <Link
                      href="/settings"
                      className="px-4 py-2 text-sm border border-[#1E293B] bg-[#0B0F1A] text-[#94A3B8] rounded-xl hover:bg-[#1E293B]/50 hover:text-white transition-all"
                    >
                      Edit Profile
                    </Link>
                  )}
                </div>

                {/* Bio */}
                {data.bio && (
                  <p className="text-[#94A3B8] mb-4 leading-relaxed">{data.bio}</p>
                )}

                {/* Social Links & Meta */}
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  {data.twitter && (
                    <a
                      href={`https://twitter.com/${data.twitter.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-[#94A3B8] hover:text-[#4F7CFF] transition-colors"
                    >
                      <Twitter className="w-4 h-4" />
                      @{data.twitter.replace('@', '')}
                    </a>
                  )}
                  {data.website && (
                    <a
                      href={data.website.startsWith('http') ? data.website : `https://${data.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-[#94A3B8] hover:text-[#4F7CFF] transition-colors"
                    >
                      <Globe className="w-4 h-4" />
                      {data.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  <div className="flex items-center gap-1.5 text-[#6B7280]">
                    <Calendar className="w-4 h-4" />
                    Joined {new Date(data.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div
              className="rounded-2xl border border-[#1E293B] p-6"
              style={{
                background: 'rgba(13, 17, 23, 0.6)',
                backdropFilter: 'blur(12px)'
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(79, 124, 255, 0.15)' }}
                >
                  <PenTool className="w-5 h-5 text-[#4F7CFF]" />
                </div>
                <span className="text-[#94A3B8] text-sm">Images Signed</span>
              </div>
              <p className="text-3xl font-bold text-white">{data.totalSigned}</p>
            </div>

            <div
              className="rounded-2xl border border-[#1E293B] p-6"
              style={{
                background: 'rgba(13, 17, 23, 0.6)',
                backdropFilter: 'blur(12px)'
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(16, 185, 129, 0.15)' }}
                >
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                </div>
                <span className="text-[#94A3B8] text-sm">Verified Creator</span>
              </div>
              <p className="text-lg font-semibold text-emerald-400">Active</p>
            </div>

            <div
              className="rounded-2xl border border-[#1E293B] p-6"
              style={{
                background: 'rgba(13, 17, 23, 0.6)',
                backdropFilter: 'blur(12px)'
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(245, 158, 11, 0.15)' }}
                >
                  <Clock className="w-5 h-5 text-amber-400" />
                </div>
                <span className="text-[#94A3B8] text-sm">Last Active</span>
              </div>
              <p className="text-lg font-semibold text-white">
                {data.lastSigned
                  ? new Date(data.lastSigned).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  : "N/A"}
              </p>
            </div>
          </div>

          {/* Signed Images */}
          <div
            className="rounded-2xl border border-[#1E293B] p-6"
            style={{
              background: 'rgba(13, 17, 23, 0.6)',
              backdropFilter: 'blur(12px)'
            }}
          >
            <h3 className="text-lg font-semibold text-white mb-6">Recent Activity</h3>

            {data.images.length === 0 ? (
              <div className="text-center py-12">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ background: 'rgba(79, 124, 255, 0.1)' }}
                >
                  <PenTool className="w-8 h-8 text-[#4F7CFF]" />
                </div>
                <p className="text-[#94A3B8]">No signed images yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.images.slice(0, 10).map((image) => (
                  <div
                    key={image.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-[#0B0F1A] border border-[#1E293B]/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <div>
                        <p className="text-sm font-mono text-white">{image.hash}</p>
                        <p className="text-xs text-[#6B7280]">
                          {new Date(image.signed_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                    {image.cnft_address && (
                      <a
                        href={`https://xray.helius.xyz/token/${image.cnft_address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-[#4F7CFF] hover:text-[#5B8DEF]"
                      >
                        View NFT
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
