import { HandCategory, Rank, Suit } from '../types/poker';

export const SUITS: { id: Suit; name: string; symbol: string; color: string }[] = [
  { id: 'spades', name: 'Picas', symbol: '♠', color: 'text-zinc-100' },
  { id: 'hearts', name: 'Corazones', symbol: '♥', color: 'text-rose-500' },
  { id: 'diamonds', name: 'Diamantes', symbol: '♦', color: 'text-blue-400' },
  { id: 'clubs', name: 'Tréboles', symbol: '♣', color: 'text-emerald-400' },
];

export const RANKS: { id: Rank; value: number; label: string }[] = [
  { id: '2', value: 2, label: '2' },
  { id: '3', value: 3, label: '3' },
  { id: '4', value: 4, label: '4' },
  { id: '5', value: 5, label: '5' },
  { id: '6', value: 6, label: '6' },
  { id: '7', value: 7, label: '7' },
  { id: '8', value: 8, label: '8' },
  { id: '9', value: 9, label: '9' },
  { id: '10', value: 10, label: '10' },
  { id: 'J', value: 11, label: 'J' },
  { id: 'Q', value: 12, label: 'Q' },
  { id: 'K', value: 13, label: 'K' },
  { id: 'A', value: 14, label: 'A' },
];

export const HAND_RANKINGS: {
  category: HandCategory;
  name: string;
  level: number;
  description: string;
  example: string;
}[] = [
  {
    category: 'royal_flush',
    name: 'Escalera Real',
    level: 10,
    description: 'A, K, Q, J, 10 todas del mismo palo. Es la mano invencible.',
    example: 'A♠ K♠ Q♠ J♠ 10♠',
  },
  {
    category: 'straight_flush',
    name: 'Escalera de Color',
    level: 9,
    description: 'Cinco cartas en orden numérico consecutivo del mismo palo.',
    example: '9♥ 8♥ 7♥ 6♥ 5♥',
  },
  {
    category: 'four_of_a_kind',
    name: 'Póker',
    level: 8,
    description: 'Cuatro cartas del mismo valor numérico.',
    example: 'K♠ K♥ K♦ K♣ 4♦',
  },
  {
    category: 'full_house',
    name: 'Full House',
    level: 7,
    description: 'Un trío más una pareja combinados.',
    example: 'J♠ J♥ J♦ 8♣ 8♦',
  },
  {
    category: 'flush',
    name: 'Color',
    level: 6,
    description: 'Cinco cartas cualesquiera del mismo palo, no consecutivas.',
    example: 'A♦ 10♦ 7♦ 6♦ 2♦',
  },
  {
    category: 'straight',
    name: 'Escalera',
    level: 5,
    description: 'Cinco cartas consecutivas de diferentes palos.',
    example: '8♠ 7♦ 6♥ 5♣ 4♠',
  },
  {
    category: 'three_of_a_kind',
    name: 'Trío',
    level: 4,
    description: 'Tres cartas del mismo valor numérico.',
    example: 'Q♠ Q♦ Q♣ 9♥ 2♠',
  },
  {
    category: 'two_pair',
    name: 'Doble Pareja',
    level: 3,
    description: 'Dos parejas distintas de cartas con igual valor.',
    example: '10♠ 10♦ 4♥ 4♣ A♠',
  },
  {
    category: 'one_pair',
    name: 'Pareja',
    level: 2,
    description: 'Dos cartas con el mismo valor numérico.',
    example: 'A♠ A♥ 9♦ 6♣ 3♠',
  },
  {
    category: 'high_card',
    name: 'Carta Alta',
    level: 1,
    description: 'Ninguna combinación formada; gana quien tenga la carta de mayor valor.',
    example: 'A♠ K♦ 10♣ 7♥ 3♦',
  },
];

export const TUTORIAL_LESSONS_META = [
  { id: '1', title: '¿Qué es Texas Hold\'em?', category: 'Fundamentos' },
  { id: '2', title: 'Las cartas privadas (Hole Cards)', category: 'Fundamentos' },
  { id: '3', title: 'Las cartas comunitarias (Board)', category: 'Fundamentos' },
  { id: '4', title: 'Fase 1: Preflop', category: 'Rondas' },
  { id: '5', title: 'Fase 2: El Flop', category: 'Rondas' },
  { id: '6', title: 'Fase 3: El Turn', category: 'Rondas' },
  { id: '7', title: 'Fase 4: El River', category: 'Rondas' },
  { id: '8', title: 'Acción: Pasar (Check)', category: 'Acciones' },
  { id: '9', title: 'Acción: Apostar (Bet)', category: 'Acciones' },
  { id: '10', title: 'Acción: Igualar (Call)', category: 'Acciones' },
  { id: '11', title: 'Acción: Subir (Raise)', category: 'Acciones' },
  { id: '12', title: 'Acción: Retirarse (Fold)', category: 'Acciones' },
  { id: '13', title: 'Acción: Todo dentro (All-in)', category: 'Acciones' },
  { id: '14', title: 'El Bote (Pot) y fichas', category: 'Estructura' },
  { id: '15', title: 'Las Ciegas (Small & Big Blind)', category: 'Estructura' },
  { id: '16', title: 'Cómo se determina el ganador', category: 'Reglas' },
  { id: '17', title: 'Ranking de manos oficial', category: 'Reglas' },
];
