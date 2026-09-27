import React, { useState, useEffect, useCallback } from 'react';
import { AppView } from './types/navigation';
import { UserProfile } from './types/user';
import { HandHistoryRecord } from './types/poker';
import {
  getStoredProfile,
  saveStoredProfile,
  getStoredHistory,
  saveStoredHistory,
  getSoundEnabled,
  setSoundEnabled,
  DEFAULT_STATS,
} from './lib/storage';
import { sound } from './lib/sound';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { ProfileModal } from './components/common/ProfileModal';
import { DashboardView } from './components/views/DashboardView';
import { LearnView } from './components/views/LearnView';
import { PlayView } from './components/views/PlayView';
import { AnalyzerView } from './components/views/AnalyzerView';
import { TrainerView } from './components/views/TrainerView';
import { AICoachView } from './components/views/AICoachView';
import { StatsView } from './components/views/StatsView';
import { runPokerEngineTests } from './game-engine/engine.test';

const VIEW_PATHS: Record<AppView, string> = {
  dashboard: '/',
  learn: '/aprender',
  play: '/jugar',
  analyzer: '/analizador',
  trainer: '/entrenar',
  coach: '/entrenador-ia',
  stats: '/estadisticas',
};

const VIEW_TITLES: Record<AppView, string> = {
  dashboard: 'Poker Coach — Aprende a jugar al póker',
  learn: 'Tutorial de Texas Hold\'em y Reglas | Poker Coach',
  play: 'Mesa de Juego contra Bots y Amigos | Poker Coach',
  analyzer: 'Analizador de Manos y Calculadora de Showdown | Poker Coach',
  trainer: 'Entrenamiento de Decisiones y Situaciones | Poker Coach',
  coach: 'Entrenador IA de Póker | Poker Coach',
  stats: 'Estadísticas y Progreso del Jugador | Poker Coach',
};

function getViewFromLocation(): AppView {
  if (typeof window === 'undefined') return 'dashboard';
  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase().replace('#', '');

  if (path === '/aprender' || hash === 'aprender' || hash === 'learn') return 'learn';
  if (path === '/jugar' || hash === 'jugar' || hash === 'play') return 'play';
  if (path === '/analizador' || hash === 'analizador' || hash === 'analyzer') return 'analyzer';
  if (path === '/entrenar' || hash === 'entrenar' || hash === 'trainer') return 'trainer';
  if (path === '/entrenador-ia' || hash === 'entrenador-ia' || hash === 'coach') return 'coach';
  if (path === '/estadisticas' || hash === 'estadisticas' || hash === 'stats') return 'stats';

  return 'dashboard';
}

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>(getViewFromLocation);
  const [profile, setProfile] = useState<UserProfile>(getStoredProfile);
  const [history, setHistory] = useState<HandHistoryRecord[]>(getStoredHistory);
  const [soundEnabled, setSoundActive] = useState<boolean>(getSoundEnabled);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  // Run engine self-tests on mount once to verify mathematical correctness
  useEffect(() => {
    const testResults = runPokerEngineTests();
    console.log(`[PokerCoach Engine Tests] ${testResults.passed}/${testResults.total} tests pasados.`);
    if (testResults.failures.length > 0) {
      console.warn('[PokerCoach Engine Tests Failures]:', testResults.failures);
    }
  }, []);

  // Update document title and listen to browser popstate (back/forward)
  useEffect(() => {
    document.title = VIEW_TITLES[currentView] || VIEW_TITLES.dashboard;

    const handlePopState = () => {
      const v = getViewFromLocation();
      setCurrentView(v);
      document.title = VIEW_TITLES[v] || VIEW_TITLES.dashboard;
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentView]);

  // Sync profile changes to storage
  const handleUpdateProfile = (updated: UserProfile) => {
    setProfile(updated);
    saveStoredProfile(updated);
  };

  // Called when a hand finishes at the table
  const handleHandCompleted = (profit: number, won: boolean, pot: number, summary: string) => {
    const newStats = {
      ...profile.stats,
      handsPlayed: profile.stats.handsPlayed + 1,
      handsWon: profile.stats.handsWon + (won ? 1 : 0),
      handsLost: profile.stats.handsLost + (won ? 0 : 1),
      chipsWon: profile.stats.chipsWon + (profit > 0 ? profit : 0),
      chipsLost: profile.stats.chipsLost + (profit < 0 ? Math.abs(profit) : 0),
      currentBalance: Math.max(0, profile.stats.currentBalance + profit),
      showdownsPlayed: profile.stats.showdownsPlayed + 1,
      showdownsWon: profile.stats.showdownsWon + (won ? 1 : 0),
      biggestPotWon: Math.max(profile.stats.biggestPotWon, won ? pot : 0),
    };

    const updatedProfile = {
      ...profile,
      stats: newStats,
    };

    handleUpdateProfile(updatedProfile);

    // Save history record
    const newRecord: HandHistoryRecord = {
      id: 'hand_' + Date.now(),
      timestamp: Date.now(),
      startingChips: profile.stats.currentBalance,
      finalPot: pot,
      winnerIds: won ? ['hero'] : ['bot'],
      winnerNames: won ? [profile.name] : ['Rival'],
      communityCards: [],
      heroCards: [],
      heroProfit: profit,
      handSummary: summary,
    };

    const updatedHistory = [newRecord, ...history].slice(0, 50);
    setHistory(updatedHistory);
    saveStoredHistory(updatedHistory);
  };

  // Reset user stats
  const handleResetStats = () => {
    const updated: UserProfile = {
      ...profile,
      stats: {
        ...DEFAULT_STATS,
        tutorialCompletedLessons: [],
      },
    };
    setProfile(updated);
    saveStoredProfile(updated);
    setHistory([]);
    saveStoredHistory([]);
    sound.playFold();
  };

  // Toggle sound effects
  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundActive(next);
    setSoundEnabled(next);
    if (next) sound.playChip();
  };

  const handleNavigate = useCallback((view: AppView) => {
    sound.playCard();
    setCurrentView(view);
    const targetPath = VIEW_PATHS[view] || '/';
    if (window.location.pathname !== targetPath) {
      window.history.pushState(null, '', targetPath);
    }
    document.title = VIEW_TITLES[view] || VIEW_TITLES.dashboard;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0f0d] text-zinc-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        profile={profile}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onOpenProfile={() => setProfileModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentView === 'dashboard' && (
          <DashboardView
            profile={profile}
            history={history}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'learn' && (
          <LearnView
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
          />
        )}

        {currentView === 'play' && (
          <PlayView
            profile={profile}
            onHandCompleted={handleHandCompleted}
          />
        )}

        {currentView === 'analyzer' && (
          <AnalyzerView />
        )}

        {currentView === 'trainer' && (
          <TrainerView
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
          />
        )}

        {currentView === 'coach' && (
          <AICoachView />
        )}

        {currentView === 'stats' && (
          <StatsView
            profile={profile}
            history={history}
            onResetStats={handleResetStats}
            onPlayGame={() => handleNavigate('play')}
          />
        )}
      </main>

      {/* User Profile & Auth Modal */}
      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        profile={profile}
        onUpdateProfile={handleUpdateProfile}
        onResetStats={handleResetStats}
      />

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}
