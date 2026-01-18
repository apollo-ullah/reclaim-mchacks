"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

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
        <Link href="/" className="flex items-center gap-2.5">
          <svg
            width="28"
            height="28"
            viewBox="0 0 28 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-white"
          >
            <path
              d="M7 14C7 10.134 10.134 7 14 7C17.866 7 21 10.134 21 14C21 17.866 17.866 21 14 21"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="M21 14C21 17.866 17.866 21 14 21C10.134 21 7 17.866 7 14C7 10.134 10.134 7 14 7"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
          <span className="text-white font-semibold text-[18px]">Reclaim</span>
        </Link>

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
