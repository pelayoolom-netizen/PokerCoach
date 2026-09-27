import { BotDifficulty, Card, PlayerActionType } from '../types/poker';
import { evaluateBestHand } from '../game-engine/evaluator';

export interface BotDecision {
  action: PlayerActionType;
  amount?: number;
  reason: string;
}

export interface BotContext {
  difficulty: BotDifficulty;
  cards: Card[];
  communityCards: Card[];
  chips: number;
  currentBet: number;
  currentHighestBet: number;
  minRaise: number;
  totalPot: number;
  legalActions: {
    canFold: boolean;
    canCheck: boolean;
    canCall: boolean;
    callAmount: number;
    canBet: boolean;
    minBet: number;
    canRaise: boolean;
    minRaise: number;
    maxRaise: number;
    canAllIn: boolean;
    allInAmount: number;
  };
}

export function computeBotAction(ctx: BotContext): BotDecision {
  const { legalActions, cards, communityCards, totalPot, currentHighestBet, currentBet, difficulty } = ctx;
  const toCall = currentHighestBet - currentBet;

  // 1. Preflop evaluation
  if (communityCards.length === 0) {
    const r1 = getRankValue(cards[0].rank);
    const r2 = getRankValue(cards[1].rank);
    const isPair = r1 === r2;
    const isSuited = cards[0].suit === cards[1].suit;
    const highRank = Math.max(r1, r2);

    // Beginner Bot
    if (difficulty === 'beginner') {
      if (toCall === 0) {
        if (isPair || highRank >= 12) {
          if (legalActions.canBet) {
            return { action: 'bet', amount: legalActions.minBet, reason: 'Mano bonita preflop, apuesta mínima' };
          }
        }
        return { action: 'check', reason: 'Pasa gratis' };
      }
      if (toCall <= 40) {
        if (isPair || highRank >= 10 || isSuited) {
          return { action: 'call', reason: 'Paga para ver el flop' };
        }
      }
      if (toCall > 100 && !isPair && highRank < 13) {
        return { action: 'fold', reason: 'Apuesta demasiado alta para principiante' };
      }
      return legalActions.canCheck ? { action: 'check', reason: 'Pasa' } : { action: 'fold', reason: 'Retirada' };
    }

    // Intermediate Bot
    if (difficulty === 'intermediate') {
      const isPremium = (isPair && highRank >= 10) || (highRank === 14 && Math.min(r1, r2) >= 11);
      if (isPremium) {
        if (legalActions.canRaise) {
          const raiseAmt = Math.min(legalActions.maxRaise, Math.max(legalActions.minRaise, currentHighestBet * 3));
          return { action: 'raise', amount: raiseAmt, reason: 'Subida por mano premium preflop' };
        }
        if (legalActions.canBet) {
          return { action: 'bet', amount: legalActions.minBet * 3, reason: 'Apuesta fuerte preflop' };
        }
      }
      if (toCall <= totalPot * 0.35 || isPair || (highRank >= 11 && isSuited)) {
        if (legalActions.canCall) return { action: 'call', reason: 'Paga con pot odds razonables' };
      }
      return legalActions.canCheck ? { action: 'check', reason: 'Pasa' } : { action: 'fold', reason: 'Retirada conservadora' };
    }

    // Advanced Bot
    const isMonster = (isPair && highRank >= 12) || (highRank === 14 && Math.min(r1, r2) === 13);
    if (isMonster) {
      if (legalActions.canRaise) {
        const raiseAmt = Math.min(legalActions.maxRaise, Math.max(legalActions.minRaise, currentHighestBet * 3.5));
        return { action: 'raise', amount: raiseAmt, reason: 'Re-raise con mano monstruo' };
      }
    }
    const potOdds = toCall / (totalPot + toCall || 1);
    if (potOdds < 0.3 || isPair || (highRank >= 10 && isSuited)) {
      if (legalActions.canCall) return { action: 'call', reason: 'Defiende ciega o posición' };
    }
    return legalActions.canCheck ? { action: 'check', reason: 'Pasa' } : { action: 'fold', reason: 'Fold matemático' };
  }

  // 2. Postflop evaluation (Flop, Turn, River)
  const allCards = [...cards, ...communityCards];
  const handEval = evaluateBestHand(allCards);
  const tier = handEval.rankValue;

  // Very strong hand: Full house or better (rankValue >= 7000000)
  if (tier >= 7000000) {
    if (legalActions.canRaise) {
      const raiseAmt = Math.min(legalActions.maxRaise, Math.max(legalActions.minRaise, Math.round(totalPot * 0.75)));
      return { action: 'raise', amount: raiseAmt, reason: `Mano dominante: ${handEval.categoryName}` };
    }
    if (legalActions.canBet) {
      const betAmt = Math.min(ctx.chips, Math.max(legalActions.minBet, Math.round(totalPot * 0.6)));
      return { action: 'bet', amount: betAmt, reason: `Apuesta por valor: ${handEval.categoryName}` };
    }
    if (legalActions.canCall) return { action: 'call', reason: 'Paga con monstruo' };
  }

  // Strong hand: Three of a kind, straight, flush (rankValue >= 4000000)
  if (tier >= 4000000) {
    if (legalActions.canBet) {
      const betAmt = Math.min(ctx.chips, Math.max(legalActions.minBet, Math.round(totalPot * 0.5)));
      return { action: 'bet', amount: betAmt, reason: `Apuesta de valor: ${handEval.categoryName}` };
    }
    if (legalActions.canRaise && difficulty !== 'beginner') {
      return { action: 'raise', amount: legalActions.minRaise, reason: `Subida por ${handEval.categoryName}` };
    }
    if (legalActions.canCall) return { action: 'call', reason: 'Paga con jugada hecha' };
    return { action: 'check', reason: 'Pasa con buena jugada' };
  }

  // Moderate hand: Two pair or top pair (rankValue >= 2000000)
  if (tier >= 2000000) {
    if (legalActions.canCheck) {
      // 50% chance to bet small in intermediate/advanced
      if (legalActions.canBet && difficulty !== 'beginner' && Math.random() > 0.4) {
        return { action: 'bet', amount: legalActions.minBet, reason: `Apuesta de prueba con ${handEval.categoryName}` };
      }
      return { action: 'check', reason: 'Control del bote' };
    }
    if (toCall <= totalPot * 0.45) {
      if (legalActions.canCall) return { action: 'call', reason: 'Paga con pareja y buenas odds' };
    }
    return { action: 'fold', reason: 'Apuesta rival demasiado fuerte para una pareja' };
  }

  // Weak hand: High card
  if (legalActions.canCheck) {
    // Advanced bot occasional bluff (15% on flop/river)
    if (difficulty === 'advanced' && legalActions.canBet && Math.random() < 0.15) {
      return { action: 'bet', amount: Math.round(totalPot * 0.5), reason: 'Farol posicional simulado' };
    }
    return { action: 'check', reason: 'Pasa carta gratis' };
  }

  // If cheap to see next card (less than 10% of pot)
  if (toCall <= totalPot * 0.1 && legalActions.canCall) {
    return { action: 'call', reason: 'Paga monto minúsculo' };
  }

  return { action: 'fold', reason: 'Mano débil sin odds' };
}

function getRankValue(rank: string): number {
  const map: Record<string, number> = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
    J: 11, Q: 12, K: 13, A: 14,
  };
  return map[rank] || 0;
}
