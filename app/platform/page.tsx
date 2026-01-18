"use client"

import { Navbar } from "@/components/navbar"
import Link from "next/link"
import { ArrowRight, Upload, Key, CheckCircle, Eye } from "lucide-react"

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Upload Your Content",
    description: "Select an image you want to authenticate. Our system supports PNG, JPEG, and WebP formats up to 10MB.",
    color: "from-[#5B8DEF] to-[#4F7CFF]"
  },
  {
    number: "02",
    icon: Key,
    title: "Cryptographic Signing",
    description: "Your content is signed with your unique wallet signature using steganography—invisible to the eye, impossible to remove.",
    color: "from-[#8B5CF6] to-[#7C3AED]"
  },
  {
    number: "03",
    icon: CheckCircle,
    title: "Blockchain Registration",
    description: "The signature is recorded on Solana blockchain, creating an immutable timestamp and proof of ownership.",
    color: "from-[#10B981] to-[#059669]"
  },
  {
    number: "04",
    icon: Eye,
    title: "Instant Verification",
    description: "Anyone can verify your image in seconds. If tampered, we detect it immediately. Authentic content shows your creator profile.",
    color: "from-[#F59E0B] to-[#D97706]"
  }
]

const technologies = [
  {
    name: "Solana Blockchain",
    description: "High-speed, low-cost blockchain for recording proofs",
    detail: "Sub-second finality with negligible fees"
  },
  {
    name: "Steganography",
    description: "Invisible watermarking that survives compression",
    detail: "LSB embedding with error correction"
  },
  {
    name: "Digital Signatures",
    description: "Ed25519 cryptographic signatures for authenticity",
    detail: "Industry-standard elliptic curve cryptography"
  },
  {
    name: "Compressed NFTs",
    description: "Cost-effective on-chain storage via Metaplex",
    detail: "Thousands of proofs for cents"
  }
]

export default function PlatformPage() {
  return (
    <main className="min-h-screen bg-[#0B0F1A]">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] pointer-events-none">
          <div className="absolute inset-0 bg-gradient-radial from-[#4F7CFF]/20 via-[#4F7CFF]/5 to-transparent rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="inline-block mb-6">
            <span className="text-[#4F7CFF] text-sm font-semibold tracking-wide uppercase">How It Works</span>
          </div>

          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Simple Process,
            <br />
            <span className="bg-gradient-to-r from-[#5B8DEF] to-[#4F7CFF] bg-clip-text text-transparent">
              Powerful Protection
            </span>
          </h1>

          <p className="text-[#94A3B8] text-xl max-w-2xl mx-auto leading-relaxed">
            From upload to verification in four seamless steps. Enterprise-grade security made accessible to everyone.
          </p>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto space-y-24">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isEven = index % 2 === 0

            return (
              <div
                key={index}
                className={`flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} gap-12 items-center`}
              >
                {/* Icon/Number Side */}
                <div className="flex-shrink-0 relative">
                  <div
                    className="w-48 h-48 rounded-3xl flex items-center justify-center relative"
                    style={{
                      background: `linear-gradient(135deg, ${step.color.split(' ')[0].replace('from-', '')} 0%, ${step.color.split(' ')[1].replace('to-', '')} 100%)`,
                      boxShadow: '0 25px 60px rgba(79, 124, 255, 0.3)'
                    }}
                  >
                    <Icon className="w-20 h-20 text-white" strokeWidth={1.5} />

                    <div
                      className="absolute -top-6 -right-6 w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white"
                      style={{
                        background: 'rgba(11, 15, 26, 0.9)',
                        border: '2px solid rgba(79, 124, 255, 0.3)',
                      }}
                    >
                      {step.number}
                    </div>
                  </div>
                </div>

                {/* Content Side */}
                <div className="flex-1">
                  <h3 className="text-4xl font-bold text-white mb-4">{step.title}</h3>
                  <p className="text-[#94A3B8] text-lg leading-relaxed">{step.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Technology Stack Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-white mb-4">
              Built on Cutting-Edge Technology
            </h2>
            <p className="text-[#94A3B8] text-lg">
              Industry-leading tools and protocols powering our platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {technologies.map((tech, index) => (
              <div
                key={index}
                className="group rounded-2xl p-8 transition-all duration-300 hover:scale-[1.02]"
                style={{
                  background: 'rgba(13, 17, 23, 0.6)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(30, 41, 59, 0.5)',
                }}
              >
                <h3 className="text-2xl font-bold text-white mb-2">{tech.name}</h3>
                <p className="text-[#94A3B8] mb-3">{tech.description}</p>
                <div
                  className="inline-block px-4 py-2 rounded-lg text-sm font-medium text-[#4F7CFF]"
                  style={{
                    background: 'rgba(79, 124, 255, 0.1)',
                    border: '1px solid rgba(79, 124, 255, 0.2)',
                  }}
                >
                  {tech.detail}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture Diagram Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div
            className="rounded-3xl p-12"
            style={{
              background: 'linear-gradient(135deg, rgba(79, 124, 255, 0.05) 0%, rgba(91, 141, 239, 0.02) 100%)',
              border: '1px solid rgba(79, 124, 255, 0.15)',
            }}
          >
            <h2 className="text-4xl font-bold text-white mb-8 text-center">
              Security Architecture
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{
                    background: 'linear-gradient(135deg, rgba(91, 141, 239, 0.2) 0%, rgba(79, 124, 255, 0.2) 100%)',
                  }}
                >
                  <svg className="w-10 h-10 text-[#4F7CFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Client-Side</h3>
                <p className="text-[#94A3B8] text-sm">Images never leave your device during signing</p>
              </div>

              <div className="text-center">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{
                    background: 'linear-gradient(135deg, rgba(91, 141, 239, 0.2) 0%, rgba(79, 124, 255, 0.2) 100%)',
                  }}
                >
                  <svg className="w-10 h-10 text-[#4F7CFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Blockchain</h3>
                <p className="text-[#94A3B8] text-sm">Immutable proof recorded on Solana</p>
              </div>

              <div className="text-center">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{
                    background: 'linear-gradient(135deg, rgba(91, 141, 239, 0.2) 0%, rgba(79, 124, 255, 0.2) 100%)',
                  }}
                >
                  <svg className="w-10 h-10 text-[#4F7CFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Verification</h3>
                <p className="text-[#94A3B8] text-sm">Public verification available to anyone</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold text-white mb-6">
            Experience the Platform
          </h2>
          <p className="text-[#94A3B8] text-xl mb-10">
            See it in action—sign your first image in under a minute
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2.5 px-10 py-4 text-white text-lg rounded-[14px] font-medium transition-all relative overflow-hidden group"
              style={{
                background: 'rgba(79, 124, 255, 0.15)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(79, 124, 255, 0.3)',
                boxShadow: '0 8px 32px rgba(79, 124, 255, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              }}
            >
              <span className="relative z-10">Get Started</span>
              <ArrowRight className="w-5 h-5 relative z-10" />
              <div className="absolute inset-0 bg-gradient-to-br from-[#4F7CFF]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>

            <Link
              href="/verify"
              className="inline-flex items-center px-10 py-4 border border-[#1E293B] bg-[#0B0F1A] text-[#94A3B8] text-lg rounded-[14px] font-medium hover:bg-[#1E293B]/50 hover:text-white transition-all"
            >
              Try Verification
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
