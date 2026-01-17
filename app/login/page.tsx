"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
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
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-zinc-100 mb-2">
          Welcome Back
        </h1>
        <p className="text-zinc-400">
          Connect your wallet to access your creator account
        </p>
      </div>

      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
        {connecting || checkingAccount || isLoading ? (
          <div className="text-center py-8">
            <div className="w-10 h-10 border-2 border-zinc-700 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-zinc-400">
              {connecting ? "Connecting wallet..." : "Checking account..."}
            </p>
          </div>
        ) : (
          <div>
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>

            <p className="text-center text-zinc-400 mb-6">
              Connect the Solana wallet associated with your Reclaim account.
            </p>

            <button
              onClick={handleConnectWallet}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Connect Wallet
            </button>
          </div>
        )}
      </div>

      <p className="text-center text-zinc-500 text-sm mt-6">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-blue-400 hover:text-blue-300">
          Sign up
        </Link>
      </p>
    </div>
  );
}
