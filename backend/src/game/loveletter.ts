import * as _ from 'lodash';
import {CardType} from './commonTypes';
import {CardAction} from '../protocol';
import {PLAYERS_NUMBER} from '../../../ui/src/model/commonTypes';
import {ReadyPlayerController} from '../PlayerController';
import {InvalidGameStateError} from '../error/InvalidGameStateError';

export type GameId = string;
export type PlayerId = string

export interface Player {
  id: string;
  controller: ReadyPlayerController;
  name: string;
  index: number;
  hand: Hand;
  score: number;
  alive: boolean;
  updatedCard: boolean;
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
  CardType.Princess,
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
    const shuffled = shuffleFisherYates(cards);
    if (shuffled.length > 0)
      shuffled.pop();
    this.deck = shuffled;
  }
}

function shuffleFisherYates<T>(source: Array<T>): Array<T> {
  const array = [...source];
  let i = array.length;
  while (i--) {
    const ri = Math.floor(Math.random() * (i + 1));
    [array[i], array[ri]] = [array[ri], array[i]];
  }
  return array;
}

export interface LoveLetterGameAction {
  playerId: PlayerId

  apply(gameState: LoveLetterGameState): ActionResult;
}


// TODO Field for each card type? Union type?
export interface ActionResult {
  killed?: boolean;
  suicide?: boolean;
  trade?: TradeInfo;
  opponentCard?: CardType;
  opponentIndex?: number;
}

export interface TradeInfo {
  incoming: CardType;
  outgoing: CardType;
}

export class LoveLetterGameState {
  public players: Player[] = [];
  public deck: Deck = new LoveLetterDeck();
  public discardPile: CardType[] = [];
  public activePlayerIds: PlayerId[] = [];
  public deadPlayerIds: PlayerId[] = [];
  public activeTurnPlayerId: PlayerId | undefined;
  public winnerId: PlayerId | undefined;

  constructor(controllers: ReadyPlayerController[]) {
    controllers.forEach(c => this.newPlayer(c));
  }

  newPlayer(controller: ReadyPlayerController): Player {
    const info = controller.getInfo();
    const playerIndex = this.players.length;
    const player: Player = {
      id: info.userId,
      controller: controller,
      name: info.name,
      index: playerIndex,
      hand: {
        card: undefined,
        pendingCard: undefined,
        immune: false,
      },
      score: 0,
      alive: true,
      updatedCard: false,
    };
    this.players.push(player);
    return player;
  }

  public killPlayer(playerId: PlayerId) {
    const player = this.getPlayer(playerId);
    player.alive = false;
    this.deadPlayerIds.push(player.id);
    this.activePlayerIds = this.activePlayerIds.filter((id) => id !== playerId);
    this.discardPile.push(player.hand.card!!);
    if (player.hand.pendingCard) {
      this.discardPile.push(player.hand.pendingCard);
    }
  }

  start(controller: ReadyPlayerController) {
    const userId = controller.getInfo().userId;
    this.deck.init();
    this.activePlayerIds = this.players.map(p => p.id);

    this.players.forEach(player => {
      player.alive = true;
      player.hand.card = this.deck.take();
      player.hand.immune = false;
      player.hand.pendingCard = undefined;
    });

    this.deadPlayerIds = [];
    this.activeTurnPlayerId = userId;
    const firstPlayer = this.getPlayer(userId);
    firstPlayer.hand.pendingCard = this.deck.take();
    this.winnerId = undefined;
  }

  nextTurn() {
    console.info('next turn');
    if (this.players.filter(p => p.controller.isReady()).length < PLAYERS_NUMBER) {
      console.log('Not enough players connected');
    }

    if (this.activePlayerIds.length === 1) {
      this.setWinner(this.activePlayerIds[0]);
    } else if (this.deck.size() === 0) {
      const playersLeft = this.activePlayerIds.map(id => this.getPlayer(id));
      const maxHeldCardStrength = playersLeft.map(p => p.hand.card).reduce((a, b) => Math.max(a || 0, b || 0)) || 0;
      const byHandStrength = _.groupBy(playersLeft, player => player.hand.card);
      const potentialWinners = byHandStrength[maxHeldCardStrength];
      this.setWinner(potentialWinners[0].id); // TODO support even hands
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

export class LoveLetterGame {
  public state = new LoveLetterGameState(this.controllers);
  private actions: LoveLetterGameAction[] = [];
  private firstPlayerIdx = -1;

  constructor(private controllers: ReadyPlayerController[]) {
  }

  applyAction(action: LoveLetterGameAction): ActionResult {
    if (action.playerId !== this.state.activeTurnPlayerId) {
      throw new InvalidGameStateError()
    }
    try{
      const actionResult =  action.apply(this.state);
      this.actions.push(action);
      this.state.nextTurn();
      return actionResult;
    } catch (e) {
        console.log(e);
        throw e;
    }
  }

  hasPlayer(id: PlayerId): boolean {
    return !!this.controllers.find(c => c.getInfo().userId === id);
  }

  init() {
    this.firstPlayerIdx = (this.firstPlayerIdx + 1) % this.controllers.length;
    const firstPlayer = this.controllers[this.firstPlayerIdx];
    this.state.start(firstPlayer);
  }

  getActionForCard(action: CardAction): (me: Player, target: Player, s: LoveLetterGameState) => ActionResult {
    return (me, target, state) => this.createResult(getActionResult(action, me, target, state), target);
  }

  private createResult(res: ActionResult, player: Player): ActionResult {
    return {
      ...res,
      opponentIndex: this.state.players.findIndex(p => p.id === player.id),
    };
  }
}

function getActionResult(action: CardAction, me: Player, target: Player, state: LoveLetterGameState): ActionResult {
  const otherCard = me.hand.card === action.payload.card ? me.hand.pendingCard!! : me.hand.card!!;
  const opponentCard = target.hand.card;
  state.discardPile.push(action.payload.card);
  me.hand.card = otherCard;
  me.hand.pendingCard = undefined;

  switch (action.payload.card) {
    case CardType.Guard: {
      const killed = opponentCard === action.payload.guess;
      if (killed) {
        state.killPlayer(target.id);
      }
      return {killed};
    }
    case CardType.Priest:
      return {opponentCard};
    case CardType.Baron: {
      if (otherCard === opponentCard) {
        // Nobody died, even duel
        return {killed: undefined, opponentCard};
      }
      const killed = otherCard > opponentCard!;
      if (killed) {
        state.killPlayer(target.id);
      } else if (otherCard < opponentCard!) {
        state.killPlayer(me.id);
      }
      return {killed, opponentCard};
    }
    case CardType.Handmaid:
      me.hand.immune = true;
      return {};
    case CardType.Prince: {
      const death = opponentCard === CardType.Princess;
      if (death) {
        state.killPlayer(target.id);
      } else {
        state.discardPile.push(opponentCard!!);
        target.hand.card = state.deck.take();
        target.updatedCard = true;
      }
      const suicide = death && me === target;
      const killed = death && !suicide ? true : undefined;
      return {killed, suicide, opponentCard};
    }
    case CardType.King:
      me.hand.card = opponentCard;
      me.hand.pendingCard = undefined;
      me.updatedCard = true;
      target.hand.card = otherCard;
      target.updatedCard = true;
      const trade = {
        incoming: otherCard,
        outgoing: opponentCard!!
      };
      return {opponentCard, trade};
    case CardType.Countess:
      return {};
    case CardType.Princess:
      state.killPlayer(me.id);
      return {suicide: true};
  }
}