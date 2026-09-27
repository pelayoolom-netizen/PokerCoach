import React from 'react';

interface ChipStackProps {
  amount: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const ChipStack: React.FC<ChipStackProps> = ({
  amount,
  size = 'md',
  showLabel = true,
  className = '',
}) => {
  // Determine color theme based on chip value
  const getChipColors = (val: number) => {
    if (val >= 1000) return 'from-amber-500 to-amber-700 border-amber-300 text-amber-100';
    if (val >= 500) return 'from-purple-600 to-purple-800 border-purple-400 text-purple-100';
    if (val >= 100) return 'from-emerald-600 to-emerald-800 border-emerald-400 text-emerald-100';
    if (val >= 25) return 'from-blue-600 to-blue-800 border-blue-400 text-blue-100';
    if (val >= 5) return 'from-rose-600 to-rose-800 border-rose-400 text-rose-100';
    return 'from-zinc-600 to-zinc-800 border-zinc-400 text-zinc-100';
  };

  const sizeClasses = {
    sm: {
      chip: 'w-4 h-4 text-[9px] border',
      text: 'text-xs',
    },
    md: {
      chip: 'w-6 h-6 text-[10px] border-2',
      text: 'text-sm font-semibold',
    },
    lg: {
      chip: 'w-8 h-8 text-xs border-2',
      text: 'text-base font-bold',
    },
  }[size];

  const colors = getChipColors(amount);

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      {/* 3D Chip Stack Icon */}
      <div className="relative flex items-center justify-center">
        <div
          className={`${sizeClasses.chip} rounded-full bg-gradient-to-tr ${colors} shadow-md flex items-center justify-center font-bold tracking-tight select-none ring-1 ring-black/40`}
        >
          <span className="opacity-90">🪙</span>
        </div>
      </div>

      {showLabel && (
        <span className={`text-zinc-200 tracking-tight font-mono ${sizeClasses.text}`}>
          {amount.toLocaleString()}
        </span>
      )}
    </div>
  );
};
