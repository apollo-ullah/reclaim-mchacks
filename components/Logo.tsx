"use client"

import Image from "next/image"
import Link from "next/link"

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl"
  showText?: boolean
  className?: string
}

const sizes = {
  sm: { icon: 28, text: "text-lg", gap: "gap-2" },
  md: { icon: 36, text: "text-xl", gap: "gap-2.5" },
  lg: { icon: 44, text: "text-2xl", gap: "gap-3" },
  xl: { icon: 52, text: "text-3xl", gap: "gap-3" },
}

export function Logo({ size = "md", showText = true, className = "" }: LogoProps) {
  const { icon, text, gap } = sizes[size]

  return (
    <Link href="/" className={`flex items-center ${gap} ${className} group transition-all`}>
      <div className="relative">
        <Image
          src="/reclaim_icon.png"
          alt="Reclaim"
          width={icon}
          height={icon}
          className="object-contain transition-all group-hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]"
          style={{ imageRendering: "pixelated" }}
          priority
        />
      </div>
      {showText && (
        <span className={`font-semibold text-white tracking-tight ${text} transition-all group-hover:text-shadow-[0_0_10px_rgba(59,130,246,0.5)]`}>
          Reclaim
        </span>
      )}
    </Link>
  )
}

