"use client"

import React from "react"

import { useState, useRef } from "react"
import { Upload, FileImage, Loader2 } from "lucide-react"
import { VerificationResult } from "./VerificationResult"

interface VerifyResponse {
  verified: boolean
  creator?: string
  creatorDisplayName?: string
  timestamp?: string
  tampered?: boolean
  message: string
}

export function VideoUpload() {
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const [result, setResult] = useState<VerifyResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && isImageFile(droppedFile)) {
      setFile(droppedFile)
      setPreview(URL.createObjectURL(droppedFile))
      setResult(null)
      setError(null)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && isImageFile(selectedFile)) {
      setFile(selectedFile)
      setPreview(URL.createObjectURL(selectedFile))
      setResult(null)
      setError(null)
    }
  }

  const isImageFile = (file: File) => {
    return ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(file.type)
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
      setError('Failed to verify image. Please try again.')
      console.error('Verification error:', err)
    } finally {
      setIsVerifying(false)
    }
  }

  const handleReset = () => {
    setFile(null)
    setPreview(null)
    setResult(null)
    setError(null)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  return (
    <div className="min-h-screen bg-[#0B0F1A] pt-28 px-6 pb-16">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
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
            <h1 className="text-3xl font-bold text-white">Verify Image</h1>
            <p className="text-[#94a3b8] text-lg">Upload an image to check its authenticity</p>
          </div>
        </div>

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
            <div className="flex flex-col items-center justify-center py-24 px-6">
              <div className="w-20 h-20 rounded-full border-2 border-[#374151] flex items-center justify-center mb-6">
                <Upload className="w-10 h-10 text-[#6b7280]" />
              </div>
              <p className="text-white font-semibold text-xl mb-2">Drop your image here</p>
              <p className="text-[#94a3b8] mb-8">or click to browse your files</p>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  inputRef.current?.click()
                }}
                className="inline-flex items-center gap-2.5 px-8 py-3.5 text-white rounded-[14px] font-medium transition-all relative overflow-hidden group"
                style={{
                  background: 'rgba(79, 124, 255, 0.15)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(79, 124, 255, 0.3)',
                  boxShadow: '0 8px 32px rgba(79, 124, 255, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                }}
              >
                <FileImage className="w-5 h-5 relative z-10" />
                <span className="relative z-10">Select Image</span>
                <div
                  className="absolute inset-0 bg-gradient-to-br from-[#4F7CFF]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </button>
              <input
                ref={inputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {/* Supported formats */}
            <div className="absolute bottom-6 left-0 right-0 text-center">
              <p className="text-[#6b7280] text-sm">
                Supports PNG, JPEG, JPG, WebP • Max 10MB
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Image Preview */}
            <div className="rounded-2xl border border-[#1e293b] bg-[#0d1117] p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {preview && (
                  <div className="flex-shrink-0">
                    <img
                      src={preview}
                      alt="Preview"
                      className="max-w-full md:max-w-xs max-h-80 rounded-xl object-contain"
                      style={{
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
                      }}
                    />
                  </div>
                )}
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-white font-semibold text-lg mb-2">Image Details</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[#94a3b8] text-sm">Filename</span>
                        <span className="text-white font-medium text-sm">{file.name}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#94a3b8] text-sm">Size</span>
                        <span className="text-white font-medium text-sm">
                          {(file.size / (1024 * 1024)).toFixed(2)} MB
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#94a3b8] text-sm">Type</span>
                        <span className="text-white font-medium text-sm">{file.type}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleVerify}
                      disabled={isVerifying}
                      className="flex-1 inline-flex items-center justify-center gap-2.5 px-6 py-3.5 text-white rounded-[14px] font-medium transition-all relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
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
                        <span className="relative z-10">Verify Image</span>
                      )}
                      <div
                        className="absolute inset-0 bg-gradient-to-br from-[#4F7CFF]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                    </button>
                    <button
                      onClick={handleReset}
                      disabled={isVerifying}
                      className="px-6 py-3.5 border border-[#1E293B] bg-[#0B0F1A] text-[#94A3B8] rounded-[14px] font-medium hover:bg-[#1E293B]/50 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-red-400 font-semibold">Error</h3>
                    <p className="text-[#94a3b8] text-sm">{error}</p>
                  </div>
                </div>
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
    </div>
  )
}
