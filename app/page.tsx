import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { STICKER_PACKS } from '@/lib/packs';
import { Sparkles, Palette, Camera, Wand2 } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f8f8f8]">
      <Header />

      <main className="flex-1">

        {/* ── Hero ─────────────────────────────────────────── */}
        <section className="pt-36 pb-20 px-6">
          <div className="max-w-4xl mx-auto text-center">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FA5D29]/10 border border-[#FA5D29]/20 mb-8">
              <Sparkles className="text-[#FA5D29]" size={16} />
              <span className="text-sm text-[#FA5D29] font-medium">AI-Powered Stickers</span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-[#222222]">
              Sticker Yourself.<br />
              <span className="gradient-text">AI Does the Magic.</span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl text-[#a7a7a7] mb-10 max-w-2xl mx-auto">
              Upload a selfie, pick a style, and get 6 custom AI stickers
              ready for Telegram &amp; WhatsApp.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link href="/packs" className="btn btn-primary text-lg py-4 px-8">
                Choose Your Style
                <span>→</span>
              </Link>
              <a href="#styles" className="btn btn-secondary text-lg py-4 px-8">
                See All Styles
              </a>
            </div>

            {/* Before/After Preview */}
            <div className="relative max-w-3xl mx-auto">
              <div className="glass-card p-8">
                <div className="grid grid-cols-2 gap-4 md:gap-8 items-stretch">

                  {/* Left — Sample person photo */}
                  <div className="text-center group h-full flex flex-col">
                    <div className="flex-grow rounded-2xl mb-3 overflow-hidden relative border border-[#ededed] transition-shadow duration-300 group-hover:shadow-md min-h-[140px]">
                      <img
                        src="/sample-photo.jpg"
                        alt="Sample person"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <span className="text-sm text-[#a7a7a7] mt-auto">Your Photo</span>
                  </div>

                  {/* Arrow / Decoration */}
                  <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                    <div className="w-14 h-14 rounded-full bg-[#FA5D29] flex items-center justify-center text-white shadow-md">
                      <Sparkles size={24} />
                    </div>
                  </div>

                  {/* Right — 6 emotion sticker previews */}
                  <div className="text-center h-full flex flex-col">
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {[
                        { file: 'laughing', emoji: '😂', name: 'Laughing' },
                        { file: 'affectionate', emoji: '🥰', name: 'Loving' },
                        { file: 'thinking', emoji: '🤔', name: 'Thinking' },
                        { file: 'winking', emoji: '😉', name: 'Winking' },
                        { file: 'blowing_kiss', emoji: '😘', name: 'Blowing Kiss' },
                        { file: 'crying', emoji: '😢', name: 'Crying' },
                      ].map((item, i) => (
                        <div
                          key={i}
                          className="group relative aspect-square rounded-xl overflow-hidden bg-[#FA5D29]/10 border border-[#FA5D29]/25"
                        >
                          <img
                            src={`/stickers/${item.file}.png`}
                            alt={item.name}
                            className="w-full h-full object-contain p-1 transition-opacity duration-200 group-hover:opacity-0"
                          />
                          <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <span className="text-2xl">{item.emoji}</span>
                            <span className="text-[8px] text-[#555] font-medium mt-0.5">{item.name}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <span className="text-sm text-[#a7a7a7] mt-auto">6 Unique Stickers</span>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Sticker Styles ───────────────────────────────── */}
        <section id="styles" className="py-20 px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 text-[#222222]">Choose Your Style</h2>
              <p className="text-[#a7a7a7] text-lg">6 unique artistic styles to match your personality</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {STICKER_PACKS.map((pack) => (
                <Link
                  key={pack.id}
                  href={`/upload?pack=${pack.id}`}
                  className="group relative"
                >
                  {pack.popular && (
                    <div
                      className="absolute -top-2 left-1/2 -translate-x-1/2 z-10 text-xs px-3 py-0.5 rounded-full text-white font-medium whitespace-nowrap shadow-sm"
                      style={{ background: `linear-gradient(135deg, ${pack.colors.primary}, ${pack.colors.secondary})` }}
                    >
                      Popular
                    </div>
                  )}
                  <div
                    className="glass-card p-4 text-center hover:-translate-y-2 transition-all duration-300 h-full flex flex-col"
                    style={{ borderColor: `${pack.colors.primary}40` }}
                  >
                    <div className="relative w-full aspect-square mb-3 rounded-xl overflow-hidden bg-gray-50/50 group-hover:scale-[1.03] transition-transform shadow-sm">
                      {pack.sampleImage ? (
                        <Image
                          src={pack.sampleImage}
                          alt={pack.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 16vw"
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center text-4xl"
                          style={{ background: `linear-gradient(135deg, ${pack.colors.primary}25, ${pack.colors.secondary}25)` }}
                        >
                          {pack.icon}
                        </div>
                      )}
                    </div>
                    <div className="mt-auto">
                      <h3 className="font-semibold text-[#222222] text-sm mb-1">{pack.name}</h3>
                      <p className="text-xs text-[#a7a7a7]">39,000đ</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="text-center mt-8">
              <Link href="/packs" className="text-[#FA5D29] hover:text-[#d94a1a] transition-colors text-sm font-medium">
                View all styles with details →
              </Link>
            </div>
          </div>
        </section>

        {/* ── How It Works ─────────────────────────────────── */}
        <section id="how-it-works" className="py-20 px-6 bg-[#f8f8f8]">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4 text-[#222222]">How It Works</h2>
              <p className="text-[#a7a7a7] text-lg">Three simple steps to get your personalized sticker pack</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Palette size={48} className="text-[#FA5D29]" />,
                  title: 'Pick Your Style',
                  description: 'Choose from 6 artistic styles: Pixar 3D, Anime, Chibi, Watercolor, Pop Art, or Minimalist.'
                },
                {
                  icon: <Camera size={48} className="text-blue-500" />,
                  title: 'Upload Your Photo',
                  description: 'Choose a clear selfie with good lighting. Works best with one face clearly visible.'
                },
                {
                  icon: <Wand2 size={48} className="text-purple-500" />,
                  title: 'Get Your Stickers',
                  description: 'Our AI creates 6 unique expressions. Download as PNG or add directly to your messenger!'
                }
              ].map((step, i) => (
                <div key={i} className="glass-card p-8 text-center relative group hover:-translate-y-2 transition-transform duration-300">
                  {/* Step number badge */}
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#FA5D29] flex items-center justify-center text-sm font-bold text-white shadow-sm">
                    {i + 1}
                  </div>
                  <div className="mb-6 mt-2 flex justify-center group-hover:scale-110 transition-transform">{step.icon}</div>
                  <h3 className="text-xl font-semibold mb-3 text-[#222222]">{step.title}</h3>
                  <p className="text-[#a7a7a7] text-sm leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 6 Emotions Preview ───────────────────────────── */}
        <section id="examples" className="py-20 px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4 text-[#222222]">6 Expressive Emotions</h2>
              <p className="text-[#a7a7a7] text-lg">Every sticker pack includes all these expressions</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 max-w-4xl mx-auto">
              {[
                { emoji: '😂', name: 'Laughing' },
                { emoji: '🥰', name: 'Affectionate' },
                { emoji: '🤔', name: 'Thinking' },
                { emoji: '😉', name: 'Winking' },
                { emoji: '😘', name: 'Blowing Kiss' },
                { emoji: '😢', name: 'Crying' }
              ].map((emotion, i) => (
                <div key={i} className="flex flex-col items-center gap-2 group">
                  <div className="w-full aspect-square glass-card flex items-center justify-center text-4xl group-hover:scale-110 transition-transform cursor-default border border-[#ededed]">
                    {emotion.emoji}
                  </div>
                  <span className="text-xs text-[#a7a7a7] text-center leading-tight">{emotion.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Pricing ──────────────────────────────────────── */}
        <section id="pricing" className="py-20 px-6 bg-[#f8f8f8]">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 text-[#222222]">Simple Pricing</h2>
              <p className="text-[#a7a7a7] text-lg">One-time payment per pack, no subscriptions</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {STICKER_PACKS.slice(0, 3).map((pack) => (
                <div
                  key={pack.id}
                  className="glass-card p-6 text-center relative overflow-hidden"
                  style={{ borderColor: pack.popular ? `${pack.colors.primary}60` : '#ededed' }}
                >
                  {pack.popular && (
                    <div
                      className="absolute top-0 right-0 text-white text-xs font-medium px-3 py-1 rounded-bl-xl"
                      style={{ background: `linear-gradient(135deg, ${pack.colors.primary}, ${pack.colors.secondary})` }}
                    >
                      Most Popular
                    </div>
                  )}

                  <div className="text-4xl mb-4">{pack.icon}</div>
                  <h3 className="text-xl font-bold mb-2 text-[#222222]">{pack.name}</h3>
                  <p className="text-[#a7a7a7] text-sm mb-4">{pack.description}</p>

                  <div className="mb-4">
                    <span
                      className="text-4xl font-bold"
                      style={{ color: pack.colors.primary }}
                    >
                      39,000đ
                    </span>
                    <span className="text-[#a7a7a7] ml-1 text-sm">limited time</span>
                  </div>

                  <ul className="text-left space-y-2 mb-6 text-sm">
                    {['6 unique expressions', 'Transparent PNGs', 'Instant download'].map((feature, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="text-[#FA5D29] font-bold">✓</span>
                        <span className="text-[#a7a7a7]">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={`/upload?pack=${pack.id}`}
                    className="btn w-full py-3 text-white font-semibold rounded-full"
                    style={{ background: `linear-gradient(135deg, ${pack.colors.primary}, ${pack.colors.secondary})` }}
                  >
                    Get {pack.name}
                  </Link>
                </div>
              ))}
            </div>

            <div className="text-center mt-8">
              <Link href="/packs" className="text-[#FA5D29] hover:text-[#d94a1a] transition-colors text-sm font-medium">
                See all {STICKER_PACKS.length} styles →
              </Link>
            </div>
          </div>
        </section>

        {/* ── Final CTA ────────────────────────────────────── */}
        <section className="py-20 px-6 bg-white">
          <div className="max-w-4xl mx-auto text-center">
            <div className="glass-card p-12 border border-[#FA5D29]/20 bg-[#FA5D29]/5">
              <h2 className="text-4xl font-bold mb-4 text-[#222222]">Ready to Create Your Stickers?</h2>
              <p className="text-[#a7a7a7] text-lg mb-8">
                Join thousands of happy users who express themselves with custom stickers
              </p>
              <Link href="/packs" className="btn btn-primary text-lg py-4 px-10">
                Choose Your Style — It&apos;s Quick!
              </Link>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
