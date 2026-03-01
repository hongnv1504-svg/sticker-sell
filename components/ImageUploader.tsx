'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '@/lib/image-utils';

interface ImageUploaderProps {
    onImageSelect: (file: File, preview: string) => void;
    disabled?: boolean;
}

export default function ImageUploader({ onImageSelect, disabled }: ImageUploaderProps) {
    const [imageToCrop, setImageToCrop] = useState<string | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        setError(null);
        if (acceptedFiles.length === 0) return;

        const file = acceptedFiles[0];
        if (!file.type.startsWith('image/')) {
            setError('Please upload an image file (JPG, PNG)');
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            setError('Image size must be less than 10MB');
            return;
        }

        const reader = new FileReader();
        reader.onload = () => setImageToCrop(reader.result as string);
        reader.readAsDataURL(file);
    }, []);

    const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleConfirmCrop = async () => {
        if (!imageToCrop || !croppedAreaPixels) return;
        setIsProcessing(true);
        try {
            const croppedBlob = await getCroppedImg(imageToCrop, croppedAreaPixels);
            if (croppedBlob) {
                const croppedUrl = URL.createObjectURL(croppedBlob);
                const croppedFile = new File([croppedBlob], 'cropped-image.jpg', { type: 'image/jpeg' });
                setPreview(croppedUrl);
                onImageSelect(croppedFile, croppedUrl);
                setImageToCrop(null);
            }
        } catch (e) {
            console.error(e);
            setError('Failed to crop image');
        } finally {
            setIsProcessing(false);
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'] },
        maxFiles: 1,
        disabled: disabled || isProcessing || !!imageToCrop
    });

    const removeImage = () => { setPreview(null); setImageToCrop(null); setError(null); };
    const cancelCrop = () => setImageToCrop(null);

    // 1. Cropping View
    if (imageToCrop) {
        return (
            <div className="glass-card p-6 rounded-2xl max-w-xl mx-auto">
                <h3 className="text-xl font-semibold text-[#222222] mb-4 text-center">Adjust Your Photo</h3>
                <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-[#f0f0f0] mb-6">
                    <Cropper
                        image={imageToCrop}
                        crop={crop}
                        zoom={zoom}
                        aspect={1}
                        onCropChange={setCrop}
                        onCropComplete={onCropComplete}
                        onZoomChange={setZoom}
                    />
                </div>

                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <span className="text-[#a7a7a7] text-sm">Zoom</span>
                        <input
                            type="range"
                            value={zoom}
                            min={1}
                            max={3}
                            step={0.1}
                            aria-labelledby="Zoom"
                            onChange={(e) => setZoom(Number(e.target.value))}
                            className="flex-1 accent-[#FA5D29] h-1 bg-[#ededed] rounded-lg appearance-none cursor-pointer"
                        />
                    </div>

                    <div className="flex gap-4">
                        <button onClick={cancelCrop} className="btn btn-ghost flex-1 py-3" disabled={isProcessing}>
                            Cancel
                        </button>
                        <button onClick={handleConfirmCrop} className="btn btn-primary flex-1 py-3" disabled={isProcessing}>
                            {isProcessing ? (
                                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : 'Apply Crop'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // 2. Preview View
    if (preview) {
        return (
            <div className="relative">
                <div className="glass-card p-4 rounded-2xl">
                    <div className="relative aspect-square w-full max-w-md mx-auto overflow-hidden rounded-xl">
                        <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 border-2 border-[#ededed] pointer-events-none rounded-xl" />
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                        <p className="text-sm text-[#a7a7a7]">
                            ✓ Image ready for sticker generation
                        </p>
                        <button
                            onClick={removeImage}
                            className="btn btn-ghost text-sm py-2 px-4 underline hover:text-[#FA5D29]"
                            disabled={disabled}
                        >
                            Change Photo
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // 3. Upload View
    return (
        <div>
            <div
                {...getRootProps()}
                className={`dropzone border-2 border-dashed rounded-3xl p-12 text-center transition-all group
                    ${isDragActive
                        ? 'border-[#FA5D29] bg-[#FA5D29]/5'
                        : 'border-[#dedede] hover:border-[#FA5D29]/50 hover:bg-[#FA5D29]/3'
                    }
                    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
                <input {...getInputProps()} />

                <div className="flex flex-col items-center gap-6">
                    <div className="w-24 h-24 rounded-full bg-[#FA5D29]/10 flex items-center justify-center text-5xl group-hover:scale-110 transition-transform duration-300">
                        📸
                    </div>

                    <div>
                        <p className="text-xl font-semibold text-[#222222] mb-2">
                            {isDragActive ? 'Drop your photo here' : 'Select a photo to begin'}
                        </p>
                        <p className="text-[#a7a7a7] text-sm">
                            Drag & drop or click to browse • JPG, PNG up to 10MB
                        </p>
                    </div>

                    <button type="button" className="btn btn-secondary px-8" disabled={disabled}>
                        Browse Files
                    </button>
                </div>
            </div>

            {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                    {error}
                </div>
            )}

            <div className="mt-8 grid grid-cols-3 gap-4 text-center text-sm text-[#a7a7a7]">
                <div className="flex flex-col items-center gap-2 p-3 rounded-xl border border-[#ededed] bg-[#f8f8f8]">
                    <span className="text-2xl">👤</span>
                    <span>One face clearly visible</span>
                </div>
                <div className="flex flex-col items-center gap-2 p-3 rounded-xl border border-[#ededed] bg-[#f8f8f8]">
                    <span className="text-2xl">💡</span>
                    <span>Good natural lighting</span>
                </div>
                <div className="flex flex-col items-center gap-2 p-3 rounded-xl border border-[#ededed] bg-[#f8f8f8]">
                    <span className="text-2xl">📷</span>
                    <span>High quality selfie</span>
                </div>
            </div>
        </div>
    );
}
