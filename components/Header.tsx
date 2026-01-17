"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useWallet } from "@solana/wallet-adapter-react";

export function Header() {
  const { creator, isAuthenticated, isLoading } = useAuth();
  const { disconnect } = useWallet();

  const handleLogout = () => {
    disconnect();
  };

  return (
    <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
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
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <span className="font-semibold text-lg text-zinc-100">Reclaim</span>
        </Link>

        <nav className="flex items-center gap-4 sm:gap-6">
          {isAuthenticated && (
            <Link
              href="/sign"
              className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors"
            >
              Sign
            </Link>
          )}
          <Link
            href="/verify"
            className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            Verify
          </Link>

          {isLoading ? (
            <div className="w-8 h-8 rounded-full bg-zinc-800 animate-pulse" />
          ) : isAuthenticated && creator ? (
            /* Authenticated - Show creator profile dropdown */
            <div className="relative group">
              <Link
                href={`/creator/${creator.id}`}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
              >
                <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-xs text-white font-medium">
                  {creator.display_name?.[0]?.toUpperCase() || "?"}
                </div>
                <span className="hidden sm:inline text-sm text-zinc-200">
                  {creator.display_name}
                </span>
              </Link>

              {/* Dropdown */}
              <div className="absolute right-0 top-full mt-1 w-48 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <div className="p-3 border-b border-zinc-800">
                  <p className="text-sm font-medium text-zinc-200">{creator.display_name}</p>
                  <p className="text-xs text-zinc-500 font-mono mt-0.5">
                    {creator.id.slice(0, 6)}...{creator.id.slice(-4)}
                  </p>
                </div>
                <div className="p-1">
                  <Link
                    href={`/creator/${creator.id}`}
                    className="block px-3 py-2 text-sm text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded transition-colors"
                  >
                    View Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-sm text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded transition-colors"
                  >
                    Log Out
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Not authenticated - Show login/signup CTAs */
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors hidden sm:inline"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="text-sm px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all"
              >
                Sign Up
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
