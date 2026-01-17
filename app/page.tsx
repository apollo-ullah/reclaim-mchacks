import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-4 pt-24 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-sm text-blue-400 mb-8">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
          Invisible watermarks for creators
        </div>

        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-zinc-100 mb-6">
          Prove what&apos;s{" "}
          <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            real
          </span>
        </h1>

        <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-12">
          Sign your images with invisible steganographic watermarks. Let anyone
          verify the authentic origin of your work.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/sign"
            className="w-full sm:w-auto px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
          >
            Sign an Image
          </Link>
          <Link
            href="/verify"
            className="w-full sm:w-auto px-8 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-medium rounded-lg border border-zinc-700 transition-colors"
          >
            Verify an Image
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-semibold text-zinc-100 text-center mb-12">
          How it works
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="relative p-6 bg-zinc-900 border border-zinc-800 rounded-xl">
            <div className="absolute -top-4 left-6 w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-white">
              1
            </div>
            <h3 className="text-lg font-semibold text-zinc-100 mt-4 mb-2">
              Upload Your Image
            </h3>
            <p className="text-zinc-400">
              Drop any PNG or JPEG image you want to claim ownership of.
            </p>
          </div>

          <div className="relative p-6 bg-zinc-900 border border-zinc-800 rounded-xl">
            <div className="absolute -top-4 left-6 w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-white">
              2
            </div>
            <h3 className="text-lg font-semibold text-zinc-100 mt-4 mb-2">
              Sign with Your ID
            </h3>
            <p className="text-zinc-400">
              We embed an invisible watermark with your creator identity and
              timestamp.
            </p>
          </div>

          <div className="relative p-6 bg-zinc-900 border border-zinc-800 rounded-xl">
            <div className="absolute -top-4 left-6 w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-white">
              3
            </div>
            <h3 className="text-lg font-semibold text-zinc-100 mt-4 mb-2">
              Share & Verify
            </h3>
            <p className="text-zinc-400">
              Anyone can verify the origin by uploading the signed image.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 py-16 border-t border-zinc-800">
        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-emerald-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-zinc-100">
              Invisible to the Eye
            </h3>
            <p className="text-zinc-400">
              Our steganographic watermarks are embedded in the least
              significant bits of your image. Completely invisible, but always
              verifiable.
            </p>
          </div>

          <div className="space-y-4">
            <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-purple-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-zinc-100">
              Cryptographic Proof
            </h3>
            <p className="text-zinc-400">
              Each signature includes a SHA-256 hash of the original image and a
              precise timestamp. Math doesn&apos;t lie.
            </p>
          </div>

          <div className="space-y-4">
            <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-blue-400"
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
            <h3 className="text-xl font-semibold text-zinc-100">
              Creator Profiles
            </h3>
            <p className="text-zinc-400">
              Build your portfolio of verified works. Anyone can see all images
              you&apos;ve signed and when.
            </p>
          </div>

          <div className="space-y-4">
            <div className="w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-amber-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-zinc-100">
              Instant Verification
            </h3>
            <p className="text-zinc-400">
              Upload any image to instantly check if it&apos;s been signed. Know
              the true origin in seconds.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 mt-16">
        <div className="max-w-5xl mx-auto px-4 py-8 text-center text-zinc-500 text-sm">
          <p>Built for creators who value authenticity.</p>
        </div>
      </footer>
    </div>
  );
}
