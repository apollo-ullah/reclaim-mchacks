"use client"

import { Navbar } from "@/components/navbar"
import Link from "next/link"
import { Calendar, Clock, ArrowRight, TrendingUp } from "lucide-react"

const featuredPost = {
  title: "The Future of Digital Content Authentication",
  excerpt: "Exploring how blockchain and cryptography are revolutionizing how we verify truth in the digital age. From deepfakes to misinformation, discover why content authentication matters now more than ever.",
  date: "January 15, 2026",
  readTime: "8 min read",
  category: "Industry Insights",
  image: "",
  author: "Reclaim Team"
}

const posts = [
  {
    title: "How Steganography Protects Your Content",
    excerpt: "A deep dive into the invisible watermarking technology that makes tampering impossible to hide.",
    date: "January 10, 2026",
    readTime: "6 min read",
    category: "Technology",
    image: "",
  },
  {
    title: "Combating Deepfakes with Blockchain",
    excerpt: "Why decentralized verification is the key to fighting AI-generated misinformation at scale.",
    date: "January 5, 2026",
    readTime: "5 min read",
    category: "Security",
    image: "",
  },
  {
    title: "Case Study: Media Organization Success",
    excerpt: "How a major news outlet reduced fraud by 94% using Reclaim's authentication platform.",
    date: "December 28, 2025",
    readTime: "7 min read",
    category: "Case Studies",
    image: "",
  },
  {
    title: "Understanding Compressed NFTs",
    excerpt: "Learn how we make on-chain verification affordable through Solana's compressed NFT technology.",
    date: "December 20, 2025",
    readTime: "4 min read",
    category: "Blockchain",
    image: "",
  },
  {
    title: "Creator Rights in the Digital Age",
    excerpt: "Why content creators need better tools to protect their work and reputation online.",
    date: "December 15, 2025",
    readTime: "6 min read",
    category: "Creator Economy",
    image: "",
  },
  {
    title: "API Integration Guide",
    excerpt: "Step-by-step tutorial for integrating Reclaim verification into your application.",
    date: "December 10, 2025",
    readTime: "10 min read",
    category: "Developer",
    image: "",
  }
]

const categories = ["All", "Technology", "Security", "Blockchain", "Case Studies", "Creator Economy", "Developer"]

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-[#0B0F1A]">
      <Navbar />

      <div className="pt-28 px-6 pb-20">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-16 text-center">
            <h1 className="text-6xl font-bold text-white mb-4">Blog</h1>
            <p className="text-[#94A3B8] text-xl max-w-2xl mx-auto">
              Insights on digital authentication, blockchain technology, and the future of content verification
            </p>
          </div>

          {/* Featured Post */}
          <div
            className="rounded-3xl p-10 md:p-12 mb-16 group cursor-pointer transition-all duration-300 hover:scale-[1.01]"
            style={{
              background: 'linear-gradient(135deg, rgba(79, 124, 255, 0.1) 0%, rgba(91, 141, 239, 0.05) 100%)',
              border: '1px solid rgba(79, 124, 255, 0.2)',
            }}
          >
            <div className="flex items-start gap-3 mb-4">
              <div
                className="px-4 py-1.5 rounded-lg text-sm font-semibold text-[#4F7CFF]"
                style={{
                  background: 'rgba(79, 124, 255, 0.15)',
                  border: '1px solid rgba(79, 124, 255, 0.3)',
                }}
              >
                <TrendingUp className="w-3.5 h-3.5 inline mr-1.5" />
                Featured
              </div>
              <div
                className="px-4 py-1.5 rounded-lg text-sm font-medium text-[#94A3B8]"
                style={{
                  background: 'rgba(148, 163, 184, 0.1)',
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                }}
              >
                {featuredPost.category}
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8 items-center">
              <div className="md:col-span-2">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 group-hover:text-[#5B8DEF] transition-colors">
                  {featuredPost.title}
                </h2>
                <p className="text-[#94A3B8] text-lg mb-6 leading-relaxed">
                  {featuredPost.excerpt}
                </p>

                <div className="flex items-center gap-6 text-[#6B7280] text-sm mb-6">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{featuredPost.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{featuredPost.readTime}</span>
                  </div>
                </div>

                <button
                  className="inline-flex items-center gap-2.5 px-6 py-3 text-white rounded-[14px] font-medium transition-all relative overflow-hidden group"
                  style={{
                    background: 'rgba(79, 124, 255, 0.15)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(79, 124, 255, 0.3)',
                    boxShadow: '0 8px 32px rgba(79, 124, 255, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <span className="relative z-10">Read Article</span>
                  <ArrowRight className="w-4 h-4 relative z-10" />
                  <div className="absolute inset-0 bg-gradient-to-br from-[#4F7CFF]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </div>

              <div className="flex items-center justify-center">
                <div
                  className="w-48 h-48 rounded-3xl flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, rgba(91, 141, 239, 0.2) 0%, rgba(79, 124, 255, 0.2) 100%)',
                    boxShadow: '0 25px 60px rgba(79, 124, 255, 0.2)'
                  }}
                >
                  <svg className="w-20 h-20 text-[#4F7CFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-3 mb-12">
            {categories.map((category) => (
              <button
                key={category}
                className={`px-5 py-2.5 rounded-xl font-medium transition-all ${
                  category === "All" ? 'text-white' : 'text-[#94A3B8] hover:text-white hover:bg-[#1E293B]/30'
                }`}
                style={
                  category === "All"
                    ? {
                        background: 'rgba(79, 124, 255, 0.15)',
                        border: '1px solid rgba(79, 124, 255, 0.3)',
                      }
                    : {
                        border: '1px solid rgba(30, 41, 59, 0.5)',
                      }
                }
              >
                {category}
              </button>
            ))}
          </div>

          {/* Posts Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, index) => (
              <article
                key={index}
                className="group cursor-pointer rounded-2xl p-8 transition-all duration-300 hover:scale-[1.02]"
                style={{
                  background: 'rgba(13, 17, 23, 0.6)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(30, 41, 59, 0.5)',
                }}
              >
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
                  style={{
                    background: 'linear-gradient(135deg, rgba(91, 141, 239, 0.15) 0%, rgba(79, 124, 255, 0.15) 100%)',
                  }}
                >
                  <svg className="w-10 h-10 text-[#4F7CFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>

                <div
                  className="inline-block px-3 py-1 rounded-lg text-xs font-semibold text-[#4F7CFF] mb-4"
                  style={{
                    background: 'rgba(79, 124, 255, 0.1)',
                    border: '1px solid rgba(79, 124, 255, 0.2)',
                  }}
                >
                  {post.category}
                </div>

                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-[#5B8DEF] transition-colors">
                  {post.title}
                </h3>

                <p className="text-[#94A3B8] mb-6 leading-relaxed">
                  {post.excerpt}
                </p>

                <div className="flex items-center gap-4 text-[#6B7280] text-sm">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{post.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{post.readTime}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Newsletter Section */}
          <div className="mt-20">
            <div
              className="rounded-3xl p-12 text-center"
              style={{
                background: 'linear-gradient(135deg, rgba(79, 124, 255, 0.1) 0%, rgba(91, 141, 239, 0.05) 100%)',
                border: '1px solid rgba(79, 124, 255, 0.2)',
              }}
            >
              <h2 className="text-4xl font-bold text-white mb-4">Stay Updated</h2>
              <p className="text-[#94A3B8] text-lg mb-8 max-w-2xl mx-auto">
                Get the latest insights on content authentication and digital security delivered to your inbox
              </p>

              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-5 py-4 bg-[#0B0F1A] border border-[#1E293B] rounded-[14px] text-white placeholder-[#6B7280] focus:border-[#4F7CFF] focus:outline-none focus:ring-2 focus:ring-[#4F7CFF]/20 transition-all"
                />
                <button
                  className="inline-flex items-center justify-center gap-2.5 px-8 py-4 text-white rounded-[14px] font-medium transition-all relative overflow-hidden group whitespace-nowrap"
                  style={{
                    background: 'rgba(79, 124, 255, 0.15)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(79, 124, 255, 0.3)',
                    boxShadow: '0 8px 32px rgba(79, 124, 255, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <span className="relative z-10">Subscribe</span>
                  <div className="absolute inset-0 bg-gradient-to-br from-[#4F7CFF]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
