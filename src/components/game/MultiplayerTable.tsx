import React, { useState, useEffect, useRef } from 'react';
import {
  Users,
  Copy,
  Check,
  RotateCcw,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  Trophy,
  History,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { Card, Player, PlayerActionType } from '../../types/poker';
import { UserProfile } from '../../types/user';
import { CardView } from '../common/CardView';
import { ChipStack } from '../common/ChipStack';
import { sound } from '../../lib/sound';

interface MultiplayerTableProps {
  profile: UserProfile;
  roomCode: string;
  initialRoomState?: any;
  onExitGame: () => void;
  onHandCompleted?: (profit: number, won: boolean, pot: number, summary: string) => void;
}

export const MultiplayerTable: React.FC<MultiplayerTableProps> = ({
  profile,
  roomCode,
  initialRoomState,
  onExitGame,
  onHandCompleted,
}) => {
  const [roomData, setRoomData] = useState<any>(initialRoomState || null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [sliderAmount, setSliderAmount] = useState<number>(20);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [soundOn, setSoundOn] = useState(true);

  const prevRoundRef = useRef<string>('');
  const prevTurnRef = useRef<number>(-1);
  const prevPotRef = useRef<number>(0);

  // Connect to Real-time Server-Sent Events stream
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let pollInterval: NodeJS.Timeout | null = null;

    const connectSSE = () => {
      const url = `/api/multiplayer/stream/${roomCode}?playerId=${encodeURIComponent(profile.id)}`;
      eventSource = new EventSource(url);

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleStateUpdate(data);
        } catch (err) {
          console.error('SSE parse error:', err);
        }
      };

      eventSource.onerror = () => {
        // SSE connection dropped; rely on fallback polling and reconnect
        eventSource?.close();
        setTimeout(connectSSE, 4000);
      };
    };

    const fetchState = async () => {
      try {
        const res = await fetch(
          `/api/multiplayer/state/${roomCode}?playerId=${encodeURIComponent(profile.id)}`
        );
        if (res.ok) {
          const data = await res.json();
          handleStateUpdate(data);
        }
      } catch (err) {
        console.error('Fallback poll error:', err);
      }
    };

    connectSSE();
    fetchState();

    // Fallback heartbeat polling every 2.5s for resilient sync across all networks
    pollInterval = setInterval(fetchState, 2500);

    return () => {
      eventSource?.close();
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [roomCode, profile.id]);

  const handleStateUpdate = (data: any) => {
    setRoomData((prevData: any) => {
      const tableState = data.state;
      if (tableState) {
        // Sound effects based on state diffs
        if (tableState.round !== prevRoundRef.current) {
          if (tableState.round === 'flop' || tableState.round === 'turn' || tableState.round === 'river') {
            sound.playCard();
          } else if (tableState.round === 'showdown' || tableState.round === 'ended') {
            sound.playWin();
          }
          prevRoundRef.current = tableState.round;
        }

        if (tableState.totalPot > prevPotRef.current) {
          sound.playChip();
          prevPotRef.current = tableState.totalPot;
        }

        prevTurnRef.current = tableState.currentTurnIndex;
      }
      return data;
    });
  };

  const tableState = roomData?.state;
  const legal = roomData?.legalActions || {
    canFold: false,
    canCheck: false,
    canCall: false,
    callAmount: 0,
    canBet: false,
    minBet: 20,
    canRaise: false,
    minRaise: 40,
    maxRaise: 1000,
    canAllIn: false,
    allInAmount: 0,
  };

  const isHost = roomData?.hostId === profile.id;
  const activePlayers: Player[] = tableState?.players || [];
  const currentPlayer = activePlayers[tableState?.currentTurnIndex];
  const isMyTurn = tableState?.isHandActive && currentPlayer?.id === profile.id;
  const myPlayer = activePlayers.find((p) => p.id === profile.id);

  // Update slider default amount when it becomes user's turn
  useEffect(() => {
    if (isMyTurn) {
      if (legal.canBet) {
        setSliderAmount(legal.minBet);
      } else if (legal.canRaise) {
        setSliderAmount(legal.minRaise);
      }
    }
  }, [isMyTurn, legal.minBet, legal.minRaise, legal.canBet, legal.canRaise]);

  const executeAction = async (action: PlayerActionType, amount?: number) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setErrorMessage(null);

    // Audio cue
    if (action === 'fold') sound.playFold();
    else if (action === 'check') sound.playCard();
    else sound.playChip();

    try {
      const res = await fetch('/api/multiplayer/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: roomCode,
          playerId: profile.id,
          action,
          amount,
        }),
      });

      const resData = await res.json();
      if (!res.ok) {
        setErrorMessage(resData.error || 'Acción no permitida.');
      } else if (resData.state) {
        setRoomData(resData.state);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error de conexión.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextHand = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/multiplayer/next-hand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: roomCode,
          playerId: profile.id,
        }),
      });
      const data = await res.json();
      if (data.state) {
        setRoomData(data.state);
      }
    } catch (err: any) {
      console.error('Error starting next hand:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRebuy = async () => {
    try {
      const res = await fetch('/api/multiplayer/rebuy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: roomCode,
          playerId: profile.id,
        }),
      });
      const data = await res.json();
      if (data.state) setRoomData(data.state);
    } catch (err) {
      console.error('Rebuy error:', err);
    }
  };

  const handleLeaveRoom = async () => {
    try {
      await fetch('/api/multiplayer/leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: roomCode, playerId: profile.id }),
      });
    } catch {}
    onExitGame();
  };

  const copyInviteLink = () => {
    const inviteUrl = `${window.location.origin}/?room=${roomCode}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Safe checks if room hasn't loaded yet
  if (!tableState) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] p-6 text-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin mx-auto" />
        <h2 className="text-lg font-bold text-zinc-200">Sincronizando con la mesa multijugador...</h2>
        <p className="text-xs text-zinc-400">Sala: <span className="font-mono text-emerald-400">{roomCode}</span></p>
      </div>
    );
  }

  const roundNameSpanish: Record<string, string> = {
    preflop: 'Preflop',
    flop: 'Flop',
    turn: 'Turn',
    river: 'River',
    showdown: 'Showdown',
    ended: 'Mano Concluida',
  };

  return (
    <div className="flex flex-col space-y-4 max-w-6xl mx-auto animate-in fade-in duration-300">
      {/* Top Bar / Room Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-md">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-teal-950/80 border border-teal-700/60 text-teal-300 font-mono font-bold text-xs sm:text-sm">
            <span>Sala: {roomCode}</span>
            <button
              onClick={copyInviteLink}
              title="Copiar enlace de invitación para amigos"
              className="p-1 hover:text-white transition-colors"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          {copiedLink && (
            <span className="text-[11px] font-semibold text-emerald-400 animate-in fade-in">
              ¡Enlace copiado!
            </span>
          )}

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-400">
            <Users className="w-3.5 h-3.5 text-zinc-400" />
            <span>{activePlayers.length} Jugadores</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1 rounded-lg bg-zinc-800/80 border border-zinc-700 text-xs font-semibold text-zinc-300">
            Ronda:{' '}
            <span className="text-emerald-400 font-bold">
              {roundNameSpanish[tableState.round] || tableState.round}
            </span>
            <span className="text-zinc-500 ml-1.5">| Mano #{tableState.handNumber}</span>
          </div>

          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-all ${
              showHistory
                ? 'bg-zinc-800 border-zinc-600 text-zinc-100'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
            title="Historial de la mano"
          >
            <History className="w-4 h-4" />
          </button>

          <button
            onClick={handleLeaveRoom}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-950/70 hover:bg-rose-900/80 border border-rose-800 text-rose-300 text-xs font-bold transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </div>

      {/* Main Poker Table Area */}
      <div className="relative rounded-3xl border-8 border-amber-950/80 bg-gradient-to-b from-emerald-950 via-emerald-900 to-zinc-950 p-4 sm:p-8 min-h-[480px] shadow-2xl flex flex-col justify-between overflow-hidden">
        {/* Subtle table felt markings */}
        <div className="absolute inset-4 rounded-[36px] border border-emerald-500/20 pointer-events-none" />

        {/* Top/Opponent Players Grid */}
        <div className="flex flex-wrap justify-around gap-2 z-10">
          {activePlayers
            .filter((p) => p.id !== profile.id)
            .map((player) => {
              const isTurn = tableState.isHandActive && currentPlayer?.id === player.id;
              const isDealer = activePlayers[tableState.dealerIndex]?.id === player.id;

              return (
                <div
                  key={player.id}
                  className={`flex flex-col items-center p-2.5 rounded-2xl transition-all ${
                    isTurn
                      ? 'bg-amber-500/20 border-2 border-amber-400 shadow-lg shadow-amber-500/20 scale-105 ring-2 ring-amber-400/50'
                      : 'bg-zinc-950/70 border border-zinc-800/80'
                  }`}
                  style={{ minWidth: '120px' }}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-xl">{player.avatar || '🤠'}</span>
                    <span className="text-xs font-bold text-zinc-100 truncate max-w-[80px]">
                      {player.name}
                    </span>
                    {isDealer && (
                      <span className="px-1.5 py-0.5 rounded-full bg-amber-400 text-zinc-950 font-black text-[9px] shadow">
                        D
                      </span>
                    )}
                  </div>

                  <div className="text-[11px] font-mono text-emerald-400 font-bold mb-1">
                    {player.chips} fichas
                  </div>

                  {/* Hole Cards */}
                  <div className="flex gap-1 justify-center">
                    {player.cards && player.cards.length > 0 ? (
                      player.cards.map((c, i) => (
                        <CardView
                          key={i}
                          card={(c.rank as string) === '?' ? undefined : c}
                          hidden={(c.rank as string) === '?'}
                          size="xs"
                        />
                      ))
                    ) : (
                      <div className="h-9 flex items-center text-[10px] text-zinc-500">
                        {player.folded ? 'Retirado' : 'Esperando'}
                      </div>
                    )}
                  </div>

                  {/* Player Status / Bet */}
                  {player.currentBet > 0 && (
                    <div className="mt-1 px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-600/60 text-[10px] text-emerald-300 font-bold">
                      Apuesta: {player.currentBet}
                    </div>
                  )}

                  {player.lastAction && (
                    <span className="text-[9px] font-semibold text-zinc-400 uppercase mt-0.5">
                      {player.lastAction.type}
                    </span>
                  )}
                </div>
              );
            })}
        </div>

        {/* Center: Community Cards & Pot */}
        <div className="my-6 flex flex-col items-center justify-center text-center z-10 space-y-3">
          {/* Main Pot Display */}
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-2xl bg-zinc-950/80 border border-amber-500/40 shadow-xl backdrop-blur-sm">
            <span className="text-amber-400 text-xs font-black uppercase tracking-wider">
              Bote Total:
            </span>
            <span className="text-xl sm:text-2xl font-extrabold text-amber-300 font-mono">
              {tableState.totalPot}
            </span>
            <span className="text-xs text-amber-400">fichas</span>
          </div>

          {/* 5 Community Cards */}
          <div className="flex gap-1.5 sm:gap-2 justify-center p-3 rounded-2xl bg-zinc-950/40 border border-emerald-600/30">
            {[0, 1, 2, 3, 4].map((index) => {
              const card = tableState.communityCards[index];
              return (
                <div key={index} className="transition-all transform hover:scale-105">
                  <CardView card={card} size="md" hidden={!card} />
                </div>
              );
            })}
          </div>

          {/* Showdown / Winner Announcement Banner */}
          {tableState.winners && tableState.winners.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-950 via-zinc-900 to-amber-950 border border-amber-500/80 shadow-2xl max-w-lg text-center animate-in zoom-in-95 duration-300">
              <div className="flex items-center justify-center gap-1.5 text-amber-300 font-extrabold text-sm mb-1">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>¡Ganador de la mano!</span>
              </div>
              <p className="text-xs text-zinc-200 font-semibold">
                {tableState.showdownExplanation}
              </p>
              <div className="mt-2 flex justify-center gap-3">
                {tableState.winners.map((w: any) => (
                  <div key={w.id} className="text-xs font-bold text-amber-400">
                    {w.name}: +{w.amountWon} fichas ({w.handDescription})
                  </div>
                ))}
              </div>

              {/* Next Hand Button */}
              <button
                onClick={handleNextHand}
                disabled={isSubmitting}
                className="mt-3 px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs shadow-lg transition-transform hover:scale-105 active:scale-95 flex items-center gap-1.5 mx-auto"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Repartir Siguiente Mano</span>
              </button>
            </div>
          )}
        </div>

        {/* Bottom: Hero (Current User) Info & Cards */}
        {myPlayer && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 z-10 p-3 sm:p-4 rounded-2xl bg-zinc-950/80 border border-emerald-500/30 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{myPlayer.avatar || '🤠'}</span>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-black text-zinc-100">{myPlayer.name} (Tú)</span>
                  {activePlayers[tableState.dealerIndex]?.id === myPlayer.id && (
                    <span className="px-1.5 py-0.5 rounded-full bg-amber-400 text-zinc-950 font-black text-[9px]">
                      BTN
                    </span>
                  )}
                </div>
                <div className="text-xs font-mono text-emerald-400 font-bold">
                  {myPlayer.chips} fichas
                  {myPlayer.currentBet > 0 && (
                    <span className="text-zinc-400 ml-2">
                      (Apuesta actual: {myPlayer.currentBet})
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Hero Cards */}
            <div className="flex gap-2">
              {myPlayer.cards && myPlayer.cards.length > 0 ? (
                myPlayer.cards.map((c, i) => <CardView key={i} card={c} size="md" />)
              ) : (
                <div className="text-xs text-zinc-500 italic py-2">
                  {myPlayer.folded ? 'Te has retirado de esta mano' : 'Esperando cartas...'}
                </div>
              )}
            </div>

            {/* Rebuy button if busted */}
            {myPlayer.chips <= 0 && (
              <button
                onClick={handleRebuy}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md transition-colors"
              >
                Recargar Fichas (+1,000)
              </button>
            )}
          </div>
        )}
      </div>

      {/* Action Controls Panel */}
      <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl space-y-3">
        {errorMessage && (
          <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs font-medium">
            {errorMessage}
          </div>
        )}

        {isMyTurn ? (
          <div className="space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-400 pb-1 border-b border-zinc-800">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>¡Es tu turno para actuar!</span>
              </span>
              <span className="text-zinc-400 text-[11px] font-normal font-mono">
                Para igualar: {legal.callAmount} fichas
              </span>
            </div>

            {/* Action Buttons Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {/* Fold */}
              <button
                onClick={() => executeAction('fold')}
                disabled={isSubmitting || !legal.canFold}
                className="py-3 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white font-black text-xs uppercase tracking-wider transition-all active:scale-95 shadow-lg shadow-rose-950/50"
              >
                Retirarse (Fold)
              </button>

              {/* Check or Call */}
              {legal.canCheck ? (
                <button
                  onClick={() => executeAction('check')}
                  disabled={isSubmitting}
                  className="py-3 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-black text-xs uppercase tracking-wider transition-all active:scale-95 shadow-lg shadow-blue-950/50"
                >
                  Pasar (Check)
                </button>
              ) : (
                <button
                  onClick={() => executeAction('call')}
                  disabled={isSubmitting || !legal.canCall}
                  className="py-3 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white font-black text-xs uppercase tracking-wider transition-all active:scale-95 shadow-lg shadow-amber-950/50 flex flex-col items-center justify-center leading-tight"
                >
                  <span>Igualar (Call)</span>
                  <span className="text-[10px] font-mono font-normal">
                    {legal.callAmount} fichas
                  </span>
                </button>
              )}

              {/* Bet / Raise Button */}
              {legal.canBet ? (
                <button
                  onClick={() => executeAction('bet', sliderAmount)}
                  disabled={isSubmitting}
                  className="py-3 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-black text-xs uppercase tracking-wider transition-all active:scale-95 shadow-lg shadow-emerald-950/50 flex flex-col items-center justify-center leading-tight"
                >
                  <span>Apostar (Bet)</span>
                  <span className="text-[10px] font-mono font-normal">{sliderAmount} fichas</span>
                </button>
              ) : legal.canRaise ? (
                <button
                  onClick={() => executeAction('raise', sliderAmount)}
                  disabled={isSubmitting}
                  className="py-3 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-black text-xs uppercase tracking-wider transition-all active:scale-95 shadow-lg shadow-emerald-950/50 flex flex-col items-center justify-center leading-tight"
                >
                  <span>Subir (Raise)</span>
                  <span className="text-[10px] font-mono font-normal">a {sliderAmount} fichas</span>
                </button>
              ) : (
                <div className="py-3 px-3 rounded-xl bg-zinc-800 text-zinc-500 font-bold text-xs text-center flex items-center justify-center">
                  No puedes subir
                </div>
              )}

              {/* All-in */}
              <button
                onClick={() => executeAction('all-in')}
                disabled={isSubmitting || !legal.canAllIn}
                className="py-3 px-3 rounded-xl bg-purple-700 hover:bg-purple-600 disabled:opacity-40 text-white font-black text-xs uppercase tracking-wider transition-all active:scale-95 shadow-lg shadow-purple-950/50 flex flex-col items-center justify-center leading-tight"
              >
                <span>All-In</span>
                <span className="text-[10px] font-mono font-normal">
                  {legal.allInAmount} fichas
                </span>
              </button>
            </div>

            {/* Bet/Raise Slider and Presets */}
            {(legal.canBet || legal.canRaise) && (
              <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400">Monto de la apuesta:</span>
                  <span className="font-mono text-emerald-400 font-bold text-sm">
                    {sliderAmount} fichas
                  </span>
                </div>
                <input
                  type="range"
                  min={legal.canBet ? legal.minBet : legal.minRaise}
                  max={legal.maxRaise || (myPlayer ? myPlayer.chips : 1000)}
                  step={10}
                  value={sliderAmount}
                  onChange={(e) => setSliderAmount(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSliderAmount(legal.canBet ? legal.minBet : legal.minRaise)}
                    className="flex-1 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-[10px] font-semibold text-zinc-300"
                  >
                    Mínimo
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const halfPot = Math.max(
                        legal.canBet ? legal.minBet : legal.minRaise,
                        Math.floor(tableState.totalPot / 2)
                      );
                      setSliderAmount(halfPot);
                    }}
                    className="flex-1 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-[10px] font-semibold text-zinc-300"
                  >
                    1/2 Bote
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const fullPot = Math.max(
                        legal.canBet ? legal.minBet : legal.minRaise,
                        tableState.totalPot
                      );
                      setSliderAmount(fullPot);
                    }}
                    className="flex-1 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-[10px] font-semibold text-zinc-300"
                  >
                    Bote Entero
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center p-3 text-center">
            {tableState.isHandActive ? (
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400 animate-pulse">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span>
                  Esperando el turno de{' '}
                  <strong className="text-zinc-200">
                    {currentPlayer ? currentPlayer.name : 'otro jugador'}
                  </strong>
                  ...
                </span>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <span className="text-xs text-zinc-400">
                  La mano ha concluido. Presiona para continuar jugando:
                </span>
                <button
                  onClick={handleNextHand}
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white shadow-md transition-all flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Siguiente Mano</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* History Log Drawer */}
      {showHistory && (
        <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-md space-y-2 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between pb-1.5 border-b border-zinc-800">
            <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-teal-400" />
              <span>Registro de la partida</span>
            </span>
            <span className="text-[10px] text-zinc-500">Últimos movimientos</span>
          </div>
          <div className="max-h-40 overflow-y-auto space-y-1 font-mono text-xs text-zinc-400 pr-1">
            {tableState.historyLog && tableState.historyLog.length > 0 ? (
              tableState.historyLog.map((log: string, idx: number) => (
                <div key={idx} className="leading-relaxed">
                  {log}
                </div>
              ))
            ) : (
              <div className="text-zinc-600 text-[11px]">No hay acciones registradas aún.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
