interface ProgressBarProps {
  value: number; // 0–100
  label?: string;
}

export default function ProgressBar({ value, label }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className="w-full space-y-1" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      {label && <p className="text-xs text-gray-500">{label}</p>}
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-indigo-500 transition-all duration-200"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-right text-xs text-gray-400">{pct}%</p>
    </div>
  );
}
