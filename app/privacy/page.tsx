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
                                At StickerMe, your privacy matters. This Privacy Policy explains what information we collect through our iOS app and website (stickermeapp.ink), how we use it, and who we share it with.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-[#222222] mb-4">Information We Collect</h2>
                            <ul className="space-y-4 list-disc pl-5">
                                <li>
                                    <strong>Photos:</strong> When you use StickerMe, you upload a photo of yourself. This photo is sent to <strong>OpenAI</strong>, a third-party AI service, solely to generate your sticker pack. Specifically, your photo is transmitted to OpenAI&apos;s image generation API (DALL-E / GPT Image) to create stylized sticker images based on your face. We do not store, sell, or use your photo for any other purpose. Your photo is automatically deleted from our servers after sticker generation is complete. OpenAI&apos;s use of your data is governed by their <a href="https://openai.com/policies/privacy-policy" className="underline text-[#222]" target="_blank" rel="noopener noreferrer">Privacy Policy</a> and <a href="https://openai.com/policies/api-data-usage-policies" className="underline text-[#222]" target="_blank" rel="noopener noreferrer">API Data Usage Policy</a>.
                                </li>
                                <li>
                                    <strong>Purchase Information:</strong> All in-app purchases are processed by Apple through the App Store. We use RevenueCat to manage and verify subscription and credit status. We do not store your credit card or payment details.
                                </li>
                                <li>
                                    <strong>Usage Data:</strong> We may collect anonymous usage data (e.g., which features are used) to improve the app. This data is not linked to your identity.
                                </li>
                                <li>
                                    <strong>Contact Data:</strong> If you contact us for support, we may collect your email address to respond to your request.
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-[#222222] mb-4">Photo & Camera Access</h2>
                            <p>
                                StickerMe requests access to your photo library to allow you to select a selfie for sticker generation. We only access photos you explicitly choose to share. We do not access your camera roll automatically or upload any photos without your action.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-[#222222] mb-4">How We Use Your Information</h2>
                            <ul className="space-y-2 list-disc pl-5">
                                <li>To generate AI-powered stickers from your uploaded photo.</li>
                                <li>To process and verify in-app purchases via Apple and RevenueCat.</li>
                                <li>To provide customer support when you contact us.</li>
                                <li>To improve app performance and user experience.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-[#222222] mb-4">Third-Party Services</h2>
                            <p className="mb-4">We work with the following trusted partners to deliver our service. Before your data is shared with any third-party AI service, the app will ask for your explicit consent.</p>
                            <ul className="space-y-3 list-disc pl-5">
                                <li><strong>OpenAI:</strong> Your uploaded photo is sent to OpenAI&apos;s API to generate AI sticker images. The data sent includes: your photo (image file). OpenAI processes the image to generate stylized sticker artwork and does not use API data for training purposes. <a href="https://openai.com/policies/privacy-policy" className="underline text-[#222]" target="_blank" rel="noopener noreferrer">OpenAI Privacy Policy</a> · <a href="https://openai.com/policies/api-data-usage-policies" className="underline text-[#222]" target="_blank" rel="noopener noreferrer">API Data Usage Policy</a></li>
                                <li><strong>RevenueCat:</strong> Manages in-app purchase verification and credit tracking. <a href="https://www.revenuecat.com/privacy" className="underline text-[#222]" target="_blank" rel="noopener noreferrer">RevenueCat Privacy Policy</a></li>
                                <li><strong>Apple App Store:</strong> Handles all payment processing for in-app purchases. <a href="https://www.apple.com/legal/privacy/" className="underline text-[#222]" target="_blank" rel="noopener noreferrer">Apple Privacy Policy</a></li>
                                <li><strong>Vercel:</strong> Hosts our backend infrastructure. <a href="https://vercel.com/legal/privacy-policy" className="underline text-[#222]" target="_blank" rel="noopener noreferrer">Vercel Privacy Policy</a></li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-[#222222] mb-4">Data Retention</h2>
                            <p>
                                Your uploaded photo is used only to generate stickers and is deleted immediately after the generation process completes. We do not store your photos on our servers. Purchase records and credit balances are retained as long as you use the app, and are managed by RevenueCat and Apple.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-[#222222] mb-4">Data Deletion</h2>
                            <p>
                                Since we do not store personal accounts or photos, there is no persistent personal data to delete. If you wish to remove any data associated with your support requests, contact us at the email below and we will delete it within 30 days.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-[#222222] mb-4">Children&apos;s Privacy</h2>
                            <p>
                                StickerMe is not directed to children under the age of 13. We do not knowingly collect personal information from children under 13. If you believe a child has provided us with personal information, please contact us and we will delete it promptly.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-[#222222] mb-4">Changes to This Policy</h2>
                            <p>
                                We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated effective date. Continued use of the app after changes constitutes acceptance of the new policy.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-[#222222] mb-4">Contact Us</h2>
                            <p>
                                If you have any questions about this Privacy Policy, please contact us at:<br />
                                <strong>NGO VAN HONG</strong><br />
                                <a href="mailto:hong.nv1504@gmail.com" className="underline text-[#222]">hong.nv1504@gmail.com</a>
                            </p>
                        </section>

                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
