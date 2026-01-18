"use client"

import { Navbar } from "@/components/navbar"
import { Mail, MessageSquare, Users, Send } from "lucide-react"
import { useState } from "react"

const contactMethods = [
  {
    icon: Mail,
    title: "Email Us",
    description: "Reach out for general inquiries",
    contact: "hello@reclaim.app",
    color: "from-[#5B8DEF] to-[#4F7CFF]"
  },
  {
    icon: MessageSquare,
    title: "Support",
    description: "Get technical assistance",
    contact: "support@reclaim.app",
    color: "from-[#10B981] to-[#059669]"
  },
  {
    icon: Users,
    title: "Partnerships",
    description: "Explore collaboration opportunities",
    contact: "partners@reclaim.app",
    color: "from-[#8B5CF6] to-[#7C3AED]"
  }
]

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log("Form submitted:", formData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <main className="min-h-screen bg-[#0B0F1A]">
      <Navbar />

      <div className="pt-28 px-6 pb-20">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-6xl md:text-7xl font-bold text-white mb-6">
              Get in Touch
            </h1>
            <p className="text-[#94A3B8] text-xl max-w-2xl mx-auto">
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            {contactMethods.map((method, index) => {
              const Icon = method.icon
              return (
                <a
                  key={index}
                  href={`mailto:${method.contact}`}
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
                      background: `linear-gradient(135deg, ${method.color.split(' ')[0].replace('from-', '')} 0%, ${method.color.split(' ')[1].replace('to-', '')} 100%)`,
                      boxShadow: '0 8px 24px rgba(79, 124, 255, 0.2)'
                    }}
                  >
                    <Icon className="w-7 h-7 text-white" />
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-[#5B8DEF] transition-colors">
                    {method.title}
                  </h3>
                  <p className="text-[#94A3B8] mb-4">{method.description}</p>
                  <p className="text-[#4F7CFF] font-medium">{method.contact}</p>
                </a>
              )
            })}
          </div>

          {/* Contact Form */}
          <div className="max-w-3xl mx-auto">
            <div
              className="rounded-3xl p-10"
              style={{
                background: 'rgba(13, 17, 23, 0.6)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(30, 41, 59, 0.5)',
              }}
            >
              <h2 className="text-3xl font-bold text-white mb-6">Send us a Message</h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-[#94A3B8] mb-2">
                      Your Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-5 py-4 bg-[#0B0F1A] border border-[#1E293B] rounded-[14px] text-white placeholder-[#6B7280] focus:border-[#4F7CFF] focus:outline-none focus:ring-2 focus:ring-[#4F7CFF]/20 transition-all"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-[#94A3B8] mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-5 py-4 bg-[#0B0F1A] border border-[#1E293B] rounded-[14px] text-white placeholder-[#6B7280] focus:border-[#4F7CFF] focus:outline-none focus:ring-2 focus:ring-[#4F7CFF]/20 transition-all"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-[#94A3B8] mb-2">
                    Subject
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-5 py-4 bg-[#0B0F1A] border border-[#1E293B] rounded-[14px] text-white focus:border-[#4F7CFF] focus:outline-none focus:ring-2 focus:ring-[#4F7CFF]/20 transition-all"
                  >
                    <option value="">Select a subject</option>
                    <option value="general">General Inquiry</option>
                    <option value="support">Technical Support</option>
                    <option value="partnership">Partnership Opportunity</option>
                    <option value="feedback">Feedback</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-[#94A3B8] mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-5 py-4 bg-[#0B0F1A] border border-[#1E293B] rounded-[14px] text-white placeholder-[#6B7280] focus:border-[#4F7CFF] focus:outline-none focus:ring-2 focus:ring-[#4F7CFF]/20 transition-all resize-none"
                    placeholder="Tell us how we can help you..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2.5 px-8 py-4 text-white rounded-[14px] font-medium transition-all relative overflow-hidden group"
                  style={{
                    background: 'rgba(79, 124, 255, 0.15)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(79, 124, 255, 0.3)',
                    boxShadow: '0 8px 32px rgba(79, 124, 255, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <span className="relative z-10">Send Message</span>
                  <Send className="w-5 h-5 relative z-10" />
                  <div className="absolute inset-0 bg-gradient-to-br from-[#4F7CFF]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </form>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-20">
            <div
              className="rounded-3xl p-12 text-center"
              style={{
                background: 'linear-gradient(135deg, rgba(79, 124, 255, 0.1) 0%, rgba(91, 141, 239, 0.05) 100%)',
                border: '1px solid rgba(79, 124, 255, 0.2)',
              }}
            >
              <h2 className="text-3xl font-bold text-white mb-4">Looking for Quick Answers?</h2>
              <p className="text-[#94A3B8] text-lg mb-8">
                Check out our documentation for common questions and technical guides
              </p>

              <div className="flex flex-wrap gap-4 justify-center">
                <a
                  href="/docs"
                  className="inline-flex items-center gap-2.5 px-8 py-3.5 text-white rounded-[14px] font-medium transition-all relative overflow-hidden group"
                  style={{
                    background: 'rgba(79, 124, 255, 0.15)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(79, 124, 255, 0.3)',
                    boxShadow: '0 8px 32px rgba(79, 124, 255, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <span className="relative z-10">View Documentation</span>
                  <div className="absolute inset-0 bg-gradient-to-br from-[#4F7CFF]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>

                <a
                  href="/blog"
                  className="inline-flex items-center px-8 py-3.5 border border-[#1E293B] bg-[#0B0F1A] text-[#94A3B8] rounded-[14px] font-medium hover:bg-[#1E293B]/50 hover:text-white transition-all"
                >
                  Read Our Blog
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
