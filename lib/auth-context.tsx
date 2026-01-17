"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

interface Creator {
  id: string;
  display_name: string | null;
  created_at: string;
}

interface AuthContextType {
  creator: Creator | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  walletConnected: boolean;
  needsSignup: boolean;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { publicKey, connected } = useWallet();
  const [creator, setCreator] = useState<Creator | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [needsSignup, setNeedsSignup] = useState(false);

  const checkAuth = async () => {
    if (!publicKey) {
      setCreator(null);
      setNeedsSignup(false);
      return;
    }

    setIsLoading(true);
    try {
      const walletAddress = publicKey.toBase58();
      const response = await fetch(`/api/auth/check?wallet=${walletAddress}`);
      const data = await response.json();

      if (data.exists) {
        setCreator(data.creator);
        setNeedsSignup(false);
      } else {
        setCreator(null);
        setNeedsSignup(true);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setCreator(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, [publicKey]);

  const refreshAuth = async () => {
    await checkAuth();
  };

  return (
    <AuthContext.Provider
      value={{
        creator,
        isLoading,
        isAuthenticated: !!creator,
        walletConnected: connected,
        needsSignup,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  // Return default values if used outside provider (e.g., during static generation)
  if (context === undefined) {
    return {
      creator: null,
      isLoading: true,
      isAuthenticated: false,
      walletConnected: false,
      needsSignup: false,
      refreshAuth: async () => {},
    };
  }
  return context;
}
