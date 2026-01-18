"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useWallet } from "@solana/wallet-adapter-react"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"
import { PenTool, ShieldCheck, Sparkles, LogOut, User, Settings } from "lucide-react"
import { Logo } from "./Logo"

const navItems = [
  {
    label: "Sign",
    href: "/sign",
    icon: PenTool,
    description: "Sign your images"
  },
  {
    label: "Verify",
    href: "/verify",
    icon: ShieldCheck,
    description: "Verify authenticity"
  },
  {
    label: "Generate",
    href: "/generate",
    icon: Sparkles,
    description: "Create AI images"
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
    description: "Edit your profile"
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { disconnect } = useWallet()
  const { creator } = useAuth()

  const handleDisconnect = async () => {
    await disconnect()
    window.location.href = "/"
  }

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-[#0a0e14] border-r border-[#1E293B] flex flex-col z-40">
      {/* Logo */}
      <div className="p-6 border-b border-[#1E293B]">
        <Logo size="md" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.disabled ? "#" : item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all group",
                item.disabled && "opacity-50 cursor-not-allowed",
                isActive
                  ? "bg-[#4F7CFF]/10 text-white border border-[#4F7CFF]/30"
                  : "text-[#94A3B8] hover:text-white hover:bg-[#1E293B]/50"
              )}
              onClick={(e) => item.disabled && e.preventDefault()}
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center transition-all",
                  isActive
                    ? "bg-[#4F7CFF]/20"
                    : "bg-[#1E293B]/50 group-hover:bg-[#1E293B]"
                )}
              >
                <Icon className={cn(
                  "w-5 h-5",
                  isActive ? "text-[#4F7CFF]" : "text-[#94A3B8] group-hover:text-white"
                )} />
              </div>
              <div className="flex-1">
                <div className="font-medium text-[15px]">{item.label}</div>
                <div className="text-xs text-[#6B7280]">{item.description}</div>
              </div>
              {item.disabled && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#1E293B] text-[#6B7280]">
                  Soon
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-[#1E293B]">
        <Link
          href={creator?.id ? `/creator/${creator.id}` : "#"}
          className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#1E293B]/30 mb-3 hover:bg-[#1E293B]/50 transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#4F7CFF] to-[#5B8DEF] flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-white text-sm truncate">
              {creator?.display_name || "Creator"}
            </div>
            <div className="text-xs text-[#6B7280] truncate">
              {creator?.id ? `${creator.id.slice(0, 8)}...` : "Connected"}
            </div>
          </div>
        </Link>

        <button
          onClick={handleDisconnect}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[#94A3B8] hover:text-white hover:bg-[#1E293B]/50 transition-all text-sm"
        >
          <LogOut className="w-4 h-4" />
          <span>Disconnect</span>
        </button>
      </div>
    </aside>
  )
}
