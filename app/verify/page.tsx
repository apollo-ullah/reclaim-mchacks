"use client"

import { useState, useRef, useEffect } from "react"
import { Upload, FileImage, Loader2, RotateCcw, Bug, Zap, Binary, Film } from "lucide-react"
import { VerificationResult } from "@/components/VerificationResult"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Navbar } from "@/components/navbar"
import { Aurora } from "@/components/Aurora"
import { useAuth } from "@/lib/auth-context"

interface VerifyResponse {
  verified: boolean
  creator?: string
  creatorDisplayName?: string
  timestamp?: string
  tampered?: boolean
  sourceType?: "authentic" | "ai"
  message: string
  mediaType?: "image" | "video"
  duration?: number
  c2pa?: {
    found: boolean
    valid?: boolean
    author?: string
    timestamp?: string
    validationStatus?: string
  }
}

const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
const VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm']

function VerifyContent() {
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const [result, setResult] = useState<VerifyResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Dev tools state
  const [showDevTools, setShowDevTools] = useState(false)
  const [isTampering, setIsTampering] = useState(false)
  const [tamperMessage, setTamperMessage] = useState<string | null>(null)

  // Keyboard shortcut to toggle dev tools (Ctrl+Shift+D)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault()
        setShowDevTools(prev => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Apply tampering to the current image (only for images)
  const handleTamper = async (mode: 'byte' | 'pixel') => {
    if (!file || mediaType !== 'image') return

    setIsTampering(true)
    setTamperMessage(null)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('image', file)
      formData.append('mode', mode)

      const response = await fetch('/api/dev/tamper', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        // Convert base64 to blob and create new file
        const binaryString = atob(data.tamperedImageBase64)
        const bytes = new Uint8Array(binaryString.length)
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i)
        }
        const blob = new Blob([bytes], { type: 'image/png' })
        const tamperedFile = new File([blob], `tampered_${file.name}`, { type: 'image/png' })

        // Update state with tampered file
        setFile(tamperedFile)
        setPreview(URL.createObjectURL(blob))
        setTamperMessage(`${mode === 'byte' ? 'Byte' : 'Pixel'} tampering applied: ${data.description}`)
      } else {
        setTamperMessage(`Error: ${data.error}`)
      }
    } catch (err) {
      setTamperMessage('Failed to apply tampering')
      console.error('Tamper error:', err)
    } finally {
      setIsTampering(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const isValidFile = (file: File) => {
    return IMAGE_TYPES.includes(file.type) || VIDEO_TYPES.includes(file.type)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && isValidFile(droppedFile)) {
      const isVideo = VIDEO_TYPES.includes(droppedFile.type)
      setFile(droppedFile)
      setPreview(URL.createObjectURL(droppedFile))
      setMediaType(isVideo ? "video" : "image")
      setResult(null)
      setError(null)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && isValidFile(selectedFile)) {
      const isVideo = VIDEO_TYPES.includes(selectedFile.type)
      setFile(selectedFile)
      setPreview(URL.createObjectURL(selectedFile))
      setMediaType(isVideo ? "video" : "image")
      setResult(null)
      setError(null)
    }
  }

  const handleVerify = async () => {
    if (!file) return

    setIsVerifying(true)
    setError(null)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch('/api/verify', {
        method: 'POST',
        body: formData,
      })

      const data: VerifyResponse = await response.json()
      setResult(data)
    } catch (err) {
      setError('Failed to verify file. Please try again.')
      console.error('Verification error:', err)
    } finally {
      setIsVerifying(false)
    }
  }

  const handleReset = () => {
    setFile(null)
    setPreview(null)
    setMediaType(null)
    setResult(null)
    setError(null)
    setTamperMessage(null)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  return (
    <div className="max-w-3xl">
      {/* Upload Area */}
      {!file ? (
        <div
          className={`relative rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer ${
            isDragging
              ? "border-[#4F7CFF] bg-[#4F7CFF]/10"
              : "border-[#1e293b] bg-[#0d1117] hover:border-[#374151]"
          }`}
          onClick={() => inputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center py-20 px-6">
            <div className="w-16 h-16 rounded-full border-2 border-[#374151] flex items-center justify-center mb-5">
              <Upload className="w-8 h-8 text-[#6b7280]" />
            </div>
            <p className="text-white font-semibold text-lg mb-1">Drop your file here</p>
            <p className="text-[#94a3b8] mb-6 text-sm">or click to browse your files</p>
            <button
              onClick={(e) => {
                e.stopPropagation()
                inputRef.current?.click()
              }}
              className="inline-flex items-center gap-2.5 px-6 py-3 text-white rounded-[14px] font-medium transition-all relative overflow-hidden group"
              style={{
                background: 'rgba(79, 124, 255, 0.15)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(79, 124, 255, 0.3)',
                boxShadow: '0 8px 32px rgba(79, 124, 255, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              }}
            >
              <FileImage className="w-5 h-5 relative z-10" />
              <span className="relative z-10">Select File</span>
              <div className="absolute inset-0 bg-gradient-to-br from-[#4F7CFF]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            <input
              ref={inputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp,video/mp4,video/quicktime,video/webm"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          <div className="absolute bottom-4 left-0 right-0 text-center">
            <p className="text-[#6b7280] text-xs">
              Supports PNG, JPEG, WebP, MP4, MOV, WebM (videos max 10s)
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Media Preview */}
          <div
            className="rounded-2xl border border-[#1e293b] p-6"
            style={{
              background: 'rgba(13, 17, 23, 0.6)',
              backdropFilter: 'blur(12px)'
            }}
          >
            <div className="flex flex-col md:flex-row gap-6">
              {preview && (
                <div className="flex-shrink-0">
                  {mediaType === "video" ? (
                    <video
                      src={preview}
                      className="max-w-full md:max-w-[200px] max-h-48 rounded-xl object-contain"
                      style={{ boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)' }}
                      controls
                      muted
                      playsInline
                    />
                  ) : (
                    <img
                      src={preview}
                      alt="Preview"
                      className="max-w-full md:max-w-[200px] max-h-48 rounded-xl object-contain"
                      style={{ boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)' }}
                    />
                  )}
                </div>
              )}
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="text-white font-semibold mb-2">File Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-[#94a3b8]">Filename</span>
                      <span className="text-white font-medium truncate max-w-[200px]">{file.name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#94a3b8]">Type</span>
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                        {mediaType === "video" ? (
                          <>
                            <Film className="w-3 h-3" />
                            Video
                          </>
                        ) : (
                          <>
                            <FileImage className="w-3 h-3" />
                            Image
                          </>
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#94a3b8]">Size</span>
                      <span className="text-white font-medium">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleVerify}
                    disabled={isVerifying || isTampering}
                    className="flex-1 inline-flex items-center justify-center gap-2.5 px-6 py-3 text-white rounded-[14px] font-medium transition-all relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: 'rgba(79, 124, 255, 0.15)',
                      backdropFilter: 'blur(12px)',
                      border: '1px solid rgba(79, 124, 255, 0.3)',
                      boxShadow: '0 8px 32px rgba(79, 124, 255, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                    }}
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin relative z-10" />
                        <span className="relative z-10">Verifying...</span>
                      </>
                    ) : (
                      <span className="relative z-10">Verify {mediaType === "video" ? "Video" : "Image"}</span>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#4F7CFF]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                  <button
                    onClick={handleReset}
                    disabled={isVerifying || isTampering}
                    className="px-4 py-3 border border-[#1E293B] bg-[#0B0F1A] text-[#94A3B8] rounded-[14px] font-medium hover:bg-[#1E293B]/50 hover:text-white transition-all disabled:opacity-50"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>
                  {/* Dev tools toggle button - discrete (only for images) */}
                  {mediaType === "image" && (
                    <button
                      onClick={() => setShowDevTools(prev => !prev)}
                      className={`px-4 py-3 rounded-[14px] font-medium transition-all ${
                        showDevTools
                          ? 'border border-orange-500/30 bg-orange-500/10 text-orange-400'
                          : 'border border-[#1E293B] bg-[#0B0F1A] text-[#6B7280] hover:text-[#94A3B8]'
                      }`}
                      title="Toggle Dev Tools (Ctrl+Shift+D)"
                    >
                      <Bug className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Dev Tools Panel (only for images) */}
          {showDevTools && mediaType === "image" && (
            <div
              className="rounded-2xl border border-orange-500/30 p-4 animate-in fade-in slide-in-from-top-2 duration-300"
              style={{ background: 'rgba(249, 115, 22, 0.05)' }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Bug className="w-4 h-4 text-orange-400" />
                <span className="text-orange-400 font-semibold text-sm">Dev Tools - Tamper Demo</span>
                <span className="text-[#6B7280] text-xs ml-auto">Ctrl+Shift+D to toggle</span>
              </div>
              <p className="text-[#94A3B8] text-xs mb-4">
                Apply tampering to demonstrate that our detection works. Upload a signed image first, then apply tampering, then verify.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => handleTamper('byte')}
                  disabled={isTampering || isVerifying}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25"
                >
                  {isTampering ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Binary className="w-4 h-4" />
                  )}
                  <span>Byte Tamper</span>
                </button>
                <button
                  onClick={() => handleTamper('pixel')}
                  disabled={isTampering || isVerifying}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-amber-500/15 border border-amber-500/30 text-amber-400 hover:bg-amber-500/25"
                >
                  {isTampering ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Zap className="w-4 h-4" />
                  )}
                  <span>Pixel Tamper</span>
                </button>
              </div>
              <div className="mt-3 text-xs space-y-1">
                <p className="text-red-400/80">
                  <strong>Byte:</strong> Modifies raw bytes → C2PA detects hash mismatch → <span className="text-red-400">tampered: true</span>
                </p>
                <p className="text-amber-400/80">
                  <strong>Pixel:</strong> Re-encodes image → Strips C2PA metadata → <span className="text-amber-400">c2pa.found: false</span>
                </p>
              </div>
              {tamperMessage && (
                <div className="mt-3 p-2 rounded-lg bg-[#0B0F1A] border border-[#1E293B]">
                  <p className="text-xs text-[#94A3B8]">{tamperMessage}</p>
                </div>
              )}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Verification Result */}
          {result && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <VerificationResult {...result} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function VerifyPage() {
  const { isAuthenticated, isLoading } = useAuth()

  // Show loading state
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

  // Authenticated users see dashboard layout
  if (isAuthenticated) {
    return (
      <DashboardLayout
        title="Verify Media"
        description="Check if an image or video has been signed and verify its authenticity"
      >
        <VerifyContent />
      </DashboardLayout>
    )
  }

  // Public users see regular navbar
  return (
    <main className="min-h-screen bg-[#0B0F1A] relative">
      <Aurora />
      <Navbar />
      <div className="pt-28 px-6 pb-16 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #5B8DEF 0%, #4F7CFF 100%)',
                boxShadow: '0 8px 24px rgba(79, 124, 255, 0.3)'
              }}
            >
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Verify Media</h1>
              <p className="text-[#94a3b8] text-lg">Upload an image or video to check its authenticity</p>
            </div>
          </div>
          <VerifyContent />
        </div>
      </div>
    </main>
  )
}
