import { Card, GameSettings } from '../types/poker';
import { evaluate5Cards, evaluateBestHand, determineShowdownWinners } from './evaluator';
import { TexasHoldemEngine } from './game';

export function runPokerEngineTests(): { total: number; passed: number; failures: string[] } {
  let passed = 0;
  let total = 0;
  const failures: string[] = [];

  function assert(condition: boolean, testName: string) {
    total++;
    if (condition) {
      passed++;
    } else {
      failures.push(testName);
      console.error(`❌ Falló: ${testName}`);
    }
  }

  // 1. Royal Flush
  {
    const cards: Card[] = [
      { rank: 'A', suit: 'spades' },
      { rank: 'K', suit: 'spades' },
      { rank: 'Q', suit: 'spades' },
      { rank: 'J', suit: 'spades' },
      { rank: '10', suit: 'spades' },
    ];
    const res = evaluate5Cards(cards);
    assert(res.category === 'royal_flush', 'Test 1: Detecta Escalera Real correctamente');
  }

  // 2. Straight Flush vs Four of a Kind
  {
    const sf: Card[] = [
      { rank: '9', suit: 'hearts' },
      { rank: '8', suit: 'hearts' },
      { rank: '7', suit: 'hearts' },
      { rank: '6', suit: 'hearts' },
      { rank: '5', suit: 'hearts' },
    ];
    const quads: Card[] = [
      { rank: 'A', suit: 'spades' },
      { rank: 'A', suit: 'hearts' },
      { rank: 'A', suit: 'diamonds' },
      { rank: 'A', suit: 'clubs' },
      { rank: 'K', suit: 'spades' },
    ];
    const evalSf = evaluate5Cards(sf);
    const evalQuads = evaluate5Cards(quads);
    assert(evalSf.tier > evalQuads.tier, 'Test 2: Escalera de Color supera a Póker');
  }

  // 3. Four of a Kind vs Full House
  {
    const quads: Card[] = [
      { rank: '10', suit: 'spades' },
      { rank: '10', suit: 'hearts' },
      { rank: '10', suit: 'diamonds' },
      { rank: '10', suit: 'clubs' },
      { rank: '2', suit: 'spades' },
    ];
    const full: Card[] = [
      { rank: 'A', suit: 'spades' },
      { rank: 'A', suit: 'hearts' },
      { rank: 'A', suit: 'diamonds' },
      { rank: 'K', suit: 'clubs' },
      { rank: 'K', suit: 'spades' },
    ];
    const evalQuads = evaluate5Cards(quads);
    const evalFull = evaluate5Cards(full);
    assert(evalQuads.tier > evalFull.tier, 'Test 3: Póker supera a Full House');
  }

  // 4. Flush vs Straight
  {
    const flush: Card[] = [
      { rank: 'A', suit: 'diamonds' },
      { rank: 'J', suit: 'diamonds' },
      { rank: '8', suit: 'diamonds' },
      { rank: '4', suit: 'diamonds' },
      { rank: '2', suit: 'diamonds' },
    ];
    const straight: Card[] = [
      { rank: 'K', suit: 'spades' },
      { rank: 'Q', suit: 'hearts' },
      { rank: 'J', suit: 'diamonds' },
      { rank: '10', suit: 'clubs' },
      { rank: '9', suit: 'spades' },
    ];
    const evalFlush = evaluate5Cards(flush);
    const evalStraight = evaluate5Cards(straight);
    assert(evalFlush.tier > evalStraight.tier, 'Test 4: Color supera a Escalera');
  }

  // 5. Ace-Low Straight (Wheel: A-2-3-4-5)
  {
    const wheel: Card[] = [
      { rank: 'A', suit: 'spades' },
      { rank: '2', suit: 'hearts' },
      { rank: '3', suit: 'diamonds' },
      { rank: '4', suit: 'clubs' },
      { rank: '5', suit: 'spades' },
    ];
    const evalWheel = evaluate5Cards(wheel);
    assert(evalWheel.category === 'straight', 'Test 5: Escalera mínima A-2-3-4-5 (Wheel) detectada');
    assert(evalWheel.score[1] === 5, 'Test 5b: La carta alta del wheel es 5');
  }

  // 6. Kicker resolution: Pair of Aces with King kicker vs Pair of Aces with Queen kicker
  {
    const hero: Card[] = [
      { rank: 'A', suit: 'spades' },
      { rank: 'K', suit: 'spades' },
    ];
    const villain: Card[] = [
      { rank: 'A', suit: 'diamonds' },
      { rank: 'Q', suit: 'clubs' },
    ];
    const board: Card[] = [
      { rank: 'A', suit: 'hearts' },
      { rank: '7', suit: 'clubs' },
      { rank: '2', suit: 'diamonds' },
      { rank: '10', suit: 'spades' },
      { rank: '3', suit: 'hearts' },
    ];

    const showdown = determineShowdownWinners(
      [
        { id: 'hero', cards: hero },
        { id: 'villain', cards: villain },
      ],
      board
    );

    assert(showdown.winnerIds.length === 1 && showdown.winnerIds[0] === 'hero', 'Test 6: Desempate por Kicker Rey > Dama en pareja de Ases');
  }

  // 7. Split pot / Tie
  {
    const p1: Card[] = [
      { rank: '2', suit: 'spades' },
      { rank: '3', suit: 'hearts' },
    ];
    const p2: Card[] = [
      { rank: '2', suit: 'clubs' },
      { rank: '3', suit: 'diamonds' },
    ];
    // Board has a high straight that plays for both
    const board: Card[] = [
      { rank: '10', suit: 'spades' },
      { rank: 'J', suit: 'hearts' },
      { rank: 'Q', suit: 'diamonds' },
      { rank: 'K', suit: 'clubs' },
      { rank: 'A', suit: 'hearts' },
    ];
    const showdown = determineShowdownWinners(
      [
        { id: 'p1', cards: p1 },
        { id: 'p2', cards: p2 },
      ],
      board
    );
    assert(showdown.isTie && showdown.winnerIds.length === 2, 'Test 7: Empate con la mesa formando la mejor jugada (Split Pot)');
  }

  // 8. Seven Cards selection (Best 5 out of 7)
  {
    const sevenCards: Card[] = [
      { rank: 'A', suit: 'spades' },
      { rank: 'A', suit: 'hearts' },
      { rank: 'A', suit: 'diamonds' },
      { rank: 'K', suit: 'clubs' },
      { rank: 'K', suit: 'spades' },
      { rank: '2', suit: 'clubs' },
      { rank: '3', suit: 'diamonds' },
    ];
    const best = evaluateBestHand(sevenCards);
    assert(best.category === 'full_house', 'Test 8: Selecciona Full House de 7 cartas');
  }

  // 9. Texas Hold'em Game Engine turn and state transitions
  {
    const settings: GameSettings = {
      startingChips: 1000,
      smallBlind: 10,
      bigBlind: 20,
      playerCount: 2,
      difficulty: 'beginner',
    };
    const engine = new TexasHoldemEngine(settings, [
      { id: 'p1', name: 'Hero', isBot: false },
      { id: 'p2', name: 'Bot1', isBot: true },
    ]);

    engine.startNewHand();
    assert(engine.state.isHandActive, 'Test 9a: Mano activa tras startNewHand');
    assert(engine.state.round === 'preflop', 'Test 9b: Inicia en preflop');
    assert(engine.state.totalPot === 30, 'Test 9c: Bote preflop incluye ciegas (10+20=30)');

    // Out of turn execution must throw error
    let threwOutOfTurn = false;
    const currentTurnPlayer = engine.state.players[engine.state.currentTurnIndex];
    const waitingPlayer = engine.state.players.find((p) => p.id !== currentTurnPlayer.id)!;
    try {
      engine.executeAction(waitingPlayer.id, 'check');
    } catch {
      threwOutOfTurn = true;
    }
    assert(threwOutOfTurn, 'Test 9d: Acción fuera de turno lanza excepción correctamente');

    // First player calls BB
    engine.executeAction(currentTurnPlayer.id, 'call');
    // Second player checks BB
    engine.executeAction(waitingPlayer.id, 'check');

    assert(engine.state.round === 'flop', 'Test 9e: Transición exitosa de preflop a flop');
    assert(engine.state.communityCards.length === 3, 'Test 9f: El flop reparte exactamente 3 cartas');
  }

  return { total, passed, failures };
}
