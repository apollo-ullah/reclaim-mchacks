"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { useAuth } from "@/lib/auth-context"
import { Save, Loader2, User, Twitter, Globe, FileText, ExternalLink } from "lucide-react"

export default function SettingsPage() {
  const router = useRouter()
  const { creator, isAuthenticated, isLoading: authLoading } = useAuth()

  const [displayName, setDisplayName] = useState("")
  const [bio, setBio] = useState("")
  const [twitter, setTwitter] = useState("")
  const [website, setWebsite] = useState("")

  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  // Load current profile data
  useEffect(() => {
    if (creator) {
      setDisplayName(creator.display_name || "")
      setBio(creator.bio || "")
      setTwitter(creator.twitter || "")
      setWebsite(creator.website || "")
    }
  }, [creator])

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/")
    }
  }, [authLoading, isAuthenticated, router])

  const handleSave = async () => {
    if (!creator?.id) return

    setIsSaving(true)
    setSaveStatus("idle")
    setErrorMessage("")

    try {
      const response = await fetch(`/api/creator/${encodeURIComponent(creator.id)}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          display_name: displayName.trim() || null,
          bio: bio.trim() || null,
          twitter: twitter.trim().replace("@", "") || null,
          website: website.trim() || null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to update profile")
      }

      setSaveStatus("success")
      setTimeout(() => setSaveStatus("idle"), 3000)
    } catch (error) {
      setSaveStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "Failed to update profile")
    } finally {
      setIsSaving(false)
    }
  }

  if (authLoading) {
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
    <DashboardLayout
      title="Profile Settings"
      description="Customize your creator profile"
    >
      <div className="max-w-2xl space-y-6">
        {/* Profile Preview Link */}
        {creator?.id && (
          <div
            className="rounded-2xl border border-[#1E293B] p-4"
            style={{
              background: 'rgba(13, 17, 23, 0.6)',
              backdropFilter: 'blur(12px)'
            }}
          >
            <a
              href={`/creator/${creator.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between text-[#94A3B8] hover:text-white transition-colors"
            >
              <span className="text-sm">View your public profile</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}

        {/* Settings Form */}
        <div
          className="rounded-2xl border border-[#1E293B] p-6"
          style={{
            background: 'rgba(13, 17, 23, 0.6)',
            backdropFilter: 'blur(12px)'
          }}
        >
          <h2 className="text-lg font-semibold text-white mb-6">Profile Information</h2>

          <div className="space-y-5">
            {/* Display Name */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-white mb-2">
                <User className="w-4 h-4 text-[#4F7CFF]" />
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your display name"
                maxLength={50}
                className="w-full px-4 py-3 rounded-xl bg-[#0B0F1A] border border-[#1E293B] text-white placeholder-[#6B7280] focus:outline-none focus:border-[#4F7CFF] transition-colors"
              />
              <p className="text-xs text-[#6B7280] mt-1.5">{displayName.length}/50 characters</p>
            </div>

            {/* Bio */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-white mb-2">
                <FileText className="w-4 h-4 text-[#4F7CFF]" />
                Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell others about yourself and your work"
                maxLength={280}
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-[#0B0F1A] border border-[#1E293B] text-white placeholder-[#6B7280] focus:outline-none focus:border-[#4F7CFF] transition-colors resize-none"
              />
              <p className="text-xs text-[#6B7280] mt-1.5">{bio.length}/280 characters</p>
            </div>

            {/* Twitter */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-white mb-2">
                <Twitter className="w-4 h-4 text-[#4F7CFF]" />
                Twitter Handle
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]">@</span>
                <input
                  type="text"
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value.replace("@", ""))}
                  placeholder="username"
                  className="w-full pl-8 pr-4 py-3 rounded-xl bg-[#0B0F1A] border border-[#1E293B] text-white placeholder-[#6B7280] focus:outline-none focus:border-[#4F7CFF] transition-colors"
                />
              </div>
            </div>

            {/* Website */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-white mb-2">
                <Globe className="w-4 h-4 text-[#4F7CFF]" />
                Website
              </label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-4 py-3 rounded-xl bg-[#0B0F1A] border border-[#1E293B] text-white placeholder-[#6B7280] focus:outline-none focus:border-[#4F7CFF] transition-colors"
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-8 flex items-center gap-4">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-2.5 px-6 py-3 text-white rounded-[14px] font-medium transition-all relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: 'rgba(79, 124, 255, 0.15)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(79, 124, 255, 0.3)',
                boxShadow: '0 8px 32px rgba(79, 124, 255, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              }}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin relative z-10" />
                  <span className="relative z-10">Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 relative z-10" />
                  <span className="relative z-10">Save Changes</span>
                </>
              )}
              <div className="absolute inset-0 bg-gradient-to-br from-[#4F7CFF]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>

            {saveStatus === "success" && (
              <span className="text-emerald-400 text-sm animate-in fade-in">
                Profile updated successfully!
              </span>
            )}

            {saveStatus === "error" && (
              <span className="text-red-400 text-sm animate-in fade-in">
                {errorMessage}
              </span>
            )}
          </div>
        </div>

        {/* Wallet Info (Read-only) */}
        <div
          className="rounded-2xl border border-[#1E293B] p-6"
          style={{
            background: 'rgba(13, 17, 23, 0.6)',
            backdropFilter: 'blur(12px)'
          }}
        >
          <h2 className="text-lg font-semibold text-white mb-4">Wallet</h2>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(79, 124, 255, 0.15)' }}
            >
              <svg className="w-5 h-5 text-[#4F7CFF]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <rect x="2" y="6" width="20" height="14" rx="2" />
                <path d="M2 10h20" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-[#94A3B8]">Connected Wallet</p>
              <p className="text-white font-mono text-sm">
                {creator?.id ? `${creator.id.slice(0, 16)}...${creator.id.slice(-8)}` : "Not connected"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
