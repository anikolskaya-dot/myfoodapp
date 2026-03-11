import { motion } from 'motion/react';

interface ProgressRingProps {
  remaining: number;
  total: number;
  size?: number;
  strokeWidth?: number;
}

export default function ProgressRing({ remaining, total, size = 200, strokeWidth = 16 }: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const consumed = Math.max(0, total - remaining);
  const percentage = Math.min(1, consumed / total);
  const offset = circumference - percentage * circumference;
  
  const isOverLimit = remaining < 0;
  const ringColor = isOverLimit ? '#ef4444' : '#3b82f6';

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#18181b"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={ringColor}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">
          {isOverLimit ? 'Перебор' : 'Осталось'}
        </span>
        <span className={`text-4xl font-bold font-display ${isOverLimit ? 'text-red-500' : 'text-white'}`}>
          {Math.abs(remaining)}
        </span>
        <span className="text-zinc-500 text-sm font-medium mt-1">Ккал</span>
      </div>
    </div>
  );
}
