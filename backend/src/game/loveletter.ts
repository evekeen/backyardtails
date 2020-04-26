import * as _ from 'lodash';

export type GameId = string;
export type PlayerId = string

export interface Player {
  id: string;
  hand: Hand;
  discardPile: Card[];
  score: number;
  alive: boolean;
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

export function getStrength(card: string | undefined): number {
  return (card && card in strength) ? strength[card] : -1;
}

export function getCount(card: string): number {
  return counts[card];
}

export interface Hand {
  card?: Card;
  pendingCard?: Card;
  immune: boolean;
}

export interface Deck {
  size(): number;
  take(): Card
  init(): void;
}

class LoveLetterDeck implements Deck {
  private deck: Card[] = [];

  size(): number {
    return this.deck.length;
  }

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
  activePlayerIds: PlayerId[];
  deadPlayerIds: PlayerId[];
  activeTurnPlayerId: PlayerId | undefined;
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
  join(player: PlayerId): void;
  leave(player: PlayerId): void;
}

export class LoveLetterGameState {
  public players: Player[] = [];
  public idlePlayersIds: PlayerId[] = [];
  public deck: Deck = new LoveLetterDeck();
  public activePlayerIds: PlayerId[] = [];
  public deadPlayerIds: PlayerId[] = [];
  public activeTurnPlayerId: PlayerId | undefined;
  public winnerId: PlayerId | undefined;

  constructor(players: PlayerId[]) {
    players.forEach((p) => this.players.push(this.newPlayer(p)));
  }

  newPlayer(playerId: PlayerId): Player {
    return {
      id: playerId,
      hand: {
        card: undefined,
        pendingCard: undefined,
        immune: false
      },
      discardPile: [],
      score: 0,
      alive: true
    };
  }

  public addPlayer(player: PlayerId) {
    this.idlePlayersIds.push(player);
  }

  public removePlayer(player: PlayerId) {
    this.idlePlayersIds = _.remove(this.idlePlayersIds, id => id === player);
    this.players = _.remove(this.players, p => p.id === player);
    this.activePlayerIds = _.remove(this.activePlayerIds, id => id === player);
  }

  start(firstPlayerId: PlayerId) {
    for (const idleId of this.idlePlayersIds)
      this.players.push(this.newPlayer(idleId));
    this.idlePlayersIds = [];
    this.deck.init();
    this.activePlayerIds = this.players.map(p => p.id);
    this.players.forEach(player => {
      player.hand.card = this.deck.take();
      player.hand.immune = false;
      player.hand.pendingCard = undefined;
      player.discardPile = [];
    });
    this.deadPlayerIds = [];
    this.activeTurnPlayerId = firstPlayerId;
    this.winnerId = undefined;
  }

  nextTurn() {
    if (this.activePlayerIds.length == 1) {
      this.setWinner(this.activePlayerIds[0]);
    } else if (this.deck.size() == 0) {
      const playersLeft = this.activePlayerIds.map(id => this.getPlayer(id));
      const maxHeldCardStrength = playersLeft.map(p => getStrength(p.hand.card)).reduce((a, b) => Math.max(a, b));
      const byHandStrength = _.groupBy(playersLeft, player => {
        getStrength(player.hand.card);
      });

      const potentialWinners = byHandStrength[maxHeldCardStrength];
      if (potentialWinners.length == 1) {
        this.setWinner(potentialWinners[0].id);
      } else {
        const winnerId = _.maxBy(potentialWinners, p => p.discardPile.length)?.id
        winnerId && this.setWinner(winnerId); // TODO What if tied even here?
      }
    } else {
      const currentPlayerId = this.activeTurnPlayerId!; // should be initialized on start
      let currentPlayerIndex = _.findIndex(this.players, p => p.id == currentPlayerId);
      if (currentPlayerIndex < 0) {
        console.log("WTF!" + currentPlayerId + "is not found among players!");
        // TODO Restart?
      } else {
        let iterations = 0;
        do {
          currentPlayerIndex = (currentPlayerIndex + 1) % this.players.length;
          iterations++;
        } while (this.isDead(this.players[currentPlayerIndex].id) && iterations < this.players.length);

        if (iterations == this.players.length) {
          // TODO WTF?
        } else {
          const nextPlayer = this.players[currentPlayerIndex];
          this.activeTurnPlayerId = nextPlayer.id;
          nextPlayer.hand.pendingCard = this.deck.take();
        }
      }
    }
  }

  private setWinner(winnerId: PlayerId) {
    this.getPlayer(winnerId).score += 1;
    this.winnerId = winnerId;
  }

  private isDead(id: PlayerId): boolean {
    return id in this.deadPlayerIds;
  }

  getPlayer(id: PlayerId): Player {
    return _.find(this.players, p => p.id == id)!;
  }

  getPlayerIndex(id: PlayerId): number {
    return _.indexOf(this.players, id);
  }
}

export class LoveLetterGame implements Game<LoveLetterGameState> {
  public state = new LoveLetterGameState(this.players);
  private actions: GameAction<LoveLetterGameState>[] = [];
  private firstPlayerIdx = -1;

  constructor(private players: PlayerId[]) {
  }

  applyAction(action: GameAction<LoveLetterGameState>): ActionResult {
    if (action.player.id !== this.state.activeTurnPlayerId) {
      return {}; // TODO fail
    }

    this.actions.push(action);
    this.state = action.apply(this.state);
    this.state.nextTurn();

    return {
      newState: this.state
    }
  }

  join(player: PlayerId) {
    this.state.addPlayer(player)
  }

  leave(player: PlayerId) {
    this.state.removePlayer(player);
  }

  hasPlayer(player: PlayerId) {
    return player in this.players;
  }

  init() {
    this.firstPlayerIdx = (this.firstPlayerIdx + 1) % this.players.length;
    const firstPlayer = this.players[this.firstPlayerIdx];
    this.state.start(firstPlayer);
    console.log(JSON.stringify(this.state, null, "  "));
  }
}