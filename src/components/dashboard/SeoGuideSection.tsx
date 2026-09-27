import React from 'react';
import { BookOpen, Award, Layers, HelpCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { AppView } from '../../types/navigation';

interface SeoGuideSectionProps {
  onNavigate: (view: AppView) => void;
}

export const SeoGuideSection: React.FC<SeoGuideSectionProps> = ({ onNavigate }) => {
  return (
    <section
      aria-labelledby="seo-guide-heading"
      className="p-6 sm:p-8 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 shadow-xl space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
        <div>
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-1">
            Guía Esencial
          </span>
          <h2
            id="seo-guide-heading"
            className="text-xl sm:text-2xl font-black text-zinc-100 tracking-tight"
          >
            Aprende a jugar al póker desde cero
          </h2>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-zinc-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Fichas virtuales • Formato educativo</span>
        </div>
      </div>

      <p className="text-sm text-zinc-300 leading-relaxed max-w-4xl">
        El <strong>Texas Hold'em</strong> es la modalidad de póker más jugada del mundo. Tanto si nunca has visto una baraja como si quieres afianzar tus conceptos, <strong>Poker Coach</strong> te enseña las <strong>reglas del póker</strong>, la <strong>clasificación de manos</strong> y la toma de decisiones estratégicas paso a paso sin arriesgar dinero real.
      </p>

      {/* 4 Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pillar 1: Reglas básicas */}
        <article className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/70 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400">
            <BookOpen className="w-4 h-4" />
            <h3 className="font-bold text-sm text-zinc-100">1. Reglas básicas del Texas Hold'em</h3>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Cada jugador recibe <strong>2 cartas privadas</strong> exclusivas. En el centro de la mesa se revelan hasta <strong>5 cartas comunitarias</strong>. Tu objetivo es componer la <strong>mejor jugada de 5 cartas</strong> combinando cualquiera de tus cartas privadas con las de la mesa.
          </p>
        </article>

        {/* Pillar 2: Manos de poker */}
        <article className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/70 space-y-2">
          <div className="flex items-center gap-2 text-teal-400">
            <Award className="w-4 h-4" />
            <h3 className="font-bold text-sm text-zinc-100">2. Clasificación de manos de póker</h3>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Las combinaciones se ordenan jerárquicamente: desde la <strong>Escalera Real</strong> y la <strong>Escalera de Color</strong>, pasando por el <strong>Póker</strong>, <strong>Full House</strong>, <strong>Color</strong>, <strong>Escalera</strong>, <strong>Trío</strong>, <strong>Doble Pareja</strong>, hasta la <strong>Pareja</strong> y <strong>Carta Alta</strong>. Si hay empate, deciden las cartas de desempate (<em>kickers</em>).
          </p>
        </article>

        {/* Pillar 3: Las 4 rondas de apuestas */}
        <article className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/70 space-y-2">
          <div className="flex items-center gap-2 text-purple-400">
            <Layers className="w-4 h-4" />
            <h3 className="font-bold text-sm text-zinc-100">3. Cómo funcionan las rondas de apuestas</h3>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Una mano se divide en 4 calles: <strong>Preflop</strong> (con tus 2 cartas), <strong>Flop</strong> (las primeras 3 cartas comunitarias), <strong>Turn</strong> (la cuarta carta) y <strong>River</strong> (la quinta y última). Tras cada ronda hay turnos de apuestas antes del desenlace o <strong>Showdown</strong>.
          </p>
        </article>

        {/* Pillar 4: Decisiones básicas */}
        <article className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/70 space-y-2">
          <div className="flex items-center gap-2 text-amber-400">
            <HelpCircle className="w-4 h-4" />
            <h3 className="font-bold text-sm text-zinc-100">4. Decisiones clave para principiantes</h3>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            En tu turno puedes <strong>Pasar (Check)</strong> si no hay apuesta, <strong>Apostar (Bet)</strong> para iniciar la acción, <strong>Igualar (Call)</strong> para ver la siguiente carta, <strong>Subir (Raise)</strong> para presionar o <strong>Retirarte (Fold)</strong> para proteger tus fichas restantes.
          </p>
        </article>
      </div>

      {/* Call to action bar */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <span className="text-zinc-400 text-center sm:text-left">
          ¿Listo para poner en práctica las reglas? Empieza con el tutorial o juega una partida guiada.
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigate('learn')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-950/90 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 font-semibold transition-colors"
          >
            <span>Ver Tutorial Completo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onNavigate('play')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold transition-colors"
          >
            <span>Mesa de Práctica</span>
          </button>
        </div>
      </div>
    </section>
  );
};
