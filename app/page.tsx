import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { STICKER_PACKS } from '@/lib/packs';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <main className="flex-1">
        <section className="pt-32 pb-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-8">
              <span className="text-sm text-purple-400">✨ AI-Powered Stickers</span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Turn Your Photo into<br />
              <span className="gradient-text">Cute 3D Stickers</span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
              Choose your style, upload a selfie, and get 9 adorable stickers
              ready for Telegram & WhatsApp. Takes just 30 seconds!
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  {/* Before */}
                  <div className="text-center">
                    <div className="aspect-square bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl mb-4 flex items-center justify-center overflow-hidden">
                      <div className="text-6xl">📷</div>
                    </div>
                    <span className="text-sm text-gray-400">Your Photo</span>
                  </div>

                  {/* Arrow */}
                  <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-2xl shadow-lg">
                      ✨
                    </div>
                  </div>

                  {/* After */}
                  <div className="text-center">
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {['😲', '😊', '🤔', '😤', '😏', '😟', '😒', '😑', '🧐'].map((emoji, i) => (
                        <div
                          key={i}
                          className="aspect-square bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center text-2xl animate-float"
                          style={{ animationDelay: `${i * 0.1}s` }}
                        >
                          {emoji}
                        </div>
                      ))}
                    </div>
                    <span className="text-sm text-gray-400">9 Unique Stickers</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Sticker Styles */}
        <section id="styles" className="py-20 px-6 bg-gradient-to-b from-transparent via-purple-900/10 to-transparent">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Choose Your Style</h2>
              <p className="text-gray-400 text-lg">6 unique artistic styles to match your personality</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {STICKER_PACKS.map((pack) => (
                <Link
                  key={pack.id}
                  href={`/upload?pack=${pack.id}`}
                  className="group"
                >
                  <div
                    className="glass-card p-4 text-center hover:-translate-y-2 transition-all duration-300"
                    style={{ borderColor: `${pack.colors.primary}40` }}
                  >
                    {pack.popular && (
                      <div
                        className="absolute -top-2 left-1/2 -translate-x-1/2 text-xs px-2 py-0.5 rounded-full text-white whitespace-nowrap"
                        style={{ background: `linear-gradient(135deg, ${pack.colors.primary}, ${pack.colors.secondary})` }}
                      >
                        Popular
                      </div>
                    )}
                    <div
                      className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center text-3xl mb-3 group-hover:scale-110 transition-transform"
                      style={{ background: `linear-gradient(135deg, ${pack.colors.primary}30, ${pack.colors.secondary}30)` }}
                    >
                      {pack.icon}
                    </div>
                    <h3 className="font-semibold text-white text-sm mb-1">{pack.name}</h3>
                    <p className="text-xs text-gray-400">${(pack.price / 100).toFixed(2)}</p>
                  </div>
                </Link>
              ))}
            </div>

            <div className="text-center mt-8">
              <Link href="/packs" className="text-purple-400 hover:text-purple-300 transition-colors">
                View all styles with details →
              </Link>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">How It Works</h2>
              <p className="text-gray-400 text-lg">Three simple steps to get your personalized sticker pack</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: '🎨',
                  title: 'Pick Your Style',
                  description: 'Choose from 6 artistic styles: Pixar 3D, Anime, Chibi, Watercolor, Pop Art, or Minimalist.'
                },
                {
                  icon: '📸',
                  title: 'Upload Your Photo',
                  description: 'Choose a clear selfie with good lighting. Works best with one face clearly visible.'
                },
                {
                  icon: '✨',
                  title: 'Get Your Stickers',
                  description: 'Our AI creates 9 unique expressions. Download as PNG or add directly to your messenger!'
                }
              ].map((step, i) => (
                <div key={i} className="glass-card p-8 text-center relative group hover:-translate-y-2 transition-transform duration-300">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-sm font-bold">
                    {i + 1}
                  </div>
                  <div className="text-5xl mb-6 group-hover:scale-110 transition-transform">{step.icon}</div>
                  <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-gray-400">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Sticker Emotions */}
        <section id="examples" className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">9 Expressive Emotions</h2>
              <p className="text-gray-400 text-lg">Every sticker pack includes all these expressions</p>
            </div>

            <div className="grid grid-cols-3 md:grid-cols-9 gap-4 max-w-4xl mx-auto">
              {[
                { emoji: '😲', name: 'Surprised' },
                { emoji: '😒', name: 'Annoyed' },
                { emoji: '🤔', name: 'Confused' },
                { emoji: '😤', name: 'Frustrated' },
                { emoji: '😊', name: 'Happy' },
                { emoji: '😏', name: 'Sarcastic' },
                { emoji: '😟', name: 'Worried' },
                { emoji: '😑', name: 'Bored' },
                { emoji: '🧐', name: 'Curious' }
              ].map((emotion, i) => (
                <div key={i} className="flex flex-col items-center gap-2 group">
                  <div className="w-full aspect-square glass-card flex items-center justify-center text-4xl group-hover:scale-110 transition-transform cursor-default">
                    {emotion.emoji}
                  </div>
                  <span className="text-xs text-gray-400">{emotion.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-20 px-6 bg-gradient-to-b from-transparent via-purple-900/10 to-transparent">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Simple Pricing</h2>
              <p className="text-gray-400 text-lg">One-time payment per pack, no subscriptions</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {STICKER_PACKS.slice(0, 3).map((pack) => (
                <div
                  key={pack.id}
                  className="glass-card p-6 text-center relative overflow-hidden"
                  style={{ borderColor: pack.popular ? `${pack.colors.primary}60` : undefined }}
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
                  <h3 className="text-xl font-bold mb-2">{pack.name}</h3>
                  <p className="text-gray-400 text-sm mb-4">{pack.description}</p>

                  <div className="mb-4">
                    <span
                      className="text-4xl font-bold"
                      style={{ color: pack.colors.primary }}
                    >
                      ${(pack.price / 100).toFixed(2)}
                    </span>
                    <span className="text-gray-400 ml-1">one-time</span>
                  </div>

                  <ul className="text-left space-y-2 mb-6 text-sm">
                    {['9 unique expressions', 'Transparent PNGs', 'Instant download'].map((feature, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="text-green-400">✓</span>
                        <span className="text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={`/upload?pack=${pack.id}`}
                    className="btn w-full py-3"
                    style={{ background: `linear-gradient(135deg, ${pack.colors.primary}, ${pack.colors.secondary})` }}
                  >
                    Get {pack.name}
                  </Link>
                </div>
              ))}
            </div>

            <div className="text-center mt-8">
              <Link href="/packs" className="text-purple-400 hover:text-purple-300 transition-colors">
                See all {STICKER_PACKS.length} styles →
              </Link>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="glass-card p-12 bg-gradient-to-r from-purple-900/30 to-pink-900/30">
              <h2 className="text-4xl font-bold mb-4">Ready to Create Your Stickers?</h2>
              <p className="text-gray-400 text-lg mb-8">
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
