import React from 'react';
import { BookOpen, Bot, Sparkles, Trophy } from 'lucide-react';
import { AppView } from '../../types/navigation';
import { CardView } from '../common/CardView';

interface HeroSectionProps {
  onNavigate: (view: AppView) => void;
  completedLessonsCount: number;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onNavigate,
  completedLessonsCount,
}) => {
  return (
    <section
      aria-label="Presentación Poker Coach"
      className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-emerald-950/60 via-zinc-900 to-zinc-950 border border-emerald-800/40 p-6 sm:p-10 shadow-2xl"
    >
      {/* Background ambient poker felt glow */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
        <div className="max-w-xl text-center lg:text-left">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/60 border border-emerald-600/50 text-emerald-300 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Texas Hold'em sin apuestas de dinero real</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-zinc-100 leading-tight">
            Poker Coach — Aprende a jugar al póker
          </h1>
          <p className="text-lg sm:text-xl font-medium text-emerald-400 mt-2 mb-4">
            "Aprende las reglas, las manos y las decisiones básicas de forma rápida y practica jugando."
          </p>

          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed mb-6">
            Domina el <strong>Texas Hold'em</strong> desde cero. Conoce las combinaciones y las calles de apuestas, practica en vivo contra bots con IA, analiza situaciones reales y consulta a tu entrenador inteligente.
          </p>

          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
            <button
              type="button"
              onClick={() => onNavigate('learn')}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-950/80 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <BookOpen className="w-4 h-4" />
              <span>Aprender a jugar al póker</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('play')}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700/80 text-zinc-100 font-semibold text-sm border border-zinc-700 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Bot className="w-4 h-4 text-emerald-400" />
              <span>Mesa contra bots</span>
            </button>
          </div>
        </div>

        {/* Visual Cards Fan Preview */}
        <div className="relative flex items-center justify-center pt-4 lg:pt-0">
          <div className="relative w-64 h-40 flex items-center justify-center">
            {/* Card 1: Ace of Spades */}
            <div className="absolute transform -rotate-12 -translate-x-12 translate-y-2 hover:-translate-y-2 transition-transform duration-300">
              <CardView
                card={{ rank: 'A', suit: 'spades' }}
                size="lg"
                highlighted
              />
            </div>

            {/* Card 2: King of Spades */}
            <div className="absolute transform rotate-8 translate-x-10 hover:-translate-y-2 transition-transform duration-300">
              <CardView
                card={{ rank: 'K', suit: 'spades' }}
                size="lg"
                highlighted
              />
            </div>

            {/* Community card teaser: Queen of Spades */}
            <div className="absolute transform rotate-20 translate-x-24 translate-y-4 opacity-80 scale-90">
              <CardView
                card={{ rank: 'Q', suit: 'spades' }}
                size="md"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
