"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useWallet } from "@solana/wallet-adapter-react";
import { Logo } from "./Logo";

export function Header() {
  const { creator, isAuthenticated, isLoading } = useAuth();
  const { disconnect } = useWallet();

  const handleLogout = () => {
    disconnect();
  };

  return (
    <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-50 glow-header">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Logo size="lg" />

        <nav className="flex items-center gap-4 sm:gap-6">
          {isAuthenticated && (
            <Link
              href="/sign"
              className="text-sm text-zinc-400 hover:text-zinc-100 glow-link"
            >
              Sign
            </Link>
          )}
          <Link
            href="/verify"
            className="text-sm text-zinc-400 hover:text-zinc-100 glow-link"
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
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-zinc-800 transition-all"
              >
                <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-xs text-white font-medium glow-avatar">
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
                    className="block px-3 py-2 text-sm text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded transition-all relative overflow-hidden group/item"
                  >
                    <span className="relative z-10">View Profile</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-600/10 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-sm text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded transition-all relative overflow-hidden group/item"
                  >
                    <span className="relative z-10">Log Out</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-600/10 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Not authenticated - Show login/signup CTAs */
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="text-sm text-zinc-400 hover:text-zinc-100 glow-link hidden sm:inline"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="text-sm px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 glow-button relative"
              >
                <span className="relative z-10">Sign Up</span>
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
