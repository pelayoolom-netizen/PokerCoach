import React, { useState } from 'react';
import {
  BookOpen,
  Bot,
  BrainCircuit,
  HelpCircle,
  Menu,
  MessageSquare,
  Sparkles,
  Trophy,
  Volume2,
  VolumeX,
  X,
  User as UserIcon,
} from 'lucide-react';
import { AppView } from '../../types/navigation';
import { UserProfile } from '../../types/user';
import { ChipStack } from '../common/ChipStack';

interface NavbarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  profile: UserProfile;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenProfile: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  profile,
  soundEnabled,
  onToggleSound,
  onOpenProfile,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: AppView; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'dashboard', label: 'Inicio', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'learn', label: 'Aprender', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'play', label: 'Jugar', icon: <Bot className="w-4 h-4" />, badge: 'Bots & Amigos' },
    { id: 'analyzer', label: 'Analizar', icon: <BrainCircuit className="w-4 h-4" /> },
    { id: 'trainer', label: 'Entrenar', icon: <HelpCircle className="w-4 h-4" /> },
    { id: 'coach', label: 'Entrenador IA', icon: <MessageSquare className="w-4 h-4" />, badge: 'IA' },
    { id: 'stats', label: 'Estadísticas', icon: <Trophy className="w-4 h-4" /> },
  ];

  const handleNavClick = (view: AppView) => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div
            onClick={() => handleNavClick('dashboard')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-900/30 group-hover:scale-105 transition-transform border border-emerald-400/40">
              <span className="text-xl leading-none">♠</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-zinc-100 via-zinc-200 to-emerald-400 bg-clip-text text-transparent">
                  PokerCoach
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                  Hold'em
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 hidden sm:block">Aprende. Juega. Mejora.</p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const active = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`relative flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    active
                      ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 shadow-inner'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[9px] font-semibold px-1 rounded ${
                        active
                          ? 'bg-emerald-600 text-white'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Bar (Chips, Sound, Profile, Mobile Toggle) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Virtual Chip Balance Display */}
            <div
              onClick={onOpenProfile}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-zinc-900/90 border border-zinc-800 hover:border-emerald-600/40 cursor-pointer transition-colors"
              title="Fichas de práctica (Virtuales, sin valor monetario)"
            >
              <ChipStack amount={profile.stats.currentBalance} size="sm" />
            </div>

            {/* Sound Toggle */}
            <button
              onClick={onToggleSound}
              aria-label={soundEnabled ? 'Silenciar sonidos' : 'Activar sonidos'}
              className="p-2 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-colors"
              title={soundEnabled ? 'Sonido activado' : 'Sonido silenciado'}
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-zinc-500" />
              )}
            </button>

            {/* User Profile Button */}
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg bg-zinc-900/80 border border-zinc-800 hover:border-emerald-600/40 transition-colors text-xs font-medium text-zinc-300"
            >
              <span className="text-base leading-none">{profile.avatar}</span>
              <span className="hidden sm:inline-block max-w-[90px] truncate">{profile.name}</span>
              {profile.isGuest && (
                <span className="text-[10px] bg-zinc-800 text-zinc-400 px-1 py-0.5 rounded hidden md:inline">
                  Invitado
                </span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-zinc-400 hover:text-zinc-200 lg:hidden hover:bg-zinc-900 border border-zinc-800"
              aria-label="Menú principal"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-zinc-800 bg-zinc-950/95 backdrop-blur-xl px-4 pt-3 pb-6 space-y-1.5 animate-in slide-in-from-top-4 duration-200">
          <div className="px-3 py-2 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Navegación
          </div>
          {navItems.map((item) => {
            const active = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-700/40">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
