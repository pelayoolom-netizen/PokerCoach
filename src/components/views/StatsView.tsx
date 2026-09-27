import React from 'react';
import { Trophy, TrendingUp, Award, RotateCcw, ShieldCheck, Flame, PieChart } from 'lucide-react';
import { UserProfile } from '../../types/user';
import { HandHistoryRecord } from '../../types/poker';
import { ChipStack } from '../common/ChipStack';
import { CardView } from '../common/CardView';

interface StatsViewProps {
  profile: UserProfile;
  history: HandHistoryRecord[];
  onResetStats: () => void;
  onPlayGame: () => void;
}

export const StatsView: React.FC<StatsViewProps> = ({
  profile,
  history,
  onResetStats,
  onPlayGame,
}) => {
  const { stats } = profile;
  const hasPlayed = stats.handsPlayed > 0;
  const winRate = hasPlayed ? Math.round((stats.handsWon / stats.handsPlayed) * 100) : 0;
  const netChips = stats.chipsWon - stats.chipsLost;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Trophy className="w-4 h-4" />
            <span>Rendimiento y Progreso</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-100">
            Estadísticas del Jugador
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
            Registro real de manos, victorias, fichas ganadas y aprendizaje.
          </p>
        </div>

        {hasPlayed && (
          <button
            onClick={onResetStats}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-400 hover:text-rose-400 transition-colors self-start sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reiniciar estadísticas</span>
          </button>
        )}
      </div>

      {!hasPlayed ? (
        <div className="max-w-md mx-auto text-center py-16 px-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-zinc-800/80 flex items-center justify-center mx-auto text-3xl">
            📊
          </div>
          <h3 className="text-lg font-bold text-zinc-100">No hay partidas todavía.</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Todas tus manos jugadas contra bots y en multijugador quedarán registradas aquí con gráficos de rendimiento y desgloses de fichas.
          </p>
          <button
            onClick={onPlayGame}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-semibold text-xs text-white shadow-lg shadow-emerald-950/50 transition-colors"
          >
            Jugar primera mano
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-md">
              <span className="text-xs text-zinc-400 block mb-1">Total Manos</span>
              <div className="text-2xl font-black font-mono text-zinc-100">
                {stats.handsPlayed}
              </div>
              <span className="text-[11px] text-zinc-500 mt-1 block">
                {stats.handsWon} ganadas • {stats.handsLost} perdidas
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-md">
              <span className="text-xs text-zinc-400 block mb-1">Win Rate (Efectividad)</span>
              <div className="text-2xl font-black font-mono text-emerald-400">
                {winRate}%
              </div>
              <span className="text-[11px] text-zinc-500 mt-1 block">
                {stats.showdownsWon} / {stats.showdownsPlayed || 1} en Showdown
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-md">
              <span className="text-xs text-zinc-400 block mb-1">Balance Fichas Virtuales</span>
              <div className="text-xl font-bold font-mono">
                <ChipStack amount={stats.currentBalance} size="md" />
              </div>
              <span
                className={`text-[11px] mt-1 block font-mono ${
                  netChips >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                Neto: {netChips >= 0 ? `+${netChips}` : netChips} fichas
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-md">
              <span className="text-xs text-zinc-400 block mb-1">Tutorial y Escenarios</span>
              <div className="text-2xl font-black font-mono text-teal-300">
                {stats.tutorialCompletedLessons.length}/17
              </div>
              <span className="text-[11px] text-zinc-500 mt-1 block">
                {stats.trainingScenariosSolved}/{stats.trainingScenariosTotal} ejercicios resueltos
              </span>
            </div>
          </div>

          {/* Hand History Breakdown */}
          <div className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-md space-y-4">
            <h3 className="font-bold text-base text-zinc-100">Registro Detallado de Manos</h3>
            <div className="space-y-2">
              {history.map((rec) => (
                <div
                  key={rec.id}
                  className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      {rec.heroCards.map((c, i) => (
                        <CardView key={i} card={c} size="xs" />
                      ))}
                    </div>
                    <div>
                      <span className="font-bold text-zinc-200">{rec.handSummary}</span>
                      <p className="text-[11px] text-zinc-400">
                        Ganador: {rec.winnerNames.join(', ')} • Bote: {rec.finalPot}
                      </p>
                    </div>
                  </div>

                  <div
                    className={`font-mono font-bold ${
                      rec.heroProfit > 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {rec.heroProfit > 0 ? `+${rec.heroProfit}` : rec.heroProfit}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
