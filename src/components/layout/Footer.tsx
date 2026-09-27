import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';
import { AppView } from '../../types/navigation';

interface FooterProps {
  onNavigate: (view: AppView) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="border-t border-zinc-800/80 bg-zinc-950 text-zinc-500 py-8 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand & disclaimer */}
        <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded bg-emerald-950 text-emerald-400 flex items-center justify-center font-bold text-xs border border-emerald-800/50">
              ♠
            </span>
            <span className="text-sm font-semibold text-zinc-300">PokerCoach</span>
          </div>
          <span className="hidden sm:inline text-zinc-700">•</span>
          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>100% Educativo. Fichas virtuales sin valor monetario. Sin dinero real.</span>
          </div>
        </div>

        {/* Quick Nav Links */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
          <button
            onClick={() => onNavigate('learn')}
            className="hover:text-emerald-400 transition-colors"
          >
            Tutorial
          </button>
          <button
            onClick={() => onNavigate('play')}
            className="hover:text-emerald-400 transition-colors"
          >
            Mesa de Póker
          </button>
          <button
            onClick={() => onNavigate('analyzer')}
            className="hover:text-emerald-400 transition-colors"
          >
            Calculadora
          </button>
          <button
            onClick={() => onNavigate('coach')}
            className="hover:text-emerald-400 transition-colors"
          >
            Entrenador IA
          </button>
          <button
            onClick={() => onNavigate('stats')}
            className="hover:text-emerald-400 transition-colors"
          >
            Estadísticas
          </button>
        </div>
      </div>
    </footer>
  );
};
