import * as _ from 'lodash';

export interface Player {
  id: string;
  name: string;
  hand?: Hand;
}

/*
Guard	1   	5	 Player designates another player and names a type of card. If that player's hand matches the type of card specified, that player is eliminated from the round. However, Guard cannot be named as the type of card.
Priest	2 	2	Player is allowed to see another player's hand.
Baron	3	    2	Player will choose another player and privately compare hands. The player with the lower-strength hand is eliminated from the round.
Handmaid	4	2	Player cannot be affected by any other player's card until the next turn.
Prince	5	  2	Player can choose any player (including themselves) to discard their hand and draw a new one. If the discarded card is the Princess, the discarding player is eliminated.
King	6	    1	Player trades hands with any other player.
Countess 	7	1	If a player holds both this card and either the King or Prince card, this card must be played immediately.
Princess	8	1	If a player plays this card for any reason, they are eliminated from the round.
*/

export enum Card {
  GUARD = "Guard",
  PRIEST = "Priest",
  BARON = "Baron",
  HANDMAID = "Handmaid",
  PRINCE = "Prince",
  KING = "King",
  COUNTESS = "Countess",
  PRINCESS = "Princess"
}

const counts: {[key: string]: number} = {
   Guard: 5,
   Priest: 2,
   Baron: 2,
   Handmaid: 2,
   Prince: 2,
   King: 1,
   Countess: 1,
   Princess: 1,
}

const strength: {[key: string]: number} = {
  Guard: 1,
  Priest: 2,
  Baron: 3,
  Handmaid: 4,
  Prince: 5,
  King: 6,
  Countess: 7,
  Princess: 8,
}

export function getStrength(card: string): number {
  return card in strength ? strength[card] : -1;
}

export function getCount(card: string): number {
  return counts[card];
}

export class Hand {
  constructor(public card: Card, public immune: boolean) {
  }
}

export interface Deck {
  take(): Card
  init(): void;
}

class LoveLetterDeck implements Deck {
  private deck: Card[] = [];

  take(): Card {
    if (this.deck.length) {
      return this.deck.pop()!;
    }
    throw Error("Deck is empty. Cannot take cards.");
  }

  init(): void {
    const deck =_.flatMap(Object.values(Card), card => Array(getCount(card)).fill(card))
    const shuffled = _.shuffle(deck)
    if (shuffled.length > 0)
      shuffled.pop();
    this.deck = shuffled;
  }
}


interface GameState {
  activePlayers: Player[];
  deadPlayers: Player[];
  activeTurn: Player;
  discarded: Card[];
  deck: Deck;
}

interface GameAction<State> {
  player: Player

  apply(gameState: State): State;
}

export interface ActionResult {

}

export interface Game<State> {
  state: State

  init(): void;
  applyAction(action: GameAction<State>): ActionResult;
  join(player: Player): void;
  leave(player: Player): void;
}

export class LoveLetterGameState {
  private idlePlayers: Player[] = [];
  public deck: Deck = new LoveLetterDeck();
  public activePlayers: Player[] = [];
  public deadPlayers: Player[] = [];
  public activeTurn: Player | undefined;

  public addPlayer(player: Player) {
    this.idlePlayers.push(player);
  }

  public removePlayer(player: Player) {
    this.activePlayers = _.remove(this.activePlayers, p => p.id == player.id);
  }

  start() {
    for (const player of this.idlePlayers)
      this.activePlayers.push(player);

    this.idlePlayers = [];
    this.deck.init();
  }
}

export class LoveLetterGame implements Game<LoveLetterGameState> {
  public state = new LoveLetterGameState();
  private firstPlayer: Player | undefined;

  applyAction(action: GameAction<LoveLetterGameState>): ActionResult {
    if (action.player.id !== this.state.activeTurn!.id) {
      return {}; // TODO fail
    }

    this.state = action.apply(this.state);

    return {
      newState: this.state
    }
  }

  join(player: Player) {
    this.state.addPlayer(player)
  }

  leave(player: Player) {
    this.state.removePlayer(player);
  }

  init() {
    this.state.start();
  }
}