"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Navbar } from "@/components/navbar";
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
    <>
      <Navbar />
      <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-3">
            Create Your Creator Account
          </h1>
          <p className="text-[#94A3B8] text-lg">
            Sign your media and prove authenticity
          </p>
        </div>

        <div
          className="rounded-2xl border border-[#1E293B] p-8"
          style={{
            background: 'rgba(13, 17, 23, 0.6)',
            backdropFilter: 'blur(12px)'
          }}
        >
        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-10">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                  step > s
                    ? "bg-emerald-500/20 text-emerald-400 ring-2 ring-emerald-500/30"
                    : step === s
                    ? "text-white ring-2"
                    : "bg-[#1E293B] text-[#6B7280]"
                }`}
                style={
                  step === s
                    ? {
                        background: 'linear-gradient(135deg, #5B8DEF 0%, #4F7CFF 100%)',
                        boxShadow: '0 4px 16px rgba(79, 124, 255, 0.3), 0 0 0 2px rgba(79, 124, 255, 0.5)'
                      }
                    : {}
                }
              >
                {step > s ? "✓" : s}
              </div>
              {s < 3 && (
                <div
                  className={`w-16 sm:w-24 h-0.5 mx-2 transition-all duration-300 ${
                    step > s ? "bg-emerald-500/40" : "bg-[#1E293B]"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Enter Display Name */}
        {step === 1 && (
          <div>
            <h2 className="text-xl font-bold text-white mb-2">
              Choose your creator name
            </h2>
            <p className="text-[#94A3B8] mb-6 leading-relaxed">
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
                className="w-full px-5 py-4 bg-[#0B0F1A] border border-[#1E293B] rounded-[14px] text-white placeholder-[#6B7280] focus:border-[#4F7CFF] focus:outline-none focus:ring-2 focus:ring-[#4F7CFF]/20 transition-all mb-4"
              />
              {error && (
                <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-[14px] text-red-400 text-sm">
                  {error}
                </div>
              )}
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2.5 px-8 py-4 text-white rounded-[14px] font-medium transition-all relative overflow-hidden group"
                style={{
                  background: 'rgba(79, 124, 255, 0.15)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(79, 124, 255, 0.3)',
                  boxShadow: '0 8px 32px rgba(79, 124, 255, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                }}
              >
                <span className="relative z-10">Continue</span>
                <div
                  className="absolute inset-0 bg-gradient-to-br from-[#4F7CFF]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </button>
            </form>
          </div>
        )}

        {/* Step 2: Connect Wallet */}
        {step === 2 && (
          <div>
            <h2 className="text-xl font-bold text-white mb-2">
              Connect your Solana wallet
            </h2>
            <p className="text-[#94A3B8] mb-6 leading-relaxed">
              Your wallet address will be your unique creator ID. All signed images will be linked to this wallet.
            </p>

            <div
              className="p-5 rounded-[14px] mb-6"
              style={{
                background: 'rgba(79, 124, 255, 0.05)',
                border: '1px solid rgba(79, 124, 255, 0.1)'
              }}
            >
              <p className="text-[#94A3B8]">
                Signing up as: <span className="font-semibold text-white">{displayName}</span>
              </p>
            </div>

            <button
              onClick={handleConnectWallet}
              className="w-full inline-flex items-center justify-center gap-2.5 px-8 py-4 text-white rounded-[14px] font-medium transition-all relative overflow-hidden group mb-3"
              style={{
                background: 'rgba(79, 124, 255, 0.15)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(79, 124, 255, 0.3)',
                boxShadow: '0 8px 32px rgba(79, 124, 255, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              }}
            >
              <svg className="w-5 h-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="relative z-10">Connect Wallet</span>
              <div
                className="absolute inset-0 bg-gradient-to-br from-[#4F7CFF]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </button>

            <button
              onClick={() => setStep(1)}
              className="w-full py-3 text-sm text-[#94A3B8] hover:text-white transition-colors"
            >
              Back
            </button>
          </div>
        )}

        {/* Step 3: Confirm & Create */}
        {step === 3 && (
          <div>
            <h2 className="text-xl font-bold text-white mb-2">
              Confirm your account
            </h2>
            <p className="text-[#94A3B8] mb-6 leading-relaxed">
              Review your details and create your creator account.
            </p>

            <div className="space-y-3 mb-6">
              <div
                className="p-5 rounded-[14px]"
                style={{
                  background: 'rgba(79, 124, 255, 0.05)',
                  border: '1px solid rgba(79, 124, 255, 0.1)'
                }}
              >
                <p className="text-xs text-[#6B7280] mb-2 uppercase tracking-wider font-medium">Creator Name</p>
                <p className="font-semibold text-white text-lg">{displayName}</p>
              </div>
              <div
                className="p-5 rounded-[14px]"
                style={{
                  background: 'rgba(79, 124, 255, 0.05)',
                  border: '1px solid rgba(79, 124, 255, 0.1)'
                }}
              >
                <p className="text-xs text-[#6B7280] mb-2 uppercase tracking-wider font-medium">Wallet Address</p>
                <p className="font-mono text-sm text-[#94A3B8]">
                  {publicKey?.toBase58().slice(0, 12)}...{publicKey?.toBase58().slice(-12)}
                </p>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-[14px] text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handleCreateAccount}
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center gap-2.5 px-8 py-4 text-white rounded-[14px] font-medium transition-all relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed mb-3"
              style={{
                background: 'rgba(79, 124, 255, 0.15)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(79, 124, 255, 0.3)',
                boxShadow: '0 8px 32px rgba(79, 124, 255, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              }}
            >
              <span className="relative z-10">{isSubmitting ? "Creating Account..." : "Create Account"}</span>
              <div
                className="absolute inset-0 bg-gradient-to-br from-[#4F7CFF]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </button>

            <button
              onClick={() => {
                disconnect();
                setStep(2);
              }}
              className="w-full py-3 text-sm text-[#94A3B8] hover:text-white transition-colors"
            >
              Use Different Wallet
            </button>
          </div>
        )}
      </div>

        <p className="text-center text-[#6B7280] text-sm mt-8">
          Already have an account?{" "}
          <Link href="/login" className="text-[#4F7CFF] hover:text-[#5B8DEF] font-medium transition-colors">
            Log in
          </Link>
        </p>
        </div>
      </div>
    </>
  );
}
