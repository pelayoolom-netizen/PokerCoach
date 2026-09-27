export interface UserStats {
  handsPlayed: number;
  handsWon: number;
  handsLost: number;
  chipsWon: number;
  chipsLost: number;
  currentBalance: number;
  showdownsWon: number;
  showdownsPlayed: number;
  biggestPotWon: number;
  tutorialCompletedLessons: string[];
  trainingScenariosSolved: number;
  trainingScenariosTotal: number;
}

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  isGuest: boolean;
  email?: string;
  createdAt: number;
  stats: UserStats;
}
