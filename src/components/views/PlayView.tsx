import React, { useState, useEffect } from 'react';
import {
  Bot,
  Users,
  Play,
  Settings2,
  ShieldCheck,
  Swords,
  ArrowRight,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  AlertCircle,
  LogOut,
} from 'lucide-react';
import { BotDifficulty, GameSettings } from '../../types/poker';
import { UserProfile } from '../../types/user';
import { PokerTable } from '../game/PokerTable';
import { MultiplayerTable } from '../game/MultiplayerTable';

interface PlayViewProps {
  profile: UserProfile;
  onHandCompleted: (profit: number, won: boolean, pot: number, summary: string) => void;
}

export const PlayView: React.FC<PlayViewProps> = ({ profile, onHandCompleted }) => {
  const [isPlayingBots, setIsPlayingBots] = useState(false);
  const [mode, setMode] = useState<'bots' | 'multiplayer'>('bots');
  const [startingChips, setStartingChips] = useState<number>(1000);
  const [smallBlind, setSmallBlind] = useState<number>(10);
  const [playerCount, setPlayerCount] = useState<number>(4);
  const [difficulty, setDifficulty] = useState<BotDifficulty>('intermediate');

  // Multiplayer state
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [activeRoomCode, setActiveRoomCode] = useState<string | null>(null);
  const [roomData, setRoomData] = useState<any>(null);
  const [roomError, setRoomError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const bigBlind = smallBlind * 2;

  const currentBotSettings: GameSettings = {
    startingChips,
    smallBlind,
    bigBlind,
    playerCount,
    difficulty,
  };

  // Check URL query param ?room=PK-XXXX on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    if (roomParam) {
      setMode('multiplayer');
      setRoomCodeInput(roomParam.trim().toUpperCase());
    }
  }, []);

  // Real-time synchronization for active multiplayer room (lobby & in-game)
  useEffect(() => {
    if (!activeRoomCode) {
      setRoomData(null);
      return;
    }

    let eventSource: EventSource | null = null;
    let pollTimer: NodeJS.Timeout | null = null;

    const connectSSE = () => {
      const url = `/api/multiplayer/stream/${activeRoomCode}?playerId=${encodeURIComponent(profile.id)}`;
      eventSource = new EventSource(url);

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setRoomData(data);
        } catch (err) {
          console.error('Lobby SSE parse error:', err);
        }
      };

      eventSource.onerror = () => {
        eventSource?.close();
        setTimeout(connectSSE, 4000);
      };
    };

    const fetchState = async () => {
      try {
        const res = await fetch(
          `/api/multiplayer/state/${activeRoomCode}?playerId=${encodeURIComponent(profile.id)}`
        );
        if (res.ok) {
          const data = await res.json();
          setRoomData(data);
        }
      } catch (err) {
        console.error('Lobby poll error:', err);
      }
    };

    connectSSE();
    fetchState();

    pollTimer = setInterval(fetchState, 2000);

    return () => {
      eventSource?.close();
      if (pollTimer) clearInterval(pollTimer);
    };
  }, [activeRoomCode, profile.id]);

  const handleCreateRoom = async () => {
    setIsConnecting(true);
    setRoomError(null);
    try {
      const res = await fetch('/api/multiplayer/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hostId: profile.id,
          hostName: profile.name,
          avatar: profile.avatar,
        }),
      });
      const data = await res.json();
      if (res.ok && data.code) {
        setActiveRoomCode(data.code);
        setRoomData(data.room);
      } else {
        setRoomError(data.error || 'No se pudo crear la sala.');
      }
    } catch (err: any) {
      setRoomError('Error al contactar con el servidor: ' + err.message);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleJoinRoom = async () => {
    const code = roomCodeInput.trim().toUpperCase();
    if (!code) {
      setRoomError('Por favor ingresa un código de sala válido.');
      return;
    }
    setIsConnecting(true);
    setRoomError(null);

    try {
      const res = await fetch('/api/multiplayer/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          playerId: profile.id,
          playerName: profile.name,
          avatar: profile.avatar,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActiveRoomCode(code);
        setRoomData(data.room);
      } else {
        setRoomError(data.error || 'No se pudo unir a la sala.');
      }
    } catch (err: any) {
      setRoomError('Error al conectar con la sala: ' + err.message);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleStartMultiplayerGame = async () => {
    if (!activeRoomCode) return;
    setIsConnecting(true);
    setRoomError(null);

    try {
      const res = await fetch('/api/multiplayer/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: activeRoomCode,
          hostId: profile.id,
          startingChips,
          smallBlind,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRoomData(data.state);
      } else {
        setRoomError(data.error || 'No se pudo iniciar la partida.');
      }
    } catch (err: any) {
      setRoomError('Error al iniciar la partida: ' + err.message);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleLeaveLobby = async () => {
    if (activeRoomCode) {
      try {
        await fetch('/api/multiplayer/leave', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: activeRoomCode, playerId: profile.id }),
        });
      } catch {}
    }
    setActiveRoomCode(null);
    setRoomData(null);
    setRoomError(null);
  };

  // If playing single-player bot game
  if (isPlayingBots) {
    return (
      <PokerTable
        profile={profile}
        settings={currentBotSettings}
        onHandCompleted={onHandCompleted}
        onExitGame={() => setIsPlayingBots(false)}
      />
    );
  }

  // If multiplayer game has officially started, render MultiplayerTable
  if (activeRoomCode && roomData?.status === 'in_game') {
    return (
      <MultiplayerTable
        profile={profile}
        roomCode={activeRoomCode}
        initialRoomState={roomData}
        onExitGame={handleLeaveLobby}
        onHandCompleted={onHandCompleted}
      />
    );
  }

  const isHost = roomData?.hostId === profile.id;
  const lobbyPlayers = roomData?.players || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2 text-teal-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Bot className="w-4 h-4" />
            <span>Mesa de Texas Hold'em</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-100">
            Mesa de Juego
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
            Juega partidas completas contra bots con IA o crea una sala multijugador privada en tiempo real.
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex p-1 rounded-xl bg-zinc-900 border border-zinc-800 self-start sm:self-auto">
          <button
            onClick={() => {
              setMode('bots');
              setActiveRoomCode(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === 'bots'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Contra Bots</span>
          </button>
          <button
            onClick={() => setMode('multiplayer')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === 'multiplayer'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Con Amigos (Multijugador)</span>
          </button>
        </div>
      </div>

      {mode === 'bots' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Settings Panel */}
          <div className="lg:col-span-1 p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-md space-y-5">
            <div className="flex items-center gap-2 text-zinc-200 font-bold text-sm pb-2 border-b border-zinc-800">
              <Settings2 className="w-4 h-4 text-emerald-400" />
              <span>Configuración de la Partida</span>
            </div>

            {/* Starting Stack */}
            <div>
              <label className="flex items-center justify-between text-xs font-medium text-zinc-300 mb-1.5">
                <span>Stack Inicial por Jugador</span>
                <span className="font-mono text-emerald-400 font-bold">{startingChips} fichas</span>
              </label>
              <input
                type="range"
                min={200}
                max={5000}
                step={100}
                value={startingChips}
                onChange={(e) => setStartingChips(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
                <span>200</span>
                <span>1,000</span>
                <span>5,000</span>
              </div>
            </div>

            {/* Small / Big Blind */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Ciegas (Small / Big Blind)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { sb: 5, bb: 10 },
                  { sb: 10, bb: 20 },
                  { sb: 25, bb: 50 },
                ].map((item) => (
                  <button
                    key={item.sb}
                    type="button"
                    onClick={() => setSmallBlind(item.sb)}
                    className={`py-2 px-2 rounded-lg text-xs font-semibold border transition-all text-center ${
                      smallBlind === item.sb
                        ? 'border-emerald-500 bg-emerald-950/70 text-emerald-300'
                        : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:bg-zinc-800'
                    }`}
                  >
                    {item.sb} / {item.bb}
                  </button>
                ))}
              </div>
            </div>

            {/* Player Count */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Número de Jugadores (Tú + Bots)
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[2, 4, 6, 8].map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setPlayerCount(count)}
                    className={`py-2 rounded-lg text-xs font-semibold border transition-all ${
                      playerCount === count
                        ? 'border-emerald-500 bg-emerald-950/70 text-emerald-300'
                        : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:bg-zinc-800'
                    }`}
                  >
                    {count} {count === 2 ? '(Heads-up)' : 'jgs'}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Nivel de los Bots
              </label>
              <div className="space-y-1.5">
                {[
                  {
                    id: 'beginner' as BotDifficulty,
                    name: 'Principiante',
                    desc: 'Juego pasivo, no farolea, ideal para empezar.',
                  },
                  {
                    id: 'intermediate' as BotDifficulty,
                    name: 'Intermedio',
                    desc: 'Considera pot odds, posición y sube manos fuertes.',
                  },
                  {
                    id: 'advanced' as BotDifficulty,
                    name: 'Difícil',
                    desc: 'Agresivo, faroles posicionales y presión matemática.',
                  },
                ].map((dif) => (
                  <button
                    key={dif.id}
                    type="button"
                    onClick={() => setDifficulty(dif.id)}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all ${
                      difficulty === dif.id
                        ? 'border-emerald-500 bg-emerald-950/60 text-zinc-100 ring-1 ring-emerald-500'
                        : 'border-zinc-800/80 bg-zinc-900/40 text-zinc-400 hover:bg-zinc-800'
                    }`}
                  >
                    <div className="text-xs font-bold text-zinc-200">{dif.name}</div>
                    <div className="text-[10px] text-zinc-400">{dif.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setIsPlayingBots(true)}
              className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm shadow-xl shadow-emerald-950/80 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Entrar a la Mesa de Juego</span>
            </button>
          </div>

          {/* Table Preview Canvas */}
          <div className="lg:col-span-2 p-8 rounded-2xl bg-gradient-to-b from-emerald-950/40 via-zinc-900 to-zinc-950 border border-emerald-800/30 flex flex-col items-center justify-center min-h-[420px] text-center relative overflow-hidden">
            <div className="w-full max-w-lg h-64 rounded-[120px] border-8 border-amber-950/70 bg-gradient-to-b from-emerald-900 via-emerald-950 to-zinc-950 shadow-2xl relative flex items-center justify-center p-6">
              <div className="absolute inset-2 rounded-[112px] border border-emerald-500/20" />
              <div className="text-center z-10 space-y-1">
                <span className="text-3xl block">♠</span>
                <span className="text-xs uppercase tracking-widest font-black text-emerald-400">
                  Mesa contra Bots Lista
                </span>
                <div className="text-sm font-bold text-zinc-100">
                  {playerCount} Jugadores • Nivel {difficulty.toUpperCase()}
                </div>
                <div className="text-xs text-zinc-400">
                  Ciegas: {smallBlind} / {bigBlind} • Stack: {startingChips}
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsPlayingBots(true)}
              className="mt-6 px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg transition-transform hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Jugar Ahora</span>
            </button>
          </div>
        </div>
      ) : (
        /* Real-time Multiplayer Lobby */
        <div className="max-w-xl mx-auto p-6 sm:p-8 rounded-3xl bg-zinc-900/90 border border-zinc-800 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-teal-950 border border-teal-700/80 flex items-center justify-center mx-auto text-teal-400 text-2xl shadow-lg">
              <Users className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-extrabold text-zinc-100">Partidas Reales en Tiempo Real</h2>
            <p className="text-xs text-zinc-400 max-w-md mx-auto">
              Juega partidas auténticas de Texas Hold'em sincronizadas en tiempo real entre múltiples dispositivos con servidor autoritativo.
            </p>
          </div>

          {roomError && (
            <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{roomError}</span>
            </div>
          )}

          {!activeRoomCode ? (
            <div className="space-y-5">
              {/* Join Existing Room */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-zinc-300">
                  Unirse a una Partida Existente
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={roomCodeInput}
                    onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                    placeholder="Ej. PK-5821"
                    maxLength={8}
                    className="flex-1 px-4 py-3 rounded-xl bg-zinc-800/90 border border-zinc-700 text-sm font-mono font-bold uppercase text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={handleJoinRoom}
                    disabled={isConnecting || !roomCodeInput.trim()}
                    className="px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-40 text-white font-extrabold text-xs shadow-md transition-all active:scale-95"
                  >
                    {isConnecting ? 'Conectando...' : 'Unirse'}
                  </button>
                </div>
              </div>

              <div className="relative py-2 flex items-center">
                <div className="flex-grow border-t border-zinc-800" />
                <span className="flex-shrink mx-3 text-zinc-500 text-xs font-semibold">o crea tu propia sala</span>
                <div className="flex-grow border-t border-zinc-800" />
              </div>

              {/* Create New Room Button */}
              <button
                type="button"
                onClick={handleCreateRoom}
                disabled={isConnecting}
                className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold text-sm shadow-xl shadow-emerald-950/80 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isConnecting ? 'Creando Sala...' : 'Crear Nueva Sala Privada'}</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          ) : (
            /* Inside the Lobby Waiting Room */
            <div className="space-y-5 animate-in fade-in duration-300">
              {/* Room Code & Share Card */}
              <div className="p-4 rounded-2xl bg-zinc-950 border border-teal-800/80 space-y-3 text-center">
                <span className="text-xs font-semibold text-zinc-400 block">
                  Código único de la sala:
                </span>
                <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-teal-950/80 border border-teal-600/80 text-teal-300 font-mono text-2xl font-black tracking-widest shadow-inner">
                  <span>{activeRoomCode}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(activeRoomCode);
                      setCopiedCode(true);
                      setTimeout(() => setCopiedCode(false), 2000);
                    }}
                    className="p-1 hover:text-white transition-colors"
                    title="Copiar código"
                  >
                    {copiedCode ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>

                <div className="flex justify-center gap-2 pt-1">
                  <button
                    onClick={() => {
                      const inviteUrl = `${window.location.origin}/?room=${activeRoomCode}`;
                      navigator.clipboard.writeText(inviteUrl);
                      setCopiedLink(true);
                      setTimeout(() => setCopiedLink(false), 2000);
                    }}
                    className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 flex items-center gap-1.5 transition-colors"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">¡Enlace copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Copiar enlace de invitación</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Connected Players in Real Time */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span className="font-bold">
                    Jugadores en la sala ({lobbyPlayers.length}/8):
                  </span>
                  <span className="text-emerald-400 font-mono font-bold animate-pulse">
                    ● En vivo
                  </span>
                </div>

                <div className="space-y-2">
                  {lobbyPlayers.map((p: any) => {
                    const isPlayerHost = p.id === roomData?.hostId;
                    const isMe = p.id === profile.id;

                    return (
                      <div
                        key={p.id}
                        className={`flex items-center justify-between p-3 rounded-xl border text-xs transition-all ${
                          isMe
                            ? 'bg-emerald-950/40 border-emerald-600/50 text-zinc-100'
                            : 'bg-zinc-950/70 border-zinc-800 text-zinc-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl">{p.avatar || '🤠'}</span>
                          <div>
                            <div className="font-bold flex items-center gap-1.5">
                              <span>{p.name}</span>
                              {isMe && (
                                <span className="text-[10px] text-emerald-400 font-semibold">(Tú)</span>
                              )}
                            </div>
                            <div className="text-[10px] text-zinc-500">
                              {isPlayerHost ? 'Creador de la partida' : 'Jugador invitado'}
                            </div>
                          </div>
                        </div>

                        {isPlayerHost && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-950 border border-amber-600 text-amber-400 font-bold text-[10px]">
                            Anfitrión 👑
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Status / Start Controls */}
              {isHost ? (
                <div className="space-y-3 pt-2">
                  {lobbyPlayers.length < 2 && (
                    <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-800/80 text-amber-300 text-xs text-center">
                      Comparte el código o enlace con al menos 1 amigo para poder iniciar la partida.
                    </div>
                  )}

                  <button
                    onClick={handleStartMultiplayerGame}
                    disabled={lobbyPlayers.length < 2 || isConnecting}
                    className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-extrabold text-sm shadow-xl shadow-emerald-950/80 transition-all hover:scale-[1.01] active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>
                      {isConnecting
                        ? 'Iniciando mesa...'
                        : `Iniciar Partida (${lobbyPlayers.length} jugadores)`}
                    </span>
                  </button>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-center space-y-1">
                  <div className="flex items-center justify-center gap-2 text-xs font-semibold text-zinc-300">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                    <span>Esperando a que el anfitrión inicie la partida...</span>
                  </div>
                  <p className="text-[11px] text-zinc-500">
                    La partida comenzará automáticamente para todos cuando el anfitrión presione "Iniciar Partida".
                  </p>
                </div>
              )}

              {/* Leave Lobby Button */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={handleLeaveLobby}
                  className="text-xs text-zinc-500 hover:text-rose-400 transition-colors flex items-center gap-1 mx-auto"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Salir del lobby</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
