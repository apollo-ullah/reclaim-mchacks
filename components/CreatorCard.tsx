"use client";

interface SignedImageData {
  id: number;
  hash: string;
  signed_at: string;
}

interface CreatorCardProps {
  creatorId: string;
  totalSigned: number;
  createdAt: string;
}

export function CreatorCard({
  creatorId,
  totalSigned,
  createdAt,
}: CreatorCardProps) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-2xl font-bold text-white">
          {creatorId.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 className="text-xl font-semibold text-zinc-100">{creatorId}</h2>
          <p className="text-zinc-500 text-sm">
            Member since{" "}
            {new Date(createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-zinc-800">
        <div className="flex items-center justify-between">
          <span className="text-zinc-400">Images Signed</span>
          <span className="text-2xl font-bold text-blue-400">{totalSigned}</span>
        </div>
      </div>
    </div>
  );
}

export function ImageGrid({ images }: { images: SignedImageData[] }) {
  if (images.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-500">No signed images yet</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {images.map((image) => (
        <div
          key={image.id}
          className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 space-y-2"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span className="text-sm font-medium text-zinc-300">Verified</span>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-zinc-500">Hash</p>
            <p className="text-sm font-mono text-zinc-400">{image.hash}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-zinc-500">Signed</p>
            <p className="text-sm text-zinc-400">
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
      ))}
    </div>
  );
}
