import React from 'react';
import { Card, Suit } from '../../types/poker';

interface CardViewProps {
  card?: Card | null;
  hidden?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  highlighted?: boolean;
  dimmed?: boolean;
  className?: string;
  onClick?: () => void;
}

const SUIT_SYMBOLS: Record<Suit, { symbol: string; color: string; label: string }> = {
  spades: { symbol: '♠', color: 'text-zinc-950', label: 'Picas' },
  hearts: { symbol: '♥', color: 'text-red-600', label: 'Corazones' },
  diamonds: { symbol: '♦', color: 'text-red-600', label: 'Diamantes' },
  clubs: { symbol: '♣', color: 'text-zinc-950', label: 'Tréboles' },
};

const SIZES = {
  xs: {
    w: 'w-7',
    h: 'h-10',
    rankText: 'text-[10px] font-bold leading-none',
    suitText: 'text-[9px] leading-none',
    centerSuit: 'text-xs',
    padding: 'p-0.5',
    rounded: 'rounded-[3px]',
  },
  sm: {
    w: 'w-10',
    h: 'h-14',
    rankText: 'text-xs font-bold leading-none',
    suitText: 'text-[11px] leading-none',
    centerSuit: 'text-sm',
    padding: 'p-1',
    rounded: 'rounded-sm',
  },
  md: {
    w: 'w-14',
    h: 'h-20',
    rankText: 'text-sm font-extrabold leading-none',
    suitText: 'text-xs leading-none',
    centerSuit: 'text-xl',
    padding: 'p-1.5',
    rounded: 'rounded-md',
  },
  lg: {
    w: 'w-20',
    h: 'h-28',
    rankText: 'text-lg font-black leading-none',
    suitText: 'text-sm leading-none',
    centerSuit: 'text-3xl',
    padding: 'p-2',
    rounded: 'rounded-lg',
  },
  xl: {
    w: 'w-24',
    h: 'h-36',
    rankText: 'text-2xl font-black leading-none',
    suitText: 'text-lg leading-none',
    centerSuit: 'text-4xl',
    padding: 'p-2.5',
    rounded: 'rounded-xl',
  },
};

export const CardView: React.FC<CardViewProps> = ({
  card,
  hidden = false,
  size = 'md',
  highlighted = false,
  dimmed = false,
  className = '',
  onClick,
}) => {
  const sizeConfig = SIZES[size];

  if (hidden || !card) {
    return (
      <div
        onClick={onClick}
        className={`relative ${sizeConfig.w} ${sizeConfig.h} ${sizeConfig.rounded} 
          bg-gradient-to-br from-emerald-800 via-emerald-950 to-zinc-900 
          border border-emerald-600/40 shadow-md flex items-center justify-center 
          transition-all duration-200 select-none overflow-hidden
          ${dimmed ? 'opacity-40' : 'opacity-100'} ${className}`}
      >
        <div className="absolute inset-0.5 border border-emerald-500/20 rounded-[inherit] flex items-center justify-center">
          <div className="w-full h-full bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:6px_6px] opacity-30" />
        </div>
        <div className="relative text-emerald-400 font-serif font-black text-[10px] tracking-widest opacity-60">
          PC
        </div>
      </div>
    );
  }

  const { symbol, color, label } = SUIT_SYMBOLS[card.suit];

  return (
    <div
      onClick={onClick}
      role="img"
      aria-label={`${card.rank} de ${label}`}
      className={`relative ${sizeConfig.w} ${sizeConfig.h} ${sizeConfig.rounded} 
        bg-white text-zinc-950 shadow-md flex flex-col justify-between 
        ${sizeConfig.padding} select-none transition-all duration-200
        border ${
          highlighted
            ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-zinc-950 border-amber-300 scale-105 shadow-amber-500/30'
            : 'border-zinc-200/90'
        }
        ${dimmed ? 'opacity-35 grayscale-[50%]' : 'opacity-100'}
        ${onClick ? 'cursor-pointer hover:-translate-y-1 hover:shadow-lg' : ''}
        ${className}`}
    >
      {/* Top Left Indicator */}
      <div className={`flex flex-col items-center leading-none ${color}`}>
        <span className={sizeConfig.rankText}>{card.rank}</span>
        <span className={sizeConfig.suitText}>{symbol}</span>
      </div>

      {/* Center Suit Symbol */}
      <div className={`absolute inset-0 flex items-center justify-center pointer-events-none ${color} ${sizeConfig.centerSuit}`}>
        {symbol}
      </div>

      {/* Bottom Right Indicator (Rotated 180) */}
      <div className={`flex flex-col items-center leading-none rotate-180 self-end ${color}`}>
        <span className={sizeConfig.rankText}>{card.rank}</span>
        <span className={sizeConfig.suitText}>{symbol}</span>
      </div>
    </div>
  );
};
