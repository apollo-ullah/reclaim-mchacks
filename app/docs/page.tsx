"use client"

import { Navbar } from "@/components/navbar"
import { Code, BookOpen, Terminal, Wrench } from "lucide-react"
import { useState } from "react"

const sections = [
  {
    id: "getting-started",
    title: "Getting Started",
    icon: BookOpen,
    content: [
      {
        subtitle: "Quick Start",
        text: "Begin authenticating your images in three simple steps: Create an account, connect your Solana wallet, and start signing content."
      },
      {
        subtitle: "Requirements",
        text: "You'll need a Solana wallet (Phantom or Solflare recommended) and images in PNG, JPEG, or WebP format (max 10MB)."
      }
    ]
  },
  {
    id: "signing-images",
    title: "Signing Images",
    icon: Wrench,
    content: [
      {
        subtitle: "Upload Process",
        text: "Navigate to the signing page, select your image, and review the preview. The signing process is instant and embeds your cryptographic signature directly into the image using steganography."
      },
      {
        subtitle: "Best Practices",
        text: "Use high-quality source images for best results. The signature is invisible and survives most compression, but avoid excessive editing after signing."
      }
    ]
  },
  {
    id: "verification",
    title: "Verification",
    icon: Code,
    content: [
      {
        subtitle: "How to Verify",
        text: "Anyone can verify an image by uploading it to our verification page. Results appear instantly, showing whether the image is authentic, tampered, or unsigned."
      },
      {
        subtitle: "Understanding Results",
        text: "Verified images show the creator's name and signing timestamp. Tampered images display a warning. Unsigned images show as origin unknown."
      }
    ]
  },
  {
    id: "api",
    title: "API Reference",
    icon: Terminal,
    content: [
      {
        subtitle: "Verification Endpoint",
        text: "POST /api/verify - Accepts multipart form data with an 'image' field. Returns JSON with verification status, creator info, and timestamp."
      },
      {
        subtitle: "Response Format",
        code: `{
  "verified": boolean,
  "creator": string,
  "creatorDisplayName": string,
  "timestamp": string (ISO 8601),
  "tampered": boolean,
  "message": string
}`
      }
    ]
  }
]

const codeExamples = {
  javascript: `// Verify an image using JavaScript
const formData = new FormData();
formData.append('image', imageFile);

const response = await fetch('/api/verify', {
  method: 'POST',
  body: formData
});

const result = await response.json();
console.log(result.verified); // true or false`,

  curl: `# Verify an image using cURL
curl -X POST https://reclaim.app/api/verify \\
  -F "image=@/path/to/image.png" \\
  -H "Content-Type: multipart/form-data"`,

  python: `# Verify an image using Python
import requests

files = {'image': open('image.png', 'rb')}
response = requests.post(
    'https://reclaim.app/api/verify',
    files=files
)

result = response.json()
print(result['verified'])`
}

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState("getting-started")
  const [activeTab, setActiveTab] = useState<keyof typeof codeExamples>("javascript")

  return (
    <main className="min-h-screen bg-[#0B0F1A]">
      <Navbar />

      <div className="pt-28 px-6 pb-20">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-16">
            <h1 className="text-6xl font-bold text-white mb-4">Documentation</h1>
            <p className="text-[#94A3B8] text-xl">
              Everything you need to integrate Reclaim into your workflow
            </p>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <nav className="space-y-2 sticky top-28">
                {sections.map((section) => {
                  const Icon = section.icon
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-xl text-left transition-all ${
                        activeSection === section.id
                          ? 'text-white'
                          : 'text-[#94A3B8] hover:text-white hover:bg-[#1E293B]/30'
                      }`}
                      style={
                        activeSection === section.id
                          ? {
                              background: 'rgba(79, 124, 255, 0.1)',
                              border: '1px solid rgba(79, 124, 255, 0.3)',
                            }
                          : {}
                      }
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{section.title}</span>
                    </button>
                  )
                })}
              </nav>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {sections.map((section) => {
                if (section.id !== activeSection) return null

                return (
                  <div key={section.id} className="space-y-8">
                    <div>
                      <h2 className="text-4xl font-bold text-white mb-6">{section.title}</h2>
                    </div>

                    {section.content.map((item, index) => (
                      <div
                        key={index}
                        className="rounded-2xl p-8"
                        style={{
                          background: 'rgba(13, 17, 23, 0.6)',
                          backdropFilter: 'blur(12px)',
                          border: '1px solid rgba(30, 41, 59, 0.5)',
                        }}
                      >
                        <h3 className="text-2xl font-bold text-white mb-4">{item.subtitle}</h3>

                        {item.text && (
                          <p className="text-[#94A3B8] text-lg leading-relaxed">{item.text}</p>
                        )}

                        {item.code && (
                          <pre
                            className="mt-4 p-5 rounded-xl overflow-x-auto"
                            style={{
                              background: 'rgba(11, 15, 26, 0.8)',
                              border: '1px solid rgba(79, 124, 255, 0.2)',
                            }}
                          >
                            <code className="text-[#94A3B8] text-sm font-mono">{item.code}</code>
                          </pre>
                        )}
                      </div>
                    ))}

                    {/* Code Examples for API section */}
                    {section.id === "api" && (
                      <div
                        className="rounded-2xl p-8"
                        style={{
                          background: 'rgba(13, 17, 23, 0.6)',
                          backdropFilter: 'blur(12px)',
                          border: '1px solid rgba(30, 41, 59, 0.5)',
                        }}
                      >
                        <h3 className="text-2xl font-bold text-white mb-6">Code Examples</h3>

                        {/* Tabs */}
                        <div className="flex gap-2 mb-4">
                          {(Object.keys(codeExamples) as Array<keyof typeof codeExamples>).map((lang) => (
                            <button
                              key={lang}
                              onClick={() => setActiveTab(lang)}
                              className={`px-5 py-2.5 rounded-lg font-medium transition-all ${
                                activeTab === lang
                                  ? 'text-white'
                                  : 'text-[#94A3B8] hover:text-white hover:bg-[#1E293B]/30'
                              }`}
                              style={
                                activeTab === lang
                                  ? {
                                      background: 'rgba(79, 124, 255, 0.15)',
                                      border: '1px solid rgba(79, 124, 255, 0.3)',
                                    }
                                  : {}
                              }
                            >
                              {lang === "javascript" ? "JavaScript" : lang === "curl" ? "cURL" : "Python"}
                            </button>
                          ))}
                        </div>

                        {/* Code Display */}
                        <pre
                          className="p-6 rounded-xl overflow-x-auto"
                          style={{
                            background: 'rgba(11, 15, 26, 0.8)',
                            border: '1px solid rgba(79, 124, 255, 0.2)',
                          }}
                        >
                          <code className="text-[#94A3B8] text-sm font-mono whitespace-pre">
                            {codeExamples[activeTab]}
                          </code>
                        </pre>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Help Section */}
          <div className="mt-20">
            <div
              className="rounded-3xl p-12 text-center"
              style={{
                background: 'linear-gradient(135deg, rgba(79, 124, 255, 0.1) 0%, rgba(91, 141, 239, 0.05) 100%)',
                border: '1px solid rgba(79, 124, 255, 0.2)',
              }}
            >
              <h2 className="text-3xl font-bold text-white mb-4">Need More Help?</h2>
              <p className="text-[#94A3B8] text-lg mb-8">
                Can't find what you're looking for? Reach out to our team.
              </p>

              <div className="flex flex-wrap gap-4 justify-center">
                <a
                  href="mailto:support@reclaim.app"
                  className="inline-flex items-center gap-2.5 px-8 py-3.5 text-white rounded-[14px] font-medium transition-all relative overflow-hidden group"
                  style={{
                    background: 'rgba(79, 124, 255, 0.15)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(79, 124, 255, 0.3)',
                    boxShadow: '0 8px 32px rgba(79, 124, 255, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <span className="relative z-10">Contact Support</span>
                  <div className="absolute inset-0 bg-gradient-to-br from-[#4F7CFF]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>

                <a
                  href="https://github.com/reclaim"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-8 py-3.5 border border-[#1E293B] bg-[#0B0F1A] text-[#94A3B8] rounded-[14px] font-medium hover:bg-[#1E293B]/50 hover:text-white transition-all"
                >
                  View on GitHub
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
