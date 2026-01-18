"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Navbar } from "@/components/navbar";
import Link from "next/link";

export default function LoginPage() {
  const { publicKey, connected, connecting } = useWallet();
  const { setVisible } = useWalletModal();
  const { isAuthenticated, needsSignup, isLoading } = useAuth();
  const router = useRouter();
  const [checkingAccount, setCheckingAccount] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/sign");
    }
  }, [isAuthenticated, router]);

  // Check if connected wallet has an account
  useEffect(() => {
    if (connected && !isLoading) {
      setCheckingAccount(true);
      // Small delay to allow auth context to update
      const timer = setTimeout(() => {
        if (needsSignup) {
          router.push("/signup");
        }
        setCheckingAccount(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [connected, needsSignup, isLoading, router]);

  const handleConnectWallet = () => {
    setVisible(true);
  };

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
            Welcome Back
          </h1>
          <p className="text-[#94A3B8] text-lg">
            Connect your wallet to access your creator account
          </p>
        </div>

        <div
          className="rounded-2xl border border-[#1E293B] p-8"
          style={{
            background: 'rgba(13, 17, 23, 0.6)',
            backdropFilter: 'blur(12px)'
          }}
        >
          {connecting || checkingAccount || isLoading ? (
            <div className="text-center py-12">
              <div
                className="w-12 h-12 border-2 border-[#1E293B] rounded-full animate-spin mx-auto mb-4"
                style={{
                  borderTopColor: '#4F7CFF'
                }}
              />
              <p className="text-[#94A3B8]">
                {connecting ? "Connecting wallet..." : "Checking account..."}
              </p>
            </div>
          ) : (
            <div>
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8"
                style={{
                  background: 'linear-gradient(135deg, rgba(91, 141, 239, 0.2) 0%, rgba(79, 124, 255, 0.2) 100%)',
                  boxShadow: '0 8px 32px rgba(79, 124, 255, 0.15)'
                }}
              >
                <svg className="w-10 h-10 text-[#4F7CFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>

              <p className="text-center text-[#94A3B8] mb-8 leading-relaxed">
                Connect the Solana wallet associated with your Reclaim account.
              </p>

              <button
                onClick={handleConnectWallet}
                className="w-full inline-flex items-center justify-center gap-2.5 px-8 py-4 text-white rounded-[14px] font-medium transition-all relative overflow-hidden group"
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
            </div>
          )}
        </div>

        <p className="text-center text-[#6B7280] text-sm mt-8">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-[#4F7CFF] hover:text-[#5B8DEF] font-medium transition-colors">
            Sign up
          </Link>
        </p>
        </div>
      </div>
    </>
  );
}
