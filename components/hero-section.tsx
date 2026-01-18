"use client"

import React, { useRef, useState, useCallback } from "react"

import Link from "next/link"
import { ArrowRight } from "lucide-react"

function GlowText({ text }: { text: string }) {
  const containerRef = useRef<HTMLSpanElement>(null)
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null)

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    })
  }, [])

  const handleMouseLeave = useCallback(() => {
    setMousePos(null)
  }, [])

  return (
    <span
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="inline"
    >
      {text.split('').map((char, i) => (
        <GlowChar key={i} char={char} index={i} mousePos={mousePos} containerRef={containerRef} />
      ))}
    </span>
  )
}

function GlowChar({ 
  char, 
  index, 
  mousePos, 
  containerRef 
}: { 
  char: string
  index: number
  mousePos: { x: number; y: number } | null
  containerRef: React.RefObject<HTMLSpanElement | null>
}) {
  const charRef = useRef<HTMLSpanElement>(null)
  
  let opacity = 0
  
  if (mousePos && charRef.current && containerRef.current) {
    const charRect = charRef.current.getBoundingClientRect()
    const containerRect = containerRef.current.getBoundingClientRect()
    
    const charCenterX = charRect.left - containerRect.left + charRect.width / 2
    const charCenterY = charRect.top - containerRect.top + charRect.height / 2
    
    const distance = Math.sqrt(
      Math.pow(mousePos.x - charCenterX, 2) + 
      Math.pow(mousePos.y - charCenterY, 2)
    )
    
    const maxDistance = 120
    opacity = Math.max(0, 1 - distance / maxDistance)
  }

  // Contour glow using the navbar gradient colors (blue -> purple -> pink)
  const glowShadow = opacity > 0 
    ? [
        // Tight outline glow - blue
        `0 0 1px rgba(59, 130, 246, ${opacity})`,
        `-1px -1px 2px rgba(59, 130, 246, ${opacity * 0.8})`,
        `1px 1px 2px rgba(139, 92, 246, ${opacity * 0.8})`,
        // Medium glow - purple
        `0 0 4px rgba(139, 92, 246, ${opacity * 0.7})`,
        `-2px -1px 6px rgba(59, 130, 246, ${opacity * 0.5})`,
        `2px 1px 6px rgba(236, 72, 153, ${opacity * 0.5})`,
        // Outer glow - pink
        `0 0 12px rgba(139, 92, 246, ${opacity * 0.4})`,
        `0 0 20px rgba(236, 72, 153, ${opacity * 0.2})`,
      ].join(', ')
    : 'none'

  return (
    <span
      ref={charRef}
      className="relative inline-block"
      style={{
        textShadow: glowShadow,
        transition: 'text-shadow 0.15s ease-out'
      }}
    >
      {char === ' ' ? '\u00A0' : char}
    </span>
  )
}

function FloatingIcon({
  icon,
  className,
  rotation = "rotate-12",
  delay = "0s"
}: {
  icon: React.ReactNode
  className?: string
  rotation?: string
  delay?: string
}) {
  return (
    <div
      className={`absolute ${className}`}
      style={{
        animation: `float-icon 3s ease-in-out infinite`,
        animationDelay: delay
      }}
    >
      <div
        className={`w-28 h-28 rounded-[24px] bg-gradient-to-br from-[#5B8DEF] to-[#4F7CFF] flex items-center justify-center transform ${rotation} transition-transform duration-500`}
        style={{
          boxShadow: '0 25px 70px rgba(79, 124, 255, 0.5), 0 0 100px rgba(79, 124, 255, 0.3), 0 0 150px rgba(79, 124, 255, 0.15)'
        }}
      >
        {icon}
      </div>
    </div>
  )
}

// Shield icon
function ShieldIcon() {
  return (
    <svg className="w-14 h-14 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  )
}

// Video/Film icon
function VideoIcon() {
  return (
    <svg className="w-14 h-14 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
    </svg>
  )
}

// Fingerprint icon
function FingerprintIcon() {
  return (
    <svg className="w-14 h-14 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.864 4.243A7.5 7.5 0 0119.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 004.5 10.5a7.464 7.464 0 01-1.15 3.993m1.989 3.559A11.209 11.209 0 008.25 10.5a3.75 3.75 0 117.5 0c0 .527-.021 1.049-.064 1.565M12 10.5a14.94 14.94 0 01-3.6 9.75m6.633-4.596a18.666 18.666 0 01-2.485 5.33" />
    </svg>
  )
}

// Key icon
function KeyIcon() {
  return (
    <svg className="w-14 h-14 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
    </svg>
  )
}

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-[#0B0F1A]">
      {/* Grid pattern background - bottom half only for 3D effect */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1/2"
        style={{
          backgroundImage: `linear-gradient(rgba(148, 163, 184, 0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(148, 163, 184, 0.25) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
          opacity: 0.4,
          transform: 'perspective(1000px) rotateX(60deg)',
          transformOrigin: 'bottom',
          maskImage: 'linear-gradient(to top, black 0%, transparent 100%)'
        }}
      />

      {/* Radial glow behind icons - enhanced */}
      <div className="absolute top-1/2 -translate-y-1/2 right-[15%] w-[700px] h-[700px] pointer-events-none">
        <div className="absolute inset-0 bg-gradient-radial from-[#4F7CFF]/30 via-[#4F7CFF]/10 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Additional ambient glow */}
      <div className="absolute top-1/2 -translate-y-1/2 right-[15%] w-[900px] h-[900px] pointer-events-none">
        <div className="absolute inset-0 bg-gradient-radial from-[#3B5A7D]/15 via-[#2A4461]/5 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Beam of light effect - centered on icons and wider */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 lg:left-auto lg:translate-x-0 lg:right-[15%] w-[380px] h-full pointer-events-none">
        <div
          className="absolute inset-0 bg-gradient-to-b from-[#3B5A7D]/60 via-[#2A4461]/35 to-transparent"
          style={{
            clipPath: "polygon(38% 0%, 62% 0%, 88% 100%, 12% 100%)",
            filter: 'blur(1px)'
          }}
        />
        <div
          className="absolute inset-0 bg-gradient-to-b from-[#4A6B8F]/40 via-[#3B5A7D]/15 to-transparent"
          style={{
            clipPath: "polygon(43% 0%, 57% 0%, 75% 100%, 25% 100%)",
            filter: 'blur(0.5px)'
          }}
        />
        <div
          className="absolute inset-0 bg-gradient-to-b from-[#6B8FC4]/20 via-transparent to-transparent"
          style={{
            clipPath: "polygon(45% 0%, 55% 0%, 70% 100%, 30% 100%)",
            filter: 'blur(2px)'
          }}
        />
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-8 py-20 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left side - Content */}
          <div className="space-y-7 pt-12">
            <div className="inline-block">
              <span className="text-[#6B7280] text-sm font-normal tracking-wide">[ 150+ organizations ]</span>
            </div>

            <h1 className="text-[64px] leading-[1.1] font-bold text-white tracking-tight cursor-default">
              <GlowText text="Verify Content" /><br />
              <GlowText text="Beyond Boundaries" />
            </h1>

            <p className="text-[#94A3B8] text-[18px] max-w-[550px] leading-relaxed font-normal">
              Simplified Image Authentication with Unrivaled Content Verification via Reclaim
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2.5 px-8 py-3.5 text-white rounded-[14px] font-medium transition-all relative overflow-hidden group"
                style={{
                  background: 'rgba(79, 124, 255, 0.15)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(79, 124, 255, 0.3)',
                  boxShadow: '0 8px 32px rgba(79, 124, 255, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                }}
              >
                <span className="relative z-10">Get Started</span>
                <ArrowRight className="w-4 h-4 relative z-10" />
                <div
                  className="absolute inset-0 bg-gradient-to-br from-[#4F7CFF]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </Link>
              <Link
                href="/verify"
                className="inline-flex items-center px-8 py-3.5 border border-[#1E293B] bg-[#0B0F1A] text-[#94A3B8] rounded-[14px] font-medium hover:bg-[#1E293B]/50 hover:text-white transition-all"
              >
                Verify an Image
              </Link>
            </div>
          </div>

          {/* Right side - Floating icons */}
          <div className="relative h-[600px] hidden lg:block">
            {/* Shield icon - top center */}
            <FloatingIcon
              className="top-[50px] left-1/2 -translate-x-1/2"
              rotation="rotate-[12deg]"
              delay="0s"
              icon={<ShieldIcon />}
            />

            {/* Fingerprint icon - right middle */}
            <FloatingIcon
              className="top-[190px] right-[60px]"
              rotation="rotate-[18deg]"
              delay="0.3s"
              icon={<FingerprintIcon />}
            />

            {/* Video icon - left middle */}
            <FloatingIcon
              className="top-[270px] left-[60px]"
              rotation="rotate-[-15deg]"
              delay="0.6s"
              icon={<VideoIcon />}
            />

            {/* Key icon - bottom center */}
            <FloatingIcon
              className="bottom-[60px] left-1/2 -translate-x-1/2 translate-x-[20px]"
              rotation="rotate-[-12deg]"
              delay="0.9s"
              icon={<KeyIcon />}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
