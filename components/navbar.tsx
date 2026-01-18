"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Logo } from "./Logo"

const navItems = [
  { label: "Home", href: "/" },
  { label: "Why Us", href: "/why-us" },
  { label: "Platform", href: "/platform" },
  { label: "Docs", href: "/docs" },
  { label: "Blog", href: "/blog" },
]

export function Navbar() {
  const pathname = usePathname()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-8 py-6">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between">
        {/* Logo */}
        <Logo size="lg" />

        {/* Navigation */}
        <nav className="hidden md:flex items-center bg-[#0B0F1A]/60 backdrop-blur-xl rounded-full px-2 py-2 border border-[#1E293B]/60">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "px-6 py-2.5 rounded-full text-[15px] font-medium transition-colors",
                pathname === item.href
                  ? "text-white"
                  : "text-[#94A3B8] hover:text-white"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Contact Button */}
        <Link
          href="/contact"
          className="hidden md:flex items-center px-6 py-2.5 rounded-full border border-[#1E293B] text-white text-[15px] font-medium hover:bg-[#1E293B]/50 transition-colors"
        >
          Contact Us
        </Link>
      </div>
    </header>
  )
}
