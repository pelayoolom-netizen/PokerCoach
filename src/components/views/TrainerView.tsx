import React, { useState } from 'react';
import { HelpCircle, CheckCircle2, ChevronRight, AlertCircle, Sparkles } from 'lucide-react';
import { Card } from '../../types/poker';
import { UserProfile } from '../../types/user';
import { CardView } from '../common/CardView';
import { sound } from '../../lib/sound';

interface TrainingScenario {
  id: number;
  title: string;
  street: string;
  position: string;
  potSize: number;
  facingAction: string;
  heroCards: Card[];
  boardCards: Card[];
  recommendedAction: string;
  acceptableAction?: string;
  explanation: string;
}

const SCENARIOS: TrainingScenario[] = [
  {
    id: 1,
    title: 'Apuesta de Continuación en el Botón',
    street: 'Flop',
    position: 'Botón (BTN)',
    potSize: 60,
    facingAction: 'El rival en Ciega Grande hizo Check tras pagar tu subida preflop.',
    heroCards: [{ rank: 'A', suit: 'spades' }, { rank: 'Q', suit: 'spades' }],
    boardCards: [{ rank: 'K', suit: 'spades' }, { rank: '8', suit: 'diamonds' }, { rank: '2', suit: 'clubs' }],
    recommendedAction: 'BET',
    acceptableAction: 'CHECK',
    explanation: 'Excelente línea. Tienes ventaja de rango al ser el agresor preflop en posición (BTN), y tienes un proyecto de puerta trasera (backdoor flush y gutshot) más cartas altas (overcards). Una apuesta pequeña de ~20-25 fichas obliga a retirarse a manos como 44-77 o cartas altas peores.',
  },
  {
    id: 2,
    title: 'Proyecto Monstruo (Combo Draw) en el Flop',
    street: 'Flop',
    position: 'Cutoff (CO)',
    potSize: 80,
    facingAction: 'El rival en posición temprana apuesta 40 fichas.',
    heroCards: [{ rank: 'J', suit: 'hearts' }, { rank: '10', suit: 'hearts' }],
    boardCards: [{ rank: '9', suit: 'hearts' }, { rank: '8', suit: 'hearts' }, { rank: '2', suit: 'clubs' }],
    recommendedAction: 'RAISE',
    acceptableAction: 'CALL',
    explanation: '¡Tienes un monstruo en proyecto! Tienes proyecto de color al As no necesario, escalera abierta (cualquier 7 o Q te da escalera) y escalera de color. Tienes 15 cartas que te dan la mejor jugada (outs). Subir (Raise) pone máxima presión a parejas del rival o puedes pagar cómodamente por pot odds.',
  },
  {
    id: 3,
    title: 'Top Pair en River Seco',
    street: 'River',
    position: 'Small Blind (SB)',
    potSize: 150,
    facingAction: 'El rival ha pagado en Flop y Turn. Ahora te toca actuar en el River.',
    heroCards: [{ rank: 'A', suit: 'diamonds' }, { rank: 'K', suit: 'clubs' }],
    boardCards: [
      { rank: 'A', suit: 'spades' },
      { rank: '9', suit: 'hearts' },
      { rank: '4', suit: 'diamonds' },
      { rank: '2', suit: 'clubs' },
      { rank: '7', suit: 'spades' },
    ],
    recommendedAction: 'BET',
    acceptableAction: 'CHECK',
    explanation: 'Apuesta por valor (Value Bet). Tu mano (Top Pair con Kicker Rey) es muy fuerte en un board sin escaleras ni colores completados. Apostar ~60-80 fichas permite cobrar valor a parejas peores del rival como A-10, A-J o 9-9.',
  },
  {
    id: 4,
    title: 'Segunda Pareja ante Agresividad en River',
    street: 'River',
    position: 'Big Blind (BB)',
    potSize: 220,
    facingAction: 'Apostaste en el Turn, y ahora en el River el rival sube fuerte con un All-in de 300 fichas.',
    heroCards: [{ rank: 'K', suit: 'hearts' }, { rank: '10', suit: 'hearts' }],
    boardCards: [
      { rank: 'A', suit: 'diamonds' },
      { rank: 'K', suit: 'spades' },
      { rank: 'Q', suit: 'hearts' },
      { rank: 'J', suit: 'clubs' },
      { rank: '3', suit: 'diamonds' },
    ],
    recommendedAction: 'FOLD',
    explanation: 'Retirada obligada (Fold disciplinado). El board tiene 4 cartas para escalera (A-K-Q-J), por lo que cualquier 10 forma escalera más alta y cualquier As te supera. La gran subida del rival casi siempre representa un diez o jugada superior. Arriesgar tu torneo o stack con segunda pareja aquí es un error a largo plazo.',
  },
];

interface TrainerViewProps {
  profile?: UserProfile;
  onUpdateProfile?: (updated: UserProfile) => void;
}

export const TrainerView: React.FC<TrainerViewProps> = ({ profile, onUpdateProfile }) => {
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  const scenario = SCENARIOS[currentScenarioIndex];

  const handleAction = (act: string) => {
    setSelectedAction(act);
    const isCorrect = act === scenario.recommendedAction || act === scenario.acceptableAction;
    if (isCorrect) {
      sound.playWin();
      if (profile && onUpdateProfile) {
        onUpdateProfile({
          ...profile,
          stats: {
            ...profile.stats,
            trainingScenariosSolved: Math.max(profile.stats.trainingScenariosSolved, currentScenarioIndex + 1),
          },
        });
      }
    } else {
      sound.playFold();
    }
  };

  const handleNext = () => {
    setSelectedAction(null);
    setCurrentScenarioIndex((prev) => (prev + 1) % SCENARIOS.length);
  };

  const isRecommended = selectedAction === scenario.recommendedAction;
  const isAcceptable = selectedAction === scenario.acceptableAction;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider mb-1">
            <HelpCircle className="w-4 h-4" />
            <span>Simulador de Decisiones</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-100">
            Entrenamiento de Situaciones
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
            Practica la toma de decisiones estratégicas según posición, fuerza y bote.
          </p>
        </div>

        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-purple-950 border border-purple-800 text-purple-300 self-start sm:self-auto">
          Situación {scenario.id} de {SCENARIOS.length}
        </span>
      </div>

      {/* Main Scenario Container */}
      <div className="max-w-3xl mx-auto p-6 sm:p-8 rounded-3xl bg-zinc-900/90 border border-zinc-800 shadow-2xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-zinc-800">
          <div className="space-y-0.5">
            <span className="text-xs text-purple-400 font-bold uppercase">
              {scenario.street} • Posición: {scenario.position}
            </span>
            <h3 className="text-lg font-bold text-zinc-100">{scenario.title}</h3>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-zinc-400 block">Bote en juego:</span>
            <span className="text-sm font-bold font-mono text-emerald-400">{scenario.potSize} fichas</span>
          </div>
        </div>

        {/* Cards Visuals */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800">
            <span className="text-xs font-bold text-emerald-400 block mb-2 uppercase tracking-wider">
              Tus Cartas (Hero):
            </span>
            <div className="flex gap-2">
              {scenario.heroCards.map((c, i) => (
                <CardView key={i} card={c} size="md" />
              ))}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800">
            <span className="text-xs font-bold text-zinc-300 block mb-2 uppercase tracking-wider">
              Mesa ({scenario.street}):
            </span>
            <div className="flex flex-wrap gap-2">
              {scenario.boardCards.map((c, i) => (
                <CardView key={i} card={c} size="md" />
              ))}
            </div>
          </div>
        </div>

        {/* Action description */}
        <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800 text-xs text-zinc-300 leading-relaxed">
          <strong className="text-zinc-100">Situación actual:</strong> {scenario.facingAction}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <span className="text-xs font-bold text-zinc-200 block">
            ¿Cuál consideras la mejor decisión aquí?
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {['FOLD', 'CHECK', 'CALL', 'BET', 'RAISE'].map((act) => {
              const isSelected = selectedAction === act;
              let style = 'border-zinc-800 bg-zinc-950 text-zinc-300 hover:bg-zinc-800';

              if (selectedAction) {
                if (act === scenario.recommendedAction) {
                  style = 'border-emerald-500 bg-emerald-950 text-emerald-200 font-black shadow-lg';
                } else if (act === scenario.acceptableAction) {
                  style = 'border-teal-500 bg-teal-950 text-teal-200 font-bold';
                } else if (isSelected) {
                  style = 'border-rose-500 bg-rose-950 text-rose-200 font-bold';
                }
              }

              return (
                <button
                  key={act}
                  disabled={!!selectedAction}
                  onClick={() => handleAction(act)}
                  className={`py-3 px-3 rounded-xl text-xs font-bold border transition-all active:scale-95 ${style}`}
                >
                  {act}
                </button>
              );
            })}
          </div>
        </div>

        {/* Strategic Analysis Box */}
        {selectedAction && (
          <div className="p-5 rounded-2xl bg-zinc-950 border border-purple-900/50 space-y-3 animate-in fade-in">
            <div className="flex items-center gap-2">
              {isRecommended ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : isAcceptable ? (
                <Sparkles className="w-5 h-5 text-teal-400" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-400" />
              )}
              <span className="font-bold text-sm text-zinc-100">
                {isRecommended
                  ? '¡Excelente decisión! Línea recomendada.'
                  : isAcceptable
                  ? 'Opción alternativa razonable según rivales.'
                  : 'Línea no óptima en esta situación.'}
              </span>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              {scenario.explanation}
            </p>

            <div className="pt-2 flex justify-end">
              <button
                onClick={handleNext}
                className="flex items-center gap-1 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 font-bold text-xs text-white shadow-md transition-colors"
              >
                <span>Siguiente Situación</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
