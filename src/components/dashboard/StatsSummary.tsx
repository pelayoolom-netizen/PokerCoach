import React from 'react';
import { Trophy, TrendingUp, Percent, Flame } from 'lucide-react';
import { UserStats } from '../../types/user';
import { ChipStack } from '../common/ChipStack';

interface StatsSummaryProps {
  stats: UserStats;
  onNavigateToStats: () => void;
}

export const StatsSummary: React.FC<StatsSummaryProps> = ({
  stats,
  onNavigateToStats,
}) => {
  const hasPlayed = stats.handsPlayed > 0;
  const winRate = hasPlayed ? Math.round((stats.handsWon / stats.handsPlayed) * 100) : 0;
  const netProfit = stats.chipsWon - stats.chipsLost;

  return (
    <div className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          <h3 className="font-bold text-base text-zinc-100">Estadísticas Básicas</h3>
        </div>
        <button
          onClick={onNavigateToStats}
          className="text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
        >
          Ver detalle completo →
        </button>
      </div>

      {!hasPlayed ? (
        <div className="text-center py-6 px-4 rounded-xl bg-zinc-950/40 border border-zinc-800/80">
          <div className="w-10 h-10 rounded-full bg-zinc-800/80 flex items-center justify-center mx-auto mb-2 text-zinc-400">
            🃏
          </div>
          <p className="text-sm font-semibold text-zinc-300">No hay partidas todavía.</p>
          <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">
            Juega tu primera partida contra bots para registrar manos ganadas, botes y tasa de victoria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/70">
            <span className="text-[11px] text-zinc-400 block mb-1">Manos Jugadas</span>
            <span className="text-xl font-bold font-mono text-zinc-100">
              {stats.handsPlayed}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/70">
            <span className="text-[11px] text-zinc-400 block mb-1">Victorias</span>
            <span className="text-xl font-bold font-mono text-emerald-400">
              {stats.handsWon}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/70">
            <span className="text-[11px] text-zinc-400 block mb-1">Tasa de Victoria</span>
            <div className="flex items-center gap-1">
              <span className="text-xl font-bold font-mono text-teal-300">{winRate}%</span>
              <Percent className="w-3.5 h-3.5 text-zinc-500" />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/70">
            <span className="text-[11px] text-zinc-400 block mb-1">Bote Mayor Ganado</span>
            <ChipStack amount={stats.biggestPotWon} size="sm" />
          </div>
        </div>
      )}
    </div>
  );
};
