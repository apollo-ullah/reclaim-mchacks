"use client"

import { ReactNode, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Sidebar } from "./sidebar"
import { Aurora } from "./Aurora"

interface DashboardLayoutProps {
  children: ReactNode
  title?: string
  description?: string
}

export function DashboardLayout({ children, title, description }: DashboardLayoutProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center">
        <div className="text-center">
          <div
            className="w-12 h-12 border-2 border-[#1E293B] rounded-full animate-spin mx-auto mb-4"
            style={{ borderTopColor: '#4F7CFF' }}
          />
          <p className="text-[#94A3B8]">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#0B0F1A] relative">
      <Aurora />
      <Sidebar />

      {/* Main Content */}
      <main className="ml-64 min-h-screen relative z-10">
        {/* Header */}
        {(title || description) && (
          <header className="border-b border-[#1E293B] px-8 py-6">
            {title && (
              <h1 className="text-2xl font-bold text-white mb-1">{title}</h1>
            )}
            {description && (
              <p className="text-[#94A3B8]">{description}</p>
            )}
          </header>
        )}

        {/* Page Content */}
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
