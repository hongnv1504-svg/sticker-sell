'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ImageUploader from '@/components/ImageUploader';
import { getPackById, getDefaultPack, StickerPack } from '@/lib/packs';
import { analytics } from '@/lib/analytics';

function UploadContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const packId = searchParams.get('pack');

    const [selectedPack, setSelectedPack] = useState<StickerPack>(getDefaultPack());
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (packId) {
            const pack = getPackById(packId);
            if (pack) {
                setSelectedPack(pack);
                // Track pack selection
                analytics.trackPackSelected(pack.id, pack.name);
            }
        }
    }, [packId]);

    const handleImageSelect = (file: File, previewUrl: string) => {
        setSelectedFile(file);
        setPreview(previewUrl);
        setError(null);
    };

    const handleGenerate = async () => {
        if (!selectedFile) return;

        setIsUploading(true);
        setError(null);

        try {
            // Create form data
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('packId', selectedPack.id);

            // Upload image
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to upload image');
            }

            // Track successful upload
            analytics.trackImageUploaded(data.jobId);
            // Note: generation will start after payment, so we don't track it here

            // Redirect to payment page (pay-first model)
            router.push(`/pay/${data.jobId}`);
        } catch (err) {
            console.error('Upload error:', err);
            setError(err instanceof Error ? err.message : 'Something went wrong');
            setIsUploading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-1 pt-32 pb-20 px-6">
                <div className="max-w-2xl mx-auto">
                    {/* Selected Pack Info */}
                    <div
                        className="glass-card p-4 mb-8 flex items-center justify-between"
                        style={{ borderColor: `${selectedPack.colors.primary}40` }}
                    >
                        <div className="flex items-center gap-3">
                            <div
                                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                                style={{ background: `linear-gradient(135deg, ${selectedPack.colors.primary}30, ${selectedPack.colors.secondary}30)` }}
                            >
                                {selectedPack.icon}
                            </div>
                            <div>
                                <h3 className="font-semibold text-[#222222]">{selectedPack.name}</h3>
                                <p className="text-sm text-[#a7a7a7]">${(selectedPack.price / 100).toFixed(2)} • 9 stickers</p>
                            </div>
                        </div>
                        <Link
                            href="/packs"
                            className="text-sm text-[#a7a7a7] hover:text-[#222222] transition-colors"
                        >
                            Change Style →
                        </Link>
                    </div>

                    {/* Title */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold mb-4 text-[#222222]">
                            Upload Your Photo
                        </h1>
                        <p className="text-[#a7a7a7] text-lg">
                            Choose a clear selfie with good lighting for best results
                        </p>
                    </div>

                    {/* Uploader */}
                    <ImageUploader
                        onImageSelect={handleImageSelect}
                        disabled={isUploading}
                    />

                    {/* Error message */}
                    {error && (
                        <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-center">
                            {error}
                        </div>
                    )}

                    {/* Generate Button */}
                    {preview && (
                        <div className="mt-8 text-center">
                            <button
                                onClick={handleGenerate}
                                disabled={isUploading}
                                className="btn btn-primary text-lg py-4 px-12"
                                style={{ background: `linear-gradient(135deg, ${selectedPack.colors.primary}, ${selectedPack.colors.secondary})` }}
                            >
                                {isUploading ? (
                                    <>
                                        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        Generate {selectedPack.name} Stickers
                                        <span>✨</span>
                                    </>
                                )}
                            </button>

                            <p className="mt-4 text-sm text-[#a7a7a7]">
                                Takes about 30 seconds • Pay only if you like the result
                            </p>
                        </div>
                    )}

                    {/* Tips */}
                    <div className="mt-12 glass-card p-6">
                        <h3 className="font-semibold text-[#222222] mb-4 flex items-center gap-2">
                            <span>💡</span> Tips for Best Results
                        </h3>
                        <ul className="space-y-2 text-[#a7a7a7]">
                            <li className="flex items-start gap-2">
                                <span className="text-green-400">✓</span>
                                Use a photo with just one face clearly visible
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green-400">✓</span>
                                Good lighting helps capture facial features better
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green-400">✓</span>
                                Front-facing photos work best
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-red-400">✗</span>
                                Avoid blurry or heavily filtered photos
                            </li>
                        </ul>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default function UploadPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <UploadContent />
        </Suspense>
    );
}
