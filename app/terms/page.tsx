import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function TermsOfServicePage() {
    return (
        <div className="min-h-screen flex flex-col bg-[#f8f8f8]">
            <Header />

            <main className="flex-1 pt-32 pb-20 px-6">
                <div className="max-w-3xl mx-auto bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-[#ededed]">
                    <h1 className="text-4xl font-bold mb-4 text-[#222222]">Terms of Service</h1>
                    <p className="text-[#a7a7a7] mb-8">Effective Date: March 09, 2026</p>

                    <div className="space-y-8 text-[#555] leading-relaxed">
                        <section>
                            <p>
                                Welcome to StickerMe! By accessing our website and using our services, you agree to comply with the following terms.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-[#222222] mb-4">1. Description of Service</h2>
                            <p>
                                StickerMe provides an AI-powered platform to convert user-uploaded photos into digital sticker packs.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-[#222222] mb-4">2. User Content</h2>
                            <p>
                                You retain all rights to the photos you upload. However, by uploading them, you grant StickerMe a limited license to process the image for the purpose of creating your stickers. You represent that you have the right to use and upload the photos you provide.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-[#222222] mb-4">3. Payments and Refunds</h2>
                            <p className="mb-4">All payments are handled securely by Lemon Squeezy.</p>
                            <p>
                                Due to the digital nature of our products (AI-generated stickers), all sales are final. We do not offer refunds once the sticker generation process has started or the product has been delivered.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-[#222222] mb-4">4. Prohibited Use</h2>
                            <p>
                                You agree not to upload photos that are illegal, offensive, or infringe upon the intellectual property rights of others (e.g., famous celebrities or copyrighted characters without permission).
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-[#222222] mb-4">5. Limitation of Liability</h2>
                            <p>
                                StickerMe (operated by NGO VAN HONG) shall not be held liable for any indirect or consequential damages arising from the use of our service.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-[#222222] mb-4">6. Contact Us</h2>
                            <p>
                                If you have any questions about these Terms, please contact us at <a href="mailto:hong.nv1504@gmail.com" className="text-[#FA5D29] hover:underline">hong.nv1504@gmail.com</a>.
                            </p>
                        </section>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
