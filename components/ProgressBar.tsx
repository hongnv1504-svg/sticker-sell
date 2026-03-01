interface ProgressBarProps {
    current: number;
    total: number;
    label?: string;
}

export default function ProgressBar({ current, total, label }: ProgressBarProps) {
    const percentage = Math.round((current / total) * 100);

    return (
        <div className="w-full">
            {label && (
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-[#a7a7a7]">{label}</span>
                    <span className="text-sm font-semibold text-[#222222]">
                        {current}/{total} ({percentage}%)
                    </span>
                </div>
            )}

            <div className="progress-bar">
                <div
                    className="progress-fill"
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}
