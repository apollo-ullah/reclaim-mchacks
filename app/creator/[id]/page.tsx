"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { CreatorCard, ImageGrid } from "@/components/CreatorCard";

interface CreatorData {
  creator_id: string;
  created_at: string;
  images: Array<{
    id: number;
    hash: string;
    signed_at: string;
  }>;
  totalSigned: number;
}

export default function CreatorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [data, setData] = useState<CreatorData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center justify-center py-24">
          <svg
            className="animate-spin h-8 w-8 text-blue-500"
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
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center py-24">
          <div className="w-16 h-16 mx-auto bg-zinc-800 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-zinc-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-zinc-100 mb-2">
            {error || "Creator not found"}
          </h2>
          <p className="text-zinc-400 mb-6">
            This creator hasn&apos;t signed any images yet
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Breadcrumb */}
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-300"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to home
        </Link>
      </div>

      {/* Creator Card */}
      <CreatorCard
        creatorId={data.creator_id}
        totalSigned={data.totalSigned}
        createdAt={data.created_at}
      />

      {/* Signed Images */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-zinc-100 mb-4">
          Signed Images
        </h3>
        <ImageGrid images={data.images} />
      </div>
    </div>
  );
}
