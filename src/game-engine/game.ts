import {
  BettingRound,
  Card,
  GameSettings,
  HandEvaluation,
  Player,
  PlayerAction,
  PlayerActionType,
} from '../types/poker';
import { Deck } from './deck';
import { determineShowdownWinners, evaluateBestHand } from './evaluator';

export interface Pot {
  amount: number;
  eligiblePlayerIds: string[];
}

export interface TableState {
  id: string;
  round: BettingRound;
  communityCards: Card[];
  players: Player[];
  pots: Pot[];
  totalPot: number;
  dealerIndex: number;
  smallBlindIndex: number;
  bigBlindIndex: number;
  currentTurnIndex: number;
  currentHighestBet: number;
  minRaiseAmount: number;
  settings: GameSettings;
  handNumber: number;
  isHandActive: boolean;
  historyLog: string[];
  winners?: {
    id: string;
    name: string;
    amountWon: number;
    handDescription: string;
    cards: Card[];
  }[];
  showdownExplanation?: string;
}

export class TexasHoldemEngine {
  public state: TableState;
  private deck: Deck;
  private playersWhoActedInRound: Set<string>;

  constructor(settings: GameSettings, playerConfigs: { id: string; name: string; isBot: boolean; avatar?: string }[]) {
    this.deck = new Deck();
    this.playersWhoActedInRound = new Set();

    const players: Player[] = playerConfigs.map((p, idx) => ({
      id: p.id,
      name: p.name,
      avatar: p.avatar || (p.isBot ? '🤖' : '🤠'),
      chips: settings.startingChips,
      currentBet: 0,
      cards: [],
      folded: false,
      isAllIn: false,
      isBot: p.isBot,
      botDifficulty: p.isBot ? settings.difficulty : undefined,
    }));

    this.state = {
      id: 'table_' + Date.now(),
      round: 'ended',
      communityCards: [],
      players,
      pots: [{ amount: 0, eligiblePlayerIds: players.map((p) => p.id) }],
      totalPot: 0,
      dealerIndex: 0,
      smallBlindIndex: 1,
      bigBlindIndex: players.length > 2 ? 2 : 0,
      currentTurnIndex: 0,
      currentHighestBet: 0,
      minRaiseAmount: settings.bigBlind,
      settings,
      handNumber: 0,
      isHandActive: false,
      historyLog: ['Mesa de Texas Hold\'em preparada. Presiona Iniciar Mano.'],
    };
  }

  // Starts a brand new hand
  startNewHand(): void {
    const activePlayers = this.state.players.filter((p) => p.chips > 0);
    if (activePlayers.length < 2) {
      this.state.historyLog.push('No hay suficientes jugadores con fichas para continuar.');
      return;
    }

    this.state.handNumber += 1;
    this.state.isHandActive = true;
    this.state.round = 'preflop';
    this.state.communityCards = [];
    this.state.winners = undefined;
    this.state.showdownExplanation = undefined;
    this.playersWhoActedInRound.clear();

    // Reset player state for new hand
    for (const p of this.state.players) {
      p.cards = [];
      p.currentBet = 0;
      p.folded = p.chips <= 0;
      p.isAllIn = false;
      p.lastAction = undefined;
    }

    // Rotate dealer button
    if (this.state.handNumber > 1) {
      this.state.dealerIndex = this.findNextActiveIndex(this.state.dealerIndex);
    }

    // Set blinds positions
    const numPlayers = this.state.players.length;
    if (numPlayers === 2) {
      // Heads-up: Dealer posts Small Blind and acts first preflop
      this.state.smallBlindIndex = this.state.dealerIndex;
      this.state.bigBlindIndex = this.findNextActiveIndex(this.state.dealerIndex);
    } else {
      this.state.smallBlindIndex = this.findNextActiveIndex(this.state.dealerIndex);
      this.state.bigBlindIndex = this.findNextActiveIndex(this.state.smallBlindIndex);
    }

    // Assign position names for UI
    this.assignPositionNames();

    // Fresh deck and deal 2 cards to each active player
    this.deck.reset();
    this.deck.shuffle();

    for (let i = 0; i < 2; i++) {
      for (const p of this.state.players) {
        if (!p.folded) {
          p.cards.push(...this.deck.draw(1));
        }
      }
    }

    // Post Small Blind and Big Blind
    this.postBlind(this.state.smallBlindIndex, this.state.settings.smallBlind, 'Small Blind');
    this.postBlind(this.state.bigBlindIndex, this.state.settings.bigBlind, 'Big Blind');

    this.state.currentHighestBet = this.state.settings.bigBlind;
    this.state.minRaiseAmount = this.state.settings.bigBlind;

    // First player to act preflop: Under The Gun (UTG), which is after Big Blind
    this.state.currentTurnIndex = this.findNextActiveIndex(this.state.bigBlindIndex);

    this.state.historyLog.push(
      `--- Mano #${this.state.handNumber} iniciada. Ciegas: ${this.state.settings.smallBlind}/${this.state.settings.bigBlind} ---`
    );
  }

  private assignPositionNames(): void {
    const active = this.state.players.filter((p) => p.chips > 0 || !p.folded);
    const n = active.length;

    for (const p of this.state.players) {
      const idx = this.state.players.indexOf(p);
      if (idx === this.state.dealerIndex) {
        p.positionName = 'BTN';
      } else if (idx === this.state.smallBlindIndex) {
        p.positionName = 'SB';
      } else if (idx === this.state.bigBlindIndex) {
        p.positionName = 'BB';
      } else {
        p.positionName = `J${idx + 1}`;
      }
    }
  }

  private postBlind(playerIndex: number, blindAmount: number, label: string): void {
    const player = this.state.players[playerIndex];
    const actual = Math.min(player.chips, blindAmount);
    player.chips -= actual;
    player.currentBet = actual;
    if (player.chips === 0) {
      player.isAllIn = true;
    }
    player.lastAction = { type: 'bet', amount: actual, timestamp: Date.now() };
    this.updatePots();
    this.state.historyLog.push(`${player.name} pone ${label} de ${actual} fichas.`);
  }

  // Returns legal actions for current player with constraints
  getLegalActions(playerId: string): {
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
  } {
    const player = this.state.players.find((p) => p.id === playerId);
    if (!player || player.folded || player.isAllIn || !this.state.isHandActive) {
      return {
        canFold: false,
        canCheck: false,
        canCall: false,
        callAmount: 0,
        canBet: false,
        minBet: 0,
        canRaise: false,
        minRaise: 0,
        maxRaise: 0,
        canAllIn: false,
        allInAmount: 0,
      };
    }

    const currentToCall = this.state.currentHighestBet - player.currentBet;
    const canCheck = currentToCall === 0;
    const canCall = currentToCall > 0 && player.chips > 0;
    const callAmount = Math.min(player.chips, currentToCall);

    const canBet = this.state.currentHighestBet === 0 && player.chips >= this.state.settings.bigBlind;
    const minBet = Math.min(player.chips, this.state.settings.bigBlind);

    const canRaise =
      this.state.currentHighestBet > 0 && player.chips > currentToCall + this.state.minRaiseAmount;
    const minRaise = this.state.currentHighestBet + this.state.minRaiseAmount;
    const maxRaise = player.chips + player.currentBet;

    const canAllIn = player.chips > 0;
    const allInAmount = player.chips + player.currentBet;

    return {
      canFold: true,
      canCheck,
      canCall,
      callAmount,
      canBet,
      minBet,
      canRaise,
      minRaise,
      maxRaise,
      canAllIn,
      allInAmount,
    };
  }

  // Executes player action with strict validation
  executeAction(playerId: string, actionType: PlayerActionType, raiseTotalAmount?: number): void {
    const currentPlayer = this.state.players[this.state.currentTurnIndex];
    if (!currentPlayer || currentPlayer.id !== playerId) {
      throw new Error('No es el turno de este jugador para actuar.');
    }

    const legal = this.getLegalActions(playerId);

    switch (actionType) {
      case 'fold': {
        currentPlayer.folded = true;
        currentPlayer.lastAction = { type: 'fold', timestamp: Date.now() };
        this.state.historyLog.push(`${currentPlayer.name} se retira (FOLD).`);
        break;
      }

      case 'check': {
        if (!legal.canCheck) {
          throw new Error(
            `No puedes hacer CHECK porque hay una apuesta pendiente de ${
              this.state.currentHighestBet - currentPlayer.currentBet
            } fichas.`
          );
        }
        currentPlayer.lastAction = { type: 'check', timestamp: Date.now() };
        this.state.historyLog.push(`${currentPlayer.name} pasa (CHECK).`);
        break;
      }

      case 'call': {
        if (!legal.canCall) {
          throw new Error('No hay ninguna apuesta pendiente para igualar (CALL).');
        }
        const toPay = legal.callAmount;
        currentPlayer.chips -= toPay;
        currentPlayer.currentBet += toPay;
        if (currentPlayer.chips === 0) {
          currentPlayer.isAllIn = true;
        }
        currentPlayer.lastAction = { type: 'call', amount: toPay, timestamp: Date.now() };
        this.state.historyLog.push(
          `${currentPlayer.name} iguala con ${toPay} fichas (CALL)${currentPlayer.isAllIn ? ' [ALL-IN]' : ''}.`
        );
        break;
      }

      case 'bet': {
        const betAmount = raiseTotalAmount || legal.minBet;
        if (this.state.currentHighestBet > 0) {
          throw new Error('Ya existe una apuesta en la mesa. Debes hacer CALL o RAISE.');
        }
        if (betAmount > currentPlayer.chips) {
          throw new Error('No tienes suficientes fichas para apostar esa cantidad.');
        }
        currentPlayer.chips -= betAmount;
        currentPlayer.currentBet = betAmount;
        this.state.currentHighestBet = betAmount;
        this.state.minRaiseAmount = betAmount;
        if (currentPlayer.chips === 0) {
          currentPlayer.isAllIn = true;
        }
        currentPlayer.lastAction = { type: 'bet', amount: betAmount, timestamp: Date.now() };
        this.state.historyLog.push(
          `${currentPlayer.name} apuesta ${betAmount} fichas (BET)${currentPlayer.isAllIn ? ' [ALL-IN]' : ''}.`
        );
        break;
      }

      case 'raise': {
        const totalAmount = raiseTotalAmount || legal.minRaise;
        const addAmount = totalAmount - currentPlayer.currentBet;
        if (addAmount > currentPlayer.chips) {
          throw new Error('No tienes suficientes fichas para subir esa cantidad.');
        }
        const raiseDifference = totalAmount - this.state.currentHighestBet;
        if (raiseDifference < this.state.minRaiseAmount && addAmount < currentPlayer.chips) {
          throw new Error(`La subida mínima permitida es de ${this.state.minRaiseAmount} fichas.`);
        }
        currentPlayer.chips -= addAmount;
        currentPlayer.currentBet = totalAmount;
        this.state.minRaiseAmount = Math.max(this.state.minRaiseAmount, raiseDifference);
        this.state.currentHighestBet = totalAmount;
        if (currentPlayer.chips === 0) {
          currentPlayer.isAllIn = true;
        }
        currentPlayer.lastAction = { type: 'raise', amount: totalAmount, timestamp: Date.now() };
        this.state.historyLog.push(
          `${currentPlayer.name} sube la apuesta a ${totalAmount} fichas (RAISE)${
            currentPlayer.isAllIn ? ' [ALL-IN]' : ''
          }.`
        );
        break;
      }

      case 'all-in': {
        const allInTotal = currentPlayer.chips + currentPlayer.currentBet;
        const addAmount = currentPlayer.chips;
        currentPlayer.chips = 0;
        currentPlayer.isAllIn = true;
        currentPlayer.currentBet = allInTotal;

        if (allInTotal > this.state.currentHighestBet) {
          const raiseDiff = allInTotal - this.state.currentHighestBet;
          if (raiseDiff >= this.state.minRaiseAmount) {
            this.state.minRaiseAmount = raiseDiff;
          }
          this.state.currentHighestBet = allInTotal;
        }

        currentPlayer.lastAction = { type: 'all-in', amount: allInTotal, timestamp: Date.now() };
        this.state.historyLog.push(`${currentPlayer.name} mete todo al centro: ${allInTotal} fichas (ALL-IN).`);
        break;
      }
    }

    this.playersWhoActedInRound.add(playerId);
    this.updatePots();

    // Check if hand ends immediately (only 1 non-folded player remaining)
    const activePlayers = this.state.players.filter((p) => !p.folded);
    if (activePlayers.length === 1) {
      this.handleEarlyWin(activePlayers[0]);
      return;
    }

    // Check if betting round is complete
    if (this.isBettingRoundComplete()) {
      this.advanceToNextRound();
    } else {
      this.state.currentTurnIndex = this.findNextActiveIndex(this.state.currentTurnIndex);
    }
  }

  // Determines if all active players have settled the current highest bet
  private isBettingRoundComplete(): boolean {
    const playersInHand = this.state.players.filter((p) => !p.folded);
    // If all but at most one player are all-in, round is complete
    const playersAbleToAct = playersInHand.filter((p) => !p.isAllIn);
    if (playersAbleToAct.length <= 1) {
      // Still verify if the active player has matched current highest bet
      if (playersAbleToAct.length === 1) {
        const p = playersAbleToAct[0];
        if (p.currentBet < this.state.currentHighestBet && p.chips > 0) {
          return false;
        }
      }
      return true;
    }

    // Every player able to act must have acted and matched current highest bet
    for (const p of playersAbleToAct) {
      if (!this.playersWhoActedInRound.has(p.id)) return false;
      if (p.currentBet !== this.state.currentHighestBet) return false;
    }

    return true;
  }

  // Advances game to next street (Flop, Turn, River, Showdown)
  private advanceToNextRound(): void {
    // Reset round bets into pots
    this.updatePots();
    for (const p of this.state.players) {
      p.currentBet = 0;
      if (p.lastAction && p.lastAction.type !== 'fold' && !p.isAllIn) {
        p.lastAction = undefined;
      }
    }
    this.state.currentHighestBet = 0;
    this.state.minRaiseAmount = this.state.settings.bigBlind;
    this.playersWhoActedInRound.clear();

    // Deal next community cards
    switch (this.state.round) {
      case 'preflop': {
        this.state.round = 'flop';
        this.deck.draw(1); // Burn card
        this.state.communityCards.push(...this.deck.draw(3));
        this.state.historyLog.push(`--- Flop: ${this.state.communityCards.map((c) => c.rank + c.suit[0].toUpperCase()).join(' ')} ---`);
        break;
      }
      case 'flop': {
        this.state.round = 'turn';
        this.deck.draw(1); // Burn card
        this.state.communityCards.push(...this.deck.draw(1));
        this.state.historyLog.push(`--- Turn: ${this.state.communityCards[3].rank + this.state.communityCards[3].suit[0].toUpperCase()} ---`);
        break;
      }
      case 'turn': {
        this.state.round = 'river';
        this.deck.draw(1); // Burn card
        this.state.communityCards.push(...this.deck.draw(1));
        this.state.historyLog.push(`--- River: ${this.state.communityCards[4].rank + this.state.communityCards[4].suit[0].toUpperCase()} ---`);
        break;
      }
      case 'river': {
        this.handleShowdown();
        return;
      }
    }

    // Check if remaining players are all-in (auto run-out)
    const playersAbleToAct = this.state.players.filter((p) => !p.folded && !p.isAllIn);
    if (playersAbleToAct.length <= 1) {
      // Auto advance to showdown
      this.advanceToNextRound();
      return;
    }

    // First player to act postflop is first active player to the left of the dealer
    this.state.currentTurnIndex = this.findNextActiveIndex(this.state.dealerIndex);
  }

  // Calculates exact side pots for any number of all-ins
  private updatePots(): void {
    const bets = this.state.players.map((p) => ({
      id: p.id,
      bet: p.currentBet,
      folded: p.folded,
    })).filter((b) => b.bet > 0);

    const totalCurrentBets = this.state.players.reduce((sum, p) => sum + p.currentBet, 0);
    this.state.totalPot = totalCurrentBets;
  }

  // When all opponents fold, the remaining player takes the pot
  private handleEarlyWin(winner: Player): void {
    this.state.round = 'ended';
    this.state.isHandActive = false;
    const potWon = this.state.totalPot;
    winner.chips += potWon;

    this.state.winners = [
      {
        id: winner.id,
        name: winner.name,
        amountWon: potWon,
        handDescription: 'Todos los rivales se retiraron',
        cards: winner.cards,
      },
    ];
    this.state.showdownExplanation = `${winner.name} gana el bote de ${potWon} fichas porque todos los rivales se retiraron.`;
    this.state.historyLog.push(`🏆 ${this.state.showdownExplanation}`);
  }

  // Evaluates hands at showdown with deterministic evaluator
  private handleShowdown(): void {
    this.state.round = 'showdown';
    this.state.isHandActive = false;

    const contenders = this.state.players.filter((p) => !p.folded);
    const showdown = determineShowdownWinners(contenders, this.state.communityCards);

    const totalPot = this.state.totalPot;
    const splitAmount = Math.floor(totalPot / showdown.winnerIds.length);
    const remainder = totalPot % showdown.winnerIds.length;

    this.state.winners = [];

    showdown.winnerIds.forEach((wid, idx) => {
      const player = this.state.players.find((p) => p.id === wid)!;
      const extra = idx === 0 ? remainder : 0;
      const amountWon = splitAmount + extra;
      player.chips += amountWon;

      const evalHand = showdown.evaluations.get(wid)!;
      this.state.winners!.push({
        id: player.id,
        name: player.name,
        amountWon,
        handDescription: evalHand.description,
        cards: evalHand.cards,
      });
    });

    this.state.showdownExplanation = showdown.explanation;
    this.state.historyLog.push(`🏆 SHOWDOWN: ${showdown.explanation}`);
  }

  private findNextActiveIndex(fromIndex: number): number {
    const total = this.state.players.length;
    let next = (fromIndex + 1) % total;
    let loops = 0;
    while (loops < total) {
      const p = this.state.players[next];
      if (!p.folded && p.chips > 0) {
        return next;
      }
      next = (next + 1) % total;
      loops++;
    }
    return fromIndex;
  }
}
