import { Card, HandCategory, HandEvaluation, Rank, Suit } from '../types/poker';

const RANK_VALUES: Record<Rank, number> = {
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  '10': 10,
  J: 11,
  Q: 12,
  K: 13,
  A: 14,
};

const VALUE_TO_RANK: Record<number, Rank> = {
  2: '2',
  3: '3',
  4: '4',
  5: '5',
  6: '6',
  7: '7',
  8: '8',
  9: '9',
  10: '10',
  11: 'J',
  12: 'Q',
  13: 'K',
  14: 'A',
};

const RANK_NAMES_ES: Record<number, { singular: string; plural: string }> = {
  2: { singular: 'dos', plural: 'doses' },
  3: { singular: 'tres', plural: 'treses' },
  4: { singular: 'cuatro', plural: 'cuatros' },
  5: { singular: 'cinco', plural: 'cincos' },
  6: { singular: 'seis', plural: 'seises' },
  7: { singular: 'siete', plural: 'sietes' },
  8: { singular: 'ocho', plural: 'ochos' },
  9: { singular: 'nueve', plural: 'nueves' },
  10: { singular: 'diez', plural: 'dieces' },
  11: { singular: 'Jota (J)', plural: 'Jotas' },
  12: { singular: 'Dama (Q)', plural: 'Damas' },
  13: { singular: 'Rey (K)', plural: 'Reyes' },
  14: { singular: 'As (A)', plural: 'Ases' },
};

export const CATEGORY_TIER: Record<HandCategory, number> = {
  high_card: 1,
  one_pair: 2,
  two_pair: 3,
  three_of_a_kind: 4,
  straight: 5,
  flush: 6,
  full_house: 7,
  four_of_a_kind: 8,
  straight_flush: 9,
  royal_flush: 10,
};

export const CATEGORY_NAMES_ES: Record<HandCategory, string> = {
  high_card: 'Carta Alta',
  one_pair: 'Pareja',
  two_pair: 'Doble Pareja',
  three_of_a_kind: 'Trío',
  straight: 'Escalera',
  flush: 'Color',
  full_house: 'Full House',
  four_of_a_kind: 'Póker',
  straight_flush: 'Escalera de Color',
  royal_flush: 'Escalera Real',
};

export interface Evaluated5CardHand {
  category: HandCategory;
  tier: number;
  score: number[]; // Lexicographical score for comparison
  cards: Card[];
  description: string;
}

// Generate all combinations of k items from array
function combinations<T>(arr: T[], k: number): T[][] {
  if (k === 0) return [[]];
  if (arr.length < k) return [];
  const [first, ...rest] = arr;
  const withFirst = combinations(rest, k - 1).map((c) => [first, ...c]);
  const withoutFirst = combinations(rest, k);
  return [...withFirst, ...withoutFirst];
}

// Evaluate exactly 5 cards
export function evaluate5Cards(cards: Card[]): Evaluated5CardHand {
  if (cards.length !== 5) {
    throw new Error(`Se requieren exactamente 5 cartas para evaluar, recibidas: ${cards.length}`);
  }

  // Sort cards descending by rank value
  const sorted = [...cards].sort((a, b) => RANK_VALUES[b.rank] - RANK_VALUES[a.rank]);
  const values = sorted.map((c) => RANK_VALUES[c.rank]);
  const suits = sorted.map((c) => c.suit);

  const isFlush = suits.every((s) => s === suits[0]);

  // Check for straight
  let isStraight = false;
  let straightHigh = 0;

  // Standard straight check
  if (
    values[0] - values[1] === 1 &&
    values[1] - values[2] === 1 &&
    values[2] - values[3] === 1 &&
    values[3] - values[4] === 1
  ) {
    isStraight = true;
    straightHigh = values[0];
  } else if (
    // Ace-low straight (Wheel: A-2-3-4-5)
    values[0] === 14 &&
    values[1] === 5 &&
    values[2] === 4 &&
    values[3] === 3 &&
    values[4] === 2
  ) {
    isStraight = true;
    straightHigh = 5; // In wheel straight, 5 is the highest card
  }

  // Count frequencies of rank values
  const countMap = new Map<number, number>();
  for (const v of values) {
    countMap.set(v, (countMap.get(v) || 0) + 1);
  }

  // Group by count descending, then value descending
  const groups = Array.from(countMap.entries()).sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1];
    return b[0] - a[0];
  });

  // 1. Royal Flush & Straight Flush
  if (isFlush && isStraight) {
    if (straightHigh === 14) {
      return {
        category: 'royal_flush',
        tier: CATEGORY_TIER.royal_flush,
        score: [CATEGORY_TIER.royal_flush, 14],
        cards: sorted,
        description: 'Escalera Real de ' + sorted[0].suit,
      };
    }
    const highCardRank = VALUE_TO_RANK[straightHigh];
    return {
      category: 'straight_flush',
      tier: CATEGORY_TIER.straight_flush,
      score: [CATEGORY_TIER.straight_flush, straightHigh],
      cards: sorted,
      description: `Escalera de Color al ${highCardRank}`,
    };
  }

  // 2. Four of a Kind (Póker)
  if (groups[0][1] === 4) {
    const quadVal = groups[0][0];
    const kickerVal = groups[1][0];
    return {
      category: 'four_of_a_kind',
      tier: CATEGORY_TIER.four_of_a_kind,
      score: [CATEGORY_TIER.four_of_a_kind, quadVal, kickerVal],
      cards: sorted,
      description: `Póker de ${RANK_NAMES_ES[quadVal].plural} con kicker ${VALUE_TO_RANK[kickerVal]}`,
    };
  }

  // 3. Full House
  if (groups[0][1] === 3 && groups[1][1] === 2) {
    const tripVal = groups[0][0];
    const pairVal = groups[1][0];
    return {
      category: 'full_house',
      tier: CATEGORY_TIER.full_house,
      score: [CATEGORY_TIER.full_house, tripVal, pairVal],
      cards: sorted,
      description: `Full House de ${RANK_NAMES_ES[tripVal].plural} y ${RANK_NAMES_ES[pairVal].plural}`,
    };
  }

  // 4. Flush (Color)
  if (isFlush) {
    return {
      category: 'flush',
      tier: CATEGORY_TIER.flush,
      score: [CATEGORY_TIER.flush, ...values],
      cards: sorted,
      description: `Color al ${sorted[0].rank} (${sorted[0].suit})`,
    };
  }

  // 5. Straight (Escalera)
  if (isStraight) {
    return {
      category: 'straight',
      tier: CATEGORY_TIER.straight,
      score: [CATEGORY_TIER.straight, straightHigh],
      cards: sorted,
      description: `Escalera al ${VALUE_TO_RANK[straightHigh]}`,
    };
  }

  // 6. Three of a Kind (Trío)
  if (groups[0][1] === 3) {
    const tripVal = groups[0][0];
    const kickers = [groups[1][0], groups[2][0]].sort((a, b) => b - a);
    return {
      category: 'three_of_a_kind',
      tier: CATEGORY_TIER.three_of_a_kind,
      score: [CATEGORY_TIER.three_of_a_kind, tripVal, ...kickers],
      cards: sorted,
      description: `Trío de ${RANK_NAMES_ES[tripVal].plural} con kickers ${VALUE_TO_RANK[kickers[0]]} y ${VALUE_TO_RANK[kickers[1]]}`,
    };
  }

  // 7. Two Pair (Doble Pareja)
  if (groups[0][1] === 2 && groups[1][1] === 2) {
    const highPair = Math.max(groups[0][0], groups[1][0]);
    const lowPair = Math.min(groups[0][0], groups[1][0]);
    const kicker = groups[2][0];
    return {
      category: 'two_pair',
      tier: CATEGORY_TIER.two_pair,
      score: [CATEGORY_TIER.two_pair, highPair, lowPair, kicker],
      cards: sorted,
      description: `Doble Pareja de ${RANK_NAMES_ES[highPair].plural} y ${RANK_NAMES_ES[lowPair].plural} con kicker ${VALUE_TO_RANK[kicker]}`,
    };
  }

  // 8. One Pair (Pareja)
  if (groups[0][1] === 2) {
    const pairVal = groups[0][0];
    const kickers = [groups[1][0], groups[2][0], groups[3][0]].sort((a, b) => b - a);
    return {
      category: 'one_pair',
      tier: CATEGORY_TIER.one_pair,
      score: [CATEGORY_TIER.one_pair, pairVal, ...kickers],
      cards: sorted,
      description: `Pareja de ${RANK_NAMES_ES[pairVal].plural} con kicker ${VALUE_TO_RANK[kickers[0]]}`,
    };
  }

  // 9. High Card (Carta Alta)
  return {
    category: 'high_card',
    tier: CATEGORY_TIER.high_card,
    score: [CATEGORY_TIER.high_card, ...values],
    cards: sorted,
    description: `Carta Alta ${sorted[0].rank} con kickers ${sorted.slice(1).map((c) => c.rank).join(', ')}`,
  };
}

// Compare two 5-card hands: returns > 0 if A wins, < 0 if B wins, 0 if tie
export function compare5CardHands(a: Evaluated5CardHand, b: Evaluated5CardHand): number {
  const len = Math.max(a.score.length, b.score.length);
  for (let i = 0; i < len; i++) {
    const valA = a.score[i] || 0;
    const valB = b.score[i] || 0;
    if (valA !== valB) {
      return valA - valB;
    }
  }
  return 0;
}

// Evaluate the best 5-card hand out of 5, 6, or 7 cards
export function evaluateBestHand(availableCards: Card[]): HandEvaluation {
  if (availableCards.length < 5) {
    throw new Error(`Se requieren al menos 5 cartas para evaluar, recibidas: ${availableCards.length}`);
  }

  if (availableCards.length === 5) {
    const res = evaluate5Cards(availableCards);
    return {
      category: res.category,
      categoryName: CATEGORY_NAMES_ES[res.category],
      rankValue: res.score[0] * 1000000 + (res.score[1] || 0) * 10000 + (res.score[2] || 0) * 100 + (res.score[3] || 0),
      cards: res.cards,
      description: res.description,
    };
  }

  const all5Combos = combinations(availableCards, 5);
  let best = evaluate5Cards(all5Combos[0]);

  for (let i = 1; i < all5Combos.length; i++) {
    const current = evaluate5Cards(all5Combos[i]);
    if (compare5CardHands(current, best) > 0) {
      best = current;
    }
  }

  return {
    category: best.category,
    categoryName: CATEGORY_NAMES_ES[best.category],
    rankValue: best.score[0] * 1000000 + (best.score[1] || 0) * 10000 + (best.score[2] || 0) * 100 + (best.score[3] || 0),
    cards: best.cards,
    description: best.description,
  };
}

// Compares multiple players' hands and returns the indices of the winner(s)
export function determineShowdownWinners(
  players: { id: string; cards: Card[] }[],
  communityCards: Card[]
): {
  winnerIds: string[];
  evaluations: Map<string, HandEvaluation>;
  isTie: boolean;
  explanation: string;
} {
  const evaluations = new Map<string, HandEvaluation>();
  const evaluatedList: { id: string; eval5: Evaluated5CardHand; fullEval: HandEvaluation }[] = [];

  for (const p of players) {
    const allCards = [...p.cards, ...communityCards];
    const combos = combinations(allCards, 5);
    let best = evaluate5Cards(combos[0]);
    for (let i = 1; i < combos.length; i++) {
      const cur = evaluate5Cards(combos[i]);
      if (compare5CardHands(cur, best) > 0) {
        best = cur;
      }
    }
    const fullEval: HandEvaluation = {
      category: best.category,
      categoryName: CATEGORY_NAMES_ES[best.category],
      rankValue: best.score[0] * 1000000 + (best.score[1] || 0) * 10000 + (best.score[2] || 0) * 100 + (best.score[3] || 0),
      cards: best.cards,
      description: best.description,
    };
    evaluations.set(p.id, fullEval);
    evaluatedList.push({ id: p.id, eval5: best, fullEval });
  }

  // Find the top hand(s)
  evaluatedList.sort((a, b) => compare5CardHands(b.eval5, a.eval5));
  const topHand = evaluatedList[0].eval5;
  const winners = evaluatedList.filter((item) => compare5CardHands(item.eval5, topHand) === 0);
  const winnerIds = winners.map((w) => w.id);
  const isTie = winnerIds.length > 1;

  let explanation = '';
  if (isTie) {
    explanation = `Empate entre ${winnerIds.length} jugadores con ${topHand.description}. El bote se reparte equitativamente.`;
  } else {
    const winner = evaluatedList[0];
    const runnerUp = evaluatedList[1];
    if (runnerUp) {
      if (winner.eval5.tier > runnerUp.eval5.tier) {
        explanation = `Gana con ${winner.eval5.description} superando a ${runnerUp.eval5.description}.`;
      } else {
        explanation = `Ambos tienen ${CATEGORY_NAMES_ES[winner.eval5.category]}, pero el desempate se decide por: ${winner.eval5.description} frente a ${runnerUp.eval5.description}.`;
      }
    } else {
      explanation = `Gana con ${winner.eval5.description}.`;
    }
  }

  return {
    winnerIds,
    evaluations,
    isTie,
    explanation,
  };
}
