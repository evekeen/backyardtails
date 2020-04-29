import * as _ from 'lodash';
import {CardType} from './commonTypes';
import {CardAction} from '../protocol';

export type GameId = string;
export type PlayerId = string

export interface Player {
  id: string;
  index: number;
  hand: Hand;
  discardPile: CardType[];
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

const cards = [
  CardType.Guard, CardType.Guard, CardType.Guard, CardType.Guard, CardType.Guard,
  CardType.Priest, CardType.Priest,
  CardType.Baron, CardType.Baron,
  CardType.Handmaid, CardType.Handmaid,
  CardType.Prince, CardType.Prince,
  CardType.King,
  CardType.Countess,
  CardType.Princess
];

export function getCardIndex(card: CardType): number {
  return card - 1;
}

export interface Hand {
  card?: CardType;
  pendingCard?: CardType;
  immune: boolean;
}

export interface Deck {
  size(): number;
  take(): CardType
  init(): void;
}

class LoveLetterDeck implements Deck {
  private deck: CardType[] = [];

  size(): number {
    return this.deck.length;
  }

  take(): CardType {
    if (this.deck.length) {
      return this.deck.pop()!;
    }
    throw Error('Deck is empty. Cannot take cards.');
  }

  init(): void {
    const shuffled = _.shuffle(cards)
    if (shuffled.length > 0)
      shuffled.pop();
    this.deck = shuffled;
  }
}


interface GameState {
  activePlayerIds: PlayerId[];
  deadPlayerIds: PlayerId[];
  activeTurnPlayerId: PlayerId | undefined;
  discarded: CardType[];
  deck: Deck;
}

export interface GameAction<State> {
  playerId: PlayerId

  apply(gameState: State): Promise<ActionResult>;
}


// TODO Field for each card type? Union type?
export interface ActionResult {
  success: boolean;
  opponentCard?: CardType;
  opponentIndex?: number;
}

export interface Game<State> {
  state: State

  init(): void;
  applyAction(action: GameAction<State>): Promise<ActionResult>;
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
    players.forEach((p) => this.newPlayer(p));
  }

  newPlayer(playerId: PlayerId): Player {
    const playerIndex = this.players.length;
    const player = {
      id: playerId,
      index: playerIndex,
      hand: {
        card: undefined,
        pendingCard: undefined,
        immune: false
      },
      discardPile: [],
      score: 0,
      alive: true
    };
    this.players.push(player);
    return player;
  }

  public killPlayer(playerId: PlayerId) {
    const player = this.getPlayer(playerId);
    player.alive = false;
    this.deadPlayerIds.push(player.id);
    this.activePlayerIds = _.remove(this.activePlayerIds, (id) => id === playerId);
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
      this.newPlayer(idleId);

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
    const firstPlayer = this.getPlayer(firstPlayerId)
    firstPlayer.hand.pendingCard = this.deck.take();
    this.winnerId = undefined;
  }

  nextTurn() {
    if (this.activePlayerIds.length == 1) {
      this.setWinner(this.activePlayerIds[0]);
    } else if (this.deck.size() == 0) {
      const playersLeft = this.activePlayerIds.map(id => this.getPlayer(id));
      const maxHeldCardStrength = playersLeft.map(p => p.hand.card).reduce((a, b) => Math.max(a || 0, b || 0)) || 0;
      const byHandStrength = _.groupBy(playersLeft, player => player.hand.card);

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
        console.log('WTF!' + currentPlayerId + 'is not found among players!');
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
          nextPlayer.hand.immune = false;
        }
      }
    }
  }

  private setWinner(winnerId: PlayerId) {
    this.getPlayer(winnerId).score += 1;
    this.winnerId = winnerId;
  }

  private isDead(id: PlayerId): boolean {
    return !this.getPlayer(id).alive;
  }

  getPlayer(id: PlayerId): Player {
    return _.find(this.players, p => p.id == id)!;
  }

  getActivePlayer(): Player {
    return this.getPlayer(this.activeTurnPlayerId!);
  }
}

export class LoveLetterGame implements Game<LoveLetterGameState> {
  public state = new LoveLetterGameState(this.players);
  private actions: GameAction<LoveLetterGameState>[] = [];
  private firstPlayerIdx = -1;

  constructor(private players: PlayerId[]) {
  }

  applyAction(action: GameAction<LoveLetterGameState>): Promise<ActionResult> {
    if (action.playerId !== this.state.activeTurnPlayerId) {
      return Promise.reject();
    }

    const actionResult = action.apply(this.state)
    actionResult.then(() => {
      this.actions.push(action);
      this.state.nextTurn();
    });
    return actionResult;
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
    console.log(JSON.stringify(this.state, null, '  '));
  }

  getActionForCard(action: CardAction): (me: Player, target: Player, s: LoveLetterGameState) => ActionResult {
    return (me, target, state) => this.createResult(getActionResult(action, me, target, state), target);
  }

  private createResult(res: ActionResult, player: Player): ActionResult {
    return {
      ...res,
      opponentIndex: this.state.players.findIndex(p => p.id === player.id)
    };
  }
}

function getActionResult(action: CardAction, me: Player, target: Player, state: LoveLetterGameState): ActionResult {
  const playerCard = me.hand.card === action.payload.card ? me.hand.pendingCard!! : me.hand.card!!;
  switch (action.payload.card) {
  case CardType.Guard:
  {
    const success = target.hand.card === action.payload.guess;
    if (success) {
      state.killPlayer(target.id);
    }
    return {success};
  }
  case CardType.Priest:
    return {success: true, opponentCard: target.hand.card};
  case CardType.Baron:
  {
    const targetPlayerCard = target.hand.card!;
    const success = playerCard > targetPlayerCard;
    if (success) {
      state.killPlayer(target.id)
    } else if (playerCard < targetPlayerCard) {
      state.killPlayer(me.id);
    }
    return {success};
  }
  case CardType.Handmaid:
    me.hand.immune = true;
    return {success: true};
  case CardType.Prince:
  {
    const success = target.hand.card == CardType.Princess;
    if (success) {
      state.killPlayer(target.id);
    } else {
      target.hand.card = state.deck.take();
    }
    return {success};
  }
  case CardType.King:
    me.hand.card = target.hand.card;
    target.hand.card = playerCard;
    return {success: true, opponentCard: me.hand.card};
  case CardType.Countess:
    return {success: true};
  case CardType.Princess:
    state.killPlayer(me.id);
    return {success: true};
  }
}