import React from 'react';
import {
  BookOpen,
  Bot,
  BrainCircuit,
  HelpCircle,
  MessageSquare,
  Users,
  ChevronRight,
} from 'lucide-react';
import { AppView } from '../../types/navigation';

interface QuickActionsProps {
  onNavigate: (view: AppView) => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onNavigate }) => {
  const actions = [
    {
      id: 'learn' as AppView,
      title: 'Aprender a jugar',
      subtitle: 'Tutorial interactivo paso a paso',
      description: '17 lecciones rápidas desde las ciegas hasta el cálculo de la mano ganadora.',
      icon: <BookOpen className="w-6 h-6 text-emerald-400" />,
      accent: 'border-emerald-700/50 hover:border-emerald-500 bg-emerald-950/20',
      tag: 'Recomendado principiantes',
    },
    {
      id: 'play' as AppView,
      title: 'Jugar',
      subtitle: 'Mesa contra bots o amigos',
      description: 'Mesa de Texas Hold\'em sin dinero real. 3 niveles de bots y lobby para amigos.',
      icon: <Bot className="w-6 h-6 text-teal-400" />,
      accent: 'border-teal-700/50 hover:border-teal-500 bg-teal-950/20',
      tag: 'Motor real de póker',
    },
    {
      id: 'analyzer' as AppView,
      title: 'Analizar una mano',
      subtitle: 'Calculadora de Showdown y Foto',
      description: 'Introduce tus cartas y las del rival o sube una fotografía para determinar el ganador.',
      icon: <BrainCircuit className="w-6 h-6 text-amber-400" />,
      accent: 'border-amber-700/50 hover:border-amber-500 bg-amber-950/20',
      tag: 'Motor determinista',
    },
    {
      id: 'trainer' as AppView,
      title: 'Entrenar',
      subtitle: 'Práctica de situaciones reales',
      description: 'Enfrenta situaciones preflop y postflop: decide si hacer Check, Bet, Call, Raise o Fold.',
      icon: <HelpCircle className="w-6 h-6 text-purple-400" />,
      accent: 'border-purple-700/50 hover:border-purple-500 bg-purple-950/20',
      tag: 'Toma de decisiones',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
          <span>Modos Principales</span>
        </h2>
        <span className="text-xs text-zinc-400">Selecciona una modalidad para comenzar</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {actions.map((act) => (
          <button
            key={act.id}
            onClick={() => onNavigate(act.id)}
            className={`text-left p-5 rounded-2xl border transition-all duration-200 group relative overflow-hidden flex flex-col justify-between ${act.accent} hover:shadow-xl hover:-translate-y-0.5`}
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 shadow-md">
                  {act.icon}
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-zinc-900/90 text-zinc-300 border border-zinc-800">
                  {act.tag}
                </span>
              </div>

              <h3 className="text-lg font-bold text-zinc-100 group-hover:text-emerald-300 transition-colors">
                {act.title}
              </h3>
              <p className="text-xs font-semibold text-emerald-400/90 mb-1.5">{act.subtitle}</p>
              <p className="text-xs text-zinc-400 leading-relaxed">{act.description}</p>
            </div>

            <div className="pt-4 flex items-center text-xs font-semibold text-zinc-300 group-hover:text-emerald-400 transition-colors">
              <span>Abrir sección</span>
              <ChevronRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
