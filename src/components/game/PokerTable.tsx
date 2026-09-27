import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Volume2, ShieldCheck, ChevronRight, AlertCircle, Sparkles } from 'lucide-react';
import { GameSettings, Player, PlayerActionType } from '../../types/poker';
import { UserProfile } from '../../types/user';
import { TexasHoldemEngine } from '../../game-engine/game';
import { computeBotAction } from '../../bot-engine/bot';
import { CardView } from '../common/CardView';
import { ChipStack } from '../common/ChipStack';
import { sound } from '../../lib/sound';

interface PokerTableProps {
  profile: UserProfile;
  settings: GameSettings;
  onHandCompleted: (profit: number, won: boolean, pot: number, summary: string) => void;
  onExitGame: () => void;
}

export const PokerTable: React.FC<PokerTableProps> = ({
  profile,
  settings,
  onHandCompleted,
  onExitGame,
}) => {
  const [engine, setEngine] = useState<TexasHoldemEngine>(() => {
    const playerConfigs = [
      { id: 'hero', name: profile.name || 'Hero (Tú)', isBot: false, avatar: profile.avatar || '🤠' },
      { id: 'bot1', name: 'Bot Alex', isBot: true, avatar: '🤖' },
    ];
    if (settings.playerCount >= 3) {
      playerConfigs.push({ id: 'bot2', name: 'Bot Clara', isBot: true, avatar: '🦊' });
    }
    if (settings.playerCount >= 4) {
      playerConfigs.push({ id: 'bot3', name: 'Bot David', isBot: true, avatar: '🦁' });
    }
    if (settings.playerCount >= 6) {
      playerConfigs.push({ id: 'bot4', name: 'Bot Elena', isBot: true, avatar: '🦉' });
      playerConfigs.push({ id: 'bot5', name: 'Bot Felix', isBot: true, avatar: '🦈' });
    }

    const eng = new TexasHoldemEngine(settings, playerConfigs);
    eng.startNewHand();
    return eng;
  });

  const [tableState, setTableState] = useState(engine.state);
  const [sliderAmount, setSliderAmount] = useState<number>(settings.bigBlind);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isBotThinking, setIsBotThinking] = useState(false);
  const botTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync state
  const refreshState = () => {
    setTableState({ ...engine.state });
  };

  // Bot Turn Automation
  useEffect(() => {
    if (!tableState.isHandActive) {
      // Check if showdown concluded and record stats
      if (tableState.winners && tableState.winners.length > 0) {
        const heroWinner = tableState.winners.find((w) => w.id === 'hero');
        const heroPlayer = tableState.players.find((p) => p.id === 'hero');
        const profit = heroWinner ? heroWinner.amountWon - (heroPlayer?.currentBet || 0) : -(heroPlayer?.currentBet || 0);
        sound.playWin();
        onHandCompleted(profit, !!heroWinner, tableState.totalPot, tableState.showdownExplanation || 'Mano terminada');
      }
      return;
    }

    const currentPlayer = tableState.players[tableState.currentTurnIndex];
    if (!currentPlayer) return;

    if (currentPlayer.isBot && !currentPlayer.folded && !currentPlayer.isAllIn) {
      setIsBotThinking(true);
      if (botTimerRef.current) clearTimeout(botTimerRef.current);

      botTimerRef.current = setTimeout(() => {
        try {
          const legal = engine.getLegalActions(currentPlayer.id);
          const decision = computeBotAction({
            difficulty: currentPlayer.botDifficulty || 'beginner',
            cards: currentPlayer.cards,
            communityCards: engine.state.communityCards,
            chips: currentPlayer.chips,
            currentBet: currentPlayer.currentBet,
            currentHighestBet: engine.state.currentHighestBet,
            minRaise: legal.minRaise,
            totalPot: engine.state.totalPot,
            legalActions: legal,
          });

          // Play sound
          if (decision.action === 'fold') sound.playFold();
          else if (decision.action === 'check') sound.playCard();
          else sound.playChip();

          engine.executeAction(currentPlayer.id, decision.action, decision.amount);
          refreshState();
        } catch (e: any) {
          console.error('Error bot action:', e);
          // Fallback to check or fold
          try {
            const legal = engine.getLegalActions(currentPlayer.id);
            if (legal.canCheck) engine.executeAction(currentPlayer.id, 'check');
            else engine.executeAction(currentPlayer.id, 'fold');
            refreshState();
          } catch {}
        } finally {
          setIsBotThinking(false);
        }
      }, 750);
    }

    return () => {
      if (botTimerRef.current) clearTimeout(botTimerRef.current);
    };
  }, [tableState.currentTurnIndex, tableState.isHandActive, tableState.round]);

  const hero = tableState.players.find((p) => p.id === 'hero')!;
  const isHeroTurn = tableState.isHandActive && tableState.players[tableState.currentTurnIndex]?.id === 'hero';
  const heroLegal = engine.getLegalActions('hero');

  // Handle Player Actions
  const handlePlayerAction = (action: PlayerActionType, amount?: number) => {
    setErrorMessage(null);
    try {
      if (action === 'fold') sound.playFold();
      else if (action === 'check') sound.playCard();
      else sound.playChip();

      engine.executeAction('hero', action, amount);
      refreshState();
    } catch (e: any) {
      setErrorMessage(e.message || 'Acción no permitida en esta situación.');
      setTimeout(() => setErrorMessage(null), 4000);
    }
  };

  const handleStartNextHand = () => {
    sound.playCard();
    engine.startNewHand();
    refreshState();
    setErrorMessage(null);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Top Bar with Table Stats and Controls */}
      <div className="flex items-center justify-between bg-zinc-900/90 border border-zinc-800 px-4 py-2.5 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-zinc-200">Mano #{tableState.handNumber}</span>
          </div>
          <span className="text-zinc-600">•</span>
          <span className="text-xs text-zinc-400 capitalize">
            Ronda: <strong className="text-emerald-400">{tableState.round}</strong>
          </span>
          <span className="text-zinc-600">•</span>
          <span className="text-xs text-zinc-400">
            Ciegas: {settings.smallBlind}/{settings.bigBlind}
          </span>
        </div>

        <button
          onClick={onExitGame}
          className="text-xs text-zinc-400 hover:text-rose-400 font-semibold transition-colors px-2 py-1 rounded-lg hover:bg-zinc-800"
        >
          Salir de la mesa
        </button>
      </div>

      {/* Error / Alert banner */}
      {errorMessage && (
        <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800/80 text-rose-200 text-xs flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Oval Poker Felt Table */}
      <div className="relative w-full rounded-[48px] sm:rounded-[80px] border-[10px] sm:border-[16px] border-amber-950/70 bg-gradient-to-b from-emerald-950 via-[#0d2818] to-[#081a10] shadow-[inset_0_0_80px_rgba(0,0,0,0.8),0_20px_50px_rgba(0,0,0,0.9)] p-4 sm:p-8 min-h-[460px] sm:min-h-[520px] flex flex-col justify-between overflow-hidden">
        {/* Subtle table felt texture and inner ring */}
        <div className="absolute inset-4 rounded-[36px] sm:rounded-[64px] border border-emerald-500/15 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />

        {/* TOP ROW: Opponent Seats (Bots) */}
        <div className="relative z-10 flex flex-wrap items-center justify-around gap-2 pt-2">
          {tableState.players
            .filter((p) => p.id !== 'hero')
            .map((player) => {
              const isTurn = tableState.isHandActive && tableState.players[tableState.currentTurnIndex]?.id === player.id;
              const isWinner = tableState.winners?.some((w) => w.id === player.id);

              return (
                <div
                  key={player.id}
                  className={`flex flex-col items-center p-2.5 rounded-2xl transition-all duration-200 ${
                    isTurn
                      ? 'bg-emerald-950/90 ring-2 ring-emerald-400 shadow-lg shadow-emerald-500/20 scale-105'
                      : 'bg-zinc-950/70 border border-zinc-800/80'
                  } ${player.folded ? 'opacity-40 grayscale-[40%]' : ''}`}
                >
                  <div className="relative mb-1">
                    <span className="text-2xl">{player.avatar}</span>
                    {player.positionName && (
                      <span className="absolute -bottom-1 -right-2 px-1 rounded text-[9px] font-black bg-amber-500 text-zinc-950 shadow">
                        {player.positionName}
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-bold text-zinc-200 truncate max-w-[80px]">
                    {player.name}
                  </span>
                  <ChipStack amount={player.chips} size="sm" />

                  {/* Hole Cards (face down during game, face up at showdown) */}
                  <div className="flex gap-1 mt-1.5">
                    {player.cards.map((c, i) => (
                      <CardView
                        key={i}
                        card={tableState.round === 'showdown' || tableState.round === 'ended' ? c : undefined}
                        hidden={tableState.round !== 'showdown' && tableState.round !== 'ended'}
                        size="xs"
                      />
                    ))}
                  </div>

                  {/* Player current action badge */}
                  {player.lastAction && (
                    <span
                      className={`text-[9px] font-bold uppercase mt-1 px-1.5 py-0.5 rounded ${
                        player.lastAction.type === 'fold'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}
                    >
                      {player.lastAction.type} {player.lastAction.amount ? player.lastAction.amount : ''}
                    </span>
                  )}
                </div>
              );
            })}
        </div>

        {/* CENTER TABLE: Pot & Community Cards */}
        <div className="relative z-10 flex flex-col items-center justify-center my-4 space-y-3">
          {/* Main Pot */}
          <div className="px-4 py-1.5 rounded-full bg-zinc-950/90 border border-emerald-500/40 shadow-xl flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
              BOTE TOTAL:
            </span>
            <ChipStack amount={tableState.totalPot} size="md" />
          </div>

          {/* 5 Community Cards (Board) */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 p-2 rounded-2xl bg-zinc-950/40 border border-emerald-900/30">
            {tableState.communityCards.map((card, idx) => (
              <CardView key={idx} card={card} size="md" />
            ))}
            {Array.from({ length: 5 - tableState.communityCards.length }).map((_, idx) => (
              <div
                key={idx}
                className="w-14 h-20 rounded-md border-2 border-dashed border-emerald-700/30 bg-emerald-950/20 flex items-center justify-center text-emerald-700/40 text-xs font-mono"
              >
                {idx === 0 && tableState.communityCards.length === 0
                  ? 'Flop'
                  : idx === 3
                  ? 'Turn'
                  : idx === 4
                  ? 'River'
                  : '♠'}
              </div>
            ))}
          </div>

          {/* Showdown Result Banner */}
          {tableState.showdownExplanation && (
            <div className="p-3 rounded-xl bg-zinc-950/95 border border-amber-500/70 shadow-2xl max-w-lg text-center animate-in zoom-in-95">
              <div className="flex items-center justify-center gap-1.5 text-amber-400 font-bold text-xs mb-1">
                <Sparkles className="w-4 h-4" />
                <span>RESOLUCIÓN DE LA MANO</span>
              </div>
              <p className="text-xs text-zinc-200 leading-snug">{tableState.showdownExplanation}</p>
              <button
                onClick={handleStartNextHand}
                className="mt-3 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors"
              >
                Siguiente Mano →
              </button>
            </div>
          )}
        </div>

        {/* BOTTOM ROW: Hero (User Player) */}
        <div className="relative z-10 flex flex-col items-center">
          <div
            className={`flex items-center gap-4 p-3 rounded-2xl transition-all duration-200 ${
              isHeroTurn
                ? 'bg-emerald-950/90 ring-4 ring-emerald-400 shadow-2xl shadow-emerald-500/40 scale-105'
                : 'bg-zinc-950/80 border border-zinc-800'
            }`}
          >
            <div className="relative">
              <span className="text-3xl">{hero.avatar}</span>
              {hero.positionName && (
                <span className="absolute -bottom-1 -right-1 px-1 rounded text-[9px] font-black bg-amber-500 text-zinc-950 shadow">
                  {hero.positionName}
                </span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black text-zinc-100">{hero.name}</span>
                {isHeroTurn && (
                  <span className="text-[10px] font-bold uppercase bg-emerald-500 text-zinc-950 px-1.5 py-0.2 rounded-full animate-bounce">
                    ¡Tu Turno!
                  </span>
                )}
              </div>
              <ChipStack amount={hero.chips} size="md" />
            </div>

            {/* Hero Hole Cards (Always visible to Hero) */}
            <div className="flex gap-2 ml-2">
              {hero.cards.map((c, i) => (
                <CardView key={i} card={c} size="md" highlighted={isHeroTurn} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ACTION CONTROLS PANEL */}
      <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl space-y-4">
        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* FOLD BUTTON */}
            <button
              disabled={!isHeroTurn || !heroLegal.canFold}
              onClick={() => handlePlayerAction('fold')}
              className="px-5 py-3 rounded-xl bg-zinc-800 hover:bg-rose-950 border border-zinc-700 hover:border-rose-600 font-bold text-xs sm:text-sm text-zinc-200 hover:text-rose-200 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-md active:scale-95"
            >
              FOLD
            </button>

            {/* CHECK BUTTON (Only if canCheck) */}
            {heroLegal.canCheck && (
              <button
                disabled={!isHeroTurn}
                onClick={() => handlePlayerAction('check')}
                className="px-6 py-3 rounded-xl bg-emerald-950 hover:bg-emerald-900 border border-emerald-600 font-bold text-xs sm:text-sm text-emerald-200 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-md active:scale-95"
              >
                CHECK (PASAR)
              </button>
            )}

            {/* CALL BUTTON (Only if facing a bet) */}
            {heroLegal.canCall && (
              <button
                disabled={!isHeroTurn}
                onClick={() => handlePlayerAction('call')}
                className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs sm:text-sm text-white disabled:opacity-30 disabled:pointer-events-none transition-all shadow-md active:scale-95 flex items-center gap-1.5"
              >
                <span>CALL</span>
                <span className="font-mono bg-emerald-700/80 px-1.5 py-0.5 rounded text-xs">
                  {heroLegal.callAmount}
                </span>
              </button>
            )}

            {/* BET BUTTON */}
            {heroLegal.canBet && (
              <button
                disabled={!isHeroTurn}
                onClick={() => handlePlayerAction('bet', sliderAmount)}
                className="px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 font-bold text-xs sm:text-sm text-white disabled:opacity-30 disabled:pointer-events-none transition-all shadow-md active:scale-95 flex items-center gap-1.5"
              >
                <span>BET</span>
                <span className="font-mono bg-teal-700/80 px-1.5 py-0.5 rounded text-xs">
                  {sliderAmount}
                </span>
              </button>
            )}

            {/* RAISE BUTTON */}
            {heroLegal.canRaise && (
              <button
                disabled={!isHeroTurn}
                onClick={() => handlePlayerAction('raise', sliderAmount)}
                className="px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 font-bold text-xs sm:text-sm text-white disabled:opacity-30 disabled:pointer-events-none transition-all shadow-md active:scale-95 flex items-center gap-1.5"
              >
                <span>RAISE A</span>
                <span className="font-mono bg-teal-700/80 px-1.5 py-0.5 rounded text-xs">
                  {sliderAmount}
                </span>
              </button>
            )}

            {/* ALL-IN BUTTON */}
            {heroLegal.canAllIn && (
              <button
                disabled={!isHeroTurn}
                onClick={() => handlePlayerAction('all-in')}
                className="px-5 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 font-black text-xs sm:text-sm text-white disabled:opacity-30 disabled:pointer-events-none transition-all shadow-md active:scale-95"
              >
                ALL-IN ({heroLegal.allInAmount})
              </button>
            )}
          </div>

          {!tableState.isHandActive && (
            <button
              onClick={handleStartNextHand}
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-extrabold text-sm text-white shadow-lg shadow-emerald-950/60 transition-all hover:scale-105 active:scale-95"
            >
              Repartir Siguiente Mano
            </button>
          )}
        </div>

        {/* Raise / Bet Slider with Presets */}
        {(heroLegal.canBet || heroLegal.canRaise) && isHeroTurn && (
          <div className="pt-2 border-t border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>Monto de apuesta: <strong className="text-zinc-100 font-mono">{sliderAmount} fichas</strong></span>
              <span className="text-[11px] text-zinc-500">Mín: {heroLegal.canRaise ? heroLegal.minRaise : heroLegal.minBet} • Máx: {heroLegal.maxRaise}</span>
            </div>

            <input
              type="range"
              min={heroLegal.canRaise ? heroLegal.minRaise : heroLegal.minBet}
              max={heroLegal.maxRaise}
              step={settings.bigBlind}
              value={sliderAmount}
              onChange={(e) => setSliderAmount(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />

            {/* Preset Buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSliderAmount(heroLegal.canRaise ? heroLegal.minRaise : heroLegal.minBet)}
                className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-[11px] font-semibold text-zinc-300"
              >
                Mínimo
              </button>
              <button
                type="button"
                onClick={() => {
                  const halfPot = Math.max(heroLegal.minBet, Math.round(tableState.totalPot / 2));
                  setSliderAmount(Math.min(heroLegal.maxRaise, halfPot));
                }}
                className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-[11px] font-semibold text-zinc-300"
              >
                1/2 Bote
              </button>
              <button
                type="button"
                onClick={() => {
                  const fullPot = Math.max(heroLegal.minBet, tableState.totalPot);
                  setSliderAmount(Math.min(heroLegal.maxRaise, fullPot));
                }}
                className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-[11px] font-semibold text-zinc-300"
              >
                Bote Entero
              </button>
              <button
                type="button"
                onClick={() => setSliderAmount(heroLegal.maxRaise)}
                className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-[11px] font-semibold text-zinc-300"
              >
                All-in
              </button>
            </div>
          </div>
        )}

        {/* Table Activity Ticker */}
        <div className="pt-2 border-t border-zinc-800 text-[11px] text-zinc-400 flex items-center justify-between">
          <div className="truncate pr-4">
            <span className="text-zinc-500 font-semibold mr-1.5">Última acción:</span>
            <span>{tableState.historyLog[tableState.historyLog.length - 1] || 'Esperando inicio...'}</span>
          </div>
          {isBotThinking && (
            <span className="text-emerald-400 font-semibold flex items-center gap-1 flex-shrink-0 animate-pulse">
              <span>Bot pensando...</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
