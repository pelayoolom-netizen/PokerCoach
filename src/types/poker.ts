export type Suit = 'spades' | 'hearts' | 'diamonds' | 'clubs';

export type Rank =
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | '10'
  | 'J'
  | 'Q'
  | 'K'
  | 'A';

export interface Card {
  rank: Rank;
  suit: Suit;
}

export type HandCategory =
  | 'high_card'
  | 'one_pair'
  | 'two_pair'
  | 'three_of_a_kind'
  | 'straight'
  | 'flush'
  | 'full_house'
  | 'four_of_a_kind'
  | 'straight_flush'
  | 'royal_flush';

export interface HandEvaluation {
  category: HandCategory;
  categoryName: string;
  rankValue: number; // numeric comparison value
  cards: Card[]; // the 5 cards forming the best hand
  kickers?: Card[];
  description: string;
}

export type PlayerActionType = 'fold' | 'check' | 'call' | 'bet' | 'raise' | 'all-in';

export interface PlayerAction {
  type: PlayerActionType;
  amount?: number;
  timestamp?: number;
}

export type BettingRound = 'preflop' | 'flop' | 'turn' | 'river' | 'showdown' | 'ended';

export type BotDifficulty = 'beginner' | 'intermediate' | 'advanced';

export interface Player {
  id: string;
  name: string;
  avatar: string;
  chips: number;
  currentBet: number;
  cards: Card[];
  folded: boolean;
  isAllIn: boolean;
  isBot: boolean;
  botDifficulty?: BotDifficulty;
  lastAction?: PlayerAction;
  positionName?: string; // 'BTN', 'SB', 'BB', 'UTG', etc.
}

export interface GameSettings {
  startingChips: number;
  smallBlind: number;
  bigBlind: number;
  playerCount: number;
  difficulty: BotDifficulty;
}

export interface HandHistoryRecord {
  id: string;
  timestamp: number;
  startingChips: number;
  finalPot: number;
  winnerIds: string[];
  winnerNames: string[];
  communityCards: Card[];
  heroCards: Card[];
  heroProfit: number;
  handSummary: string;
}
