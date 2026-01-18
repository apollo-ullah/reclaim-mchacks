"use client"

import { Navbar } from "@/components/navbar"
import Link from "next/link"
import { ArrowRight, Shield, Zap, Globe, Lock, Check } from "lucide-react"

const features = [
  {
    icon: Shield,
    title: "Unbreakable Authentication",
    description: "Military-grade cryptographic signatures embedded directly into your images, making tampering instantly detectable."
  },
  {
    icon: Zap,
    title: "Lightning Fast Verification",
    description: "Verify content authenticity in milliseconds. Our optimized algorithms process images at incredible speeds."
  },
  {
    icon: Globe,
    title: "Decentralized Trust",
    description: "Built on Solana blockchain for transparent, immutable proof of ownership that no central authority can alter."
  },
  {
    icon: Lock,
    title: "Privacy First",
    description: "Your images stay yours. We embed signatures without uploading or storing your content on external servers."
  }
]

const benefits = [
  "Protect your creative work from unauthorized use",
  "Prove authenticity in seconds, not hours",
  "Combat deepfakes and misinformation",
  "Build trust with your audience",
  "Monetize verified content with confidence",
  "Join 150+ organizations fighting fraud"
]

export default function WhyUsPage() {
  return (
    <main className="min-h-screen bg-[#0B0F1A]">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Background effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] pointer-events-none">
          <div className="absolute inset-0 bg-gradient-radial from-[#4F7CFF]/20 via-[#4F7CFF]/5 to-transparent rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="inline-block mb-6">
            <span className="text-[#4F7CFF] text-sm font-semibold tracking-wide uppercase">Why Choose Reclaim</span>
          </div>

          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Trust in a World of
            <br />
            <span className="bg-gradient-to-r from-[#5B8DEF] to-[#4F7CFF] bg-clip-text text-transparent">
              Digital Deception
            </span>
          </h1>

          <p className="text-[#94A3B8] text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            In an era where anyone can fake anything, we give creators and audiences the tools to verify truth. Your reputation deserves protection.
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
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
              <span className="relative z-10">Get Started Free</span>
              <ArrowRight className="w-4 h-4 relative z-10" />
              <div className="absolute inset-0 bg-gradient-to-br from-[#4F7CFF]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>

            <Link
              href="/platform"
              className="inline-flex items-center px-8 py-3.5 border border-[#1E293B] bg-[#0B0F1A] text-[#94A3B8] rounded-[14px] font-medium hover:bg-[#1E293B]/50 hover:text-white transition-all"
            >
              See How It Works
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div
                  key={index}
                  className="group rounded-2xl p-8 transition-all duration-300 hover:scale-[1.02]"
                  style={{
                    background: 'rgba(13, 17, 23, 0.6)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(30, 41, 59, 0.5)',
                  }}
                >
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-110"
                    style={{
                      background: 'linear-gradient(135deg, rgba(91, 141, 239, 0.2) 0%, rgba(79, 124, 255, 0.2) 100%)',
                      boxShadow: '0 8px 24px rgba(79, 124, 255, 0.2)'
                    }}
                  >
                    <Icon className="w-7 h-7 text-[#4F7CFF]" />
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-[#94A3B8] leading-relaxed">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-white mb-4">
              What You Gain
            </h2>
            <p className="text-[#94A3B8] text-lg">
              More than verification—complete peace of mind
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-6 rounded-xl transition-all duration-300 hover:bg-[#1E293B]/30"
              >
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                  }}
                >
                  <Check className="w-4 h-4 text-white" strokeWidth={3} />
                </div>
                <span className="text-white text-lg">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div
            className="rounded-3xl p-12"
            style={{
              background: 'linear-gradient(135deg, rgba(79, 124, 255, 0.1) 0%, rgba(91, 141, 239, 0.05) 100%)',
              border: '1px solid rgba(79, 124, 255, 0.2)',
            }}
          >
            <div className="grid md:grid-cols-3 gap-12 text-center">
              <div>
                <div className="text-5xl font-bold text-white mb-2">150+</div>
                <div className="text-[#94A3B8] text-lg">Trusted Organizations</div>
              </div>
              <div>
                <div className="text-5xl font-bold text-white mb-2">99.9%</div>
                <div className="text-[#94A3B8] text-lg">Detection Accuracy</div>
              </div>
              <div>
                <div className="text-5xl font-bold text-white mb-2">&lt;1s</div>
                <div className="text-[#94A3B8] text-lg">Average Verification</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold text-white mb-6">
            Ready to Protect Your Content?
          </h2>
          <p className="text-[#94A3B8] text-xl mb-10">
            Join the creators and organizations fighting digital fraud
          </p>

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
            <span className="relative z-10">Start Verifying Now</span>
            <ArrowRight className="w-5 h-5 relative z-10" />
            <div className="absolute inset-0 bg-gradient-to-br from-[#4F7CFF]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        </div>
      </section>
    </main>
  )
}
