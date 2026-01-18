import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0B0F1A]">
      <Navbar />
      <HeroSection />
    </main>
  )
}
