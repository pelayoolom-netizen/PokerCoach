import { Card, Rank, Suit } from '../types/poker';

export const ALL_SUITS: Suit[] = ['spades', 'hearts', 'diamonds', 'clubs'];
export const ALL_RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

export class Deck {
  private cards: Card[] = [];

  constructor() {
    this.reset();
  }

  reset(): void {
    this.cards = [];
    for (const suit of ALL_SUITS) {
      for (const rank of ALL_RANKS) {
        this.cards.push({ rank, suit });
      }
    }
  }

  // Cryptographically / statistically unbiased Fisher-Yates shuffle
  shuffle(): void {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = this.cards[i];
      this.cards[i] = this.cards[j];
      this.cards[j] = temp;
    }
  }

  draw(count: number = 1): Card[] {
    if (this.cards.length < count) {
      throw new Error(`No quedan suficientes cartas en la baraja. Solicitadas: ${count}, disponibles: ${this.cards.length}`);
    }
    return this.cards.splice(0, count);
  }

  remainingCount(): number {
    return this.cards.length;
  }
}
