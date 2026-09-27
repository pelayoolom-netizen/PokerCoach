import React, { useState } from 'react';
import { X, User, Key, LogOut, CheckCircle2, RotateCcw, AlertCircle, Shield } from 'lucide-react';
import { UserProfile } from '../../types/user';
import { ChipStack } from './ChipStack';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onResetStats: () => void;
}

const AVATARS = ['🃏', '🤠', '🦊', '🦁', '🦉', '🦈', '🤖', '👑', '⚡', '🎯'];

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
  onResetStats,
}) => {
  const [name, setName] = useState(profile.name);
  const [avatar, setAvatar] = useState(profile.avatar);
  const [authTab, setAuthTab] = useState<'profile' | 'login' | 'register'>('profile');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMessage, setAuthMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      ...profile,
      name: name.trim() || 'Jugador',
      avatar,
    });
    onClose();
  };

  const handleReloadChips = () => {
    onUpdateProfile({
      ...profile,
      stats: {
        ...profile.stats,
        currentBalance: Math.max(profile.stats.currentBalance, 1000),
      },
    });
    setAuthMessage('¡Se han recargado 1,000 fichas virtuales de práctica!');
    setTimeout(() => setAuthMessage(null), 3500);
  };

  const handleAuthSubmit = (type: 'login' | 'register') => {
    if (!email || !password) {
      setAuthMessage('Por favor completa el correo y la contraseña.');
      return;
    }
    // Simulation / local profile sync prepared for Supabase
    onUpdateProfile({
      ...profile,
      name: email.split('@')[0],
      email,
      isGuest: false,
    });
    setAuthMessage(`¡Sesión iniciada con éxito como ${email}!`);
    setTimeout(() => {
      setAuthMessage(null);
      onClose();
    }, 1500);
  };

  const handleLogout = () => {
    onUpdateProfile({
      ...profile,
      name: 'Jugador Invitado',
      avatar: '🃏',
      isGuest: true,
      email: undefined,
    });
    setAuthMessage('Has cerrado sesión y vuelto al modo Invitado.');
    setTimeout(() => setAuthMessage(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 text-zinc-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-800/60 flex items-center justify-center text-lg">
              {avatar}
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Perfil de Jugador</h3>
              <p className="text-xs text-zinc-400">
                {profile.isGuest ? 'Modo Invitado (Sin registro requerido)' : `Conectado como ${profile.email}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status notification */}
        {authMessage && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-950/70 border border-emerald-700/60 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{authMessage}</span>
          </div>
        )}

        {/* Tab navigation */}
        <div className="flex border-b border-zinc-800 mb-5">
          <button
            onClick={() => setAuthTab('profile')}
            className={`flex-1 py-2 text-xs font-semibold border-b-2 transition-all ${
              authTab === 'profile'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Personalización
          </button>
          <button
            onClick={() => setAuthTab('login')}
            className={`flex-1 py-2 text-xs font-semibold border-b-2 transition-all ${
              authTab === 'login'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {profile.isGuest ? 'Iniciar Sesión' : 'Mi Cuenta'}
          </button>
          {profile.isGuest && (
            <button
              onClick={() => setAuthTab('register')}
              className={`flex-1 py-2 text-xs font-semibold border-b-2 transition-all ${
                authTab === 'register'
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Registrarse
            </button>
          )}
        </div>

        {authTab === 'profile' && (
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Nombre de jugador
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={20}
                className="w-full px-3 py-2 rounded-lg bg-zinc-800/80 border border-zinc-700 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
                placeholder="Ej. Maverick"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Elige tu avatar
              </label>
              <div className="grid grid-cols-5 gap-2">
                {AVATARS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setAvatar(emoji)}
                    className={`h-11 rounded-lg text-xl flex items-center justify-center border transition-all ${
                      avatar === emoji
                        ? 'border-emerald-500 bg-emerald-950/60 ring-1 ring-emerald-400 scale-105'
                        : 'border-zinc-800 bg-zinc-800/40 hover:bg-zinc-800'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Virtual Chip balance and reload */}
            <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-zinc-400 block">Balance de fichas virtuales:</span>
                <ChipStack amount={profile.stats.currentBalance} size="md" />
              </div>
              <button
                type="button"
                onClick={handleReloadChips}
                className="px-2.5 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 text-xs font-medium transition-colors"
              >
                + Recargar Fichas
              </button>
            </div>

            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onResetStats}
                className="text-xs text-zinc-500 hover:text-rose-400 flex items-center gap-1 transition-colors"
                title="Reiniciar historial y estadísticas"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reiniciar estadísticas</span>
              </button>

              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-semibold text-xs text-white shadow-lg shadow-emerald-950/50 transition-colors"
              >
                Guardar Cambios
              </button>
            </div>
          </form>
        )}

        {(authTab === 'login' || authTab === 'register') && (
          <div className="space-y-4">
            {!profile.isGuest ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/50 text-sm">
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-1">
                    <Shield className="w-4 h-4" />
                    <span>Sesión Activa</span>
                  </div>
                  <p className="text-xs text-zinc-300">
                    Tu cuenta <span className="font-mono text-zinc-100">{profile.email}</span> sincroniza tu progreso en el tutorial, estadísticas y partidas multijugador.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-rose-300 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3.5">
                <p className="text-xs text-zinc-400">
                  {authTab === 'login'
                    ? 'Inicia sesión para sincronizar tu progreso y partidas privadas.'
                    : 'Crea tu cuenta de PokerCoach. No es obligatorio para jugar con bots ni tutorial.'}
                </p>
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className="w-full px-3 py-2 rounded-lg bg-zinc-800/80 border border-zinc-700 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 rounded-lg bg-zinc-800/80 border border-zinc-700 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleAuthSubmit(authTab === 'login' ? 'login' : 'register')}
                  className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-lg shadow-emerald-950/50"
                >
                  {authTab === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta Gratuita'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
