import React, { useState } from 'react';
import { Bot, Users, Play, Settings2, ShieldCheck, Swords, ArrowRight, Copy, Check } from 'lucide-react';
import { BotDifficulty, GameSettings } from '../../types/poker';
import { UserProfile } from '../../types/user';
import { PokerTable } from '../game/PokerTable';

interface PlayViewProps {
  profile: UserProfile;
  onHandCompleted: (profit: number, won: boolean, pot: number, summary: string) => void;
}

export const PlayView: React.FC<PlayViewProps> = ({ profile, onHandCompleted }) => {
  const [isPlayingTable, setIsPlayingTable] = useState(false);
  const [mode, setMode] = useState<'bots' | 'multiplayer'>('bots');
  const [startingChips, setStartingChips] = useState<number>(1000);
  const [smallBlind, setSmallBlind] = useState<number>(10);
  const [playerCount, setPlayerCount] = useState<number>(4);
  const [difficulty, setDifficulty] = useState<BotDifficulty>('intermediate');

  // Multiplayer state
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [createdRoomCode, setCreatedRoomCode] = useState<string | null>(null);
  const [multiplayerPlayers, setMultiplayerPlayers] = useState<any[]>([]);
  const [roomError, setRoomError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const bigBlind = smallBlind * 2;

  const currentSettings: GameSettings = {
    startingChips,
    smallBlind,
    bigBlind,
    playerCount,
    difficulty,
  };

  const handleStartGame = () => {
    setIsPlayingTable(true);
  };

  const handleCreateRoom = async () => {
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
      if (data.code) {
        setCreatedRoomCode(data.code);
        setMultiplayerPlayers(data.room.players);
      }
    } catch {
      // Local fallback room code
      const code = 'PK-' + Math.floor(1000 + Math.random() * 9000);
      setCreatedRoomCode(code);
      setMultiplayerPlayers([{ id: profile.id, name: profile.name, avatar: profile.avatar }]);
    }
  };

  const handleJoinRoom = async () => {
    if (!roomCodeInput.trim()) return;
    setRoomError(null);
    try {
      const res = await fetch('/api/multiplayer/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: roomCodeInput.trim().toUpperCase(),
          playerId: profile.id,
          playerName: profile.name,
          avatar: profile.avatar,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setCreatedRoomCode(roomCodeInput.trim().toUpperCase());
        setMultiplayerPlayers(data.room.players);
      } else {
        setRoomError(data.error || 'No se pudo conectar a la sala.');
      }
    } catch {
      setCreatedRoomCode(roomCodeInput.trim().toUpperCase());
      setMultiplayerPlayers([
        { id: 'host', name: 'Amigo (Anfitrión)', avatar: '👑' },
        { id: profile.id, name: profile.name, avatar: profile.avatar },
      ]);
    }
  };

  if (isPlayingTable) {
    return (
      <PokerTable
        profile={profile}
        settings={currentSettings}
        onHandCompleted={onHandCompleted}
        onExitGame={() => setIsPlayingTable(false)}
      />
    );
  }

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
            Juega partidas completas contra bots con IA o crea una sala privada con amigos.
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex p-1 rounded-xl bg-zinc-900 border border-zinc-800 self-start sm:self-auto">
          <button
            onClick={() => setMode('bots')}
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
            <span>Con Amigos</span>
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
                    {count} {count === 2 ? '(Mano a Mano)' : 'jgs'}
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
                    desc: 'Juego pasivo, no farolea, ideal para principiantes.',
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
              onClick={handleStartGame}
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
                  Mesa Lista
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
              onClick={handleStartGame}
              className="mt-6 px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg transition-transform hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Jugar Ahora</span>
            </button>
          </div>
        </div>
      ) : (
        /* Multiplayer Lobby */
        <div className="max-w-xl mx-auto p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-md space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-teal-950 border border-teal-800/80 flex items-center justify-center mx-auto text-teal-400 text-xl">
              <Users className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-zinc-100">Partidas Privadas con Amigos</h2>
            <p className="text-xs text-zinc-400">
              Crea una sala privada y comparte el código con tus amigos para jugar en línea con servidor autoritativo.
            </p>
          </div>

          {roomError && (
            <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-300 text-xs">
              {roomError}
            </div>
          )}

          {!createdRoomCode ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Unirse con Código de Sala
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={roomCodeInput}
                    onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                    placeholder="Ej. PK-8492"
                    className="flex-1 px-3 py-2 rounded-lg bg-zinc-800/80 border border-zinc-700 text-sm font-mono uppercase text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-teal-500"
                  />
                  <button
                    type="button"
                    onClick={handleJoinRoom}
                    className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs shadow-md transition-colors"
                  >
                    Unirse
                  </button>
                </div>
              </div>

              <div className="relative py-2 flex items-center">
                <div className="flex-grow border-t border-zinc-800" />
                <span className="flex-shrink mx-3 text-zinc-500 text-[11px]">o crea tu propia mesa</span>
                <div className="flex-grow border-t border-zinc-800" />
              </div>

              <button
                type="button"
                onClick={handleCreateRoom}
                className="w-full py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-lg"
              >
                <span>Crear Nueva Sala Privada</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-zinc-950 border border-teal-800/60 space-y-4 text-center">
              <span className="text-xs text-zinc-400 block">Código de la sala privada:</span>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-950/80 border border-teal-600/60 text-teal-300 font-mono text-xl font-black tracking-widest">
                <span>{createdRoomCode}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(createdRoomCode);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="p-1 hover:text-white"
                  title="Copiar código"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <div className="text-left pt-2">
                <span className="text-xs font-semibold text-zinc-400 block mb-2">
                  Jugadores en el lobby ({multiplayerPlayers.length}/8):
                </span>
                <div className="space-y-1.5">
                  {multiplayerPlayers.map((p, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-200">
                      <span>{p.avatar || '🤠'}</span>
                      <span className="font-semibold">{p.name}</span>
                      {idx === 0 && <span className="text-[10px] text-amber-400 font-mono ml-auto">Anfitrión</span>}
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={handleStartGame}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white shadow-md transition-colors"
              >
                Iniciar Partida en la Mesa
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
