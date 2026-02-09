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
                    <span className="text-sm text-gray-400">{label}</span>
                    <span className="text-sm font-medium text-white">
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
