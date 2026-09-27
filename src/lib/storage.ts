import { HandHistoryRecord } from '../types/poker';
import { UserProfile, UserStats } from '../types/user';

const PROFILE_KEY = 'pokercoach_profile_v1';
const HISTORY_KEY = 'pokercoach_history_v1';
const SOUND_KEY = 'pokercoach_sound_v1';

export const DEFAULT_STATS: UserStats = {
  handsPlayed: 0,
  handsWon: 0,
  handsLost: 0,
  chipsWon: 0,
  chipsLost: 0,
  currentBalance: 1000,
  showdownsWon: 0,
  showdownsPlayed: 0,
  biggestPotWon: 0,
  tutorialCompletedLessons: [],
  trainingScenariosSolved: 0,
  trainingScenariosTotal: 8,
};

export const DEFAULT_PROFILE: UserProfile = {
  id: 'guest_user',
  name: 'Jugador Invitado',
  avatar: '🃏',
  isGuest: true,
  createdAt: Date.now(),
  stats: DEFAULT_STATS,
};

export function getStoredProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return DEFAULT_PROFILE;
    return JSON.parse(raw);
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveStoredProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Error saving profile', e);
  }
}

export function getStoredHistory(): HandHistoryRecord[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveStoredHistory(history: HandHistoryRecord[]): void {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 50)));
  } catch (e) {
    console.error('Error saving history', e);
  }
}

export function getSoundEnabled(): boolean {
  try {
    const val = localStorage.getItem(SOUND_KEY);
    return val !== null ? val === 'true' : true;
  } catch {
    return true;
  }
}

export function setSoundEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(SOUND_KEY, String(enabled));
  } catch (e) {
    console.error('Error saving sound setting', e);
  }
}
