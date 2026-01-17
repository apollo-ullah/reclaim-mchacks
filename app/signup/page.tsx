"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";

export default function SignupPage() {
  const { publicKey, connected, disconnect } = useWallet();
  const { setVisible } = useWalletModal();
  const { isAuthenticated, refreshAuth } = useAuth();
  const router = useRouter();

  const [displayName, setDisplayName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/sign");
    }
  }, [isAuthenticated, router]);

  // Disconnect wallet on mount to ensure clean state
  useEffect(() => {
    if (connected && step === 1) {
      disconnect();
    }
  }, []);

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setError("Please enter a display name");
      return;
    }
    if (displayName.trim().length < 2) {
      setError("Display name must be at least 2 characters");
      return;
    }
    setError("");
    setStep(2);
  };

  const handleConnectWallet = () => {
    setVisible(true);
  };

  const handleCreateAccount = async () => {
    if (!publicKey || !displayName.trim()) return;

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet_address: publicKey.toBase58(),
          display_name: displayName.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create account");
      }

      await refreshAuth();
      router.push("/sign");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Auto-advance to step 3 when wallet connects
  useEffect(() => {
    if (connected && step === 2) {
      setStep(3);
    }
  }, [connected, step]);

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-zinc-100 mb-2">
          Create Your Creator Account
        </h1>
        <p className="text-zinc-400">
          Sign your media and prove authenticity
        </p>
      </div>

      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  step > s
                    ? "bg-green-500/20 text-green-400"
                    : step === s
                    ? "bg-blue-500/20 text-blue-400 ring-2 ring-blue-500/50"
                    : "bg-zinc-800 text-zinc-500"
                }`}
              >
                {step > s ? "✓" : s}
              </div>
              {s < 3 && (
                <div
                  className={`w-16 sm:w-24 h-0.5 mx-2 ${
                    step > s ? "bg-green-500/50" : "bg-zinc-800"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Enter Display Name */}
        {step === 1 && (
          <div>
            <h2 className="text-lg font-semibold text-zinc-100 mb-2">
              Choose your creator name
            </h2>
            <p className="text-sm text-zinc-400 mb-4">
              This is how you&apos;ll appear when others verify your signed images.
            </p>
            <form onSubmit={handleNameSubmit}>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your name"
                maxLength={50}
                autoFocus
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none mb-4"
              />
              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}
              <button
                type="submit"
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all"
              >
                Continue
              </button>
            </form>
          </div>
        )}

        {/* Step 2: Connect Wallet */}
        {step === 2 && (
          <div>
            <h2 className="text-lg font-semibold text-zinc-100 mb-2">
              Connect your Solana wallet
            </h2>
            <p className="text-sm text-zinc-400 mb-4">
              Your wallet address will be your unique creator ID. All signed images will be linked to this wallet.
            </p>

            <div className="p-4 bg-zinc-800/50 rounded-lg mb-4">
              <p className="text-sm text-zinc-300">
                Signing up as: <span className="font-medium text-zinc-100">{displayName}</span>
              </p>
            </div>

            <button
              onClick={handleConnectWallet}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Connect Wallet
            </button>

            <button
              onClick={() => setStep(1)}
              className="w-full mt-3 py-2 text-sm text-zinc-400 hover:text-zinc-300 transition-colors"
            >
              Back
            </button>
          </div>
        )}

        {/* Step 3: Confirm & Create */}
        {step === 3 && (
          <div>
            <h2 className="text-lg font-semibold text-zinc-100 mb-2">
              Confirm your account
            </h2>
            <p className="text-sm text-zinc-400 mb-4">
              Review your details and create your creator account.
            </p>

            <div className="space-y-3 mb-6">
              <div className="p-4 bg-zinc-800/50 rounded-lg">
                <p className="text-xs text-zinc-500 mb-1">Creator Name</p>
                <p className="font-medium text-zinc-100">{displayName}</p>
              </div>
              <div className="p-4 bg-zinc-800/50 rounded-lg">
                <p className="text-xs text-zinc-500 mb-1">Wallet Address</p>
                <p className="font-mono text-sm text-zinc-300">
                  {publicKey?.toBase58().slice(0, 12)}...{publicKey?.toBase58().slice(-12)}
                </p>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handleCreateAccount}
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Creating Account..." : "Create Account"}
            </button>

            <button
              onClick={() => {
                disconnect();
                setStep(2);
              }}
              className="w-full mt-3 py-2 text-sm text-zinc-400 hover:text-zinc-300 transition-colors"
            >
              Use Different Wallet
            </button>
          </div>
        )}
      </div>

      <p className="text-center text-zinc-500 text-sm mt-6">
        Already have an account?{" "}
        <Link href="/login" className="text-blue-400 hover:text-blue-300">
          Log in
        </Link>
      </p>
    </div>
  );
}
