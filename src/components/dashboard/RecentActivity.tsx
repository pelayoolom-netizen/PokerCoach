import React from 'react';
import { History, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { HandHistoryRecord } from '../../types/poker';
import { CardView } from '../common/CardView';
import { ChipStack } from '../common/ChipStack';

interface RecentActivityProps {
  history: HandHistoryRecord[];
  onPlayGame: () => void;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({
  history,
  onPlayGame,
}) => {
  const recent = history.slice(0, 5);

  return (
    <div className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-teal-400" />
          <h3 className="font-bold text-base text-zinc-100">Últimas Partidas</h3>
        </div>
        {recent.length > 0 && (
          <span className="text-xs text-zinc-500">Últimas {recent.length} manos registradas</span>
        )}
      </div>

      {recent.length === 0 ? (
        <div className="text-center py-8 px-4 rounded-xl bg-zinc-950/40 border border-zinc-800/80">
          <div className="w-10 h-10 rounded-full bg-zinc-800/80 flex items-center justify-center mx-auto mb-2 text-zinc-400">
            📊
          </div>
          <p className="text-sm font-semibold text-zinc-300">No hay partidas registradas.</p>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto mb-4">
            Cada vez que juegues una mano contra bots o en multijugador, quedará registrada aquí con su resumen detallado.
          </p>
          <button
            onClick={onPlayGame}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md transition-colors"
          >
            Iniciar primera partida
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {recent.map((rec) => {
            const isProfit = rec.heroProfit > 0;
            const isLoss = rec.heroProfit < 0;

            return (
              <div
                key={rec.id}
                className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {rec.heroCards.map((card, idx) => (
                      <CardView key={idx} card={card} size="xs" />
                    ))}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-zinc-200">
                        {rec.handSummary || 'Mano Texas Hold\'em'}
                      </span>
                      <span className="text-[10px] text-zinc-500">
                        {new Date(rec.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-0.5">
                      Ganador: <span className="text-zinc-300 font-medium">{rec.winnerNames.join(', ')}</span> • Bote: {rec.finalPot} fichas
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3">
                  <div
                    className={`flex items-center gap-1 text-xs font-bold font-mono px-2 py-1 rounded-lg ${
                      isProfit
                        ? 'text-emerald-400 bg-emerald-950/60 border border-emerald-800/60'
                        : isLoss
                        ? 'text-rose-400 bg-rose-950/60 border border-rose-800/60'
                        : 'text-zinc-400 bg-zinc-800/60'
                    }`}
                  >
                    {isProfit ? (
                      <>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        <span>+{rec.heroProfit}</span>
                      </>
                    ) : isLoss ? (
                      <>
                        <ArrowDownRight className="w-3.5 h-3.5" />
                        <span>{rec.heroProfit}</span>
                      </>
                    ) : (
                      <>
                        <Minus className="w-3.5 h-3.5" />
                        <span>0</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
