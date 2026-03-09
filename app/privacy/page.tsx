import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen flex flex-col bg-[#f8f8f8]">
            <Header />

            <main className="flex-1 pt-32 pb-20 px-6">
                <div className="max-w-3xl mx-auto bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-[#ededed]">
                    <h1 className="text-4xl font-bold mb-4 text-[#222222]">Privacy Policy</h1>
                    <p className="text-[#a7a7a7] mb-8">Effective Date: March 09, 2026</p>

                    <div className="space-y-8 text-[#555] leading-relaxed">
                        <section>
                            <p>
                                At StickerMe, accessible from stickermeapp.ink, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by StickerMe and how we use it.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-[#222222] mb-4">Information We Collect</h2>
                            <ul className="space-y-4 list-disc pl-5">
                                <li><strong>Photos:</strong> We only collect the photos you upload for the sole purpose of generating stickers. These photos are processed via AI and are not used for any other purpose.</li>
                                <li><strong>Payment Information:</strong> We use Lemon Squeezy to process payments. We do not store your credit card or bank details on our servers.</li>
                                <li><strong>Contact Data:</strong> We may collect your email address (hong.nv1504@gmail.com) to send you the finished products or for customer support.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-[#222222] mb-4">How We Use Your Information</h2>
                            <ul className="space-y-2 list-disc pl-5">
                                <li>To provide, operate, and maintain our website.</li>
                                <li>To process your transactions via Lemon Squeezy.</li>
                                <li>To generate AI-powered stickers based on your uploaded images.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-[#222222] mb-4">Third-Party Services</h2>
                            <p className="mb-4">We share data with the following partners to provide our service:</p>
                            <ul className="space-y-2 list-disc pl-5">
                                <li><strong>OpenAI/Google Gemini:</strong> To process and generate AI images.</li>
                                <li><strong>Lemon Squeezy:</strong> To securely process payments.</li>
                                <li><strong>Vercel:</strong> To host our application.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-[#222222] mb-4">Data Retention</h2>
                            <p>
                                We do not store your uploaded photos longer than necessary to generate your stickers.
                            </p>
                        </section>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
